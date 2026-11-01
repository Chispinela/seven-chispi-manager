const { parentPort, workerData } = require("node:worker_threads");
const fs = require("node:fs/promises");
const path = require("node:path");
const AdmZip = require("adm-zip");
const { inside, exists, fail, parseConfig } = require("./core.cjs");
async function walk(root) {
  let all = [];
  for (const e of await fs.readdir(root, { withFileTypes: true })) {
    if (e.isSymbolicLink()) fail("unsafeArchive");
    const p = path.join(root, e.name);
    if (e.isDirectory()) all.push(...(await walk(p)));
    else if (e.isFile()) all.push(p);
  }
  return all;
}
async function extractSafe(file, dest) {
  const z = new AdmZip(file);
  let size = 0;
  for (const e of z.getEntries()) {
    const name = e.entryName.replace(/\\/g, "/");
    size += e.header.size;
    if (
      size > 10 * 1024 ** 3 ||
      !inside(dest, path.join(dest, name)) ||
      /^[a-z]:|^\/|\x00/i.test(name) ||
      ((e.header.attr >>> 16) & 0xf000) === 0xa000
    )
      fail("unsafeArchive");
  }
  z.extractAllTo(dest, false);
}
async function main(w) {
  if (w.op === "mod") {
    await fs.mkdir(w.staging, { recursive: true });
    if ((await fs.lstat(w.source)).isSymbolicLink()) fail("unsafeArchive");
    if ((await fs.stat(w.source)).isDirectory()) {
      await walk(w.source);
      await fs.cp(w.source, path.join(w.staging, path.basename(w.source)), {
        recursive: true,
        dereference: false,
      });
    } else await extractSafe(w.source, w.staging);
    const files = await walk(w.staging),
      infos = files.filter(
        (x) => path.basename(x).toLowerCase() === "modinfo.xml",
      );
    if (!infos.length) fail("missingModInfo");
    const roots = infos.map((x) => path.dirname(x));
    if (roots.some((r, i) => roots.some((o, j) => i !== j && inside(o, r))))
      fail("nestedMods");
    const names = new Set();
    for (const r of roots) {
      let name = path.basename(r);
      if (r === w.staging)
        name = path.basename(w.source, path.extname(w.source));
      if (
        !/^[\p{L}\p{N}_. -]+$/u.test(name) ||
        names.has(name.toLowerCase()) ||
        (await exists(path.join(w.dest, name))) ||
        (await exists(path.join(w.dest, ".disabled", name)))
      )
        fail("modExists", name);
      names.add(name.toLowerCase());
    }
    await fs.mkdir(w.dest, { recursive: true });
    const moved = [];
    try {
      for (const r of roots) {
        let name =
          r === w.staging
            ? path.basename(w.source, path.extname(w.source))
            : path.basename(r);
        const to = path.join(w.dest, name);
        await fs.rename(r, to);
        moved.push(to);
      }
    } catch (e) {
      for (const p of moved) await fs.rm(p, { recursive: true, force: true });
      throw e;
    }
    return [...names];
  }
  if (w.op === "backup") {
    const zip = new AdmZip();
    zip.addFile("userdata/", Buffer.alloc(0));
    zip.addFile("Mods/", Buffer.alloc(0));
    if (await exists(w.userdata)) {
      for (const file of await walk(w.userdata))
        zip.addLocalFile(
          file,
          "userdata/" +
            path.relative(w.userdata, path.dirname(file)).replace(/\\/g, "/"),
        );
    }
    zip.addFile(
      "manager-profile.json",
      Buffer.from(JSON.stringify(w.profile, null, 2)),
    );
    if (await exists(w.config))
      zip.addLocalFile(w.config, "", "serverconfig.xml");
    // Include mods in the snapshot so configuration and mod versions remain recoverable together.
    if (await exists(w.mods))
      for (const file of await walk(w.mods))
        zip.addLocalFile(
          file,
          "Mods/" +
            path.relative(w.mods, path.dirname(file)).replace(/\\/g, "/"),
        );
    await fs.mkdir(path.dirname(w.output), { recursive: true });
    const temp = w.output + ".tmp";
    zip.writeZip(temp);
    await fs.rename(temp, w.output);
    return w.output;
  }
  if (w.op === "restore") {
    await fs.mkdir(w.staging, { recursive: true });
    await extractSafe(w.file, w.staging);
    if (!(await exists(path.join(w.staging, "manager-profile.json"))))
      fail("invalidBackup");
    if (await exists(path.join(w.staging, "serverconfig.xml")))
      parseConfig(
        await fs.readFile(path.join(w.staging, "serverconfig.xml"), "utf8"),
      );
    const source = path.join(w.staging, "userdata");
    if (!(await exists(source))) fail("invalidBackup");
    const stamp = Date.now(),
      rollback = [],
      moved = [];
    try {
      for (const [from, to] of [
        [source, w.userdata],
        [path.join(w.staging, "Mods"), w.mods],
      ]) {
        if (!(await exists(from))) continue;
        const old = to + ".before-restore-" + stamp;
        if (await exists(to)) {
          await fs.rename(to, old);
          rollback.push([old, to]);
        }
        await fs.rename(from, to);
        moved.push(to);
      }
    } catch (e) {
      for (const to of moved)
        if (await exists(to)) await fs.rename(to, to + ".failed-" + stamp);
      for (const [old, to] of rollback.reverse()) {
        if (await exists(to)) await fs.rename(to, to + ".failed-" + stamp);
        await fs.rename(old, to);
      }
      throw e;
    }
    return { previous: rollback, moved };
  }
  if (w.op === "catalog") {
    const out = { items: [], entities: [], buffs: [] };
    for (const [k, file, tag] of [
      ["items", "items.xml", "item"],
      ["entities", "entityclasses.xml", "entity_class"],
      ["buffs", "buffs.xml", "buff"],
    ]) {
      const text = await fs
        .readFile(path.join(w.dir, "Data", "Config", file), "utf8")
        .catch(() => "");
      const re = new RegExp("<" + tag + '\\b[^>]*\\bname="([^"]+)"', "g");
      out[k] = [...text.matchAll(re)].map((m) => m[1]);
    }
    return out;
  }
}
main(workerData).then(
  (result) => parentPort.postMessage({ ok: true, result }),
  (e) =>
    parentPort.postMessage({
      ok: false,
      error: {
        code: e.code || "operationFailed",
        detail: e.detail || e.message,
      },
    }),
);

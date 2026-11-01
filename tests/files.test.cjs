const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const Zip = require("adm-zip");
const { Store } = require("../src/core.cjs");
const { Manager } = require("../src/manager.cjs");
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "seven-files-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const m = new Manager(new Store(root));
  t.after(() => m.dispose());
  const s = await m.newServer({
    name: "Files",
    mode: "local",
    host: "127.0.0.1",
    branch: "public",
  });
  return { root, m, s };
}
test("nested ZIP mod import, disable, enable and duplicate refusal", async (t) => {
  const { root, m, s } = await fixture(t),
    zip = new Zip();
  zip.addFile(
    "release/MyMod/ModInfo.xml",
    Buffer.from('<xml><Name value="MyMod"/><Version value="1.0"/></xml>'),
  );
  zip.addFile("release/MyMod/Config/items.xml", Buffer.from("<configs/>"));
  const file = path.join(root, "mod.zip");
  zip.writeZip(file);
  await m.importMod(s.id, file);
  let mods = await m.mods(s.id);
  assert.equal(mods[0].folder, "MyMod");
  assert.equal(mods[0].version, "1.0");
  await m.toggleMod(s.id, "MyMod", false);
  assert.equal((await m.mods(s.id))[0].enabled, false);
  await assert.rejects(m.importMod(s.id, file), (e) => e.code === "modExists");
  await m.toggleMod(s.id, "MyMod", true);
  assert.equal((await m.mods(s.id))[0].enabled, true);
  assert.equal(
    (await fs.readdir(s.directory)).filter((x) => x.startsWith(".mod-stage"))
      .length,
    0,
  );
});
test("bad mod archive leaves Mods unchanged", async (t) => {
  const { root, m, s } = await fixture(t),
    zip = new Zip();
  zip.addFile("readme.txt", Buffer.from("not a mod"));
  const file = path.join(root, "bad.zip");
  zip.writeZip(file);
  await assert.rejects(
    m.importMod(s.id, file),
    (e) => e.code === "missingModInfo",
  );
  assert.deepEqual(await m.mods(s.id), []);
});
test("symlink mods are refused before copying outside their root", async (t) => {
  const { root, m, s } = await fixture(t);
  const mod = path.join(root, "SourceMod");
  await fs.mkdir(mod);
  await fs.writeFile(path.join(mod, "ModInfo.xml"), "<xml/>");
  try {
    await fs.symlink(root, path.join(mod, "Escape"), "junction");
  } catch (e) {
    t.skip("Junction creation unavailable");
    return;
  }
  await assert.rejects(
    m.importMod(s.id, mod),
    (e) => e.code === "unsafeArchive",
  );
  assert.deepEqual(await m.mods(s.id), []);
});
test("backup and restore keep previous world and restore configuration", async (t) => {
  const { m, s } = await fixture(t),
    data = path.join(s.directory, "userdata", "Saves");
  await fs.mkdir(data, { recursive: true });
  await fs.writeFile(path.join(data, "world.dat"), "before");
  await m.writeConfig(s);
  const file = await m.backup(s.id);
  await fs.writeFile(path.join(data, "world.dat"), "after");
  s.config.ServerDescription = "changed";
  const old = await m.restore(s.id, path.basename(file));
  assert.equal(
    await fs.readFile(path.join(data, "world.dat"), "utf8"),
    "before",
  );
  assert.ok(old.some((p) => p.includes("before-restore")));
  assert.equal(
    await fs.readFile(
      path.join(
        old.find((p) => p.includes("userdata")),
        "Saves",
        "world.dat",
      ),
      "utf8",
    ),
    "after",
  );
  assert.equal(m.server(s.id).config.ServerDescription, "");
});
test("backup is refused while game may be writing", async (t) => {
  const { m, s } = await fixture(t);
  m.rt(s.id).child = {};
  await assert.rejects(m.backup(s.id), (e) => e.code === "backupStopFirst");
  m.rt(s.id).child = null;
});
test("restore rejects a foreign ZIP before modifying a world", async (t) => {
  const { m, s } = await fixture(t),
    dir = m.backupsDir(s);
  await fs.mkdir(dir, { recursive: true });
  const zip = new Zip();
  zip.addFile("readme", Buffer.from("foreign"));
  zip.writeZip(path.join(dir, "foreign.zip"));
  await assert.rejects(
    m.restore(s.id, "foreign.zip"),
    (e) => e.code === "invalidBackup",
  );
});

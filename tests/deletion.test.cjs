const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { Store } = require("../src/core.cjs");
const { Manager } = require("../src/manager.cjs");
const D = require("../src/deletion.cjs");
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "seven-delete-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const m = new Manager(new Store(root));
  t.after(() => m.dispose());
  const s = await m.newServer({
    name: "Delete test",
    mode: "local",
    host: "127.0.0.1",
    branch: "public",
  });
  await fs.writeFile(path.join(s.directory, "world.txt"), "world");
  return { root, m, s };
}
test("explicit file deletion removes only its server and preserves external backups", async (t) => {
  const { root, m, s } = await fixture(t);
  const other = await m.newServer({
    name: "Keep other",
    mode: "local",
    host: "127.0.0.1",
    branch: "public",
  });
  await fs.writeFile(path.join(other.directory, "other.txt"), "other");
  const backup = path.join(root, "backups", s.id);
  await fs.mkdir(backup, { recursive: true });
  await fs.writeFile(path.join(backup, "keep.zip"), "backup");
  await m.removeServer(s.id, { deleteFiles: true });
  assert.equal(await fs.stat(s.directory).catch(() => null), null);
  assert.equal(
    m.state.servers.some((x) => x.id === s.id),
    false,
  );
  assert.equal(
    await fs.readFile(path.join(other.directory, "other.txt"), "utf8"),
    "other",
  );
  assert.equal(
    await fs.readFile(path.join(backup, "keep.zip"), "utf8"),
    "backup",
  );
  assert.deepEqual(m.state.pendingRemovals, []);
});
test("failed profile save restores the folder before any file is deleted", async (t) => {
  const { m, s } = await fixture(t);
  m.store.save = async () => {
    throw new Error("disk full");
  };
  await assert.rejects(
    m.removeServer(s.id, { deleteFiles: true }),
    /disk full/,
  );
  assert.equal(
    await fs.readFile(path.join(s.directory, "world.txt"), "utf8"),
    "world",
  );
  assert.ok(m.state.servers.find((x) => x.id === s.id));
  assert.equal(m.rt(s.id).busy, null);
});
test("failed file removal keeps the profile and restores the staged folder for retry", async (t) => {
  const { m, s } = await fixture(t),
    original = D.purge;
  D.purge = async () => {
    throw new Error("file locked");
  };
  try {
    await assert.rejects(
      m.removeServer(s.id, { deleteFiles: true }),
      (e) => e.code === "deleteFilesFailed",
    );
    assert.equal(
      await fs.readFile(path.join(s.directory, "world.txt"), "utf8"),
      "world",
    );
    assert.ok(m.state.servers.find((x) => x.id === s.id));
    const loaded = new Store(m.store.root);
    await loaded.load();
    assert.ok(loaded.state.servers.find((x) => x.id === s.id));
  } finally {
    D.purge = original;
  }
});
test("protected and shared directories are rejected by deletion validation", async (t) => {
  const { m, s, root } = await fixture(t);
  for (const directory of [path.parse(root).root, os.homedir(), root])
    await assert.rejects(
      D.validate({ ...s, directory }, root, m.state.servers),
      (e) => e.code === "unsafeDeletion",
    );
  await assert.rejects(
    D.validate(s, root, [{ ...s, id: "other" }]),
    (e) => e.code === "sharedDirectory",
  );
  assert.equal(
    await fs.readFile(path.join(s.directory, "world.txt"), "utf8"),
    "world",
  );
});
test("junctions are refused without deleting their targets", async (t) => {
  const { m, s, root } = await fixture(t),
    link = path.join(root, "junction");
  try {
    await fs.symlink(s.directory, link, "junction");
  } catch {
    t.skip("Junction creation unavailable");
    return;
  }
  await assert.rejects(
    D.validate({ ...s, directory: link }, root, []),
    (e) => e.code === "unsafeDeletion",
  );
  assert.equal(
    await fs.readFile(path.join(s.directory, "world.txt"), "utf8"),
    "world",
  );
});
test("interrupted deletion is recovered when the manager reopens", async (t) => {
  const { m, s, root } = await fixture(t),
    plan = await D.stage(s, root, m.state.servers);
  m.state.pendingRemovals = [
    { id: "recovery", server: structuredClone(s), ...plan },
  ];
  m.state.servers = [];
  await m.store.save();
  const reopened = new Manager(new Store(root));
  t.after(() => reopened.dispose());
  await reopened.init();
  assert.equal(
    await fs.readFile(path.join(s.directory, "world.txt"), "utf8"),
    "world",
  );
  assert.ok(reopened.state.servers.find((x) => x.id === s.id));
  assert.deepEqual(reopened.state.pendingRemovals, []);
});
test("active and remote servers cannot have local files removed", async (t) => {
  const { m, s } = await fixture(t);
  m.rt(s.id).client.connected = true;
  await assert.rejects(
    m.removeServer(s.id, { deleteFiles: true }),
    (e) => e.code === "stopFirst",
  );
  m.rt(s.id).client.connected = false;
  s.mode = "remote";
  await assert.rejects(
    m.removeServer(s.id, { deleteFiles: true }),
    (e) => e.code === "localOnly",
  );
  assert.equal(
    await fs.readFile(path.join(s.directory, "world.txt"), "utf8"),
    "world",
  );
});
test("redirected Windows folders are protected using the supplied known paths", async (t) => {
  const { m, s, root } = await fixture(t),
    desktop = path.join(root, "RedirectedDesktop");
  await fs.mkdir(desktop);
  await assert.rejects(
    D.validate({ ...s, directory: desktop }, root, [], [desktop]),
    (e) => e.code === "unsafeDeletion",
  );
});
test("deleting a server does not follow internal junctions to other data", async (t) => {
  const { m, s, root } = await fixture(t),
    external = path.join(root, "external");
  await fs.mkdir(external);
  await fs.writeFile(path.join(external, "keep.txt"), "keep");
  try {
    await fs.symlink(external, path.join(s.directory, "linked"), "junction");
  } catch {
    t.skip("Junction creation unavailable");
    return;
  }
  await m.removeServer(s.id, { deleteFiles: true });
  assert.equal(
    await fs.readFile(path.join(external, "keep.txt"), "utf8"),
    "keep",
  );
});

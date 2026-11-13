const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const C = require("../src/core.cjs");
const { Manager } = require("../src/manager.cjs");
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "seven-test-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const store = new C.Store(root),
    m = new Manager(store);
  t.after(() => m.dispose());
  return { root, store, m };
}
test("XML preserves unknown options, comments and literal dollar sequences", () => {
  const xml =
    '<?xml version="1.0"?><ServerSettings><!-- <property name="Hidden" value="X"/> --><property name="SandboxCode" value="ABC"/><property name="Future" value="42"/></ServerSettings>';
  const built = C.buildConfig(
    { SandboxCode: 'A & "$& $1 <x>', ServerName: "世界" },
    xml,
  );
  assert.match(built, /<!-- <property name="Hidden" value="X"\/>(.*?)-->/);
  assert.deepEqual(C.parseConfig(built), {
    SandboxCode: 'A & "$& $1 <x>',
    Future: "42",
    ServerName: "世界",
  });
});
test("invalid XML and external entities rejected", () => {
  for (const s of [
    "<x/>",
    "<ServerSettings>",
    '<!DOCTYPE x [<!ENTITY e SYSTEM "file:///secret">]><ServerSettings><property name="p" value="&e;"/></ServerSettings>',
  ])
    assert.throws(
      () => C.parseConfig(s),
      (e) => e.code === "invalidXml",
    );
});
test("server configuration isolates directories and complete game port ranges", () => {
  const a = C.defaultServer(path.resolve("test-data"), 0),
    b = C.defaultServer(path.resolve("test-data"), 1);
  assert.equal(C.validateServer(a, [b]), a);
  b.config.ServerPort = "26903";
  assert.throws(
    () => C.validateServer(b, [a]),
    (e) => e.code === "portConflict",
  );
  b.config.ServerPort = "26910";
  b.directory = path.join(a.directory, "nested");
  assert.throws(
    () => C.validateServer(b, [a]),
    (e) => e.code === "sharedDirectory",
  );
});
test("internal port conflicts, invalid world names and argument injection rejected", () => {
  const s = C.defaultServer(path.resolve("test-data"));
  s.config.TelnetPort = s.config.ServerPort;
  assert.throws(
    () => C.validateServer(s),
    (e) => e.code === "portConflict",
  );
  s.config.TelnetPort = "8081";
  s.config.GameName = "../world";
  assert.throws(
    () => C.validateServer(s),
    (e) => e.code === "invalidGameName",
  );
  s.config.GameName = "World";
  s.branch = "public +quit";
  assert.throws(
    () => C.validateServer(s),
    (e) => e.code === "invalidBranch",
  );
  assert.throws(() => C.oneLine("lp\nshutdown"));
  assert.throws(() => C.target("1;shutdown"));
});
test("parses available branches from real Steam output", async () => {
  const branches = C.branchesFromInfo(
    await fs.readFile(
      path.join(__dirname, "../docs/steam-app-info.txt"),
      "utf8",
    ),
  );
  assert.ok(branches.find((x) => x.id === "alpha21.2"));
  assert.ok(branches.find((x) => x.id === "v1.4"));
  assert.ok(branches.find((x) => x.id === "v2.6"));
  assert.equal(branches[0].id, "public");
  assert.throws(() => C.branchesFromInfo("connection failed"));
});
test("parses a modern player row with Steam and EOS IDs", () => {
  const rows = C.parsePlayers(
    "0. id=171, Test, pos=(1.2, 70.0, -2.5), rot=(0,0,0), remote=True, health=100, deaths=2, zombies=14, players=1, score=14, level=5, platformid=Steam_76561198000000001, crossplatformid=EOS_abc123, ip=127.0.0.1, ping=42\nTotal of 1 in the game",
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, "EOS_abc123");
  assert.equal(rows[0].ping, 42);
  assert.equal(rows[0].zombies, 14);
});
test("atomic writes are serialized and survive reload", async (t) => {
  const { root, store } = await fixture(t);
  const saves = [];
  for (let n = 0; n < 20; n++) {
    store.state.counter = n;
    saves.push(store.save());
  }
  await Promise.all(saves);
  const again = new C.Store(root);
  await again.load();
  assert.equal(again.state.counter, 19);
  assert.equal(
    (await fs.readdir(root)).filter((x) => x.endsWith(".tmp")).length,
    0,
  );
});
test("failed profile persistence does not create a duplicate", async (t) => {
  const { m, store } = await fixture(t);
  store.save = async () => {
    throw new Error("disk unavailable");
  };
  await assert.rejects(
    m.newServer({
      name: "New",
      mode: "local",
      host: "127.0.0.1",
      branch: "public",
    }),
  );
  assert.equal(store.state.servers.length, 0);
});
test("profile removal preserves server files", async (t) => {
  const { m } = await fixture(t);
  const s = await m.newServer({
    name: "Keep",
    mode: "local",
    host: "127.0.0.1",
    branch: "public",
  });
  await fs.writeFile(path.join(s.directory, "keep.txt"), "world");
  await m.removeServer(s.id);
  assert.equal(
    await fs.readFile(path.join(s.directory, "keep.txt"), "utf8"),
    "world",
  );
});
test("profile settings cannot change a running server connection", async (t) => {
  const { m } = await fixture(t);
  const s = await m.newServer({
    name: "Live",
    mode: "local",
    host: "127.0.0.1",
    branch: "public",
  });
  m.rt(s.id).client.ready = true;
  await assert.rejects(
    m.saveServer({ ...s, host: "other-host" }),
    (e) => e.code === "stopFirst",
  );
  await m.saveServer({ ...s, economy: { ...s.economy, enabled: true } });
  assert.equal(m.server(s.id).economy.enabled, true);
  m.rt(s.id).client.ready = false;
});
test("wallet operations preserve nonnegative balances under contention", async (t) => {
  const { m } = await fixture(t);
  const s = await m.newServer({
    name: "Wallet",
    mode: "local",
    host: "127.0.0.1",
    branch: "public",
  });
  await m.adjustWallet(s.id, "Steam_76561198000000001", 100);
  const results = await Promise.allSettled([
    m.adjustWallet(s.id, "Steam_76561198000000001", -80),
    m.adjustWallet(s.id, "Steam_76561198000000001", -80),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(s.players.Steam_76561198000000001.currency, 20);
  await assert.rejects(
    m.adjustWallet(s.id, "Steam_76561198000000001", -30),
    (e) => e.code === "insufficientFunds",
  );
});
test("uncertain reward deliveries are persisted and not resent", async (t) => {
  const { m } = await fixture(t);
  const s = await m.newServer({
    name: "Rewards",
    mode: "local",
    host: "127.0.0.1",
    branch: "public",
  });
  const p = "Steam_76561198000000001";
  await m.adjustWallet(s.id, p, 100);
  s.bags = [
    {
      id: "bag",
      name: "kit",
      cost: 50,
      items: [
        { item: "wood", count: 1 },
        { item: "stone", count: 1 },
      ],
    },
  ];
  m.rt(s.id).client.ready = true;
  let calls = 0;
  m.playerAction = async () => {
    if (++calls === 2) throw new Error("disconnected");
    return "ok";
  };
  await assert.rejects(m.reward(s.id, p, "bag"));
  assert.equal(s.players[p].currency, 50);
  assert.equal(s.deliveries[0].completed, 1);
  assert.equal(s.deliveries[0].status, "review");
  assert.equal(calls, 2);
  m.rt(s.id).client.ready = false;
});
test("invalid schedules and item data never overwrite existing entries", async (t) => {
  const { m } = await fixture(t);
  const s = await m.newServer({
    name: "Jobs",
    mode: "local",
    host: "127.0.0.1",
    branch: "public",
  });
  await assert.rejects(
    m.saveCollection(s.id, "schedules", [
      { name: "bad", action: "command", repeat: "interval", minutes: -1 },
    ]),
    (e) => e.code === "invalidInterval",
  );
  assert.deepEqual(s.schedules, []);
  await assert.rejects(
    m.saveCollection(s.id, "bags", [
      { name: "bad", items: [{ item: "wood\nshutdown", count: 2 }] },
    ]),
    (e) => e.code === "invalidItem",
  );
  assert.deepEqual(s.bags, []);
});
test("automatic schedule computes daily local time and advances once jobs", async (t) => {
  const { m } = await fixture(t);
  const due = m.nextDue({ repeat: "daily", time: "04:00" });
  assert.ok(due > Date.now() && due < Date.now() + 25 * 3600000);
  const instant = Date.now() + 60000;
  assert.equal(
    m.nextDue({ repeat: "once", at: new Date(instant).toISOString() }),
    instant,
  );
});

test("updates only the selected installation and discovers its version and maps", async (t) => {
  const { root, store, m } = await fixture(t);
  const first = await m.newServer({
    name: "First",
    directory: path.join(root, "first"),
  });
  const second = await m.newServer({
    name: "Second",
    directory: path.join(root, "second"),
  });
  const map = path.join(second.directory, "Data", "Worlds", "Pregen08k01");
  await fs.mkdir(map, { recursive: true });
  await fs.writeFile(path.join(map, "map_info.xml"), "<MapInfo/>");
  const stock = C.buildConfig({ SandboxCode: "A", NewGameSetting: "20" });
  m.runSteam = async (args, id) => {
    assert.equal(id, second.id);
    assert.equal(
      args[args.indexOf("+force_install_dir") + 1],
      second.directory,
    );
    await fs.writeFile(path.join(second.directory, "7DaysToDieServer.exe"), "");
    await fs.writeFile(path.join(second.directory, "serverconfig.xml"), stock);
    await fs.mkdir(path.join(second.directory, "steamapps"));
    await fs.writeFile(
      path.join(second.directory, "steamapps", "appmanifest_294420.acf"),
      '"AppState" { "buildid" "26237934" }',
    );
    return "Success! App '294420' fully installed.";
  };
  second.config.ZombieMove = "4";
  await m.install(second.id);
  const info = await m.configInfo(second.id);
  assert.equal(info.version, "3.4.0");
  assert.equal(info.options.length, 165);
  assert.equal(info.values.NewGameSetting, "20");
  assert.equal(info.values.ZombieMove, undefined);
  assert.ok(info.worlds.includes("Pregen08k01"));
  assert.ok(!(await m.configInfo(first.id)).worlds.includes("Pregen08k01"));
  assert.equal(await C.exists(m.configFile(first)), false);
  assert.equal(
    C.parseConfig(await fs.readFile(m.configFile(second), "utf8")).ZombieMove,
    undefined,
  );
  assert.equal(store.state.servers[0].config.SandboxCode, undefined);
});

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const A = require("../src/automation.cjs");
const { Manager } = require("../src/manager.cjs");
const { Store } = require("../src/core.cjs");
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "seven-events-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const m = new Manager(new Store(root));
  t.after(() => m.dispose());
  const s = await m.newServer({
    name: "Automation",
    mode: "local",
    host: "127.0.0.1",
    branch: "public",
  });
  return { m, s };
}
test("conditional and loop parser handles else without executing system code", async (t) => {
  const { m, s } = await fixture(t);
  const commands = [];
  m.command = async (_, cmd) => commands.push(cmd);
  await A.runScript(
    m,
    s.id,
    "if player_level >= 5\nloop 2\nsay Hello {name}\nendloop\nelse\nsay No\nendif",
    { player: "EOS_abc", name: "Test", level: 10, player_level: 10 },
  );
  assert.deepEqual(commands, ['say "Hello Test"', 'say "Hello Test"']);
  await assert.rejects(
    A.runScript(m, s.id, "shell del C:\\x"),
    (e) => e.code === "invalidScript",
  );
  assert.throws(
    () => A.parseScript("if a == b\nsay hi"),
    (e) => e.code === "invalidScript",
  );
});
test("event loop bounds and event recursion are enforced", async (t) => {
  const { m, s } = await fixture(t);
  await assert.rejects(
    A.runScript(m, s.id, "loop 51\nsay x\nendloop"),
    (e) => e.code === "eventLimit",
  );
  s.events = [{ id: "cycle", name: "cycle", script: "event cycle" }];
  await assert.rejects(
    A.runScript(m, s.id, "event cycle"),
    (e) => e.code === "eventRecursion",
  );
});
test("currency transfers are atomic and reject insufficient balance", async (t) => {
  const { m, s } = await fixture(t);
  await m.adjustWallet(s.id, "EOS_a", 100);
  await m.transfer(s.id, "EOS_a", "EOS_b", 40);
  assert.equal(s.players.EOS_a.currency, 60);
  assert.equal(s.players.EOS_b.currency, 40);
  await assert.rejects(
    m.transfer(s.id, "EOS_a", "EOS_b", 70),
    (e) => e.code === "insufficientFunds",
  );
  assert.equal(s.players.EOS_b.currency, 40);
});
test("modern chat maps to the authenticated entity instead of supplied name", async (t) => {
  const { m, s } = await fixture(t);
  m.rt(s.id).players = [
    { id: "EOS_abc", entityId: "171", name: "Test", level: 1 },
  ];
  let captured;
  m.chatCommand = async (id, p, text) => (captured = { p, text });
  m.handleLine(
    s.id,
    "2026-10-31T20:00:00 INF Chat (from 'Steam_76561198000000001', entity id '171', to 'Global'): 'Test': !balance",
  );
  assert.equal(captured.p.id, "EOS_abc");
  assert.equal(captured.text, "!balance");
  assert.equal(m.rt(s.id).chat[0].name, "Test");
});
test("native game log events detect readiness and blood moon state", async (t) => {
  const { m, s } = await fixture(t);
  m.rt(s.id).child = {};
  m.handleLine(s.id, "INF StartGame done");
  assert.equal(m.rt(s.id).status, "running");
  m.handleLine(s.id, "INF BloodMoon starting for day 7");
  assert.equal(m.rt(s.id).bloodMoon, true);
  m.handleLine(s.id, "INF Blood moon is over!");
  assert.equal(m.rt(s.id).bloodMoon, false);
  m.rt(s.id).child = null;
});
test("cooldowns apply per player rather than suppressing other players", async (t) => {
  const { m, s } = await fixture(t);
  s.events = [
    {
      id: "welcome",
      enabled: true,
      trigger: "joined",
      condition: "any",
      cooldown: 30,
      script: "say {player}",
    },
  ];
  const called = [];
  m.executeActions = async (id, script, ctx) => called.push(ctx.player);
  m.fire(s.id, "joined", { player: "EOS_a" });
  m.fire(s.id, "joined", { player: "EOS_b" });
  m.fire(s.id, "joined", { player: "EOS_a" });
  assert.deepEqual(called, ["EOS_a", "EOS_b"]);
});
test("Discord link codes expire, are one-use and bind only the issuing player", async (t) => {
  const { m, s } = await fixture(t);
  const code = m.createLink(s.id, "EOS_a");
  await m.acceptLink(s.id, code, "123456789012345678");
  assert.equal(s.players.EOS_a.discordId, "123456789012345678");
  await assert.rejects(
    m.acceptLink(s.id, code, "987654321012345678"),
    (e) => e.code === "linkExpired",
  );
  const expired = m.createLink(s.id, "EOS_b");
  m.rt(s.id).linkCodes.get(expired).until = Date.now() - 1;
  await assert.rejects(
    m.acceptLink(s.id, expired, "123456789012345678"),
    (e) => e.code === "linkExpired",
  );
});
test("areas emit only on entry and personal locations remain isolated per player", async (t) => {
  const { m, s } = await fixture(t);
  s.areas = [{ id: "base", name: "Base", position: "0, 70, 0", radius: 10 }];
  const fired = [];
  m.fire = (id, type, ctx) => fired.push({ type, ctx });
  const p = { id: "EOS_a", entityId: "1", name: "A", pos: "0, 70, 0" };
  m.rt(s.id).players = [p];
  m.checkAreas(s.id, p);
  m.checkAreas(s.id, p);
  assert.equal(fired.filter((e) => e.type === "areaEntered").length, 1);
  await m.home(s.id, p.id, "home", "save");
  assert.equal((await m.home(s.id, p.id, "", "list")).length, 1);
  assert.equal((await m.home(s.id, "EOS_b", "", "list")).length, 0);
});
test("disabled and unknown external programs cannot run", async (t) => {
  const { s, m } = await fixture(t);
  await assert.rejects(
    require("../src/extensions.cjs").program(s, "missing"),
    (e) => e.code === "programRequired",
  );
  await assert.rejects(
    m.saveCollection(s.id, "programs", [
      {
        id: "bad",
        name: "Bad",
        executable: "cmd.exe",
        args: [],
        enabled: true,
      },
    ]),
    (e) => e.code === "invalidData",
  );
});

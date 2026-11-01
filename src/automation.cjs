const { fail } = require("./core.cjs");
const LOG_EVENTS = [
  ["serverReady", /StartGame done|GameServer.Init successful/i],
  ["bloodmoonStarted", /BloodMoon starting for day/i],
  ["bloodmoonEnded", /Blood moon is over/i],
  ["connecting", /RequestToEnterGame:/],
  ["spawnJoin", /PlayerSpawnedInWorld.*(?:JoinMultiplayer|EnterMultiplayer)/],
  ["spawnDeath", /PlayerSpawnedInWorld.*Died/],
  ["spawnTeleport", /PlayerSpawnedInWorld.*Teleport/],
  ["playerKicked", /INF Kicking player|\[EOS-ACS\] Kicking player/],
  ["playerBanned", /Executing command 'ban add /],
  ["playerUnbanned", /Executing command 'ban remove /],
  ["permissionsUpdated", /Loading permissions file done/],
  ["airdrop", /AIAirDrop: Spawned supply crate at/],
  ["hordeStarted", /Wandering StartSpawning Horde/],
  ["hordeEnded", /Wandering spawner finished Horde/],
  ["hordeTarget", /FindWanderingTargets at player/],
  ["screamer", /Spawned \[type=EntityZombie, name=zombieScreamer/],
  ["clientCommandDenied", /Denying command '/],
  ["clientCommandExecuted", /executing client side command:/],
  [
    "animalKilled",
    /(?:GMSG:.*killed animal|\[CSMM_Patrons\]entityKilled:.*animal)/,
  ],
  ["cpmZombieKilled", /\[CSMM_Patrons\]entityKilled:.*zombie/],
  ["cpmPlayerKilled", /\[CSMM_Patrons\]playerKilledByPlayer:/],
  ["cpmPlayerDied", /\[CSMM_Patrons\]playerDied:/],
  ["cpmPlayerLeveled", /\[CSMM_Patrons\]playerLeveled:/],
  ["cpmKilledByEntity", /\[CSMM_Patrons\]playerKilledByEntity:/],
];
const triggers = [
  "log",
  "chat",
  "joined",
  "left",
  "connected",
  "stopped",
  "backupStarted",
  "backupCompleted",
  "backupFailed",
  "discordConnected",
  "discordDisconnected",
  "discordChat",
  "pingFailed",
  "vacFailed",
  "hostFailed",
  "bannedItem",
  "healthFailed",
  "ramFailed",
  "level",
  "death",
  "killZombie",
  "killPlayer",
  "playerList",
  "timer",
  "shutdownMinute",
  "shutdownSecond",
  "shutdownNow",
  "shutdownCancelled",
  "serverRestart",
  "areaEntered",
  ...LOG_EVENTS.map((x) => x[0]),
];
function parseScript(script) {
  if (typeof script !== "string" || script.length > 50000)
    fail("invalidScript");
  const root = [],
    stack = [{ kind: "root", body: root }];
  for (const raw of script.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const kind = line.split(/\s/)[0].toLowerCase(),
      arg = line.slice(kind.length).trim();
    const frame = stack.at(-1);
    if (kind === "if" || kind === "loop") {
      if (stack.length > 8) fail("invalidScript");
      const node = { kind, arg, body: [] };
      frame.body.push(node);
      stack.push(node);
    } else if (kind === "else") {
      if (frame.kind !== "if" || frame.elseBody) fail("invalidScript");
      frame.elseBody = [];
      stack.push({ kind: "else", body: frame.elseBody });
    } else if (kind === "endif") {
      if (frame.kind === "else") stack.pop();
      if (stack.at(-1).kind !== "if") fail("invalidScript");
      stack.pop();
    } else if (kind === "endloop") {
      if (frame.kind !== "loop") fail("invalidScript");
      stack.pop();
    } else frame.body.push({ kind, arg });
  }
  if (stack.length !== 1) fail("invalidScript");
  return root;
}
function condition(expression, ctx, s) {
  const m = expression.match(
    /^(\S+)\s+(==|!=|>=|<=|>|<|contains|starts|ends|ingroup)\s+(.+)$/i,
  );
  if (!m) fail("invalidScript", expression);
  const get = (x) =>
    Object.hasOwn(ctx, x)
      ? ctx[x]
      : Object.hasOwn(s.variables, x)
        ? s.variables[x]
        : x.replace(/^['"]|['"]$/g, "");
  const a = get(m[1]),
    b = get(m[3]);
  switch (m[2]) {
    case "==":
      return String(a) === String(b);
    case "!=":
      return String(a) !== String(b);
    case ">=":
      return Number(a) >= Number(b);
    case "<=":
      return Number(a) <= Number(b);
    case ">":
      return Number(a) > Number(b);
    case "<":
      return Number(a) < Number(b);
    case "contains":
      return String(a).includes(b);
    case "starts":
      return String(a).startsWith(b);
    case "ends":
      return String(a).endsWith(b);
    case "ingroup":
      return !!s.groups.find(
        (g) =>
          (g.id === b || g.name === b) &&
          g.members.split(/[\s,]+/).includes(String(a)),
      );
  }
}
function context(s, rt, ctx) {
  const p = rt.players.find(
    (p) => p.id === ctx.player || p.entityId === String(ctx.entity),
  );
  const saved = s.players[ctx.player];
  return {
    ...s.variables,
    server_name: s.name,
    server_max_players: s.config.ServerMaxPlayerCount,
    server_online_players: rt.players.length,
    datetime: new Date().toISOString(),
    bloodmoon: !!rt.bloodMoon,
    ...p,
    ...ctx,
    player_name: ctx.name || p?.name || "",
    player_crossid: ctx.player || "",
    player_steamid: p?.platformId || "",
    player_currency: saved?.currency || 0,
    currency: saved?.currency || 0,
    player_position: p?.pos || "",
    player_level: p?.level ?? ctx.level ?? ctx.player_level ?? 0,
    player_ping: p?.ping || 0,
    player_health: p?.health || 0,
    player_kills: p?.zombies || 0,
    player_deaths: p?.deaths || 0,
  };
}
async function runScript(manager, id, script, eventContext = {}, depth = 0) {
  if (depth > 3) fail("eventRecursion");
  const s = manager.server(id),
    rt = manager.rt(id),
    ast = parseScript(script);
  let count = 0;
  const substitute = (str, ctx) =>
    str.replace(/\{([\w.]+)\}/g, (_, key) =>
      String(ctx[key] ?? s.variables[key] ?? "").replace(/[\r\n"]/g, " "),
    );
  async function run(nodes, ctx) {
    for (const node of nodes) {
      if (++count > 250) fail("eventLimit");
      if (node.kind === "if") {
        await run(
          condition(substitute(node.arg, ctx), ctx, s)
            ? node.body
            : node.elseBody || [],
          ctx,
        );
        continue;
      }
      if (node.kind === "loop") {
        const n = Number(substitute(node.arg, ctx));
        if (!Number.isInteger(n) || n < 0 || n > 50) fail("eventLimit");
        for (let i = 0; i < n; i++) await run(node.body, { ...ctx, index: i });
        continue;
      }
      const arg = substitute(node.arg, ctx),
        args = arg.split(/\s+/);
      switch (node.kind) {
        case "console":
          await manager.command(id, arg);
          break;
        case "say":
          await manager.command(id, "say " + require("./core.cjs").quote(arg));
          break;
        case "whisper": {
          const player = args.shift();
          await manager.command(
            id,
            "sayplayer " +
              require("./core.cjs").target(player) +
              " " +
              require("./core.cjs").quote(args.join(" ")),
          );
          break;
        }
        case "discord":
          await manager.discordSay(id, arg);
          break;
        case "notify":
          manager.emit("notification", { title: s.name, body: arg });
          break;
        case "email": {
          const [subject, ...body] = arg.split("|");
          await require("./extensions.cjs").email(
            s,
            subject,
            body.join("|").trim(),
          );
          break;
        }
        case "program": {
          const output = await require("./extensions.cjs").program(s, arg, ctx);
          manager.log(id, "program", output);
          break;
        }
        case "currency":
          await manager.adjustWallet(id, args[0], Number(args[1]));
          break;
        case "transfer":
          await manager.transfer(id, args[0], args[1], Number(args[2]));
          break;
        case "reward":
          await manager.reward(id, args[0], args.slice(1).join(" "));
          break;
        case "teleport":
          await manager.teleport(id, args[0], args.slice(1).join(" "));
          break;
        case "set":
        case "add": {
          const key = args.shift();
          if (!/^[A-Za-z_]\w*$/.test(key)) fail("invalidScript");
          s.variables[key] =
            node.kind === "add"
              ? Number(s.variables[key] || 0) + Number(args[0])
              : args.join(" ");
          ctx[key] = s.variables[key];
          await manager.store.save();
          break;
        }
        case "random": {
          const key = args[0],
            min = Number(args[1] || 0),
            max = Number(args[2] || 100);
          if (
            !/^[A-Za-z_]\w*$/.test(key) ||
            !Number.isSafeInteger(min) ||
            !Number.isSafeInteger(max) ||
            max <= min ||
            max - min > 1000000
          )
            fail("invalidScript");
          ctx[key] = require("node:crypto").randomInt(min, max + 1);
          break;
        }
        case "event": {
          const e = s.events.find((e) => e.name === arg || e.id === arg);
          if (!e) fail("invalidScript", arg);
          await runScript(manager, id, e.script, ctx, depth + 1);
          break;
        }
        case "group": {
          const p = require("./core.cjs").target(args.shift()),
            name = args.join(" "),
            g = s.groups.find((g) => g.id === name || g.name === name);
          if (!g) fail("invalidData");
          const members = new Set(g.members.split(/[\s,]+/).filter(Boolean));
          members.add(p);
          g.members = [...members].join("\n");
          await manager.store.save();
          break;
        }
        case "wait":
          await new Promise((r) =>
            setTimeout(r, Math.min(30000, Math.max(0, Number(arg) || 0))),
          );
          break;
        case "backup":
          await manager.runJob(id, { action: "backup" });
          break;
        case "start":
          await manager.start(id);
          break;
        case "restart":
          await manager.countdown(id, {
            seconds: Number(args[0]) || 60,
            restart: true,
            message: args.slice(1).join(" "),
          });
          break;
        case "stop":
          await manager.countdown(id, {
            seconds: Number(args[0]) || 60,
            restart: false,
            message: args.slice(1).join(" "),
          });
          break;
        case "cancelshutdown":
          manager.cancelCountdown(id);
          break;
        case "vote":
          await manager.claimVote(id, args[0]);
          break;
        default:
          fail("invalidScript", node.kind);
      }
    }
  }
  await run(ast, context(s, rt, eventContext));
}
module.exports = {
  LOG_EVENTS,
  triggers,
  parseScript,
  condition,
  context,
  runScript,
};

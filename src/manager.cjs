const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { Worker } = require("node:worker_threads");
const { EventEmitter } = require("node:events");
const crypto = require("node:crypto");
const C = require("./core.cjs");
const G = require("./game-options.cjs");
const { Telnet } = require("./telnet.cjs");
const A = require("./automation.cjs");
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
class Manager extends EventEmitter {
  constructor(store) {
    super();
    this.store = store;
    this.runtime = new Map();
    this.locks = new Map();
    this.steamBusy = false;
    this.tickBusy = false;
    this.lastPoll = 0;
    this.logQueue = Promise.resolve();
  }
  get state() {
    return this.store.state;
  }
  server(id) {
    const s = this.state.servers.find((s) => s.id === id);
    if (!s) C.fail("serverMissing");
    return s;
  }
  rt(id) {
    if (!this.runtime.has(id))
      this.runtime.set(id, {
        status: "stopped",
        lines: [],
        players: [],
        client: new Telnet(),
        lastConnect: 0,
        startedAt: null,
        pingFails: {},
        eventLast: {},
        healthFailures: 0,
        lastAutoBackup: Date.now(),
        crashes: [],
        chat: [],
        inventory: [],
        metrics: {},
        busy: null,
        countdown: null,
      });
    return this.runtime.get(id);
  }
  async init() {
    await this.store.load();
    await this.recoverRemovals();
    for (const s of this.state.servers) {
      require("./extensions.cjs").defaults(s);
      s.health ??= {
        enabled: false,
        failures: 3,
        maxRamMb: 0,
        avoidBloodMoon: true,
      };
      s.areas ??= [];
      s.personalTeleports ??= {};
    }
    this.timer = setInterval(
      () => this.tick().catch((e) => this.log(null, "error", e.message)),
      1000,
    );
    this.timer.unref();
  }
  snapshot() {
    return {
      settings: this.state.settings,
      servers: this.state.servers,
      branches: this.state.branches,
      branchesAt: this.state.branchesAt,
      triggers: A.triggers,
      runtime: Object.fromEntries(
        this.state.servers.map((s) => {
          const r = this.rt(s.id);
          return [
            s.id,
            {
              status: r.status,
              connected: r.client.ready,
              players: r.players,
              startedAt: r.startedAt,
              metrics: r.metrics,
              busy: r.busy,
              countdown: r.countdown?.at,
              discord: !!r.discord?.isReady(),
              lastBackup: r.lastBackup,
            },
          ];
        }),
      ),
    };
  }
  changed() {
    this.emit("change", this.snapshot());
  }
  log(id, kind, text) {
    const line = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      kind,
      text: String(text).slice(0, 16000),
    };
    if (id) {
      const r = this.rt(id);
      r.lines.push(line);
      if (r.lines.length > 2500) r.lines.splice(0, r.lines.length - 2500);
    }
    this.emit("log", { serverId: id, line });
    const folder = path.join(
      this.store.root,
      "logs",
      /^[a-zA-Z0-9-]+$/.test(id || "") ? id : "manager",
    );
    const file = path.join(folder, line.at.slice(0, 10) + ".ndjson");
    this.logQueue = this.logQueue
      .then(async () => {
        await fs.mkdir(folder, { recursive: true });
        await fs.appendFile(file, JSON.stringify(line) + "\n");
      })
      .catch(() => {});
  }
  async exclusive(id, job) {
    if (this.locks.has(id)) C.fail("busy");
    this.locks.set(id, true);
    try {
      return await job();
    } finally {
      this.locks.delete(id);
    }
  }
  async work(id, label, job) {
    return this.exclusive(id, async () => {
      const r = this.rt(id);
      r.busy = label;
      this.changed();
      try {
        return await job();
      } finally {
        r.busy = null;
        this.changed();
      }
    });
  }
  async newServer(input) {
    const s = C.defaultServer(this.store.root, this.state.servers.length);
    Object.assign(s, input, {
      id: s.id,
      config: { ...s.config, ...input.config },
    });
    if (!input.directory)
      s.directory = path.join(this.store.root, "servers", s.id);
    s.config.UserDataFolder = path.join(s.directory, "userdata");
    C.validateServer(s, this.state.servers);
    s.health ??= {
      enabled: false,
      failures: 3,
      maxRamMb: 0,
      avoidBloodMoon: true,
    };
    s.areas ??= [];
    s.personalTeleports ??= {};
    require("./extensions.cjs").defaults(s);
    if (s.mode === "local") {
      await fs.mkdir(s.directory, { recursive: true });
      if (
        (await C.exists(path.join(s.directory, "7DaysToDieServer.exe"))) ||
        (await C.exists(path.join(s.directory, "7DaysToDie.exe")))
      ) {
        const xml = await fs
          .readFile(path.join(s.directory, "serverconfig.xml"), "utf8")
          .catch(() => "");
        if (xml) {
          const props = C.parseConfig(xml);
          s.config = {
            ...s.config,
            ...props,
            ...input.config,
            UserDataFolder: path.join(s.directory, "userdata"),
          };
        }
      }
    }
    this.state.servers.push(s);
    try {
      await this.store.save();
    } catch (e) {
      this.state.servers.pop();
      throw e;
    }
    this.changed();
    return s;
  }
  async saveServer(input) {
    return this.exclusive(input.id, async () => {
      const old = this.server(input.id),
        r = this.rt(old.id);
      const requiresStop = [
        "name",
        "host",
        "branch",
        "directory",
        "mode",
        "config",
        "connectCommands",
      ];
      if (
        (r.child || r.client.ready) &&
        requiresStop.some(
          (k) =>
            Object.hasOwn(input, k) &&
            JSON.stringify(input[k]) !== JSON.stringify(old[k]),
        )
      )
        C.fail("stopFirst");
      const s = { ...C.clone(old), ...input, id: old.id };
      s.config = { ...old.config, ...input.config };
      if (old.directory !== s.directory) C.fail("directoryImmutable");
      s.config.UserDataFolder = path.join(s.directory, "userdata");
      C.validateServer(s, this.state.servers);
      this.state.servers[this.state.servers.indexOf(old)] = s;
      try {
        await this.store.save();
      } catch (e) {
        this.state.servers[this.state.servers.indexOf(s)] = old;
        throw e;
      }
      this.changed();
      return s;
    });
  }
  async removeServer(id, { deleteFiles = false } = {}) {
    this.server(id);
    return this.exclusive(id, async () => {
      const r = this.rt(id),
        server = this.server(id),
        D = require("./deletion.cjs");
      if (
        r.child ||
        r.client.connected ||
        r.connecting ||
        r.busy ||
        r.countdown ||
        r.polling
      )
        C.fail("stopFirst");
      r.busy = "removeServer";
      this.changed();
      const old = this.state.servers;
      let plan = null,
        journal = null,
        persisted = false;
      try {
        if (deleteFiles)
          plan = await D.stage(
            server,
            this.store.root,
            old,
            this.store.protectedPaths || [],
          );
        if (plan) {
          journal = {
            id: crypto.randomUUID(),
            server: C.clone(server),
            ...plan,
          };
          (this.state.pendingRemovals ??= []).push(journal);
        }
        this.state.servers = old.filter((x) => x.id !== id);
        await this.store.save();
        persisted = true;
        if (plan) await D.purge(plan);
      } catch (e) {
        this.state.servers = this.state.servers.filter((s) => s.id !== id);
        this.state.servers.push(server);
        try {
          await D.rollback(plan);
          if (journal)
            this.state.pendingRemovals = this.state.pendingRemovals.filter(
              (x) => x.id !== journal.id,
            );
          if (persisted) await this.store.save();
        } catch (recovery) {
          this.log(id, "error", recovery.message);
        }
        if (persisted && deleteFiles)
          throw new C.AppError("deleteFilesFailed", e.message);
        throw e;
      } finally {
        r.busy = null;
        this.changed();
      }
      if (journal) {
        this.state.pendingRemovals = this.state.pendingRemovals.filter(
          (x) => x.id !== journal.id,
        );
        await this.store
          .save()
          .catch((e) => this.log(null, "error", e.message));
      }
      r.client.close();
      r.discord?.destroy();
      this.runtime.delete(id);
      this.changed();
    });
  }
  async recoverRemovals() {
    const D = require("./deletion.cjs");
    let changed = false;
    for (const item of [...(this.state.pendingRemovals || [])]) {
      try {
        if (!item.server || !item.id) C.fail("unsafeDeletion");
        const checked = await D.validate(
          item.server,
          this.store.root,
          this.state.servers,
          this.store.protectedPaths || [],
        );
        if (
          path.resolve(checked.original).toLowerCase() !==
          path.resolve(item.original).toLowerCase()
        )
          C.fail("unsafeDeletion");
        const staged = await C.exists(item.staged),
          original = await C.exists(item.original);
        if (staged) await D.rollback(item);
        if (
          (staged || original) &&
          !this.state.servers.some((s) => s.id === item.server.id)
        )
          this.state.servers.push(item.server);
        this.state.pendingRemovals = this.state.pendingRemovals.filter(
          (x) => x.id !== item.id,
        );
        changed = true;
      } catch (e) {
        this.log(null, "error", "deletionRecovery: " + e.message);
      }
    }
    if (changed) await this.store.save();
  }
  configFile(s) {
    return path.join(s.directory, "seven-serverconfig.xml");
  }
  async configInfo(id) {
    const s = this.server(id);
    if (s.mode === "remote")
      return { values: s.config, comments: {}, installed: false };
    const [stock, active, worlds] = await Promise.all([
      fs
        .readFile(path.join(s.directory, "serverconfig.xml"), "utf8")
        .catch(() => ""),
      fs.readFile(this.configFile(s), "utf8").catch(() => ""),
      G.availableWorlds(s.directory),
    ]);
    const base = stock ? C.parseConfig(stock) : {};
    const values = G.effectiveConfig(base, {
      ...(active ? C.parseConfig(active) : {}),
      ...s.config,
    });
    const comments = {};
    for (const m of (stock || active).matchAll(
      /<property\b[^>]*name="([^"]+)"[^>]*\/>[^\S\r\n]*<!--([\s\S]*?)-->/g,
    ))
      comments[m[1]] = m[2].trim();
    const sandbox = Object.hasOwn(values, "SandboxCode");
    return {
      values,
      comments,
      worlds,
      installed: await C.exists(path.join(s.directory, "7DaysToDieServer.exe")),
      sandbox,
      ...(sandbox ? await G.sandboxInfo(s) : {}),
    };
  }
  async importConfig(id, xml) {
    const values = C.parseConfig(xml),
      s = this.server(id);
    return this.saveServer({
      ...s,
      config: {
        ...s.config,
        ...values,
        UserDataFolder: path.join(s.directory, "userdata"),
      },
    });
  }
  async writeConfig(s) {
    const stock = path.join(s.directory, "serverconfig.xml");
    const template = await fs.readFile(stock, "utf8").catch(() => "");
    const base = template ? C.parseConfig(template) : {};
    s.config = { ...base, ...s.config };
    s.config.UserDataFolder = path.join(s.directory, "userdata");
    s.config.TerminalWindowEnabled = "false";
    await fs.mkdir(s.config.UserDataFolder, { recursive: true });
    const xml = C.buildConfig(G.effectiveConfig(base, s.config), template);
    C.parseConfig(xml);
    await C.atomic(this.configFile(s), xml);
    await this.store.save();
    return this.configFile(s);
  }
  async ensureSteam() {
    let exe =
      this.state.settings.steamcmd ||
      path.join(this.store.root, "tools", "steamcmd", "steamcmd.exe");
    if (await C.exists(exe)) return exe;
    const dir = path.join(this.store.root, "tools", "steamcmd");
    await fs.mkdir(dir, { recursive: true });
    const res = await fetch(
      "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip",
      { signal: AbortSignal.timeout(120000) },
    );
    if (!res.ok) C.fail("downloadFailed", String(res.status));
    const zip = require("adm-zip");
    new zip(Buffer.from(await res.arrayBuffer())).extractAllTo(dir, true);
    if (!(await C.exists(path.join(dir, "steamcmd.exe"))))
      C.fail("downloadFailed");
    return path.join(dir, "steamcmd.exe");
  }
  async runSteam(args, id = null) {
    if (this.steamBusy) C.fail("steamBusy");
    this.steamBusy = true;
    try {
      const exe = await this.ensureSteam();
      return await new Promise((resolve, reject) => {
        const child = spawn(exe, args, {
          cwd: path.dirname(exe),
          windowsHide: true,
          stdio: ["ignore", "pipe", "pipe"],
        });
        let output = "";
        const timer = setTimeout(() => {
          child.kill();
          reject(new C.AppError("steamTimeout"));
        }, 90 * 60000);
        for (const stream of [child.stdout, child.stderr])
          stream.on("data", (b) => {
            const str = b.toString();
            output = (output + str).slice(-4 * 1024 * 1024);
            for (const l of str.split(/\r?\n/).filter(Boolean))
              this.log(id, "steam", l);
          });
        child.once("error", (e) => {
          clearTimeout(timer);
          reject(e);
        });
        child.once("exit", (code) => {
          clearTimeout(timer);
          code === 0
            ? resolve(output)
            : reject(new C.AppError("steamFailed", output.slice(-4000)));
        });
      });
    } finally {
      this.steamBusy = false;
    }
  }
  async refreshBranches() {
    const text = await this.runSteam([
      "+login",
      "anonymous",
      "+app_info_update",
      "1",
      "+app_info_print",
      "294420",
      "+quit",
    ]);
    const branches = C.branchesFromInfo(text);
    this.state.branches = branches;
    this.state.branchesAt = new Date().toISOString();
    await this.store.save();
    this.changed();
    return branches;
  }
  async install(id) {
    return this.work(id, "install", async () => {
      const s = this.server(id),
        r = this.rt(id);
      if (s.mode !== "local") C.fail("localOnly");
      if (r.child || r.client.ready || r.countdown) C.fail("stopFirst");
      C.validateServer(s, this.state.servers);
      if (
        this.state.branches.length &&
        !this.state.branches.some((b) => b.id === s.branch)
      )
        C.fail("branchUnavailable");
      const target = await fs.realpath(s.directory).catch(() => s.directory);
      for (const other of this.state.servers) {
        if (other.id === id || other.mode !== "local") continue;
        const directory = await fs
          .realpath(other.directory)
          .catch(() => other.directory);
        if (C.overlap(target, directory)) C.fail("sharedDirectory");
      }
      if (
        (await C.exists(path.join(s.directory, "7DaysToDieServer.exe"))) ||
        (await C.exists(this.configFile(s)))
      )
        await this.backupInternal(id);
      const out = await this.runSteam(
        [
          "+force_install_dir",
          s.directory,
          "+login",
          "anonymous",
          "+app_update",
          "294420",
          "-beta",
          s.branch,
          "validate",
          "+quit",
        ],
        id,
      );
      if (
        !/Success! App '294420' fully installed/.test(out) ||
        !(await C.exists(path.join(s.directory, "7DaysToDieServer.exe")))
      )
        C.fail("steamFailed", out.slice(-3000));
      await this.writeConfig(s);
      await this.store.save();
      this.log(id, "success", "294420 · " + s.branch);
      return true;
    });
  }
  async connect(id) {
    const s = this.server(id),
      r = this.rt(id);
    if (r.client.ready) return true;
    if (r.connecting) C.fail("busy");
    r.connecting = true;
    r.lastConnect = Date.now();
    r.client.removeAllListeners();
    r.client.on("line", (line) => {
      this.log(id, "console", line);
      this.handleLine(id, line);
      if (r.child && /StartGame done|GameServer.Init successful/i.test(line)) {
        r.status = "running";
        this.changed();
      }
    });
    r.client.on("closed", () => {
      if (s.mode === "remote") r.status = "disconnected";
      r.players = [];
      this.changed();
    });
    r.client.on("failure", (m) => this.log(id, "error", m));
    try {
      await r.client.connect(
        s.host,
        s.config.TelnetPort,
        s.config.TelnetPassword,
      );
      if (s.mode === "remote") r.status = "running";
      r.healthFailures = 0;
      this.changed();
      for (const c of s.connectCommands.split(/\r?\n/).filter(Boolean))
        await this.command(id, c);
      this.fire(id, "connected", {});
      return true;
    } finally {
      r.connecting = false;
    }
  }
  disconnect(id) {
    const r = this.rt(id);
    r.manualDisconnect = true;
    r.client.close();
    if (!r.child) r.status = "disconnected";
    this.changed();
  }
  async start(id) {
    return this.work(id, "start", () => this.startInternal(id));
  }
  async startInternal(id) {
    const s = this.server(id),
      r = this.rt(id);
    if (s.mode === "remote") {
      r.manualDisconnect = false;
      return this.connect(id);
    }
    if (r.child) C.fail("alreadyRunning");
    C.validateServer(s, this.state.servers);
    const exe = path.join(s.directory, "7DaysToDieServer.exe");
    if (!(await C.exists(exe))) C.fail("notInstalled");
    const net = require("node:net"),
      dgram = require("node:dgram");
    for (const p of [s.config.TelnetPort, s.config.WebDashboardPort])
      await new Promise((res, rej) => {
        const check = net.createServer();
        check.once("error", () => rej(new C.AppError("portInUse", p)));
        check.listen(Number(p), "0.0.0.0", () => check.close(res));
      });
    await new Promise((res, rej) => {
      const check = dgram.createSocket("udp4");
      check.once("error", () => {
        check.close();
        rej(new C.AppError("portInUse", s.config.ServerPort));
      });
      check.bind(Number(s.config.ServerPort), "0.0.0.0", () =>
        check.close(res),
      );
    });
    const config = await this.writeConfig(s);
    const logs = path.join(s.directory, "logs");
    await fs.mkdir(logs, { recursive: true });
    r.logFile = path.join(logs, "server-" + Date.now() + ".log");
    r.logOffset = 0;
    r.logTail = "";
    r.stopping = false;
    r.manualDisconnect = false;
    r.status = "starting";
    r.startedAt = new Date().toISOString();
    r.metrics = {};
    const child = spawn(
      exe,
      [
        "-quit",
        "-batchmode",
        "-nographics",
        "-configfile=" + config,
        "-logfile",
        r.logFile,
        "-dedicated",
      ],
      { cwd: s.directory, windowsHide: true, stdio: "ignore" },
    );
    r.child = child;
    r.pid = child.pid;
    child.once("error", (e) => {
      this.log(id, "error", e.message);
      if (r.child === child) {
        r.child = null;
        r.status = "stopped";
        this.changed();
      }
    });
    child.once("exit", (code) => {
      if (r.child !== child) return;
      r.child = null;
      r.pid = null;
      r.client.close();
      r.status = "stopped";
      r.startedAt = null;
      r.metrics = { gameTime: r.metrics.gameTime };
      this.log(id, "process", "exit " + code);
      this.changed();
      this.fire(id, "stopped", { code });
      if (!r.stopping && s.autoRestart) {
        r.crashes = r.crashes.filter((t) => Date.now() - t < 600000);
        if (r.crashes.length < 3) {
          r.crashes.push(Date.now());
          r.restartAt = Date.now() + 30000;
        } else this.log(id, "error", "restartLimit");
      }
    });
    this.changed();
    return child.pid;
  }
  async stop(id, force = false) {
    return this.work(id, "stop", () => this.stopInternal(id, force));
  }
  async stopInternal(id, force = false) {
    const s = this.server(id),
      r = this.rt(id);
    r.stopping = true;
    r.restartAt = null;
    r.manualDisconnect = true;
    if (force) {
      if (r.child) r.child.kill();
      else C.fail("notRunning");
      return;
    }
    if (!r.client.ready) {
      if (r.child) await this.connect(id);
      else C.fail("notConnected");
    }
    await this.command(id, "saveworld");
    await this.command(id, "shutdown").catch((e) => {
      if (e.code !== "disconnected") throw e;
    });
    r.status = "stopping";
    this.changed();
    const until = Date.now() + 90000;
    while (
      (r.child || (s.mode === "remote" && r.client.connected)) &&
      Date.now() < until
    )
      await delay(500);
    if (r.child || (s.mode === "remote" && r.client.connected))
      C.fail("shutdownTimeout");
    r.status = "stopped";
    this.changed();
  }
  async countdown(id, { seconds = 60, restart = false, message = "" }) {
    const r = this.rt(id);
    if (!r.client.ready) C.fail("notConnected");
    if (r.countdown) C.fail("busy");
    if (!Number.isInteger(seconds) || seconds < 0 || seconds > 86400)
      C.fail("invalidInterval");
    if (restart && this.server(id).mode === "remote")
      C.fail("remoteRestartUnsupported");
    r.countdown = {
      at: Date.now() + seconds * 1000,
      restart,
      message,
      last: -1,
    };
    this.changed();
    return true;
  }
  cancelCountdown(id) {
    const r = this.rt(id);
    r.countdown = null;
    this.fire(id, "shutdownCancelled", {});
    this.changed();
  }
  async command(id, command) {
    const r = this.rt(id);
    const output = await r.client.command(command);
    this.log(
      id,
      "command",
      command.replace(/(password|token)\s+.*/i, "$1 ***"),
    );
    return output;
  }
  async playerAction(id, action, player, args = {}) {
    const t = C.target(player);
    const cmds = {
      kick: () => `kick ${t} ${C.quote(args.reason || "Admin")}`,
      ban: () =>
        `ban add ${t} ${Number(args.duration) || 1} ${/^(minutes|hours|days|years)$/.test(args.unit) ? args.unit : "days"} ${C.quote(args.reason || "Admin")}`,
      unban: () => `ban remove ${t}`,
      admin: () =>
        `admin add ${t} ${Math.max(0, Math.min(1000, Number(args.level) || 0))}`,
      removeAdmin: () => `admin remove ${t}`,
      whitelist: () => `whitelist add ${t}`,
      removeWhitelist: () => `whitelist remove ${t}`,
      teleport: () => {
        if (!/^-?[\d.]+,\s*-?[\d.]+,\s*-?[\d.]+$/.test(args.position))
          C.fail("invalidPosition");
        return `teleportplayer ${t} ${args.position.replaceAll(",", " ")}`;
      },
      give: () => {
        if (!/^[\w.-]+$/.test(args.item)) C.fail("invalidItem");
        return `give ${t} ${args.item} ${Math.max(1, Math.min(1000, Number(args.count) || 1))} ${Math.max(1, Math.min(6, Number(args.quality) || 1))}`;
      },
      buff: () => {
        if (!/^[\w.-]+$/.test(args.buff)) C.fail("invalidItem");
        return `buffplayer ${t} ${args.buff}`;
      },
    };
    if (!cmds[action]) C.fail("invalidAction");
    const output = await this.command(id, cmds[action]());
    if (
      /unknown command|command not found|not a valid|not found|failed to|\bERR\b|\bError:/i.test(
        output,
      )
    )
      C.fail("commandUnsupported", output.slice(-1500));
    return output;
  }
  async worker(data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, "file-worker.cjs"), {
        workerData: data,
      });
      const timer = setTimeout(() => {
        worker.terminate();
        reject(new C.AppError("fileTimeout"));
      }, 20 * 60000);
      worker.once("message", (m) => {
        clearTimeout(timer);
        m.ok
          ? resolve(m.result)
          : reject(new C.AppError(m.error.code, m.error.detail));
      });
      worker.once("error", (e) => {
        clearTimeout(timer);
        reject(e);
      });
      worker.once("exit", (code) => {
        clearTimeout(timer);
        if (code !== 0)
          reject(new C.AppError("operationFailed", "worker " + code));
      });
    });
  }
  async mods(id) {
    const s = this.server(id);
    if (s.mode !== "local") C.fail("localOnly");
    const base = path.join(s.directory, "Mods");
    let result = [];
    for (const [p, enabled] of [
      [base, true],
      [path.join(base, ".disabled"), false],
    ])
      for (const e of await fs
        .readdir(p, { withFileTypes: true })
        .catch(() => [])) {
        if (!e.isDirectory() || e.name.startsWith(".")) continue;
        const info = await fs
          .readFile(path.join(p, e.name, "ModInfo.xml"), "utf8")
          .catch(() => "");
        const field = (n) =>
          info.match(new RegExp("<" + n + '\\s+value="([^"]*)"', "i"))?.[1] ||
          "";
        result.push({
          folder: e.name,
          name: field("DisplayName") || field("Name") || e.name,
          version: field("Version"),
          author: field("Author"),
          enabled,
          valid: !!info,
        });
      }
    return result;
  }
  async importMod(id, source) {
    return this.work(id, "mod", async () => {
      const s = this.server(id);
      if (s.mode !== "local") C.fail("localOnly");
      if (this.rt(id).child) C.fail("stopFirst");
      const staging = path.join(
        s.directory,
        ".mod-stage-" + crypto.randomUUID(),
      );
      try {
        return await this.worker({
          op: "mod",
          source,
          staging,
          dest: path.join(s.directory, "Mods"),
        });
      } finally {
        await fs.rm(staging, { recursive: true, force: true });
      }
    });
  }
  async toggleMod(id, name, enabled) {
    return this.work(id, "mod", async () => {
      const s = this.server(id);
      if (s.mode !== "local") C.fail("localOnly");
      if (this.rt(id).child) C.fail("stopFirst");
      C.safeName(name);
      const base = path.join(s.directory, "Mods"),
        from = path.join(base, enabled ? ".disabled" : "", name),
        to = path.join(base, enabled ? "" : ".disabled", name);
      if (await C.exists(to)) C.fail("modExists");
      await fs.mkdir(path.dirname(to), { recursive: true });
      await fs.rename(from, to);
    });
  }
  backupsDir(s) {
    return path.join(this.store.root, "backups", s.id);
  }
  async backups(id) {
    const dir = this.backupsDir(this.server(id));
    const rows = [];
    for (const f of await fs.readdir(dir).catch(() => []))
      if (f.endsWith(".zip")) {
        const st = await fs.stat(path.join(dir, f));
        rows.push({ name: f, size: st.size, at: st.mtime.toISOString() });
      }
    return rows.sort((a, b) => b.at.localeCompare(a.at));
  }
  async backup(id) {
    return this.work(id, "backup", () => this.backupInternal(id));
  }
  async backupInternal(id) {
    const s = this.server(id),
      r = this.rt(id);
    if (s.mode !== "local") C.fail("localOnly");
    if (r.child || r.client.ready) C.fail("backupStopFirst");
    const dir = this.backupsDir(s),
      file = path.join(
        dir,
        new Date().toISOString().replace(/[:.]/g, "-") + ".zip",
      );
    this.fire(id, "backupStarted", {});
    try {
      await this.worker({
        op: "backup",
        userdata: path.join(s.directory, "userdata"),
        config: (await C.exists(this.configFile(s)))
          ? this.configFile(s)
          : path.join(s.directory, "serverconfig.xml"),
        mods: path.join(s.directory, "Mods"),
        profile: this.store.codec.encode(s),
        output: file,
      });
      r.lastBackup = new Date().toISOString();
      const old = await this.backups(id);
      const keep = Math.max(1, Number(s.backup.keep) || 10);
      for (const f of old.slice(keep)) await fs.rm(path.join(dir, f.name));
      this.fire(id, "backupCompleted", {});
      this.changed();
      return file;
    } catch (e) {
      this.fire(id, "backupFailed", {});
      throw e;
    }
  }
  async restore(id, name) {
    return this.work(id, "restore", async () => {
      const s = this.server(id),
        r = this.rt(id);
      if (s.mode !== "local") C.fail("localOnly");
      if (r.child || r.client.connected) C.fail("stopFirst");
      C.safeName(name);
      if (!name.endsWith(".zip")) C.fail("invalidBackup");
      const staging = path.join(s.directory, ".restore-" + crypto.randomUUID()),
        file = path.join(this.backupsDir(s), name);
      const zip = new (require("adm-zip"))(file),
        entry = zip.getEntry("manager-profile.json");
      if (!entry || entry.header.size > 2 * 1024 * 1024)
        C.fail("invalidBackup");
      let saved;
      try {
        saved = this.store.codec.decode(
          JSON.parse(entry.getData().toString("utf8")),
        );
      } catch {
        C.fail("invalidBackup");
      }
      if (saved.branch !== s.branch) C.fail("backupVersionMismatch");
      const previous = C.clone(s),
        oldConfig = await fs
          .readFile(this.configFile(s), "utf8")
          .catch(() => null);
      let swapped;
      try {
        swapped = await this.worker({
          op: "restore",
          file,
          staging,
          userdata: path.join(s.directory, "userdata"),
          mods: path.join(s.directory, "Mods"),
        });
        const config = await fs
          .readFile(path.join(staging, "serverconfig.xml"), "utf8")
          .catch(() => "");
        if (config) {
          const values = C.parseConfig(config);
          for (const p of [
            "ServerPort",
            "TelnetPort",
            "WebDashboardPort",
            "UserDataFolder",
            "TelnetPassword",
          ])
            values[p] = s.config[p];
          s.config = { ...s.config, ...values };
        }
        for (const key of [
          "events",
          "schedules",
          "groups",
          "bags",
          "teleports",
          "players",
          "variables",
          "deliveries",
          "security",
          "economy",
          "voting",
          "discord",
          "api",
          "health",
          "areas",
          "personalTeleports",
          "notifications",
          "programs",
        ])
          if (Object.hasOwn(saved, key)) s[key] = saved[key];
        await this.writeConfig(s);
        await this.store.save();
        this.changed();
        return swapped.previous.map((x) => x[0]);
      } catch (e) {
        if (swapped) {
          for (const dest of swapped.moved)
            if (await C.exists(dest))
              await fs.rename(dest, dest + ".failed-restore-" + Date.now());
          for (const [from, to] of swapped.previous) await fs.rename(from, to);
          Object.assign(s, previous);
          if (oldConfig !== null) await C.atomic(this.configFile(s), oldConfig);
          await this.store.save();
        }
        throw e;
      } finally {
        await fs.rm(staging, { recursive: true, force: true });
      }
    });
  }
  async apiCall(s, endpoint) {
    const base = s.api.baseUrl;
    if (!/^https?:\/\//i.test(base)) C.fail("apiRequired");
    const url = new URL(endpoint, base.endsWith("/") ? base : base + "/");
    const res = await fetch(url, {
      headers: {
        "X-SDTD-API-TOKENNAME": s.api.tokenName,
        "X-SDTD-API-SECRET": s.api.token,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) C.fail("apiFailed", String(res.status));
    const json = await res.json();
    return json.data ?? json;
  }
  async inventory(id, player) {
    const s = this.server(id),
      t = C.target(player);
    const result = await this.apiCall(
      s,
      "api/getplayerinventory?userid=" + encodeURIComponent(t),
    );
    const r = this.rt(id);
    if (!r.inventory.length) {
      r.inventory = JSON.parse(
        await fs
          .readFile(
            path.join(this.store.root, "inventory", id + ".json"),
            "utf8",
          )
          .catch(() => "[]"),
      );
    }
    r.inventory.push({ at: new Date().toISOString(), player: t, data: result });
    if (r.inventory.length > 100) r.inventory.shift();
    await C.atomic(
      path.join(this.store.root, "inventory", id + ".json"),
      JSON.stringify(r.inventory),
    );
    return r.inventory;
  }
  async connectDiscord(id) {
    const s = this.server(id),
      r = this.rt(id);
    if (r.discord) await this.disconnectDiscord(id);
    if (!s.discord.token || !s.discord.channelId) C.fail("discordRequired");
    const { Client, GatewayIntentBits } = require("discord.js");
    const client = (r.discord = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    }));
    client.on("error", (e) => this.log(id, "error", e.message));
    client.on("messageCreate", async (msg) => {
      if (msg.author.bot || msg.channelId !== s.discord.channelId) return;
      if (msg.content.startsWith("!link ")) {
        try {
          await this.acceptLink(id, msg.content.slice(6).trim(), msg.author.id);
          await msg.reply({ content: "✓", allowedMentions: { parse: [] } });
        } catch (e) {
          this.log(id, "error", e.code || e.message);
        }
        return;
      }
      const row = {
        at: new Date().toISOString(),
        source: "discord",
        name: msg.author.username,
        text: msg.content,
      };
      r.chat.push(row);
      if (r.chat.length > 500) r.chat.shift();
      this.emit("chat", { serverId: id, row });
      if (s.discord.relay && r.client.ready)
        await this.command(
          id,
          "say " + C.quote("[Discord] " + row.name + ": " + row.text),
        ).catch((e) => this.log(id, "error", e.message));
      if (
        msg.content.startsWith("!server ") &&
        s.discord.adminRoleId &&
        msg.member?.roles.cache.has(s.discord.adminRoleId)
      ) {
        try {
          const answer = await this.command(id, msg.content.slice(8));
          await msg.reply({
            content: answer.slice(-1800) || "OK",
            allowedMentions: { parse: [] },
          });
        } catch (e) {
          await msg
            .reply({
              content: e.code || e.message,
              allowedMentions: { parse: [] },
            })
            .catch(() => {});
        }
      }
      this.fire(id, "discordChat", row);
    });
    client.on("clientReady", () => {
      this.changed();
      this.fire(id, "discordConnected", {});
    });
    try {
      await client.login(s.discord.token);
      const channel = await client.channels.fetch(s.discord.channelId);
      if (!channel?.isTextBased()) C.fail("discordRequired");
    } catch (e) {
      client.destroy();
      r.discord = null;
      throw e;
    }
    this.changed();
    return true;
  }
  async disconnectDiscord(id) {
    const r = this.rt(id);
    r.discord?.destroy();
    r.discord = null;
    this.fire(id, "discordDisconnected", {});
    this.changed();
  }
  async discordSay(id, text) {
    const r = this.rt(id),
      s = this.server(id);
    if (!r.discord?.isReady()) C.fail("discordRequired");
    const channel = await r.discord.channels.fetch(s.discord.channelId);
    await channel.send({
      content: String(text).slice(0, 1900),
      allowedMentions: { parse: [] },
    });
  }
  async saveCollection(id, key, list) {
    return this.exclusive(id, async () => {
      const s = this.server(id);
      if (
        ![
          "events",
          "schedules",
          "groups",
          "bags",
          "teleports",
          "areas",
          "programs",
        ].includes(key) ||
        !Array.isArray(list) ||
        list.length > 1000
      )
        C.fail("invalidData");
      for (const x of list) {
        if (!x.id) x.id = crypto.randomUUID();
        if (!x.name?.trim()) C.fail("invalidName");
        if (key === "events") {
          if (!A.triggers.includes(x.trigger)) C.fail("invalidTrigger");
          if (
            typeof x.match !== "string" ||
            x.match.length > 500 ||
            !["contains", "starts", "equals", "any"].includes(
              x.condition || "contains",
            )
          )
            C.fail("invalidData");
          x.cooldown = Math.max(1, Number(x.cooldown) || 1);
          A.parseScript(x.script || "");
          x.order = Number(x.order) || 0;
        }
        if (key === "schedules") {
          if (
            ![
              "command",
              "restart",
              "stop",
              "backup",
              "start",
              "event",
            ].includes(x.action)
          )
            C.fail("invalidAction");
          if (!["interval", "daily", "once"].includes(x.repeat))
            C.fail("invalidInterval");
          if (x.repeat === "daily" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(x.time))
            C.fail("invalidInterval");
          if (
            x.repeat === "interval" &&
            (!Number.isFinite(Number(x.minutes)) || Number(x.minutes) < 1)
          )
            C.fail("invalidInterval");
          if (x.repeat === "once" && !Number.isFinite(Date.parse(x.at)))
            C.fail("invalidInterval");
          x.nextAt = this.nextDue(x);
        }
        if (key === "bags") {
          if (
            !Array.isArray(x.items) ||
            x.items.some(
              (i) =>
                !/^[\w.-]+$/.test(i.item) ||
                !Number.isInteger(Number(i.count)) ||
                Number(i.count) < 1 ||
                Number(i.count) > 1000,
            )
          )
            C.fail("invalidItem");
          x.cost = Math.max(0, Number(x.cost) || 0);
        }
        if (
          key === "programs" &&
          (!path.isAbsolute(x.executable) ||
            path.extname(x.executable).toLowerCase() !== ".exe" ||
            !Array.isArray(x.args) ||
            x.args.some((v) => typeof v !== "string"))
        )
          C.fail("invalidData");
        if (
          key === "areas" &&
          (!Number.isFinite(Number(x.radius)) || Number(x.radius) <= 0)
        )
          C.fail("invalidPosition");
        if (
          ["teleports", "areas"].includes(key) &&
          !/^-?[\d.]+,\s*-?[\d.]+,\s*-?[\d.]+$/.test(x.position)
        )
          C.fail("invalidPosition");
      }
      const old = s[key];
      s[key] = C.clone(list);
      try {
        await this.store.save();
      } catch (e) {
        s[key] = old;
        throw e;
      }
      this.changed();
      return list;
    });
  }
  nextDue(x) {
    if (x.repeat === "once") return Date.parse(x.at);
    if (x.repeat === "interval") return Date.now() + Number(x.minutes) * 60000;
    const d = new Date();
    const [h, m] = x.time.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
    return d.getTime();
  }
  matches(rule, ctx) {
    const text = String(ctx.text ?? ctx.line ?? "");
    const needle = rule.match || "";
    let match =
      rule.condition === "any" ||
      !needle ||
      (rule.condition === "equals"
        ? text === needle
        : rule.condition === "starts"
          ? text.startsWith(needle)
          : text.includes(needle));
    if (rule.groupId) {
      const group = this.currentEventServer.groups.find(
        (g) => g.id === rule.groupId,
      );
      match =
        match &&
        !!group?.members?.split(/[\s,]+/).includes(ctx.player || ctx.id);
    }
    return match;
  }
  fire(id, trigger, ctx) {
    const s = this.server(id),
      r = this.rt(id);
    for (const e of s.events
      .filter((e) => e.enabled && e.trigger === trigger)
      .sort((a, b) => (a.order || 0) - (b.order || 0))) {
      this.currentEventServer = s;
      if (
        !this.matches(e, ctx) ||
        Date.now() - (r.eventLast[e.id + ":" + (ctx.player || "global")] || 0) <
          Number(e.cooldown || 1) * 1000
      )
        continue;
      r.eventLast[e.id + ":" + (ctx.player || "global")] = Date.now();
      this.executeActions(id, e.script, ctx).catch((err) =>
        this.log(id, "error", e.name + ": " + err.message),
      );
    }
  }
  async executeActions(id, script, ctx = {}, depth = 0) {
    return A.runScript(this, id, script, ctx, depth);
  }
  handleLine(id, line) {
    const r = this.rt(id);
    this.fire(id, "log", { text: line, line });
    for (const [type, re] of A.LOG_EVENTS)
      if (re.test(line)) {
        if (type === "bloodmoonStarted") r.bloodMoon = true;
        if (type === "bloodmoonEnded") r.bloodMoon = false;
        if (type === "serverReady" && r.child) r.status = "running";
        const entity = line.match(/(?:entity id '|EntityID=)(\d+)/i)?.[1];
        const p = r.players.find((p) => p.entityId === entity);
        this.fire(id, type, {
          text: line,
          line,
          player: p?.id || "",
          name: p?.name || "",
          entity: entity || "",
        });
      }
    const message = line.match(
      /Chat.*?\(from '([^']*)', entity id '(-?\d+)'.*?\):\s*'(.*?)':\s*(.*)$/i,
    );
    if (message) {
      const player = r.players.find(
        (p) => p.entityId === message[2] || p.id === message[1],
      );
      const row = {
        at: new Date().toISOString(),
        source: "game",
        name: message[3],
        text: message[4].replace(/^'(.*)'$/, "$1"),
      };
      r.chat.push(row);
      if (r.chat.length > 500) r.chat.shift();
      this.emit("chat", { serverId: id, row });
      this.fire(id, "chat", {
        ...row,
        player: player?.id || "",
        entity: player?.entityId || "",
      });
      if (this.server(id).discord.relay && r.discord?.isReady())
        this.discordSay(id, `${row.name}: ${row.text}`).catch((e) =>
          this.log(id, "error", e.message),
        );
      if (player)
        this.chatCommand(id, player, row.text).catch((e) =>
          this.log(id, "error", e.message),
        );
    }
  }
  async chatCommand(id, player, text) {
    const s = this.server(id),
      p = this.wallet(s, player.id);
    if (text === "!link") {
      const code = this.createLink(id, player.id);
      await this.command(
        id,
        "sayplayer " +
          C.target(player.id) +
          " " +
          C.quote("Discord: !link " + code + " (5 min)"),
      );
    }
    if (text.startsWith("!sethome "))
      await this.home(id, player.id, text.slice(9), "save");
    if (text.startsWith("!home "))
      await this.home(id, player.id, text.slice(6), "go");
    if (text.startsWith("!delhome "))
      await this.home(id, player.id, text.slice(9), "remove");
    if (text === "!homes") {
      const homes = await this.home(id, player.id, "", "list");
      await this.command(
        id,
        "sayplayer " +
          C.target(player.id) +
          " " +
          C.quote(homes.map((h) => h.name).join(", ") || "—"),
      );
    }
    if (text.startsWith("!pay ") && s.economy.enabled) {
      const [, who, value] = text.split(/\s+/);
      const receiver = this.rt(id).players.find(
        (p) => p.id === who || p.name === who,
      );
      if (!receiver) C.fail("invalidPlayer");
      await this.transfer(id, player.id, receiver.id, Number(value));
    }
    if (text === "!balance" && s.economy.enabled)
      await this.command(id, "say " + C.quote(player.name + ": " + p.currency));
    if (text.startsWith("!tele ") && s.economy.enabled)
      await this.teleport(id, player.id, text.slice(6));
    if (text.startsWith("!bag ") && s.economy.enabled)
      await this.reward(id, player.id, text.slice(5));
    if (text === "!vote" && s.voting.enabled)
      await this.claimVote(id, player.id);
  }
  wallet(s, id) {
    return (s.players[id] ??= {
      currency: 0,
      lastTeleport: 0,
      lastMinuteReward: Date.now(),
      votes: [],
      name: id,
    });
  }
  async adjustWallet(id, player, amount) {
    return this.exclusive("wallet:" + id, async () => {
      const s = this.server(id),
        p = this.wallet(s, C.target(player));
      if (!Number.isFinite(amount) || p.currency + amount < 0)
        C.fail("insufficientFunds");
      p.currency += amount;
      try {
        await this.store.save();
      } catch (e) {
        p.currency -= amount;
        throw e;
      }
      this.changed();
      return p.currency;
    });
  }
  async transfer(id, from, to, amount) {
    return this.exclusive("wallet:" + id, async () => {
      C.target(from);
      C.target(to);
      if (from === to || !Number.isFinite(amount) || amount <= 0)
        C.fail("invalidData");
      const s = this.server(id),
        a = this.wallet(s, from),
        b = this.wallet(s, to);
      if (a.currency < amount) C.fail("insufficientFunds");
      a.currency -= amount;
      b.currency += amount;
      try {
        await this.store.save();
      } catch (e) {
        a.currency += amount;
        b.currency -= amount;
        throw e;
      }
      this.changed();
      return { from: a.currency, to: b.currency };
    });
  }
  createLink(id, player) {
    const r = this.rt(id);
    C.target(player);
    r.linkCodes ??= new Map();
    for (const [code, x] of r.linkCodes)
      if (x.until < Date.now() || x.player === player) r.linkCodes.delete(code);
    const code = crypto.randomBytes(6).toString("hex").toUpperCase();
    r.linkCodes.set(code, { player, until: Date.now() + 300000 });
    return code;
  }
  async acceptLink(id, code, discordId) {
    if (!/^\d{15,22}$/.test(discordId)) C.fail("invalidData");
    const r = this.rt(id),
      request = r.linkCodes?.get(code);
    if (!request || request.until < Date.now()) C.fail("linkExpired");
    r.linkCodes.delete(code);
    const s = this.server(id);
    for (const player of Object.values(s.players))
      if (player.discordId === discordId) delete player.discordId;
    this.wallet(s, request.player).discordId = discordId;
    await this.store.save();
    return true;
  }
  async applyGroup(id, groupId) {
    const g = this.server(id).groups.find((g) => g.id === groupId);
    if (!g) C.fail("invalidData");
    const results = [];
    for (const p of g.members.split(/[\s,]+/).filter(Boolean))
      results.push(
        await this.playerAction(id, "admin", p, {
          level: Number(g.level) || 0,
        }),
      );
    return results;
  }
  async monitor() {
    const M = require("./monitor.cjs");
    const running = [...this.runtime.values()].filter((r) => r.child && r.pid);
    const stats = await M.sample(running.map((r) => r.pid));
    for (const data of stats) {
      const [id, r] =
        [...this.runtime.entries()].find(([, r]) => r.pid === data.pid) || [];
      if (!r) continue;
      M.apply(r, data);
      const s = this.server(id),
        h = s.health || {};
      if (h.maxRamMb > 0 && r.metrics.ramMb > h.maxRamMb) {
        this.fire(id, "ramFailed", { ram: r.metrics.ramMb });
        if (h.enabled)
          r.healthFailures = Math.max(
            r.healthFailures,
            Number(h.failures) || 3,
          );
      }
      if (
        h.enabled &&
        r.healthFailures >= Number(h.failures || 3) &&
        !r.busy &&
        !r.countdown &&
        r.status === "running"
      ) {
        this.fire(id, "healthFailed", {});
        if (!h.avoidBloodMoon || !r.bloodMoon) {
          this.work(id, "restart", async () => {
            await this.stopInternal(id).catch(async () => {
              if (r.child) {
                r.child.kill();
                const until = Date.now() + 15000;
                while (r.child && Date.now() < until) await delay(500);
              }
              if (r.child) C.fail("shutdownTimeout");
            });
            await this.startInternal(id);
            this.fire(id, "serverRestart", {});
          }).catch((e) => this.log(id, "error", e.code || e.message));
        }
      }
    }
    this.changed();
  }
  async reward(id, player, bagId, free = false) {
    return this.exclusive("wallet:" + id, async () => {
      const s = this.server(id);
      const bag = s.bags.find((b) => b.id === bagId || b.name === bagId);
      if (!bag) C.fail("bagMissing");
      const t = C.target(player),
        p = this.wallet(s, t);
      const cost = free ? 0 : Number(bag.cost) || 0;
      if (p.currency < cost) C.fail("insufficientFunds");
      if (!this.rt(id).client.ready) C.fail("notConnected");
      const delivery = {
        id: crypto.randomUUID(),
        player: t,
        bagId: bag.id,
        at: new Date().toISOString(),
        status: "pending",
        completed: 0,
        cost,
      };
      p.currency -= cost;
      s.deliveries.push(delivery);
      try {
        await this.store.save();
      } catch (e) {
        p.currency += cost;
        s.deliveries.splice(s.deliveries.indexOf(delivery), 1);
        throw e;
      }
      try {
        let items = bag.items;
        if (bag.random && items.length)
          items = [items[crypto.randomInt(items.length)]];
        for (const item of items) {
          const output = await this.playerAction(id, "give", t, item);
          if (/ERR|not found|unknown command|invalid/i.test(output))
            C.fail("deliveryFailed", output);
          delivery.completed++;
          await this.store.save();
        }
        delivery.status = "delivered";
      } catch (e) {
        delivery.status = "review";
        delivery.error = e.code || e.message;
        await this.store.save();
        throw e;
      }
      await this.store.save();
      this.changed();
      return delivery;
    });
  }
  async teleport(id, player, destination) {
    return this.exclusive("wallet:" + id, async () => {
      const s = this.server(id),
        t = C.target(player),
        p = this.wallet(s, t),
        d = destination.startsWith("home:")
          ? (s.personalTeleports?.[t] || []).find(
              (d) => d.name === destination.slice(5),
            )
          : s.teleports.find(
              (d) => d.id === destination || d.name === destination,
            );
      if (!d) C.fail("destinationMissing");
      const cost = Number(s.economy.teleportCost) || 0;
      if (p.currency < cost) C.fail("insufficientFunds");
      if (
        Date.now() - p.lastTeleport <
        Number(s.economy.teleportCooldown) * 1000
      )
        C.fail("cooldown");
      const out = await this.playerAction(id, "teleport", t, {
        position: d.position,
      });
      if (/ERR|not found|unknown command|invalid/i.test(out))
        C.fail("operationFailed", out);
      p.currency -= cost;
      p.lastTeleport = Date.now();
      await this.store.save();
      return out;
    });
  }
  async home(id, player, name, action = "save") {
    const s = this.server(id),
      t = C.target(player),
      p = this.rt(id).players.find((p) => p.id === t);
    s.personalTeleports ??= {};
    const homes = (s.personalTeleports[t] ??= []);
    if (action === "go") return this.teleport(id, t, "home:" + name);
    if (action === "list") return homes;
    if (action === "remove") {
      s.personalTeleports[t] = homes.filter((h) => h.name !== name);
      await this.store.save();
      return true;
    }
    if (!p) C.fail("invalidPlayer");
    if (!name || name.length > 50 || /[\r\n]/.test(name)) C.fail("invalidName");
    const old = homes.find((h) => h.name === name);
    if (old) old.position = p.pos;
    else {
      if (homes.length >= Number(s.economy.maxHomes || 10))
        C.fail("locationLimit");
      homes.push({ id: crypto.randomUUID(), name, position: p.pos });
    }
    await this.store.save();
    return homes;
  }
  async claimVote(id, player) {
    return this.exclusive("vote:" + id + ":" + player, async () => {
      const s = this.server(id);
      if (!s.voting.enabled || !s.voting.apiKey) C.fail("votingRequired");
      const t = C.target(player);
      const online = this.rt(id).players.find((p) => p.id === t);
      const steam = (online?.platformId || t).replace(/^Steam_/, "");
      if (!/^\d{17}$/.test(steam)) C.fail("steamIdRequired");
      const base = "https://7daystodie-servers.com/api/";
      const params = new URLSearchParams({
        object: "votes",
        element: "claim",
        key: s.voting.apiKey,
        steamid: steam,
      });
      let res = await fetch(base + "?" + params, {
        signal: AbortSignal.timeout(12000),
      });
      let code = (await res.text()).trim();
      if (code !== "1") C.fail(code === "2" ? "voteClaimed" : "noVote");
      res = await fetch(base + "?action=post&" + params, {
        method: "POST",
        signal: AbortSignal.timeout(12000),
      });
      code = (await res.text()).trim();
      if (code !== "1") C.fail("voteClaimed");
      const p = this.wallet(s, t);
      p.votes.push({ at: new Date().toISOString(), status: "claimed" });
      await this.store.save();
      if (s.voting.bagId) return this.reward(id, t, s.voting.bagId, true);
      return true;
    });
  }
  async voters(id, period = "current", kind = "voters") {
    const s = this.server(id);
    if (!s.voting.apiKey) C.fail("votingRequired");
    const res = await fetch(
      "https://7daystodie-servers.com/api/?" +
        new URLSearchParams({
          object: "servers",
          element: kind === "votes" ? "votes" : "voters",
          key: s.voting.apiKey,
          month: period === "previous" ? "previous" : "current",
          format: "json",
          limit: "1000",
        }),
      { signal: AbortSignal.timeout(12000) },
    );
    if (!res.ok) C.fail("apiFailed");
    return res.json();
  }
  checkAreas(id, p) {
    const s = this.server(id),
      r = this.rt(id);
    r.playerAreas ??= {};
    const old = r.playerAreas[p.id] || new Set(),
      now = new Set(),
      pos = p.pos.split(",").map(Number);
    for (const a of s.areas || []) {
      const dest = a.position.split(",").map(Number);
      if (
        pos.every(Number.isFinite) &&
        dest.every(Number.isFinite) &&
        Math.hypot(...pos.map((v, i) => v - dest[i])) <= Number(a.radius)
      ) {
        now.add(a.id);
        if (!old.has(a.id))
          this.fire(id, "areaEntered", {
            ...p,
            player: p.id,
            area: a.name,
            text: a.name,
          });
      }
    }
    r.playerAreas[p.id] = now;
  }
  async checkHost(id, p) {
    const s = this.server(id);
    if (!s.security.blockedHosts?.trim() || !p.ip) return;
    const net = require("node:net"),
      list = new net.BlockList();
    for (const rule of s.security.blockedHosts
      .split(/[\s,]+/)
      .filter(Boolean)) {
      const [address, prefix] = rule.split("/"),
        family = net.isIP(address) === 6 ? "ipv6" : "ipv4";
      if (prefix !== undefined) list.addSubnet(address, Number(prefix), family);
      else list.addAddress(address, family);
    }
    if (
      net.isIP(p.ip) &&
      list.check(p.ip, net.isIP(p.ip) === 6 ? "ipv6" : "ipv4")
    ) {
      this.fire(id, "hostFailed", { ...p, player: p.id });
      await this.playerAction(id, "kick", p.id, { reason: "Blocked address" });
    }
  }
  async checkItems(id, p) {
    const s = this.server(id),
      banned = new Set(
        String(s.security.bannedItems || "")
          .split(/[\s,]+/)
          .filter(Boolean),
      );
    if (!banned.size) return;
    const data = await this.apiCall(
      s,
      "api/getplayerinventory?userid=" + encodeURIComponent(p.id),
    );
    const found = [];
    function scan(x) {
      if (!x || typeof x !== "object") return;
      if (
        (x.name || x.itemName) &&
        banned.has(x.name || x.itemName) &&
        Number(x.count ?? 1) > 0
      )
        found.push(x.name || x.itemName);
      for (const v of Object.values(x)) if (v && typeof v === "object") scan(v);
    }
    scan(data);
    if (found.length) {
      this.fire(id, "bannedItem", {
        ...p,
        player: p.id,
        item: found[0],
        text: found.join(","),
      });
      await this.playerAction(id, "kick", p.id, {
        reason: "Banned item: " + found[0],
      });
    }
  }
  async checkVac(id, p) {
    const s = this.server(id);
    if (
      !s.security.vacEnabled ||
      !s.security.steamApiKey ||
      !/^Steam_\d{17}$/.test(p.platformId)
    )
      return;
    const result = await fetch(
      "https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?" +
        new URLSearchParams({
          key: s.security.steamApiKey,
          steamids: p.platformId.slice(6),
        }),
      { signal: AbortSignal.timeout(10000) },
    );
    if (!result.ok) C.fail("apiFailed");
    const bans = (await result.json()).players?.[0];
    if (bans && bans.NumberOfVACBans > Number(s.security.maxVacBans)) {
      this.fire(id, "vacFailed", { player: p.id, name: p.name });
      await this.playerAction(id, "kick", p.id, { reason: "VAC" });
    }
  }
  async poll(id) {
    const s = this.server(id),
      r = this.rt(id);
    if (!r.client.ready || r.polling) return;
    r.polling = true;
    try {
      const output = await this.command(id, "lp");
      const players = C.parsePlayers(output);
      if (!/Total of \d+ in the game/i.test(output) && !players.length) return;
      const previous = r.players;
      r.players = players;
      for (const p of players) {
        const saved = this.wallet(s, p.id);
        saved.name = p.name;
        saved.lastSeen = new Date().toISOString();
        const old = previous.find((o) => o.id === p.id);
        this.checkAreas(id, p);
        if (!old) {
          if (s.economy.enabled)
            saved.currency += Number(s.economy.joinReward) || 0;
          this.fire(id, "joined", { ...p, player: p.id });
          this.checkVac(id, p).catch((e) => this.log(id, "error", e.message));
          this.checkHost(id, p).catch((e) => this.log(id, "error", e.message));
        } else {
          for (const [field, trigger] of [
            ["level", "level"],
            ["deaths", "death"],
            ["zombies", "killZombie"],
            ["kills", "killPlayer"],
          ])
            if (p[field] > old[field])
              this.fire(id, trigger, {
                ...p,
                player: p.id,
                delta: p[field] - old[field],
              });
        }
        if (s.economy.enabled && Date.now() - saved.lastMinuteReward >= 60000) {
          saved.currency += Number(s.economy.minuteReward) || 0;
          saved.lastMinuteReward = Date.now();
        }
        if (s.security.pingEnabled && p.ping !== null) {
          r.pingFails[p.id] =
            p.ping > Number(s.security.maxPing)
              ? (r.pingFails[p.id] || 0) + 1
              : 0;
          if (r.pingFails[p.id] >= Number(s.security.failures)) {
            this.fire(id, "pingFailed", { ...p, player: p.id });
            await this.playerAction(id, "kick", p.id, {
              reason: "Ping " + p.ping,
            });
            r.pingFails[p.id] = 0;
          }
        }
      }
      for (const p of previous.filter(
        (p) => !players.some((x) => x.id === p.id),
      )) {
        this.fire(id, "left", { ...p, player: p.id });
        delete r.pingFails[p.id];
        if (r.playerAreas) delete r.playerAreas[p.id];
      }
      if (
        s.security.bannedItemsEnabled &&
        Date.now() - (r.lastItemCheck || 0) > 60000
      ) {
        r.lastItemCheck = Date.now();
        for (const p of players)
          this.checkItems(id, p).catch((e) =>
            this.log(id, "error", e.code || e.message),
          );
      }
      const time = await this.command(id, "gt");
      r.metrics.gameTime = time.match(/Day\s+\d+[^\r\n]*/i)?.[0] || null;
      r.healthFailures = 0;
      this.fire(id, "playerList", {});
      await this.store.save();
      this.changed();
    } catch (e) {
      r.healthFailures++;
      this.log(id, "error", e.code || e.message);
    } finally {
      r.polling = false;
    }
  }
  async readLog(id) {
    const r = this.rt(id);
    if (!r.logFile) return;
    const st = await fs.stat(r.logFile).catch(() => null);
    if (!st || st.size <= r.logOffset) return;
    const h = await fs.open(r.logFile, "r");
    try {
      const size = Math.min(256 * 1024, st.size - r.logOffset),
        b = Buffer.alloc(size);
      const { bytesRead } = await h.read(b, 0, size, r.logOffset);
      r.logOffset += bytesRead;
      r.logTail += b.subarray(0, bytesRead).toString("utf8");
      let i;
      while ((i = r.logTail.indexOf("\n")) >= 0) {
        const l = r.logTail.slice(0, i).replace(/\r$/, "");
        r.logTail = r.logTail.slice(i + 1);
        if (l) {
          this.log(id, "file", l);
          if (!r.client.ready) this.handleLine(id, l);
          if (
            /GameServer.Init successful|StartGame done|GameServer initialization complete/i.test(
              l,
            )
          ) {
            r.status = "running";
            this.changed();
          }
        }
      }
    } finally {
      await h.close();
    }
  }
  async tick() {
    if (this.tickBusy) return;
    this.tickBusy = true;
    try {
      if (Date.now() - (this.lastMonitor || 0) > 15000 && !this.monitorBusy) {
        this.monitorBusy = true;
        this.lastMonitor = Date.now();
        this.monitor()
          .catch((e) => this.log(null, "error", e.message))
          .finally(() => (this.monitorBusy = false));
      }
      for (const s of this.state.servers) {
        const id = s.id,
          r = this.rt(id);
        this.fire(id, "timer", {});
        if (
          s.discord.enabled &&
          !r.discord &&
          !r.discordConnecting &&
          Date.now() - (r.lastDiscordAttempt || 0) > 60000
        ) {
          r.discordConnecting = true;
          r.lastDiscordAttempt = Date.now();
          this.connectDiscord(id)
            .catch((e) => this.log(id, "error", e.code || e.message))
            .finally(() => (r.discordConnecting = false));
        }
        if (r.child) await this.readLog(id);
        if (
          s.autoConnect &&
          !r.manualDisconnect &&
          !r.connecting &&
          !r.client.ready &&
          (r.child || s.mode === "remote") &&
          Date.now() - r.lastConnect > 15000
        )
          this.connect(id).catch((e) => {
            r.healthFailures++;
            this.log(id, "error", e.code || e.message);
          });
        if (r.client.ready && Date.now() - (r.lastPoll || 0) > 15000) {
          r.lastPoll = Date.now();
          this.poll(id).catch((e) =>
            this.log(id, "error", e.code || e.message),
          );
        }
        if (r.restartAt && r.restartAt <= Date.now() && !r.busy) {
          r.restartAt = null;
          this.start(id).catch((e) =>
            this.log(id, "error", e.code || e.message),
          );
        }
        if (r.countdown) {
          const c = r.countdown,
            left = Math.max(0, Math.ceil((c.at - Date.now()) / 1000));
          if (left !== c.last) {
            c.last = left;
            this.fire(id, "shutdownSecond", { seconds: left });
            if (left % 60 === 0)
              this.fire(id, "shutdownMinute", { minutes: left / 60 });
            if (left % 60 === 0 || left === 30 || left <= 10)
              await this.command(
                id,
                "say " + C.quote(`${c.message} [${left}s]`),
              ).catch((e) => this.log(id, "error", e.code || e.message));
          }
          if (left === 0 && !r.busy) {
            this.fire(id, "shutdownNow", {});
            r.countdown = null;
            this.work(id, "restart", async () => {
              await this.stopInternal(id);
              if (c.restart) {
                await this.startInternal(id);
                this.fire(id, "serverRestart", {});
              }
            }).catch((e) => this.log(id, "error", e.code || e.message));
          }
        }
        for (const job of s.schedules.filter(
          (j) => j.enabled && j.nextAt <= Date.now(),
        )) {
          if (r.busy || r.countdown) continue;
          job.nextAt =
            job.repeat === "once" ? Number.MAX_SAFE_INTEGER : this.nextDue(job);
          if (job.repeat === "once") job.enabled = false;
          job.lastRun = new Date().toISOString();
          await this.store.save();
          this.runJob(id, job).then(
            () => {
              job.result = "ok";
              return this.store.save();
            },
            (e) => {
              job.result = e.code || e.message;
              this.log(id, "error", job.name + ": " + job.result);
              return this.store.save();
            },
          );
        }
        if (
          s.backup.enabled &&
          s.mode === "local" &&
          !r.busy &&
          !r.countdown &&
          Date.now() - r.lastAutoBackup >=
            Number(s.backup.intervalMinutes) * 60000
        ) {
          r.lastAutoBackup = Date.now();
          this.work(id, "backup", async () => {
            const wasRunning = !!r.child;
            if (wasRunning) await this.stopInternal(id);
            try {
              await this.backupInternal(id);
            } finally {
              if (wasRunning) await this.startInternal(id);
            }
          }).catch((e) => this.log(id, "error", e.code || e.message));
        }
      }
    } finally {
      this.tickBusy = false;
    }
  }
  async runJob(id, j) {
    switch (j.action) {
      case "command":
        return this.command(id, j.command);
      case "restart":
        if (this.server(id).health?.avoidBloodMoon && this.rt(id).bloodMoon) {
          this.log(id, "process", "bloodmoon · restart deferred");
          j.nextAt = Date.now() + 60000;
          return;
        }
        return this.countdown(id, {
          seconds: Number(j.seconds) || 60,
          restart: true,
          message: j.message || "",
        });
      case "stop":
        return this.countdown(id, {
          seconds: Number(j.seconds) || 60,
          message: j.message || "",
        });
      case "backup":
        return this.work(id, "backup", async () => {
          const wasRunning = !!this.rt(id).child;
          if (wasRunning) await this.stopInternal(id);
          try {
            return await this.backupInternal(id);
          } finally {
            if (wasRunning) await this.startInternal(id);
          }
        });
      case "start":
        return this.start(id);
      case "event":
        return this.executeActions(id, j.command);
    }
  }
  async dispose() {
    clearInterval(this.timer);
    for (const [id, r] of this.runtime) {
      r.client.close();
      r.discord?.destroy();
    }
    await this.logQueue;
  }
}
module.exports = { Manager };

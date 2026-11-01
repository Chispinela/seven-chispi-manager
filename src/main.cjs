const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  Tray,
  Menu,
  nativeImage,
  safeStorage,
  Notification,
} = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { Store, AppError, fail, atomic, exists } = require("./core.cjs");
const { Manager } = require("./manager.cjs");
app.setName("Seven Chispi Manager");
const root = process.env.SEVEN_DATA_DIR || app.getPath("userData");
let window,
  tray,
  manager,
  quitting = false;
const localeBox = { window: {} };
require("node:vm").runInNewContext(
  require("node:fs").readFileSync(
    path.join(__dirname, "../ui/i18n.js"),
    "utf8",
  ),
  localeBox,
);
const tr = (key) =>
  localeBox.window.I18N[manager?.state.settings.language || "es"]?.[key] || key;
function updateTray() {
  if (!tray) return;
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Seven Chispi Manager", click: () => window.show() },
      { type: "separator" },
      {
        label: tr("exit"),
        click: async () => {
          window.show();
          const active = [...manager.runtime.values()].some(
            (r) => r.child || r.busy || r.countdown,
          );
          if (active) {
            await dialog.showMessageBox(window, {
              type: "info",
              message: tr("exitStop"),
            });
            return;
          }
          quitting = true;
          await manager.dispose();
          app.quit();
        },
      },
    ]),
  );
}
const secretKey = (k) => /password|token$|apiKey|steamApiKey/i.test(k);
function transform(obj, encode, key = "") {
  if (typeof obj === "string" && secretKey(key) && obj) {
    if (encode) {
      if (obj.startsWith("dpapi:")) return obj;
      if (!safeStorage.isEncryptionAvailable()) fail("encryptionUnavailable");
      return "dpapi:" + safeStorage.encryptString(obj).toString("base64");
    }
    if (obj.startsWith("dpapi:"))
      return safeStorage.decryptString(Buffer.from(obj.slice(6), "base64"));
    return obj;
  }
  if (Array.isArray(obj)) return obj.map((x) => transform(x, encode));
  if (obj && typeof obj === "object")
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, transform(v, encode, k)]),
    );
  return obj;
}
const send = (channel, data) => {
  if (window && !window.isDestroyed()) window.webContents.send(channel, data);
};
async function choose(options) {
  const result = await dialog.showOpenDialog(window, options);
  return result.canceled ? null : result.filePaths[0];
}
async function dispatch(action, args = {}) {
  const id = args.id;
  switch (action) {
    case "snapshot":
      return manager.snapshot();
    case "defaults":
      return require("./core.cjs").defaultServer(
        root,
        manager.state.servers.length,
      );
    case "newServer":
      return manager.newServer(args.server);
    case "saveServer":
      return manager.saveServer(args.server);
    case "removeServer":
      return manager.removeServer(id, {
        deleteFiles: args.deleteFiles === true,
      });
    case "start":
      return manager.start(id);
    case "stop":
      return manager.stop(id, !!args.force);
    case "connect":
      manager.rt(id).manualDisconnect = false;
      return manager.connect(id);
    case "disconnect":
      return manager.disconnect(id);
    case "countdown":
      return manager.countdown(id, args.options);
    case "cancelCountdown":
      return manager.cancelCountdown(id);
    case "command":
      return manager.command(id, args.command);
    case "playerAction":
      return manager.playerAction(id, args.action, args.player, args.options);
    case "configInfo":
      return manager.configInfo(id);
    case "writeConfig": {
      const s = manager.server(id);
      if (manager.rt(id).child) fail("stopFirst");
      return manager.writeConfig(s);
    }
    case "importConfig": {
      const file = await choose({
        filters: [{ name: "XML", extensions: ["xml"] }],
        properties: ["openFile"],
      });
      if (!file) return null;
      return manager.importConfig(id, await fs.readFile(file, "utf8"));
    }
    case "exportConfig": {
      const s = manager.server(id),
        file = await dialog.showSaveDialog(window, {
          defaultPath: "serverconfig.xml",
          filters: [{ name: "XML", extensions: ["xml"] }],
        });
      if (file.canceled) return;
      await atomic(file.filePath, require("./core.cjs").buildConfig(s.config));
      return file.filePath;
    }
    case "refreshBranches":
      return manager.refreshBranches();
    case "install":
      return manager.install(id);
    case "mods":
      return manager.mods(id);
    case "importMod": {
      const source = await choose({
        properties: args.folder ? ["openDirectory"] : ["openFile"],
        filters: [{ name: "ZIP", extensions: ["zip"] }],
      });
      if (!source) return null;
      return manager.importMod(id, source);
    }
    case "toggleMod":
      return manager.toggleMod(id, args.name, args.enabled);
    case "backups":
      return manager.backups(id);
    case "backup":
      return manager.backup(id);
    case "restore":
      return manager.restore(id, args.name);
    case "saveCollection":
      return manager.saveCollection(id, args.key, args.list);
    case "adjustWallet":
      return manager.adjustWallet(id, args.player, Number(args.amount));
    case "reward":
      return manager.reward(id, args.player, args.bagId);
    case "teleport":
      return manager.teleport(id, args.player, args.destination);
    case "claimVote":
      return manager.claimVote(id, args.player);
    case "voters":
      return manager.voters(
        id,
        args.period || "current",
        args.kind || "voters",
      );
    case "applyGroup":
      return manager.applyGroup(id, args.groupId);
    case "transfer":
      return manager.transfer(id, args.from, args.to, Number(args.amount));
    case "inventory":
      return manager.inventory(id, args.player);
    case "connectDiscord":
      return manager.connectDiscord(id);
    case "disconnectDiscord":
      return manager.disconnectDiscord(id);
    case "discordSay":
      return manager.discordSay(id, args.text);
    case "logs":
      return manager.rt(id).lines;
    case "chat":
      return manager.rt(id).chat;
    case "reprocess": {
      const r = manager.rt(id);
      r.players = [];
      return manager.poll(id);
    }
    case "catalog":
      return manager.worker({
        op: "catalog",
        dir: manager.server(id).directory,
      });
    case "pickDirectory":
      return choose({ properties: ["openDirectory", "createDirectory"] });
    case "pickSteamcmd":
      return choose({
        properties: ["openFile"],
        filters: [{ name: "SteamCMD", extensions: ["exe"] }],
      });
    case "pickProgram":
      return choose({
        properties: ["openFile"],
        filters: [{ name: "Windows", extensions: ["exe"] }],
      });
    case "settings": {
      const settings = args.settings;
      if (
        !["es", "en", "pt", "zh", "ja", "ru"].includes(settings.language) ||
        !["dark", "light"].includes(settings.theme)
      )
        fail("invalidData");
      manager.state.settings = {
        ...manager.state.settings,
        language: settings.language,
        theme: settings.theme,
        minimizeToTray: !!settings.minimizeToTray,
        steamcmd: String(settings.steamcmd || ""),
      };
      await manager.store.save();
      manager.changed();
      updateTray();
      return true;
    }
    case "openFolder": {
      let folder;
      if (id) {
        const s = manager.server(id);
        const allowed = {
          server: s.directory,
          mods: path.join(s.directory, "Mods"),
          userdata: path.join(s.directory, "userdata"),
          logs: path.join(s.directory, "logs"),
          backups: manager.backupsDir(s),
        };
        folder = allowed[args.kind];
      } else folder = root;
      if (!folder) fail("invalidPath");
      await fs.mkdir(folder, { recursive: true });
      const error = await shell.openPath(folder);
      if (error) fail("operationFailed", error);
      return true;
    }
    case "openMap": {
      const s = manager.server(id);
      const raw =
        s.config.WebDashboardUrl ||
        s.api.baseUrl ||
        `http://${s.host}:${s.config.WebDashboardPort}/`;
      const url = new URL(raw);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password
      )
        fail("invalidUrl");
      await shell.openExternal(url.href);
      return true;
    }
    case "openVote": {
      const s = manager.server(id);
      const url = new URL(s.voting.url);
      if (url.protocol !== "https:" || url.username || url.password)
        fail("invalidUrl");
      await shell.openExternal(url.href);
      return true;
    }
    case "exportLogs": {
      const result = await dialog.showSaveDialog(window, {
        defaultPath: "seven-diagnostics.txt",
        filters: [{ name: "Text", extensions: ["txt"] }],
      });
      if (result.canceled) return;
      const r = manager.rt(id);
      const secrets = Object.values(manager.server(id).config).filter(
        (v) => typeof v === "string" && v.length > 6,
      );
      let text = r.lines.map((l) => `${l.at} [${l.kind}] ${l.text}`).join("\n");
      for (const [k, v] of Object.entries(manager.server(id).config))
        if (secretKey(k) && v) text = text.replaceAll(v, "***");
      await atomic(result.filePath, text);
      return result.filePath;
    }
    case "exportCollection": {
      if (
        ![
          "events",
          "schedules",
          "groups",
          "bags",
          "teleports",
          "areas",
        ].includes(args.key)
      )
        fail("invalidData");
      const result = await dialog.showSaveDialog(window, {
        defaultPath: args.key + ".json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (result.canceled) return;
      await atomic(
        result.filePath,
        JSON.stringify(manager.server(id)[args.key], null, 2),
      );
      return true;
    }
    case "importCollection": {
      const file = await choose({
        properties: ["openFile"],
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (!file) return null;
      const st = await fs.stat(file);
      if (st.size > 2 * 1024 * 1024) fail("invalidData");
      const items = JSON.parse(await fs.readFile(file, "utf8"));
      return manager.saveCollection(id, args.key, items);
    }
    case "window":
      if (args.command === "minimize") window.minimize();
      else if (args.command === "maximize")
        window.isMaximized() ? window.unmaximize() : window.maximize();
      else if (args.command === "close") window.close();
      return;
    default:
      fail("invalidAction");
  }
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => {
    window?.show();
    window?.focus();
  });
  app.whenReady().then(async () => {
    try {
      const store = new Store(root, {
        encode: (x) => transform(x, true),
        decode: (x) => transform(x, false),
      });
      store.protectedPaths = [
        "home",
        "desktop",
        "documents",
        "downloads",
        "pictures",
        "music",
        "videos",
        "appData",
        "userData",
      ].map((key) => app.getPath(key));
      manager = new Manager(store);
      await manager.init();
      if (!store.state.branches.length) {
        const cached = require("../assets/branches.json");
        store.state.branches = cached.branches;
        store.state.branchesAt = cached.at;
      }
      ipcMain.handle("seven:call", async (event, action, args) => {
        if (
          event.sender !== window.webContents ||
          event.senderFrame !== window.webContents.mainFrame
        )
          return { ok: false, error: { code: "invalidAction" } };
        try {
          return { ok: true, value: await dispatch(action, args) };
        } catch (e) {
          manager.log(
            args?.id || null,
            "error",
            (e.code || "operationFailed") + ": " + e.message,
          );
          return {
            ok: false,
            error: {
              code: e instanceof AppError ? e.code : "operationFailed",
              detail: e.detail || e.message,
            },
          };
        }
      });
      window = new BrowserWindow({
        width: 1420,
        height: 940,
        minWidth: 1080,
        minHeight: 700,
        title: "Seven Chispi Manager",
        icon: path.join(__dirname, "../assets/icon.ico"),
        frame: false,
        backgroundColor: "#100d19",
        show: false,
        webPreferences: {
          preload: path.join(__dirname, "preload.cjs"),
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
          webSecurity: true,
        },
      });
      window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
      window.webContents.on("will-navigate", (e, url) => {
        if (url !== window.webContents.getURL()) e.preventDefault();
      });
      manager.on("change", (s) => send("seven:change", s));
      manager.on("log", (s) => send("seven:log", s));
      manager.on("chat", (s) => send("seven:chat", s));
      manager.on("notification", (data) => {
        if (Notification.isSupported()) new Notification(data).show();
      });
      window.once("ready-to-show", () => window.show());
      window.on("close", (e) => {
        if (quitting) return;
        const running = [...manager.runtime.values()].some(
          (r) => r.child || r.busy || r.countdown,
        );
        if (running || manager.state.settings.minimizeToTray) {
          e.preventDefault();
          window.hide();
        }
      });
      const icon = nativeImage.createFromPath(
        path.join(__dirname, "../assets/icon.ico"),
      );
      tray = new Tray(icon);
      tray.setToolTip("Seven Chispi Manager");
      tray.on("double-click", () => window.show());
      updateTray();
      await window.loadFile(path.join(__dirname, "../ui/index.html"));
      window.show();
    } catch (e) {
      dialog.showErrorBox(
        "Seven Chispi Manager",
        e.code ? e.code + "\n" + e.message : e.stack,
      );
      app.quit();
    }
  });
  app.on("window-all-closed", () => {
    if (quitting) app.quit();
  });
  app.on("before-quit", () => {
    if (manager) manager.dispose();
  });
}

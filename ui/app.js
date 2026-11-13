const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const shapes = {
  overview:
    '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  servers:
    '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6"/>',
  config:
    '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  console:
    '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m6 9 3 3-3 3M12 15h5"/>',
  players:
    '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2"/>',
  mods: '<path d="M4 4h5a3 3 0 1 1 6 0h5v5a3 3 0 1 0 0 6v5h-5a3 3 0 1 0-6 0H4v-5a3 3 0 1 1 0-6z"/>',
  backups: '<path d="M3 7h18v14H3zM1 3h22v4H1zM9 11h6M12 11v6m-3-3 3 3 3-3"/>',
  events: '<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
  schedules:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 11h18M8 15h2M14 15h2"/>',
  groups: '<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6zM8 12l3 3 5-6"/>',
  rewards:
    '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v10h14V12M12 8v14M12 8C3 8 5 0 9 3zM12 8c9 0 7-8 3-5z"/>',
  teleports:
    '<path d="m12 2 8 5v10l-8 5-8-5V7zM4 7l8 5 8-5M12 12v10M8 10l8-5"/>',
  voting: '<path d="m8 11 3 3 5-7M5 8H3v13h18V8h-2M6 2h12v14H6z"/>',
  map: '<path d="m2 6 7-4 6 4 7-4v16l-7 4-6-4-7 4zM9 2v16M15 6v16"/>',
  chat: '<path d="M21 11a8 8 0 0 1-8 8H5l-4 3V11a10 10 0 0 1 20 0zM6 10h10M6 14h6"/>',
  inventory:
    '<rect x="4" y="7" width="16" height="15" rx="2"/><path d="M8 7V5a4 4 0 0 1 8 0v2M8 13h8M8 17h8"/>',
  integrations: '<path d="M9 5V2M15 5V2M6 5h12v5a6 6 0 0 1-12 0zM12 16v6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  play: '<path d="m8 4 12 8-12 8z"/>',
  stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  refresh:
    '<path d="M20 7v5h-5M4 17v-5h5M5 7a8 8 0 0 1 13-2l2 3M4 16l2 3a8 8 0 0 0 13-2"/>',
  moon: '<path d="M20 14a9 9 0 0 1-10-10 9 9 0 1 0 10 10z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2M12 21v2M1 12h2M21 12h2M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  folder: '<path d="M2 6V4h7l3 3h10v14H2z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  trash: '<path d="M3 6h18M6 6l1 16h10l1-16M9 6V2h6v4M10 10v8M14 10v8"/>',
  edit: '<path d="m15 3 6 6M3 21l5-1L21 7l-4-4L4 16z"/>',
  download: '<path d="M12 2v13m-5-5 5 5 5-5M3 16v6h18v-6"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  wallet: '<path d="M3 5h17v16H3zM3 5V2h14v3M20 10h-6v6h6M16 13h.01"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
};
const icon = (k) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${shapes[k] || shapes.config}</svg>`;
const button = (key, action, cls = "", attrs = "") =>
  `<button type="button" class="${cls}" data-action="${action}" ${attrs}>${t(key)}</button>`;
const ibutton = (key, action, ico, cls = "", attrs = "") =>
  `<button type="button" class="${cls}" data-action="${action}" ${attrs}>${icon(ico)}${t(key)}</button>`;
const field = (name, key, value = "", type = "text", full = false, help = "") =>
  `<div class="form-field ${full ? "full" : ""}"><label for="f-${esc(name)}">${t(key)}</label><input id="f-${esc(name)}" name="${esc(name)}" type="${type}" value="${esc(value)}" ${type === "number" ? 'step="any"' : ""}>${help ? `<p class="help">${t(help)}</p>` : ""}</div>`;
const area = (name, key, value = "", full = true) =>
  `<div class="form-field ${full ? "full" : ""}"><label for="f-${esc(name)}">${t(key)}</label><textarea id="f-${esc(name)}" name="${esc(name)}">${esc(value)}</textarea></div>`;
const check = (name, key, value = false) =>
  `<label class="check"><input name="${esc(name)}" type="checkbox" ${value ? "checked" : ""}>${t(key)}</label>`;
const select = (name, key, options, value = "", full = false) =>
  `<div class="form-field ${full ? "full" : ""}"><label for="f-${esc(name)}">${t(key)}</label><select id="f-${esc(name)}" name="${esc(name)}">${options
    .map((o) => {
      const [v, l] = Array.isArray(o) ? o : [o, t(o)];
      return `<option value="${esc(v)}" ${v === value ? "selected" : ""}>${esc(l)}</option>`;
    })
    .join("")}</select></div>`;
const notice = (key) =>
  `<div class="notice">${icon("info")}<span>${t(key)}</span></div>`;
const collect = (form) => {
  const out = Object.fromEntries(new FormData(form));
  form
    .querySelectorAll("input[type=checkbox]")
    .forEach((x) => (out[x.name] = x.checked));
  return out;
};
let state = {
    servers: [],
    runtime: {},
    settings: { language: "es", theme: "dark" },
    branches: [],
  },
  selected = null,
  page = "overview",
  tab = "basics",
  logs = {},
  chats = {},
  draftDirty = false,
  renderId = 0,
  pauseScroll = false,
  filterKind = "all",
  filterText = "",
  modalSave = null,
  modalCtx = null,
  history = [],
  historyAt = 0;
let transient = {};
const collectionKey = () =>
  page === "teleports" && transient.areas ? "areas" : page;
function updateButton(server, runtime, small = false) {
  if (server.mode !== "local") return "";
  const disabled =
    runtime.busy ||
    runtime.connected ||
    runtime.countdown ||
    ["running", "starting", "stopping"].includes(runtime.status);
  return ibutton(
    "install",
    "install",
    "download",
    small ? "small ghost" : "",
    `data-id="${esc(server.id)}" ${disabled ? 'disabled title="' + esc(t("stopFirst")) + '"' : ""}`,
  );
}

const deleteButton = (serverId, rt, compact = false) => {
  const blocked =
    !!rt.busy ||
    !!rt.connected ||
    ["running", "starting", "stopping"].includes(rt.status);
  return `<button type="button" class="danger ${compact ? "small icon-only" : "ghost"}" data-action="removeServer" data-id="${esc(serverId)}" aria-label="${t("deleteServer")}" title="${t(blocked ? "stopFirst" : "deleteServer")}" ${blocked ? "disabled" : ""}>${icon("trash")}${compact ? "" : t("deleteServer")}</button>`;
};
const current = () => state.servers.find((s) => s.id === selected),
  runtime = () => state.runtime[selected] || {};
async function api(action, args = {}, silent = false) {
  const out = await window.seven.call(action, args);
  if (!out.ok) {
    const e = out.error;
    let msg = window.I18N[currentLanguage]?.[e.code] || t("error");
    if (
      e.detail &&
      e.detail !== e.code &&
      !["notConnected", "busy", "stopFirst", "branchUnavailable"].includes(
        e.code,
      )
    )
      msg += "\n" + e.detail.slice(-900);
    if (!silent) toast(msg, true);
    const err = new Error(msg);
    err.code = e.code;
    throw err;
  }
  return out.value;
}
let toastTimer;
function toast(msg, error = false) {
  $("#toast").textContent = msg;
  $("#toast").className = "visible" + (error ? " error" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(
    () => ($("#toast").className = ""),
    error ? 11000 : 3800,
  );
}
function statusBadge(r) {
  return `<span class="badge ${r.status === "running" ? "on" : ""}"><i class="status-dot ${r.status === "running" ? "on" : r.status === "starting" ? "starting" : ""}"></i>${t(r.status || "stopped")}</span>`;
}
function empty(key = "emptyList", ico = "servers", body = "", action = "") {
  return `<div class="empty compact"><div class="empty-icon">${icon(ico)}</div><h2>${t(key)}</h2>${body ? `<p>${t(body)}</p>` : ""}${action}</div>`;
}
function pageHead(key, help = "", actions = "") {
  return `<div class="page-head"><div><h1>${t(key)}</h1>${help ? `<p>${t(help)}</p>` : ""}</div><div class="toolbar">${actions}</div></div>`;
}
function formSave() {
  return `<div class="settings-footer"><button class="primary" type="submit">${icon("check")}${t("save")}</button></div>`;
}
function stat(label, value, ico, sub = "", text = false) {
  return `<div class="stat"><span class="stat-icon">${icon(ico)}</span><small>${t(label)}</small><strong class="${text ? "text" : ""}">${esc(value)}</strong>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}</div>`;
}
function layout() {
  window.currentLanguage = state.settings.language;
  document.documentElement.lang = currentLanguage;
  document.body.classList.toggle("light", state.settings.theme === "light");
  $("#language").value = currentLanguage;
  $("#server-switch").innerHTML =
    `<option value="">${t("servers")}</option>` +
    state.servers
      .map((s) => `<option value="${s.id}">${esc(s.name)}</option>`)
      .join("");
  $("#server-switch").hidden = !state.servers.length;
  $("#server-switch").value = selected || "";
  $$("[data-t]").forEach((e) => (e.textContent = t(e.dataset.t)));
  $("#loading-text").textContent = t("loading");
  $("#local-badge").innerHTML =
    `<i class="status-dot on"></i> ${t("local").toUpperCase()}`;
  $("#add-top").innerHTML = icon("plus") + t("newServer");
  $("#theme-toggle").innerHTML =
    icon(state.settings.theme === "dark" ? "sun" : "moon") +
    t(state.settings.theme === "dark" ? "light" : "dark");
  $("#preferences-btn").innerHTML = icon("config") + t("preferences");
  $("#footer-info").textContent =
    `${state.servers.length} ${t("total").toLowerCase()} · ${state.servers.filter((s) => state.runtime[s.id]?.status === "running").length} ${t("online").toLowerCase()}`;
  const items = [
    ["overview", "overview"],
    ["dashboard", "servers"],
    ["config", "config"],
    ["console", "console"],
    ["players", "players"],
    ["chat", "chat"],
    ["mods", "mods"],
    ["backups", "backups"],
    ["automation", null],
    ["events", "events"],
    ["schedules", "schedules"],
    ["community", null],
    ["groups", "groups"],
    ["teleports", "teleports"],
    ["inventory", "inventory"],
    ["map", "map"],
    ["integrations", "integrations"],
  ];
  $("#nav").innerHTML = items
    .filter(([k]) => selected || ["overview"].includes(k))
    .map(([key, ico]) =>
      ico
        ? `<button data-nav="${key}" class="${page === key ? "selected" : ""}">${icon(ico)}${t(key)}</button>`
        : `<div class="nav-group">${t(key).toUpperCase()}</div>`,
    )
    .join("");
  $("#server-list").innerHTML = state.servers.length
    ? `<div class="side-label">${t("servers").toUpperCase()}</div>` +
      state.servers
        .map(
          (s) =>
            `<button class="server-chip ${s.id === selected ? "active" : ""}" data-server="${s.id}"><i class="status-dot ${state.runtime[s.id]?.status === "running" ? "on" : ""}"></i><span>${esc(s.name)}</span></button>`,
        )
        .join("")
    : "";
  $("#breadcrumb").innerHTML =
    `${icon("overview")}<span>Seven Chispi</span><span>/</span><b>${page === "overview" ? t("overview") : page === "preferences" ? t("preferences") : esc(current()?.name || "")}</b>${!["overview", "preferences", "dashboard"].includes(page) ? `<span>/</span><span>${t(page)}</span>` : ""}`;
}
async function canLeave() {
  if (draftDirty) {
    const ok = await confirm(t("notice"), t("unsaved"));
    if (!ok) return false;
    draftDirty = false;
  }
  return true;
}
async function navigate(next, id = selected) {
  if (!(await canLeave())) return;
  selected = id;
  page = next;
  tab = "basics";
  transient = {};
  await render();
}
async function render() {
  const token = ++renderId;
  layout();
  const s = current(),
    r = runtime();
  if (!s && !["overview", "preferences"].includes(page)) {
    page = "overview";
    layout();
  }
  const content = $("#content");
  let html = "";
  if (page === "overview") {
    html = `<section class="hero with-logo"><div class="eyebrow">7 DAYS TO DIE · SERVER CONTROL</div><h1>${t("welcome")}</h1><p>${t("welcomeSub")}</p>${ibutton("newServer", "newServer", "plus", "primary")}<img src="../assets/logo.png" alt="Seven"></section><div class="stats">${stat("total", state.servers.length, "servers")}${stat("online", state.servers.filter((s) => state.runtime[s.id]?.status === "running").length, "play")}${stat(
      "players",
      Object.values(state.runtime).reduce(
        (n, r) => n + (r.players?.length || 0),
        0,
      ),
      "players",
    )}${stat("local", state.servers.filter((s) => s.mode === "local").length, "folder", t("servers"), false)}</div><div class="section-head"><h2>${t("yourServers")}</h2><small>7 DAYS TO DIE</small></div>`;
    if (!state.servers.length)
      html +=
        empty(
          "emptyTitle",
          "servers",
          "emptyText",
          ibutton("newServer", "newServer", "plus", "primary"),
        ) +
        `<div class="onboarding-steps"><div><b>01</b><h3>${t("newServer")}</h3><p>${t("emptyText")}</p></div><div><b>02</b><h3>${t("install")}</h3><p>${t("clientVersion")}</p></div><div><b>03</b><h3>${t("start")}</h3><p>${t("welcomeSub")}</p></div></div>`;
    else
      html += `<div class="server-grid">${state.servers
        .map((s) => {
          const rt = state.runtime[s.id] || {};
          return `<article class="server-card"><div class="card-banner">${icon("servers")}${statusBadge(rt)}</div><div class="card-body"><h3>${esc(s.name)}</h3><div class="branch">${esc(s.branch)} · ${t(s.mode).toUpperCase()}</div><div class="server-facts"><div><small>${t("world")}</small><span>${esc(s.config.GameWorld)}</span></div><div><small>${t("players")}</small><span>${rt.players?.length || 0} / ${esc(s.config.ServerMaxPlayerCount)}</span></div><div><small>${t("gamePort")}</small><span>${esc(s.config.ServerPort)}</span></div><div><small>${t("console")}</small><span>${t(rt.connected ? "connected" : "disconnected")}</span></div></div></div><div class="card-footer"><button data-open="${s.id}" class="ghost small">${t("manage")}${icon("arrow")}</button><button class="primary small" data-action="${["running", "starting", "stopping"].includes(rt.status) ? "serverStop" : "serverStart"}" data-id="${s.id}" ${rt.busy ? "disabled" : ""}>${icon(["running", "starting", "stopping"].includes(rt.status) ? "stop" : "play")}${t(["running", "starting", "stopping"].includes(rt.status) ? "stop" : "start")}</button>${updateButton(s, rt, true)}${deleteButton(s.id, rt, true)}</div></article>`;
        })
        .join("")}</div>`;
  } else if (page === "dashboard") {
    const elapsed = r.startedAt
      ? Math.floor((Date.now() - Date.parse(r.startedAt)) / 60000) +
        " " +
        t("minutes")
      : "—";
    html = `<div class="page-head"><div><div class="toolbar" style="margin-bottom:10px">${statusBadge(r)}<span class="badge purple">${esc(s.branch)}</span></div><h1>${esc(s.name)}</h1><p>${esc(s.config.GameWorld)} · ${esc(s.host)}:${esc(s.config.ServerPort)} · ${t(s.mode)}</p></div><div class="toolbar">${ibutton(["running", "starting", "stopping"].includes(r.status) ? "stop" : "start", ["running", "starting", "stopping"].includes(r.status) ? "serverStop" : "serverStart", ["running", "starting", "stopping"].includes(r.status) ? "stop" : "play", "primary")}${ibutton("restart", "restart", "refresh")}${deleteButton(s.id, r)}</div></div>${r.busy ? `<div class="busy-bar"><i class="spinner"></i>${t(r.busy === "install" ? "install" : r.busy === "backup" ? "backups" : r.busy === "mod" ? "mods" : r.busy === "removeServer" ? "deleteServer" : r.busy)}</div>` : ""}${r.countdown ? `<div class="busy-bar">${icon("clock")}${t("countdown")} · ${new Date(r.countdown).toLocaleTimeString()}${button("cancelCountdown", "cancelCountdown", "small")}</div>` : ""}<div class="stats">${stat("players", (r.players?.length || 0) + " / " + s.config.ServerMaxPlayerCount, "players", "", true)}${stat("uptime", elapsed, "clock", "", true)}${stat("memory", r.metrics?.ramMb != null ? r.metrics.ramMb + " MB" : "—", "servers", "", true)}${stat("cpu", r.metrics?.cpu != null ? r.metrics.cpu + " %" : "—", "events", "", true)}</div><div class="two-col"><section class="panel"><h2>${t("activity")}</h2><div id="activity" class="activity-list">${activityHtml()}</div></section><section><div class="panel"><h2>${t("quickActions")}</h2><div class="action-grid">${ibutton("config", "goConfig", "config")}${ibutton("console", "goConsole", "console")}${ibutton("mods", "goMods", "mods")}${ibutton("backupNow", "backup", "backups")}${ibutton(r.connected ? "disconnect" : "connect", r.connected ? "disconnect" : "connect", "integrations")}${ibutton("copyAddress", "copyAddress", "copy")}${ibutton("openFolder", "openFolder", "folder")}${updateButton(s, r)}</div></div><div class="panel"><h2>${t("config")}</h2><div class="readonly-row"><span>${t("gameTime")}</span><b>${esc(r.metrics?.gameTime || "—")}</b></div><div class="readonly-row"><span>${t("console")}</span><b>${t(r.connected ? "connected" : "disconnected")}</b></div><div class="readonly-row"><span>${t("version")}</span><b>${esc(s.branch)}</b></div><div class="readonly-row"><span>${t("worldName")}</span><b>${esc(s.config.GameName)}</b></div><div class="readonly-row"><span>${t("maxPlayers")}</span><b>${esc(s.config.ServerMaxPlayerCount)}</b></div><div class="readonly-row"><span>${t("telnetPort")}</span><b>${esc(s.config.TelnetPort)}</b></div></div></section></div>`;
  } else if (page === "config") {
    html =
      pageHead(
        "config",
        "",
        ibutton("import", "importConfig", "download") +
          ibutton("export", "exportConfig", "download"),
      ) +
      `<div class="tabs">${["basics", "advanced", "security", "health"].map((k) => `<button class="${tab === k ? "active" : ""}" data-tab="${k}">${t(k)}</button>`).join("")}</div><div id="config-body"><i class="spinner"></i></div>`;
  } else if (page === "console") {
    html =
      pageHead(
        "console",
        "consoleHelp",
        ibutton(
          r.connected ? "disconnect" : "connect",
          r.connected ? "disconnect" : "connect",
          "integrations",
        ) + ibutton("export", "exportLogs", "download"),
      ) +
      `<div class="console-box"><div class="console-tools"><input id="log-search" placeholder="${t("search")}" value="${esc(filterText)}"><select id="log-kind">${["all", "console", "file", "command", "steam", "error"].map((x) => `<option value="${x}" ${x === filterKind ? "selected" : ""}>${t(x)}</option>`).join("")}</select>${button("clear", "clearLogs", "small")}${button(pauseScroll ? "resume" : "pause", "pauseLogs", "small")}</div><div id="console-output" class="console-output"></div><form class="console-input" id="command-form"><input id="command-input" name="command" autocomplete="off" spellcheck="false" placeholder="help"><button type="submit" class="primary">${icon("arrow")}${t("send")}</button></form></div><div class="toolbar" style="margin-top:14px">${["help", "lp", "gt", "mem", "saveworld", "version"].map((c) => `<button class="small ghost" data-quick="${c}">${esc(c)}</button>`).join("")}${button("refresh", "reprocess", "small ghost")}</div>`;
  } else if (page === "players") {
    html =
      pageHead(
        "players",
        "",
        ibutton("refresh", "reprocess", "refresh") +
          ibutton("actions", "playerAction", "players", "primary"),
      ) + `<div id="players-body">${playersHtml()}</div>`;
  } else if (page === "chat") {
    html =
      pageHead(
        "chat",
        "",
        select(
          "chat-source",
          "type",
          [
            ["game", t("chat")],
            ["discord", "Discord"],
          ],
          "game",
        ),
      ) +
      `<section class="panel flush"><div id="chat-list" class="chat-list"></div><form id="chat-form" class="chat-input"><input name="text" autocomplete="off" placeholder="${t("message")}" required><button class="primary" type="submit">${t("send")}${icon("arrow")}</button></form></section>`;
  } else if (page === "mods") {
    html =
      pageHead(
        "mods",
        "modsHelp",
        ibutton("importZip", "importZip", "plus", "primary") +
          ibutton("importFolder", "importModFolder", "folder") +
          ibutton("openFolder", "openMods", "folder"),
      ) + `<div id="mods-body"><i class="spinner"></i></div>`;
  } else if (page === "backups") {
    html =
      pageHead(
        "backups",
        "backupHelp",
        ibutton("backupNow", "backup", "plus", "primary") +
          ibutton("openFolder", "openBackups", "folder"),
      ) +
      `<form id="backup-form" class="panel"><h2>${t("automaticBackup")}</h2><div class="form-grid"><div class="form-field full">${check("enabled", "enabled", s.backup.enabled)}</div>${field("intervalMinutes", "interval", s.backup.intervalMinutes, "number")}${field("keep", "keep", s.backup.keep, "number")}</div>${formSave()}</form><div id="backups-body"><i class="spinner"></i></div>`;
  } else if (["events", "schedules", "groups", "teleports"].includes(page)) {
    const key = collectionKey(),
      help = {
        events: "eventHelp",
        schedules: "scheduleHelp",
        groups: "groupHelp",
        teleports: "teleportHelp",
      }[page];
    html = pageHead(
      page,
      help,
      ibutton("add", "addEntry", "plus", "primary") +
        ibutton("import", "importCollection", "download") +
        ibutton("export", "exportCollection", "download"),
    );
    if (page === "teleports")
      html +=
        notice("locationHelp") +
        `<div class="tabs">${button("teleports", "showTeleports", transient.areas ? "" : "active")}${button("areas", "showAreas", transient.areas ? "active" : "")}</div>`;
    html += collectionHtml(collectionKey());
    if (page === "events")
      html += `<form id="variables-form" class="panel"><h2>${t("variables")}</h2><textarea name="variables" spellcheck="false">${esc(JSON.stringify(s.variables, null, 2))}</textarea>${formSave()}</form>`;
  } else if (page === "integrations") {
    html =
      pageHead("integrations") +
      `<form id="integrations-form"><section class="panel"><h2>Discord</h2>${notice("discordHelp")}<div class="form-grid">${field("discord.token", "discordToken", s.discord.token, "password", true)}${field("discord.channelId", "channelId", s.discord.channelId)}${field("discord.adminRoleId", "roleId", s.discord.adminRoleId)}<div class="form-field full">${check("discord.relay", "relay", s.discord.relay)}${check("discord.enabled", "autoConnect", s.discord.enabled)}</div></div><div class="form-action">${ibutton(r.discord ? "disconnect" : "connect", r.discord ? "disconnectDiscord" : "connectDiscord", "integrations")}</div></section><section class="panel"><h2>API · ${t("map")}</h2>${notice("apiHelp")}<div class="form-grid">${field("api.baseUrl", "apiBase", s.api.baseUrl, "url", true)}${field("api.tokenName", "tokenName", s.api.tokenName)}${field("api.token", "token", s.api.token, "password")}</div></section><section class="panel"><h2>${t("mailNotifications")}</h2><p>${t("mailHelp")}</p><div class="form-grid"><div class="form-field full">${check("notifications.enabled", "enabled", s.notifications?.enabled)}</div>${field("notifications.host", "smtpHost", s.notifications?.host || "")}${field("notifications.port", "smtpPort", s.notifications?.port || 465, "number")}${field("notifications.user", "smtpUser", s.notifications?.user || "")}${field("notifications.password", "password", s.notifications?.password || "", "password")}${field("notifications.from", "mailFrom", s.notifications?.from || "")}${field("notifications.to", "mailTo", s.notifications?.to || "")}<div class="form-field full">${check("notifications.secure", "smtpSecure", s.notifications?.secure !== false)}</div></div></section>${formSave()}</form><section class="panel"><div class="section-head"><h2>${t("programs")}</h2>${button("add", "addProgram")}</div><p>${t("programHelp")}</p>${(s.programs || []).map((p) => `<div class="collection-row"><div class="row-info"><strong>${esc(p.name)}</strong><p><code>${esc(p.executable)}</code></p></div>${button("edit", "editProgram", "small", `data-entry="${p.id}"`)}${button("remove", "removeProgram", "small danger", `data-entry="${p.id}"`)}</div>`).join("")}</section>`;
  } else if (page === "inventory") {
    html =
      pageHead(
        "inventory",
        "apiHelp",
        ibutton("readInventory", "inventory", "inventory", "primary") +
          ibutton("catalog", "catalog", "refresh"),
      ) + `<div id="inventory-result">${empty("noData", "inventory")}</div>`;
  } else if (page === "map") {
    html =
      pageHead("map", "apiHelp") +
      `<div class="panel"><div class="empty-icon">${icon("map")}</div><h2>${t("map")}</h2><p>${esc(s.config.WebDashboardUrl || s.api.baseUrl || `http://${s.host}:${s.config.WebDashboardPort}/`)}</p>${ibutton("map", "openMap", "map", "primary")}<div class="settings-footer">${button("integrations", "goIntegrations", "ghost")}${button("config", "goConfig", "ghost")}</div></div>`;
  } else if (page === "preferences") {
    const p = state.settings;
    html =
      pageHead("preferences") +
      `<form id="preferences-form" class="panel"><div class="form-grid">${select(
        "language",
        "language",
        [
          ["es", "Español"],
          ["en", "English"],
          ["pt", "Português"],
          ["zh", "中文"],
          ["ja", "日本語"],
          ["ru", "Русский"],
        ],
        p.language,
      )}${select(
        "theme",
        "appearance",
        [
          ["dark", t("dark")],
          ["light", t("light")],
        ],
        p.theme,
      )}<div class="form-field full">${check("minimizeToTray", "tray", p.minimizeToTray)}<p class="help">${t("trayHelp")}</p></div><div class="form-field full"><label>${t("steamcmd")}</label><div class="input-row"><input name="steamcmd" value="${esc(p.steamcmd)}">${button("browse", "pickSteamcmd")}</div><p class="help">${t("steamcmdHelp")}</p></div></div>${formSave()}</form>`;
  }
  content.innerHTML = html;
  content.scrollTop = 0;
  draftDirty = false;
  if (page === "console") {
    if (!logs[selected]) logs[selected] = await api("logs", { id: selected });
    if (token !== renderId) return;
    renderLogs();
  }
  if (page === "chat") {
    chats[selected] = await api("chat", { id: selected });
    if (token === renderId) renderChat();
  }
  if (page === "config") await renderConfig(token);
  if (page === "mods") await loadMods(token);
  if (page === "backups") await loadBackups(token);
}
function activityHtml() {
  const rows = (logs[selected] || [])
    .filter((l) => l.kind !== "console" && l.kind !== "file")
    .slice(-8)
    .reverse();
  return rows.length
    ? rows
        .map(
          (l) =>
            `<div class="activity-line"><i class="status-dot ${l.kind === "success" ? "on" : ""}"></i><time>${new Date(l.at).toLocaleTimeString()}</time><span>${esc(l.text.slice(0, 200))}</span></div>`,
        )
        .join("")
    : `<p>${t("noFakeData")}</p>`;
}
function playersHtml() {
  const rows = runtime().players || [];
  return rows.length
    ? `<div class="panel flush table-wrap"><table><thead><tr><th>${t("player")}</th><th>LVL</th><th>HP</th><th>Ping</th><th>${t("position")}</th><th></th></tr></thead><tbody>${rows.map((p) => `<tr><td><strong>${esc(p.name)}</strong><code class="table-sub">${esc(p.id)}</code></td><td>${p.level}</td><td>${p.health}</td><td>${p.ping ?? "—"}</td><td>${esc(p.pos)}</td><td>${button("actions", "playerAction", "small", `data-player="${esc(p.id)}"`)}</td></tr>`).join("")}</tbody></table></div>`
    : empty("noPlayers", "players");
}
function worldField(name, value, worlds = ["Navezgane", "RWG"]) {
  const options = [...new Set([...worlds, value].filter(Boolean))];
  const choices = [
    ["", t("chooseWorld")],
    ...options.map((world) => [
      world,
      world === "RWG" ? t("randomWorld") + " (RWG)" : world,
    ]),
  ];
  return `<div class="form-field native-field" data-option="gameworld ${esc(t("world").toLowerCase())}"><label for="world-picker">${t("world")}</label>${gameSelect("world-picker", "", choices, value)}<input id="world-input" aria-label="${t("world")}" name="${name}" value="${esc(value)}"><small>${t("worldChoicesHelp")}</small></div>`;
}

const speeds = [
  "walkSpeed",
  "jogSpeed",
  "runSpeed",
  "sprintSpeed",
  "nightmareSpeed",
];
const difficulties = [
  "Scavenger",
  "Adventurer",
  "Nomad",
  "Warrior",
  "True Survivalist",
  "Insane",
];
const speedKeys = [
  "ZombieMove",
  "ZombieMoveNight",
  "ZombieFeralMove",
  "ZombieBMMove",
];

function gameLabel(key, fallback = key) {
  return t(key) === key ? fallback : t(key);
}

function gameSelect(id, attrs, choices, value) {
  return `<select id="${id}" ${attrs}>${choices.map(([v, label]) => `<option value="${esc(v)}" ${v === value ? "selected" : ""}>${esc(label)}</option>`).join("")}</select>`;
}

function nativeOption(key, value, data) {
  if (key === "GameWorld") return worldField(key, value, data.worlds);
  const label = gameLabel(key, key.replace(/([a-z0-9])([A-Z])/g, "$1 $2"));
  const managed = ["UserDataFolder", "TerminalWindowEnabled"].includes(key);
  const help = managed ? t("managedOption") : data.comments[key];
  const names =
    key === "GameDifficulty"
      ? difficulties
      : speedKeys.includes(key)
        ? speeds
        : null;
  const choices =
    names?.map((name, index) => [String(index), t(name)]) ??
    (["true", "false"].includes(value)
      ? [
          ["true", t("enabled")],
          ["false", t("disabled")],
        ]
      : null);
  if (choices && !choices.some(([v]) => v === value))
    choices.push([value, value]);
  const id = `native-${esc(key)}`;
  const name = `name="${esc(key)}"`;
  const control =
    choices && !managed
      ? gameSelect(id, name, choices, value)
      : `<input id="${id}" ${name} type="${/password|token/i.test(key) ? "password" : "text"}" value="${esc(value)}" ${managed ? "disabled" : ""}>`;
  return `<div class="form-field native-field ${key === "SandboxCode" ? "full" : ""}" data-option="${esc([key, label, help].join(" ").toLowerCase())}"><label for="${id}">${esc(label)}</label><code class="native-name">${esc(key)}</code>${control}${help ? `<small>${esc(help)}</small>` : ""}</div>`;
}

function sandboxBlocks(code) {
  const normalized = code.trim() || "A";
  if (!/^A(?:[A-Z]{3})*$/.test(normalized)) return null;
  return new Map(
    (normalized.slice(1).match(/.{3}/g) || []).map((block) => [
      block.slice(0, 2),
      block[2],
    ]),
  );
}

function sandboxEditor(data) {
  if (!data.options?.length) return notice("sandboxHelp");
  const groups = Map.groupBy(data.options, (option) => option.group);
  const presets = data.presets?.length
    ? `<div class="form-field full"><label for="sandbox-preset">${t("difficultyPreset")}</label>${gameSelect("sandbox-preset", "", [["", t("chooseDifficulty")], ...data.presets.map(({ label, code }) => [code, t(label)])], "")}<small>${t("difficultyHelp")}</small></div>`
    : "";
  return `${notice("sandboxEditorHelp")}${presets}${[...groups]
    .map(
      ([group, options]) =>
        `<details class="sandbox-group full" ${group === "Entities" ? "open" : ""}><summary>${esc(gameLabel("sandbox" + group, group))} · ${options.length}</summary><div class="form-grid">${options
          .map((option) => {
            const label = gameLabel(option.key, option.label);
            const choices = Object.entries(option.choices).map(
              ([value, name], i) => [
                value,
                speedKeys.includes(option.key) ? t(speeds[i]) : name,
              ],
            );
            const id = "sandbox-" + option.code;
            const control = gameSelect(
              id,
              `data-sandbox-code="${option.code}" data-default="${option.default}"`,
              choices,
              option.default,
            );
            return `<div class="form-field native-field" data-option="${esc([option.key, label, group, option.label].join(" ").toLowerCase())}"><label for="${id}">${esc(label)}</label>${control}</div>`;
          })
          .join("")}</div></details>`,
    )
    .join("")}`;
}

function loadSandboxControls() {
  const code = $("#native-SandboxCode");
  if (!code) return;
  const blocks = sandboxBlocks(code.value);
  for (const control of $$("[data-sandbox-code]")) {
    const value =
      blocks?.get(control.dataset.sandboxCode) ?? control.dataset.default;
    control.disabled =
      !blocks || ![...control.options].some((option) => option.value === value);
    control.value = control.disabled ? "" : value;
  }
}

function filterGameOptions(query) {
  const term = query.trim().toLowerCase();
  for (const field of $$("[data-option]"))
    field.hidden = !field.dataset.option.includes(term);
  for (const group of $$(".sandbox-group")) {
    group.hidden =
      !!term && !group.querySelector("[data-option]:not([hidden])");
    if (term && !group.hidden) group.open = true;
  }
}

async function renderConfig(token) {
  const s = current(),
    data = await api("configInfo", { id: selected });
  if (token !== renderId) return;
  const c = data.values;
  let html = "";
  if (tab === "basics") {
    html = `<form id="config-form" class="panel"><div class="form-grid">${field("name", "name", s.name)}${field("config.ServerName", "name", c.ServerName)}${field("host", "host", s.host)}${field("config.ServerPort", "gamePort", c.ServerPort, "number")}${field("config.ServerMaxPlayerCount", "maxPlayers", c.ServerMaxPlayerCount, "number")}${field("config.ServerPassword", "password", c.ServerPassword, "password")}${worldField("config.GameWorld", c.GameWorld, data.worlds)}${field("config.GameName", "worldName", c.GameName)}${field("config.WorldGenSeed", "seed", c.WorldGenSeed)}${field("config.WorldGenSize", "worldSize", c.WorldGenSize, "number")}${field("config.TelnetPort", "telnetPort", c.TelnetPort, "number")}${field("config.TelnetPassword", "telnetPassword", c.TelnetPassword, "password")}${field("config.WebDashboardPort", "webPort", c.WebDashboardPort, "number")}${select(
      "config.ServerVisibility",
      "visibility",
      [
        ["2", t("public")],
        ["1", t("friends")],
        ["0", t("private")],
      ],
      c.ServerVisibility,
    )}${field("config.Region", "region", c.Region)}${field("config.Language", "language", c.Language)}${area("config.ServerDescription", "description", c.ServerDescription)}${area("config.ServerLoginConfirmationText", "rules", c.ServerLoginConfirmationText)}<div class="form-field full">${check("autoConnect", "autoConnect", s.autoConnect)}${check("autoRestart", "autoRestart", s.autoRestart)}${check("webEnabled", "webEnable", c.WebDashboardEnabled === "true")}${check("mapEnabled", "mapEnable", c.EnableMapRendering === "true")}</div>${area("connectCommands", "connectCommands", s.connectCommands)}<div class="section-divider">${t("version")}</div><div class="form-field full"><label>${t("version")}</label><div class="input-row"><input name="branch" value="${esc(s.branch)}" list="branches">${button("refreshVersions", "refreshVersions")}</div><datalist id="branches">${state.branches.map((b) => `<option value="${esc(b.id)}">${esc(b.label)}</option>`).join("")}</datalist><p class="help">${t("versionHelp")}</p></div></div>${formSave()}</form>`;
  } else if (tab === "advanced") {
    html = `${notice("sourceOptions")}<input class="searchbar" id="config-search" placeholder="${t("search")}"><form id="native-form" class="panel"><div class="form-grid">${data.sandbox ? sandboxEditor(data) : ""}${Object.entries(
      c,
    )
      .map(([key, value]) => nativeOption(key, value, data))
      .join("")}</div>${formSave()}</form>`;
  } else if (tab === "security") {
    html =
      notice("securityHelp") +
      `<form id="security-form" class="panel"><h2>${t("security")}</h2><div class="form-grid"><div class="form-field full">${check("pingEnabled", "pingCheck", s.security.pingEnabled)}</div>${field("maxPing", "maxPing", s.security.maxPing, "number")}${field("failures", "failures", s.security.failures, "number")}<div class="form-field full">${check("vacEnabled", "vacCheck", s.security.vacEnabled)}</div>${field("steamApiKey", "steamApiKey", s.security.steamApiKey, "password")}${field("maxVacBans", "maxVacBans", s.security.maxVacBans, "number")}${area("blockedHosts", "blockedHosts", s.security.blockedHosts || "")}<div class="form-field full">${check("bannedItemsEnabled", "bannedItemsEnabled", s.security.bannedItemsEnabled)}</div>${area("bannedItems", "banItems", s.security.bannedItems || "")}</div>${formSave()}</form>`;
  } else if (tab === "health") {
    html = `<form id="health-form" class="panel"><h2>${t("health")}</h2>${check("autoRestart", "autoRestart", s.autoRestart)}${check("healthEnabled", "healthRestart", s.health?.enabled)}${check("avoidBloodMoon", "avoidBloodMoon", s.health?.avoidBloodMoon !== false)}<div class="form-grid">${field("maxRamMb", "maxMemory", s.health?.maxRamMb || 0, "number")}${field("healthFailures", "failures", s.health?.failures || 3, "number")}</div>${area("connectCommands", "connectCommands", s.connectCommands)}<div class="settings-footer">${button("forceStop", "forceStop", "danger")}${deleteButton(s.id, runtime())}<button class="primary" type="submit">${t("save")}</button></div></form>`;
  }
  $("#config-body").innerHTML = html;
  loadSandboxControls();
}
async function loadMods(token = renderId) {
  try {
    const rows = await api("mods", { id: selected }, true);
    if (token !== renderId) return;
    $("#mods-body").innerHTML = rows.length
      ? `<div class="panel flush">${rows.map((m) => `<div class="collection-row"><span class="row-icon">${icon("mods")}</span><div class="row-info"><strong>${esc(m.name)}</strong><p>${esc(m.version)} ${m.author ? " · " + esc(m.author) : ""}<br><code>${esc(m.folder)}</code></p></div><span class="badge ${m.enabled ? "purple" : ""}">${t(m.enabled ? "enabled" : "disabled")}</span>${button(m.enabled ? "disable" : "enable", "toggleMod", "small", `data-mod="${esc(m.folder)}" data-enabled="${!m.enabled}"`)}</div>`).join("")}</div>`
      : empty("noMods", "mods");
  } catch (e) {
    if (token === renderId) $("#mods-body").innerHTML = notice("localOnly");
  }
}
async function loadBackups(token = renderId) {
  const rows = await api("backups", { id: selected });
  if (token !== renderId) return;
  $("#backups-body").innerHTML = rows.length
    ? `<div class="panel flush table-wrap"><table><thead><tr><th>${t("date")}</th><th>${t("size")}</th><th></th></tr></thead><tbody>${rows.map((b) => `<tr><td>${new Date(b.at).toLocaleString()}<code class="table-sub">${esc(b.name)}</code></td><td>${(b.size / 1024 / 1024).toFixed(1)} MB</td><td>${button("restore", "restore", "small", `data-backup="${esc(b.name)}"`)}</td></tr>`).join("")}</tbody></table></div>`
    : empty("noBackups", "backups");
}
function collectionHtml(key) {
  const rows = current()[key] || [];
  return rows.length
    ? `<div class="panel flush">${rows.map((x) => `<div class="collection-row"><span class="row-icon">${icon(page)}</span><div class="row-info"><strong>${esc(x.name)}</strong><p>${key === "events" ? `${t(x.trigger)} · ${t(x.condition || "contains")} ${esc(x.match)} · ${x.cooldown}s` : key === "schedules" ? `${t(x.action)} · ${t("nextRun")}: ${x.nextAt && x.nextAt < Number.MAX_SAFE_INTEGER ? new Date(x.nextAt).toLocaleString() : "—"}${x.result ? " · " + esc(x.result) : ""}` : key === "groups" ? `${esc(x.members || "")}` : key === "bags" ? `${x.items.length} · ${t("cost")}: ${esc(x.cost)}` : esc(x.position)}</p></div>${["events", "schedules"].includes(key) ? `<span class="badge ${x.enabled ? "purple" : ""}">${t(x.enabled ? "enabled" : "disabled")}</span>` : ""}<div class="toolbar">${key === "groups" ? button("applyGroup", "applyGroup", "small", `data-entry="${x.id}"`) : ""}${button("edit", "editEntry", "small", `data-entry="${x.id}"`)}<button class="small icon-only danger" data-action="removeEntry" data-entry="${x.id}" aria-label="${t("remove")}">${icon("trash")}</button></div></div>`).join("")}</div>`
    : empty("emptyList", page);
}
function renderLogs() {
  const box = $("#console-output");
  if (!box) return;
  const lines = (logs[selected] || []).filter(
    (l) =>
      (filterKind === "all" || l.kind === filterKind) &&
      (!filterText || l.text.toLowerCase().includes(filterText.toLowerCase())),
  );
  box.innerHTML = lines.length
    ? lines
        .map(
          (l) =>
            `<div class="log-line ${esc(l.kind)}"><time>${new Date(l.at).toLocaleTimeString()}</time>${esc(l.text)}</div>`,
        )
        .join("")
    : `<div class="muted">${t("noLogs")}</div>`;
  if (!pauseScroll) box.scrollTop = box.scrollHeight;
}
function renderChat() {
  const box = $("#chat-list");
  if (!box) return;
  box.innerHTML = (chats[selected] || [])
    .map(
      (m) =>
        `<div class="chat-message ${m.source === "discord" ? "discord" : ""}"><div class="meta">${esc(m.name)} · ${new Date(m.at).toLocaleTimeString()} · ${m.source === "discord" ? "Discord" : t("chat")}</div><p>${esc(m.text)}</p></div>`,
    )
    .join("");
  box.scrollTop = box.scrollHeight;
}
function inventoryHtml(snapshots) {
  if (!snapshots.length) return empty("noData", "inventory");
  const last = snapshots.at(-1),
    previous = snapshots
      .slice(0, -1)
      .reverse()
      .find((x) => x.player === last.player);
  function flatten(data, location = "") {
    let rows = [];
    if (Array.isArray(data)) {
      data.forEach((x, i) => rows.push(...flatten(x, location + " " + i)));
      return rows;
    }
    if (!data || typeof data !== "object") return rows;
    const name = data.name || data.itemname || data.itemName;
    if (name && typeof name === "string") {
      rows.push({
        name,
        count: Number(data.count ?? data.quantity ?? 1),
        quality: data.quality ?? "—",
        slot: location.trim(),
      });
      return rows;
    }
    for (const [k, v] of Object.entries(data))
      if (typeof v === "object") rows.push(...flatten(v, location + " " + k));
    return rows;
  }
  const rows = flatten(last.data),
    before = previous ? flatten(previous.data) : [];
  const totals = (r) =>
      r.reduce((m, i) => ((m[i.name] = (m[i.name] || 0) + i.count), m), {}),
    old = totals(before),
    now = totals(rows);
  return `<div class="notice">${icon("inventory")}<span>${t("snapshot")} · ${esc(last.player)} · ${new Date(last.at).toLocaleString()}</span></div><div class="panel flush table-wrap"><table><thead><tr><th>${t("item")}</th><th>${t("count")}</th><th>${t("quality")}</th><th>${t("slot")}</th><th>${t("changes")}</th></tr></thead><tbody>${rows.map((i) => `<tr><td><code>${esc(i.name)}</code></td><td>${i.count}</td><td>${esc(i.quality)}</td><td>${esc(i.slot)}</td><td>${previous ? (now[i.name] || 0) - (old[i.name] || 0) : "—"}</td></tr>`).join("")}</tbody></table></div>`;
}
async function modal(title, html, onSave, saveKey = "save") {
  modalSave = onSave;
  $("#modal-head").innerHTML =
    `<h2>${esc(title)}</h2><button class="icon-only ghost" type="button" data-action="closeModal" aria-label="${t("close")}">×</button>`;
  $("#modal-body").innerHTML = html;
  $("#modal-actions").innerHTML =
    button("cancel", "closeModal") +
    `<button type="submit" class="primary">${t(saveKey)}</button>`;
  $("#modal").showModal();
}
function confirm(title, message) {
  return new Promise((resolve) => {
    modal(
      title,
      `<p>${esc(message)}</p>`,
      async () => {
        resolve(true);
        $("#modal").close();
      },
      "confirm",
    );
    modalCtx = { cancel: () => resolve(false) };
  });
}
function closeModal() {
  modalCtx?.cancel?.();
  modalCtx = null;
  modalSave = null;
  $("#modal").close();
}
async function createServer() {
  const d = await api("defaults");
  await modal(
    t("newServer"),
    `<div class="form-grid">${field("name", "name", d.name)}${select("mode", "type", ["local", "remote"], "local")}<div class="form-field full"><label>${t("directory")}</label><div class="input-row"><input name="directory" value="${esc(d.directory)}">${button("browse", "pickServerDirectory")}</div></div>${field("host", "host", d.host)}<div class="form-field"><label>${t("version")}</label><div class="input-row"><input name="branch" value="public" list="new-branches">${button("refreshVersions", "refreshVersions", "small")}</div><datalist id="new-branches">${state.branches.map((b) => `<option value="${esc(b.id)}">${esc(b.label)}</option>`).join("")}</datalist></div>${field("ServerPort", "gamePort", d.config.ServerPort, "number")}${field("TelnetPort", "telnetPort", d.config.TelnetPort, "number")}${field("WebDashboardPort", "webPort", d.config.WebDashboardPort, "number")}${field("TelnetPassword", "telnetPassword", "", "password")}<div class="form-field full"><p class="help">${t("versionHelp")}</p></div></div>`,
    async (f) => {
      const v = collect(f);
      const s = await api("newServer", {
        server: {
          name: v.name,
          mode: v.mode,
          directory: v.directory,
          host: v.host,
          branch: v.branch,
          config: {
            ServerName: v.name,
            ServerPort: v.ServerPort,
            TelnetPort: v.TelnetPort,
            WebDashboardPort: v.WebDashboardPort,
            TelnetPassword: v.TelnetPassword,
          },
        },
      });
      closeModal();
      draftDirty = false;
      await navigate("dashboard", s.id);
      toast(t("success"));
    },
    "newServer",
  );
}
async function editEntry(entryId) {
  const s = current(),
    key = collectionKey();
  const entry = (s[key] || []).find((x) => x.id === entryId) || {
    id: crypto.randomUUID(),
    name: "",
    enabled: true,
    trigger: "chat",
    condition: "starts",
    match: "!help",
    cooldown: 30,
    script: "say {name}",
    repeat: "interval",
    minutes: 60,
    time: "04:00",
    at: new Date(Date.now() + 3600000 - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16),
    action: "command",
    command: "saveworld",
    seconds: 60,
    members: "",
    cost: 0,
    items: [],
    position: "0, 70, 0",
  };
  let html = `<div class="form-grid">${field("name", "name", entry.name)}`;
  if (key === "events")
    html += `<div class="form-field">${check("enabled", "enabled", entry.enabled)}</div>${select("trigger", "trigger", state.triggers || ["chat", "log", "joined", "left"], entry.trigger)}${select("condition", "condition", ["contains", "starts", "equals", "any"], entry.condition)}${field("match", "match", entry.match)}${field("cooldown", "cooldownSeconds", entry.cooldown, "number")}${field("order", "order", entry.order || 0, "number")}${select("groupId", "group", [["", "—"], ...s.groups.map((g) => [g.id, g.name])], entry.groupId || "", true)}${area("script", "script", entry.script)}`;
  if (key === "schedules")
    html += `<div class="form-field">${check("enabled", "enabled", entry.enabled)}</div>${select(
      "repeat",
      "repeat",
      [
        ["interval", t("intervalMode")],
        ["daily", t("daily")],
        ["once", t("once")],
      ],
      entry.repeat,
    )}${select("action", "action", ["command", "restart", "stop", "backup", "start", "event"], entry.action)}${field("minutes", "interval", entry.minutes, "number")}${field("time", "time", entry.time, "time")}${field("at", "date", entry.at, "datetime-local")}${field("seconds", "seconds", entry.seconds, "number")}${area("command", "command", entry.command)}`;
  if (key === "groups")
    html +=
      field("level", "level", entry.level || 0, "number") +
      area("members", "members", entry.members);
  if (key === "bags")
    html +=
      field("cost", "cost", entry.cost, "number") +
      `<div class="form-field full">${check("random", "random", entry.random)}</div>` +
      area(
        "items",
        "items",
        entry.items
          .map((i) => [i.item, i.count, i.quality || 1].join(", "))
          .join("\n"),
      );
  if (["teleports", "areas"].includes(key))
    html += field("position", "position", entry.position);
  if (key === "areas")
    html += field("radius", "radius", entry.radius || 50, "number");
  html += "</div>";
  await modal(t(page), html, async (f) => {
    const v = collect(f),
      x = { ...entry, ...v };
    for (const n of [
      "cost",
      "cooldown",
      "minutes",
      "seconds",
      "level",
      "order",
      "radius",
    ])
      if (n in v) x[n] = Number(v[n]);
    if (key === "bags")
      x.items = v.items
        .split(/\r?\n/)
        .filter((l) => l.trim())
        .map((l) => {
          const [item, count, quality] = l.split(",").map((x) => x.trim());
          return {
            item,
            count: Number(count || 1),
            quality: Number(quality || 1),
          };
        });
    const list = [...(s[key] || [])];
    const i = list.findIndex((e) => e.id === x.id);
    if (i < 0) list.push(x);
    else list[i] = x;
    await api("saveCollection", { id: selected, key, list });
    closeModal();
    await render();
    toast(t("saved"));
  });
}
async function playerDialog(prefill = "") {
  await modal(
    t("actions"),
    `<div class="form-grid">${field("player", "player", prefill)}${select("action", "action", ["kick", "ban", "unban", "admin", "removeAdmin", "whitelist", "removeWhitelist", "teleport", "give", "buff"], "kick")}${field("reason", "reason", "")}${field("duration", "duration", 1, "number")}${field("level", "level", 0, "number")}${field("position", "position", "0, 70, 0")}${field("item", "item", "")}${field("count", "count", 1, "number")}${field("quality", "quality", 1, "number")}${field("buff", "buff", "")}</div>`,
    async (f) => {
      const v = collect(f);
      await api("playerAction", {
        id: selected,
        action: v.action,
        player: v.player,
        options: v,
      });
      closeModal();
      toast(t("success"));
    },
    "confirm",
  );
}
async function saveCurrent(patch) {
  const server = { ...current(), ...patch };
  await api("saveServer", { server });
  draftDirty = false;
  toast(t("saved"));
}
document.addEventListener("input", (e) => {
  if (
    e.target.closest("#content form") &&
    !["command-form", "chat-form"].includes(e.target.closest("form").id)
  )
    draftDirty = true;
  if (e.target.id === "log-search") {
    filterText = e.target.value;
    renderLogs();
  }
  if (e.target.id === "config-search") filterGameOptions(e.target.value);
  if (e.target.id === "native-SandboxCode") loadSandboxControls();
  if (e.target.id === "world-input") $("#world-picker").value = e.target.value;
});
document.addEventListener("change", (e) => {
  if (e.target.id === "world-picker" && e.target.value) {
    $("#world-input").value = e.target.value;
    draftDirty = true;
  }
  if (e.target.dataset.sandboxCode) {
    const code = $("#native-SandboxCode");
    const blocks = sandboxBlocks(code.value);
    if (!blocks) return;
    const { sandboxCode, default: defaultValue } = e.target.dataset;
    if (e.target.value === defaultValue) blocks.delete(sandboxCode);
    else blocks.set(sandboxCode, e.target.value);
    code.value =
      "A" +
      [...blocks]
        .sort()
        .map(([key, value]) => key + value)
        .join("");
    const preset = $("#sandbox-preset");
    if (preset) preset.value = "";
    draftDirty = true;
  }
  if (e.target.id === "sandbox-preset" && e.target.value) {
    $("#native-SandboxCode").value = e.target.value;
    draftDirty = true;
    loadSandboxControls();
  }
  if (e.target.id === "log-kind") {
    filterKind = e.target.value;
    renderLogs();
  }
});
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  try {
    if (btn.dataset.window) {
      await api("window", { command: btn.dataset.window });
      return;
    }
    if (btn.dataset.nav) {
      await navigate(btn.dataset.nav);
      return;
    }
    if (btn.dataset.server || btn.dataset.open) {
      await navigate("dashboard", btn.dataset.server || btn.dataset.open);
      return;
    }
    if (btn.dataset.tab) {
      if (await canLeave()) {
        tab = btn.dataset.tab;
        await render();
      }
      return;
    }
    if (btn.dataset.quick) {
      await api("command", { id: selected, command: btn.dataset.quick });
      return;
    }
    const a = btn.dataset.action,
      id = btn.dataset.id || selected,
      s = current();
    if (!a) return;
    switch (a) {
      case "closeModal":
        closeModal();
        break;
      case "newServer":
        await createServer();
        break;
      case "serverStart":
        await api("start", { id });
        toast(t("success"));
        break;
      case "serverStop":
        if (await confirm(t("stop"), t("stopHelp"))) {
          await api("stop", { id });
          toast(t("success"));
        }
        break;
      case "forceStop":
        if (await confirm(t("forceStop"), t("forceHelp")))
          await api("stop", { id, force: true });
        break;
      case "restart":
        await modal(
          t("restart"),
          `<div class="form-grid">${field("seconds", "seconds", 60, "number")}${field("message", "message", t("restart"))}<div class="form-field full">${check("restart", "restart", true)}</div></div>`,
          async (f) => {
            const v = collect(f);
            await api("countdown", {
              id,
              options: {
                seconds: Number(v.seconds),
                message: v.message,
                restart: v.restart,
              },
            });
            closeModal();
            await render();
          },
          "confirm",
        );
        break;
      case "cancelCountdown":
        await api(a, { id });
        await render();
        break;
      case "install": {
        const target = state.servers.find((server) => server.id === id);
        if (
          target &&
          (await confirm(
            t("install") + " · " + target.name,
            target.branch +
              " · " +
              target.directory +
              "\n\n" +
              t("installHelp"),
          ))
        ) {
          await api("install", { id });
          toast(t("success"));
          await render();
        }
        break;
      }
      case "connect":
      case "disconnect":
        await api(a, { id });
        toast(t("success"));
        if (page === "dashboard") await render();
        break;
      case "goConfig":
        await navigate("config");
        break;
      case "goConsole":
        await navigate("console");
        break;
      case "goMods":
        await navigate("mods");
        break;
      case "goIntegrations":
        await navigate("integrations");
        break;
      case "copyAddress":
        await navigator.clipboard.writeText(`${s.host}:${s.config.ServerPort}`);
        toast(t("copied"));
        break;
      case "openFolder":
      case "openMods":
      case "openBackups":
        await api("openFolder", {
          id,
          kind:
            a === "openMods"
              ? "mods"
              : a === "openBackups"
                ? "backups"
                : "server",
        });
        break;
      case "refreshVersions":
        btn.disabled = true;
        try {
          await api("refreshBranches");
          $$("datalist").forEach(
            (el) =>
              (el.innerHTML = state.branches
                .map(
                  (b) =>
                    `<option value="${esc(b.id)}">${esc(b.label)}</option>`,
                )
                .join("")),
          );
          toast(t("success"));
        } finally {
          btn.disabled = false;
        }
        break;
      case "pickServerDirectory": {
        const p = await api("pickDirectory");
        if (p) $("#modal-body [name=directory]").value = p;
        break;
      }
      case "pickProgram": {
        const file = await api("pickProgram");
        if (file) $("#modal [name=executable]").value = file;
        break;
      }
      case "addProgram":
      case "editProgram": {
        const entry = (s.programs || []).find(
          (p) => p.id === btn.dataset.entry,
        ) || {
          id: crypto.randomUUID(),
          name: "",
          enabled: false,
          executable: "",
          args: [],
          timeout: 30000,
        };
        await modal(
          t("programs"),
          `<div class="form-grid">${field("name", "name", entry.name)}<div class="form-field">${check("enabled", "enabled", entry.enabled)}</div><div class="form-field full"><label>${t("programFile")}</label><div class="input-row"><input name="executable" value="${esc(entry.executable)}">${button("browse", "pickProgram")}</div></div>${area("args", "programArgs", entry.args.join("\n"))}${field("timeout", "programTimeout", entry.timeout, "number")}</div>`,
          async (f) => {
            const v = collect(f),
              x = {
                ...entry,
                ...v,
                args: v.args.split(/\r?\n/).filter(Boolean),
                timeout: Number(v.timeout),
              },
              list = [...(s.programs || [])],
              at = list.findIndex((p) => p.id === x.id);
            if (at < 0) list.push(x);
            else list[at] = x;
            await api("saveCollection", { id, key: "programs", list });
            closeModal();
            await render();
          },
        );
        break;
      }
      case "removeProgram":
        if (await confirm(t("remove"), t("removeEntryHelp"))) {
          await api("saveCollection", {
            id,
            key: "programs",
            list: (s.programs || []).filter((p) => p.id !== btn.dataset.entry),
          });
          await render();
        }
        break;
      case "pickSteamcmd": {
        const p = await api("pickSteamcmd");
        if (p) $("[name=steamcmd]").value = p;
        break;
      }
      case "removeServer":
        {
          const server = state.servers.find((s) => s.id === id);
          await modal(
            t("deleteServer"),
            `<p>${esc(server.name)}</p><div class="delete-choices"><label class="delete-choice"><input type="radio" name="fileAction" value="keep" checked><span><strong>${t("keepServerFiles")}</strong><small>${t("keepServerFilesHelp")}</small></span></label>${server.mode === "local" ? `<label class="delete-choice"><input type="radio" name="fileAction" value="delete"><span><strong>${t("deleteServerFiles")}</strong><small>${t("deleteServerFilesHelp")}</small></span></label><div class="notice delete-path">${icon("folder")}<span>${t("serverFolderToDelete")}<code>${esc(server.directory)}</code><small>${t("separateBackupsKept")}</small></span></div>` : notice("remoteFilesKept")}</div>`,
            async (form) => {
              const deleteFiles = collect(form).fileAction === "delete";
              await api("removeServer", { id, deleteFiles });
              closeModal();
              selected = null;
              draftDirty = false;
              await navigate("overview");
              toast(t("success"));
            },
            "deleteServer",
          );
        }
        break;
      case "importConfig":
        await api("importConfig", { id });
        await render();
        break;
      case "exportConfig":
        await api("exportConfig", { id });
        break;
      case "exportLogs":
        await api("exportLogs", { id });
        break;
      case "clearLogs":
        logs[id] = [];
        renderLogs();
        break;
      case "pauseLogs":
        pauseScroll = !pauseScroll;
        btn.textContent = t(pauseScroll ? "resume" : "pause");
        break;
      case "reprocess":
        await api("reprocess", { id });
        if (page === "players") $("#players-body").innerHTML = playersHtml();
        toast(t("success"));
        break;
      case "playerAction":
        await playerDialog(btn.dataset.player || "");
        break;
      case "importZip":
      case "importModFolder":
        await api("importMod", { id, folder: a === "importModFolder" });
        await loadMods();
        toast(t("success"));
        break;
      case "toggleMod":
        await api("toggleMod", {
          id,
          name: btn.dataset.mod,
          enabled: btn.dataset.enabled === "true",
        });
        await loadMods();
        break;
      case "backup":
        await api("backup", { id });
        if (page === "backups") await loadBackups();
        toast(t("success"));
        break;
      case "restore":
        if (await confirm(t("restore"), t("restoreHelp"))) {
          await api("restore", { id, name: btn.dataset.backup });
          toast(t("success"));
          await render();
        }
        break;
      case "addEntry":
        await editEntry();
        break;
      case "editEntry":
        await editEntry(btn.dataset.entry);
        break;
      case "removeEntry": {
        const key = collectionKey();
        if (await confirm(t("remove"), t("removeEntryHelp"))) {
          await api("saveCollection", {
            id,
            key,
            list: s[key].filter((x) => x.id !== btn.dataset.entry),
          });
          await render();
        }
        break;
      }
      case "exportCollection":
        await api(a, { id, key: collectionKey() });
        break;
      case "importCollection":
        await api(a, { id, key: collectionKey() });
        await render();
        break;
      case "showAreas":
        transient.areas = true;
        await render();
        break;
      case "showTeleports":
        transient.areas = false;
        await render();
        break;
      case "applyGroup":
        if (await confirm(t("applyGroup"), t("applyGroupHelp"))) {
          await api("applyGroup", { id, groupId: btn.dataset.entry });
          toast(t("success"));
        }
        break;
      case "connectDiscord":
      case "disconnectDiscord":
        await api(a, { id });
        await render();
        break;
      case "inventory":
        await modal(
          t("readInventory"),
          field("player", "player", ""),
          async (f) => {
            const v = collect(f),
              out = await api("inventory", { id, player: v.player });
            closeModal();
            $("#inventory-result").innerHTML = inventoryHtml(out);
          },
          "confirm",
        );
        break;
      case "catalog": {
        const out = await api("catalog", { id });
        $("#inventory-result").innerHTML =
          `<pre class="pre-result">${esc(JSON.stringify(out, null, 2))}</pre>`;
        break;
      }
      case "openMap":
        await api("openMap", { id });
        break;
    }
  } catch (err) {
    /* api() already displays actionable errors */ if (!err.code)
      toast(err.message, true);
  }
});
$("#modal-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submit = e.submitter;
  if (submit) submit.disabled = true;
  try {
    await modalSave?.(e.target);
  } catch (err) {
    if (!err.code) toast(err.message, true);
  } finally {
    if (submit) submit.disabled = false;
  }
});
$("#modal").addEventListener("cancel", () => {
  modalCtx?.cancel?.();
  modalCtx = null;
});
document.addEventListener("submit", async (e) => {
  const form = e.target;
  if (form.id === "modal-form") return;
  e.preventDefault();
  const submit = e.submitter;
  if (submit) submit.disabled = true;
  try {
    const v = collect(form),
      s = current(),
      id = selected;
    switch (form.id) {
      case "command-form": {
        const command = v.command.trim();
        if (!command) break;
        history.push(command);
        historyAt = history.length;
        await api("command", { id, command });
        $("#command-input").value = "";
        break;
      }
      case "chat-form":
        await api(
          $("#f-chat-source")?.value === "discord" ? "discordSay" : "command",
          {
            id,
            text: v.text,
            command: 'say "' + v.text.replace(/["\r\n\\]/g, " ") + '"',
          },
        );
        form.reset();
        break;
      case "config-form": {
        const config = { ...s.config };
        for (const [k, value] of Object.entries(v))
          if (k.startsWith("config.")) config[k.slice(7)] = value;
        config.WebDashboardEnabled = String(v.webEnabled);
        config.EnableMapRendering = String(v.mapEnabled);
        await saveCurrent({
          name: v.name,
          host: v.host,
          branch: v.branch,
          autoConnect: v.autoConnect,
          autoRestart: v.autoRestart,
          connectCommands: v.connectCommands,
          config,
        });
        break;
      }
      case "native-form":
        await saveCurrent({ config: { ...s.config, ...v } });
        break;
      case "security-form":
        await saveCurrent({
          security: {
            ...v,
            maxPing: Number(v.maxPing),
            failures: Number(v.failures),
            maxVacBans: Number(v.maxVacBans),
          },
        });
        break;
      case "health-form":
        await saveCurrent({
          autoRestart: v.autoRestart,
          connectCommands: v.connectCommands,
          health: {
            enabled: v.healthEnabled,
            avoidBloodMoon: v.avoidBloodMoon,
            maxRamMb: Number(v.maxRamMb) || 0,
            failures: Math.max(1, Number(v.healthFailures) || 3),
          },
        });
        break;
      case "backup-form":
        if (
          Number(v.intervalMinutes) < 1 ||
          Number(v.keep) < 1 ||
          Number(v.keep) > 1000
        )
          throw new Error(t("invalidInterval"));
        await saveCurrent({
          backup: {
            enabled: v.enabled,
            intervalMinutes: Number(v.intervalMinutes),
            keep: Number(v.keep),
          },
        });
        break;
      case "variables-form": {
        const vars = JSON.parse(v.variables);
        if (!vars || Array.isArray(vars) || typeof vars !== "object")
          throw new Error(t("invalidData"));
        await saveCurrent({ variables: vars });
        break;
      }
      case "integrations-form":
        await saveCurrent({
          discord: {
            token: v["discord.token"],
            channelId: v["discord.channelId"],
            adminRoleId: v["discord.adminRoleId"],
            relay: v["discord.relay"],
            enabled: v["discord.enabled"],
          },
          notifications: {
            enabled: v["notifications.enabled"],
            host: v["notifications.host"],
            port: Number(v["notifications.port"]),
            user: v["notifications.user"],
            password: v["notifications.password"],
            from: v["notifications.from"],
            to: v["notifications.to"],
            secure: v["notifications.secure"],
          },
          api: {
            baseUrl: v["api.baseUrl"],
            tokenName: v["api.tokenName"],
            token: v["api.token"],
          },
        });
        break;
      case "preferences-form":
        await api("settings", { settings: v });
        draftDirty = false;
        await render();
        toast(t("saved"));
        break;
    }
  } catch (err) {
    if (!err.code) toast(err.message, true);
  } finally {
    if (submit) submit.disabled = false;
  }
});
document.addEventListener("keydown", (e) => {
  if (
    e.target.id === "command-input" &&
    ["ArrowUp", "ArrowDown"].includes(e.key)
  ) {
    e.preventDefault();
    historyAt = Math.max(
      0,
      Math.min(history.length, historyAt + (e.key === "ArrowUp" ? -1 : 1)),
    );
    e.target.value = history[historyAt] || "";
  }
});
$("#theme-toggle").addEventListener("click", async () => {
  await api("settings", {
    settings: {
      ...state.settings,
      theme: state.settings.theme === "dark" ? "light" : "dark",
    },
  });
  layout();
});
$("#preferences-btn").addEventListener("click", () => navigate("preferences"));
$("#add-top").addEventListener("click", () => createServer());
$("#language").addEventListener("change", async (e) => {
  if (!(await canLeave())) {
    e.target.value = state.settings.language;
    return;
  }
  await api("settings", {
    settings: { ...state.settings, language: e.target.value },
  });
  await render();
});
window.seven.on("change", (next) => {
  state = next;
  layout();
  if (
    ["overview", "dashboard"].includes(page) &&
    !$("#modal").open &&
    !draftDirty
  ) {
    const scroll = $("#content").scrollTop;
    render().then(() => {
      $("#content").scrollTop = scroll;
    });
  } else if (page === "players" && $("#players-body"))
    $("#players-body").innerHTML = playersHtml();
});
window.seven.on("log", ({ serverId, line }) => {
  if (!serverId) return;
  (logs[serverId] ??= []).push(line);
  if (logs[serverId].length > 2500) logs[serverId].shift();
  if (serverId === selected) {
    if (page === "console") renderLogs();
    if (page === "dashboard" && $("#activity"))
      $("#activity").innerHTML = activityHtml();
  }
});
window.seven.on("chat", ({ serverId, row }) => {
  (chats[serverId] ??= []).push(row);
  if (chats[serverId].length > 500) chats[serverId].shift();
  if (page === "chat" && serverId === selected) renderChat();
});
(async () => {
  try {
    state = await api("snapshot");
    await render();
    setTimeout(() => $("#splash").classList.add("gone"), 1700);
  } catch (e) {
    $("#loading-text").textContent = e.message;
  }
})();

$("#server-switch").addEventListener("change", (e) =>
  navigate(e.target.value ? "dashboard" : "overview", e.target.value || null),
);

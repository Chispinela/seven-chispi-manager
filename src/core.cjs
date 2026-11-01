const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { XMLParser, XMLValidator } = require("fast-xml-parser");
class AppError extends Error {
  constructor(code, detail = "") {
    super(detail || code);
    this.code = code;
    this.detail = detail;
  }
}
const fail = (code, detail) => {
  throw new AppError(code, detail);
};
const exists = async (p) => !!(await fs.stat(p).catch(() => null));
const clone = (x) => structuredClone(x);
async function atomic(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = file + "." + crypto.randomUUID() + ".tmp";
  try {
    await fs.writeFile(tmp, content);
    await fs.rename(tmp, file);
  } finally {
    await fs.rm(tmp, { force: true }).catch(() => {});
  }
}
class Store {
  constructor(root, codec = { encode: (x) => x, decode: (x) => x }) {
    this.root = root;
    this.codec = codec;
    this.file = path.join(root, "profiles.json");
    this.state = {
      schema: 1,
      settings: {
        language: "es",
        theme: "dark",
        minimizeToTray: true,
        steamcmd: "",
      },
      servers: [],
      branches: [],
      branchesAt: null,
    };
  }
  async load() {
    if (await exists(this.file)) {
      try {
        this.state = this.codec.decode(
          JSON.parse(await fs.readFile(this.file, "utf8")),
        );
      } catch (e) {
        fail("stateDamaged", e.message);
      }
    }
    return this.state;
  }
  async save() {
    const snapshot = JSON.stringify(this.codec.encode(this.state), null, 2);
    const run = () => atomic(this.file, snapshot);
    const out = (this.queue || Promise.resolve()).then(run, run);
    this.queue = out.catch(() => {});
    return out;
  }
}
function inside(root, p) {
  const rel = path.relative(path.resolve(root), path.resolve(p));
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}
function overlap(a, b) {
  a = path.resolve(a).toLowerCase();
  b = path.resolve(b).toLowerCase();
  return a === b || inside(a, b) || inside(b, a);
}
function safeName(s) {
  if (
    typeof s !== "string" ||
    !s.trim() ||
    s.length > 100 ||
    /[<>:"/\\|?*\x00-\x1f]/.test(s) ||
    /^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(s) ||
    /[. ]$/.test(s)
  )
    fail("invalidName");
  return s;
}
function port(v) {
  if (!/^\d+$/.test(String(v)) || Number(v) < 1024 || Number(v) > 65532)
    fail("invalidPort");
  return Number(v);
}
function validateServer(s, others = []) {
  safeName(s.name);
  if (!["local", "remote"].includes(s.mode)) fail("invalidMode");
  if (!/^[a-zA-Z0-9_.-]+$/.test(s.branch)) fail("invalidBranch");
  if (
    s.mode === "local" &&
    (!s.directory ||
      !path.isAbsolute(s.directory) ||
      path.resolve(s.directory) === path.parse(path.resolve(s.directory)).root)
  )
    fail("invalidPath");
  if (!s.host || /[\s/\\]/.test(s.host)) fail("invalidHost");
  const ps = [
    port(s.config.ServerPort),
    port(s.config.TelnetPort),
    port(s.config.WebDashboardPort),
  ];
  const reserved = [ps[0], ps[0] + 1, ps[0] + 2, ps[0] + 3, ps[1], ps[2]];
  if (new Set(reserved).size !== 6) fail("portConflict");
  if (!/^[A-Za-z0-9_ .-]+$/.test(s.config.GameName || ""))
    fail("invalidGameName");
  if (
    !Number.isInteger(Number(s.config.ServerMaxPlayerCount)) ||
    Number(s.config.ServerMaxPlayerCount) < 1 ||
    Number(s.config.ServerMaxPlayerCount) > 128
  )
    fail("invalidSlots");
  for (const o of others.filter((o) => o.id !== s.id)) {
    if (s.mode === "local" && o.mode === "local") {
      if (overlap(s.directory, o.directory)) fail("sharedDirectory");
      const op = [
        port(o.config.ServerPort),
        port(o.config.ServerPort) + 1,
        port(o.config.ServerPort) + 2,
        port(o.config.ServerPort) + 3,
        port(o.config.TelnetPort),
        port(o.config.WebDashboardPort),
      ];
      if (reserved.some((x) => op.includes(x))) fail("portConflict");
    }
  }
  return s;
}
function defaultServer(root, index = 0) {
  const id = crypto.randomUUID();
  return {
    id,
    name: "Seven " + (index + 1),
    mode: "local",
    directory: path.join(root, "servers", id),
    host: "127.0.0.1",
    branch: "public",
    autoConnect: true,
    autoRestart: false,
    connectCommands: "",
    config: {
      ServerName: "Seven Chispi",
      ServerDescription: "",
      ServerWebsiteURL: "",
      ServerPassword: "",
      ServerLoginConfirmationText: "",
      Region: "Europe",
      Language: "Spanish",
      ServerPort: String(26900 + index * 10),
      ServerVisibility: "2",
      ServerMaxPlayerCount: "8",
      TelnetEnabled: "true",
      TelnetPort: String(8091 + index * 10),
      TelnetPassword: "",
      WebDashboardEnabled: "false",
      WebDashboardPort: String(8090 + index * 10),
      EnableMapRendering: "false",
      TerminalWindowEnabled: "false",
      EACEnabled: "true",
      GameWorld: "Navezgane",
      GameName: "ChispiWorld",
      WorldGenSeed: "Chispi",
      WorldGenSize: "6144",
      UserDataFolder: path.join(root, "servers", id, "userdata"),
    },
    events: [],
    schedules: [],
    groups: [],
    bags: [],
    teleports: [],
    players: {},
    variables: {},
    deliveries: [],
    security: {
      maxPing: 250,
      failures: 3,
      pingEnabled: false,
      vacEnabled: false,
      steamApiKey: "",
      maxVacBans: 0,
    },
    discord: {
      enabled: false,
      token: "",
      channelId: "",
      adminRoleId: "",
      relay: false,
    },
    api: { baseUrl: "", tokenName: "", token: "" },
    voting: { enabled: false, apiKey: "", url: "", bagId: "" },
    economy: {
      enabled: false,
      joinReward: 0,
      minuteReward: 0,
      teleportCost: 0,
      teleportCooldown: 300,
    },
    backup: { enabled: false, intervalMinutes: 120, keep: 10 },
    chat: [],
  };
}
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseAttributeValue: false,
  processEntities: true,
});
function parseConfig(xml) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true)
    fail("invalidXml");
  const doc = xmlParser.parse(xml);
  if (!doc.ServerSettings) fail("invalidXml");
  let arr = doc.ServerSettings.property || [];
  if (!Array.isArray(arr)) arr = [arr];
  const result = {};
  for (const p of arr) {
    if (["__proto__", "prototype", "constructor"].includes(p.name))
      fail("invalidXml");
    if (typeof p.name === "string" && p.value !== undefined)
      result[p.name] = String(p.value);
  }
  if (!Object.keys(result).length) fail("invalidXml");
  return result;
}
function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;");
}
function buildConfig(values, template = "") {
  const seen = new Set();
  // Preserve version-specific comments and unknown settings. Never activate commented properties.
  const body = template
    ? template.replace(/<!--[\s\S]*?-->|<property\b[^>]*\/>/g, (m) => {
        if (m.startsWith("<!--")) return m;
        const n = m.match(/\bname\s*=\s*"([^"]+)"/);
        if (!n) return m;
        const k = n[1];
        seen.add(k);
        return Object.hasOwn(values, k)
          ? m.replace(
              /\bvalue\s*=\s*"[^"]*"/,
              () => `value="${escapeXml(values[k])}"`,
            )
          : m;
      })
    : '<?xml version="1.0" encoding="UTF-8"?>\n<ServerSettings>\n</ServerSettings>\n';
  const extra = Object.entries(values)
    .filter(([k]) => !seen.has(k))
    .map(
      ([k, v]) =>
        `  <property name="${escapeXml(k)}" value="${escapeXml(v)}"/>`,
    )
    .join("\n");
  return body.replace("</ServerSettings>", extra + "\n</ServerSettings>");
}
function parseVdf(text) {
  const tokens = text.match(/"(?:\\.|[^"\\])*"|[{}]/g) || [];
  let i = 0;
  function obj() {
    let o = {};
    while (i < tokens.length) {
      let k = tokens[i++];
      if (k === "}") break;
      if (k === "{") continue;
      k = JSON.parse(k);
      let v = tokens[i++];
      o[k] = v === "{" ? obj() : JSON.parse(v || '""');
    }
    return o;
  }
  return obj();
}
function branchesFromInfo(text) {
  const start = text.indexOf('"294420"');
  if (start < 0) fail("branchesUnavailable");
  let doc;
  try {
    doc = parseVdf(text.slice(start));
  } catch {
    fail("branchesUnavailable");
  }
  const b = doc["294420"]?.depots?.branches;
  if (!b) fail("branchesUnavailable");
  return Object.entries(b)
    .filter(([, x]) => !x.pwdrequired || x.pwdrequired === "0")
    .map(([id, x]) => ({ id, label: x.description || id, buildId: x.buildid }))
    .sort((a, b) =>
      a.id === "public"
        ? -1
        : b.id === "public"
          ? 1
          : b.id.localeCompare(a.id, undefined, { numeric: true }),
    );
}
function parsePlayers(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(
      /\d+\.\s+id=(\d+),\s*(.*?),\s*pos=\((.*?)\).*?health=([\d.-]+).*?deaths=(\d+).*?zombies=(\d+).*?players=(\d+).*?score=([\d.-]+).*?level=([\d.-]+).*?(?:platformid|steamid)=([^,\s]+).*?(?:ping=(\d+))?/i,
    );
    if (m) {
      const ping = line.match(/ping=(\d+)/i);
      const cross = line.match(/crossplatformid=([^,\s]+)/i);
      rows.push({
        entityId: m[1],
        name: m[2],
        pos: m[3],
        health: Number(m[4]),
        deaths: Number(m[5]),
        zombies: Number(m[6]),
        kills: Number(m[7]),
        score: Number(m[8]),
        level: Number(m[9]),
        platformId: m[10],
        id: cross?.[1] || m[10],
        ping: ping ? Number(ping[1]) : null,
        ip: line.match(/ip=([^,\s]+)/i)?.[1] || "",
      });
    }
  }
  return rows;
}
function oneLine(s) {
  if (
    typeof s !== "string" ||
    !s.trim() ||
    s.length > 4096 ||
    /[\r\n\x00]/.test(s)
  )
    fail("invalidCommand");
  return s;
}
function quote(s) {
  return '"' + String(s).replace(/["\r\n\\]/g, " ") + '"';
}
function target(s) {
  if (!/^(\d+|(?:Steam|EOS)_[A-Za-z0-9_-]+)$/.test(String(s)))
    fail("invalidPlayer");
  return String(s);
}
module.exports = {
  AppError,
  fail,
  exists,
  atomic,
  Store,
  clone,
  inside,
  overlap,
  safeName,
  port,
  validateServer,
  defaultServer,
  parseConfig,
  buildConfig,
  parseVdf,
  branchesFromInfo,
  parsePlayers,
  oneLine,
  quote,
  target,
};

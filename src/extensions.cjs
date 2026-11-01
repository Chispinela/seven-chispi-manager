const { execFile } = require("node:child_process");
const path = require("node:path");
const { fail } = require("./core.cjs");
function defaults(s) {
  s.notifications ??= {
    enabled: false,
    host: "",
    port: 465,
    secure: true,
    user: "",
    password: "",
    from: "",
    to: "",
  };
  s.programs ??= [];
}
async function email(s, subject, text) {
  defaults(s);
  const n = s.notifications;
  if (!n.enabled || !n.host || !n.from || !n.to) fail("mailRequired");
  const mailer = require("nodemailer").createTransport({
    host: n.host,
    port: Number(n.port),
    secure: !!n.secure,
    auth: n.user ? { user: n.user, pass: n.password } : undefined,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
  return mailer.sendMail({
    from: n.from,
    to: n.to,
    subject: String(subject).slice(0, 200),
    text: String(text).slice(0, 20000),
  });
}
async function program(s, name, context = {}) {
  defaults(s);
  const p = s.programs.find((p) => p.name === name && p.enabled);
  if (
    !p ||
    !path.isAbsolute(p.executable) ||
    path.extname(p.executable).toLowerCase() !== ".exe" ||
    !Array.isArray(p.args) ||
    p.args.some((x) => typeof x !== "string")
  )
    fail("programRequired");
  const args = p.args.map((arg) =>
    arg.replace(/\{(\w+)\}/g, (_, key) => String(context[key] ?? "")),
  );
  return new Promise((resolve, reject) =>
    execFile(
      p.executable,
      args,
      {
        cwd: path.dirname(p.executable),
        windowsHide: true,
        timeout: Math.max(1000, Math.min(300000, Number(p.timeout) || 30000)),
        maxBuffer: 1024 * 1024,
      },
      (error, stdout, stderr) =>
        error ? reject(error) : resolve(stdout + stderr),
    ),
  );
}
module.exports = { defaults, email, program };

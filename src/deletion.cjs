const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const C = require("./core.cjs");
const same = (a, b) =>
  path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
const contains = (a, b) => same(a, b) || C.inside(a, b);
async function canonical(p) {
  return fs.realpath(p).catch(() => path.resolve(p));
}
async function validate(server, root, others = [], extraProtected = []) {
  if (server.mode !== "local") C.fail("localOnly");
  const requested = path.resolve(server.directory || "");
  if (!server.directory || !path.isAbsolute(server.directory))
    C.fail("unsafeDeletion");
  const stat = await fs.lstat(requested).catch((e) => {
    if (e.code === "ENOENT") return null;
    throw e;
  });
  if (stat?.isSymbolicLink() || (stat && !stat.isDirectory()))
    C.fail("unsafeDeletion");
  const original = await canonical(requested),
    home = os.homedir();
  const protectedPaths = [
    ...extraProtected,
    path.parse(original).root,
    home,
    ...[
      "Desktop",
      "Documents",
      "Downloads",
      "Pictures",
      "Videos",
      "Music",
      "AppData",
    ].map((x) => path.join(home, x)),
    root,
    path.join(__dirname, ".."),
    path.dirname(process.execPath),
  ];
  for (const p of protectedPaths)
    if (contains(original, await canonical(p)))
      C.fail("unsafeDeletion", original);
  for (const s of others.filter(
    (x) => x.id !== server.id && x.mode === "local",
  ))
    if (C.overlap(original, await canonical(s.directory)))
      C.fail("sharedDirectory");
  return { original, exists: !!stat };
}
async function stage(server, root, others, extraProtected = []) {
  const result = await validate(server, root, others, extraProtected);
  if (!result.exists) return null;
  const staged = path.join(
    path.dirname(result.original),
    "." +
      path.basename(result.original) +
      ".seven-delete-" +
      crypto.randomUUID(),
  );
  const plan = { original: result.original, staged };
  assertPlan(plan);
  await fs.rename(result.original, staged);
  return plan;
}
function assertPlan(plan) {
  if (
    !path.isAbsolute(plan.original) ||
    !path.isAbsolute(plan.staged) ||
    !same(path.dirname(plan.original), path.dirname(plan.staged)) ||
    !path
      .basename(plan.staged)
      .startsWith("." + path.basename(plan.original) + ".seven-delete-") ||
    !C.inside(path.dirname(plan.original), plan.staged)
  )
    C.fail("unsafeDeletion");
}
async function rollback(plan) {
  if (!plan) return;
  assertPlan(plan);
  const stat = await fs.lstat(plan.staged).catch((e) => {
    if (e.code === "ENOENT") return null;
    throw e;
  });
  if (!stat) return;
  if (
    stat.isSymbolicLink() ||
    !same(await fs.realpath(plan.staged), plan.staged) ||
    (await C.exists(plan.original))
  )
    C.fail("deletionRecovery", plan.staged);
  await fs.rename(plan.staged, plan.original);
}
async function purge(plan) {
  if (!plan) return;
  assertPlan(plan);
  const stat = await fs.lstat(plan.staged);
  if (
    stat.isSymbolicLink() ||
    !stat.isDirectory() ||
    !same(await fs.realpath(plan.staged), plan.staged)
  )
    C.fail("unsafeDeletion");
  await fs.rm(plan.staged, {
    recursive: true,
    force: false,
    maxRetries: 2,
    retryDelay: 200,
  });
}
module.exports = { validate, stage, rollback, purge };

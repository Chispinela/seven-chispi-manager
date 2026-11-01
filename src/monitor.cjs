const { execFile } = require("node:child_process");
const os = require("node:os");
function sample(pids) {
  const ids = pids.filter((x) => Number.isSafeInteger(x) && x > 0);
  if (!ids.length || process.platform !== "win32") return Promise.resolve([]);
  const command = `@(Get-Process -Id ${ids.join(",")} -ErrorAction SilentlyContinue | ForEach-Object { [PSCustomObject]@{pid=$_.Id;ram=$_.WorkingSet64;cpu=$_.TotalProcessorTime.TotalMilliseconds;threads=$_.Threads.Count} }) | ConvertTo-Json -Compress`;
  return new Promise((resolve, reject) =>
    execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", command],
      { windowsHide: true, timeout: 10000, maxBuffer: 65536 },
      (error, stdout) => {
        if (error) return reject(error);
        try {
          const data = JSON.parse(stdout || "[]");
          resolve(Array.isArray(data) ? data : [data]);
        } catch (e) {
          reject(e);
        }
      },
    ),
  );
}
function apply(rt, data) {
  const now = Date.now();
  let cpu = null;
  if (rt.cpuSample)
    cpu = Math.max(
      0,
      Math.min(
        100,
        ((data.cpu - rt.cpuSample.cpu) /
          (now - rt.cpuSample.at) /
          os.cpus().length) *
          100,
      ),
    );
  rt.cpuSample = { cpu: data.cpu, at: now };
  rt.metrics = {
    ...rt.metrics,
    ramMb: Math.round(data.ram / 1024 / 1024),
    cpu: cpu === null ? null : Math.round(cpu * 10) / 10,
    threads: data.threads,
  };
}
module.exports = { sample, apply };

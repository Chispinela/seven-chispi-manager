const net = require("node:net");
const { EventEmitter } = require("node:events");
const { AppError, oneLine } = require("./core.cjs");
class Telnet extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
    this.ready = false;
    this.queue = Promise.resolve();
    this.pending = null;
    this.tail = "";
    this.lines = "";
  }
  connect(host, port, password = "", timeout = 12000) {
    this.close();
    this.tail = "";
    this.authSent = false;
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (e) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        e ? reject(e) : resolve();
      };
      const timer = setTimeout(() => {
        finish(new AppError("connectionTimeout"));
        this.close();
      }, timeout);
      const socket = (this.socket = net.createConnection({
        host,
        port: Number(port),
      }));
      socket.setNoDelay(true);
      socket.on("connect", () => {
        this.connected = true;
      });
      socket.on("data", (chunk) => {
        const data = [];
        for (let i = 0; i < chunk.length; i++) {
          if (chunk[i] === 255) {
            const cmd = chunk[++i];
            if (cmd >= 251 && cmd <= 254) {
              const opt = chunk[++i];
              socket.write(
                Buffer.from([255, cmd === 253 || cmd === 254 ? 252 : 254, opt]),
              );
            } else if (cmd === 250) {
              while (
                i < chunk.length &&
                !(chunk[i] === 255 && chunk[i + 1] === 240)
              )
                i++;
              i++;
            }
            continue;
          }
          data.push(chunk[i]);
        }
        const text = Buffer.from(data).toString("utf8").replace(/\x00/g, "");
        this.tail = (this.tail + text).slice(-5000);
        if (/password\s*:/i.test(this.tail) && !this.authSent) {
          socket.write(password + "\r\n");
          this.authSent = true;
          this.tail = "";
          return;
        }
        if (
          /incorrect password|password incorrect|authentication failed/i.test(
            this.tail,
          )
        ) {
          finish(new AppError("badPassword"));
          this.close();
          return;
        }
        if (
          !this.ready &&
          /Press ['"]?help|Logon successful|Connected with 7DTD server|Please enter a command|Welcome to the 7 Days/i.test(
            this.tail,
          )
        ) {
          this.ready = true;
          finish();
          this.emit("ready");
        }
        this.lines += text;
        let ix;
        while ((ix = this.lines.indexOf("\n")) >= 0) {
          const line = this.lines.slice(0, ix).replace(/\r$/, "");
          this.lines = this.lines.slice(ix + 1);
          if (line) this.emit("line", line);
        }
        if (this.pending) {
          this.pending.output += text;
          clearTimeout(this.pending.idle);
          this.pending.idle = setTimeout(() => this.complete(), 350);
        }
      });
      socket.on("error", (e) => {
        finish(new AppError("connectionFailed", e.code || e.message));
        this.emit("failure", e.message);
      });
      socket.on("close", () => {
        this.connected = false;
        this.ready = false;
        if (this.pending) this.complete(new AppError("disconnected"));
        finish(new AppError("disconnected"));
        this.emit("closed");
      });
    });
  }
  complete(error) {
    const p = this.pending;
    if (!p) return;
    this.pending = null;
    clearTimeout(p.idle);
    clearTimeout(p.timer);
    error ? p.reject(error) : p.resolve(p.output);
  }
  command(cmd, timeout = 8000) {
    oneLine(cmd);
    const run = () =>
      new Promise((resolve, reject) => {
        if (!this.ready || !this.socket || this.socket.destroyed) {
          reject(new AppError("notConnected"));
          return;
        }
        this.pending = {
          resolve,
          reject,
          output: "",
          timer: setTimeout(
            () => this.complete(new AppError("commandTimeout")),
            timeout,
          ),
        };
        this.socket.write(cmd + "\r\n");
      });
    const out = this.queue.then(run, run);
    this.queue = out.catch(() => {});
    return out;
  }
  close() {
    this.connected = false;
    this.ready = false;
    if (this.pending) this.complete(new AppError("disconnected"));
    this.socket?.destroy();
    this.socket = null;
    this.lines = "";
  }
}
module.exports = { Telnet };

const { test } = require("node:test");
const assert = require("node:assert/strict");
const net = require("node:net");
const { Telnet } = require("../src/telnet.cjs");
async function server(t, handler) {
  const sockets = new Set();
  const srv = net.createServer((s) => {
    sockets.add(s);
    s.on("close", () => sockets.delete(s));
    handler(s);
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  t.after(() => {
    for (const s of sockets) s.destroy();
    srv.close();
  });
  return srv.address().port;
}
test("fragmented password prompt, negotiation and queued command responses", async (t) => {
  const port = await server(t, (s) => {
    s.write(Buffer.from([255, 253, 1]));
    s.write("Please enter pass");
    setTimeout(() => s.write("word:"), 20);
    let authed = false;
    s.on("data", (b) => {
      if (b[0] === 255) return;
      const text = b.toString().trim();
      if (!authed) {
        assert.equal(text, "secret");
        authed = true;
        s.write("*** Connected with 7DTD server.\r\n");
      } else {
        s.write("result " + text + "\r\n");
      }
    });
  });
  const c = new Telnet();
  t.after(() => c.close());
  await c.connect("127.0.0.1", port, "secret", 1000);
  assert.equal(c.ready, true);
  const [a, b] = await Promise.all([c.command("first"), c.command("second")]);
  assert.match(a, /first/);
  assert.doesNotMatch(a, /second/);
  assert.match(b, /second/);
});
test("incorrect password is reported once without retry loops", async (t) => {
  const port = await server(t, (s) => {
    s.write("Please enter password:");
    s.once("data", () => s.write("Password incorrect, please enter password:"));
  });
  const c = new Telnet();
  t.after(() => c.close());
  await assert.rejects(
    c.connect("127.0.0.1", port, "wrong", 1000),
    (e) => e.code === "badPassword",
  );
  assert.equal(c.ready, false);
});
test("disconnect rejects pending commands without successful result", async (t) => {
  const port = await server(t, (s) => {
    s.write("*** Connected with 7DTD server.\r\n");
    s.once("data", () => s.destroy());
  });
  const c = new Telnet();
  t.after(() => c.close());
  await c.connect("127.0.0.1", port, "", 1000);
  await assert.rejects(
    c.command("saveworld"),
    (e) => e.code === "disconnected",
  );
});

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const C = require("../src/core.cjs");
const { triggers } = require("../src/automation.cjs");
const tick = () => new Promise((r) => setTimeout(r, 15));
async function view(t, gameOptions = {}) {
  const root = path.resolve(__dirname, ".."),
    s = C.defaultServer(path.join(root, "test-data"));
  s.name = "Test server";
  s.config.SandboxCode = "ABC";
  s.health = { enabled: false, failures: 3, maxRamMb: 0, avoidBloodMoon: true };
  const snapshot = {
    settings: {
      language: "es",
      theme: "dark",
      minimizeToTray: true,
      steamcmd: "",
    },
    servers: [s],
    runtime: {
      [s.id]: { status: "stopped", players: [], metrics: {}, connected: false },
    },
    branches: [
      { id: "public", label: "Stable" },
      { id: "alpha21.2", label: "Alpha21.2" },
    ],
    triggers,
  };
  const dom = new JSDOM(
    fs.readFileSync(path.join(root, "ui/index.html"), "utf8"),
    {
      url: "file:///" + root.replaceAll("\\", "/") + "/ui/index.html",
      runScripts: "outside-only",
      pretendToBeVisual: true,
    },
  );
  const w = dom.window;
  t.after(() => w.close());
  const calls = [],
    errors = [],
    listeners = {};
  w.addEventListener("error", (e) => errors.push(e.error));
  w.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  w.seven = {
    on: (name, fn) => (listeners[name] = fn),
    call: async (action, args) => {
      calls.push({ action, args });
      let value;
      switch (action) {
        case "snapshot":
          value = snapshot;
          break;
        case "defaults":
          value = C.defaultServer(path.join(root, "test-data"), 1);
          break;
        case "configInfo":
          value = {
            values: s.config,
            comments: {},
            installed: true,
            sandbox: true,
            ...gameOptions,
          };
          break;
        case "mods":
        case "backups":
        case "logs":
        case "chat":
          value = [];
          break;
        case "settings":
          snapshot.settings = args.settings;
          listeners.change(snapshot);
          value = true;
          break;
        case "saveServer":
          const index = snapshot.servers.findIndex(
            (server) => server.id === args.server.id,
          );
          snapshot.servers[index] = args.server;
          listeners.change(snapshot);
          value = args.server;
          break;
        case "saveCollection":
          s[args.key] = args.list;
          listeners.change(snapshot);
          value = args.list;
          break;
        case "removeServer":
          snapshot.servers = snapshot.servers.filter((x) => x.id !== args.id);
          listeners.change(snapshot);
          value = true;
          break;
        case "catalog":
          value = { items: [], entities: [], buffs: [] };
          break;
        default:
          value = true;
      }
      return { ok: true, value };
    },
  };
  w.eval(fs.readFileSync(path.join(root, "ui/i18n.js"), "utf8"));
  w.eval(fs.readFileSync(path.join(root, "ui/app.js"), "utf8"));
  await tick();
  return {
    w,
    errors,
    calls,
    snapshot,
    s,
    click: async (selector) => {
      const el = w.document.querySelector(selector);
      assert.ok(el, selector);
      el.click();
      await tick();
    },
  };
}
test("all six locales expose the same complete translation keys", async (t) => {
  const { w } = await view(t);
  const keys = Object.keys(w.I18N.es);
  for (const lang of ["en", "es", "pt", "zh", "ja", "ru"]) {
    assert.equal(Object.keys(w.I18N[lang]).length, keys.length);
    for (const key of keys) assert.ok(w.I18N[lang][key], lang + ": " + key);
  }
  for (const trigger of triggers) assert.ok(w.I18N.es[trigger], trigger);
});
test("all management pages render in every locale without script errors", async (t) => {
  const { w, errors, click } = await view(t);
  await click("[data-open]");
  for (const lang of ["es", "en", "pt", "zh", "ja", "ru"]) {
    const sel = w.document.querySelector("#language");
    sel.value = lang;
    sel.dispatchEvent(new w.Event("change", { bubbles: true }));
    await tick();
    for (const page of [
      "dashboard",
      "config",
      "console",
      "players",
      "chat",
      "mods",
      "backups",
      "events",
      "schedules",
      "groups",
      "teleports",
      "inventory",
      "map",
      "integrations",
    ]) {
      await click(`[data-nav="${page}"]`);
      assert.ok(
        w.document.querySelector("#content").textContent.trim(),
        lang + ":" + page,
      );
      assert.doesNotMatch(
        w.document.querySelector("#content").textContent,
        /undefined|\[object Object\]/,
      );
    }
  }
  assert.deepEqual(errors, []);
});
test("every event, task and community editor opens with usable save controls", async (t) => {
  const { w, click, errors } = await view(t);
  await click("[data-open]");
  for (const page of ["events", "schedules", "groups", "teleports"]) {
    await click(`[data-nav="${page}"]`);
    await click('[data-action="addEntry"]');
    assert.ok(w.document.querySelector("#modal").open);
    assert.ok(w.document.querySelector("#modal [name=name]"));
    assert.ok(w.document.querySelector("#modal button[type=submit]"));
    await click('#modal [data-action="closeModal"]');
  }
  assert.deepEqual(errors, []);
});
test("native version options, protection and monitoring settings render correctly", async (t) => {
  const { w, click } = await view(t);
  await click("[data-open]");
  await click("[data-nav=config]");
  for (const tab of ["advanced", "security", "health"]) {
    await click(`[data-tab="${tab}"]`);
    assert.ok(w.document.querySelector("form"));
    assert.doesNotMatch(
      w.document.querySelector("#content").textContent,
      /undefined|\[object Object\]/,
    );
  }
  await click("[data-tab=advanced]");
  assert.equal(w.document.querySelector("[name=SandboxCode]").value, "ABC");
});
test("rewards and voting sections are absent in all six languages", async (t) => {
  const { w, click } = await view(t);
  await click("[data-open]");
  for (const lang of ["es", "en", "pt", "zh", "ja", "ru"]) {
    const select = w.document.querySelector("#language");
    select.value = lang;
    select.dispatchEvent(new w.Event("change", { bubbles: true }));
    await tick();
    assert.equal(w.document.querySelector("[data-nav=rewards]"), null);
    assert.equal(w.document.querySelector("[data-nav=voting]"), null);
  }
});
test("visible delete buttons require confirmation and remove the selected profile", async (t) => {
  const { w, click, calls, s, snapshot } = await view(t);
  const card = w.document.querySelector(
    `[data-action=removeServer][data-id="${s.id}"]`,
  );
  assert.ok(card);
  assert.equal(card.disabled, false);
  await click("[data-open]");
  const control = w.document.querySelector(
    ".page-head [data-action=removeServer]",
  );
  assert.equal(control.textContent.trim(), w.t("deleteServer"));
  await click(".page-head [data-action=removeServer]");
  assert.match(
    w.document.querySelector("#modal-body").textContent,
    /conservarán/,
  );
  await click("#modal [data-action=closeModal]");
  assert.equal(
    calls.some((c) => c.action === "removeServer"),
    false,
  );
  await click(".page-head [data-action=removeServer]");
  w.document
    .querySelector("#modal-form")
    .dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await tick();
  await tick();
  assert.equal(calls.filter((c) => c.action === "removeServer").length, 1);
  assert.equal(calls.find((c) => c.action === "removeServer").args.id, s.id);
  assert.equal(
    calls.find((c) => c.action === "removeServer").args.deleteFiles,
    false,
  );
  assert.equal(snapshot.servers.length, 0);
});
test("file deletion is an explicit choice and shows the exact directory", async (t) => {
  const { w, click, calls, s } = await view(t);
  await click("[data-open]");
  await click(".page-head [data-action=removeServer]");
  assert.equal(
    w.document.querySelector("[name=fileAction]:checked").value,
    "keep",
  );
  assert.equal(
    w.document.querySelector(".delete-path code").textContent,
    s.directory,
  );
  w.document.querySelector("[name=fileAction][value=delete]").checked = true;
  w.document
    .querySelector("#modal-form")
    .dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await tick();
  await tick();
  assert.equal(
    calls.find((c) => c.action === "removeServer").args.deleteFiles,
    true,
  );
});
test("remote profile deletion offers no local file deletion", async (t) => {
  const { w, click, s } = await view(t);
  s.mode = "remote";
  await click("[data-open]");
  await click(".page-head [data-action=removeServer]");
  assert.equal(
    w.document.querySelector("[name=fileAction][value=delete]"),
    null,
  );
  assert.ok(w.document.querySelector("[name=fileAction][value=keep]").checked);
});
test("delete controls are disabled while a server is active", async (t) => {
  const { w, click, s, snapshot } = await view(t);
  snapshot.runtime[s.id].status = "running";
  snapshot.runtime[s.id].connected = true;
  await click("[data-open]");
  assert.equal(
    w.document.querySelector(".page-head [data-action=removeServer]").disabled,
    true,
  );
});

test("Sandbox controls save a code without losing other rules and the world picker saves the exact map", async (t) => {
  const { w, calls, click } = await view(t, {
    options: require("../assets/sandbox-options.json").versions["3.2.0"],
    worlds: ["Navezgane", "RWG", "Pregen08k01"],
  });
  await click("[data-open]");
  await click('[data-nav="config"]');
  await click("[data-tab=advanced]");
  const set = (selector, value, event) => {
    const field = w.document.querySelector(selector);
    assert.ok(field, selector);
    field.value = value;
    field.dispatchEvent(new w.Event(event, { bubbles: true }));
  };
  set("#native-SandboxCode", "AAAJZZB", "input");
  set("#sandbox-BI", "E", "change");
  set("#world-picker", "Pregen08k01", "change");
  w.document
    .querySelector("#native-form")
    .dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await tick();
  const saved = calls.findLast(({ action }) => action === "saveServer").args
    .server.config;
  assert.equal(saved.SandboxCode, "AAAJBIEZZB");
  assert.equal(saved.GameWorld, "Pregen08k01");
});

test("the main configuration saves a pasted SandboxCode for the selected profile", async (t) => {
  const { w, calls, click } = await view(t);
  await click("[data-open]");
  await click('[data-nav="config"]');
  const code = w.document.querySelector("#sandbox-direct");
  assert.ok(code);
  code.value = "  AAAJBIE\n";
  w.document.querySelector("#config-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await tick();
  assert.equal(calls.findLast(({action}) => action === "saveServer").args.server.config.SandboxCode, "AAAJBIE");
});

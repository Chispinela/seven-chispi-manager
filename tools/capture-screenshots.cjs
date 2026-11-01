// Capture the actual application using isolated, fictional, stopped profiles.
const { _electron: electron } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const C = require('../src/core.cjs');

(async () => {
  const root = path.resolve(__dirname, '..');
  const fixture = path.join(root, 'output', 'gallery-' + Date.now());
  const images = path.join(root, 'docs', 'screenshots');
  fs.mkdirSync(images, { recursive: true });
  const store = new C.Store(path.join(fixture, 'state'));
  store.state.settings = { language: 'en', theme: 'dark', minimizeToTray: false, steamcmd: '' };
  store.state.branches = [{ id: 'public', label: 'Latest stable' }, { id: 'alpha21.2', label: 'Alpha 21.2' }];
  store.state.branchesAt = Date.now();
  store.state.servers = ['Chispi Community', 'Friends Survival'].map((name, i) => {
    const s = C.defaultServer(store.root, i);
    s.name = name;
    s.directory = 'C:\\SevenServers\\' + (i ? 'Friends' : 'Community');
    s.config.UserDataFolder = path.join(s.directory, 'userdata');
    s.config.ServerName = name;
    s.config.Language = 'English';
    s.config.GameName = i ? 'FriendsWorld' : 'CommunityWorld';
    s.autoConnect = false;
    return s;
  });
  await store.save();
  const packaged = process.argv.includes('--packaged');
  const galleryEnv = { ...process.env, SEVEN_DATA_DIR: store.root };
  delete galleryEnv.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    executablePath: packaged ? path.join(root, require('../package.json').build.directories.output, 'win-unpacked', 'Seven Chispi Manager.exe') : undefined,
    args: [...(packaged ? [] : [root]), '--user-data-dir=' + path.join(fixture, 'electron')],
    env: galleryEnv,
  });
  const errors = [];
  try {
    const page = await app.firstWindow();
    page.on('pageerror', e => errors.push(e.message));
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1920, 1080));
    await page.waitForFunction(() => document.documentElement.lang === 'en' && document.querySelector('[data-open]'));
    await page.waitForTimeout(2000);
    const capture = async name => {
      await page.waitForTimeout(300);
      const visible = await page.locator('body').innerText() + await page.locator('input, textarea').evaluateAll(nodes => nodes.map(n => n.value).join('\n'));
      assert.ok(!/C:\\Users\\|192\.168\.\d|10\.\d+\.\d+\.\d+/.test(visible), 'Private path or address in capture');
      await page.screenshot({ path: path.join(images, name + '.png'), animations: 'disabled' });
    };
    await capture('overview-dark');
    await page.locator('#theme-toggle').click();
    await page.waitForSelector('body.light');
    await capture('overview-light');
    await page.locator('#theme-toggle').click();
    await page.locator('[data-open]').first().click();
    await page.locator('[data-nav="config"]').click();
    await page.waitForSelector('#config-form');
    await capture('configuration');
    await page.locator('[data-nav="mods"]').click();
    await capture('mods');
    await page.locator('#add-top').click();
    await page.waitForSelector('dialog[open]');
    await page.locator('dialog input[name="name"]').fill('Weekend Survival');
    await page.locator('dialog input[name="directory"]').fill('C:\\SevenServers\\Weekend');
    await capture('new-server');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(fixture, 'capture-report.json'), JSON.stringify({ resolution: '1920x1080', language: 'en', isolatedExamples: true, gameServersStarted: 0, images: fs.readdirSync(images), errors }, null, 2));
    console.log('Five English 1920x1080 application screenshots captured. No game servers started.');
  } finally { await app.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

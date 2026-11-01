# Screenshot gallery

The five PNG images in `screenshots/` are captures of the actual packaged Windows application at 1920 x 1080, in English. They show isolated, fictional profiles named Chispi Community and Friends Survival. Both are stopped; no players, running-server statistics, downloaded mods, or external accounts are fabricated.

The capture helper sets up disposable profiles under the ignored `output/` directory, disables automatic connections, uses loopback management addresses, and checks visible text and input values for private Windows paths and network addresses. The new-server form uses an example path. No server processes are started and no normal user profiles are read or changed. Screenshots are not AI-generated mockups.

Build and reproduce on Windows:

```powershell
npm ci
node node_modules/electron/install.js
npm run build
npm run screenshots
```

`tools/capture-screenshots.cjs` drives the packaged application with Playwright and records its report beside the disposable profiles. Playwright is a development-only dependency.

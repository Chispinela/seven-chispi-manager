# Validation and limitations

## Automated checks

The Windows test suite contains 50 tests covering XML preservation and entity rejection, folder/port isolation, Steam branch parsing, player parsing, serialized persistence, failure recovery, balances/transfers, interrupted delivery handling, schedules, mod import and enable/disable, symlink refusal, backup/restore, Telnet negotiation and errors, event parsing and limits, one-time Discord codes, areas, and personal destinations.

Interface tests render all management pages and editors in English, Spanish, Portuguese, Simplified Chinese, Japanese, and Russian. Tests verify that rewards/voting pages are absent and that deletion defaults to preserving files. Deletion tests exercise actual disposable directories, persistence failure, rollback, interrupted-operation recovery, protected/redirected paths, overlap, junctions, and external backup preservation.

The publication build reruns this suite. These checks supplement manual and runtime validation; they do not prove every external integration works.

## Previous real-server checks

During development, the official dedicated server app 294420, public branch V3.4.0 b9, was downloaded with SteamCMD and exercised on Windows. Validation waited for `StartGame done`, authenticated over Telnet, queried `version`, `lp`, and `gt`, saved with `saveworld`, and shut down with `shutdown`.

Two independent local installations were launched from the application and reached world-ready status simultaneously: game ports 26900 and 26910; Telnet ports 8091 and 8101. Both Navezgane worlds were subsequently saved and stopped. A backup produced through the packaged UI contained 155 entries with configuration, profile, and world data. These development runtime files and logs are deliberately excluded from publication.

No game clients joined those test worlds. Real-client multiplayer and access from another PC or over the Internet were not validated. Discord, SMTP, VAC, mod inventory APIs, and mod-specific commands require user configuration and have not all been exercised against live accounts/services. No fabricated map, inventory, or online-player data is used as proof.

Headless dedicated-server shader messages are not by themselves evidence of a failed world load. Readiness was checked explicitly rather than inferred from the process or an open Telnet port.

## Windows interface and gallery

Dark/light purple themes, profile creation, dashboard, resource display, controls, and confirmations were visually reviewed. The dark language dropdown was also fixed in the older local copy that remained open after the 1.0.3 package was created.

The public English gallery is captured from the packaged app at 1920 x 1080 with fictional, stopped profiles. It verifies presentation, language, and absence of page errors; it does not demonstrate a running game server. See [SCREENSHOTS.md](SCREENSHOTS.md).

## Publication version 1.0.4

Includes the dark/light dropdown correction and updates to the ZIP and Discord libraries. At publication preparation time, `npm audit --omit=dev` reported zero known vulnerabilities in production dependencies. Development-tool advisories can still exist, and audit results change as new reports are published. The executable has product metadata and an icon but is not signed with a publisher certificate.

## Reproduce

On Windows x64 with Node.js 24 or later:

```powershell
npm ci
node node_modules/electron/install.js
npm test
npm run build
npm run screenshots
```

Use separate disposable server folders for game tests and wait for the Running status/world-ready message before judging startup. Stop test servers before rebuilding a locked executable. Never test destructive actions against production worlds.

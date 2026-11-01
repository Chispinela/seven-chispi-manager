# Features and requirements

Seven Chispi Manager is an independent Windows x64 desktop application for 7 Days to Die. Functional review of RAT inspired the scope, but its code, binaries, libraries, themes, and assets are not included. The implementation and file formats are independent. Development used extensive ChatGPT/Codex assistance; artwork provenance is documented in [BRAND.md](BRAND.md).

## Servers and versions

- Multiple local and remote profiles, each with its own configuration.
- Local profiles use separate installation folders, UserDataFolder paths, worlds, Mods folders, ports, and backups.
- Official dedicated-server installation and validation via SteamCMD, app 294420. SteamCMD is obtained from Valve when needed.
- Refreshable Steam branch discovery and an exact branch field for future versions. Historical branches are selectable only while Steam offers them. Clients must match the server version.
- Start, save, stop, restart with a cancelable countdown, and force stop for an unresponsive local process.
- Running status is reported after the world-ready log message, rather than immediately after launching the process.
- Folder and port overlap detection, occupied-port checks, Telnet reconnection, connection commands, and bounded crash recovery: three attempts in ten minutes.
- Actual process CPU/RAM monitoring, configurable unresponsive/RAM handling, and scheduled-restart protection during detected blood moons.

## Configuration

The essentials editor covers name, slots, password, world, seed, region, language, visibility, and connections. The full editor reads properties from the installed version's `serverconfig.xml`, preserves unknown properties and comments, and writes `seven-serverconfig.xml`. Recent SandboxCode and older properties are supported when present in that version. XML import/export preserves profile isolation. Unknown new properties retain their original technical names until a translation is added.

## Console, players, and community

- Telnet console with command history, quick commands, filtering, search, scroll pause, and diagnostics export.
- Incremental game logs and per-server daily manager logs.
- Player list with position, level, health, ping, and Steam/EOS identifiers when returned by the server.
- Kick, ban/unban, whitelist, admin permissions, teleport, items, and effects. Some commands require compatible extensions; failures are reported.
- Game and Discord chat, groups and permission levels, group-filtered events, global teleports, personal destinations, and areas with entry events.
- Chat commands include `!balance`, `!pay player amount`, `!tele name`, `!sethome name`, `!home name`, `!delhome name`, and `!homes`.
- Optional high-ping handling, VAC lookup through Steam Web API, blocked addresses/networks, and banned items through a compatible inventory API.

Rewards and voting pages are absent. Historical records and legacy event actions are retained for compatibility rather than deleting existing profile data.

## Events and schedules

The manager has its own bounded interpreter and JSON import/export formats. It does not import RATScript, RAT databases, `.dat` files, or RAT's factory events.

Triggers cover player connections, disconnections, chat, deaths, level changes, kills, player-list updates, server state, backups, Discord, protection, and timers. Additional log patterns detect blood moons, airdrops, hordes, screamers, spawning, permissions, and compatible CPM output. Availability depends on the installed game/mod output.

Conditions support text, groups, variables, ordering, and per-player cooldowns. Scripts support `if / else / endif`, `loop / endloop`, and bounded recursion. Actions include game commands, messages, Discord, balances/transfers, teleports, variables, event chaining, wait, notifications, optional SMTP and enabled external executables, backups, and server lifecycle actions. Some legacy reward/vote actions remain in the interpreter. See [EVENTS.md](EVENTS.md).

One-time, daily, and interval schedules can start, stop, restart, back up, run commands, or trigger events, with last-run/result history. The manager must remain open, including in the tray. Overdue tasks execute once after reopening.

## Mods, backups, and deletion

Mod ZIP/folder import locates nested `ModInfo.xml`, validates paths before copying, refuses duplicate names and symbolic links, and enables/disables mods through `Mods/.disabled`. Change mods with the server stopped.

Backups include saved/generated worlds in UserDataFolder, configuration, mods, and the manager profile. They do not duplicate the complete dedicated-server installation or bundled game worlds: reinstall the same branch for those files. Manual backups require a stopped server; scheduled backups stop, back up, and restart it. Retention is configurable. Restoration requires a matching branch, keeps previous files in `before-restore` folders, and rolls back on failure.

Deleting a stopped profile offers two explicit choices: keep all server files (default) or delete the displayed server folder with its worlds, mods, and configuration. External backups remain. Protected personal/system paths, overlapping profiles, and top-level junctions are rejected. Interrupted deletion is recovered when the manager reopens.

## Optional integrations

| Feature | External requirement | Validation status |
| --- | --- | --- |
| Local hosting, Telnet, world, save, stop, backup | Official app 294420 | Exercised with V3.4.0 b9 on the development PC |
| Mods, restore, deletion, and conflicts | Local files | Automated tests |
| Six languages and forms | None | All pages tested; visual application review |
| Discord relay and authorized commands | Bot token, channel, Message Content Intent, authorized role | Implemented; not validated against a user's live bot |
| Inventory and banned items | Compatible Alloc-style `getplayerinventory?userid=...` API and credentials | Implemented; requires compatible live API validation |
| Web map | Enabled accessible server dashboard/map | Opens the real server URL |
| VAC checks | Steam Web API key | Implemented; requires a live user key |
| Give/buff and CPM triggers | Commands/mods matching the installed branch | Dependent on actual server capabilities |
| Email | Enabled SMTP account | Implemented; not validated with a user's live account |

Discord identity linking uses a private one-time `!link` code that expires after five minutes. Optional external programs must be individually configured and enabled, with separate arguments and timeouts; scripts do not interpret Windows shell commands.

Remote profiles provide network console/administration. Installation, local backups, and starting the game process require the manager on the machine holding the files. Telnet shutdown cannot start a remote server again.

## Appearance and data

Purple dark/light themes; English, Spanish, Portuguese, Simplified Chinese, Japanese, and Russian. Original AI-generated logo, Windows icon, and animated loading screen with reduced-motion support.

Normal data is stored in `%APPDATA%\Seven Chispi Manager`. Credentials in profiles use Windows DPAPI and cannot simply be moved to another Windows user. Game XML and backup files can contain the passwords required by the game; protect access to them. Runtime data is not published in the source repository.

Technical references: the installed official server configuration and executable; Valve's [SteamCMD documentation](https://developer.valvesoftware.com/wiki/SteamCMD); [Steam GetPlayerBans API](https://partner.steamgames.com/doc/webapi/ISteamUser#GetPlayerBans).

# Seven Chispi Manager 1.0.4

Windows x64 desktop manager for multiple 7 Days to Die dedicated servers.

**Developed with extensive AI assistance using ChatGPT and Codex. The original logo was generated with OpenAI ImageGen.**

## Download

- **Setup**: recommended Windows installer.
- **Portable**: run without installing the manager.
- **Source ZIP**: application source, documentation, tests, and artwork.
- **SHA256SUMS.txt**: checksums for the downloadable files.

Game server binaries, SteamCMD, mods, saved worlds, and private profiles are not bundled. SteamCMD/game files are downloaded when installing a server.

## Included

- Multiple independent local/remote server profiles and Steam branch selection.
- Purple dark/light themes with a readable language dropdown; six interface languages.
- XML configuration, console, players, chat, mods, backups, events, and schedules.
- Delete a stopped profile while keeping files (default), or explicitly delete its server folder. Backups outside that folder remain.
- ZIP and Discord library updates. Production dependency audit reported zero known vulnerabilities during preparation.

The repository has an English setup guide and five real 1920 x 1080 screenshots. Rewards and voting pages are removed; historical data remains compatible.

## Validation and limitations

50 automated tests pass. The packaged English gallery was reproduced with isolated stopped profiles and no renderer errors. Earlier local hosting validation exercised two simultaneous V3.4.0 b9 dedicated servers, world loading, Telnet, save/shutdown, and backups. Internet multiplayer, real-client joins, and user-specific external integrations remain unverified. The application is not signed with a publisher certificate.

See the repository README for creating your first server, source-build instructions, AI disclosure, and detailed compatibility notes.

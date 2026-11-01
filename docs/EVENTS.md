# Event scripting

Scripts run inside Seven Chispi Manager's own interpreter. `console` sends game commands, not Windows commands. RAT scripts are not directly imported. Trigger names are translated in the UI; scripts use the action names shown below.

## Welcome message

Choose the player-joined trigger, the Any comparison, and a 30-second cooldown.

```text
say Welcome, {name}
if player_level < 5
say Save a personal destination with !sethome base
endif
```

## Respond to !help

Choose Chat, Equals, and the match text `!help`.

```text
whisper {player} Commands: !balance, !tele name, !sethome name, !home name
```

## Variables and conditions

```text
set announcement Welcome to Chispi
if bloodmoon == true
say Watch out for the blood moon
else
say {announcement}
endif
random draw 1 100
if draw >= 90
say Draw result: {draw}
endif
```

Comparisons: `==`, `!=`, `>=`, `<=`, `>`, `<`, `contains`, `starts`, `ends`, `ingroup`.

Variables include `{player}`, `{name}`, `{text}`, `{entity}`, `{level}`, `{player_level}`, `{player_currency}`, `{player_position}`, `{player_ping}`, `{player_health}`, `{player_kills}`, `{player_deaths}`, `{server_name}`, `{server_max_players}`, `{server_online_players}`, `{datetime}`, and stored profile variables.

`loop 3` / `endloop` repeats a block; `{index}` begins at zero. Limits: 50 iterations per loop, 250 instructions per run, eight block levels, three chained event calls, and 30,000 milliseconds per `wait`.

## Actions

```text
console saveworld
say Public message
whisper EOS_id Private message
discord Message for the configured channel
currency EOS_id 10
transfer EOS_source EOS_target 5
teleport EOS_id shelter
group EOS_id moderators
set variable value
add counter 1
random result 1 100
event eventName
wait 1000
restart 60 Restarting soon
stop 60 Shutting down soon
cancelshutdown
backup
start
```

Replace sample identifiers with real server IDs. Item/effect actions may require compatible mods. Legacy `reward player kit` and `vote Steam_id` actions exist for older profiles even though their interface sections have been removed. Do not assume removed configuration pages are available.

A zombie-kill trigger based on the 15-second player-statistics refresh reports a change count in `{delta}`, not individual hits. Exact per-kill actions require compatible mod log output. If an item delivery is interrupted, inspect its history before retrying; the manager cannot undo a delivery already accepted by the game.

## Optional notifications, email, and programs

```text
notify The server needs attention
email Chispi alert | The server stopped responding
program ExternalBackup
```

`email` requires enabled SMTP settings under Integrations. `program` runs only an executable you explicitly configured and enabled there, with separate arguments and a timeout; it does not evaluate a shell command string. No email account or external program is configured by default.

For Discord identity linking, a player enters `!link` in the game, receives a private code, then enters `!link CODE` in the configured Discord channel. The code expires after five minutes and can only be used once.

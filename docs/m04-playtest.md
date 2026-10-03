# M04 "Burn Notice" — Playtest Script (phase 5: full mission)

Status: **use once, disposable** — live-test script for the full 15-step mission as
built after the 2026-10-03 attack redesign (`docs/world-building/README.md` #44).
Not a permanent design doc (that is `docs/world-building/10-spec-m4.md`).

**What the first attack is now.** It cannot be repelled. The player gets a 60 second
broadcast countdown, then the desktop is cut and the recovery console takes over.
There is no money penalty (#43) and no calm moment between the end of the timer and
the breach (#44). The cut-off command (`flatline`, renamed from `repel` on 2026-10-03,
README #46) stays in the mission only as the last step, against the control host
(§7 step 9).

**What this run should answer.**

1. Does the scripted strike fire from inside the mission, show the `broadcast` banner
   and count down to 00:00 with the glitch running the whole time?
2. At 00:00 does the game go straight into the breach, with the glitch never dropping
   to normal and the banner staying until the screen is cut?
3. Does the recovery console open, can the puzzle be solved, and does the restore
   toast come before the Custodian's mail?
4. Does `mods.reset` during the countdown or during the breach leave the player
   stuck?
5. Does the hunt through the relays (§7-§9) run end to end?

The owner's focus after this script is question 5: tracing the attacker.

---

## 0. Entry point

M04's production prerequisite is `flatline.m03`, which **does** exist, so M04 is
reachable in production once M03 is complete. For a focused test:

1. In `src/guard/flags.ts` set `DEV_FOCUS_QUEST.m04 = true` and every other
   entry to `false`. Keep `isDebug = false`.
2. Build, install, restart.
3. Expect `[FP][Backtrace] m4 -> progress`. The four one-device subnets listed
   in `docs/network.md` (M4) now exist: `nmap` on a router address such as
   `193.164.228.17` prints its live ports.

**Remember to put the focus flag back to `false` before committing.**

**M4 reached FINAL LOCK on 2026-10-03.** The mission's `trace()` calls and the dev skip
of the breach (`M04_DEV_SKIP_BREACH`) were removed, every `DEV_FOCUS_QUEST` entry is
`false`, and the whole attack (§2-§6) always runs. The `[FP][M04] ...` log lines quoted
in the sections below no longer print: judge each step by what happens on screen and by
the `[FP][Backtrace]` lines, which come from the shared BACKTRACE app.

Game log: `C:\Users\Administrator\AppData\Roaming\hackhub\logs\hackhub-<date>.log`
(the game keeps writing to the previous day's file after midnight). The shared kit still
prints `[FP][BREACH]`, `[FP][KERNEL]`, `[FP][RECOVERY]`, `[FP][OPEN]` and
`[FP][Backtrace]` lines (M07 is not final yet).

---

## 1. The Custodian breaks silence

Open GoMail. One mail from `drop@drop.null`, subject *"something's wrong"*. It
pays off two threads planted in M1 and M3: the Custodian promised to speak only
if something was wrong (H1), and M3 warned that a forwarding rule left open is
how people like you get found (H2). It tells you to stay off the endpoint.

Read it. Expect `[FP][M04] probe:strike-scheduled delayMs=20000`.

Internally `warningRead`. **Nothing else happens for about 20 real seconds** —
that is the scripted delay, not a hang.

---

## 2. The attack starts

After ~20s expect, in one tick:

- `[FP][M04] probe:strike-started ip=62.197.136.44` and
  `[FP][M04] banner shown ip=62.197.136.44 totalMs=60000`
- a banner at the top of the desktop in the `broadcast` style: a dark plate headed
  *"Broadcast message from sentry@darknull.io"*, a large countdown starting at
  01:00, a thin bar that shrinks, and a line under it with a clock and the text
  *"flcomp: display module unload scheduled for 03:14:07"*
- the clock in that line starts at **03:13:07** and runs forward one second per
  second, so it reads exactly **03:14:07** when the countdown reaches 00:00
- the desktop glitching (level 2)
- a warning toast: *"Unusual activity on your own firewall."* This is the **only**
  toast of the attack
- one mail from `sentry@darknull.io`, subject *"you left a door open"*. It is
  narrative and threatening: the sender is already inside as uid 0, cannot be cut
  off, and names the time (03:14:07) when the display module comes out of the
  kernel. It does **not** name the sender's address
- no `~/logs/firewall.log` yet: it is written after the rebuild (§6)

Internally `probeStarted`. At 35% remaining (00:21) the banner turns critical: the
header becomes *"Final broadcast from sentry@darknull.io"*, the digits turn red and
pulse, and the glitch goes to level 3.

With the ModSettings toggle `reduceFlashing` on (or the OS reduced-motion setting),
the bursts and the digit pulse are off; the banner and the clock still run.

> **The alias is always `sentry`.** The lab picked a random identity from three,
> including "the Custodian" and "GHOSTWIRE"; both are impossible here, because the
> Custodian is deliberately empty and GHOSTWIRE is the player (`10` §B).

---

## 3. The countdown: nothing to cut

The player cannot stop this one. Things worth trying during the 60 seconds:

```
flatline 62.197.136.44
```

Expect *"flatline refused: the session holds uid 0 and the firewall no longer answers to
you. This one cannot be cut."* Any other IP gets the same refusal while the
countdown runs, and nothing else happens (no penalty, no progress). The refusal is
specific to this strike: M07's trace is also not repellable, but it keeps the old
*"No active intrusion detected."* reply.

```
cat ~/logs/firewall.log
```

Expect *File not found.* on a clean machine: the log is written after a successful
rebuild, not at the start of the attack (§6). A log left by an earlier run is still
there until the next rebuild sweeps it. The attack mail only says the sender will be in
the firewall log afterwards.

---

## 4. Timer zero: straight into the breach

Do nothing for the full minute. This is now the only path.

Expect, in order, with no gap:

- the banner holds at **00:00** with the clock on **03:14:07**, in the critical
  style, and the glitch keeps running at level 3. The desktop never returns to
  normal
- `[FP][M04] strike probe deadline expired ip=62.197.136.44`, then
  `probe:strike-expired`, then `probe:breach-scheduled delayMs=100`
- `[FP][M04] breach begun ip=141.77.202.84 expectedBuild=r3...` and
  `probe:breach-began`
- about 1.1 s later `[FP][BREACH] desktop cut, recovery console requested`: the
  banner disappears, the glitch stops, the screen is cut to the recovery boot
- **no** BACKTRACE toast at this moment (the breach log line is recorded quietly)
- your balance is untouched (#43)

The boot sequence cannot be skipped by any key or click.

**Nothing is dead-ended.** If the breach fails to start (the log says
`breach refused or failed`), the banner is dismissed and `breachScheduled` is
cleared, so the next load of the save schedules the breach again.

---

## 5. `mods.reset` during an active strike — the risk the owner named

1. Read the warning, wait for the banner, and **while the countdown is running**:
   ```
   mods.reset flatline-protocol
   ```
2. Expect: quest data cleared, the mission re-claimed from scratch, and **no
   leftover banner and no glitch**. `onStartM04` clears the stored strike, the strike
   and breach jobs and the Custodian-mail job, because `mods.reset` itself clears
   neither `SaveStorage` nor Scheduler jobs (`docs/app-asar-reference.md` E-4 still
   says otherwise and is waiting for its correction).
3. Watch for the worst case: a banner still on screen with no strike behind it,
   or a desktop still locked with nothing to repair. Either is a finding —
   report it with the log.
4. Then read the warning again and confirm a fresh strike runs normally.

Repeat once during the breach itself (after the cut, before the rebuild): the lock,
the console and the kernel files must be gone after the reset (the old state is
dropped at `Game.SessionStarted` and in `onStartM04`).

> The kit re-asserts its visuals in `Game.SessionStarted`, so a restart mid-breach
> re-locks the desktop and a restart with no breach releases it. Returning to the
> main menu removes every visual and puts them back from the saved state on return.

---

## 6. The recovery console

After the boot sequence the screen is a full-screen console with the prompt
`(admin)-[/]`, a status bar (`flcomp`, `config`, `initramfs`, each with a state) and
a hint line. `help` prints a boxed two-column menu. Tab shows candidates in a fixed
slot instead of printing lines. **F1** (dev console) and **ESC** (pause menu, back to
the main menu) must work from inside the console. If the console does not report
ready within 8 s the lock is released and a toast tells you to use the Terminal;
`sysdiag` and `sysrepair --rebuild` then work on the same real files.

The breach created real files on your PC, all under a path the console shows:

| File | State at the start |
|---|---|
| `/lib/modules/6.8.0-flatline/extra/flcomp.ko` | removed |
| `/etc/flcomp/display.conf` | corrupt |
| `/boot/recovery/flcomp-r3187.ko`, `flcomp-r3310.ko`, `flcomp-r3402.ko` | one expected, one stale, one bad (roles shuffled each run) |
| `/boot/recovery/display-backup.conf` | ABI 6 (stale) |
| `/boot/initramfs-flatline.img` | records no module |
| `/var/log/flcomp-incident.log` | the incident log |

The solution, in the order a player finds it:

1. `sysdiag`: module MISSING, config CORRUPT, initramfs STALE. Because the module is
   missing it adds one line: *"the session record remembers which build was
   running."*
2. `cat /var/log/flcomp-incident.log`: step 5 (`incidentLogRead`) from the widget
   event. Line 1 names the session source and the NAT gateway (§7 step 1); line 3
   gives the **srcversion** of the build that was running, `abi 7` and
   `depends flfb,drm_kms_helper`.
3. `modinfo /boot/recovery/flcomp-<build>.ko` on each image: the expected one has the
   same srcversion as the log; the stale one differs by two hex characters; the bad
   one has a different vermagic.
4. `use recovery/module/load`, `set IMAGE /boot/recovery/flcomp-<build>.ko`,
   `set DEPENDS flfb,drm_kms_helper`, `run`. Failure texts to confirm: a bad image
   gives *Invalid module format*; leaving out a dependency gives *Unknown symbol*; a
   module already loaded gives *File exists* (`rmmod flcomp` first). A stale image
   loads, but `sysdiag` then shows SRCVERSION MISMATCH.
5. `use recovery/config/rebuild`: the defaults come from `display-backup.conf` with
   ABI 6, so `set ABI 7`, then `run`.
6. `uname -r` gives `6.8.0-flatline`. `use recovery/initramfs/rebuild`,
   `set KERNEL 6.8.0-flatline`, `run`. Do this **after** the final module: it records
   the loaded srcversion, and changing the module afterwards makes it STALE again.
7. `sysdiag` shows all OK, then `sysrepair --rebuild`: the reboot sequence (also not
   skippable) and the desktop comes back.

Trying the three builds without reading the log is still possible (`10` §C); the log
only makes it deterministic.

On success expect, in this order:

- the restore toast (`KIT.BREACH.TOAST_RESTORED`) **first**
- `[FP][M04] breach repaired`, `probe:desktop-restored`,
  `probe:restored-mail-scheduled delayMs=4000`
- **1.5 seconds after the restore** `probe:firewall-log-scheduled delayMs=1500`, then
  `probe:firewall-log-seeded`: `~/logs/firewall.log` appears, and every older
  `firewall.log` / `firewall (n).log` in that folder is removed first (the 13 copies a
  repeated test left behind vanish here)
- **4 seconds later** one mail from `drop@drop.null`, subject *"you're still there"*,
  and `probe:restored-mail-sent`. It says the machine answered, that they took the
  room and not the money, that the trail starts from the log in your own house, to
  stay quiet and avoid what looks too easy, and that the report form is "Mission 4
  Findings". It does not name any command
- the recovery files are purged a moment later (`[FP][BREACH] removed the recovery
  files, kept the incident log`); only `/var/log/flcomp-incident.log` stays, because
  §7 needs its addresses

Steps 5 and 6 of the chain (`incidentLogRead`, `desktopRestored`) are
**deliberately parallel** and join at 7, so repairing the desktop without reading
the log must not stall anything (`10` §C).

### Reading a log

The three clue logs (`/var/log/flcomp-incident.log`, `~/logs/firewall.log` and
Static-Hop's `auth.log`) are stored as **Log Viewer entries** (`id`, `date`, `type`,
`description`) and keep the `.log` name. `watchdog.conf` stays plain text. Every way of
reading a clue counts the same, because `cat`, `open` and the Files app all end in one
handler per clue (`onFileRead`):

| Way | What you see |
|---|---|
| `cat <path>` in a Terminal (local or over SSH) | the engine's own output, one line per entry, oldest first: `[2026-09-24 03:14:07] CONNECTION_ETABLISHED compositord[812]: ...` |
| `open <path>` | the file name, then the same output (`open` falls back to `cat`, because `Files.read` cannot see array data) |
| the Files app, double-click the file (for `auth.log`, download it over SSH first) | the Log Viewer: newest entry first, a date column such as `Sep 24, 03:14`, a coloured badge per entry, filter chips with counts and a search box |
| `cat` inside the recovery console | the original text lines, from a copy kept in the breach save (the console only runs during the breach) |

For `watchdog.conf` use `open` (`cat` does not read `.conf`) or double-click it in the
Files app, where it opens in Code++; both count.

Badges follow the wording of each line: `Connection` (green) for accepted or
established sessions, `Disconnected` (amber) for dropped, closed or released ones,
`Event` (grey) for the rest. The `holds uid 0` line therefore stays a plain `Event`: the
engine type that would paint it red (`Shell Access`) comes with a side effect, because
deleting such an entry in the viewer claims the base game's achievement
`ach_ghost_in_shell`, which a mission clue should not hand out. No entry uses it.

What `firewall.log` holds, 14 entries from 02:20 to 03:04: four ordinary lines (the
mirror twice, NTP, the CDN); six lines from two decoy scanners (`45.138.157.22` fails a
443 handshake six times and is released, `109.205.213.78` knocks on 22 with no service
and is released); and four lines from the real source `62.197.136.44`, recognised by
behaviour: an **accepted** 443 session, **holds uid 0**, and a beacon every 60 seconds.
Reading it by any of the ways above earns the BACKTRACE key `probe` and its personal-log
line, with the usual BACKTRACE toast. It is **not** a gate: skipping it blocks nothing.

The dates are 2026-09-24 (`13` §C) in the player's local time, because the viewer
formats local time and the puzzle needs 03:14 to read 03:14. They are built from the
story day with explicit date parts, never from the game clock (`13` §A.1).

---

## 7. The hunt back through the relays

1. **Read the incident log** (step 5, already done if you read it in the console):
   `cat /var/log/flcomp-incident.log`, `open` on it, or the Files app (§6, "Reading a
   log"). Stamped `03:14:07`, its first line names the
   session source, Static-Hop's public address `141.77.202.84`, and the NAT gateway
   in front of it, `193.164.228.17`
   (`... accepted (nat gateway 193.164.228.17)`). Those two addresses are all
   step 7 needs. This unlocks the relay-1 `whois` / `geoip` / `nmap` fixtures. The
   banner clock counted up to the same `03:14:07`, and `auth.log` below is matched
   against the same minute.
2. **Profile relay 1** (step 7): `whois 141.77.202.84`, `geoip 141.77.202.84` or
   `nmap 193.164.228.17` — any one counts. This unlocks the `hydra` fixture for
   R1's panel.
3. **Crack R1** (step 8): `hydra -l admin -P <HackDB wordlist> 193.164.228.17 80`
   (the `-l` is optional; fixtures answer the engine's default `guest`
   (`docs/bugs.md` #25), `admin` and `svc`, and whichever you type the result
   names the panel account, `svc` / `relay-swap-07`). Expect
   `[FP][M04] probe:hydra-run`. This opens 22 on Static-Hop.
4. **SSH to Static-Hop** (step 9) with the pair hydra printed, `svc` /
   `relay-swap-07`. Key `relay1`.
5. **Read `auth.log`** (step 10): `cat` over SSH, `open`, or download it and open it in
   the Log Viewer. Fourteen entries, `Sep 24`. Five outbound
   sessions are opened, and only **one** is `ESTABLISHED` at **03:14:06** —
   Quiet-Mirror `45.155.204.31`, matching the breach minute in the incident log. The
   others are decoys: a Paper-Moth probe at **03:14:41** that forwarded 0 bytes, and
   three earlier sessions before 03:00 (two Quiet-Mirror keepalives and one
   Paper-Moth probe). `notes.txt` in the same home has the careless operator's
   `ops` / `mirror.night.9`. This opens 22 on Quiet-Mirror.
6. **SSH to Quiet-Mirror** (step 11) with `ops` / `mirror.night.9`. Key `relay2`.
7. **Read `watchdog.conf`** (step 12): `control_host = 203.0.113.159`,
   `operator_tag = SENTRY`, `beacon_interval = 60`. The last comment line is the
   hint for step 14: *"# teardown: flatline <control_host>. the beacon stops and the
   schedule goes with it."* Key `control`. This unlocks
   the Night-Shift fixtures. `old_targets.txt` next to it is the seed for M5:
   one line watching `d.reyes`, one hospital job marked only `closed`, and
   `next: prepping`.
8. **Link the origin** (step 13): `whois 203.0.113.159` or `geoip`. The
   registrant is **Bulletproof VPN Ltd.** — the same contact M3's `whois` gives
   for `203.0.113.160`. Key `origin`, plus a personal-log line.
9. **End the hunt** (step 14): `flatline 203.0.113.159`. The command prints a
   dim *"locking route to 203.0.113.159"*, then five `beacon` lines of the same
   pulse shrinking and changing colour (green, yellow, orange, red, then flat),
   about 3.8 s in all, then *"Connection from 203.0.113.159 severed."* in green. No
   `clear` is used, so the terminal history stays. Only after the last line:
   `[FP][M04] probe:hunt-ended` and a closing mail from
   `watchdog@architect-c2.dark`: *"You found the door. Someone will close it."*
   With `reduceFlashing` on (or the OS reduced-motion setting) the lines print at
   once. The player learns the command from `watchdog.conf` (step 7), the only
   place that names it; no mail does.
   Before step 13 (`originLinked`) the command refuses without animating: *"flatline
   refused: you do not know whose host this is yet. Look it up first."*

**The timestamp is the whole puzzle.** A player who picks Paper-Moth from
`auth.log` instead of Quiet-Mirror gets section 8's penalty, not progress.

---

## 8. Paper-Moth (outside the chain, costs money)

```
ssh 194.26.192.118
```

user `admin`, password `admin`. Expect **one** alert mail, an error toast
*"Unauthorized transfer: $<amount> taken from your account."* and
`[FP][M04] probe:honeypot-touched penalty=500` — `min(balance, 500)`. SSH in
again and it charges nothing more. `README.txt` says the box is decommissioned.
Touching it never advances the chain and never blocks it.

---

## 9. Report

Compose to `drop@drop.null` with the **Mission 4 Findings** template. The five
fields (`hunter`, `relays`, `control`, `origin`, `contained`) are **empty tokens**
in the compose window, not pre-filled text: type each answer, and Send enables
after the last one is filled.

- `hunter` → `SENTRY`
- `relays` → `Static-Hop, Quiet-Mirror`
- `control` → `203.0.113.159`
- `origin` → `Bulletproof VPN Ltd.`
- `contained` → `yes`

Matching is lenient: case, punctuation and spacing are ignored. `relays` needs
both Static-Hop and Quiet-Mirror in any order and must not name Paper-Moth
(`Static-Hop, Paper-Moth` is rejected); `control` must be the exact address, so
Paper-Moth's address is rejected; `origin` needs "Bulletproof" (or 防弹);
`contained` takes `yes`, `true` or `contained`. A rejected report gets no reply.

Expect the objective to complete, `[FP][Backtrace] m4 -> complete`, and
`[FP][M04] reward skipped under focus: 2400`. Sending early gets one *"not yet"*
reply naming the step you are actually missing (during the countdown that is *"They
are already inside. You cannot stop this one; wait it out."*).

---

## 10. BACKTRACE

M04 has a full report card. Six keys, one per action:

| Key | Earned by |
|---|---|
| `probe` | reading `~/logs/firewall.log` (it exists only after the rebuild) |
| `breach` | the desktop being taken (recorded quietly, no toast) |
| `relay1` | the SSH session on Static-Hop |
| `relay2` | the SSH session on Quiet-Mirror |
| `control` | reading `watchdog.conf` |
| `origin` | the `whois` on Night-Shift |

Three personal-log beats: after `probe` ("they already had my name"), at `breach`
("they took the desktop, not the balance"), after `origin` ("the same hand, one more
time"). Only the `breach` entry skips the BACKTRACE toast.

When M04 completes the card fills every fact whether or not the key was earned, so a
skipped `firewall.log` costs nothing at the end. Finding 02 now reads *"They could not
be cut off, and they took the desktop instead of the balance: ..."*.

Layout check: while M04 is locked or in progress the BACKTRACE view shows only
its card, with no report text beside it; once M04 is complete the report scrolls
inside the view, like M3's.

---

## 11. Chinese pass

Replay in Simplified Chinese. Everything has zh text, including the attack mail
(with the `{{stamp}}` filled in), the broadcast banner, the `flatline` refusals, the
Custodian's mail and the console messages. The zh strings written for the 2026-10-03
redesign are not yet approved by the owner. The log **files** stay in English syslog
form on purpose (`13` §A.5 fixes that format); their surrounding prose does not.

---

## 12. Known follow-ups (not fixed / not yet live-tested)

1. **The redesigned attack has never run in the game** (`docs/bugs.md` #48 for the
   kit in general). The `broadcast` banner was
   only rendered in headless Chromium with a stub SDK. Sections 2-4 are the first
   real test of the hand-off (banner and glitch held until the cut), the 100 ms
   scheduling, and the 4 s gap between the restore toast and the Custodian's mail.
2. **`mods.reset` during an active strike or breach** — section 5.
3. **Four routers is the most any mission builds**; watch the build and the
   rebuild after a reset (#35): `nmap` on each router address should answer.
4. **The reward is unverified** (#42 in `docs/bugs.md`) and only pays outside focus.
5. **`flatline` to Night-Shift before step 13** used to print *"Connection ...
   severed"* and change nothing, because the gate refuses `huntEnded` until
   `originLinked`. With the hint in `watchdog.conf` that became likely, so the
   command now refuses first (`RepelTarget.refusalKey`). Not yet seen in the game,
   nor the animation itself: check that the block glyphs render evenly in the
   terminal font and that the pacing feels right.
6. **`StrikeSpec.breachedHoldRealMs` / `severedHoldRealMs`** are no longer used by
   M04 (M07 never set them). Candidates for the final cleanup pass.
7. **The first attack no longer repeats and no longer ends in a penalty**: once the
   timer reaches zero the breach always lands and recovery is the only way forward.
   A more defensive version of the attack (a trace the player can beat) may come back
   in M07 as a different mechanic; nothing in M04 depends on it.
8. **Log Viewer entries and `Files.Open` — verified by the owner in the game on
   2026-10-03.** Array logs render in the Log Viewer, the `users[].files` array
   survives, the `Files.Open` payload works, and `open` falls back to `cat`. The full
   hunt (steps 5-14) then ran end to end in one session (game log: `traced relay1`,
   `relay2`, `control`, `origin`, `probe:hunt-ended`, `m4 -> complete`). The engine's
   `Sys log file not found for <ip>` error on each SSH login is harmless (§12 of the
   M3 playtest).
9. **`relayLead` is now unlocked at runtime** when the incident log is read (it used to
   apply only after a game reload), so `whois 141.77.202.84` should answer at step 7
   without a restart. Check it once.
10. **The player can delete entries in the Log Viewer.** A deleted clue line is gone from
    that copy. `firewall.log` is rewritten at the next rebuild; `auth.log` is a remote
    file and only its downloaded copy is affected. Not handled.

---

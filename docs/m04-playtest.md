# M04 "Burn Notice" — Playtest Script (phase 5: full mission)

Status: **use once, disposable** — script for the generic rival-hacker kit and
the M04 walking skeleton built in phase 3. Phase 5 extends this file into the
full 15-step walkthrough. Not a permanent design doc (that is
`docs/world-building/10-spec-m4.md`).

**What phase 3 is for.** The rival-hacker kit has only ever run inside
`src/debug/`'s lab, never inside the mission pipeline (`10` §I risk 1). This
build moves the generic parts into `components/` and `commands/` and drives them
from a real quest, so the live test can answer:

1. Does a **scripted** strike (a `Scheduler` job, no `Math.random`) fire, show
   the banner, and arm its deadline from inside a mission?
2. Does `repel <ip>` reach the mission's gate chain through a global command?
3. Does `sysdiag` / `sysrepair` still work when the breach is owned by a
   mission rather than the lab?
4. **Does `mods.reset` during an active strike leave the player stuck?** (`10`
   §I risk 4 — the one the owner asked to test explicitly.)

**The lab is untouched.** `src/debug/rival-*` still works exactly as before
(D5); the kit is a parallel adaptation, not a move.

**Added in phase 5.** The 15-step chain, strike 2 and the desktop breach as a
*story* beat, the relay hops (Static-Hop → Quiet-Mirror), the control host,
`hydra` on R1, `auth.log`, `watchdog.conf`, `old_targets.txt`, the BACKTRACE
keys and the closing mail are built: §7-§10 walk them. Only the polished banner
and recovery screen (the `frontend-design` pass) are still owed (§12). Sections
1-6 keep the phase-3 skeleton questions.

---

## 0. Entry point

M04's production prerequisite is `flatline.m03`, which **does** exist, so M04 is
reachable in production once M03 is complete. For a focused test:

1. In `src/guard/flags.ts` set `DEV_FOCUS_QUEST.m04 = true` and every other
   entry to `false`.
2. Build, install, restart.
3. Expect `[FP][Backtrace] m4 -> progress`. The four one-device subnets listed
   in `docs/network.md` (M4) now exist: `nmap` on a router address such as
   `193.164.228.17` prints its live ports.

**Remember to put the focus flag back to `false` before committing.**

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

## 2. The first strike

After ~20s expect, in one tick:

- `[FP][M04] probe:strike-started ip=62.197.136.44`
- `[FP][M04] banner shown ip=62.197.136.44 totalMs=120000`
- a countdown banner at the top of the desktop, 02:00 and falling
- a toast: *"Unusual activity on your own firewall."*
- one mail from `sentry@darknull.io`, subject *"you left a door open"* — it does
  **not** name the IP
- `~/logs/firewall.log` created on your own machine

Internally `probeStarted`. The banner turns red at 35% remaining.

> **The alias is always `sentry`.** The lab picked a random identity from three,
> including "the Custodian" and "GHOSTWIRE"; both are now impossible, because
> the Custodian is deliberately empty and GHOSTWIRE is the player (`10` §B).

---

## 3. Read your own log and cut them off

```
cat ~/logs/firewall.log
```

Fourteen lines, `Sep 24 HH:MM:SS`, 02:20 to 03:05. Three are ordinary (mirror,
NTP, CDN). **Two are decoys**: `45.138.157.22` fails a 443 handshake six times
and is released, `109.205.213.78` knocks on 22 with no service. One line is the
real one, recognised by behaviour rather than by looking suspicious:
`62.197.136.44` has an **accepted** 443 session, **holds uid 0**, and beacons
every 60 seconds.

```
repel 62.197.136.44
```

Expect *"Connection from 62.197.136.44 severed."*, a success toast, the banner
flipping to **CONNECTION SEVERED** for ~4s and then disappearing, and
`[FP][M04] probe:intruder-repelled ip=62.197.136.44`.

Internally `intruderRepelled`.

**Wrong-IP behaviour to confirm:** `repel 45.138.157.22` must print *"is not the
one pushing in"* and cost **nothing** — no penalty, no progress (`10` §C). With
no strike active at all it must print *"No active intrusion detected."*

---

## 4. Letting it expire (do this on a second run)

Read the warning, wait for the strike, then **do nothing for two real minutes**.

Expect: the banner flips to **TRACE COMPLETE**, `[FP][M04] penalty charged: 300
of 300` (or less if your balance is lower), and
`[FP][M04] probe:strike-expired penalty=<n>`.

**Nothing is dead-ended.** `intruderRepelled` is still reachable afterwards —
in the skeleton the strike simply does not repeat (phase 5 adds the re-strike).
Check your balance: the charge must be `min(balance, 300)`, so a player with $0
loses nothing and never goes negative.

---

## 5. `mods.reset` during an active strike — the risk the owner named

1. Read the warning, wait for the banner, and **while the countdown is running**:
   ```
   mods.reset flatline-protocol
   ```
2. Expect: quest data cleared, the mission re-claimed from scratch, and **no
   leftover banner**. `mods.reset` clears the mod's `SaveStorage`, which is where
   the strike lives, so the kit has nothing to restore
   (`docs/app-asar-reference.md` E-4).
3. Watch for the worst case: a banner still on screen with no strike behind it,
   or a desktop still locked with nothing to repair. Either is a finding —
   report it with the log.
4. Then read the warning again and confirm a fresh strike runs normally.

> The kit re-asserts its visuals in `Game.SessionStarted`, the same hook the lab
> uses, so a restart mid-breach re-locks the desktop and a restart with no
> breach releases it.

---

## 6. The desktop breach and recovery (kit check, not yet a story beat)

In the skeleton no mission triggers the breach — strike 2 is phase 5. To test
the kit's recovery path now, use the **lab**, which still works:

```
rivallab breach
```

Then, on your own machine (not in a remote session):

```
sysdiag
```

Expect the component table: `display module MISSING`, `display config CORRUPT`,
plus the incident-log and recovery-image paths. Restore the right build from
`~/compositor/recovery/` and the backup config, then:

```
sysrepair --rebuild
```

Expect *"Display configuration verified. Desktop session restored."*

**What to confirm is that the global commands behave like the lab's did:**
`sysdiag` and `sysrepair` are now registered globally (not debug-gated) and
refuse politely inside a remote session (*"only runs on this machine.
Disconnect first."*). They work on **any** mission's breach, by design — M07
reuses the same kit (`11` §G), which is a deliberate deviation from `10` §H's
"refuse when M4 is not active".

---

## 7. The hunt back through the relays

Steps 5 and 6 are **deliberately parallel** and join at 7, so repairing the
desktop without reading the log must not stall anything (`10` §C).

1. **Read the incident log** (step 5): `cat ~/compositor/logs/incident.txt`.
   Stamped `03:14:07`, its first line names the session source, Static-Hop's
   public address `141.77.202.84`, and the NAT gateway in front of it,
   `193.164.228.17` (`... accepted (nat gateway 193.164.228.17)`). Those two
   addresses are all step 7 needs. This unlocks the relay-1 `whois` / `geoip` /
   `nmap` fixtures.
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
5. **Read `auth.log`** (step 10). Fourteen lines, `Sep 24`. Five outbound
   sessions, and only **one** is `ESTABLISHED` at **03:14:06** — Quiet-Mirror
   `45.155.204.31`, matching the breach minute in the incident log. The others
   are decoys: a Paper-Moth probe at **03:14:41** that forwarded 0 bytes, and
   three keepalives before 03:00. `notes.txt` in the same home has the careless
   operator's `ops` / `mirror.night.9`. This opens 22 on Quiet-Mirror.
6. **SSH to Quiet-Mirror** (step 11) with `ops` / `mirror.night.9`. Key `relay2`.
7. **Read `watchdog.conf`** (step 12): `control_host = 203.0.113.159`,
   `operator_tag = SENTRY`, `beacon_interval = 60`. Key `control`. This unlocks
   the Night-Shift fixtures. `old_targets.txt` next to it is the seed for M5:
   one line watching `d.reyes`, one hospital job marked only `closed`, and
   `next: prepping`.
8. **Link the origin** (step 13): `whois 203.0.113.159` or `geoip`. The
   registrant is **Bulletproof VPN Ltd.** — the same contact M3's `whois` gives
   for `203.0.113.160`. Key `origin`, plus a personal-log line.
9. **End the hunt** (step 14): `repel 203.0.113.159`. Expect
   `[FP][M04] probe:hunt-ended` and a closing mail from
   `watchdog@architect-c2.dark`: *"You found the door. Someone will close it."*

**The timestamp is the whole puzzle.** A player who picks Paper-Moth from
`auth.log` instead of Quiet-Mirror gets section 8's penalty, not progress.

---

## 8. Paper-Moth (outside the chain, costs money)

```
ssh 194.26.192.118
```

user `admin`, password `admin`. Expect **one** alert mail and
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
reply naming the step you are actually missing.

---

## 10. BACKTRACE

M04 now has a full report card. Six keys, one per action:

| Key | Earned by |
|---|---|
| `probe` | repelling the right address |
| `breach` | the desktop being taken |
| `relay1` | the SSH session on Static-Hop |
| `relay2` | the SSH session on Quiet-Mirror |
| `control` | reading `watchdog.conf` |
| `origin` | the `whois` on Night-Shift |

Three personal-log beats: after `probe` ("they already had my name"), after
`breach` ("they took the desktop, not the balance"), after `origin` ("the same
hand, one more time").

Layout check: while M04 is locked or in progress the BACKTRACE view shows only
its card, with no report text beside it; once M04 is complete the report scrolls
inside the view, like M3's.

---

## 11. Chinese pass

Replay in Simplified Chinese. Everything has zh text, including the banner and
the recovery messages. The log **files** stay in English syslog form on purpose
(`13` §A.5 fixes that format); their surrounding prose does not.

---

## 12. Known follow-ups (not fixed / not yet live-tested)

1. **The kit has still never run in the pipeline in the game** (`docs/bugs.md`
   #48). Sections 2-6 are that test.
2. **`mods.reset` during an active strike** — section 5, the risk the owner named.
3. **The banner widget path** `components/incident-banner.html` (#48).
4. **Four routers is the most any mission builds**; watch the build and the
   rebuild after a reset (#35): `nmap` on each router address should answer.
5. **The reward is unverified** (#42) and only pays outside focus.
6. **No `frontend-design` pass.** That plugin is not available in this build
   environment, so the banner and recovery screen keep the lab's visuals and the
   polish `10` §G asks for is still owed.
7. **Strike 1 repeats on failure but strike 2 does not**: once the desktop is
   taken, recovery is the only route forward, which is what `sysdiag` /
   `sysrepair` exist for.

---

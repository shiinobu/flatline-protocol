# M04 "Burn Notice" — Playtest Script (phase 3: generic kit + walking skeleton)

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

**Not built yet (phase 5).** The 15-step chain, strike 2 and the desktop
breach as a *story* beat, the relay hops (Static-Hop → Quiet-Mirror), the
control host, `hydra` on R1, `auth.log`, `watchdog.conf`, `old_targets.txt`,
the BACKTRACE keys, the closing mail, and the polished banner and recovery
screen (the `frontend-design` pass). The skeleton stops after the first strike
is repelled.

---

## 0. Entry point

M04's production prerequisite is `flatline.m03`, which **does** exist, so M04 is
reachable in production once M03 is complete. For a focused test:

1. In `src/guard/flags.ts` set `DEV_FOCUS_QUEST.m04 = true` and every other
   entry to `false`.
2. Build, install, restart.
3. Expect `[FP][Backtrace] m4 -> progress` and the Network Map to gain **four**
   routers, each with one device.

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

## 7. Report

Compose to `drop@drop.null` with the **Mission 4 Findings** template:

- `hunter` → `SENTRY`
- `contained` → `yes`

Expect the objective to complete, `[FP][Backtrace] m4 -> complete`, and
`[FP][M04] reward skipped under focus: 800`. (`Paper-Moth` is rejected as the
hunter.)

Sending the report before the strike is repelled gets **one** *"not yet"* reply
naming the missing step.

---

## 8. Probes

| Probe | Log line |
|---|---|
| strike scheduled | `[FP][M04] probe:strike-scheduled delayMs=20000` |
| strike started | `[FP][M04] probe:strike-started ip=...` |
| intruder repelled | `[FP][M04] probe:intruder-repelled ip=...` |
| deadline expired | `[FP][M04] probe:strike-expired penalty=<n>` |
| banner | `[FP][M04] banner shown ...` / `banner resolved outcome=...` |
| desktop lock | `[FP][LOCK] desktop lock engaged` / `released`, `breach css injected` |
| reward | `[FP][M04] reward skipped under focus: 800` |

---

## 9. Known follow-ups (not fixed / not yet live-tested)

1. **The whole kit has never run inside the pipeline** — that is this phase.
   `docs/bugs.md` #48.
2. **The banner widget is loaded by path** (`components/incident-banner.html`),
   not imported as a string, so `{{t:KEY}}` cannot reach it. Its labels and
   detail line are now passed in **already localized** through the `Variables`
   view the widget reads, which is how zh works at all here. Worth confirming
   the widget resolves at that path: the only live-proven precedent is the lab's
   `debug/rival-banner.html`. `docs/bugs.md` #48.
3. **The terminal watcher still uses DOM queries and a synthetic double-click**
   to keep a terminal available while the desktop is locked, with the lab's
   release failsafe intact (three attempts, then unlock).
4. **Four routers is the most any mission builds.** Watch the Network Map and
   the rebuild path after `mods.reset` (`docs/bugs.md` #35).
5. **The chain is a 3-step subset** of the spec's 15, in the spec's order.
6. **No BACKTRACE keys for m4 yet** — `BACKTRACE_KEYS.m4` stays empty until
   phase 5.
7. **The banner and recovery screen are the lab's visuals**, unpolished; the
   `frontend-design` pass is phase 5 (prompt §6).

---

## Appendix — what M04 builds

```
Four routers, one device each (10 §E). Every lanIp is 192.168.1.x (E-7);
each tree numbers its own router .1 and its device .2, which is allowed
because lanIp must only be unique inside one tree.

R1  193.164.228.17   lan 192.168.1.1   TP-Link panel on 80, user admin
  └─ Static-Hop    141.77.202.84  lan 192.168.1.2   ssh 22 CLOSED, svc + root
R2  87.121.52.196    lan 192.168.1.1
  └─ Quiet-Mirror  45.155.204.31  lan 192.168.1.2   ssh 22 CLOSED, ops
R3  176.97.210.63    lan 192.168.1.1
  └─ Paper-Moth    194.26.192.118 lan 192.168.1.2   ssh 22 OPEN, admin/admin
                                                     HONEYPOT, outside the chain
R4  91.222.174.46    lan 192.168.1.1
  └─ Night-Shift   203.0.113.159  lan 192.168.1.2   443 https
                                                     next to the M3 endpoint
                                                     .160, and neither .160 nor
                                                     .161 (which is the M7 C2)

Strike 1 intruder: 62.197.136.44 — a throwaway address, deliberately NOT a
host in the world (10 §F). Decoys in the log: 45.138.157.22, 109.205.213.78.

Fixtures at build: nmap R1 (80 OPEN, 443 CLOSE), nmap Static-Hop (22 CLOSE),
nmap Paper-Moth (22 OPEN OpenSSH 8.2), ssh fixture for Paper-Moth.
Unlocked with controlHost: nmap / geoip / whois for Night-Shift, whose
registrant is Bulletproof VPN Ltd. — the same contact M3's whois gives for
203.0.113.160, which is what ties M3, M4, M6 and M7 together (10 §E).
```

---

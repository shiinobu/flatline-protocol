# M07 "The Architect" — Playtest Script (phase 1: walking skeleton)

Status: **use once, disposable** — step-by-step script for the M07 walking
skeleton as implemented in phase 1 of the M4-M7 run, on this session's working
branch. Delete or archive once M07 reaches FINAL LOCK; not a permanent design
doc (that is `docs/world-building/11-spec-m7.md`).

**What phase 1 is for.** M07 is the old M4 migrated to mission id `m07`
(world-building README, "Batasan urutan implementasi" #2). The point of this
build is to prove, in the running game, that **four events actually fire in an
RDP/Meterpreter session on the C2** before any of the real M07 content is
written (`11-spec-m7.md` §L, README #4). Everything else here exists only so
you can reach those events.

**Not built yet (phase 4).** HoneyCheck, the designed `/legacy-cms/` node
table, the 240-second tracking banner with its penalty and desktop breach, the
ending effects and Greta's letters, the "What now?" mail and the `choice`
report field, the money reward, the m7 BACKTRACE keys, and the Chinese text.
The BACKTRACE app shows M07 as an ordinary locked/in-progress card with no
keys — that is expected, not a bug.

**Language.** English only in this build. `Localization.t` falls back to
English for every M07 key, so a Chinese game shows English M07 text. Phase 4
adds `zh`.

---

## 0. Entry point

M07's production prerequisite is `flatline.m06`, which does not exist yet, so
M07 is **unreachable in production** on purpose (prompt §8 D3). Test it with
dev focus:

1. In `src/guard/flags.ts` set `DEV_FOCUS_QUEST.m07 = true` and every other
   entry to `false`. Leave `isDev = true`, `isDebug = false`, `isTester = false`.
2. Build and install as usual (`.\build-install.ps1`), restart HackHub.
3. Expect in the log: `[FP][Flatline Protocol] FLATLINE PROTOCOL COMPLETELY LOADED!`
   and `[FP][Backtrace] m7 -> progress`.

With focus on, all of M07's objectives show at once (`applyDevGating`) and no
other story mission auto-starts. **Remember to put the flag back to `false`
before committing.**

---

## 1. Tip mail

1. Open GoMail. One mail from `drop@drop.null`, subject
   *"you have the name. now the proof."*
2. Read it. It names the endpoint `203.0.113.160` — the address M3 already
   ends on.

Expected: nothing visible; internally `tipReviewed`. Every later step refuses
until this one is done, so read the mail first.

---

## 2. Find what is behind the endpoint

The three public hosts behind the endpoint are not in the mail. Find them the
way M3 taught:

```
python3 net_tree.py 203.0.113.160
```

Expect four addresses behind the router: `45.76.180.9` (the Splitter),
`203.0.113.161`, `185.220.101.42`, `146.70.44.18`. The Firewall is
`isIpHidden`, so **do not expect `194.60.38.12` here** — its address comes
from section 4.

Then version-scan the C2:

```
nmap -sV 203.0.113.161
```

Expect `443 OPEN https LegacyCMS 2.1` and `3389 FILTERED rdp FreeRDP 5.2.1`.

Expected: internally `edgeScanned`. A scan without `-sV`, or a scan of another
host, does nothing.

> Tell-apart detail that phase 4 leans on: `nmap -sV 185.220.101.42` shows
> **OpenSSH 9.6** on Null-Crown and `nmap -sV 146.70.44.18` shows **OpenSSH
> 5.3** on Ash-Vector. A box "decommissioned in 2019" running a current
> OpenSSH is the inconsistency that marks Null-Crown as the honeypot.

---

## 3. The hidden path on the C2

`https://203.0.113.161/` serves a "Restricted" placeholder. The admin path is
registered but not linked:

```
dirhunter 203.0.113.161
```

Requires the **`dirhunter` package installed** in-game. Expect `/` and
`/legacy-cms/` in the output. Opening `https://203.0.113.161/legacy-cms/` in
the browser counts too.

Expected: internally `dashboardFound`. The page is a plain placeholder in this
build (LegacyCMS 2.1, build 2011.04); the node-status table is phase 4.

---

## 4. The forgotten box and the credential

Two boxes are written off. One is a honeypot, one is genuinely forgotten.

**Ash-Vector — the real dead box:**

```
ssh 146.70.44.18
```

user `admin`, password `admin`.

```
cat ash-gate_backup.txt
```

Expect an old configuration backup, dated 2022, naming the panel host
`194.60.38.12`, the user `fw.admin`, its password, and the two deny rules.
`open ash-gate_backup.txt` counts as well.

Expected: internally `deadBoxEntered` then `credentialRead`.

**Null-Crown — the honeypot (optional, outside the chain):**

```
ssh 185.220.101.42
```

same `admin` / `admin`. Expect **one** mail from `watchdog@architect-c2.dark`,
subject *"SYSTEM ALERT — decoy host touched"*. SSH in again: **no second
mail**. Touching it never advances the chain and, in this build, costs nothing
(the money penalty is phase 4).

---

## 5. ash-gate

1. Browse to `http://194.60.38.12` — the pfSense panel.
2. Log in as `fw.admin` with the password from the backup file.
   Expect the panel to open. Internally `firewallLoggedIn`.
   A wrong user or password must **not** open it: ash-gate has exactly one
   valid user (`app-asar-reference.md` E-9).
3. Open **Firewall Rules**, delete or edit the 3389 rule, and **Save**.
   Expect the panel's green confirmation. Internally `firewallBreached`, which
   lifts the 3389 rule and opens the port.
4. Re-scan: `nmap -sV 203.0.113.161` now shows `3389 OPEN`.

> **Watch this and report what you see.** 3389 is `active` from the build in
> this skeleton (a phase-1 shortcut), so the RDP session in section 6 may work
> **before** you ever log into ash-gate. Either outcome is a real finding:
> - RDP refused before the Save → the deny rule reaches a device nested inside
>   a sibling Splitter. Good news, and it closes an open question
>   (`docs/bugs.md` #45).
> - RDP works before the Save → the rule never matched, and the real gate is
>   the port's `active` flag plus `Network.openPort`, exactly as M2 relies on.
>
> Either way the chain still requires the Save, because `advanceStep` will not
> set `shellObtained` until `firewallBreached` is set.

---

## 6. The C2 session — the three events phase 1 exists to prove

```
msfconsole
use exploit/rdp/cve_2019_0708_bluekeep
set RHOST 203.0.113.161
set RPORT 3389
set Version 5.2.1
exploit
```

`Version` must be exactly `5.2.1` — the engine splits the port's
`FreeRDP 5.2.1` banner and compares the version part
(`app-asar-reference.md` E-11). The C2's online user is `svc-cms`.

**Expected at a `meterpreter >` prompt:**

| # | Do this | Expect in the log |
|---|---|---|
| 1 | the `exploit` above succeeds | `[FP][M07] probe:metasploit-session { targetIp: '203.0.113.161', targetPort: 3389, fromIp: ..., user: 'svc-cms' }` then `[FP][M07] probe:tracking-armed { id: ..., delay: { realMs: 60000 } }` |
| 2 | `ls` | `manifest.txt` and `master_ledger_backup.enc` |
| 3 | `cat manifest.txt` | `[FP][M07] probe:manifest-cat { name: 'manifest', extension: 'txt' }` |
| 4 | `attrcheck master_ledger_backup.enc` | the SELF_DESTRUCT_ON_READ warning, then `[FP][M07] probe:attrcheck-revealed { id: ..., name: 'master_ledger_backup' }` |
| 5 | `download master_ledger_backup.enc` | `[FP][M07] probe:ledger-download { type: 'DOWNLOAD', name: 'master_ledger_backup', ... }` then `[FP][M07] probe:tracking-disarmed` |

Steps 3, 4 and 5 are the ones that have never been proven in this session
type. Internally they set `shellObtained`, `manifestRead`, `trapRevealed` and
`fileExtracted`.

**`manifest.txt` must read as MASTER LEDGER INDEX** with five settled
accounts (Northstar 2020 NA, Rheinland 2023 EU, LOG-EU-2209 $1,400,000
2026-05-02, FIN-NA-0091 $4,100,000 2026-07-22, CASE-A7X-0417 $2,850,000
2026-08-14), the PacificCare note classifying it as *employee negligence
(G. de Souza)* prepared with V. Orchid and approved by Nordhaven on
2026-08-17, the watch line `d.reyes: monitor`, and the closing
`every account, settled.` **If any amount or date shows as `{{something}}` or
as a raw `M07.` key, stop and report it.**

**Also try (optional, outside the chain):** `open master_ledger_backup.enc`
before the download. Expect one mail from `watchdog@architect-c2.dark`
("unauthorized access detected") and the file **still there** — in this build
nothing is deleted and no deadline is cut (phase 4 adds both).

---

## 7. Skeleton probes

Four unconditional `trace` calls plus one bare Scheduler deadline, all in
`src/controller/m07/probes.ts`. They are **not gated**: they log even if you
reach an event out of order, which is exactly what makes them useful.

| Probe | Log line | Fires on |
|---|---|---|
| metasploit session | `[FP][M07] probe:metasploit-session` | `RemoteConnection.Established`, `t === "METASPLOIT"`, `targetIp` = C2 |
| tracking armed | `[FP][M07] probe:tracking-armed` | same event; schedules a 60-second real-time job |
| manifest read | `[FP][M07] probe:manifest-cat` | `Terminal.Cat` of `manifest.txt` |
| attrcheck | `[FP][M07] probe:attrcheck-revealed` | the mod event `flatline.m07.attrcheckRevealed` |
| extraction | `[FP][M07] probe:ledger-download` | `Files.Transfer` `DOWNLOAD` of `master_ledger_backup` |
| tracking disarmed | `[FP][M07] probe:tracking-disarmed` | the same download, cancelling the job |
| tracking expired | `[FP][M07] probe:tracking-expired` | the 60-second job firing because you did not download in time |

**The tracking probe is the one worth deliberately failing.** Get the session,
then do nothing for about 70 real-world seconds and watch for
`probe:tracking-expired`. There is **no banner, no penalty and no file
deletion** in this build — the probe only answers whether a `{ realMs }`
Scheduler job survives a live session, which is what phase 4's 240-second
deadline is built on. Opening a new session re-arms exactly one job.

Also worth reporting: whether `probe:tracking-expired` still fires if you
`back` out of the session, and whether it fires after `mods.reset`.

---

## 8. Report

Compose to `drop@drop.null` with the **Mission 7 Findings** template:

- `architect` → `Conrad Lindqvist`
- `evidence` → `employee negligence (G. de Souza)` — the classification exactly
  as `manifest.txt` prints it. Case and extra spaces are forgiven; a different
  summary is not.

Expected: the single objective completes, `[FP][Backtrace] m7 -> complete`.

**Send it early on purpose too.** Before the download, send the same correct
report: expect **one** reply from `drop@drop.null`, subject *"not yet"*, whose
middle paragraph points at the step you are actually missing. Sending again
replaces that reply rather than stacking a second one.

The `choice` field (`expose` / `handoff` / `destroy`), the "What now?" mail and
the real ending effects are phase 4; this build ends at the report.

---

## 9. Known follow-ups (not fixed / not yet live-tested)

1. **`attrcheck` and `open` at a `meterpreter >` prompt are still unproven in
   game.** Both resolve through the ID-based walk in
   `src/commands/meterpreter-files.ts` (`docs/bugs.md` #30 follow-up). Section 6
   steps 4 and 5 are that test. If `attrcheck master_ledger_backup.enc` says
   "No such file", the walk is wrong, not the mission.
2. **Whether a Firewall nested in a Splitter protects its sibling devices**
   (`docs/bugs.md` #45) — section 5's watch note.
3. **`Files.Transfer` on a Meterpreter `download`** has not been seen on this
   route before (`11-spec-m7.md` §K).
4. **No reward is paid.** `Rewards` is unset by design (prompt §8 D1) and the
   `Bank.transaction` payout of 5000 is phase 4.
5. **3389 is open from the build.** Phase 4 sets it `active: false` and lets
   the firewall step open it.
6. **BACKTRACE shows no M07 keys.** `BACKTRACE_KEYS.m7` is empty until phase 4.
7. **Chinese text is absent** for M07 (see the header).

---

## Appendix — network topology reference

```
M07_ROUTER_IP (Router)  203.0.113.160   lan 192.168.1.1
   = M04_ARCHITECT_VPN_IP, the endpoint M3 ends on. Constant NOT renamed:
     the locked M2 and M3 import it from content/global/characters.ts.
   ports: none of its own
   └─ M07_SPLITTER_IP (Splitter)   45.76.180.9    lan 192.168.1.2
      pure pass-through
      ├─ M07_FIREWALL_IP (Firewall)  194.60.38.12  lan 192.168.1.3   isIpHidden
      │     "ash-gate". ONE valid user: fw.admin / Ashgate#2022r2
      │     (PFSense.Login carries only { ip }, so a second valid user would
      │      open the gate too -- app-asar-reference.md E-9)
      │     ports: 80 http (its own panel)
      │     rules: deny 22 -> 192.168.1.4 · deny 3389 -> 192.168.1.4
      │            destination is the C2's lanIp, never its public IP (E-8),
      │            and there is no port-22 rule without a destination, which
      │            would also cut SSH to Null-Crown and Ash-Vector
      ├─ M07_C2_IP (Device)          203.0.113.161 lan 192.168.1.4
      │     users: svc-cms (online, what bluekeep needs), root
      │     ports: 443 https "LegacyCMS 2.1" (active)
      │            3389 rdp "FreeRDP 5.2.1" (active FROM THE BUILD in phase 1)
      │     vulnerabilities: RCE, FreeRDP 5.2.1
      │     rootFiles: manifest.txt · master_ledger_backup.enc
      │     website: "/" and "/legacy-cms/", gated to m07
      ├─ M07_NULLCROWN_IP (Device)   185.220.101.42 lan 192.168.1.5  "Null-Crown"
      │     THE HONEYPOT, written off 2019 but running OpenSSH 9.6
      │     user: admin / admin -- 22 ssh
      │     files: backup_old.bak (dead end) -- SSH here raises one watchdog mail
      └─ M07_ASHVECTOR_IP (Device)   146.70.44.18   lan 192.168.1.6  "Ash-Vector"
            THE REAL DEAD BOX, written off 2022, OpenSSH 5.3 to match
            user: admin / admin -- 22 ssh
            files: ash-gate_backup.txt (fw.admin credential, dated 2022)
```

Every `lanIp` is `192.168.1.x` because the engine's `IsLocalIp` accepts only
that prefix (`app-asar-reference.md` E-7); the old M4's `172.16.0.x` could
never have worked. Public IPs and codenames are the old M4's, unchanged
(`11-spec-m7.md` §E).

---

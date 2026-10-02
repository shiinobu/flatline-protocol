# M07 "The Architect" — Playtest Script (phase 4: full mission)

Status: **use once, disposable** — step-by-step script for the full M07 as
implemented in phase 4 of the M4-M7 run. Supersedes the phase-1 skeleton script
that used to live here. Delete or archive once M07 reaches FINAL LOCK; not a
permanent design doc (that is `docs/world-building/11-spec-m7.md`).

**What changed since the skeleton.** The 3389 shortcut is gone (the port is
closed until the firewall step opens it), the five bare probes are gone, and the
mission now ships the real 240-second tracking, HoneyCheck, the designed
`/legacy-cms/` node table, the `choice` field with its three ending effects,
Greta's epilogue letters, the 5000 payout, the six BACKTRACE keys with a report
card, and the full Chinese text.

**What phase 1 was for.** M07 is the old M4 migrated to mission id `m07`
(world-building README, "Batasan urutan implementasi" #2). Phase 1 set out to
prove, in the running game, that **four events actually fire in an
RDP/Meterpreter session on the C2** (`11-spec-m7.md` §L, README #4). That live
test is still owed, and sections 4-9 below are it.

**Built in phase 4.** HoneyCheck, the designed `/legacy-cms/` node table, the
240-second tracking banner with its penalty and desktop breach, the ending
effects and Greta's letters, the "What now?" mail and the `choice` report
field, the money reward, the m7 BACKTRACE keys, and the Chinese text.

**Language.** English and Simplified Chinese are both complete. Switch the game
language and re-walk §12.

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
   ends on — and says that HoneyCheck (`honeycheck.net`) will give an opinion on
   whether a forgotten box is really forgotten, and that an opinion is not
   proof. That is the only in-world pointer to HoneyCheck (`docs/bugs.md` #52).

Expected: nothing visible; internally `tipReviewed`. Every later step refuses
until this one is done, so read the mail first.

---

## 2. Find what is behind the endpoint

The three public hosts behind the endpoint are not in the mail. Find them the
way M3 taught:

```
python3 net_tree.py 203.0.113.160
```

Expect these addresses behind the router: `45.76.180.9` (the Splitter),
`203.0.113.161`, `185.220.101.42`, `146.70.44.18`. The Firewall is
`isIpHidden`, and the engine consults that flag only in `whois` and `nslookup`,
so `194.60.38.12` may be listed too. Note whether it is: that settles whether
`net_tree.py` hides such hosts. Its address also comes from section 4.

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
`/legacy-cms/` in the output and `[FP][M07] probe:dirhunter-c2 listed=true`.
`dirhunter` itself advances nothing: what counts is **opening
`https://203.0.113.161/legacy-cms/` in the browser** (`Browser.Meta`).

Expected: internally `dashboardFound`, key `nodes`. Before the `-sV` scan of
section 2 the path is a **404**, although `dirhunter` already lists it. The page
is the designed LegacyCMS 2.1 node-status table (build 2011.04); its footnote
says the retired nodes' maintenance accounts still carry the factory default
login.

---

## 4. The forgotten box and the credential

Two boxes are written off. One is a honeypot, one is genuinely forgotten.

**Ash-Vector — the real dead box:**

```
ssh 146.70.44.18
```

user `admin`, password `admin` (the pair is not printed anywhere; the node
table's footnote only says the retired nodes carry the factory default login).

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
mail**. Touching it never advances the chain; it charges `min(balance, 500)`
once, with the mail (`[FP][M07] probe:honeypot-touched penalty=<n>`).

---

## 5. ash-gate

1. Browse to `http://194.60.38.12` — the pfSense panel.
2. Log in as `fw.admin` with the password from the backup file. Internally
   `firewallLoggedIn`. A wrong user or password must **not** open it: ash-gate
   has exactly one valid user (E-9).
3. Open **Firewall Rules**, delete or edit the 3389 rule, and **Save**.
   Internally `firewallBreached`, which lifts the rule, opens the port and
   traces the `firewall` key.
4. Re-scan: `nmap -sV 203.0.113.161` now shows `3389 OPEN`.

> **Before the Save, the RDP exploit must fail**, because the port is
> `active: false` from the build now. If it succeeds early, report it: that
> would mean `openPort` is not the real gate. (The phase-1 build opened 3389
> deliberately to reach the events; that shortcut is removed.)

---

## 6. HoneyCheck — the tool that is confidently wrong

Browse to `https://honeycheck.net/` and check each of the three hosts:

| Host | HoneyCheck says | The truth |
|---|---|---|
| `203.0.113.161` | **Not a honeypot**, 91% | correct |
| `185.220.101.42` | **Clean**, 88% | **wrong — this is the honeypot** |
| `146.70.44.18` | **Likely honeypot**, 71% | **wrong — this is the real dead box** |

The footnote says so out loud: *"This is not a foolproof method."* The honest
discriminator is section 2's banner check, not this site. Confirm the page works
at a narrow window too (the search is `<input>` + JS, never a `<form>`, because
the iframe has no `allow-forms`, E-10).

---

## 7. The C2 session and the 240-second trace

```
msfconsole
use exploit/rdp/cve_2019_0708_bluekeep
set RHOST 203.0.113.161
set RPORT 3389
set Version 5.2.1
exploit
```

On success: internally `shellObtained`, the `c2` key is traced, and **the
countdown banner appears at 04:00** — `SESSION TRACED`, turning red near the
end. `[FP][M07] banner shown ip=203.0.113.161 totalMs=240000`.

Then, at `meterpreter >`:

| Do this | Expect |
|---|---|
| `ls` | `manifest.txt` and `master_ledger_backup.enc` |
| `cat manifest.txt` | the MASTER LEDGER INDEX, with an `[integrity]` section that says the ledger file is a protected backup and to inspect its attributes (`attrcheck <file>`) before any read; internally `manifestRead`, key `manifest`, two personal-log lines |
| `attrcheck master_ledger_backup.enc` | the SELF_DESTRUCT_ON_READ warning; internally `trapRevealed` |
| `download master_ledger_backup.enc` | internally `fileExtracted`, key `ledger`, banner flips to **EXTRACTION COMPLETE**, and the Custodian's *"what now?"* mail arrives |

**`manifest.txt` must read** as five settled accounts (Northstar 2020 NA,
Rheinland 2023 EU, LOG-EU-2209 $1,400,000 2026-05-02, FIN-NA-0091 $4,100,000
2026-07-22, CASE-A7X-0417 $2,850,000 2026-08-14), the PacificCare note
classifying it *employee negligence (G. de Souza)* prepared with V. Orchid and
approved by Nordhaven on 2026-08-17, the watch line `d.reyes: monitor`, and the
closing *every account, settled.* Any `{{placeholder}}` or raw `M07.` key is a
finding.

**`repel 203.0.113.161` must do nothing useful.** The trace is deliberately not
repellable — expect *"No active intrusion detected."* If it cancels the
countdown, that is a finding.

---

## 8. Failing the trace on purpose (second run)

Get the session, read the manifest, run `attrcheck`, then **wait out the four
minutes**.

Expect: `[FP][M07] trace expired penalty=500` (or `min(balance, 500)`), the
banner flips to **TRACE COMPLETE**, `[FP][M07] ledger payload wiped`, and **the
desktop is breached** — black screen, `RECOVERY MODE // RUN SYSDIAG`.

Recovery, exactly as in M04 (the same kit):

1. `sysdiag` **inside the Meterpreter session must refuse**: *"only runs on this
   machine. Disconnect first."* Type `back` first.
2. `sysdiag` locally → the component table.
3. Restore the right build from `~/compositor/recovery/` and the backup config.
4. `sysrepair --rebuild` → desktop restored.

Then open a **new** session to the C2. Expect
`[FP][M07] ledger payload restored` and a fresh 04:00 countdown, and
`download` now works. **There is no dead end:** the firewall stays open, and the
file's payload comes back.

> Also confirm that **downloading the wiped file does nothing** while it is
> wiped — `fileExtracted` must not be set by a wiped payload.

**Deviation to be aware of:** the spec says the `.enc` "self-deletes". It is
implemented as *payload wiped in place* and restored by `Files.write`, because
`Files.create` only takes a `parentPath` and path resolution never reaches a
Meterpreter target (`docs/bugs.md` #30). `docs/bugs.md` #49 records it.

---

## 9. Opening the `.enc` directly (optional, outside the chain)

`open master_ledger_backup.enc` before downloading it:

- one mail from `watchdog@architect-c2.dark`
- a toast: *"That read was logged. You have less time now."*
- the countdown **re-arms at 02:00 at most**, not 04:00: it never becomes longer
  than the time that was left when you opened the file
- the file is **not** deleted

Doing it twice must not halve it again and must not send a second mail. The
handler acts only after the shell was obtained, and never once the file is
extracted or the window was already halved.

---

## 10. The report, the choice and the three endings

Compose to `drop@drop.null` with the **Mission 7 Findings** template. There is
no free-text version of this report: the choice is read only from the template.
`architect`, `evidence` and `choice` are **empty tokens** in the compose window
(the parent entity and the list of choices are already filled in): type each
answer, and Send enables after the last one is filled.

- `architect` → `Conrad Lindqvist` (needs "lindqvist")
- `evidence` → `employee negligence (G. de Souza)` (needs a fault word,
  "negligen" or 疏忽 / 过失, and "souza")
- `choice` → one of `expose`, `handoff`, `destroy`

Case and edge spacing are ignored; a fourth word is rejected, and so is an empty
choice. A rejected report gets no reply.

| `choice` | Expect |
|---|---|
| `expose` | Greta's letter arrives from `greta.desouza@postbox.my`; two personal-log lines; the C2 network stays up |
| `handoff` | Greta's other letter (a lawyer called, it will take years); two personal-log lines; network stays up |
| `destroy` | **no letter at all** — the inbox stays silent; two personal-log lines; the ledger file is removed and `[FP][M07] C2 network torn down (destroy ending)` appears, once, and the C2 hosts stop answering (`nmap 203.0.113.161`) |

The two log lines and the letter are written when the report is accepted, before
the mission completes, so the finished BACKTRACE report already shows them. Only
`destroy` unregisters the C2 network; `expose` and `handoff` leave it standing.

Then: `[FP][Backtrace] m7 -> complete` and `[FP][M07] reward skipped under
focus: 5000`. The 5000 only pays in a **production** run (D1), which needs
`flatline.m06` first.

Sending the report before the extraction gets one *"not yet"* reply.

---

## 11. BACKTRACE

Open the app. M07 now has a full report card: Summary, eight Key Findings,
Entities, Evidence and the Personal Log. Six keys are counted while the mission
runs, one per action:

| Key | Earned by |
|---|---|
| `nodes` | the `/legacy-cms/` node table opened |
| `credential` | `ash-gate_backup.txt` read |
| `firewall` | the panel saved |
| `c2` | the Meterpreter session |
| `manifest` | `manifest.txt` read |
| `ledger` | the download |

After the report, the Personal Log of the finished card shows the two lines of
the ending you chose. Layout: while M07 is locked or in progress the view shows
only its card, with no report text beside it; once M07 is complete the report
scrolls inside the view, like M3's.

---

## 12. Chinese pass

Replay in Simplified Chinese. Everything above has zh text, **including the
countdown banner**, whose labels are passed in already localized through its
`Variables` view (a widget loaded by path never sees `{{t:KEY}}` —
`docs/bugs.md` #48). Watch for any English leaking into the banner, the node
table, HoneyCheck, the manifest, the mails or Greta's letter.

---

## 13. Known follow-ups (not fixed / not yet live-tested)

1. **`attrcheck` and `open` at a `meterpreter >` prompt are still unproven in
   game** (`docs/bugs.md` #30 follow-up). Section 7 is that test.
2. **`Files.Transfer` on a Meterpreter `download`** has not been seen on this
   route (`11` §K).
3. **A `{ realMs }` Scheduler job across a live session** (`docs/bugs.md` #46) —
   the 240-second deadline rests on it.
4. **Whether a Firewall nested in a Splitter blocks its siblings**
   (`docs/bugs.md` #45). With the shortcut gone, the port's `active` flag is the
   gate either way.
5. **The wiped-payload mechanic** (`docs/bugs.md` #49) and whether `Files.write`
   reaches a remote root file at all.
6. **The banner widget path** `components/incident-banner.html`
   (`docs/bugs.md` #48).
7. **The reward path is unverified** (`docs/bugs.md` #42) and only pays outside
   focus.
8. **HoneyCheck is a mission site gated to m07**, not a permanent tool site;
   making it permanent waits on `weblab` (`04-web-layer.md` §E).
9. **No `frontend-design` pass.** That plugin is not available in the build
   environment; both new surfaces follow the briefs in prompt §6 by hand.

---

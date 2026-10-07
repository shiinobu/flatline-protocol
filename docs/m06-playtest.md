# M06 "Open Register" — Playtest Script (phase 7: full mission)

Status: **use once, disposable** — step-by-step script for M06 as implemented in
phase 7 of the M4-M7 run. Supersedes the phase-2 skeleton script that used to
live here. Delete or archive once M06 reaches FINAL LOCK; not a permanent design
doc (that is `docs/world-building/08-spec-m5-m6.md` §C and
`09-konten-m5-m6.md` §C).

**M6 reached FINAL LOCK on 2026-10-06** (README #72). The mission's `trace()` calls were removed and `DEV_FOCUS_QUEST.m06` is `false`, so
the `[FP][M06] probe:...` and `door:...` log lines quoted in this script no longer print: judge each step by what happens on screen and by
the BACKTRACE app. The one open item the owner accepted is the door square's letter animation, §16.9.

**M6 v2 (2026-10-06).** The chain was reworked into 13 gated steps that end at a Playfair-cipher door; the new script is §16, and
it supersedes the step order of §2 to §9. The text below is kept as the v1 record and for the sections that still apply.

**What changed since the skeleton.** The 5-step subset is now the spec's 10-step
chain. Added: the register as a searchable index rather than a single linked
record, eleven records opened in five stages, Alexander Voss as the "faced"
nominee decoy, the conflicting 2019/2024 ownership filings with the two-day gap
that resolves them, the Nordhaven Holdings and Nordhaven Mutual records, Vivien
Orchid's position, HostTrail (`hosttrail.net`) and the shared certificate, the
insurer `whois` gate that lands on the same registrant as M3's tunnel endpoint,
Conrad Lindqvist's officer record behind a two-branch gate, the M1-M3
consequences mirrored out of the `backtrace` state, the five-column report, the
six m6 BACKTRACE keys with a report card, eight personal-log entries (six
groups), and the full Chinese text.

**What M06 still is.** The project's only **zero-network mission**:
`networkIps: []` and `networks: () => []`. All of Very Hard comes from the page
layer and from reading records against each other. The phase-2 questions are
still the live ones, and §1 keeps them.

**Language.** English and Simplified Chinese are both complete. Switch the game
language and re-walk §11.

---

## 0. Entry point

M06's production prerequisite is `flatline.m05`. Test it on its own with dev
focus:

1. In `src/guard/flags.ts` set `DEV_FOCUS_QUEST.m06 = true` and every other
   entry to `false`. Leave `isDev = true`, `isDebug = false`, `isTester = false`.
2. Build and install as usual (`.\build-install.ps1`), restart HackHub.
3. Expect M6 listed as in progress in the BACKTRACE app and
   `[FP][M06] probe:zero-network register built=true`.
4. Expect `[FP][M06] probe:m3-consequence struckOff=false` when the save's M3 is not
   complete, and `struckOff=true` when it is (a full playthrough, or a save like the owner's,
   where the 2026-10-06 run printed `true`).

**Put the flag back to `false` before committing.** The reward is skipped under
focus: expect `reward skipped under focus: 3500`.

---

## 1. The four engine questions this build answers

Unchanged from phase 2, and still the reason this mission is worth live-testing:

1. Does a mission with **no network at all** start, run and complete? Watch for
   `probe:zero-network register built=true` with **no**
   `Network.createSubnetNetwork` and **no** rebuild job in the log.
2. Does `dirhunter pcr-registry.org` print a registered path with **no subnet
   anywhere** (engine fact E-3, `docs/bugs.md` #40)? Expect
   `probe:dirhunter-no-subnet host=pcr-registry.org`.
3. Does `Browser.Meta` work as a gate on a mod site with no network behind it?
   Every step below except two is a page visit, so the whole mission answers this.
4. Do `whois` / `nslookup` fixtures resolve a domain that was never registered
   with `Network.registerDomain` (E-1)? Four domains do exactly that here.

If (1) or (4) fails, the mission cannot run and nothing below is worth
debugging; report those two first.

---

## 2. Tip mail (step 1)

1. Open GoMail. One mail from `drop@drop.null`, subject **"nominees: who signs
   for it"**. Read it.
2. It names the jurisdiction (Port Calder), the register
   (`pcr-registry.org`) and the entity (SKN Capital Nominees), and tells you to
   read what the register *used* to say.

**Checks.** The mail is the only new one. Another subject from the same sender
advances nothing.

---

## 3. The register (step 2) and the nominee record (step 3)

1. `nslookup pcr-registry.org` → `38.242.76.19`. `nmap` it: 80 CLOSE,
   443 OPEN. There is no device behind either — that is the point.
2. Browse **`https://pcr-registry.org/`**. The index is a **search box**, not a
   list: type `nominees`, or `PC-114772`, or `skn`.
3. Expect `[FP][M06] probe:registry-page path=/` and `probe:stage=1`. The very
   first search must already find the record, with no reload: reading the tip
   already raised the stage (`probe:stage=1` appears at the mail read), because
   the page bakes its search payload before the `Browser.Meta` event runs
   (`docs/bugs.md` #55).
4. Open **SKN Capital Nominees Ltd** (`/entity/r7k4/`). Expect
   the BACKTRACE toast, the `nominees` trace in the app and one personal-log entry.
5. The record gives: company number, incorporated **2017-03-09**, jurisdiction,
   the registered agent **Marlowe & Pryce Corporate Services ·
   marlowepryce.biz**, and two directors — Alexander Voss (since 2017-03-09) and
   Imogen Hartley (since 2022-06-14). A note says Tomas Brandt resigned
   **2022-06-13**, the day before.

**Checks.**

- Opening the record directly, without the index, still counts for both steps:
  any register page is "reaching the register". One action still traces one key.
- `http://pcr-registry.org/` serves the shared 400 page and advances nothing.
- Search the register for `Nordhaven` at this point: **no match**. Only records
  the chain has opened are published, so the search is a progress gauge.

---

## 4. The decoy (no step)

1. From the SKN record, open **Alexander Voss** (`/officer/a4t7/`).
2. He is a professional nominee with **412** appointments on record, state
   VERIFIED. The note says the nominee holds the office, not the interest.
3. Expect **no** trace line. He is the wrong answer to the report's `architect`
   field and the register says so politely.
4. The agent's own record (`/entity/m8w5/`) lists the entities it files for,
   including **Skynet Import-Export Co.** from M2/M3.

**Checks.** Voss, the agent record, the shell record, Halvard, Vivien Orchid and
Nordhaven Holdings are all readable without advancing any step. Only six of the
eleven records are gates.

---

## 5. The agent (step 4)

1. `whois marlowepryce.biz` → the agent's own name as the contact.
2. Expect `[FP][M06] probe:agent-whois` and
   the `registeredAgent` trace in the BACKTRACE app.
3. From here `echoline.net` starts resolving.

**Checks.** `whois` on any other domain advances nothing. This is a CLI gate, not
a page gate — the first of two.

---

## 6. The unlinked page (step 5)

1. `dirhunter pcr-registry.org`. It prints **every** registered path, the hidden
   one included: `/filings/archive/`. Expect
   `probe:dirhunter-no-subnet host=pcr-registry.org`.
2. Browse **`https://pcr-registry.org/filings/archive/`**. It carries a notice
   saying it is not linked from the register index — which is true: nothing on
   the site links to it.
3. Expect the step and `probe:stage=3`.

**Checks.**

- Before step 4 the page is a **404**, by design. `dirhunter` still prints the
  path. That is engine fact E-3 (`docs/bugs.md` #40): a mod cannot hide a page
  from `dirhunter`, so paths are opaque instead.
- Every record path is opaque (`/entity/r7k4/`, `/officer/c9m2/`) for the same
  reason. If a path in the `dirhunter` output names a company or a person, that
  is a bug.

---

## 7. The two filings (step 6, parallel)

1. The archive lists two superseded filings on the same subject: **2019** state
   VERIFIED, **2024** state CONFLICTING.
2. Open the 2019 filing (`/filings/f19x/`): beneficial owner **Halvard Trust**.
3. Open the 2024 filing (`/filings/f24x/`): owner **withheld on request of the
   registered agent**, flagged for inspection, with one more line — the
   shareholding was declared against this entity by **Nordhaven Holdings (PC)
   Ltd · PC-141009**. The entity did not name its owner; the owner named itself.
4. After both: the `ownershipChange` trace in the BACKTRACE app, two personal-log
   entries and `probe:stage=4`. A second mail arrives from `drop@drop.null`,
   subject **"who runs the machines"**: it names `hosttrail.net` and the
   insurer's customer portal, `portal.nordhaven-mutual.com`. That mail is the
   only in-world pointer to HostTrail: Goagle lists no mod site (`docs/bugs.md`
   #52).
5. Follow **Halvard Trust** (`/entity/h3p8/`): dissolved **2021-11-30**. A
   dissolved entity cannot hold an interest and cannot file, so the 2019 owner
   could not still have been the owner in 2024.
6. Follow **Nordhaven Holdings**: incorporated **2021-12-02**. Two days later.

**Checks.** One filing alone does not join. Reading them in either order joins.
The conflicting filing must render with the flagged (amber) status, the verified
one without.

---

## 8. The insurer (step 7) and the infrastructure (step 8) — parallel

Both need step 6 and nothing else, and they can be done in either order.

**Step 7, the insurer:**

1. From Nordhaven Holdings, open its shareholder **Nordhaven Mutual Assurance
   Ltd** (`/entity/n5v4/`).
2. Its officers: **Vivien Orchid**, Head of Cyber Risk **2019-2024**, and
   **Conrad Lindqvist**, Chairman of the Risk Committee **2018-2024**. The
   record also lists **Customer portal: `portal.nordhaven-mutual.com`**.
3. Expect the `insurer` trace in the BACKTRACE app and one personal-log entry.
   Vivien Orchid is the officer who authorised the hospital payout in M5.

**Step 8, the infrastructure:**

1. `whois nordhaven-mutual.com` → registrant **Bulletproof VPN Ltd.** — the same
   registrant M3's `whois` gave for `203.0.113.160` and M4's for the control
   host.
2. Expect `probe:insurer-whois`, `traced infra` and one personal-log entry.
3. Open **`https://hosttrail.net/`** (open from step 6) and look up
   **`portal.nordhaven-mutual.com`**, the host the mail and the Mutual record
   name: one certificate, fingerprint listed, also presented for
   **`vpn.skn-central.net`**, answering from `193.42.33.60`. Look the tunnel host
   up (it answers from `203.0.113.160`) and you get the same certificate from
   the other side.
4. `marlowepryce.biz` is also sampled and has a certificate of its own — the
   agent is not part of the operator's infrastructure.

**Checks.** Either branch alone must leave `identityProven` closed. HostTrail is
a 404 before step 6. An unsampled host returns "we have not sampled that host",
not an empty card.

---

## 9. The name (step 9)

1. Only once **both** step 7 and step 8 are done does
   **`/officer/c9m2/`** stop being a 404. From then on the Mutual record links
   to it (the registry hides a link to a record that is still closed, so the
   link is not there before).
2. **Conrad Lindqvist** — three appointments: Chief Actuary **2009-2018**,
   Chairman of the Risk Committee **2018-2024**, and director of Nordhaven
   Holdings **2021-12-02 — 2024-03-01**.
3. Expect the `architect` trace in the BACKTRACE app, two personal-log entries and
   `probe:stage=5`.

**Checks.** Search the register for `Lindqvist` before step 9: no match. After
step 9 the search finds him. Visiting the path early is a 404 and advances
nothing; visiting it after both branches advances the step.

---

## 10. The M1-M3 consequences

Only visible in a full playthrough, where M3 is already complete. The controller
reads the `backtrace` state at mission start and mirrors it to
`SharedVariables` (pattern `docs/bugs.md` #36 — a website render has no mod
context, so it cannot read `SaveStorage` itself).

1. Expect `[FP][M06] probe:m3-consequence struckOff=true`.
2. The live register's **Skynet Import-Export Co.** record (`/entity/s2k9/`)
   reads **Struck off**, with the amber flag, instead of Active.
3. `https://echoline.net/s/3kq8/` is a capture of the **agent's** record dated
   **2026-09-30**. Its filing-contact line reads `d.reyes — no longer listed`.
   Expect `probe:archive-capture` and one personal-log entry, once only.
4. With M3 unfinished, the same two surfaces read Active and `d.reyes` with no
   suffix, and nothing in the chain changes. The consequence is colour, not a
   gate.

**Checks.** The Echoline index now lists two groups of captures: the M5 hospital
staff page and this one. The M5 captures are 404 once M5 completes; this one is
404 until step 4.

---

## 11. The report

Reply to `drop@drop.null` with the **Mission 6 Findings** template. The six
fields are **empty tokens** in the compose window, not pre-filled text: type each
answer, and Send enables after the last one is filled.

| field | an accepted answer | what the match needs |
|---|---|---|
| `architect` | `Conrad Lindqvist` | "lindqvist", and no "voss" |
| `role` | `Chairman Risk Committee, Nordhaven Mutual Assurance Ltd` | "chair" (or 主席) and "risk" (or 风险) |
| `agent` | `Marlowe & Pryce Corporate Services` | "marlowe" or "pryce" |
| `chain` | `Nordhaven Mutual Assurance Ltd, Nordhaven Holdings (PC) Ltd, SKN Capital Nominees` | all of "mutual", "holdings" and "nominee" |
| `proof` | `shared certificate and registrant Bulletproof VPN Ltd.` | "certificate" (or 证书) and "bulletproof" (or 防弹) |
| `front` | `Alexander Voss is a nominee, not the owner` | "voss" and one of "nominee", "front", "not the owner" (or 名义 / 代持 / 不是所有人) |

Case, punctuation and spacing are ignored. A rejected report gets no reply.

1. Send it early: one reply, subject **"not yet"**, naming the first unmet step.
   Sending again replaces that reply rather than stacking a second.
2. Send it complete: the objective completes, M6 is listed as complete in the
   BACKTRACE app with its facts, and (outside focus) `[FP][M06] reward paid: 3500`.
3. `Alexander Voss` as `architect` is rejected. `the registered agent filed it`
   as `proof` is rejected.

---

## 12. BACKTRACE

1. M06's card is **OPEN REGISTER**, nav slot 06.
2. In progress: `TRACED SO FAR // n OF 6` — Nominee company, Registered agent,
   Ownership change, Insurer linked, Shared certificate, Named officer.
3. After completion the card becomes the **MISSION 06** report: summary, eight
   findings, the Parent Entity card, three evidence rows (`EV-M6-01` the ownership
   change, `EV-M6-02` the shared certificate, `EV-M6-03` the committee minutes: chair,
   interest declared, settlements, minuting, meeting) and the eight personal-log entries.
4. No `—` may be left in the report. A dash means a key in the m6 fact builder
   does not match what the card asks for.
5. Layout: while M06 is locked or in progress the view shows only its card, with
   no report text beside it; once M06 is complete the report scrolls inside the
   view, like M3's.

---

## 13. Chinese pass

Switch to Simplified Chinese and re-walk §2, §3, §7, §8, §11. Everything
player-facing is translated: the tip mail, the quest title and objective, all
eleven records including their notes, the filing archive, HostTrail, the
capture, the report template and its reply, and the personal logs. Company
names, numbers, paths, domains, fingerprints and dates stay as they are.

---

## 14. Known follow-ups (not fixed / not yet live-tested)

Update 2026-10-06: the first live test answered the zero-network and `dirhunter`-without-subnet items below, see §15.

- **Zero network, live** — still the headline unknown (`docs/bugs.md` #47).
  `networksExist([])` is `true` and `buildNetworks([])` is an empty loop in the
  code; this build is the first time either runs in the game.
- **`dirhunter` with no subnet** — #40 was observed on a site that *had* one.
- **A stage held in `SharedVariables` and read from a website render** — the M5
  booleans proved the pattern; M06 stores a **number** and compares it. If a
  record 404s when it should serve, log `readM06Stage()` first. The mirror is
  reset, not only raised, at mission start, so a stage left by an earlier run
  cannot survive `mods.reset`; `docs/bugs.md` #55 explains why the stage must be
  raised before the visit that needs it.
- **Eleven dynamic pages on one site** — the largest page count the project has
  registered. If `dirhunter` truncates its output, that is new information.
- **The M3 mirror** reads the `backtrace` state at `OnObjectivesStart` only. A
  player who somehow finished M3 *after* starting M06 would not see the
  consequence until the next session. Acceptable: the chain forbids that order.

## 15. Live test result (2026-10-06)

First live run of the full mission, by the owner, under `DEV_FOCUS_QUEST.m06 = true` on a save with M3 complete. The evidence is
`hackhub-2026-10-06.log` (08:48 to 09:11) and what the owner confirmed on screen. Detail: `docs/bugs.md` #47 and #51.

**Confirmed by the log** (every line is a `[FP][M06]` probe unless noted):

| Section | What the log shows |
|---|---|
| §1 question 1 | `probe:zero-network register built=true` at the start, `built=false` after a mod reload, the mission carries on, no error entry |
| §1 question 3 | the page steps (archive, both filings, Mutual) advanced the stage on `Browser.Meta` of a mod site with no network behind it |
| §1 question 4 | `probe:agent-whois` and `probe:insurer-whois` both fired; the fixture text itself was not reported |
| §2 | `stage=1` when the tip is read |
| §3, §4 | `registry-page` for `/`, `/entity/r7k4/`, `/officer/a4t7/` and `/entity/m8w5/`; the stage stays 1 |
| §1 question 2, §6 | `probe:dirhunter-no-subnet host=pcr-registry.org` (08:50:51) |
| §5 | `agent-whois`, then `stage=2` |
| §6 | `/filings/archive/`, then `stage=3` |
| §7 | `/filings/f19x/` and `/entity/h3p8/` leave it at 3, `/filings/f24x/` raises it to 4 |
| §8 | `insurer-whois` leaves it at 4, `/entity/n5v4/` raises it to 5, `/entity/n5v1/` is not a gate |
| §9 | `/officer/c9m2/` visited at stage 2 (08:53:14, no change) and at stage 5 (09:06:05) |
| §10 | `archive-capture` once (09:07:19); `hosttrail-page` (09:07:48) |
| §11 | `reward skipped under focus: 4000` (09:11:24) |

**Confirmed by the owner on screen:** `dirhunter pcr-registry.org` prints `/filings/archive/`.

**Not confirmed in this run** (the log cannot show these and the owner has not reported them):

- §3: the first search finds the SKN record with no reload, and a search for `Nordhaven` at that point finds nothing.
- §9: `/officer/c9m2/` is a 404 at stage 2 (the code gates it at stage 5, `content/m06/records.ts`), and the search finds
  `Lindqvist` only after step 9.
- §10: Skynet reads Struck off in the Registry and the capture reads `d.reyes — no longer listed`.
- §11: the early-report reply ("not yet"), its replacement on a second send, and the rejection of `Alexander Voss` as
  `architect`. The log carries no line for any of them.
- §12: the BACKTRACE card (`TRACED SO FAR n OF 6`, the report with no `—`, the personal logs).
- §13: the Chinese pass.
- `dirhunter` listing all 13 registered paths (only the archive was confirmed).

**Observation.** `onObjectivesStartM06` ran twice at the first start (08:48:13 and 08:48:23, no reload between), see
`docs/bugs.md` #47. Harmless with an empty world.

**Left as is.** No code changed for this run. `src/guard/flags.ts` carries a local `DEV_FOCUS_QUEST.m06 = true`; put it back to
`false` before committing.

## 16. M6 v2 script (2026-10-06): the Playfair door

Status: installed in `src/`, typecheck clean, **never built and never seen in game**. Design: README #70. §2 to §11 above describe v1
and are superseded in the step order, the filing and insurer steps and the final gate. §10 (M1-M3 consequences), §11 (report fields),
§12 (BACKTRACE cards) and §13 (Chinese) still apply, except where this section says otherwise.

### 16.1 The 13 steps

| # | Flag | The player | Gets, opens |
|---|---|---|---|
| 1 | `tipReviewed` | reads the mail `a door that isn't on any map` | the door address, one motive line; stage 1 (door page and Registry open) |
| 2 | `doorSeen` | opens `https://x5nq3dvw7kzc2ybmr6ptua4hs2fj7ekg.onion` | the shopping list: 7 scrambled pairs with two result boxes each, three slot hints, the factor hint, a live 5x5 square |
| 3 | `registryReached` | opens any `pcr-registry.org` page (needs only the tip, not the door) | `nomineesRecord` fixtures |
| 4 | `nomineesRead` | opens the SKN record `/entity/r7k4/` | two directors (decoys Voss and Hartley), the agent and its domain |
| 5 | `agentIdentified` | `whois marlowepryce.biz` | stage 2: filing archive, Echoline capture, `filingArchive` fixtures |
| 6 | `hiddenFilingsFound` | `dirhunter pcr-registry.org`, opens `/filings/archive/` | stage 3: the two sealed filing pages, the Halvard record |
| 7 | `filing2019Opened` | Cipher Desk: the 2019 hex with key `PC-114772-2019` | the text names Halvard Trust, PC-098431 |
| 8 | `filing2024Opened` | Cipher Desk: the 2024 hex with key `PC-098431-2021-11-30` (only after step 7) | the text names Nordhaven Holdings (PC) Ltd; stage 4; BACKTRACE `ownershipChange` |
| 9 | `holdingsRead` | opens the Holdings record `/entity/n5v1/` | officers: Conrad Lindqvist (director) and Imogen Hartley (secretary, the decoy) |
| 10 | `insurerLinked` | opens the Mutual record `/entity/n5v4/` | board: Orchid and Lindqvist; stage 5: the door starts accepting answers, HostTrail opens, the insurer `whois` fixtures unlock, the mail `who runs the machines` arrives; BACKTRACE `insurer` |
| 11 | `doorOpened` | at the door: three key words, the sentence decoded by hand, the factor (needs steps 2 and 10) | stage 6: the minutes and the architect record open |
| 12 | `identityProven` | opens `/minutes/` on the door host | BACKTRACE `architect` |
| 13 | `infraLinked` | `whois nordhaven-mutual.com` (possible any time after step 10; not needed for the door) | registrant Bulletproof VPN Ltd.; BACKTRACE `infra` |
| 14 | `reportSent` | sends the report (needs steps 12 and 13) | quest done |

The HostTrail lookup is page-only (no event): `portal.nordhaven-mutual.com` shows a fingerprint ending `5d86` that
`vpn.skn-central.net` shares; `marlowepryce.biz` ends `1a33` and stands alone (the decoy).

### 16.2 Checks

1. **Door closed before the tip.** Open `x5nq3dvw7kzc2ybmr6ptua4hs2fj7ekg.onion` before reading the mail: a 404 page. After reading it: the page loads.
2. **The page.** 7 tiles `MB RD ON QL NY LV OL`, each over two result boxes. Empty slots: the square is the plain alphabet without J, all dim. Type
   the three words: the square reads `H A L V R / D N O E I / Q S T B C / F G K M P / U W X Y Z` with the first 13 cells lit. Tap a tile:
   its two letters are outlined in the square; tap again: cleared. Decoding by the rule printed on the page gives
   `BEHINDTHEWALL` plus the filler X (`BEHINDTHEWALLX`, checked both ways by a script).
3. **Too early.** The right sentence and `5d86` typed before the Mutual record (step 10) give `Not recognised.` and count as a failure.
   `5d:86` and `5D 86` are accepted as the factor (separators are ignored).
4. **Cooldown.** Failures 1 and 2 show `Not recognised.` with no wait; the 3rd shows `Too many attempts.` while a big `10`
   counts down over the square (the seconds are not in the text) with the button disabled. When the wait ends the count starts over: two more
   free tries, and the 3rd failure locks for 10 s again (never straight back into a wait). Reloading during a wait resumes the countdown: the
   square settles at once under the number and plays its boot scramble when the wait ends. Never a lockout.
5. **The right answer.** Click `Unlock`, or press Enter in either field (the button is a plain button: a `<form>` submit does nothing in a
   mod page, E-10). The sentence (typed into the 14 result boxes or clicked in the square; any case, one trailing X tolerated) plus `5d86` (any case):
   the page sweeps blank, a note from the author decodes inside red corner brackets (about 7 s; a click or Esc skips it), then `Playfair
   Decrypted` / `BEHIND THE WALL` and a `LOCKED IN` link to the minutes appear (focused; no automatic jump). Log: `probe:door-opened`, then `probe:door-page path=/minutes/`.
6. **Sealed filings.** Each filing page shows a hex block (one click selects it all) and the key recipe under it. The right key in Cipher
   Desk prints the sentence; a near-miss key prints garbled text and gives no progress. Opening the 2024 seal first gives no progress.
7. **Sequence.** Holdings and Mutual are 404 before step 8. Mutual before Holdings does not count; Holdings first, then Mutual does.
   `whois nordhaven-mutual.com` before step 10 returns nothing (the fixture is not there yet).
8. **Early report.** Sending the report template early returns `not yet` with the hint of the first unmet step (§16.3).
9. **The minutes.** An organisational document: letterhead (Nordhaven logo, company no. PC-061845), a control strip (reference
   NMA/RC/2023/Q4, 12 December 2023, Approved, Restricted), an Attendees table and an Agenda table (Matter, Discussion, Outcome).
   Item 2 names SKN Capital Nominees Ltd (PC-114772), North America (2020) and Europe (2023), and its Outcome is `The Chair confirmed
   that neither event will be minuted again.`; item 3 declares the Holdings directorship. Two signatures: Conrad Lindqvist, Chairman,
   Risk Committee (`Approved and signed`) and Vivien Orchid, Head of Cyber Risk (`Countersigned`). A big tilted `RESTRICTED`
   watermark sits across the sheet; at phone width the agenda rows stack as cards. BLACKLEDGER is not named anywhere on the door site.
10. **Restyle.** Registry (search, a record with the number plate, the filing archive with the sealed note, the sealed block), HostTrail
    (byte chips, the trail of hostnames, amber when shared), the door and the minutes, each also at phone width.
11. **Reload.** After a mod reload the stage and the door-open mirror are restored from the quest data.
12. **Chinese pass.** Every new string (door, minutes, seal hints, HostTrail, the 13 hints, the two mails) in zh.

### 16.3 The 13 hints (the `not yet` reply, en; zh in `src/i18n/m06/core.ts`)

| Unmet step | Hint |
|---|---|
| `tipReviewed` | Read what I sent you first. The address is in it. |
| `doorSeen` | Type the address no search engine knows and read what it asks for before anything else. |
| `registryReached` | The door tells you what to bring. The register is where you start looking for it. |
| `nomineesRead` | Read the entity's own record first. Two names sit on it. They are signatures, not owners. |
| `agentIdentified` | A nominee keeps an agent. The record names it and its domain. Ask whoever registered that domain. |
| `hiddenFilingsFound` | Not every page of a register is linked. A tool that walks a site's folders finds what the index leaves out. |
| `filing2019Opened` | The oldest filing is sealed. Key: the entity's number and the year, joined by dashes. A decrypt desk opens it. |
| `filing2024Opened` | The newer filing is sealed with what the older one told you: its owner's register number, then the day it stopped existing. |
| `holdingsRead` | Whoever replaced the old owner has a record. Find it by the name the 2024 filing gives, and read who sits on it. |
| `insurerLinked` | The new owner's shareholder is an insurer. Compare its board with the one you just read. |
| `doorOpened` | Three names in order, the sentence read back by hand against the square they build, and the last four characters of the shared certificate. |
| `identityProven` | The door is open. Read what is behind it, down to the signature. |
| `infraLinked` | Ask the registrar who holds the insurer's domain, not the website what it claims. |

On the pages themselves: the door carries the slot hints (owner that no longer exists; its replacement two days younger; the one person
on both boards, surname) and the factor hint; each filing carries its key recipe; the Holdings record says it was incorporated two
days after the previous owner's dissolution.

### 16.4 Defaults chosen here, not confirmed by the owner

The door host name `x5nq3dvw7kzc2ybmr6ptua4hs2fj7ekg.onion` (unverified in game); the sentence `BEHIND THE WALL` and its ciphertext `MBRDONQLNYLVOL`; the cooldown (0, 0, then 10 s); the
text of the minutes; Imogen Hartley as the Holdings company secretary (a decoy that sits on SKN and Holdings but not on the insurer);
the wording of the two sealed filings.

### 16.5 Not verified

Everything runs only as typecheck so far, plus one code review (§16.6). In particular: the page-to-mod call `flatlineDoorTry` returning an
object (proven for M5's portal in the exports lab, not for this site), `Date.now()` for the cooldown, the `Browser.Meta` event on the
new host, and the plain-button Unlock with the Enter handlers in the sandboxed frame, that a `.onion` host name loads at all, that its 32-character address can be copied or typed exactly from the mail, and how the success note animation feels. **No replay path was built**: the v1 completion lives in the owner's save, so a v2 run needs a
save where M6 has not completed or the reset the owner already uses for the other missions (see §0 of the other playtests).

### 16.6 Code review (2026-10-06) and what changed because of it

One reviewer pass over the whole change set (typecheck clean, no tests exist). It independently re-derived the Playfair square, the
ciphertext `FHLHBOHVZVNBIVEBVIRENY` (the first sentence, replaced in §16.7), the by-hand decryption rule and the factor `5d86`, and found them correct; the sealed texts (printable
ASCII, 260 and 336 hex digits), the 164 site keys and 38 core keys in en and zh, and the CRLF endings were also clean. Findings, all fixed:

| Severity | Finding | Fix |
|---|---|---|
| CRITICAL | The door's Unlock was a `<form>` submit, which does nothing in a mod page (E-10) | plain button, click handler, Enter handlers on both fields |
| HIGH | The automatic jump used `location.assign`, not the in-game navigation path | removed; the `Open the minutes` anchor stays |
| HIGH | A correct answer was rejected until the insurer `whois` ran, and counted as a failure | `infraLinked` moved off the door chain (door needs `insurerLinked`; the report needs `infraLinked`); stages renumbered (door 5, identity 6) |
| MEDIUM | Visiting the Registry before the door dropped `registryReached` silently | `registryReached` needs only the tip; the door needs `doorSeen` instead |
| LOW | The factor typed as `5d:86` or `5d 86` was rejected | separators are ignored |

### 16.7 Door v3 (2026-10-06, EKSEKUSI)

- Host `x5nq3dvw7kzc2ybmr6ptua4hs2fj7ekg.onion` (32 characters, unverified in game). The door page is anonymous: no Nordhaven name, sigil, site name or footer. Only the minutes page keeps the Nordhaven letterhead.
- Sentence `BEHIND THE WALL`: letters `BEHINDTHEWALL` plus the filler X, 7 pairs, ciphertext `MBRDONQLNYLVOL` (column, rectangle, row, rectangle, rectangle, row, column); the last pair `OL` decrypts to `LX` through a column wrap. One source: `M06_DOOR_PHRASE` in `src/content/m06/door.ts`, the passphrase is that phrase without spaces.
- The page: two result boxes under each pair (type them, or click the letters in the square), the square lights the pair and outlines the rule, a `Reading a pair` card, the header label `Playfair Cipher`. The cipher names `Playfair Cipher` and `Playfair Decrypted` and the signature `— the author` are not localized. Red theme only, no green.
- On success: the page sweeps blank, a note from the author decodes inside red corner brackets (five lines and `— the author`), then `Playfair Decrypted`, `BEHIND THE WALL` and the `LOCKED IN` link. About 7.3 s; a click or Esc skips it. Reloading once the door is open shows the final state at once; reloading during a cooldown resumes the countdown.
- Cooldown: two free tries, the 3rd failure locks for 10 s, then the count starts over (the old 20, 40, 60 s steps are gone; a failure right after a wait no longer locks again).
- The site icon stays the red door drawing. The zh text of the new strings, the author note included, is a draft for the owner to review.
- Checked so far: typecheck, and the repo page rendered with the en and zh strings and run in headless Chrome (typing, wrong factor, right answer, cooldown on reload, already open). Not seen in game.

### 16.8 Key help, found-counter and frame (2026-10-06, EKSEKUSI)

- Principle: help points at a document or a tool and never gives the word; it all lives in the world, with no hint button and no timers. The four keys are the three key words (HALVARD, NORDHAVEN, LINDQVIST) and the second factor `5d86`.
- Registry: `ENTITY_NOTE` now ends `Historic filings are retained in an archive that is not listed in the index.` (key words 1 and 2 sit in that archive, which opens after the agent `whois`).
- Mail `the agent files what it is told` from the dead drop, sent once at `agentIdentified` in `src/controller/m06/recon.ts` (same pattern as the hosts mail): the register keeps earlier versions, some of them on the site and never indexed, and a tool that walks a site's folders (`dirhunter`) finds what a page does not list. It does not name the tool.
- Door: slot 2 reads `Its replacement, incorporated two days after the first one was dissolved. First word of its name.` (2021-11-30 and 2021-12-02). The `Reading a pair` card has the static line `A right key turns the sentence into plain English.` The denial stays the generic `Not recognised.`
- Found-counter: `{{n}} of {{total}} found` next to `Key words`, total 3 from the page, shown also at 0. It counts discovery, not typing (the counter beside `The sentence` counts typed letters). Mirror `flatline.m06.keysFound` in `src/context/m06/progress.ts` (cleared at completion), set from quest data in `syncStage` and at the objectives start: word 1 at `filing2019Opened`, word 2 at `filing2024Opened`, word 3 at `insurerLinked`. The factor is not counted (HostTrail is page-only). The door reads the mirror when the page loads, so the count updates on the next load. Side effect: `3 of 3 found` plus a denial points at a typo or the factor.
- Tip mail: `It belongs to the insurer` became `It doesn't say whose it is` (the door page is anonymous). The quest description and objective still say `the insurer's committee`, which names the committee that holds the minutes.
- Frame: `.core::before` draws 3 px bars over a 1 px line made of background layers, so each bar sits centred on the line (an `outline` would paint over the red and split it).
- Minutes: the line `neither event will be minuted again` stays as it is (it was tied only to the old passphrase).
- Checked: typecheck, CRLF kept, no comments in `src/`, the repo page rendered with the en and zh strings in headless Chrome (`2 of 3 found`, the new sentence, the slot 2 hint, frame corners zoomed). Not seen in game; the zh of the new strings is a draft.
- Live-test checks: [ ] the counter reads `0 of 3 found` at the start, 1 after the 2019 filing is opened, 2 after the 2024 filing, 3 after the Mutual record (reload the door after each); [ ] the agent mail arrives right after the agent `whois`, once; [ ] the Registry record note shows the archive line in en and zh.

### 16.9 FINAL LOCK (2026-10-06) and the open door-animation report

- The owner declared M6 locked ("lock dan final M6", EKSEKUSI): README #72, changelog 2026-10-06.
- Removed: the 14 `trace()` calls in `controller/m06/{cipher,index,pages,recon}.ts` and `websites/m06/door/exports.ts`, and the `Terminal.Dirhunter` handler that only traced. `DEV_FOCUS_QUEST.m06` is `false`. Typecheck clean, no comments in `src/`.
- Not done: no full live test of v2 and v3 in the game, and the final code-reviewer pass over the M6 change set was not run (the owner asked for speed).
- Open, accepted as is (`docs/bugs.md` #72): the owner reported that the door square's letters do not animate in the game. After wrong attempts the letters stay `A` to `Z`, and then also on a fresh load or a refresh. Checked and not reproduced: headless Chrome with the owner's flow (type a key, fail three times, wait, type again) plays the boot scramble and the ambient flick; every page load in the game log came with `wait=0`; the game log records no iframe errors; a refresh mounts a fresh iframe; the game's page wrapper touches no timers or motion. The cause was not found. A probe export that reports into the game log was offered and not taken.
- By design the ambient flick (a random cell shows random letters for three steps, about every 2.3 s when idle) lands back on the original letter. The owner asked for a lasting random change; it would stop the square matching the typed key and the owner dropped it after a swap-based drift (only while the key slots are empty) was proposed.

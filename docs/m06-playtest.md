# M06 "Open Register" — Playtest Script (phase 7: full mission)

Status: **use once, disposable** — step-by-step script for M06 as implemented in
phase 7 of the M4-M7 run. Supersedes the phase-2 skeleton script that used to
live here. Delete or archive once M06 reaches FINAL LOCK; not a permanent design
doc (that is `docs/world-building/08-spec-m5-m6.md` §C and
`09-konten-m5-m6.md` §C).

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
3. Expect `[FP][Backtrace] m6 -> progress` and
   `[FP][M06] probe:zero-network register built=true`.
4. Expect `[FP][M06] probe:m3-consequence struckOff=false` under focus (M3 is
   not complete in a focused save) and `struckOff=true` in a full playthrough.

**Put the flag back to `false` before committing.** The reward is skipped under
focus: expect `reward skipped under focus: 4000`.

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
   `[FP][Backtrace] m6 traced nominees` and one personal-log entry.
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
   `[FP][Backtrace] m6 traced registeredAgent`.
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
4. After both: `[FP][Backtrace] m6 traced ownershipChange`, two personal-log
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
3. Expect `[FP][Backtrace] m6 traced insurer` and one personal-log entry.
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
3. Expect `[FP][Backtrace] m6 traced architect`, two personal-log entries and
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

Reply to `drop@drop.null` with the **Mission 6 Findings** template. The five
fields are **empty tokens** in the compose window, not pre-filled text: type each
answer, and Send enables after the last one is filled.

| field | an accepted answer | what the match needs |
|---|---|---|
| `architect` | `Conrad Lindqvist` | "lindqvist", and no "voss" |
| `role` | `Chairman Risk Committee, Nordhaven Mutual Assurance Ltd` | "chair" (or 主席) and "risk" (or 风险) |
| `chain` | `Nordhaven Mutual Assurance Ltd, Nordhaven Holdings (PC) Ltd, SKN Capital Nominees` | all of "mutual", "holdings" and "nominee" |
| `proof` | `shared certificate and registrant Bulletproof VPN Ltd.` | "certificate" (or 证书) and "bulletproof" (or 防弹) |
| `front` | `Alexander Voss is a nominee, not the owner` | "voss" and one of "nominee", "front", "not the owner" (or 名义 / 代持 / 不是所有人) |

Case, punctuation and spacing are ignored. A rejected report gets no reply.

1. Send it early: one reply, subject **"not yet"**, naming the first unmet step.
   Sending again replaces that reply rather than stacking a second.
2. Send it complete: the objective completes, `[FP][Backtrace] m6 -> complete`,
   the facts dump, and (outside focus) `[FP][M06] reward paid: 4000`.
3. `Alexander Voss` as `architect` is rejected. `the registered agent filed it`
   as `proof` is rejected.

---

## 12. BACKTRACE

1. M06's card is **OPEN REGISTER**, nav slot 06.
2. In progress: `TRACED SO FAR // n OF 6` — Nominee company, Registered agent,
   Ownership change, Insurer linked, Shared certificate, Named officer.
3. After completion the card becomes the **MISSION 06** report: summary, eight
   findings, the Parent Entity card, two evidence rows (`EV-M6-01` the ownership
   change, `EV-M6-02` the shared certificate) and the eight personal-log entries.
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

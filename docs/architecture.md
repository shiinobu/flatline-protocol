# FLATLINE PROTOCOL — `src/` Architecture

**Status: LOCKED 2026-09-18** — this is the mandatory structural pattern for
Missions 1-4. Chosen over entity-resolution-mods' full layered
(`core/domain/state/application/infrastructure/content`) pattern: that
depth exists in entity-resolution-mods to support a 16-quest campaign with
its own persistent cross-quest domain models (evidence graphs, relationship
tracking, etc.) — FLATLINE PROTOCOL is 4 missions with no equivalent shared
domain model, so the full layering would be pure ceremony here.

This is the **Hybrid** pattern: the official `create-hackhub-mod` scaffold's
flat top-level folders, plus entity-resolution-mods' single most
load-bearing rule (content/logic split) applied inside `main/` instead of
its own dedicated `content/` root — see below.

## Layering

```text
src/
  content/     — mNN.ts per mission: pure data only (objective IDs, the
                 Objectives array, target IPs/hosts, nmap/lynx/dirhunter
                 fixture results, dialog trees, mail bodies, reward numbers,
                 delay constants). No SDK imports, no `this`, no behavior.
                 Small shared modules hold what more than one mission (or
                 BACKTRACE) reads: `characters.ts`, `blackledger.ts` and
                 `finance.ts` — the ransom money model (three batches, one
                 60/25/5/10 waterfall, USD formatting), the single source
                 of every amount in M2, M3 and BACKTRACE; it imports only
                 `M01_CASE_ID`.
  main/        — mNN-quest.ts per mission: the only file that imports its
                 matching content/mNN.ts. Registers the quest, wires SDK
                 event listeners to objective completion, owns small
                 behavior-only helpers (fixture registration, mail-send
                 wrappers, event handlers) that don't belong in content/.
  commands/    — custom @RegisterCommand terminal commands with no native
                 SDK equivalent (e.g. a future attrcheck for Mission 4's
                 booby-trapped file).
  applications/ — custom desktop Apps: currently BACKTRACE, GHOSTWIRE's
                  case file (the @RegisterApp class, its HTML, and the
                  SaveStorage state + facts helpers the quests use). Flat,
                  no per-app subfolders — see "Applications: BACKTRACE"
                  below.
  websites/    — Website page registrations (@RegisterWebsite/Host/Pages)
                 + their HTML, one subfolder per site (M1's marketplaces
                 and LedgerVault, TR4C3#404's panel, Skynet Import-Export's
                 public site, etc.).
  guard/       — dev/prod gating helpers with no story content of their
                 own (currently dev-flag.ts — isDev/questGate/
                 isQuestDevFocus/applyDevGating, see
                 docs/implementation-rules.md §2a). Kept separate from
                 content/ since it's not mission data, and separate from
                 main/ since every mission's quest file imports it.
  index.ts     — production bootstrap: which missions are actually active
                 (import list is the single source of truth, same
                 convention as entity-resolution-mods).
  types.d.ts   — ambient module declarations (currently *.html strings).
```

No `themes/` folder yet — nothing in the mission design needs a UI theme;
add one only if a specific objective actually requires it, and don't
scaffold ahead of need. `applications/` exists because BACKTRACE is a
cross-mission feature that belongs to no single mission's `content/` or
`main/` file.

## The one rule carried over from entity-resolution-mods

**Content and logic never mix, in either direction.** `content/mNN.ts` is a
single, ungated value — never forked by a dev flag, never containing
`this` or an SDK call. `main/mNN-quest.ts` imports its content and adds
behavior only. This is the rule entity-resolution-mods learned the hard way
(`HackhubPost` and the phone-call `Dialog` tree were both missed on a first
pass and left inline in a quest file — see that project's
`docs/implementation-rules.md` §1) — worth keeping even without the rest of
its layering.

## What was deliberately NOT carried over

entity-resolution-mods' `core/`, `domain/`, `state/`, `application/`
layers (branded IDs, `Result<T,E>`, `StateStore`/`FlagStore`,
`QuestService`/`RewardService`/`EconomyService`/etc.) exist to give that
project's 16-quest campaign a single canonical, testable state model
independent of the HackHub SDK. FLATLINE PROTOCOL's SaveStorage/state needs
are expected to be small enough (4 missions, a handful of flags/evidence
items) that `Shell`/`Files`/`SaveStorage` calls living directly in
`main/mNN-quest.ts` should be sufficient. **Revisit this if that stops
being true** (e.g. if cross-mission state tracking — the recurring
dead-drop contact, the VPN-IP thread from M3→M4 — turns out to need more
than a couple of shared flags) rather than assuming the flat structure is
permanent no matter what. The first cross-mission state now exists —
BACKTRACE's `backtrace` key, below — and it is still one helper and one
key, so the flat structure holds.

## Applications: BACKTRACE

`src/applications/` holds the mod's one desktop App, BACKTRACE (GHOSTWIRE's
case file), as five flat files:

- `backtrace.ts` — the `@RegisterApp` class (`AppName = "backtrace"`,
  `Unlocked = true`, an AppStore `Store` listing) that imports the HTML.
- `backtrace.html` — the whole UI in one file. It reads mission state
  through `HackhubSDK.SaveStorage`, polls it every 2 s, and drives the
  sidebar statuses, the M1/M2/M3 report views (Summary, Key Findings,
  Entities, Evidence, Personal Log) and the CASEBOARD, whose nodes and
  connections appear as their keys are traced. While a mission is open its
  card shows only the "TRACED SO FAR // x OF N" panel: one row (title +
  value) per key, no descriptions. No story fact is hardcoded in it:
  everything is bound to a mission's `facts`. Outside the game (`file:`
  protocol, no SDK) it falls back to an M1+M2+M3-complete preview with
  sample facts.
- `backtrace-state.ts` — `setBacktraceMission(mission, status)`,
  `traceBacktraceFinding(mission, key)` (typed: a key that is not in
  `BACKTRACE_KEYS[mission]` does not compile) and its untyped sibling
  `traceBacktraceKeyById` (debug command only), and
  `appendBacktraceLogs(mission, texts)`, the only writers of the state, plus
  its types. All are fail-safe: an error is logged with `trace()` and never
  reaches the quest that called them.
- `backtrace-facts.ts` — `BACKTRACE_KEYS` (the ordered key list per mission),
  `isBacktraceKey` and `buildBacktraceFacts(mission)`, the only place
  BACKTRACE reads mission canon (`content/m01.ts`, `content/m02.ts`,
  `content/m03.ts`, `content/finance.ts` and the per-save winning M1 listing
  from `content/m01-listing-pool.ts`). This is the one deliberate
  `applications/` → `content/` import; nothing in `content/` imports back.
- `backtrace-debug.ts` — the `scratchbt` debug command (moved out of
  `src/debug/scratch.ts` on 2026-09-29 since it is ongoing BACKTRACE tooling,
  not a throwaway scratch experiment): inspects/sets a mission's status and
  traces one key at a time against the same `backtrace-state.ts` writers a
  quest uses, so a save's BACKTRACE state can be driven by hand without
  replaying a mission.

State is one `SaveStorage` key, `backtrace`:

```text
{ m1..m4: { status: "locked" | "progress" | "complete", completedAt?: <in-game ms>, facts?: { <key>: <string> }, logs?: <string>[] } }
```

Each `main/mNN-quest.ts` writes the status from `OnStart` (`progress`),
`OnComplete` (`complete`, stamped with `Time.now()`) and `OnAbandon`
(`locked`). `facts` grow in two ways, and only one of them is per action. A
checkpoint inside a quest calls `traceBacktraceFinding(mission, key)` the
moment the player provably sees or uses the value (idempotent; a `locked`
mission becomes `progress`) — **one call per action, one key per call**.
`OnComplete` then replaces the partial set with the full snapshot (every key
plus every extra), taken before the quest's teardown wipes per-save data such
as the M1 listing resolution, so a finished report always has every value.
M4 has no facts yet and shows "REPORT PENDING". An App iframe can read
`SaveStorage` — unlike a `Website`'s `metadata()` (`docs/bugs.md` #20) —
confirmed in-game with the `scratchbt` debug command (`src/applications/backtrace-debug.ts`):
`scratchbt <mission> <status>` sets the state (facts included on `complete`)
and cascades the next mission like the real `AutoStart` chain, `scratchbt
<mission> keys` lists the keys and `scratchbt <mission> <key>` traces one.

### Keys, extras and Key Findings

The rule (2026-09-29, `docs/implementation-rules.md` §13): **one action
yields at most one key finding.** A *key* is one important finding and the
only thing counted and shown while a mission runs. An *extra* is a
supporting fact (a case ID carried over from M1, a settlement date, the
split of a payout) that lives in `buildBacktraceFacts` but is never a key,
is never traced on its own, and is never the name of another mission's key.
Extras reach the app only in the COMPLETE snapshot, where the report's
**Key Findings** compose keys and extras into the chain of events. The Key
Findings list is free-standing report copy in `backtrace.html` and may be
longer than the key list (M1 5 findings from 4 keys, M2 9 from 7, M3 8 from
6).

### Tracing checkpoints

A key is traced only at an event that proves the player saw or used the
value. A key with no such event stays hidden until completion; it is never
guessed.

| Mission | Key | Checkpoint |
|---|---|---|
| M1 | `broker` | winning listing page opened (`Browser.Meta`, the `listingFound` flag) |
| M1 | `buyer` | `cat` of the backend's `sales_ledger` whose content contains the buyer alias (`Terminal.Cat`) |
| M1 | `vault` | LedgerVault domain visited (`Browser.Meta`, the `vaultVisited` flag) |
| M1 | `caseId` | Q3-2026-SEA folder opened inside LedgerVault: the page calls the exported `flatlineOpenProject(folder)`, which emits `flatline.m01.projectOpened` (`Website.Exports` + `Events.emit`, the `caseFileOpened` flag) |
| M2 | `developer` | `Sqlmap.DumpTable` of the `admins` table on the devbox IP |
| M2 | `ransom` | `Sqlmap.DumpTable` of the `affiliates` table on the devbox IP |
| M2 | `deployLog` | `cat deploy.log` (exact content match, `Terminal.Cat`) |
| M2 | `homeLead` | `cat sync-home.txt` (exact content match, `Terminal.Cat`) |
| M2 | `firewall` | `PFSense.Login` on the home firewall |
| M2 | `workstation` | `RemoteConnection.Established` with `t === "METASPLOIT"` on the workstation (the plain `exploit` flow; `Metasploit.Meterpreter.Connected` is only raised by the reverse-TCP listener, `bugs.md` #29) |
| M2 | `shellCompany` | `open wire_authorization.pdf` once the firewall is breached (`OPEN_FILE_READ_EVENT`) |
| M3 | `portal` | first Save in the remote gateway's Port Forwarding panel (`Network.PortChanges` on `77.83.142.6`, the `portalReached` flag) — the gateway is a `Router`, whose TP-Link panel raises no login event (`bugs.md` #31) |
| M3 | `parentEntity` | `Sqlmap.DumpTable` of `wire_transfers` or `Database.Connected` on Coin-Drift (one key, either route) |
| M3 | `gateway` | `RemoteConnection.Established` with `t === "METASPLOIT"` on Vault-Line (`Metasploit.Meterpreter.Connected` is accepted too, for the reverse-TCP flow) |
| M3 | `vpnPeer` | `cat site_to_site_backup.txt` at the gateway session (`Terminal.Cat`; a `download` + `open` of the local copy also counts, `OPEN_FILE_READ_EVENT`). The Tunnel endpoint (`architectVpn`) stopped being a key on 2026-09-29: it is an extra in the COMPLETE snapshot, because the Wireshark capture that used to carry it was removed (`bugs.md` #34). |
| M3 | `accomplice` | `RemoteConnection.Established` with `t === "SSH"` to Faded-Ledger (optional bonus thread; `Terminal.Explorer` there also counts but only Meterpreter/`evil-rm` raise it, `bugs.md` #33) |

`open` is the project's own terminal command (`src/commands/open.ts`): it
prints a file of any extension and emits `flatline.open.fileRead`, which is
how a file becomes a checkpoint (`cat` only reads `.txt`/`.log`). The M1 key
whose trigger is a flag (`broker`, `vault`, `caseId`) is re-traced from the
persisted flag every time `OnObjectivesStart` runs, so saves that passed a
checkpoint before tracing existed catch up.

`logs` is a separate, append-only list of plain narrative lines (GHOSTWIRE's
own reflections), written by `appendBacktraceLogs(mission, texts)` instead of
`traceBacktraceFinding` — there is no canon builder to rebuild them from, so
`OnComplete`'s full snapshot carries the accumulated array forward rather
than regenerating it. Duplicate text for the same mission is a no-op. M2 logs
two groups this way: `deployLogFound` (the deploy log's `cat`) and
`aftermathShown` (the first `open` of a workstation file) — the same
triggers that previously called `this.createDialog()`, before that mechanic
was dropped for M2 (see `docs/changelog.md` 2026-09-27: it always presents as
an incoming phone call, but every line was `speaker: "GHOSTWIRE"`). M3 logs
five groups (`ledger`, `capture`, `root`, `reyes`, `aftermath`). BACKTRACE
renders `logs` two ways: a live preview on the still-open mission's card
(`stateCardMarkup`, "PERSONAL LOG") and the "Personal Log" section of the
finished M2/M3 reports (`[data-personal-log="m2"]`, `"m3"`).

To add a key: add it to `BACKTRACE_KEYS` and to the mission's builder in
`backtrace-facts.ts`, give it a title in the script's `KEY_LABELS`, and call
`traceBacktraceFinding(mission, key)` from **one** event handler that proves
it — never from a handler that already traces another key. To add an extra:
only add it to the builder and bind it in the report copy with
`data-fact="mN.key"` (comma-separated fallbacks are allowed, e.g.
`m2.buyer,m1.buyer`). Values are inserted as text or escaped, and a missing
fact renders as "—".

## Naming convention

Missions are `m01`-`m04` (not `q01`-`q16` — this project has no "quest"
numbering precedent of its own, and "mission" matches the story's own
framing): `content/m01.ts`, `main/m01-quest.ts`. Mission titles for
reference: m01 "Jejak Pertama", m02 "Sang Pembuat", m03 "Jalur Uang", m04
"Sang Dalang".

## Bootstrap flow

```text
src/index.ts
  imports (side-effect registration, decorator-driven):
    applications/*.js
    commands/*.js
    websites/*/index.js
    main/m01-quest.js .. m04-quest.js
  ↓
  @RegisterModPackage class extends Bootstrap
    OnModPackageLoaded()   -> (SaveStorage load, once state persistence exists)
    OnModPackageUnloaded() -> (SaveStorage save, once state persistence exists)
```

Currently `index.ts` is an empty `Bootstrap` shell — no missions registered
yet. Adding a mission to production means adding its imports here in
sequential order (`m01` → `m02` → `m03` → `m04`), once its own
live-validation gate passes.

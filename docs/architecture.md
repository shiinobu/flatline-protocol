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
case file), as four flat files:

- `backtrace.ts` — the `@RegisterApp` class (`AppName = "backtrace"`,
  `Unlocked = true`, an AppStore `Store` listing) that imports the HTML.
- `backtrace.html` — the whole UI in one file. It reads mission state
  through `HackhubSDK.SaveStorage`, polls it every 2 s, and drives the
  sidebar statuses, the M1/M2 report views (a placeholder card while a
  mission has no report yet) and the CASEBOARD. No story fact is hardcoded
  in it: findings, entity cards, evidence records, CASEBOARD nodes and the
  entity drawer are bound to the mission's `facts`. Outside the game
  (`file:` protocol, no SDK) it falls back to an M1+M2-complete preview
  with sample facts.
- `backtrace-state.ts` — `setBacktraceMission(mission, status)`, the only
  writer of the state, plus its types.
- `backtrace-facts.ts` — `buildBacktraceFacts(mission)`, the only place
  BACKTRACE reads mission canon (`content/m01.ts`, `content/m02.ts` and the
  per-save winning M1 listing from `content/m01-listing-pool.ts`). This is
  the one deliberate `applications/` → `content/` import; nothing in
  `content/` imports back.

State is one `SaveStorage` key, `backtrace`:

```text
{ m1..m4: { status: "locked" | "progress" | "complete", completedAt?: <in-game ms>, facts?: { <key>: <string> } } }
```

Each `main/mNN-quest.ts` writes it from `OnStart` (`progress`), `OnComplete`
(`complete`, stamped with `Time.now()`) and `OnAbandon` (`locked`); a mission
that never starts stays `locked`. `facts` is a snapshot taken inside
`OnComplete`, before the quest's teardown wipes per-save data such as the M1
listing resolution: M1 carries `broker`, `buyer`, `caseId`, `listing`,
`project`, `vault`; M2 carries `buyer`, `developer`, `shellCompany`,
`caseId`, `ransom`, `settled`, `victims`; M3/M4 have none yet and show
"REPORT PENDING". An App iframe can read `SaveStorage` — unlike a
`Website`'s `metadata()` (`docs/bugs.md` #20) — confirmed in-game with the
`scratchbt` debug command (`src/debug/scratch.ts`), which sets, prints and
resets the state (facts included) and mirrors the real `AutoStart` chain.

To show a new fact: add it to the mission's builder in `backtrace-facts.ts`,
then bind it in `backtrace.html` with `data-fact="mN.key"` (comma-separated
fallbacks are allowed, e.g. `m2.buyer,m1.buyer`) or use it in the script's
evidence and entity configs. Values are inserted as text or escaped, and a
missing fact renders as "—".

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

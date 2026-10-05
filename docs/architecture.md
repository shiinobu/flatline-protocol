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

## Restructure status (2026-10-02)

The `src/` restructure is **finished: all seven missions follow the mission
pipeline below.** M01 landed on 2026-09-20, M02 and M03 on 2026-10-01 (both
passed their live test the same day), and M04-M07 on 2026-10-02 in one run:
the old M4 was migrated to mission id `m07` and rewritten as "The Architect",
and `m04` was rebuilt as "Burn Notice", with `m05` ("The Door") and `m06`
("Open Register") written from their specs. The older shape (one
`main/mNN.ts` holding the quest class plus all of its helpers, fed by a flat
`content/mNN.ts`) survives only in the `*.original.*` reference copies under
`src/archive/`, which are imported by nothing. **None of M04-M07 has been live-tested yet** — `tsc --noEmit` is
clean and every mission has a mocked-SDK harness, but nothing beyond that; the
per-mission scripts are `docs/m04-playtest.md` through `docs/m07-playtest.md`.
The generic additions M2 and M3 needed (splitter and printer nodes, device and
domain vulnerabilities, databases, restore data, boolean-only gates, the global
site-string cache) landed on 2026-10-01 as "Phase 0"; the ones M4-M7 needed
(`components/reward.ts`, `components/intrusion.ts`, the desktop-breach and
incident-banner kit, `commands/flatline.ts` (named `repel.ts` until 2026-10-03), `sysdiag`, `sysrepair`) landed with
their own phases, and the plans are in `docs/scratch.md`.

## Mission pipeline (all seven missions)

```text
main/mNN.ts  ->  controller/mNN/  ->  core/ . components/ . middleware/   (generic, mission-blind)
 (thin class)    (assembles)       +  content/mNN/ . i18n/mNN/              (the mission's data)
```

- **`main/mNN.ts`** — one thin `@RegisterQuest` class: class fields come from
  the controller's spec and each hook (`OnStart`, `OnObjectivesStart`,
  `OnComplete`, `OnAbandon`, `CreateData`) is one line that calls the
  controller. No data, no helpers.
- **`controller/mNN/`** — the only place that assembles a mission: `index.ts`
  (the four hooks), `spec.ts` (quest fields), `report.ts` (the mission's
  report matcher), the event listeners grouped by phase (M01: `recon.ts`,
  `breach.ts`, `access.ts`, `vault.ts`) and anything only that mission uses
  (M01's IRC server, `irc.ts`). Listeners receive the quest instance, since
  `Data`, `Events`, `SetData` and `completeObjective` are public on `Quest`.
- **`core/`** — flat, mission-blind functions that only call components:
  `register(world, state)` (idempotent, rebuilds the world from progress and
  returns whether the network was rebuilt), `unregister(world)`,
  `unlock(world, name)`, `seed(intro)`; the spec types live in `types.ts`.
  `register` builds in place when no router exists (first install), keeps the
  network when progress and routers agree, and otherwise (routers exist but
  the quest data was reset, e.g. `mods.reset`) schedules a rebuild job
  (`rebuild.ts`, bound once per world with `bindWorld`): sequential awaited
  `destroyNetwork`, then build. Concurrent destroys overwrite each other (see
  bugs #35); `unregister` tears down the same way. `UnlockSpec` carries
  fixtures, domains, firewall rules and ports, so everything a step reveals
  appears only when that step is reached. A `WorldSpec` may also carry
  `databases` (a `DatabaseSpec` per host: created once, every table re-set on
  each register, removed by host) and `restore` (state the player authored,
  such as M3's port-forward rules: `register` takes it in `WorldState.restore`,
  the rebuild job carries it in its payload and calls `restore` after the
  build). Databases are applied after a build and removed after the awaited
  teardown, never beside a `destroyNetwork`: its reply puts the whole store
  back (bugs #35).
  Not to be confused with entity-resolution-mods' `core/`, which is a
  different thing (see below).
- **`components/`** — flat building blocks used by two or more missions:
  `topology` (networks of router, splitter, firewall, printer and device
  nodes, port/firewall changes, per-device vulnerabilities set after the
  build), `domains` (with optional vulnerabilities), `fixtures` (Shell command
  data), `database`, `persona` (Twotter), `report` (GoMail template and
  dual-path validation). The M4/M7 kit lives here too (all mission-blind, state
  under a `SaveStorage` prefix the mission passes in): `intrusion` (strike
  state, deadline job, repel targets), `incident-banner` (+ `.html` widget, a
  `broadcast` variant for M4), `desktop-breach` (breach state, kernel files,
  restore), `kernel-files` / `kernel-layout` (real files under `/lib/modules`,
  `/etc`, `/boot`, `/var/log`, written by sweeping `name (n)` copies, bugs #57),
  `recovery-widget` + `recovery-console.html` (the full-screen console, bugs
  #58), `desktop-glitch`, `desktop-lock`, `session-guard` (bugs #60),
  `css-inject`, `reward`, `mail`, plus the 2026-10-03 additions `log-file`
  (syslog, ISO-dated and clock-only text to Log Viewer entries; `DeviceSpec.rootLogDay`,
  `neutralLogs` and `typedLogs` convert a device's `.log` root files, `userLogDay` its users' files), `file-reads` (`cat`, `open` and
  `Files.Open` in one listener, bugs #56) and `flatline-sequence` (the
  println-only cut-off animation). Randomness in the kit goes through
  `Random.number`, not
  `Math.random`, called inside a handler so mod context holds (bugs #19).
  A device spec marks its users' `.log` files for conversion with
  `DeviceSpec.userLogDay` (a story day); `components/topology` turns their
  text into entries when it builds the network, so `content/` stays data only.
  A controller converts any log it writes itself (`controller/m04/firewall-log.ts`).
  `playFlatline` takes its two labels as arguments, so no component imports
  `i18n/`.
- **`middleware/`** — flat step gating, the thing that keeps a mission's
  mechanics in order even when it shows a single objective:
  `advanceStep(quest, gates, step, onAdvance)` sets a progress flag only when
  every prerequisite flag is already set (and then runs the step's side
  effects: unlock, BACKTRACE finding, log, `completeObjective`), `canAdvance` /
  `missingFlags` answer the same question without writing,
  `firstUnmetStep(order, data)` finds where a player is stuck, `reachedUnlocks`
  lists the world unlocks the progress has reached. The per-mission tables
  are data and live in `content/mNN/gates.ts`: a transitive chain, each step
  requiring its predecessor (a step may list several prerequisites, which is how
  a parallel pair joins). Gates are typed on boolean flags only (`FlagKey`), so
  a non-flag key such as M3's `forwards` can never be a step. Every listener
  goes through `advanceStep`; none calls `SetData` for a chain step directly.
- **`content/mNN/`** — the mission's data, one file per concern, no mission
  prefix in the file name (M01: `network`, `topology`, `fixtures`, `scan`,
  `server-files`, `irc`, `twotter`, `assets`, `mail`, `report`, `quest`,
  `state`, `intro`, `gates`, `listing-pool`). `topology.ts` is plain data (a
  `RouterSpec` tree; `components/topology` turns it into SDK definitions);
  `intro.ts` bundles the spec `core/seed` consumes. The only SDK call left in
  content is `Localization.t`, evaluated lazily inside builders. The spec
  `core/register` consumes (`M01_WORLD`) lives in `controller/m01/world.ts`,
  because it reads per-save state.
- **`i18n/mNN/`** — the mission's `Localization` key tables (and
  `site-keys.ts`, the list of keys its websites need); each file registers its
  strings when imported, so every one must stay reachable from the import
  graph.
- **`context/mNN/`** — per-save runtime context (`SaveStorage`,
  `SharedVariables`, `Random`). M01: `listing.ts` (which of the 18 listings
  wins, the regenerated category/region/code/vendor per slot; `SaveStorage`
  is the truth and is written only from mod context, a `SharedVariables`
  mirror is what every context reads) and `progress.ts` (the LedgerVault seal
  mirror). Website renders run with no mod context, so they only read the
  mirrors and never roll or write anything (bugs #36). M05's `progress.ts` holds
  two booleans (archive open, lookup open), M06's one monotonic stage that is
  reset, not only raised, at mission start, and M07's the dashboard flag that the
  edge scan sets. A page's `metadata()` runs before the `Browser.Meta` event, so
  a mirror must be raised by an event that precedes the visit (bugs #55). Read by
  the controller, the websites and `applications/backtrace-facts.ts`; `content/`
  never imports it.
- **Shared modules** go in a `global/` subfolder of the layer when two or more
  missions use them (`content/global/`: `characters`, `blackledger`, `finance`,
  `case`; `websites/global/`: `page-guards`, `localize`, the two error
  templates; `i18n/global/`: `site-keys`, the union of every mission's website
  key list; `context/global/`: `site-strings`, the translated-string cache every
  mission's websites read through `siteT`: a `SharedVariables` record
  (`flatline.siteStrings`) that each mission's `OnObjectivesStart` refreshes
  from all keys, because a persistent domain such as LedgerVault outlives its
  mission and the cache is session-only; `site-access`, the mirror of which
  mission is running: one `SharedVariables` value (`flatline.activeMission`)
  that a controller sets in `OnObjectivesStart` and clears in `OnComplete` /
  `OnAbandon` only if it is still its own, so a late close never shuts the next
  mission's sites). A layer that is mission-blind by
  definition (`core`, `components`, `middleware`) has neither `mNN/` nor
  `global/` folders.

Dependency direction (no cycles): `main` -> `controller` -> `core` /
`components` / `middleware` / `content` / `i18n` / `context`; `core` ->
`components`; `context` -> `content`; `websites` -> `content` / `i18n` /
`context`; `content` imports only types from `core/types.ts`. `core`,
`components` and `middleware` never import `controller`, `content` or
`context`. Behavior
equivalence of the M01 migration was checked by running the HEAD version and
the new version against a mocked SDK and comparing every side-effecting call
over 17 scenarios, plus the HTML of all 18 listing pages (identical).

**Website access.** A mod `@RegisterWebsite` class is always in the engine's
website registry and Firebear finds it by host name alone, with no check of the
network's domain table, so `Network.removeDomain` and a destroyed network never
take a site offline (engine 1.3.13: `o7e()` / `_Qn(host)`). A mission's sites
are therefore gated in the page layer: `gateMissionPages(mission, pages)` in
`websites/global/page-guards.ts` wraps every page so it answers the 404 page
unless `areMissionSitesOpen(mission)`, which is true only between that mission's
`OnObjectivesStart` and its `OnComplete` / `OnAbandon`. Gated: every M1 site
except LedgerVault (Blackwire, Frostgate, Obsidian, ClearEscrow),
TR4C3404 (M2), Skynet Import-Export (M3), the eight PacificCare hospital hosts and the
portal (M5, since 2026-10-05; the M1 hospital site moved there), the Registry and
HostTrail (M6), HoneyCheck and the C2 dashboard (M7), and the Echoline captures
(each one by the mission it belongs to; the Echoline index lists only the
groups that are open). A closed page with `seo: true`
answers a Goagle search with `null` and a visit by address with the 404 page (`bugs.md` #63). Not gated,
on purpose: LeakIndex, Cipher Desk and Remote Desktop Connection (permanent `Popular` tool sites), LedgerVault (its domain is permanent and it has its own seal,
`isM01VaultSealed`) and BLACKLEDGER (a static story page with no network). The
mirror is session-only and only written by controllers, so a game that starts
with a finished mission has every gated site closed.

## Layering

```text
src/
  content/     — data per mission in `content/mNN/` (see the pipeline above;
                 M04 is still a flat `mNN.ts` with objective IDs, the
                 Objectives array, target IPs/hosts, nmap/lynx/dirhunter
                 fixture results, dialog trees, mail bodies, reward numbers,
                 delay constants). Shared modules sit in `content/global/`:
                 `characters.ts`, `blackledger.ts`, `case.ts` and
                 `finance.ts` — the ransom money model (three batches, one
                 60/25/5/10 waterfall, USD formatting), the single source
                 of every amount in M2, M3 and BACKTRACE; it imports only
                 `M01_CASE_ID` (from `case.ts`) — and `entities.ts`, the
                 canon names more than one mission or BACKTRACE needs (the
                 shell company M2 finds and M3 builds on, the parent entity
                 M3 names and M4 reuses).
  main/        — mNN.ts per mission. M01-M03: a thin class that delegates to
                 `controller/m01/`, `controller/m02/`, `controller/m03/` (M02
                 and M03 are not `Abandonable`, so they have no `OnAbandon`;
                 only M01 can be abandoned). M04 (older shape): the only file
                 that imports its matching content/mNN.ts, registers the
                 quest, wires SDK event listeners to objective completion
                 and owns small behavior-only helpers (fixture registration,
                 mail-send wrappers, event handlers).
  controller/ core/ components/ middleware/ i18n/ context/
               — the mission pipeline layers, described above.
  commands/    — custom @RegisterCommand terminal commands with no native
                 SDK equivalent (`attrcheck` for the M7 booby-trapped
                 file, `open`, `flatline` (was `repel`), `sysdiag`,
                 `sysrepair`).
  applications/ — custom desktop Apps: currently BACKTRACE, GHOSTWIRE's
                  case file (the @RegisterApp class, its HTML, and the
                  SaveStorage state + facts helpers the quests use). Flat,
                  no per-app subfolders — see "Applications: BACKTRACE"
                  below.
  websites/    — Website page registrations (@RegisterWebsite/Host/Pages)
                 + their HTML, one subfolder per site under the mission
                 (`m01/` marketplaces and LedgerVault, `m02/` TR4C3#404's
                 panel, `m03/` Skynet Import-Export's public site, ...).
                 `global/` holds the page guards (`requireHttps`,
                 `securePage`, `notFoundPage`), `localize.ts` and the two
                 shared error templates.
  guard/       — dev/prod gating helpers with no story content of their
                 own (`flags.ts` — isDev/isDebug/isTester, questGate/
                 isQuestDevFocus/applyDevGating, see
                 docs/rules.md §2a). Kept separate from
                 content/ since it's not mission data, and separate from
                 the quest files since every mission imports it.
  helpers/     — `logger.ts` (`trace`) and `network.ts` (mission network
                 reset/exist checks, used by `components/topology.ts` and
                 the not-yet-migrated missions).
  debug/       — live-test tooling (`msf-lab`, the `msflab` sandbox
                 command; the weblab of 2026-10-04: `portal-lab` with the
                 `portallab` command and the mock `dashboard-preview.html`,
                 `seo-lab` with `seolab`, `exports-lab` with `exportslab`);
                 every registration and trace is gated on
                 `isDebug` through `debug/debug-gate.ts`. The M4 lab
                 prototypes (rival-hacker lab, quiet-start) were removed on
                 2026-10-03 and live on in git history.
  archive/     — frozen pre-redesign reference copies, imported by nothing:
                 `archive/content/` and `archive/main/` hold the
                 `mNN.original.ts` pairs of M01-M04, `archive/applications/`
                 holds `backtrace.original.html` (the BACKTRACE UI from before
                 the v3 redesign). Each `.original.ts` quest file imports its
                 sibling `archive/content/mNN.original.js`, never the live
                 content file. `tsc` still typechecks them because
                 `tsconfig.json` includes `src`.
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

**Content and logic never mix, in either direction.** A mission's content is
a single, ungated value — never forked by a dev flag, never containing
`this` or quest behavior (it may hold pure builders that call
`Localization.t` or the SDK's data factories such as `Network.createUser`).
The controller (older shape: `main/mNN.ts`) imports the content and adds
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
`main/mNN.ts` should be sufficient. **Revisit this if that stops
being true** (e.g. if cross-mission state tracking — the recurring
dead-drop contact, the VPN-IP thread from M3→M4 — turns out to need more
than a couple of shared flags) rather than assuming the flat structure is
permanent no matter what. The first cross-mission state now exists —
BACKTRACE's `backtrace` key, below — and it is still one helper and one
key, so the flat structure holds.

## Applications: BACKTRACE

`src/applications/` holds the mod's one desktop App, BACKTRACE (GHOSTWIRE's
case file), as six flat files:

- `backtrace.ts` — the `@RegisterApp` class (`AppName = "backtrace"`,
  `Unlocked = true`, an AppStore `Store` listing, `Icon` from
  `public/assets/global/backtrace-icon.png`) that imports the HTML,
  injects the font CSS at its `<style data-slot="fonts">` slot and imports the two BACKTRACE i18n tables
  (`i18n/global/backtrace.ts`, `i18n/global/backtrace-letter.ts`) for their registration side effect.
- `backtrace.html` — the whole UI in one file (the v3 "forensic
  oscilloscope" look, redesigned 2026-10-03; the caseboard rebuilt
  2026-10-04; design FINAL LOCK 2026-10-04). It reads mission state through `HackhubSDK.SaveStorage`
  and the player's language through `HackhubSDK.Localization` ("Localization of the app", below), polls both
  every 2 s, and drives:
  - a header with a full-height heartbeat scope (one beat per completed
    mission, the mission in progress as a blinking amber beat, a flat line
    to the right edge once all seven are complete), the TRACED / EVIDENCE /
    ENTITIES counters (label and number centred on one axis in their cell)
    and the operator, whose photo has a 2 px ring (a 1 px ring broke into
    dashes on the owner's screen);
  - a sidebar spine drawn as a hop route (The story, M1-M7, Signing off and
    the Caseboard dock). Each mission is a diamond node (outline = locked,
    amber with a pulsing ring = in progress, red with a dark core =
    traced) and each link states its stage: dotted = not reached, dashed
    dim red = next hop, flowing amber dashes = trace running, solid red =
    traced. The finish node is a spinning target. The dash pattern is
    locked to the spine's own coordinates (period `HOP_DASH_PERIOD`, offset
    from each link's start), so a link that crosses two rows has no seam.
    A light packet with a short tail (`hopPacket`) runs down the red line
    from The story through every traced node, stops on the last traced
    node (or on the target once M7 is complete), rests and repeats on a
    4.8 s loop: `HOP_STEP_SECONDS` (0.4 s per row) times 12 steps, the same
    timing the `hsPass*` keyframes carry; under `prefers-reduced-motion`
    it is not shown. Its tail gradient `hpTail` lives in the sprite
    `<defs>` at the top of the body. The amber node starts at The story
    until the HackHub Post claim, then follows the mission in progress;
  - the report views of M1-M7. The head stays fixed, Key findings scroll in a
    hidden-scrollbar column with fades, and Evidence, Entities and the
    Personal log are compact cards that open a detail sheet. The "Completed"
    date is a fixed story day (`STORY_DATES`), not the in-game clock;
  - the CASEBOARD, an evidence board that fills in as keys are traced.
    Entities hang on it as portraits (people), folders (companies), screens
    (hosts), a boss card (the Architect) and an envelope (the ending);
    evidence documents sit between the objects they link or hang below one.
    Every object has a fixed spot and a small tilt in the `ENTITIES` and
    `DOCS` tables, and straight red threads run centre to centre beneath
    them. Hovering or selecting an object dims the rest and lights its
    threads; selecting opens the entity drawer or the evidence sheet. A
    document appears once its mission is complete and either the object it
    hangs from (`attach`) or at least two of the objects it links (`links`)
    are on the board. The view fits the visible objects (zoom 50-200%, drag
    to pan). Around the objects, the `FILL` layer (`aria-hidden`, no pointer
    events) adds an analyst note per mission, a Key card and props: an
    evidence bag, a torn clipping, a barcode label, a loose red string, an
    UNDER REVIEW stamp and two photographs, `backtrace-receipt.jpg` (M1) and
    `backtrace-corridor.jpg` (M5), 480 px copies of the earlier vault scans
    `q3-receipt.png` and `q3-corridor.png`. The vault now holds a new
    `public/assets/m01/q3-receipt.jpg` and `q3-corridor.png` (2026-10-06,
    README #67); the thumbnails were not regenerated because the app is
    under FINAL LOCK. A fill item
    appears once its mission is complete and the objects it `needs` are on
    the board; the M1 photograph is `outside` the frame, so it does not move
    the fit. A name inside a note is a `{key}` token resolved to the name on
    that entity's card, so the notes hardcode no story fact. While a
    mission is open its card shows only the "TRACED SO FAR // x OF N" panel:
    one row (title + value) per key, no descriptions;
  - a closing page, "Signing off", that appears in the sidebar only once M7
    is complete and carries the author's thank-you letter, a "SIGNED OFF"
    stamp and the font credit. The finish node of the spine sits on it.

  No story fact is hardcoded in it: everything is bound to a mission's
  `facts`. With no SDK (opened as a plain file) every mission reads as
  locked; there is no sample-data fallback.
- `backtrace-fonts.ts` — `BACKTRACE_FONT_CSS`, the Big Shoulders Display
  faces (Latin, 700, 800, 900) as base64 `@font-face` rules. Licence and
  source: `docs/font-licenses.md`.
- `backtrace-state.ts` — `setBacktraceMission(mission, status)`,
  `traceBacktraceFinding(mission, key, logs?, options?)` (typed: a key that is not in
  `BACKTRACE_KEYS[mission]` does not compile; with `logs` it writes the trace and its
  personal log in one call and raises one combined toast, and `options.moment` marks a
  story moment: no toast, flagged in the card) and its untyped sibling
  `traceBacktraceKeyById` (dev command only),
  `appendBacktraceLogs(mission, texts, options?)` for a log that belongs to no trace and
  `setBacktraceApplied(applied)`, the only writers of the state, plus its types.
  `setBacktraceMission(mission, "complete")` stores `skipped` before the snapshot replaces `facts`. All are fail-safe: an
  error is swallowed and never reaches the quest that called them. They carry
  no `trace()`: the BACKTRACE files were stripped of every one at the lock of
  2026-10-04.
- `backtrace-facts.ts` — `BACKTRACE_KEYS` (the ordered key list per mission),
  `BACKTRACE_OPTIONAL_KEYS`, `buildBacktraceSkipped` (its optional log texts come from `backtrace-logs.ts`), `isBacktraceKey` and `buildBacktraceFacts(mission)`, the only place
  BACKTRACE reads mission canon (`content/m01/`, `content/m02/`,
  `content/m03/`, `content/global/finance.ts` and the per-save winning M1 listing
  from `content/m01/listing-pool.ts`). This is the one deliberate
  `applications/` → `content/` import; nothing in `content/` imports back.
- `backtrace-logs.ts` — `MISSION_LOGS`, every personal log of each mission in play order, each group marked
  `optional` and/or `moment` (the same log functions the controllers call). It feeds the Skipped list
  (`optionalBacktraceLogs`) and the completion fill (`fillBacktraceLogs`): when `setBacktraceMission(mission,
  "complete")` runs, every required log the player never recorded is inserted at its play-order position (the
  recorded order is kept; optional logs stay Skipped) and every log of a `moment` group present in `logs` is
  added to `moments`, so a save written by an older build gets the missing lines and the Moment flag. Completing a
  mission that is already complete repairs it the same way and is idempotent. Each group also names its source
  (`key` = the trace it belongs to, `note` = a side note) and COMPLETE stores the text-to-source map in the mission's
  `sources`; the Personal Log sheet reads it to caption each run of lines with `TRACE n · <label>` or `NOTE`. A moment
  log with no trace of its own (M3 aftermath, the M7 ending) is captioned `MOMENT` and drops its inline flag; any other
  line that is not in the table (an older build's text) is captioned `OTHER`. A mission whose `sources` is empty (a save
  not completed again yet) shows no captions at all.
- `backtrace-command.ts` — the `backtrace` dev command, a temporary helper
  for the owner who deletes it after production (the file and its one import in
  `main/global.ts`). It started in `src/debug/scratch.ts`, moved here on
  2026-09-29 as `backtrace-debug.ts` (command `scratchbt`) and was renamed on
  2026-10-04: inspects/sets a mission's status and
  traces one key at a time against the same `backtrace-state.ts` writers a
  quest uses, so a save's BACKTRACE state can be driven by hand without
  replaying a mission. `backtrace applied [on|off]` sets the HackHub Post
  claim flag. It covers m1-m7 and registers only while `isDev`,
  through its own private `registerDevCommand`: `applications/` never imports
  from `debug/`.

State is one `SaveStorage` key, `backtrace`:

```text
{ m1..m7: { status: "locked" | "progress" | "complete", facts?: { <key>: <string> }, logs?: <string>[],
            moments?: <string>[], skipped?: { keys: <string>[], logs: <string>[] } },
  story?: { applied: boolean } }
```

Each mission's controller writes the status from `OnStart` (`progress`),
`OnComplete` (`complete`) and `OnAbandon` (`locked`). M1 is the exception at
the start: its `OnStart` is the HackHub Post claim, which is the start of the
story and not yet M1, so it writes `story.applied = true` through
`setBacktraceApplied(true)` and leaves M1 `locked`. M1 turns `progress` on
its first traced finding or log, and its `OnAbandon` clears the flag again.
The app treats the story as applied when `story.applied` is true or any
mission is not `locked`, so saves written before the flag existed still
read correctly. `facts` grow in two ways, and only one of them is per action. A
checkpoint inside a quest calls `traceBacktraceFinding(mission, key)` the
moment the player provably sees or uses the value (idempotent; a `locked`
mission becomes `progress`) — **one call per action, one key per call**.
`OnComplete` then replaces the partial set with the full snapshot (every key
plus every extra), taken before the quest's teardown wipes per-save data such
as the M1 listing resolution, so a finished report always has every value.
Every mission carries keys and a report card as of 2026-10-02; nothing shows
"REPORT PENDING" any more. An App iframe can read
`SaveStorage` — unlike a `Website`'s `metadata()` (`docs/bugs.md` #20) —
confirmed in-game with the `backtrace` dev command (`src/applications/backtrace-command.ts`):
`backtrace <mission> <status>` sets the state (facts included on `complete`)
and cascades the next mission like the real `AutoStart` chain, `backtrace
<mission> keys` lists the keys and `backtrace <mission> <key>` traces one.

### Keys, extras and Key Findings

The rule (2026-09-29, `docs/rules.md` §13): **one action
yields at most one key finding.** A *key* is one important finding and the
only thing counted and shown while a mission runs. An *extra* is a
supporting fact (a case ID carried over from M1, a settlement date, the
split of a payout) that lives in `buildBacktraceFacts` but is never a key,
is never traced on its own, and is never the name of another mission's key.
Extras reach the app only in the COMPLETE snapshot, where the report's
**Key Findings** compose keys and extras into the chain of events. The Key
Findings list is free-standing report copy in `backtrace.html` and may be
longer than the key list (M1 5 findings from 4 keys, M2 9 from 7, M3 8 from
6, M4 7 from 6, M5 8 from 6, M6 8 from 6, M7 8 from 6). In every mission a key
is traced from the `onAdvance` of its gate step, so only an in-order action
traces it.

### Tracing checkpoints

A key is traced only at an event that proves the player saw or used the
value. A key with no such event stays hidden until completion; it is never
guessed.

| Mission | Key | Checkpoint |
|---|---|---|
| M1 | `broker` | winning listing page opened (`Browser.Meta`, the `listingFound` flag) |
| M1 | `buyer` | `sales_ledger.log` on the backend read by `cat`, `open` or the Log Viewer once the backend is reached (`onFileRead`, name and extension match; the file is Log Viewer entries) |
| M1 | `vault` | LedgerVault domain visited (`Browser.Meta`, the `vaultVisited` flag) |
| M1 | `caseId` | Q3-2026-SEA folder opened inside LedgerVault: the page calls the exported `flatlineOpenProject(folder)`, which emits `flatline.m01.projectOpened` (`Website.Exports` + `Events.emit`, the `caseFileOpened` flag) |
| M2 | `developer` | `Sqlmap.DumpTable` of the `admins` table on the devbox IP |
| M2 | `ransom` | `Sqlmap.DumpTable` of the `affiliates` table on the devbox IP |
| M2 | `deployLog` | `deploy.log` on the devbox read by `cat`, `open` or the Log Viewer (`onFileRead`, name and extension match; the file is Log Viewer entries) |
| M2 | `homeLead` | `sync-home.txt` on the devbox read by `cat`, `open` or the Files app (`onFileRead`, name and extension match) |
| M2 | `firewall` | `PFSense.Login` on the home firewall |
| M2 | `workstation` | `RemoteConnection.Established` with `t === "METASPLOIT"` on the workstation (the plain `exploit` flow; `Metasploit.Meterpreter.Connected` is only raised by the reverse-TCP listener, `bugs.md` #29) |
| M2 | `shellCompany` | `open wire_authorization.pdf` at the `meterpreter >` prompt, or the Files app on a downloaded copy, once the firewall is breached (`onFileRead`) |
| M3 | `portal` | first Save in the remote gateway's Port Forwarding panel (`Network.PortChanges` on `77.83.142.6`, the `portalReached` flag) — the gateway is a `Router`, whose TP-Link panel raises no login event (`bugs.md` #31) |
| M3 | `pivot` | the first player-written forwarding rule that is active and whose banner answers (`Network.PortChanges`, `natPivotDone`); the value is the static "4 hosts behind the gateway" (`M03_INTERNAL_NETWORK_FACT`), added 2026-10-04 as the fifth required trace |
| M3 | `parentEntity` | `Sqlmap.DumpTable` of `wire_transfers` or `Database.Connected` on Coin-Drift (one key, either route) |
| M3 | `gateway` | `RemoteConnection.Established` with `t === "METASPLOIT"` on Vault-Line (`Metasploit.Meterpreter.Connected` is accepted too, for the reverse-TCP flow) |
| M3 | `vpnPeer` | `site_to_site_backup.txt` at the gateway session read by `cat` or `open` there, or in the Files app on a downloaded local copy (`onFileRead`). The Tunnel endpoint (`architectVpn`) stopped being a key on 2026-09-29: it is an extra in the COMPLETE snapshot, because the Wireshark capture that used to carry it was removed (`bugs.md` #34). |
| M3 | `accomplice` | `RemoteConnection.Established` with `t === "SSH"` to Faded-Ledger (optional bonus thread; `Terminal.Explorer` there also counts but only Meterpreter/`evil-rm` raise it, `bugs.md` #33) |

| M4 | `probe` | reading `~/logs/firewall.log` after the rebuild (a BACKTRACE key, not a gate; README #44, #45) |
| M4 | `breach` | the scripted second strike reaching the desktop (`breachBegan`, raised by the mission's own Scheduler job, not a player action); its log is a story moment: no toast, flagged "Moment" |
| M4 | `relay1` | `RemoteConnection.Established` with `t === "SSH"` on Static-Hop, after its router panel is cracked with `hydra` |
| M4 | `relay2` | `RemoteConnection.Established` with `t === "SSH"` on Quiet-Mirror — reachable only once `auth.log` on relay 1 is read |
| M4 | `control` | `cat watchdog.conf` on relay 2 (`Terminal.Cat`, the `controlFound` flag) |
| M4 | `origin` | `whois` or `geoip` on the control host's address (`Terminal.Whois` / `Terminal.Geoip`, the `originLinked` flag) |
| M5 | `dismissed` | both dated Echoline captures of the hospital IT page visited (`Browser.Meta` x2 joining at `staffArchiveCompared`) |
| M5 | `greta` | `lynx` on the administrator's handle (`Terminal.Lynx.Lookup` or `.Search`, the `gretaProfiled` flag) |
| M5 | `archive` | `RemoteConnection.Established` with `t === "SSH"` on Cold-Chart, the clinical archive |
| M5 | `statement` | `acknowledgement_rnatnaree.txt` read by `cat`, `open` or the Files app (`onFileRead`) |
| M5 | `decisionMemo` | `decision_memo.txt` read by `cat`, `open` or the Files app (`onFileRead`) |
| M5 | `usbTicket` | `usb_ticket_PC-IT-017.txt` read by `cat`, `open` or the Files app (`onFileRead`) |
| M6 | `nominees` | the nominee company's own register record opened (`Browser.Meta` on `/entity/r7k4/`) |
| M6 | `registeredAgent` | `whois` on the registered agent's domain (`Terminal.Whois`, the `agentIdentified` flag) |
| M6 | `ownershipChange` | both superseded ownership filings read (`Browser.Meta` x2 joining at `snapshotsCompared`) |
| M6 | `insurer` | the insurer's register record opened, which is where the officer's position is published |
| M6 | `infra` | `whois` on the insurer's domain, which answers with M3's own registrant (`Terminal.Whois`) |
| M6 | `architect` | the officer record, reachable only once the insurer page **and** the insurer `whois` are both done |
| M7 | `nodes` | the hidden dashboard on the index host visited over https (`Browser.Meta`, the `dashboardFound` flag) |
| M7 | `credential` | `ash-gate_backup.txt` on the forgotten relay read by `cat`, `open` or the Files app (`onFileRead`, the `credentialRead` flag) |
| M7 | `firewall` | first Save in the edge filter's pfSense panel (`PFSense.Changes`, the `firewallBreached` flag) |
| M7 | `c2` | `RemoteConnection.Established` with `t === "METASPLOIT"` on the index host (`shellObtained`) |
| M7 | `manifest` | `manifest.txt` at that session read by `cat`, `open` or the Files app (`onFileRead`) |
| M7 | `ledger` | `Files.Transfer` `DOWNLOAD` of the ledger backup, refused while the payload is wiped (`fileExtracted`) |

`open` is the project's own terminal command (`src/commands/open.ts`): it
prints a file of any extension and emits `flatline.open.fileRead`, which is
how a file becomes a checkpoint (`cat` only reads `.txt`/`.log`). Every file checkpoint listens through
`onFileRead` (`components/file-reads.ts`: `Terminal.Cat`, that event and `Files.Open`), so `cat`, `open` and a
double-click in the Files app all count; only the M7 ledger trap still listens to `open` alone. At a
`meterpreter >` prompt it reads the target's file (`src/commands/meterpreter-files.ts`:
the session target is tracked from `RemoteConnection.Established` /
`.Disconnected` and the path is walked with the ID-based `Files` calls,
`bugs.md` #30; not yet live-tested), so no mission needs `download`. The M1 key
whose trigger is a flag (`broker`, `vault`, `caseId`) is re-traced from the
persisted flag every time `OnObjectivesStart` runs, so saves that passed a
checkpoint before tracing existed catch up.

`logs` is a separate, append-only list of plain narrative lines (GHOSTWIRE's
own reflections), written together with a trace by `traceBacktraceFinding(mission, key, logs)`
or, when no trace owns the line, by `appendBacktraceLogs(mission, texts)`; the group
counts below predate the rule of 2026-10-04 that gives every trace its own log —
there is no canon builder to rebuild them from, so
`OnComplete`'s full snapshot carries the accumulated array forward rather
than regenerating it. Duplicate text for the same mission is a no-op. M2 logs
two groups this way: `deployLogFound` (the deploy log's `cat`) and
`aftermathShown` (the first `open` of a workstation file) — the same
triggers that previously called `this.createDialog()`, before that mechanic
was dropped for M2 (see `docs/changelog.md` 2026-09-27: it always presents as
an incoming phone call, but every line was `speaker: "GHOSTWIRE"`). M3 logs
four groups (`ledger`, `tunnel`, `reyes`, `aftermath`; the `root` group went with
`rootgrab` on 2026-10-01 and the `tunnel` group has three lines). BACKTRACE
renders `logs` two ways: a live preview on the still-open mission's card
(`stateCardMarkup`, "PERSONAL LOG") and the "Personal Log" section of every
finished report that has one (`[data-personal-log="m2"]` through `"m7"`). M4
logs three groups (`probe`, `breach`, `origin`), M5 five (`dismissed`,
`archive`, `statement` and, outside the chain, the administrator's own notes and
the Bedside-17 note: seven lines in all), M6 six (the nominee record, the
ownership change, the insurer, the certificate, the officer record and the
archived capture: eight lines) and M7 three (the node table, the manifest and
the chosen ending, which is written when the report is accepted, before the
mission completes).

To add a key: add it to `BACKTRACE_KEYS` and to the mission's builder in
`backtrace-facts.ts`, give it a title in the script's `KEY_LABELS`, and call
`traceBacktraceFinding(mission, key)` from **one** event handler that proves
it — never from a handler that already traces another key. To add an extra:
only add it to the builder and bind it in the report copy with
`data-fact="mN.key"` (comma-separated fallbacks are allowed, e.g.
`m2.buyer,m1.buyer`). Values are inserted as text or escaped, and a missing
fact renders as "—".

### Required traces, personal logs and the report

Rule of 2026-10-04 (`docs/world-building/README.md` #52 and #53, `docs/rules.md` §13):

- A mission has at least 5 **required** traces (M1 stays at 4, owner-approved). A trace is required when its
  value is a field of the mission's report, optional otherwise (`BACKTRACE_OPTIONAL_KEYS`: M3 `accomplice`,
  M4 `probe`). The app counts every traced key over the required count, so it can read "7 OF 5"; the
  player is not told which traces are optional (hatched slots fill up to the required count, and nothing is
  tagged while the mission runs).
- Every trace has a personal log, written in the same call (`traceBacktraceFinding(mission, key, logs)`),
  with one combined toast, "BACKTRACE: new trace and log recorded.". A log with no trace (M2 aftermath, M3
  Reyes, M5 notes and Bedside-17, M6 archived capture) uses `appendBacktraceLogs` and toasts "new personal
  log entry". A log written as a story moment (`{ moment: true }`: M3 aftermath, M4 breach, M7 ending)
  raises no toast and is stored in `moments`; the finished card flags it "Moment".
- At COMPLETE the state keeps `skipped`: the optional keys never traced and the optional logs never written
  (M3 `accomplice` and the Reyes note, M4 `probe`, M5 notes and Bedside-17, M6 capture). The finished card
  lists them in a Skipped block and, for logs, in the personal-log sheet under a divider, flagged "Skipped".
- The report asks for the value of every required trace, so a report cannot be filed without it. Chained
  traces may share one field (M2 `homePath`, M3 `entry`, M7 `path`), the way M4's `relays` already holds two.

| Mission | Report fields (new since 2026-10-04 in bold) |
|---|---|
| M1 | `listingCode`, `broker`, `buyer`, `caseId`, `project`, `vaultUrl` |
| M2 | `developer_url`, `shellCompany`, **`ransom`**, **`payload`**, **`homePath`** (router, firewall and workstation addresses) |
| M3 | `shellCompany`, `parentEntity`, `vpnLead`, **`entry`** (remote portal, Vault-Line, 4 hosts) |
| M4 | `hunter`, `relays`, `control`, `origin`, `contained` |
| M5 | `door`, `cause`, `decider`, `gap`, `motive`, **`archive`** |
| M6 | `architect`, `role`, **`agent`**, `chain`, `proof`, `front` |
| M7 | `architect`, **`path`**, `evidence`, `choice` |

A template field stays an unreplaced `{{field}}` token (`docs/rules.md` §3), so facts that used to be
pre-filled (M2's ransom amount, M3's gateway name) are no longer interpolated into the template; they
appear only in the freehand body.

### Localization of the app

Decision of 2026-10-04 (`docs/world-building/README.md` #54, `docs/rules.md` §13). The BACKTRACE interface
(titles, labels, buttons, toasts, trace values) is English only. Only prose that is read is localized:
the personal logs (written by the controllers through `Localization.t`, so each one keeps the language that
was active when it was written) and, inside `backtrace.html`, the 7 mission summaries, the 53 Key findings,
The story, and the closing letter (four paragraphs, the thanks line and the "Warm regards" greeting only;
"— the author" stays English).

- English stays inline in the HTML and is the default. Each localized element carries a `data-i18n` key:
  `BACKTRACE.Mn.SUMMARY`, `BACKTRACE.Mn.FINDING.k`, `BACKTRACE.STORY`, and the six letter keys
  `BACKTRACE.LETTER.OPENING`, `TRAIL`, `SIGNING_OFF`, `WORKSHOP`, `THANKS` and `SIGNATURE` (the greeting
  alone: `<span data-i18n="BACKTRACE.LETTER.SIGNATURE">Warm regards</span>` inside `.letter-sign`).
- The Mandarin lives in `src/i18n/global/backtrace.ts` (61 texts, zh only, never a copy of the English)
  and the letter in `src/i18n/global/backtrace-letter.ts` (6 slots, written by the owner; an empty slot
  keeps that part English). `applications/backtrace.ts` imports both so they are registered before the app
  can open.
- The HTML reads `HackhubSDK.Localization`, the same bridge object as `SaveStorage`. `syncLanguage()` runs
  at the start of every `refresh()` and from `onLanguageChange`; for a non-English language it replaces each
  element's innerHTML with `t(key)` only when the result is a non-empty string different from the key, and
  sets `lang` on the element for the right CJK glyphs. Anything else, and every return to English,
  restores the stashed English. The bridge missing, throwing or returning the key leaves the English
  untouched. `renderFacts()` runs right after, because a translated Key finding carries the same
  `<span data-fact>` markup as its English source (checked: same fact keys and tags, key by key).
- To add a prose element: write the English inline, add `data-i18n`, add the key and its zh to
  `backtrace.ts`. Not verified in game: that `HackhubSDK.Localization` resolves the mod's keys inside the
  app, and the CJK font fallback in the game's Chromium.

## Naming convention

Missions are `m01`-`m04` (not `q01`-`q16` — this project has no "quest"
numbering precedent of its own, and "mission" matches the story's own
framing): `content/m01/`, `main/m01.ts`. Mission titles for
reference: m01 "Jejak Pertama", m02 "Sang Pembuat", m03 "Jalur Uang", m04
"Sang Dalang".

Inside a per-mission subfolder (`<layer>/m01/`) a file name does not repeat
the mission prefix, because the folder already names the mission:
`content/m01/listing-pool.ts`, not `content/m01/m01-listing-pool.ts`. A
module used by two or more missions goes in a `global/` subfolder of the same
layer (`content/global/finance.ts`, `websites/global/page-guards.ts`). A layer
that only holds mission-independent code (`core/`, `components/`,
`middleware/`) has neither `mNN/` nor `global/` folders. This applies as files
move into per-mission subfolders; the `src/` restructure is in progress
(`docs/changelog.md`, 2026-10-01).

## Bootstrap flow

```text
src/index.ts
  imports (side-effect registration, decorator-driven):
    main/index.js     (-> global.js, m01.js .. m04.js)
    debug/index.js    (-> msf-lab, portal-lab, seo-lab, exports-lab)
  ↓
  @RegisterModPackage class extends Bootstrap
    OnModPackageLoaded()   -> logs that the package loaded
```

`index.ts` imports only `main/` and `debug/` (plus the SDK and the `trace`
helper for its load log). `main/global.ts` pulls in the shared features
(BACKTRACE, `attrcheck`, `open`), and each `main/mNN.ts` imports its own
mission's websites before the quest class, so a mission's registrations travel
with it. `debug/index.ts` is inert unless `isDebug`. A static check confirmed
that the 22 files that register something are all still reachable from
`index.ts` (91 reachable files before, the same 91 plus the three new barrels
after).

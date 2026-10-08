# FLATLINE PROTOCOL — `src/` Architecture

**Status: LOCKED** (2026-09-18, revised 2026-10-08) — the mandatory structure for all seven missions (`m01` to `m07`: First Trace,
The Maker, Money Trail, Burn Notice, The Door, Open Register, The Architect): a thin quest class per mission, a controller that
assembles it, mission-blind generic layers, and the mission's data in its own folders. Content and logic never mix (see "Content and
logic never mix" below).

## Restructure history

All seven missions follow the pipeline below. M01 landed on it on 2026-09-20, M02 and M03 on 2026-10-01, and M04 to M07 on 2026-10-02
(the old M4 became `m07` and was rewritten as "The Architect", `m04` was rebuilt as "Burn Notice", `m05` and `m06` were written new).
The older shape (one `main/mNN.ts` holding the quest class and all its helpers, fed by a flat `content/mNN.ts`) survives only in the
frozen reference copies under `src/archive/`, which nothing imports. The generic parts the later missions needed live in
`components/`: splitter and printer nodes, databases, restore data, boolean-only gates and the global site-string cache, then the
incident banner, desktop breach and recovery console kit used by M4 and M7, `commands/flatline.ts` (named `repel.ts` until
2026-10-03), `sysdiag` and `sysrepair`.

## Mission pipeline (all seven missions)

```text
main/mNN.ts  ->  controller/mNN/  ->  core/ . components/ . middleware/   (generic, mission-blind)
 (thin class)    (assembles)       +  content/mNN/ . i18n/mNN/              (the mission's data)
```

- **`main/mNN.ts`** — one thin `@RegisterQuest` class: class fields come from
  the controller's spec and each hook (`OnStart`, `OnObjectivesStart`,
  `OnComplete`, `CreateData`) is one line that calls the
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
- **`components/`** — flat building blocks used by two or more missions:
  `topology` (networks of router, splitter, firewall, printer and device
  nodes, port/firewall changes, per-device vulnerabilities set after the
  build), `domains` (with optional vulnerabilities), `fixtures` (Shell command
  data), `database`, `persona` (Twotter), `report` (GoMail template and
  dual-path validation). The M4/M7 kit lives here too (all mission-blind, state
  under a `SaveStorage` prefix the mission passes in): `intrusion` (strike
  state, deadline job, flatline targets), `incident-banner` (+ `.html` widget, a
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
  two booleans (archive open, lookup open), M06's one monotonic stage (closed 0 to identity 6) that is
  reset, not only raised, at mission start, plus the door mirrors (door open, failure count, lock-until
  time) that the door's `Exports` write directly, and M07's the dashboard flag that the
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
  that a controller sets in `OnObjectivesStart` and clears in `OnComplete`
  only if it is still its own, so a late close never shuts the next
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
`OnObjectivesStart` and its `OnComplete`. Gated: every M1 site
except LedgerVault (Blackwire, Frostgate, Obsidian, ClearEscrow),
TR4C3404 (M2), Skynet Import-Export (M3), the eight PacificCare hospital hosts and the
portal (M5, since 2026-10-05; the M1 hospital site moved there), the Registry and
HostTrail (M6), the claims portal, the legacy CMS and the ledger room (M7), and the Echoline captures
(each one by the mission it belongs to; the Echoline index lists only the
groups that are open). A closed page with `seo: true`
answers a Goagle search with `null` and a visit by address with the 404 page (`bugs.md` #63). Not gated,
on purpose: Cipher Desk and Remote Desktop Connection (permanent `Popular` tool sites), LedgerVault (its domain is permanent and it has its own seal,
`isM01VaultSealed`) (BLACKLEDGER used to be a second exception; since 2026-10-07 its site is an M7 mission site gated by `gateMissionPages("m07")` plus the `ledgerRoomOpen` mirror). The
mirror is session-only and only written by controllers, so a game that starts
with a finished mission has every gated site closed.

## Layering

```text
src/
  content/     — data per mission in `content/mNN/` (see the pipeline above):
                 objective IDs, the Objectives array, target IPs and hosts,
                 nmap/lynx/dirhunter fixture results, mail bodies, reward
                 numbers, delay constants. Shared modules sit in
                 `content/global/`: `characters.ts`, `blackledger.ts`,
                 `case.ts`, `handbook.ts` (the Handbook binding), `finance.ts`
                 (the ransom money model: three batches, one 60/25/5/10
                 waterfall, USD formatting; the single source of every amount
                 in M2, M3, M7 and BACKTRACE) and `entities.ts` (canon names
                 more than one mission or BACKTRACE needs).
  main/        — mNN.ts per mission: a thin class that delegates to
                 `controller/mNN/`. No mission is `Abandonable`, so none has
                 an `OnAbandon`: an abandoned quest counts as completed and
                 starts the next one (bugs #73). `global.ts` registers the
                 shared features (Cipher Desk, Remote Desktop Connection,
                 BACKTRACE, `open`, `flatline`, `sysdiag`, `sysrepair`).
  controller/ core/ components/ middleware/ i18n/ context/
               — the mission pipeline layers, described above.
  commands/    — custom @RegisterCommand terminal commands with no native
                 SDK equivalent: `open` (with `meterpreter-files.ts` for
                 Meterpreter targets), `flatline`, `sysdiag`, `sysrepair`.
  applications/ — the custom desktop App BACKTRACE, GHOSTWIRE's case file
                  (the @RegisterApp class, its HTML, and the SaveStorage
                  state, facts and log helpers the quests use). Flat, no
                  per-app subfolders; see "Applications: BACKTRACE" below.
  websites/    — Website page registrations (@RegisterWebsite/Host/Pages)
                 and their HTML, one subfolder per site under the mission
                 (`m01/` marketplaces and LedgerVault, `m02/` TR4C3404,
                 `m03/` Skynet Import-Export, `m05/` the hospital and portal,
                 `m06/` the Registry, HostTrail and the door, `m07/` the
                 claims portal, the legacy CMS and the ledger room). `global/`
                 holds the page guards (`requireHttps`, `securePage`,
                 `notFoundPage`), `localize.ts`, the two shared error
                 templates, and the tool sites `cipherdesk/`, `rdcdesk/` and
                 `echoline/`.
  guard/       — dev/prod gating helpers with no story content of their own
                 (`flags.ts`: isDev, isDebug, isTester, questGate,
                 isQuestDevFocus, applyDevGating, see docs/rules.md §2a).
                 Kept apart from content/ because it is not mission data and
                 from the quest files because every mission imports it.
  helpers/     — `logger.ts` (`trace`, the only place that prints).
  debug/       — `index.ts` and `debug-gate.ts` only: the `isDebug` gate a
                 future lab would use. The 2026-10 labs (`msf-lab`,
                 `portal-lab`, `seo-lab`, `exports-lab`, the rival-hacker lab)
                 were deleted on 2026-10-07 and live in git history.
  archive/     — frozen pre-redesign reference copies, imported by nothing:
                 `archive/content/` and `archive/main/` hold the
                 `mNN.original.ts` pairs of M01-M04, `archive/applications/`
                 holds `backtrace.original.html` (the BACKTRACE UI from before
                 the v3 redesign). `tsc` still typechecks them because
                 `tsconfig.json` includes `src`; the build does not ship them.
  index.ts     — production bootstrap: which missions are active (the import
                 list is the single source of truth) and the Handbook binding.
  types.d.ts   — ambient module declarations (currently *.html strings).
```

No `themes/` folder yet — nothing in the mission design needs a UI theme;
add one only if a specific objective actually requires it, and don't
scaffold ahead of need. `applications/` exists because BACKTRACE is a
cross-mission feature that belongs to no single mission's `content/` or
`main/` file.

## The Handbook

`content/global/handbook.ts` registers one category, "Flatline Protocol", with seven pages (Briefing, Cases, Terminal, Metasploit,
Commands, BACKTRACE, Comfort) through `Handbook.registerEntry`. Titles and bodies are read with `Localization.t` from
`i18n/global/handbook.ts` (en and zh). `src/index.ts` calls `bindHandbook()` in `OnModPackageLoaded`, and the pages are registered
again when the language changes.

## Content and logic never mix

A mission's content is a single, ungated value, never forked by a dev flag and never containing `this` or quest behavior (it may hold
pure builders that call `Localization.t` or the SDK's data factories such as `Network.createUser`). The controller imports the content
and adds behavior only. A feed post (`HackhubPost`) or a dialog tree left inline in a quest file is the usual slip.

There are no separate domain, state or application layers: the SaveStorage and state needs are small enough that `Shell`, `Files` and
`SaveStorage` calls live in the controllers and components. The first cross-mission state, BACKTRACE's `backtrace` key (below), is one
helper and one key, so the flat structure holds. Revisit it if cross-mission state grows beyond a few shared flags.

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
    `DOCS` tables, and red threads run centre to centre beneath them. Most
    are straight; six links that have no clear straight path use elbow
    routes from the `ROUTES` table, keyed `a|b` (an entity key or
    `ev:<doc id>`, either order), which `threadPath` draws as orthogonal
    polylines and adds to the board bounds. Hovering or selecting an object dims the rest and lights its
    threads; selecting opens the entity drawer or the evidence sheet. A
    document appears once its mission is complete and either the object it
    hangs from (`attach`) or at least two of the objects it links (`links`)
    are on the board. The view opens at 60% (`OPEN_ZOOM`, zoom 30-200%,
    drag to pan) and the reset button returns to it. Around the objects,
    the `FILL` layer (`aria-hidden`, no pointer events) adds analyst notes
    next to the cases they belong to, a Key card and props: an evidence bag,
    two torn clippings, a barcode label, a loose red string, stamps
    (UNDER REVIEW, PAID, CLOSED) and a masking-tape date label per mission
    (`tape`, the date comes from `STORY_DATES`). The two photographs that
    used to hang there, `backtrace-receipt.jpg` and `backtrace-corridor.jpg`,
    were removed from the board on 2026-10-07; the files stay
    in `public/assets/global/` unused. A fill item
    appears once its mission is complete and the objects it `needs` are on
    the board. A name inside a note is a `{key}` token resolved to the name on
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
  `traceBacktraceKeyById` (called by `traceBacktraceFinding`),
  `appendBacktraceLogs(mission, texts, options?)` for a log that belongs to no trace and
  `beginBacktraceStory()` (M1's start: rewrites the whole key), the only writers of the state, plus its types.
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

State is one `SaveStorage` key, `backtrace`:

```text
{ m1..m7: { status: "locked" | "progress" | "complete", facts?: { <key>: <string> }, logs?: <string>[],
            moments?: <string>[], skipped?: { keys: <string>[], logs: <string>[] } },
  story?: { applied: boolean } }
```

Each mission's controller writes the status from `OnStart` (`progress`) and
`OnComplete` (`complete`); no mission has an `OnAbandon`. M1's `OnStart` is the
HackHub Post claim, the start of the whole story, so it calls
`beginBacktraceStory()` instead: that rewrites the whole key (M1 to M7 clean,
M1 `progress`, `story.applied = true`), because `mods.reset` never clears
`SaveStorage` and a leftover M2 `progress` would otherwise show after a reset
(`docs/bugs.md` #73).
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
`SaveStorage` — unlike a `Website`'s `metadata()` (`docs/bugs.md` #20) — which is how the app reads the mission state.

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

| M4 | `probe` | reading `~/logs/firewall.log` after the rebuild (a BACKTRACE key, not a gate) |
| M4 | `breach` | the scripted second strike reaching the desktop (`breachBegan`, raised by the mission's own Scheduler job, not a player action); its log is a story moment: no toast, flagged "Moment" |
| M4 | `relay1` | `RemoteConnection.Established` with `t === "SSH"` on Static-Hop, after its router panel is cracked with `hydra` |
| M4 | `relay2` | `RemoteConnection.Established` with `t === "SSH"` on Quiet-Mirror — reachable only once `auth.log` on relay 1 is read |
| M4 | `control` | `cat watchdog.conf` on relay 2 (`Terminal.Cat`, the `controlFound` flag) |
| M4 | `origin` | `whois` or `geoip` on the control host's address (`Terminal.Whois` / `Terminal.Geoip`, the `originLinked` flag) |
| M5 | `dismissed` | both dated Echoline captures of the hospital IT page visited (`Browser.Meta` x2 joining at `staffArchiveCompared`) |
| M5 | `roxanne` | `lynx` on the administrator's handle (`Terminal.Lynx.Lookup` or `.Search`, the `roxanneProfiled` flag) |
| M5 | `archive` | `RemoteConnection.Established` with `t === "SSH"` on Cold-Chart, the clinical archive |
| M5 | `statement` | `acknowledgement_rnatnaree.txt` read by `cat`, `open` or the Files app (`onFileRead`) |
| M5 | `decisionMemo` | `decision_memo.txt` read by `cat`, `open` or the Files app (`onFileRead`) |
| M5 | `usbTicket` | `usb_ticket_PC-IT-017.txt` read by `cat`, `open` or the Files app (`onFileRead`) |
| M6 | `nominees` | the nominee company's own register record opened (`Browser.Meta` on `/entity/r7k4/`) |
| M6 | `registeredAgent` | `whois` on the registered agent's domain (`Terminal.Whois`, the `agentIdentified` flag) |
| M6 | `ownershipChange` | the sealed 2024 filing opened in Cipher Desk (`flatline.cipher.opened`, mission `m06`, after the 2019 one) |
| M6 | `insurer` | the insurer's register record opened (after the Holdings record), which is where the officer's position is published |
| M6 | `infra` | `whois` on the insurer's domain, which answers with M3's own registrant (`Terminal.Whois`, after `insurerLinked`) |
| M6 | `architect` | the Risk Committee minutes behind the Playfair door (`Browser.Meta` on `/minutes/` of the door host `x5nq3dvw7kzc2ybmr6ptua4hs2fj7ekg.onion`, after `doorOpened`) |
| M7 | `claims` | the three paid claims found on the insurer's portal (`paidClaimsMatched`) |
| M7 | `nodes` | the hidden dashboard on the index host visited over https (`Browser.Meta`, the `dashboardFound` flag) |
| M7 | `decoy` | optional: the decommissioned host probed; a honeypot alert and a loss follow |
| M7 | `credential` | `ash-gate_backup.txt` on the forgotten relay read by `cat`, `open` or the Files app (`onFileRead`, the `credentialRead` flag) |
| M7 | `firewall` | first Save in the edge filter's pfSense panel (`PFSense.Changes`, the `firewallBreached` flag) |
| M7 | `c2` | `RemoteConnection.Established` with `t === "METASPLOIT"` on the index host (`shellObtained`); it starts Duel 1 |
| M7 | `manifest` | `manifest.txt` at that session read by `cat`, `open` or the Files app (`onFileRead`) |
| M7 | `orders` | `release_orders.log` read (`ordersRead`, after the manifest) |
| M7 | `survey` | `survey_visits.txt` read (`surveyRead`, after the orders) |
| M7 | `ledger` | `Files.Transfer` `DOWNLOAD` of the ledger backup, refused while the payload is wiped (`ledgerTaken`) |
| M7 | `seal` | the sealed ledger file opened in Cipher Desk (`sealOpened`) |
| M7 | `instruction` | the instruction document on the architect's workstation read in the RDC archive window (`instructionRead`, after `displayAttached`) |
| M7 | `model` | optional: the model note on the workstation (`modelRead`) |
| M7 | `dossier` | optional: the file about the player on the workstation (`dossierRead`) |
| M7 | `ledgerRoom` | the BLACKLEDGER ledger room visited while it is open (`Browser.Meta`, `blackledgerSeen`) |

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
was dropped for M2 (2026-09-27: it always presents as
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

Rule of 2026-10-04 (`docs/rules.md` §13):

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
| M7 | `architect`, `path`, `claims`, `reserves`, `orders`, `survey`, `account`, `instruction`, `choice` |

A template field stays an unreplaced `{{field}}` token (`docs/rules.md` §3), so facts that used to be
pre-filled (M2's ransom amount, M3's gateway name) are no longer interpolated into the template; they
appear only in the freehand body.

### Localization of the app

Decision of 2026-10-04 (`docs/rules.md` §13). The BACKTRACE interface
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

Missions are `m01` to `m07` (not `q01`-`q16`: the project has no quest numbering of its own, and "mission" matches the story's
framing): `content/m01/`, `main/m01.ts`. Titles: m01 "First Trace", m02 "The Maker", m03 "Money Trail", m04 "Burn Notice", m05 "The
Door", m06 "Open Register", m07 "The Architect".

Inside a per-mission subfolder (`<layer>/m01/`) a file name does not repeat the mission prefix, because the folder already names the
mission: `content/m01/listing-pool.ts`, not `content/m01/m01-listing-pool.ts`. A module used by two or more missions goes in a
`global/` subfolder of the same layer (`content/global/finance.ts`, `websites/global/page-guards.ts`). A layer that only holds
mission-independent code (`core/`, `components/`, `middleware/`) has neither `mNN/` nor `global/` folders.

## Bootstrap flow

```text
src/index.ts
  imports (side-effect registration, decorator-driven):
    main/index.js     (-> global.js, m01.js .. m07.js)
    debug/index.js    (-> debug-gate only)
  ↓
  @RegisterModPackage class extends Bootstrap
    Settings               -> the "Reduce motion and flashing" toggle
    OnModPackageLoaded()   -> binds the Handbook entries
```

`index.ts` imports only `main/` and `debug/` (plus the SDK, the setting and the Handbook binding). `main/global.ts` pulls in the shared
features (Cipher Desk, Remote Desktop Connection, BACKTRACE, `open`, `flatline`, `sysdiag`, `sysrepair`), and each `main/mNN.ts`
imports its own mission's websites before the quest class, so a mission's registrations travel with it. `debug/` keeps only
`index.ts` and `debug-gate.ts` (the `isDebug` gate for a future lab).

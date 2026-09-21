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
  websites/    — Website page registrations (@RegisterWebsite/Host/Pages)
                 + their HTML, one subfolder per site (A7xDEFACE9's
                 storefront, TR4C3#404's panel, Skynet Import-Export's
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

No `apps/` or `themes/` folders yet — nothing in the locked mission design
needs a custom installed app or a UI theme. Add either only if a specific
mission objective actually requires one; don't scaffold ahead of need.

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
permanent no matter what.

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

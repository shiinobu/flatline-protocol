# FLATLINE PROTOCOL — Project Changelog

Chronological record of everything that happens in this project — the
mandatory timeline. **Every real change** (a bug found/fixed, a mechanic
changed, a doc reorganized, a mission passing validation, etc.) gets a
dated one-line entry here, no matter how small, under that day's heading
(add one if it doesn't exist yet).

Full detail lives in the specialized file for that kind of change, never
duplicated here — this file is an index, not the source of truth:

```text
- [category] short description — see file.md (detail pointer)
```

Categories: `bug`, `mechanic`, `docs`, `milestone`, or a new one if none
fit. Full detail: `docs/architecture.md` (src/ structure), `docs/bugs.md`
(bugs — inherited SDK facts plus this project's own findings),
`docs/mechanics-reference.md` (tools/commands), `docs/implementation-rules.md`
(process/structure standards).

---

## 2026-09-18

- **[milestone] Project scaffolded.** `flatline-protocol-mods` created as a
  standalone HackHub story mod, fully separate from entity-resolution-mods.
  `npm install`, `tsc --noEmit`, and `esbuild` build all confirmed clean.
  SDK resolves to `0.24.0` via `"latest"`. Git repo initialized on `main`,
  no commits yet.
- **[docs] Inherited entity-resolution-mods' `bugs.md`, `mechanics-reference.md`,
  `implementation-rules.md`, `architecture.md`, `changelog.md`, and
  `temp-notes.md` as a starting reference.** `bugs.md`/`mechanics-reference.md`
  headers annotated as inherited SDK-level reference (generic facts, not
  this project's content). `architecture.md` and `implementation-rules.md`
  rewritten from scratch for this project's own locked structure (see next
  entry). This file and `temp-notes.md` reset to empty/fresh for this
  project — their prior content was entity-resolution-mods' own history,
  not this project's.
- **[mechanic] `src/` structure locked: Hybrid pattern.** Flat top-level
  folders (`content/`, `main/`, `commands/`, `websites/`) from the
  official `create-hackhub-mod` scaffold, plus entity-resolution-mods'
  content/logic split rule applied inside `main/`. Chosen over
  entity-resolution-mods' full layered `core/domain/state/application`
  pattern, which exists there to support a 16-quest campaign this
  project's 4-mission scope doesn't need. Full detail:
  `docs/architecture.md`.
- **[docs] Inherited entity-resolution-mods content fully removed.**
  `docs/bugs.md` reset to an empty log (was 34 entries of that other
  project's history); `docs/mechanics-reference.md` trimmed to just the
  Master Tool Registry + an empty Custom Commands Registry (was also
  carrying that project's Per-Quest Usage Map and Metasploit comparison).
  `docs/implementation-rules.md`'s citations to that project's `bugs.md`
  entry numbers replaced with direct statements of the underlying SDK
  facts. This project and entity-resolution-mods are now fully
  independent in their docs, not just in code.
- **[docs] `docs/story.md` created.** Full story/mission design captured:
  premise, GHOSTWIRE/BLACKLEDGER, character/codename table, Mission 1-4
  objective chains ("Jejak Pertama", "Sang Pembuat", "Jalur Uang", "Sang
  Dalang"), locked design constraints, and an implementation-status
  checklist. This project's story is original (not adapted from an
  external source), so there is no separate "recovered original vs
  current" doc pair the way entity-resolution-mods has.
- **[mechanic] `src/quests/` renamed to `src/main/`.** Same role (the only
  file per mission that imports its `content/mNN.ts` and wires SDK event
  listeners) — folder name changed, nothing structural. `docs/architecture.md`
  and `docs/implementation-rules.md` updated to match.
- **[docs] `docs/temp-notes.md` renamed to `docs/scratch.md`.** Same role
  (disposable per-mission dev notes, see `docs/implementation-rules.md`
  §9) — content unchanged, just the filename. References in
  `docs/implementation-rules.md` updated to match.
- **[milestone] Mission 1 ("Jejak Pertama") implemented, not yet
  live-tested.** `src/content/characters.ts` (dead-drop contact +
  anonymous tipster), `src/content/m01.ts` (all 13 objectives, network/
  mail/IRC fixtures), `src/main/m01-quest.ts` (quest logic against the
  real `@hotbunny/hackhub-content-sdk` types — confirmed against
  `node_modules/@hotbunny/hackhub-content-sdk/index.d.ts` directly, not
  carried over from entity-resolution-mods' own runtime layer, since this
  SDK version already pays `Rewards` automatically via `AutoComplete`),
  and `src/websites/a7xdeface9/` (storefront + hidden `/internal-ops/`
  page, protocol-gated per §6). `tsc --noEmit` and `esbuild` both clean.
  Three deliberate deviations from `docs/story.md`'s literal tool sequence,
  made for SDK accuracy — logged in `docs/scratch.md` for confirmation
  once this mission is actually live-tested in-game.
- **[mechanic] `build-install.ps1` added.** Mirrors entity-resolution-mods'
  own script: `npm run build`, verify `dist/mod.js` + `dist/manifest.json`
  exist, copy `dist/` into a local HackHub mods folder
  (`mods/flatline-protocol-dev` by default). The user runs this
  themselves — per `docs/implementation-rules.md` §8, Claude never touches
  the mods folder or restarts the game.
- **[docs] `docs/m01-playtest.md` added.** Disposable step-by-step
  playtest script for M01's first live run, with the 3 `docs/scratch.md`
  checkpoints embedded at the exact steps they apply to. Delete/archive
  once M01 reaches FINAL LOCK.
- **[bug] First live-test pass on M01 — `ftp` fixture was missing
  entirely.** The storefront page promised anonymous FTP access but the
  quest never called `Shell.addCommandData("ftp", ...)`, so every login
  attempt failed with a generic `530 Login incorrect` no matter what
  credentials the player tried. Fixed by registering a real fixture
  (`anonymous`/`anonymous`) and making the credentials explicit on the
  page instead of just implying "anonymous." Full detail: `docs/bugs.md`
  entry 1. Preemptively added the same kind of fixture for `ssh` and
  `weechat` too, since they have the same fixture-shaped `CommandDataMap`
  surface — not yet confirmed live whether `ssh`'s `key` field means what
  was assumed.
- **[mechanic] `isDev`/`questGate` dev-focus flag added.** Ported from
  entity-resolution-mods' `src/content/dev-flag.ts` (read directly from
  that project) to `mNN` mission ids: `DEV_FOCUS_QUEST` (currently `m01`
  focused), `questGate`, `isQuestDevFocus`, `applyDevGating`. M01 now
  strips `unlocksAfter` while focused, so all 13 objectives show at once
  instead of unlocking one-by-one during testing, and zeroes its
  `Rewards` while focused instead of the manual reward-block gate that
  project uses (this project's `Rewards` is paid automatically by the
  SDK, so there's no reward block to gate manually). Full detail:
  `docs/implementation-rules.md` §2a.
- **[mechanic] `dev-flag.ts` moved to `src/guard/`.** Was
  `src/content/dev-flag.ts`; new home is `src/guard/dev-flag.ts` — it's
  dev/prod gating logic, not mission content, so it doesn't belong in
  `content/`. Import in `src/main/m01-quest.ts` and the folder layering
  in `docs/architecture.md`/`docs/implementation-rules.md` §2a updated to
  match.
- **[bug] Second M01 live-test failure: `ftp: connect: No route to
  host`.** After fixing entry 1's missing fixture, connecting still
  failed at a lower level: `Network.createSubnetNetwork`'s real `ports`
  array only declared 22/80/443, never port 21, so there was nothing to
  route the connection to. Fixed by adding an active port 21 to the
  device's real ports (kept out of the separate `nmap` print fixture on
  purpose — the FTP share is meant to stay invisible to a routine scan).
  Full detail: `docs/bugs.md` entry 2.
- **[bug] Same error persisted after the port-21 fix — because the fix
  was in the wrong lifecycle hook.** `Network.createSubnetNetwork`/
  `registerDomain`/`WeeChat.createServer` lived in `OnStart()`, which
  only runs once on first claim and never again — so a player who'd
  already claimed M01 kept the old (pre-fix) network state no matter how
  many times the mod was rebuilt/reinstalled. Moved all three into
  `OnObjectivesStart()` (idempotent, fire-and-forget destroy-then-
  recreate), which the SDK confirms reruns on every game start. One-time
  content (tip mail, IRC seed message) stays in `OnStart()`. New
  mandatory rule: `docs/implementation-rules.md` §5a. Full detail:
  `docs/bugs.md` entry 3.
- **[bug] Same `No route to host` error persisted through entries 2 and
  3 — two suspects fixed together.** Removed the destroy-then-recreate
  race the entry-3 fix itself introduced (fire-and-forget
  `Network.destroyNetwork(ip)` immediately before `createSubnetNetwork`
  at the same address could tear down the just-created network).
  Restructured the network from a flat top-level `type: Device` to a
  `Router` (new `M01_ROUTER_IP`, never shown to the player) wrapping the
  real target as a `children` entry, matching the SDK's own doc example
  shape. `OnComplete`/`OnAbandon` now destroy the Router's IP, not the
  child's. Not yet confirmed live which of the two was the actual cause.
  Full detail: `docs/bugs.md` entry 4.
- **[bug] `ftp: connect: No route to host` — Router+child attempt also
  failed, identically.** User confirmed build/install/restart (and even
  `mods.reset`) were done correctly each time, ruling out a stale-build
  explanation. Re-read the SDK's own `SubnetNetworkDefinition` doc example
  more carefully: its child IP is LAN-style (`10.0.0.2`), suggesting
  `children` are internal/pivot-only hosts, not directly-dialable public
  IPs — the previous attempt's child address was still public-looking.
  New attempt: flat top-level `type: Router` (not `Device`) with
  `children: []`, matching entity-resolution-mods' own working Q01
  shape. Not yet live-tested. Full detail: `docs/bugs.md` entry 4
  (rewritten to track all 4 attempts in one place).

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
- **[bug] M01 `ftp` still `No route to host` after 6+ total attempts —
  currently OPEN, work paused.** Further attempts (fixture keyed on
  domain instead of IP, a real `anonymous`/`anonymous` user added, target
  IP moved onto RFC 5737 docs space) all produced the identical error;
  one domain-keyed retest briefly returned `530` instead, then reverted
  to `No route to host` on a confirmed-fresh rebuild, so that result isn't
  trusted as a real signal. Root cause remains unknown. Recommended
  fallback, not yet actioned: drop `ftp` from M01's objective chain and
  deliver the wordlist via mail attachment off the `/internal-ops/` page
  read instead (both already proven-working mechanisms elsewhere in this
  mission). User is asking a contact for a second opinion before
  resuming; M02-M04 implementation proceeded in parallel since it doesn't
  depend on this fix. Full detail: `docs/bugs.md` entry 4.
- **[milestone] Missions 2-4 implemented end-to-end, not yet
  live-tested.** All three built against the real SDK types the same way
  M01 was (`node_modules/@hotbunny/hackhub-content-sdk/index.d.ts`
  re-read directly for every tool involved), following the same
  content/logic split, dev-flag gating, dual-path report validation, and
  `OnObjectivesStart()`-owns-topology rules M01 established:
  - **M2 "Sang Pembuat"** (`src/content/m02.ts`, `src/main/m02-quest.ts`,
    `src/websites/a7xcodeface/`) — 12 objectives: whois/subfinder/`-sV`
    nmap chain to a dev subdomain, `sqlmap`+`john` crack an affiliate
    panel admin hash, `ssh` into the dev server for matching deployment
    logs, then a first-time `metasploit`/`Meterpreter` use against the
    developer's separate workstation to pull a financial document naming
    the shell company. A `Database` is created/removed alongside the
    `Network` topology, mirroring the same idempotent-teardown pattern.
  - **M3 "Jalur Uang"** (`src/content/m03.ts`, `src/main/m03-quest.ts`,
    `src/websites/skynet-importexport/`) — 12 objectives: OSINT the
    shell company's public site and a finance employee's leaked password
    pattern, `hydra`-crack a pfSense admin login, pivot into an internal
    Finance VLAN child device (LAN-style IP, per the lesson from M01's
    `docs/bugs.md` entry 4), `wireshark` + `sqlmap` the internal ledger,
    then revert the same NAT change before leaving. `PFSense.Changes`
    carries no `ip` field at the type level, so the add/revert pivot is
    gated on a `PFSense.Login`-set flag plus a change counter instead of
    matching the event's own payload — flagged in `docs/scratch.md` as
    unconfirmed until played.
  - **M4 "Sang Dalang"** (`src/content/m04.ts`, `src/main/m04-quest.ts`,
    `src/websites/architect-c2/`, `src/commands/attrcheck.ts`) — 11
    objectives, converging all three prior threads: trace the recurring
    VPN IP, `nuclei`-confirm a CVE, a two-stage
    `Metasploit.Meterpreter.Connected` → `Metasploit.Rootgrab` shell, then
    a booby-trapped `master_identity_backup` file that must be checked
    with the new custom `attrcheck` command and extracted via a raw
    `Files.Transfer` download rather than `cat` (which instead sends a
    punitive "self-wipe" warning mail and does not complete the
    objective). Ends on an open A/B/C choice, resolved through one GoMail
    report template with 3 valid `choice` values plus a matching 3-body
    freehand fallback, rather than gating completion on the `Dialog`
    itself (kept purely as flavor, invoked via `this.createDialog()`) —
    Dialog options in `content/m04.ts` intentionally carry no
    `onSelect`/`onEnd` callbacks, per the "strip every function property"
    lesson cited in `docs/story.md`.
  - `src/index.ts` now imports all three missions' quests, websites, and
    the `attrcheck` command; `tsc --noEmit` and `esbuild` are clean for
    the whole project (`dist/mod.js`, 78.0 KB). None of the three has
    been played in-game yet — see `docs/scratch.md` for every
    SDK-behavior assumption still pending live-test confirmation.

## 2026-09-19

- **[mechanic] M01's `ftp`/`hydra` objective chain dropped entirely,
  redesigned around a cookie/JWT-decode mechanic.** After 6+ unresolved
  `No route to host` attempts (`docs/bugs.md` entry 4), abandoned native
  `ftp` and Metasploit for M01. New chain: intercept a session cookie's
  JWT, decode it with `jwt_decoder.py` (a real base-game tool, confirmed
  by reading strings out of the installed game's `app.asar`), reveal the
  broker's SSH password. Full design: `docs/story.md` section 4.
- **[mechanic] `verifiedaccess.mkt` storefront rebuilt as a 12-path
  haystack.** Home page is now a shuffled, looping marquee of 10 "lots"
  (4 linked/active, 6 "no longer listed" and `dirhunter`-only); plus
  `/admin/`, `/vendor-portal/` decoys. The real listing (`OPN 102`) is
  one of the unlinked six. `dirhunter` is the only way to find it.
- **[bug] `Wireshark` doesn't capture the player's own browser traffic to
  a public domain; `Http.Intercepted` never fires without a player-facing
  proxy UI, which doesn't exist.** Both tried and abandoned for the
  session-cookie step. Full detail: `docs/bugs.md` entries 8-9.
- **[mechanic] Session token now delivered via a decoy-laden
  `/access-log/` page (9 fake tokens + 1 real) and decrypted with
  `openssl -dec`.** Confirmed `openssl` is base64 (`atob`/`btoa`) with a
  fallback, not real crypto, by reading strings out of the base game's
  own `app.asar` (its official tutorial quest uses the identical
  mechanic). Full detail: `docs/mechanics-reference.md`.
- **[bug] `Network.createSubnetNetwork` needs a Router-wrapping-child-
  Device shape for `ssh` to connect — likely the real root cause of the
  original, never-resolved `ftp` routing bug too.** Fixed by giving the
  Router its own disposable IP and nesting the real target as a
  `children` entry. Full detail: `docs/bugs.md` entry 5 (with a
  retrospective note on entry 4).
- **[bug] `await` before `Network.createSubnetNetwork` in the same
  handler loses mod context; `WeeChat.createServer`/`sendMessage` are
  also "left alone" on an existing host.** Both fixed with
  fire-and-forget destroy-then-create ordering. Full detail:
  `docs/bugs.md` entries 6-7.
- **[bug] The recurring dead-drop contact's email was never shown to the
  player in any mission.** Fixed in M01 with a "standing instructions"
  mail from the Custodian, sent once at the start of the whole arc. Full
  detail: `docs/bugs.md` entry 10.
- **[mechanic] Added a "LedgerVault" evidence site
  (`x7k2m9vdlq4wnyt3.dark`) and a `caseId` field on the final report.**
  Discovered via a throwaway reference in a server log file; contains
  decoy "quarter" folders plus the real case's `network_map.txt` and
  `case_id.txt`. Report template's `broker` field now accepts the
  `OPN 102` listing URL with or without `https://`/trailing slash.
- **[milestone] Mission titles translated to English.** M1 "Jejak
  Pertama" → "First Trace", M2 "Sang Pembuat" → "The Maker", M3 "Jalur
  Uang" → "Money Trail", M4 "Sang Dalang" → **"The Architect"** (reuses
  the target's own already-established name rather than a fresh
  translation).
- **[milestone] M1 "First Trace" reaches FINAL LOCK — live-tested and
  confirmed playable end-to-end.** All findings folded into
  `docs/bugs.md` (entries 1-11) and `docs/story.md` (section 4);
  `docs/scratch.md`'s M01 section cleared per this project's own
  scratch-file policy.

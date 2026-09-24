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

## 2026-09-20

- **[mechanic] M1's "SSH into the failover gateway" premise replaced —
  the real `ssh` command hard-rejects any non-`Device` network node,
  making it impossible against a `Firewall`.** New mechanic: `pfsense`
  (web-admin login, type-agnostic) plus `kimai` (a real, catalog-
  downloadable HackDB tool that only targets `Firewall` nodes and leaks a
  signed JWT credential). Discovered by decompiling the base game's own
  `ssh`/`kimai` command classes. Full detail: `docs/bugs.md` entry 17.
- **[mechanic] `src/websites/` restructured into per-mission folders**
  (`m01/`, `m02/`, `m03/`, `m04/`), replacing flat legacy folder names
  (`a7xdeface9` → `blackwire-network`, `shadowline-exchange` →
  `frostgate-exchange`, `a7xcodeface`, `skynet-importexport`,
  `architect-c2` moved under their own mission folders).
- **[mechanic] Two new M1 decoy domains built to full parity with the
  real target.** `frostgate-exchange` and `obsidian-access` mirror
  `blackwire-network`'s listing/lot page structure exactly, so a
  `dirhunter`/recon pass can't distinguish decoy from real target by
  surface depth alone — per this project's "full mechanic, not full
  objective" design rule.
- **[bug] `.original.ts` mission backups importing their sibling's live
  content file instead of their own snapshot — found and fixed across
  all four missions.** Applied to M01's pair too, as a preventive fix
  (it wasn't yet erroring there). Full detail: `docs/bugs.md` entry 16.
- **[mechanic] LedgerVault (`x7k2m9vdlq4wnyt3.dark`) rebuilt from three
  static text pages into one interactive file-browser page** — folder
  navigation, an image lightbox, and a search box, in a new dark/red
  visual theme, replacing the original plain-monospace panels. Content
  mapped onto established canon instead of generic placeholders: **Q1 =
  Northstar Port Authority** (maritime/critical infrastructure, 2020),
  **Q2 = Rheinland Energie AG** (energy/utilities, 2023), **Q3 =
  PacificCare Health** (the mission's own hospital case). `CASE-A7X-0417`
  and `network_map.txt` — both load-bearing for the final report's
  `caseId` exact-match check — were carried over into the new design, not
  dropped.
- **[mechanic] PacificCare Health's public homepage given a "systems
  down" banner and a leaked BLACKLEDGER lockscreen screenshot**, playing
  against its own PR copy ("network issue") — the hospital site's first
  visual asset.
- **[mechanic] `isTester`/`TESTER_FOCUS_QUEST` flag added to
  `src/guard/flags.ts`, alongside the existing dev-focus flag.** Lets a
  QA tester jump straight to one mission (bypassing prior-mission
  prereqs) without flattening its objective gating (`unlocksAfter` stays
  intact, unlike dev-focus) and without paying out `Rewards` — applies to
  all four missions, not just M01.

## 2026-09-21

- **[mechanic] M1's 4 player-facing objectives collapsed into 1.**
  `M01_OBJECTIVE_IDS`/`M01_OBJECTIVES` now expose only `reportFindings`;
  the three intermediate `completeObjective` calls were removed from
  `m01-quest.ts` but the underlying event listeners/`SetData` flags they
  sat inside were left intact — the mechanics still run, they just don't
  each get their own objective checkpoint anymore.
- **[mechanic] M1's tip email, dead-drop mail, and report (template +
  freehand body) rewritten longer and more informative.** The report
  gained 3 new fields — `Listing` (`MED-SEA-0417`), `Project`
  (`Q3-2026-SEA`), `Vault` (the LedgerVault domain) — alongside the
  existing `Broker`/`Buyer`/`Case`, for 6 total. `normalizeBrokerReference`
  generalized to `normalizeUrlReference`, now used for `vaultUrl`.
- **[bug] Broker's discoverable identity fixed from a stray placeholder
  name to `A7xDEFACE9`.** The listing page's Vendor field said
  `WRAITHTRADE` — unique to this one listing, not a reused marketplace
  filler — which never matched `docs/story.md`'s "A7x" codename family
  (`TR4C3#404` is M2's target). Fixed in `opn-102.html`'s Vendor field
  and the matching LedgerVault caption; the `Broker` report field now
  validates against `A7xDEFACE9` instead of the listing URL. Known
  leftover: the LedgerVault receipt photo's own pixels still print
  "WRAITHTRADE" (baked into the generated image, not editable in code).
- **[mechanic] Visiting LedgerVault is now a hard-gated, mechanically
  checked step, not just implied by needing its field values.** A new
  `Browser.Meta` listener sets `vaultVisited`; the final report's
  `Mail.Sent` handler now refuses to complete unless `vaultVisited` is
  true, regardless of whether every field value is otherwise correct.
- **[mechanic] LedgerVault's domain moved to be discoverable only through
  the IRC chat, closing two other paths that used to leak it.** The
  backend cron log and a Twotter post both used to print the domain in
  plain text, independent of IRC status; both were scrubbed, and the
  domain now only appears (split across two chat lines, so it's not one
  obvious answer) in the seeded `WeeChat` conversation, which requires
  `chatConfirmed` to read.
- **[mechanic] M1 now starts from a Hackhub feed post instead of
  auto-starting.** `AutoStart` set to `false`; a `HackhubPost` was added
  with content written from GHOSTWIRE's own point of view, an avatar, and
  a "FLATLINE PROTOCOL" key-art image as the post's media.
- **[mechanic] `isDev`/`isTester` flipped for an external tester handoff.**
  `isDev` off, `isTester` on with `TESTER_FOCUS_QUEST.m01` — M02-M04 lock
  out entirely (isolation lock) and M01 pays no reward, so a friend can
  try the mission cleanly without touching unfinished content or the real
  economy.
- **[milestone] M1 "First Trace" — second redesign pass complete, held
  for external tester validation rather than re-marked FINAL LOCK.** See
  `docs/story.md` section 4 and its `## 7` checklist entry for the full
  before/after; nothing here has been personally live-tested by the
  developer since the 2026-09-19 FINAL LOCK it supersedes.
- **[mechanic] Mod cover art added.** `cover.png` plus a `manifest.json`
  `cover` field, so the mod shows its key art in the Local Mods lobby
  instead of the default placeholder icon (commit `8d50a42`).
- **[mechanic] M1's `AutoStart` now follows dev focus.**
  `AutoStart = isQuestDevFocus("m01")` instead of a hardcoded `false`, so
  a developer iterating locally does not have to claim the Hackhub post
  every test cycle; testers and production still go through the feed post.
- **[mechanic] M2's evidence synced with M1's locked canon.** The deploy
  log and the affiliate-panel row now carry M1's real case
  (`MED-SEA-0417`, 2026-08-14) instead of a generic 2024 client, and the
  ransom amount is an actual figure ($2,850,000). A short GHOSTWIRE dialog
  fires the first time the deploy log is read — the sibling-death beat
  `docs/story.md` calls the story's main emotional beat. M2's entry point
  also moved off a flat tip-mail reveal: the toolkit developer's domain is
  now discoverable in LedgerVault (new `associate_infra.txt` card in the
  Q3-2026-SEA folder).
- **[bug] `subfinder` / `net_tree` lost M1's blackwire-network.mkt domains
  after a same-tick destroy + create.** `registerM01Network()`'s
  `destroyNetwork()` + `createSubnetNetwork()` pairs on the same address
  raced the engine's async teardown and silently dropped domains after
  `OnObjectivesStart` returned. Every same-address destroy call in
  M01/M03/M04 is now gated behind `isDev`, so tester and production builds
  never tear down addresses that already hold state. See `docs/bugs.md`
  #18 (commit `76b8fb9`).
- **[bug] `Files.create()` and other permissioned SDK calls lose mod
  identity outside a `Command.Run()` or an `Events.on()` handler.** Found
  while looking for a real downloadable file for a `hydra`-crack step:
  from any quest lifecycle hook (sync or async), or from a
  `Website.Exports` function reached by a button click, `Files.create()`
  fails with `Mod "null"`; it works from a custom `Command`'s own `Run()`
  and from a top-level `Events.on()` handler reached via `Events.emit()`.
  Documented only, generalizing entries 6/12/15 beyond
  `Network.createSubnetNetwork`. See `docs/bugs.md` #19.
- **[mechanic] M2's buyer/target alias renamed `A7xC0DEFACE` →
  `TR4C3#404`.** The old alias was too visually close to M1's broker
  alias. Renamed across M1/M2 content, the M2 website folder
  (`a7xcodeface` → `tr4c3404`), LedgerVault, and the docs.
- **[mechanic] ClearEscrow reworked into a public transaction board.** It
  was a single-tenant "Partner Dashboard", which implied the broker works
  there. It now lists all 18 currently-SOLD listings across
  blackwire/frostgate/obsidian with amounts UNDISCLOSED, matching the
  marketplaces, and references the listing code instead of the
  LedgerVault-only case ID. "Related Listings" was removed from every SOLD
  listing page (18 pages), and the real listing's SEA region (3/3/4 across
  the three sites) and Hospital access type (4 total) were diluted so
  neither trait alone identifies it; `opn-102.html` carries a
  `data-m1-canonical-listing` attribute for maintainers.

## 2026-09-22

- **[mechanic] M1's backend login reworked into a `hydra` crack.** The
  backend SSH login is now the broker's real vendor alias (shown on the
  storefront listing) instead of `opsadmin` from the tip mail, which stays
  as a deliberate near-miss. The credential is cracked with a `hydra`
  fixture whose wordlist comes from the base game's own HackDB catalog
  (hackdb.net) — the same store already used for `kimai` / `jwt_decoder`,
  so there is no mod-hosted download. The IRC conversation was reframed as
  a direct broker ↔ buyer exchange; it used to be a broker and an
  associate discussing a third-party buyer (commit `4da7208`).
- **[mechanic] `swiftedge-cloud` leak-page mechanic dropped; ClearEscrow
  made discoverable.** The site, its domain records and its `lynx` fixture
  were removed once the HackDB / `hydra` route replaced it. The three
  marketplace homepages now footer-link to clearescrow.io ("payments
  secured via ClearEscrow"), giving it a discovery path before backend
  access.
- **[mechanic] Per-save listing randomization across all three
  marketplaces.** 18 SOLD listings (6 per marketplace) get a fresh
  Category/Region/Code/Vendor once per save, persisted in `SaveStorage`
  and mirrored to `Variables`. Exactly one is the real one (Region SEA
  plus the broker's vendor alias), diluted by 5 more forced-SEA listings;
  the 17 decoys reuse ClearEscrow's existing seller names. Listing paths
  are opaque tokens, since `dirhunter` prints every registered path. The
  broker alias became `X7xS3NTRY9`, and the backend and firewall moved off
  blackwire onto their own domain `x7xsentry9.tech`, found via
  `lynx <alias>`; all three marketplaces' `gateway.*` subdomains are now
  uniform decommissioned dead ends. See `src/content/m01-listing-pool.ts`.
- **[bug] A `Website`'s `metadata()` can never read `SaveStorage`.**
  Investigated in `src/debug/scratch.ts` over five iterations. `Variables`
  written from a real `this.Events.on()` game-event callback are visible
  to `metadata()`; `SaveStorage` never is, and neither are values written
  directly inside a lifecycle hook's own body. The listing pool is
  therefore resolved from a `this.Events.on()` callback and mirrored
  `SaveStorage` → `Variables`. See `docs/bugs.md` #20.
- **[mechanic] Listing-pool trigger moved from `Terminal.Nslookup` to
  `Mail.Read`; M1 became abandonable.** The pool now resolves when the
  mission's opening email is read, before any recon, which narrows the
  fresh-save `PENDING-0000` risk. `Abandonable = true` with
  `resetM01ListingResolution()` in `OnAbandon()`, so abandon-and-reclaim
  rolls a fresh listing set. `isDebug` was flipped back to `false` (it had
  locked every mission) for tester-mode gating.
- **[bug] Structural network changes never reach an already-progressed
  save.** Moving a device into a router's `children`, or adding a child,
  is "left alone" on an existing save, and the fire-and-forget
  `destroyNetwork()` races the recreate (`net_tree.py` → "Subnet not
  found"). Every address whose shape changed now gets a brand-new IP
  instead. M1 was consolidated to one Router per marketplace with three
  hosts each (storefront, gateway, and new SSH-able `api.*` dead ends on
  frostgate/obsidian shaped like `legacy.blackwire-network.mkt`), with
  `M01_FRONT_*` / `M01_DECOY_*` renamed `M01_BLACKWIRE_*` /
  `M01_FROSTGATE_*`. See `docs/bugs.md` #21.
- **[bug] M1 marketplace pages: dead links and stale labels fixed.**
  ACTIVE listings' "OPEN" links pointed at the old semantic slugs instead
  of the registered opaque paths; the SOLD rows on each `home.html` were
  hardcoded and are now injected per save (`buildM01HomeSoldLots()`);
  frostgate's path format now matches blackwire/obsidian
  (`/listings/xxxx/`); dead "ARCHIVED" Related Listings links were removed
  and obsidian's regained their `/listings/` prefix; the winner's Vendor
  is redacted to `—` on ClearEscrow.
- **[mechanic] M1 recon gates and content fixes.** `lynx <alias>` and the
  broker-domain `nslookup` now need the listing visited first (they leaked
  the lead too early on replays). The decoy vendor `REDLINE_OPS` was
  renamed `RUSTVEIN_9` because it collided with a real ACTIVE listing's
  vendor. Two stale `a7xcodeface.dev` references in LedgerVault (an inline
  SVG and the `q3-receipt.png` photo) were fixed.
- **[docs] Nmap port-443 realism rule.** Any domain with a real `Website`
  must show 443 OPEN in its nmap fixture, and any domain without one must
  show it CLOSE; four fixtures (frostgate, obsidian, clearescrow, the
  broker's root domain) were fixed. See `docs/implementation-rules.md`
  §12.
- **[mechanic] Shared 400/404 error pages.** `src/websites/shared/`
  (`page-guards.ts` with `requireHttps` / `securePage` / `notFoundPage`,
  plus two on-brand HTML templates) replaced the duplicated inline
  `http-error.html` files of M01–M04. `docs/implementation-rules.md` §6
  was rewritten to point at it.
- **[milestone] M1 fully localized (English + Simplified Chinese).** Phase
  1 covers quest text (mail, IRC, device files, terminal flavor, HackHub
  post) through `Localization.t()` called from lazy functions. Phase 2
  covers all five websites (blackwire, frostgate, obsidian, clearescrow,
  ledgervault) through `{{t:KEY}}` tokens and a `siteT()` cache, plus the
  Twotter bios and 46 tweets. `Twotter.updateUser()` never included `bio`,
  so bios froze at first creation — fixed. Mail and HackHub post content
  was reflowed into natural paragraphs. See `src/content/m01-i18n.ts`.
- **[bug] Localization pitfalls found while doing it.** `Localization.t()`
  returns the raw key inside a `Website`'s `metadata()`, so
  `refreshM01SiteStrings()` resolves every site string from
  `OnObjectivesStart()` into a `Variables` cache that `siteT()` reads
  (`docs/bugs.md` #22). Module-scope `Localization.t()` freezes at the
  mod-load language, hence the lazy functions. `Title` / `Description` /
  `Objectives` / `HackhubPost` as getters make the HackHub post vanish and
  the tracker show raw keys, so they stay plain fields frozen at the load
  language (see `docs/scratch.md`).
- **[mechanic] Twotter personas decoupled from the case.** The "broker"
  and "decoy" accounts became "ops" and "trader" with ordinary human names
  (Skylar Webb, Elena Cruz, Sarah Reyes), a `gender` on
  `Twotter.createUser()`, and six generated avatar/banner photos.
- **[bug] Native-UI images need `mod-asset://`, and the build tool only
  copies `"./..."` literals.** Twotter avatars/banners and
  `HackhubPost.author.avatar` need fully-qualified
  `mod-asset://<manifest-id>/...` URLs (the bare `./assets/` form only
  works inside `Website` / `App` HTML, where the SDK injects a `<base>`).
  The SDK build's asset scanner only matches string literals starting with
  `.`, so a literal `mod-asset://` URL silently stops the file being
  copied into `dist/`. The `modAsset()` helper in `src/content/m01.ts`
  keeps the `"./assets/..."` literal in source and returns the full URL at
  runtime (asset copy count 33 → 39).
- **[mechanic] LedgerVault and the HackHub post trimmed.** LedgerVault's
  Q1/Q2 folders were cut to Evidence-only (8 PNGs, about 20 MB removed;
  the Archive folder is now empty) and the HackHub post logo was swapped.
- **[bug] `WeeChat.createServer()` prints the IRC host and password in
  plaintext.** Base-game bug: the client does
  `console.log("CreateServer", host, password)` on every call, so M1's IRC
  credentials reach DevTools each time `OnStart()` fires. Not patchable
  from mod code; documented as an accepted limitation in `docs/bugs.md`
  #23.
- **[docs] M1 docs kept in sync.** `docs/m01-playtest.md` was rewritten
  for the hydra / randomization / topology flow, and `docs/story.md` and
  `docs/scratch.md` gained the matching decisions and findings.
- **[milestone] M1 "First Trace" LOCKED and committed.** Commit `c9c7337`
  ("feat: finalize M1 — full EN/zh localization, Twotter rework,
  LedgerVault trim", 95 files) bundles the day's work; M1 is not touched
  again unless urgent. `.vscode/settings.json` was added and removed again
  (`4b43554`), and `.vscode` is now gitignored.

## 2026-09-23

- **[mechanic] M2's eight player-facing objectives collapsed into one.**
  Same "full mechanic, not full objective" pattern as M1: `M02_OBJECTIVES`
  now exposes only `reportFindings`, `M02QuestData` shrank from 18 flags
  to 2, and the intermediate `Events.on(...)` listeners and `tryComplete*`
  helpers were removed. The `Terminal.Cat` dialog trigger and the
  `Mail.Sent` report completion stay.
- **[docs] `docs/m02-playtest.md` created.** Step-by-step live-test script
  for M2, modeled on `docs/m01-playtest.md`, with a network-topology
  appendix.
- **[docs] M2 redesign plan and M3/M4 audit recorded.** Design only, in
  `docs/scratch.md`. M2 plan: swap the dead `MED-SEA-0417` reference for
  `M01_CASE_ID`, remove the tip-mail spoiler, grow the affiliate table
  from 1 to 3 rows, replace the WiFi-crack mechanic (`createWifiNetwork` /
  `bettercap` / `fern` are physical-proximity tools, implausible for a
  remote hacker) with a devbox pivot, add a second GHOSTWIRE dialogue beat
  after the download, and add silent domestic-texture files on the
  workstation. M3/M4 audit findings (M3→M4's VPN-IP lead never surfaces
  mechanically, the Architect has no characterization, the `bettercap`
  ARP-spoof step has no code, and others) are logged and deferred until M2
  is done.
- **[bug] Two M1 gaps found during the M2 audit, deliberately left
  unfixed.** After a game restart mid-mission the `Variables`-backed
  `siteT()` cache stays empty until `OnObjectivesStart()` runs again, so
  M1 websites can show raw `{{t:...}}` keys
  (`src/content/m01-site-strings-cache.ts`). And the M1 report has no
  field for the toolkit URL even though `associate_infra.txt` reveals
  `tr4c3404.dev`. Both were investigated and the fix was declined; M1
  stays locked.

## 2026-09-24

- **[mechanic] M2 redesign implemented (Tahap 1+2).** New IP scheme; the
  devbox subdomain moved to the random hex label
  `f3a91b7c04d8.tr4c3404.dev`; the dead `MED-SEA-0417` reference was
  replaced by `M01_CASE_ID` (confirmed live: "CASE-A7X-0417. August 14th,
  2026."); the affiliate table grew to three rows; the tip mail was
  rewritten and the admin password rotated; one `M02_DIALOG` now carries
  `default` and `aftermath` branches. The WiFi mechanic was replaced by a
  `sync-home.txt` file on the rooted devbox that leaks the workstation's
  address, plus domestic-texture files (`errands.txt`, `unsent.txt`); the
  workstation became Router → Splitter → {Firewall, Workstation, Printer};
  the website was rebranded `A7xCodeFace` → `TR4C3404`.
- **[mechanic] 40-subdomain haystack for `subfinder` (Tahap 3).** 37 empty
  decoys with fixed IPs from `192.0.2.0/24`, two populated decoys
  (`9c71ff0362bb` and `40e9a8d1c256`, each with an empty-table `Database`)
  and the real devbox. Registration order is Fisher-Yates shuffled on
  every load so the three vulnerable hosts do not sort to the top, and
  `nuclei` narrows the list to those three.
- **[mechanic] Closer-Rig bonus thread (Tahap 4).** A second affiliate,
  `Qu0taCl0ser` ("Closer-Rig", `FreeRDP 2.7.3`, the same Metasploit RDP
  exploit as the workstation, no firewall gate). Its `quota_report.txt`
  and `routing_notes.txt` plant `M04_ARCHITECT_VPN_IP` as real evidence
  for M4.
- **[bug] Splitter nodes cannot hold SSH, ports or content.** `ssh`
  hard-requires target type `Device`, and the port aggregation behind
  `nmap` never writes a Splitter's own `.ports`; a `Device` node also
  cannot have `children`, so retyping in place is impossible. The Splitter
  is now an empty pass-through (as in M3/M4) with the real NAS
  `Rust-Bucket` (`admin` / `admin`) and four decoys (`Glass-Eye`,
  `Night-Owl`, `Ghost-Relay`, `Dead-Pixel`) as sibling `Device` nodes. The
  home LAN was renumbered to `192.168.1.x` (`IsLocalIp()` hardcodes that
  prefix) with the Workstation deliberately not adjacent to the Firewall,
  and the firewall rule's `destination` field was removed: the unlock
  never read it, it only spoiled the LAN IP. See `docs/scratch.md`.
- **[bug] Engine facts found while live-testing M2.**
  `Meterpreter.Download` never fires reliably, so the aftermath dialogue
  triggers on `Files.Transfer` filtered by file name. `cat` only reads
  `.txt` and `.log`. The browser only opens a Firewall or Router page on
  `port.internal === 80`. `sqlmap -u` needs a domain while `ssh -h` needs
  an IP. `subfinder` only lists nodes that carry a domain, so empty decoys
  need a backing node. `sqlmap -tables` needs a `Database` record keyed by
  host IP. Chaining `.then()` on `destroyNetwork()` broke `subfinder` and
  was reverted; the `destroyNetwork()` calls in `OnObjectivesStart` were
  commented out for good. All logged in `docs/scratch.md`.
- **[bug] Circular import leaked `undefined` into `routing_notes.txt`.**
  `m02` → `m04` → `m03` → `m02` closed a cycle, so a module-level string
  read `M04_ARCHITECT_VPN_IP` before it was assigned. The constant moved
  into the leaf file `src/content/characters.ts` (`m04.ts` re-exports it),
  leaving the import graph acyclic: `characters` ← `m01` ← `m02` ← `m03` ←
  `m04`.
- **[bug] Workstation `nmap` kept showing `FreeRDP 1.0.0`.** A leftover
  `removePort` / `addPort` / `setVulnerabilities(1.0.0)` block after
  `createSubnetNetwork()` re-added the port on every `OnObjectivesStart`.
  It was removed; the workstation is `FreeRDP 7.1.9` and Closer-Rig
  `FreeRDP 2.7.3`, with each port `version` matching its vulnerability
  `version` (they are independent fields).
- **[mechanic] M2 report enriched.** The "Mission 2 Findings" template
  field `developer` became `developer_url` (validated against the devbox
  subdomain), the template and the freehand report body gained an
  "Unresolved" line about a second signer above the shell company, and the
  collapsed objective's text no longer mentions Wi-Fi.
- **[milestone] M2 live-tested end to end.** The main path (nodes 1–23)
  and the Closer-Rig bonus (25–27) were confirmed working in-game by the
  developer, including the report mail. `docs/m02-playtest.md` was
  rewritten to 27 steps. Tester-mode flags (`isDev=false`,
  `isTester=true`, `TESTER_FOCUS_QUEST.m02`) gave a clean test setup.
- **[mechanic] M1 teardown consolidated; LedgerVault domain made
  permanent.** `OnComplete` and `OnAbandon` now share one `teardown()`;
  the two copies had drifted, and `OnComplete` never cleared the per-save
  listing resolution. Neither removes the LedgerVault domain any more: it
  is standing world content and must stay resolvable for the whole game.
- **[mechanic] Desktop-app prototypes.** M1–M4 were audited for a
  dedicated Flatline desktop app, and two samples (`scratchcase1`, a
  per-mission list, and `scratchcase2`, a corkboard) were registered in
  `src/debug/scratch.ts`. An app only shows under "Mod Applications" in
  the AppStore once it has a `Store` object. Both samples were removed on
  2026-09-25 in favour of BACKTRACE.
- **[mechanic] `isDebug` switched on.** By the end of the day
  `src/guard/flags.ts` had `isDebug = true`, which makes `questGate`
  return the isolation lock for every quest, so no mission can be claimed
  until it is flipped back to `false`.

## 2026-09-25

- **[mechanic] BACKTRACE case-file desktop app prototyped.** GHOSTWIRE's
  in-game case file, built as a static mockup in `src/debug/scratch.html`
  (imported by `scratch.ts`) and checked live in a browser: a mission
  sidebar (a prologue page plus #1–#4 with locked / in-progress / complete
  states), per-mission report views, and a CASEBOARD (pan/zoom entity map
  over an animated waveform). The prologue page tells GHOSTWIRE's motive:
  a sibling lost to the ransomware attack on a hospital.
- **[mechanic] BACKTRACE desktop app wired to real mission state.** New
  `src/applications/` folder holds the app (`backtrace.ts`,
  `backtrace.html`) and its state helper (`backtrace-state.ts`). Each
  `mNN-quest.ts` now records its mission's status — `locked` /
  `progress` / `complete`, plus the in-game completion date — in
  `SaveStorage` key `backtrace`, written from `OnStart` / `OnComplete` /
  `OnAbandon`. The app's iframe reads it through `HackhubSDK.SaveStorage`
  and polls every 2 s, driving the sidebar statuses, the M1/M2 report
  views (a "NO REPORT FILED" card while a mission is open, "REPORT
  PENDING" for a completed M3/M4), and the CASEBOARD (nodes,
  connections, counts, empty state). Opened outside the game (`file:`
  protocol, no SDK) it falls back to an M1+M2-complete preview. See
  `src/applications/backtrace-state.ts`.
- **[mechanic] BACKTRACE moved out of `src/debug/` and renamed.**
  `AppName` `scratchcasev9` → `backtrace`, so it is a new AppStore item
  and the old install entry can linger in existing saves. The prototype
  class and the two abandoned CASEFILE sample apps (`scratchcase1` /
  `scratchcase2`) were removed from `src/debug/scratch.ts`.
- **[mechanic] `scratchbt` debug command added** (`src/debug/scratch.ts`).
  `scratchbt <m1|m2|m3|m4> <locked|progress|complete>` sets a mission's
  BACKTRACE state, `scratchbt` alone prints it, `scratchbt reset` clears
  it. Setting a mission `complete` also moves the next locked mission to
  `progress`, mirroring the real `AutoStart` chain.
- **[milestone] BACKTRACE `SaveStorage` wiring live-tested with
  `scratchbt`.** Progress → complete confirmed in-game, and the debug
  flow (including the next-mission cascade) reported fine afterwards. An
  App iframe can therefore read `SaveStorage`, unlike `Website`
  `metadata()` (`docs/bugs.md` #20). Not yet tested: the real quest
  lifecycle hooks — the installed build has `isDebug = true` in
  `src/guard/flags.ts`, which isolation-locks every quest. Known limit:
  a quest already started or finished before the hooks existed shows
  `locked` until it is re-claimed.
- **[docs] `docs/architecture.md` updated for `src/applications/`.** The
  layer list, the bootstrap import list and a new "Applications:
  BACKTRACE" section (the app's files, the `backtrace` state shape, who
  writes it, how the iframe reads it) now describe the app; the old "no
  `apps/` folder yet" note was replaced.
- **[docs] Changelog backfilled for 2026-09-21 to 2026-09-24.** The file
  had stopped at the first 09-21 entries. The missing entries were
  rebuilt from the commit history (`8d50a42` to `4b43554`), the saved
  session notes, `docs/bugs.md` and file modification times; 09-24 work
  that is still uncommitted is included.
- **[bug] BACKTRACE showed M1's old broker alias.** The mockup hardcoded
  `A7xDEFACE9` in ten places, but M1's broker has been `X7xS3NTRY9` since
  the 2026-09-22 rename. Fixed by the data-driven pass below, which
  removed every hardcoded story fact from the HTML; the current-state
  mentions in `docs/architecture.md` and `docs/story.md` were corrected
  too, and `docs/story.md` gained a 2026-09-22 decision-log note.
- **[mechanic] BACKTRACE reports are data-driven (Phase 2).** When a
  mission completes it snapshots its `facts` into the `backtrace` state
  (`src/applications/backtrace-facts.ts`, built from `content/m01.ts`,
  `content/m02.ts` and the per-save winning M1 listing, read before the
  quest's teardown clears it). The HTML binds findings, entity cards,
  evidence records, CASEBOARD nodes and the entity drawer to them with
  `data-fact`. M1's report now shows the per-save listing code, project
  and vault; M2's shows the developer URL and a payout-and-pattern
  finding. Values are inserted as text or escaped, and a state without
  facts renders "—". Checked in a browser with a stubbed SDK (with facts,
  without facts, and with HTML in the values); not yet tested in-game.

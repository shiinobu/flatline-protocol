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
`docs/mechanics.md` (tools/commands), `docs/rules.md` (process/structure
standards). Older entries keep the file names they were written with:
`mechanics-reference.md`, `implementation-rules.md` and `network-plan.md` are
now `mechanics.md`, `rules.md` and `network.md`. The Indonesian live-test
checklists they point to (§11 of the M2 and M3 playtests, §9-10 of M1's) were
removed from the playtests on 2026-10-01; those pointers are historical.

---

## 2026-10-02

- **[milestone] Phase 1 of the M4-M7 implementation run: the old M4 is migrated to mission id
  `m07` as a walking skeleton.** `content/m04.ts` and `main/m04.ts` are replaced by the pipeline
  shape M1-M3 use: `content/m07/*`, `i18n/m07/core.ts`, `controller/m07/*` and a thin
  `main/m07.ts`; `websites/m04/architect-c2/` moves to `websites/m07/` with its history. `M04_*`
  constants become `M07_*` except `M04_ARCHITECT_VPN_IP`, which the locked M2 and M3 import. Id
  `m04` is now free for the new M4. See `docs/network.md` (M7 topology),
  `docs/m07-playtest.md` (owner test script) and `docs/world-building/11-spec-m7.md`
  ("Catatan implementasi").
- **[mechanic] Six old-M4 defects fixed in the migration** (`11-spec-m7.md` §B #1-#4, #6, #11):
  the shell gate listens to `RemoteConnection.Established` with `t === "METASPLOIT"` instead of
  the reverse-TCP-only `Metasploit.Meterpreter.Connected` (#29); the C2 is taken over the live
  bluekeep RDP path (`FreeRDP 5.2.1`, one online user `svc-cms`) instead of a banner no module
  accepts; the Firewall sits inside the Splitter as a sibling of the devices, M2's live shape;
  `attrcheck` resolves its target through the Meterpreter-aware walk and its event is now
  `flatline.m07.attrcheckRevealed` (#30); `rootgrab` is out of the chain; and the firewall rules
  use the C2's `lanIp` as `destination` with the whole LAN re-addressed to `192.168.1.x` (#41,
  `docs/app-asar-reference.md` E-7, E-8).
- **[mechanic] `open` and `attrcheck` now share `findSessionFile`** in
  `src/commands/meterpreter-files.ts`; the expression moved verbatim out of `open.ts`, so its
  behaviour is unchanged.
- **[docs] Two new UNVERIFIED engine findings, each with a live probe shipped in the skeleton.**
  `docs/bugs.md` #45: whether a `Firewall` nested in a `Splitter` protects its sibling devices
  (`GetFirewall` matches on `parent === router.ip`; M2 ships the same shape and neither mission
  rests its progression on it). #46: whether a `{ realMs }` Scheduler job of tens of seconds
  survives a live Meterpreter session, `cancelKind` and `mods.reset`.
- **[mechanic] Mission ids m05-m07 registered across the global surfaces:** `guard/flags.ts`
  focus maps (all `false`), `BacktraceMissionId` and the initial BACKTRACE state, `BACKTRACE_KEYS`
  (empty for m5-m7), and the BACKTRACE app's sidebar and locked cards for M4-M7 with the working
  titles. `MISSION_TITLES` in `backtrace.html` is now the single source for a mission's name.

- **[docs] Implementation prompt for the cloud agent:
  `docs/world-building/12-implementation-prompt.md` (English).** One phase per run: 1 M7 walking
  skeleton, 2 M6 walking skeleton, 3 generic rival-hacker kit + M4 skeleton, 4 M7 full, 5 M4 full,
  6 M5 full, 7 M6 full, 8 wrap-up, each ending in an owner live test. The kit (3) precedes full M7
  (4) because M7 reuses it; the M6 zero-network skeleton (2) follows the M7 skeleton. The prompt
  restates the project context of the uncommitted `CLAUDE.md`, names `clouds-modify` as the base
  (`origin/main` was 18 commits behind), fixes the editing boundaries with a diff guard over the
  locked M1-M3 files, requires the `frontend-design` skill for every new website and visual
  surface within the engine limits (self-contained HTML, no `<form>`, `{{t:KEY}}` text, zero
  comments), uses SDK 0.25.0, points the agent to `docs/app-asar-reference.md` (engine facts) and
  `13-story-timeline.md` (dates), and pays rewards in money only. See
  `docs/world-building/README.md` ("Penyerahan implementasi").
- **[mechanic] SDK pinned to 0.25.0.** `package.json` and `package-lock.json` pin
  `@hotbunny/hackhub-content-sdk` to exactly 0.25.0 (it was 0.24.0 through `"latest"`; five lines
  changed, the rest of both files is byte-identical). 0.25.0 only adds `incognito` to
  `HttpRequest`, the `ModManifest.apiVersion` comment and the default `apiVersion` in `build.mjs`;
  `tsc` is clean on the unchanged sources. Run `npm ci` locally to pick it up. README #35.
- **[docs] `docs/app-asar-reference.md` added.** Twelve engine facts read from the 1.3.13
  `index.js` with verbatim excerpts and exact offsets (`registerDomain`, `subfinder`, `dirhunter`,
  `mods.reset`, quest `Rewards`, files without timestamps, `IsLocalIp`, firewall rules,
  `PFSense.Login`, iframe sandboxes, the bluekeep module, `geoip` and `nmap`), so a cloud agent
  without `.reverse/` can check them. `docs/bugs.md` #39-#44 record the findings.
- **[bug] The old M4 firewall rules could never match (found by reading the engine, `bugs.md`
  #41).** The engine compares a rule's `destination` with the target's `lanIp`, and the pfSense
  panel's Save rejects any destination that is not `192.168.1.x` (`IsLocalIp`). The old M4 used the
  C2's public IP and `172.16.0.x` LANs; M7 must use the C2's `lanIp` and `192.168.1.x`. The M4,
  M5 and M6 specs wrote "192.168.x.x"; corrected in `08`, `10` and `11` (new defect #11 in `11`
  §B) and in `docs/network.md`. Not changed in code yet.
- **[docs] Story timeline for file dates: `docs/world-building/13-story-timeline.md`.** Fixed dates
  read from the locked M1-M3 code and the specs, a proposed story day for M2-M7 (`06-pertanyaan.md`
  T-d), file date formats, the dated files of M4-M7, and four anomalies in locked content (the M1
  kernel `audit` epoch is in 2025, the kernel uptime counters, a preview sample date, the
  `story.md` premise). Files have no timestamps (`bugs.md` #43), so dates live in names and
  contents. README #36.
- **[docs] Mission rewards are money only (README #34).** The "200 xp" reward is removed from `02`,
  `10` §A and `11` §A; money is paid with `Bank.transaction`, `Rewards` stays unset, nothing is paid
  under dev or tester focus. The SDK `Bank` has no XP and `Quest.Rewards` did not pay in the
  rival-hacker lab (`bugs.md` #42).
- **[docs] World-building design for M1-M7 written in `docs/world-building/` (specs only,
  nothing in code).** Twelve files: README (decision log), `01-canon-dan-hook.md`,
  `02-peta-misi.md`, `03-karakter.md`, `04-web-layer.md`, `05-ending.md`,
  `06-pertanyaan.md`, `07-arsitektur-misi-baru.md` (rules and spec-sheet template for the
  new missions), `08-spec-m5-m6.md` and `09-konten-m5-m6.md` (spec sheets and final content
  for M5 and M6), `10-spec-m4.md` (M4) and `11-spec-m7.md` (M7). Decisions logged: the
  reverse-TCP / d.reyes callback idea (`docs/idea.md` section 2) is dropped; M1-M3 are locked
  with a hook budget of zero edits; three new missions (M4-M6) are planned and the
  finale (old M4) becomes M7; G in the LedgerVault `found_note.txt` is Greta de Souza, the
  hospital IT staffer (G1), dismissed and officially blamed, reached only through documents in
  M5 and a one-way epilogue letter after M7; the hospital decision-maker is Vivien Orchid, CRO
  of PacificCare, formerly at the fictional insurer Nordhaven Mutual; the Custodian stays
  blank; the Architect is renamed Conrad Lindqvist (59, an actuary who priced the risk he
  created); M5 and M6 sites are mission sites (Tier 1 baseline), M5 is Very Hard across page,
  crack and network layers (its Firewall has a single valid user because `PFSense.Login`
  carries only the IP and fires only on success), M6 is Very Hard with no network (verified in
  code only, tested first); M4 "Burn Notice" reuses the rival-hacker kit with scripted strikes
  and a four-router counter-trace, the Sentinel app is on hold; M7 fixes ten defects of the
  old M4 (RDP route instead of an unmatched banner, the proven Splitter shape, a fallible
  HoneyCheck, a real-time trace, the phone-call dialog replaced by a mail and a `choice` field,
  real ending effects, reward 5000); the hook budget is zero edits (audit of M4-M7 against
  the locked M1-M3 text) and the whois registrant of the M4 control host and the M6 insurer
  domain is aligned with M3's existing "Bulletproof VPN Ltd."; permanent browser tool sites
  wait for a `weblab` in
  `src/debug/`. No world-building decision is synced into `docs/story.md` until the lock.
  Implementation is planned for a cloud agent (its prompt is not written yet); the old M4
  must be migrated to M7 before the new M4 exists. `docs/idea.md` got an update note for its dropped section 2. See
  `docs/world-building/README.md`.

## 2026-10-01

- **[mechanic] `open` reads a Meterpreter target's files, so no step needs
  `download` any more (NOT yet live-tested).** M2's `shellCompanyFound` needs
  `wire_authorization.pdf`, which `cat` refuses and which the stock path API
  cannot reach at a `meterpreter >` prompt, so the only route was `download` then
  `open ~/downloads/<file>`. `src/commands/meterpreter-files.ts` tracks the
  session target from `RemoteConnection.Established` / `.Disconnected` (`t:
  "METASPLOIT"`) and `open` walks the path from the target's root file with the
  ID-based `Files` calls; a miss, a `~` path or no session falls back to the
  player's own PC, so the download route still counts. The event payload is
  unchanged, so no gate changed in M2 (`shellCompanyFound` stays on the chain; the
  report needs the company name from the PDF). Checked in a mocked-SDK harness (40
  checks, three broken copies fail as they should). See `docs/bugs.md` #30
  (follow-up), `docs/mechanics.md`, `docs/architecture.md`, `docs/m02-playtest.md`
  step 20.
- **[mechanic] M3 no longer reacts to `rootgrab`.** `gatewayRooted`, its
  `Metasploit.Rootgrab` handler and the `root` personal log are gone (the step was
  already off the chain). The log's second line (the shell company and the address
  off the map are the same hand) moved to the `vpnConfigRead` step as the third
  `tunnel` line; the first line (it duplicated the tunnel log and said "root") was
  dropped, en and zh. The tip mail, the objective and the report prose still say
  "root"; that is narrative, not a gate. M4's flat `main/m04.ts` still listens to
  `Rootgrab` and to a `Files.Transfer` download until its migration. See
  `docs/m03-playtest.md` step 22.
- **[milestone] The day's work is committed as five code commits and two docs
  commits.** In order: Phase 0 generic pipeline pieces (`6c8f9e7`), M2
  migration (`e01b7d1`), M3 migration (`d03a21a`), BACKTRACE card scroll
  (`00d1642`), mission websites gated by the active mission (`5053585`); then
  the doc renames and the doc sync. Each code commit typechecks on its own.
  Left out on purpose: the idea plan (`docs/idea.md`), the msflab guide, the
  rival-hacker prototype (`src/debug/rival-*` and its import in
  `src/debug/index.ts`), and the per-test dev-focus toggle in
  `src/guard/flags.ts`.
- **[docs] Three docs were renamed and their pointers fixed.**
  `implementation-rules.md` is now `rules.md`, `mechanics-reference.md` is
  `mechanics.md`, `network-plan.md` is `network.md`. Pointers in
  `architecture.md`, `bugs.md`, `story.md`, `rules.md` and this file's header
  follow; dated entries keep the names they were written with. `rules.md` §11
  gained the rule that a mission's sites are open only while it runs, and
  `story.md`'s live-test bullet records the 2026-10-01 M2 and M3 passes.
- **[mechanic] Mission websites are now open only while their mission is
  running.** After M3 completed, `skynet-importexport.biz` still opened in
  Firebear: the engine finds a mod `@RegisterWebsite` by host name alone, so
  `Network.removeDomain` and the destroyed router never reached it. Every
  mission site now goes through `gateMissionPages(mission, pages)`
  (`websites/global/page-guards.ts`) and answers the 404 page unless the
  mission is the active one (`flatline.activeMission`, written by the
  controllers: set in `OnObjectivesStart`, cleared in `OnComplete` /
  `OnAbandon`). Covers M1 (Blackwire, Frostgate, Obsidian, ClearEscrow,
  PacificCare; PacificCare's static page became a dynamic one), M2 TR4C3404, M3
  Skynet and M4's C2 dashboard. Left open on purpose: LedgerVault (permanent
  domain, its own seal) and BLACKLEDGER (static story page). Checked against a
  mocked SDK (95 checks, four negative controls) and typecheck; not yet
  live-tested. See `docs/architecture.md` (Website access).
- **[bug] M3 stalled at the gateway config: `rootgrab` had become a gate
  prerequisite.** In the live test the config read traced nothing, because the
  chain required `gatewayRooted` before `vpnConfigRead` and `rootgrab` had
  answered "Invalid passwd file" (it takes exactly one argument, `rootgrab
  /etc/passwd`, `docs/bugs.md` #26). `rootgrab` is optional again, as in the
  playtest: `vpnConfigRead` needs only `gatewayShellObtained`, `gatewayRooted`
  is an optional branch that adds the `root` personal log, and the early-report
  hint no longer says "root it". The gate table is code only, so a save in
  progress continues after a rebuild. See `docs/m03-playtest.md` §11.
- **[bug] BACKTRACE's in-progress card was cut off and could not be scrolled.**
  The card (TRACED SO FAR + PERSONAL LOG, up to 5 keys and 8 log lines in M3)
  lives in `.locked`, which had no overflow inside the `overflow:hidden` view, so
  the bottom was clipped on a short window. `.locked` now scrolls like the
  finished report (`overflow-y:auto`, scrollbar hidden), and the card centers
  with `margin:auto` when it fits. Checked in a browser against the real CSS
  with a 5-key, 8-line card at 640 px height: it scrolls to the bottom, a short
  card and M4's locked card stay centered, a ready report still hides `.locked`.
- **[milestone] M3 migrated to the mission pipeline and live-tested the same
  day (English; the Chinese texts were not played).** The 21:13-21:42 run
  reached `m3 -> complete` with all five BACKTRACE keys and every personal log
  in order (the Vault-Line shell came only after the ledger, as designed), and
  the gateway-config stall above was fixed afterwards. `main/m03.ts` is a thin
  class over
  `controller/m03/` (`recon`, `pivot`, `gateway`, `forwards`, `report`, `world`,
  `spec`); `content/m03.ts` became `content/m03/` (`state`, `gates`, `network`,
  `topology`, `ledger`, `database`, `fixtures`, `scan`, `server-files`, `twotter`,
  `mail`, `report`, `quest`, `intro`), the parent entity name moved to
  `content/global/entities.ts` (M4 and BACKTRACE import it there), and every
  player-facing text has an `en` + `zh` key (`i18n/m03/core.ts`, the Twotter
  personas in `i18n/m03/twotter.ts`, the Skynet page in `i18n/m03/site.ts`). The
  mission is a gated chain (`tipReviewed` -> `siteScouted` -> `portalReached` ->
  `natPivotDone` -> `ledgerDumped` -> `gatewayShellObtained` -> `vpnConfigRead` ->
  `reportSent`; `gatewayRooted` and `accompliceReached` stay optional): the
  ledger now comes before the gateway, the portal domain, the ledger domain and
  the gateway's `nslookup` / `nmap` / `hydra` fixtures appear only after the
  public site is scouted (`gatewayLead`), a rule the player saves before that
  stays inert, and the Vault-Line rule only gets its RDP banner after the ledger
  is dumped (the rule is never refused; it is banner-released on the dump or on
  the next save). The player-written forwards live in the quest data and are
  restored after a rebuild through `WorldSpec.restore`. M3 is not `Abandonable`;
  a correct report that comes too early gets a Custodian reply with a hint
  instead of silence. Same networks, fixtures, database, texts, mail, template and
  personas as before (compared against the previous commit over a mocked SDK);
  the only difference is the withheld Vault-Line banner. See
  `docs/m03-playtest.md` §11, `docs/scratch.md`.
- **[milestone] M2 migrated to the mission pipeline and live-tested the same
  day (English; the Chinese texts were not played).** The 19:26-19:53 run reached
  `m2 -> complete` with all seven BACKTRACE keys traced in gate order, the log
  held no error from the mod, and the owner confirmed the hidden-until-probe
  subdomains, the early-report reply, `nuclei`, the `mods.reset` replay and the
  teardown. `main/m02.ts` is a thin class over
  `controller/m02/` (`recon`, `devbox`, `home`, `report`, `world`, `spec`);
  `content/m02.ts` became `content/m02/` (`state`, `gates`, `network`, `topology`,
  `database`, `fixtures`, `scan`, `server-files`, `mail`, `report`, `quest`,
  `intro`), the shell company name moved to `content/global/entities.ts`, and
  every player-facing text has an `en` + `zh` key (`i18n/m02/core.ts`, the two
  tr4c3404 pages in `i18n/m02/site.ts`). The mission is now a gated chain
  (`tipReviewed` -> `rootProbed` -> `subdomainsEnumerated` -> `adminsDumped` /
  `affiliatesDumped` -> `devboxAccessed` -> `deployLogRead` / `homeLeadRead` ->
  `firewallLoggedIn` -> `firewallBreached` -> `workstationRooted` ->
  `shellCompanyFound` -> `reportSent`): the 40 subdomains and the devbox `nmap`
  appear only after the root probe, the home RDP opens at the breach, the
  report needs the dumped panel, the deploy log and the pdf, and an early
  correct report gets a Custodian reply with a hint. BACKTRACE keys trace from
  the gate step. M2 is not `Abandonable` (only M1 is). The subdomain build order
  is now the label order instead of `Math.random`; the 3306 `removePort` /
  `addPort` reconcile is gone. Same networks, fixtures, databases, texts, mail
  and template as before (compared against the previous commit over a mocked
  SDK); the new chain was fuzzed over 300 random event orders. See
  `docs/m02-playtest.md` §11, `docs/scratch.md`.
- **[milestone] Phase 0 of the M2/M3 migration: generic pipeline additions, M1
  unchanged.** `core/types.ts` gained `splitter` / `printer` device kinds,
  `name` and `vulnerabilities` on `DeviceSpec` (set with
  `Network.setVulnerabilities` right after the build), `vulnerabilities` on
  `DomainSpec`, `WorldSpec.databases` (new `components/database.ts`, applied after
  a build and removed after the awaited teardown) and `WorldSpec.restore`
  (carried through the rebuild job's payload), and gates typed on boolean flags
  (`FlagKey`). The site-string cache moved from `context/m01/site-strings.ts` to
  `context/global/site-strings.ts` (`SharedVariables`, key `flatline.siteStrings`,
  fed by the union in `i18n/global/site-keys.ts`). Typecheck clean; against a
  mocked SDK the previous commit and the new tree record the same 966 calls for
  `M01_WORLD` in 5 scenarios (a removed unlock is detected), and 25 checks cover
  the new paths. Not played in the game yet. See `docs/architecture.md`,
  `docs/scratch.md` (M2/M3 migration notes).
- **[milestone] M1 FINAL LOCK; the pipeline is ready for M2-M4.** Live test
  2026-10-01 passed (network, mail, listing, jump-step gating). Investigation
  `trace()` calls were removed from `core/`, `middleware/`, `context/m01/` and
  the M1 websites; the "why" notes live in `docs/bugs.md` #35-#38. The `state/`
  folder is now `context/`. See `docs/architecture.md`,
  `docs/implementation-rules.md` §11.
- **[mechanic] M1 step order is enforced end to end.** `content/m01/gates.ts`
  is a 13-step transitive chain and every listener goes through
  `middleware/advanceStep`; the broker domains (`x7xsentry9.tech`, `be7.`,
  `fw7.`) are registered only on the `brokerLead` unlock; the LedgerVault page
  is a 404 until the IRC step; a correct report sent too early gets a short
  "not yet" reply from the Custodian (one mail, replaced, with a hint for the
  first missing stage). BACKTRACE's M1 report now shows the Personal Log. See
  `docs/bugs.md` #38, `docs/m01-playtest.md` §10.
- **[bug] Mod mails piled up after `mods.reset`.** `mods.reset` does not remove
  mail sent with `Mail.send`, and `Mail.getInbox().subject` is blank for it, so
  matching by subject never worked. `onStartM01` now withdraws everything from
  the mod's sender addresses; the early-report reply is tracked by id. See
  `docs/bugs.md` #37.
- **[bug] The listing winner flipped and pages disagreed with the quest.** A
  website render runs with no mod context, so its own roll went to a different
  namespace. The roll now happens in mod context, is mirrored to
  `SharedVariables`, and renders only read it. See `docs/bugs.md` #36.
- **[bug] `be7`/`fw7` appeared and vanished after `mods.reset`.** Concurrent
  `destroyNetwork` calls overwrite each other; M1 rebuilds through a sequential
  awaited job (`core/rebuild.ts`). Follow-up to #32; see `docs/bugs.md` #35.
- **[docs] `helpers/network.ts` folded into `components/topology.ts`.** M2-M4
  import `networksExist` / `resetMissionNetworks` from there until they are
  migrated.

- **[mechanic] `src/` restructure phase B: M01 migrated to the mission
  pipeline, behavior unchanged.** `main/m01.ts` (1053 lines) is now a thin
  quest class that delegates to `controller/m01/` (`index`, `spec`, `report`,
  `irc`, and the listeners grouped as `recon`, `breach`, `access`, `vault`).
  Generic, mission-blind code is new: `core/` (`register`, `unregister`,
  `unlock`, `seed`, `types`), `components/` (`topology`, `domains`,
  `fixtures`, `persona`, `report`) and `middleware/gate.ts` (`canAdvance`,
  `reachedUnlocks`); M01's world, intro and gate tables are data in
  `content/m01/` (`world`, `intro`, `gates`, `topology`, `fixtures`, `state`).
  `content/m01.ts` (440 lines) was split by line range into
  `content/m01/*` (zero lines lost, same 149 exports plus 4 helper
  constants), the ten M01 i18n files moved to `i18n/m01/` without the `m01-`
  prefix, `characters`, `finance` and `blackledger` moved to
  `content/global/` with the new `content/global/case.ts` (`M01_CASE_ID`), and
  `websites/shared/` became `websites/global/`. Import paths changed in M02/M03
  content, `main/m02.ts`, `backtrace-facts.ts`, the websites and the four
  `.original.ts` backups; none of their logic changed. Verification:
  `tsc --noEmit` clean at every step, and the HEAD version of M01 and the new
  one were run against a mocked SDK and compared call by call over 17 scenarios
  (fields, `OnStart`, four `OnObjectivesStart` variants, a 12-step event
  walkthrough including the gates and both report paths, `OnComplete`,
  `OnAbandon`): identical. Not live-tested in HackHub yet. Open items: the
  data/state split of `listing-pool.ts` and `site-strings-cache.ts`, the 100-line
  `renderM01ListingPage` (pre-existing), M02-M04, and docs sync for
  `implementation-rules.md`. See `docs/architecture.md` ("Mission pipeline").
- **[mechanic] `src/` restructure phase B follow-up: M01 data made pure,
  state split out, `index.ts` reduced to `main/` + `debug/`.**
  `content/m01/topology.ts` is now plain data (`RouterSpec`/`DeviceSpec` in
  `core/types.ts`; `components/topology` calls `Network.createUser` and maps
  the kinds to `NetworkDeviceType`). `listing-pool.ts` was split into the data
  file (slots, categories, regions, types) and the new `context/m01/listing.ts`
  (resolution, getters, `buildM01HomeSoldLots`); `site-strings-cache.ts` became
  `i18n/m01/site-keys.ts` (key list) plus `context/m01/site-strings.ts`
  (`refreshM01SiteStrings`, `siteT`); `M01_WORLD` moved to
  `controller/m01/world.ts`; the 100-line `renderM01ListingPage` moved to
  `websites/m01/listing-page.ts` and is split into section renderers. The
  mocked-SDK comparison against HEAD was re-run (network definitions now
  compared with sorted keys): 17 scenarios identical, and the HTML of all 18
  listing pages is byte-identical. The four `.gitkeep` files were removed.
  `src/index.ts` now imports only `main/index.ts` and `debug/index.ts`;
  `main/global.ts` imports BACKTRACE and the commands, each `main/mNN.ts`
  imports its own websites, and a reachability check shows every file that
  registers something is still reachable (registration order changed: debug
  now loads after the missions). Not live-tested; the checklist is at the
  bottom of `docs/m01-playtest.md`. Deferred on purpose: M02-M04 migration
  (after the M01 live test), folding `helpers/network.ts` into
  `components/topology.ts`, and the full rewrite of
  `docs/implementation-rules.md`.
- **[bug] Debug tooling no longer leaks outside `isDebug`.** `src/debug/`
  registered its commands (`msflab`, `repel`, `rivallab`, `sysdiag`,
  `sysrepair`), the `RivalHackerStrike` side quest, Scheduler handlers and
  event listeners unconditionally, so a build with `isDebug = false` still
  shipped them. New `src/debug/debug-gate.ts` (`registerDebugCommand`,
  `registerDebugQuest`) leaves a class unregistered when `isDebug` is off, and
  every top-level `Scheduler.register`/`Events.on` in `msf-lab`, `rival-banner`,
  `rival-breach` and `rival-hacker-lab` sits behind `if (isDebug)`
  (`quiet-start` already was). Typecheck only; not yet confirmed in-game with
  `isDebug = false`. Still ungated, left on purpose: `scratchbt` in
  `src/applications/backtrace-debug.ts`.
- **[docs] `src/` restructure started: phase A, `main/` quest files renamed.**
  `src/main/mNN-quest.ts` and `mNN-quest.original.ts` are now `mNN.ts` and
  `mNN.original.ts` (8 files, plain file moves, no content change); the four
  imports in `src/index.ts` follow. Each quest's `Name` (`flatline.mNN`) is
  untouched, so saves are unaffected. Naming rule recorded in
  `docs/architecture.md`: inside a per-mission subfolder the file name drops the
  `mNN-` prefix, and a module used by two or more missions stays in its layer
  folder without a subfolder. Other docs kept the old file names until
  the phase B docs sync; earlier changelog and bug entries keep them as history.

## 2026-09-29

- **[bug] `msflab` banners fixed, traces added, live-test guide written.** The
  lab wrote every port's `version` as `1.0.0`, but the client splits `version`
  at its last space into a service name and a version and compares the name
  with the module's service, so all ten targets would have answered "Port N
  could not be accessed". Banners are now `<Service> 1.0.0` and the port's
  `service` field carries the protocol. `src/debug/msf-lab.ts` now logs
  `[FP][MSFLAB]` lines (use, set, search, nmap, each attempt with the port row
  the engine saw, success, session), plus one line at load, one per `msflab`
  run and, with `isDebug`, one per terminal command. Telnet's internal port 23
  is confirmed from the client. The lab now uses fixed IPs in the M1 router
  shape (router `198.18.0.1`, hosts `198.18.0.2`–`.11`, LAN
  `192.168.1.2`–`.11`); this supersedes the random router address in the entry
  below. The first live attempt failed for two reasons that were not the
  addresses: the guide wrote `nmap -sV <ip>`, but the client reads the first
  argument as the IP and answers `Usage: nmap [ip address]` (the form is
  `nmap <ip> -sV`), and `msflab up` had never been run. The guide was rewritten
  to lead with the custom command. Not yet run in game — see
  docs/msflab-livetest-guide.md.
- **[bug] #32 fix extended to M1, M2 and M4.** Their quest data gained
  `networkBuilt`, and `OnObjectivesStart` builds the network (the
  `resetMissionNetworks` destroy included) only when the flag is false or an
  anchor router is missing, so a restart or a dev reload keeps the persisted
  network. New `missionNetworksExist` helper in `src/helpers/network.ts`; M1's
  `registerM01Network` split into `registerM01Routers` and `registerM01Domains`.
  Seven commented-out `destroyNetwork` lines removed from `m01-quest.ts` and
  `m02-quest.ts`. Typechecked, not live-tested — see docs/bugs.md #32.
- **[mechanic] BACKTRACE reports: Personal Log now sits under Evidence.** In
  the M2 and M3 reports the Personal Log section moved from the left column
  to the right column, directly below the Evidence card (a markup move in
  `src/applications/backtrace.html`; the M1 report has no Personal Log).
  Requested in the M3 round-3 review. The Shell Company card keeps reading
  `m2.shellCompany` on purpose: missions are played in order, so a blank
  there in an isolated M3 test is a test artifact, not a bug.
- **[milestone] M3 round 3 live-tested (2026-09-29, 22:18–22:37).** All five
  keys traced in order (`portal`, `parentEntity`, `gateway`, `vpnPeer`,
  `accomplice`), both `[FP][M03] remote connection` lines appeared
  (METASPLOIT → 79.124.62.90, SSH → 62.210.183.77) and the report completed
  (`m3 -> complete`). R1–R4, R6 and R7 were ticked as passed; **R5 (the Reyes
  personal log via `cat`/`open`) was skipped, not tested**: the note was read
  after the mission had completed, when `teardown()` had already destroyed
  the network ("File not found."). See `docs/m03-livetest-guide.md`.
- **[docs] Bug statuses #31–#34 moved to live-tested; guide updated.**
  `docs/bugs.md` #31 (portal via `Network.PortChanges`), #32 (round 2: a
  restart and a reload keep the network), #33 (`accomplice` via SSH; its
  Reyes-log half stays untested) and #34 (the report completes on ledger +
  config, `cat` works at `meterpreter >`) no longer say "not yet
  live-tested". The guide marks R5 `[-]` (skipped) and warns to send the
  report last, because completing the mission tears the M3 network down.
- **[refactor] `src/debug/scratch.ts` retired; `scratchbt` moved to
  `src/applications/backtrace-debug.ts`.** Three of its four tools were
  dead: `scratchloc` (bug #22's investigation is RESOLVED and already
  written up in `docs/bugs.md`), `scratchimg` and the `scratch-viewer`
  website (one-off tests never referenced again). Only `scratchbt` was
  still live-test tooling, so it moved next to
  `backtrace.ts`/`backtrace-state.ts`/`backtrace-facts.ts` instead of
  disappearing with the rest of the file; its command name and behavior
  are unchanged.
- **[mechanic] `msflab` debug command added (`src/debug/msf-lab.ts`).**
  Stands up one sandbox host per base-game Metasploit module (telnet,
  MariaDB, vsftpd, OpenSSH, RDP, SMTP, Nginx, Apache, POP3, IMAP) with the
  port/service/version banner and online `guest` user each module's own
  gating needs, so every module can be live-tested against a known-good
  target instead of inferred from the decompiled client alone. `msflab up`
  builds it and prints the RHOST/RPORT/Version cheat sheet, `msflab` alone
  reprints it, `msflab down` tears it down; the router address is random
  and saved per-save, so it never collides with a mission's own network.
- **[mechanic] BACKTRACE: one action = one key finding.** The old tracing
  wrote several facts from a single action (M2's `affiliates` dump traced 5,
  M3's ledger dump 4) and the mission card listed every fact as a row. The
  model is now split: a **key** is one important finding earned by exactly
  one provable action and is the only thing the "TRACED SO FAR // x OF N"
  panel shows (title + value, no description); every other fact is an
  **extra** that only exists in the full snapshot written at COMPLETE, where
  it is composed into the report's Key Findings — which may outnumber the
  keys because they are the chain of events. Keys: M1 4 (`broker`, `buyer`,
  `vault`, `caseId`), M2 7 (`developer`, `ransom`, `deployLog`, `homeLead`,
  `firewall`, `workstation`, `shellCompany`), M3 6 (`portal`, `parentEntity`,
  `architectVpn`, `gateway`, `vpnPeer`, `accomplice`). `traceBacktraceFacts(mission,
  keys[])` is replaced by the typed single-key `traceBacktraceFinding(mission,
  key)` (a non-key is rejected at compile time and at runtime); carried facts
  (`buyer` in M2, `caseId` in M2/M3, `shellCompany` in M3) are no longer keys.
  M1 gained the Q3 folder as a checkpoint (LedgerVault reports the click to
  the quest through `Website.Exports` + `Events.emit`), which merges `caseId`
  and `project` into one finding; M3 gained a report view (Key Findings
  8, Entities, Personal Log, EV-M3-01 now reachable) and M1/M2's Key Findings
  were rewritten (M1 5, M2 9). See `docs/architecture.md` (Applications:
  BACKTRACE) and `docs/implementation-rules.md` §13.
- **[mechanic] One money model for M2 and M3 (`src/content/finance.ts`).**
  M3's ledger showed a single $42,000 row while M2's ransom was $2,850,000.
  Root cause: both were $42,000 in the pre-redesign missions; M2 was rebuilt
  on 2026-09-25 (commit `f255b8e`) and M3's constant kept the old value, and a
  2026-09-28 patch (`8bbdc8e`, "this is one line item, not the whole batch")
  papered over it. Three ransom batches (LOG-EU-2209 $1.4M on 2026-05-02,
  FIN-NA-0091 $4.1M on 2026-07-22 — moved from 2026-02-19 so it really falls
  in the "Q3" that `quota_report` and the M2 report claim — and CASE-A7X-0417
  $2.85M on 2026-08-14) share one waterfall: 60% SKN Capital Nominees
  (management fee, the Architect's cut), 25% TR4C3404 Consulting (consulting
  fees, the panel's share), 5% X7xSentry9 Brokerage (the M1 broker, paid a
  share of the ransom), 10% retained by Skynet. Total $8,350,000, $5,010,000
  to the parent. M2 shows gross and the panel's share (`affiliates` gained
  `batchRef`, `panelShare`, `status`; `deploy.log` and `wire_authorization.pdf`
  carry the amount, batch and value date); M3 shows the whole waterfall
  (`wire_transfers` is now 12 rows with a running balance ending at the
  retained $835,000, the Reyes spreadsheet is a Q3 reconciliation
  `q3_reconciliation.xlsx` — it was misnamed `q1_` — the tip mail names the
  $2,850,000, and the report gained "Funds" lines). Every number is computed
  from the one batch table, so M2, M3 and BACKTRACE cannot disagree again.
- **[mechanic] M3: `open` replaces the download step; formats changed.**
  The VPN config is `site_to_site_backup.conf` and the capture
  `finance_vlan_capture.pcap`; reading them with the `open` command (any
  extension; `cat` only handles `.txt`/`.log`) is what counts
  (`OPEN_FILE_READ_EVENT`, the M2 pattern), so the `Files.Transfer` handler
  and the `vpnConfigPulled` flag are gone (`vpnConfigRead`, `captureRead`
  instead). Starting Wireshark now only creates the file; the tunnel
  endpoint is traced when the capture is opened. The capture log names the
  public IPs of the DB server and the gateway (a LAN IP alone is a dead end,
  `bugs.md` #27).
- **[bug] M3 hydra username was undiscoverable (`bugs.md` #25).** The engine
  defaults `-l` to `guest` and a missed fixture only says "Could not connect
  to the server."; the fixture is now registered under `guest` and `admin`
  and the dead bare-IP fixture is dropped.
- **[bug] M3 `rootgrab` could never fire (`bugs.md` #26).** Vault-Line had no
  `root` user; it now has one. The command is `rootgrab /etc/passwd`.
- **[bug] "Shell obtained" never fired for a plain Metasploit exploit
  (`bugs.md` #29).** `Metasploit.Meterpreter.Connected` is raised only by the
  reverse-TCP listener; the `exploit` flow raises `Metasploit.Event` and
  `RemoteConnection.Established`. M3's shell flag and its `gateway` finding,
  and M2's new `workstation` finding, now listen for
  `RemoteConnection.Established` (`t === "METASPLOIT"`). M4's
  `initialShellAccess` has the same latent problem and was deliberately left
  unchanged (untested, out of scope).
- **[docs] Recon and tool facts recorded (`bugs.md` #27, #28):** nmap and
  Metasploit take public IPs only, Splitter children are found with
  `python3 net_tree.py`, and Wireshark is an App. Also corrected: M2's
  Metasploit/`openPort` through Router→Splitter→Device was already proven
  live, so the "two levels unproven" notes for M3 were stale.
- **[docs] Stale docs synced.** `architecture.md` still said M2's
  `shellCompany` traced on `Files.Transfer` and that M3/M4 had no facts;
  `m02-playtest.md` still said `download`; the M3 playtest had the wrong
  `wireshark`/`run`/default-user details. All updated together with
  `implementation-rules.md`, `mechanics-reference.md`, `story.md`,
  `network-plan.md`, `scratch.md` and the three playtests.
- **[bug] M3 personal log typo.** The `ledger` log rendered "Co.. SKN"
  (double period from `${name}.`); the line now carries the money instead.
- **[milestone] Verification state.** `npx tsc -p tsconfig.json --noEmit`
  passes clean (exit 0) on the whole change set — it could not be run earlier
  in the session (the shell was blocked by auto mode) and was run once the
  shell was available again, after all code edits. No build was run and
  nothing was live-tested; every new checkpoint (the LedgerVault folder
  export, `RemoteConnection.Established`, the Wireshark-started capture file)
  is still an unplayed assumption.
- **[docs] `open` cannot read a Meterpreter target (`bugs.md` #30).** Checked
  against the client after the code was written: custom commands see a remote
  file system only over SSH (`isRemote` = `ssh_ip`), and a relative path
  resolves from the home folder, not the cwd. The M2/M3 route is Meterpreter
  `download` (copies land in `~/downloads`) and then `open ~/downloads/<file>`;
  the quests already match on `{ name, extension }`, so no code changed. The
  playtests, `mechanics-reference.md` and `scratch.md` were corrected. Open
  proposal: make `open` cwd-aware with `Files.resolvePath`.
- **[bug] M3's NAT pivot could never fire — the gateway is a TP-Link router,
  not a pfSense (`bugs.md` #31).** A live-test screenshot of the admin panel
  showed the TP-Link "Router Administration" page with five pre-filled
  forwarding rules. Checked against the client: a `Router` node renders that
  page, which raises `Network.PortChanges` on Save and **no event on login**;
  `PFSense.Login`/`PFSense.Changes` come only from the pfSense page of a
  `Firewall` node (M1/M2, where they were live-proven). M3 listened to the
  wrong events, so `portal`, `natPivotDone` and the VLAN ports never happened.
- **[mechanic] M3 pivot redesigned: the player writes the forwarding rules
  (Option B).** The Port Forwarding table is the router's real port table, so
  it cannot be hidden; it now starts with only the locked port-80 rule and the
  four VLAN devices ship with no ports. `Network.PortChanges` on the gateway:
  the first Save traces `portal`; each saved rule that matches a host and
  service in `M03_FORWARD_TARGETS` is completed with its service banner
  (`removePort` + `addPort`, `syncM03Forwards` in `m03-quest.ts`) so sqlmap,
  Metasploit and nmap accept it; an active match is the pivot; the matches
  persist in `forwards` and are re-applied on start; the revert now means "no
  active rule of yours left" instead of "any later Save". The hint precedes the
  gate: the tip mail, the public site's Staff Access block and its `lynx`
  fixture name each host with its service and port, and `python3 net_tree.py`
  gives names and LAN IPs. Quest data: `pfsenseLoggedIn`/`pfsenseChangeCount`
  replaced by `portalReached`/`forwards` (abandon or `mods.reset` an old M3
  save).
- **[milestone] Verification state (M3 pivot).** `npx tsc -p tsconfig.json
  --noEmit` clean (exit 0), no build run, nothing played. Open assumptions:
  `Network.PortChanges` reaching a quest-scoped listener, and the rewrite
  surviving the panel's stale form state.
- **[docs] `docs/m03-livetest-guide.md` added.** A short Indonesian live-test
  guide for M3: the story, the network map with public vs LAN IPs, the six-stage
  flow, how to trigger and check each BACKTRACE key (with the log line to look
  for) and a prioritised bug/risk table to try on purpose. Complements
  `m03-playtest.md`; disposable like the playtests.
- **[milestone] M3 live-tested up to the VPN config (2026-09-29, log-confirmed).**
  The router rework was played from the recon through `vpnPeer`: `portal`,
  `architectVpn`, `parentEntity`, `gateway` and `vpnPeer` traced in the log, with
  the capture, ledger and root personal logs. Verified live: `Network.PortChanges`
  reaching the quest, the banner surviving a second Save, `open` on the `.pcap`
  and the `.conf`, the plain `exploit` raising `RemoteConnection.Established`,
  `rootgrab` with a root user, hydra without `-l`, and the rejected out-of-order
  attempts. The project owner's review of that run (first written into the
  guide's section 8, since replaced by the retest steps) found the three
  problems below.
- **[bug] M3's network vanished on every restart (`bugs.md` #32).** A start-time
  `destroyNetwork` runs in a worker on a snapshot and overwrites the whole
  network list when it finishes, so the network built a moment earlier — and the
  player's rules — were lost on every restart and every dev reload. M3 now
  builds the VLAN only once (`networkBuilt` in the quest data, plus a check that
  the subnet still exists); `forwards` remains the fallback for a rebuilt
  network. M1, M2 and M4 still call `resetMissionNetworks` on every start and
  have the same problem.
- **[mechanic] M3's report no longer requires the rules to be removed.** A
  design call by the project owner (the rules are the player's freedom): `natReverted`
  and `isVlanExposed` are gone, the report waits only for the capture, the ledger
  and the config, the tip mail now says the rule is "yours to keep or remove",
  and the objective text no longer says "cover your tracks".
- **[mechanic] Faded-Ledger is reached over SSH (`bugs.md` #33).** The guide's
  O14 showed that a successful SSH login did not clear the bonus key:
  `Terminal.Explorer` is raised only by Meterpreter and `evil-rm`. `accomplice`
  is now traced on `RemoteConnection.Established` with `t === "SSH"` to
  Faded-Ledger; `M03_FORWARD_TARGETS` gained `22 ssh` for it; the Reyes personal
  log fires on `cat`/`open` of her note instead of at login; the Staff Access
  notice, the site page and the `helpdesk_resets` note were reworded to match.
  Data: `reyesShareSeen` became `accompliceReached`.
- **[docs] `docs/m03-livetest-guide.md` rewritten for the retest.** The review
  section, the ticked bug table and the DB-manager remarks are gone; it now has
  the fresh-start steps, the three new checks (restart, report with the rules
  left in place, Faded-Ledger over SSH) and a short list of what is parked.
  `m03-playtest.md`, `bugs.md`, `story.md`, `network-plan.md`, `architecture.md`
  and `mechanics-reference.md` were synced.
- **[milestone] Verification state (round 2).** `npx tsc -p tsconfig.json
  --noEmit` clean, no build run by the assistant, the three changes above are
  unplayed.
- **[milestone] Retest of round 2 (2026-09-29, 20:02–20:26, log-confirmed).**
  Restart and dev reload kept the network and the rules (`bugs.md` #32 works),
  the new texts were live, BACKTRACE was clean. Not passed: the report never
  completed and the SSH login to Faded-Ledger traced no key.
- **[bug] M3's report was refused in silence (`bugs.md` #34).** The log shows the
  ledger dumped and the config read, but no capture: the third report gate needed
  `Wireshark.Started`, and gates print nothing. The Wireshark step (judged weird
  in play) is removed with its `.pcap`, the payroll decoy and the `architectVpn`
  key (now a snapshot extra; M3 has 5 keys). The ledger domain moved into the
  Staff access notice, the personal log that fired on the capture (`tunnel`) fires
  on the config read, M4's tip mail names the gateway config as the source, and
  the report needs only the ledger and the config.
- **[mechanic] No `download` in M3.** The gateway config is
  `site_to_site_backup.txt` (was `.conf`), read with `cat` at the session's root;
  `Terminal.Cat` traces `vpnPeer`. Unconfirmed: that `cat` is offered at the
  `meterpreter >` prompt.
- **[bug] `open` printed one paragraph.** `open` gave the whole file to one
  `println` of a string, which collapses newlines; it now prints line by line
  (`bugs.md` #34).
- **[docs] `CLAUDE.md` added** at the project root: an honest project context
  (a game mod, fictional data, design-level work). A `trace()` was added to the
  `RemoteConnection.Established` handler to explain the silent SSH login.
- **[milestone] Verification state (round 3).** `npx tsc -p tsconfig.json
  --noEmit` clean, no build run by the assistant, round 3 is unplayed.

## 2026-09-28

- **[mechanic] M3 "Money Trail" — pass 2, after the first live-test
  (branch `clouds-modify`, not yet re-tested).** Three live-test bugs
  fixed: (A) `bettercap` removed — it is a Wi-Fi tool (WifiRecon/DeAuth),
  wrong for a wired pivot; the capture gates on `Wireshark.Started` +
  pivot only. (B) the finance VLAN was reachable by `sqlmap` before the
  pivot — every internal port now ships `active:false` and is opened only
  by the NAT-pivot `PFSense.Changes` (the `Network.openPort`-after-breach
  mechanism M1 uses), reconciled on restart. (C) the VLAN was re-addressed
  `10.50.1.x` → `192.168.1.x` because the pfSense port-forward panel's
  `IsLocalIp()` rejects anything else. New depth: a real Metasploit chain
  against a hardened tunnel gateway `Vault-Line` (RDP `FreeRDP 7.1.9` RCE,
  the recipe M2 live-confirmed) → Meterpreter → Rootgrab → download
  `site_to_site_backup` whose config ties the recurring VPN IP to SKN
  Capital Nominees; a multi-step OSINT password deduction (format from
  Reyes, short-name + policy-year from the site); a real `@m.okafor`
  red-herring Twotter persona; and DatabaseManager (`Database.Connected`)
  as an alternative to `sqlmap`. Objectives collapsed to a single
  `reportFindings`, matching M1/M2. Cross-mission constants preserved.
  11 SDK-behavior assumptions listed in `docs/scratch.md`. **Abandon /
  `mods.reset` M3 before testing — objective IDs changed again.**
- **[mechanic] M3 "Money Trail" redesigned (branch `clouds-modify`, not
  live-tested).** Closes the 2026-09-23 audit's M3 findings. **M3→M4:** the
  `wireshark` capture (gated behind the NAT pivot *and* a new `bettercap`
  step) now writes `~/finance_vlan_capture.log` naming
  `M04_ARCHITECT_VPN_IP`, traces a new `architectVpn` BACKTRACE fact, and
  the report requires that IP as a third field, so M4's opening tip now
  describes evidence the player actually gathered. **d.reyes's SMB
  creds** leak from a new `helpdesk_resets` table in the same `sqlmap`
  dump. Deeper chain: remote-portal `nslookup` lead to the gateway, a D.
  Reyes Twotter persona and personal note, three decoys (`@m.okafor`, the
  `Split-Bill` host, and a PayStream payroll IP ruled out by `geoip`).
  Objectives 12 → 3 milestones. See `docs/scratch.md` (last section).
- **[bug] Two pre-existing M3 blockers fixed.** Coin-Drift had no domain,
  so `sqlmap` (which resolves targets by domain only) could never reach
  the ledger; it now carries `ledger.skynet-importexport.biz`. The pfSense
  gateway exposed only 443, but the browser opens admin panels only on
  internal port 80. VLAN moved to fresh addresses (`bugs.md` #21) and to
  M2's proven public-`ip` + `lanIp` shape. 10 SDK-behavior assumptions and
  2 open doc conflicts are listed in `docs/scratch.md` for verification
  against the client before merge.
- **[bug] M1-M4 network state silently survived `mods.reset` and rebuilds
  forever.** `Network.createSubnetNetwork()` is "create, not replace" per
  the SDK's own docs — an address that already holds a network is left
  alone, so a firewall rule removed / port opened once (M1 SSH, M2 RDP,
  M3 pfSense, M4 VPN) stayed open across every future reset or rebuild,
  letting a player skip the firewall-breach step entirely. Fixed with a
  shared `resetMissionNetworks(ips)` helper (`src/helpers/network.ts`)
  called per-mission with only that mission's own router IP(s) — not one
  global "destroy everything" call, which would have destroyed M01's
  permanent LedgerVault domain. Full root-cause writeup and the
  `if (isDev)`-gated dead code this replaced: `docs/scratch.md`. Dev
  focus (`flags.ts`) moved from `m02` to `m03` to start M3's first-ever
  live-test. Not yet live-tested.
- **[mechanic] BLACKLEDGER (the story's RaaS syndicate) is now a real,
  findable presence, not just a name in one M1 notice.** New static
  `Website` at `blkledger.dark` (`src/websites/m02/blkledger/`) lists 3
  "claims" (Northstar Port Authority 2020, Rheinland Energie AG 2023,
  PacificCare Health 2026), discoverable via a new line in M2's
  `deploy.log`. M1's LedgerVault `Q1`/`Q2` evidence folders — previously
  unnamed and both incorrectly dated 2026 — now correctly show Northstar/
  Rheinland with real 2020/2023 dates, matching the site. Explicit
  "chain of roles" lines naming BLACKLEDGER added to all three mission
  reports (M1/M2/M3, template + freehand forms kept in sync); M3's
  ledger note now references `CASE-A7X-0417` and a date, tying M3 back to
  M1. `A7xCodeFace` (M2's toolkit-dev persona) renamed to `TR4C3404` to
  match M1's established buyer alias. Full gap analysis and connection
  tables: `docs/scratch.md`.
- **[mechanic] BACKTRACE personal-log entries added for M1 and M3;
  M3 gained backtrace facts for the first time.** M1 had zero personal-log
  entries before this; new localized (EN/ZH) reflections now fire on
  finding the listing and on visiting LedgerVault. M3 had zero backtrace
  presence at all (no facts, no logs); it now traces `shellCompany`/
  `parentEntity`/`amount`/`caseId` and logs two reflections, on the ledger
  dump and on report-sent — all wired through event handlers that already
  existed for other objectives, no new SDK subscriptions. M2's existing
  aftermath log line now names BLACKLEDGER explicitly. `backtrace.html`
  gained an `m3` entry in `FACT_LABELS` (previously only m1/m2, so M3's
  traced facts had nowhere to render) and now keeps showing traced facts/
  personal-log entries after a mission completes, not just while it's in
  progress (previously they vanished the instant `complete` was reached,
  for any mission without a bespoke "report ready" view — still true for
  M4). A full bespoke "report ready" screen for M3 (matching M1/M2's) is
  still not built; this only stops the already-traced data from being
  thrown away.
- **[docs] Reviewed.** Independent code-reviewer pass across this session's
  full diff (21 files): APPROVE, 0 CRITICAL/HIGH, 3 MEDIUM (LedgerVault
  search `data-name` still pointed at the old year, an aftermath-log write
  ordered after the objective that could complete the mission first, and
  the `backtrace.html` gap above) — all three fixed same-day.
- **[docs] Story/mechanic verification audit (M1-M3): the prior entry's
  "all 6 gaps fixed" claim was only partly true.** Re-checked every
  M1→M2→M3 connection, the BACKTRACE↔mission wiring, and the BLACKLEDGER
  identity against current source, not the prior session's own summary.
  Confirmed real: the `TR4C3404` rename, the `BLACKLEDGER` echo in M2/M3
  reports/logs, and M3's tie back to `M01_CASE_ID`. Confirmed still open
  at the time: the "second signer" thread from M2's report was never
  bridged in M3, the $42,000 M3 ledger amount vs M2's $2,850,000 ransom
  was never explained, M3 had no concrete date, and the BACKTRACE
  caseboard's visual graph stopped at M2 (`shellCompany`) even though
  M3's `parentEntity` fact already existed. All four fixed this session
  (see below). One stale line in `docs/network-plan.md` (M1's firewall
  described as "ssh-able directly," superseded by the pfSense-web-login
  mechanic) and one fully-superseded section (M2's original Wi-Fi/
  `bettercap`/`fern` design, replaced 2026-09-24 by the Firewall-behind-
  Splitter shape) also corrected.
- **[mechanic] BACKTRACE caseboard now reaches M3.** Added a fourth
  entity node (`parentEntity`, SKN Capital Nominees), its connecting
  trace-line from `shellCompany`, and an `EV-M3-01` evidence card —
  previously the visual investigation map (unlike M3's own text-only
  report panel) never extended past M2. M3's `caseId` fact, previously
  only traceable through the optional bonus objective
  (`bonusExploreShare`), now also traces on the mandatory ledger-dump
  event (`Sqlmap.DumpTable`); backed by a new `memo` field on the
  Coin-Drift ledger DB row referencing `M01_CASE_ID`, not just a
  relocated trigger, so the fact has real in-fiction grounding on the
  required path.
- **[mechanic] M3's report bridges to M2's unresolved "second signer"
  thread; ledger amount and date clarified.** M3's report gained one
  line tying its own "Nominees" mystery back to M2's routing-note
  thread. `q1_reconciliation.xlsx` gained a line clarifying the $42,000
  ledger row is one line item, not the whole ransom batch, and its
  vague "same week" date note is now a concrete `Aug 16, 2026`.
- **[mechanic] Every mission file that lived loose at a device's root
  now sits in a real container.** New engine fact, confirmed from
  `index.d.ts` rather than assumed: `rootFiles` folders named
  `etc`/`home`/`logs`/`lib` are merged into a device's default root
  folders, and a separate `NetworkUser.files` field mounts a flat file
  list under that user's own home directory — the precise mechanism
  M1's target device was already informally approximating. Every loose
  file across M1 (6 devices), M2 (6 devices, including the two decoy
  subdomains that share one registration function), and M3 (1 device)
  now goes through one of these two containers, chosen by whether the
  file has a named owner. Zero event-handler changes needed — every
  mission's file-read checkpoints already match by
  `name`/`extension`/`data`, never a path.
- **[mechanic] `.txt`/`.log` content given an explicit 4-shape
  standard.** Report/log artifacts keep a title+divider header; ambient
  system logs (M1's `auth.log`/`cron.log`/`system.log`) get none,
  rewritten in genuine Debian/Ubuntu syslog format (`sshd`/`CRON[pid]`/
  `systemd`/`kernel` lines, new IPs checked against every address
  already used in the project) instead of the previous untimestamped
  placeholder lines; casual notes and scripts are exempt/unchanged.
  `sales_ledger.log` gained two historical rows for the same buyer
  alias, matching the IRC line "same as on the last two jobs," which
  previously had no ledger data backing it.

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
- **[mechanic] BACKTRACE traces clues at checkpoints, not only at
  completion.** A key is traced only at an event that proves the player
  saw or used the value; keys without such an event stay hidden until
  `OnComplete`, which still snapshots every key. M1: `broker` and
  `listing` at `listingFound`, `buyer` when the backend's `sales_ledger`
  is `cat`ed with the buyer alias in its content (a new `Terminal.Cat`
  handler), `vault` at `vaultVisited`; `caseId` and `project` have no
  checkpoint because they are read inside LedgerVault, which emits no
  event. M2: dumping the `affiliates` table on the devbox IP
  (`Sqlmap.DumpTable`) traces `developer`, `caseId`, `ransom`, `settled`
  and `victims`; downloading `wire_authorization` (`Files.Transfer`)
  traces `shellCompany`. The new `traceBacktraceFacts()` is idempotent
  and, like `setBacktraceMission()`, fail-safe (errors are logged, never
  thrown into the quest); M1's `OnObjectivesStart` re-traces from the
  persisted flags so older saves catch up. In the app, CASEBOARD nodes and
  connections appear as clues are traced, and an open mission's card lists
  them ("TRACED SO FAR"). The BACKTRACE LAB comparison app, tried in-game
  to decide this, was removed; `scratchbt <mission> <key>` now traces one
  key from the terminal. Checked in a browser with a stubbed SDK; the real
  checkpoint handlers are not yet live-tested (needs `isDebug = false`).
- **[docs] `docs/architecture.md` documents the tracing checkpoints.**
  The BACKTRACE section now covers `traceBacktraceFacts()`, the
  fail-safe writers and a table of which event traces which key, with
  the keys that have no checkpoint called out.

## 2026-09-27

- **[mechanic] BACKTRACE fact values are click-to-copy.** Any traced
  `data-fact` value (domains, aliases, amounts, etc.) in `backtrace.html`
  can now be clicked to copy its text via `navigator.clipboard.writeText`,
  falling back to a hidden-`textarea`/`execCommand('copy')` shim if the
  Clipboard API is unavailable or rejects; a "COPIED"/"COPY FAILED"
  tooltip flashes above the value for ~900ms. Values still showing "—"
  (untraced) are not clickable (`has-fact` class gates it). Clicking a
  value inside an entity card or CASEBOARD node now copies it instead of
  opening the entity drawer (`stopPropagation`); clicking elsewhere on the
  card still opens the drawer as before. Not yet live-tested in-game —
  needs confirming `navigator.clipboard` is permitted inside the HackHub
  app iframe.
- **[mechanic] New `open <path>` command reads any file, any extension.**
  `src/commands/open.ts` uses `Files.getByPath`/`Files.read` directly, so
  it is not limited to `.txt`/`.log` like the built-in `cat` — confirmed
  in the decompiled engine that this is `cat`'s own restriction, not a
  filesystem limit (`Files.read` returns raw string content for any
  extension). Registered in `src/index.ts` alongside `attrcheck`. A
  themed viewer for document-style extensions (`.pdf` and similar) is a
  separate, not-yet-built follow-up — the SDK has no window/modal
  primitive a command can open (`CommandTools` is terminal I/O only;
  `UI` only has `notify`/`toast`/`prompt`), so that would need its own
  small App, not an extension of this command.
- **[mechanic] M02's GHOSTWIRE dialogue is a Personal Log, not a phone
  call.** `content/m02.ts`'s `M02_DIALOG` (`QuestDialogDefinition`, used
  via `this.createDialog()`) was replaced with `M02_LOG_ENTRIES`, plain
  text read by a new `appendBacktraceLog(mission, text)` in
  `backtrace-state.ts`. Root cause: the SDK's `createDialog()` is always
  presented as an incoming phone call, but every line in both branches
  (`default`, `aftermath`) was `speaker: "GHOSTWIRE"` — the player calling
  themselves, with no counterpart. The two existing triggers
  (`deployLogFound`, `aftermathShown`) are unchanged; only the
  presentation changed, to a "PERSONAL LOG" section in BACKTRACE's M2
  report (and a progressive preview on the still-open mission's card),
  matching the "PERSONAL LOG" framing BACKTRACE's own prologue already
  uses. `buildMissionState()` now carries `logs` through to `OnComplete`'s
  full snapshot, which previously would have dropped them. Not yet
  live-tested in-game.
- **[mechanic] Live-test revisions to the three features above.** (1) M2's
  `shellCompany` checkpoint moved from `Files.Transfer` DOWNLOAD to a new
  `OPEN_FILE_READ_EVENT` (emitted by `open.ts` after a successful read) —
  proves the player actually read `wire_authorization.pdf`'s content via
  `open`, not just transferred the file; mirrors `attrcheck.ts`'s
  custom-event pattern. (2) A new personal-log entry now fires
  `UI.toast(...)` (best-effort duration — the SDK exposes no duration
  parameter, confirmed by reading the live post-2026-09-26-patch
  `app.asar` directly, not a stale cache) and, in `backtrace.html`, gets a
  ~10s CSS-animated highlight (`.log-entry.is-new` / `logEntryFade`) the
  first time it's rendered — tracked client-side via a `seenLogEntries`
  set seeded from the very first `refresh()` so pre-existing entries never
  flash on load. (3) M2's `buyer` (sourced from M1's alias) is now
  cross-traced into `m2.facts.buyer` the moment M1's own buyer checkpoint
  fires, plus a catch-up in M2's `OnObjectivesStart` (new
  `getBacktraceFact(mission, key)` reader) for saves where M2 starts
  after M1's buyer was already found. This needed a correctness fix in
  `applyTrace`/`appendLog`: both used to auto-promote a `locked` mission
  straight to `progress`, which would have made M2 falsely show
  "in progress" the instant M1's buyer was read, even if M2 had never
  been claimed — both now no-op unless the target mission's status is
  already `progress` (symmetric with the existing `complete` no-op).
  Not yet live-tested in-game.
- **[bug] The `progress`-only guard above broke logging/toasts entirely.**
  Live-test: a personal-log entry stopped appearing and its `UI.toast`
  never fired. Root cause: that guard was meant only for the new
  M1→M2 buyer cross-trace, but it landed in the *shared* `applyTrace`/
  `appendLog` functions, so it also blocked every ordinary checkpoint
  (`deployLogFound`, `aftermathShown`, the M1/M2 fact traces) whenever a
  mission's status wasn't exactly `progress` at that instant — including
  the known `mods.reset` timing race (a mission can briefly read back as
  `locked` right after reset) and, in this case, "M2 already `complete`
  from an earlier test." `applyTrace`/`appendLog` are reverted to their
  original behavior (only `complete` blocks; `locked` self-heals to
  `progress`, same fix as before this regression). The real fix moved to
  exactly where it was needed: a new `getBacktraceStatus(mission)` reader,
  checked only at the M1→M2 cross-trace call site
  (`if (getBacktraceStatus("m2") !== "locked") ...`) — M2's own
  `OnObjectivesStart` catch-up needed no such guard, since it only runs
  while M2's own quest instance is already active.
- **[mechanic] More live-test revisions.** (1) Multiple log lines added
  together no longer fire one `UI.toast` each — `appendBacktraceLog` is
  replaced by `appendBacktraceLogs(mission, texts)`, which writes the
  whole fresh batch in one `SaveStorage` call and fires exactly one toast
  ("N new personal log entries recorded."). (2) The `aftermathShown`
  personal-log trigger moved from `Files.Transfer` DOWNLOAD to
  `OPEN_FILE_READ_EVENT`, matching name+extension for all three
  workstation files (`wire_authorization.pdf`, `errands.txt`,
  `unsent.txt`) — downloading is no longer part of M2's progression at
  all now that `open` is the real "player engaged with this file" signal;
  `m02-quest.ts` has no `Files.Transfer` listener left. Not yet
  live-tested in-game.
- **[bug] `mods.reset` doesn't touch the player's own filesystem, so a
  workstation file downloaded in an earlier playthrough survives it.**
  Live-test finding: after `mods.reset`, `open wire_authorization.pdf`
  still traced `shellCompany` even though RDP hadn't been breached again
  this playthrough — confirmed in the decompiled engine that
  `mods.reset`'s own description is "Reset a mod's save-state (quests,
  mails, messages, data, apps)", which never mentions the player's home
  directory; a locally-downloaded file is player-owned state, not
  mod-save-state, so it isn't part of what gets wiped. Both
  `OPEN_FILE_READ_EVENT` handlers in `m02-quest.ts` (`shellCompany`,
  `aftermathShown`) now additionally require `this.Data.firewallBreached`
  — quest data that *does* reset per claim — so a stale local copy from
  a previous run can no longer skip the RDP step. M1 has no equivalent
  local-file-download checkpoint today, so this class of bug doesn't
  currently apply there. Not yet live-tested in-game.

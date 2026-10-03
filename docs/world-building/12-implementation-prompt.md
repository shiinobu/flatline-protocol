# Implementation: M4–M7 — FLATLINE PROTOCOL (HackHub content mod)

## 0. Scope of this run (the owner fills this in before sending)

- **PHASE:** `2, 3, 4, 5, 6, 7, 8` (values from the table in §5, run strictly in this order; a combination is allowed because the owner writes it here; Phase 1 is done and merged)
- **BASE:** (optional) a commit hash. If empty, BASE is the commit your checkout starts at (`git rev-parse HEAD`). The owner names one only when legitimate changes to the locked M1–M3 files were committed since the last run.
- **Owner notes:**
  - Run mode: a phase is done only when its §2.3 baseline, its §4 diff guard and your harness pass, its playtest doc and changelog entry are written, and its commits are pushed. Start the next phase only then.
  - If a phase is BLOCKED or fails, skip the phases that depend on it (4 and 5 need 3; 7 needs 2 and 6), do the independent ones, then report. If your context runs low, stop at the last finished phase and report the rest as PARTIAL or NOT STARTED.
  - Phase 1 is already in your checkout. All live tests happen after this run, so Phase 4 builds on events not yet tested live (`open` and `attrcheck` at a Meterpreter prompt, `Files.Transfer` DOWNLOAD in an RDP session, a `{ realMs }` Scheduler job across a live session; `docs/bugs.md` #45, #46): list each under item 3 of its report block. Do not edit m07 files before Phase 4 unless a change forces it, and report it if so.
  - The `m05`–`m07` keys in `guard/flags.ts` and the BACKTRACE ids `m5`–`m7` already exist; do not add them again.
  - Story days accepted for this run (`13` §C): M4 2026-09-24, M5 2026-09-27, M6 2026-09-30, M7 2026-10-03.
  - In the 1.3.13 engine `isIpHidden` is consulted only by `whois` and `nslookup`; do not assume `net_tree.py` hides a host (M2's hidden Firewall was found with it live).
  - Check the SDK version by reading `node_modules/@hotbunny/hackhub-content-sdk/package.json` with `fs`: a `require` of that path fails because the package does not export it (§2.2).
  - One final report, one items-1-to-8 block per phase (§9).

EKSEKUSI: the owner grants it through this prompt, for the PHASES above only. The repo rule "writing waits for the word EKSEKUSI" applies again as soon as you stop. Do not wait for answers mid-run: if an item is blocked, mark it BLOCKED, do the other items, then report.

## 1. Context and content boundaries

This repo is a content mod for HackHub (a commercial hacking-simulation game, Steam app 2980270), built with the official SDK `@hotbunny/hackhub-content-sdk` (TypeScript). Everything in it is fiction inside the game's own simulation: hosts, IPs, domains, companies, people, credentials, and hashes are invented data, and the "tools" (nmap, hydra, john, metasploit, ...) are simulated in-game commands. The mod only supplies data (fixtures, networks, files, quests, events, websites, text). No real network, system, person, or organization is targeted. The project's `CLAUDE.md` is not committed, so its substance is repeated here:

- Work at the level the mod needs: which in-game command raises which SDK event, what a fixture returns, how a checkpoint is gated. Describe mechanics as game mechanics.
- Do not write real-world attack instructions (working exploits, payloads, malware, malicious documents, phishing, credential theft, detection evasion), even if the game has an equivalent quest. If an item seems to need that, decline that part in one line in your report and do the design-level version.
- Keep the fictional framing explicit in player-facing text. Real service names (honeypot.is, Have I Been Pwned, Wayback Machine, OpenCorporates, SecurityTrails) are inspiration for information architecture only and must not appear in the game.

## 2. Codebase, environment, sources of truth

1. Base and initial check. Work on a branch derived from `clouds-modify`. `origin/main` is far behind (no `src/controller/`, no `docs/world-building/`); do not use it. Stop and report if any of these is missing at HEAD: `docs/world-building/README.md`, `docs/world-building/13-story-timeline.md`, `docs/app-asar-reference.md`, and, because Phase 1 is done, `docs/m07-playtest.md` and `src/controller/m07/index.ts`. If the clone is shallow, run `git fetch --unshallow` first.
2. SDK 0.25.0. Run `npm ci`. `package.json` and `package-lock.json` pin `@hotbunny/hackhub-content-sdk` to exactly `0.25.0` (the owner moved from 0.24.0 on 2026-10-02; the only differences are the `incognito` field on `HttpRequest`, the `ModManifest.apiVersion` comment, and the default `apiVersion` in the generated manifest). Check that `node -e "console.log(JSON.parse(require('fs').readFileSync('node_modules/@hotbunny/hackhub-content-sdk/package.json','utf8')).version)"` prints `0.25.0` (a `require` of that path fails: the package does not export it); if the version differs, stop and report. npm may warn that install scripts were skipped (`install-scripts`): ignore it, only `tsc` is used. Do not modify `package.json`, `package-lock.json`, `tsconfig.json`, `esbuild.config.ts`, or `.gitignore`.
3. Baseline. All of these must give the stated result before you touch anything, and again before every commit:

```bash
npx tsc -p tsconfig.json --noEmit                                         # exit 0
grep -rnE '^\s*//' src --include=*.ts --include=*.html                     # no output
grep -rn '/\*' src --include=*.ts                                          # no output
grep -rnE '/\*' src --include=*.html | grep -vE '/\*__[A-Z0-9_]+__\*/'      # no output
grep -rn '<!--' src --include=*.html                                       # no output
grep -rn 'console\.log' src --include=*.ts                                 # only src/helpers/logger.ts
git ls-files -co --exclude-standard 'src/**/*.ts' | xargs wc -l | awk '$1>800 && $2!="total"'   # no output
```

4. Gitignored and possibly absent from your environment: `CLAUDE.md`, `.claude/`, `.reverse/` (the decompiled engine), `docs/basegame-reference/`, `build-install.ps1`. The sources of truth for facts are: the SDK declarations `node_modules/@hotbunny/hackhub-content-sdk/index.d.ts` (0.25.0); `docs/app-asar-reference.md` (engine facts with verbatim excerpts, the substitute for `.reverse/`); `docs/bugs.md`; `docs/mechanics.md`; `docs/network.md`; `docs/world-building/04-web-layer.md` (§C–D); `docs/world-building/13-story-timeline.md` (every date); and the live M1–M3 code. Never use an API that is not in `index.d.ts`. Any engine fact outside those sources is UNVERIFIED: it must not become a gate unless a Tier 1 fallback exists, and it goes in your report and in a new `docs/bugs.md` entry. You cannot read the engine, so never edit `docs/app-asar-reference.md`.
5. Engine facts you must not get wrong. Rules and verbatim excerpts are in `docs/app-asar-reference.md` (entry ids E-n); `docs/bugs.md` #39–#44 record them as findings:
   - E-1, E-2: `Network.registerDomain` and `Network.setVulnerabilities` do nothing without a subnet at that IP, and `registerDomain` overwrites the subnet's `domain`. `needsSubnet: false` only works when a subnet already exists at that IP; fixtures (`whois`, `nslookup`, `geoip`, `nmap`) work without a subnet; `subfinder` and `net_tree.py` need one; one IP carries one domain name.
   - E-3: `dirhunter <host>` finds the `Website` by host (no subnet needed) and prints every registered path; SDK page definitions have no `isHidden`. "Hidden page" means registered but not linked, so path names must never leak an answer or the next step (opaque tokens or one dynamic pattern such as `/entity/:id`).
   - E-4: `mods.reset` clears quests, quest-bound mail, `Storage`, `Variables` and apps (corrected 2026-10-03: NOT `SaveStorage`); it does not run `OnComplete`/`OnAbandon` and does not touch `SaveStorage`, persisted `Scheduler` jobs, `Desktop` widgets, networks, `SharedVariables`, `Mail.send` mail or the player's own filesystem. A gate based on a file that can linger on the player's PC must also require a quest-data flag set in this playthrough; the rebuild path of `core/register` does any cleanup.
   - E-5: money is paid with `Bank.transaction`; see D1 in §8.
   - E-6: files carry no timestamps and `ls` prints names only, so dates exist only in names and contents (§3, Dates).
   - E-7, E-8: a local address is only `192.168.1.x`. A firewall rule's `destination`, when set, is compared with the target's `lanIp` (never its public IP), and the pfSense panel's Save rejects any rule whose destination is not `192.168.1.x`. A rule without `destination` blocks that port for every device of the network. `Network.removeFirewallRule(ip, port)` removes every rule with that port. No Deny rule on port 80 with an empty destination.
   - E-9: `PFSense.Login` fires only after a credential match and carries only `{ ip }`, so a Firewall has exactly one valid user.
   - E-10: site iframes are sandboxed without `allow-forms`.
   - E-11: the bluekeep module needs a port with `internal` 3389, a `version` such as `FreeRDP 5.2.1`, an `active` port, no blocking firewall rule, and an online user (or `guest`); success raises `RemoteConnection.Established` with `t: "METASPLOIT"`.
   - E-12: `nmap` and `geoip` consult a registered fixture first; a LAN address is resolved only inside an SSH session.
6. Notation and reading order. `07`–`11` and `13` are the numbered files in `docs/world-building/` (`07-arsitektur-misi-baru.md`, `08-spec-m5-m6.md`, `09-konten-m5-m6.md`, `10-spec-m4.md`, `11-spec-m7.md`, `13-story-timeline.md`); `README` is its decision log; `§X` is a lettered section. These design docs are written in Indonesian and are the source of truth for design decisions. Read in full at the start: `README.md`, `07`, `01-canon-dan-hook.md` (§B–E), `04-web-layer.md` (§C–E), `13-story-timeline.md`, `docs/app-asar-reference.md`; then `docs/rules.md` (including its section "Step gating and engine contexts"), `docs/architecture.md` (Mission pipeline, Website access, Applications: BACKTRACE), `docs/mechanics.md`, `docs/network.md`, and `docs/bugs.md` entries #5, #6, #13, #17–#22, #25–#27, #29–#31, #35–#46. Before each phase, read in full the spec files of that phase (§5). Read `03`, `05`, `06` as needed. `docs/story.md` is context only (outdated in places; do not edit it). Implementation references: M3 (`src/main/m03.ts`, `controller/m03/`, `content/m03/`, `i18n/m03/`, `websites/m03/`); M2 for the Router + Splitter + hidden Firewall + Device shape.

## 3. Binding rules

Details and rationale are in `docs/rules.md`, `docs/architecture.md`, and `07`. In short:

**Structure and gates**
- One objective per mission; mechanics stay ordered through `advanceStep` (`middleware/gate.ts`) with a transitive gate table in `content/mNN/gates.ts`. Optional steps never enter the chain. World information unlocks per step through `UnlockSpec` (domains, fixtures, firewall rules, ports), not when the world is built. Not `Abandonable`, no `OnAbandon` (only M1 has one).
- No `hint` or `terminalCommand` on objectives; descriptions never name the tool or command that solves them (`docs/network.md`, Conventions).
- "Not yet" replies: one per step (`firstUnmetStep`). Every in-world hint must be reachable BEFORE the mechanic it helps with; trace the gate chain to prove it.
- Tier 1 mechanics only (`04-web-layer.md` §D). Singleplayer mod.
- Pipeline: thin `main/mNN.ts` class → `controller/mNN/` → `core`/`components`/`middleware`/`content`/`i18n`/`context`, with no dependency cycles. Anything used by two or more missions goes in the `global/` folder of its layer (`docs/architecture.md`). Missions never import each other; the only modules that read mission content from outside a mission are `applications/backtrace-facts.ts`, `commands/attrcheck.ts` and `content/global/mail-senders.ts`. Every file that registers something must be reachable from `src/index.ts` (global commands are imported in `src/main/global.ts`, a mission's sites in its `main/mNN.ts`).
- Inside a phase, implement in the order of `07` §F: `content` → `i18n` → `controller` → `main` → `websites` → global changes.

**Engine**
- Send `Mail.send` synchronously in the tick of its trigger, never inside `setTimeout`. `await` async chains inside the handler/`Run`/Scheduler job, otherwise the mod context is lost (#6, #19). Touch networks only through `core/register`/`unregister` (sequential destroy, #35). Website renders never write or roll anything; they only read `SharedVariables` mirrors (#36).
- New mail senders (e.g. `sentry@darknull.io`, `greta.desouza@postbox.my`) go into `FLATLINE_MAIL_SENDERS` in `content/global/mail-senders.ts`; a mission's `OnStart` wipes that list under its own dev focus, as `onStartM03` does (`if (isQuestDevFocus("mNN")) withdrawMailFrom(FLATLINE_MAIL_SENDERS)`), so a reset does not pile up mail (#37).
- BACKTRACE: one action yields at most one key, called from that step's `onAdvance` (`rules.md` §13). The BACKTRACE writers are fail-safe; do not tighten them for a single caller. Ransom amounts and dates derive from `content/global/finance.ts` (`rules.md` §14); game-economy constants (penalties, rewards) are named constants in `content/mNN/`.
- Firewalls, LAN addresses and RDP targets follow §2.5 (E-7, E-8, E-9, E-11).

**Code**
- Zero comments in `src/`, `.html` included (no `<!-- -->`, `/* */`, or `//`; the `/*__NAME__*/` data-injection markers used in M1 are code, not comments). Put the "why" in `docs/scratch.md` (a dated section per mission).
- No `console.log`; use `trace(scope, message)` (`src/helpers/logger.ts`, log prefix `[FP][scope]`). You may add `trace` calls in the new missions' controllers to help diagnose live tests; list their locations in `docs/scratch.md`. The owner removes them at FINAL LOCK (the owner's decision to freeze a mission).
- `.ts` files under 800 lines (an exception needs a written reason in the changelog). Explicit types on exports, no `any`. Immutable style (spread, `readonly`). Early returns. No speculative abstraction.

**Text**
- All player-facing text in English and Simplified Chinese (zh); proper names and in-game names stay Latin, as in `i18n/m03/core.ts`. The voice follows M1–M3. Anything the Custodian says must stay true to the locked text fence in `01-canon-dan-hook.md` §C (single channel, no confirmation of receipt, no side conversations).

**Dates**
- Every date and time in a file name or file content that a player can reach (over SSH, in a Meterpreter session, as downloaded or evidence material, in a log, mail, document, or website page) in M4–M7 comes from `13-story-timeline.md`: the fixed dates of §B verbatim, the story day of the mission from §C as the upper bound, the formats of §A. Never produce one with `Time.now()`, `Date.now()` or `new Date()`: the in-game clock is unrelated to story time and the SDK has no file timestamps (E-6). A page may show a live time-of-day clock as ClearEscrow does, but never a date derived from a clock.
- No file may carry a date later than the story day of the mission in which the player finds it (exceptions in `13` §A.3). Take the weekday only from `13` §D.
- M1–M3 files are locked; their dates are listed in `13` §B and §F for reference only. If an M4–M7 file conflicts with them, change the M4–M7 file and report it. Every date you introduce that is not in `13` goes in the report (item 4).

## 4. Editing boundaries

Forbidden to touch. The result of this command must be empty; run it before every commit:

```bash
BASE=<the BASE from §0, or the commit your checkout started at>
git diff --stat $BASE..HEAD -- 'src/*/m01*' 'src/*/m02*' 'src/*/m03*' 'src/main/m0[123]*' \
  src/content/m04.original.ts src/main/m04.original.ts src/debug \
  docs/story.md docs/app-asar-reference.md docs/world-building/13-story-timeline.md \
  package.json package-lock.json tsconfig.json esbuild.config.ts .gitignore
```

Also forbidden: changing any existing value in `src/guard/flags.ts` (only add new keys set to `false` in `DEV_FOCUS_QUEST` and `TESTER_FOCUS_QUEST`; `isDebug` and `isTester` stay `false`; the owner alone switches the HEAD values on or off), renaming `M04_ARCHITECT_VPN_IP`, and editing anything else in `docs/world-building/` except an "Implementation notes (date)" block at the end of the spec file of the mission you are working on.

The new mission folders are yours: `src/<layer>/m04` … `m07` and `src/main/m04.ts` … `m07.ts` for the mission you are building, plus the files §5 names.

Allowed, narrow and additive: `src/guard/flags.ts` (new keys), `src/applications/*` (BACKTRACE types, keys, cards), `src/commands/*`, `src/content/global/*`, `src/context/global/*`, `src/i18n/global/site-keys.ts`, `src/websites/global/*`, `src/main/index.ts`, `src/main/global.ts`, `docs/*` (except the forbidden ones above), and `manifest.json` (Phase 8 only). For `src/components/*`, `src/core/*`, `src/middleware/*`, prefer new files; change a function that M1–M3 also run only with a behavior-equivalence proof against BASE (§7).

## 5. Phase map

| Phase | Content | Specs | Owner tests |
|---|---|---|---|
| 1 | M7 walking skeleton | `11` §A–E, §J–L; `07` §B–C, §F; `01` §E | probe logs + skeleton part of `docs/m07-playtest.md` |
| 2 | M6 walking skeleton (`networkIps: []`) | `08` §C; `09` §D | skeleton part of `docs/m06-playtest.md` |
| 3 | Generic kit + M4 walking skeleton | `10` §B, §E, §H–J; `07` §G | skeleton part of `docs/m04-playtest.md`, including `mods.reset` during an active strike |
| 4 | M7 full | all of `11`; `05` | en, then zh |
| 5 | M4 full | all of `10` | en, then zh |
| 6 | M5 full | `08` §B; `09` §A–B | en, then zh |
| 7 | M6 full | `08` §C; `09` §C | en, then zh |
| 8 | Wrap-up | — | owner locks |

Order rationale. It honors README "Batasan urutan implementasi": the old M4 moves to `m07` first so id `m04` is free (#2), the M6 zero-network path (#3) and the M7 events (#4) are tested by skeletons before their content. Relative to the README suggestion, the M4 kit (phase 3) comes before full M7 (phase 4) because full M7 reuses the kit components (`11` §G ↔ `10` §H), and the M6 skeleton comes right after the M7 skeleton. When one run lists several phases (README #37), the owner's live tests of the skeletons come after the run; each skeleton is still built before the full content that rests on it.

**Phase 1 — M7 walking skeleton** (DONE and merged into `clouds-modify`; kept for reference, do not redo it)
- Migrate (id `m04` must become free first): move and split `content/m04.ts` into `content/m07/*`; turn `main/m04.ts` into a thin `main/m07.ts` plus `controller/m07/`; move `websites/m04/architect-c2/` to `websites/m07/architect-c2/` (`git mv` where it preserves history). `main/index.ts` imports `./m07.js` instead of `./m04.js`. Update the imports in `commands/attrcheck.ts` and `content/global/mail-senders.ts`. Moved constants named `M04_*` become `M07_*`, except `M04_ARCHITECT_VPN_IP`, which stays in `content/global/characters.ts` (the locked M2/M3 import it). Constants needed by more than one mission go to `content/global/`.
- Global: add keys `m05`/`m06`/`m07` to `guard/flags.ts` (`false`); extend `BacktraceMissionId` and the initial state to m1..m7, with `BACKTRACE_KEYS` for m5–m7 empty for now; `backtrace.html` gets locked cards for M4–M7 (working titles) without changing how M1–M3 look.
- World: topology per `11` §E (a Splitter holding the hidden Firewall with exactly ONE valid user, the C2, Null-Crown, Ash-Vector). LAN side `192.168.1.x`; Firewall rules with `destination` equal to the C2's `lanIp` (E-7, E-8). RDP bluekeep path to the C2 (E-11): `version: "FreeRDP 5.2.1"`, one online user `svc-cms`. `manifest.txt` and `master_ledger_backup.enc` in the C2 `rootFiles`. `attrcheck` made Meterpreter-aware through `commands/meterpreter-files.ts`, raising `flatline.m07.attrcheckRevealed`. Fix the old-M4 defects `11` §B #1–#4, #6 and #11.
- Probes for the live test: unconditional `trace("M07", "probe:<name>", payload)` calls (no gate condition) on the METASPLOIT session to the C2 (`RemoteConnection.Established`, `t === "METASPLOIT"`), `Terminal.Cat` of `manifest.txt`, `flatline.m07.attrcheckRevealed`, and `Files.Transfer` `DOWNLOAD` of `master_ledger_backup`. Add one bare tracking probe: a `Scheduler` job (short test deadline, `{ realMs }` as in `core/rebuild.ts`) armed by the METASPLOIT session that logs `probe:tracking-expired`, and cancelled by the download (`probe:tracking-disarmed`); no banner, no penalty. (README "Batasan urutan implementasi" #4 and `11` §L name slightly different event lists; the probes cover both.) You may open 3389 from the build (a skeleton-only shortcut, removed in Phase 4). Placeholder text in English only is enough; no HoneyCheck, kit tracking, or endings.
- Record the probes in `docs/m07-playtest.md` under "Skeleton probes". The owner has not yet live-tested `open` at a Meterpreter prompt (README "Batasan urutan implementasi" #1); do not present that path as proven.

**Phase 2 — M6 walking skeleton**
- Mission `m06` with `networkIps: []` and `networks: () => []` (verified in `core/register.ts` and `components/topology.ts`, never yet run live); one mission site (Registry) wrapped in `gateMissionPages("m06")`; tip mail → `Mail.Read`; a page-visit gate (`Browser.Meta`); one registered-but-unlinked page (candidate `/filings/archive/`) to confirm that `dirhunter pcr-registry.org` prints it without any subnet (E-3; the player must have the `dirhunter` package installed, say so in the playtest script); one `whois` fixture. Use fixtures for `vpn.skn-central.net` → `203.0.113.160`, not `registerDomain` (E-1). Record the probes in `docs/m06-playtest.md`.

**Phase 3 — generic kit + M4 walking skeleton**
- Sources: `src/debug/rival-hacker-lab.ts`, `rival-breach.ts`, `rival-banner.ts/.html` (live in the lab, never yet run inside the mission pipeline). Adapt the generic parts into `components/` (`intrusion`, `desktop-breach`, `incident-banner` + HTML widget) and `commands/` (`repel`, `sysdiag`, `sysrepair`: global, `default: true`, `scope: "local"` for the last two, imported in `src/main/global.ts`). Leave the lab untouched.
- Changes from the lab (`10` §B): scripted strikes through `Scheduler` with no `Math.random`; one fixed alias `sentry`; penalty `min(Bank.getBalance(), amount)`; log timestamps are constants chosen inside the windows of `13` §E (M4); async chains `await`ed inside handlers/Scheduler jobs (#19); `mods.reset` while the desktop is locked is handled in `Game.SessionStarted`, as in the lab.
- Mission-blind: the `SaveStorage` key prefix becomes a parameter (M4: `flatline.m04.*`), and `sysdiag`/`sysrepair` work for an active breach from any mission, because M7 uses the same kit (`11` §G). This deviates from the wording of `10` §H ("refuse when M4 is not active"); report it as a deviation.
- M4 skeleton: thin `main/m04.ts` + `controller/m04/` + `content/m04/`; four Routers each holding one Device (`10` §E, LAN per E-7); one scripted strike → banner → correct `repel <ip>`; no 15-step chain and no full content yet.

**Phase 4 — M7 full**
- The 12-step chain (`11` §C), remove the 3389 shortcut and the bare probes, HoneyCheck (`websites/global/honeycheck/`), full `/legacy-cms/`, the 240-second tracking built on the phase 3 kit (`11` §G: real-time `{ realMs }` deadline, starts at step 8 and is re-armed on every new session to the C2 until `fileExtracted`; the `.enc` is re-created inside a handler, #19), ending effects and the Greta letters (`11` §H), the "What now?" mail and the `choice` field, `M07_ARCHITECT_REAL_NAME`, the reward (D1), BACKTRACE m7 keys and report card, full en + zh. `manifest.txt` amounts and dates come from `finance.ts`; every other date from `13` §B and §E (M7).

**Phases 5, 6, 7 — full missions.** Follow the specs in the table. Notes:
- M4: desktop recovery uses three builds (the right one is picked at random in mod context and recorded in the incident log); steps 5 and 6 are parallel and join at 7 (`10` §C).
- M5: Echoline is ONE global site in `websites/global/echoline/` with per-mission pages wrapped in `gateMissionPages`; the Firewall has ONE valid user; every hash is a real MD5 of the password of a user that exists in the world (#13); the Bedside-17 bonus stays outside the gate chain (`08` §B2).
- M6 full: consequences of M1–M3 in the records are read from the `backtrace` state of m3 and mirrored to `SharedVariables` (#36); their dates come from `13` §C.

**Phase 8 — Wrap-up.** One code review of the whole M4–M7 diff (owner rule: reviews are batched at the end), fix the findings, `manifest.json` ("across seven missions"), sync `docs/architecture.md` (BACKTRACE checkpoint table and migration status only; the structure pattern is LOCKED) and `docs/network.md`.

## 6. Web and visual layer — the `frontend-design` skill is mandatory

The owner wants maximum web quality, and `04-web-layer.md` §E already requires this plugin. Design every new website and new visual surface with the `frontend-design` skill/plugin (named `frontend-design:frontend-design` in the owner's environment; call it through the Skill tool). Call it BEFORE writing each site's HTML/CSS and give it the brief from the table below. If the skill is not available in your environment, say so in your report (do not skip it silently) and follow the brief manually. Walking-skeleton phases (1, 2, 3) use minimal unstyled pages; full design happens in the full phases (4–7).

The skill's output must be fitted to the engine/repo limits below; when they conflict, these limits win:
1. Self-contained: one HTML string per page (imported as `*.html`, `src/types.d.ts`), with inline `<style>` and `<script>`; no outbound resource loads (no web fonts, CDNs, external images, analytics; links to in-game hosts are fine). Fonts = system font stacks (the pattern of the existing sites). Graphics = inline SVG/CSS; avoid new raster files.
2. No `<form>`: site iframes are sandboxed with `allow-scripts allow-same-origin` and without `allow-forms` (E-10). Use `<input>` plus JS events, as ClearEscrow's search does.
3. Every visible string (also `placeholder`, `aria-label`, `title`, strings inside JS) goes through `{{t:KEY}}`; a key uses only letters, digits, `_` and `.` (`websites/global/localize.ts` matches `[A-Za-z0-9_.]+`, anything else stays unreplaced). Keys live in `i18n/mNN/site.ts` (en + zh), registered in `i18n/mNN/site-keys.ts` and `i18n/global/site-keys.ts`. The mission controller calls `refreshSiteStrings()` and `openMissionSites("mNN")` in `OnObjectivesStart` and `closeMissionSites("mNN")` in `OnComplete`, as `controller/m03/index.ts` does; without `refreshSiteStrings()` the page shows raw keys. Variables use `.replace("{{n}}", ...)` as ClearEscrow does.
4. Zero comments (§3).
5. Data: a dataset embedded in the page JS, or injected by `metadata()` from `SharedVariables` mirrors. Events from a page go through `Exports` on the `Website` class (the `flatlineOpenProject` pattern in LedgerVault). Dates shown on a page follow §3 (Dates).
6. Every site host: an `nmap` fixture with 443 `OPEN` (`rules.md` §12), pages through `securePage`/`requireHttps` (`rules.md` §6), wrapped in `gateMissionPages("mNN", ...)` (global Echoline: per-mission pages).
7. `dirhunter` prints every registered path (E-3): path names must leak nothing.
8. One page under 800 lines (split per page). Responsive from 360 to 1280 px (the iframe width is unknown), `<meta viewport>`, no fixed widths, sufficient contrast, `:focus-visible`, `prefers-reduced-motion`, semantic landmarks. Empty, "not found", and error states are designed, not left bare.
9. Each site has its own visual identity (not one template) and is original: reference sites inform information architecture and mood only, with no real logo, name, or brand.

| Site (host) | Designed in | Information-architecture reference | Mood | Required interaction |
|---|---|---|---|---|
| Echoline Archive (`echoline.net`, global) | 6 (extended in 7) | web archive with dated snapshots | calm, academic, archival | snapshot picker; differences between snapshots are visible |
| LeakIndex (`leakindex.net`) | 6 | credential-breach checker | clinical dark, data-dense, red-orange warnings | JS search over 10 records; opening record 1 calls `Exports` (`09` §B4) |
| Port Calder Companies Registry (`pcr-registry.org`) | 7 (minimal page in 2) | public company registry | official, bureaucratic, light, tight tables, VERIFIED/CONFLICTING chips | entity/officer search; unlinked filings-archive page |
| HostTrail (`hosttrail.net`) | 7 | domain/host history index | technical analyst dashboard, timeline, small SVG charts | domain/IP search; shared-certificate panel |
| HoneyCheck (`honeycheck.net`) | 4 | honeypot checker | minimal single focus, big verdict card, hesitant footnote | check a host against an embedded dataset; the verdict can be wrong on purpose (`11` §F) |
| `/legacy-cms/` on the C2 | 4 | 2011-era admin panel | deliberately dated: tables, gradients, old typography | node status table (`11` §I) |

Other surfaces: the countdown banner and the recovery screen (M4, M7) start from `src/debug/rival-banner.html` (already live in the lab) and are polished with the skill in phase 5; do not change the lock/release mechanics (CSS injection) without a reason. BACKTRACE cards and reports for M4–M7 follow the existing visual language of `backtrace.html` (do not redesign M1–M3).

Quality: once a page works, do one self-critique round on hierarchy, typography, spacing rhythm, contrast, and empty/error states, then fix what you find. `tsc` does not check the HTML/JS inside `.html` files; see §7 for how to verify it.

## 7. Verification (live tests are the owner's)

- `npx tsc -p tsconfig.json --noEmit` exits 0 on every commit. Do not run esbuild or `npm run build`, and do not touch `dist/` (the owner builds).
- Check scripts kept outside the repo (not committed):
  - a mocked-SDK harness (precedent: M1–M3; none is in the repo, so write your own) covering gate order (steps cannot be skipped; flags are never set directly), `UnlockSpec` opening per step and not at build, report validators (correct, rejected, too early), topology shape including every firewall rule's `destination` and every `lanIp` (`192.168.1.x` unless §8 allows otherwise), `register` idempotency and the rebuild path, the reward being skipped under focus, and `networkIps: []` (M6);
  - en/zh key parity; every `{{t:...}}` in HTML exists in en and zh and is registered in `ALL_SITE_KEYS`;
  - `node --check` on every `<script>` block, and run the pages' search logic in jsdom or a DOM stub if available. If a headless browser exists, render each page at 360/768/1280 px and summarize what you see; if none exists, write "visuals not verified";
  - a dates audit: extract every date literal from the new content, i18n and HTML files and confirm each is in `13-story-timeline.md` (§B, §C, §E) or listed in your report; `grep -rnE 'Time\.now|Date\.now|new Date' src/content/m0[4-7] src/i18n/m0[4-7] src/websites/m0[4-7] src/websites/global` finds nothing new (M1's existing clock in `clearescrow-io` is a time-of-day display);
  - the §2.3 baseline, the §4 diff guard, and reachability: every file that registers something is reachable from `src/index.ts`.
- A change to a function that M1–M3 also run (`core/`, `components/`, `middleware/`): prove behavior equivalence against BASE (compare every side-effecting SDK call over the same scenarios), or create a new file instead.
- Report the number of checks and the result per group. Distinguish clearly between "typecheck", "harness", and "not tested (needs live)". Never write "works" for something that only passed the typecheck.
- One self-review of the diff at the end of each phase against the §3 checklist; the in-depth review is batched in Phase 8.

## 8. Defaults and limits of authority

The owner may change D1–D7 before sending.
- **D1 Reward: money only.** Decision #34 (README): XP is skipped. Money is paid with `Bank.transaction({ amount, description })` inside `OnComplete`, never through `Quest.Rewards`; leave `Rewards` unset on M4–M7 (the engine guards an unset `Rewards`, and declaring the reward there as well risks a double payment; E-5). Amounts: M7 5000 (README #30); M4 starts at 800 (`10` §A); M5 and M6 have no amount in the specs, so propose ones that continue the M1–M4 progression (250 → 400 → 600 → 800) and stay below M7's 5000, and list them under item 4 of the report. Mirror the 0/0 gate of `rules.md` §2a: pay nothing while `isQuestDevFocus("mNN")` or `isQuestTesterFocus("mNN")` is true (log the skipped payout with `trace`), so repeated test completions do not inflate the player's balance. The payout therefore shows only in a production-mode run; say so in the playtest script. `docs/bugs.md` #42 already records that the payout path is unverified; the owner will observe it.
- **D2** You write en and zh; mark zh "not yet reviewed by the owner" in the changelog (`06` T-c is still OPEN).
- **D3 Production chain.** Each mission uses the final prerequisite from its spec (e.g. `questGate("m07", ["flatline.m06"])`). While M6 does not exist, M7 is unreachable in production; that is intentional, because the working branch is not meant for release before Phase 8. The owner tests through `DEV_FOCUS_QUEST`.
- **D4** No new `.original.ts` files (git history keeps the old M4); existing ones are left alone (`06` X-e is OPEN).
- **D5** The `src/debug/rival-*` lab stays as is; the kit is adapted, not moved (`06` X-d is OPEN).
- **D6** HoneyCheck is not used in M4 (X-f). Sentinel is not built (X-c). `replyable` is not built (G1-f). No `weblab`.
- **D7** The working titles of M4–M6 are used as is (M-a), as a single constant so they are easy to change.

**You may choose and propose** (README #33): prose in en/zh, IP addresses, fictional passwords `<P>` and hashes, numbers (deadlines, penalties, reward amounts within D1). Rules:
- Public IPs are random and new, and collide with no IP anywhere in `src/` or `docs/network.md` (grep first); one domain per IP. M7 keeps the public IPs and names of the old M4 (`11` §E).
- LAN: every node behind a Firewall or a Router panel that the player edits uses `192.168.1.x` (E-7), sequential from `.1` for the router and never repeated inside one router tree. Another router of the same mission may use its own `192.168.N.x` prefix, as M1 does. M7's LAN side is re-addressed from the old `172.16.0.x`.
- The Night-Shift control host sits next to `203.0.113.160` (README #26) but is neither `.160` nor `.161` (`.161` is the M7 C2).
- Hashes are computed with `crypto.createHash("md5")` from the passwords of users that actually exist in the world (#13).
- Money penalties are always `min(balance, amount)` through `Bank.getBalance()`.
- Dates: only those of `13-story-timeline.md`; a new one only when needed, within §3 (Dates), and reported.

**You may not change:** names of characters, places, and sites; the gate chains and their order; topology shapes; the decisions marked DECIDED in the README log (every row except #11 and #33); the locked text fence; `13-story-timeline.md` §B and §C. When a spec and the running code disagree: for engine facts the running code (and `docs/app-asar-reference.md`) wins, for design decisions the spec wins. Report both.

**Stop on the affected item and report if:** you would have to edit a forbidden file; a gate depends on an UNVERIFIED engine fact with no Tier 1 fallback; `npm ci`, the SDK version check or the baseline fails; a spec cannot be met without violating §3; a date in a spec conflicts with `13-story-timeline.md`.

## 9. Handoff

- Git: small themed commits that each pass the typecheck; conventional format (`feat(m07): ...`, `refactor: ...`, `docs: ...`); no Co-Authored-By trailer; push only to the working branch of this session (no force, not `main`/`clouds-modify`), after every completed phase and at the end; do not open a PR. If your context is nearly exhausted: commit what passes the typecheck, push, record the status in `docs/scratch.md`, and report PARTIAL.
- Language: code, identifiers, commit messages, `docs/changelog.md`, `docs/bugs.md` and the playtest scripts in English; the final report and the "Implementation notes" block (written in the language of the file it is appended to, Indonesian) in Indonesian.
- Docs: `docs/changelog.md` (dated entries in English, format in the file header), `docs/bugs.md` (new engine findings or UNVERIFIED assumptions as consecutively numbered entries after the last one in the file (#46 at the time of writing), not a new document), `docs/network.md` (topology, IPs, LAN, ports, users you chose), `docs/mNN-playtest.md` (a test script for the owner in the format of `docs/m03-playtest.md`: player steps, expected results, the `[FP]` log lines to look for, "Known follow-ups"; a full phase, 4 to 7, extends the existing playtest doc of its mission into the full walkthrough), `docs/architecture.md` (only what §5 names), and the "Implementation notes" block at the end of the mission's spec file.
- Final report (in Indonesian, the owner's working language; one block per phase, each at most about 60 lines):

```text
PHASE <x> — DONE | PARTIAL | BLOCKED | NOT STARTED
1. Built: main files and commits.
2. Verification: table of check → result → method (typecheck | harness | grep | not tested).
3. UNVERIFIED items and engine assumptions you relied on.
4. Values you chose for OPEN items (prose, IPs, LAN, passwords, hashes, numbers, reward amounts) and every date not in 13-story-timeline.md, so the owner can veto.
5. Deviations from the spec and why.
6. BLOCKED items and questions for the owner.
7. What the owner must test: pointer to docs/mNN-playtest.md and the log lines to look for.
8. Suggested next phase.
```

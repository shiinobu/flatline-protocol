# FLATLINE PROTOCOL — Story & Mission Design

Status: **LOCKED "temporer"** — stable working design, agreed with the user
across the project's design session (2026-09-18). Not literally
untouchable, but treat every name/beat below as settled; don't re-litigate
something already decided here without the user raising it first. This
document is the design/story source of truth for the project (this
project's story is original — not adapted from an external source, so
there is no separate "recovered original vs current" doc to reconcile
against).

---

## 1. Premise

**FLATLINE PROTOCOL** is a standalone HackHub ("Ultimate Hacker Simulator")
story mod, built on the same `@hotbunny/hackhub-content-sdk` engine as
entity-resolution-mods but otherwise fully separate — a from-scratch redo,
not a sequel or shared universe.

- **Genre:** cybercrime syndicate (ransomware-as-a-service chain).
- **POV:** independent vigilante/hacktivist — no employer, no client,
  acting alone.
- **Plot structure:** one big conspiracy unraveling gradually across 4
  different targets (not 4 disconnected jobs).
- **Difficulty:** "Very Hard" overall, but built from easy tools used as
  real chain-dependencies (nmap/lynx/nslookup/whois/geoip), not just hard
  tools. Every mission includes at least one red-herring/decoy or a "you
  must undo your own action" beat to earn the Very Hard label fairly.
- **Ending:** an open player choice (A/B/C), not a fixed "correct" outcome.

## 2. Hard constraint on tools

Every hacking tool and every social/communication tool used to gate an
objective must come from `@hotbunny/hackhub-content-sdk`'s native surface
(see `docs/mechanics-reference.md`) or a custom command built strictly on
its primitives (`Shell.addCommandData`/`Files.*`/`@RegisterCommand`) —
matching the precedent entity-resolution-mods set with `filestat`/
`bootlog`/`zgrep`. Anything outside that requires stopping to discuss with
the user first. This is explicit and repeated — not a suggestion.

## 3. Story

**GHOSTWIRE** (player alias) is an independent hacktivist/vigilante.
~8-12 months before the story starts, GHOSTWIRE's **younger sibling** died
because a ransomware attack by the syndicate **BLACKLEDGER** locked a
hospital's systems during the sibling's critical operation. The hospital
quietly paid the ransom and the official investigation was shut down fast
— corporate pressure/cover-up, not a state conspiracy — so GHOSTWIRE goes
after BLACKLEDGER personally.

BLACKLEDGER is a realistic ransomware-as-a-service **chain of roles**, not
a single flat target — this is what makes the 4 missions feel like one big
conspiracy unraveling gradually rather than four disconnected jobs.

### Characters / codenames (all locked "temporer")

| Role | Name | Notes |
|---|---|---|
| Player | **GHOSTWIRE** | Independent hacktivist/vigilante |
| Victim | GHOSTWIRE's younger sibling | Died in the hospital ransomware incident that starts the story |
| Syndicate | **BLACKLEDGER** | Ransomware-as-a-service chain |
| M1 target | **A7xDEFACE9** | Initial access broker — hex/leet-styled codename family, `A7x` prefix |
| M2 target | **A7xC0DEFACE** | Ransomware toolkit developer / affiliate-panel admin |
| M3 target | **Skynet Import-Export Co.** | Shell company laundering ransom payments — deliberate cross-mod easter egg, echoing "Skynet Logistics" from entity-resolution-mods' Q04 (separate stories, same recurring fictional corporate name) |
| M3/M4 entity | **SKN Capital Nominees** | Parent holding entity behind the shell company |
| M4 target | **"The Architect"** | BLACKLEDGER's kingpin, owner of SKN Capital Nominees |

**Mission titles (English, as of 2026-09-19):** M1 "First Trace"
(was "Jejak Pertama"), M2 "The Maker" (was "Sang Pembuat"), M3
"Money Trail" (was "Jalur Uang"), M4 "The Architect" (was "Sang Dalang"
— reuses the target's own established name rather than a fresh
translation of "the puppeteer").

A recurring anonymous dead-drop contact receives evidence at the end of
every mission via GoMail — this same contact becomes the branch point for
Mission 4's ending.

## 4. Mission breakdown

Each mission: ~9-11 objectives, matching entity-resolution-mods' Q03 depth.

### Mission 1 — "First Trace" (mechanics redesigned, 2026-09-20)

**Status: implemented, not yet re-live-tested.** The plot/target/evidence
chain is unchanged from the FINAL LOCK version live-tested on 2026-09-19;
what changed in the 2026-09-20 mechanics redesign (see
`docs/network-plan.md`) is purely technical: the broker's backend now
sits behind a `Firewall` device the player must breach first (no mission
in the campaign is allowed to be easier than "Very Hard," including this
one), every IP was redesigned (see `docs/network-plan.md` for the
current addresses — they are not repeated here to avoid two sources of
truth drifting apart), and neither `hint` nor `terminalCommand` was ever
set on this mission's objectives, so no removal was needed for those two
fields specifically. The pre-redesign implementation is kept for
reference at `src/content/m01.original.ts` / `src/main/m01-quest.original.ts`.
The original outline (before the 2026-09-19 `ftp`/`hydra`/Wireshark
pivot) is kept in this file's git history; this section describes what a
player actually experiences today.

**Target:** A7xDEFACE9 (storefront domain `verifiedaccess.mkt`), the
initial access broker who sold the hospital's network access.

**Chain (9 objectives):**
1. `Mail.Read` — a "standing instructions" mail from the recurring
   dead-drop contact (the Custodian) arrives first, revealing the report
   address once for the whole 4-mission arc, then the anonymous tip
   arrives naming two domains — one real, one a decoy.
2. **Investigate the storefront** (merged step — `nslookup`/`nmap`/
   `dirhunter`/`lynx`, no single required tool) — the storefront's home
   page is a looping, shuffled list of "lots" (fake network-access
   listings); most are dead-end decoys, and the real hospital listing
   (`OPN 102`) is deliberately marked "no longer listed" with no link,
   discoverable only via `dirhunter`.
3. **Rule out the decoy domain** (parallel, not gating) — `geoip` on the
   decoy IP proves it's an unrelated privacy-registered domain in
   Iceland, nothing to do with the case.
4. **Breach the perimeter firewall** (NEW, 2026-09-20) — `nmap`-ing the
   broker's backend shows its SSH port `FILTERED`, not open: a separate
   `Firewall` device on the same router is dropping the connection. The
   same `python3 jwt_decoder.py <token>` run that already recovers the
   broker's password now also recovers a `failover_gateway` IP in the
   decoded payload — that's the firewall, SSH-able with the same
   recovered credential. Breaching it lifts the block on the backend's
   SSH port.
5. **Access the broker's server via SSH** (merged step, replacing the
   original `ftp`+`hydra` chain entirely) — the real `OPN 102` listing
   page hints at a plaintext session cookie; the actual credential comes
   from a leaked `access.log` page (found via `dirhunter`, listing all
   lot paths' session cookies, only one of which is real) → `openssl -dec`
   the matching cookie isn't needed here (that's step 6) — running
   `python3 jwt_decoder.py <token>` on the real one mails back the
   broker's SSH password → `ssh` in, now that step 4 has opened the port.
6. **Find something suspicious on the server** — `ls`/`cat` through
   `home/`/`logs/` (several decoy files mixed in) finds `ops-relay.log`,
   a base64-"encrypted" IRC credential note.
7. **Decrypt it** — `openssl -dec <base64 text>` recovers the plaintext
   IRC host/password (exact-match required, not just "ran openssl on
   something").
8. **Access the IRC channel and confirm** — `weechat` into the recovered
   channel; a seeded 14-line conversation between the broker and a
   contact confirms the buyer alias and namedrops the same plaintext-
   cookie vulnerability, corroborating everything found so far.
9. **Report** — GoMail to the Custodian, naming the broker (the `OPN 102`
   listing URL), the buyer alias (**A7xC0DEFACE**), and a case ID found on
   a separate "LedgerVault" evidence site (`x7k2m9vdlq4wnyt3.dark`,
   discovered via a throwaway reference in one of the server's log
   files) — the vault also contains a `network_map.txt` fulfilling the
   sales ledger's own mention of "requested rush turnaround on network
   map."

### Mission 2 — "The Maker"

**Status: mechanics redesigned 2026-09-20, not yet live-tested.** The
plot/chain below is unchanged; what changed (see `docs/network-plan.md`)
is purely technical: the personal workstation (step 9) now sits behind a
home Wi-Fi network cracked via `bettercap`+`fern` instead of being a
second internet-facing router, adding one objective (7 → 8). Pre-redesign
implementation kept at `src/content/m02.original.ts`/`src/main/m02-quest.original.ts`.

**Target:** A7xC0DEFACE, the ransomware toolkit developer / affiliate-panel
admin.

**Chain:**
1. Piece together a redacted hostname from Mission 1's chat log via
   `whois`.
2. `subfinder`/`dirhunter` — finds the real dev subdomain.
3. `nmap -sV` — a bare scan is insufficient (mirrors entity-resolution-mods'
   Q02 pattern; `-sV` required).
4. **Optional decoy:** a `/admin/` page found via `lynx` — pure
   atmosphere/paranoia, non-gating.
5. `sqlmap` — dumps the affiliate panel's database, which contains a row
   matching the hospital attack's exact ransom amount/date.
6. `john`/`hashcat` — cracks the admin's password hash pulled from that
   same dump.
7. `ssh` — into the dev's real server.
8. `ls`/`cat` — finds deployment logs whose timestamp matches the hospital
   incident exactly (the story's main emotional beat).
9. **First Metasploit use of the whole mod:** search/use/set/run against
   the dev's separate, better-defended personal workstation →
   `Metasploit.Rootgrab`/`Meterpreter.Connected`.
10. `Meterpreter.Download` — pulls a financial document naming a shell
    company.
11. Dead-drop mail.

### Mission 3 — "Money Trail"

**Status: mechanics redesigned 2026-09-20, not yet live-tested.** The
plot/chain below is unchanged; what changed (see `docs/network-plan.md`)
is purely technical: the finance VLAN (step 6-8) now splits across two
hosts behind a `Splitter` — the finance-server ("Coin-Drift") and the
accomplice's PC ("Faded-Ledger") — instead of one device holding
everything. Objective count unchanged. Pre-redesign implementation kept
at `src/content/m03.original.ts`/`src/main/m03-quest.original.ts`.

**Target:** Skynet Import-Export Co. (shell company).

**Chain:**
1. `nmap`+`lynx` — recon the public site.
2. `mxlookup`/`dig` — map the employee email format.
3. `lynx` — finds a public post by a finance employee that leaks a
   password pattern (used to build a wordlist, never handed over for
   free).
4. Find + `hydra`-crack the company's **pfSense** admin login (the SDK's
   real router/firewall tool — this mission is built specifically around
   it, per explicit request that Router/Firewall get real weight).
5. `PFSense.Changes` — the player must **add their own temporary
   NAT/port-forward rule** to pivot into the internal Finance VLAN (not
   handed access).
6. `bettercap` ARP-spoof + `wireshark` capture — internal traffic capture.
7. `sqlmap` — dumps the internal finance portal's wire-transfer ledger,
   which points to the parent holding entity **SKN Capital Nominees**.
8. **Optional/bonus:** browse the Finance shared drive via `explorer` (GUI
   File Explorer — this mission is also where that explicitly-requested
   tool gets real use) and find a spreadsheet corroborating the ledger,
   plus a "collateral" beat: one finance employee turns out to be an
   unwitting accomplice.
9. Player must **revert their own pfSense rule change** before leaving
   (tradecraft, not just "mission complete").
10. Dead-drop mail naming SKN Capital Nominees.

### Mission 4 — "The Architect"

**Status: mechanics redesigned 2026-09-20, not yet live-tested.** The
plot/chain below is unchanged; what changed (see `docs/network-plan.md`)
is purely technical: the VPN IP traced in step 1 is now literally the
real network's Router address (previously a disconnected OSINT-only
lead), gated behind a `Firewall`+`Splitter`, with two new honeypot decoys
("Null-Crown", "Ash-Vector") alongside the C2 host as an extra
red-herring layer. Objective count unchanged. Pre-redesign implementation
kept at `src/content/m04.original.ts`/`src/main/m04-quest.original.ts`.

**Target:** "The Architect" — BLACKLEDGER's kingpin, owner of SKN Capital
Nominees. Deliberate convergence point of all three prior threads
(Mission 2's chat-log deference to "the architect," Mission 3's pcap
capturing a recurring VPN IP that only becomes relevant now, and the
holding-entity paper trail) — designed so this feels like one conspiracy,
not four separate jobs.

**Chain:**
1. `whois`/`geoip` — on the recurring VPN IP from Mission 3's pcap.
2. `nmap -sV` — on a deliberately hardened, minimal-port target.
3. `dirhunter`/`nuclei` — finds a real CVE in the C2 dashboard's old web
   framework.
4. `metasploit` (search/use/set matching `ifconfig` LHOST/run) — for an
   initial low-priv shell.
5. A **second**, separate privilege-escalation step (`Metasploit.Rootgrab`)
   — deliberately two-stage, not one-shot.
6. `ls`/`cat` — finds a suspicious `master_identity_backup` file.
7. A custom forensic command (`attrcheck`, same lineage as
   entity-resolution-mods' `filestat`) reveals it's booby-trapped (reads
   trigger self-wipe).
8. Player must extract it *without* triggering the trap, via
   `explorer`/`ftp` raw download instead of `cat`.
9. Confirms The Architect's real identity, cross-referencing all three
   earlier threads.
10. **Final branching objective** (A/B/C `options`/`switchBranch` dialog,
    the exact pattern proven stable in entity-resolution-mods' Q03 once
    every function property is stripped from the Dialog object) sent to
    the same recurring dead-drop contact:
    - **(A)** publish everything publicly.
    - **(B)** hand it to a specific clean law-enforcement contact.
    - **(C)** GHOSTWIRE destroys BLACKLEDGER's infrastructure directly via
      the still-open Meterpreter session and tells no one.

    No "correct" ending — explicitly designed as an open player choice.

## 5. Design constraints (locked)

- Exactly 4 missions, each with a long/deep objective chain (~9-11
  objectives per mission, matching entity-resolution-mods' Q03 depth).
- Overall difficulty "Very Hard," but explicitly still uses easy tools
  (nmap/lynx/nslookup/whois/geoip) as real chain-dependencies, not just
  hard tools.
- Every mission includes at least one red-herring/decoy, or a "you must
  undo your own action" beat, to earn the Very Hard label without unfair
  difficulty.
- Custom commands are allowed if built strictly on real SDK primitives
  (`Shell.addCommandData`/`Files.*`/`@RegisterCommand`) — same precedent as
  entity-resolution-mods' `filestat`/`bootlog`/`zgrep`.
- Ending is an open player choice (A/B/C), not a fixed "correct" outcome.

## 6. Decisions made and why

- **Fully separate from entity-resolution-mods** — that project's hacking
  mechanics/story are considered a weak first attempt (built with a
  different AI tool); this is a from-scratch redo built properly,
  reusing only the same underlying SDK/engine.
- **Names went through several rounds before locking:**
  - M1/M2 codenames tried `0x`-prefixed words (e.g. DEFACE/FORGE/CODEFACE)
    before the prefix was swapped to `A7x`.
  - M3's shell company went through more generic options ("Trade
    Solutions"/"Commercial Partners") before landing on **Skynet
    Import-Export Co.** specifically because it's more transparent about
    its business type, and deliberately reuses "Skynet" as the cross-mod
    nod to entity-resolution-mods' Q04.
  - **SKN Capital Nominees** had a brief moment of the user seeming
    unsure — they explicitly confirmed satisfaction with it afterward; do
    not re-litigate this.
- **Genre/POV/plot-structure/ending** were each chosen via explicit
  selection over alternatives offered and rejected: corporate-insider,
  state-conspiracy, and personal-revenge genre options; contractor/
  insider/agent POV options; single-org and single-individual plot-
  structure options; "leans toward revenge" and "leans toward public
  exposure" ending options.

## 7. Open items for implementation

Not yet decided/built — track progress here as missions move from design
to code:

- [x] **M1 "First Trace" — FINAL LOCK, live-tested and confirmed playable
  end-to-end (2026-09-19).** `ftp`/`hydra` dropped entirely from the
  objective chain after 6+ unresolved routing-bug attempts (see
  `docs/bugs.md` entries 4-6 for the eventual root cause and fix — a
  Router-wrapping-child-Device network shape). `Wireshark`/
  `Http.Intercepted` were also tried and dropped for the session-cookie
  step (entries 8-9); replaced by an `openssl`-decrypt mechanic confirmed
  against the base game's own official tutorial quest. Final chain
  described in section 4 above.
  **2026-09-20 mechanics redesign applied on top of this** (see
  `docs/network-plan.md`): added a perimeter `Firewall` device (8 → 9
  objectives), redesigned every IP/`lanIp`, moved network/domain/cookie
  registration from `OnStart` into an idempotent `OnObjectivesStart`
  reconcile (destroy-then-recreate, matching the pattern `docs/bugs.md`
  entry 3 documents) so future tweaks take effect on restart without
  abandoning the quest. `tsc --noEmit` clean; **not yet re-live-tested in
  HackHub** — do that before considering M1 done again.
- [x] M2 "The Maker" — mechanics redesigned 2026-09-20 (`src/content/m02.ts`,
  `src/main/m02-quest.ts`, `src/websites/m02/a7xcodeface/`), not yet
  live-tested in-game. `tsc --noEmit` clean, independent code-reviewer
  pass run. Workstation now sits behind a `Network.createWifiNetwork` AP
  (Router-wrapping-child-Device shape applies automatically, per
  `bugs.md` entry 5) instead of the flat internet-facing router the
  pre-redesign version used.
- [x] M3 "Money Trail" — mechanics redesigned 2026-09-20 (`src/content/m03.ts`,
  `src/main/m03-quest.ts`, `src/websites/m03/skynet-importexport/`), not
  yet live-tested in-game. `tsc --noEmit` clean, independent code-reviewer
  pass run. pfSense's finance VLAN already used the correct
  Router-wrapping-child-Device shape pre-redesign; now wraps a `Splitter`
  with two Devices instead of one flat Device.
- [x] M4 "The Architect" — mechanics redesigned 2026-09-20 (`src/content/m04.ts`,
  `src/main/m04-quest.ts`, `src/websites/m04/architect-c2/`,
  `src/commands/attrcheck.ts`), not yet live-tested in-game. `tsc --noEmit`
  clean, independent code-reviewer pass run. The pre-redesign version had
  the C2 host as a flat top-level `Router` with direct SSH access — the
  exact broken shape `bugs.md` entry 5 documents — now fixed by nesting it
  under a `Firewall`+`Splitter` hierarchy as part of the same redesign.
- [x] Manifest permission review — M1's `ssh`/`weechat`/`openssl`, M2's
  metasploit/meterpreter/sqlmap/john/subfinder/bettercap/fern (Wi-Fi
  added 2026-09-20), M3's pfSense/bettercap/wireshark/explorer, and M4's
  metasploit/nuclei/explorer/honeypot-mail are all now implemented and
  re-audited against `manifest.json`'s `permissions` array (`filesystem,
  network, events, mail, bank, shell, ui`). Every one of these rides on
  `Network.*`/`Shell.*`/`Mail.*` namespaces already covered by that same
  7-permission set — `Network.createWifiNetwork`/`connectWifi` are no
  exception, there is no separate Wi-Fi-specific permission scope in the
  SDK. No manifest change needed.
- [x] Websites needed: A7xDEFACE9's storefront/panel (M1),
  A7xC0DEFACE's dev-notes site + decoy `/admin/` (M2), Skynet
  Import-Export's public site (M3 — the internal finance portal is
  reached by pivot + `sqlmap`/`explorer`, not a browsable `Website`), The
  Architect's C2 dashboard + hidden `/legacy-cms/` (M4). All built.
- [x] Custom commands needed: `attrcheck` for M4's booby-trapped file,
  built (`src/commands/attrcheck.ts`). No `salesledger`-style command was
  needed for M1 in the end — `cat` against the ledger file covered it.
- [ ] Full live-test pass for M2, M3 and M4 — none of the three has been
  played yet. Several mechanics were implemented against real SDK event
  shapes but without a working precedent in this project (unlike M1's
  nmap/hydra/ssh/ftp/weechat, which entity-resolution-mods had already
  used): `PFSense.Changes` (no `ip` field on the event itself — gated on a
  login flag instead), `Wireshark.Started` filtering, `Subfinder.Results`
  auto-discovery of a registered subdomain, `Nuclei.Results` against a
  vulnerability tagged via `Network.setVulnerabilities`, and the
  low-priv-shell-then-`Rootgrab` two-stage Metasploit flow. The
  2026-09-20 mechanics redesign adds more of these: M2's `Fern.FindPassword`/
  `Network.WifiConnected` gating, and M4's `Firewall` rule reaching a
  `Device` nested inside a sibling `Splitter` (untested — see
  `docs/network-plan.md`'s M4 section for the fallback if it doesn't). See
  `docs/scratch.md` for the full list of deviations/assumptions pending
  confirmation once each mission is actually played.

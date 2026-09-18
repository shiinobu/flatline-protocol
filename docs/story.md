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

A recurring anonymous dead-drop contact receives evidence at the end of
every mission via GoMail — this same contact becomes the branch point for
Mission 4's ending.

## 4. Mission breakdown

Each mission: ~9-11 objectives, matching entity-resolution-mods' Q03 depth.

### Mission 1 — "Jejak Pertama"

**Target:** A7xDEFACE9, the initial access broker who sold the hospital's
network access in the first place.

**Chain:**
1. `Mail.Read` — anonymous tip arrives (domain only, no IP).
2. `nslookup` — resolve the domain to an IP.
3. `nmap` — scan the resolved IP.
4. `dirhunter` — finds a hidden `/internal-ops/` path.
5. **Optional/red-herring:** the tip also contains a second, unrelated
   decoy domain that must be ruled out via `whois`/`geoip`.
6. `lynx` — reads a "verified access for sale" listing that name-drops the
   hospital-sector sale.
7. `ftp` — downloads a leaked sample wordlist mentioned on that page.
8. `hydra` — brute-forces the broker's SSH panel using that wordlist (the
   wordlist is earned via the chain above, never handed to the player for
   free).
9. `ssh` — connects using the cracked credentials.
10. `ls`/`cat` (or a custom `salesledger`-style command) — finds the
    transaction row naming the buyer alias **A7xC0DEFACE**.
11. A stored `weechat` log confirms it and hints at "a new build."
12. GoMail to the recurring anonymous dead-drop contact.

### Mission 2 — "Sang Pembuat"

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

### Mission 3 — "Jalur Uang"

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

### Mission 4 — "Sang Dalang"

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

- [x] M1 "Jejak Pertama" — implemented (`src/content/m01.ts`,
  `src/main/m01-quest.ts`, `src/websites/a7xdeface9/`), not yet
  live-tested in-game. See `docs/scratch.md` for SDK-accuracy deviations
  from this doc's literal tool sequence, pending live-test confirmation.
- [ ] M2 "Sang Pembuat" — not started.
- [ ] M3 "Jalur Uang" — not started.
- [ ] M4 "Sang Dalang" — not started.
- [ ] Manifest permission review once M1's `ftp`/`weechat` and M3's
  pfSense usage are actually implemented, to confirm the current
  `permissions` array (`filesystem, network, events, mail, bank, shell,
  ui`) is complete and nothing extra is required.
- [ ] Websites needed: A7xDEFACE9's storefront/panel (M1), A7xC0DEFACE's
  affiliate panel + dev server presence (M2), Skynet Import-Export's
  public site + internal finance portal (M3), The Architect's C2
  dashboard (M4).
- [ ] Custom commands needed: a `salesledger`-style command for M1
  (optional, could also just be `ls`/`cat` against a file), `attrcheck`
  for M4's booby-trapped file.

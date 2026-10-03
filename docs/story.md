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
(see `docs/mechanics.md`) or a custom command built strictly on
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
| M1 target | **X7xS3NTRY9** | Initial access broker — hex/leet-styled codename, `X7x` prefix (renamed from `A7xDEFACE9` on 2026-09-22) |
| M2 target | **TR4C3#404** | Ransomware toolkit developer / affiliate-panel admin |
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

### Mission 1 — "First Trace" (redesigned twice: mechanics 2026-09-20, objective/report/entry-point 2026-09-21)

**Status: implemented across two redesign passes since the 2026-09-19
FINAL LOCK, pending an external tester's validation instead of a
developer live-test.** `src/guard/flags.ts` is currently set to
`isTester = true` with `TESTER_FOCUS_QUEST.m01 = true` for exactly that
purpose. What changed:

- **2026-09-20 (mechanics):** the broker's backend now sits behind a
  `Firewall` device the player must breach first. The original plan was
  `ssh` into that firewall directly — confirmed impossible (`ssh`
  hard-rejects any non-`Device` node; see `docs/bugs.md` entry 17) —
  replaced with `pfsense` (web-admin login) + `kimai` (a real,
  `Firewall`-only HackDB tool that leaks a signed JWT credential).
  Websites were also restructured into per-mission folders
  (`src/websites/m01/…`), and the storefront domain is `blackwire-network.mkt`
  (not `verifiedaccess.mkt`, an earlier working name).
- **2026-09-21 (objective/report/entry-point):** the 4 player-facing
  objectives were collapsed into 1 (see below); the tip email, dead-drop
  ("standing instructions"), and report were all rewritten longer/richer;
  the broker's discoverable identity was fixed from a stray placeholder
  name to **A7xDEFACE9** (matching the "A7x" codename family M02's target
  also uses); LedgerVault was rebuilt into an interactive file-browser
  page and its domain reveal was moved into the IRC chat (see step 7);
  and the mission now starts from a Hackhub feed post instead of
  auto-starting.
- **2026-09-22 (broker rename / listing randomization):** the broker
  alias was renamed **X7xS3NTRY9** and moved off blackwire onto its own
  infrastructure (`x7xsentry9.tech`, found via `lynx <alias>`); the real
  listing became one of 18 per-save randomized SOLD listings across three
  marketplaces. Full detail in `docs/changelog.md` (2026-09-22) and
  `docs/bugs.md` entries 20 and 21.

The pre-redesign implementation is kept for reference at
`src/content/m01.original.ts` / `src/main/m01.original.ts`.

**Target:** X7xS3NTRY9, the initial access broker who sold the hospital's
network access. They sell through three marketplaces
(`blackwire-network.mkt`, `frostgate-exchange.mkt`, `obsidian-access.mkt`)
and run their own infrastructure on `x7xsentry9.tech`. Their vendor
handle is printed on the one real listing page, hidden among 18
per-save randomized SOLD listings (see the 2026-09-22 note above).

**Entry point:** GHOSTWIRE's own Hackhub feed post is how the player
discovers and claims this mission (`AutoStart` is off). Once claimed, a
"standing instructions" mail from the recurring dead-drop contact (the
Custodian) arrives, then the anonymous tip naming two domains — one
real, one a decoy.

**Player-facing objective (1, not 9):** "Track down the broker who sold
access to the hospital's network, get into their operation, and trace it
back to their hidden archive -- then report what you find to the dead
drop." Every step below still has to happen mechanically — per this
project's "full mechanic, not full objective" rule, they just don't each
get their own objective checkpoint anymore.

**Mechanical chain (same substance, one step reordered):**
1. **Investigate the storefront** (merged step — `nslookup`/`nmap`/
   `dirhunter`/`lynx`, no single required tool) — the storefront's home
   page is a looping, shuffled list of "lots"; most are decoys, and the
   real hospital listing (`OPN 102` / `MED-SEA-0417`) is marked "no
   longer listed" with no link, discoverable only via `dirhunter`.
2. **Rule out the decoy domain** (parallel, not gating) — `geoip` on the
   decoy IP proves it's unrelated.
3. **Breach the perimeter firewall** — `python3 kimai.py <firewall ip>`
   leaks a signed JWT off the `Firewall` node; `python3 jwt_decoder.py
   <token>` decodes it into a `pfsense` login credential; logging into
   `pfsense` and making any change there lifts the block on the backend's
   SSH port.
4. **Access the broker's server via SSH**, now that the port is open.
5. **Find something suspicious on the server** — `ls`/`cat` through
   `home/`/`logs/` (several decoy files mixed in) finds `ops-relay.log`,
   a base64-"encrypted" IRC credential note.
6. **Decrypt it** — `openssl -dec <base64 text>` recovers the plaintext
   IRC host/password.
7. **Access the IRC channel** — `weechat` into the recovered channel; a
   seeded conversation between the broker and a contact confirms the
   buyer alias (**TR4C3#404**) and, near the end, casually reveals the
   LedgerVault domain split across two lines ("mirror's still on
   x7k2m9vdlq4wnyt3, right?" / "the .dark one? yeah, hasn't moved in
   months") — moved here in the 2026-09-21 pass specifically so the vault
   can't be found any other way (a backend cron log and a Twotter post
   that used to leak it in plain text were both scrubbed).
8. **Visit LedgerVault** (`x7k2m9vdlq4wnyt3.dark`) — a hard-gated,
   mechanically-checked step (`Browser.Meta` sets `vaultVisited`; the
   final report is refused if this never happened, regardless of whether
   its field values are otherwise correct). Rebuilt in the 2026-09-21
   pass into an interactive file-browser page with real evidence images;
   contains the `network_map.txt`/`case_id.txt` content plus Q1/Q2/Q3
   "project" folders showing BLACKLEDGER's own multi-year pattern
   (Northstar Port Authority 2020, Rheinland Energie AG 2023, this
   hospital case).
9. **Report** — GoMail to the Custodian with 6 fields: `Listing`
   (the per-save winning listing code), `Broker` (`X7xS3NTRY9`), `Buyer` (`TR4C3#404`),
   `Case` (`CASE-A7X-0417`), `Project` (`Q3-2026-SEA`), `Vault`
   (`x7k2m9vdlq4wnyt3.dark`).

### Mission 2 — "The Maker"

**Status: redesigned again 2026-09-24 and live-tested end-to-end that day
(`docs/m02-playtest.md` is the current step-by-step and topology); a
2026-09-29 follow-up (one money model shared with M3, BACKTRACE one key per
action) is not yet live-tested.** The chain below still describes the
2026-09-20 shape: since then the home Wi-Fi (`bettercap`+`fern`) was replaced
by a `sync-home.txt` lead on the rooted devbox, `subfinder`/`nuclei` triage
across three candidate hosts was added, and the home network became a
Splitter with a real NAS and four decoys — the chain below is only patched
for the money and the `open` step (5, 9, 10), read the playtest for the
rest. Pre-redesign
implementation kept at `src/content/m02.original.ts`/`src/main/m02.original.ts`.

**Target:** TR4C3#404, the ransomware toolkit developer / affiliate-panel
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
   matching the hospital attack's exact ransom amount/date ($2,850,000,
   2026-08-14, batch `PB-2608-01`). It holds three batches in all (the
   others are `LOG-EU-2209` and `FIN-NA-0091`), each with the panel's 25%
   share — the same money M3 follows out of the shell company
   (`src/content/global/finance.ts`).
6. `john`/`hashcat` — cracks the admin's password hash pulled from that
   same dump.
7. `ssh` — into the dev's real server.
8. `ls`/`cat` — finds deployment logs whose timestamp matches the hospital
   incident exactly (the story's main emotional beat).
9. **First Metasploit use of the whole mod:** search/use/set/`exploit`
   (there is no `run`) against the dev's separate, better-defended personal
   workstation → `RemoteConnection.Established` (a plain `exploit` never
   raises `Meterpreter.Connected`, `bugs.md` #29).
10. `open` the workstation's files at the `meterpreter >` prompt (`cat` only
    reads `.txt`/`.log`; `download` is optional) — `wire_authorization.pdf`
    names the shell company, the batch and its amount.
11. Dead-drop mail.

### Mission 3 — "Money Trail"

**Status: redesigned 2026-09-28 (branch `clouds-modify`), pass 2 after the
first live-test, plus a 2026-09-29 follow-up (one money model shared with
M2, `open` checkpoints, BACKTRACE one key per action) — none of it
re-tested in-game (`tsc --noEmit` is clean).** Deepened to match M1/M2: a
real Metasploit exploitation chain against a hardened internal gateway, two
Twotter personas (Reyes + a red-herring), three decoys, and a capture that
genuinely produces M4's lead. Objectives collapsed to a **single**
`reportFindings`, matching M1/M2. Engine-level detail and every unverified
assumption: `docs/scratch.md` (last two sections); topology:
`docs/network.md`; step-by-step: `docs/m03-playtest.md`. Pre-2026-09-20
implementation kept at `src/content/m03.original.ts`/`src/main/m03.original.ts`.

**Target:** Skynet Import-Export Co. (shell company), BLACKLEDGER's
laundering front — defended like a real corporate target: OSINT-hardened
credentials, a NAT-gated internal VLAN, and a separately-exploited tunnel
gateway, not a company that falls to one leaked password.

**Cast:** **Dana Reyes** (`@d.reyes`), finance analyst and unwitting
accomplice — careless in public (her Twotter leaks the *shape* of the
corporate password recipe and her own personal-password habit), uneasy in
private (a note on her share, `do_not_open_at_work.txt`, lists what she's
"not supposed to have noticed," including the finance box tunnelling out
after every batch). She ties the numbers anyway: kids, a paycheck.
**Marcus Okafor** (`@m.okafor`), facilities — a red herring: brags about
"running the building" and access he admits he doesn't have, and posts a
guest-wifi password that looks like the corporate pattern but leads
nowhere.

**Chain (all one objective underneath):**
1. `nmap`+`lynx` on the public site — staff directory names `@d.reyes`
   (real lead) and `@m.okafor` (**decoy route**), plus a remote-access
   portal, the trading name "Skynet", and a "policy in force since 2024"
   footer.
2. **Multi-step password deduction:** Reyes's Twotter gives the FORMAT
   (short name + policy year + "!", one word, capitalized); the site gives
   the SHORT NAME ("Skynet") and the POLICY YEAR (2024). Combine →
   `Skynet2024!`. No single line hands it over; Okafor's `SkynetGuest2019`
   is a decoy that fails.
3. `nslookup remote.skynet-importexport.biz` → the remote-access gateway (a
   TP-Link router panel — `bugs.md` #31); `mxlookup` maps the mail host.
4. Into the gateway's admin panel (deduced password, or `hydra -T
   <ip>:80 -P wordlist.lst` — no `-l` needed: the engine defaults it to
   `guest`, the fixture answers to `guest` as well as `admin`, and the
   success table prints `admin`) and **write the port-forwarding rules
   yourself** to pivot — the table starts with only the locked admin rule and
   nothing behind the gateway answers until a rule matches a host and its
   service. The public site's Staff access notice names each host with its
   port; `python3 net_tree.py <gateway ip>` gives each host's name, public IP
   and LAN IP (the Local IP the rule needs).
5. The VLAN's devices are reached by their **public** IPs (a LAN IP only
   works inside an SSH session): `python3 net_tree.py <gateway ip>` lists
   them, and the site's Staff access notice names the roles → `Coin-Drift`
   (ledger DB, `ledger.skynet-importexport.biz`), `Faded-Ledger` (Reyes),
   `Vault-Line` (the tunnel gateway), and `Split-Bill` (empty **decoy**).
6. `sqlmap` the ledger host — `wire_transfers` is a 12-row ledger with a
   running balance (see the money below) that names **SKN Capital
   Nominees**; `helpdesk_resets` leaks d.reyes's personal SMB password.
   (Or connect the **DatabaseManager** app with creds lifted from the
   gateway config — an alternative route to the same ledger.)
7. *(Removed 2026-09-29.)* A Wireshark step used to hand out a `.pcap` naming
   the DB server, the gateway and the tunnel endpoint. It was weird to play
   and, worse, a silent requirement of the report (`bugs.md` #34). The
   Staff access notice now carries the ledger domain, and the tunnel endpoint
   comes from the gateway's own config.
8. **Metasploit** the hardened gateway `Vault-Line` (RDP RCE:
   `use exploit/rdp/cve_2019_0708_bluekeep`, `RHOST` = the public IP,
   `Version 7.1.9`, `exploit`) → Meterpreter (`rootgrab /etc/passwd` works, the
   gateway has a `root` user, but nothing in the mod reacts to it) →
   `cat site_to_site_backup.txt` (a plain `.txt` at the session's root; no
   download) → its config peers to the VPN IP, labelled `SKN-CENTRAL`, owner
   `SKN Capital Nominees`: proof the money's destination and the tunnel's far
   end are one hand, and M4's lead.
9. **Optional/bonus:** SSH into Reyes's account (`ssh -h d.reyes@<public ip>`
   with the password from `helpdesk_resets`, after a rule `22 → 22 →
   192.168.1.4`) — the engine has no SMB command, and `explorer` raises its
   event only from Meterpreter/`evil-rm` (`bugs.md` #33). Reading her note
   (`do_not_open_at_work.txt`) writes the personal log; the spreadsheet is the
   other file.
10. *(Dropped 2026-09-29.)* The first version made the player take their own
    forwarding rules back out before the report was accepted. The rules now
    stay where the player leaves them — the tip mail calls it "yours to keep or
    remove" — and the report waits only for the ledger and the config.
11. Dead-drop mail: shell company, parent entity, and the recurring
    tunnel endpoint.

**The money (one model for M2 and M3, `src/content/global/finance.ts`):** BLACKLEDGER
splits every ransom batch the same way — 60% to SKN Capital Nominees (booked as
a "management fee", the Architect's cut), 25% to TR4C3404 Consulting
("consulting fees (logistics)", the toolkit developer), 5% to X7xSentry9
Brokerage ("customs brokerage", the M1 broker) and 10% kept by Skynet. Three
batches pass through the shell company: `LOG-EU-2209` $1,400,000 (2026-05-02),
`FIN-NA-0091` $4,100,000 (2026-07-22) and `CASE-A7X-0417` $2,850,000
(2026-08-14, the hospital) — $8,350,000 in, $5,010,000 to the parent. M2 shows
the gross and the panel's share; M3's `wire_transfers` shows the whole
waterfall (deposit at 09:04 UTC, then transfers out at 09:20, 09:24 and 09:27,
balance ending at the retained $835,000), Reyes's `q3_reconciliation.xlsx`
covers the two Q3 batches ($6,950,000 in, $4,170,000 to the parent), and the
report states it in its "Funds" lines. The tip mail names the $2,850,000
batch. That the money ends at one nominee, and the tunnel's far end belongs to
the same nominee, is what M4 builds on.

### Mission 4 — "Burn Notice" (built 2026-10-02, redesigned and FINAL LOCK 2026-10-03)

The decisions are in `docs/world-building/README.md` #42-#47 and the full specification in
`docs/world-building/10-spec-m4.md`; this section keeps the reasons that did not fit a decision row.

**Shape.** The Custodian, silent since M1, writes first: something is wrong, stay off the endpoint. Twenty seconds
after the mail is read a 60 second `broadcast` countdown starts (a `wall` message from `sentry@darknull.io`, a remote
clock running 03:13:07 to 03:14:07), and at zero the desktop is taken. The attacker "took the room, not the money": the
owner's own live test showed that a version which cost money on every expiry punished waiting three times over, so
attack 1 cannot be repelled, costs nothing and always lands. A defensive mechanic may come back in M7 as something else.
The player rebuilds the display in a full-screen recovery console that works on real kernel files (module, `display.conf`,
initramfs, three staged images), then hunts the operator back through the relays, ending the hunt on the control host.
The report goes to the dead drop.

**Why the chain has a parallel pair.** `relayProfiled` requires both `incidentLogRead` and `desktopRestored`. A player who
repairs the desktop by trying all three builds without reading the log still reaches step 7 once they read it, and the
other way round; neither order stalls.

**Why `auth.log` has five outbound sessions.** The discriminator is the clock, not the hostname: only Quiet-Mirror is
`ESTABLISHED` at 03:14:06, the minute the incident log stamps. Paper-Moth appears twice as a probe that forwarded 0 bytes,
once at 03:14:41, close enough to look tempting and late enough to be wrong. Three keepalives sit before 03:00. All times
come from `docs/world-building/13-story-timeline.md` §E.

**Why the incident log outlives the rebuild.** The breach files are purged when the display is rebuilt, except
`/var/log/flcomp-incident.log`: steps 5 to 7 need the two addresses it names (the session source and the NAT gateway).

**Why the clue logs are Log Viewer entries.** Players open files in the Files app as readily as with `cat`, so reading a
clue by `cat`, `open` or the Log Viewer counts the same (`docs/bugs.md` #56). `firewall.log` is written after the rebuild:
the attacker's mail says "you will find me in your own firewall log afterwards".

**Why `flatline`.** The control host beacons every 60 seconds (`beacon_interval` in `watchdog.conf`); cutting it means
that heartbeat dies. The command used to be `repel`. Its only in-world hint is the last comment line of `watchdog.conf`,
and it refuses to cut Night-Shift before the origin is linked, so the animation (five `beacon` pulse lines shrinking to
flat) never plays for nothing.

**The kit is mission-blind.** The breach lives at one well-known `SaveStorage` key (`flatline.desktopBreach`) with the
owning mission inside the record, while the intrusion state keeps a per-mission prefix plus a pointer key; so the same
`sysdiag`, `sysrepair` and `flatline` commands serve M4 and M7 and no command imports mission content.

### Mission 4 (old numbering) — "The Architect" (now Mission 7)

**Renumbered 2026-10-02:** this finale became **M7** when the new M4 took the id (`docs/world-building/README.md` #4).
The text below is kept as written.

**Status: mechanics redesigned 2026-09-20, not yet live-tested.** The
plot/chain below is unchanged; what changed (see `docs/network.md`)
is purely technical: the VPN IP traced in step 1 is now literally the
real network's Router address (previously a disconnected OSINT-only
lead), gated behind a `Firewall`+`Splitter`, with two new honeypot decoys
("Null-Crown", "Ash-Vector") alongside the C2 host as an extra
red-herring layer. Objective count unchanged. Pre-redesign implementation
kept at `src/content/m04.original.ts`/`src/main/m04.original.ts`.

**Target:** "The Architect" — BLACKLEDGER's kingpin, owner of SKN Capital
Nominees. Deliberate convergence point of all three prior threads
(Mission 2's chat-log deference to "the architect," Mission 3's gateway
config naming a recurring VPN IP that only becomes relevant now, and the
holding-entity paper trail) — designed so this feels like one conspiracy,
not four separate jobs.

**Chain:**
1. `whois`/`geoip` — on the recurring VPN IP from Mission 3's gateway config.
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
- **M1's LedgerVault (`x7k2m9vdlq4wnyt3.dark`) is deliberately left with
  no `Network.createSubnetNetwork`/`nmap` fixture** — modeled as a Tor-style
  hidden service that ordinary IP-based scanning can't reach, not an
  oversight. Confirmed explicitly by the user (2026-09-22/23) rather than
  fixed under the new port-443-realism rule (`docs/rules.md`
  §12).
- **M1's PacificCare Health (`pacificcare-health.org`) website exists in
  source (`src/websites/m01/pacificcare-health/`) but is deliberately not
  wired into the quest's network at all yet** — its domain is unreachable
  in-game on purpose; confirmed by the user (2026-09-22/23) as "not used
  yet," not a bug, and left for a future pass.

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
  `docs/network.md`): added a perimeter `Firewall` device (8 → 9
  objectives), redesigned every IP/`lanIp`, moved network/domain/cookie
  registration from `OnStart` into an idempotent `OnObjectivesStart`
  reconcile (destroy-then-recreate, matching the pattern `docs/bugs.md`
  entry 3 documents) so future tweaks take effect on restart without
  abandoning the quest.
  **2026-09-21 objective/report/entry-point pass applied on top of
  that:** the 4 objectives collapsed to 1 (`reportFindings` only, see
  section 4 above); the storefront's `ssh`-into-firewall step (already
  known impossible) was replaced with `pfsense`+`kimai`; tip/dead-drop/
  report content rewritten and the report gained 3 new fields (`Listing`,
  `Project`, `Vault`); broker identity fixed from a stray placeholder to
  **A7xDEFACE9**; LedgerVault rebuilt into an interactive page and its
  domain reveal moved into the IRC chat, gated behind a new hard
  `vaultVisited` check on the final report; and the mission now starts
  from a Hackhub feed post (`AutoStart` off) instead of auto-starting.
  `tsc --noEmit` clean; `isTester`/`TESTER_FOCUS_QUEST.m01` is currently
  on so an external tester can validate this pass — **do not mark FINAL
  LOCK again until their results come back.**
- [x] M2 "The Maker" — mechanics redesigned 2026-09-20 (`src/content/m02.ts`,
  `src/main/m02.ts`, `src/websites/m02/a7xcodeface/`), not yet
  live-tested in-game. `tsc --noEmit` clean, independent code-reviewer
  pass run. Workstation now sits behind a `Network.createWifiNetwork` AP
  (Router-wrapping-child-Device shape applies automatically, per
  `bugs.md` entry 5) instead of the flat internet-facing router the
  pre-redesign version used.
- [x] M3 "Money Trail" — mechanics redesigned 2026-09-20 (`src/content/m03.ts`,
  `src/main/m03.ts`, `src/websites/m03/skynet-importexport/`), not
  yet live-tested in-game. `tsc --noEmit` clean, independent code-reviewer
  pass run. pfSense's finance VLAN already used the correct
  Router-wrapping-child-Device shape pre-redesign; now wraps a `Splitter`
  with two Devices instead of one flat Device. **Redesigned again
  2026-09-28** (branch `clouds-modify`, two passes: four Devices incl. a
  Metasploit tunnel gateway, NAT-gated ports, `192.168.1.x` LAN, capture →
  M4 lead, collapsed to one objective) — see §4 and `docs/scratch.md`; not
  yet live-tested. **Follow-up 2026-09-29:** one money model shared with M2
  (`src/content/global/finance.ts`, a 12-row ledger), the capture/config read with
  `open` (`.pcap`/`.conf`), hydra's default `guest` user, a `root` user on
  the gateway, and BACKTRACE's M3 keys/report; `tsc --noEmit` clean, not
  played. **Late 2026-09-29:** the gateway is a TP-Link `Router` panel (not a
  pfSense), so the pivot is now player-written port-forwarding rules completed
  through `Network.PortChanges` (`bugs.md` #31); not played.
- [x] M4 "The Architect" — mechanics redesigned 2026-09-20 (`src/content/m04.ts`,
  `src/main/m04.ts`, `src/websites/m04/architect-c2/`,
  `src/commands/attrcheck.ts`), not yet live-tested in-game. `tsc --noEmit`
  clean, independent code-reviewer pass run. The pre-redesign version had
  the C2 host as a flat top-level `Router` with direct SSH access — the
  exact broken shape `bugs.md` entry 5 documents — now fixed by nesting it
  under a `Firewall`+`Splitter` hierarchy as part of the same redesign.
- [x] Manifest permission review — M1's `ssh`/`weechat`/`openssl`, M2's
  metasploit/meterpreter/sqlmap/john/subfinder/bettercap/fern (Wi-Fi
  added 2026-09-20), M3's pfSense/hydra/sqlmap/wireshark/metasploit/
  meterpreter/explorer (bettercap removed, metasploit added — M3 redesign
  pass 2, 2026-09-29, see `bugs.md`/`changelog.md`), and M4's
  metasploit/nuclei/explorer/honeypot-mail are all now implemented and
  re-audited against `manifest.json`'s `permissions` array (`filesystem,
  network, events, mail, bank, shell, ui`). Every one of these rides on
  `Network.*`/`Shell.*`/`Mail.*` namespaces already covered by that same
  7-permission set — `Network.createWifiNetwork`/`connectWifi` are no
  exception, there is no separate Wi-Fi-specific permission scope in the
  SDK. No manifest change needed.
- [x] Websites needed: M1's marketplaces, ClearEscrow and LedgerVault,
  TR4C3#404's dev-notes site + decoy `/admin/` (M2), Skynet
  Import-Export's public site (M3 — the internal finance portal is
  reached by pivot + `sqlmap`/`explorer`, not a browsable `Website`), The
  Architect's C2 dashboard + hidden `/legacy-cms/` (M4). All built.
- [x] Custom commands needed: `attrcheck` for M4's booby-trapped file,
  built (`src/commands/attrcheck.ts`). No `salesledger`-style command was
  needed for M1 in the end — `cat` against the ledger file covered it.
- [ ] Full live-test pass for M4. M2 was played end-to-end on 2026-09-24
  (`docs/m02-playtest.md`) and again on 2026-10-01 after its pipeline
  migration; that run proved most of what this bullet used to list as
  unproven — `PFSense.Changes` gated on a login flag, `Subfinder.Results`,
  `Nuclei.Results`, Metasploit (a plain `exploit`, not a low-priv shell then
  `Rootgrab`) — plus `Network.openPort()` on a device two levels deep. M3 was
  played end-to-end on 2026-10-01 after its pipeline migration (the log shows
  every BACKTRACE key traced and `m3 -> complete`): the panel is a TP-Link
  page whose Save raises `Network.PortChanges`, not `PFSense.*`, so the pivot
  is built around player-written forwarding rules (`bugs.md` #31). Its one
  stall, `rootgrab` having become a gate prerequisite, was fixed the same day
  (it is optional again).
  M4 has not been played: its `Firewall` rule reaching a `Device` nested
  inside a sibling `Splitter` is untested (see `docs/network.md`'s M4
  section for the fallback if it doesn't), and its `initialShellAccess`
  listens to an event a plain `exploit` never raises (`docs/bugs.md` #29).
  See `docs/scratch.md` for the full list of deviations/assumptions pending
  confirmation once each mission is actually played.

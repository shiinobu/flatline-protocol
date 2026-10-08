# FLATLINE PROTOCOL — Story and case guide

Status: current as of 2026-10-08 (release 2.1.0). This is the story canon and a short solution guide for each case. **It spoils the
whole plot and every solution.** Everything in it is fiction: every company, person, host, address, domain and password is invented,
and the tools are simulated by the game.

How the other documents fit: `docs/network.md` lists the hosts and addresses of each case, `docs/mechanics.md` the game tools and the
custom commands, `docs/rules.md` the process and structure rules, `docs/architecture.md` how `src/` fits together, `docs/bugs.md` the
engine facts and the mod's own findings.

---

## 1. Premise

- **Genre:** cybercrime syndicate, a ransomware-as-a-service chain. **POV:** GHOSTWIRE, an independent hacktivist with no employer and no
  client. **Plot:** one conspiracy that unravels over seven cases, each a step up the chain, not seven separate jobs.
- **Difficulty:** "Very Hard", built from easy tools used as real chain dependencies (nmap, lynx, nslookup, whois, geoip) plus the harder
  ones. Every case has at least one decoy or a "look before you touch" trap.
- **Ending:** an open player choice (publish, hand over, destroy), never a "correct" one (section 5).
- **Tools:** everything that gates a step comes from the SDK's native surface (`docs/mechanics.md`) or from a custom command built on its
  primitives. Anything outside that is discussed with the owner first.

## 2. Timeline

The attack on PacificCare Health hit on **2026-08-14**, the investigation closed on 2026-08-24, and the story opens on **2026-09-18**:
five weeks after the attack, ten days after the case was closed. Dates in files, logs and pages come from this table, never from the
clock (`docs/rules.md`). No file may carry a date later than the story day of the case it appears in.

| Date | Event |
|---|---|
| 2009 to 2018 | Conrad Lindqvist is Chief Actuary of Nordhaven Mutual Assurance; Chairman of its Risk Committee 2018 to 2024 |
| 2020-03-19 | Evidence Q1-2020-NA, Northstar Port Authority (an earlier BLACKLEDGER job) |
| 2023-06-28 | Evidence Q2-2023-EU, Rheinland Energie AG |
| 2026-05-02 | LOG-EU-2209, batch PB-2605-01, $1,400,000 |
| 2026-06-18 and 2026-07-14 | Reserves FIN-EU-2214 and MED-APAC-6689 are set aside by the insurer, the same days as two access sales in the broker's ledger |
| 2026-06-24 | Conrad instructs Orchid to pause directory sync and loosen removable media |
| 2026-07-22 | FIN-NA-0091, batch PB-2607-01, $4,100,000 |
| 2026-08-03 | The broker sells access to the hospital (listing code per save, e.g. MED-SEA-0417); Nordhaven survey LC-07 visits PacificCare |
| 2026-08-07 and 2026-08-10 | USB access kit photographed; Roxanne posts her USB find ("Q3-2026-SEA") |
| 2026-08-11 00:12 UTC | The USB is plugged into PC-IT-017 |
| 2026-08-14 | The attack. 02:11 release approved by `sentry`, 02:41 systems locked, 05:12 "Clinical incident logged, Operating Theatre 3", 08:40 the CRO authorises payment, 09:02 ransom paid (batch PB-2608-01, CASE-A7X-0417, $2,850,000). Lock to payment: 6 hours 21 minutes |
| 2026-08-15 to 2026-08-24 | Draft finding blames a remote-support tool; Roxanne signs an acknowledgement (08-18), is dismissed (08-19); investigation closed (08-24) |
| 2026-09-18 | Story day of M1 |

Story days of the cases: M1 09-18 (Fri), M2 09-19, M3 09-21, M4 09-24, M5 09-27, M6 09-30, M7 10-03 (Sat). Attack times are UTC. Money
comes from `src/content/global/finance.ts` (one model for M2, M3, M7 and BACKTRACE).

## 3. Characters

| Who | What the canon says |
|---|---|
| **GHOSTWIRE** | The player. Never named. The younger sibling died in surgery on 2026-08-14 when the ransomware locked the hospital |
| **The Custodian** | The dead-drop contact (`drop@drop.null`) that receives every report. **Deliberately empty, no identity.** Promised to speak only if something is wrong ("I won't check in."), which pays off in M4 |
| **Unknown Sender** | Sends the M1 tip only (`ghost.tip@ghost.index`) |
| **BLACKLEDGER** | The ransomware-as-a-service syndicate. Speaks in bookkeeping: ledger, settled, escrow, "every account, settled." |
| **X7xS3NTRY9** | Initial access broker (M1). Own infrastructure on `x7xsentry9.tech`; takes 5% ("customs brokerage") |
| **TR4C3#404 / TR4C3404** | Toolkit developer and affiliate-panel admin (M2); takes 25% ("consulting fees"). Human side: a shopping list, an unsent text ("tell mom I said hi") |
| **Closer-Rig** (`Qu0taCl0ser`) | Affiliate operator "FIN-NA". Optional thread in M2 |
| **Skynet Import-Export Co.** | The shell company (M3); keeps 10%. **SKN Capital Nominees** is the parent and takes 60% ("management fee") |
| **Dana Reyes** (`@d.reyes`) | Skynet financial analyst, a reluctant witness who wrote it down first. **Marcus Okafor** (`@m.okafor`) is a red-herring |
| **Roxanne Anindita Natnaree** | PacificCare Systems Administrator ("R.a.N"). Curious about a USB marked "Q3-2026-SEA" and plugged it in. Dismissed and made the official cause; unreachable. The player never speaks to her: she is present through documents and, after M7, an epilog mail |
| **Gideon Bayu Teoh** | IT contractor at PacificCare (contract to 2026-07). A decoy on the staff page and in Twotter |
| **Vivien Orchid** | PacificCare CRO. Decided to pay and signed the finding that blames Roxanne; "staff negligence" keeps the insurance claim valid. Not the main villain: she followed Conrad's instruction of 2026-06-24 |
| **Conrad Lindqvist** | **The Architect** and `SENTRY`: the operator who approved the release at 02:11 and attacks the player in M4. Born 1967, a former actuary who prices the risk he creates; owns SKN Capital Nominees through Nordhaven Holdings (PC) Ltd |
| **Marlowe & Pryce Corporate Services** | The registered agent of SKN Capital Nominees (M6). Real, but not the owner |
| **Decoys** | Alexander Voss and Imogen Hartley (nominee directors and secretary), Tomas Brandt (a former director), Marcus Okafor, Gideon Bayu Teoh |

Names that reach M5 went through a rename on 2026-10-05: the staff roster of the PacificCare IT page lives in `src/content/m05/echoline.ts`
and the displayed names are read from constants (`GRETA_FULL_NAME`, `GRETA_SHORT_NAME`, `GRETA_PRIVATE_EMAIL` in
`content/global/characters.ts`), never retyped. Internal ids keep the old `GRETA_*` and `GARETH_*` names, the flag `gretaSeen` and the
BACKTRACE key `greta`. The portal account, the Cipher Desk key and the start of the password are the local part `rnatnaree`; her short
name is "R. Natnaree", her private mail `roxanne.natnaree@postbox.my`; Roxanne's sticky note is signed "R.a.N" (lowercase a). Report
matchers (`M05_REPORT_DOOR_TERMS`, `M05_REPORT_DOOR_REJECTED_TERMS`, `M07_REPORT_EVIDENCE_PERSON_TERMS`) are hand-written and must be
checked on any new rename (`docs/bugs.md` #69). Marcus Okafor and the Reyes household are not part of the rename.

## 4. Threads the cases pay off

Established in M1 to M3 and locked as world facts; no text of M1 to M3 is edited for later cases.

| Thread | Planted | Paid in |
|---|---|---|
| The Custodian speaks only if something is wrong | M1 standing instructions | M4 first mail |
| A forwarding rule left open is how people get found | M3 | M4 |
| "no loose ends this time" | M1 chat | M4 `old_targets.txt` ("next: prepping") |
| The sticky note signed R.a.N, the USB, badge and asset tag PC-IT-017 | M1 LedgerVault, folder Q3 | M5 |
| The hospital says only "a network issue" | M1 PacificCare site | M5 |
| Two earlier jobs: lost badges at Northstar 2020 and Rheinland 2023 | M1 | M7 survey records |
| "a second signer above the shell company"; "Architect's cut goes out same day" | M2 | M6, M7 |
| "Nominees isn't an operating company, someone real still owns it" | M3 | M6 |
| Reyes: "i want it on record that i wrote this down first" | M3 | M4 (`d.reyes: monitor`), M7 |
| `203.0.113.160`, whose whois says **Bulletproof VPN Ltd.** | M2 and M3 | M4 (control host, same registrant), M6, M7 |
| Other victims: FIN-NA-0091, LOG-EU-2209, "Q3 closes: 4" | M2 | M7 reserves |

## 5. Endings

The final question from the Custodian arrives by mail in M7 and is answered with the `choice` field of the report.

| Choice | Meaning | Effect |
|---|---|---|
| `expose` | Everyone should know what BLACKLEDGER did | Publish everything; Roxanne cleared in public, Reyes named too, Conrad open to the public, the hospital cover-up exposed |
| `handoff` | Through the system, clean | Hand it to clean law enforcement; Roxanne cleared slowly, Reyes a witness, Conrad tried, outcome uncertain, cover-up investigated |
| `destroy` | No more victims, ends tonight | The C2 network is unregistered and the encrypted ledger removed; Roxanne stays the scapegoat, Reyes untouched, Conrad not tried, cover-up stays |

Closing material per choice: a one-way epilog mail from Roxanne (publish: short, her name is clear but nothing is as before; hand-over:
careful, the process has only begun; **destroy: no mail**), a "done" mail from the Custodian ("It is out…", "It is filed…", "Someone closed
it."), six personal-log lines in BACKTRACE and the fate of the next two victims (warned in public, told quietly, or left compromised).
The effects run in the controller after the report is accepted; logs and mails are written before the objective completes.

## 6. The seven cases

Every case has **one** player-facing objective ("full mechanic, not full objective"): a report to `drop@drop.null`. Behind it a chain
of gated steps runs in order (`content/mNN/gates.ts`); a step done early records nothing, and an early report gets one "not yet" reply
with a hint. Optional steps never enter the chain. Rewards are money only: M1 to M3 1,000 each, M4 1,500, M5 2,500, M6 3,500, M7 4,500
(15,000 in all, no XP).

### M1 "First Trace" (story day 2026-09-18)

- **Start:** GHOSTWIRE's own HackHub feed post. The player applies (the claim lands after a few seconds); the Custodian's standing
  instructions arrive, then the anonymous tip naming two domains, one real and one a decoy. M1 is the only case with a post and the
  only one whose start rewrites the BACKTRACE state.
- **Chain:** read the tip; find the one real listing among 18 delisted SOLD listings spread over three marketplaces (Region SEA and
  Vendor X7xS3NTRY9; the code is rolled per save; `dirhunter` lists the pages); `lynx X7xS3NTRY9` gives `x7xsentry9.tech` and
  `subfinder` the firewall and backend hosts; **kimai** (HackDB) leaks a signed token off the firewall; `jwt_decoder.py` turns it into a
  pfSense login (`failsafe`); any saved change in the panel lifts the block on the backend's SSH port; **hydra** with the HackDB wordlist
  cracks the backend login (the user is the vendor name, not "opsadmin"); `ssh`; `sales_ledger.log` names the buyer and `ops-relay.log`
  holds a base64 blob that `openssl` decrypts into an IRC host and key; `weechat` confirms the buyer TR4C3#404 and leaks the LedgerVault
  domain split over two lines; visit **LedgerVault** and open the `Q3-2026-SEA` folder.
- **Decoys:** the "opsadmin" handle (`@cryp7net`), the frostgate storefront (ruled out with `geoip`), the three decommissioned gateways.
- **LedgerVault** (`x7k2m9vdlq4wnyt3.dark`) is a permanent domain behind its own seal, never torn down, and has no `nmap` fixture on purpose
  (a Tor-style hidden service).
- **Report:** listing code, broker `X7xS3NTRY9`, buyer `TR4C3#404`, case `CASE-A7X-0417`, project `Q3-2026-SEA`, vault domain. Refused if
  LedgerVault was never visited.

### M2 "The Maker" (2026-09-19)

- **Start:** the Custodian's mail "re: your last report" after M1.
- **Chain:** `whois` and `nmap` on `tr4c3404.dev`; `subfinder` returns 40 random-looking subdomains and `nuclei` narrows them to three
  candidates; `sqlmap` each: two are dead staging boxes, the real devbox yields the `admins` table (`root` plus a hash) and the
  `affiliates` table (three rows: LOG-EU-2209, FIN-NA-0091 and the hospital's CASE-A7X-0417 at $2,850,000, each with the panel's 25%);
  `john` cracks the admin hash; `ssh -h` into the devbox; `deploy.log` is dated 2026-08-14 and the first emotional beat; `sync-home.txt`
  leaks the home router; behind it a Splitter hides a real NAS (Rust-Bucket, `admin`/`admin`) among four decoy devices; the home pfSense
  panel accepts the devbox admin password; saving any rule opens port 3389 on the workstation; **Metasploit** (`bluekeep`, `Version` must be
  the banner's `7.1.9`, retry once if the user is not ready) opens a Meterpreter session; `open` (not `cat`) reads
  `wire_authorization.pdf`, which names the shell company.
- **Optional:** the printer (a dead prop), and the Closer-Rig bonus thread whose `routing_notes.txt` first names `203.0.113.160`.
- **Report:** developer host, shell company, ransom amount, payload `payload_v9`, the three home-path addresses.

### M3 "Money Trail" (2026-09-21)

- **Start:** the Custodian's mail "shell company confirmed, dig into it".
- **Chain:** recon of `skynet-importexport.biz` (the notice names the hosts, services and ports; the footer gives the policy year);
  OSINT: `@d.reyes` posts the password recipe (short name + year + one word + `!`), `@m.okafor` is the decoy; **hydra** on the TP-Link
  router panel with the HackDB wordlist; log in; **write the forwarding rules yourself** (nothing behind the gateway answers until you do;
  `python3 net_tree.py` lists the hosts and public addresses): `3306` to the ledger host and `3389` to the gateway host at minimum;
  `sqlmap` dumps `wire_transfers` (12 rows, three batches, 60/25/5% out of each) and `helpdesk_resets`; **Metasploit** on the tunnel
  gateway; `cat site_to_site_backup.txt` names the peer `203.0.113.160` (label `SKN-CENTRAL`, owner SKN Capital Nominees).
- **Order:** the ledger thread always comes before the gateway thread. Bonus: Reyes's host Faded-Ledger.
- **Report:** shell company, parent entity, VPN lead `203.0.113.160`, entry (the remote portal, Vault-Line, four hosts). The rules the
  player wrote stay where they were left.

### M4 "Burn Notice" (2026-09-24)

- **Start:** the Custodian breaks silence ("something's wrong"). Twenty seconds later the player becomes the target.
- **Beats:** (1) a 60-second broadcast banner from `sentry@darknull.io` with a clock that reads 03:14:07 at zero, a threatening mail
  and a refused `flatline` (this one cannot be cut); (2) the desktop is breached and a recovery console puzzle with an incident log must
  be solved (`sysdiag`, `sysrepair`); (3) the hunt back: the incident log names relay 1 (Static-Hop `141.77.202.84`, NAT gateway
  `193.164.228.17`); `whois`, `geoip` or `nmap` profile it; **hydra** on its panel gives `svc`/`relay-swap-07`; `ssh`; the `auth.log`
  has five outbound sessions and only **one** established at 03:14:06, to Quiet-Mirror `45.155.204.31`; `notes.txt` has
  `ops`/`mirror.night.9`; `watchdog.conf` names the control host `203.0.113.159`, the operator tag `SENTRY` and the teardown command;
  `whois` shows the registrant **Bulletproof VPN Ltd.**, the same as `203.0.113.160`; `flatline 203.0.113.159` ends the hunt.
- **Trap:** Paper-Moth (`194.26.192.118`, `admin`/`admin`) is a honeypot that charges up to $500 once.
- **Report:** hunter `SENTRY`, relays `Static-Hop, Quiet-Mirror`, control `203.0.113.159`, origin `Bulletproof VPN Ltd.`, contained `yes`.
  `old_targets.txt` seeds M5 ("d.reyes: monitor", a hospital job marked closed, "next: prepping").
- **Built on:** the shared kit (incident banner, desktop breach, recovery console, intrusion). Kit state and its scheduled jobs survive
  `mods.reset`, so M4's start cancels its own strike and jobs (`docs/bugs.md` #44).

### M5 "The Door" (2026-09-27)

- **Start:** the mail "the note in the vault" sends the player back to the Q3 folder; no site is named.
- **Chain (21 gated steps plus the report):** open the Q3 folder; the hospital site, its IT page and the change record SA-0826 (a
  sealed handover note); **Echoline** shows nine captures of the IT page (Roxanne is in every capture up to 2026-06-30 and gone on
  2026-08-18); `lynx rnatnaree` profiles her; **Cipher Desk** decrypts the handover note (key `rnatnaree`), then the policy IT-DEPT-77
  (key `SA-0826`), which gives the portal password recipe `<local part>-<system code>-<incident date>`; log in to the portal; flag the
  outside sign-in (`194.36.108.20`); read ticket HD-4481 (the USB nobody answered), then HD-4503 (her closure); open the 30 June change
  CHG-2606-022 (its sealed rollback plan opens with the change id) and the legal hold CHG-2608-014 (matter L-2608-03); open Systems and
  the sample token in HD-4496 (key `L-2608-03`); build the Cold-Chart token with Cipher Desk (**Encrypt**, key `L-2608-03`) and log in
  to **RDC** (`rdcdesk.io`); solve the generated display puzzle in the agent console (`signal`, `agent`) and `agent attach`; open the
  statement, the decision memo and the USB ticket (the memo shows the 02:41 to 09:02 gap).
- **Optional:** Bedside-17 (PC-IT-017) through Metasploit; the sealed Twotter note (`Marigold2019`); the LeakIndex pointer (a decoy).
- **Report:** door `Roxanne Anindita Natnaree`, cause (unauthorised USB media, employee negligence), decider `Vivien Orchid`, gap
  `6 hours 21 minutes`, motive (insurance claim classification), archive `Cold-Chart`.
- **Why it matters:** the hospital never investigated; the player learns who decided and why, and that "I know someone clean" in the
  ending has a reason.

### M6 "Open Register" (2026-09-30)

- **Start:** the mail "a door that isn't on any map". **No network:** pure analysis in the browser, Very Hard.
- **Chain (13 steps):** the `.onion` door (`x5nq3dvw7kzc2ybmr6ptua4hs2fj7ekg.onion`) shows a Playfair puzzle and accepts answers only
  later; the **Registry** (`pcr-registry.org`) record of SKN Capital Nominees lists two decoy directors and the agent; `whois
  marlowepryce.biz` names the agent; `dirhunter` finds the unlisted filing archive; two sealed filings via Cipher Desk (2019, key
  `PC-114772-2019`; 2024, key built from Halvard Trust's number and the date it was dissolved, `2021-11-30`) reveal Halvard Trust and
  then Nordhaven Holdings (PC) Ltd; the Holdings record lists Conrad Lindqvist (director) and Imogen Hartley (the decoy secretary); the Mutual record
  links the insurer; HostTrail ties the infrastructure to the M3 contact; at the door the three key words (HALVARD, NORDHAVEN,
  LINDQVIST), the sentence `BEHIND THE WALL` and the factor `5d86` open the minutes page, which proves who sits above the chain.
- **Consequences of M1 to M3 show in the records** through BACKTRACE status (Skynet "dissolved", Reyes "no longer listed").
- **Report:** architect `Conrad Lindqvist`, role (Chairman Risk Committee, Nordhaven Mutual), agent `Marlowe & Pryce`, chain (Mutual,
  Holdings, Nominees), proof and front.
- **Help rules:** hints point at a document or a tool and never give the word; no timers, no hint button.

### M7 "The Architect" (2026-10-03)

- **Start:** the mail "you have the name. now the books." The idea: the insurer set aside claim reserves before the attacks, FIN-EU-2214
  and MED-APAC-6689, the same days as the broker's ledger rows.
- **Chain (22 gated steps plus the report):** match the paid claims on the insurer's portal (`portal.nordhaven-mutual.com`); `net_tree.py`,
  `nmap -sV` and `dirhunter` on `203.0.113.161` reach the hidden `/legacy-cms/`; the forgotten box Ash-Vector (`ssh` `admin`/`admin`)
  holds `ash-gate_backup.txt` with the firewall login (`fw.admin`); change the rule for port `46721`; **Metasploit** (`bluekeep`,
  `Version 5.2.1`) opens the C2 session and starts **Duel 1** (180 seconds, a banner and a trace); read `manifest.txt`, the release
  orders and the survey in that order; `download master_ledger_backup.enc` (never `open` it on the host); the reserve references on the
  portal now resolve and give the account `PC-114772`; at home `open` the file and decrypt it in Cipher Desk (key
  `PC-114772-MED-APAC-6689`), which holds Conrad's console login; encrypt the token for **RDC** and solve the display puzzle, which
  starts **Duel 2** (300 seconds); decrypt and read the documents on his workstation, which name the BLACKLEDGER room, a dynamic site on
  a random `.blackledger` host that answers 404 until Duel 2 is won.
- **Losing Duel 1** costs up to $500 and needs a recovery like M4's, with no dead end. Reading the `.enc` on the host shortens the window.
- **Report:** architect (`Conrad Lindqvist, SENTRY`), path, claims, reserves, orders (`RO-2608-14`), survey (`LC-07`), account
  (`PC-114772`, SKN), instruction and the `choice`. Closing material per choice is in section 5.

## 7. Design rules that still bind

- **One objective per case; mechanics in order.** Every step is gated through `middleware/gate.ts`; world information (domains, fixtures,
  firewall rules, ports, pages) opens per step, not when the world is built (`docs/bugs.md` #38).
- **Every case has a decoy** or an "undo your own action" beat. Optional steps stay off the gate chain.
- **A hint is reachable before the mechanic it helps** and never names the tool that solves it. No `hint` or `terminalCommand` on
  objectives.
- **Not Abandonable.** The client counts an abandoned quest as completed and starts the next one (`docs/bugs.md` #73). Restart with
  `mods.reset`.
- **Mechanics are not terminal-only:** pair them with something visible (widget, app, theme, site).
- **Rewards are money only** (no XP), 15,000 across the seven cases.
- **BACKTRACE:** one action yields at most one key finding; secondary facts go into that finding's description (`docs/rules.md` §13).
- **Everything in the player's text keeps the fiction explicit:** no real data, no real attack instructions; the game only supplies
  simulated tools.
- **The Custodian stays empty;** the hospital cover-up is told through documents; the player never talks to Roxanne.
- **Mods are single-player only.** Released on the Workshop as Flatline Protocol 2.0.0; 2.1.0 removes M1's Abandon (`docs/bugs.md` #73).

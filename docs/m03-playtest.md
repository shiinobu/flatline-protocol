# M03 "Money Trail" — Playtest Script

Status: **use once, disposable** — step-by-step script for a full live
playthrough of Mission 3 as currently implemented on the `clouds-modify`
branch (pass 2, commit `d837714`, plus the 2026-09-29 follow-ups: the shared
money model, the BACKTRACE key-finding redesign, the `open` checkpoints and —
late that day — the router rework: the gateway is a **TP-Link** panel and the
player writes the port-forwarding rules, `docs/bugs.md` #31).
Delete or archive once M03 reaches FINAL LOCK; not a permanent design doc
(that's `docs/story.md` / `docs/scratch.md`).

Same as M1/M2: **full mechanic, not full objective**. Every step below is
tracked internally in `m03-quest.ts`, but the player only ever sees **one**
objective — "Trace BLACKLEDGER's money through Skynet Import-Export --
break into the finance network, pull the wire-transfer ledger for the
parent entity, root the box that tunnels the money off the map, cover your
tracks, and report it all to the dead drop." Nothing below shows up as its
own checkpoint in-game except the BACKTRACE app (section 9).

**Live-test status (2026-09-29): run in game up to the site-to-site config;
the report step is still unplayed.** Pass 1 (commit `6aef436`) was live-tested
through the router crack and caught 3 real bugs, all fixed in pass 2:
`bettercap` was a WiFi-only mechanic wrongly used for this wired scenario
(removed), Coin-Drift's domain bypassed the NAT-pivot requirement entirely
(now gated), and the VLAN's `10.50.1.x` addressing was rejected by the
router panel's own validation (re-addressed to `192.168.1.x`). Later on
2026-09-29 the panel turned out to be a TP-Link page whose Save raises
`Network.PortChanges`, not `PFSense.*`, and the pivot became player-written
forwarding rules (`docs/bugs.md` #31). That build was then played from the
recon to the VPN config and the log confirms five keys (`portal`,
`architectVpn`, `parentEntity`, `gateway`, `vpnPeer`) plus the capture, ledger
and root personal logs. A retest then found the report refused in silence
because of the Wireshark requirement (`docs/bugs.md` #34). Changes since that
first run are **not yet played**: the network is built once so a restart keeps
it (`docs/bugs.md` #32; the restart and reload checks passed in the retest),
the report no longer requires the rules to be removed, Faded-Ledger is reached
over SSH (`docs/bugs.md` #33; the login worked but traced no key, still
unexplained), and — round 3 — the Wireshark step is gone, the gateway config is
a `.txt` read with `cat`, and `open` prints line by line (`docs/bugs.md` #34).
Short Indonesian retest guide: `docs/m03-livetest-guide.md`. Things to watch,
in this order:

1. **The report completes (changed, unplayed, nodes 26-27).** It needs only the
   ledger and the config; the rules may stay. Send it after `cat`-ing the config.
2. **`cat` of the gateway config (new, unplayed, node 23).** At the `meterpreter
   >` prompt `cat site_to_site_backup.txt` (the file is at the session's root;
   `ls` shows it) must print the file with its line breaks and trace `vpnPeer`.
   If `cat` is not offered at that prompt, this is the first thing to fix.
3. **`open` is readable (fixed, unplayed).** `open q3_reconciliation.xlsx` over
   SSH must print one line per line, not one paragraph.
4. **Faded-Ledger over SSH (node 24).** Rule `22 → 22 → 192.168.1.4`, then `ssh
   -h d.reyes@62.210.183.77` with the password from `helpdesk_resets`. The
   retest logged the login but no `traced accomplice`; the log now also holds a
   `[FP][M03] remote connection <t> -> <ip>` line per session, which shows what
   event arrived. The Reyes personal log fires at `cat`/`open` of the note.
5. **Restart keeps the network.** Passed in the retest (restart and dev reload);
   abandon or `mods.reset` is the only way to get a fresh network.
6. *Verified live 2026-09-29 (log-confirmed):* node 12 (`Network.PortChanges`
   reached the quest, the banner survived a second Save), node 21 (the plain
   `exploit` raised `RemoteConnection.Established` → `gateway`), node 22
   (`rootgrab` with a root user) and `open` on the old `.conf`.

---

## 0. Entry point

`src/guard/flags.ts`: `isDev=true`, `DEV_FOCUS_QUEST.m03=true` (all other
missions `false`), `isTester=false`. This isolates M3 for solo testing —
`QuestsToComplete=[]`, `AutoStart=true`, rewards forced to 0/0 while
focused. **Abandon or `mods.reset` any prior M3 save state before this
run** — the objective ID and the quest-data flags changed (`vpnConfigPulled`
→ `vpnConfigRead`, new `captureRead`, and on 2026-09-29 `pfsenseLoggedIn` /
`pfsenseChangeCount` → `portalReached` / `forwards`, then `natReverted` removed,
`reyesShareSeen` → `accompliceReached` and a new `networkBuilt`; round 3 removed
`internalTrafficCaptured` and `captureRead`), and stale save data will not match. A plain restart now keeps the VLAN, so abandon or
`mods.reset` is also the only way to get a fresh network for a new run.
`mods.reset` does not clear the player's own files: delete an old
`finance_vlan_capture.log`/`.pcap` from the home folder and any downloaded
`site_to_site_backup.*` from `~/downloads` first.

## 1. Tip mail

1. Read mail from the dead drop, subject **"shell company confirmed — dig
   into it"**. It says the wire authorization from M02 sends the full
   **$2,850,000** batch to Skynet Import-Export Co., points at the public
   site, and instructs: get inside the finance network, pull the ledger and
   find where the money answers to (a box in there builds a tunnel off the
   map after every batch — "Root it"), and change back whatever you changed on
   their gateway before leaving.

## 2. Recon the public site

2. `nmap skynet-importexport.biz` (`203.0.113.150`) — port 80 CLOSE, 443
   OPEN.
3. `lynx skynet-importexport.biz` — reveals: the company trades publicly
   under the short name **"Skynet"**; two staff handles, `@d.reyes`
   (finance) and `@m.okafor` (operations); the staff remote-access portal
   domain `remote.skynet-importexport.biz`; a **Staff access notice** — the
   gateway forwards nothing to the finance VLAN until IT adds a rule, and the
   hosts on the request form are listed with their service and port
   (Coin-Drift: database 3306, share 445, ledger portal
   `ledger.skynet-importexport.biz`; Faded-Ledger: ssh 22, share 445;
   Split-Bill: share 445; Vault-Line: tunnel gateway, RDP 3389) — needed at
   node 12; and a
   site-footer line — "IT security policy in force since **2024**." Both the
   short name and the year are needed later (node 7). The same text is on the
   site's page (`skynet-importexport.biz` in the browser, Staff Access block).
4. `mxlookup skynet-importexport.biz` → `mail.skynet-importexport.biz`
   (flavor only, not wired to anything).

## 3. OSINT — the password puzzle (2-part deduction)

5. `lynx @d.reyes` — she posts the corporate password **recipe**
   verbatim: the company's short name, the year the policy came in, one
   word, capitalized, `!` on the end. Also mentions reusing her family's
   names on her own personal shares (flavor, not a separate lead).
6. `lynx @m.okafor` — **decoy, dead end**. He's loud about "running the
   building" (badges, server room) but explicitly admits he can't reach
   the finance systems. The one credential he actually posts is the guest
   WiFi password — a red herring with nothing behind it; M3 has no WiFi
   mechanic anywhere.
7. Combine node 3's footer (short name "Skynet", year "2024") with node
   5's recipe → password = **`Skynet2024!`**.

## 4. Breach the router (TP-Link panel)

The gateway is a `Router`, so `http://77.83.142.6/` shows the engine's
**TP-Link "Router Administration"** page, not a pfSense (`docs/bugs.md` #31).
Login raises no event; Save in the Port Forwarding tab raises
`Network.PortChanges`.

8. `nslookup remote.skynet-importexport.biz` → `77.83.142.6`
   (`M03_PFSENSE_IP`).
9. `nmap 77.83.142.6` — port 80 OPEN (http, the admin panel), 443 CLOSE.
10. Download the **wordlist from HackDB** (`hackdb.net`) — a hand-typed
    `.lst` never gets a real `data.wordCount`, so the crack animation
    compares against `NaN` and never finishes (confirmed live during pass 1).
    Then `hydra -T 77.83.142.6:80 -P <path>/wordlist.lst`. **No `-l` needed:**
    `-l` is optional and the engine defaults it to `guest`, and the fixture
    is registered for `guest` as well as `admin`, so the success table
    itself prints `USER admin PASSWORD Skynet2024!` (`docs/bugs.md` #25).
    `-l admin` still works for a player who already knows it (case-sensitive:
    `-l Admin` does not match). A wrong user or a missing port only prints
    "Could not connect to the server."
11. Log into the panel at `http://77.83.142.6/` with
    `admin`/`Skynet2024!`. No event and no key here — the TP-Link login
    raises nothing. Manual login also works without hydra. **Status** lists
    the Splitter under Connected Devices (`192.168.1.2`); **Port Forwarding**
    holds only the locked `80 → 192.168.1.1` admin rule.
12. **[CHECKPOINT]** Write the forwarding rules yourself. Nothing behind the
    gateway answers until you do (`nmap` on any VLAN public IP: "Host is up …
    No ports found"). What to type comes from two things you already have:
    - `python3 net_tree.py 77.83.142.6` (NetTree from hackdb.net, `apt-get
      install python3` first) opens a window listing every node with its
      public IP, `LAN` IP and name — Coin-Drift `192.168.1.3`, Faded-Ledger
      `.4`, Split-Bill `.5`, Vault-Line `.6`;
    - the public site's Staff access notice (node 3) — each name with its
      service and port.

    Minimum for the two big threads: `3306 → 3306 → 192.168.1.3` (ledger) and
    `3389 → 3389 → 192.168.1.6` (gateway). In Port Forwarding click "+ Add
    Rule", fill External, Internal and Local IP, "Save".
    - The first Save, whatever it contains → `Network.PortChanges` → key
      **Remote portal** (`portal`, `portalReached`).
    - Every saved rule whose Local IP and internal port match a listed host
      and service (`M03_FORWARD_TARGETS`) is completed with its service banner
      (`Network.removePort` + `Network.addPort`); an **active** match sets
      `natPivotDone=true` and the match is stored in `forwards`. Rules that
      match nothing (wrong host, wrong port, Local IP left empty = Any) are
      inert: no error, no banner.
    - Check it: `nmap <public IP>` shows the port `OPEN` (external = internal)
      or `FORWARDED` (they differ — then `RPORT` at node 21 is the external
      port); `nmap -sV` shows `mysql mariadb` / `rdp FreeRDP 7.1.9`.

## 5. Ledger thread — Coin-Drift (either order vs. section 6)

Recon note: the VLAN devices are reached by their **public** IPs; a LAN IP
only works inside an SSH session (`docs/bugs.md` #27). `python3 net_tree.py
77.83.142.6` (node 12) lists the public IPs. Every service below exists only
once its rule from node 12 is saved.

13. `sqlmap -u ledger.skynet-importexport.biz -tables` (needs the `3306 →
    192.168.1.3` rule; the domain is named in the Staff access notice, node 3) —
    lists 2 tables: `wire_transfers` and `helpdesk_resets`.
14. `sqlmap -u ledger.skynet-importexport.biz -dump -table wire_transfers` →
    the shell company's ledger, **12 rows** with a
    running balance (columns `id, postedAt, direction, party, amount, balance,
    memo`). Three batches (section 10), each an escrow deposit followed by
    three transfers out the same morning: 60% to **SKN Capital Nominees**
    ("management fee"), 25% to **TR4C3404 Consulting** ("consulting fees
    (logistics)"), 5% to **X7xSentry9 Brokerage** ("customs brokerage"); the
    balance ends at $835,000, the 10% Skynet keeps. Key **Wire-transfer
    ledger** (`parentEntity`) — one key, whether by this dump or by node 16.
15. `sqlmap -u ledger.skynet-importexport.biz -dump -table helpdesk_resets` →
    recovers Faded-Ledger's login credentials, `d.reyes` / `Reyes_Family2024`
    (the note column reads "Remote login reset for d.reyes …").
16. **Alternate path**: the **Database Manager** app (download via AppStore)
    connecting to the same host (`Database.Connected`, the `finance_svc` /
    `internal_only_2024` credentials from the VPN config, node 23) marks the
    ledger as seen too — an equally valid route, not required in addition to
    sqlmap.
17. *(Bonus, optional)* — section 7.

## 6. Gateway thread — Vault-Line (either order vs. section 5)

18. *(Removed 2026-09-29, `docs/bugs.md` #34.)* The Wireshark capture and its
    `.pcap` are gone: the Staff access notice (node 3) already names the ledger
    domain and each host's role, `python3 net_tree.py` gives the public IPs, and
    the tunnel endpoint comes from the gateway config (node 23).
19. *(Optional)* `geoip`/`whois` on `203.0.113.160` once the config names it — it
    geolocates to nothing and whois says "Bulletproof VPN Ltd." (the payroll
    decoy that used to sit next to it was removed with the capture).
20. `nmap -sV 79.124.62.90` — 3389 OPEN, `FreeRDP 7.1.9` once the `3389 →
    192.168.1.6` rule is saved (before that: "No ports found"). Use the public
    IP; `nmap 192.168.1.6` only says the host is down.
21. `metasploit`, then:
    ```
    use exploit/rdp/cve_2019_0708_bluekeep
    set RHOST 79.124.62.90
    set RPORT 3389
    set Version 7.1.9
    exploit
    ```
    `RPORT` is the **external** port of your rule (3389 in the simple case).
    The command is `exploit`, not `run`; `Version` must be `7.1.9` (the
    default `1.0.0` fails with "Service version mismatch"). Without the rule it
    says "No service mapped to port 3389 on host." If it says "No
    guest account or online user found", run `exploit` once more (same as M2).
    Success opens a `meterpreter >` prompt and raises
    `RemoteConnection.Established` → key **Tunnel gateway** (`gateway`) and
    `gatewayShellObtained`. M3's first use of Metasploit.
22. *(Optional)* `rootgrab /etc/passwd` at the `meterpreter >` prompt → prints
    the hashed root password and raises `Metasploit.Rootgrab` → a personal-log
    entry. Nothing depends on it; the report never checks it.
23. At the `meterpreter >` prompt **`cat site_to_site_backup.txt`** (the file
    sits at the session's root; `ls` lists it) → `Terminal.Cat` → key
    **Site-to-site config** (`vpnPeer`), `vpnConfigRead` and the `tunnel`
    personal log. No `download`: the file is a `.txt` since round 3, so the
    engine's `cat` reads it where it lies (`docs/bugs.md` #34; the file used to
    be a `.conf`, which `cat` refuses, hence the old `download` + `open`). The
    config peers to `203.0.113.160`, labels it `SKN-CENTRAL`, notes the owner as
    SKN Capital Nominees and carries the `finance_svc` database credentials.
    `open` at that prompt would read the player's own PC (`docs/bugs.md` #30);
    a `download`ed copy read with `open` still counts.

## 7. Bonus — Faded-Ledger (Reyes)

24. Log into Faded-Ledger over SSH with node 15's credentials. Nothing in the
    engine reads port 445 (`nmap` is the only consumer), and `explorer` raises
    `Terminal.Explorer` only from a Meterpreter or `evil-rm` session, so the
    way in is port 22 (`docs/bugs.md` #33):
    - Router rule `22 → 22 → 192.168.1.4` (an `M03_FORWARD_TARGETS` row, so
      `nmap -sV 62.210.183.77` shows `22 OPEN ssh`).
    - `ssh -h d.reyes@62.210.183.77`, password `Reyes_Family2024` → the SSH
      session raises `RemoteConnection.Established` (`t: "SSH"`, `targetIp` =
      the IP typed) → key **Accomplice** (`accomplice`). The legacy
      `Terminal.Explorer` trigger still counts as a second way to the same key.
    - Files (in d.reyes's home, find them with `ls`/`cd`): `q3_reconciliation.xlsx`
      (Reyes' Q3 reconciliation: the July and August batches, $6,950,000 in,
      $4,170,000 to the parent, notes that every deposit splits the same way to
      the minute and that none of the depositors is a client) and
      `do_not_open_at_work.txt` (her guilty-conscience note). `cat` or `open` of
      the note writes the Reyes personal log (`Terminal.Cat` /
      `flatline.open.fileRead`); the log is deliberately not written at login,
      because it quotes the note.
    - The engine prints "Sys log file not found for <ip>" on each connection to
      a mission device (no `sys.log` on them); harmless.

## 8. Report

25. *(Removed 2026-09-29.)* The mission no longer asks the player to take the
    forwarding rules out again: the rules stay where the player left them, which
    is the player's choice. The tip mail says so ("yours to keep or remove").
26. Mail to the dead drop, either:
    - **"Mission 3 Findings"** template — fields `shellCompany`,
      `parentEntity`, `vpnLead` (`203.0.113.160`); or
    - Freehand matching `M03_REPORT_BODY` exactly (the body now includes two
      "Funds:" lines with the split).
27. Completes on `Mail.Sent`, gated on ledger-seen + config-read (both true; the
    rules may still be open). The gate prints nothing when it refuses — the
    retest run that hid a Wireshark requirement is `docs/bugs.md` #34.

## 9. What BACKTRACE shows

While the mission runs, the M3 card lists only the **keys** found so far
("TRACED SO FAR // x OF 5", title + value): Remote portal (node 12, the first
Save in the router panel), Wire-transfer ledger (14/16), Tunnel gateway (21),
Site-to-site config (23), Accomplice (24, bonus). The tunnel endpoint is no
longer a key (it is an extra in the COMPLETE snapshot). One action, one key; no
descriptions. Personal-log entries (a toast each) fire at the ledger, the
config read (`tunnel`), `rootgrab`, the Reyes note (`cat`/`open`) and the report. At COMPLETE the M3 report
opens with 8 Key Findings (the chain: the $2,850,000 batch reaching Skynet,
the fixed split, the same split on all three batches — $8,350,000 in,
$5,010,000 to the parent — the nominee name, the tunnel, the config that ties
both to one hand, the human way in, and what is unresolved), the Shell Company
and Parent Entity cards, the personal log and evidence EV-M3-01 (the
waterfall). `scratchbt m3 keys` lists the keys in-game.

## 10. The money (single model: `src/content/finance.ts`)

Every batch is split the same way: **60%** SKN Capital Nominees, **25%**
TR4C3404 Consulting, **5%** X7xSentry9 Brokerage, **10%** retained by Skynet.

| Batch | Client | Settled | Gross | 60% parent | 25% panel | 5% broker | 10% kept |
|---|---|---|---|---|---|---|---|
| PB-2605-01 | LOG-EU-2209 | 2026-05-02 | 1,400,000 | 840,000 | 350,000 | 70,000 | 140,000 |
| PB-2607-01 | FIN-NA-0091 | 2026-07-22 | 4,100,000 | 2,460,000 | 1,025,000 | 205,000 | 410,000 |
| PB-2608-01 | CASE-A7X-0417 | 2026-08-14 | 2,850,000 | 1,710,000 | 712,500 | 142,500 | 285,000 |
| **Total** | | | **8,350,000** | **5,010,000** | **2,087,500** | **417,500** | **835,000** |

Where it surfaces: M2's `affiliates` table (gross, `panelShare`, `batchRef`),
`deploy.log` and `wire_authorization.pdf` (the $2,850,000 batch); M3's
`wire_transfers` (all three batches, 12 rows, postings at 09:04 / 09:20 / 09:24
/ 09:27 UTC), the Q3 reconciliation (July + August), the tip mail and the
report's "Funds" lines. The 60% is the Architect's cut — M2's `routing_notes`
say it "goes out same day as settlement".

---

## Known follow-ups (not fixed / not yet live-tested)

- **`open` and relative paths.** `open` resolves a bare name from the home
  folder (or the SSH user's home over SSH), not the current directory
  (`docs/bugs.md` #30); whether to make `open` cwd-aware is an open proposal.
  Its output is line by line since round 3 (`docs/bugs.md` #34).
- **hydra + hand-typed wordlists** (node 10). Confirmed engine bug, not fixable
  from this project's source; worth reconfirming during this playtest.
- **The plain `exploit` events** (node 21) and **`rootgrab` with a root user**
  (node 22) — first use of both in M3. Verified live 2026-09-29
  (log-confirmed): the plain `exploit` raised `RemoteConnection.Established` and
  traced `gateway`, and `rootgrab` with a root user ran.
- **M4's `initialShellAccess`** listens for `Metasploit.Meterpreter.Connected`,
  which a plain `exploit` never raises (`docs/bugs.md` #29) — left unchanged.
- **The router rework** (node 12, `docs/bugs.md` #31). Verified live 2026-09-29:
  `Network.PortChanges` reaches the quest-scoped listener and the banner
  survives a second Save. Still unplayed: the panel's stale
  form after the mission rewrites a row (the next Save copies service/version
  back from versioned rows; a `445` row has no version and is rewritten
  again); rules typed with the same external port on one host (the SDK edits a
  row by `(external, host)`, so the second one wins); an "Any" (empty Local IP)
  rule is ignored by the mission.
  A plain restart keeps the network, and with it every rule you left, because
  the VLAN is built only once (`networkBuilt`, `docs/bugs.md` #32). The stored
  `forwards` are re-applied only when the network has to be rebuilt (the flag is
  missing, or the subnet is gone); a rule of yours that matches nothing does not
  survive that, because the SDK cannot recreate an Any row.
- **Open design point:** the forwarding rules a player may need to guess (a
  wrong host or port is silently inert). The notice names every host with its
  port on purpose; tighten or loosen it if the playtest shows it is too easy
  or a dead end.

---

## Appendix — network topology reference

```
M03_SKYNET_IP (Router)                        203.0.113.150  [skynet-importexport.biz]
   ports: 80 http (closed) · 443 https (open)
   no children -- public-facing flavor site only

M03_PFSENSE_IP (Router)                       77.83.142.6    [remote.skynet-importexport.biz]
   lan 192.168.1.1   -- renders the TP-Link "Router Administration" page
   user: admin / Skynet2024!   (hydra fixture on guest AND admin, ip:80)
   ports: only the locked 80 http admin rule. Every VLAN port lives in this
   router's table, so the rules the player writes (and the banners the mission
   adds to the matching ones) appear here.
   └─ M03_SPLITTER_IP (Splitter)               91.207.174.33 lan 192.168.1.2
      pure pass-through
      ├─ M03_COINDRIFT_IP (Device)             185.107.56.214 lan 192.168.1.3  [codename "Coin-Drift"]
      │     domain: ledger.skynet-importexport.biz (SQL_INJECTION)
      │     user: finance_svc / internal_only_2024
      │     no ports until forwarded: 445 smb · 3306 mysql (mariadb)
      │     db tables: wire_transfers (12 rows), helpdesk_resets (Faded-Ledger's creds)
      ├─ M03_ACCOMPLICE_IP (Device)            62.210.183.77  lan 192.168.1.4  [codename "Faded-Ledger"]
      │     user: d.reyes / Reyes_Family2024 (from helpdesk_resets dump)
      │     no ports until forwarded: 22 ssh (the way in) · 445 smb (cosmetic)
      │     files: q3_reconciliation.xlsx, do_not_open_at_work.txt
      ├─ M03_DECOY_HOST_IP (Device)            146.185.239.12 lan 192.168.1.5  [codename "Split-Bill"]
      │     user: guest / guest -- 445 smb once forwarded
      │     files: readme.txt ("decommissioned... nothing current" -- dead end)
      └─ M03_VAULTLINE_IP (Device)             79.124.62.90   lan 192.168.1.6  [codename "Vault-Line"]
            users: svc-vpn (online), root
            no ports until forwarded: 3389 rdp (FreeRDP 7.1.9, RCE)
            rootFiles: site_to_site_backup.txt (real M04_ARCHITECT_VPN_IP peer, labelled SKN-CENTRAL)
```

# M02 "The Maker" — Playtest Script

Status: **use once, disposable** — step-by-step script for a full live
playthrough of Mission 2 as currently implemented (post-redesign, 2026-09-24),
after rebuilding and reinstalling into HackHub's mods folder. Delete or
archive once M02 reaches FINAL LOCK; not a permanent design doc (that's
`docs/story.md` / `docs/scratch.md`).

Same as M1: **full mechanic, not full objective**. Every step below is
tracked internally in `m02-quest.ts`, but the player only ever sees **one**
objective — "Trace the toolkit developer behind the affiliate panel --
breach it from the root domain down to the dev server, dig up a lead to the
developer's home network, and pull the financial document that names the
shell company -- then report what you find to the dead drop." Nothing below
shows up as its own checkpoint in-game.

**Live-test status (2026-09-24):** the full main path (nodes 1-23) is now
confirmed working end-to-end, including the redesigned home network
(Splitter as a pure pass-through, Rust-Bucket as the real NAS target, and
the 4 decoy devices), the firewall breach with the no-longer-pre-filled
`destination` field, the Metasploit RDP/bluekeep exploit against the
Workstation at its updated `FreeRDP 7.1.9` version, Meterpreter, the
aftermath dialogue, and the report/mail flow to the dead drop. The
optional Closer-Rig thread (node 25-27), including its updated
`FreeRDP 2.7.3` version, is also confirmed working. See `docs/scratch.md`
for the full bug log from the redesign that led here (the Splitter
architecture bug and its resolution).

---

## 0. Entry point

`src/guard/flags.ts`: `isDev=true`, `DEV_FOCUS_QUEST.m02=true` (`m01=false`),
`isTester=false`. This isolates M2 for solo testing — `QuestsToComplete=[]`,
`AutoStart=true`, rewards forced to 0/0 while focused.

## 1. Tip mail

1. Read mail from the dead drop, subject **"re: your last report"**. Calls
   back M1's buyer alias and points at "a name in there that hasn't led
   anywhere yet" — narrative color only, no objective/event wired to it.

## 2. Recon the root domain

2. `whois tr4c3404.dev` — registrar privacy service (fixture).
3. `nmap tr4c3404.dev` (`203.0.113.140`) — port 80 CLOSE, 443 OPEN (https).
4. `subfinder -d tr4c3404.dev` → **40 subdomains**, all random 12-character
   hex labels, no readable naming pattern. 37 are pure noise
   (`Network.registerDomain` only, no subnet — never resolve to anything
   scannable). 3 are real hosts.
5. `nuclei` against the 40 results → narrows to exactly **3 candidate
   hosts** (the 37 empty ones never appear in `Nuclei.Results.hosts`).

## 3. Triage the 3 nuclei candidates

6. `sqlmap` each of the 3 — all three show the same `SQL_INJECTION`
   fingerprint, nuclei alone can't tell them apart:
   - Decoy `9c71ff0362bb.tr4c3404.dev` (`85.203.44.12` → `62.44.187.9`) —
     dump leads to `README.txt`: "old staging box... nothing here
     anymore." Dead end.
   - Decoy `40e9a8d1c256.tr4c3404.dev` (`78.140.22.63` → `196.51.88.41`) —
     dump leads to `notes.txt`: "client demo, contract fell through, never
     took it down." Dead end.
   - Real devbox `f3a91b7c04d8.tr4c3404.dev` (`66.0.34.201` →
     `139.162.45.98`) — dump reveals `admins` table (`root` + a hash) and
     `affiliates` table (3 rows: `CASE-A7X-0417` / `LOG-EU-2209` /
     `FIN-NA-0091`). Continue with this one.
7. `john` the admin hash → cracks to the real devbox password.

## 4. Into the dev server — **[CHECKPOINT]**

8. `ssh -h root@139.162.45.98` (the resolved IP behind
   `f3a91b7c04d8.tr4c3404.dev` — the `ssh` command requires `-h` and an
   IP, never a domain name) with the cracked password.
9. `cat deploy.log` → **GHOSTWIRE dialog #1** ("CASE-A7X-0417. August 14th,
   2026. Same case. Same day my sibling never came out of surgery... This
   is the person who actually deployed it."). Log ends pointing at "the
   home workstation."
10. `cat sync-home.txt` (note: `.txt`, not `.sh` — the in-game `cat`
    command only supports `.txt`/`.log` extensions) — leaks the home
    router's public IP and a line about the NAS still being on its factory
    admin login.

## 5. The home network — Splitter, a real NAS, and 4 decoys

11. `nmap 24.187.92.14` (`M02_WORKSTATION_ROUTER_IP`, lan `192.168.1.1`) —
    the home gateway leaked by `sync-home.txt`.
12. `nmap 88.212.67.19` (Splitter "home network", lan `192.168.1.2`) — the
    Splitter itself carries no ports or files (pure pass-through, redesigned
    this pass), but scanning it surfaces its LAN: Printer, and 5 more
    devices. Firewall stays hidden here — its address surfaces separately
    once the player has a foothold anywhere in this subnet (already
    confirmed working in an earlier pass; see `docs/scratch.md`).
13. Investigate the 5 newly-visible devices — only one has SSH open:
    - **Rust-Bucket** (lan `192.168.1.6`) — port 22/ssh OPEN. The real
      target.
    - **Glass-Eye** / smart TV (lan `192.168.1.7`) — port 8008/http open,
      no login, nothing useful. Dead end.
    - **Night-Owl** / CCTV camera (lan `192.168.1.8`) — port 554/rtsp
      open, no usable credentials. Looks tempting (cameras are a classic
      weak-cred target), dead end.
    - **Ghost-Relay** / old WiFi extender (lan `192.168.1.5`) — port
      23/telnet open, no usable credentials. The most tempting-looking
      decoy (telnet reads as "obviously insecure"), still a dead end.
    - **Dead-Pixel** / game console (lan `192.168.1.10`) — no ports open
      at all. Clean dead end.
14. `ssh -h admin@178.62.193.44` (Rust-Bucket) with default/factory
    credentials `admin`/`admin` — the NAS was never reconfigured from its
    factory settings.
15. `cat affiliate_endpoints.txt` on Rust-Bucket — old panel backup notes,
    leaks the Closer-Rig lead (`62.171.45.90`, optional bonus thread, see
    section 10).
16. Log into the PFSense panel at `156.38.94.201` (Firewall, lan
    `192.168.1.3`, port 80/http) — reuses `M02_ADMIN_PASSWORD` (same
    password as the devbox, node 4 — payoff for the "sloppy operator"
    characterization, not a new credential). The firewall rule shown here
    no longer pre-fills a `destination` — that field was removed this pass
    so the panel doesn't hand the workstation's LAN IP to the player for
    free.
17. Edit the Firewall Rules (any save while logged in) → fires
    `PFSense.Changes` → removes the deny rule on port 3389 and opens it on
    the workstation. **One-way**: this is a one-time "breach" flag; editing
    the rule again afterward has no further effect (matches M1/M3's own
    pfSense mechanic, and does not depend on what value was in the rule's
    fields).

## 6. Root the workstation — Metasploit

18. `nmap 71.192.14.230` (`M02_WORKSTATION_IP`, lan `192.168.1.9` — changed
    this pass, was `.4` — codename "Stale-Fork") — port 3389 now OPEN,
    `FreeRDP 7.1.9` (version changed this pass, was `1.0.0`).
19. `metasploit` → `use exploit/rdp/cve_2019_0708_bluekeep` → `set RHOST`/
    `RPORT`/`Version` → `exploit`. First attempt can fail ("No guest
    account or online user found") if the device's online user isn't
    ready yet — retry `exploit` once. Success opens a Meterpreter session.

## 7. Pull the evidence and trigger the aftermath

20. From the `meterpreter >` prompt, `download` each of the 3 rootFiles:
    `wire_authorization.pdf` (names **Skynet Import-Export Co.** as the
    shell company), `errands.txt`, `unsent.txt` (domestic texture).
    **Use the text `download` command, not the graphical file-explorer
    window** — only the text command's underlying `Files.Transfer` event
    is wired to the aftermath trigger.
21. The first successful download fires **GHOSTWIRE dialog #2** ("Got
    everything... One name was never going to be enough.") exactly once,
    regardless of which file triggers it first.

## 8. Report findings (the one objective the player sees)

22. Mail to the dead drop, either:
    - **"Mission 2 Findings"** template — fields `developer:
      f3a91b7c04d8.tr4c3404.dev`, `shellCompany: Skynet Import-Export
      Co.`; or
    - Freehand matching `M02_REPORT_BODY` exactly — subject "Toolkit
      developer confirmed — shell company named".
23. Completes purely on the `Mail.Sent` match, no hard prior-step gate.

---

## 9. Printer (non-interactive flavor, optional)

24. `nmap 41.203.118.6` (Printer, lan `192.168.1.4` — changed this pass,
    was `.5`) — port 9100 stays CLOSED permanently. No SDK-verified generic
    "open a port via a router admin UI" mechanism exists, so this is
    deliberately a dead prop, not a solvable puzzle (mirrors the base
    game's own Quest 15 "Printer Troubleshooter" device).

## 10. Closer-Rig — optional bonus thread

25. From the Closer-Rig lead in `affiliate_endpoints.txt` (node 15):
    `nmap 62.171.45.90` — port 3389 already OPEN, no firewall gate.
26. Same `metasploit` RDP/bluekeep exploit as the workstation (node 19), no
    separate credential puzzle — this device (`Qu0taCl0ser` / "Closer-Rig")
    is a lighter, secondary target.
27. Download `quota_report.txt` (RaaS "affiliate performance" corporate
    flavor, contrasts with TR4C3404's domestic texture) and
    `routing_notes.txt` — the latter names the real `M04_ARCHITECT_VPN_IP`
    (`203.0.113.160`, imported from `m04.ts`) as evidence connecting this
    case to M4's Architect. No dialogue or objective is wired to this
    thread — it's pure connective tissue for a future mission.

---

## Known follow-ups (not fixed this pass)

- No i18n for M2 — everything hardcoded English.
- `Shell.addCommandData("john"/"ssh", ...)` fixtures in
  `registerM02ShellFixtures()` — cosmetic, unused since John/SSH read their
  own internal registries, not `Shell` fixtures.
- The `isDev`-gated / commented-out `Network.destroyNetwork()` calls in
  `OnObjectivesStart()` are currently disabled (see `docs/scratch.md`) —
  the network topology is considered stable and no longer needs a
  destroy-and-rebuild cycle on every reload.
- The Splitter/Rust-Bucket/decoy redesign, the updated RDP versions
  (`FreeRDP 7.1.9` Workstation / `FreeRDP 2.7.3` Closer-Rig), and the
  report/mail flow are all live-test confirmed as of 2026-09-24.

---

## Appendix — network topology reference

```
M02_ROOT_IP (Router)                          203.0.113.140  [tr4c3404.dev]
   ports: 80 http (closed) · 443 https (open)
   subfinder -> 40 subdomains (1 real devbox + 2 populated decoys + 37 empty noise)

M02_DEV_ROUTER_IP (Router)                    66.0.34.201
   └─ M02_DEV_IP (Device)                     139.162.45.98  [f3a91b7c04d8.tr4c3404.dev]
      user: root / cracked password
      ports: 22 ssh · 443 https (nginx, EOL) · 3306 mysql (mariadb, SQL_INJECTION)
      files: deploy.log, sync-home.txt

M02_DECOY_SUBDOMAIN_1_ROUTER_IP (Router)      85.203.44.12
   └─ ...IP (Device)                          62.44.187.9    [9c71ff0362bb.tr4c3404.dev]
      ports: same as devbox (SQL_INJECTION) · files: README.txt (dead end)

M02_DECOY_SUBDOMAIN_2_ROUTER_IP (Router)      78.140.22.63
   └─ ...IP (Device)                          196.51.88.41   [40e9a8d1c256.tr4c3404.dev]
      ports: same as devbox (SQL_INJECTION) · files: notes.txt (dead end)

M02_WORKSTATION_ROUTER_IP (Router)            24.187.92.14   lan 192.168.1.1
   └─ M02_SPLITTER_IP (Splitter)               88.212.67.19  lan 192.168.1.2
      pure pass-through — no users/ports/rootFiles of its own (redesigned
      2026-09-24; SSH/nmap on a Splitter-type node itself is impossible,
      see docs/scratch.md)
      ├─ M02_FIREWALL_IP (Firewall)            156.38.94.201 lan 192.168.1.3
      │     isIpHidden, PFSense.Login+Changes, reuses M02_ADMIN_PASSWORD
      │     gates RDP (3389) on the Device below · rule carries no
      │     `destination` field (removed 2026-09-24)
      ├─ M02_WORKSTATION_IP (Device)           71.192.14.230 lan 192.168.1.9  [codename "Stale-Fork"]
      │     user: tr4c3404 (online)
      │     ports: 3389 rdp (FreeRDP 7.1.9, RCE) -- closed until Firewall breached
      │     files: wire_authorization.pdf, errands.txt, unsent.txt
      ├─ M02_PRINTER_IP (Printer)              41.203.118.6  lan 192.168.1.4
      │     port 9100 -- permanently closed, non-interactive flavor
      ├─ M02_HOME_NAS_IP (Device)              178.62.193.44 lan 192.168.1.6  [codename "Rust-Bucket"]
      │     user: admin / admin (factory default) -- the real target
      │     ports: 22 ssh · files: affiliate_endpoints.txt (Closer-Rig lead)
      ├─ M02_SMART_TV_IP (Device)              92.118.36.71  lan 192.168.1.7  [codename "Glass-Eye"]
      │     no users · ports: 8008 http -- open, nothing useful (decoy)
      ├─ M02_CAMERA_IP (Device)                154.16.94.28  lan 192.168.1.8  [codename "Night-Owl"]
      │     no users · ports: 554 rtsp -- open, no usable login (decoy)
      ├─ M02_WIFI_EXTENDER_IP (Device)         45.89.127.53  lan 192.168.1.5  [codename "Ghost-Relay"]
      │     no users · ports: 23 telnet -- open, no usable login (decoy)
      └─ M02_GAME_CONSOLE_IP (Device)          103.224.182.19 lan 192.168.1.10 [codename "Dead-Pixel"]
            no users · no ports at all (decoy, total dead end)

M02_CLOSER_RIG_ROUTER_IP (Router)             109.94.27.183
   └─ M02_CLOSER_RIG_IP (Device)               62.171.45.90  [codename "Closer-Rig"]
      user: closer (online)
      ports: 3389 rdp (FreeRDP 2.7.3, RCE) -- open from the start, no firewall gate
      files: quota_report.txt, routing_notes.txt (seeds M04_ARCHITECT_VPN_IP)
```

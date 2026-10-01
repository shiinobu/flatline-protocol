# FLATLINE PROTOCOL — Network & Mechanics Redesign Plan

Status: **M1, M2, M3, M4 all implemented** (M1 in the first pass on
2026-09-20, M2-M4 in a second pass the same day). Every mission's
pre-redesign implementation is kept for reference at
`src/content/m0X.original.ts`/`src/main/m0X-quest.original.ts`. **None of
M2, M3 or M4 has been live-tested yet** — `tsc --noEmit` is clean and an
independent code-reviewer pass ran, but nothing beyond that. `docs/story.md`
remains the source of truth for plot/characters; this document covers the
*mechanics* layer only.

That code-reviewer pass caught and fixed 2 HIGH-severity issues before
any live-test: M03's `registerM03Database` had regressed to the exact
`getByHost`-then-early-return "left alone" anti-pattern `docs/bugs.md`
entry 14 already diagnosed for M02 (fixed — now
create-once-then-unconditional-`setTable`, mirroring M02); and M04's two
honeypots had no `Shell.addCommandData("ssh", ...)` fixture registered at
all, so their whole "poke the decoy, get flagged" mechanic was
unreachable (fixed — fixtures added for both). Also tightened M02's
Wi-Fi objective to require `Network.WifiConnected`, not just
`Fern.FindPassword`, matching what its own description promises.

Redesign goals driving every decision below (user-directed, 2026-09-20):
all 4 missions "Very Hard" from the first mission, no easing in; no
`hint` field and no `terminalCommand` field on any objective, anywhere;
every mission connected into one ongoing story (already true per
`story.md`, unchanged); heavier real use of firewalls, reverse-shell
Metasploit flow, and router/Wi-Fi mechanics (`fern`); one coherent
network design across all 4 missions for whatever is actually
clue-connected; IP and port addressing redesigned and factored so it is
easy to reuse.

## Conventions

- **Public IP** on every node is chosen by hand and deliberately
  scattered/unrelated-looking — no shared address block, even for nodes
  in the same story thread. This mirrors HackHub's own in-game Network
  Map convention: a Router, a Firewall and a Splitter sitting on the same
  hierarchy each get an independently-random-looking public IP (e.g.
  `226.193.72.86` / `249.137.51.239` / `144.118.147.206` all under one
  router in the base game's own reference screenshot). Only `lanIp`
  carries a clean, sequential pattern.
- **`lanIp`** is set on every node behind a router and is sequential
  within that one subnet, starting at `.1` for the router itself. The
  *scheme* signals the infrastructure's sophistication, which doubles as
  an implicit story cue:
  - `192.168.1.x` — small-time/cheap operation (M1's broker).
  - `192.168.0.x` — a home network (M2's workstation, reached over Wi-Fi).
  - `10.50.x.x` — corporate (M3, already established).
  - `172.16.x.x` — hardened/enterprise (M4).
- **`name`** (the in-game codename shown as `HOST: <name>`) is set ONLY
  on an internal Device that has no public domain/persona of its own.
  Router, Firewall and Splitter nodes stay unnamed/functional, exactly as
  the reference screenshot shows them (`HOST: FIREWALL`, `HOST: Internal
  LAN`) — the creative codenames only appear on the leaf machines a
  player finds by pivoting, never on infrastructure with its own domain
  or public identity.
- **No `hint`, no `terminalCommand`** on any `QuestObjectiveDefinition`,
  in any of the 4 missions. `description` may state the narrative goal
  but must never name the exact tool/command that solves it (e.g. say
  "get into the broker's real backend," never "ssh into ..."). Where a
  discovery step needs a concrete piece of data (an IP, a password), it
  is delivered in-fiction through something the player already
  investigates (a decoded file, a mail, a log) — never through the
  `hint` field.
- **Cross-mission connections** are realized by literally reusing an
  IP/domain/codename across two missions as a discoverable clue, not by
  trying to keep one live SDK network tree spanning multiple missions.
  `Network.createSubnetNetwork`'s own doc comment states an address that
  already holds a network "is left alone" — there is no API to add a new
  child device to an already-created router later, only destroy-and-fully-
  recreate. Reusing that mechanism across mission boundaries (destroying
  and rebuilding a shared router every time a later mission starts) would
  risk wiping whatever state the player already changed on the earlier
  mission's nodes. Reusing the same literal address/name instead gets the
  "one connected world" feeling with none of that risk.

## M1 — "First Trace" (implemented this pass)

```
Router  91.198.174.3 / lan 192.168.1.1     (storefront's ISP router)
├─ Firewall  45.132.11.87 / lan 192.168.1.2
│    rules: [{ allowed: false, port: 22 }]  ← blocks the backend's SSH from the start
│    breached via the pfSense web UI (port 80), using the same credential
│    recovered from the broker's session JWT -- not ssh; ssh-into-firewall
│    was confirmed impossible (docs/bugs.md entry 17)
└─ Device  77.91.14.203 / lan 192.168.1.3   (verifiedaccess.mkt storefront + the broker's real backend — one machine, not two)
     ports: 443 (open, public storefront), 22 (inactive until the Firewall is breached), 80 (inactive, unused decoy port)
```

No codename was added here — both nodes already carry a public identity
(the storefront's own domain, and the Firewall doesn't need one per the
convention above), and the mission's existing red herrings (the Iceland
decoy domain, the shuffled fake "lots" listings) already satisfy the
"Very Hard needs at least one red herring" bar from `story.md` §5. Adding
a codenamed decoy just to fill a slot would have been invention for its
own sake.

**What changed mechanically from the original implementation:**
finding the storefront's real backend was previously a straight SSH-in
once the session cookie was decoded. It now takes one more genuine step:
`nmap`-ing the backend shows port 22 `FILTERED`, not open — a separate
Firewall device on the same router is dropping the connection before it
reaches the server. The same `jwt_decoder.py` run that already recovers
the broker's password (`failover_pw`) now also recovers a
`failover_gateway` IP in the same decoded payload — that IP is the
Firewall, reachable over SSH with the same recovered credential (the
broker reused one password everywhere, consistent with the "small-time,
sloppy operator" characterization already in the story). Breaching it
calls `Network.removeFirewallRule` + `Network.openPort` on the backend's
SSH port, which is the new `m01.objective.03` ("breach the firewall").
The old single "access the broker's server" objective is now two:
breach the firewall, then SSH into the actual backend — 8 objectives
became 9, still inside the 9-11 range `story.md` §4 targets.

## M2 — "The Maker" (implemented, reworked again 2026-09-24)

**Correction (2026-09-28 audit):** the Wi-Fi-based plan this section
originally described (`bettercap`/`fern`/`Network.createWifiNetwork`) was
superseded on 2026-09-24 by a Firewall-behind-a-Splitter shape, the same
`PFSense.Login`/`PFSense.Changes` mechanic M1 already uses (M3's gateway is a
`Router` with a TP-Link panel and uses `Network.PortChanges`, `bugs.md` #31) -- no Wi-Fi
cracking in the shipped mission (confirmed: zero `Fern`/`Bettercap`/
`WifiConnected`/`createWifiNetwork` references anywhere in `src/`). The
diagram below reflects what `m02.ts` actually implements; full
node-by-node detail (every decoy device, port and credential) is in
`docs/m02-playtest.md`'s appendix, already verified line-by-line against
source.

```
M02_ROOT_IP (Router)                          203.0.113.140  [tr4c3404.dev]
   subfinder -> 40 subdomains (1 real devbox + 2 populated decoys + 37 empty noise)
   └─ M02_DEV_ROUTER_IP (Router) 66.0.34.201
      └─ M02_DEV_IP 139.162.45.98  [f3a91b7c04d8.tr4c3404.dev]
         ports: 22 ssh · 443 https (EOL) · 3306 mysql (SQL_INJECTION)
         files: deploy.log, sync-home.txt

M02_WORKSTATION_ROUTER_IP (Router)            24.187.92.14
   └─ M02_SPLITTER_IP (Splitter, pure pass-through)  88.212.67.19
      ├─ M02_FIREWALL_IP (Firewall, isIpHidden)      156.38.94.201
      │     PFSense.Login/Changes gates RDP (3389) on the Device below
      ├─ M02_WORKSTATION_IP (Device) "Stale-Fork"    71.192.14.230
      │     3389 rdp (FreeRDP 7.1.9, RCE) -- closed until Firewall breached
      │     files: wire_authorization.pdf, errands.txt, unsent.txt
      └─ Printer + 4 decoy devices (Glass-Eye/Night-Owl/Ghost-Relay/Dead-Pixel)
            -- one real NAS "Rust-Bucket" among them, ssh 22 admin/admin

M02_CLOSER_RIG_ROUTER_IP (Router)             109.94.27.183
   └─ M02_CLOSER_RIG_IP "Closer-Rig"          62.171.45.90
         3389 rdp (FreeRDP 2.7.3, RCE) -- open from the start, optional bonus thread
```

## M3 — "Money Trail" (redesigned 2026-09-28, pass 2; follow-up 2026-09-29; not yet re-tested)

```
Router 203.0.113.150  [skynet-importexport.biz]   public site, 443 open / 80 closed

Router 77.83.142.6 (TP-Link panel)  lan 192.168.1.1   [remote.skynet-importexport.biz]
   80/http (locked admin rule, the only rule at start), admin / Skynet2024!
   The player writes the forwarding rules (Network.PortChanges); a rule that matches
   a host + service below is completed with its banner (removePort + addPort) and
   is the pivot. The children ship with no ports at all: a device's ports live in
   the router's table, so an empty table = dark VLAN.
└─ Splitter  91.207.174.33 / lan 192.168.1.2   (empty pass-through)
   ├─ Device "Coin-Drift"   185.107.56.214 / lan 192.168.1.3  [ledger.skynet-importexport.biz]
   │     mariadb:3306 SQL_INJECTION (once forwarded), smb:445
   │     DB: wire_transfers (12 rows, running balance, 3 batches -> SKN Capital Nominees
   │         / TR4C3404 Consulting / X7xSentry9 Brokerage), helpdesk_resets (-> d.reyes creds)
   ├─ Device "Faded-Ledger" 62.210.183.77 / lan 192.168.1.4   ssh:22 (the way in), smb:445 (cosmetic), d.reyes / Reyes_Family2024
   │     q3_reconciliation.xlsx, do_not_open_at_work.txt   (bonus: ssh -h d.reyes@<ip>)
   ├─ Device "Split-Bill"   146.185.239.12 / lan 192.168.1.5  smb:445, guest / guest -- decoy, readme only
   └─ Device "Vault-Line"   79.124.62.90 / lan 192.168.1.6   tunnel gateway
         users: svc-vpn (online) + root (rootgrab needs a root user)
         rdp:3389 FreeRDP 7.1.9 RCE (Metasploit `exploit`) -> Meterpreter -> optional rootgrab /etc/passwd
         rootFile site_to_site_backup.txt (read with `cat` at the session's root):
         peer SKN-CENTRAL = M04_ARCHITECT_VPN_IP, owner SKN Capital Nominees,
         + finance_svc DB creds

External endpoint (geoip/whois fixtures, no network):
   203.0.113.160  M04_ARCHITECT_VPN_IP (geoip Unknown -- M4's entry point),
                  named only in the gateway config
```

**Pass 2 changes (live-test of pass 1):** LAN re-addressed `10.50.1.x` →
`192.168.1.x` (the pfSense port-forward panel's `IsLocalIp()` rejects
anything else — same constraint M2 hit). `bettercap` removed (it is a
Wi-Fi tool; M3 is wired). Internal ports now ship `active:false` and open
only on the NAT pivot (`Network.openPort`, the M1 mechanism), so nothing is
reachable before pfSense. New hardened host `Vault-Line` adds a real
Metasploit chain. All addresses are fresh (`bugs.md` #21) and the legacy
gateway `203.0.113.151` is destroyed on start. Chain and every open
assumption: `docs/scratch.md` (last section).

**2026-09-29 follow-up:** the devices behind the pfSense are reached by their
**public** IPs (a LAN IP only works inside an SSH session; `python3
net_tree.py` lists them, the capture names two), Vault-Line gained a `root`
user, the hydra fixture answers to `guest` (the engine's default `-l`) as well
as `admin` on `<ip>:80`, the ledger became 12 rows from the shared money model
(`src/content/global/finance.ts`), and the capture/config are `.pcap`/`.conf` read
with `open`. Recorded in `bugs.md` #25-#29.

**Late 2026-09-29 (router rework, `bugs.md` #31):** the "pfSense" above is
really the TP-Link page of a `Router` node (the name `M03_PFSENSE_*` in the code
is historical). Its Save raises `Network.PortChanges`, not `PFSense.*`, and its
Port Forwarding table is the router's real port table — so the children ship
without ports and the player writes the rules. Rules are matched on `(Local IP,
internal port)` against `M03_FORWARD_TARGETS` (`src/content/m03.ts`), completed
with the service banner and persisted in the quest's `forwards`. The hint that
precedes the gate: the tip mail, the public site's Staff Access block (+ its
`lynx` fixture) and `python3 net_tree.py`.

**Round 3, same day (`bugs.md` #34):** the Wireshark capture and its `.pcap`
(and the payroll decoy that lived in it) were removed; the gateway config is a
`.txt` read with `cat`, so nothing in M3 needs `download`; the ledger domain moved
into the Staff access notice; the report needs only the ledger and the config.

**Later the same day (`bugs.md` #32, #33):** (1) the VLAN is built once
(`networkBuilt`), so a restart or a dev reload no longer destroys and rebuilds it
— the player's rules survive; `forwards` is only the fallback for a rebuilt
network. (2) The report no longer waits for the player to remove their rules.
(3) Faded-Ledger gained an `ssh:22` target: the bonus is an SSH login as d.reyes,
because `Terminal.Explorer` is unreachable for that host.

## M4 — "The Architect" (implemented, not yet live-tested)

```
Router  203.0.113.160 (= M04_ARCHITECT_VPN_IP — the traced VPN IP IS the real network root now)  lan 172.16.0.1
├─ Firewall "ash-gate"  194.60.38.12  lan 172.16.0.2
│    rules: block 22 + 3389 (destination: C2), NOT 443 — flavor-only safety net, see risk note below
└─ Splitter  45.76.180.9  lan 172.16.0.3
   ├─ Device C2-host (architect-c2.dark, renamed M04_C2_IP=203.0.113.161, unchanged persona)  lan 172.16.0.4
   ├─ Device "Null-Crown" (honeypot)   185.220.101.42   lan 172.16.0.5
   └─ Device "Ash-Vector" (honeypot)   146.70.44.18   lan 172.16.0.6
```

Implemented exactly as originally planned above (C2-host nested in the
Splitter alongside the two honeypots), per explicit user instruction on
2026-09-20 to keep this shape and treat the alternative below as a backup
only.

**Known risk, not yet resolved by live-test:** `docs/bugs.md` entry 15
only confirms a `Firewall`'s `rules` reaching a *direct* sibling `Device`
(M1's shape) — reaching a `Device` nested two levels down inside a
sibling `Splitter` (M4's shape here) is untested. To de-risk this without
gambling mission playability on it: the Firewall's rules deliberately
block ports (22, 3389) the C2 device was never going to expose anyway,
and the port the mission actually needs open (443, the CVE target) is
left untouched and set `active: true` directly in the C2 device's own
`ports` array — so the mission's real progression does not depend on
whether the Firewall rule actually reaches through the Splitter. The
rule is present for narrative/topology accuracy ("ash-gate" closes
everything else down) even if it turns out to be inert.

**Backup plan if this needs to change after a live-test:** flatten the
tree so the C2 Device is a *direct* sibling of the Firewall (matching
M1's proven exact shape) and move only the two honeypots into the
Splitter. No other content changes needed — same IPs, same objective
chain, only the nesting of `M04_C2_IP` moves up one level.

The two honeypots trigger a one-shot `Mail.send` warning
(`M04_HONEYPOT_ALERT_*`) if SSH'd into, mirroring `attrcheck`'s
self-wipe-trap warning-mail pattern. This is deliberately flavor-only:
`index.d.ts` has no suspicion-meter API a mod can call at all, confirmed
by grepping the full SDK surface, so "spike the suspicion meter" is not
literally implementable — same compromise already accepted for the
`master_identity_backup` trap (`docs/scratch.md`'s M04 finding #1).

## M2-M4 redesign pass — completed 2026-09-20

Procedure actually followed, same as M1's:

1. Copied `src/content/m0X.ts`/`src/main/m0X-quest.ts` to sibling
   `m0X.original.ts` files before changing anything. Each `.original.ts`
   quest file imports from its own sibling `m0X.original.js` content file,
   **not** the live one — the live content file's exports get renamed
   during a redesign, and a frozen backup that still imports the live path
   breaks `tsc` the moment that happens (hit this for real on M02/M03/M04
   this pass; see `docs/bugs.md`).
2. Moved `src/websites/{a7xcodeface,skynet-importexport,architect-c2}/`
   under `src/websites/m0{2,3,4}/`, fixed the relative import depth in
   each moved `index.ts`, and fixed the side-effect imports in
   `src/index.ts`.
3. Applied the tree/IP/lanIp/codename design above.
4. Stripped every `hint`/`terminalCommand` field from every M2/M3/M4
   objective — M3 in particular had several (`nmap`/`lynx`/`mxlookup`/
   `hydra`/`wireshark`/`sqlmap`/`explorer` were all named directly); where
   a `hint` carried load-bearing information (the leaked-password pattern,
   the finance employee's handle), it was moved into in-fiction content
   (a `lynx` OSINT fixture's `additional` text) instead of deleted outright.
5. `npx tsc -p tsconfig.json --noEmit` clean. Independent `code-reviewer`
   agent pass run over the full diff (not just self-verification — see the
   M1 near-miss in `docs/bugs.md` entry 15 for why that step is
   non-negotiable). No esbuild build step per this project's standing
   typecheck-only verification convention.

**Not yet done for any of M2/M3/M4:** a live-test in HackHub. Everything
above is static/logical verification only.

## Update 2026-10-01 — broker domains unlock with the listing

`x7xsentry9.tech`, `be7.x7xsentry9.tech` and `fw7.x7xsentry9.tech` are no longer
registered when the network is built; they are part of the `brokerLead` unlock
(`UnlockSpec.domains`) and appear only after the winning listing is opened. The routers,
devices and ports are unchanged. See `docs/architecture.md` (core) and bugs #38.

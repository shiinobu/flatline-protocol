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
│    ssh-able directly, with the same credential recovered from the broker's session JWT
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

## M2 — "The Maker" (implemented, not yet live-tested)

```
Router → Device devbox.a7xcodeface.dev        (dev server chain unchanged: sqlmap/john/ssh)

WifiNetwork ssid "TP-Link_8F21"   ip 66.0.34.202 (reused, was M02_WORKSTATION_ROUTER_IP)
└─ Device 203.0.113.142  lan 192.168.0.2  codename "Stale-Fork"
     ports: rdp 3389 (FreeRDP 1.0.0) — unchanged exploit target, only the reachability path moved
```

The developer's personal admin workstation moves off the public internet
entirely and onto a home Wi-Fi network — thematically it was never a
corporate asset, so reaching it over Wi-Fi instead of a second
internet-facing router/RDP box fits better and gives the mission its own
distinct "Very Hard" mechanic. Confirmed against
`node_modules/@hotbunny/hackhub-content-sdk/index.d.ts`: `Network.createWifiNetwork()`
takes no `lanIp` at the AP level (only `ip`) — `lanIp` is only settable on
the `children` devices behind it. Flow: `bettercap` (`Bettercap.WifiRecon`/
`.WifiDeAuth`, both null-payload events, gated as loosely as M03's
Wireshark) → `fern` → **`Fern.FindPassword`** (`{subnet, user, model}`,
matched on `subnet.ip`) → `Network.connectWifi()` → `Network.WifiConnected`.
New objective `m02.objective.04` inserted between `accessDevServer` and
`rootgrabWorkstation` (7 → 8 objectives); `rootgrabWorkstation` and
`Network.setVulnerabilities` also picked up an explicit `version:
"FreeRDP 1.0.0"` (previously bare `RCE`) since Metasploit's own in-game
handbook (`.reverse/extracted/docs_unzipped/docs/EN/Metasploit/`) shows
`search`/`use` matching against the scanned service+version string, not
the vulnerability type alone.

## M3 — "Money Trail" (implemented, not yet live-tested)

```
Router 203.0.113.151 (pfSense, kept exactly as-is)  lan 10.50.0.1
└─ Splitter "Internal LAN"  10.50.0.2
   ├─ Device "Coin-Drift" (finance-server)   10.50.0.3   — ledger DB (SQL_INJECTION, mariadb:3306) unchanged mechanic
   └─ Device "Faded-Ledger" (accomplice PC, D. Reyes)   10.50.0.4   — bonus spreadsheet moved here
```

Gives the existing "browse the Finance shared drive" bonus beat (story.md
§4, M3 step 8) a second real host to live on, via a `Splitter`, instead of
everything living on one device. `Terminal.Explorer`'s gate moved to
Faded-Ledger; `Sqlmap.DumpTable`'s gate stayed on Coin-Drift. All
`terminalCommand`/`hint` fields were also stripped from every M3
objective (`M03_LEAK_PATTERN`, previously only in a `hint` field, is now
surfaced in-fiction through the `lynx @d.reyes` OSINT lookup's own
`additional` text instead).

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

# FLATLINE PROTOCOL — Network reference

Status: current as of 2026-10-08 (release 2.1.0). This is the host and address reference for the seven cases, built from the
constants in `src/content/mNN/network.ts` (the tables below are generated from them, so a value here is a value in the code).
`docs/story.md` has the plot and the solution of each case, `docs/mechanics.md` the tools, `docs/bugs.md` the engine facts that
shaped these rules. Every host, address and domain is invented; the addresses use documentation-style and scattered ranges and the
tools are simulated by the game.

## Conventions

- **Public IPs are scattered.** Every node gets a hand-picked public IP with no shared block, even inside one story thread, like the
  game's own Network Map. Only the LAN side is regular.
- **LAN addresses are `192.168.1.x`.** The engine treats only that prefix as local (`IsLocalIp`; bugs.md Engine facts E-7), and a panel's
  firewall and port-forward rules validate against it. `lanIp` is sequential inside one router tree, the router being `.1`. M1 is the
  exception: each of its five routers uses its own prefix, `192.168.1.x` to `192.168.5.x`.
- **Names sit on leaf machines only.** The codename a player sees (`HOST: Rust-Bucket`) is set on an internal device without a public
  identity of its own. Routers, firewalls and splitters stay unnamed.
- **Reach nodes behind a splitter by their public IPs.** `nmap` and Metasploit resolve a LAN address only inside an SSH session
  (bugs #27); `python3 net_tree.py <router ip>` lists a tree's nodes with both addresses.
- **Firewall rules:** a rule without a `destination` blocks the port for the whole network; with one it must be the target's `lanIp`
  (E-8). A firewall has exactly one valid user (E-9).
- **Realism:** a host with a real `Website` shows port 443 open, a host without shows it closed explicitly (`docs/rules.md` §12).
  LedgerVault is the deliberate exception (a hidden service with no scan fixture).
- **World information opens per step.** Domains, fixtures, firewall rules, ports and pages that reveal the next step sit in the
  mission's `UnlockSpec` table (`content/mNN/gates.ts`), never in the build (bugs #38). A domain must be registered on a real
  subnet (E-1), so an unlock registers it when its step is reached.
- **Cross-mission links reuse a literal address or name** as a clue; no live network tree spans two missions, because rebuilding a
  shared router would wipe what the player changed (`Network.createSubnetNetwork` leaves an existing network alone).
- **The thread address `203.0.113.160`** (`M04_ARCHITECT_VPN_IP`, registrant Bulletproof VPN Ltd.) first appears in M2's Closer-Rig
  notes, is the tunnel peer in M3, is the registrant of M4's control host and is M7's router.
- **Data addresses** inside log lines, the M5 sign-in table, staff records and similar files are invented data, not hosts, and are
  not listed here.

## M1 — First Trace

Five routers, one per chain: the broker's backend, its firewall, and one storefront each for Blackwire, Frostgate and Obsidian. The
backend (`be7`) sits behind the firewall (`fw7`) whose rule blocks port 22 until the player saves a change in its pfSense panel.
Each storefront router also carries a gateway (decommissioned, a dead end) and, for Frostgate and Obsidian, an API box. The
storefront pages (18 delisted listings) are websites, not hosts. LedgerVault has no subnet fixture on purpose.

| Host | Public IP | LAN IP |
|---|---|---|
| Backend router | `91.198.174.3` | `192.168.1.1` |
| Firewall router | `45.132.11.1` | `192.168.2.1` |
| Firewall `fw7` | `45.132.11.87` | `192.168.2.2` |
| Backend `be7` (the broker's server) | `77.91.14.203` | `192.168.1.3` |
| Blackwire router | `198.51.100.230` | `192.168.3.1` |
| Blackwire storefront | `198.51.100.77` | `192.168.3.2` |
| Blackwire legacy box | `198.51.100.212` | `192.168.3.3` |
| Blackwire gateway (decommissioned) | `198.51.100.245` | `192.168.3.4` |
| Broker infrastructure (`x7xsentry9.tech`) | `194.36.108.20` |  |
| Frostgate router | `91.243.67.1` | `192.168.4.1` |
| Frostgate storefront | `91.243.67.210` | `192.168.4.2` |
| Frostgate gateway (decommissioned) | `91.243.67.220` | `192.168.4.3` |
| Frostgate API box | `91.243.67.235` | `192.168.4.4` |
| Obsidian router | `5.188.94.1` | `192.168.5.1` |
| Obsidian storefront | `5.188.94.130` | `192.168.5.2` |
| Obsidian gateway (decommissioned) | `5.188.94.140` | `192.168.5.3` |
| Obsidian API box | `5.188.94.155` | `192.168.5.4` |
| LedgerVault (hidden service, no scan fixture) | `185.220.31.6` |  |
| ClearEscrow | `46.29.115.63` |  |
| ClearEscrow app | `46.29.115.201` |  |

| Domain or host | Value |
|---|---|
| Blackwire storefront | `blackwire-network.mkt` |
| Broker infrastructure | `x7xsentry9.tech` |
| Frostgate storefront | `frostgate-exchange.mkt` |
| Obsidian storefront | `obsidian-access.mkt` |
| LedgerVault (permanent domain, own seal) | `x7k2m9vdlq4wnyt3.dark` |
| ClearEscrow | `clearescrow.io` |

The storefronts and ClearEscrow also register decorative subdomains (flavor for `nslookup` and `subfinder`, each on its own bare subnet):

| Decorative subdomain | IP |
|---|---|
| `www.blackwire-network.mkt` | `198.51.100.78` |
| `mail.blackwire-network.mkt` | `198.51.100.140` |
| `api.blackwire-network.mkt` | `198.51.100.63` |
| `status.blackwire-network.mkt` | `198.51.100.201` |
| `failover.blackwire-network.mkt` | `198.51.100.226` |
| `www.frostgate-exchange.mkt` | `91.243.67.18` |
| `trade.frostgate-exchange.mkt` | `91.243.67.94` |
| `support.frostgate-exchange.mkt` | `91.243.67.7` |
| `status.frostgate-exchange.mkt` | `91.243.67.230` |
| `wallet.frostgate-exchange.mkt` | `91.243.67.183` |
| `www.clearescrow.io` | `46.29.115.14` |
| `api.clearescrow.io` | `46.29.115.98` |
| `support.clearescrow.io` | `46.29.115.177` |
| `status.clearescrow.io` | `46.29.115.42` |
| `gateway.clearescrow.io` | `46.29.115.220` |
| `partners.clearescrow.io` | `46.29.115.6` |
| `www.obsidian-access.mkt` | `5.188.94.203` |
| `mail.obsidian-access.mkt` | `5.188.94.61` |
| `status.obsidian-access.mkt` | `5.188.94.85` |
| `support.obsidian-access.mkt` | `5.188.94.96` |
| `billing.obsidian-access.mkt` | `5.188.94.107` |

The IRC host is `relay.blkledger.dark` (`M01_IRC_HOST`). `fw7` and `be7` are found with `subfinder -d x7xsentry9.tech`, whose domain is
revealed by `lynx X7xS3NTRY9`.

| Unlock | What it opens | When |
|---|---|---|
| `brokerLead` | the broker-lead fixtures and the broker's domain records (its own domain and hosts) | `listingFound` |
| `backendSsh` | removes the firewall's deny rule on port 22 and opens port 22 on the backend | `firewallBreached` |

## M2 — The Maker

The toolkit developer's public side is `tr4c3404.dev`: `subfinder` returns 40 random hex subdomains, 37 of them registered names with no
subnet, and three real hosts (one real devbox and two decoys, each a router with one device). The devbox's `sync-home.txt` leads to the
home network: a router, a splitter, the pfSense firewall and a LAN of devices, only one of which has SSH open. Closer-Rig is a separate
optional target.

| Host | Public IP | LAN IP |
|---|---|---|
| Root domain host | `203.0.113.140` |  |
| Devbox (SSH target) | `139.162.45.98` |  |
| Devbox router | `66.0.34.201` |  |
| Decoy 1 router | `85.203.44.12` |  |
| Decoy 1 device | `62.44.187.9` |  |
| Decoy 2 router | `78.140.22.63` |  |
| Decoy 2 device | `196.51.88.41` |  |
| Home router | `24.187.92.14` | `192.168.1.1` |
| Home splitter | `88.212.67.19` | `192.168.1.2` |
| Home firewall (pfSense) | `156.38.94.201` | `192.168.1.3` |
| Printer (dead prop) | `41.203.118.6` | `192.168.1.4` |
| Ghost-Relay (Wi-Fi extender, telnet decoy) | `45.89.127.53` | `192.168.1.5` |
| Rust-Bucket (NAS, the real target) | `178.62.193.44` | `192.168.1.6` |
| Glass-Eye (smart TV, decoy) | `92.118.36.71` | `192.168.1.7` |
| Night-Owl (camera, decoy) | `154.16.94.28` | `192.168.1.8` |
| Stale-Fork (the developer's workstation) | `71.192.14.230` | `192.168.1.9` |
| Dead-Pixel (game console, no ports) | `103.224.182.19` | `192.168.1.10` |
| Closer-Rig (optional bonus) | `62.171.45.90` |  |
| Closer-Rig router | `109.94.27.183` |  |

| Domain or host | Value |
|---|---|
| Developer's root domain | `tr4c3404.dev` |
| Real devbox | `f3a91b7c04d8.tr4c3404.dev` |
| Decoy subdomain 1 | `9c71ff0362bb.tr4c3404.dev` |
| Decoy subdomain 2 | `40e9a8d1c256.tr4c3404.dev` |

The 37 noise subdomains of `tr4c3404.dev` are random 12-character labels registered on documentation-range addresses with no subnet
behind them (label, address):

```text
0a06a6f0a053  192.0.2.1
0d51b011d25c  192.0.2.2
125883da80c0  192.0.2.7
214a870024a0  192.0.2.8
2d9604185836  192.0.2.11
2db9e6d972c3  192.0.2.20
2f1334dbe46e  192.0.2.22
3f72f5c2f5d5  192.0.2.26
6138bc919a84  192.0.2.35
664ee66f3f60  192.0.2.64
66c5f4e17f3c  192.0.2.78
72f22272fbaa  192.0.2.83
73b0430b66b4  192.0.2.84
75fd4fa46333  192.0.2.99
770db916b2f1  192.0.2.100
779a82193316  192.0.2.105
7a28e15d1786  192.0.2.110
90affa6785e4  192.0.2.112
95fd4a33d706  192.0.2.120
964b198a7a97  192.0.2.129
974db67ee3c9  192.0.2.132
9a59444099a3  192.0.2.137
ae2527252d5e  192.0.2.153
b13969b5cabf  192.0.2.155
b2e00732f43e  192.0.2.159
b583f97bb10a  192.0.2.185
c1e5e8c77046  192.0.2.199
cce9531d006c  192.0.2.202
d245e5d854b7  192.0.2.204
d277c633421a  192.0.2.205
d5c14fb12afe  192.0.2.209
d9ba27d6b748  192.0.2.214
db55f24bc491  192.0.2.215
df8673e40596  192.0.2.216
e3ae94c31d5e  192.0.2.229
eea99a2f2eb9  192.0.2.231
fc24ae0ec696  192.0.2.232
```

The workstation accepts RDP (3389) only after the player saves any rule in the home firewall's pfSense panel.

| Unlock | What it opens | When |
|---|---|---|
| `subdomainLead` | the subdomain fixtures and domain records (the devbox and its decoys) | `rootProbed` |
| `workstationRdp` | removes the home firewall's deny rule on port 3389 and opens 3389 on the workstation | `firewallBreached` |

## M3 — Money Trail

Skynet's public site is `skynet-importexport.biz`. The remote gateway is a `Router` that shows the engine's TP-Link panel, so nothing
behind it answers until the player writes forwarding rules in Port Forwarding (any Save raises `Network.PortChanges`; a rule is
completed only when its Local IP and internal port match a listed host and service). Behind the gateway a splitter carries four
devices.

| Host | Public IP | LAN IP |
|---|---|---|
| Skynet public site | `203.0.113.150` |  |
| Remote gateway (TP-Link router panel) | `77.83.142.6` | `192.168.1.1` |
| Finance splitter | `91.207.174.33` | `192.168.1.2` |
| Coin-Drift (ledger database) | `185.107.56.214` | `192.168.1.3` |
| Faded-Ledger (Reyes, optional) | `62.210.183.77` | `192.168.1.4` |
| Split-Bill (decoy) | `146.185.239.12` | `192.168.1.5` |
| Vault-Line (tunnel gateway) | `79.124.62.90` | `192.168.1.6` |

| Domain or host | Value |
|---|---|
| Public site | `skynet-importexport.biz` |
| Mail host (flavor) | `mail.skynet-importexport.biz` |
| Remote portal (the gateway) | `remote.skynet-importexport.biz` |
| Ledger database | `ledger.skynet-importexport.biz` |

Minimum rules for the two main threads: `3306 -> 192.168.1.3` and `3389 -> 192.168.1.6`. The gateway config names the tunnel peer
`203.0.113.160`.

| Unlock | What it opens | When |
|---|---|---|
| `gatewayLead` | the gateway-lead fixtures and domain records (the remote portal and the gateway) | `siteScouted` |

## M4 — Burn Notice

Four one-device subnets, each a router with one device: relay 1 with Static-Hop, relay 2 with Quiet-Mirror, relay 3 with Paper-Moth (a
honeypot, outside the chain) and relay 4 with Night-Shift, the control host. The strike's source address appears in the banner and
the incident log, and no network is built for it.

| Host | Public IP | LAN IP |
|---|---|---|
| Relay 1 router | `193.164.228.17` | `192.168.1.1` |
| Static-Hop (relay 1, SSH) | `141.77.202.84` | `192.168.1.2` |
| Relay 2 router | `87.121.52.196` | `192.168.1.1` |
| Quiet-Mirror (relay 2, SSH) | `45.155.204.31` | `192.168.1.2` |
| Relay 3 router | `176.97.210.63` | `192.168.1.1` |
| Paper-Moth (honeypot) | `194.26.192.118` | `192.168.1.2` |
| Relay 4 router | `91.222.174.46` | `192.168.1.1` |
| Night-Shift (control host) | `203.0.113.159` | `192.168.1.2` |
| The intruder (strike source) | `62.197.136.44` |  |

Static-Hop's `auth.log` also names two scanner addresses (`M04_SCANNER_A_IP` `45.138.157.22`, `M04_SCANNER_B_IP` `109.205.213.78`) that
belong to no host. Relay 1's router panel is cracked with `hydra` (user `svc`); the SSH ports open one step at a time.

| Unlock | What it opens | When |
|---|---|---|
| `relayLead` | the relay-1 fixtures (`whois`, `geoip`, `nmap`) | `incidentLogRead` |
| `routerCrack` | the `hydra` fixture of relay 1's panel | `relayProfiled` |
| `staticHopSsh` | Static-Hop's fixtures and port 22 | `hydraRun` |
| `quietMirrorSsh` | Quiet-Mirror's fixtures and port 22 | `relayLogRead` |
| `controlHost` | the Night-Shift fixtures (`whois`, `geoip`) | `controlFound` |

## M5 — The Door

The PacificCare web is a block of hosts on `160.153.44.x`: the home page, news, careers, status, patient portal, webmail and gateway.
Behind the hospital's edge router a splitter carries the firewall, Cold-Chart (the clinical archive reached
over RDC and SSH), Bedside-17 (the optional shell), Lead-Apron, Pay-Station and a printer. Echoline, LeakIndex, Cipher Desk and RDC are
separate sites.

| Host | Public IP | LAN IP |
|---|---|---|
| Hospital home page | `160.153.44.12` |  |
| Newsroom | `160.153.44.37` |  |
| Careers | `160.153.44.58` |  |
| Service status | `160.153.44.91` |  |
| Patient portal | `160.153.44.120` |  |
| Webmail | `160.153.44.173` |  |
| Gateway | `160.153.44.204` |  |
| Edge router | `198.244.91.37` | `192.168.1.1` |
| Hospital splitter | `37.120.145.62` | `192.168.1.2` |
| Firewall (pfSense) | `193.29.57.184` | `192.168.1.3` |
| Cold-Chart (`arc-ir-01`, clinical archive) | `141.98.252.76` | `192.168.1.4` |
| Bedside-17 (`PC-IT-017`, optional) | `80.94.92.118` | `192.168.1.5` |
| Lead-Apron | `45.142.193.29` | `192.168.1.6` |
| Pay-Station | `176.113.115.84` | `192.168.1.7` |
| Printer (port 9100) | `195.133.40.17` | `192.168.1.8` |
| Outside sign-in source (the broker's infrastructure) | `194.36.108.20` |  |
| Echoline | `185.31.164.22` |  |
| LeakIndex | `91.229.23.105` |  |
| Remote Desktop Connection | `185.199.52.14` |  |
| Cipher Desk | `45.61.136.9` |  |

| Domain or host | Value |
|---|---|
| Hospital site | `pacificcare-health.org` |
| Echoline web archive | `echoline.net` |
| LeakIndex | `leakindex.net` |
| Remote Desktop Connection | `rdcdesk.io` |
| Cipher Desk | `cipherdesk.io` |

Firewall console user `rafael.bautista`; Bedside-17 user `it.station`. The hospital sites and the portal (`remote.pacificcare-health.org`)
answer only after the Q3 folder is opened in LedgerVault. Cipher Desk and RDC are permanent tool sites.

| Unlock | What it opens | When |
|---|---|---|
| `teamPage` | the team-page fixtures | `vaultRevisited` |
| `hospitalShells` | removes the firewall's rule on port 3389 (IR-3389) and opens 3389 on Bedside-17; Cold-Chart's port 22 and rule IR-22 stay | `displayAttached` |

## M6 — Open Register

No network: M6 builds no subnet (`networkIps: []`). The domains are registered bare, and `dirhunter <host>` finds a site by host alone
(Engine facts E-3). The door is an `.onion` host with no address. The addresses below are the ones the domains are registered on.

| Host | Public IP | LAN IP |
|---|---|---|
| Registry | `38.242.76.19` |  |
| Registered agent | `87.236.19.144` |  |
| Insurer site | `193.42.33.58` |  |
| Insurer portal | `193.42.33.60` |  |
| Echoline (shared with M5) | `185.31.164.22` |  |
| HostTrail | `45.133.1.76` |  |

| Domain or host | Value |
|---|---|
| Registry | `pcr-registry.org` |
| Registered agent | `marlowepryce.biz` |
| Insurer (its `whois` answers with M3's registrant) | `nordhaven-mutual.com` |
| The Playfair door | `x5nq3dvw7kzc2ybmr6ptua4hs2fj7ekg.onion` |
| Echoline | `echoline.net` |
| HostTrail | `hosttrail.net` |
| SKN-CENTRAL VPN host (M3's peer) | `vpn.skn-central.net` |

| Unlock | What it opens | When |
|---|---|---|
| `nomineesRecord` | the nominee-record fixtures | `registryReached` |
| `filingArchive` | the filing-archive fixtures | `agentIdentified` |
| `infraRecords` | the infrastructure-records fixtures (the insurer `whois`) | `insurerLinked` |

## M7 — The Architect

The router is the thread address `203.0.113.160`. Behind it a splitter carries the pfSense firewall (user `fw.admin`), the command host
`index-01` (the C2, LegacyCMS 2.1 on 443, RDP on an unusual external port), Null-Crown (a decommissioned host that is a honeypot) and
Ash-Vector (the forgotten box that holds the firewall login). Two machines are reached only through RDC: the chair console and the
claims server. The BLACKLEDGER ledger room is a dynamic site on an unlinked host with a random-looking 32-letter name.

| Host | Public IP | LAN IP |
|---|---|---|
| Router (the thread address) | `203.0.113.160` | `192.168.1.1` |
| Splitter | `45.76.180.9` | `192.168.1.2` |
| Edge firewall (pfSense) | `194.60.38.12` | `192.168.1.3` |
| `index-01` (the command host, C2) | `203.0.113.161` | `192.168.1.4` |
| Null-Crown (decommissioned, honeypot) | `185.220.101.42` | `192.168.1.5` |
| Ash-Vector (the forgotten box) | `146.70.44.18` | `192.168.1.6` |
| Chair console (RDC only, `NMA-CL-01`) |  | `192.168.1.40` |
| claims-02 (RDC only) |  | `192.168.1.42` |

Ports: the C2 shows RDP on external `46721` mapped to internal `3389` (a `FreeRDP 5.2.1` banner); it is filtered until the firewall rule for that port is
changed. Sites: `portal.nordhaven-mutual.com` (the claims portal, https only), `https://203.0.113.161/legacy-cms/` (the hidden node table)
and the ledger room at `fc3dhvrvxdw4qdnzcruwf233nyk6rtea.blackledger` (https, answers 404 until Duel 2 is won).

| Unlock | What it opens | When |
|---|---|---|
| `edgeIntel` | the edge fixtures for the router tree | `endpointMapped` |
| `legacyCms` | nothing in the network; the step opens the hidden page | `edgeScanned` |
| `commandHostRdp` | the command-host fixtures; removes the firewall's rule on port `46721` and opens it on the C2 | `firewallBreached` |

# M01 "First Trace" — Playtest Script

Status: **use once, disposable** — a step-by-step script for a full live
playthrough of Mission 1 as currently implemented, after running
`.\build-install.ps1` and restarting HackHub (or `mods.reset
flatline-protocol`). Delete or archive this file once M01 reaches FINAL
LOCK; it is not a permanent design doc (that's `docs/story.md`).

This mission is **full mechanic, not full objective**: every step below is
tracked internally (`this.Events.on(...)` in `m01-quest.ts`) and gates the
next step, but the player only ever sees **one** objective — "Track down
the broker... then report what you find to the dead drop." Nothing below
shows up as its own checkpoint in-game; this script exists so a tester can
verify the full chain still works end to end, not just the final mail.

## 0. Entry point

With `isDev=true` + `DEV_FOCUS_QUEST.m01=true` (the current dev config in
`src/guard/flags.ts`), `AutoStart=true` — the mission claims itself and
the tip mail is waiting immediately, no HackHub feed post to click.

To test the real production entry point instead (GHOSTWIRE's HackHub feed
post), flip to `isTester=true` + `TESTER_FOCUS_QUEST.m01=true` (or a full
`isDev=false`/`isTester=false` production build) and claim the mission by
opening the post in the HackHub feed.

**Important for this specific playtest:** `registerM01Network()`'s router
destroy calls (and the per-domain destroy in the `M01_DOMAIN_RECORDS`
loop) only run when `isDev=true` (see `docs/bugs.md` entry 18). If you're
testing with `isDev=true`, the old subfinder race can still show up
intermittently — that's expected, not a regression. To actually confirm
entry 18's fix, step 4 below needs to be tested with `isDev=false`.

---

## 1. Tip & primary domain recon

1. Open Mail, read the message from `ghost.tip@ghost.index`, subject
   **"you should look into this"**. Points at a handle close to
   "opsadmin" — no domain named outright.
2. `nslookup blackwire-network.mkt` → should resolve to `198.51.100.77`.
3. `nmap 198.51.100.77` → only port 443 (https) OPEN.
4. `subfinder -d blackwire-network.mkt` → should list, among others,
   `gateway.blackwire-network.mkt` and `failover.blackwire-network.mkt`.
   **[CHECKPOINT — entry 18 regression check]** If this comes back "No
   subdomains found" while testing with `isDev=false`, the fix didn't
   hold; report the exact command and build config used.
5. `nslookup gateway.blackwire-network.mkt` → resolves to `77.91.14.203`
   (the real backend target, hidden behind the firewall for now).

## 2. Listing & decoy

6. `dirhunter blackwire-network.mkt` → should surface
   `/listings/med-sea-0417/` among the results.
7. Browser → `https://blackwire-network.mkt/listings/med-sea-0417/` →
   healthcare-sector listing, marked SOLD.
8. `nslookup frostgate-exchange.mkt` (the decoy storefront) →
   `168.100.9.44`.
9. `geoip 168.100.9.44` → Iceland/Reykjavik. Rules out the decoy (no
   in-game confirmation beyond the geoip result itself — there's nothing
   further to chase on this domain).

## 3. Firewall breach via Kimai + JWT — **[CHECKPOINT]**

10. `nslookup failover.blackwire-network.mkt` → resolves to `45.132.11.87`
    (the firewall).
11. Download **kimai** from the HackDB catalog, then
    `python3 kimai.py 45.132.11.87` → fires ~10 harmless Wireshark-visible
    packets and leaks a signed JWT for the firewall's own user, with a
    5%/iteration chance guaranteed by the 10th run.
12. `python3 jwt_decoder.py <token>` (the JWT from step 11) → decodes to
    credentials `failsafe` / `Gr1dLock#42`.
13. Browser → `http://45.132.11.87/` → the engine's own pfSense login UI;
    log in with `failsafe` / `Gr1dLock#42`.
14. Make any change in pfSense and save it → this should automatically
    lift the firewall rule blocking port 22 to the backend and open port
    22 on `77.91.14.203`.

    **Report back:** did kimai's leak chance feel reasonable (not an
    obvious instant leak, not a frustrating long grind), and did the
    pfSense login/save flow behave like a real admin panel?

## 4. Into the backend, find the IRC trail

15. `ssh root_4ae9c@77.91.14.203`, password `Tn8$rWq3yK1z` → should connect
    now that port 22 is open.
16. Explore `/home` (`ops_notes.txt`, `todo.txt`, `readme.txt` — all
    flavor/decoy, nothing load-bearing) and `/logs`
    (`sales_ledger.log` → buyer alias **TR4C3#404**; `ops-relay.log` →
    `[ENCRYPTED]` + a base64 blob; `auth.log`/`cron.log`/`system.log` are
    dummy noise).
17. `cat ops-relay.log`, then decrypt the blob with `openssl` → plaintext
    reveals IRC host `relay.blkledger.dark` and channel key `n0ledger`.

## 5. Confirm via IRC, find the vault

18. `weechat relay.blkledger.dark`, password `n0ledger` → connects, seeded
    chat history confirms buyer **TR4C3#404** and leaks the LedgerVault
    mirror domain `x7k2m9vdlq4wnyt3.dark` across two separate lines (not
    posted as one obvious copy-pasteable string).
19. Browser → `x7k2m9vdlq4wnyt3.dark` (LedgerVault's interactive file
    browser) → open `case_id.txt` (**CASE-A7X-0417**), `network_map.txt`,
    `found_note.txt`, and the quarterly report folders
    (`Q3-2026-SEA` — this project code is required for the report;
    `Q1-2020-NA`/`Q2-2023-EU` are context/flavor). `associate_infra.txt`
    here is a teaser for M2, not required for M1's report.

---

## 6. Report findings (the one objective the player sees)

Compose a mail to `drop@drop.null` (the Custodian), either:

- The **"Mission 1 Findings"** template from the compose dropdown, fields:
  `listingCode: MED-SEA-0417`, `broker: A7xDEFACE9`,
  `buyer: TR4C3#404`, `caseId: CASE-A7X-0417`,
  `project: Q3-2026-SEA`, `vaultUrl: x7k2m9vdlq4wnyt3.dark`, or
- A freehand mail, subject **"Broker identified — buyer alias attached"**,
  body matching `M01_REPORT_BODY` exactly.

**[CHECKPOINT — hard gate]** This mail is silently rejected (no
`reportSent`, no objective completion) if step 19 (visiting LedgerVault)
hasn't been recorded yet, regardless of whether the report content itself
is correct — `vaultVisited` is checked before anything else in the
`Mail.Sent` handler. If you send a perfectly correct report before
visiting the vault, it should do nothing; confirm it works immediately
after a vault visit with no other changes.

Once accepted: objective "Track down the broker..." completes,
`AutoComplete` finishes the mission, reward 250 money / 60 xp (0/0 while
still in dev-focus or tester-focus mode).

---

## What to report back overall

For the 2 checkpoints above (subfinder regression in section 1, and the
vault-visit gate in section 6): **worked as expected**, or **broke — exact
command typed, exact output/error, and whether `isDev`/`isTester` was on**.
Anything else that breaks along the way is also worth a note, but those
two are the known risk areas coming out of this session's network-timing
fix (`docs/bugs.md` entry 18).

---

## Appendix — network topology reference

### Layer 1 — real network tree (3 routers, actually traversable)

```
M01_ROUTER_IP            91.198.174.3   (Router)
└─ M01_TARGET_IP          77.91.14.203   (Device) [gateway.blackwire-network.mkt]
   user: root_4ae9c / Tn8$rWq3yK1z
   ports: 22 ssh (CLOSED until pfSense breach) · 80 http (closed) · 443 https (open)
   files: /home/{ops_notes,todo,readme}, /logs/{sales_ledger,ops-relay,auth,cron,system}

M01_FIREWALL_ROUTER_IP   45.132.11.1    (Router)
└─ M01_FIREWALL_IP        45.132.11.87   (Firewall) [failover.blackwire-network.mkt]
   user: failsafe / Gr1dLock#42 (leaked via kimai -> jwt_decoder)
   ports: 80 http (open, pfSense UI) · rule blocking 22->target (removed on PFSense.Changes)

M01_FRONT_ROUTER_IP      198.51.100.1   (Router)
├─ M01_FRONT_IP           198.51.100.77  (Device) [blackwire-network.mkt -- root domain]
│  ports: 443 https (open, storefront + /listings/med-sea-0417/)
└─ M01_LEGACY_IP          198.51.100.212 (Device) [legacy.blackwire-network.mkt]
   user: admin / admin123
   ports: 22 ssh · file: decommissioned.txt (dead end/flavor)
```

### Layer 2 — flat domain overlay (`M01_DOMAIN_RECORDS`, 40 entries)

Read by `subfinder`/`nslookup`. Some ride on the real nodes above
(`needsSubnet: false`), the rest are standalone empty `Device` nodes that
exist purely to be a discoverable domain (`needsSubnet: true`).

| Cluster | Root domain | Root IP | Standalone subdomains |
| --- | --- | --- | --- |
| Target (real) | `blackwire-network.mkt` -> `.77`\* | rides FRONT | `www`.78, `mail`.140, `api`.63, `status`.201, `legacy`.212\*, `gateway`.203\* (-> target), `failover`.87\* (-> firewall) |
| Decoy | `frostgate-exchange.mkt` -> `168.100.9.44` | standalone | `www`/`trade`/`api`/`support`/`status`/`gateway`/`wallet` @ `91.243.67.x` |
| Flavor only | `swiftedge.cloud` -> `172.98.44.19` | standalone | `www`/`cdn1`/`cdn2`/`status`/`api`/`billing`/`gateway` @ `172.98.44.x` |
| Flavor only | `clearescrow.io` -> `46.29.115.63` | standalone | `www`/`app`/`api`/`support`/`status`/`gateway`/`partners` @ `46.29.115.x` |
| Flavor only | `pacificcare-health.org` -> `103.87.62.145` | standalone | `www`/`patientportal`/`careers`/`news`/`mail`/`status`/`gateway` @ `103.87.62.x` |
| Flavor only | `obsidian-access.mkt` -> `5.188.94.117` | standalone | `www`/`gateway` @ `5.188.94.x` |

(`\*` = rides a real Layer 1 node, not a separate node.) The 4 "flavor
only" clusters are pure recon noise mentioned only in the broker's Twotter
posts — no mechanic behind them, they just make the 40-domain layer feel
real without 40 real devices.

### Known gap — LedgerVault is not on the Network tree at all

`x7k2m9vdlq4wnyt3.dark` (`185.220.31.6`) never gets a
`Network.createSubnetNetwork()` call — only a direct
`Network.registerDomain(M01_LEDGERVAULT_DOMAIN, M01_LEDGERVAULT_IP)` with
no subnet behind it. Per the same "left alone"/no-op mechanism as entries
3 and 18, this registration is likely a no-op. The page still loads in
browser because it's served through a completely separate system
(`@RegisterWebsite`, `Host = M01_LEDGERVAULT_DOMAIN` in
`src/websites/m01/ledgervault/index.ts`), independent of `Network`
entirely. Expected practical effect: browsing to LedgerVault should work
fine, but `nslookup x7k2m9vdlq4wnyt3.dark` likely fails/returns nothing,
since (unlike every `M01_DOMAIN_RECORDS` entry) there is no
`Shell.addCommandData("nslookup", ...)` fixture for this domain either.
**Not yet confirmed live** — if you test this during the playtest, report
back what `nslookup x7k2m9vdlq4wnyt3.dark` actually does, and it'll get
its own `docs/bugs.md` entry.

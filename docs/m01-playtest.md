# M01 "First Trace" — Playtest Script

Status: **use once, disposable** — a step-by-step script for a full live
playthrough of Mission 1 as currently implemented, after running
`.\build-install.ps1` and restarting HackHub (or `mods.reset
flatline-protocol`). Delete or archive this file once M01 reaches FINAL
LOCK; it is not a permanent design doc (that's `docs/story.md`).

This mission is **full mechanic, not full objective**: every step below is
tracked internally (`quest.Events.on(...)` in `controller/m01/`: `recon`, `breach`, `access`, `vault`) and gates the
next step, but the player only ever sees **one** objective — "Track down
the broker... then report what you find to the dead drop." Nothing below
shows up as its own checkpoint in-game; this script exists so a tester can
verify the full chain still works end to end, not just the final mail.

**This version is randomized per save.** Which of 18 SOLD listings (6 per
marketplace) is "the real one" is picked once per playthrough
(`src/context/m01/listing.ts`, `Random.pick`, persisted via
`SaveStorage` + mirrored to `Variables` — see `docs/bugs.md` entry 20 for
why it has to work this way). Every listing's Category/Region/Code/Vendor
label is regenerated too, not just the winner's. This script describes the
*shape* of the flow — exact listing codes/domains will differ every test
run. Read the in-game log to see what got picked this run.

---

## 0. Entry point

With `isDev=true` + `DEV_FOCUS_QUEST.m01=true` (the current dev config in
`src/guard/flags.ts`), `AutoStart=true` — the mission claims itself and
the tip mail is waiting immediately, no HackHub feed post to click.

To test the real production entry point instead (GHOSTWIRE's HackHub feed
post), flip to `isTester=true` + `TESTER_FOCUS_QUEST.m01=true` (or a full
`isDev=false`/`isTester=false` production build) and claim the mission by
opening the post in the HackHub feed.

M1's market and company sites (Blackwire, Frostgate, Obsidian, ClearEscrow)
answer the 404 page before M1 starts and after it completes or is
abandoned; they are open only while M1 runs (`gateMissionPages`,
`docs/architecture.md` "Website access"). LedgerVault stays open on purpose
(permanent domain, its own seal).

---

## 1. Tip mail & the "opsadmin" near-miss

1. Open Mail, read the message from `ghost.tip@ghost.index`, subject
   **"you should look into this"**. Points at a handle close to
   "opsadmin" and warns "the storefront's just the front door. Whatever
   this guy actually runs lives somewhere deeper" — this line is the
   foreshadowing payoff for step 8 below.
2. `lynx opsadmin` → traces to Twotter handle `@cryp7net`, explicitly
   flagged as "a partial match on an old alias" — a deliberate dead end,
   not the real login.

## 2. Find the real listing among 18

3. Twotter (`cryp7net`'s posts) name all three marketplaces:
   `blackwire-network.mkt`, `frostgate-exchange.mkt`,
   `obsidian-access.mkt`.
4. Each marketplace has 6 delisted ("no longer listed") SOLD listings,
   reachable via `dirhunter <domain>` (dirhunter lists every registered
   page path for a domain — there is no engine-level way to hide a
   mod-registered page from it, so all 18 show up, mixed in with the
   ACTIVE ones).
5. Open listings until you find the one that is **both**:
   - `Region: SEA`, **and**
   - `Vendor: X7xS3NTRY9`
   Six of the 18 are region-SEA (diluted, not just the real one), so SEA
   alone doesn't identify it — Vendor is the second, exclusive signal.
   The winning page also carries the full "hospital network, rush job"
   narrative and `data-m1-canonical-listing="true"` on `<body>`. Opening it
   → key **Broker identified** (`broker`) and the first personal-log entries
   (one toast).
6. `nslookup frostgate-exchange.mkt` → `geoip <ip>` → Iceland/Reykjavik.
   Rules out frostgate as a whole storefront (unrelated to which single
   listing on it might be the winner this run).

   **Optional (not load-bearing):** each marketplace's `gateway.<domain>`
   subdomain is a decommissioned SSH dead-end now (all three, uniformly —
   see `docs/bugs.md` context from this session). `nmap`/`ssh` into any of
   them just confirms "nothing here," no gate depends on it.

## 3. Firewall breach via Kimai + JWT — **[CHECKPOINT]**

7. `nslookup failover.blackwire-network.mkt` still resolves (now pure
   flavor, no longer the firewall — kept for subdomain-count symmetry).
8. `lynx X7xS3NTRY9` (the vendor name from step 5) → reveals
   `x7xsentry9.tech`, described as a personal domain registered under a
   near-identical handle, plus a note that this vendor reuses weak
   passwords across other breach dumps (builds confidence for the hydra
   step later, doesn't hand over the password).
9. `subfinder -d x7xsentry9.tech` → `be7.x7xsentry9.tech` (backend) and
   `fw7.x7xsentry9.tech` (firewall).
10. Download **kimai** from the HackDB catalog, then
    `python3 kimai.py <fw7 ip>` → fires ~10 harmless Wireshark-visible
    packets and leaks a signed JWT for the firewall's own user, with a
    5%/iteration chance guaranteed by the 10th run.
11. `python3 jwt_decoder.py <token>` → decodes to `failsafe` /
    `Gr1dLock#42`.
12. Browser → `http://<fw7 ip>/` → pfSense login with those credentials.
13. Make any change in pfSense and save it → lifts the firewall rule
    blocking port 22 to the backend and opens port 22 on the backend IP.

## 4. Crack the backend SSH credentials

14. Browser → `hackdb.net` (base-game tool marketplace, same store as
    `kimai`/`jwt_decoder`) → buy/download **wordlist** (`wordlist.lst`,
    ~15,000 passwords).
15. `hydra -T <be7 ip>:22 -l X7xS3NTRY9 -P <path>/wordlist.lst` — username
    is the vendor name from the winning listing, not "opsadmin" (that
    handle was the deliberate near-miss from step 1-2). Animated
    brute-force, then "Login information matched!", `Terminal.Hydra`
    fires.

## 5. Into the backend, find the IRC trail

16. `ssh X7xS3NTRY9@<be7 ip>`, password from step 15's hydra output.
17. Explore `/home` (`ops_notes.txt`, `todo.txt`, `readme.txt` — flavor)
    and `/logs` (every `.log` there is stored as Log Viewer entries: `cat`
    prints `[date] TYPE text` per entry, the Files app opens the Log Viewer
    after the file is downloaded). `sales_ledger.log` → three entries dated
    2026-06-18, 2026-07-14 and 2026-08-03, the last one `ROW <winning listing
    code>` (whatever code the winning slot resolved to this run); all name the
    buyer `TR4C3#404` — reading it by `cat`, `open` or the Log Viewer → key
    **Buyer linked** (`buyer`); `ops-relay.log` → one entry dated 2026-09-16
    15:01 (see step 18); `auth.log`/`cron.log`/`system.log` are dummy noise.
18. Read `ops-relay.log` (`cat`, `open` or the Log Viewer). The Log Viewer
    shows only `[ENCRYPTED]`; the terminal prints
    `[2026-09-16 15:01:00] <base64 blob> [ENCRYPTED]` (the blob rides in the
    entry's `type`, which only `cat` prints), so copy the blob from the
    terminal, then decrypt it with `openssl` → plaintext
    reveals IRC host `relay.blkledger.dark` and channel key `n0ledger`.

## 6. Confirm via IRC, find the vault

19. `weechat relay.blkledger.dark`, password `n0ledger` → connects, seeded
    chat history is the broker (`defc9`) talking directly to the buyer
    (`t404`, self-confirms as **TR4C3#404**), and leaks the LedgerVault
    mirror domain `x7k2m9vdlq4wnyt3.dark` across two separate lines.
20. Browser → `x7k2m9vdlq4wnyt3.dark` (LedgerVault) → key **Vault reached**
    (`vault`) and the aftermath personal-log entries. The projects list has
    `Q1-2020-NA`, `Q2-2023-EU` (context/flavor) and `Q3-2026-SEA` (this
    project code is required for the report). **Clicking the `Q3-2026-SEA`
    folder** → key **Case file opened** (`caseId`) — the folder click is
    reported to the quest through the page's `Website.Exports`
    (`flatlineOpenProject`) + `Events.emit`; that a quest-scoped
    `this.Events.on` receives a website-emitted event is unverified until this
    run. Inside the Q3 folder: `case_id.txt` (**CASE-A7X-0417**, fixed,
    independent of the random listing code), `network_map.txt` (a static
    evidence image — deliberately generic, doesn't cite a specific listing
    code so it can never go stale from randomization), `found_note.txt` (a
    hand-written sticky note, signed "-- R.a.N"), plus seven photographs in
    this order: the ClearEscrow receipt (Aug 03), the annotated PacificCare
    site recon (Jul 09), the ward corridor (Aug 15), the BLACKLEDGER notice
    (Aug 14), the locked surgical scheduling screen (Aug 14), the access kit
    (Aug 07) and the consultant visitor pass (Aug 03). Receipt, recon,
    access kit and visitor pass are `.jpg`; corridor, notice and scheduling
    are `.png` (`public/assets/m01/q3-*`; `q3-exterior.png` stays for the
    login backdrops of the M5 portal and RDC). `associate_infra.txt` is an M2
    teaser. The `Recent` sidebar view lists `found_note.txt`, `case_id.txt`,
    `network_map.txt`, the corridor and the scheduling photograph, `Shared`
    lists the receipt, but only the Q3 folder click traces `caseId`.

---

## 7. Report findings (the one objective the player sees)

Compose a mail to `drop@drop.null` (the Custodian), either:

- The **"Mission 1 Findings"** template, fields: `listingCode` (the
  winning listing's resolved code, e.g. what `sales_ledger.log` showed),
  `broker: X7xS3NTRY9`, `buyer: TR4C3#404`, `caseId: CASE-A7X-0417`,
  `project: Q3-2026-SEA`, `vaultUrl: x7k2m9vdlq4wnyt3.dark`, or
- A freehand mail matching `buildM01ReportBody(<winning listing code>)`
  exactly (see `src/content/m01/`).

**[CHECKPOINT — hard gate]** Silently rejected if LedgerVault (step 20)
hasn't been visited yet, regardless of report content correctness.

Once accepted: objective "Track down the broker..." completes,
`AutoComplete` finishes the mission, reward 250 money / 60 xp (0/0 while
still in dev-focus or tester-focus mode).

---

## 8. What BACKTRACE shows

While the mission runs, the M1 card lists only the **keys** found so far
("TRACED SO FAR // x OF 4", title + value, no descriptions), one per action:

| Key | Title | Action |
|---|---|---|
| `broker` | Broker identified | open the winning listing (step 5) |
| `buyer` | Buyer linked | read `sales_ledger.log` by `cat`, `open` or the Log Viewer (step 17) |
| `vault` | Vault reached | open LedgerVault (step 20) |
| `caseId` | Case file opened | click the `Q3-2026-SEA` folder (step 20) |

At COMPLETE the M1 report opens with 5 Key Findings composed from those keys
plus the extras that only exist in the snapshot (the winning listing code and
the project code). `backtrace m1 keys` lists the keys in-game. The steps that
keep a quest flag (the listing, the vault, the Q3 folder) are re-traced when
the quest restarts; `buyer` has no flag and is not.

## Known follow-up

Resolved 2026-09-24: M2 used to reference `"MED-SEA-0417"` as flavor data in
its affiliate table, which could not match M01's randomized listing code; the
M2 redesign replaced it with `M01_CASE_ID` (`CASE-A7X-0417`, fixed). No
open follow-up for M01.

---

## Appendix — network topology reference

### Layer 1 — real network tree (5 routers, one per chain + 3 uniform decoy boxes)

Grouped by chain (each marketplace's storefront + its own decommissioned
gateway decoy together), not by node type. The real backend is its own
separate chain, found only via `lynx X7xS3NTRY9` — never through any
marketplace's own subdomains.

```
=== BLACKWIRE CHAIN (blackwire-network.mkt) ===

M01_BLACKWIRE_ROUTER_IP  198.51.100.230 (Router)
   ├─ M01_BLACKWIRE_IP          198.51.100.77  (Device) [blackwire-network.mkt -- root domain, storefront]
   │  ports: 443 https (open) · 10 dirhunter-visible listing paths (4 ACTIVE + 6 SOLD)
   ├─ M01_LEGACY_IP             198.51.100.212 (Device) [legacy.blackwire-network.mkt]
   │  user: admin / admin123
   │  ports: 22 ssh · file: decommissioned.txt (dead end/flavor)
   └─ M01_BLACKWIRE_GATEWAY_IP  198.51.100.245 (Device) [gateway.blackwire-network.mkt]
      user: netops / netops2022 — decommissioned dead end (uniform with the other two below)

=== FROSTGATE CHAIN (frostgate-exchange.mkt) ===

M01_FROSTGATE_ROUTER_IP  91.243.67.1    (Router)
   ├─ M01_FROSTGATE_IP          91.243.67.210  (Device) [frostgate-exchange.mkt -- root domain, storefront]
   │  ports: 443 https (open) · 10 dirhunter-visible listing paths (4 ACTIVE + 6 SOLD)
   ├─ M01_FROSTGATE_GATEWAY_IP  91.243.67.220  (Device) [gateway.frostgate-exchange.mkt]
   │  user: support / support123 — decommissioned dead end
   └─ M01_FROSTGATE_API_IP      91.243.67.235  (Device) [api.frostgate-exchange.mkt]
      user: apiadmin / apiadmin99
      ports: 22 ssh · file: decommissioned.txt (dead end/flavor)

=== OBSIDIAN CHAIN (obsidian-access.mkt) ===

M01_OBSIDIAN_ROUTER_IP   5.188.94.1     (Router)
   ├─ M01_OBSIDIAN_IP           5.188.94.130   (Device) [obsidian-access.mkt -- root domain, storefront]
   │  ports: 443 https (open) · 10 dirhunter-visible listing paths (4 ACTIVE + 6 SOLD)
   ├─ M01_OBSIDIAN_GATEWAY_IP   5.188.94.140   (Device) [gateway.obsidian-access.mkt]
   │  user: mirror / mirror2023 — decommissioned dead end
   └─ M01_OBSIDIAN_API_IP       5.188.94.155   (Device) [api.obsidian-access.mkt]
      user: apisvc / svc2024api
      ports: 22 ssh · file: decommissioned.txt (dead end/flavor)

=== REAL BACKEND CHAIN (x7xsentry9.tech -- found only via `lynx X7xS3NTRY9`) ===

M01_BROKER_INFRA_IP      194.36.108.20  (Device, standalone, no ports/users) [x7xsentry9.tech -- root domain]
   nothing runs on the root itself; it just exists to reveal be7./fw7. below
   as addresses.

M01_ROUTER_IP            91.198.174.3   (Router)
   └─ M01_TARGET_IP          77.91.14.203   (Device, IP hidden) [be7.x7xsentry9.tech]
      user: X7xS3NTRY9 / Tn8$rWq3yK1z (username = vendor name off the
      winning listing, password cracked via hydra — wordlist from hackdb.net)
      ports: 22 ssh (CLOSED until pfSense breach) · 80 http (closed) · 443 https (open)
      files: /home/{ops_notes,todo,readme}, /logs/{sales_ledger,ops-relay,auth,cron,system}

M01_FIREWALL_ROUTER_IP   45.132.11.1    (Router)
   └─ M01_FIREWALL_IP        45.132.11.87   (Firewall, IP hidden) [fw7.x7xsentry9.tech]
      user: failsafe / Gr1dLock#42 (leaked via kimai -> jwt_decoder)
      ports: 80 http (open, pfSense UI) · rule blocking 22->target (removed on PFSense.Changes)
```

18 total SOLD listings = 6 per marketplace × 3 marketplaces combined, not per-site.

### Layer 2 — listing pool (slots in `src/content/m01/listing-pool.ts`, resolution in `src/context/m01/listing.ts`, 18 slots)

6 SOLD listings per marketplace (blackwire/frostgate/obsidian), each with
an opaque, non-semantic path (`/listings/a92d-3f21c/`-style — deliberately
not derived from the listing's own regenerated label, so there's nothing
for `dirhunter`'s raw path output to leak). Each slot's
Category/Region/Code/Vendor combination is regenerated once per save:

- Exactly 1 winner: Region forced `SEA`, Vendor forced `X7xS3NTRY9`.
- 5 more slots forced `SEA` too (6 total region-SEA, diluting that signal).
- Remaining 12 slots: Region random from `EU`/`NA`/`APAC`.
- All 18: Category random from the 8-value list, Code a unique random
  4-digit number, non-winner Vendor a random pick from the 17
  `M01_DECOY_VENDOR_ALIASES` (the same names ClearEscrow's board uses).

The 12 still-ACTIVE listings (4 per marketplace) are unaffected —
static content, opaque paths only for `dirhunter` consistency.

---
# M06 "Open Register" — Playtest Script (phase 2: walking skeleton)

Status: **use once, disposable** — script for the M06 walking skeleton built in
phase 2 of the M4-M7 run. Phase 7 extends this file into the full walkthrough.
Not a permanent design doc (that is `docs/world-building/08-spec-m5-m6.md` §C
and `09-konten-m5-m6.md` §C).

**What phase 2 is for.** M06 is the project's first **zero-network mission**:
`networkIps: []` and `networks: () => []`. That path is verified in the code
(`core/register.ts`, `components/topology.ts`) but **has never been run in the
game** (`08` §C5, README "Batasan urutan implementasi" #3). This build exists
to answer four questions live:

1. Does a mission with no network at all start, run and complete?
2. Does `dirhunter pcr-registry.org` print a registered path with **no subnet
   anywhere** (engine fact E-3, `docs/bugs.md` #40)?
3. Does a `Browser.Meta` page visit work as a gate on a mod site that has no
   network behind it?
4. Do `whois` / `nslookup` fixtures resolve a domain that was never registered
   with `Network.registerDomain` (E-1)?

**Not built yet (phase 7).** The full 10-step chain, HostTrail, the Echoline
M6 pages, the conflicting 2019/2024 filings and the snapshot comparison, the
insurer and infrastructure links, the Conrad Lindqvist record, the M1-M3
consequences mirrored from the `backtrace` state, the designed Registry visuals
(the `frontend-design` pass), and the full 5-column report. The skeleton stops
after the unlinked filings page.

---

## 0. Entry point

M06's production prerequisite is `flatline.m05`, which does not exist yet, so
M06 is **unreachable in production** on purpose (prompt §8 D3). Test with dev
focus:

1. In `src/guard/flags.ts` set `DEV_FOCUS_QUEST.m06 = true` and every other
   entry to `false`. Leave `isDev = true`, `isDebug = false`, `isTester = false`.
2. Build and install, restart HackHub.
3. Expect in the log:
   - `[FP][Backtrace] m6 -> progress`
   - `[FP][M06] probe:zero-network register built=true`

> That `built=true` is correct, not a bug. With `networkIps: []` the first
> `register` reports "the world was applied" and the controller records
> `networkBuilt`. From then on `networksExist([])` is vacuously true, so every
> later `register` takes the keep path and nothing is rebuilt. Confirmed in the
> harness; the live run is what proves no network is created.

**Also check the Network Map app:** M06 must add **nothing** to it. If a node
appears at any point during this mission, that is a finding — report it.

**Remember to put the focus flag back to `false` before committing.**

---

## 1. Tip mail

1. Open GoMail. One mail from `drop@drop.null`, subject
   *"nominees: who signs for it"*.
2. Read it. It names the register host `pcr-registry.org`, the jurisdiction
   Port Calder, and the entity SKN Capital Nominees (which M3 already proved).

Expected: internally `tipReviewed`. Nothing later advances until this is done.

---

## 2. The register

```
nslookup pcr-registry.org
nmap pcr-registry.org
```

Expect `38.242.76.19`, and `80 CLOSE` / `443 OPEN`. Then open
`https://pcr-registry.org/` in the browser.

Expected: `[FP][M06] probe:registry-page { pathname: '/' }` and internally
`registryReached`, which unlocks the agent-domain `whois` fixture.

> **`http://pcr-registry.org/` must return the shared 400 page**, because port
> 80 is CLOSE (`rules.md` §6). An http visit must **not** advance the step.

---

## 3. The entity record

From the register index, click **SKN Capital Nominees Ltd**. The path is an
opaque token, `/entity/r7k4/`, on purpose: `dirhunter` prints every registered
path, so a readable slug would hand the player the answer (E-3).

Expect the particulars: company number PC-114772, incorporated 2017-03-09,
Port Calder, registered agent **Marlowe & Pryce Corporate Services ·
marlowepryce.biz**.

Expected: `probe:registry-page { pathname: '/entity/r7k4/' }` and internally
`nomineesRead`.

---

## 4. The agent — the fixture-without-a-domain check

```
whois marlowepryce.biz
```

Expect contact **Marlowe & Pryce Corporate Services** and ip `87.236.19.144`.

This is question 4 of this playtest: that domain is **never** passed to
`Network.registerDomain` and has no subnet (E-1 says `registerDomain` would do
nothing without one). It exists only as a `whois` / `nslookup` fixture.

Expected: `[FP][M06] probe:agent-whois` and internally `agentIdentified`.

Also try, in the same session:

```
nslookup vpn.skn-central.net
```

Expect `203.0.113.160` — the endpoint M3 ends on, supplied by fixture only.
This is the thread M6's full version pulls on in phase 7; here it just has to
resolve.

---

## 5. The unlinked page — the `dirhunter` check

**The player needs the `dirhunter` package installed in-game.** Then:

```
dirhunter pcr-registry.org
```

Expect `/`, `/entity/r7k4/` **and** `/filings/archive/`, plus
`[FP][M06] probe:dirhunter-no-subnet { host: ..., results: [...] }` in the log.

This is question 2 of this playtest. Nothing in M06 ever creates a subnet, so if
`dirhunter` answers "Website not found." instead of listing the paths, E-3's
reading of the engine is wrong for a networkless mission and phase 7's design
needs rethinking — report it with the exact output.

Then open `https://pcr-registry.org/filings/archive/`. The page is registered
but **not linked from anywhere**, and says so. In the skeleton its table is the
designed empty state; the real 2019/2024 filings arrive in phase 7.

Expected: `probe:registry-page { pathname: '/filings/archive/' }` and internally
`hiddenFilingsFound`.

---

## 6. Report

Compose to `drop@drop.null` with the **Mission 6 Findings** template:

- `nominees` → `SKN Capital Nominees Ltd`
- `agent` → `Marlowe & Pryce Corporate Services`

Case and extra spaces are forgiven. `Alexander Voss` (the nominee director who
becomes the decoy in phase 7) is rejected.

Expected: the single objective completes, `[FP][Backtrace] m6 -> complete`, and
`[FP][M06] reward skipped under focus: 1800`.

> The payout only happens in a **production-mode** run (D1): under dev or tester
> focus it is skipped and logged, so repeated test completions cannot inflate the
> balance. To see `[FP][M06] reward paid: 1800` the owner has to run with every
> focus flag `false`, which also means M06 needs `flatline.m05` first.

**Send it early on purpose too.** Before the filings page, send the same correct
report: expect **one** reply from `drop@drop.null` subject *"not yet"*, whose
middle paragraph names the step actually missing. Sending again replaces that
reply instead of stacking a second one.

---

## 7. Skeleton probes

| Probe | Log line | Fires on |
|---|---|---|
| zero-network register | `[FP][M06] probe:zero-network register built=<bool>` | `OnObjectivesStart` |
| registry page visit | `[FP][M06] probe:registry-page` | every `https` `Browser.Meta` on the register |
| agent whois | `[FP][M06] probe:agent-whois` | `Terminal.Whois marlowepryce.biz` |
| dirhunter | `[FP][M06] probe:dirhunter-no-subnet` | `Terminal.Dirhunter` on the register host, with the full path list |

`dirhunter` is **only** a discovery tool here. The gate is the page visit,
because `Terminal.Dirhunter` has never been used as a gate in this pipeline
(`08` §C2).

---

## 8. Known follow-ups (not fixed / not yet live-tested)

1. **The whole zero-network path is unproven live** — that is the point of this
   phase. `docs/bugs.md` #47.
2. **`dirhunter` with no subnet anywhere** is a static reading of the engine
   (E-3). Section 5 is the test.
3. **The chain is a 5-step subset** of the spec's 10 steps, in the spec's order.
   Phase 7 adds `snapshotsCompared`, `insurerLinked`, `infraLinked` and
   `identityProven`, and replaces the 2-column report with the spec's 5 columns.
4. **No BACKTRACE keys for m6 yet** — `BACKTRACE_KEYS.m6` is empty until phase 7.
5. **The Registry visuals are deliberately plain.** The `frontend-design` pass
   happens in phase 7 (prompt §6).
6. **The reward is unverified live** (`docs/bugs.md` #42) and only pays outside
   focus.

---

## Appendix — what M06 registers

```
NO NETWORK AT ALL
  networkIps: []        networks: () => []
  Nothing is passed to Network.createSubnetNetwork or Network.registerDomain.

Site (gated to m06 by gateMissionPages)
  pcr-registry.org   38.242.76.19    nmap fixture: 80 CLOSE, 443 OPEN
    /                    register index, links the entity record
    /entity/r7k4/        SKN Capital Nominees Ltd, opaque token path (E-3)
    /filings/archive/    registered, linked from nowhere; found with dirhunter

Fixtures at build
  nslookup pcr-registry.org -> 38.242.76.19
  nmap     pcr-registry.org -> [80 CLOSE, 443 OPEN]
  nmap     38.242.76.19     -> [80 CLOSE, 443 OPEN]

Fixtures unlocked at step 2 (registryReached)
  whois    marlowepryce.biz -> Marlowe & Pryce Corporate Services, 87.236.19.144
  nslookup marlowepryce.biz -> 87.236.19.144
  nslookup vpn.skn-central.net -> 203.0.113.160   (the M3 endpoint, fixture only)
```

---

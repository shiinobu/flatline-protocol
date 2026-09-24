# Temporary Working Notes

This is a **disposable, reusable scratch file** — not a permanent doc. It
holds dev-session comments/investigation notes for whichever mission is
currently under **active development** (not yet FINAL LOCK). Once that
mission reaches FINAL LOCK, its entries here get filtered: real findings
move to `docs/bugs.md` (engine/SDK bugs) or `docs/story.md` (design/story
rationale), anything that was just noise gets dropped, and
this file goes back to empty (or gets reused for whichever mission is
active next). See `docs/implementation-rules.md` §9 for the full policy
this file exists to support (zero comments in `src/`).

**Currently scoped to: M02-M04, plus a reopened M01 localization pass.**
M01 reached FINAL LOCK on 2026-09-19 (findings folded into `docs/bugs.md`
entries 1-11 and `docs/story.md` section 4) but was reopened for a
Localization pass (EN + Simplified Chinese, `zh` — confirmed via
`Localization.languages()` live, not `zh-CN`) before the real final lock.
M02-M04 are implemented but not yet live-tested.

---

**M01 Localization, Phase 1 (quest-level text) — implemented, not yet
live-tested.** New `src/content/m01-i18n.ts` holds every EN/`zh` string
pair and calls `Localization.registerAll()`; `m01.ts`/`m01-quest.ts` now
read strings via `Localization.t(KEY, vars?)` instead of literals.
Deliberate scope exclusions, decided while doing this pass:

1. **`M01_DUMMY_AUTH_LOG_CONTENT`/`CRON_LOG`/`SYSTEM_LOG`** — left
   English-only. These are raw log-format output (usernames, IPs, cron
   job names), which reads as technical/system content conventionally
   left untranslated regardless of locale, same as a real server's logs.
2. **`whois` contact `"Registrar Privacy Service"`** — left
   English-only for the same reason: a real WHOIS privacy-proxy service
   name is a proper noun, not prose, and wouldn't change with the
   viewer's language in reality.
3. **`M01_IRC_NOTES_CONTENT`/`M01_IRC_NOTES_ENCRYPTED`/
   `M01_IRC_NOTES_FILE_CONTENT`** — deliberately NOT localized. The
   `Terminal.Openssl` handler (`m01-quest.ts` line ~911) does
   `data.output !== M01_IRC_NOTES_CONTENT` as an exact-match objective
   gate against the base64-decoded file. If the plain-text constant were
   localized but the pre-computed `M01_IRC_NOTES_ENCRYPTED` base64
   blob still decoded to the old English text (or vice versa), the
   decode objective would silently break for non-English players. Fixing
   this properly means deriving the base64 from the live localized text
   at read time instead of a frozen constant — out of scope for this
   pass, revisit if it matters.
4. **IRC line `"x7k2m9vdlq4wnyt3"`** — left untranslated; it is a literal
   address fragment, not prose.
5. **Twotter bios/posts (`M01_TWOTTER_BROKER/CONTACT/DECOY_BIO`+`_POSTS`,
   ~41 tweets total)** — deferred to Phase 2 alongside the HTML website
   work, not included in this Phase 1 batch. They render through the
   Twotter app's own UI (conceptually closer to "site content" than
   quest/mail/IRC text) and are high-volume enough that bundling them
   with the smaller quest-level batch risked lowering translation
   quality/review quality for both.

**Verified live (2026-09-23):** `Localization.t(key)` called with no
`vars` leaves an unmatched `{{token}}` untouched instead of
stripping/breaking it (`scratchloc` output: `noVars: Listing:
{{listingCode}} done.`) — confirms `M01_REPORT_TEMPLATE_CONTENT`'s raw
`{{listingCode}}`/etc. tokens survive `Localization.t()` intact for
GoMail's own templating to fill in later.

**Confirmed bug + fix (2026-09-23): `Title`/`Description`/`HackhubPost`/
`Objectives` must stay plain fields, resolved once — not getters, and
not assigned inside `OnObjectivesStart()`.** Two failure modes found
live, both explained by decompiling `.reverse/extracted/index.js`:

- **`export const X = Localization.t(KEY)` at module scope** (the
  original Phase 1 mistake) froze every string at whatever language was
  active when the mod module first loaded — confirmed via a `scratchloc`
  three-way check (`Localization.language()` and a live `t()` call both
  correctly returned `"zh"`, but the pre-resolved module constant still
  read English). Fixed by turning these into functions called at actual
  use time inside `OnStart()`/`OnObjectivesStart()`, which a temporary
  trace confirmed does see the correct live language.
- **That fix does not extend to `Title`, `Description`, `HackhubPost`,
  or `Objectives`.** Converting `Title`/`Objectives` to `get` accessors
  and assigning `Description`/`HackhubPost` inside `OnObjectivesStart()`
  broke the HackHub recruitment post entirely (it never appeared) and
  showed raw `M01.QUEST.TITLE`-style keys in the quest tracker instead of
  text. Root cause, confirmed in the decompiled client:
  - `Oa.Manager.HandleQuestHackhubPosts()` decides whether to create a
    quest's recruitment post by constructing a **throwaway probe
    instance** (`const J = new U`) and checking `J.HackhubPost` —
    `OnObjectivesStart()` is a claimed-quest lifecycle hook and never
    runs on this probe, so anything set only there is always `undefined`
    here, regardless of Localization timing.
  - `Quests.Claim()` calls `Se.Objectives.Start()` right after
    construction — a plain array has no `.Start()`, so the engine must
    be internally replacing `this.Objectives` with its own manager
    object after reading the mod's initial value. A getter-only
    `Objectives` (no setter) silently blocks that reassignment.
  - Net rule: `Title`/`Description`/`HackhubPost`/`Objectives` are all
    read/rewritten through plain, writable instance fields at points the
    mod does not control (throwaway probes, post-construction
    reassignment) — they must be assigned once, synchronously, at class
    construction, same as before Phase 1 touched them. Only content
    reached through `OnStart()`/`OnObjectivesStart()`'s own body (mail,
    IRC, device files, OSINT `lynx`/`nmap` flavor) is safe to resolve
    per-language on every load. Net effect: those four "quest chrome"
    fields stay frozen at whichever language was active when the mod
    first loaded that session (the original Phase-1-era limitation,
    now understood and accepted rather than incorrectly "fixed").

**M01 Localization, Phase 2 (website content) — architecture corrected
after a confirmed SDK bug (bugs.md entry 22).** `Localization.t()` cannot
be called directly from inside a `Website`'s `metadata(context)` — it
returns the raw key there even for keys already proven registered and
working from `Command.Run()`/`Quest` lifecycle contexts. Fix in place:
`src/content/m01-site-strings-cache.ts` exports `refreshM01SiteStrings()`
(calls the real `Localization.t()` from `OnObjectivesStart()`, a trusted
context, and caches every key's resolved text into `Variables`) and
`siteT(key, vars?)` (reads that cache and does `{{var}}` substitution
itself). `localizeHtml()` and `m01-listing-templates.ts` both call
`siteT()`, never `Localization.t()` directly. **Any future website
localization work (frostgate, obsidian, clearescrow, ledgervault, or any
other mission) must add its key object's `Object.values(...)` into
`M01_ALL_SITE_KEYS` in `m01-site-strings-cache.ts` and use `siteT()`, not
repeat the `Localization.t()`-in-`metadata()` mistake.** Blackwire-network
is implemented against this corrected architecture and typechecks clean;
not yet re-live-tested since the pivot as of this note.

---

**M02 ("The Maker") — implemented, not yet live-tested.** Deviations/
assumptions to confirm once played:

1. **`Terminal.NmapScan`'s `versionScan` flag gates "use `-sV`."** Used
   the raw `Terminal.NmapScan` event (`{ip, versionScan?}`) directly
   instead of `Terminal.Command`+`Shell.getCommandData` (M01's approach)
   to check `-sV` was actually passed, since `Shell.addCommandData`'s
   fixture is keyed by IP only and can't distinguish the flag. Simpler
   than M01's approach; unconfirmed whether `versionScan` is reliably set
   by the real command regardless of fixture presence.
2. **`Subfinder.Results` is assumed to auto-populate from `Network.
   registerDomain`.** No SDK namespace exists to explicitly seed subfinder
   results, so the dev subdomain is just registered as its own domain
   (`Network.registerDomain(M02_DEV_SUBDOMAIN, M02_DEV_IP)`) and the
   objective listens for it to show up in `Subfinder.Results.subdomains`
   when the player runs `subfinder` on the root domain. Unconfirmed
   whether the engine actually cross-references registered domains this
   way.
3. **`Sqlmap.DumpTable`/`John.DecryptHash` completion is identity-only,
   not content-verified.** `SqlmapDumpTableEvent` only carries
   `{host, tableName}` (no row data) and `JohnDecryptHashEvent` only
   `{hash, password}` — there's no SDK-level guarantee the *displayed*
   dump actually shows the seeded `Database` rows the player needs to
   find the hash in the first place. Assumes `sqlmap`'s UI reads from
   `Database.create`'s seeded tables; not yet confirmed live.
4. **`Metasploit.Rootgrab`/`Meterpreter.Download` gate purely on `ip`/
   `host`, with no module or exploit-name check.** `Network.
   setVulnerabilities(M02_WORKSTATION_IP, [{type: "RCE"}])` is assumed to
   be what lets `metasploit search`/`use` find a matching module against
   that host; unconfirmed whether `RCE` alone is specific enough or
   whether a `version` string is also required for a real match.

---

**M03 ("Money Trail") — implemented, not yet live-tested.** Deviations/
assumptions to confirm once played:

1. **`PFSense.Changes` carries no `ip` field at the type level.**
   `PFSenseChangesEvent` is just `{old: any, new: any}` — there is no way
   to confirm which pfSense box a change belongs to from the event alone.
   Assumes a single-active-session model: `PFSense.Login` (which does
   carry `ip`) sets a `pfsenseLoggedIn` flag, and every `PFSense.Changes`
   that fires while that flag is set is attributed to the target pfSense
   box. The first change completes `pivotViaNat`; a second change (after
   the ledger is dumped) completes `revertNatRule`. Not yet confirmed
   this single-session assumption holds, or that the event fires exactly
   once per rule add/revert rather than per field edited.
2. **`Wireshark.Started` completion doesn't filter by source/destination
   IP.** `WiresharkListeningEvent{source?, destination?}` are both
   optional (unset means "capture everything"), so the objective just
   requires wireshark to be started *after* the NAT pivot, not that it's
   scoped to the finance VLAN specifically. Loosest of all the M02-M04
   gates in this file; revisit if it completes too easily in practice.
3. **LAN-style child IP (`10.50.0.5`) used for the Finance VLAN device**,
   consistent with the Router-wrapping-child-Device shape confirmed
   necessary in `docs/bugs.md` entry 5. Unlike M01's flat topology
   (which needed restructuring after the fact), M03 already uses a
   `children`-nested shape — but has not yet been live-tested to confirm
   it actually connects.
4. **`lynx <handle>` is used for the finance employee's leaked-password
   OSINT instead of a real Twotter account/post.** Simpler and consistent
   with M01's lynx-on-arbitrary-string-input pattern; means there's no
   actual social post the player can browse to, only the terminal lookup
   — a narrower implementation of the story's "public post" framing.

---

**M04 ("The Architect") — implemented, not yet live-tested.** Deviations/
assumptions to confirm once played:

1. **The premature-`cat` "self-wipe" trap is punitive-only, not a real
   file deletion.** There's no SDK call to delete a single file off a
   remote device's declarative `rootFiles`, so triggering the trap just
   sends a warning mail (`M04_TRAP_WARNING_*`) — the file remains
   extractable via the safe path afterward rather than being permanently
   lost. This is a deliberate, documented compromise, not an oversight;
   revisit if the SDK gains a remote per-file delete primitive.
2. **`attrcheck` reveals the trap via a custom mod event
   (`flatline.m04.attrcheckRevealed`), not a native `ModEventMap` entry.**
   Works via `QuestEvents.on`'s generic string-event fallback (typed
   `any`); no declaration-merging was added for it, kept intentionally
   minimal per the zero-comments/no-speculative-abstraction rules.
3. **`extractSafely` gates on `Files.Transfer` with `type: "DOWNLOAD"`.**
   Assumes this event fires for a remote-to-local file copy via
   `explorer` or similar, not just for in-game store/app downloads.
   Unconfirmed live.
4. **`Terminal.Ls` discovery (`discoverIdentityFile`) only checks that
   the player is connected (SSH or already privileged), not that the
   specific folder/file was listed** — `Terminal.Ls`'s payload is the
   *folder* (`FileInfo`), not a list of its children, so there's no way
   to confirm the identity file specifically was among what was shown.
   Slightly looser than intended; would complete on any `ls` once
   connected.
5. **The A/B/C ending is resolved entirely through GoMail (one template
   field with 3 valid values, plus a matching 3-body freehand fallback),
   not through the `Dialog`.** The `Dialog` in `content/m04.ts` is
   flavor-only, triggered via `this.createDialog("default")` right after
   `extractSafely` completes, and deliberately carries no `onSelect`/
   `onEnd` function properties on any option — see `docs/story.md`'s
   note on the `onSelect`/`Dialog` lesson entity-resolution-mods learned
   the hard way. Confirm live that `createDialog` at that point doesn't
   collide with anything else already showing.

---

**Carried over from M01, now resolved (2026-09-20 redesign pass):** the
Router-wrapping-child-Device audit flagged above was done for all three
missions. M03 already had it right pre-redesign (only the finance VLAN's
internal shape changed, to add a `Splitter`). M02's workstation is now a
`Network.createWifiNetwork` AP (wraps correctly by construction). M04's
C2 host was the one actually broken pre-redesign (flat top-level `Router`
with direct SSH) — fixed by nesting it under a new `Firewall`+`Splitter`
hierarchy as part of the same pass.

---

**2026-09-20 mechanics redesign — new deviations/assumptions to confirm
once M2/M3/M4 are actually played** (see `docs/network-plan.md` for the
full design):

1. **M2:** `Fern.FindPassword`'s `subnet.ip` is assumed to identify which
   Wi-Fi network was cracked; `Network.WifiConnected` is not separately
   gated (the mission's `unlocksAfter` chain, not a real connectivity
   check, is what stops the player from rootgrabbing the workstation
   before joining its Wi-Fi). Unconfirmed whether the engine would
   actually let `metasploit`/`ssh` reach a Wi-Fi-child device before
   `Network.connectWifi` succeeds, or whether that's purely cosmetic.
2. **M3:** `Terminal.Explorer`'s gate for the bonus objective moved to
   `M03_ACCOMPLICE_IP` (Faded-Ledger); nothing enforces that the player
   actually pivoted through the NAT rule before reaching it (same
   pre-existing looseness `PFSense.Changes` already had, just now on a
   second device).
3. **M4:** the `Firewall`'s `rules` (blocking 22/3389 with `destination:
   M04_C2_IP`) reaching through a sibling `Splitter` to a grandchild
   Device is untested — deliberately not load-bearing for mission
   progress (port 443, the one the mission needs, is `active: true`
   regardless of whether the rule takes effect). The two honeypots'
   `Mail.send` alert on `Terminal.SSH.Connected` is flavor-only — there is
   no suspicion-meter API in this SDK at all (confirmed absent from
   `index.d.ts`), same compromise as M04 finding #1 above.

---

**M02 REDESIGN PLAN (discussed 2026-09-23, NOT YET IMPLEMENTED).** M2 ini
"penyambung cerita" (M1 → M3/M4), jadi pendekatan redesign-nya sengaja beda
dari M1: kedalaman datang dari densitas sambungan + eskalasi taruhan, bukan
dari ambiguitas/decoy breadth ala M1 (M2 tidak butuh misteri "siapa" — target
sudah diketahui sejak awal). Empat perubahan disepakati:

1. **Fix sambungan M1→M2 yang rusak: `"MED-SEA-0417"` → `M01_CASE_ID`.**
   Konfirmasi: string `"MED-SEA-0417"` di `m02.ts` (dipakai di
   `M02_DEPLOY_LOG_CONTENT` dan dialog GHOSTWIRE, "same case") itu SAMA
   dengan placeholder `SOLD_LOTS` di `src/websites/m01/blackwire-network/
   home.html:79` — tapi placeholder itu SELALU di-replace runtime oleh
   `buildM01HomeSoldLots("blackwire")` (`blackwire-network/index.ts:36-40`),
   jadi pemain TIDAK PERNAH melihat string itu di build manapun. Klimaks
   emosional M2 ("case yang sama!") saat ini me-refer ke case code yang
   tidak pernah muncul di M1 nyata. Fix: ganti ke `M01_CASE_ID =
   "CASE-A7X-0417"` (fixed constant, tidak di-randomize, di `m01.ts`),
   import langsung — payoff jadi valid di setiap playthrough.
2. **Copot spoon-feed di tip mail M2.** `M02_TIP_CONTENT` sekarang bilang
   langsung "That alias [TR4C3#404] traces back to a toolkit developer..."
   — buang kalimat itu, biarkan pemain sendiri connect `tr4c3404.dev`
   (LedgerVault M1) dengan alias `TR4C3#404` (IRC M1, self-confirmed,
   fixed/non-random) dari pola namanya.
3. **`affiliates` table: dari 1 baris (korban GHOSTWIRE doang) → beberapa
   baris merepresentasikan AFFILIATE lain**, bukan cuma korban lain. Nama
   "affiliate panel"/"affiliate mirror" sudah ada di kode
   (`M02_AFFILIATE_TABLE`, deploy log "pushed payload_v9 to affiliate
   mirror") — belum pernah dibayar. Reveal: TR4C3#404 bukan cuma pelaku
   satu insiden, dia **pemasok toolkit ke kriminal lain** (RaaS
   affiliate-model, cocok sama framing "BLACKLEDGER = chain of roles" di
   `story.md`). Pakai baris IRC M1 "same as on the last two jobs" sebagai
   jangkar tekstual. Menjawab juga kritik "TR4C3#404 kelihatan flat."
4. **WiFi-crack diganti — plausibility hole dikonfirmasi dari SDK sendiri.**
   `Network.createWifiNetwork()`'s sendiri contoh resminya `ssid:
   "NEIGHBOUR_5Ghz"` dan `getWifiNetworks()` didokumentasikan "every access
   point **in range**" — SDK secara eksplisit mendesain WiFi tools
   (`bettercap`/`fern`/`connectWifi`) sebagai mekanik jarak-fisik-dekat,
   bukan remote seperti `nmap`/`sqlmap`/`ssh`. GHOSTWIRE tidak masuk akal
   secara fisik dekat rumah TR4C3#404. **Fix: buang
   `createWifiNetwork`/`bettercap`(wifi-recon)/`fern`/`connectWifi`
   sepenuhnya.** Workstation jadi Router/Device internet-facing biasa
   (sama shape kayak devbox), tapi alamatnya TIDAK diberi tahu di mana pun
   yang gampang — harus digali dari bukti DI DALAM devbox yang sudah
   di-root (skrip migrasi/cron/`.ssh/config`) — pembayaran nyata buat baris
   dekoratif "devbox may be flaky this week, migrating some services" di
   home page `tr4c3404.dev`. Metasploit RDP RCE + Meterpreter download di
   ujungnya TIDAK berubah. Kesulitan "very-hard, tapi beda dari M1": bukan
   breadth/ambiguitas, tapi depth/teknik (pivot/infrastruktur-mapping dari
   host yang sudah dikuasai). Bonus: nutup gating hole yang sudah ada
   sekarang — `registerM02WorkstationWifi()` dipanggil unconditional di
   `OnObjectivesStart()`, jadi alamat workstation saat ini sebenarnya
   sudah bisa dicapai dari detik pertama misi, sebelum devbox disentuh
   sama sekali; desain baru otomatis menggantung penemuan alamat itu di
   belakang devbox ter-root.

**Belum diputuskan / dicatat sebagai ide, bukan keputusan final:**
- Bookend dialogue kedua buat GHOSTWIRE (setelah `deploy.log`'s 3 baris,
  satu lagi menjelang/pas report terkirim) — biar M2 punya busur emosi,
  bukan cuma satu lonjakan, dan nanam bibit eskalasi metode vigilante yang
  dibayar di pilihan ending A/B/C M4.
- 1-2 file flavor domestik (non-mekanik) di workstation, kontras sama
  bukti kejahatan — efek "kejahatan dilakukan orang biasa" alih-alih
  villain-lair klise.

---

**M02 REDESIGN PLAN — content drafts (2026-09-23, still NOT YET
IMPLEMENTED).** Concrete text for the 4 items above plus 2 more raised in
follow-up discussion:

1. **"Stale-Fork" is already live, unpaid.** `M02_WORKSTATION_CODENAME =
   "Stale-Fork"` is already the device's `name` in `m02-quest.ts` (git slang
   for a branch that never synced with upstream) — implies TR4C3#404 forked
   the ransomware payload rather than authoring it from scratch, consistent
   with BLACKLEDGER being a "chain of roles," not one person. Deliberately
   left as an unexplained environmental detail (likely already surfaces via
   `nmap`/network map today) — no dialogue, no confirmation, a bonus for an
   attentive player. Not planning any new plumbing for this one.
2. **`affiliates` table draft rows** — deliberately ambiguous whether
   GHOSTWIRE's case or the affiliate-model implies other operators ran the
   other two, sector codes echo M1's category system (cross-sector, not
   just healthcare):
   ```ts
   { id: 1, client: "MED-SEA-0417", ransomAmount: 2850000, settledAt: "2026-08-14" }, // GHOSTWIRE's case
   { id: 2, client: "LOG-EU-2209",  ransomAmount: 1400000, settledAt: "2026-05-02" },
   { id: 3, client: "FIN-NA-0091",  ransomAmount: 4100000, settledAt: "2026-02-19" },
   ```
3. **`M02_TIP_CONTENT` rewrite draft** (drops the "traces back to a toolkit
   developer" spoiler, nudges back to the vault instead of naming the
   connection):
   ```
   Good work on the buyer alias.

   Whatever else was sitting in that vault wasn't just backup copies. Go
   back through it -- there's a name in there that hasn't led anywhere yet.

   Send what you find the same way as before.
   ```
4. **New devbox file `sync-home.sh`** — replaces WiFi discovery, leaks
   `M02_WORKSTATION_IP` via a migration script instead, echoes deploy.log's
   "payout" wording for internal consistency. **Updated 2026-09-24**: IP
   bumped to the post-IP-fix value, plus one line planted to justify the
   Splitter's default-credential access (gap resolution, see scope
   expansion section below):
   ```bash
   #!/bin/bash
   # quick and dirty until the new archive box is up -- don't ask
   # NAS is still on the factory admin login, never got around to it
   rsync -az ./payouts/ tr4c3404@71.192.14.230:/home/tr4c3404/incoming/
   ssh tr4c3404@71.192.14.230 'echo synced >> ~/incoming/.log'
   ```
5. **Second GHOSTWIRE dialogue beat (aftermath)** — fires after
   `Meterpreter.Download`, before the report is sent. Bridges motivation
   from "avenge one case" to "the chain goes further," seeding M3/M4
   without resolving anything. Total GHOSTWIRE dialogue across M2 stays at
   2 beats (this + the existing `deploy.log` one) — deliberately kept rare:
   ```
   GHOSTWIRE: "Got everything. Didn't expect it to feel like this."
   GHOSTWIRE: "He builds it. Someone else profits off it. Somewhere
               there's someone who owns them both."
   GHOSTWIRE: "One name was never going to be enough."
   ```
6. **`M02_REPORT_BODY` — decided to leave unchanged.** "Confirmed via
   affiliate panel dump..." already implies the scale finding without
   needing a rewrite; matches M1's terse field-report tone. Expanding it
   risks breaking that register.

**Domestic texture files — draft closes the "1-2 file flavor domestik" item
above.** Two new `rootFiles` on `M02_WORKSTATION_IP`, alongside
`wire_authorization.pdf`, deliberately silent (no GHOSTWIRE dialogue tied to
either — keeps the 2-beat dialogue budget from item 5 intact, lets the
dissonance sit unexplained):

```ts
export const M02_WORKSTATION_ERRANDS_FILE_NAME = "errands";
export const M02_WORKSTATION_ERRANDS_FILE_EXTENSION = "txt";
export const M02_WORKSTATION_ERRANDS_CONTENT = [
    "- pick up dry cleaning",
    "- dog needs the vet thursday",
    "- pay internet bill (autopay keeps failing??)",
    "- ask about the fence quote",
].join("\n");

export const M02_WORKSTATION_UNSENT_FILE_NAME = "unsent";
export const M02_WORKSTATION_UNSENT_FILE_EXTENSION = "txt";
export const M02_WORKSTATION_UNSENT_CONTENT = [
    "hey sorry been slammed with work this week, can we do dinner sunday",
    "instead? tell mom I said hi",
].join("\n");
```

`errands.txt` is pure banality (unrelated chores). `unsent.txt` does the
heavier lift — a drafted text to family, using "work" to mean the
ransomware business — the compartmentalization is the disturbing part, not
sympathy. Names deliberately avoid reusing M1 backend's
`todo.txt`/`ops_notes.txt`/`readme.txt` convention so it doesn't read as
recycled.

---

**M03/M04 AUDIT FINDINGS (2026-09-23, read-only investigation, NOT YET
ACTED ON — M2 redesign plan above stays the priority).** Same audit lens
used on M02 this session (physical-proximity plausibility, dead connective
tissue, flat antagonist writing, unpaid latent details, looser-than-story
gating), run against M03 "Money Trail" and M04 "The Architect."

**M03 — confirmed working:** M2→M3 shell-company handoff is solid
(`M03_TIP_CONTENT` imports `M02_SHELL_COMPANY_NAME` as a fixed constant,
not randomized — unlike M02's `MED-SEA-0417` mistake). Router→Splitter→
Device topology correctly applied (`bugs.md` entry 5 lesson followed). The
"collateral" accomplice beat (D. Reyes) has real content in
`M03_SPREADSHEET_CONTENT`, not just a `story.md` aspiration.

**M03 — new findings:**
1. **The `bettercap` ARP-spoof step `story.md` describes has 0% code
   backing.** No `Bettercap.*` listener exists anywhere in `m03-quest.ts`
   — the `captureInternalTraffic` gate is just `Wireshark.Started` +
   `natPivotDone`, so the player never has to run `bettercap` at all.
   Looser than `scratch.md`'s existing note (which only flagged
   "not IP-filtered," not "the whole step is skippable").
2. **The accomplice's SMB credentials (`d.reyes`/`Reyes_Family2024`) have
   no discoverable lead anywhere** — no fixture/OSINT/event points to them,
   unlike pfSense's clear `lynx`→pattern→`hydra` chain.

**M04 — confirmed working:** M3→M4 parent-entity handoff is solid (fixed
constant, same pattern as M2→M3). The A/B/C ending
(expose/handoff/destroy) is fully implemented — 3 dialog branches, 3
report bodies, template + freehand validation all wired for all three.

**M04 — new findings:**
3. **The Architect (Damien Okoro) has zero characterization** — the only
   data about him in `m04.ts` is his name. No blog, no chat, no dialogue,
   no personal file (his identity file is a redacted placeholder blob).
   Thinner than TR4C3#404 was before this session's M02 fixes, despite
   being the whole story's final antagonist.
4. **The `Terminal.Cat` trap-warning mail has no "already sent" guard** —
   every other mail-alert handler in the codebase (including M04's own
   honeypot alert) uses one; this one can spam the warning mail on every
   premature `cat`.
5. **M04's Firewall rule blocks ports that are never open on the target
   device** — blocks 22/3389 to `M04_C2_IP`, but that device only declares
   port 443. Dead code by construction, not just "untested" as
   `scratch.md` currently phrases it.

**Cross-mission — most critical finding:**
6. **M3→M4's "recurring VPN IP in the finance-VLAN pcap capture" is
   entirely fictional — worse than M02's `MED-SEA-0417` bug.**
   `M04_TIP_CONTENT` claims "one address kept showing up in the finance
   VLAN capture, every single session," but M3's `Wireshark.Started` event
   never surfaces any IP/packet data to the player (empty completion
   event only) — there's nothing to have recorded that address from.
   `M04_ARCHITECT_VPN_IP` is a freestanding constant with no real data
   path from M3 at all. Unlike `MED-SEA-0417` (which was at least real
   data before being randomized away), this evidence never existed
   mechanically in the first place. The final mission's opening lead
   rests on evidence the player could never actually have gathered.

**Severity ranking for future focus:** CRITICAL = #6 (M3→M4 VPN link,
100% fictional), #3 (Architect has no characterization). HIGH = #1
(M3 bettercap unenforced). MEDIUM = #4, #5, #2. Already known/no change
= `PFSense.Changes` single-session assumption, `Terminal.Explorer`/
`Terminal.Ls` loose gating, M04 Dialog-vs-Mail decoupling (a deliberate
past decision, not a bug) — all previously noted above, reconfirmed still
accurate, not re-detailed here.

**No repeat of M02's WiFi/physical-proximity hole found in M03 or M04** —
every tool M03/M04 actually use (whois/geoip/nmap/dirhunter/nuclei/
metasploit/pfsense/hydra/sqlmap) stays consistent with the remote-hacker
pattern M01 established.

---

**M02 REDESIGN PLAN — IP addressing fix (discussed 2026-09-24, NOT YET
IMPLEMENTED, to be folded into item #4 above).** Audit ulang
`docs/network-plan.md`'s sendiri convention ("no shared address block,
even for nodes in the same story thread") menemukan pelanggaran nyata di
M2: `M02_DEV_IP` (`.141`) dan `M02_WORKSTATION_IP` (`.142`) numpang di
blok `203.0.113.0/24` milik `M02_ROOT_IP` (`.140`) walau masing-masing
ada di belakang router terpisah; `M02_DEV_ROUTER_IP`/
`M02_WORKSTATION_WIFI_IP` (`66.0.34.201`/`.202`) juga saling sequential.
Dicek lintas semua constant IP di `src/content/m0{1,2,3,4}*.ts` — tidak
ada tabrakan dengan nilai baru di bawah.

Fix (menyentuh 3 constant saja; `M02_ROOT_IP` dan `M02_DEV_ROUTER_IP`
tetap, karena begitu 2 baris di bawah pindah, keduanya sudah tidak
numpang siapa pun):

| Constant | Lama | Baru |
|---|---|---|
| `M02_DEV_IP` | `203.0.113.141` | `139.162.45.98` |
| `M02_WORKSTATION_WIFI_IP` → rename **`M02_WORKSTATION_ROUTER_IP`** | `66.0.34.202` | `24.187.92.14` |
| `M02_WORKSTATION_IP` | `203.0.113.142` | `71.192.14.230` |

Rename `WIFI_IP`→`ROUTER_IP` sekalian mengembalikan nama constant yang
sama persis dengan `m02.original.ts` (nama sebelum jadi WiFi AP di
redesign 2026-09-20) — bukan nama baru, balik ke penamaan lama.

File yang perlu ikut update nilainya saat item #4 dieksekusi (5 titik
referensi dicek): `src/content/m02.ts` (sumber constant), `src/main/
m02-quest.ts` (pemakai `M02_WORKSTATION_WIFI_IP`, otomatis kena saat
shape wifi→router diganti), draft `sync-home.sh` di section "content
drafts" di atas (hardcode `203.0.113.142`, perlu diganti ke
`71.192.14.230`), dan `docs/m02-playtest.md` (sudah ditandai perlu
rewrite total untuk redesign, nilai baru ikut masuk situ).

`docs/network-plan.md` **sengaja dibiarkan tidak diedit** — tetap jadi
snapshot historis keputusan 2026-09-20 (termasuk nama domain lama
`a7xcodeface.dev` yang sudah stale), sama seperti `m0X.original.ts`
sengaja dibekukan.

**Belum diputuskan (ditunda sampai eksekusi item #4):** apakah node
workstation hasil redesign tetap pakai `lanIp` (nuansa "home network"
`192.168.0.x` sesuai skema di `network-plan.md`) atau ikut shape devbox
100% tanpa `lanIp` sama sekali (devbox saat ini tidak pakai `lanIp`).

---

**M02 REDESIGN PLAN — scope expansion (discussed 2026-09-24, NOT YET
IMPLEMENTED).** User menilai M2 "sangat kurang" di dua hal sekaligus:
tujuan cerita (narrative purpose) DAN tujuan konkret pemain (apa yang
bisa dicapai di luar 2 file yang ada, `deploy.log` +
`wire_authorization.pdf`) — bukan soal jumlah `QuestObjectiveDefinition`
(itu sudah benar 1, konsisten dengan `m01.ts` yang juga sudah collapse
ke 1 objective). Ditanya mau ditambal ke arah mana, jawabannya: **semua
sekaligus** — lokasi baru, karakter baru, konten lebih dalam di 2 lokasi
yang ada, dan sambungan lebih kuat ke M1/M3/M4 (termasuk M4 secara
konsep, walau implementasi tetap 100% di file M2 untuk sekarang). Ini
MEMPERLUAS item #4 dari plan asli di atas (bukan menggantikannya) —
"Router/Device sama shape kayak devbox" berkembang jadi struktur 3 lapis
di bawah.

**A. Thread "affiliate kedua" — `Qu0taCl0ser` / "Closer-Rig" (lokasi +
karakter baru, DIPUTUSKAN 2026-09-24):**
- Anchor: `FIN-NA-0091` ($4.1M, terbesar dari 3 baris affiliate table) —
  dipilih karena operator dengan angka sebesar ini lebih masuk akal
  punya koneksi infrastruktur ke level Architect dibanding operator
  kecil (`LOG-EU-2209`, $1.4M). Efek samping: skala 3 case (1.4M →
  2.85M GHOSTWIRE → 4.1M) bikin GHOSTWIRE kelihatan bukan yang terbesar,
  nunjukkin dia cuma satu dari beberapa.
- Handle: `Qu0taCl0ser` (pola leetspeak sama seperti `TR4C3#404`/
  `X7xS3NTRY9`/`cryp7net`). Codename device: **"Closer-Rig"** (pola sama
  kayak "Stale-Fork"). Tanpa nama asli — TR4C3404 sendiri, target utama
  misi, juga gak punya nama asli.
- **Kepribadian sengaja kontras dari TR4C3404**: bukan "ordinary person
  domestik" (sudah kepake abis di `errands.txt`/`unsent.txt`), tapi
  operator yang pakai bahasa sales/corporate buat ngejalanin ransomware
  (detail otentik dari RaaS beneran di dunia nyata — istilah "quota,"
  "conversion," "closing"). Nol dialog — budget dialog tetap dikunci ke
  GHOSTWIRE doang (2 beat total, lihat plan asli item #5).
- Lokasi: host ber-IP polos (tanpa domain/website), 2 lapis (lihat
  bagian C), lead-nya digali dari devbox/workstation yang sudah ada.

**2 file di "Closer-Rig" (draft final):**

`quota_report.txt`:
```
AFFILIATE PERFORMANCE — Q3 SUMMARY
===================================

Closes this quarter: 4
Close rate: 94%
Avg time-to-lock: 11 days

Top account: FIN-NA-0091 -- closed 6 days ahead of forecast, escrow
released same week. Bonus tier unlocked, nice work team (well, me).

Reminder to self: keep response time under 24h on new leads or panel
flags you for review. Nobody wants that conversation again.
```

`routing_notes.txt`:
```
ROUTING NOTES -- DO NOT SEND IN CHAT AGAIN

Architect's cut goes out same day as settlement, not next-day like
before -- they flagged it twice already.

Confirm via the usual channel: 203.0.113.160. Don't ask questions,
just confirm and move on.
```

**Bukti M4 — pakai IP asli, bukan placeholder**: `203.0.113.160` di
`routing_notes.txt` di atas adalah `M04_ARCHITECT_VPN_IP` yang SUDAH ADA
di `m04.ts` (implemented, belum live-tested) — bukan nilai baru. Saat
implementasi, `m02.ts` sebaiknya `import { M04_ARCHITECT_VPN_IP } from
"../content/m04.js"` (pola sama seperti `M02_TIP_CONTENT` meng-import
`M01_BUYER_ALIAS`), bukan hardcode string literal — supaya kalau M4
nanti ganti alamatnya, M2 ikut konsisten otomatis. Ini nutup temuan
CRITICAL audit ("VPN IP 100% fiktif") tanpa nyentuh file M4 sama sekali.
Konsekuensi: `m02.ts` jadi punya import baru ke `m04.ts` (arah M2→M4,
aman, gak ada circular dependency). M3's Wireshark-mechanic yang masih
rusak (audit finding #1 lama) tetap jadi TODO terpisah — kalau nanti
diperbaiki, statusnya jadi konfirmasi KEDUA buat IP ini, bukan gantiin
sumber dari M2.

**B. Workstation — klimaks misi, direstrukturisasi jadi 3 lapis ("kalau
WORKSTATION itu NASA, gak mungkin sekali hack selesai" — alasan asli
user untuk perubahan ini):**
```
Router "home gateway" — 24.187.92.14 / lan 192.168.0.1
   (= M02_WORKSTATION_ROUTER_IP, lihat section IP-fix di atas)
└─ Splitter "home network" — 88.212.67.19 / lan 192.168.0.2
   rootFiles: `affiliate_endpoints.txt` (backup config lama, lead
   menuju Closer-Rig — isi persis di bagian A. Domestic texture item #6
   plan asli TETAP di Device, bukan pindah ke sini — lebih cocok di PC
   pribadi daripada di infra home-network bersama.)
    ├─ Firewall — 156.38.94.201 / lan 192.168.0.3
    │    gate RDP milik Device di bawah; breach via kredensial yang
    │    ditemukan di tempat lain di misi (mekanisme manual/event-
    │    driven persis seperti M1's `removeFirewallRule`+`openPort` di
    │    `m01-quest.ts:804-807` — TERBUKTI JALAN, dan tidak bergantung
    │    pada adjacency di tree, jadi aman dipakai walau Firewall bukan
    │    sibling langsung dari Router)
    ├─ Device "Stale-Fork" — 71.192.14.230 / lan 192.168.0.4
    │    (= M02_WORKSTATION_IP) — `wire_authorization.pdf` +
    │    `errands.txt` + `unsent.txt` (domestic texture), RDP nonaktif
    │    sampai Firewall breached
    └─ Printer — 41.203.118.6 / lan 192.168.0.5 — flavor/mini-puzzle
         opsional, NON-jalur-utama. Meniru mekanisme asli Quest 15 base
         game ("Printer Troubleshooter"): port 9100 tertutup sampai
         di-forward dari Router. Dikonfirmasi dari `missions_en.json` —
         Printer di base game memang bukan target hacking (tidak ada
         credential/vulnerability), cuma objek latihan port-forwarding.
```
Landasan teknis yang sudah diverifikasi buat shape ini (dicek langsung
ke `index.d.ts` dan kode M1, bukan asumsi):
- `Splitter` boleh punya `children` sendiri (union type di
  `ChildSubnetDefinition` sama persis dengan `Router`) — `Router→
  Splitter→Device` bukan cuma trik M03, valid di level tipe.
- `ports`/`rootFiles` ada di base fields SEMUA tipe node, termasuk
  Splitter — jadi Splitter boleh punya konten sendiri, bukan cuma pipa.
- **Router-di-dalam-Router / Router-di-dalam-Splitter**: valid secara
  tipe (union `ChildSubnetDefinition` juga mencakup `Router`), TAPI
  dokumentasi resmi SDK (`index.d.ts:2628-2629`) eksplisit menulis
  hierarki sebagai "Router → Firewall/Device/Splitter/Printer" — Router
  selalu digambarkan sebagai root, tidak pernah child. Nol preseden di
  M1-M4 untuk nested Router. **Diputuskan TIDAK dipakai** untuk jalur
  utama; kalau mau nuansa "double-NAT" realistis, itu eksperimen
  terpisah yang butuh live-test dulu, bukan bagian dari plan ini.

**KOREKSI (2026-09-24, sesi live-test berikutnya) — poin kedua di atas
TERBUKTI SALAH secara runtime, walau benar secara tipe.** `ports`/
`rootFiles` memang ada di base type semua node (dicek juga langsung ke
`.reverse/extracted/index.js`, fungsi normalisasi `createSubnetNetwork`
menyimpan `ports`/`rootFiles`/`isIpHidden` di objek dasar SEMUA tipe
tanpa terkecuali) — tapi dua mekanisme lain diam-diam TIDAK
menghormati field itu kalau ditaruh di node bertipe `Splitter`: (1)
fungsi agregasi port yang dibaca `nmap` hanya rekursi ke `children`
milik Splitter, tidak pernah menulis port milik Splitter sendiri ke
hasil agregasinya — jadi `nmap` ke IP Splitter itu sendiri SELALU
"no ports found", berapa pun port yang dideklarasikan; (2) command
`ssh` hard-throw kalau target `.type !== "DEVICE"`, jadi login SSH ke
Splitter mustahil terlepas dari kredensial. Splitter yang sempat
dibangun dengan SSH+`admin`/`admin`+`affiliate_endpoints.txt` langsung
di node-nya sendiri (node 6 di tabel bawah) terbukti gak bisa diakses
sama sekali saat live-test. **Redesign final**: Splitter dikembalikan
jadi pipa kosong (`users: []`, tanpa `ports`/`rootFiles`) — pola yang
sebenarnya sudah dipakai M03/M04 dari awal — dan konten SSH-nya pindah
ke Device baru bernama "Rust-Bucket" sebagai sibling dari Firewall/
Workstation/Printer, plus 4 Device pengecoh (Glass-Eye, Night-Owl,
Ghost-Relay, Dead-Pixel) supaya `nmap` ke Splitter nunjukkin home
network yang ramai, bukan cuma "1 device asli + 3 device lama". Detail
lengkap ada di entri paling bawah file ini.

**C. Lokasi affiliate kedua** — tetap ringan, 2 lapis, TANPA Firewall
gate tambahan (begitu IP-nya ketemu dari `affiliate_endpoints.txt`,
langsung bisa di-nmap/exploit — sesuai statusnya sebagai thread
sekunder/bonus, bukan klimaks):
```
Router "Closer-Rig gateway" — 109.94.27.183
└─ Device "Closer-Rig" — 62.171.45.90
     rootFiles: quota_report.txt, routing_notes.txt (isi di bagian A)
```
Vulnerability/kredensial akses persis ke Closer-Rig belum dipilih (pola
sederhana mengikuti devbox/workstation yang sudah ada — SQLi atau
RCE+kredensial lemah — diputuskan saat implementasi, bukan blocking
buat plan ini).

**Semua 5 poin terbuka sesi ini SELESAI diputuskan:**
1. Affiliate mana jadi karakter → `FIN-NA-0091` / `Qu0taCl0ser` /
   "Closer-Rig" (detail di bagian A).
2. Bentuk & lokasi bukti M4 → `routing_notes.txt`, IP asli
   `M04_ARCHITECT_VPN_IP` via import (bagian A).
3. Isi `rootFiles` Splitter → `affiliate_endpoints.txt` saja (domestic
   texture tetap di Device, bagian B).
4. Alamat IP baru → tabel lengkap di bagian B (Splitter/Firewall/
   Printer) dan bagian C (Router+Device Closer-Rig), dicek tidak
   tabrakan dengan M1-M4 manapun.
5. Skema `lanIp` workstation → dipakai, `192.168.0.1-5` sequential
   (bagian B).

**Belum diputuskan (di luar scope sesi ini, boleh nunggu implementasi):**
vulnerability/kredensial akses Closer-Rig (C, lihat di atas).

---

**M02 REDESIGN PLAN — tabel mekanik lengkap (disusun 2026-09-24, snapshot
dikunci supaya gak berubah-ubah selama gap di bawah masih didiskusikan.
NOT YET IMPLEMENTED).** Gabungan plan asli + IP-fix + scope expansion di
atas, disusun sebagai satu jalur pemain end-to-end.

**Jalur utama (wajib buat selesai misi):**

| # | Node | Alamat (lan) | Mekanisme akses | Sumber kredensial/lead | Isi | Lanjut ke |
|---|---|---|---|---|---|---|
| 1 | Root domain `tr4c3404.dev` | `203.0.113.140` | `whois` + `nmap` (443 open, 80 closed) — situs biasa | Tip mail (rewritten) → LedgerVault M1 `associate_infra.txt` | — | `subfinder` reveal **40 subdomain acak** (lihat section subdomain di bawah) |
| 1b | Nuclei scan | — | `nuclei` terhadap 40 hasil subfinder | node 1 | `Nuclei.Results.hosts` = 3 IP (37 sisanya gak pernah muncul, gak ada subnet) | 3 kandidat: node 2, 2a, 2b |
| 2 | Dev subdomain `f3a91b7c04d8.tr4c3404.dev` (asli) | `139.162.45.98` | `nmap` (ssh22/https443-EOL/mysql3306), `SQL_INJECTION` | node 1b | — | `sqlmap` dump `admins` |
| 2a | Decoy `9c71ff0362bb.tr4c3404.dev` | Router `85.203.44.12` → Device `62.44.187.9` | `nmap`+`sqlmap`, `SQL_INJECTION` (sama kayak node 2) | node 1b | `README.txt` ("old staging box... nothing here anymore") — dead end, dump kosong/gak relevan | — (dead end) |
| 2b | Decoy `40e9a8d1c256.tr4c3404.dev` | Router `78.140.22.63` → Device `196.51.88.41` | `nmap`+`sqlmap`, `SQL_INJECTION` (sama kayak node 2) | node 1b | `notes.txt` ("client demo, contract fell through, never took it down") — dead end | — (dead end) |
| 3 | Devbox DB `admins` | (di node 2) | `sqlmap` dump table | vuln SQLi node 2 | hash admin | `john` crack |
| 4 | Devbox SSH | (di node 2) | `ssh root@` | password hasil `john` | `deploy.log` (GHOSTWIRE beat #1, case-code fixed), `sync-home.sh` (baru), DB `affiliates` (3 baris) | leak alamat workstation |
| 5 | Router home gateway | `24.187.92.14` / lan `.1` | entry point, di-nmap dari alamat yang di-leak `sync-home.sh` | `sync-home.sh` di node 4 | — | anak-anaknya (6, 6a-6e, 7-9) |
| 6 | Splitter "home network" | `88.212.67.19` / lan `.2` | **REDESIGN 2026-09-24**: pipa kosong (`users: []`, tanpa `ports`/`rootFiles`) — SSH ke Splitter itu sendiri TERBUKTI mustahil (lihat koreksi teknis di atas), jadi node ini murni titik cabang ke 6a-6e/7-9, bukan target | — | — | node 6a-6e, 7, 9 (Firewall/Workstation di-nmap terpisah lewat `net_tree.py`, lihat node 7) |
| 6a | Device "Rust-Bucket" (NAS asli) | LAN `.6` | SSH terbuka, kredensial default/factory (`admin`/`admin`) — NAS rumahan gak pernah diganti dari setting pabrik | `sync-home.sh` node 4 (baris soal NAS factory login) | `affiliate_endpoints.txt` (lead Closer-Rig) | node 11 (opsional) |
| 6b | Device "Glass-Eye" (Smart TV, pengecoh) | LAN `.7` | port 8008/http terbuka, tanpa akun — buka tapi gak ada apa-apa | — | — | — (dead end) |
| 6c | Device "Night-Owl" (kamera CCTV, pengecoh) | LAN `.8` | port 554/rtsp terbuka, tanpa akun — kelihatan menggoda (kamera = target klasik) tapi gak ada login yang bisa dipakai | — | — | — (dead end) |
| 6d | Device "Ghost-Relay" (WiFi extender lama, pengecoh) | LAN `.5` | port 23/telnet terbuka, tanpa akun — paling menggoda (telnet = "keliatan lemah") justru buntu | — | — | — (dead end) |
| 6e | Device "Dead-Pixel" (konsol game, pengecoh) | LAN `.10` | tanpa port terbuka sama sekali — sinyal jelas "bukan di sini" | — | — | — (dead end) |
| 7 | Firewall (gate RDP) | `156.38.94.201` / lan `.3` | **`PFSense.Login` + `PFSense.Changes`** (tool native, mekanisme sama persis kayak M1's Firewall dan M3's pfSense box — dikoreksi 2026-09-24, awalnya salah disebut "SSH generik") | alamat: otomatis ke-reveal lewat `net_tree.py` di node manapun dalam subnet yang sama (confirmed live-test, gak perlu kode tambahan) — BUKAN dari panel Splitter/NAS manapun, koreksi dari draft awal yang gak pernah benar-benar diimplementasi. Kredensial: **reuse `M02_ADMIN_PASSWORD`** (password sama persis devbox, node 4 — payoff karakterisasi "sloppy operator," bukan kredensial baru). **REDESIGN 2026-09-24**: rule awal gak lagi bawa field `destination` pre-filled — panel gak lagi ngasih tau LAN IP workstation secara gratis, player harus tau/nulis sendiri kalau mau bikin rule baru (mekanisme unlock sendiri tetap "PFSense.Changes apa pun setelah login" — gak berubah). | — | buka port RDP node 8 |
| 8 | Device workstation "Stale-Fork" | `71.192.14.230` / lan `.9` | RDP 3389 (FreeRDP 1.0.0 RCE), aktif setelah node 7 breached | Metasploit + kredensial node 7 | `wire_authorization.pdf`, `errands.txt`, `unsent.txt` | GHOSTWIRE beat #2 (aftermath, setelah `Meterpreter.Download`) |
| 9 | Printer | `41.203.118.6` / lan `.4` | port 9100 di-forward dari node 5 (niru Quest 15 base game) | — | flavor doang | — (non-jalur-utama) |
| 10 | Report | dead drop | `Mail.Sent` | isi dari node 4/8 | — | selesai misi |

**Thread bonus/sekunder (opsional, gak wajib buat selesai misi):**

| # | Node | Alamat | Mekanisme akses | Isi |
|---|---|---|---|---|
| 11 | Router "Closer-Rig gateway" | `109.94.27.183` | entry, dari `affiliate_endpoints.txt` (node 6a) | — |
| 12 | Device "Closer-Rig" (`Qu0taCl0ser`) | `62.171.45.90` | service usang, RCE langsung via Metasploit (pola sama RDP workstation node 8), TANPA kredensial terpisah | IP dari `affiliate_endpoints.txt` (node 6a) | `quota_report.txt`, `routing_notes.txt` (seed `M04_ARCHITECT_VPN_IP`) |

**3 gap dari draft tabel — SELESAI diputuskan 2026-09-24:**
1. **Splitter (node 6) akses** → SSH terbuka, kredensial default/
   factory (`admin`/`admin`), dijustifikasi 1 baris baru di
   `sync-home.sh` ("NAS still on the factory admin login"). **SUPERSEDED
   2026-09-24**: SSH langsung ke node Splitter TERBUKTI mustahil secara
   engine (lihat koreksi teknis di bagian atas file). Kredensial+file
   yang sama pindah ke Device baru "Rust-Bucket" (node 6a), sibling dari
   Splitter, ditemani 4 Device pengecoh (6b-6e). Alamat Firewall (node
   7) TIDAK pernah direveal lewat panel Splitter/NAS manapun (klaim
   draft ini gak pernah benar-benar diimplementasi) — ke-reveal otomatis
   lewat `net_tree.py` di subnet yang sama, confirmed live-test.
2. **Firewall (node 7) kredensial** → **reuse `M02_ADMIN_PASSWORD`**
   (password devbox yang sama, sudah di-crack pemain lebih awal) — nol
   kredensial baru, sekaligus payoff karakterisasi "sloppy operator."
   **Koreksi 2026-09-24**: mekanismenya `PFSense.Login`+`PFSense.Changes`
   (tool native, sama kayak M1/M3), bukan SSH generik seperti sempat
   disebut sebelumnya — lihat tabel di atas dan referensi
   `docs/basegame-reference/tjs-the-journalists-sister.md` Part 11
   (router/firewall diakses lewat panel login, bukan SSH biasa).
3. **Closer-Rig (node 12) akses** → service usang, exploitable langsung
   via Metasploit begitu IP diketahui, tanpa kredensial terpisah — tetap
   proporsional sebagai thread bonus/ringan.

---

**M02 REDESIGN PLAN — komponen pendukung, audit + draft fix (2026-09-24,
NOT YET IMPLEMENTED).** Review menyeluruh ke email/report/dialog/website
yang gak kebahas di tabel mekanik. Yang SUDAH konsisten, gak diubah: tip
mail rewrite (item #2), report mail/template (item #6, sengaja
unchanged, sengaja TIDAK mencakup temuan Closer-Rig karena itu bonus/
opsional), GHOSTWIRE beat #2 aftermath (draft lama ternyata sudah
nyambung sendiri ke scope expansion hari ini — "someone else profits
off it... someone who owns them both" sudah menyinggung struktur
affiliate+Architect tanpa perlu diubah), dan baris "devbox may be flaky
this week, migrating some services" di website (payoff nyata buat
`sync-home.sh`).

**3 hal yang perlu di-update, draft fix:**

1. **GHOSTWIRE beat #1 dialogue** (`M02_DEPLOY_LOG_DIALOG` di
   `content/m02.ts`) — baris pertama masih hardcode case-code lama,
   harus ikut fix item #1 (bukan cuma `M02_DEPLOY_LOG_CONTENT`):
   ```
   -   text: "MED-SEA-0417. August 14th, 2026.",
   +   text: "CASE-A7X-0417. August 14th, 2026.",
   ```
   (baris ke-2 dan ke-3 dialog tidak menyebut case-code, tidak berubah)
   Sekalian ketemu **tempat ketiga** yang butuh swap sama (belum
   pernah disebut eksplisit): baris pertama draft `affiliates` table di
   atas (`{ id: 1, client: "MED-SEA-0417", ... }`, kasus GHOSTWIRE
   sendiri) juga harus jadi `client: "CASE-A7X-0417"` — item #1 kena di
   3 tempat total: `M02_DEPLOY_LOG_CONTENT`, dialog GHOSTWIRE, DAN baris
   pertama affiliate table (bukan cuma 2 tempat yang disebut sebelumnya).

2. **`M02_OBJECTIVES[0].description`** — ganti frasa Wi-Fi jadi
   menyebut mekanik baru, tetap di level milestone (gak nyebut nama
   tool spesifik, konsisten sama aturan `network-plan.md`):
   ```
   - "...get onto the developer's home workstation through its own
   -  Wi-Fi, and pull the financial document..."
   + "...dig up a lead to the developer's home network, and pull the
   +  financial document..."
   ```

3. **`src/websites/m02/tr4c3404/home.html`** — rebrand dari nama lama:
   ```html
   - <title>A7xCodeFace — dev notes</title>
   + <title>TR4C3404 — dev notes</title>
   ...
   - <h1>A7xCodeFace</h1>
   + <h1>TR4C3404</h1>
   ```
   Tagline ("toolkit dev. builds things that aren't supposed to
   exist.") dan 2 entry blog (`payload_v9 shipped`, `uptime notice`)
   tetap, sudah akurat.

**Observasi, bukan gap (opsional buat dipertimbangkan lain waktu):** M2
tidak punya presence Twotter/OSINT sama sekali, beda dari M1 yang kaya
jejak sosial media — bukan sesuatu yang harus ditambah, cuma dicatat.

---

**M02 REDESIGN PLAN — 40 subdomain `tr4c3404.dev` + `nuclei` (disusun
2026-09-24, NOT YET IMPLEMENTED, revisi final setelah 3 iterasi diskusi
di sesi yang sama).** Terinspirasi dari base game `docs/basegame-
reference/tjs-the-journalists-sister.md` Part 6 (`bcc.com` — Subfinder→
Nuclei→Pip→Sqlmap→John) dan sudah dikonfirmasi `nuclei` proven-working
di codebase sendiri (`m04-quest.ts:301-307`, `Nuclei.Results.hosts`).
Tujuan: nambah kedalaman MEKANIK murni (bukan breadth naratif ala M1 —
lihat prinsip M2 "connective density, bukan decoy breadth" di section
scope expansion) dengan biaya konten minimal.

**Struktur 40 subdomain, 3 tingkatan, SEMUA nama acak 12-karakter
(alfanumerik lowercase, valid DNS label — revisi final: awalnya
dipertimbangkan nama readable/`staging`/`demo` biar "berbeda" dari noise,
TAPI DITOLAK — user eksplisit minta nol pola nama yang bisa jadi
petunjuk gratis, semua 40 harus sama-sama acak):**

1. **1 asli** — `M02_DEV_SUBDOMAIN` berubah dari `"devbox.tr4c3404.dev"`
   → **`"f3a91b7c04d8.tr4c3404.dev"`**. Tetap `139.162.45.98`, tetap
   `createSubnetNetwork`+`setVulnerabilities(SQL_INJECTION)`, tetap
   seluruh chain yang sudah ada (deploy.log, sync-home.sh, admin
   hash+john, ssh) — nol perubahan selain STRING nama subdomain.
2. **2 palsu-berisi (bukan cuma noise, ada network tree + 1 file
   masing-masing, biar investigasi kerasa nyata bukan cuma formalitas
   nuclei):**
   - `"9c71ff0362bb.tr4c3404.dev"` → Router `85.203.44.12` → Device
     `62.44.187.9`, `SQL_INJECTION` (sama kayak yang asli — sengaja,
     biar `nuclei` gak bisa membedakan, harus dicoba manual), rootFile
     `README.txt`: "old staging box, meant to tear this down months
     ago. nothing here anymore."
   - `"40e9a8d1c256.tr4c3404.dev"` → Router `78.140.22.63` → Device
     `196.51.88.41`, `SQL_INJECTION` sama, rootFile `notes.txt`:
     "client demo, contract fell through, never took it down." (payoff
     karakterisasi "banyak proyek/klien numpang lewat," nyambung ke
     `affiliates` table yang juga nunjukkin banyak case).
   - Device di kedua node ini SENGAJA tanpa field `name`/codename —
     konsisten konvensi `network-plan.md` ("codename cuma buat device
     TANPA domain publik sendiri"), sama kayak devbox asli yang juga
     cuma punya `domain`, bukan `name`.
3. **37 kosong** — nama acak 12-karakter juga, cuma
   `Network.registerDomain(name, ip)`, TANPA `createSubnetNetwork` DAN
   TANPA parameter `vulnerabilities` (kalau diisi, jawabannya bocor
   langsung dari `Subfinder.Results` tanpa perlu `nuclei` sama sekali —
   lihat catatan `SubfinderResultsEvent.subdomains[].vulnerabilities`
   di `index.d.ts:1197`). Pola persis `needsSubnet` M1
   (`m01-quest.ts:606-621`) — `registerDomain` selalu jalan, `create
   SubnetNetwork` cuma buat yang beneran. Nol konten per subdomain,
   murni noise. 37 nilai konkretnya digenerate saat implementasi, gak
   perlu ditulis manual di rencana ini.

**Alur gating:** `subfinder tr4c3404.dev` → 40 hasil. `nuclei` (install
+run terhadap daftar itu) → `Nuclei.Results.hosts` cuma isi **3 IP**
(devbox asli + 2 decoy) — 37 yang gak punya subnet gak pernah muncul di
situ sama sekali, gak ada yang bisa discan. Dari 3 kandidat, pemain
`sqlmap` manual ke semuanya — 2 dead-end cepat (dump kosong/gak
relevan + 1 file catatan), 1 (devbox) lanjut ke `john`+`ssh`+
`deploy.log`+`sync-home.sh` seperti biasa. Referensi tabel mekanik:
node 1 (subfinder) → node 1b (nuclei, 3 kandidat) → node 2 (asli,
lanjut) / node 2a, 2b (decoy, dead end).

---

**M02 REDESIGN PLAN — urutan implementasi resmi (disusun 2026-09-24,
EKSEKUSI dimulai sesi ini).** Dikelompokkan per risiko dan dependency
(Closer-Rig butuh Splitter dari tahap 2, jadi bukan cuma "gampang
dulu"). Checkpoint live-test WAJIB di antara tahap 2→3 dan 3→4 — Claude
tidak live-test sendiri (`docs/implementation-rules.md`), jadi tahap
3 dan seterusnya menunggu konfirmasi hasil live-test tahap sebelumnya.

**Tahap 1 (low-risk, independen):** IP-fix; case-code fix 3 titik
(`M02_DEPLOY_LOG_CONTENT`, dialog GHOSTWIRE #1, baris pertama affiliate
table, import `M01_CASE_ID`); tip mail rewrite; affiliate table +2
baris; domestic texture (`errands.txt`/`unsent.txt`); fix
`M02_OBJECTIVES[0].description`; rebrand `home.html`; GHOSTWIRE dialog
#2 + wiring `Meterpreter.Download`.

**Tahap 2 (RISIKO TINGGI #1 — restrukturisasi workstation 3 lapis):**
copot `createWifiNetwork`; bangun `Router→Splitter→{Firewall,Device,
Printer}`; Splitter SSH+cred default+`affiliate_endpoints.txt`;
Firewall `PFSense.Login`+`.Changes` reuse `M02_ADMIN_PASSWORD`; Printer
port-forward flavor; update `sync-home.sh`; update `teardown()`.

→ **CHECKPOINT LIVE-TEST 1** (tahap 1+2 digabung satu round build-
install, biar gak kebanyakan round-trip).

**Tahap 3 (RISIKO TINGGI #2 — 40 subdomain + nuclei, terpisah sengaja):**
rename devbox jadi nama acak; 37 domain kosong + 2 tree decoy; verifikasi
`subfinder`/`nuclei` berperilaku sesuai rencana.

→ **CHECKPOINT LIVE-TEST 2** (terpisah dari tahap 2 biar sumber masalah
kalau ada jelas kelihatan).

**Tahap 4 (low-risk, depends on tahap 2's Splitter):** constant+network
Closer-Rig, 2 file, import `M04_ARCHITECT_VPN_IP`; putuskan+kode vuln/
akses Closer-Rig; teardown.

**Tahap 5 (penutup):** `npx tsc -p tsconfig.json --noEmit` bersih;
rewrite `docs/m02-playtest.md` total.

**Status progres** (diupdate tiap tahap selesai): Tahap 1 — ✅ selesai,
`tsc --noEmit` bersih, **live-test confirmed penuh** (recon → sqlmap →
john → ssh → deploy.log GHOSTWIRE #1). Tahap 2 — ✅ selesai, `tsc --noEmit`
bersih, **live-test confirmed penuh sampai akhir** (LAN di-renumber ke
`192.168.1.x` biar `destination` field firewall rule valid — lihat
`IsLocalIp` hardcode di `.reverse/extracted/index.js`; firewall breach;
Metasploit RDP/bluekeep; Meterpreter; download 3 rootFile; aftermath
GHOSTWIRE #2). **Bug ditemukan+fixed**: `Meterpreter.Download` event tidak
reliable (callback command `download` basi setelah popup FileTransfer
selesai beberapa detik kemudian) — trigger aftermath dipindah ke
`Files.Transfer` (filter by nama file, bukan host IP), terbukti reliable
via 2 kali live-test. `destroyNetwork()` di `OnObjectivesStart` (dev router
+ workstation router) di-nonaktifkan permanen (di-comment, bukan dihapus)
atas permintaan user — skema IP sudah stabil, gak perlu destroy-rebuild
tiap reload lagi; `OnAbandon`'s teardown destroy TETAP jalan (tujuannya
beda). Tahap 3 — ✅ diimplementasi (40 subdomain: 1 asli + 2 decoy berisi +
37 kosong acak, `nuclei` gating), **live-test confirmed** (stabil 40 hasil
lintas `mods.reset`, urutan acak tiap load, `sqlmap -tables` dead-end di
kedua decoy berisi). Tahap 4 — ✅ diimplementasi (Closer-Rig: Router
`109.94.27.183` → Device `62.171.45.90`, vuln diputuskan = RCE Metasploit
reuse pola workstation tanpa kredensial terpisah, `routing_notes.txt`
import `M04_ARCHITECT_VPN_IP` asli), **live-test confirmed (2026-09-24,
sesi lanjutan)** — user konfirmasi langsung "aman" setelah nyoba di
live-game. Tahap 5 — ✅ selesai, `tsc --noEmit` bersih, `docs/m02-playtest.md`
di-rewrite total mengikuti alur baru. **Report/mail ke dead drop (node 8)
dan seluruh thread Closer-Rig (node 11-12) — live-test confirmed
(2026-09-24, sesi lanjutan), sama-sama dikonfirmasi user aman.**
**Bug live-test ditemukan+fixed**: `sqlmap` gagal connect ke devbox
setelah IP-fix — `M02_DEV_ROUTER_IP` gak berubah tapi child-nya
(`M02_DEV_IP`) berubah, dan `createSubnetNetwork` "left alone" kalau
alamat router sudah ada network dari build lama (`index.d.ts:2656`).
Fix: `if (isDev) Network.destroyNetwork(M02_DEV_ROUTER_IP)` sebelum
`createSubnetNetwork`, persis pola M1 (`m01-quest.ts:369-375`) — bukan
destroy tanpa syarat. `tsc --noEmit` bersih.

**Update**: fix di atas TIDAK cukup — `Network.destroyNetwork()` itu
`Promise<boolean>`, dipanggil tanpa `await`, jadi `createSubnetNetwork`
kemungkinan jalan sebelum destroy-nya selesai (race). Fix final:
`setupDevSubnet` di-extract jadi closure, dipanggil via
`Network.destroyNetwork(M02_DEV_ROUTER_IP).then(setupDevSubnet)` saat
`isDev`. `registerM02WorkstationNetwork` juga diubah return
`Promise<void>`, destroy-nya di-chain pakai `.then()` juga (permanen,
bukan cuma migrasi sekali — beda dari fix dev-router yang sifatnya
sementara). Firewall resume-check dipindah ke dalam
`.then()` callback-nya biar urutannya benar. `tsc --noEmit` bersih.
**Update 2**: `.then()` ternyata REGRESI, bukan fix — setelah diterapkan,
`subfinder` yang tadinya berhasil nemu subdomain jadi NOL hasil sama
sekali (domain registration di dalam `setupDevSubnet`/`.then()` gak
pernah jalan). `net_tree.py 139.162.45.98` juga confirm "Subnet not
found". Teori race-condition ditinggalkan (gak terbukti, malah bikin
lebih rusak). **Di-revert total** ke pola sinkron biasa (fire-and-forget
`destroyNetwork`, tanpa `.then()`) — persis pola M1 asli, buat DUA
fungsi (dev-subnet via closure `setupDevSubnet`, dan
`registerM02WorkstationNetwork` balik jadi `void`). `tsc --noEmit`
bersih. **Root cause asli KETEMU (dicek langsung ke `.reverse/extracted/index.js`,
bukan tebakan)**: `sqlmap`'s `ListTables` di game resolve target lewat
`Et.GetSubnetByDomain(n)` — **`n` HARUS nama domain, bukan IP**. Semua
kegagalan sebelumnya itu murni salah cara pakai (`-u 139.162.45.98`
harusnya `-u f3a91b7c04d8.tr4c3404.dev`) — BUKAN bug di kode kita, dan
BUKAN race condition. Seluruh usaha `.then()`/`isDev`-destroy di atas
ternyata gak relevan sama root cause aslinya (walau `isDev`-destroy tetap
dipertahankan karena gak salah, cuma gak menyelesaikan masalah ini).
**Berlaku buat semua mission dengan SQL_INJECTION** — sqlmap SELALU
butuh target berupa domain, catat ini kalau ada mission lain yang
pakai sqlmap. Dugaan bug ke-2 (mysql port harus di router bukan device)
**TERNYATA TIDAK PERLU** — live-test sukses tanpa fix itu diterapkan,
jadi asumsi soal `s.ports`/`GetSubnetRouter` di atas gak akurat, tidak
jadi diterapkan.

Live-test devbox chain (whois→nmap→subfinder→sqlmap) **CONFIRMED WORKING**
end-to-end termasuk affiliate table 3-baris.

**2 temuan tambahan dari live-test (dicek ke `.reverse/extracted/index.js`
langsung):**
1. `cat` di game HANYA support ekstensi `.txt`/`.log` (switch-case cuma 2
   itu, gak ada default handler) — `.sh` selalu gagal "Unable to read
   file." **FIXED**: `M02_SYNC_SCRIPT_FILE_EXTENSION` diubah `"sh"` →
   `"txt"` (`sync-home.txt`, isi sama). `tsc --noEmit` bersih.
2. `pfsense` itu WEBSITE (dibrowse via Firebear), bukan command
   terminal — native fitur game buat node Router/Firewall, M03 juga gak
   daftarin website khusus buat ini. Alamat Firewall (`156.38.94.201`)
   ternyata udah otomatis ke-reveal lewat `net_tree.py` di node manapun
   dalam subnet yang sama (confirmed oleh user buat `71.192.14.230`) —
   gak perlu tambahan kode buat reveal-nya.
3. Firewall PFSense page gak kebuka di browser — dicek ke routing logic
   browser di game: buka halaman Firewall/Router HARDCODED butuh port
   `internal===80` (http), bukan 443/https. **FIXED**: port Firewall
   M2 diganti dari `443/https` → `80/http`, persis M1
   (`m01-quest.ts:395`). `tsc --noEmit` bersih.
4. Password admin diganti dari `buildfast_2024!` → `Zx8kTq21mR` (hash
   MD5 baru `2f660d2a2ebe2a2d21f92d9a2ac95ac0`, diverifikasi cocok) —
   permintaan user, bukan bug fix.
5. Port 80 fix BERHASIL — halaman PFSense kebuka. Tapi form aturan
   firewall reject `destination` (baik IP publik maupun `192.168.0.4`),
   minta `192.168.1.x`. **Root cause asli**: `M02_WORKSTATION_ROUTER_IP`
   gak pernah dikasih `lanIp` eksplisit (constant-nya udah didefine tapi
   lupa dipasang) — kemungkinan default engine ke `192.168.1.1`,
   mismatch sama anak-anaknya yang `192.168.0.x`. **FIXED**: `lanIp:
   M02_WORKSTATION_ROUTER_LAN_IP` dipasang di router, `destination` rule
   tetap `M02_WORKSTATION_LAN_IP`. `tsc --noEmit` bersih.
Satu deviasi kecil dari rencana, dicatat transparan: Printer (`M02_PRINTER_IP`)
diimplementasi sebagai flavor permanen-tertutup (port 9100 `active: false`,
TANPA event unlock) — gak ketemu mekanisme SDK generik buat "buka port
lewat panel admin router" yang dikonfirmasi ada (beda dari `PFSense.Login`
yang memang confirmed buat Firewall), jadi daripada bikin mekanik yang gak
terverifikasi, port-nya sengaja dibiarkan tertutup selamanya sebagai detail
lingkungan kecil, bukan puzzle yang bisa diselesaikan. Bisa direvisit kalau
mau dirancang ulang.

---

**Splitter architecture bug + redesign (2026-09-24, sesi lanjutan).**
Live-test coba `ssh -h admin@88.212.67.19` (node Splitter, yang waktu itu
masih bawa `users`/`ports`/`rootFiles` sendiri) — gagal total. Dicek
langsung ke `.reverse/extracted/index.js`, dua masalah independen dan
sama-sama fatal:
1. `nmap` ke IP Splitter selalu "No ports found" — fungsi agregasi port
   punya cabang khusus buat tipe `SPLITTER` yang cuma rekursi ke
   `children`-nya, gak pernah nulis port milik Splitter sendiri ke hasil
   agregasi (beda dari `ROUTER` yang port miliknya sendiri ikut
   ditambahkan).
2. `ssh` hard-throw "Connection to the remote server could not be
   established" kalau target `.type !== "DEVICE"` — SSH ke Splitter
   mustahil, terlepas dari kredensial/port/firewall.
Kesimpulan: `ports`/`rootFiles`/kredensial di base type SEMUA node
(termasuk Splitter) itu valid secara TypeScript tapi gak fungsional di
runtime untuk tipe Splitter — asumsi lama di bagian atas file ini
("Splitter boleh punya konten sendiri") SALAH, sudah dikoreksi di
tempatnya.

**Redesign yang diterapkan** (disetujui user via kata eksekusi,
diimplementasi ke `src/content/m02.ts` + `src/main/m02-quest.ts`,
`tsc --noEmit` bersih tiap tahap):
- Splitter (`88.212.67.19`) balik jadi pipa kosong (`users: []`, tanpa
  `ports`/`rootFiles`) — pola yang sebenarnya sudah dipakai M03/M04 dari
  awal, cuma M02 yang menyimpang.
- SSH+`admin`/`admin`+`affiliate_endpoints.txt` pindah ke Device baru
  "Rust-Bucket" (NAS asli), sibling dari Firewall/Workstation/Printer di
  bawah Splitter yang sama.
- User minta ditambah pengecoh biar gak "1 device asli doang di antara 3
  yang lama" — ditambah 4 Device pengecoh, masing-masing dikasih nama
  gaya codename yang sama kayak node lain di project ini (`Stale-Fork`,
  `Closer-Rig`, dst): **Glass-Eye** (smart TV, port 8008/http, buka tapi
  gak ada apa-apa), **Night-Owl** (kamera CCTV, port 554/rtsp, kelihatan
  menggoda tapi gak ada login yang bisa dipakai), **Ghost-Relay** (WiFi
  extender lama, port 23/telnet, paling menggoda karena telnet identik
  "lemah" tapi tetap buntu), **Dead-Pixel** (konsol game, nol port
  terbuka sama sekali — sinyal "bukan di sini").
- User lanjut minta reshuffle LAN IP biar urutan nomor gak nebak alur
  (pola yang sama kayak alasan subfinder 40-hasil di-Fisher-Yates-shuffle
  di Tahap 3): Printer `.5→.4`, Workstation "Stale-Fork" `.4→.9`,
  Ghost-Relay ngisi slot `.5` yang kosong dari Printer. Skema LAN final:
  `.1` Router, `.2` Splitter, `.3` Firewall, `.4` Printer, `.5`
  Ghost-Relay, `.6` Rust-Bucket, `.7` Glass-Eye, `.8` Night-Owl, `.9`
  Workstation, `.10` Dead-Pixel — nol gap, nol bentrok.
- User juga minta field `destination` dihapus dari rule awal Firewall
  (`m02-quest.ts:397`, sebelumnya `destination: M02_WORKSTATION_LAN_IP`)
  — dicek dulu ke handler `PFSense.Changes` (`m02-quest.ts:593-598`):
  unlock-nya emang gak pernah baca nilai `destination` sama sekali (save
  apa pun setelah login langsung `Network.removeFirewallRule`), jadi
  field itu murni kosmetik yang "bocorin" LAN IP workstation gratis di
  panel. Dihapus total, rule sekarang cuma `{ allowed: false, port: 3389
  }` — mekanisme unlock TIDAK berubah, cuma panelnya gak lagi
  pre-jawab.
- **Live-test confirmed (2026-09-24, sesi lanjutan)** — user konfirmasi
  langsung "aman" setelah nyoba seluruh redesign ini di live-game: home
  network (Splitter kosong + Rust-Bucket + 4 pengecoh), Workstation RDP
  exploit dengan versi baru `FreeRDP 7.1.9`, Closer-Rig penuh dengan
  versi baru `FreeRDP 2.7.3`, dan report/mail ke dead drop — semuanya
  jalan tanpa masalah.

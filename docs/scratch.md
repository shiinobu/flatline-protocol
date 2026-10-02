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
ACTED ON — M2 redesign plan above stays the priority).** **Update
2026-09-28:** M3 findings #1, #2 and cross-mission #6 are addressed by the
M3 redesign (last section of this file, not live-tested). M4 findings #3,
#4, #5 remain open. Same audit lens
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

---

**M1-M4 network reset bug — root cause + fix (2026-09-27).** Live-test
report: "PORT selalu OPEN setelah rebuild" + "mods.reset -> tetap bisa
akses RDP tanpa setting Firewall" (M2). Root cause dikonfirmasi langsung
dari `.reverse/app.asar` (bukan cache lama) dan primary vendor docs
(`node_modules/@hotbunny/hackhub-content-sdk/index.d.ts:2656-2660`):
`Network.createSubnetNetwork()` adalah "create, not replace" — reducer
`AddSubnet` (`t.find(n=>n.ip===e.payload.ip)||t.push(e.payload)`) silent
no-op kalau IP itu sudah pernah terdaftar, jadi port/firewall rule yang
sudah dimutasi (`Network.openPort`/`removeFirewallRule`) survive
selamanya, termasuk lintas `mods.reset` (scope reset-nya cuma "quests,
mails, messages, data, apps" — network gak disebut, gak ikut direset).

`registerM02WorkstationNetwork()` (`m02-quest.ts:383`) punya baris
`Network.destroyNetwork(M02_WORKSTATION_ROUTER_IP)` yang di-comment —
dibandingkan `m02-quest.original.ts:221` yang aktif (destroy-then-recreate,
proven pattern pre-rewrite). Pola sama ditemukan commented/dead di M01 (5
router IP, dibungkus comment `if(isDev)`) dan `if(isDev)`-gated (jadi
dormant begitu `isDev` direvert ke baseline rilis) di M03/M04.

**Fix diterapkan**: helper baru `src/helpers/network.ts`
(`resetMissionNetworks(ips)` — loop `Network.destroyNetwork` per IP,
unawaited — `OnObjectivesStart()` typed strict `void` di SDK, gak bisa
di-await, fire-and-forget ini matching pola existing project termasuk
`.original.ts`), dipanggil di awal tiap fungsi register-network milik
mission sendiri. **Ditolak**: satu fungsi global "destroy semua M1-M4
sekaligus" (usul awal user) — bahaya konkret: bakal ikut menghancurkan
domain LedgerVault M01 yang permanen ([[project-m01-ledgervault-persistent-domain]],
`OnObjectivesStart` M01 gak fire ulang kalau quest udah `complete`, jadi
gak ada yang registrasi ulang) dan network mission lain yang gak sedang
ditest. Solusi disepakati: shared helper, tapi dipanggil per-mission
dengan IP milik mission itu sendiri saja.

- M01 `registerM01Network()`: 5 IP (Router/Firewall/Blackwire/Frostgate/Obsidian)
- M02 `registerM02WorkstationNetwork()`: 1 IP (Workstation Router)
- M03 `registerM03FinanceVlan()`: 1 IP (PFSense) — `if(isDev)` gate dihapus, sekarang unconditional
- M04 `registerM04Network()`: 1 IP (Architect VPN) — `if(isDev)` gate dihapus juga

`isDev` import dibuang dari M01/M03/M04 (sudah genuinely unused setelah
gate-nya hilang). `tsc --noEmit` bersih. Code-reviewer independent pass:
APPROVE, 0 temuan (verifikasi call-site correctness, isDev removal
safety, style, plus cek tambahan bahwa reload normal — bukan reset —
tetap aman karena logic re-apply `firewallBreached` sudah ada duluan dan
tetap jalan setelah network diregistrasi ulang; M03/M04 malah gak punya
mutasi Network apapun di luar fungsi register-nya sendiri).

Known accepted tradeoff (bukan oversight): fire-and-forget punya race
kecil kalau `destroyNetwork`'s Worker-based cleanup belum resolve saat
`createSubnetNetwork` langsung nyusul — sama class of issue dengan race
`mods.reset` yang sudah terdokumentasi di [[feedback-mods-reset-races-fresh-networks]],
mitigasinya sama (retry live-test). SDK docs sendiri rekomendasi
`await`, tapi `OnObjectivesStart()` gak bisa await (lifecycle
method-nya strict `void`, beda dari `OnStart`/`OnComplete` yang
`void | Promise<void>`).

**Status: EKSEKUSI + shipped, belum live-tested** (sesi lanjut ke M3
sebelum sempat verify). `flags.ts` `DEV_FOCUS_QUEST`/`TESTER_FOCUS_QUEST`
dipindah dari `m02` ke `m03` untuk lanjut testing M3 pertama kali (M3
code-complete sejak redesign 2026-09-20, belum pernah live-tested sama
sekali).

---

**M1→M2→M3 document inventory & story connections (2026-09-27).** User
minta fokus penuh diskusi M1→M2→M3 (M4 sengaja di luar scope sesi ini),
wajib presisi/real/konsisten — semua klaim di bawah diverifikasi
langsung ke source (bukan cuma `story.md`), pakai 3 sub-agent paralel
(1 per mission) buat inventaris dokumen mentah, lalu disintesis manual.

**Tree dokumen per device (ringkas — isi lengkap ada di source, sitasi
`file:line` di bawah tiap device):**

*M1 (`src/content/m01.ts`, `src/main/m01-quest.ts`):*
- `M01_TARGET_IP` — `/home/` (ops_notes.txt, todo.txt, readme.txt) +
  `/logs/` (sales_ledger.log template, ops-relay.log terenkripsi base64,
  auth/cron/system.log) — `m01.ts:176-315`
- `M01_LEGACY_IP`, `M01_BLACKWIRE_GATEWAY_IP`, `M01_FROSTGATE_GATEWAY_IP`,
  `M01_FROSTGATE_API_IP`, `M01_OBSIDIAN_GATEWAY_IP`, `M01_OBSIDIAN_API_IP`
  — masing-masing 1 file flavor readme/decommissioned — `m01.ts:24-80`,
  teks di `m01-i18n.ts:143-154`
- LedgerVault (`x7k2m9vdlq4wnyt3.dark`) — file-browser 3 folder proyek,
  isi folder `Q3-2026-SEA` (8 item: escrow receipt, 3 foto lokasi, notice
  BLACKLEDGER, evidence note, network_map.txt, case_id.txt, found_note.txt,
  associate_infra.txt) — `websites/m01/ledgervault/home.html:564-594`
- Blackwire/Frostgate/Obsidian marketplace — listing pemenang **random
  per-playthrough** (`m01-listing-templates.ts`, `m01-listing-pool.ts:80-115`)
  — bukan fakta stabil lintas-mission; 4 listing decoy tiap situs statis/tetap.

*M2 (`src/content/m02.ts`, `src/main/m02-quest.ts`):*
- "Rust-Bucket" NAS — `affiliate_endpoints.txt` (lead ke Closer-Rig,
  `62.171.45.90`) — `m02.ts:184-192`
- "Stale-Fork" workstation — `wire_authorization.pdf` (nyebut Skynet
  Import-Export Co.), `errands.txt`, `unsent.txt` — `m02.ts:155-182`
- "Closer-Rig" (`Qu0taCl0ser`) — `quota_report.txt` (nyebut `FIN-NA-0091`),
  `routing_notes.txt` (nyebut "Architect's cut" + `M04_ARCHITECT_VPN_IP`
  literal) — `m02.ts:194-221`
- Dev box (`f3a91b7c04d8.tr4c3404.dev`) — `deploy.log` (nyebut
  `M01_CASE_ID`), `sync-home.txt` — `m02.ts:120-153`; DB `affiliates` (3
  baris: `M01_CASE_ID`/$2.85M/2026-08-14, LOG-EU-2209/$1.4M/2026-05-02,
  FIN-NA-0091/$4.1M/2026-02-19) + `admins` — `m02-quest.ts:152-192`
- Decoy subdomain 1/2 — `README.txt`/`notes.txt`, dead end murni —
  `m02.ts:15-22`
- BACKTRACE personal log (`M02_LOG_ENTRIES`) — `m02.ts:132-143`

*M3 (`src/content/m03.ts`, `src/main/m03-quest.ts`):*
- "Faded-Ledger" (`d.reyes`) — `q1_reconciliation.xlsx` (satu-satunya
  file filesystem di seluruh M3) — `m03.ts:38-46`
- "Coin-Drift" — DB `wire_transfers`, 1 baris: beneficiary
  `M02_SHELL_COMPANY_NAME` (import langsung), parentEntity `SKN Capital
  Nominees`, amount $42,000 — `m03-quest.ts:117-124`
- OSINT chain: `lynx skynet-importexport.biz` → staff blurb `@d.reyes` →
  `lynx @d.reyes` (leak pattern "company+year+!") → `hydra` pfSense
  `admin`/`SknTrade2024!` — `m03.ts:21-27`
- **M3 nol tanggal di manapun** (satu-satunya angka: $42,000).

**Tabel koneksi — DATA (fakta literal yang match):**

| # | Fakta | M1 | M2 | M3 |
|---|---|---|---|---|
| 1 | `CASE-A7X-0417` | Establish (`case_id.txt`, LedgerVault) | Import langsung `M01_CASE_ID` (`m02.ts:4`) → DB, BACKTRACE log, laporan | **Tidak ada** |
| 2 | Alias buyer `TR4C3#404` | Establish (`M01_BUYER_ALIAS`, `m01.ts:176`) | **Tidak di-import** (beda dari `m02.original.ts:4` yang dulu `import M01_BUYER_ALIAS` — link hard-import ini hilang saat rewrite); M2 cuma pakai turunan domain-safe `tr4c3404`/`A7xCodeFace`. Nilai `'TR4C3#404'` persis cuma survive di `backtrace.html:585` (preview data) | — |
| 3 | `Skynet Import-Export Co.` | — | Establish (`M02_SHELL_COMPANY_NAME`) | Import konstanta sama persis (`m03.ts:4`) |
| 4 | `tr4c3404.dev` | Disebut teks doang (`associate_infra.txt`) | Dibangun jadi domain/network hidup | — |
| 5 | Tanggal **14 Agu 2026** | Tanggal escrow receipt DAN notice BLACKLEDGER (LedgerVault) — **match presisi**, bukan soal amount seperti diklaim `story.md` | `settledAt` ransom + semua timestamp `deploy.log` | — |
| 6 | Istilah "escrow" | LedgerVault, sales_ledger.log | wire_authorization.pdf, quota_report.txt | — |
| 7 | Istilah "consulting fee(s)" | — | wire_authorization.pdf | Spreadsheet + website (2x) |
| 8 | `SKN Capital Nominees` | — | — | Establish, cocok `story.md:66` |

**Tabel koneksi — NON-DATA (struktural/tematik):**

| # | Koneksi | Bukti |
|---|---|---|
| 1 | Gate mekanis berantai | `questGate("m02",["flatline.m01"])` → `questGate("m03",["flatline.m02"])` |
| 2 | Progresi eufemisme 2 lapis | Escrow (lapis pencairan, M1→M2) lalu consulting-fee (lapis pembukuan, M2→M3) |
| 3 | "BLACKLEDGER" nama operasi payung | Establish 2x di M1, digemakan di domain IRC `relay.blkledger.dark` — **kata ini sendiri gak pernah muncul lagi di M2/M3** |
| 4 | Thread "second signer" M2 belum ditutup M3 | Laporan akhir M2: *"a routing note ties payouts to a second signer above the shell company -- source and identity unconfirmed."* Laporan akhir M3 gak punya baris "Unresolved" setara, padahal nama "**Nominees**" + catatan D. Reyes ("hope that's true") sama-sama isyaratkan masih ada pihak di atas |
| 5 | Thread itu mungkin justru ke M4, bukan M3 | `routing_notes.txt` M2: *"Architect's cut... confirm via the usual channel: <M04_ARCHITECT_VPN_IP>"* — di luar scope sesi ini, relevan buat gap #1 |
| 6 | Konsistensi internal M2 | `FIN-NA-0091` di DB affiliate DAN quota_report.txt Closer-Rig — dua sisi operasi sama |

**Usulan gap (urut prioritas, BELUM dieksekusi — masih diskusi):**

1. Thread "second signer" M2 menggantung — M3 gak eksplisit lanjut/tutup.
   Perlu keputusan: memang dirancang baru selesai di M4? Kalau ya, usul
   tambah 1 baris "Unresolved" eksplisit di laporan M3.
2. Identitas `TR4C3#404` = `A7xCodeFace` gak pernah dikonfirmasi eksplisit
   di teks manapun — cuma implisit lewat urutan mission + kemiripan nama.
3. "BLACKLEDGER" (nama operasi dari M1) gak pernah di-echo balik di M2/M3
   meski di-setup 2x di M1.
4. Angka ledger M3 ($42,000) vs ransom M2 ($2,850,000) gak dijelaskan
   hubungannya, dan gak jelas ledger M3 itu mewakili kasus M2 yang mana
   (M2 punya 3 korban lewat shell company yang sama).
5. M1 nol koneksi langsung ke M3 (semua lewat M2 sebagai perantara) — core
   emosional M1 (rumah sakit, korban) gak pernah di-callback di M3 yang
   murni forensik finansial.
6. (minor) M3 nol tanggal sama sekali, beda dari M1/M2 yang selalu
   berpatokan ke tanggal 2026 spesifik — belum masalah sekarang, tapi
   thread gap #1 kalau nanti diresolusi butuh anchor waktu.

**Catatan proses**: dokumen mentah (isi verbatim tiap file) sengaja gak
diduplikasi penuh di sini karena sudah recoverable dari source
(`file:line` di atas); yang dipertahankan di sini adalah tree +
sintesis-nya, karena itu yang butuh kerja ulang kalau hilang.

---

**STATUS (2026-09-28) — semua 6 gap di atas SELESAI dieksekusi + reviewed +
di-commit.** Ringkasan shipped ada di `docs/changelog.md` tanggal ini
(entry BLACKLEDGER/LedgerVault/rename/gap4-5, entry BACKTRACE M1/M3, entry
review). Detail yang gak masuk changelog (biar gak duplikat):

- Review independent (code-reviewer): APPROVE, 0 CRITICAL/HIGH, 3 MEDIUM
  — 2 langsung difix (search `data-name` LedgerVault, urutan
  `appendBacktraceLogs` sebelum `completeObjective` di M3 aftermath), 1
  difix sekalian sesi ini juga (`backtrace.html` `FACT_LABELS.m3` +
  notes/logs gak lagi hilang pas mission complete).
- **Belum diputuskan/masih terbuka**: M3 (dan M4) belum punya bespoke
  "report ready" screen kayak M1/M2 — sekarang cuma jatuh ke card
  generic "REPORT PENDING" + facts/logs di bawahnya, bukan tampilan
  didesain khusus. Kalau mau dibangun, itu kerjaan UI terpisah yang
  nyentuh M3 dan M4 sekaligus.
- Semua kerjaan di atas **belum live-tested** — network-reset fix, situs
  BLACKLEDGER, LedgerVault fix, Personal Log M1/M3 baru, facts M3 baru.
  M3 jadi fokus live-test pertama kalinya sesi berikutnya
  (`flags.ts` udah diarahkan kesitu).

---

**M3 REDESIGN — PASS 2 (2026-09-28, branch `clouds-modify`, after the first
live-test of pass 1). Implemented, NOT live-tested.** `tsc --noEmit` clean,
`npx tsx esbuild.config.ts` clean. This supersedes the pass-1 M3 section
(removed) — where they differ, this wins. Design intent: `docs/story.md`
§4; topology: `docs/network-plan.md`.

**Partly superseded by the 2026-09-29 section at the end of this file.** Items
A-C below stay valid, except that A's remark "M2 uses bettercap legitimately"
has been stale since M2's 2026-09-24 redesign (no mission uses it now). The
chain changed (download → `open`, `Meterpreter.Connected` →
`RemoteConnection.Established`, `vpnConfigPulled` → `vpnConfigRead`), the
hydra fixture in assumption 9 is now `guest` + `admin` on `ip:80` only, and
assumptions 2-3 ("two levels unproven") are proven by M2's live-test.

**Live-test bugs from pass 1 — fixed:**
- **A. bettercap removed entirely.** In this SDK/project bettercap is a
  Wi-Fi mechanic (`WifiRecon`/`WifiDeAuth`; M2 uses it legitimately to
  crack a home AP). M3 is a wired remote pivot with no Wi-Fi, so the
  pass-1 `Bettercap.Open`/`NetProbe` gate was wrong. `internalTrafficCaptured`
  now gates on `Wireshark.Started` + `natPivotDone` only (`:520`). M2's
  bettercap/fern is untouched.
- **B. the finance VLAN is no longer reachable before the pivot.** Pass 1
  registered Coin-Drift's domain + open ports at mission start, so `sqlmap`
  worked with zero dependency on pfSense. Now every internal service port
  ships `active: false` (`:290-291`, `:317`, `:337`, `:349`) and is opened
  only by `openM03InternalPorts()` (`:142`), called on the pivot's
  `PFSense.Changes` (`:510`) and reconciled on restart if `natPivotDone`
  (`:480`) — the exact `Network.openPort`-after-breach mechanism M1 uses.
  The `sqlmap` port-active gate (`bugs.md` #12) is what makes this bite:
  3306 inactive → "No sql-injection vulnerabilities found" until the pivot.
- **C. VLAN re-addressed to `192.168.1.x`.** The pfSense port-forward panel
  rejected `10.50.1.x` with "Local IP must be a LAN address (192.168.1.x)
  or left empty for Any." Every `lanIp` (pfSense `.1`, splitter `.2`,
  Coin-Drift `.3`, Faded-Ledger `.4`, Split-Bill `.5`, Vault-Line `.6`) is
  now `192.168.1.x`. Public `ip`s stay scattered/unique. (This is the same
  `IsLocalIp()` constraint M2's LAN hit on 2026-09-24; the pass-1 "open
  question" about it is now resolved by the live error message.)

**New depth this pass (the mission was too shallow — one leaked password →
one DB dump):**
- **Metasploit exploitation chain (real, mirrors M2/M4).** New internal
  host `Vault-Line` (`79.124.62.90` / lan `192.168.1.6`), the finance
  site-to-site VPN gateway. RDP 3389 `FreeRDP 7.1.9` + `setVulnerabilities
  [{type:"RCE", version:"FreeRDP 7.1.9"}]` (`:376`) — the **exact** recipe
  M2's workstation live-confirmed, chosen so a Metasploit module is
  guaranteed to match. Player: nmap -sV → search/use/set/run →
  `Metasploit.Meterpreter.Connected` (`:541`) → `Metasploit.Rootgrab`
  (`:547`, gated on the shell flag like M4) → read the root file → download
  `site_to_site_backup.txt` → `Files.Transfer` DOWNLOAD (`:556`, M4's proven
  download gate). The config names `M04_ARCHITECT_VPN_IP` as peer
  `SKN-CENTRAL`, owner `SKN Capital Nominees` — so the exploit is what
  proves the money's destination and the tunnel's far end are one hand, and
  it carries the DB creds for the DatabaseManager path below.
- **DatabaseManager as an alternative to sqlmap (scope item 1).**
  `Database.Connected` (`:536`) with `host === Coin-Drift` sets
  `ledgerDumped` too, so a player who lifts `finance_svc` creds from the
  gateway config can read the ledger through the app instead of `sqlmap`.
  The `index.d.ts` Database doc comment ("used by sqlmap, DatabaseManager
  app, etc.") is the only basis for assuming the app fires this event on
  connect — hence it is an *alternative*, never the only route (sqlmap
  still sets the same flag), so if it doesn't fire nothing is lost.
- **Multi-step OSINT password puzzle (scope item 4).** No single line
  leaks the pfSense password. The player must combine: the FORMAT from
  Reyes's Twotter/`lynx @d.reyes` ("short company name + policy year + '!',
  one word, capitalized"), the SHORT NAME from the site ("trading as
  Skynet"), and the POLICY YEAR from the site footer ("policy in force
  since 2024, rotation suspended"). `M03_PFSENSE_PASSWORD` is derived in
  code as `${SHORT_NAME}${POLICY_YEAR}!` so the puzzle and the credential
  can never drift apart. Pure content (lynx `additional` + site HTML) — the
  only SDK dependency is `PFSense.Login`, already used.
- **`@m.okafor` real red-herring persona (scope item 5).** Full Twotter
  account + 5 posts: an ops/facilities guy who brags about "running the
  building" and access he admits he doesn't have. The one credential he
  posts is a fake guest-wifi password (`SkynetGuest2019`) that looks like
  the corporate pattern but is a dead end (wrong token, wrong year, wrong
  system). A player who chases him wastes real effort.

**Objectives: collapsed to exactly ONE** (`m03.objective.00`
`reportFindings`), matching M1/M2. Every step above is still enforced
underneath ("full mechanic, not full objective") via the report's hard
gates: `internalTrafficCaptured && ledgerDumped && vpnConfigPulled &&
natReverted` + the three correct field values (shellCompany, parentEntity,
vpnLead). BACKTRACE logs fire at each milestone (ledger dump, capture, root,
Reyes's share) so the single silent objective still gives running feedback,
exactly as M1's one objective does. **Before testing, abandon or
`mods.reset` M3 — the objective IDs changed again (pass-1 `.00`-`.02` → one
`.00`).**

**Cross-mission connections preserved:** `M02_SHELL_COMPANY_NAME` (report +
ledger), `M04_ARCHITECT_VPN_IP` (imported from the `characters` leaf, never
`m04.js`; appears in the capture log, the gateway config, and the report
field), `M03_PARENT_ENTITY_NAME` = SKN Capital Nominees (imported by
`m04.ts`, unchanged), and the BLACKLEDGER throughline in the report body.

**SDK-BEHAVIOR ASSUMPTIONS — verify against the real client before merge**
(all in `src/main/m03-quest.ts`):
1. **`:107-116` capture file via `Events.emit` → module-level `Events.on`
   → `Files.create`** (unchanged from pass 1). Bridge shape = `bugs.md`
   #19 row 6, but reached from a quest `this.Events.on` rather than a
   `Website.Exports` click; assumes `Files.getHomePath()` + `parentPath`
   lands the file in the player's home. Non-load-bearing: the VPN IP also
   reaches the player via the BACKTRACE `architectVpn` fact (`:526`) and
   the gateway config, so a failure here only loses the `.log` artifact.
2. **`:376` + the metasploit chain (`:541`,`:547`).** `setVulnerabilities
   [{type:"RCE", version:"FreeRDP 7.1.9"}]` on an RDP-3389 device is copied
   verbatim from M2's live-confirmed workstation, so the module match is
   the safest available — BUT M2's host is Router→Device (one level) and
   Vault-Line is Router→Splitter→Device (two levels). Two-level metasploit
   reachability is unproven (M4 assumes the same shape, also untested).
   `Meterpreter.Connected`/`Rootgrab` match on `ip` only. **Non-load-bearing
   for completion:** the report gates on `Files.Transfer` of the config
   (`:556`), which needs in-game root access regardless of whether my
   `gatewayShellObtained`/`gatewayRooted` feedback flags ever set.
3. **`:480` + `:510` `Network.openPort` on a device two levels deep**
   (Router→Splitter→Device). M1 proves `openPort` at one level; two levels
   is unproven, though the shipped M3 already assumed two-level
   reachability for `sqlmap`. If it fails, the whole VLAN stays dark after
   the pivot — first thing to check on live-test.
4. **`:536` `Database.Connected` fires when the player connects via the
   DatabaseManager app** with host+creds. Only basis is the `index.d.ts`
   doc comment. Optional path (sqlmap also sets `ledgerDumped`), so a
   no-fire costs nothing.
5. **`:279` `ledger.skynet-importexport.biz` on a device nested
   Router→Splitter→Device** (unchanged) — assumes `sqlmap`'s domain
   resolution reaches two levels deep; M2 proved one level.
6. **`:530` `Sqlmap.DumpTable.host`** accepts the device IP *or* the
   domain (sqlmap input must be a domain; the event's `host` field's exact
   value at two-level depth is unconfirmed).
7. **`:266` + `:497` pfSense admin panel on a `Router`-type node.** M1/M2's
   confirmed panels are on `Firewall` nodes; `bugs.md` #17 says pfSense
   keys off `users` not type; M3 has always used the Router. Unconfirmed.
8. **`:502-518` `PFSense.Changes` counting.** Change #1 = pivot (opens the
   ports). The first change *after* capture+ledger+config counts as the
   revert. Event carries no rule data, so "revert" = "any later saved
   change," not "removed that specific rule."
9. **`:203` hydra fixture registered for both bare IP and `ip:80`.** The
   pivot does NOT depend on hydra — `PFSense.Login` fires on a correct
   manual login with the deduced password, so hydra is only a convenience.
10. **`:562` `Terminal.Explorer.ip`** accepts the public IP or the LAN IP
    (bonus path; not required for completion).
11. **`:393` Twotter personas** created with no avatar/banner (M1 supplies
    both); `createUser` documented to fill missing fields. Two personas
    now (Reyes female, Okafor male). `lynx @handle` fixtures share the
    handles with the real accounts, as M1 does.

**Remaining open item (unchanged):** `resetMissionNetworks` (`bugs.md`
#18/#21 race) — the report hard-requires the ledger dump, which requires
the domain+port to come up cleanly on a rebuilt save; first suspect if the
VLAN can't be reached at all after the pivot.

---

**2026-09-29 — BACKTRACE keys, one money model, M3 follow-up.** Implemented,
NOT live-tested. `npx tsc -p tsconfig.json --noEmit` clean (exit 0), the inline
scripts of `backtrace.html` and `ledgervault/home.html` pass `node --check`,
and the finance arithmetic was re-run outside the game (totals and the
12-row balance below). No build was run. Detail per change: `docs/changelog.md`
(2026-09-29), rules: `docs/implementation-rules.md` §13-14.

**Why (user feedback, 2026-09-29).** One action used to trace several facts
(M2's `affiliates` dump 5, M3's ledger dump 4), the panel listed every fact,
and M3's ledger showed one $42,000 row while M2's ransom was $2,850,000. Asked
for: one action = one key finding, keys shown as title + value only, the
descriptions composed into Key Findings at COMPLETE (which may outnumber the
keys), the case id merged with the Q3 folder in M1, new keys in M2/M3, and one
detailed money model for M2 and M3.

**Money model decisions (`src/content/finance.ts`).**
- Three batches, chronological: `LOG-EU-2209` $1,400,000 2026-05-02
  (`PB-2605-01`), `FIN-NA-0091` $4,100,000 2026-07-22 (`PB-2607-01`),
  `CASE-A7X-0417` $2,850,000 2026-08-14 (`PB-2608-01`). FIN-NA-0091 was moved
  from 2026-02-19 so it really falls in the "Q3" that `quota_report` ("Q3
  summary", "top account") and the M2 report ("Q3 closes: 4") claim.
- One waterfall for every batch: 60% SKN Capital Nominees ("management fee",
  the Architect's cut — M2's `routing_notes` say it "goes out same day as
  settlement"), 25% TR4C3404 Consulting ("consulting fees (logistics)" — M2's
  `panelShare`), 5% X7xSentry9 Brokerage ("customs brokerage" — the M1
  broker), 10% retained by Skynet (the remainder, so cents never drift).
  Postings 09:04 in, 09:20 / 09:24 / 09:27 out. Totals $8,350,000 in,
  $5,010,000 / $2,087,500 / $417,500 / $835,000. Re-run outside the game: every
  split sums to its gross; by hand the 12 ledger rows end at a $835,000
  balance (140,000 → 550,000 → 835,000 after each batch).
- Where it surfaces: M2 `affiliates` (gross, `panelShare`, `batchRef`),
  `deploy.log`, `wire_authorization.pdf`, `quota_report.txt`; M3
  `wire_transfers` (all three batches), the Q3 reconciliation (July + August:
  $6,950,000 in, $4,170,000 to the parent), the tip mail, the report's Funds
  lines, BACKTRACE's M2/M3 facts.
- Name note: M1's broker alias is `X7xS3NTRY9` (leet) while the ledger party is
  `X7xSentry9 Brokerage`, after the broker's own domain `x7xsentry9.tech` — read
  as the alias' corporate front. If the literal alias is preferred, change
  `M03_LEDGER_BROKER_PARTY` (the only place the string lives).
- Soft inconsistency left alone: M2's `quota_report` says "Closes this quarter:
  4" and the report says "Q3 closes: 4" while the table holds two Q3 batches
  (`LOG-EU-2209` is May). Read as the closer's own count, not the table's;
  changing it means either moving the EU batch into Q3 or rewording two lines.

**BACKTRACE decisions and edge cases.**
- Keys are the only thing the mission card shows; extras (M1 listing/project,
  M2 caseId/settled/victims/buyer/batchRef/panelShare, M3 the whole waterfall
  plus the peer facts) exist only in the snapshot written at COMPLETE.
- M1 `caseId` traces on the click of the `Q3-2026-SEA` folder, as asked. The
  `Recent` sidebar view also lists `case_id.txt`; opening the file from there
  does not trace the key. M1 `buyer` has no quest flag, so unlike the
  listing / vault / Q3 folder it is not re-traced on a quest restart.
- M3 `vpnPeer` has no shell gate. `mods.reset` does not clear the player's own
  files, so a stale `site_to_site_backup.conf` left in `~/downloads` by an
  earlier run, opened before the gateway is rooted, traces `vpnPeer` and sets
  `vpnConfigRead` (a report gate) early. M2 avoids this with `firewallBreached`. The natural M3
  gate, `gatewayShellObtained`, depends on `RemoteConnection.Established`, which
  is unplayed — gating on it would risk a dead end if the event does not
  fire, so it was left ungated. Revisit after the first live-test.
- `captureRead` needs `internalTrafficCaptured`, which resets per claim, so a
  stale `.pcap` cannot trigger it.

**Assumptions to verify in the game (in the order a run hits them).**
1. **LedgerVault folder click → quest.** `Website.Exports` +
   `Events.emit` is proven (`bugs.md` #19 row 6, received by a *module-level*
   `Events.on`; #20 row 2: a `SaveStorage` write inside that handler persists).
   A **quest-scoped** `this.Events.on` (`m01-quest.ts`, the
   `M01_PROJECT_OPENED_EVENT` handler) receiving an event emitted from a
   website is not proven: the SDK doc says every `Events.emit` is dispatched to
   both the game's event system (quest listeners) and the custom bus, and a
   quest listener receiving a *command*-emitted custom event is live-proven
   (`open` → M2), so only the website emitter context is untested.
   Fallback if it never fires: a module-level `Events.on` that calls
   `traceBacktraceFinding("m1", "caseId")` — guard it on the M1 status, because
   `applyFinding` self-heals a `locked` mission to `progress`, and LedgerVault
   stays reachable after M1 ends (the `caseId` key would otherwise only appear
   in the COMPLETE snapshot).
2. **`open` at a `meterpreter >` prompt** (M3 config, the M2 PDF) — **not an
   assumption any more, it does not work** (`bugs.md` #30, engine-verified):
   custom commands see the target's files only over SSH (`isRemote` =
   `ssh_ip`). The route is Meterpreter `download` (lands in `~/downloads`) and
   `open ~/downloads/<file>`; the handlers accept the local copy because the
   event carries only `{ id, name, extension }`. Proposal, not applied: make
   `open` cwd-aware with `Files.resolvePath` (a bare name currently resolves
   from the home folder).
3. **`RemoteConnection.Established`** (`t: "METASPLOIT"`, `targetIp`) for a plain
   `exploit` (M2 `workstation`, M3 `gateway`), read from the decompiled client
   (`bugs.md` #29), never seen in play. M3 also keeps
   `Metasploit.Meterpreter.Connected`, which only the reverse-TCP listener raises.
4. **Wireshark App start after the pivot** raises `Wireshark.Started`, which
   emits the module-level export that writes `finance_vlan_capture.pcap` in
   the player's home (a start before the pivot is ignored — Stop/Start again).
   The capture is now the source of the two public IPs (with `python3
   net_tree.py` as the independent route) and of the `architectVpn` key, so
   it is more load-bearing than in pass 2 (the report gate itself still only
   needs the capture *started*).
5. **hydra without `-l`** prints the fixture's own credentials
   (`admin`/`Skynet2024!`) — engine behaviour read from the client
   (`bugs.md` #25), first time exercised here.
6. **`rootgrab /etc/passwd`** now finds the `root` user (`bugs.md` #26). Its log
   line fires only when the shell flag is set, and nothing gates on it.
7. **Ledger via DatabaseManager** (`Database.Connected`) — unchanged, still an
   optional alternative to `sqlmap`.

**Left alone on purpose.**
- M4's `initialShellAccess` listens for `Metasploit.Meterpreter.Connected`,
  which a plain `exploit` never raises (`bugs.md` #29). Untested and out of
  scope for this change; fix it with M4's own pass.
- Seven `//` lines (commented-out `Network.destroyNetwork` blocks) remain in
  `m01-quest.ts` and `m02-quest.ts`; they break the zero-comment rule
  (`implementation-rules.md` §9) but predate this change.
- `docs/story.md`'s M2 chain still describes the 2026-09-20 shape (only the
  money and the `open` step were patched); `docs/m02-playtest.md` is the
  current M2 step-by-step.

---

**2026-09-29 (late) — M3 router rework: TP-Link panel, player-written
forwarding rules (Option B).** Implemented after a live-test screenshot; the
whole thing typechecks and has not been played. Superseded by this section:
every earlier line in this file that has M3's pivot on `PFSense.Login` /
`PFSense.Changes` (the 2026-09-28 pass 2 chain, the "change #1 = pivot"
counting, `pfsenseLoggedIn`) — those listeners never fire on a `Router`.

**What was wrong.** M3's gateway is a `Router`, whose admin page is the
TP-Link panel: login raises nothing, Save raises `Network.PortChanges`
(`bugs.md` #31). The Port Forwarding table it shows is the router's real port
table (every child's ports are moved into it with the child's `lanIp`), which
is why five rules were pre-filled and why the table cannot simply be hidden.

**What it does now.**
- `registerM03FinanceVlan`: router with only the locked port-80 rule; the four
  devices without `ports`; `setVulnerabilities` for Coin-Drift (SQL_INJECTION)
  and Vault-Line (RCE, banner version) unchanged. The 3306 `removePort`/
  `addPort` workaround is gone.
- `Network.PortChanges` on `M03_PFSENSE_IP` → `onRouterSaved(newPorts)`: first
  Save traces `portal` (`portalReached`); `syncM03Forwards` finds every rule
  whose `(Local IP, internal)` is in `M03_FORWARD_TARGETS` and rewrites it with
  `service`/`version` when the banner is missing (`Network.removePort` then
  `Network.addPort`, keeping the player's external port and active flag);
  any *active* match → `natPivotDone`; the matches (active or not) are stored
  in `forwards` and re-applied by `restoreM03Forwards` in `OnObjectivesStart`.
- `natReverted`: prerequisites (ledger, capture, config) done, pivot done, and
  `isVlanExposed(newPorts)` false (no active rule whose Local IP is not the
  router's own `192.168.1.1`; an "Any" rule counts as exposed).
- Hint before the gate (rule: `feedback-hint-placement-must-precede-its-own-gate`
  — the rules cannot be typed without host, LAN IP and port): the tip mail says
  the gateway forwards nothing inward; the site's Staff Access block and the
  `lynx` fixture (`M03_SITE_ACCESS_NOTICE`, same words in `home.html`) name every
  host with its service and port; `python3 net_tree.py` (NetTree window: type,
  public IP, `LAN <ip>`, `<Type>: <name>`) maps the names to LAN IPs.

**Decisions.**
- `portal` traces on the first Save, not on a valid rule: a Save proves the
  player is logged in, and the same action is the pivot attempt — one action,
  one key (`implementation-rules.md` §13).
- A rule the mission completes keeps the player's **external** port. `nmap`
  shows `FORWARDED` instead of `OPEN` when external and internal differ, and
  Metasploit's `RPORT` must equal the external port (the client compares
  `external.toString() === RPORT`, then requires `internal` = the module's).
- Rules that match nothing are left alone, not deleted and not flagged: the
  engine has no notion of "listening", so a wrong rule is just an inert row.
- Persistence is best-effort: a restart rebuilds the network, so only matched
  rules come back; a junk or "Any" rule is dropped (the SDK's `addPort` always
  tags the row with a real host's `lanIp`).
- No `445` requirement anywhere: the only consumer of that port found in the
  client is `nmap`; the accomplice route (`Terminal.Explorer`) does not read it.
  The `445` rows exist so a curious player's `nmap` looks right.

**Assumptions to verify in the game (in the order a run hits them).**
1. `Network.PortChanges` reaches a quest-scoped `this.Events.on`. Read from
   the client (`vt.Trigger("Network.PortChanges", {subnet, oldPorts, newPorts})`
   is the last statement of the panel's Save), typed in the SDK, never seen.
   Fallback: a module-level `Events.on` that checks the quest status and calls
   the same logic, or `Browser.Meta` for a visit-only `portal`.
2. The rewrite lands: `nmap -sV` right after the Save must show `mariadb` /
   `FreeRDP 7.1.9`. The handler runs inside the panel's Save click, after the
   panel's own `UpdateSubnet` (a synchronous redux dispatch, so
   `GetSubnet` sees the saved rows).
3. The panel's form keeps the player's un-bannered rows; the next Save copies
   `service`/`version` back from a versioned twin (`ResolveForwardedService`),
   and a `445` row (never versioned) is simply rewritten again by the next
   `PortChanges`. So a second Save cannot lose the banner for good: at worst the
   form's bare row overwrites the rewritten one for the instant before the
   handler rewrites it again. If a live run shows a banner missing after a
   second Save, read the log first — the handler traces nothing today, so add a
   `trace()` line in `syncM03Forwards` before changing the design.
4. `nmap` on a VLAN host before any rule: "Host is up … No ports found" (read
   from the nmap command: host up = the subnet exists).
5. The Staff Access text is enough for a player to write `3306 → 192.168.1.3`
   and `3389 → 192.168.1.6`; NetTree supplies the LAN IPs. If playtesters get
   stuck, add the LAN IPs to the notice or to the tip mail — never after the
   gate.
6. Old M3 saves: `pfsenseLoggedIn`/`pfsenseChangeCount` are ignored, a missing
   `forwards` reads `[]` (`?? []`), `portalReached` starts falsy. Still, abandon
   or `mods.reset` before the run.

**Left alone on purpose.**
- The constants keep their `M03_PFSENSE_*` names and `M03_PFSENSE_NMAP_RESULT`
  fixture: a rename would touch content, quest and docs for no behaviour.
  (The fixture is cleared by the panel's own first Save — the panel calls
  `RemoveCommand("nmap", router)` — after which `nmap` is live.)
- M1 and M2 keep `PFSense.*`: their targets are `Firewall` nodes.

---

**2026-09-29 (evening) — M3 round 2 after the first live run.** The router
rework was played to the VPN config and the log confirms it (five keys, three
personal logs; `bugs.md` #31). The owner's review then asked for three changes,
implemented and typechecked, not played. Superseded by this section: the
"network is rebuilt on every start" and `natReverted` lines in the section above.

**Decisions.**
- **Restart (`bugs.md` #32).** The VLAN is built only when `networkBuilt` is
  false or the subnet is gone; the flag is set at the very end of
  `OnObjectivesStart` so a `SetData` failure there cannot cost the listeners
  (no other `OnObjectivesStart` in the project calls `SetData` in its body — the
  first such use). `resetMissionNetworks` stays for the rebuild path only, so a
  claim after `mods.reset`/abandon behaves as before. `forwards` is now only the
  fallback for a rebuilt network. M1, M2 and M4 are untouched.
- **Report gate.** `natReverted`, `isVlanExposed` and the revert wording are
  gone (the owner: the rules are the player's freedom). The tip mail keeps the
  audit warning as flavour. The objective text lost "cover your tracks".
- **Faded-Ledger (`bugs.md` #33).** Key on `RemoteConnection.Established`
  (`t: "SSH"`, `targetIp` = the typed public IP; a LAN IP cannot be typed from
  outside an SSH session). The Reyes personal log moved to `Terminal.Cat` /
  `open` of the note because it quotes the note; `Terminal.Explorer` still
  fires key and log together. `22 ssh` has no version on purpose: a made-up
  banner could accidentally satisfy a Metasploit module's version check, and
  `ssh` reads no service or version.

**Assumptions to verify.**
1. A plain restart keeps the rules and the banners. The first run of this
   build over an old save rebuilds once (no flag), which can still hit the
   race; start from a fresh claim.
2. `Network.getSubnet(M03_PFSENSE_IP)` is not null while the save is loading
   (if it were, the network would be rebuilt and the race would come back).
3. SSH into Faded-Ledger raises `RemoteConnection.Established` with the typed IP
   (read from the client: `t: "SSH"`, `targetIp` = the address after `@`). The
   login itself is confirmed in the log ("Sys log file not found for
   62.210.183.77", 15:05).
4. `cat` of the note over SSH raises `Terminal.Cat` with `name` and `extension`
   split (`do_not_open_at_work` / `txt`), as M2's `deploy`/`log` does.
5. The dev-mode reload ("Build output changed … Reloading", two loads in a
   second) leaves the kept network alone; before this change it wiped it.

**Parked (owner's call, not done).** Database Manager needs the public IP
(`185.107.56.214`), not the LAN `db_host` in the `.conf`, and the app checks no
port rule at all (`Database.find` on host + user + password); an optional
comment line in the `.conf` was proposed and skipped. The engine's "Sys log file
not found for <ip>" error on each connection to a mission device is harmless. The
BACKTRACE app showed M2 "in progress": leftover state from the 27/09 M2 test in
the same save (`scratchbt m2 locked` clears it); the caseboard's TRACE label
takes the first mission in progress, so it shows M2 while that is set. The
"6/7" the owner mentioned was not identified.

---

**2026-09-29 (night) — M3 round 3 after the retest.** The retest (log 20:02–20:26)
confirmed the restart fix (N1, N2), the new texts (N6) and a clean BACKTRACE
(N7), and showed the report refused in silence (`bugs.md` #34). Implemented and
typechecked, not played.

**Decisions.**
- **Wireshark out, not just optional.** The step was judged weird and was a
  silent report gate; a merely optional capture would keep a dead thread. Removed:
  handler, `.pcap` bridge, `internalTrafficCaptured`/`captureRead`, capture text,
  the payroll decoy (its only source was the capture) and the `architectVpn` key.
  `architectVpn` stays a fact in the snapshot (the report finding 05 and M4's
  hand-off use it); 5 keys remain. Finding 05's "not payroll" became "not a
  vendor". M4's tip mail (`M04_TIP_SUBJECT`/`CONTENT`) now names the gateway
  config as the source; the quest matches on the constant, so nothing else moves.
- **Where the player learns what the capture told them.** Ledger domain: the
  Staff access notice (constant, `home.html`, the `lynx` fixture). Public IPs:
  `python3 net_tree.py`. Which box is the tunnel gateway: the notice and the tip
  mail. The tunnel endpoint: the config.
- **No `download`.** `site_to_site_backup.conf` → `.txt` so the engine's `cat`
  reads it where it lies. Assumption to verify: the base terminal commands
  (`cat`, `ls`) are available at the `meterpreter >` prompt and `cat` reads the
  terminal's current directory, which the exploit points at the target (the SSH
  environment, which also lists only a few own commands, offers `cat` and `ls`, so
  this is likely). `open` for the config stays as a second trigger for a
  downloaded local copy.
- **`open` line by line.** One `println` of a whole string collapses newlines;
  `cat` returns the string as the command result. Fixed by printing per line;
  leading spaces become non-breaking spaces so indented text keeps its shape.
- **Diagnostics.** A `trace()` at the top of the `RemoteConnection.Established`
  handler (`[FP][M03] remote connection <t> -> <ip>`) to explain why the SSH login
  to Faded-Ledger traced nothing. Remove at FINAL LOCK.
- **`CLAUDE.md`** added at the project root: an honest project context (a game
  mod, fictional data, design-level work) for future sessions.

**Assumptions to verify.**
1. `cat` at `meterpreter >` (see above). Fallback: an SSH-reachable copy, or the
   file explorer of the session.
2. The `[FP][M03] remote connection …` line shows the SSH login; if it shows
   `SSH -> 62.210.183.77` and still no `traced accomplice`, the fault is in
   `markAccompliceReached`/`traceBacktraceFinding`, not in event delivery.
3. The report completes with only the ledger and the config.

---

**2026-10-01 — M2/M3 migration notes (plan only, nothing implemented).**
Written before touching M2 and M3, after M1 reached its LOCK. Everything below
was read from the source, the SDK typings and the engine snapshot
(`.reverse/extracted-1.3.13`); items marked *to verify* were not.

**Decisions (owner, 2026-10-01).**
- **i18n covers every mission, one subfolder per mission**: `i18n/m01` ..
  `i18n/m04`, plus `i18n/global/` only for strings several missions share.
  Languages `en` + `zh`, as in M01 (every `i18n/m01/*` file registers both).
- **Site strings in `SharedVariables`.** `context/m01/site-strings.ts` now uses
  `SharedVariables` under `flatline.m01.siteStrings` (was `Variables`,
  namespace-sensitive, bugs #36). Done and typechecked. It is still session-only,
  so `OnObjectivesStart` must keep refreshing it; `mods.reset` does not clear it.
- **D1 chain shape (provisional)**: a spine with short parallel pairs joined by
  the next step (`Gate.requires` is already an AND list). Parallel only where the
  two steps give each other nothing.
- **D2 M3 order**: strictly ledger, then gateway. The tip mail says so, the `root`
  log line ("same owner as the money") presupposes the ledger, and the VPN config
  carries the same `db_host`/`db_user`/`db_pass` as Coin-Drift, so gateway-first
  hands out the database login (`Database.Connected` also counts as the ledger).
- **D3 M3 forward rules**: a rule typed by the player stays inert until the mod
  gives it a banner (`syncM03Forwards`). Only banner the targets whose step is
  reached; Vault-Line 3389 only after `ledgerDumped`. The rule is never refused or
  removed.
- **D4 `Abandonable` only on M1.** M2-M4 never set it, so there is no Abandon
  button and no `OnAbandon`; drop `OnAbandon` (and its `setBacktraceMission(.., "locked")`)
  from the thin M2-M4 classes. Restarting M2-M4 is `mods.reset` only.
- **D5** Database row text (ledger memos, `helpdesk_resets.note`) and the ledger
  party names stay untranslated: they are system data and the reports match them.
- **Recommendations adopted without a vote**: global `siteT` fed by the union of
  every mission's site keys; drop `M03_LEGACY_PFSENSE_IP`; drop M2's 3306
  `removePort`/`addPort` reconcile (confirm in the live test); keep M2/M3 backups
  in git (commit `7386e09`), not as `.original.ts`; narrow `Gate.step` to
  boolean-valued keys (the earlier "loosen `Gate.step`" note could not be tied to a
  concrete need); dev-focus mail wipe (below).

**Engine facts checked this session (1.3.13).**
- `mods.reset` (`sDr`): unclaims the mod's quests (neither `OnComplete` nor
  `OnAbandon` runs), removes only quest-bound mails, clears the mod's storage and
  variables, closes and resets its apps. `SharedVariables` and the networks stay.
  Because `SaveStorage` is cleared, mail ids tracked in it are lost: only a wipe by
  sender survives a reset.
- `Manager.Unclaim` releases listeners, drops the quest's tweets and messages and
  its state. `OnAbandon` runs only from the quest's own `Abandon()`, i.e. the UI
  button, which renders only when `Abandonable` is truthy.
- `Variables` and `SharedVariables` are both in-memory and lost on exit.

**Phase 0 - generic changes before M2 (core/components stay mission-blind).**
- `DeviceKind` gains `splitter` and `printer` (M2 workstation LAN, M3 VLAN);
  `toChild` in `components/topology.ts` handles them.
- `DeviceSpec` gains `name` (codenames) and `vulnerabilities`; a pass after
  `createSubnetNetwork` calls `Network.setVulnerabilities` (the SDK only accepts
  vulnerabilities inside `domain`; the FreeRDP RCE on the M2 workstation, the
  Closer-Rig and Vault-Line needs the call).
- `DomainSpec` gains `vulnerabilities` and `registerDomains` passes it, so the
  devbox and decoy subdomains can be registered by an unlock instead of at build.
- `components/database.ts` and `WorldSpec.databases`: create once, then
  `setTable` on every register (bugs.md #14); remove by host, never via a
  private `databaseId` field (lost on reload).
- A post-build restore hook for state the player authored (M3 `forwards`):
  `core/rebuild.ts` rebuilds in a Scheduler job whose payload is only
  `{ unlocked }`. M2 needs nothing here, its firewall breach is an `UnlockSpec`.
- `Math.random` shuffle (`main/m02.ts:319`) becomes
  `Random.pickMultiple(list, list.length)` in `controller/m02/world.ts` (content
  never calls the SDK).
- `websites/global/localize.ts` imports `context/m01/site-strings`; move the cache
  to `context/global/site-strings.ts` and refresh it from
  `i18n/global/site-keys.ts` (union of each mission's `site-keys.ts`) in every
  mission's `OnObjectivesStart`. Reason: LedgerVault is a persistent M1 domain and
  stays reachable while M2 runs; after a restart the cache is only filled by the
  active mission, so M1's keys would render raw. *To verify:* `Localization.t` in
  `OnModPackageLoaded` would also cover "no mission active".
- Report: `ReportSpec` + `isReportSubmission` already fit. M3 currently drops a
  correct but premature report in silence (`main/m03.ts:586`); answer it with
  `sendReplacingMail` + `firstUnmetStep`, as `controller/m01/vault.ts`.
- Personas: M3's `seedM03Persona` duplicates `components/persona.seedPersona`;
  use `IntroSpec.personas`.
- M1 uses all of this code: rerun the M1 smoke (still pending since the rename and
  LOCK) after Phase 0.

**M2 "The Maker".** Today: `main/m02.ts` 680 lines, `content/m02.ts` 266, no
gate (the report is accepted without prerequisites), every domain registered at
build, `OnAbandon` teardown.
- Chain (flags in quest Data, all through `advanceStep`):
  `tipReviewed` -> `rootProbed` (`Terminal.NmapScan` on the root IP) ->
  `subdomainsEnumerated` (`Subfinder.Results`) -> [`adminsDumped` ||
  `affiliatesDumped`] (`Sqlmap.DumpTable` on the devbox; keys `developer`,
  `ransom`) -> `devboxAccessed` (`RemoteConnection.Established`, `t === "SSH"`,
  *to verify* for the devbox) -> [`deployLogRead` || `homeLeadRead`]
  (`Terminal.Cat`; keys `deployLog`, `homeLead`) -> `firewallLoggedIn`
  (`PFSense.Login`; key `firewall`) -> `firewallBreached` (`PFSense.Changes`) ->
  `workstationRooted` (Metasploit; key `workstation`) -> `shellCompanyFound`
  (`open` of the pdf; key `shellCompany`) -> `reportSent` (requires
  `shellCompanyFound` + `deployLogRead`). `aftermathShown` requires
  `workstationRooted`. The NAS -> Closer-Rig thread stays optional, off the chain.
- Unlocks: `subdomainLead` at `rootProbed` (the 40 subfinder domains: devbox and
  two decoys with `SQL_INJECTION`, 37 noise domains with `needsSubnet`, plus the
  devbox `nmap` fixture); `workstationRdp` at `firewallBreached`
  (`removeFirewallRules` + `openPorts` on 3389), which replaces the manual restore
  at `main/m02.ts:587-590`.
- Databases: devbox (`admins`, `affiliates`) and the two decoys (empty tables).
- `Terminal.Cat` matches file content exactly (`main/m02.ts:607`, `:617`); keep
  that match but through the same lazy builder that produces the localized file,
  or a language switch mid-mission breaks it.
- *To verify in the live test*: sqlmap and nuclei still see the devbox and decoys
  when their domain is registered by an unlock with `vulnerabilities`; the 3306
  port declared on the device alone is enough; the `ssh` fixture is unused (the
  playtest doc calls it cosmetic).
- *Optional extra step, not decided*: `hashCracked` (`John.DecryptHash`) between
  `adminsDumped` and `devboxAccessed`. The playtest lists `john` as step 7 and the
  SDK has the event, but its payload was not checked, and bugs #13 limits which
  hashes `john` can crack.

**M3 "Money Trail".** Today: `main/m03.ts` 613 lines, `content/m03.ts` 410, one
gate (`ledgerDumped && vpnConfigRead` on the report), `natPivotDone` and
`gatewayRooted` recorded but gating nothing, domains registered at build.
- Chain: `tipReviewed` -> `siteScouted` (`Terminal.Lynx.Lookup` or a scan of the
  Skynet IP, pick at implementation) -> `portalReached` (`Network.PortChanges`,
  first Save) -> `natPivotDone` (an active forward matching a target) ->
  `ledgerDumped` (`Sqlmap.DumpTable` or `Database.Connected`) ->
  `gatewayShellObtained` -> `gatewayRooted` -> `vpnConfigRead` -> `reportSent`
  (requires `ledgerDumped` + `vpnConfigRead`). `accompliceReached` stays optional
  and requires `natPivotDone`.
- Unlocks: `gatewayLead` at `siteScouted` (domain
  `remote.skynet-importexport.biz` -> the gateway, plus the gateway's `nslookup`,
  `hydra` and `nmap` fixtures); `vaultLineForward` at `ledgerDumped`. On that
  unlock re-read the router's port table and banner the stored Vault-Line rule
  (*to verify*: reading the router ports at unlock time).
- `forwards` (external ports are the player's choice) cannot be static: keep them
  in quest Data and restore them through the Phase 0 hook, only when the network is
  rebuilt. `syncM03Forwards` stays in the controller: `addPort`/`removePort` do not
  re-raise `Network.PortChanges`.
- `M03_LEGACY_PFSENSE_IP` goes away (see the decisions); `networkIps` is the
  gateway and the public Skynet router.
- Personas stay seeded at `OnStart`: reaching the handle already needs the
  directory in the `lynx` fixture.

**Cross-mission constants and imports.**
- To `content/global/` (for example `entities.ts`): `M02_SHELL_COMPANY_NAME`
  (M3, BACKTRACE) and `M03_PARENT_ENTITY_NAME` (M4, BACKTRACE). Drop
  `M03_ARCHITECT_VPN_LEAD`, it only aliases `M04_ARCHITECT_VPN_IP`.
- Re-point `applications/backtrace-facts.ts` (the one `applications -> content`
  import), `websites/m02`, `websites/m03`. `content/global/mail-senders.ts` still
  imports the flat `content/m04.ts` until M4 moves.
- i18n keys for: quest title/description/objective, tip mail, report
  subject/template/body, BACKTRACE log lines, device file contents, whois/lynx
  text, M3 Twotter posts, the tr4c3404 and Skynet pages. Not translated: domains,
  IPs, usernames, passwords, hashes, case ids, batch refs, nmap results, ledger
  party names.

**Order and verification.** Phase 0 -> M1 smoke -> M2 (content, i18n, controller,
thin class; typecheck; harness with seeded random and a Database mock; live test
by the owner; commit) -> M3 the same -> docs. Typecheck only, never esbuild;
the owner runs `build-install.ps1`. After M3 `resetMissionNetworks` stays, M4
still uses it. Docs to update at the end: `architecture.md` (restructure status),
`implementation-rules.md` §11, `bugs.md`, `changelog.md`, `m02-playtest.md`,
`m03-playtest.md`, `network-plan.md`.
- Dev focus: `guard/flags.ts` has `DEV_FOCUS_QUEST.m01 = true` and
  `TESTER_FOCUS_QUEST.m03 = true`; the M2 test needs `m02` in dev focus (only one
  may be true).
- Mail in dev focus: `onStartM01` does not run, so after `mods.reset` the old
  Custodian mails stay. Wipe by sender in the `OnStart` of M2 and M3, only when
  `isQuestDevFocus` is true. A normal run keeps M1's history, because the wipe stays
  at `onStartM01`.

---

**2026-10-01 (later) — Phase 0 done (typechecked, harness-checked, not played).**
Landed as planned in `core`, `components`, `middleware`, `context/global` and
`i18n/global`; see `docs/changelog.md` and `docs/architecture.md`. Where it
differs from the plan above:
- `restore` is typed through a generic: `WorldSpec<R = never>` and
  `WorldState<R = never>`; `register`, `bindWorld` and the rebuild payload carry
  `R`. M1 keeps the default (no restore) and its rebuild payload is unchanged
  (`{ unlocked }`).
- Databases are applied inside `applyNetwork` (so after the awaited destroys on a
  rebuild) and in the kept branch of `register`, and removed in `teardownWorld`
  after the destroys. A `destroyNetwork` reply puts the whole store snapshot back
  (bugs #35); whether that snapshot includes the Database table was not checked,
  so the Database calls stay clear of it. *Not live-tested.*
- `FlagKey<D>` narrows `Gate`, `Unlock`, `advanceStep` and `firstUnmetStep`
  without touching M1's files (all of M1's data keys are boolean).
- Left for the M2 pass: the `Random.pickMultiple` shuffle in
  `controller/m02/world.ts`, personas through `IntroSpec`, the M3 forward banners.
- Verification harness (it lived in the session scratchpad and will be gone): the
  previous commit (`git archive HEAD`) and a copy of the working tree each run
  against a CommonJS mock of the SDK placed in their own `node_modules`;
  `tsx equiv.mts <root>` registers, unlocks and unregisters `M01_WORLD` in 5
  scenarios and prints every SDK call. The two outputs must be identical (966
  lines), and deleting `applyNetworkUnlocks` in the copy makes them differ. A
  second script checks the new paths on a synthetic world (25 checks: splitter
  and printer reach the SDK, no `vulnerabilities` key reaches
  `createSubnetNetwork`, `setVulnerabilities` runs after its network, database
  create-once and reconcile, restore after the build, sequential destroys, the
  M1 payload shape, teardown order). Recreate it from this description if needed.
- Next live check (owner): the M1 smoke again after `build-install`. The listing
  pages and LedgerVault must show translated text, not raw keys.

---

**2026-10-01 (later) — M2 migrated to the pipeline (typechecked, harness-checked, not played).**
`main/m02.ts` is a thin class over `controller/m02/`; the old 680-line quest and
the flat `content/m02.ts` are gone (they live in commit `7386e09`). See
`docs/changelog.md` and `docs/m02-playtest.md` §11 for the files and the live test.
Choices made while writing it, which the plan above left open:
- The two table dumps are a parallel branch that joins at the report, not at
  `devboxAccessed`. The admins table is the only thing the SSH step needs; a join
  there would make a correct SSH login before the affiliates dump silently not
  count. `reportSent` requires `shellCompanyFound`, `deployLogRead` and
  `affiliatesDumped`; `aftermathShown` requires `workstationRooted`.
- `devboxAccessed` listens to `Terminal.SSH.Connected` (an IP string, which M1
  already uses for `backendAccessed`), not `RemoteConnection.Established`.
- The root probe is any of `Terminal.NmapScan` (IP or domain), `Terminal.Whois`
  or `Terminal.Nslookup` on the root, so one missed payload shape cannot dead-end
  the mission.
- The `Math.random` shuffle is gone: all 40 subdomain records are sorted by name,
  and since the labels are random hex the order carries nothing.
- `M02_SHELL_COMPANY_NAME` moved to `content/global/entities.ts`; M3 (including
  `content/m03.original.ts`), `main/m03.ts` and BACKTRACE import it there.
- The report template and the freehand body are two i18n keys, as in M1: the
  template keeps `{{developer_url}}` / `{{shellCompany}}` untouched for the Mail
  template, and M1's template already relies on a placeholder it was not given
  staying in place (the engine translates through i18next).
- The engine's `Localization.t` returns the key itself when no mod context is
  active (`translate`: no current mod, no lookup), which is why renders go through
  the cache. The quest's `Title` / `Description` are read once at class load.
- Not translated: BLACKLEDGER's page (global, not M2's), page `<title>`s and
  descriptions (as in M1), domains, IPs, credentials, table and column names.
- Dev focus: `onStartM02` wipes the Custodian's mails only when
  `isQuestDevFocus("m02")`.
- Old saves: the quest Data has new flags and lost `deployLogFound`; a save in the
  middle of the old M2 needs `mods.reset`.
To verify in the live test (also listed in `m02-playtest.md` §11 E): devbox and
decoy domains registered by an unlock still count for `sqlmap` and `nuclei`; the
3306 port declared on the device alone is enough; `Mail.Read` carries the tip's
subject; the database calls do not collide with a `destroyNetwork` reply; the
`ssh` fixture (kept, in the `subdomainLead` unlock) is harmless.
Harness (session scratchpad, will be gone; recreate from this): the previous commit
and a copy of the tree run against a CommonJS SDK mock that stores the registered
`Localization` tables and interpolates `{{var}}`. (1) Old quest run vs the new
`register` + full event chain, observations normalized and diffed: 21 texts, the
router trees, domains, vulnerabilities, fixtures, database creates and tables, the
tip mail, the report template and the firewall-breach port change are identical;
the only difference is the six dropped 3306 `removePort`/`addPort` calls. (2) Gate
checks: the 13 steps advance in order, an early report gets one replaced Custodian
mail whose hint follows the first unmet step, nothing leaks before the root probe
(one `registerDomain`, no devbox fixture), 41 domains after it in name order,
reload keeps the network, a `mods.reset` replay destroys the six routers one at a
time before building, completion removes the databases and routers, and 300
random event orders (14 passes each) never break a gate or open the world early,
all 300 eventually finish, while with the gate table emptied the same fuzz fails.
(3) `en` / `zh` parity: 44 keys, same placeholders in both.

---

**2026-10-01 (later) — M3 migrated to the pipeline (typechecked, harness-checked, not played).**
`main/m03.ts` is a thin class over `controller/m03/`; the old 613-line quest and
the flat `content/m03.ts` are gone (they live in commit `7386e09`). See
`docs/changelog.md` and `docs/m03-playtest.md` §11 for the files and the live
test. M2 was live-tested first (log 19:26-19:53, all seven keys in gate order,
no error from the mod). Choices made while writing M3, beyond the plan above:
- **Withheld Vault-Line rule (D3), how.** Every saved rule that matches a
  `M03_FORWARD_TARGETS` row is stored in the quest data (`forwards`, each with a
  `bannered` flag). The banner (`removePort` + `addPort` on the device IP with
  service and version) is written at once for every target except Vault-Line,
  which carries `gatedBy: "ledgerDumped"`; on the ledger dump `releaseForwards`
  rewrites the stored Vault-Line forward from the data, and a later save
  banners it immediately. No read of the router's port table is needed, which
  settles the "reading the router ports at unlock time" item of the plan.
- **Saves before `portalReached` are inert.** Banners (and `natPivotDone`) only
  happen once `portalReached` is set, so a save made before the tip is read and
  the site scouted does nothing, and the next save after scouting carries the
  whole rule table anyway (`newPorts` is the complete table). `natPivotDone` counts
  only an active forward that actually got its banner.
- **Restore.** `WorldSpec<readonly M03Forward[]>.restore` re-applies only the
  bannered forwards after a rebuild; withheld ones are not recreated (a rebuild
  gives the router a fresh table, so the player re-adds them).
- **Gateway lead.** The portal domain, the ledger domain (with
  `SQL_INJECTION`) and the gateway's `nslookup` / `nmap` / `hydra` fixtures
  are the `gatewayLead` unlock at `siteScouted`. The device itself carries the
  vulnerability at build (`DeviceSpec.vulnerabilities`), the domain gets it at
  the unlock. The public recon fixtures (`lynx`, `mxlookup`, `nmap` of the
  public IP, the two handles, `geoip` / `whois` of the Architect's endpoint)
  stay at build, because they are the hints that precede the gate.
- **Public-site probe.** `siteScouted` fires on `Terminal.Lynx.Lookup` or
  `Terminal.Lynx.Search` of the domain, `Terminal.NmapScan` (IP or domain),
  `Terminal.Whois`, `Terminal.Nslookup`, `Terminal.Mxlookup` or `Browser.Meta` on
  it, so one payload shape that does not match cannot dead-end the mission.
- **Personas** are seeded once from `OnStart` through `IntroSpec` (the old code
  re-seeded them on every `OnObjectivesStart`); the handles stay reachable only
  through the `lynx` directory.
- **Cleanups.** `M03_LEGACY_PFSENSE_IP` and the `M03_ARCHITECT_VPN_LEAD` alias are
  gone (BACKTRACE's `architectVpn` / `peerGateway` read `M04_ARCHITECT_VPN_IP`);
  `M03_PARENT_ENTITY_NAME` moved to `content/global/entities.ts`, which
  `content/m04.ts` (and `m04.original.ts`) now import it from; the `M03_PFSENSE_*`
  names stay (the gateway is a TP-Link panel, but the names are established).
- **Not translated:** the ledger rows and party names, the helpdesk row text
  (D5), table and column names, the config keys (`label`, `remote_gw`, ...), the
  IPs, handles and passwords, and the page `<title>` and description.
- **The Reyes note log** is appended only after `accompliceReached`.
- **Engine facts checked for M2/M3 texts (1.3.13).** The game's `i18next` is
  initialised with `escapeValue: false` and the default `skipOnVariables`, so
  variable values are not HTML-escaped and a placeholder that was not given a
  value stays in the text; that is what the two-key report template (M2 and M3)
  relies on. A mod translation without a current mod returns the key itself.
- **Old saves** need `mods.reset`: the quest data has new flags and the shape of
  `forwards` changed (`bannered`).
To verify in the live test (also listed in `m03-playtest.md` §11 E): the public
probe events match their real payloads; the ledger domain registered by the
unlock still counts for `sqlmap`; a Vault-Line rule saved before the ledger
really stays inert and works after the release; `mods.reset` replays the world
without losing the finance database.
Harness (session scratchpad, will be gone; recreate from this): the previous commit
and a copy of the tree run against the same CommonJS SDK mock as M2.
(1) Old quest run vs new `register` + the first two events, normalized and
diffed: 21 texts, the router trees, domains, vulnerabilities, fixtures, database
creates and tables, the tip mail, the report template and the personas' Twotter
calls are identical; the only difference is the Vault-Line banner, which the old
code wrote on the first save and the new code writes on the ledger dump with the
same two calls. (2) Gate checks: the whole chain in order, nothing but the public
domain after the build, saves and scouting out of order inert, the lynx probe
opening the lead (3 domains, hydra fixtures), banners for the database and ssh
rules only, the withheld rule remembered, an early shell not counting, the
optional accomplice, the release on the ledger dump and on a later save,
premature-report hints for recon / gateway / tunnel with a replaced reply,
reload keeping the network, a `mods.reset` replay with two sequential destroys
and the restore of the bannered forward only, completion removing routers,
domains and the database, and 300 random event orders (14 passes each, the
accomplice event included) that never break a gate, open the lead early or
banner Vault-Line before the ledger, all 300 eventually finishing; with the gate
table emptied, and separately with the Vault-Line gate removed, the same fuzz
fails. (3) `en` / `zh` parity: 71 M3 keys, same placeholders in both. M1's 966
recorded calls and the M2 gate checks are unchanged.

---

**2026-10-01 (night) — M3 live-tested; the gateway-config stall and the BACKTRACE scroll fixed.**
Live test, log 21:13-21:42: `portal` 21:13:46, `parentEntity` + the ledger log
21:18:04, `gateway` 21:21:40 (the Vault-Line shell only after the ledger, so the
withheld banner worked), `accomplice` 21:29:34 + the Reyes log 21:30:05, the
`root` log 21:38:19, `vpnPeer` + the tunnel log 21:38:28, the aftermath log and
`m3 -> complete` with the facts snapshot 21:42:25; no error from the mod (only the
harmless `Sys log file not found for <ip>`). The owner confirmed the checklist in
`docs/m03-playtest.md` §11 by observation; Chinese was not played.
- **What stalled the player for 17 minutes (21:21-21:38).** My migration made
  `rootgrab` a prerequisite (`vpnConfigRead` required `gatewayRooted`). The
  playtest and `docs/bugs.md` #26 had always called it optional ("Nothing depends
  on it"), and the command is fragile: it takes exactly one argument, the path of
  a hashed `passwd`, and answers "Invalid passwd file." for anything else. The
  engine's default file system gives every device `/etc/passwd` with `hashed:
  true`, so `rootgrab /etc/passwd` is the right call. The cat of the config, which
  needs only the shell, now counts on its own; `gatewayRooted` stays as an optional
  branch (requires the shell) that only adds the `root` log, and it is out of
  `M03_STEP_ORDER`. The tunnel hint says "Get onto it" instead of "Root it" (en and
  zh); the tip mail and the objective keep "root", which is narrative.
- **Lesson for M4.** Before a step becomes a gate prerequisite, check
  `bugs.md`, the playtest and the changelog for "optional", "nothing depends on
  it" or an engine quirk on the command; a step the docs call optional or fragile
  stays off the chain, even when the story reads better with it on.
- **BACKTRACE scroll.** The in-progress card (`.locked` in
  `applications/backtrace.html`) had no overflow inside the `.view{overflow:hidden}`
  area, so a long card (M3 with five keys and eight log lines is 771 px against
  584 px of view at a 640 px window) lost its bottom and could not be scrolled.
  The fix is four CSS rules: `.locked` is a flex container with `overflow-y:auto`
  and the scrollbar hidden like `.report-scroll`, and `.locked-card` uses
  `margin:auto; flex:none`, which centers a short card and lets a tall one start
  at the top and scroll. Checked in a browser against the real file with a
  five-key, eight-line card: it scrolls to the bottom, a short card and M4's locked
  card stay centered, a ready report still hides `.locked`. M1 and M2 cards were
  affected too.
- **Harness** (session scratchpad): the M3 gate script now has `rootgrab` as an
  optional event (before the shell it does not count; after the shell it counts,
  adds the root log and the config still needs nothing; the in-order run completes
  with `gatewayRooted` false); the 300-order fuzz includes it and all 300 still
  finish. M1's 966 calls, the M2 gate checks, the M3 old-vs-new comparison (only
  the withheld Vault-Line banner differs) and the en/zh parity (71 keys) are
  unchanged.

---

## 2026-10-01 — mission websites open only while their mission runs

- **Symptom.** After M3 completed, `skynet-importexport.biz` still opened in the
  browser. It was the only open item left from the M3 live test.
- **Cause (engine 1.3.13, read from the bundle).** A mod `@RegisterWebsite` is
  pushed into the global website list (`$vl` / `o7e()`) at mod load, and a
  Firebear tab resolves through `_Qn(host)` = `o7e().find(w => w.Url === host)`.
  Nothing on that path touches `Network.GetSubnetByDomain`, which is all
  `Network.removeDomain` changes (it deletes `domain` from the subnet record). So
  only the domain-based tools (`nslookup`, `nmap`, `sqlmap`, `nuclei`) see a
  teardown; a website never does. The Database Manager has no list of databases
  either: it is a host/user/password form that runs `Database.find` on the state,
  so "no leftover database" means a new connection is refused, while a window
  that is already connected keeps its copy until Disconnect.
- **Fix.** `context/global/site-access.ts` keeps one `SharedVariables` value,
  `flatline.activeMission`. Each controller calls `openMissionSites(id)` in
  `OnObjectivesStart` (which also runs on every game load) and
  `closeMissionSites(id)` in `OnComplete` (M1 also in `OnAbandon`, through its
  `teardown`); M4 does the same inside its flat quest class. `close` only clears
  the value when it is still that mission's, so M2's late `OnComplete` cannot shut
  M3's sites. `gateMissionPages(id, pages)` in `websites/global/page-guards.ts`
  wraps every page's `metadata` and answers `notFoundMetadata()` unless that
  mission is the active one; it is applied to Blackwire, Frostgate, Obsidian,
  ClearEscrow, PacificCare (M1), TR4C3404 (M2), Skynet (M3) and the C2 dashboard
  (M4). PacificCare was a static `WebsitePageDefinition`; it is now a dynamic page
  with the same title, description and HTML (both kinds render through the same
  iframe path in the engine), because a static page has no `metadata` to gate.
- **Single value, not a record per mission.** The missions are strictly
  sequential, and `SharedVariables` is in memory and shared by every save in a
  session. One value heals itself: the next `OnObjectivesStart` overwrites a stale
  one, whereas a record would keep every old `true`.
- **Known edge.** Switching to another save without quitting the game leaves the
  previous save's value until a mission's `OnObjectivesStart` runs in the new save;
  a save with every mission finished never runs one, so in that one case a stale
  value from the earlier save can keep a site open until the game restarts.
  `mods.reset` runs no `OnComplete` and keeps `SharedVariables`, but the restarted
  M1 overwrites the value.
- **Not gated, on purpose (owner to confirm).** LedgerVault: its domain is
  permanent by the owner's standing decision and it already has its own seal
  (`isM01VaultSealed`). BLACKLEDGER (`blkledger.dark`): a static story page with
  no network, reached from M2's `deploy.log` and referenced by M3 and M4. Gating
  either is one line (`gateMissionPages` around its pages, plus converting
  BLACKLEDGER's static page to a dynamic one).
- **Harness** (session scratchpad, copy of `src/` plus a generated CommonJS SDK
  mock with a real Map-backed `SharedVariables`/`SaveStorage`): 95 checks, all
  pass. For each of the eight sites: closed with no mission, closed over plain
  http, closed while each other mission is active, open (no 404, https guard still
  applies) while its own mission is active, closed again after its close. The
  `close` semantics (idempotent, a late close of another mission is ignored), the
  four controllers' open/close wiring (M1 also `OnAbandon`), the M2 to M3 hand-off,
  and that LedgerVault (with its seal off) and BLACKLEDGER stay as they were.
  Negative controls on the copy all fail as they should: gate wrapper no longer
  gates (48 failures), M3 `OnComplete` without close (2), M4 start without open
  (1), unconditional close (3). Typecheck and `--noUnusedLocals` clean. Not
  live-tested.

---

## 2026-10-01 — commit split

- **Five code commits**, each typechecked on its own staged tree (`git
  checkout-index` into a temp folder, then `tsc --noEmit`): `6c8f9e7` Phase 0
  (including the global site-string cache), `e01b7d1` M2, `d03a21a` M3,
  `00d1642` BACKTRACE scroll, `5053585` the site gate. The steps share files, so
  some files were staged in an intermediate form: the Phase 0 commit has an
  M1-only `i18n/global/site-keys.ts`; the M2 commit adds M2 to it, carries a
  `backtrace-facts.ts` with only the M2 imports, and re-points the old flat
  `content/m03.ts` and `main/m03.ts` at `content/global/entities.ts` so they
  still compile until the M3 commit deletes them; the gate lines in the three
  controllers and the TR4C3404 and Skynet pages appear only in the site-gate
  commit.
- **Left out on purpose:** `docs/idea.md`, `docs/msflab-livetest-guide.md`,
  `src/debug/rival-*` and its import line in `src/debug/index.ts`, and the
  dev-focus toggle in `src/guard/flags.ts` (the working tree has
  `DEV_FOCUS_QUEST.m03` true, HEAD has `m01`). `.gitignore` goes in its own
  `chore` commit.
- **Line endings.** The git index is LF everywhere (`core.autocrlf=true`); the
  working tree is mixed, many files CRLF and many LF. In this session an Edit kept
  each file's own ending (the earlier note that it rewrites to LF did not
  reproduce), and only a file created with Write came out LF; a count per file
  after a batch of edits is still cheap.
- **Docs.** `rules.md` has two sections numbered 11 (the SDK-tools rule and the
  step-gating pattern); renumbering was left to the owner, since other docs cite
  section numbers.
- **Next.** M4 migration (read `main/m04.ts`, `content/m04.ts`,
  `websites/m04/architect-c2` and `docs/story.md`; look for optional or fragile
  steps before chaining; `content/global/mail-senders.ts` and
  `commands/attrcheck.ts` import from the flat `content/m04.ts`). M4's own
  `OnObjectivesStart` / `teardown` already call `openMissionSites("m04")` /
  `closeMissionSites("m04")`; keep those calls when it moves into
  `controller/m04/`. Live-test the site gate (a mission's site 404s before and
  after it runs) and the M3 `rootgrab` and BACKTRACE scroll fixes.

## 2026-10-01 (sixth part): download and rootgrab off the gates, `open` at `meterpreter >`

- **Audit.** M1 has no Metasploit, `rootgrab` or `download` step (SSH then `cat`).
  M2's only hard dependency was `shellCompanyFound`: the PDF cannot be `cat`ed and
  the stock path API cannot reach a Meterpreter target, so the route was
  `download` then `open ~/downloads/...`, and the report needs the company name
  that only that PDF carries. M3's `rootgrab` was already off the chain and only
  wrote the `root` log. M4 (flat) still has `escalatePrivileges` (`Rootgrab`) and
  `extractSafely` (`Files.Transfer` DOWNLOAD) as objectives; left for the M4
  migration on purpose (the trap file is its core).
- **Rejected: put the company name in a `.txt` (e.g. `errands.txt`) so `cat` could
  read it.** The owner wants the PDF to stay, and a mission fact in a decoy text
  file breaks the file tree design. Dropped.
- **Engine read (v1.3.13, `index.js`).** `Got()` sets `isRemote = !!data.ssh_ip`;
  the `exploit` handlers set `meterpreter` + `meterpreter_user` and
  `setDirectory(Fr.GetById(<ip>))`, never `ssh_ip`; so `getByPath` stays on the
  player's PC (bugs #30 was right about the path API). The SDK documents the
  ID-based calls as not session-limited, and `RemoteConnection.Disconnected`
  (`t: "METASPLOIT"`) is raised by `back` and by the environment's `onDestroy`.
  That is enough for `open` to walk a target's tree from `Files.getById(<ip>)`.
  A top-level `Events.on` is fine in a command module (the debug modules already
  do it at import).
- **Change.** New `src/commands/meterpreter-files.ts` (tracker + `findMeterpreterFile`),
  `open.ts` calls it first when not on SSH, and falls back to `getByPath`; `~`
  paths stay local so `open ~/downloads/<file>` keeps working. M3: removed
  `gatewayRooted` (state, gate), the `Rootgrab` handler, `M03_LOG_ROOT` and its two
  keys; `LOG_ROOT_2` became `LOG_TUNNEL_3` (en and zh), `LOG_ROOT_1` dropped. M2 gates
  unchanged on purpose.
- **Checks.** `tsc --noEmit` and `--noUnusedLocals` exit 0, no `//` comment and no
  `console.log` in `src/`, line endings kept (CRLF files stayed CRLF, `open.ts` and
  the new file are LF). Mocked-SDK harness (scratchpad `h`, a copy of `src/` and a
  CommonJS SDK mock with a Map-backed file tree): 40 checks pass: no session gives
  "No such file"; SSH `Established` is ignored; at the session a bare name,
  absolute path, relative path and `..` resolve on the target; folders are
  reported; a miss falls back to the local home; a `~` path stays local; a
  disconnect of another IP or an SSH disconnect keeps tracking; `back` clears it;
  over SSH only `getByPath` is called; a host without a root file falls back; M3
  reads the config at the prompt (3 tunnel lines, `vpnPeer`, report reachable, a
  `Rootgrab` event does nothing); M2 reads the PDF at the prompt (`shellCompany`,
  3 aftermath lines, report reachable) and a stale local copy before the breach does
  not advance. Negative controls (three broken copies): the old `open.ts` fails 19,
  no Disconnected handler fails 1 (the after-`back` check), no root lookup fails 19.
- **What the harness cannot show.** The tree walk (root id = device IP, children by
  `name.extension`, `resolvePath` returning the target cwd at the prompt) is read
  from the client, not run. The live test decides it; the `trace("OPEN", ...)`
  lines name the tracked IP and every lookup.
- **Next.** Live test: at `meterpreter >` on the M2 workstation `open
  wire_authorization.pdf` (key `shellCompany` plus the aftermath log), after `back`
  the same command must fail, `open ~/downloads/<file>` on a downloaded copy still
  works; M3 `open site_to_site_backup.txt` and `cat` both trace `vpnPeer` with a
  three-line `tunnel` log and `rootgrab` leaves no log. Then the M4 migration with the
  same rules (shell on `RemoteConnection.Established`, `rootgrab` optional).

---

## 2026-10-02 — M07: the old M4 migrated as a walking skeleton (phase 1 of the M4-M7 run)

### Why the migration comes first

Id `m04` had to be free before the new M4 could exist (world-building README,
"Batasan urutan implementasi" #2). The old finale moves to `m07` wholesale.
`M04_ARCHITECT_VPN_IP` is the one constant deliberately **not** renamed: the
locked M2 and M3 import it from `content/global/characters.ts`, and renaming it
would be an edit to M1-M3, which the hook budget forbids (zero edits, DECIDED
#31). `content/m04.original.ts` and `main/m04.original.ts` are untouched
archives (D4) and nothing imports them.

### Why the Firewall sits inside the Splitter

`11-spec-m7.md` §E says to copy M2's live shape, and §B defect #3 says the old
M4's arrangement (Firewall at router level, devices one level deeper inside the
Splitter) was never tested. So: router → Splitter → [Firewall, C2, Null-Crown,
Ash-Vector] as siblings.

That raises a question the engine excerpt cannot answer: `GetFirewall(ip)`
looks for a `FIREWALL` whose `parent` is the **router** of `ip`'s tree, and a
Firewall nested in a Splitter plausibly has the Splitter as its `parent`. If
so, the deny rules are inert for every device in the tree. Logged as
`docs/bugs.md` #45 rather than guessed at. It does not block the mission: the
gated 3389 port is `active: false` in production and the step's `UnlockSpec`
calls `Network.openPort` as well as `removeFirewallRule`, so the `active` flag
is the real gate — exactly what M2 relies on, and M2 passed its live test on
this shape. `removeFirewallRule` is called with the **Firewall's own** IP,
where `GetFirewall` resolves trivially, so the removal is safe either way.

### Why the credential file names the panel host

`ash-gate` is `isIpHidden`, and `net_tree.py` does not surface it, so the
player needs another route to `194.60.38.12`. The node-status table on
`/legacy-cms/` is phase 4's content, so for the skeleton the in-world route is
`ash-gate_backup.txt` on Ash-Vector, which now carries the panel **host** as
well as the `fw.admin` credential. That also satisfies the rule that every
in-world hint is reachable before the mechanic it helps with: step 5 (read the
backup) precedes step 6 (log into the panel).

### Why 3389 is open from the build

Phase 1 exists to prove four events fire in an RDP session. Making the owner
walk the whole firewall chain first would couple that proof to the unresolved
#45. `M07_RDP_OPEN_FROM_BUILD` in `content/m07/topology.ts` is a single named
boolean so phase 4 flips it to `false` in one place. The chain still refuses to
advance `shellObtained` without `firewallBreached`, so the shortcut buys access
to the events, not progress.

### Why the probes are unconditional

`controller/m07/probes.ts` logs on the raw events, with no gate check, so a
probe still fires when the owner reaches an event out of order — which is the
situation the 3389 shortcut creates. A gated probe would have gone silent
exactly when it was needed.

### `trace` call locations (the owner removes these at FINAL LOCK)

All of them are in **`src/controller/m07/probes.ts`** and nowhere else in the
M07 source:

| Line region | Call |
|---|---|
| `Scheduler.register` handler | `probe:tracking-expired` |
| `armTrackingProbe` | `probe:tracking-armed` |
| `disarmTrackingProbe` | `probe:tracking-disarmed` |
| `RemoteConnection.Established` listener | `probe:metasploit-session` |
| `Terminal.Cat` listener | `probe:manifest-cat` |
| `ATTRCHECK_REVEALED_EVENT` listener | `probe:attrcheck-revealed` |
| `Files.Transfer` listener | `probe:ledger-download` |

The pre-existing `trace("OPEN", ...)` lines in
`src/commands/meterpreter-files.ts` are untouched and belong to `docs/bugs.md`
#30's follow-up, not to M07.

Phase 4 deletes `probes.ts` and its `bindM07Probes` call in
`controller/m07/index.ts` when the real 240-second tracking kit replaces it.

### Why `open` and `attrcheck` now share one lookup

Both need the Meterpreter-aware walk (`docs/bugs.md` #30 follow-up), and
`01-canon-dan-hook.md` §E already lists `attrcheck` **and** `open` as part of
the shared code change for the new missions. The three-line expression moved
verbatim from `open.ts` into `findSessionFile` in `meterpreter-files.ts`, so
`open`'s behaviour — and therefore M2's `shellCompanyFound` and M3's
`vpnConfigRead` — is unchanged.

### Why the evidence report field is the manifest's own classification string

`11-spec-m7.md` §I wants an `evidence` column summarising "employee negligence
staged, G. de Souza made the scapegoat". A free-text summary cannot be matched
exactly, so the expected value is the classification **verbatim as
`manifest.txt` prints it**: `employee negligence (G. de Souza)`. The player
provably reads it, it is short enough to type, and the validator normalises
case and whitespace on both fields rather than demanding an exact string the
way M3's does.

### Harness

Kept outside the repo (scratchpad, not committed), three bundles against a
mocked SDK, 214 checks total: 117 on the gate chain, unlocks, topology shape
(every `lanIp`, every rule `destination`), `register`/rebuild idempotency, the
unlock effects, the report validator and a dates audit of the rendered file
contents; 64 driving the real listeners through in-order and out-of-order
events, the honeypot and trap mail, the report flow and the probes; 10 on i18n
coverage and M1-M3 en/zh parity. Plus 23 static checks (`node --check` on every
HTML `<script>`, `{{t:KEY}}` registration, no clock-derived dates, reachability
from `src/index.ts`). One bug found was in the **mock**, not the mod: it
replaced a language bundle per `registerAll` call instead of merging, so the
last mission's table wiped the earlier ones.

---

## 2026-10-02 — M06 skeleton (phase 2 of the M4-M7 run)

**Why a 5-step subset and not the full 10.** Phase 2's job is the zero-network
path, not M6's content. The subset keeps the spec's order
(`tipReviewed → registryReached → nomineesRead → agentIdentified →
hiddenFilingsFound`) and stops where the skeleton's content stops, so phase 7
appends `snapshotsCompared`, `insurerLinked`, `infraLinked`, `identityProven`
and re-points `reportSent` at `identityProven` without reordering anything.

**Why the entity path is `/entity/r7k4/` and not a readable slug.** `dirhunter`
prints every registered path (E-3). `/entity/skn-capital-nominees/` would name
the answer in the output. E-3 suggests either opaque tokens or one dynamic
pattern such as `/entity/:id`; `PageContext.params` exists in the SDK, but
**nothing in this repo uses a dynamic path yet**, so it is unproven in this
engine build. Opaque tokens are what M1 ships and live-tested, so the skeleton
uses those. If phase 7 wants `/entity/:id` it needs its own live check first.

**Why `register` returning `true` on a zero-network world is fine.** See
`docs/bugs.md` #47. The harness asserts it rather than asserting `false`, which
was my first (wrong) expectation.

**`trace` call locations for M06** (the owner removes these at FINAL LOCK):
`controller/m06/index.ts` — `probe:zero-network register built=<bool>`;
`controller/m06/recon.ts` — `probe:registry-page`, `probe:agent-whois`,
`probe:dirhunter-no-subnet`. The `probe:dirhunter-no-subnet` line prints the
full path list so the owner can paste it into the finding.

**Reward.** `components/reward.ts` is new and shared: `payReward` carries the
D1 rule (pay in `OnComplete`, never `Quest.Rewards`, skip under focus with a
`trace`) and `penalty` carries `min(balance, amount)` for the M4/M7 kit. M6 is
1800, continuing 250 / 400 / 600 / 800 and staying under M7's 5000.

---

## 2026-10-02 — generic kit + M04 skeleton (phase 3 of the M4-M7 run)

**Why `src/debug/` was not touched at all.** My first attempt `git mv`-ed
`src/debug/css-inject.ts` into `components/`, which breaks §4 (the diff guard
covers `src/debug`) and D5 ("the lab stays as is; the kit is adapted, not
moved"). Reverted; `components/css-inject.ts` is a new file holding the same
nineteen lines, and the lab keeps its own copy. Two copies of a tiny helper is
the intended cost of leaving a live, proven lab alone.

**Why the breach uses one key but the strike uses a prefix.** The prompt asks
for the kit's `SaveStorage` prefix to be a parameter (`flatline.m04.*`) *and*
for `sysdiag`/`sysrepair` to serve an active breach from any mission. Those pull
in opposite directions: a mission-blind command cannot guess a prefix. So the
breach lives at one well-known key, `flatline.desktopBreach`, with the owning
mission inside the record, while the intrusion state keeps the per-mission
prefix plus a pointer key `flatline.intrusion.activePrefix` that `repel` reads.
Both requirements hold, and no command imports mission content.

**Why the banner's text comes from `Variables`.** `Desktop.addWidget({ src })`
loads the widget from a path relative to the mod root, so it is never passed
through `localizeHtml` and `{{t:KEY}}` would be printed literally. The lab
hardcoded English in the widget's own JS. The adapted widget reads `view.label`
and `view.detail` out of the `Variables` payload instead, and the controller
writes those from mod context with `Localization.t`, so zh works. The path
itself (`components/incident-banner.html`) is an assumption drawn from the lab's
working `debug/rival-banner.html`; `docs/bugs.md` #48 records it.

**Why `Random.number` and not `Math.random`.** `10` §B drops `Math.random` from
the strike loop, and the recovery build still has to be picked at random
(`10` §B, "build benar dipilih acak dari tiga"). `Random.number` is the SDK's
own generator, it is called from inside a handler so mod context holds (#19),
and it keeps `grep -rn 'Math.random' src/components src/commands` empty.

**M04 LAN addressing.** Every one of the four trees numbers its router
`192.168.1.1` and its device `192.168.1.2`. `IsLocalIp` accepts only the
`192.168.1.` prefix (E-7), and `lanIp` only has to be unique **inside** one
router tree, so reuse across trees is correct here. §8's note about
`192.168.N.x` per router describes M1, which predates E-7 being pinned down.

**`trace` call locations for the kit and M04** (the owner removes these at FINAL
LOCK): `components/incident-banner.ts` (banner shown / resolved),
`components/desktop-lock.ts` (`[FP][LOCK]` css and lock lines),
`components/desktop-breach.ts` (breach begun / repaired / inspect),
`components/intrusion.ts` (strike started / expired),
`components/reward.ts` (reward paid / skipped, penalty charged),
`controller/m04/intrusion.ts` (`probe:strike-scheduled`,
`probe:strike-started`, `probe:intruder-repelled`, `probe:strike-expired`).

**Harness finding.** The M04 repel listener filtered on `prefix` and `strikeId`
but not on the address, so a synthetic event with a decoy IP advanced the step.
The real `repel` command cannot emit that, but the listener now checks the IP as
well. 80 checks for M04, including the `mods.reset`-during-a-strike path and the
`min(balance, amount)` penalty cap.

---

## 2026-10-02 — M07 full (phase 4 of the M4-M7 run)

**Why the trace needed a `repellable` flag.** The 240-second trace reuses
`components/intrusion.ts`, whose active strike is keyed on an IP, and `repel`
severs the active strike when the IP matches. The trace's IP is the C2's, which
the player knows, so without a flag `repel 203.0.113.161` would have cancelled
the countdown. `StrikeSpec.repellable` defaults to true; M07 passes false, and
`repel` reads `currentRepellableStrike()`.

**Why the `.enc` is wiped rather than deleted.** See `docs/bugs.md` #49. The
short version: `Files.create` has no parent **id**, and `parentPath` never
resolves onto a Meterpreter target, so a deleted remote file could not be put
back and the mission would dead-end. `Files.write` works in both directions on a
file found through the id walk. The gate also checks the mission's own
`ledgerWiped` flag, so correctness does not rest on the file write succeeding.

**Why HoneyCheck's markers carry a default literal.** `var DATA = /*__X__*/;` is
not parsable before injection, so `node --check` on the extracted script block
failed. M1's proven form puts the marker **in front of** a real literal
(`= /*__M01_SOLD_LOTS__*/[ ... ]`), and the injector replaces marker plus
literal. HoneyCheck now does the same with `[]` and `{}`, which keeps the file
valid JS at rest and after injection.

**Why the ending runs from the report handler, not `OnComplete`.** The choice
arrives in the report's own fields, and `OnComplete` has no access to it beyond
quest data. `applyM07Ending` runs at the end of the `Mail.Sent` handler, so the
`Mail.send` of Greta's letter is synchronous in the tick of its trigger
(rules §5) and the `unregister` of the destroy ending goes through
`core/unregister`'s sequential teardown (#35). `endingApplied` makes it
idempotent.

**`trace` call locations for M07** (the owner removes these at FINAL LOCK):
`controller/m07/tracking.ts` (trace expired, window halved, payload wiped /
restored, both "not reachable" misses) and `controller/m07/ending.ts` (ending
applied, ledger removed, network torn down). The phase-1 `probes.ts` is deleted.

**`frontend-design` is not installed in this environment.** Checked the skill
list; only the Anthropic/general skills are present. Both new surfaces were
designed by hand against the §6 brief: `/legacy-cms/` is a 2011-era admin panel
(beveled title bar, fieldsets, gradient table headers, Verdana, pill states) and
HoneyCheck is a single-focus checker (one card, large verdict word, confidence
line, dashed empty state, warm-grey paper). Both carry viewport metas, no
`<form>`, no external loads, `:focus-visible`, `prefers-reduced-motion`, and a
narrow-window layout.

**Harness.** 63 new checks for the full mission (shortcut removed, six keys
traced once each by an in-order walk, the 240/120-second deadlines, the failure
and recovery path end to end, all three endings with their letter-or-silence and
teardown-or-not, the reward, and the HoneyCheck and node-table data), plus 25
render checks that actually render the three new pages and assert no `{{t:}}` or
data marker survives, no page carries a date past the M7 story day, http gets the
400 page and an m07 page 404s while another mission runs. The phase-1 suites were
updated rather than left contradicting phase 4.

---

## 2026-10-02 — M04 full (phase 5 of the M4-M7 run)

**The parallel pair.** `relayProfiled` lists both `incidentLogRead` and
`desktopRestored` in its `requires`, which is how `middleware/gate.ts` expresses
a join. A player who fixes the desktop by trying all three builds without ever
reading the log still gets to step 7 once they read it, and vice versa; neither
order stalls. Four harness checks cover exactly that.

**Why `auth.log` has five outbound sessions.** The discriminator is the clock,
not the hostname: only Quiet-Mirror appears as `ESTABLISHED` at 03:14:06, the
minute the incident log stamps. Paper-Moth appears twice as a probe that
forwarded 0 bytes, once at 03:14:41 — close enough to look tempting, late enough
to be wrong. Three keepalives sit before 03:00. Times come from `13` §E.

**`repel` has two jobs now.** Step 3 repels a live strike; step 14 repels the
control host, where no strike exists. `registerRepelTarget` keeps the command
mission-blind: a mission registers an address, and `repel` emits the same event
with that target's id. The M04 listeners check prefix, strike id **and** address.

**A dynamic import was a real mistake.** My first `breach.ts` fetched
`M04_HUNTER_EMAIL` with `await import(...)` inside the Scheduler job. That is an
async boundary in the middle of a handler, which is precisely how mod context is
lost (`docs/bugs.md` #19), and it would have broken the `Mail.send` right after
it. Replaced with a static import; `grep -rn 'await import' src` is now empty.

**`trace` call locations added for M04** (removed at FINAL LOCK):
`controller/m04/breach.ts` (`probe:breach-scheduled`, `probe:breach-began`,
`probe:desktop-restored`, the refusal line), `controller/m04/relay.ts`
(`probe:hydra-run`), `controller/m04/control.ts` (`probe:honeypot-touched`,
`probe:hunt-ended`), plus `probe:strike-rearmed` in `controller/m04/intrusion.ts`.

**Harness finding that was mine, not the code's.** A check asserted `openPort`
runs on `register`'s *keep* path. It does not, and should not: the keep path
leaves an existing network alone, and a port opened earlier is still open because
the network survives (#35). Only the build and rebuild paths apply
`UnlockSpec.openPorts`. The suite now asserts both halves of that.

---

## Phase 6 — M05 "The Door"

**Why the chain has two parallel pairs.** The spec's §B reads as a line, but two
pairs of steps have no reason to be ordered. The 2025 and 2026 captures are the
same action twice on different URLs, so they are separate flags joining at
`staffArchiveCompared`; that whole branch and Greta's `lynx` profile both hang
off `vaultRevisited` and join at `edgeMapped`. The three incident documents hang
off the archive session and join at the report. Twelve harness checks cover the
joins and the refusals: skipping any step in the strictly sequential middle
(`edgeMapped` through `archiveAccessed`) blocks everything after it, and either
branch alone cannot open the edge.

**The decoy is a second missing name, not a wrong name.** The later capture drops
Gareth Lim as well as Greta, and the capture itself says his contract ended
2026-07-31. So the comparison gives two candidates and the paperwork decides
between them — which is why `Gareth Lim` is the report's rejected `door` answer
and why his `lynx` profile exists at all.

**LeakIndex hashes had to be real.** `docs/bugs.md` #13: `john` never consults
`Shell.addCommandData`, so a hash resolves only if the engine already put it in
its own registry from a device's `users` array. All four hashes in the table are
the genuine MD5 of a password declared on a node in the M05 topology, so every
record in the table is crackable and three of them lead to a decoy box with a
readme. The harness asserts both halves: the MD5 identity, and that each password
is declared somewhere in the topology.

**`Exports` sends a number here.** M01's `flatlineOpenProject` passes a folder
string; `flatlineOpenLeakRecord` passes `record.id`. The page builds its rows in
JS from the injected array and binds a click handler per row, so the id never
goes through the DOM as text. If the number does not survive the bridge live, the
fallback is M01's exact shape — send `String(id)` and parse it in the controller.

**A redundant fixture I removed.** `buildM05BreachLookupFixtures` registered
`nmap <edge ip>` with a frozen port list. The edge is a real router in the
topology, so that fixture would have printed over the live scan — the inverse of
`docs/bugs.md` #2, where a print fixture succeeds with no device behind it at
all. Dropped it, and `M05_EDGE_NMAP_RESULT` with it; the step now depends on the
subnet actually existing, which is the thing worth testing live.

**Three harness assertions that were wrong, not the code.** (1) A linear
out-of-order sweep flagged `ticketRead` and `gretaProfiled` as leaks — both are
parallel siblings, so the sweep now runs only over the sequential middle, with
explicit checks for the two joins. (2) `M05_LOG_NOTES` writes two entries, not
one, so the log-count checks were off by one from the start. (3)
`appendBacktraceLogs` filters entries it has already written, which is worth its
own check rather than something to work around.

**`trace` call locations added for M05** (removed at FINAL LOCK):
`controller/m05/recon.ts` (`probe:vault-revisited`, `probe:snapshot-seen`,
`probe:edge-mapped`), `controller/m05/crack.ts` (`probe:leak-record-opened` with
match/decoy, `probe:password-cracked`), `controller/m05/access.ts`
(`probe:firewall-login`, `probe:archive-accessed`, `probe:bedside-bonus`).

---

## Phase 7 — M06 "Open Register"

**The register had to become a search.** The skeleton linked its one record from
the home page, which does not scale to eleven and makes the chain's gating
visible as a list that grows. A search box over the records currently open reads
as an ordinary companies registry, hides nothing behind a link the player has to
notice, and turns "is Nordhaven in here yet?" into a question the player can ask
the page directly. The injected payload holds only open records, so the search is
also the progress gauge.

**Why the paths are opaque.** `dirhunter` prints every registered path of a mod
site and a mod cannot hide a page (`docs/bugs.md` #40), so `/officer/lindqvist/`
would have named the answer in the output of the command the mission *wants* the
player to run. Every record lives at a short code instead, and the harness
asserts no path matches a company or a person's name.

**One stage, not five booleans.** M05 gates its two sites with two booleans. M06
has five page groups, so `context/m06/progress.ts` keeps a single monotonic
number and each record declares the stage that opens it. `setM06Stage` refuses to
go backwards, so an out-of-order event cannot close a page the player already
reached. `stageForM06(data)` is pure and tested on its own.

**The two-day gap is the whole puzzle.** The 2019 filing names Halvard Trust. The
2024 filing withholds the owner. Neither page says who the owner is — the answer
comes from a third record (Halvard, dissolved 2021-11-30), a fourth (Nordhaven
Holdings, incorporated 2021-12-02) and the cross-reference line on the 2024
filing saying the holding was declared by the counterparty rather than by the
entity. That is why both filings have to be read before anything opens.

**Lindqvist had to move.** `content/m06/records.ts` wanted `Conrad Lindqvist`,
which lived in `content/m07/report.ts` — a mission-to-mission import the rules
forbid. He now lives in `content/global/characters.ts` and M07 re-exports him
under its old name, so nothing downstream changed. The static checks grew a
scanner that walks every `src/{content,controller,i18n,context,websites}/m0N/`
file and fails on an import from a different `m0N`, so the next one gets caught
at the harness rather than in review.

**A real bug the harness caught.** `agentIdentified` advanced the chain and
traced its key but never called `unlock(M06_WORLD, "filingArchive")`, so the
Echoline lookup fixtures were never registered — the mission would have reached
the archive step with `nslookup echoline.net` still dead. One check
("the agent unlock brings the archive lookup") is the only thing that noticed.

**Four harness assertions that were wrong, not the code.** (1) A linear
out-of-order sweep flagged `registryReached`: any register page counts as
reaching the register, so visiting a record directly satisfies both steps in one
action, which is correct and now has its own check. (2) Two scenarios called
`walk(q, "snapshotsCompared")`, which is not one of the walk's own step names, so
the walk ran to the end and the mission was already finished. (3) The log count
is seven, not six — `infraLinked` writes the certificate beat as well. (4) Three
M3-consequence checks set the `backtrace` state and then called a fixture that
cleared storage; `freshQuest(true)` now sets it after the clear.

**`trace` call locations added for M06** (removed at FINAL LOCK):
`controller/m06/pages.ts` (`probe:registry-page`, `probe:archive-capture`,
`probe:hosttrail-page`), `controller/m06/recon.ts` (`probe:agent-whois`,
`probe:insurer-whois`, `probe:dirhunter-no-subnet`), `controller/m06/index.ts`
(`probe:stage`, `probe:m3-consequence`, `probe:zero-network`).

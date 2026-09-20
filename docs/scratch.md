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

**Currently scoped to: M02-M04, all in active development.** M01 reached
FINAL LOCK on 2026-09-19 — all its findings have been folded into
`docs/bugs.md` (entries 1-11) and `docs/story.md` (section 4). M02-M04
are implemented but not yet live-tested.

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

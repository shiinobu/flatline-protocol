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

**Currently scoped to: M01 ("Jejak Pertama")** — in active development,
not yet live-tested in-game.

Deviations from `docs/story.md`'s literal tool sequence, made because the
real SDK types (`node_modules/@hotbunny/hackhub-content-sdk/index.d.ts`)
don't support the narrative framing literally — confirm each once M01 is
actually played, then fold whichever hold up into `docs/story.md`/
`docs/bugs.md` at FINAL LOCK:

1. **`lynx` is OSINT, not a web-page reader.** `LynxData`/`LynxLookupData`
   return `{ips, address, contact, socialMedia, additional}`, not HTML. So
   "lynx reads a listing" was split into two separate objectives: `lynx`
   against the storefront domain confirms it hosts the target IP
   (`identifySeller`), and the actual "verified access for sale" listing
   text is read by browsing to `/internal-ops/` in the in-game browser
   (`readListing`, gated on `Browser.Meta`). Confirm this reads naturally
   in-game rather than as two redundant steps.
2. **`ftp` doesn't deliver a real file.** `CommandDataMap.ftp`'s `data` is
   `string | null` — there is no FTP file-download event in `ModEventMap`.
   The wordlist `hydra` needs (`HydraEvent.wordlistFile: FileInfo`) is
   instead delivered as a mail attachment (`Mail.attachments`), sent the
   moment `Terminal.FTP.Connect` fires for the target IP — framed
   narratively as "the FTP transfer synced to your downloads." Confirm the
   attachment actually produces a real, hydra-usable file once downloaded.
3. **`ssh`/`weechat` now register fixtures too, added preemptively after
   the `ftp` finding (bugs.md entry 1).** Live-test confirmed native `ftp`
   flatly refuses every login (`530 Login incorrect`) unless a matching
   `Shell.addCommandData("ftp", ...)` fixture exists — the real
   `Network.createUser` device account alone was not enough. Since `ssh`
   (`{host, key} -> {ip, status}`) and `weechat` (`{host, password} ->
   boolean`) have the same fixture-shaped surface in `CommandDataMap`,
   M01 now registers both (`ssh` keyed on the broker's real password as
   `key`; `weechat` keyed on the IRC password) rather than waiting to hit
   the same wall twice. **Still needs live-test confirmation**: does
   registering `ssh`'s fixture with `key: <password>` actually make
   `ssh -h user@ip` (password-prompt form) succeed, or does `key` mean
   something else entirely (e.g. a one-shot token/flag value distinct
   from the interactive password)? If `ssh`/`weechat` still fail after
   this fix, that's the next thing to dig into — possibly the real
   syntax uses `-u`/`-p`/`-k`-style flags the same way `ftp` turned out
   to.
4. **New from live-test (bugs.md entry 2): a `Shell.addCommandData`
   fixture is not enough on its own — the port also has to be `active`
   in the real `Network.createSubnetNetwork` `ports` array.** `ftp`
   failed a second time with `No route to host` even after the fixture
   from point 3 was added, because port 21 was never declared on the
   device (only 22/80/443 were). Fixed by adding port 21. **Check
   `weechat` against the same risk**: `WeeChat.createServer(host,
   password)` is its own namespace, separate from `Network.*` entirely —
   unconfirmed whether it needs any port/topology of its own to be
   reachable, or whether `createServer` alone is sufficient. If `weechat`
   also fails to connect, this is the first thing to check.
5. **[UNRESOLVED, highest priority right now] `ftp` still gives `No route
   to host` — now 3 different network shapes tried, all identical.**
   Confirmed NOT a stale-build issue (user verified build/install/restart/
   `mods.reset` all happened correctly each time) and confirmed
   `nmap 203.0.113.90` prints correctly — though that only proves the
   print fixture works, not that a real network device exists. Full
   attempt history in `docs/bugs.md` entry 4. Current (4th) attempt: flat
   top-level `type: Router` with `children: []`, matching
   entity-resolution-mods' own Q01 shape exactly — reasoning: the SDK's
   own doc example uses a LAN-style child IP (`10.0.0.2`), suggesting
   `children` are pivot-only internal hosts, not directly-dialable public
   IPs, which would explain why attempt 3's child (still on a
   public-looking IP) also failed. **Not yet live-tested.** If this ALSO
   fails identically, stop iterating on `Network.*` shape entirely and
   check something outside it next: manifest permissions, whether `ftp`
   only resolves against `Network.registerDomain`-registered hosts (not
   raw IPs), or an SDK/game version mismatch.

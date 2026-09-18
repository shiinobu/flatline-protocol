# FLATLINE PROTOCOL — Bug & Limitation Log

This is the **single** log for every engine/SDK bug, platform limitation, or
native-tool quirk found anywhere in this project — fixed or not. When a new
one is found, add an entry here; do not create a new doc file for it.

Each entry: **Status** (`OPEN` — no fix, workaround only / `WORKAROUND` —
functionally resolved, root cause not fixed upstream / `RESOLVED` — root
cause understood and no longer an issue), where it was found, what happens,
why, and the fix or workaround actually shipped.

---

## 1. Native `ftp` requires explicit `-h`/`-u`/`-p` flags — a bare `ftp <ip>` prints usage only

**Status: RESOLVED (was a missing fixture, not an engine bug)**
Found: M01 live-test, 2026-09-18.

Running `ftp <ip>` alone prints `Usage: ftp -h [host] -u [username] -p
[password]` — the command requires all three flags, not a bare-IP connect
like `nmap`/`lynx`. Confirmed live: `ftp -h <ip> -u <guessed> -p <guessed>`
with a wrong username/password pair fails with a generic
`530 Login incorrect`, indistinguishable from "no fixture registered at
all" — there is no separate error for "this username doesn't exist" vs.
"this mod never registered ftp for this host".

**Root cause (this project's bug, not the SDK's):** M01's storefront page
told the player "anonymous login enabled" but the quest never actually
called `Shell.addCommandData("ftp", {host, username, password}, data)` —
so no username/password combination could ever succeed, regardless of
what the player guessed.

**Fix:** registered a real `ftp` fixture (`M01_FTP_USERNAME`/
`M01_FTP_PASSWORD` = `anonymous`/`anonymous`) in
`src/main/m01-quest.ts`'s `registerM01ShellFixtures()`, and made the
credentials explicit in `internal-ops.html` instead of just implying
"anonymous" without a concrete username/password pair to type.

**Takeaway for future missions:** every native command gated by
`Shell.addCommandData` needs its fixture actually registered before
telling the player a login exists — a page/mail hint alone does nothing
without the matching `addCommandData` call. Double-check this explicitly
for every future FTP/SSH/hydra/weechat use across M02-M04.

---

## 2. `ftp: connect: No route to host` — the real network topology also needs the port open, not just a `Shell.addCommandData` fixture

**Status: RESOLVED**
Found: M01 live-test, 2026-09-18, immediately after fixing entry 1 above.

After registering the `ftp` fixture (entry 1), connecting still failed —
this time with a lower-level `ftp: connect: No route to host`, printed
*before* any username/password check. This is a different failure mode
than `530 Login incorrect`: routing happens first, at the real network
topology level, and only succeeds into a login attempt if the target
actually has that port declared open.

**Root cause:** `Network.createSubnetNetwork`'s `ports` array (the real
device topology, separate from any `Shell.addCommandData` print fixture)
only declared 22 (ssh), 80 (http), 443 (https) — port 21 (ftp) was never
declared as an active port on the device at all, so the engine had
nothing to route the connection to.

**Fix:** added `{ external: 21, internal: 21, active: true, service:
"ftp" }` to the device's real `ports` array in `OnStart()`. Deliberately
**not** added to `M01_NMAP_RESULT` (the separate, manually-authored
`nmap` print fixture) — the FTP share is meant to read as an
undocumented/leaked service the player learns about from the storefront
page, not something a routine `nmap` scan would surface. Confirms these
two are genuinely independent: a real port can be open on the network
without the `nmap` fixture ever mentioning it.

**Takeaway for future missions:** a command needing to *connect* to a
service (ftp/ssh/weechat/anything network-addressed) needs the port
declared **active** in the real `Network.createSubnetNetwork`/
`ChildSubnetDefinition` `ports` array, in addition to whatever
`Shell.addCommandData` fixture handles the login/credential check. The
`Shell` fixture alone is not enough — check both every time a mission
adds a new network-connected tool.

---

## 3. Fixing a network topology bug requires it to live in `OnObjectivesStart`, not `OnStart` — `OnStart` never re-runs for an already-claimed quest

**Status: RESOLVED (design fix, confirmed by the SDK's own doc comment)**
Found: M01 live-test, 2026-09-18 — port 21 (entry 2) was added, rebuilt,
reinstalled, and the player still hit the identical `No route to host`
error with no change at all.

**Root cause:** `Network.createSubnetNetwork` (and `Network.registerDomain`,
`WeeChat.createServer`) were called in `OnStart()`. Per the SDK's own doc
comment on `Quest.OnStart`, this hook runs **exactly once, on first
claim** — it does not run again on a later game restart, even after the
mod is rebuilt and reinstalled. Since the player had already claimed M01
before the port-21 fix, the live network device in their save was frozen
at its original (pre-fix) port list; no amount of rebuilding/reinstalling
the mod could change already-created network state without the hook that
creates it running again.

**Fix:** moved `Network.createSubnetNetwork`/`Network.registerDomain`/
`WeeChat.createServer` from `OnStart()` into `OnObjectivesStart()`, which
the SDK's own doc comment confirms runs "once on claim AND again every
time the game starts." Made idempotent by fire-and-forget
`Network.destroyNetwork(ip)`/`Network.removeDomain(domain)` immediately
before recreating them each time (not awaited, to avoid the
await-before-create mod-context loss risk noted on `Network.createSubnetNetwork`'s
own SDK doc comment). One-time-only content (`Mail.send` of the tip,
`WeeChat.sendMessage` seeding the IRC log) stays in `OnStart()` — those
must NOT repeat on every restart, or the player would get duplicate mail/
chat history each time they reopen the game.

**Takeaway for future missions:** any `Network.*`/`WeeChat.createServer`-
style *topology* setup (things a command needs to exist/route to) belongs
in `OnObjectivesStart()` with an idempotent reset-then-recreate pattern —
never `OnStart()`. Only genuinely one-time *content* (a seeded mail, a
seeded chat line, a one-shot announcement) belongs in `OnStart()`. Get
this right from the first draft of M02-M04, since getting it wrong is
invisible until a fix needs to reach an already-claimed quest.

---

## 4. `ftp: connect: No route to host` — three network-shape attempts, still open

**Status: OPEN — third workaround shipped, not yet confirmed live**
Found: M01 live-test, 2026-09-18.

**Attempt 1 (flat top-level `type: Device`, original implementation):**
failed with `No route to host`.

**Attempt 2:** added port 21 to the real `ports` array (entry 2) — same
error, unchanged. Moved network creation to `OnObjectivesStart` (entry 3)
— same error, unchanged. Confirmed with the user that build/install/
restart *did* happen correctly between every attempt (`npm run build` via
`build-install.ps1`, full HackHub restart, even a `mods.reset
flatline-protocol` at one point) — so this isn't a stale-build artifact.
Also confirmed `nmap 203.0.113.90` prints correctly (22 OPEN, 80 CLOSE,
443 OPEN, matching the fixture) — but this only proves the
`Shell.addCommandData("nmap", ...)` *print* fixture works, which needs no
real network device at all to succeed. It does not prove
`Network.createSubnetNetwork` ever created anything real.

**Attempt 3 (current):** restructured to `Router` wrapping the target as
a `children` entry (a different address, `M01_ROUTER_IP`) — same error,
unchanged, ruling out that specific shape too.

**New theory, from re-reading the SDK's own `SubnetNetworkDefinition` doc
example more carefully:** its example child IP is `10.0.0.2` — a
private/LAN-style address, not a public-looking one. This suggests
`children` are meant for **internal, pivot-only** hosts (reachable only
through the router, e.g. via a NAT/port-forward the player sets up — the
exact mechanic Mission 3's pfSense pivot is built around), not devices
directly dialable by their own IP from the player's terminal. Attempt 2's
child, still keyed on `M01_TARGET_IP` as if it were a public IP, may have
been unreachable for that reason regardless of the wrapping.

**Attempt 4 (current fix, not yet live-tested):** flat top-level
`type: Router` instead of `type: Device` — same fields (`ip`, `users`,
`ports`, `rootFiles`) as attempt 1, plus an empty `children: []` (required
by the `Router` variant's type). This exactly matches
entity-resolution-mods' own working Q01 pattern (`type: Network.Type.Router`,
`children: []`, no SSH/real routing tested there either — so this is a
new data point, not a re-confirmation of something already proven for a
connectable device). `Network.destroyNetwork` in `OnComplete`/`OnAbandon`
reverted to `M01_TARGET_IP` (no separate router address anymore).

**If this also fails identically:** the difference is not `Device` vs.
`Router`, and not the port list, and not the lifecycle hook — at that
point, suspect something outside `Network.*` entirely (a manifest
permission gap despite `"network"` being declared; an SDK/game version
mismatch; or a genuinely different mechanism entirely for how `ftp`
resolves reachability, e.g. only against `Network.registerDomain`-style
hosts and not raw IPs). Report the *exact* command and IP used verbatim
if this happens again — do not assume the fix worked without a fresh
report.

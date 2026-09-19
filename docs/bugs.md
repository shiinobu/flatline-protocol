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

**Retrospective note (2026-09-19), after M01's `ftp` objective was dropped
entirely in favor of a cookie/JWT redesign:** entry 5 below confirms the
real, load-bearing requirement for `Network.createSubnetNetwork` — a
Router with its own dedicated address, wrapping the real target as a
`children` entry — via a completely independent SSH failure hit much
later in the same target IP's history. This was **never actually
confirmed against `ftp` itself** (the mission moved away from `ftp`
before this shape was known), but every attempt logged above used a flat
`Device`/`Router` with no child wrapping, which is exactly the broken
shape entry 5 documents. This is very likely the true root cause of this
entire entry — left OPEN rather than reclassified RESOLVED because it was
never re-tested against `ftp` specifically to confirm.

---

## 5. `Network.createSubnetNetwork` needs a Router-wrapping-child-Device shape for SSH

**Status: RESOLVED**
Found: M01 live-test, 2026-09-19, well after `ftp` (entry 4) was dropped
from the mission entirely.

A flat top-level `type: Router` with `users`/`ports`/`rootFiles` declared
directly on it (`children: []`) accepted the SSH connection attempt at
the terminal level but the actual connection always failed live:
`"Connection to the remote server could not be established."` — even
after confirming a genuinely fresh network (see entry 6) and correct
`nmap`/fixture data.

**Root cause:** the same class of shape problem entry 4 chased for `ftp`
and never resolved. A bare `Router` (or bare `Device`) with everything
declared directly on it, instead of nested under a `children` array, does
not accept live connections — independently rediscovered here for `ssh`,
confirmed against `entity-resolution-mods`' own `docs/bugs.md` entry 18,
which documents the identical symptom and fix for the same SDK.

**Fix:** restructured to a `Router` at a dedicated, never-shown-to-the-
player wrapper IP (`M01_ROUTER_IP`), with the real player-facing target
(`M01_TARGET_IP`) as a `children: [{ type: NetworkDeviceType.Device, ... }]`
entry carrying the actual `ports`/`users`/`rootFiles`. `OnComplete`/
`OnAbandon` now call `Network.destroyNetwork(M01_ROUTER_IP)` (the
Router's address, not the child's) to tear down the whole hierarchy.

**Takeaway for future missions:** never declare a directly-connectable
device (ssh, ftp, weechat, anything the player dials into) as a flat
top-level `Router`/`Device`. Always wrap it: `Router` at its own disposable
IP, target as a `children` entry. Apply this to M02/M03/M04's own
`Network.createSubnetNetwork` calls before their first live-test, not
after hitting the same wall a third time.

---

## 6. `await` before `Network.createSubnetNetwork` in the same handler loses mod context

**Status: RESOLVED (avoided, not directly hit)**
Found: M01, 2026-09-19, while investigating entry 5.

Adding `await Network.destroyNetwork(ip)` immediately before
`Network.createSubnetNetwork` in the same async handler is documented
(independently, in `entity-resolution-mods`' `docs/bugs.md` entry 22) to
make the engine lose track of which mod is calling across the async
boundary, causing `createSubnetNetwork` to fail with a permission error
even when the manifest correctly declares `"network"`.

**Fix:** keep `OnStart`/`OnObjectivesStart` fully synchronous. Any
`Network.destroyNetwork` cleanup call is fire-and-forget (not awaited),
called on the child's *old* top-level address (defensive cleanup of a
stale shape from a prior build), never on the address the current call is
about to create at.

**Takeaway:** never `await` anything ahead of a same-handler
`Network.createSubnetNetwork` call. This applies to every mission, not
just M01.

---

## 7. `WeeChat.createServer`/`sendMessage` are also "left alone" on an existing host — stale message history never refreshes

**Status: RESOLVED**
Found: M01, 2026-09-19.

After changing `WeeChat.sendMessage`'s seeded conversation content and
rebuilding, the in-game IRC channel kept showing only the *old* message
text, repeated once per prior `OnStart` run — new content sent via the
same `WeeChat.createServer(host, password)` + `sendMessage(...)` calls
never appeared, no matter how many times the mod was rebuilt/reinstalled
or the quest reset. Confirmed the connection mechanism itself was correct
(wrong password/host produced the expected `Authentication failed`/
`Cannot reach WeeChat host` errors) — this was specifically a message-
history staleness issue, not a connection bug.

**Root cause:** same "left alone" pattern as `Network.createSubnetNetwork`
(entry 5's SDK doc precedent) — `WeeChat.createServer` on a host that
already exists from a prior `OnStart` run does not reset that host's
message history, so old seeded messages accumulate forever and new
`sendMessage` calls stop taking effect once some threshold is reached.

**Fix:** call `WeeChat.removeServer(host, password)` immediately before
`WeeChat.createServer(host, password)` in `OnStart`, mirroring the
destroy-then-create pattern already used for `Network.*`.

**Takeaway:** any SDK namespace with both a `create*`/`register*` and a
matching `remove*`/`destroy*` function should be assumed to have this
same "left alone" persistence behavior across game restarts — call the
remove function first, every time, rather than assuming a fresh
`create*` call resets prior state.

---

## 8. `Wireshark` does not capture the player's own browser traffic to a public/internet domain

**Status: WORKAROUND (redesigned around it)**
Found: M01, 2026-09-19.

M01's original design expected `Wireshark.Started` (after browsing a
public marketplace site with a cookie already set via `Http.setCookie`)
to let the player "intercept" that cookie off the wire. Live-tested
repeatedly — capturing with no filter, started before and after browsing,
repeated multiple times — and Wireshark never showed any packet at all
for that traffic.

**Root cause (inferred, not confirmed against SDK source):** Wireshark in
this engine most likely only surfaces traffic on networks the player has
pivoted into (matching M03's own design: `Wireshark.Started` is only
meaningful *after* a NAT pivot into an internal VLAN), not the player's
own outbound browser requests to the public internet. The base game's own
official quest (`kimai.py` + Wireshark) most likely relies on the script
itself generating LAN-visible traffic, not a Browser-app page load.

**Fix (workaround, not a real fix):** M01's cookie/session-token discovery
mechanic was redesigned away from Wireshark entirely — the token is now
delivered via a base64-"encrypted" file the player finds and decrypts
with `openssl` (see `docs/mechanics-reference.md`), a mechanic confirmed
against the base game's own official tutorial quest source strings.

**Takeaway:** don't design an objective around Wireshark capturing
Browser-app traffic to a public domain. Only use it for post-pivot
internal/LAN traffic, matching M03's existing pattern.

---

## 9. `Http.Intercepted` never fires without a player-facing proxy UI, which does not exist

**Status: WORKAROUND (redesigned around it)**
Found: M01, 2026-09-19.

`Http.Intercepted` only fires once `Http.setInterceptEnabled(true)` has
been called — the SDK's own doc comment describes this as "the engine
half of a proxy tool," meaning a mod (or the base game) must ship an
actual UI that calls `setInterceptEnabled`/exposes `interceptQueue`/
`interceptForward` to the player. Neither this mod nor (as far as
confirmed) the base game ships such a UI, so `Http.Intercepted` can never
fire from ordinary play regardless of what the mod's own event listeners
do with it.

**Fix (workaround):** abandoned the proxy-interception design entirely
(see entry 8 for what replaced it).

**Takeaway:** don't gate an objective on `Http.Intercepted`/the
`Http.intercept*` family unless the mission also builds and ships its own
proxy inspector UI (a custom `Website`/app exposing `interceptQueue()`
and `interceptForward()`) — the raw SDK functions alone are silent
without one.

---

## 10. The recurring dead-drop contact's email address is never shown to the player anywhere

**Status: RESOLVED (M01 only — M02-M04 inherit the fix by playing after M01)**
Found: M01, 2026-09-19.

`DEAD_DROP_CONTACT.email` (`drop@ashline.void`, from `src/content/
characters.ts`) is used across M01-M04 purely as the `to`-address
validation target in each mission's `Mail.Sent` listener — it is never
sent to the player as a "from" address, never printed in a hint, and
never shown in any mail/website/file content in any of the four
missions. A player would have no in-game way to learn this address at
all.

**Fix:** M01's `OnStart` now sends a short "standing instructions" mail
from this same address (`the Custodian`) alongside the tip mail,
revealing it once, at the start of the whole 4-mission arc. Since M01 is
the first mission in the story's sequence and the contact is explicitly
the *same recurring* contact for all four missions, this reveal is
sufficient for M02-M04 too — no per-mission fix needed, provided the
missions are played in story order.

**Takeaway:** if a later mission is ever made playable independently of
M01 (e.g. a "jump to any mission" dev/QA mode), re-check whether the
player would have seen this address by that point.

---

## 11. `MailTemplateDefinition` has no `to` field — the recipient can never be pre-filled

**Status: WORKAROUND (design constraint, not a bug)**
Found: M01, 2026-09-19.

`MailTemplateDefinition` (`id`, `label`, `title`, `content`, `fields`) has
no field for a default/fixed recipient address. Selecting a registered
mail template pre-fills subject and body (with editable `{{field}}`
placeholders) but the player must always type the `to` address manually,
regardless of which template is used.

**Takeaway:** any objective gated on `Mail.Sent` to a specific address
must ensure the player has some in-game way to learn that address (see
entry 10) — the template mechanism cannot compensate for that by
pre-filling it.

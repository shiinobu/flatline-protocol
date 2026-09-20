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

---

## 12. `sqlmap` SQL_INJECTION detection needs the MariaDB port on the vulnerable device itself, keyed on `version`, not `service`

**Status: RESOLVED**
Found: M02 sqlmap investigation, 2026-09-19, via direct decompilation of
the installed game client (`app.asar` → `dist/assets/index.js`, a single
21.8MB bundle, not split into named chunks — raw byte-offset `grep`
against the `.asar` file plus the `asar` npm package's header parser were
needed to locate and extract it).

`sqlmap -u <url> -tables` kept returning `"No sql-injection vulnerabilities
found"` in an isolated `src/debug/scratch.ts` sandbox no matter how the
officially-documented 3-part recipe (`docs.hotbunny.dev`: vulnerability +
port 3306 + matching `Database.create`) was assembled. Reading the actual
client code (`Sqlmap.ListTables`) revealed the real gate:

```js
const u = s.ports.filter(C=>Et.PortAppliesTo(C,i.lanIp)).find(C=>
  (C.internal===3306||C.internal===5432)
  && (lowercased-first-word-of(C.version) === "mariadb")
  && C.active
);
if (!vulnerabilityFound || !u) return "No sql-injection vulnerabilities found";
```

Two undocumented requirements, confirmed by decompiling the client and by
round-tripping through `Network.getSubnet()`:

1. **The port's gate key is `version` (must lowercase to `"mariadb"`), not
   `service`.** The official docs' worked example uses `service: "mysql"`
   and never mentions `version` — `service` is not read by this check at
   all, even though the SDK's own `NetworkPort` type has carried an
   optional `version?: string` field the whole time (`index.d.ts`).
2. **The port must live on the same device as the vulnerable domain, not
   on its parent Router.** The engine auto-assigns every port's `lanIp` to
   its owning device's own `lanIp` (a Router's own ports all get
   force-set to the Router's `lanIp`). `PortAppliesTo(port, targetLanIp)`
   requires an exact `lanIp` match, so a port declared on a Router can
   only ever satisfy a check against the Router's *own* domain — never a
   nested `children` device's domain, no matter how the vulnerability or
   `Database.create` are configured.

Confirmed via `Network.getSubnet()` round-trip during the investigation: a
port on the Router (`lanIp` auto-set to the Router's own, e.g.
`192.168.1.1`) never matched the child's `lanIp` (e.g. `192.168.1.2`);
the identical port moved to the child's own `ports` array (auto-assigned
the child's own `lanIp`) matched immediately.

**Fix:** in M02 (`src/main/m02-quest.ts`), added `{ external: 3306,
internal: 3306, active: true, service: "mysql", version: "mariadb" }` to
`M02_DEV_IP`'s own `ports` array (not `M02_DEV_ROUTER_IP`'s), plus a
defensive `Network.removePort`/`addPort`/`setVulnerabilities` reconcile
immediately after `createSubnetNetwork` to force the port onto a save
that may already hold a stale pre-fix record from earlier testing (see
entry 3's "left alone" pattern — `createSubnetNetwork` at a pre-existing
address never applies new port/vulnerability data on its own).

This investigation also re-confirms entry 6 with a first direct hit
(previously only avoided defensively, never triggered): adding `await
Network.destroyNetwork(ip)` ahead of a same-handler
`Network.createSubnetNetwork`/`addPort`/`removePort` call reproduced the
exact documented symptom — `Error: [ContentSDK] Mod "null" tried to use
Network.createSubnetNetwork without "network" permission`, with a
correct, verified-identical manifest on both the source and installed
copy. Switching to a fully synchronous `removePort`+`addPort` reconcile
(no `destroyNetwork`, no `await` anywhere in the handler) resolved it
immediately.

**Takeaway for future missions:** any device meant to be `sqlmap`-
vulnerable needs its MariaDB/Postgres port declared directly in that
device's own `ports` array (never its parent Router's), using `version`
(not `service`) as the field the engine actually checks. Apply the same
`removePort`+`addPort`+`setVulnerabilities` defensive reconcile pattern
entry 3/7 already established for any mission whose network topology may
have been live-tested before this fix landed — a corrected
`createSubnetNetwork` call alone is not enough once an address has ever
been created once before.

---

## 13. `john <hash>` only cracks a hash the engine itself generated — a hand-authored hash string can never match

**Status: RESOLVED**
Found: M02 `crackAdminHash` objective, 2026-09-19, immediately after
entry 12's sqlmap fix, via the same `.reverse/app.asar` decompilation
approach (see that entry's local symlink cache).

`john <hash>` kept printing `"The password could not be cracked."` for
`M02_ADMIN_HASH`, a hand-authored constant in `src/content/m02.ts`.
Decompiling the `john` command (`Sqlmap`'s neighbor in the same terminal-
command bundle region) showed it calls `Mq.DecryptPassword(hash)`, which
is a pure registry lookup — `Rm.get(\`hashed_password_${hash}\`)` — not a
real-time hash computation. The registry is only ever populated by
`Mq.EncryptPassword(password)`, and that function is called **only** as a
side effect of the engine auto-generating each device's `etc/passwd` file
from its `users` array (confirmed in the decompiled root-filesystem
builder: every `Network.createUser`-created user on a device gets
`Mq.EncryptPassword(user.password)` called against it unconditionally,
whether or not the player ever reads that file). There is no public SDK
function to register a hash directly — `Mq`/`EncryptPassword`/`GetHash`
are entirely internal, and `Shell.addCommandData("john", …)` is silently
ignored because the `john` command never consults the `Shell` fixture
system at all.

**Root cause:** `M02_ADMIN_HASH` was a hand-typed 63-character string —
not even a valid MD5 length (32 hex chars) — with no relationship to the
password it was supposed to represent. Meanwhile the *real*, engine-
computed hash for `M02_ADMIN_PASSWORD` was already being silently
registered in `Mq`'s registry the whole time, purely because
`M02_ADMIN_USERNAME`/`M02_ADMIN_PASSWORD` are declared as a user on
`M02_DEV_IP` (which every mission already needs, to allow SSH login) —
the mission's own dumped-hash constant just never matched it.

**Fix:** replaced `M02_ADMIN_HASH` with the actual MD5 hex digest of
`M02_ADMIN_PASSWORD` (`f5b8e356551c3c860a671c107e24c2a9`), confirmed by
identifying the engine's hash function (`GCn`) as a bundled, unmodified
MD5 implementation — canonical `_ff`/`_gg`/`_hh`/`_ii` round functions and
their exact standard MD5 magic constants, block/digest size 16 bytes — no
salt, no wrapping transform found. No other code changed: the
`John.DecryptHash` event listener in `m02-quest.ts` already compared
against `M02_ADMIN_HASH`, so correcting the constant alone was sufficient.

**Takeaway for future missions:** any `john`-crackable hash shown to the
player (via a dumped database table, a leaked file, etc.) must be the
**real MD5 of the actual password**, computed independently (`md5(password)`,
plain hex, no salt) — never an arbitrary placeholder string, and never
assumed to need its own explicit "registration" call, since the engine
already registers it automatically the moment the matching
`Network.createUser` password exists anywhere in the world. Sanity-check
every future `*_HASH` constant's length (32 hex chars for MD5) before
shipping — a malformed length is an instant, silent, unfixable-at-runtime
dead end for `john`, indistinguishable in-game from any other "could not
be cracked" case.

---

## 14. `Database.create` is also "left alone" on an existing host — the `getByHost`-then-skip guard hides source changes from an already-created save

**Status: RESOLVED**
Found: M02, 2026-09-19, immediately after entry 13's hash fix — the fixed
hash was confirmed present in both `dist/mod.js` and the installed copy,
but `sqlmap -dump -table admins` still showed the old, malformed hash
live in-game.

**Root cause:** `registerM02Database()` in `m02-quest.ts` had:
```ts
const existing = Database.getByHost(M02_DEV_IP);
if (existing) return existing.id;   // never re-applies new table data
return Database.create({ ...tables with the current M02_ADMIN_HASH... });
```
Once `M02_DEV_IP`'s database was created a single time (from an earlier
test, before the hash fix landed), every later `OnObjectivesStart()` saw
`existing` as truthy and returned early — `Database.create`'s new table
contents were never applied again, no matter how many times the mod was
rebuilt/reinstalled/reset. This is the exact same "left alone" persistence
entries 3 and 7 already documented for `Network.createSubnetNetwork` and
`WeeChat.createServer` — now confirmed for `Database.create` too, and
worse here because the mission's *own* guard clause (`if (existing) return`)
was actively hiding it, not just the SDK's own default behavior.

**Fix:** keep `Database.create` only for the address's first-ever
creation (with an empty `tables: {}`), then unconditionally call
`Database.setTable(databaseId, tableName, rows)` for every table on every
`OnObjectivesStart()` — `setTable` "replace(s) or creates" a table's rows
in one shot, so it forces the current source-of-truth data onto the
database whether it's brand new or years-stale, exactly mirroring the
`removePort`+`addPort` reconcile pattern entry 12 established for
`Network`.

**Takeaway for future missions:** any `X.getByHost`/`X.getByX`-then-
early-return guard written to avoid "recreating" an SDK resource is a red
flag by itself — it will silently freeze that resource's content at
whatever it was on the *first* successful creation, for the lifetime of
the player's save, regardless of later source-code changes. Prefer
"create once (bare), then unconditionally reconcile every field via the
namespace's own idempotent setter" over "create once, then never touch
it again" for `Network.*`, `Database.*`, and `WeeChat.*` alike — assume
every SDK namespace with persistent per-address/per-host state has this
same behavior until proven otherwise.

---

## 15. A player-earned network change (a lifted firewall rule) is just as "left alone"-fragile as mod-authored data — plus a `Firewall` node needs its own `ports` array to be SSH-able at all

**Status: RESOLVED (caught in code review, before live-test)**
Found: M01, 2026-09-20, during the mechanics redesign that added a
`Firewall` child device gating the backend's SSH port (see
`docs/network-plan.md`). Two related mistakes, both in the same new code:

1. **Near-miss re-confirming entry 6/12:** the first draft added `await`
   before `registerM01Network()`'s `Network.destroyNetwork(M01_ROUTER_IP)`
   call, reasoning from the SDK's own `.d.ts` doc comment on
   `createSubnetNetwork` ("await destroyNetwork(ip) first"). That generic
   vendor advice is exactly the thing entries 6 and 12 already falsified
   for this engine version — awaiting loses mod-context across the async
   boundary and fails with a permission error, worse than the "left
   alone" no-op it was trying to avoid. **When a generic SDK doc comment
   conflicts with an empirical finding already logged in this file, this
   file wins.** Reverted to the original fire-and-forget shape.
2. **New finding — player-earned state needs the same reconcile pattern
   as mod-authored data:** `registerM01Network()` runs unconditionally on
   every `OnObjectivesStart()` (entry 3) and always recreates the
   Firewall with its rule blocking port 22 and the backend's port 22 as
   `active: false`, from the static definition. The only code that lifts
   that block is the `Terminal.SSH.Connected` handler for the Firewall's
   IP, gated by `this.Data.firewallBreached` — quest data that, once
   `true`, stays `true` forever. A player who breaches the firewall, then
   restarts before finishing the mission, comes back to a re-blocked port
   with the one handler capable of unblocking it permanently disabled by
   its own already-`true` guard — a genuine soft-lock, not just stale
   data. **Fix:** reconcile already-earned progress unconditionally right
   after `registerM01Network()` in `OnObjectivesStart()`:
   ```ts
   if (this.Data.firewallBreached) {
       Network.removeFirewallRule(M01_FIREWALL_IP, 22);
       Network.openPort(M01_TARGET_IP, 22);
   }
   ```
3. **New finding — a `Firewall`-type node needs its own `ports` array to
   accept a direct connection, exactly like entry 2 established for
   `Device`:** the Firewall had an `ssh` `Shell.addCommandData` fixture
   and `rules` but no `ports` array at all. `rules` governs traffic
   *through* the firewall to its siblings, not connections *to* the
   firewall itself — `ports` is a shared optional field across every
   `ChildSubnetDefinition` variant (`index.d.ts`), not `Device`-only, and
   entry 2's rule applies here too: `ssh` needs `{ external: 22, internal:
   22, active: true, service: "ssh" }` declared directly on the Firewall
   node before the `Shell` fixture can ever be reached.

**Takeaway for future missions:** (a) treat this file as the authority
over generic SDK doc comments whenever the two conflict — check here
first before "fixing" a destroy/recreate call based on vendor docs alone;
(b) any objective-completion handler that flips a persisted `Network.*`
mutation (a removed firewall rule, an opened port, anything not part of
the static `createSubnetNetwork` definition) needs an unconditional
reconcile in `OnObjectivesStart()`, the same way entries 12/14 already
established for mod-authored table/port data — player-earned state is
just as fragile against a destroy-then-recreate as source data is; (c)
any directly-connectable node — `Firewall` included, not just `Device` —
needs its own `ports` array, per entry 2, regardless of node type.

---

## 16. A `.original.ts` backup that imports from the *live* content file breaks the moment that redesign renames anything

**Status: RESOLVED**
Found: M02/M03/M04 mechanics redesign, 2026-09-20, immediately after
writing all six `.original.ts` backup files the same way M01's were
written the day before.

`src/main/m0X-quest.original.ts` (the frozen pre-redesign snapshot) was
written with `import { ... } from "../content/m0X.js"` — the same import
path as the live quest file — because that's what the pre-redesign source
literally said. `npx tsc -p tsconfig.json --noEmit` immediately failed
with `has no exported member named 'M02_WORKSTATION_ROUTER_IP'` (and the
equivalent for M03's `M03_FINANCE_IP` and M04's `M04_ARCHITECT_IP`) — the
constant names the frozen snapshot needs no longer exist in the
just-rewritten live `content/m0X.ts`, because a mechanics redesign is
exactly the kind of change that renames constants.

**Root cause:** a `.original.ts` pair is meant to be a fully frozen,
self-consistent reference — but pointing its import at the live sibling
file makes it silently dependent on that file never changing shape again,
which defeats the entire purpose of keeping it as a backup. `M01`'s own
`.original.ts` pair (written the day before, in the prior session) has
this identical latent bug — it happens not to error *yet* only because
nothing since has removed a name `m01-quest.original.ts` needs, not
because the pattern is actually safe.

**Fix:** every `mNN-quest.original.ts` imports from `../content/mNN.original.js`
(its own sibling snapshot), never `../content/mNN.js` (the live one).
Applied to all four mission pairs (M01 included, as a preventive fix, not
because it was currently erroring).

**Takeaway for future missions:** whenever creating an `.original.ts`
backup pair per `feedback-backup-before-full-rewrite`, wire the quest
snapshot's import to its own content snapshot immediately — don't copy
the live import path verbatim. Verify with a typecheck right after
creating the pair, before starting the real rewrite, so this surfaces
immediately rather than being masked by whatever the rewrite happens to
keep unchanged.

---

## 17. `ssh` can never succeed against a `Firewall`-type node — no `ports`/`rules` combination fixes it; supersedes entry 15's fix

**Status: RESOLVED (design fix — decompiled the real `ssh` command)**
Found: M01 live-test, 2026-09-20, immediately after entry 15's "add a
`ports` array to the Firewall" fix — still failed live with
`"Connection to the remote server could not be established."`, the exact
symptom entry 5 already fixed once for a `Device`.

**Root cause (ground truth, from `.reverse/extracted/index.js`, the real
`ssh` terminal command):**
```js
const _ = Et.GetSubnet(s);
if (!_ || _.type !== Et.Type.Device) {
    throw "Connection to the remote server could not be established.";
}
```
This check runs before `ports`/`users`/`rules` are ever inspected. `ssh`
hard-rejects any target whose `Network.getSubnet(ip).type` is not exactly
`Device` — a `Firewall` node (or `Router`/`Splitter`) can **never** be
SSH'd into, regardless of what `ports` it declares. Entry 15's fix (adding
a `ports` array) was necessary for other reasons but could never have
made the firewall SSH-able; the mission's premise ("SSH into the failover
gateway") was impossible from the start.

**Fix — use the real `pfsense` and `kimai` tools instead of `ssh`:**
1. **pfSense** (`PFSense.Login`/`PFSense.Changes` events) is a real,
   built-in web-admin mechanic with no `type` gate at all — confirmed by
   decompiling its login form (`t.users.find(...)`, no type check) and by
   the base game's own Interpol mission, which runs it against a
   `type: Firewall` node identical in shape to M01's. The Firewall node
   keeps `rules` (blocking) and gets `ports: [{443, https}]` instead of
   `{22, ssh}`; browsing to its IP renders the engine's own pfSense login
   UI, no mod-authored HTML needed.
2. **Kimai** (`python3 kimai.py <ip>`) is a real, catalog-downloadable
   HackDB tool (`Yyt.Kimai`, `file.name === "kimai"`) that — per its own
   decompiled `Run()` — only works `if (subnet.type === Firewall)`, fires
   a burst of 10 harmless "PayloadRequest" noise packets over Wireshark,
   and leaks a signed JWT of that Firewall node's own `users[0]`
   credential with a 5%/iteration chance, guaranteed by the 10th
   iteration. This replaces an entire planned cookie-theft/XSS mechanic
   with something already shipped and tested by the base game.

**Verification note:** while live-testing Kimai against a scratch
`Firewall` node, `Network.getSubnet()` briefly returned the node right
after creation and then `null` seconds later with no restart in between —
traced to `mods.reset`, not to this fix (see the
`feedback-mods-reset-races-fresh-networks` memory). A plain rebuild +
restart reproduced the full success chain
("Target detected as firewall" → "Package received!" → "Payload
completed") every time.

**Takeaway for future missions:** never assume a terminal command works
uniformly across `NetworkDeviceType` values — `ssh` is `Device`-only,
`pfsense` is type-agnostic (keys off `users`), `kimai` is `Firewall`-only.
When a command's type-gating isn't documented, decompile the real command
class (`.reverse/extracted/index.js`) instead of inferring it from
symptoms or from another command's behavior.

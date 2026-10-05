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
with `openssl` (see `docs/mechanics.md`), a mechanic confirmed
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
`docs/network.md`). Two related mistakes, both in the same new code:

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

---

## 18. `subfinder` never lists a domain living on an address that gets a same-tick `destroyNetwork`+`createSubnetNetwork` — fire-and-forget destroy is now dev-only

**Status: WORKAROUND (dev/tester split, not a root-cause engine fix)**
Found: M01 tester feedback, 2026-09-21 — `subfinder -d blackwire-network.mkt`
(the bare root domain) always returned "No subdomains found", while
`subfinder -d www.blackwire-network.mkt` correctly found itself. `nslookup`
resolved both correctly, which is what made this confusing — `nslookup` is
a `Shell.addCommandData("nslookup", record.name, record.ip)` static fixture
(`m01-quest.ts`) with zero dependency on real `Network` state, so it kept
"working" even while the underlying subnet was gone.

**Root cause (ground truth, from `.reverse/extracted/index.js`, the real
`subfinder` command):**
```js
async Exec(n) {
    if (!Ki().Network.find(h => h.domain?.name === n)) {
        const h = tr.number(3e3, 6e3);
        return await this.sleep(h), { subDomains: [], timeout: h };
    }
    const s = Ki().Network.filter(h => h.domain?.name.endsWith(n));
    ...
}
```
It does a flat exact-match scan over `Ki().Network` first; if that fails,
it returns empty immediately — it never gets to the `endsWith` filter that
would list real subdomains. This only succeeds if some `Network` entry's
`.domain.name` is *exactly* the queried string at the moment of the query.

`registerM01Network()` fires `Network.destroyNetwork(M01_FRONT_ROUTER_IP)`
(and the other two routers) without awaiting it — correctly, per entries 6/
12/15, since awaiting it breaks mod-context and throws a permission error,
which is strictly worse. But `destroyNetwork` is genuinely async
(`Promise<boolean>`, worker/`postMessage`-based per the decompiled
engine). Because it's fire-and-forget, the synchronous
`createSubnetNetwork` immediately after it is guaranteed to run *before*
the destroy resolves (JS can't interleave a pending microtask into an
already-running synchronous call stack) — so on any run where that address
already held a network (i.e. every run except the very first), the create
is a "left alone" no-op (entries 3/6/15) and `registerDomain` attaches the
domain to the *pre-existing* node. Then, some indeterminate time later
(after `OnObjectivesStart()` has already returned), the earlier
fire-and-forget destroy finally resolves and tears down that same router —
wiping the domain that had just been reconciled onto it a moment before.
A player who runs `subfinder` a few seconds after mission start (the
realistic case, not an edge case) queries after the delayed wipe has
already happened. `www.blackwire-network.mkt` survived in testing because
its own record is a bare standalone `Device` with no `children`/
`rootFiles` to tear down, so its own fire-and-forget destroy resolves
fast enough to rarely lose this race in practice.

**Why this isn't "just await it" (again):** entries 6/12/15 already
falsified that fix for this engine build — it trades a domain-discovery
gap for a hard permission-error crash, which is worse. The generic SDK
`.d.ts` doc comment recommending `await destroyNetwork(ip)` first does not
apply here; per entry 15, this file's empirical findings win over that
comment for this project.

**Fix — stop destroying these addresses outside of active development:**
added `isDev` (from `src/guard/flags.ts`) as a guard around every
same-tick `destroyNetwork` call that immediately precedes a
`createSubnetNetwork`/`registerDomain` at that same address:
`m01-quest.ts` (`registerM01Network`'s 3 router destroys, plus the
per-domain `record.needsSubnet` destroy in the `M01_DOMAIN_RECORDS` loop),
`m03-quest.ts` (`registerM03FinanceVlan`'s `M03_PFSENSE_IP` destroy),
`m04-quest.ts` (`registerM04Network`'s `M04_ARCHITECT_VPN_IP` destroy).
`M02_ROOT_IP`/`M02_DEV_ROUTER_IP`/`M02_DEV_SUBDOMAIN` and
`M03_SKYNET_IP` were already create-only in `OnObjectivesStart()` (their
only `destroyNetwork` calls live in `teardown()`/`OnComplete`/`OnAbandon`,
a different lifecycle point with no same-tick race), so they needed no
change. With `isDev=false` (tester/production builds), these addresses are
created exactly once and never torn down again — `createSubnetNetwork`'s
own "left alone" no-op behavior makes every later `OnObjectivesStart()`
call safe and idempotent, and the domain/port/rule reconcile calls that
already run unconditionally every load (entries 3/7/12/14) keep mutable
state fresh without ever touching `destroyNetwork`.

**Trade-off accepted — read before restructuring any network topology
post-release:** with `isDev=false`, `createSubnetNetwork` can never apply
a structural change (a new/removed `children` entry, a changed `ports`
list, a renamed device) to a save that already has a network at that
address. If a released version's network topology (not just mutable
fields like ports/domains/rules, which already reconcile unconditionally)
ever needs to change post-launch, that change will silently never reach
players who already progressed past that mission on an earlier build —
there is currently no version-gated migration path for this. `isDev=true`
sidesteps this by always tearing down and rebuilding, which is exactly why
it stays on for active development and off for anything shipped to
testers or players.

**Takeaway for future missions:** never add a `destroyNetwork` call
immediately before a same-address `createSubnetNetwork`/`registerDomain`
in `OnObjectivesStart()` without gating it behind `isDev` — it does not
fail loudly like the await mistake (entries 6/12/15) does, it fails
silently and intermittently, hours or missions later, in a way that looks
like an unrelated tool (`subfinder`, `net_tree.py`) is broken.

---

## 19. `Files.create()` (and other permissioned SDK calls) only keep mod identity inside a `Command.Run()` or an `Events.on()` handler — every other invocation path loses it to `Mod "null"`, including the SDK's own "safe" async hooks

**Status: RESOLVED (real fix found — `Events.emit`/`Events.on` bridge)**
Found: `src/debug/scratch.ts`, 2026-09-21, while investigating whether `ftp`
could hand a player a real downloadable wordlist file for a hydra-crack
step (M01 SSH-credential-discovery gap). Six invocation paths for
`Files.create()` were tried, live-tested one at a time via the HackHub log
(`%APPDATA%/hackhub/logs/hackhub-<date>.log`, `[FP][...]` lines), not
guessed:

| # | Where `Files.create()` was called | Result |
|---|---|---|
| 1 | Fire-and-forget `void (async () => {...})()` inside `OnObjectivesStart()`, placed *after* all `Network.*` setup | `Mod "null" tried to use Files.create without "filesystem" permission` — despite `"filesystem"` already being declared in `manifest.json` |
| 2 | `async OnStart()` — the one lifecycle hook the SDK's own `.d.ts` explicitly types as `void \| Promise<void>` | Same `Mod "null"` error, first call |
| 3 | `rootFiles` on a synchronously-created `Device` (no `await` anywhere) | No permission error, but the built-in `ftp` command's own `Ur.GetById(fixtureData)` returned nothing for that ID — see below |
| 4 | Custom `@RegisterCommand`-registered `Command`'s own `async Run(tools)` | **Worked. Real file created, no error.** |
| 5 | `Website.Exports` function invoked by an `onclick` in the page's own HTML (a genuine player click, re-tested twice in fully isolated scratch files to rule out confounds) | Same `Mod "null"` error, reproduced 3 times cleanly |
| 6 | `Website.Exports` function that only does a synchronous `Events.emit("some.event")`, with the actual `await Files.create(...)` moved into a **top-level `Events.on("some.event", async () => {...})` handler** (registered once at module load, not inside any class/lifecycle method) | **Worked. Real file created, confirmed via log `SUCCESS` lines across multiple repeated clicks.** |

**Root cause (inferred from the pattern, not decompiled — the minified
engine bundle doesn't expose whatever internal "current mod" tracking
causes this):** permission checks on SDK calls like `Files.create`
resolve the calling mod's identity from *how the call was dispatched*,
not from which module's code is executing. The two invocation shapes that
work (`Command.Run()`, and an `Events.on()` callback fired by
`Events.emit()`) are both cases where the **engine's own dispatcher**
directly invokes the mod's function fresh, callback-style. Every failing
shape — a detached `async` IIFE, `OnStart()`, and a `Website.Exports`
function reached across the page's iframe/sandbox boundary — is a case
where *our own code* (or a cross-boundary bridge the engine doesn't
attribute to us) is what resumes execution after a suspension point,
and that resumption doesn't carry mod identity with it. This generalizes
entries 6/12/15 (which only ever tested this for `Network.createSubnetNetwork`
specifically) to every permissioned namespace, and disproves the
implicit assumption that `OnStart()`'s `Promise<void>`-typed signature
makes it a safe place to await SDK calls — it does not, empirically.

Entry 3's `rootFiles` result is a **separate, unrelated finding**, not
the same bug: it fully avoids the permission error (no `await` at all),
but the built-in `ftp` command's own decompiled `Run()`
(`.reverse/extracted/index.js`) does a flat `Ur.GetById(fixtureData)` —
the same generic-purpose ID space `Files.create()`/`Files.getById()` use
for the player's own local filesystem, not the per-device nested tree
`rootFiles` populates. A device's own filesystem (browsable once you
`ssh` into it) and the flat `Ur` store `ftp`'s fixture reads from are two
different data structures; an IP address is not a valid `Ur` id no matter
how the device was created. This means `ftp`'s own file-delivery
mechanism is unusable by mods on this engine build regardless of the
`Files.*` permission issue — there is no known way to populate the exact
ID shape it reads.

**The fix — route real file creation through the `Events` bridge:**
```ts
Events.on("mymod.some-download", async () => {
    const folder = await Files.create({ name: "...", isFolder: true, parentPath: "/" });
    await Files.create({ name: "...", extension: "...", parentPath: "/...", data: "..." });
});
```
called from wherever the player-facing trigger lives (a `Website.Exports`
function, an `this.Events.on(...)` handler, anywhere) via a plain
synchronous `Events.emit("mymod.some-download")` — never `await` the
`Files.*` call directly at the trigger site itself.

**Takeaway for future missions:** any mod code that needs to create or
write a real file (`Files.create`, `Files.createTree`, and probably
`Database.create`/`Network.createSubnetNetwork` too, though those already
have their own established safe patterns per earlier entries) must do so
either inside a custom `Command`'s own `Run()`, or inside a top-level
`Events.on()` handler reached via `Events.emit()` — never inside a quest
lifecycle hook (sync or async), never inside a detached promise, and
never inside a `Website.Exports` function directly. When a generic AI
suggestion (Gemini, ChatGPT, etc.) proposes an SDK API by name, verify it
actually exists in `node_modules/@hotbunny/hackhub-content-sdk/index.d.ts`
before writing any code against it — `EventSystem.emit`/`EventSystem.on`
was suggested and does not exist anywhere in this SDK; the real API
(`Events.emit`/`Events.on`, a documented cross-mod pub/sub) happened to
make the *same underlying idea* work, but only after checking the actual
type declarations instead of trusting the suggested names.

---

## 20. `Website` `metadata()` can never read `SaveStorage` at all, and only sees `Variables`/`Storage` when they were written from a real game-event listener — not from a quest lifecycle hook's own body

**Status: RESOLVED (real fix found — mirror through a `this.Events.on()` game-event listener, not a direct write)**
Found: `src/debug/scratch.ts`, 2026-09-22, while investigating whether a
`Website`'s `DynamicWebsitePageDefinition.metadata()` could read state a
`Quest`'s `OnStart()`/`OnObjectivesStart()` had set — the mechanism the
planned M01 "per-claim listing randomization" feature depends on (which
of 10 candidate listings is the real one, resolved once and read back by
that listing's own page). Live-tested step by step via the HackHub log
(`%APPDATA%/hackhub/logs/hackhub-<date>.log`), not guessed:

| # | Where the value was written | Where it was read | Result |
|---|---|---|---|
| 1 | `SaveStorage.set()` inside a `Website.Exports` function body | `metadata()`, same site | Write logged fine, read always `(none)`, even across multiple reloads minutes apart |
| 2 | `SaveStorage.set()` inside a top-level `Events.on()` handler, triggered via `Events.emit()` from `Exports` | `metadata()` | Same failure. Also tested: a plain `@RegisterCommand`'s `Run()` reading the *same* key **succeeded** (`Command.Run() read SaveStorage: VALUE-ILqI1Y`, matching the write) — proving `SaveStorage` itself was fine, and the read failure was specific to `metadata()` |
| 3 | Same `Events.on()` handler, now also writing `Storage` (global) and `Variables` (in-memory) alongside `SaveStorage` | `metadata()` | `metadata()` read `Storage` and `Variables` back correctly; `SaveStorage` alone stayed `(none)`. `metadata()` is not blind to all mod state — only to `SaveStorage` specifically |
| 4 | `Variables.set()` called directly inside `Quest.OnObjectivesStart()`'s own body (mirroring an existing `SaveStorage` value) | `metadata()`, and later a plain `Command.Run()` | Both failed — `Command.Run() read SaveStorage=VALUE-FxOB3V Variables=(none)` despite `OnObjectivesStart()` having just logged "mirrored to Variables" with that exact value. The failure travels with *how the write was triggered*, not with who reads it |
| 5 | Same write function, called instead from a `@RegisterCommand`'s `Run()` (a player-typed terminal command) | `metadata()` | **Worked.** Read back correctly and stayed consistent across 6+ separate page reads |
| 6 | `OnObjectivesStart()` doing `Events.emit("custom.trigger")`, with the actual write in a top-level `Events.on("custom.trigger", ...)` handler (the exact bridge pattern that fixed entry 19) | `metadata()` | Still failed. This is a *different* bug shape from entry 19 — routing through the `Events` bridge does not help here |
| 7 | `OnObjectivesStart()` registering `this.Events.on("Terminal.Nslookup", () => { ...write... })` (the same `QuestEvents` subscription mechanism every other M01 gate already uses, e.g. `domainResolved`) — write only actually runs later, whenever the player runs a real `nslookup` that resolves | `metadata()` | **Worked.** `this.Events(Terminal.Nslookup) mirrored to Variables: VALUE-gq3tbn` followed by `metadata() read Variables: VALUE-gq3tbn`, consistently |

**Side finding while building attempt 7's trigger:** the built-in
`nslookup` command's decompiled `Run()` (`.reverse/extracted/index.js`)
only calls `Ot.Trigger("Terminal_Nslookup", ...)` on its two *success*
branches; the `"No results found."` failure path returns before
triggering anything. A `this.Events.on("Terminal.Nslookup", ...)`
listener will never fire for a domain with no `Network`/`Shell` fixture
behind it — confirmed live: `nslookup fuck.com` and `nslookup` on an
unregistered scratch domain both printed "No results found." and left
zero trace of the listener firing, until a real `Shell.addCommandData("nslookup", ...)`
fixture was added for it.

**Root cause (inferred, not decompiled — same caveat as entry 19):**
`metadata()` appears to execute in a context that never gets attached to
`SaveStorage`'s per-save backing store at all (no invocation path tried
made it work), and only gets attached to `Variables`/`Storage`'s state
*after* that state has been written by the engine's own event dispatcher
calling directly into a `Command.Run()` or a real `QuestEvents`
(`this.Events.on`) callback. A quest lifecycle hook's own synchronous
body — even though it is also "the engine calling our code directly" in
the same sense entry 19 relied on — runs too early in that lifecycle for
whatever attaches `metadata()`'s context to be ready yet; deferring the
actual write to a *later*, real, player-triggered game event sidesteps
that window entirely. This is a different failure shape from entry 19
(which was about permission/identity on `Files.*`, fixable with *any*
`Events` bridge) — here the generic mod-to-mod `Events.emit`/`Events.on`
bridge does not help at all; only a genuine `QuestEvents` game-event
callback does.

**The fix — never write `SaveStorage` for something `metadata()` needs
directly inside a lifecycle hook; defer through a real game-event
listener, and mirror into `Variables` for `metadata()` to read:**
```ts
override OnObjectivesStart() {
    this.Events.on("Terminal.Nslookup", () => {
        let value = SaveStorage.get<string>(KEY);
        if (!value) {
            value = Random.pick(candidates);
            SaveStorage.set(KEY, value);   // survives save reload
        }
        Variables.set(KEY, value);          // what metadata() actually reads
    });
}
```
`SaveStorage` stays the persistent source of truth (safe to read/write
from `Command.Run()`, `this.Events.on()` callbacks, and quest lifecycle
hooks alike); `Variables` is a same-session read-side cache that
`metadata()` can actually see, re-synced every time the mod loads because
the listener re-registers on every `OnObjectivesStart()`. Pick a trigger
event that is guaranteed to fire before the player could reach any page
that needs the resolved value — for M01, the existing `Terminal.Nslookup`
listener on `M01_DOMAIN` (already gating `domainResolved`, already the
very first recon step) is a natural, no-extra-mechanic place to piggyback
this on.

**Takeaway for future missions:** any design where a `Website` page's
`metadata()` needs to reflect state a `Quest` resolved must go through
`Variables` (or `Storage`, if it should persist across every save file
instead of just this one), never `SaveStorage` directly — and that
state must be *written* from a real `this.Events.on()` game-event
callback, never from a lifecycle hook's own body and never from a
generic `Events.emit()`/`Events.on()` bridge alone. Verify this pattern
live in `scratch.ts` again if a future mission needs the reverse
direction (a `Website` writing state a `Quest` reads), since that has
not been tested and may hit its own version of this same class of bug.

---

## 21. A structural network topology change (new child on an existing router, a device moved from standalone into a router's `children`) never reaches an already-progressed save — confirmed live, extends entry 18

**Status: RESOLVED (workaround — new addresses, not destroy/await tricks)**
Found: M01 tester feedback, 2026-09-22, during the router-consolidation
redesign (folding each marketplace's storefront/gateway/legacy boxes under
one dedicated `Router` per domain instead of standalone top-level
devices).

After the redesign shipped, `python3 net_tree.py <ip>` reported `"Subnet
not found."` for `M01_FROSTGATE_IP`/`M01_OBSIDIAN_IP` (both moved from a
standalone top-level `Device` into a new router's `children`), and later —
after temporarily flipping `isDev=true` to try to force a rebuild — for
`M01_BLACKWIRE_ROUTER_IP` itself too (an address that already existed
under its old name `M01_FRONT_ROUTER_IP`, now with a third `children`
entry, the gateway box, added to its definition).

**What was tried and correctly rejected:** `await`-ing the fire-and-forget
`Network.destroyNetwork(ip)` immediately before the matching
`createSubnetNetwork(ip)` call, to force the destroy to finish before the
recreate. Not attempted, per entries 6/12/15's already-confirmed finding
that this crashes with `Mod "null" tried to use Network.createSubnetNetwork
without "network" permission` — and since `registerM01Network()` runs
synchronously at the top of `OnObjectivesStart()`, a throw there would
also abort every `this.Events.on(...)` registration later in the same
function body, breaking the whole quest's event wiring for that session,
not just the network.

**Root cause — this is entry 18's own explicitly-flagged trade-off,
confirmed live for the first time:** entry 18 already documented that
`isDev=false` makes `createSubnetNetwork` permanently unable to apply a
*structural* change (a new/removed `children` entry, a device moved
in/out of a router) to an address that already holds a network, and noted
`isDev=true` "sidesteps this by always tearing down and rebuilding." That
sidestep does not actually work as hoped: `isDev=true` re-enables the
same-tick `destroyNetwork`(fire-and-forget)-then-`createSubnetNetwork`
race entry 18 itself documents. The synchronous `createSubnetNetwork`
call runs before the destroy resolves, sees the address still occupied by
the *old* network, and is a "left alone" no-op; the destroy then resolves
moments later and tears down that same (old, never-replaced) network —
so the steady-state result of an `isDev=true` reload, once the async dust
settles, is the address left **empty**, not rebuilt with the new
structure. This matches "every run except the very first" from entry 18
exactly: an address with prior history can never cleanly pick up a
structural change, whether `isDev` is on or off.

**The fix — assign the changed node(s) a brand-new IP address, never used
in any prior build, instead of trying to migrate the old one:**
a genuinely new address has no "already holds a network" history
anywhere (in any player's save, old or new), so `createSubnetNetwork`
succeeds as a clean first-ever creation immediately, with no race and no
"left alone" freeze. Applied to all six addresses whose shape changed this
redesign — `M01_BLACKWIRE_ROUTER_IP`, `M01_BLACKWIRE_GATEWAY_IP`,
`M01_FROSTGATE_IP`, `M01_FROSTGATE_GATEWAY_IP`, `M01_OBSIDIAN_IP`,
`M01_OBSIDIAN_GATEWAY_IP` — including the router itself, since gaining a
*new* `children` entry is just as much a structural change as being moved
into one. The two brand-new router addresses created earlier the same
session (`M01_FROSTGATE_ROUTER_IP`, `M01_OBSIDIAN_ROUTER_IP`) needed no
change, since they had no prior history to begin with. LAN IPs
(`192.168.x.x`) did not need to change — they are scoped to their own
subnet, not a global address registry, so reusing a LAN range under a new
public IP carries no collision risk.

**Takeaway for future missions:** whenever a mission's network topology
changes *structurally* after it has already been live-tested or shipped
(a new/removed child, a device moved between routers, a device promoted
from standalone into a router's `children`), do not rely on `isDev` +
`destroyNetwork` to migrate an already-progressed save — it cannot, per
entry 18, and re-confirmed here that `isDev=true` does not actually
rescue it either due to the same race. Give the changed node(s) a fresh
IP address instead, and treat that as the standard migration path for any
future `Network.createSubnetNetwork` shape change, not just a one-off
workaround for this session.

---

## 22. `Localization.t()` returns the raw key (not even the English fallback) when called from inside a `Website`'s `metadata()` — extends entry 19's identity-loss pattern to a new API

**Status: RESOLVED (workaround — pre-resolve strings from a trusted context, cache them, read the cache from `metadata()`)**
Found: M01 Phase 2 (website localization), 2026-09-23, while wiring `Localization.t()`
calls into `src/websites/shared/localize.ts` (a `{{t:KEY}}` token replacer meant to
run inside every page's `metadata(context)`) and into `m01-listing-templates.ts`'s
`renderM01ListingPage()` (also called from a website's `metadata()`).

Live-tested step by step, not guessed:

| # | Where `Localization.t()` was called | Key used | Result |
|---|---|---|---|
| 1 | `Command.Run()` (`scratchloc`) | a fresh test key registered in the same command file | Correct, matched `Localization.language()` |
| 2 | `Quest.OnObjectivesStart()`'s own body (temporary trace) | `M01_I18N_KEY.MAIL_TIP_SUBJECT` | Correct — `language()` and `t()` both returned live `"zh"`/Chinese text |
| 3 | `Website`'s `metadata(context)` (a debug banner rendered directly on the page, so no log access needed) | `Localization.language()` | Correct — returned `"zh"` |
| 4 | Same `metadata(context)` call, same page load | `"M01.MAIL.TIP.SUBJECT"` — the **exact same key** already confirmed working in row 2 | **Wrong — returned the literal string `"M01.MAIL.TIP.SUBJECT"`**, the documented "nothing has it at all" fallback, not even the English text |

Row 3 vs row 4 is the key result: `Localization.language()` (no mod-identity
lookup needed, just reads a global player setting) works fine from
`metadata()`. `Localization.t()` (which per its own docs is "scoped to the
mod that registered them") does not — for a key **already proven registered
and resolvable** from `Command.Run()`/`Quest` lifecycle contexts. This rules
out every registration-side explanation that was checked first and
falsified along the way: stale `dist/` build (ruled out — confirmed fresh
manual build+copy), an orphaned/never-imported i18n module (a real,
separate bug that was found and fixed this session, but fixing it did not
change this result), and lazy/dead-code-eliminated `registerAll()` calls
(ruled out by reading the actual bundled `dist/mod.js` — every
`Localization.registerAll()` call for the new i18n files was present,
correctly formed, and positioned in plain top-to-bottom eager execution
order, no lazy wrapper).

**Root cause (inferred, not decompiled — same caveat as entries 19/20):**
this is the same failure class as entry 19's `Files.create()` finding —
`Localization.t()`'s per-mod key lookup only keeps working "mod identity"
inside a `Command.Run()` call or a real `QuestEvents` (`this.Events.on`)
callback (and, newly confirmed here, a quest lifecycle hook's own
synchronous body — see entry 20's `OnObjectivesStart` finding, which
`Localization` does not seem to share the *narrower* restriction that
entry 20 found for `SaveStorage`/`metadata()` specifically). A `Website`'s
`metadata(context)` callback is a *different* invocation path the engine
calls into directly, and per this finding it is **not** one of the paths
that preserves whatever internal state `Localization.t()`'s mod-scoped
lookup depends on — even though `SaveStorage`/`Variables`/`Random` (used
by `ensureM01ListingResolution()`, called from this exact same
`metadata()` path for the SOLD_LOTS random-listing feature) demonstrably
do carry over correctly. The failure is specific to `Localization`, not a
blanket "metadata() is a sandboxed/isolated realm" issue.

**The fix — never call `Localization.t()`/`.language()`-dependent lookups
directly inside `metadata()`; pre-resolve into a plain cache from a
trusted context, and read the cache instead:**
```ts
// Inside Quest.OnObjectivesStart() (a trusted context, confirmed above) —
// resolve every website string once per load and cache it where metadata()
// can read it (Variables, same as entry 20's SaveStorage->Variables mirror):
const M01_SITE_STRINGS_KEY = "m01.siteStrings";
const cache: Record<string, string> = {};
for (const key of allSiteKeys) cache[key] = Localization.t(key);
Variables.set(M01_SITE_STRINGS_KEY, cache);

// Inside localizeHtml() / any metadata(), read the cache instead of
// calling Localization.t() directly, and do {{var}} substitution locally
// (the cache holds resolved-but-not-yet-interpolated template strings):
const cache = Variables.get<Record<string, string>>(M01_SITE_STRINGS_KEY) ?? {};
const resolved = (cache[key] ?? key).replace(/\{\{(\w+)\}\}/g, (_m, v) => String(vars?.[v] ?? ""));
```
This mirrors entry 20's already-proven pattern exactly (persist from a
trusted write path, read a `Variables` mirror from the read path that
can't be trusted to do the lookup itself) — just applied to
`Localization` instead of `SaveStorage`.

**Takeaway for future missions:** treat `Localization.t()`/`.language()`
the same as `Files.create()` (entry 19) for identity purposes — safe only
inside `Command.Run()`, a real `QuestEvents` callback, or a quest
lifecycle hook's own body. Never call it directly from a `Website`'s
`metadata()`, `DynamicWebsitePageDefinition`, or any other
engine-invoked-but-not-yet-tested path without live-confirming it first
the way this entry did (a known-good key, called from the new path,
compared against a call site already proven to work).

---

## 23. `WeeChat.createServer()` triggers a base-game `console.log` that prints the IRC host+password in plaintext — no way to suppress from mod side

**Status: OPEN (engine limitation, no workaround possible from mod code)**
Found: M01 live-test, 2026-09-22.

Every call to `WeeChat.createServer(host, password)` — in M01 this fires every
`OnStart()` (every quest apply/reset) — triggers a `console.log("CreateServer",
host, password)` baked directly into the base game's own client code
(`Lx.CreateServer`, decompiled `index.js:165932`), not the SDK wrapper. Anyone
with DevTools open sees the IRC credentials in plaintext, bypassing the
OSINT/decode puzzle the mission is built around.

**Root cause:** base game engine instrumentation, not a mod or SDK-wrapper
bug — cannot be patched or suppressed from content-mod code.

**Mitigation considered:** reduce call frequency (check if the server already
exists before `removeServer`+`createServer`) — reduces how often it re-logs,
but does not eliminate the leak on first creation. Not implemented;
documented as a known, accepted limitation of the WeeChat feature for any
future mission using it.

---

**Numbering note:** entry 24 (HackHub 1.3.13 `--mod-dev` live-reload
discovery) is recorded on local `main` (commit `ed17195`) and lands here when
`clouds-modify` merges. Entries 25+ below skip 24 on this branch on purpose,
so the merge needs no renumbering.

---

## 25. `hydra -l` is optional and the engine defaults it to `guest` — an unmatched `{user, target}` fixture prints only a generic "Could not connect to the server."

**Status: RESOLVED (M3 registers the fixture under the default user as well)**
Found: M3 live-test (pass 2), 2026-09-29, checked against the live
`app.asar` (1.3.13, `dist/assets/index.js`, the `hydra` command class).

What the client does: `let user = GetParameterValue("l") ?? "guest"`, and its
own usage string reads `-l [login username (optional)]`. `-T` must be
`ip:port` (a target without a port only prints usage). The fixture is looked
up with `gd.GetCommand({ command: "hydra", input: { user, target } })`, a
deep-equal match on the whole object — object inputs are not lowercased, so
`-l Admin` does not match a fixture registered for `admin`. On a hit it runs
the animation and prints `credentials.username`/`password` **from the
fixture**; nothing compares that username with the `-l` value. On a miss it
prints the banner and `Could not connect to the server.` — the very same
message as a wrong IP or port, so it never hints that the username was the
problem. `Terminal.Hydra.Try` fires before the lookup and carries no
username, so a mission cannot react to a wrong guess either.

The base game's own quests register their hydra fixtures with `user: "guest"`,
so its players never need to know a username.

What M3 did wrong: it registered only `{ user: "admin", target:
"77.83.142.6:80" }` (plus a bare-IP twin that can never match, because `-T`
always contains a port), and `admin` never appeared anywhere a player could
see it (no mail, `lynx` result, Twotter post, page or `nmap` line). A player
who ran `hydra -T 77.83.142.6:80 -P wordlist.lst` got the generic error and had
nowhere to go; `m03-playtest.md` also wrongly claimed the default user is
`root`.

**Fix:** the fixture is now registered under both `guest` (the engine
default, so a bare `hydra -T ip:80 -P wordlist.lst` succeeds and the result
table itself reveals `admin`) and `admin` (an explicit `-l admin` still
works). Both return the same `admin` credentials. The dead bare-IP fixture is
no longer registered (its removal stays in the reset path so stale saves are
cleaned).

**Takeaway for future missions:** key a hydra fixture on `guest` whenever the
player is not meant to already know the username, and let the success table
reveal the real one; only key on a specific username when an in-world lead
delivers it before the gate (M1's vendor name is the model). Never rely on
the player guessing a "standard" default.

---

## 26. `rootgrab` needs an explicit `/etc/passwd` path and a `root` user on the target — a device without `root` fails with "Root user not found!"

**Status: RESOLVED (Vault-Line gained a `root` user; pending live confirmation)**
Found: M3 static review against the client, 2026-09-29.

`rootgrab` is not a bare command: the client implementation requires exactly
one argument, `rootgrab </path/to/passwd>`, and that file must be the
engine-generated, hashed `passwd`. It then resolves the device's subnet and
looks for a user named `root` (`users.find(u => u.username === "root")`);
without one it throws `Root user not found!` and `Metasploit.Rootgrab` never
fires. `Network.createSubnetNetwork` does not add `root` for you — the mod
bridge maps only the `users` you pass, and the engine's `/etc/passwd` builder
writes a line per given user except `root` (which is hashed but skipped) — the
SDK's `Network.createDefaultUserSchema()` exists precisely for callers that
want `root` + `guest` added. M4's C2 declares `root` explicitly; M3's
Vault-Line declared only `svc-vpn`, so the "root the gateway" step could
never produce its event.

**Fix:** `Network.createUser({ username: "root" })` added next to the online
`svc-vpn` user (the exploit still picks `svc-vpn`, the first `online` or
`guest` user). The step is optional for completion — the report gates only on
capture, ledger and config (it also needed the reverted rule until
2026-09-29, `bugs.md` #31) — and only feeds a BACKTRACE log line.

**Takeaway:** any device a mission expects to be `rootgrab`-ed needs an
explicit `root` user; the player-facing command is `rootgrab /etc/passwd`.

---

## 27. `nmap` and Metasploit resolve targets by *public* IP only — a LAN IP works only while SSH'd inside that network; devices behind a Splitter are found with `python3 net_tree.py`

**Status: WORKAROUND (content now supplies public IPs; behavior is engine design)**
Found: M3 static review against the client, 2026-09-29.

`nmap` looks the target up with `GetSubnet(ip)`, which matches a node's
public `ip`. A `192.168.1.x` address is resolved only when the terminal has
an SSH session (`Terminal.data.ssh_ip`), through `GetSubnet(sshIp, lanIp)`;
from the player's own terminal `nmap 192.168.1.6` simply reports the host as
down. The Metasploit exploit (`DiagnoseExploitTarget`) does the same:
`GetSubnet(RHOST)`, the top Router, and `PortsForHost(router.ports, lanIp)` —
a child device's ports live on its top Router with `lanIp` set, which is why
`Network.openPort` and Metasploit both work through Router→Splitter→Device
(confirmed live by M2's redesigned home network). `RHOST` must therefore be
the public IP, and the `Version` option must equal the version half of the
banner (`FreeRDP 7.1.9` → `7.1.9`); the failure messages ("Port N is
closed", "Service version mismatch…", "No guest account or online user
found") are accurate.

M3's finance-VLAN capture log listed only LAN addresses, so a player had no
usable IP for the gateway. **Fix:** the capture log now names both the public
and the LAN address of the DB server and the gateway. The general recon path
for a Splitter's children is `python3 net_tree.py <router ip>` (NetTree,
downloaded from hackdb.net; needs `apt-get install python3`).

**Takeaway:** a mission that wants the player to act on a device behind a
router must deliver its **public** IP through a lead (file, capture, tool
output); a LAN IP alone is a dead end.

---

## 28. Wireshark is an App, not a terminal command — `Wireshark.Started` fires from its ▶ button, and M3 counts it only after the NAT pivot

**Status: RESOLVED (docs and playtest corrected; behavior unchanged)**
Found: M3 playtest review, 2026-09-29.

The client's Wireshark is a desktop App installed from the App Store
(`docs/basegame-reference/hacktool-catalog.md`: "App only, no dedicated
`TERMINAL.*` command key"). Its toolbar has Start / Stop / Clear plus
optional Source and Destination capture filters, and it triggers
`Wireshark.Started { source, destination }` when capture switches on. The
old M3 playtest and `story.md` wrote `wireshark` as if it were a command.

M3 ignores `Wireshark.Started` until the NAT pivot has happened (`natPivotDone`);
a capture started earlier is not counted, so the player must press Stop and
Start again after the pivot. Since 2026-09-29 starting the capture only
creates `finance_vlan_capture.pcap` in the player's home folder; the
BACKTRACE finding is traced when the player `open`s it (the M2 pattern —
`open` reads a file of any extension, `cat` only `.txt`/`.log`).

**Superseded 2026-09-29 (#34):** M3 no longer has a Wireshark step; the engine
facts above still hold for any future mission.

---

## 29. `Metasploit.Meterpreter.Connected` is raised only by the reverse-TCP listener — a plain `exploit` raises `Metasploit.Event` and `RemoteConnection.Established` instead

**Status: RESOLVED for M2 and M3; OPEN for M4 (not changed, untested)**
Found: M3 static review against the client, 2026-09-29.

The mod event `Metasploit.Meterpreter.Connected` maps to the engine's
`Meterpreter.ReverseTCP.SessionCatch`, and the only place that triggers it is
the reverse-TCP handler behind `tcp_listener` (a listener that logs
"Meterpreter session N opened (lhost:lport -> ip)" when a payload calls back;
its SDK payload carries the listener's `handler {ip, port}`). The flow M2's
players actually use — `use exploit/rdp/cve_2019_0708_bluekeep`, `set RHOST/
RPORT/Version`, `exploit` — never touches a listener: on success the exploit
sets the terminal directory to the target and raises `Metasploit.Event`
(`data.host` = the RHOST) and `RemoteConnection.Established` (`t:
"METASPLOIT"`, match on `targetIp`). The base game's own tutorial quests
listen for exactly that pair.

M3 was written against `Metasploit.Meterpreter.Connected` (a copy of M4's
shape), so its "shell obtained" flag — which also gates the `rootgrab` log —
would never have been set, and the new BACKTRACE `gateway` finding could not
be earned. M3 now listens for `RemoteConnection.Established` (`t ===
"METASPLOIT"`, `targetIp` = Vault-Line) and still accepts
`Metasploit.Meterpreter.Connected` for a player who uses the listener; M2's
new `workstation` finding uses `RemoteConnection.Established` as well.

**Still open — M4:** `m04-quest.ts` completes `initialShellAccess` on
`Metasploit.Meterpreter.Connected` for the C2 host, so the plain `exploit`
flow would not complete it. M4 is untested and out of this change's scope, so
it was left as is; the fix is one more handler on `RemoteConnection.Established`
(`t === "METASPLOIT"`, `targetIp` = `M04_C2_IP`).

**Takeaway:** for "the player broke into this host with Metasploit", listen
for `RemoteConnection.Established` (filter `t === "METASPLOIT"`) or
`Metasploit.Event`; use `Metasploit.Meterpreter.Connected` only when the
mission deliberately requires the listener workflow.

---

## 30. `open` (any command built on `Files.getByPath`) sees a remote file system only over SSH, and resolves relative paths from the home folder, not the cwd — it cannot read a Meterpreter target

**Status: DOCUMENTED (engine design; docs and playtests corrected). FOLLOW-UP 2026-10-01: `open` made Meterpreter-aware in `src/commands/meterpreter-files.ts` — NOT yet live-tested; the cwd-aware proposal below stays open for the local side**
Found: M3 static review against the client (v1.3.13), 2026-09-29.

The SDK's own `Files` doc says path operations are session-aware "while the
player is connected to a remote host over SSH". The client agrees and is
narrower than a reader might hope: the command context's `isRemote` is
`!!terminal.data.ssh_ip`. An absolute path resolves against the SSH target's
root only then (otherwise the player's own root); a relative or `~/` path
resolves against the SSH user's home, or the player's default user (home)
folder — never against the terminal's cwd (`Files.resolvePath(path)` is the
cwd-aware helper; it returns an absolute path that `getByPath` accepts). A
Meterpreter session is not SSH (it sets `meterpreter` / `meterpreter_user`,
not `ssh_ip`), so at a `meterpreter >` prompt `open` reads the **player's own
PC**, not the target. The terminal does offer mod commands in every
environment (the command list appends them regardless of the active
environment, filtered by `scope`), so `open` can be typed there; it just
cannot reach the target's files.

Meterpreter's `download` (like the base `download`) copies the file into the
player's `~/downloads` (the client's file-service `Download` transfers into the
`downloads` user folder), which is why M2's live route works: `download` at `meterpreter >`, then `open` on the
local copy. Since a bare name resolves from the home folder, that copy is
opened as `open ~/downloads/<file>` (or `open downloads/<file>`); the M3
capture is created in the home folder itself, so `open finance_vlan_capture.pcap`
works. Both quests match the event on `{ name, extension }` only, so they
accept the local copy.

**What was fixed:** the M2/M3 playtests, `mechanics-reference.md` and
`scratch.md` no longer claim `open` works on a remote Meterpreter file, and
they give the `~/downloads/` path. No code changed.

**Follow-up 2026-10-01 (owner: `open` should work at `meterpreter >`) — NOT yet
live-tested.** Re-read against the client (v1.3.13, `index.js`): the path API
stays SSH-only (the `exploit` handlers set `meterpreter`, `meterpreter_user` and
the terminal directory, never `ssh_ip`), but the SDK documents the ID-based calls
(`getById`, `getChildren`, `read`) as not session-limited, the exploit itself
sets the terminal directory to `Fr.GetById(<target ip>)` (so a device's root file
has the device IP as its id), and the engine raises `RemoteConnection.Disconnected`
(`t: "METASPLOIT"`) from `back` and from the Metasploit environment's
`onDestroy`. `src/commands/meterpreter-files.ts` uses exactly that: it tracks the
session target from `RemoteConnection.Established` / `.Disconnected`, and
`open` (when not on SSH and the path does not start with `~`) resolves the path
with `Files.resolvePath` (cwd-aware, and in that session the cwd is the target's)
and walks it from `Files.getById(<ip>)` with `Files.getChildren`, matching
`name.extension`. A miss, a `~` path or no session falls back to the old local
lookup, so `download` + `open ~/downloads/<file>` still works. The event payload
is unchanged, so M2's `shellCompanyFound` / `aftermathShown` and M3's
`vpnConfigRead` need no change. Checked in a mocked-SDK harness (40 checks, three
broken copies fail as they should); the ID-walk assumptions come from reading the
client, so the live test must confirm them: at `meterpreter >`, `open
wire_authorization.pdf` (M2) prints the PDF and traces `shellCompany`; after
`back` the same command says "No such file"; `open ~/downloads/<file>` on a
downloaded copy still works. The `trace("OPEN", ...)` lines in the log show the
tracked IP and each lookup.

**Proposal (not applied, needs its own go-ahead):** make `open` cwd-aware —
`Files.getByPath(await Files.resolvePath(target))` — so a bare name works from
any directory, and let the "No such file" error mention `~/downloads`. Until
then a player who `cd`s away from the home folder and types a bare name gets
"No such file".

**Takeaway:** the stock path API (`getByPath`, `exists`, `getRoot`) sees a remote
file system only over SSH. A file on a Meterpreter target is reached from a custom
command with the ID-based calls, starting at `Files.getById(<target ip>)` (what
`open` does since 2026-10-01); its local copy (Meterpreter `download`, then
`open ~/downloads/<file>`) stays a valid route.

---

## 31. A `Router`-type node renders the TP-Link panel, which raises `Network.PortChanges` on Save and nothing on login — `PFSense.Login`/`PFSense.Changes` come only from the pfSense panel of a `Firewall` node, so M3's NAT pivot could never fire

**Status: FIXED IN SOURCE (Option B, 2026-09-29) — LIVE-TESTED 2026-09-29: a Save in the TP-Link panel reaches the quest and traces `portal` (`m3 traced portal`, round 3 at 22:24:27; the round-1 results are in `docs/m03-livetest-guide.md` §7)**
Found: a live-test screenshot of M3's admin panel (a **TP-Link** "Router
Administration" page at `77.83.142.6`, Port Forwarding tab, five pre-filled
rules), then verified against the client (v1.3.13), 2026-09-29.

**What the client does.** The in-game browser picks the admin page from the
node type: a `Firewall` opens the engine's pfSense page (and only if the
router forwards an active `external → 80 → firewall LAN IP` rule); anything
else that has an active port-80 rule to its own LAN IP opens the TP-Link
"Router Interface". M3's remote gateway is `NetworkDeviceType.Router`, so it
is the TP-Link page. The two pages raise different events:

| Page | Login | Save |
|---|---|---|
| pfSense (`Firewall`) | `PFSense.Login {ip}` | `PFSense.Changes {old, new}` |
| TP-Link (`Router`) | **no event** (a credential check, then the panel) | `Network.PortChanges {subnet, oldPorts, newPorts}` |

M3 listened to `PFSense.Login` / `PFSense.Changes` on a `Router`, so neither
could ever fire: the `portal` key was never traced, `natPivotDone` never
became true and the five VLAN ports never opened. The game log agrees: in the
2026-09-29 11:53 session the panel was open and logged in at 11:56 (the
screenshot) and the log holds no `[FP][Backtrace] m3 traced …` line. M1 and M2
are unaffected — their targets are `Firewall` nodes, which is also why their
`PFSense.*` checkpoints were live-proven.

**Why the table was pre-filled.** A device behind a router has no port list of
its own: `CreateSubnetNetwork` moves every child's `ports` into `router.ports`,
tagged with the child's `lanIp`, and deletes them from the child; `Network.addPort`,
`removePort`, `openPort` and `closePort` all edit that router table by
`(external, lanIp)`, and a host's ports are derived from it (`PortsForHost`).
The TP-Link Port Forwarding tab lists the table verbatim, so a row cannot be
hidden — an empty table means those services do not exist yet.

**What the tools need from a row** (engine-verified): `sqlmap` — an *active*
row with internal 3306/5432 whose `version` starts with `mariadb`, plus the
domain's `SQL_INJECTION`; every Metasploit exploit — an *active* row with a
`version`, `external === RPORT`, `internal` equal to the module's port, and
service and version matching the banner; `nmap` — `OPEN` when
`external === internal`, `FORWARDED` when they differ, `CLOSE` when inactive,
"No ports found" for a host with no rows; `evil-rm` checks no ports at all.
A rule the player types has no `service`/`version`: the panel copies them only
from an existing *versioned* row with the same internal port and Local IP, so
a typed rule is inert until the mission completes it.

**Fix (the player writes the rules).**
- The gateway ships with only its locked port-80 rule and the four VLAN devices
  ship with no `ports` (`registerM03FinanceVlan`); the old `openPort` pivot and
  the `removePort`/`addPort` workaround for 3306 are gone.
- `Network.PortChanges` on `M03_PFSENSE_IP` (`onRouterSaved`): the first Save
  traces `portal` (`portalReached`); every saved rule whose `(Local IP,
  internal)` matches a row of `M03_FORWARD_TARGETS` is rewritten with its
  banner via `Network.removePort` + `Network.addPort` (`syncM03Forwards` in
  `src/main/m03-quest.ts`; the SDK calls do not re-raise the event); an *active* match sets
  `natPivotDone`; the matches are saved in `forwards` and re-applied by
  `OnObjectivesStart` only when the network has to be rebuilt (see #32). Rules
  that match nothing (wrong host, wrong port, an empty "Any" Local IP) are left
  alone and are inert. (The first version also made the report wait for the
  player to take the rules out again — `natReverted`; that gate was dropped the
  same day as the player's own call, so the rules may stay.)
- The hint sits before the gate: the tip mail says the gateway forwards nothing
  inward, the public site's Staff Access block (and `lynx`) names each host with
  its service and port, and `python3 net_tree.py` gives each host's name,
  public IP and LAN IP.

**Not verified in game (live-test list, `docs/m03-playtest.md`):** that
`Network.PortChanges` reaches a quest-scoped listener; that the panel's stale
form state does not undo the rewrite (the client copies `service`/`version`
back from the rewritten versioned rows on the next Save, but a `445` row has
no version and is simply rewritten again); and the FORWARDED case
(`external ≠ internal` needs `RPORT` = the external port).

**Takeaway:** choose the event by node type — `Router` → `Network.PortChanges`
(Save only, no login event), `Firewall` → `PFSense.*` — and read what a panel
actually triggers before wiring a checkpoint to it. Whatever a mission must
have the player discover for a gate has to be reachable before that gate.

---

## 32. A start-time `destroyNetwork` wipes the mission's network on every restart or reload — the destroy runs in a worker on a snapshot and overwrites the whole network list when it finishes

**Status: FIXED IN SOURCE for M3 (2026-09-29), LIVE-TESTED (round 2: a game restart and a dev reload kept the network and the rules); the same fix is in source for M1, M2 and M4 (2026-09-29), typechecked, NOT live-tested**
Found: live-test review, 2026-09-29 — after a plain game restart (no
`mods.reset`), `nmap -sV` printed an empty table ("No ports found"), `sqlmap`
answered "[ERROR] Failed to connect host", and every rule the player had
written was gone (guide item P6).

**What happens** (client v1.3.13 plus the game log):
- `registerM03FinanceVlan` (and M1, M2 and M4's `register…Network`) call
  `resetMissionNetworks` — an unawaited `Network.destroyNetwork` per IP —
  immediately before `createSubnetNetwork` at the same address.
  `OnObjectivesStart` runs on every game start, and in dev mode also each time a
  rebuild reloads the mod (log 15:11:25 and 15:11:26: "Build output changed …
  Reloading" — two loads within one second).
- `DestroyNetwork` posts a snapshot of the whole subnet list (plus the files and
  the global store) to a worker. When the worker answers, the client replaces
  the whole subnet list with the worker's result (`SetSubnets`), and the files
  and the store likewise. Anything created after the snapshot — the network the
  same `OnObjectivesStart` just built, the rules restored onto it — is
  discarded. When nothing existed at the address the worker has nothing to
  remove, which is why the first start after `mods.reset` always worked and
  every later start did not.
- Same mechanism as #18 and #21 (and the `mods.reset` race noted in the project
  memory). `resetMissionNetworks` was added on 2026-09-28 so that a replay starts
  from a clean network; the price is that a plain restart destroys the network
  too.

**Fix (M3).** The quest data carries `networkBuilt`. `OnObjectivesStart` builds
the VLAN (destroy, create, `restoreM03Forwards`) only when the flag is false or
`Network.getSubnet(M03_PFSENSE_IP)` is null, and sets the flag once, at the end of
`OnObjectivesStart` (after every listener is registered, so a failing `SetData`
cannot cost the quest its event wiring). A restart or reload therefore leaves
the persisted network alone, rules included. `mods.reset` and abandon clear the
quest data, so the next claim builds fresh, as before. `forwards` stays as the
fallback for a network that has to be rebuilt.

**Consequences.** A structural change in the code no longer reaches a save whose
flag is true (#21): abandon or `mods.reset` for a new topology. The first run of
a build over an old save has no flag and rebuilds once, which can still hit the
race — start from a fresh claim.

**M1, M2 and M4 (2026-09-29, typechecked, not live-tested).** Each quest's data
gained `networkBuilt`, and `OnObjectivesStart` follows the M3 rule: build (destroy,
create, restore) only when the flag is false or an anchor router is gone
(`missionNetworksExist` in `src/helpers/network.ts`; M1 checks its five routers, M2
the dev, closer-rig and workstation routers, M4 the VPN router), and set the flag
as the last statement. M1's `registerM01Network` is split into `registerM01Routers`
(guarded, holds the destroy) and `registerM01Domains` (every start, so the
LedgerVault domain is re-registered and never dropped). On the client,
`createSubnetNetwork` skips an address that already exists (`AddSubnet` ignores a
known ip) and `registerDomain` and `setVulnerabilities` only update the subnet
record, so those calls are harmless on a kept network. The firewall-breach restore
(`removeFirewallRule`, `openPort`) now runs on a rebuild only, since a kept network
already carries the change. The seven commented-out `destroyNetwork` lines in
`m01-quest.ts` and `m02-quest.ts` were removed (zero-comments rule). The same
consequence as M3 applies: a structural change in the code reaches a save only
after abandon or `mods.reset`.

**Takeaway:** destroy-before-create belongs to the first build of a claim, never
to the every-load path of `OnObjectivesStart`.

---

## 33. `Terminal.Explorer` cannot be raised for M3's Faded-Ledger — the way in is SSH, which raises `RemoteConnection.Established` (`t: "SSH"`)

**Status: FIXED IN SOURCE (2026-09-29) — LIVE-TESTED for `accomplice` (round 3: `[FP][M03] remote connection SSH -> 62.210.183.77`, then `m3 traced accomplice`, both at 22:33:24). The Reyes personal log (`Terminal.Cat` / `open` of `do_not_open_at_work.txt`) is SKIPPED, not tested: the note was read after the mission completed, when `teardown()` had already destroyed the network ("File not found.")**
Found: live-test review, 2026-09-29 (guide item O14: "logged in over SSH, still
not cleared").

**Facts from the client.** Exactly two commands raise `Terminal.Explorer`:
`explorer` in a Meterpreter session and in an `evil-rm` session. Faded-Ledger has
no service Metasploit can exploit (its only forwarded port was 445, which no
command reads except `nmap`), and `evil-rm -H` accepts only a hash the engine
itself registered when a quest created it (`Bq.EncryptPassword`), while
`helpdesk_resets` stores the plain password. The SSH session's own `explorer`
opens the file window without raising any event. `ssh` needs a `Device`
(Faded-Ledger is one), an active router row with external = the `-p` port (22),
internal 22 and a Local IP that matches the host, and a valid user and
password; it raises `RemoteConnection.Established` with `t: "SSH"` and
`targetIp` = the address typed. The log line "Sys log file not found for
62.210.183.77" at 15:05 is the engine noting that connection (a device created
by a mod has no `sys.log`); harmless.

**Fix.** `M03_FORWARD_TARGETS` gains `22 ssh` for Faded-Ledger, so the player's
rule is completed like the others. `accomplice` is traced when
`RemoteConnection.Established` arrives with `t === "SSH"` and `targetIp ===
M03_ACCOMPLICE_IP` (`markAccompliceReached`); `Terminal.Explorer` stays as a
second trigger. The Reyes personal log is no longer written at login, because it
quotes her note: it fires on `Terminal.Cat` or `open` of
`do_not_open_at_work.txt`. Hints: the Staff Access notice lists "Faded-Ledger
(ssh 22, share 445)" and the `helpdesk_resets` note now reads "Remote login reset
for d.reyes". Data: `reyesShareSeen` became `accompliceReached`.

**Takeaway:** before naming a tool as a checkpoint, list every place the engine
raises its event, and prefer the event of the tool the player can actually reach
the host with.

---

## 34. M3's report was refused without a word because of a hidden Wireshark requirement — the capture step is removed, `open` printed one paragraph, and the gateway config is now a plain `.txt` read with `cat`

**Status: FIXED IN SOURCE (2026-09-29) — LIVE-TESTED round 3 (2026-09-29): the report completed on ledger + config alone (`m3 -> complete` at 22:37:55) and `cat site_to_site_backup.txt` traced `vpnPeer` at the `meterpreter >` prompt (22:31:20); `open` per line and the missing Wireshark were confirmed by the tester's own check, not by the log**
Found: review of the retest run (game log 20:02–20:26), 2026-09-29.

**What the log showed.** `portal`, `parentEntity`, `gateway` and `vpnPeer` were
traced; there is no `architectVpn` and no capture log. The player had dumped the
ledger, read the config and opened the rules, yet the report never completed:
the `Mail.Sent` handler returned without a trace at the gate that needs
`internalTrafficCaptured`, which only `Wireshark.Started` (after the pivot) sets.
The gates print nothing, so the player could not tell which of three conditions
was missing — and the Wireshark step itself was judged pointless.

**Fix.**
1. *Wireshark is out of the mission:* the `Wireshark.Started` handler, the
   `Events.emit` → `Files.create` `.pcap` bridge, `internalTrafficCaptured`,
   `captureRead`, the capture text, the payroll decoy (constants and geoip/whois
   fixtures) and the `architectVpn` key are gone. `architectVpn` (the tunnel
   endpoint) stays an *extra* in the COMPLETE snapshot, so the report still shows
   it; `BACKTRACE_KEYS.m3` has 5 keys. The personal log that used to fire on the
   capture is now `tunnel` and fires on the config read. M4's tip mail says the
   address came from the gateway config. The report needs only the ledger and the
   config.
2. *The ledger domain* the capture used to reveal is now in the Staff access
   notice (constant, `home.html`, the `lynx` fixture).
3. *No `download` in the flow:* the gateway config is `site_to_site_backup.txt`
   (it was `.conf`), so `cat` reads it at the session's root and `Terminal.Cat`
   traces `vpnPeer`. The engine's `cat` reads the terminal's current directory,
   which the exploit points at the target, and the base terminal commands stay
   available inside an environment (SSH sessions show it); **confirmed live at
   the `meterpreter >` prompt (round 3: `cat` traced `vpnPeer` at 22:31:20).** A local copy read with `open` still counts.
4. *`open` printed one paragraph:* it handed the whole file to one `println` of a
   plain string, which collapses newlines; `cat` returns the string as the command
   result, which keeps them. `open` now prints line by line (blank lines with
   `newLine()`, leading spaces turned into non-breaking spaces).
5. *Diagnostics:* `RemoteConnection.Established` writes `[FP][M03] remote
   connection <t> -> <ip>` so a session that traces no key can be seen in the
   log. The SSH login to Faded-Ledger at 20:19:30 produced no `traced accomplice`;
   the cause is still unknown.

**Takeaway:** a gate that fails silently must never hide a requirement the player
has no other way to discover; and when a step is judged weird in play, remove it
rather than gate on it.

## 35. After `mods.reset` M1's `be7` / `fw7` appeared and vanished at random — concurrent `destroyNetwork` replies overwrite each other (follow-up to #32)

**Status: FIXED and LIVE-TESTED (2026-10-01).**
`mods.reset` clears the quest Data (`networkBuilt` false) but not the networks, so
`register` took the rebuild path with all five routers present and fired five
unawaited `destroyNetwork` calls. Each call posts a snapshot of the whole store to a
worker and, on reply, replaces the store with that snapshot minus its router
(`SetSubnets`, `SetFiles`, `setEntireData`; client 1.3.13). The five snapshots are
identical, so the last reply wins: one random router vanished (`be7` or `fw7`) and
every domain registered after the call was lost. Teardown had the same shape and left
four of five routers alive. **Fix:** `core/register` builds in place when no router
exists, keeps the network when progress and routers agree, and otherwise schedules a
job (`core/rebuild.ts`) that destroys the routers one at a time with `await` inside a
`Scheduler` handler (the hook itself is synchronous and loses the mod context on an
`await`), then builds. M2-M4 still use `resetMissionNetworks` until migrated.

---

## 36. A website render has no mod context — `SaveStorage` / `Variables` there are a different namespace, so the page rolled its own listing winner

**Status: FIXED and LIVE-TESTED (2026-10-01).**
`metadata()` is called directly by the website adapter with no mod pushed, so
`SaveStorage` resolves to `__unknown__`, and `Variables` follows the stack too. The
`Events.on` bridge pushes the mod only for `SaveStorage` and permissions, not for
`Variables`, which explains #20. `ensureM01ListingResolution()` called from a render
found nothing, rolled a second winner and overwrote the `Variables` cache the quest
reads; the log showed the winner flipping for one second. **Fix:** the roll happens in
mod context (`OnStart` rolls, `OnObjectivesStart` ensures), `SaveStorage` stays the
truth, a `SharedVariables` mirror (no namespace) is what every context reads, renders
only read it and fall back to the default HTML or a 404. This also fixes the ledger
code being built as `PENDING-0000` before any roll existed.

---

## 37. Mod mails pile up after `mods.reset` — the reset skips `Mail.send` mail and `Mail.getInbox().subject` is blank

**Status: FIXED and LIVE-TESTED (2026-10-01).**
The reset message counts `0 mail(s)`: only quest-bound mail is reset. A custom mail is
stored as `{ from, to, content: { custom, title, data } }`, and `getInbox()` reads a
top-level `title`/`subject` that does not exist, so matching on subject never fired.
**Fix:** `onStartM01` withdraws every inbox mail whose `from` is one of the mod's
senders (`content/global/mail-senders.ts`) before seeding; the early-report reply is
tracked by the id `Mail.send` returns. Side effect: the Custodian's M2-M4 mails also
disappear when M1 replays, which is right after a reset.

---

## 38. M1 could be completed by jumping steps — gates covered 3 of 13 steps and the world leaked the next step

**Status: FIXED and LIVE-TESTED (2026-10-01).**
In the live test `subfinder x7xsentry9.tech` worked without `lynx` (the domains were
registered at build; only `nslookup` / `lynx` were unlock-gated), the LedgerVault page
set `vaultVisited` directly, and the report was accepted after the vault visit alone.
**Fix:** the transitive 13-step chain in `content/m01/gates.ts`; every listener through
`middleware/advanceStep`; broker domains in the `brokerLead` unlock; LedgerVault a 404
until `chatConfirmed` (`SharedVariables` seal, cleared on complete/abandon); an early
but correct report is answered by the Custodian. A harness that fired the 14 events in
300 random orders against a mocked SDK showed the flags always form a prefix of the
chain; with the gate table emptied it failed 300/300.

---

## 39. `Network.registerDomain` and `Network.setVulnerabilities` do nothing without a subnet at that IP, and `registerDomain` overwrites the subnet's `domain` when one exists

**Status: RESOLVED (rule; first met in M1, engine read 2026-10-02).**
Found: M1 recon layer live test, 2026-09-20 — `subfinder` reported "No subdomains found" and
`python3 net_tree.py` reported "Subnet not found" for every domain that had only ever received a bare
`Network.registerDomain`, while `nslookup`, `whois`, `geoip` and `nmap` kept answering, because those are
shell fixtures that never read the subnet.
Root cause (engine 1.3.13, `docs/app-asar-reference.md` E-1 and E-2): `registerDomain` looks up the subnet
at the IP and only then calls `UpdateSubnet({ ...subnet, domain: { name, vulnerabilities } })`; with no
subnet it returns without a word. `setVulnerabilities` behaves the same. `subfinder` needs a subnet whose
`domain.name` equals the query and lists the subnets whose `domain.name` ends with it. A second
`registerDomain` on the same IP replaces the first.
**Rule:** a domain that must be real gets a subnet first (`DomainSpec.needsSubnet: true` creates a bare
`Device`); `needsSubnet: false` only works when a subnet already exists at that IP, otherwise the
registration is lost. One IP carries one domain name. A zero-network mission (M6, `networkIps: []`) can
answer `whois` and `nslookup` from fixtures, but `subfinder` and `net_tree.py` will not see its domains.

---

## 40. `dirhunter` prints every registered path of a website, and a mod cannot hide a page

**Status: RESOLVED (rule; known since M1, engine read 2026-10-02).**
`dirhunter <host>` finds the `Website` by host name, prints every page whose `isHidden` is falsy, and
raises `Terminal.Dirhunter` with `{ host, results }`, where `results` lists the path of every page. SDK
page definitions (0.25.0 included) have no `isHidden`, so every page a mod registers is printed.
`docs/m01-playtest.md` already records this ("no engine-level way to hide a mod-registered page"), and
M1's listing paths are opaque tokens for that reason (`docs/changelog.md`, 2026-09-22). The lookup is by
host in the website registry, not by subnet (`docs/app-asar-reference.md` E-3).
**Rule:** "hidden" means registered but not linked. Path names never leak an answer or the next step:
opaque tokens, or one dynamic pattern such as `/entity/:id`. Do not design a step around `dirhunter`
finding nothing. Open (static reading only): whether a host with no subnet and no registered domain can
be scanned in the running game; the M6 walking skeleton confirms it live.

---

## 41. Firewall rule `destination` is compared with the target's `lanIp`, and `IsLocalIp` accepts only `192.168.1.x`: the old M4 rules could never match

**Status: RESOLVED for the design (rule; engine read 2026-10-02). The old M4 code (`content/m04.ts`,
`main/m04.ts`, never played) still has the defect until its migration to M7.**
Found: static reading of the engine while specifying M4-M7, 2026-10-02 (`docs/app-asar-reference.md` E-7
and E-8).
The engine blocks a request to `ip:port` when the firewall protecting `ip` has a deny rule for that port
whose `source` is empty or the requester and whose `destination` is empty or **equals the target subnet's
`lanIp`**. The old M4 defined `{ allowed: false, port: 22 | 3389, destination: M04_C2_IP }`, the C2's
public IP, so neither rule could ever match. The pfSense panel's Save also validates every rule: a
`destination` that is not `192.168.1.x` (`IsLocalIp` is `startsWith("192.168.1.")`) is rejected with
"outside this network", so the player could not save while such a rule stayed in the list and
`PFSense.Changes` would never fire. A rule with no `destination` blocks the port for every device of the
network (M1 and M2 ship such rules, each port belonging to one device).
**Rules:** the `lanIp` of every node behind a panel the player edits is `192.168.1.x` (M2 and M3 already
are; M1's routers use `192.168.1.x` to `192.168.5.x`); a rule's `destination` is the target's `lanIp` or
empty; never a port-22 rule without a `destination` where other devices need SSH (M7's Null-Crown and
Ash-Vector); never a Deny rule on port 80 with an empty destination (the panel rejects it as a lockout);
`Network.removeFirewallRule(ip, port)` removes every rule with that port. M7's LAN side moves from
`172.16.0.x` to `192.168.1.x` (`docs/world-building/11-spec-m7.md` §B #11).

---

## 42. `Quest.Rewards` with `AutoComplete` did not pay in the rival-hacker lab

**Status: WORKAROUND (pay with `Bank.transaction`; XP is not paid).**
Found: rival-hacker lab live test, 2026-10-01 (`src/debug/rival-hacker-lab.ts`) — `OnComplete` ran but the
declared reward never reached the bank. The engine's own payout (the quest store's `Complete`) is guarded
by `Rewards != null && Rewards.Money`, and a quest without `Rewards` never builds one
(`docs/app-asar-reference.md` E-5), so the cause was not found. Money in M4-M7 is paid with
`Bank.transaction` inside `OnComplete`, the quest's `Rewards` stays unset, and the payout is skipped under
dev or tester focus (README decisions #30 and #34 in `docs/world-building/`). The SDK `Bank` pays money
only. Open: whether M1-M3's `Rewards` pay in a production-mode run (their playtests record rewards forced
to 0/0 while focused), and where XP from `Rewards` would be granted (not traced).

---

## 43. Files have no timestamps: dates exist only in file names and contents

**Status: RESOLVED (rule; engine read 2026-10-02).**
The SDK file types (`FileDefinition`, `FileInfo`, `FileCreateOptions`, `NetworkFileMap`) have no date
field, the `Files.create` bridge hands the engine only `{ id, name, extension, data, isFolder, parent }`,
and `ls` prints names only (`docs/app-asar-reference.md` E-6). Story dates therefore live in file names
and contents and come from `docs/world-building/13-story-timeline.md`, never from `Time.now()`,
`Date.now()` or `new Date()`: the in-game clock runs on its own calendar and is unrelated to story time.

---

## 44. `mods.reset`: exact scope

**Status: RESOLVED (rules; engine read 2026-10-02, corrected 2026-10-03).**
`mods.reset <modId>` unclaims the mod's quests (`Manager.Unclaim`: listeners released, the quest's tweets
and messages removed; `OnComplete` and `OnAbandon` do not run), removes quest-bound mail and quest posts,
clears the mod's `Storage` (the global one) and `Variables`, and resets and closes the mod's apps. It does
**not** clear `SaveStorage` (the first version of this entry said it did, a wrong reading of the minified
names), persisted `Scheduler` jobs or `Desktop` widgets, and it does not touch networks (#35),
`SharedVariables`, mail created with `Mail.send` (#37) or the player's own filesystem
(`docs/app-asar-reference.md` E-4).
**Rules:** (1) a checkpoint on a file that can linger on the player's PC also requires a quest-data flag
set in this playthrough; (2) cleanup written in `OnAbandon` never runs on a reset, so the rebuild path of
`core/register` does the cleaning; (3) `SharedVariables` mirrors can be stale until `OnStart` or
`OnObjectivesStart` rewrites them; (4) right after a reset the world is rebuilt by a `Scheduler` job
(`core/rebuild.ts`, 250 ms), so a tool used inside that window can report a missing target: retry before
concluding that a mission is broken; (5) kit state in `SaveStorage`, persisted `Scheduler` jobs and
widgets survive a reset, so a mission's start must cancel its own jobs and clear its own state (M4 found
this live: a stale 1 s tick job kept republishing the incident banner, and a breach flag outlived the
reset; `onStartM04` now calls `abandonStrike`, `cancelM04Strike`, `cancelM04BreachJobs` and `resetBreach`).

---

## 45. UNVERIFIED: whether a `Firewall` nested inside a `Splitter` protects its sibling `Device`s

**Status: OPEN (static reading only; M07's phase-1 walking skeleton is the live test).**
Raised: M07 migration, 2026-10-02, while re-addressing the old M4's firewall rules.

`GetFirewall(ip)` returns `ip`'s own subnet when that subnet is a `FIREWALL`,
and otherwise looks for a subnet whose `type` is `FIREWALL` **and whose
`parent` is the router of `ip`'s tree**:

```js
function se(en){const Zn=J(en);if((Zn==null?void 0:Zn.type)==="FIREWALL")return Zn;const jn=ee(en);if(jn)return Ji().Network.find(xt=>xt.type==="FIREWALL"&&xt.parent===jn.ip)}
```

(`docs/app-asar-reference.md` E-8, offset 20403821.)

In the shape M2 ships live, and now M07 too, the Firewall is **not** a direct
child of the router: router → Splitter → [Firewall, devices...]. If
`createSubnetNetwork` records each child's immediate parent, the Firewall's
`parent` is the **Splitter's** IP, `GetFirewall(<device ip>)` finds nothing,
and `IsRequestBlocked` returns `false` for every device in the tree — the deny
rules would be inert. If the engine instead stamps the tree's router as
`parent`, the rules bite. The excerpt alone does not settle which, and
`GetSubnetRouter`'s body was not read.

**Why it does not break either mission.** Neither M2 nor M07 rests its
progression on the rule matching. The gated port is `active: false` in the
build and the step's `UnlockSpec` both removes the rule **and** calls
`Network.openPort`, so the `active` flag is the real gate (`removeFirewallRule`
is called with the **Firewall's own IP**, where `GetFirewall` resolves
trivially, so the removal itself is safe either way). M2 passed its live test
on exactly this arrangement.

**How to settle it:** M07's skeleton ships 3389 `active` from the build
(`M07_RDP_OPEN_FROM_BUILD` in `content/m07/topology.ts`). Run the bluekeep
exploit **before** saving anything in the ash-gate panel
(`docs/m07-playtest.md` §5-6). Refused → the rule reaches a device two levels
down, and this entry becomes RESOLVED. Succeeds → the rule is inert and the
`active` flag is the only gate, which is worth writing down before M5 designs
its own hidden Firewall.

**Update 2026-10-02 (audit fix pass).** The skeleton shortcut is gone:
`M07_RDP_OPEN_FROM_BUILD` is `false`, so 3389 is `active: false` from the build
and the firewall step opens it. The test above is unchanged and now lives at
`docs/m07-playtest.md` §5 ("Before the Save, the RDP exploit must fail").

---

## 46. UNVERIFIED: a `{ realMs }` Scheduler job across a live Meterpreter session, and after `mods.reset`

**Status: OPEN (harness only; M07's phase-1 tracking probe is the live test).**
Raised: M07 migration, 2026-10-02.

M07's real-time tracking (`11-spec-m7.md` §G) arms a `Scheduler` job with a
`{ realMs }` delay when the player opens a session on the C2 and cancels it on
the extraction. `core/rebuild.ts` already uses `{ realMs: 250 }` successfully
for the rebuild job, but nothing has yet confirmed that a job measured in
**tens of seconds** of real time still fires while the player sits inside a
Meterpreter session, that `cancelKind` reliably stops it, or that it survives
(or is cleared by) `mods.reset` — which clears `Storage` and `Variables` but,
per the corrected E-4 (`docs/app-asar-reference.md`, 2026-10-03), leaves
`SaveStorage` and persisted `Scheduler` jobs alone, so a reset does not cancel
the job.

**How to settle it:** `controller/m07/probes.ts` arms a bare 60-second job on
every METASPLOIT session to the C2 and cancels it on the download, with no
banner, penalty or file deletion attached. Watch for
`[FP][M07] probe:tracking-armed`, then either `probe:tracking-disarmed` (you
downloaded in time) or `probe:tracking-expired` (you did not). Also worth
checking: whether it still expires after `back`, and whether it survives
`mods.reset`. The probe and this entry are removed once phase 4 builds the real
240-second deadline on the answer.

**Update 2026-10-02 (audit fix pass).** Phase 4 built the real deadline and
removed `controller/m07/probes.ts` with its three probe lines, so
`probe:tracking-armed`, `probe:tracking-disarmed` and `probe:tracking-expired`
no longer exist. The same question is answered now by `[FP][M07] banner shown
ip=203.0.113.161 totalMs=240000` (armed), the banner flipping to EXTRACTION
COMPLETE (disarmed) and `[FP][M07] trace expired penalty=<n>` (expired);
`docs/m07-playtest.md` §7-8. The entry stays OPEN: it is still unverified live.

`Scheduler.remaining(id)` returns **in-game** milliseconds (SDK `index.d.ts`:
"In-game ms until `id` fires"), so a real-time comparison has to go through
`Time.toRealMs`. `strikeRemainingRealMs` returned the raw value until the fix
pass; M07's trace halving now converts it.

---

## 47. UNVERIFIED: a mission with no network at all (`networkIps: []`)

**Status: OPEN (code read plus harness; M06's phase-2 walking skeleton is the live test).**
Raised: M06 skeleton, 2026-10-02.

M06 is designed with `networkIps: []` and `networks: () => []`
(`docs/world-building/08-spec-m5-m6.md` §C1). Read against the code that path is
sound, and a mocked-SDK harness (52 checks) confirms the following, but **none
of it has run in the game**:

- `register(world, { networkBuilt: false, unlocked: [] })` returns **`true`** on
  the first call, because `existingNetworkIps([]).length === 0` takes the
  build-in-place branch. `applyNetwork` then calls `buildNetworks([])`, which is
  an empty loop, so nothing is created and the controller still records
  `networkBuilt`. The `true` is "the world was applied", not "a network exists".
- Every later call takes the keep path, because `networksExist([])` compares
  `0 === 0` and is **vacuously true**.
- `unregister` still schedules its teardown job; `destroyNetworksInOrder([])`
  iterates nothing.
- No `createSubnetNetwork`, no `registerDomain`, no `destroyNetwork` is ever
  called, so there is nothing to scan behind any M06 domain for the whole mission.

**What the live test has to confirm** (`docs/m06-playtest.md`): that such a
mission starts, runs its gates and completes; that no network is built (no
`Network.createSubnetNetwork` in the log); and above all that `dirhunter <host>` lists a mod site's registered
paths with **no subnet anywhere in the mission** (E-3 says the lookup is by host
name only, `docs/bugs.md` #40 — but every live confirmation so far came from M1,
which does have networks).

**Why it is not a gamble.** The mission's own gates are page visits
(`Browser.Meta`) and a `whois` fixture, both of which are live-proven in M1-M3
and neither of which needs a subnet (E-1 for fixtures, E-3 for the site
lookup). `dirhunter` is only a discovery aid: the gate is the visit to
`/filings/archive/`, so even if `dirhunter` turned out to need a subnet the page
is still reachable by typing its address, and the mission is still completable.

---

## 48. UNVERIFIED: the rival-hacker kit inside the mission pipeline, and a widget loaded from `components/`

**Status: OPEN (harness only; M04's phase-3 walking skeleton is the live test).**
Raised: M04 skeleton, 2026-10-02.

The countdown banner, the desktop lock, the `~/compositor` recovery folder and
`repel` / `sysdiag` / `sysrepair` were live-tested on 2026-10-01 **inside
`src/debug/`'s lab** (`docs/world-building/10-spec-m4.md` §I). Phase 3 adapts the
generic parts into `components/intrusion.ts`,
`components/desktop-breach.ts`, `components/desktop-lock.ts`,
`components/incident-banner.ts` and three global commands, and drives them from a
real quest for the first time. Four things change with that move and none has run
in the game:

1. **Strikes are scripted, not rolled.** The lab's heat loop and
   `Math.random()` identity pick are gone: a `Scheduler` job armed from the
   mission's own step fires one strike against one fixed address, with one fixed
   alias (`sentry`). Deterministic, so the owner's run and the harness see the
   same thing.
2. **The commands are global, not debug-gated**, and `sysdiag` / `sysrepair`
   deliberately serve **any** mission's breach, because M07 reuses the kit
   (`11` §G). The breach therefore lives under one key,
   `flatline.desktopBreach`, carrying the owning mission inside it, while the
   intrusion state uses the per-mission prefix the prompt asks for
   (`flatline.m04.activeStrike`) plus a pointer key
   (`flatline.intrusion.activePrefix`) so a mission-blind command can still find
   it. This deviates from `10` §H's "refuse when M4 is not active".
3. **The penalty is capped.** `Bank.withdraw` is wrapped by
   `components/reward.ts`'s `penalty`, which charges
   `min(Bank.getBalance(), amount)`, so a broke player cannot go negative. The
   lab withdrew unconditionally.
4. **The banner widget is loaded by path, not imported as a string.**
   `Desktop.addWidget({ src })` takes a path relative to the mod root, so
   `localizeHtml` — and therefore `{{t:KEY}}` — can never reach it; the lab's
   copy simply hardcoded English. The adapted widget instead renders
   `view.label` and `view.detail` out of the `Variables` payload, which the
   controller writes **already localized** from mod context. That is what makes
   a Chinese playthrough show Chinese here. **The path itself is the unverified
   part:** the only live-proven precedent is the lab's
   `debug/rival-banner.html`, so `components/incident-banner.html` is assumed to
   be copied to the same relative place by `buildMod()`. If the widget never
   appears, that assumption is wrong and the HTML has to move.

**Also still open from the lab:** the terminal watcher keeps the lab's DOM
queries and synthetic double-click, with its release failsafe (three attempts,
then unlock) unchanged, and `mods.reset` during an active strike is handled only
through `Game.SessionStarted`. `docs/m04-playtest.md` §5 is the test the owner
asked for.

---

## 49. `Files.create` cannot re-create a file on a Meterpreter target, so M07 wipes the payload instead of deleting the file

**Status: DOCUMENTED (design consequence); the write path itself is UNVERIFIED and M07's phase-4 build is the live test.**
Found: M07 full implementation, 2026-10-02.

`11-spec-m7.md` §G says that when M07's 240-second trace expires the `.enc`
"self-deletes", and that it is re-created with `Files.create` inside a handler
when a new session to the C2 opens. The second half cannot work as written:

- `FileCreateOptions` offers only `parentPath`, never a parent **id**.
- Path operations are session-aware **only over SSH** (`docs/bugs.md` #30). A
  Meterpreter session sets `meterpreter` / `meterpreter_user`, not `ssh_ip`, so
  any `parentPath` resolves against the **player's own** machine, not the C2.

So a deleted root file on the C2 could be removed but never put back, which
would dead-end the mission — exactly what `11` §G forbids ("Tidak ada jalan
buntu").

**What was implemented instead.** Failure overwrites the payload in place with
`Files.write(id, <cleared marker>)` after locating the file through the
id-based walk (`Files.getById(<target ip>)` then `getChildren`, the same route
`commands/meterpreter-files.ts` uses). Opening a new session restores the real
blob with `Files.write(id, <real content>)`. Both directions are id-based, which
the SDK documents as not session-limited, and they are symmetric, so there is
nothing to create.

The gate does not depend on the wipe: `fileExtracted` additionally requires the
mission's own `ledgerWiped` flag to be false, so a `Files.Transfer` of a wiped
file never counts as the extraction. That flag is quest data, so it is reliable
even if the file write itself fails.

**What the live test has to confirm:** that `Files.write` on a remote root file
found by the id walk actually takes effect, and that `cat` / `download` then see
the new content. If it does not, the consequence is cosmetic — the player keeps
a readable file after failing the trace — and the mission is still completable,
because the penalty, the desktop breach and the re-armed trace do not depend on
it. The **destroy** ending does use `Files.remove(id)` on the same file, which is
one-way and therefore safe.

---

## 50. UNVERIFIED: a `Website.Exports` function called with a number, and a quest gate that depends on it

**Status: OPEN (harness only; M05's live test answers it).**
Raised: M05, 2026-10-02.

M01 proved the pattern: `LedgerVaultWebsite.Exports.flatlineOpenProject(folder)`
is called from page JS as a bare global, the mod emits
`flatline.m01.projectOpened`, and the quest listener advances. It has only ever
been called with a **string**.

M05's LeakIndex calls `flatlineOpenLeakRecord(record.id)` with a **number** (the
record's integer id, 1-10), and `controller/m05/crack.ts` compares
`data.id !== M05_CORRECT_LEAK_RECORD_ID` with `!==`, so a value that arrives as
`"1"` instead of `1` would silently never match and step 7 would be unreachable.
The page builds each row in JS and binds one click handler per row, so the id
never passes through the DOM as text — but the bridge between the page iframe and
the mod is not ours, and nothing says it preserves types.

**Fallback if the live test shows the step never fires:** send
`String(record.id)` from the page and parse it in the listener
(`Number.parseInt(String(data.id), 10)`). Both ends are one line.
`docs/m05-playtest.md` §6 is the step to watch; the probe line is
`[FP][M05] probe:leak-record-opened id=1 (match)`.

The same mission also relies on `Terminal.Lynx.Search` carrying a **bare string**
rather than an object, which is how M01's listener reads it. M05 binds both
shapes (`.Lookup` with `{input}` and `.Search` with a string), so whichever the
engine raises, the step advances; the untested half is simply dead rather than
broken.

**Update 2026-10-02 (audit fix pass).** The engine source settles that half
(entry #53): `lynx` raises **both** events on every run, `Terminal_Lynx_Search`
first with the resolved subject as a bare string and `Terminal_Lynx_Lookup` last
with `{ input, data }`. M05 reads both. What stays open is only the **number**
passed to the `Exports` function.

---

## 51. UNVERIFIED: a numeric progress stage in `SharedVariables` read from a website render, and eleven dynamic pages on one site

**Status: OPEN (harness only; M06's live test answers it).**
Raised: M06, 2026-10-02.

Entry #20 and #36 established what a `Website`'s `metadata()` can see: not
`SaveStorage`, and `Variables` / `SharedVariables` only when they were written
from a real game-event listener. M05 gates two sites on **booleans** written that
way. M06 gates eleven record pages, the filing archive, HostTrail and one
Echoline capture on a **number** — one monotonic stage 0-5 in
`flatline.m06.stage` (`context/m06/progress.ts`), compared with `>=` at render
time.

Two things could go wrong and neither shows up in a harness that stubs the SDK:

1. **The number comes back as a string or as `undefined`.** `readM06Stage()`
   falls back to `0`, which fails closed: every record 404s and the mission looks
   like it never started. If that happens, log `readM06Stage()` first; the fix is
   to store the stage as a string and parse it, or to store five booleans as M05
   does. A correct stage that is rendered one visit late is a different failure:
   see #55.
2. **`dirhunter` output length.** M06 registers 13 paths on `pcr-registry.org`
   (the home page, the filing archive and eleven records), the most the project
   has put on one site. #40 says `dirhunter` prints every
   registered path; it does not say what happens past some number of them. If the
   list is truncated, the hidden `/filings/archive/` may not be printed at all,
   and step 5 becomes unreachable by the route the spec intends. The paths are
   opaque codes for the same reason, so a truncated list is the only failure mode
   here, not a spoiler.

`docs/m06-playtest.md` §1 and §6 are the steps to watch. The probe lines are
`[FP][M06] probe:stage=<n>` and
`[FP][M06] probe:dirhunter-no-subnet host=pcr-registry.org`.

---

## 52. Mod pages default to `seo: false`, so the Goagle search lists no mod site

**Status: DOCUMENTED (read from the 1.3.13 engine; the in-game search was not run).**
Found: M05/M06 audit, 2026-10-02.

The engine builds every page of a mod `Website` with `seo: t.seo ?? false`
(static pages, offset 20529939; dynamic pages, offset 20530274) and the site
itself with `Popular: n.Popular ?? false`:

```js
function C2c(t,e,n,i,s){return{path:t.path,seo:t.seo??!1,search:t.search,metadata:...
```

Goagle's results page (`_Xs`, offset 10000372) only considers sites that have at
least one page with `seo !== false`:

```js
y=o7e().filter(se=>se.Pages.find(he=>he.seo!==!1))
```

No page in `src/` sets `seo` or `search`, and no site sets `Popular`, so **none
of the mod's sites can be returned by a Goagle search**, whatever the player
types. The world-building plan never asked for that (`04-web-layer.md` §C rows 5
and 6 and §D keep `Popular` and `search` in Tier 2, unproven), but the cloud
build of M05 and M06 relied on the player finding `echoline.net`,
`leakindex.net` and `hosttrail.net` by name, and nothing named them.

**Rule.** Every mission site, tool site and host the player needs must be named
in-world, as text, **before** the step that needs it: a mail, a page, a file. The
player types the host into the browser or the terminal. Do not count on search.
Setting `seo`, `search` or `Popular` stays Tier 2 until `weblab` proves it
(world-building README #9 and #16).

**What was done.** World-building README #38. M05: two Custodian follow-up mails
(`drop@drop.null`), the archive lead when `vaultRevisited` unlocks
`echoline.net` and the lookup lead when `edgeMapped` unlocks `leakindex.net`,
and a remote-access line on the two Echoline staff captures that names the
hospital edge host. M06: a follow-up mail at `snapshotsCompared` that names
`hosttrail.net` and the insurer's portal, and a Customer portal field on the
Mutual record. M07: the tip mail names `honeycheck.net` and the manifest names
`attrcheck`.

---

## 53. `lynx` resolves what the player typed before it raises its events, so a gate must accept every spelling it can resolve to

**Status: DOCUMENTED (read from the 1.3.13 engine; not yet seen live).**
Found: M05 audit, 2026-10-02.

`lynx <args>` (class `DTl`, offset 10674973 and following) joins its arguments,
strips a leading `#` or `@` (`replace(/^[#@]+/,"")`) and resolves the text with
`LTl` before anything else happens:

```js
function LTl(t){var i;const e=Orn(t);if(!e)return t;const n=(i=t.trim().match(/^([a-z0-9][a-z0-9-]*)\.[a-z.]{2,}$/i))==null?void 0:i[1];return bZt(e)??(n?bZt(Orn(n)):void 0)??t}
```

`Orn` normalises (NFD, accents removed, lower case, every character that is not
a letter or digit becomes a space, then all whitespace is removed). `bZt` takes
the first hit among: (1) the `input` of a registered `lynx` fixture, returned in
the **fixture's own spelling**; (2) a Twotter user whose `username` or
`name + surname` matches, returned as `"Name Surname"`; (3) a network user's
`firstName + lastName`. A bare `label.tld` falls back to its first label;
otherwise the typed text is used as it is.

The resolved subject `u` then drives everything:

- `Terminal_Lynx_Search` is triggered at the start with `u` as a **bare string**.
- The fixture is looked up with `u`, then with the typed text.
- `Terminal_Lynx_Lookup` is triggered at the end with `{ input: u, data }`.

So when a Twotter persona exists for the person, typing the **full name**
resolves to `"Name Surname"`, not to the handle the fixture was registered
under, and a gate that compares with the handle never fires. M05's
`gretaProfiled` compared with `"@g.desouza"` only, so `lynx Greta de Souza`, the
name the staff page prints, played the whole step with no result.

**Rule.** A `lynx` gate accepts every spelling the player can reach: the
fixture's handle input **and** the full name, and the fixture is registered
under each of them. This also settles the `Terminal.Lynx.*` half of #50.

---

## 54. Twotter renders the `@` itself: a persona `username` must not start with one

**Status: DOCUMENTED (engine read; M01 and M03 are the live precedent).**
Found: M05 audit, 2026-10-02.

Every Twotter surface prepends the `@` when it prints a handle: the post header
(offset 10366588), the profile header (10392442), the people list (10396808),
"who to follow" (10373175) and the account menu (10371832) all render
`["@", user.username]`, and `lynx` prints `Twotter account was found with the
registered username @${username}`. A stored username that already starts with
`@` therefore shows as `@@name`.

M01 and M03 store bare usernames: M03's persona is `d.reyes`
(`M03_TWOTTER_HANDLE`) while its `lynx` fixture input is `@d.reyes`. M05's two
personas were registered under `M05_GRETA_HANDLE` and `M05_GARETH_HANDLE`, which
carry the `@` (`@g.desouza`, `@g.lim`), so the UI showed `@@g.desouza`.

**Rule.** `PersonaSpec.username` is bare. The `@` belongs in text, in a `lynx`
fixture `input` and in `socialMedia` lines. A bare username still matches a
`@handle` fixture, because `lynx` strips a leading `@` from the typed text and
`Orn` ignores punctuation on both sides (#53).

---

## 55. A page's `metadata()` runs before the `Browser.Meta` event, so state raised by that event reaches the next render, not the visit that raised it

**Status: DOCUMENTED (engine read; the first-visit symptom was found by reading, not yet seen live).**
Found: M06 audit, 2026-10-02.

When the player opens a mod page the browser asks for the page first and only
then announces the visit (offset 20263196):

```js
const D=P0.GetMetadata(t.url);if(typeof D!="string")vt.Trigger("Browser_Website_Opened",D.website),vt.Trigger("Browser.Meta",D.meta),W0c(t.url,D),u(M(D.component,{...}))
```

`GetMetadata` runs the page's `metadata()` function, which is where a mod bakes
its HTML. `Browser.Meta`, and so every quest listener on it, comes after. A
mission that raises a progress mirror in a `Browser.Meta` listener and bakes
content from that mirror in `metadata()` therefore renders the **old** value on
the visit that raised it. M06's registry did exactly that: the stage went up in
the `Browser.Meta` handler while the home page baked its search payload from the
stage inside `metadata()`, so the first search after the tip answered "No
published entry matches that." until the player reloaded. It is the render-order
half of #36 (a render has no mod context) and of #51.

**Rule.** Content that depends on progress must be derived from state that
exists **before** the visit: raise the mirror from the event that precedes the
page (here the `Mail.Read` of the tip) or compute the value from quest data when
the mission starts. M06 now returns the register stage from `stageForM06` once
`tipReviewed`, runs `syncStage` on `Mail.Read` as well, and resets the mirror
unconditionally in `onObjectivesStartM06`: the monotonic `setM06Stage` let a
stale high stage survive `mods.reset`, which does not touch `SharedVariables`
(#44).

---

## 56. `.log` files open in the Log Viewer, which reads an array of entries, and `Files.read` cannot see that array

**Status: RESOLVED (engine read 2026-10-03; verified live by the owner the same day).**
Found: M4 live test, 2026-10-03 (every `firewall (n).log` showed "No logs recorded").

Double-clicking a file in the Files app maps its extension to an app: `.log` to the Log Viewer, `.txt` to the Text
Editor, `ts/js/json/md/conf/ini/sh/py` and similar to Code++ (offset ~20380200). Every open raises the engine event
`Files.Open` with `{ app, data }`, where `data` is the full file record and `app` is `LogViewer`, `TextEditor`,
`Code++`, or `FileExplorer` for a folder. The mod bridge forwards it under the same name, and base-game quests
listen to it next to `Terminal_Cat`.

**The viewer reads `data` as an array of `{ id, date, type, description }`** (date in ms). A plain string shows "No
logs recorded". Rows sort newest first, show `MMM D, HH:mm` (full date on hover) and need a unique `id`. Known
`type` values are `ACCOUNT_CREATION`, `CONNECTION_ETABLISHED` (sic, badge "Connection", green), `CONNECTION_LOST`
("Disconnected", amber) and `SHELL_OBTAIN` ("Shell Access", red); anything else is a grey "Event", and each distinct
unknown type string becomes its own filter chip. The player can *Delete Selected* entries, and deleting a
`SHELL_OBTAIN` entry claims the base-game achievement `ach_ghost_in_shell`, so a mission clue must not use that type.
The date is formatted in the player's **local** time (the engine never calls `.utc()` or `.tz()`): build it with
`new Date(year, month - 1, day, h, m, s)` so a story clock such as 03:14 reads 03:14 everywhere, not with `Date.UTC`.

**Terminal `cat` handles only `txt` and `log`.** For an array it prints `[YYYY-MM-DD HH:mm:ss] TYPE description` per
entry, for a string it prints the string, and it raises `Terminal_Cat`. `.conf` and other extensions print "Unable to
read file."

**The mod bridge passes `data` through unchanged** in `Files.create`, `createTree`, a device's `rootFiles` and a
user's `files`, so an array works with a cast (the typings say `data?: string`). But `Files.read`, `getById`,
`getByPath` and `getChildren` return `data` only when it is a string: mod code and widget iframes cannot read an
array log back. Keep a text copy where it is needed (the recovery console reads `breach.incidentLog` from the breach
save).

**`CommandTools.exec(cmd)` runs the command non-interactively and prints a returned string**, so
`tools.exec("cat <path>")` is how a mod command shows an array log.

**Fix shipped.** `components/log-file.ts` (`parseLog` turns syslog-style text into entries, types from keywords,
dates from the story day; `asLogData` is the one cast) and `components/file-reads.ts` (`onFileRead` listens to
`Terminal.Cat`, the `open` command's event and `Files.Open`, and matches names ignoring a ` (n)` copy suffix). M4's
three clue logs use them, so reading a clue by `cat`, `open` or the Log Viewer advances the same step
(`docs/world-building/README.md` #45). Since 2026-10-04 every file checkpoint reads through `onFileRead`: M1 (`sales_ledger`, `ops-relay`), M2 (`deploy.log`, `sync-home.txt`, the workstation files), M3 (`site_to_site_backup`, the Reyes note), M5 (statement, memo, ticket, Greta notes, found note) and M7 (`manifest.txt`, `ash-gate_backup.txt`), so a double-click in the Files app on a transferred copy advances the same step as `cat` or `open`. That also widened two paths that counted only one way: M2 `sync-home.txt` counted only `cat` (with an exact content match), and the M2 workstation files only `open`. The M7 ledger trap alone still listens to `open`. The `.log` files of M1, M2 and M5 (`sales_ledger`, `ops-relay`, `auth`, `cron`, `system`, `deploy`, `usb_history`) are Log Viewer entries.

**`ops-relay.log` shows only `[ENCRYPTED]` in the Log Viewer.** Its single entry keeps `[ENCRYPTED]` as the description and carries the base64 blob in the `type` field: the viewer maps an unknown type to a grey "Event" badge and never prints it, while `cat` prints `[date] TYPE description`, so the terminal shows `[2026-09-16 15:01:00] <blob> [ENCRYPTED]` and the blob is read and copied there. `DeviceSpec.typedLogs` fixes the type per file name. Read in the engine source (`cat` ~10640800, Log Viewer ~14825224), not yet seen in the game.

---

## 57. `Files.write` adds a duplicate record instead of replacing the file, and repeated `createTree` leaves `name (n)` copies

**Status: WORKAROUND (engine read 2026-10-03; the workaround has run through the owner's live M4 breaches).**
Found: M4 breach rebuild, 2026-10-03.

`Files.write(id, data)` is `Ur.Create({ ...record, data })`, which adds a second record with the **same id** and
renames it `name (1)`. `Files.read`, `getById` and `getByPath` keep returning the first (old) record, so the write
looks lost. The reducer's `remove` splices only the first match and ignores a missing id, and `Ur.Remove` on a missing
id pops the alert "This file cannot be deleted". `Files.remove` is fire-and-forget and settles on a microtask in
singleplayer; `createTree` adds synchronously with a new id per file. A name collision in `Create` renames by the
pattern `^name(?: \((\d+)\))?$` among files of the same parent and extension. Repeating `createTree` for the same name
therefore piles up `name (n)` copies: the owner's `~/logs` held 13 `firewall (n).log` files after a repeated test.

**Workaround.** `components/kernel-files.ts` and `recovery-console.html` never call `Files.write`. They sweep every
`name` / `name (n)` copy of the same extension (one `Files.remove` per record, polling by awaiting SDK calls until none
remain, up to 6 rounds of 60 polls, no timers) and then `createTree`. `controller/m04/firewall-log.ts` does the same
for `~/logs/firewall.log` at every rebuild.

**Still open.** M07's ledger (`controller/m07/tracking.ts`) and the Meterpreter wipe in #49 call `Files.write`, so the
duplicate behaviour may apply there; not checked live.

---

## 58. A full-screen desktop widget: geometry, keyboard focus and what a widget can reach

**Status: RESOLVED for geometry, file writes and typing (spike and owner live runs, 2026-10-03); the ESC and F1
forwarding was checked only in headless Chromium.**
Found: the recovery console spike, 2026-10-03 (`rcvspike`, since removed from `src/debug/`).

- `Files.createTree` writes real files on the player's PC at `/lib/modules/...`, `/etc/...`, `/boot/...` and
  `/var/log/...` (before the probe the root held `etc lib logs home`); they are found by path and read back equal.
- `window.HackhubSDK`, `Files` and `SaveStorage` exist inside a widget iframe (sandbox `allow-scripts
  allow-same-origin`). Its `src` is a path relative to the mod root and is **not** passed through `localizeHtml`, so a
  `{{t:KEY}}` would print literally: text reaches the widget through a `Variables` payload (the banner) or from the
  breach save (the console).
- The widget host sits in `_modWidget_` inside `_desktopBounds_` (z-index 10), inside `.desktop`, inside the fixed
  `.computer`. With a 1920x1009 window the `.desktopBounds` rect is `0,0 1920x965` and the taskbar is `0,965 1920x44`,
  so a widget sized to the window is 44 px too tall and leaves the taskbar uncovered. Size it from `.desktopBounds`,
  and to cover the hidden taskbar strip force the host to `position: fixed` below the title bar with a z-index of
  2147483000 (`components/recovery-widget.ts`).
- Keyboard input works once the geometry is right. **ESC and F1 are swallowed** while the iframe holds focus: the
  pause menu opens on a bubbling `document` keydown and the dev console on a `documentElement` keydown that skips
  INPUT, TEXTAREA and SELECT targets. The pause shell (z 100001) and dev console overlay (z 1000002) sit above the
  widget (z 10). The console forwards `Escape` and `F1` as a synthetic keydown on `parent.document.body`, and hands
  focus back to its input when nothing holds it.
- The glitch overlay cost nothing measurable: 199.5 fps baseline against 196.9 fps with six windows (one frame at 25
  fps, none over 50 ms).

---

## 59. `UI.toast` has no duration option

**Status: DOCUMENTED (engine read, 2026-10-02).**
Found: M4 live-test review, F3.

The bridge passes only `{ title, message, type }` to the engine's toast service, which fixes its own options, so a
mod cannot make a toast last longer. Text that must stay readable lives in the mod's own widget (the incident banner
holds a result for `RESOLVED_REAL_MS`) or in mail.

---

## 60. The SDK has no session-end event, and injected CSS outlives the desktop

**Status: WORKAROUND (engine read; `session-guard` was checked in headless Chromium, the leave-to-menu path was not
reported from the real game).**
Found: M4 breach, 2026-10-03.

The SDK exposes `Game.SessionStarted` only. Returning to the main menu removes the desktop from the DOM but not the
styles a mod put in `document.head` through `Theme.injectCSS`: the engine clears them only when a mod is disabled. A
locked desktop, a glitch overlay or a recovery widget would otherwise stay on top of the menu.

`components/session-guard.ts` watches `.desktopBounds` with a `MutationObserver`, runs the registered leave handlers
when the desktop leaves the DOM (lock CSS, glitch overlay and CSS, recovery host CSS, the banner and recovery
widgets) and keeps the `SaveStorage` state, and `Game.SessionStarted` re-applies everything from that state. Visual
functions do nothing while the desktop is not mounted.

---

## 61. A device behind a router: the router holds the port forward, and SSH goes to the device's own address

**Status: DOCUMENTED (engine read, 2026-10-03; the route was confirmed live in the M4 hunt).**
Found: M4 hunt, 2026-10-03 (the owner pointed `ssh` and `hydra :22` at the router and got "Connection to the remote
server could not be established." and "Could not connect to the server.").

`CreateSubnetNetwork` gives a router `lanIp` 192.168.1.1, numbers its children `192.168.1.n` in order (a `lanIp`
already set on a spec is kept, and it only has to be unique inside one router tree), and **moves each child device's
ports onto the router's port list** with `lanIp` set to the device's, deleting them from the device. The device keeps
its own public `ip`, with `parent` set to the router.

`Network.openPort(deviceIp, port)` (`vcr` and `A3t` in the engine) finds the device and its router and flips `active`
on the router's entry where `external === port` and `lanIp` equals the device's. For port 22 it also sets `ssh: true`
on the device, and it removes the `nmap` command fixture registered for that address. So a mission that opens a port
from an `UnlockSpec` and also wants a scripted `nmap` table must apply that fixture after `openPort`; the unlock order
in `core/unlock.ts` is fixtures, domains, then `openPorts`. This last point is a reading of the source and was not
checked live.

**Consequences.** The player connects to the **device's** address (`ssh -h svc@141.77.202.84`; `ssh` needs `-h`). The
router's own address answers only its own ports (`nmap` shows 80), so `ssh` and `hydra` aimed at `router:22` fail. M4's
`hydra` fixture is the router's web panel (`193.164.228.17:80`), whose credentials are the SSH login of the device
behind it; the engine's own text "attacking service ssh on target 193.164.228.17:80" nudges players to the router. The
incident log names both addresses ("from 141.77.202.84 ... nat gateway 193.164.228.17"); no extra hint exists yet
(one sentence in the Custodian's mail was proposed and is not written). `register`'s keep path (an existing network) leaves the network alone and does not re-apply
`UnlockSpec.openPorts`: a port opened earlier is still open because the network survives (#35).

**Also found in the M4-M7 run (filtered from the scratch notes).** A Scheduler job once awaited `import(...)`
inside its handler (`controller/m04/breach.ts`, first draft): an async boundary in the middle of a handler is exactly
how mod context is lost (#19). It is a static import now and `grep -rn "await import" src` is empty.

## 62. Goagle `search` keywords work only on static pages; a dynamic or gated page is found through its title or site name

**Status: DOCUMENTED (engine read and confirmed live, 2026-10-04; `docs/app-asar-reference.md` E-13).**
Found: weblab (`src/debug/portal-lab.ts`), 2026-10-04. The two Popular lab sites carried `search` keywords inside
`metadata()`. On Goagle only "endpoint monitor" found a site (the query is part of its title); "encrypt" and
"workstation console" found nothing.

The matcher reads `search` from the page object, and only a static page (`WebsitePageDefinition`) carries it there. A
dynamic page (`metadata()`) puts `search` on the object it returns, which the matcher never reads, so such a page can
match only through its title or the site's `SiteName`. After the lab pages became static every keyword worked, and a
partial query ("seoprob") still found a site through its `SiteName`.

**Consequences.** Every mission site goes through `gateMissionPages` and is therefore dynamic, so a `search` list on it
does nothing. A site that must be found by a phrase needs the phrase in its title or `SiteName`, or must be `Popular`
(#64). A static page cannot be gated (`docs/rules.md` §6), so the choice is per site. `docs/draft.md` §6.6 (the
Echoline keywords) is corrected accordingly.

## 63. A closed `seo` page still shows in Goagle when its closed branch returns `notFoundMetadata()`; return `null` for Goagle and the 404 object for a visit by address

**Status: WORKAROUND (the pattern passed a live test in `src/debug/seo-lab.ts`; not yet applied to `gateMissionPages`).**
Found: weblab, 2026-10-04 (`docs/app-asar-reference.md` E-14).

Goagle calls `metadata()` of every `seo` page for every query and drops a page only when the result is falsy.
`notFoundMetadata()` is an object, so a page that is closed that way is still listed, through its `SiteName` or the title
"404 Not Found". Returning `null` hides it, but then a visit by address shows nothing useful. Only Goagle sets
`context.searchStr`; a visit by address leaves it `undefined`. The rule that passed:

```ts
metadata: (context) => (isClosed() ? (context.searchStr === undefined ? notFoundMetadata() : null) : openPage())
```

Live results (site "Seoprobe Lab", page title "Seo Probe"): open, `seoprob` and `seo probe` found it; 404 object,
`seoprobe`, `404` and `not found` found it and `seo probe` did not; `null`, nothing found it; the rule above, nothing found
it on Goagle and the address showed the 404 page.

**Consequences.** `gateMissionPages` (`src/websites/global/page-guards.ts`) still returns `notFoundMetadata()` when a mission
is closed. No mission page sets `seo` today, so nothing leaks yet. The M5 foundation (`docs/draft.md` §3 and §6.6: the
hospital home page, Echoline) will, and then the closed branch must follow the rule above. `metadata()` also runs for every
Goagle query and twice per navigation (the cause was not read), so the closed check must be a pure read (#36).

## 64. An empty `Icon` shows a pale default globe that is almost invisible in the "Goagle apps" grid

**Status: RESOLVED for the lab sites; OPEN for the mission sites (every one sets `Icon = ""`).**
Found: weblab, 2026-10-04 (the owner: the Popular lab sites had no icon). `docs/app-asar-reference.md` E-15.

The grid lists every `Popular` site as a 32 px `<img src={Icon}>`. A falsy `Icon` is replaced by the engine's default, a
32 x 32 gray globe. The resolver accepts `http(s)://`, `data:` and `mod-asset://` URLs, and turns `./assets/x.png` into
`mod-asset://<mod>/assets/x.png`. The lab now sets `data:image/svg+xml` icons built in code, and the grid showed them. The
browser's bookmark list draws the same field (read in the engine, not seen live).

**Consequences.** A site that becomes `Popular` needs a real icon, a `data:` URI or a file under `public/assets/` (BACKTRACE
does the second for its app). LeakIndex (planned as a global Popular site, `docs/draft.md` §3.5) is the first mission case.
`Popular` is read once when the site class is built, so a site cannot become Popular at a step.

## 65. Website `Exports` carry numbers and return values, and a `SharedVariables` write inside one works, so a login needs no fallback

**Status: DOCUMENTED (engine read and confirmed live, 2026-10-04; `docs/app-asar-reference.md` E-16).**
Found: weblab (`src/debug/exports-lab.ts`), 2026-10-04. It closes the doubts recorded in `docs/m05-playtest.md` §15
(a numeric argument) and `docs/draft.md` R3 (a return value to the page).

Seen live: a string argument, a number argument (it arrives as a number) and a number inside an `Events.emit` payload (still a
number) reach the mod; the page receives the return value unchanged (string, number `43`, boolean, a plain object, and
`undefined` from a void function); `SharedVariables.set` works directly inside an `Exports` function and inside an
`Events.on` listener, and a terminal command reads the value; after a reload, `metadata()` reads the mirror and the page
shows it.

**Consequences.** A portal login can pass two strings, get a boolean back, write the mirror in the same call, and switch
view from the result or on reload. The "Continue" fallback of `docs/draft.md` §6.2 is not needed, and numeric ids
(`flatlineOpenLeakRecord(1)`, `flatlineMonitorLogin(1)`) can stay numbers. Not shown: whether code after an `await` inside an
`Exports` function still has the mod context (the engine pops it when the synchronous call returns, so assume not, #6 and
#19), and why a page's `metadata()` runs twice per navigation; a render must stay free of writes.

## 66. M5 v2 production sites: what the typecheck and the harness cannot show

**Status: UNVERIFIED (implementation 2026-10-05; none of this has run in the game).**
Found: while building the hospital web, the portal, Cipher Desk and Remote Desktop Connection from the lab. The mocked-SDK harness
(outside the repo) drives the real controllers and site `Exports` through the whole 20-step chain, so what is listed here is only
what the stub cannot reproduce. The live tests are in `docs/m05-playtest.md` §21.

| Item | What the code assumes | What would show it wrong |
|---|---|---|
| R12 long `Exports` strings | The 138-digit token (114 before the password change of 2026-10-05), the 120-digit sample and the 358-digit attachment (up to 4096 accepted) pass through a plain call. The 64-character chunk fallback was **not built**; the places to add it are `tokenCheck` in `rdcdesk/script.html`, `cipherObserve` in `cipherdesk/script.html` and `rdcdesk/exports.ts`, `cipherdesk/exports.ts` | Cipher Desk or RDC answer as if the input were empty; `[FP][CIPHER] run … inputLength=` shows a shorter length than the page sent |
| R15, R16 | RDC fonts, `cursor:none`, clipboard, and session restore through `flatlineRdcState()` on load work in the game iframe | A blank desktop, a pointer that stays visible, or a reload that returns to the login |
| R19 | Cipher Desk, RDC, LeakIndex and Echoline open by host with no subnet and no domain record | Their host does not resolve; fall back to `registerDomains` with `needsSubnet: true` (lab pattern) |
| `Popular` | Both new tool sites appear in the Goagle apps grid with their own icons | A pale globe or a missing tile |
| `Events.emit` timing | An `Events.emit` inside an `Exports` function reaches the quest listener before the call returns, so the returned Min is current | The sidebar lags one action; the page re-reads `flatlinePortalState()` on focus and 700 ms after every report as a safety net |
| Goagle search context | A search calls `metadata()` with an empty `url`; the hospital pages skip the HTTPS check when `searchStr` is set | A result titled "400 Bad Request" |
| Closed `seo` pages | Six hospital sites plus Echoline use the #63 pattern; outside M5 none of them is listed | A hospital result in Goagle with no mission running |
| Class-level `Exports` with dynamic pages | Works as LeakIndex does today (live) | The Webmail or portal buttons do nothing |
| zh text | The zh of the hospital web, the portal and the NOTE logs was written without owner review | Owner reads it |

Two defaults taken without a question: the `flatlineLogin` result is a string (`portal`, `contractor`, `denied`), because strings are
live-proven; and `flatlinePortalSeen` ignores every report that does not come from a Greta session.

## 67. A dynamic page listed by Goagle links to `<host>/search`: a mission site needs a `/search` alias

**Status: DOCUMENTED (engine read; owner's first live test of M5 v2, 2026-10-05). The alias is UNVERIFIED in the game.**
Found: the owner searched `pacificcare`, got the hospital results, and every click opened a 404
(`https://news.pacificcare-health.org/search`). The same happened to Echoline.

The engine builds a dynamic page's result address in `h2c` as `url = meta.pathname ?? l.url ?? t.path`. Goagle calls
`metadata()` with its own `meta`, so `pathname` is Goagle's `/search`, and the result click navigates to `site.Url + metadata.url`.
A static page (`d2c`) returns its own `path`, which is why the lab never showed it. Every `DynamicWebsitePageDefinition` that Goagle
lists therefore points at `/search`, whatever its real path.

**Consequences.** A listed dynamic page needs a second page registered at `/search` that renders the same content, with `seo` unset so
Goagle does not list it twice (`withSearchAlias` in `websites/m05/hospital/index.ts`; the Echoline index has one inline). `dirhunter`
prints it (E-3), so the host lists `/search` next to its real paths. A closed alias answers 404 by address, as a page without `seo`
does. Making the pages static is no way out: a static page cannot be closed outside the mission.

## 68. `lynx` does not resolve an email address, and a Goagle keyword search matches only titles and site names

**Status: DOCUMENTED (owner-tested in the game, 2026-10-05; the Goagle half is #62).**
Found: the owner searched `CONTACT` and the staff email with `lynx` and got nothing; searching the name worked. `lynx [search]` is an
OSINT lookup on a subject (a name or a Twotter handle); `Terminal.Lynx.Search` fires for every term typed, `Terminal.Lynx.Lookup`
only when the term resolved to a profile, and its `input` is the resolved full name (SDK `LynxLookupData`).

**Consequences.** A puzzle may hand the player an account name or a full name to type into `lynx`, never an email address or a
generic word. M5's `M05_GRETA_LYNX_INPUTS` accepts `@g.desouza`, `g.desouza` and `Greta de Souza`, and a fixture exists for each so the
terminal prints what the gate counts. The hospital site search follows #62: a result needs a word at the start of a keyword.

## 69. The M5 `door` and M7 `evidence` report fields still look for the old surname

**Status: FOUND (docs sweep, 2026-10-06). NOT FIXED: it needs the owner's EKSEKUSI.**
The rename of 2026-10-05 (README #66) changed `GRETA_FULL_NAME` to "Roxanne Anindita Natnaree" and `GRETA_SHORT_NAME` to "R. Natnaree",
but two lowercase term lists were not touched:

- `content/m05/report.ts:19-20`: `M05_REPORT_DOOR_TERMS = ["greta", "souza"]`, `M05_REPORT_DOOR_REJECTED_TERMS = ["gareth"]`, used by
  `matchesDoor` in `controller/m05/report.ts`. `M05_REPORT_DOOR` is `GRETA_FULL_NAME`, so even the sample answer fails. `matchesFields`
  needs `matchesDoor`, so the Mission 5 Findings report never matches and the mission cannot complete with the name the player has read.
- `content/m07/report.ts:20`: `M07_REPORT_EVIDENCE_PERSON_TERMS = ["souza"]`. `manifest.txt` prints `employee negligence (R. Natnaree)`
  (`M07_EVIDENCE_CLASSIFICATION`, `content/m07/server-files.ts:35`), and `matchesFields` in `controller/m07/report.ts` needs the term, so a
  player who copies the line fails the M7 report.

**Proposed fix (not applied):** `["roxanne", "natnaree"]` with `["gideon"]` rejected for M5, and `["natnaree"]` for M7. Checked while
looking: every other lowercase old-name string left in `src` is an internal id (the BACKTRACE key `greta`, `M05_LOG_GRETA`).
`docs/m05-playtest.md` section 18 and `docs/m07-playtest.md` state the intended terms and point here.

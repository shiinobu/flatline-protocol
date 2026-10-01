# FLATLINE PROTOCOL — Mission Implementation Structure Standard

Date: 2026-09-18
Status: **LOCKED** — mandatory structural pattern for every mission, M01
through M04. Must not change without the user's explicit request, regardless
of how any individual mission's story content differs.

This standard adapts entity-resolution-mods' own quest-structure standard
(`docs/implementation-rules.md` in that project) to FLATLINE PROTOCOL's
Hybrid `src/` layout (`docs/architecture.md`) — most rules below exist
because of a concrete bug/live-test finding in that other project, on the
same SDK version this project uses. Rules that assumed entity-resolution's
full `core/domain/state/application` layering have been dropped or
reworded; rules about SDK behavior are unchanged.

## 1. File split: `content/` declares, `main/` files call

> **Restructure in progress (2026-10-01).** M01 already follows the mission
> pipeline in `docs/architecture.md` (`main/m01.ts` is a thin class that
> delegates to `controller/m01/`; data lives in `content/m01/` and
> `i18n/m01/`; generic behavior in `core/`, `components/` and `middleware/`).
> This section and the rest of this file still describe the shape M02-M04 have
> until they are migrated, and will be rewritten once all four missions follow
> the pipeline.

- `src/content/mNN.ts` holds every piece of **data** a mission needs:
  target IPs/hosts, objective IDs, the `Objectives` array, nmap/lynx/
  dirhunter fixture results, network port lists, reward numbers, mail
  subjects/bodies/templates, delay constants (`setTimeout` durations),
  template IDs/labels, feed-post definitions, and the phone-call `Dialog`
  tree (all `QuestDialogDefinition` branches/lines — pure narrative data).
- `src/main/mNN.ts` is the **only** quest file — it only **imports
  and uses** those declarations. No local `const` literal arrays/objects
  duplicating content that `content/` already owns.
- Exception: small **helper functions** (fixture registration, host
  normalization, mail-send wrappers, event handlers) stay in the quest
  file — they are behavior, not content.
- **Watch for this specific mistake** (it bit entity-resolution-mods
  twice, on two different missions): a feed-post/`HackhubPost` definition
  or the `Dialog` tree quietly staying inline in the quest file instead of
  moving to `content/mNN.ts`. Check explicitly whenever a mission has
  dialogue or a feed post.

## 2. No dev/prod content forking

Mail bodies, feed-post text, delay/timer constants, and report subjects are
each a **single** value in `content/mNN.ts` — never a `_PRODUCTION`/`_DEV`
pair. Whether `isDev` is on or off, the player sees the same narrative
content; only unlock gating and reward-granting differ (see §2a).

Feed-post text: a short teaser that points to the mail for details, never a
near-duplicate summary of the mail's own body.

## 2a. `isDev` / `questGate` — the dev-focus flag

Ported from entity-resolution-mods' `src/content/dev-flag.ts` (that
project's own §7), adapted to this project's `mNN` mission ids and moved
into its own `src/guard/` folder (see `docs/architecture.md`) since it's
gating logic, not mission content or quest behavior.
`src/guard/flags.ts` exports:

- `isDev` — a single boolean, on while missions are still being built and
  live-tested.
- `isDebug` — turns on the tooling in `src/debug/` (every registration there
  goes through `debug/debug-gate.ts`). It **also** makes `questGate` return
  `[DEV_ISOLATION_LOCK]` for every mission, so a build with `isDebug = true`
  cannot start any story mission: flip it to `false` to play M01-M04.
- `isTester` / `TESTER_FOCUS_QUEST` — the same focus mechanism for an external
  tester build (`isQuestTesterFocus`); inert while `isTester` is `false`.
- `DEV_FOCUS_QUEST` — a `{m01..m04: boolean}` map with **at most one**
  entry `true` at a time (the file throws at import time if more than one
  is set) — the mission currently under active test.
- `isQuestDevFocus(missionId)` — `true` only when `isDev` is on and that
  specific mission is the focused one.
- `questGate(missionId, productionPrereqs)` — returns `[]` for the
  focused mission (so it's immediately playable, no prerequisite quests
  needed), `[DEV_ISOLATION_LOCK]` for every *other* mission while some
  mission has focus (a permanently-unsatisfiable prereq, so unfocused
  missions don't auto-start and interfere with focused testing), or the
  real `productionPrereqs` once nothing is focused (production mode).
- `applyDevGating(objectives, isFocused)` — strips every objective's
  `unlocksAfter` when `isFocused` is true, so **all** of that mission's
  objectives show at once instead of unlocking one-by-one — this is what
  makes a mission's full objective list visible immediately for testing,
  rather than waiting on the real chain order.

Every mission wires exactly three fields off this (M01: in
`src/controller/m01/spec.ts`, read by the class in `main/m01.ts`; M02-M04: in
their `src/main/mNN.ts` until migrated). The generic layers (`core/`,
`components/`, `middleware/`) never import `guard/`:

```ts
override QuestsToComplete = questGate("m0N", [ /* real prerequisite mission ids */ ]);
override Objectives = applyDevGating(M0N_OBJECTIVES, isQuestDevFocus("m0N"));
override Rewards = isQuestDevFocus("m0N") ? { money: 0, xp: 0 } : M0N_REWARDS;
```

The `Rewards` gate is this project's own adaptation of entity-resolution-mods'
"skip the reward block in dev" rule (§7 in that project) — since this
project has no manual reward-granting code (the SDK pays `Rewards`
automatically on `AutoComplete`, see `docs/architecture.md`), zeroing the
`Rewards` field itself is the equivalent: it stops the player's
money/xp from inflating across repeated test resets of the focused
mission, without touching any SDK-internal reward logic.

## 3. GoMail report-submission template

Every mission with a mail-based report objective registers a
`Mail.registerTemplate`:

```ts
Mail.registerTemplate({
    id: MNN_REPORT_TEMPLATE_ID,
    label: MNN_REPORT_TEMPLATE_LABEL, // dropdown display name — NOT the mail subject
    title: MNN_REPORT_SUBJECT,        // the real mail subject
    content: MNN_REPORT_TEMPLATE_CONTENT, // {{field}} placeholders
    fields: ["fieldOne", "fieldTwo"],
});
```

- `label` and `title` are different concerns — keep them as separate named
  constants.
- **Never call `Mail.unregisterTemplate()`.** GoMail re-renders a
  *previously sent* mail's history entry from its template at *view time*,
  not a snapshot frozen at send time. Unregistering retroactively corrupts
  every past sent-mail entry that used it. If this project ever confirms
  it live, log it as a new entry in `docs/bugs.md`.
- Under API v1 compatibility mode, sending via a registered template does
  **not** merge `{{field}}` into the `Mail.Sent` event payload —
  `data.subject` becomes the template `id`, `data.content` becomes a raw
  JSON object of the field values. Validate with the dual-path pattern
  below. **`apiVersion: 2` is set in this project's manifest** (untested
  whether it changes this specific behavior — verify empirically once the
  first mission with a GoMail report is live-tested, don't assume either
  way).
- A declared template `field` behaves as **mandatory** in the compose UI
  even with a `{{placeholder}}` present — leaving it empty keeps Send
  disabled, with no way to mark a field optional. If a design needs "field
  left blank" as a valid choice, register two templates (one fields-less,
  one with the field genuinely required) instead of one optional-field
  template.

## 4. Dual-path report validation

Every report-objective handler supports two submission paths and must not
require the player to pick one over the other:

```ts
private isXxxReport(subject: string, content: string): boolean {
    if (this.isTemplateXxxReport(subject, content)) {
        return true;
    }
    const normalizedSubject = subject.trim().toLowerCase();
    const normalizedContent = content.trim();
    const subjectMatches = normalizedSubject === MNN_REPORT_SUBJECT.toLowerCase()
        || normalizedSubject === `re: ${MNN_REPORT_SUBJECT}`.toLowerCase();
    return subjectMatches && normalizedContent === MNN_REPORT_BODY;
}

private isTemplateXxxReport(subject: string, content: string): boolean {
    if (subject !== MNN_REPORT_TEMPLATE_ID) return false;
    let fields: unknown;
    try { fields = JSON.parse(content); } catch { return false; }
    if (!fields || typeof fields !== "object") return false;
    const { fieldOne, fieldTwo } = fields as Record<string, unknown>;
    return fieldOne === MNN_EXPECTED_FIELD_ONE && fieldTwo === MNN_EXPECTED_FIELD_TWO;
}
```

Name "correct answer" values as constants in `content/mNN.ts`, shared with
the freehand `MNN_REPORT_BODY` construction, rather than hardcoding
literals twice.

## 5. `Mail.send` must never be called from inside `setTimeout`

`Mail.send()` does not fire reliably from inside a `setTimeout` callback
(nested or flat) on this SDK. `completeObjective(...)` from inside a
`setTimeout` **does** work reliably.

Rule: send any mail synchronously, in the same tick its trigger condition
is validated. Only objective completion is deferred, via exactly **one
flat, non-nested** `setTimeout`.

## 5a. Network/WeeChat topology belongs in `OnObjectivesStart`, not `OnStart` — MANDATORY RULE

Confirmed live (M01, 2026-09-18, `docs/bugs.md` entry 3): `OnStart()` runs
**exactly once, on first claim** — it never re-runs on a later game
restart, even after the mod is rebuilt and reinstalled. Any
`Network.createSubnetNetwork`/`Network.registerDomain`/
`WeeChat.createServer` call placed there is frozen at whatever it was
when the player first claimed the mission; fixing a network/port/topology
bug later has **no effect** on an already-claimed quest's live state,
because the only hook that (re)creates it never runs again.

**Rule:** every `Network.*`/`WeeChat.createServer`-style topology
call — anything a command needs to exist/route to, not narrative
content — goes in `OnObjectivesStart()`, made idempotent with a
fire-and-forget `Network.destroyNetwork(ip)`/`Network.removeDomain(domain)`
immediately before recreating (not awaited, to avoid the
await-before-create mod-context-loss risk on `createSubnetNetwork`'s own
SDK doc comment). Only genuinely one-time *content* — a seeded intro
mail, a seeded chat log line, a one-shot announcement — stays in
`OnStart()`; putting that in `OnObjectivesStart()` instead would
duplicate it on every restart.

## 6. Website protocol-gating

Every `Website`'s HTTP behavior follows the target's own nmap-fixture port
80/443 status. Shared, mission-agnostic building blocks for this live in
`src/websites/global/page-guards.ts` (`requireHttps`/`securePage`/
`notFoundPage`) plus their two error templates in the same folder — every
mission imports from there rather than keeping its own local
`http-error.html` copy and inline protocol check.

- **Port 80 `OPEN`** → plain `http://` allowed, serves real content.
- **Port 80 `CLOSE` or absent** → `http://` must return the shared 400
  "Bad Request" page (absent defaults to `CLOSE`); only `https://` serves
  real content. Every page on the site calls `requireHttps(context)` (or
  is built with the `securePage(...)` convenience wrapper) and returns
  early on a non-null result.
- **Port 443 `CLOSE`** → any `https://` request to that domain must
  return the shared 404 page instead of real content — nothing is
  actually there to serve, so build affected pages with `notFoundPage(...)`
  rather than leaving the domain's `Website` un-gated. If the domain has
  no `Website` registered at all, this is out of the mod's reach entirely
  (native engine behavior takes over) — nothing to build.
- **Port 443 `OPEN` but a specific path has no real content** (a
  retired/rotated slug, a stale cross-reference) → also use
  `notFoundPage(...)` for that exact path. The SDK has no wildcard/
  catch-all `path`, so this only covers paths we know about and register
  explicitly, never arbitrary unregistered routes.

Use a `DynamicWebsitePageDefinition` (its `metadata(context)` runs
mod-side and sees the real `context.url`) rather than a static
`WebsitePageDefinition` for any page that needs this gating — a
client-side script inside the sandboxed page cannot reliably see the
requested protocol, and a static page has no `metadata()` hook at all.

Relevant here: Mission 3's pfSense/finance-VLAN pivot and Mission 4's C2
dashboard both plausibly need this gating — confirm each target's intended
port-80 posture when building its `Website`.

## 7. Custom port targets

A hostname with an explicit non-default port (e.g. `host:8443`) is **not
resolvable** by HackHub's in-game browser — it never looks for a
registered `Website` at all in that case. Model any such service as a second `Website`
registered directly on a raw IP with a `status: "FORWARDED"`/`destination`
pointer from the nmap fixture, instead of a non-default port on a hostname.

## 8. Docs and workflow discipline

- `docs/changelog.md` is the mandatory timeline for this project — every
  real change (a bug found/fixed, a mechanic changed, a doc reorganized,
  a mission passing validation) gets a dated one-line entry there.
- Live-test findings/bugs go in `docs/bugs.md` as new numbered entries —
  never a new doc file.
- Standing process per mission: discuss the design/fix before touching
  code → implement → `npx tsc -p tsconfig.json --noEmit` → `npx tsx
  esbuild.config.ts` (build) → the user manually copies `dist/` into
  HackHub's mods folder and restarts → report back and wait for live-test
  feedback → iterate. Claude edits source and runs typecheck/build as
  verification only — never touches the mods folder or restarts the game.

## 9. Source comment policy — MANDATORY RULE: zero comments in `src/`

**No comments anywhere in `src/`**, at any point in development — not just
once a mission reaches FINAL LOCK. Any "why" a developer would normally
write inline goes into `docs/scratch.md` (scratch file, scoped to
whichever mission is currently under active development) while the
mission is being built; once that mission reaches FINAL LOCK, filter those
notes into `docs/bugs.md` (engine/SDK facts) or `docs/story.md` (design/
story rationale), then empty `scratch.md` back out. Verify with
`grep -rn "^\s*//" src/` — zero
matches expected at any point. Carried over unchanged from
entity-resolution-mods, where this was made an explicit hard rule
("TIDAK BOLEH ADA COMMENT DI SOURCE PROJECT") after comments drifted stale
against the actual shipped behavior.

## 10. Diagnostic tracing — MANDATORY RULE

Never call `console.log` directly for a debugging/trace print. If tracing
is needed, add one shared `trace(scope, message, ...args)` helper (mirror
entity-resolution-mods' `src/infrastructure/hackhub/logger.ts`) rather than
scattering ad-hoc `console.log` calls across quest files. Remove all
`trace()` calls from a mission's source once it reaches FINAL LOCK — it is
investigation tooling, not shipped behavior.

## 11. Every hacking/social tool comes from the SDK

Hard project-wide constraint, not specific to any one mission: every
hacking tool and every social/communication tool used to gate an objective
must come from `@hotbunny/hackhub-content-sdk`'s native surface (see
`docs/mechanics-reference.md`'s Master Tool Registry) or a custom command
built strictly on its primitives (`Shell.addCommandData`/`Files.*`/
`@RegisterCommand`). Anything outside that requires stopping to discuss
with the user first — this was explicit and repeated in the original
project brief.

## 12. Nmap port 443 realism — pairs with rule #6

A domain's `nmap` fixture must reflect whether it actually serves a page:

- **Has a real `Website` registered** (the player can browse real content
  there) → its nmap fixture must include `{ port: 443, status: "OPEN",
  service: "https" }`.
- **No `Website` registered** (nothing to serve) → its nmap fixture must
  explicitly show port 443 `CLOSE`, not be left unregistered. An
  unregistered IP and an explicit `CLOSE` read differently to a careful
  player; only the explicit form is correct.

Decorative subdomains with no page of their own (e.g. `api.`/`support.`/
`gateway.` aliases used only for OSINT/whois flavor) are exempt either way.
A deliberate exception to this rule (e.g. a Tor/`.dark` address modeled as
unreachable by ordinary scanning) must be written down — in
`docs/scratch.md` while the mission is still under active development, or
in `docs/story.md`/`docs/bugs.md` once it has reached FINAL LOCK — never
left as an unexplained gap.

## 13. BACKTRACE — MANDATORY RULE: one action yields at most one key finding

Set by the user on 2026-09-29 after a review of the M1-M3 trace inventory:
a single player action that traced several keys at once (M2's `affiliates`
dump traced 5, M3's ledger dump 4) "makes no sense".

- A **key** is one important finding earned by exactly one provable action.
  Only keys are counted and shown while a mission runs ("TRACED SO FAR // x
  OF N": title + value, never a description). `traceBacktraceFinding(mission,
  key)` takes a single key, and never from a handler that already traces
  another one.
- Every other fact that came with the action is an **extra**: it is not
  traced on its own, it is never the name of another mission's key, and it
  reaches the app only in the COMPLETE snapshot, where the report composes
  it into a Key Finding.
- A fact that merely carries over between missions (the case ID from M1, the
  buyer alias in M2, the shell company in M3) is never a key again in the
  later mission; it is an extra there.
- The Key Findings list in a report is the chain of events, not a mirror of
  the keys, and may be longer than the key list.
- Per-mission totals are a design decision, not a constant: M1 4, M2 7, M3
  6 today. Adding a key means adding a new action that proves it, not
  splitting an existing one.

Details, the checkpoint table and how to add a key: `docs/architecture.md`
(Applications: BACKTRACE).

## 14. Money numbers come from `src/content/global/finance.ts`

Every amount, date and split that appears in M2, M3 or BACKTRACE is derived
from the one batch table and waterfall in `content/global/finance.ts` (three ransom
batches, 60% parent / 25% panel / 5% broker / 10% retained, `splitRansom`,
`totalRansom`, `formatUsd`). Never type a currency amount into mission
content, a fixture, a report body or the BACKTRACE HTML by hand: M3's ledger
once said $42,000 while M2's ransom was $2,850,000 because two files held
two copies of the number. The HTML preview sample in `backtrace.html` is the
one deliberate hardcoded copy (it renders outside the game) and must be
updated together with the model.

## 11. Step gating and engine contexts — the M1 pattern (LOCKED 2026-10-01)

Every mission from M2 on follows what M1 proved in the live test:

1. **One gate table per mission** (`content/mNN/gates.ts`): a transitive chain,
   each progress flag requiring its predecessor, plus the `Unlock` table. All
   listeners call `advanceStep`; nothing sets a chain flag directly. The
   objective list may stay short — the mechanics still run in order.
2. **World information unlocks per step**, not at build: domains, fixtures,
   firewall rules and pages that reveal the next step go in an `UnlockSpec`
   (`fixtures`, `domains`, `removeFirewallRules`, `openPorts`). `subfinder`
   reads the Network store, so a domain registered at build is a leak.
3. **Gate pages with a read-only mirror**: a page that must stay closed until
   a step (M1's LedgerVault) reads a `SharedVariables` flag written from mod
   context. A page render never rolls, writes or calls `SaveStorage` (bugs #36).
4. **Early completion gets a reply, not silence**: a submission that is
   correct but premature is answered once (`sendReplacingMail`, tracked by id).
5. **Mails**: `Mail.send` mail survives `mods.reset` and `getInbox().subject` is
   blank. Wipe the mod's own senders at the first mission's `OnStart`
   (`withdrawMailFrom`) and track later replies by id (bugs #37).
6. **Networks**: never fire `destroyNetwork` concurrently or build right after
   an unawaited one. Use `core/register` / `unregister`, which defer to a
   sequential awaited Scheduler job (bugs #35).
7. **FINAL LOCK** (§9-10): `trace()` removed from the mission's source, zero
   comments, `tsc` clean. M1 reached it on 2026-10-01; M2-M4 migrate to this
   pipeline one mission at a time, each with a live test before the next.

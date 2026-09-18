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

- `src/content/mNN.ts` holds every piece of **data** a mission needs:
  target IPs/hosts, objective IDs, the `Objectives` array, nmap/lynx/
  dirhunter fixture results, network port lists, reward numbers, mail
  subjects/bodies/templates, delay constants (`setTimeout` durations),
  template IDs/labels, feed-post definitions, and the phone-call `Dialog`
  tree (all `QuestDialogDefinition` branches/lines — pure narrative data).
- `src/main/mNN-quest.ts` is the **only** quest file — it only **imports
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
`src/guard/dev-flag.ts` exports:

- `isDev` — a single boolean, on while missions are still being built and
  live-tested.
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

Every mission's production file (`src/main/mNN-quest.ts`) wires exactly
three fields off this:

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
80 status:

- **Port 80 `OPEN`** → plain `http://` allowed, serves real content.
- **Port 80 `CLOSE` or absent** → `http://` must return a "400 Bad
  Request" page (absent defaults to `CLOSE`); only `https://` serves real
  content. Use a `DynamicWebsitePageDefinition` (its `metadata(context)`
  runs mod-side and sees the real `context.url`) rather than a static
  page for this case — a client-side script inside the sandboxed page
  cannot reliably see the requested protocol.

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

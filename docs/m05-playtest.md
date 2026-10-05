# M05 "The Door" v2 — Playtest Script (20-step chain)

Status: **use once, disposable.** Step-by-step script for M05 as rebuilt on 2026-10-05 around the hospital web, the forensic
portal, Cipher Desk and Remote Desktop Connection (RDC). It replaces the script of the first M05 build (SSH chain). Nothing here
has run in the game yet: the code passed the typecheck and a mocked-SDK harness only (see §21). Delete or archive this file when M05
reaches FINAL LOCK. The design lives in `docs/draft.md` (gitignored, owner's draft v2) and `docs/world-building/08-spec-m5-m6.md`
(implementation notes) and `09-konten-m5-m6.md`.

**What M05 is.** A hospital's systems administrator lost her password in somebody else's breach, and her account was never closed.
The player gets in through the hospital's own remote-access portal, reads the failed controls from its forensic pages, opens a held
archive through a third-party remote-desktop console, and ends up with the paperwork that proves the named person was not the cause.
All people, hosts, companies and data are fictional and run inside HackHub's simulation.

**Language.** English and Simplified Chinese. The mission prose, the hospital web and the portal are both; every Remote Desktop
Connection and Cipher Desk page, including decrypted texts and the seven archive files, is **English only** (owner rule K15). The
zh strings of the hospital web and the portal were written without owner review: read them.

---

## 0. Entry point and log lines

M05's production prerequisite is `flatline.m04`. Test it alone with dev focus:

1. In `src/guard/flags.ts` set `DEV_FOCUS_QUEST.m05 = true` and every other entry `false` (`isDev = true`, `isDebug = false`,
   `isTester = false`). Build and install as usual, restart HackHub. **Put the flag back to `false` before committing.**
2. Expect `[FP][Flatline Protocol] FLATLINE PROTOCOL COMPLETELY LOADED!` and M5 listed as in progress in BACKTRACE.
3. The reward is skipped under focus: expect `[FP][M05] reward skipped under focus: 3200`, not `reward paid`.

Every probe line below is a temporary `trace()` (removed at FINAL LOCK); `docs/scratch.md` lists them.

| Scope | Line | Fires when |
|---|---|---|
| M05 | `probe:vault-revisited` | the vault's Q3 folder opens (step 2) |
| M05 | `probe:team-page-seen` | `https://pacificcare-health.org/it/team` opens (step 3) |
| M05 | `probe:staff-archive-compared` | the Echoline 2025 capture opens (step 4) |
| M05 | `probe:leak-record-opened id=N (match|decoy)` | LeakIndex Open (step 6) |
| M05 | `probe:password-cracked` | `john` prints the real password (step 7) |
| M05 | `portal:login view=portal|contractor` | `flatlineLogin` accepted a pair (step 8) |
| M05 | `probe:portal-seen kind=…` | a portal finding is counted (steps 9 to 13) |
| M05 | `probe:cipher-opened id=…` and `CIPHER opened id=… mission=m05` | Cipher Desk opened a sealed text |
| M05 / RDC | `probe:rdc-login cold`, `RDC login ok=…`, `RDC signal stage=…` | RDC token accepted, signal fixed |
| M05 / RDC | `probe:rdc-attached`, `RDC attach …` | `agent attach` succeeded (step 16) |
| M05 / RDC | `probe:rdc-read gate=N`, `RDC read …` | an archive file counted (steps 17 to 19) |
| M05 | `probe:status-note`, `probe:bedside-bonus` | optional extras |

---

## 1. Tip mail (step 1)

1. GoMail: one mail from `drop@drop.null`, subject **"the note in the vault"**. Read it. No trace line.
2. It sends you back to the hospital project in LedgerVault (the scan of a sticky note signed with one letter) and asks who that
   person is and who decided they were the cause. **No site is named.**

**Checks.** Another mail from the same sender must advance nothing. The two follow-up mails of the first build no longer exist.

## 2. Back into the vault (step 2)

1. LedgerVault, open the **Q3** folder: `probe:vault-revisited`. Other folders print nothing.
2. From this point `https://pacificcare-health.org/it/team` and `https://remote.pacificcare-health.org/` answer; before it both
   answer the 404 page. The hospital home page footer gains an "Information Technology" link.

## 3. The hospital web and the live team page (step 3)

1. Goagle, search **`pacificcare`**: the hospital home, Newsroom, Careers, Service Status and Patient Portal pages are listed (all
   `seo` pages; Webmail, Gateway and Remote are not). Open `https://pacificcare-health.org/`: the cached "SYSTEMS EXPERIENCING
   DISRUPTION" alert with the lock-screen image, four cards, About.
2. Open `/it/team` (footer link). Two staff only (Tara Nair, Ruben Wong), "We're hiring: Systems Administrator", the address format
   `initial.surname@pacificcare-health.org`, "Working off-site? Staff remote access: remote.pacificcare-health.org", "Last updated
   2026-09-02". `probe:team-page-seen`. Nobody named G is there.
3. Browse the other hosts for the contrast and the decoys: **Newsroom** (three statements, "We are not aware of any impact on
   patient safety."), **Careers** (SA-0826 posted 2026-08-26, policy 7.2), **Status** (everything Operational except "Operating
   Theatre 3 — Closed (maintenance)"; `probe:status-note` and one optional NOTE log), **Patient Portal** (unavailable), **Gateway**
   (vendor gateway retired 2026-08-15), **Webmail** (sign-in available on the hospital network only).

**Checks.** Outside M5 every one of these hosts answers 404 by address and is **absent** from Goagle. With the mission open, `http://`
serves the 400 page (but a Goagle search result must not). `dirhunter` on a hospital host prints only `/` (and `/it/team` on the home).

## 4. The two pages of the staff list (step 4)

1. Goagle, search **`echoline`** or **`web archive`** (it opens after step 3). Open the index, then the 2025-11-03 capture
   (`/s/8fq2/`): four people including **Greta de Souza** (Systems Administrator) and **Gareth Lim** (IT contractor). Compare with
   the live page: two names are gone.
2. `probe:staff-archive-compared`, the `dismissed` trace in BACKTRACE and one personal-log entry.

**Checks.** Opening the capture before step 3 must not advance (the step needs `teamPageSeen`). `https://echoline.net/s/zzzz/` 404s.

## 5. Profiling the administrator (step 5, parallel)

`lynx g.desouza` (or `lynx Greta de Souza`): three lines, then the `greta` trace. `lynx g.lim` is a decoy and traces nothing. Her
Twotter profile has 16 posts (one sealed: see §14); Gareth's has 5.

## 6. The breach index (step 6)

Browse `https://leakindex.net/` (it is a **permanent** site in the Goagle apps grid, not a mission site). Search
`g.desouza@pacificcare-health.org`; record **1** (MedVendor Portal 2025) is the match; Open it: `probe:leak-record-opened id=1
(match)`. Any other record prints `(decoy)` and does not advance. The table shows only the first six hash characters until Open.

## 7. The password (step 7)

`john a3106b24578d51822fb862154d11b89d` prints `Marigold2019` and `probe:password-cracked`. A decoy hash prints nothing.

## 8. The portal login (step 8)

1. `https://remote.pacificcare-health.org/`: the staff sign-in (two fields and a button).
2. Wrong pair: "Sign-in failed. Check your username and password." Right pair `g.desouza` / `Marigold2019`: the portal opens at
   **Overview** with only Overview and Sign-ins in the sidebar. `portal:login view=portal`.
3. Decoy: `g.lim` / `printroom01` opens a **Profile** page only ("No managed systems are assigned to this profile. Contract ended
   2026-07-31.") and advances nothing. Reporting from that session is ignored.

**Checks.** The page source must contain neither password. A reload while signed in shows the portal again; Sign out then reload shows
the login. After a Min change the page re-reads the state on window focus.

## 9. Sign-ins (step 9)

Overview flags the first alarm; "Open sign-ins". Sign-ins → **By source** (sortable headers) → find the address with location
"Unresolved, no PTR", zero failures and one account (**194.36.108.20**) → View sign-ins → **Flag** any of its five rows
(2026-08-11 00:41 UTC first). `probe:portal-seen kind=foothold`, Min 1 (Directory and Tickets appear with a "New" badge), one
optional NOTE log. Decoys: `svc-vendor` every 01:50, `g.lim` after the contract, Tara's hotel, the failed storm on 9 July.

## 10. Tickets (step 10)

Tickets → **HD-4503** (hr.ops, "Account closure: G. de Souza"): it points to HD-4417 and 30 June. `kind=separation`, Min 2 (Config).
HD-4481 (the USB, no reply) and HD-4496 (a hex string) are the other tickets that matter; opening them counts nothing.

## 11. Config, 30 June (step 11)

Config → compare two snapshots around 2026-06-30 → "View change record" on **CHG-2606-022**. The card carries "Attachment:
rollback_plan (sealed)", a 358-digit hex and "Sealed with the change ID". Open Cipher Desk (`https://cipherdesk.io`, Goagle apps or
search `encrypt`): mode **Decrypt**, passphrase **`CHG-2606-022`**. The text says the identity-migration window was never closed and
manual account closures are held (see HR-7). `kind=controls` is recorded when the card opens, `rollbackOpened` when Cipher opens it;
the step counts when **both** have happened, in either order. Min 3 (no new page).

## 12. Config, the legal hold (step 12)

Compare snapshots around 2026-08-09 to 2026-08-16 → CHG-2608-014 (Legal hold, matter **L-2608-03**, approved by the CRO's account at
05:20 UTC). `kind=hold`, Min 4: Systems and Network appear.

## 13. Systems and Network (step 13)

Systems: `arc-ir-01` is **Cold-Chart**, 192.168.1.4 (not `arc-img-02`); the note points to Remote Desktop Connection at
`https://rdcdesk.io` and an access token. Network: IR-22 (tcp/22), the NAT table (`ssh:22` for Cold-Chart; a decoy, see §16).
`kind=systems` counts on opening Systems.

## 14. The sample token and the sealed post (step 14, optional post)

1. Tickets → HD-4496: the second note is a 120-digit hex. Cipher Desk, **Decrypt**, passphrase **`L-2608-03`** (the matter number): five
   parts `user:password:LAN address:change:tag` (`t.nair:…:192.168.1.5:CHG-2608-009:PC-IT-017`). `sampleOpened` is recorded when it
   decrypts and **counted after the hold** (step 12).
2. Optional: Greta's sealed Twotter post (hex, "Notes to self.") with passphrase `Marigold2019`: one NOTE log, nothing advances.

**Checks.** A wrong passphrase prints nothing useful and records nothing. Encrypt mode never opens a sealed text.

## 15. The token and the RDC login (step 15)

1. Build the Cold-Chart token as `user:password:LAN address:change:tag` (Greta's pair, 192.168.1.4, CHG-2608-014, arc-ir-01) and
   **Encrypt** it in Cipher Desk with the matter number `L-2608-03` (114 hex digits; the first digits are `2b0356534357584a`).
2. `https://rdcdesk.io`, paste the hex, Login. Wrong parts answer in this order: "Token unreadable.", "Token format not recognised.",
   "Sign-in failed.", "Address is not on the monitoring network.", "Address and device tag do not match.", "Approval does not cover
   this address." Three failures lock the form for 15 seconds. The sample token is rejected ("Sign-in failed."). Tokens for the other
   three hosts open a console without a display module.
3. A valid Cold-Chart token: `probe:rdc-login cold` and the agent console. Reload the page: the console comes back
   (`flatlineRdcState`).

## 16. The agent console and the display (step 16)

`help`, `agent lease list`, `agent lease clear <pid>` (only the dead pid), `signal sources|relays`, `signal set <key> <value>`,
`signal calibrate`, `signal apply`, `agent attach`. The puzzle is generated per run (see the Remote Desktop Connection window and
`man signal|format|agent`). When the display is clean, `agent attach` shows the Cold-Chart desktop with the archive window.
`probe:rdc-attached`, the `archive` trace, one personal-log entry, and the Bedside-17 half of `hospitalShells` (rule IR-3389 removed,
port 3389 opened; the firewall rule IR-22 and Cold-Chart's port 22 are **not** touched).

**Decoy.** `ssh` to Cold-Chart's public address is refused (hold IR-22). The firewall console wants `r.wong`, whose password is
nowhere in the game. Webmail answers "This account was disabled on 2026-08-19." to Greta's correct pair.

## 17. The three documents (steps 17 to 19)

In the archive window open `acknowledgement_gdesouza.txt` (`statement`), `decision_memo.txt` (`decisionMemo`), and
`usb_ticket_PC-IT-017.txt` (`usbTicket`); four decoys (`finding_draft_v1`, `finding_final`, `asset_register`, `notes`) read without
effect. Each counts only **after** `agent attach`. The gap is 02:41 to 09:02: **6 hours 21 minutes**.

## 18. The report (step 20)

Reply to `drop@drop.null` with the **Mission 5 Findings** template (six empty tokens; unchanged from the first build):

| field | an accepted answer | match needs |
|---|---|---|
| `door` | `Greta de Souza` | "greta" or "souza", no "gareth" |
| `cause` | `unauthorised USB media, employee negligence` | a USB term and a fault term, no vendor term |
| `decider` | `Vivien Orchid` | "orchid" or "vivien" |
| `gap` | `6 hours 21 minutes` | 6 and 21, or 381 |
| `motive` | `insurance claim classification` | "insur", "claim" or "cover" |
| `archive` | `Cold-Chart` | "cold chart" |

Sent before steps 17 to 19 and the `greta` trace: one reply "not yet" naming the first unmet step, replaced (not stacked) on the next
send. Complete: the objective and the mission complete; outside focus `[FP][M05] reward paid: 3200`.

## 19. BACKTRACE

Six required keys, unchanged: `dismissed`, `greta`, `archive`, `statement`, `decisionMemo`, `usbTicket`. Six **optional NOTE logs** are
new (`MISSION_LOGS`, `backtrace-logs.ts`): foothold, separation, controls, hold (portal findings), the Theatre 3 status note and
Greta's sealed note; the Bedside-17 note stays. The report card must have no `—`.

## 20. Optional: Bedside-17

After step 16 port 3389 is open. `bluekeep` against `80.94.92.118:3389`: `probe:bedside-bonus`, then `found_note.txt` (one log) and
`usb_history.log` (Log Viewer).

---

## 21. What only the game can prove (live tests owed)

| # | Check | Why it is unproven |
|---|---|---|
| R12 | Long `Exports` strings: the 114-digit token, 120-digit sample, 358-digit attachment (up to 4096 accepted) | only short strings were seen live; the 64-character chunk fallback is **not built** |
| R15 / R16 | RDC fonts, `cursor:none`, clipboard, session restore through `flatlineRdcState()` on load | read from the engine, not seen |
| R19 | Cipher Desk and RDC (and LeakIndex, Echoline) have no subnet or domain record | `registerDomain` needs a subnet; a site opened by host alone is read, not seen |
| — | `Popular` grid shows both new tool sites with their own icons | static; first time in play |
| — | `Events.emit` from `Exports` reaches the controller before the call returns | the portal re-reads state after 700 ms and on focus as a safety net |
| — | A Goagle search calls `metadata()` with an empty `url` | the hospital pages skip the HTTPS check when `searchStr` is set |
| — | The full 20-step chain and its length | estimate 60 to 115 minutes |

## 22. Known follow-ups

- `M05_LOG_NOTES` ("she plugged it in…") has no trigger since v2; HD-4481 counts nothing.
- A portal login before `john` cannot advance; the next portal observation retries it (harness-tested).
- The zh text of the hospital web and the portal needs the owner's read.
- The M1 hospital site was moved to M5 (`public/assets/m05/pacificcare-lockscreen.png`); M1's eight domain records are left alone.

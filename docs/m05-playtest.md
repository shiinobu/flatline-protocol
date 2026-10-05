# M05 "The Door" v2 — Playtest Script (21-step chain)

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
| M05 | `probe:team-page-seen` | `https://pacificcare-health.org/it` opens (step 3) |
| M05 | `probe:change-record-seen` | `https://pacificcare-health.org/it/change/SA-0826` opens (step 4) |
| M05 | `probe:capture-seen early` or `late` | a gating Echoline capture opens (step 5; `early` is capture `8fq2` of 2025-11-03, `late` is capture `4ec9` of 2026-08-18) |
| M05 | `probe:greta-seen` | `lynx` resolves Roxanne (step 6) |
| M05 | `probe:cipher-opened id=…` and `CIPHER opened id=… mission=m05` | Cipher Desk opened a sealed text: `handoverNote` (step 7), `recoveryFormat` (step 8) |
| M05 | `portal:login view=portal`, `contractor` or `retired` | `flatlineLogin` result (step 9) |
| M05 | `probe:portal-seen kind=…` | a portal finding is counted (steps 10 to 14) |
| M05 / RDC | `probe:rdc-login cold`, `RDC login ok=…`, `RDC signal stage=…` | RDC token accepted, signal fixed |
| M05 / RDC | `probe:rdc-attached`, `RDC attach …` | `agent attach` succeeded (step 17) |
| M05 / RDC | `probe:rdc-read gate=N`, `RDC read …` | an archive file counted (steps 18 to 20) |
| M05 | `probe:status-note`, `probe:bedside-bonus` | optional extras |

---

## 1. Tip mail (step 1)

1. GoMail: one mail from `drop@drop.null`, subject **"the note in the vault"**. Read it. No trace line.
2. It sends you back to the hospital project in LedgerVault (the scan of a sticky note signed with three initials) and asks who that
   person is and who decided they were the cause. **No site is named.**

**Checks.** Another mail from the same sender must advance nothing. The two follow-up mails of the first build no longer exist.

## 2. Back into the vault (step 2)

1. LedgerVault, open the **Q3** folder: `probe:vault-revisited`. Other folders print nothing. The folder holds seven photographs
   (receipt, site recon, ward corridor, BLACKLEDGER notice, locked surgical scheduling, access kit, visitor pass) and four text files;
   `found_note.txt` is a hand-written note signed "-- R.a.N", and the access kit photo shows the USB marked "Q3-2026-SEA" and the
   asset tag "PC-IT-017" (README #67).
2. From this point `https://pacificcare-health.org/it`, the two document pages under it, their site-search results and
   `https://remote.pacificcare-health.org/` answer; before it all of them answer the 404 page. The hospital home footer gains an
   "Information Technology" link.

## 3. The hospital web and the live IT page (step 3)

1. Goagle, search **`pacificcare`**: the hospital home, Newsroom, Careers, Service Status and Patient Portal pages are listed (all
   `seo` pages; Webmail, Gateway and Remote are not). **Click a result:** it must open the site, not a 404. Every Goagle result of a
   dynamic page links to `<host>/search` (`docs/bugs.md` #67), so each of those sites registers a `/search` alias that renders the
   same page. Open `https://pacificcare-health.org/`: the cached "SYSTEMS EXPERIENCING DISRUPTION" alert, four cards, About.
2. Every hospital page has a **Search PacificCare** box (titles and keywords only, no description match). `it` lists the IT page
   after step 2; a query shorter than two characters does nothing.
3. Open `/it` (footer link, or `dirhunter pacificcare-health.org`). **Fourteen** staff (Valerie Kirana Dizon, Rafael Surya Bautista, Delphine Prabha Wattanakul, Maxwell Satria Mercado,
   Isadora Cahya Nguyen, Jasper Dharma Aquino, Celestine Mayang Ong, Ophelia Kinanti Salleh, Natalia Sari Dumlao, Lucian Pranaja Bui, Juliette Anjani Villanueva, Orion Bima Ismail, Evangeline Chandra Phan, Felix Jayendra Ramasamy),
   the address format `initial.surname@pacificcare-health.org`, "We're hiring: Systems Administrator", "Working off-site? Staff remote
   access: remote.pacificcare-health.org", "Last updated 2026-09-02". Nobody with the initials R.a.N is there and nothing says anyone left.
   `probe:team-page-seen`.
4. Under the table, **IT notices**: four threads between Valerie and Rafael (the old team page, remote access for new starters, the status
   page, the recovery window). They hint and name nothing.
5. The other hosts feed the later steps: **Careers** (SA-0826 posted 2026-08-26, policy 7.2, and "This opening replaces a previous
   Systems Administrator position following the August 2026 systems disruption."), **Status** (components carry their codes, OT1 to
   OT3; incident 1 starts with Operating Theatre 3; incident 2 says legacy administrative access was reviewed; `probe:status-note`
   and one optional NOTE log), **Newsroom** (the 2026-08-24 statement mentions validation of legacy administrative access),
   **Patient Portal** (unavailable), **Gateway** (retired 2026-08-15), **Webmail** (hospital network only).
6. The hospital home carries eight photographs (`public/assets/m05/hospital-hero.jpg`, `hospital-care-emergency|womens|heart|children|diagnostics.jpg`,
   `hospital-specialty.jpg`, `hospital-about.jpg`, 1248 x 832) as CSS backgrounds in `frame.html`; the old gradients stay underneath as a
   fallback, and the specialty and about panels carry a dark overlay so the white slogan stays readable. Under "Read the latest service
   notice" the alert shows `pacificcare-lockscreen.jpg`, a flat 1536 x 864 screen capture of the BLACKLEDGER lock screen (logo,
   "SYSTEM UNAVAILABLE", "Q3-2026-SEA", three lines; no room and no theatre sign, so "Operating Theatre 3" is not given away on the
   public home page), with the note "cached error page — last refreshed automatically. IT has been notified."

**Checks.** Outside M5 every one of these hosts answers 404 by address and is **absent** from Goagle. With the mission open, `http://`
serves the 400 page (but a Goagle search result must not). `dirhunter` on the home host prints `/`, `/search`, `/it`,
`/it/change/:id` and `/it/policy/:id` (E-3 prints every registered path; the tokens stay hidden). Not yet seen in the game.

## 4. The change record (step 4)

1. Site search **`SA-0826`**: "IT Change Record — SA-0826" (it lists only after step 2). Open it: change type, status Closed, the
   reason (replacement of the Systems Administrator role after the August 2026 disruption), review requirement "Legacy administrative
   access", "Historical roster verification: Required", **Historical source: Echoline Archive** (a link to `echoline.net`) and
   **Capture reference: 8fq2**. Below, a **Handover note**, sealed to "the previous holder's staff account name", as a hex block.
2. `probe:change-record-seen`. Echoline now lists captures; Goagle finds it by `echoline`. Opening the record before `/it` is held and
   counted when `/it` is seen.

## 5. The nine captures (step 5)

Echoline (`https://echoline.net/`) lists nine captures of `pacificcare-health.org/it`: 2024-05-14, 2024-10-18, 2025-03-12, 2025-07-29,
2025-11-03 (`8fq2`), 2026-01-22, 2026-03-18, 2026-06-30 and 2026-08-18. Roxanne Anindita Natnaree (Systems Administrator) is in every capture up
to 2026-06-30 and gone on 2026-08-18. Gideon Bayu Teoh (IT Contractor, to 2026-07) appears from 2025-11-03 and is gone on 2026-08-18 too;
Dorian Aditya Hoang, Seraphina Laksmi Pangestu, Caspian Danendra Yeoh, Sebastian Indra Siregar, Matteo Candra Dang and Cassian Wira Nasution left earlier; Jasper Dharma Aquino and Orion Bima Ismail stay; Aurelia Padma Sutedja
and Zara Indira Abdullah leave after 2026-08-18. The only role Careers reopens is Systems Administrator.

`probe:capture-seen early` is capture `8fq2` (2025-11-03, the one the change record cites) and `late` is capture `4ec9` (2026-08-18);
the other seven captures count for nothing. The step counts when **both** have been opened, in any order, and prints the `dismissed`
trace and one personal-log entry.

Each capture page shows "Capture N of 9" with Previous and Next, a Status column (Listed or Joined) and a Date column (first captured),
the staff rows with their addresses, the shared mailboxes `servicedesk@` and `it.ops@`, a "Page last updated" stamp, a +n/-n change chip,
a "Left" block (rows listed in the previous capture and not in this one, struck through, with their last captured date), an archivist
note and, on the 2026-08-18 capture, a line saying the live page has been updated since. The local-part of Roxanne's address
(`rnatnaree`) is the Cipher Desk key of step 7.

**Checks.** `https://echoline.net/s/zzzz/` 404s. Before the change record, the index and every capture answer 404.

## 6. Profiling the administrator (step 6)

`lynx rnatnaree` (also `lynx @rnatnaree` and `lynx Roxanne Anindita Natnaree`): three lines, then the `greta` trace. **`lynx` does not resolve an
email** (tested in the game on 2026-10-05). `lynx gteoh` is a decoy and traces nothing. Her Twotter profile has 18 posts (one sealed:
see §14; the ones that matter are "OT3 again", "0814 was the night nobody in IT will forget" and the two about legacy access and
recovery procedures). `probe:greta-seen`; a lookup before step 5 is held and counted after it.

## 7. The handover note (step 7)

Cipher Desk (`https://cipherdesk.io`; Goagle apps or search `cipher`; the IT notices mention a cipher desk): mode **Decrypt**, the hex from
the change record, passphrase **`rnatnaree`**. The text says the legacy recovery procedure is filed as `IT-DEPT-77`, to be searched in
the PacificCare documents, and to take the system code and the date from the incident record.
`probe:cipher-opened id=handoverNote`; counted after step 6.

## 8. The policy, the password and the portal login (steps 8 and 9)

1. Site search **`IT-DEPT-77`** (exact match only): "IT-DEPT-77 — Remote Access and Legacy Accounts" at
   `https://pacificcare-health.org/it/policy/IT-DEPT-77`. Plain text: legacy administrative accounts may stay active for a limited
   recovery window. Then a sealed **Recovery validation format** hex. Cipher Desk, **Decrypt**, passphrase **`SA-0826`** (the closing change
   reference): `<account local-part>-<affected system code>-<incident date>`, values exactly as recorded in the incident documentation.
   `probe:cipher-opened id=recoveryFormat` (step 8).
2. Local-part `rnatnaree`, system code `OT3` (Status), incident date `2026-08-14` (Status, Twotter "0814"): the password is
   **`rnatnaree-OT3-2026-08-14`**. `https://remote.pacificcare-health.org/`: the staff sign-in (two fields and a button). Wrong pair:
   "Sign-in failed. Check your username and password." Right pair `rnatnaree` / `rnatnaree-OT3-2026-08-14`: the portal opens at
   **Overview** with only Overview and Sign-ins in the sidebar. `portal:login view=portal` (step 9).
3. The old password `Marigold2019` (LeakIndex record 1, `john`) answers "This password was retired during recovery." and
   `portal:login retired`; it still opens Roxanne's sealed Twotter post (§14). LeakIndex gates nothing any more.
4. Decoy: `gteoh` / `printroom01` opens a **Profile** page only ("No managed systems are assigned to this profile. Contract ended
   2026-07-31.") and advances nothing. Reporting from that session is ignored.

**Checks.** The page source must contain neither password. A reload while signed in shows the portal again; Sign out then reload shows
the login. After a Min change the page re-reads the state on window focus. A login before step 8 cannot advance; the next evidence
event or portal observation retries it.

## 9. Sign-ins (step 10)

Overview flags the first alarm; "Open sign-ins". Sign-ins → **By source** (sortable headers) → find the address with location
"Unresolved, no PTR", zero failures and one account (**194.36.108.20**) → View sign-ins → **Flag** any of its five rows
(2026-08-11 00:41 UTC first). `probe:portal-seen kind=foothold`, Min 1 (Directory and Tickets appear with a "New" badge), one
optional NOTE log. Decoys: `svc-vendor` every 01:50, `gteoh` after the contract, Valerie's hotel, the failed storm on 9 July.

## 10. Tickets (step 11)

Tickets → **HD-4503** (hr.ops, "Account closure: R. Natnaree"): it points to HD-4417 and 30 June. `kind=separation`, Min 2 (Config).
HD-4481 (the USB, no reply) and HD-4496 (a hex string) are the other tickets that matter; opening them counts nothing.

## 11. Config, 30 June (step 12)

Config → compare two snapshots around 2026-06-30 → "View change record" on **CHG-2606-022**. The card carries "Attachment:
rollback_plan (sealed)", a 358-digit hex and "Sealed with the change ID". Open Cipher Desk (`https://cipherdesk.io`, Goagle apps or
search `encrypt`): mode **Decrypt**, passphrase **`CHG-2606-022`**. The text says the identity-migration window was never closed and
manual account closures are held (see HR-7). `kind=controls` is recorded when the card opens, `rollbackOpened` when Cipher opens it;
the step counts when **both** have happened, in either order. Min 3 (no new page).

## 12. Config, the legal hold (step 13)

Compare snapshots around 2026-08-09 to 2026-08-16 → CHG-2608-014 (Legal hold, matter **L-2608-03**, approved by the CRO's account at
05:20 UTC). `kind=hold`, Min 4: Systems and Network appear.

## 13. Systems and Network (step 14)

Systems: `arc-ir-01` is **Cold-Chart**, 192.168.1.4 (not `arc-img-02`); the note points to Remote Desktop Connection at
`https://rdcdesk.io` and an access token. Network: IR-22 (tcp/22), the NAT table (`ssh:22` for Cold-Chart; a decoy, see §16).
`kind=systems` counts on opening Systems.

## 14. The sample token and the sealed post (step 15, optional post)

1. Tickets → HD-4496: the second note is a 120-digit hex. Cipher Desk, **Decrypt**, passphrase **`L-2608-03`** (the matter number): five
   parts `user:password:LAN address:change:tag` (`valerie.dizon:…:192.168.1.5:CHG-2608-009:PC-IT-017`). `sampleOpened` is recorded when it
   decrypts and **counted after the hold** (step 13).
2. Optional: Roxanne's sealed Twotter post (hex, "Notes to self.") with passphrase `Marigold2019`: one NOTE log, nothing advances.

**Checks.** A wrong passphrase prints nothing useful and records nothing. Encrypt mode never opens a sealed text.

## 15. The token and the RDC login (step 16)

1. Build the Cold-Chart token as `user:password:LAN address:change:tag` (Roxanne's pair, 192.168.1.4, CHG-2608-014, arc-ir-01) and
   **Encrypt** it in Cipher Desk with the matter number `L-2608-03` (138 hex digits; the first digits are `3e4353425e595f55`, from `rnatnaree:rnatnaree-OT3-2026-08-14:192.168.1.4:CHG-2608-014:arc-ir-01`).
2. `https://rdcdesk.io`, paste the hex, Login. Wrong parts answer in this order: "Token unreadable.", "Token format not recognised.",
   "Sign-in failed.", "Address is not on the monitoring network.", "Address and device tag do not match.", "Approval does not cover
   this address." Three failures lock the form for 15 seconds. The sample token is rejected ("Sign-in failed."). Tokens for the other
   three hosts open a console without a display module.
3. A valid Cold-Chart token: `probe:rdc-login cold` and the agent console. Reload the page: the console comes back
   (`flatlineRdcState`).

## 16. The agent console and the display (step 17)

`help`, `agent lease list`, `agent lease clear <pid>` (only the dead pid), `signal sources|relays`, `signal set <key> <value>`,
`signal calibrate`, `signal apply`, `agent attach`. The puzzle is generated per run (see the Remote Desktop Connection window and
`man signal|format|agent`). When the display is clean, `agent attach` shows the Cold-Chart desktop with the archive window.
`probe:rdc-attached`, the `archive` trace, one personal-log entry, and the Bedside-17 half of `hospitalShells` (rule IR-3389 removed,
port 3389 opened; the firewall rule IR-22 and Cold-Chart's port 22 are **not** touched).

**Decoy.** `ssh` to Cold-Chart's public address is refused (hold IR-22). The firewall console wants `rafael.bautista`, whose password is
nowhere in the game. Webmail answers "This account was disabled on 2026-08-19." to Roxanne's correct pair.

## 17. The three documents (steps 18 to 20)

In the archive window open `acknowledgement_rnatnaree.txt` (`statement`), `decision_memo.txt` (`decisionMemo`), and
`usb_ticket_PC-IT-017.txt` (`usbTicket`); four decoys (`finding_draft_v1`, `finding_final`, `asset_register`, `notes`) read without
effect. Each counts only **after** `agent attach`. The gap is 02:41 to 09:02: **6 hours 21 minutes**.

## 18. The report (step 21)

Reply to `drop@drop.null` with the **Mission 5 Findings** template (six empty tokens; unchanged from the first build):

| field | an accepted answer | match needs |
|---|---|---|
| `door` | `Roxanne Anindita Natnaree` | intended: "roxanne" or "natnaree", no "gideon". **The code still checks "greta" or "souza" and rejects "gareth", so this answer fails until `docs/bugs.md` #69 is fixed** |
| `cause` | `unauthorised USB media, employee negligence` | a USB term and a fault term, no vendor term |
| `decider` | `Vivien Orchid` | "orchid" or "vivien" |
| `gap` | `6 hours 21 minutes` | 6 and 21, or 381 |
| `motive` | `insurance claim classification` | "insur", "claim" or "cover" |
| `archive` | `Cold-Chart` | "cold chart" |

Sent before steps 18 to 20 and the `greta` trace: one reply "not yet" naming the first unmet step, replaced (not stacked) on the next
send. Complete: the objective and the mission complete; outside focus `[FP][M05] reward paid: 3200`.

## 19. BACKTRACE

Six required keys, unchanged: `dismissed`, `greta`, `archive`, `statement`, `decisionMemo`, `usbTicket`. Six **optional NOTE logs** are
new (`MISSION_LOGS`, `backtrace-logs.ts`): foothold, separation, controls, hold (portal findings), the Theatre 3 status note and
Roxanne's sealed note; the Bedside-17 note stays. The report card must have no `—`.

## 20. Optional: Bedside-17

After step 17 port 3389 is open. `bluekeep` against `80.94.92.118:3389`: `probe:bedside-bonus`, then `found_note.txt` (one log) and
`usb_history.log` (Log Viewer).

---

## 21. What only the game can prove (live tests owed)

| # | Check | Why it is unproven |
|---|---|---|
| R12 | Long `Exports` strings: the 138-digit token, 120-digit sample, 358-digit attachment (up to 4096 accepted) | only short strings were seen live; the 64-character chunk fallback is **not built** |
| R15 / R16 | RDC fonts, `cursor:none`, clipboard, session restore through `flatlineRdcState()` on load | read from the engine, not seen |
| R19 | Cipher Desk and RDC (and LeakIndex, Echoline) have no subnet or domain record | `registerDomain` needs a subnet; a site opened by host alone is read, not seen |
| — | `Popular` grid shows both new tool sites with their own icons | static; first time in play |
| — | `Events.emit` from `Exports` reaches the controller before the call returns | the portal re-reads state after 700 ms and on focus as a safety net |
| — | A Goagle search calls `metadata()` with an empty `url` | the hospital pages skip the HTTPS check when `searchStr` is set |
| — | Page patterns `/it/change/:id` and `/it/policy/:id` resolve through `context.params`, and the `/search` alias makes a Goagle click land on the site | read from the engine (`h2c`, `l2c`), not seen |
| — | The hex blocks in `change.html` and `policy.html` can be selected and copied (`user-select:all`) and Cipher Desk accepts them | CSS only; not seen |
| — | Echoline, Cipher Desk and the hospital site search are findable by a player with no prior knowledge | the board hints and the site names are the only pointers |
| — | The hospital photographs, set as CSS `background:url("./assets/m05/…")` inside the `frame.html` iframe, load in the game | headless Chrome only; the SDK injects a `<base>` and copies `public/` into `dist/`, but only `<img src>` has live precedent |
| — | The lockscreen under the service notice loads, is readable and is not cropped on a narrow window | `.alert img` is capped at 220 px high on narrow windows; a 16:9 image should fit, but it was not seen in the game |
| — | The full 21-step chain and its length | estimate 60 to 115 minutes |

## 22. Known follow-ups

- `M05_LOG_NOTES` ("she plugged it in…") has no trigger since v2; HD-4481 counts nothing.
- zh debt for puzzle architecture V2 (owner: English first): a zh pass on 2026-10-05 (not yet read by the owner) filled the hospital-web keys (`M05.SITE.HS.BOARD_*`, `CHG_*`, `POL_*`, `SEARCH_*`, `JOB_SA_NOTE`, the home and frame chrome) and the 22 `M05.SITE.EL_ROLE_*` titles; still English only are 28 of the 67 `M05.SITE.EL_*` Echoline page keys (capture bar, Status, Left block, stamps, notes) and `HINT_CHANGE`, `HINT_HANDOVER`. The zh of `HINT_IDENTITY`, `HINT_CREDENTIAL`, `LOG_DISMISSED_1`, `LOG_GRETA_1`, `LOG_GRETA_2` and Roxanne's Twotter posts 4 and 12 was removed because the English meaning changed; `INCIDENT_1_BODY`, `INCIDENT_2_BODY`, `NEWS_3_BODY` and the three `COMP_OT*` names keep an older zh that lacks the new sentence or code.
- The zh text of the hospital web and the portal needs the owner's read.
- The M1 hospital site was moved to M5 (README #58). On 2026-10-06 M1's eight `pacificcare-health.org` records and `M01_HOSPITAL_DOMAIN` / `M01_HOSPITAL_IP` were removed from `content/m01/network.ts` because M5 owns that domain with other addresses (README #67). The lockscreen under the service notice is now `public/assets/m05/pacificcare-lockscreen.jpg`, a flat BLACKLEDGER screen capture made on 2026-10-06 with Creative Claw; the old `.png` (the operating-theatre photo) is gone from M5 and the photo remains in the vault as `q3-notice.png`.
- Open: `public/assets/global/backtrace-corridor.jpg` and `backtrace-receipt.jpg` (BACKTRACE thumbnails, FINAL LOCK) still show the earlier corridor and receipt, so they differ from the new vault images (README #67).
- Open: `docs/bugs.md` #69, the report-match terms `greta`/`souza` after the rename (M5 `door`, M7 `evidence`).

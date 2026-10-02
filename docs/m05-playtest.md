# M05 "The Door" — Playtest Script (phase 6: full mission)

Status: **use once, disposable** — step-by-step script for M05 as implemented in
phase 6 of the M4-M7 run. Delete or archive once M05 reaches FINAL LOCK; not a
permanent design doc (that is `docs/world-building/08-spec-m5-m6.md` §B and
`09-konten-m5-m6.md` §B).

**What M05 is.** The first mission with no intrusion at the front of it. The way
in is a credential the hospital's own systems administrator lost in somebody
else's breach, and the mission's real subject is what the hospital did with the
incident afterwards: a draft finding that named a vendor tool, a filed finding
that named a person, and a payout decided six hours after the ransom note
arrived. The player ends up holding the paperwork that proves the named person
was not the cause.

**What is new in the engine for this mission.**

1. A website **`Exports`** function used as a mission gate for the first time
   outside M01 (`flatlineOpenLeakRecord` on `leakindex.net`).
2. A **cross-mission hook with no cross-mission import**: M05 listens for M01's
   `flatline.m01.projectOpened` event through `src/content/global/vault-hook.ts`,
   which re-declares the event name and the folder id rather than importing the
   locked M01 content.
3. Two **gated archive captures** of the same page at different dates, joined as
   one step (`staff2025Seen` + `staff2026Seen` -> `staffArchiveCompared`).
4. A `John.DecryptHash` gate that checks **both** the hash and the password.

**Language.** English and Simplified Chinese are both complete. Switch the game
language and re-read §12.

---

## 0. Entry point

M05's production prerequisite is `flatline.m04`. Test it on its own with dev
focus:

1. In `src/guard/flags.ts` set `DEV_FOCUS_QUEST.m05 = true` and every other
   entry to `false`. Leave `isDev = true`, `isDebug = false`, `isTester = false`.
2. Build and install as usual (`.\build-install.ps1`), restart HackHub.
3. Expect in the log: `[FP][Flatline Protocol] FLATLINE PROTOCOL COMPLETELY LOADED!`
   and `[FP][Backtrace] m5 -> progress`.

With focus on, the single objective shows immediately and no other story mission
auto-starts. **Put the flag back to `false` before committing.**

The reward is skipped under focus by design — expect
`[FP][M05] reward skipped under focus: 1200` instead of `reward paid`.

---

## 1. Tip mail

1. Open GoMail. One mail from `drop@drop.null`, subject **"the note in the
   vault"**. Read it.
2. Expect: no trace line (this step is silent), and the quest's one objective
   still showing as incomplete.
3. The mail points back at the LedgerVault project from M01 and at a hospital
   that "paid and then wrote a name down".

**Checks.** The mail must be the only new one in the inbox. Reading any other
mail from the same sender must not advance anything.

---

## 2. Back into the vault (step 2)

1. Browse `https://ledgervault.*` as in M01 and open the **Q3** project folder.
2. Expect: `[FP][M05] probe:vault-revisited`.
3. Expect `echoline.net` to start resolving from this point:
   `nslookup echoline.net` -> `185.31.164.22`.

**This is the one live question for this step.** M01's LedgerVault page is
locked content; M05 only listens for the event its `Exports` already emits. If
`probe:vault-revisited` never appears, the vault page is sealed
(`isM01VaultSealed`) or the folder id in `vault-hook.ts` has drifted from M01's
`q3`. Both are code-side, not content-side.

**Checks.** Opening any other folder in the vault must print nothing.

---

## 3. The two captures (steps 3-4, parallel)

1. `nslookup echoline.net`, then browse **`https://echoline.net/`**. The index
   lists two captures of the same hospital IT team page, dated **2025-11-03**
   and **2026-09-02**.
2. Open the 2025 capture (`/s/8fq2/`). Expect
   `[FP][M05] probe:snapshot-seen path=/s/8fq2`.
3. Open the 2026 capture (`/s/8fq7/`). Expect
   `[FP][M05] probe:snapshot-seen path=/s/8fq7`, then immediately
   `[FP][Backtrace] m5 traced dismissed` and one BACKTRACE personal-log entry.
4. The comparison is the point: **two** names are gone from the later capture.
   Gareth Lim is gone because his contract ended 2026-07-31 (the capture says
   so). Greta de Souza is gone with nothing attached to it.

**Checks.**

- Visiting the same capture twice must print the probe twice but trace
  `dismissed` only once.
- `http://echoline.net/s/8fq2/` must serve the shared 400 page and must **not**
  advance the step.
- `https://echoline.net/s/zzzz/` must 404.
- Before step 2, every `echoline.net` path must 404 (the site is gated on
  `flatline.m05.archiveOpen`).
- `dirhunter echoline.net` prints `/s/8fq2/` and `/s/8fq7/` — opaque by design
  (engine fact E-3: dirhunter prints every registered path, so no path may name
  what it holds).

---

## 4. Profiling the administrator (step 5, parallel)

1. `lynx @g.desouza`. Three lines: her role, the reused-password habit, and the
   theatre she keeps mentioning.
2. Expect `[FP][Backtrace] m5 traced greta`.
3. `lynx @g.lim` works too and is a decoy — it must trace nothing.

**Checks.** Both `Terminal.Lynx.Lookup` and `Terminal.Lynx.Search` must count
(the engine raises one or the other depending on how the player typed it).

---

## 5. The hospital edge (step 6)

Steps 3-4 and 5 are two branches that join here.

1. `nslookup remote.pacificcare-health.org` -> `198.244.91.37`.
2. `whois remote.pacificcare-health.org` -> the hospital's own contact.
3. `nmap 198.244.91.37` (or `nmap remote.pacificcare-health.org`). Expect
   `[FP][M05] probe:edge-mapped`.
4. Expect `leakindex.net` to start resolving from this point.

**Live question.** There is **no nmap fixture on the edge address** — the edge
router is a real network node, so this prints the live port state (80 CLOSE,
443 OPEN). If the scan prints nothing at all, the subnet was not built; check
for `Network.createSubnetNetwork` in the log at mission start.

**Checks.** Running the `nmap` before **both** branches are done must not
advance: with only the captures compared, or only the profile read, the probe
line must not appear.

---

## 6. The breach index (step 7)

1. `nslookup leakindex.net` -> `91.229.23.105`, `nmap` it, then browse
   **`https://leakindex.net/`**.
2. Search `pacificcare-health.org`. Nine records come back, hashed, with the
   breach they came from and its year.
3. Search `g.desouza` or her full work address. **Record 1** is the one that
   matters: `g.desouza@pacificcare-health.org`, MedVendor Portal 2025.
4. Press **Open** on record 1. Expect
   `[FP][M05] probe:leak-record-opened id=1 (match)`.
5. Open any other record. Expect `… id=N (decoy)` and no advance.

**What to look at.** Her private address (`greta.desouza@postbox.my`) is also
indexed, from a 2022 forum breach, with a **different** hash. That is the decoy:
cracking it gives a password that opens nothing. Three hashes are shared across
the nine decoys so the table itself does not point at record 1.

**Checks.**

- The page must 404 before step 6.
- `http://leakindex.net/` must serve the 400 page.
- No plaintext password may appear anywhere in the page source (view source).

---

## 7. The password (step 8)

1. `john a3106b24578d51822fb862154d11b89d`.
2. Expect the password `Marigold2019` and
   `[FP][M05] probe:password-cracked`.

**Checks.** Cracking any decoy hash must print nothing. Supplying the right
hash with the wrong password (not reachable through the shipped `john`, but
worth a listener check) must also print nothing.

---

## 8. The firewall (steps 9-10)

1. `nmap 192.168.1.3` finds nothing useful — the firewall hides its public
   address (`isIpHidden: true`), and in 1.3.13 that only affects `whois` and
   `nslookup`, so the box is still reachable once you have the address from the
   network map.
2. Open pfSense on **`193.29.57.184`**, log in as `g.desouza` / `Marigold2019`.
   Expect `[FP][M05] probe:firewall-login`.
3. The firewall has **exactly one** account, because `PFSense.Login` carries
   only `{ip}` (engine fact E-7) and a second account would make the gate
   ambiguous.
4. Two deny rules are listed: **22 -> 192.168.1.4** and **3389 -> 192.168.1.5**.
   Each `destination` is the target's **LAN** address (engine fact E-5).
   Remove both and save.
5. Expect `[FP][Backtrace]` nothing yet, but in the log:
   two `Network.removeFirewallRule` calls and two `Network.openPort` calls
   (`141.98.252.76:22` and `80.94.92.118:3389`).

**Checks.** A pfSense login on any other box must not advance. Saving changes
before logging in must not advance.

---

## 9. The archive (step 11)

1. `ssh g.desouza@141.98.252.76` with `Marigold2019`. This is **Cold-Chart**,
   the clinical archive.
2. Expect `[FP][M05] probe:archive-accessed`, `[FP][Backtrace] m5 traced
   archive`, and a personal-log entry.
3. `ls` her home: `notes.txt`. Read it — two more personal-log entries, and the
   theatre line from her `lynx` profile turns up again.
4. `cd /ir/2026-08-14`. Four files:
   - `decision_memo.txt`
   - `finding_draft_v1.txt`
   - `finding_final.txt`
   - `acknowledgement_gdesouza.txt`
5. `cd /ir/tickets`. Two files: `usb_ticket_PC-IT-017.txt` and
   `asset_register.txt`.

**Checks.** `finding_draft_v1.txt` and `finding_final.txt` are readable and
trace **nothing** — they are the contrast, not the evidence. The same goes for
`asset_register.txt`.

---

## 10. The three documents (steps 12-14, parallel)

Read in any order; each traces one key.

1. `cat acknowledgement_gdesouza.txt` — she signs for a conclusion she disputes
   in writing, dated **2026-08-18**. Expect `traced statement` plus two
   personal-log entries.
2. `cat decision_memo.txt` — the hospital paid at **09:02 UTC** on 2026-08-14,
   classified as employee negligence, negotiated through Brightwater
   Resolutions, approved by **Vivien Orchid**. Expect `traced decisionMemo`.
3. `cat usb_ticket_PC-IT-017.txt` — the media the filed finding rests on was
   connected at **00:12 on 2026-08-11**, three days before the incident window,
   on an asset the register assigns to the service desk. Expect
   `traced usbTicket`.

The gap the report asks for is between the lock time (**02:41**) in the memo and
the payment time (**09:02**): **6 hours 21 minutes**.

**Checks.** Each of the three must advance only after the archive session
(step 11). Reading one must not set the other two. The extension matters:
`cat decision_memo.log` must do nothing.

---

## 11. Optional: Bedside-17

Not a step, and not required for the report.

1. `use bluekeep`/Metasploit against **`80.94.92.118:3389`** (FreeRDP 6.0.4,
   `it.station` online). The port is only open after step 10.
2. Expect `[FP][M05] probe:bedside-bonus`.
3. `cat found_note.txt` on the box — the note from the M01 vault, in the place
   it actually came from. One personal-log entry, only after the session.
4. `usb_history.log` is there too, and names the same asset tag as the ticket.

**Checks.** Reading `found_note.txt` **before** the session must print nothing.

---

## 12. The report

Reply to `drop@drop.null` with the **Mission 5 Findings** template. Five fields:

| field | answer |
|---|---|
| `door` | `Greta de Souza` |
| `cause` | `unauthorised USB media, employee negligence` |
| `decider` | `Vivien Orchid` |
| `gap` | `6 hours 21 minutes` |
| `motive` | `insurance claim classification` |

1. Send it **before** the three documents are read: expect one reply with
   subject **"not yet"** naming the first unmet step. Send again: the old reply
   is withdrawn and replaced, never stacked.
2. Send it complete: the objective completes, the mission completes, and expect
   `[FP][Backtrace] m5 -> complete`, the facts dump, and (outside focus)
   `[FP][M05] reward paid: 1200`.
3. Answering `Gareth Lim` for `door`, or `third-party remote support tool` for
   `cause`, must be rejected. Case and extra spacing are forgiven.

---

## 13. BACKTRACE

1. Open BACKTRACE. M05's card is **THE DOOR**, nav slot 05.
2. In progress, the card shows `TRACED SO FAR // n OF 6` with the keys found so
   far: Staff list changed, Named administrator, Archive access, Signed
   acknowledgement, Decision memo, USB ticket.
3. After completion the card becomes the **MISSION 05** report: summary, eight
   findings, two evidence rows (`EV-M5-01` the decision memo, `EV-M5-02` the USB
   ticket) and the personal log.
4. Every `—` in the report must be filled in. A dash left in place means a fact
   builder key in `backtrace-facts.ts` does not match what the report card asks
   for.

---

## 14. Chinese pass

Switch the game language to Simplified Chinese and re-walk §1, §6, §9-§12.
Everything player-facing is translated: the tip mail, the quest title and
objective, the two site surfaces, all nine documents, the report template and
its reply, and the personal logs. The `{{t:}}` placeholders must never show
through. Addresses, usernames, hashes, asset tags and dates stay as they are.

---

## 15. Known follow-ups (not fixed / not yet live-tested)

- **`Exports` as a gate on a mod site** is proven in M01 for a single call with
  a string argument; M05 passes a **number**. If `flatlineOpenLeakRecord` never
  reaches the mod, the fallback is the same shape as M01's: pass the id as a
  string. Untested live.
- **`John.DecryptHash` payload shape** (`{hash, password}`) is taken from M01's
  working listener; M05 is the first to check both fields.
- **`Terminal.Lynx.Search`** carries a bare string rather than an object. Both
  shapes are bound; which one the engine raises is untested here.
- **`isIpHidden` on the firewall** is cosmetic in 1.3.13 (`whois`/`nslookup`
  only), so the firewall is still visible on the network map. Expected, not a
  bug (`docs/bugs.md` #47).
- **No nmap fixture on the hospital edge** — the step depends on the real subnet
  existing. If the live scan prints nothing, that is the subnet, not the gate.

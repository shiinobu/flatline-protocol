# M01 "Jejak Pertama" — Playtest Script

Status: **use once, disposable** — a step-by-step script for the first live
playthrough of Mission 1, after running `.\build-install.ps1` and
restarting HackHub (or `mods.reset flatline-protocol`). Delete or archive
this file once M01 reaches FINAL LOCK; it is not a permanent design doc
(that's `docs/story.md`).

Three steps below are marked **[CHECKPOINT]** — these map directly to the
open SDK-accuracy questions in `docs/scratch.md`. Everything else is
expected to just work; report back immediately if anything below doesn't
match, with the exact command typed and whatever error/output appeared.

---

## 0. Claim the mission

The quest (`flatline.m01`, "Jejak Pertama") should auto-start
(`AutoStart = true`). An incoming mail from an unknown sender should
already be waiting.

1. Open Mail, read the message with subject **"you should look into this"**.
   → Completes objective 00 (Review the anonymous tip).
   → It names two domains: `verifiedaccess.mkt` (primary) and
     `shadowline-exchange.mkt` ("probably nothing" — the decoy).

## 1. Resolve and scan the primary lead

2. `nslookup verifiedaccess.mkt` → should resolve to `203.0.113.90`.
   → Completes objective 01 (Resolve the primary lead's domain).
3. `nmap 203.0.113.90` → should show port 22 (ssh) OPEN, port 80 (http)
   CLOSE, port 443 (https) OPEN.
   → Completes objective 02 (Scan the resolved IP).
4. `dirhunter verifiedaccess.mkt` (or however `dirhunter` is invoked against
   a host in this build) → should surface `/internal-ops/` among the
   results.
   → Completes objective 03 (Enumerate hidden paths).

## 2. Rule out the decoy (side path, any time after step 4)

5. `nslookup shadowline-exchange.mkt` → should resolve to `198.51.100.23`.
   (This step itself completes nothing — it's just how you get the decoy's
   IP for the next two commands.)
6. `whois shadowline-exchange.mkt` → some registrar-privacy result.
7. `geoip 198.51.100.23` → Iceland/Reykjavik.
   → Once **both** whois and geoip are done, completes objective 04
   (Rule out the decoy).

## 3. Identify the seller and read the listing — **[CHECKPOINT 1]**

8. `lynx verifiedaccess.mkt` → should return OSINT-style data (an IP
   matching `203.0.113.90`, an address entry, no rendered page text).
   → Completes objective 05 (Run OSINT on the storefront domain).
9. Open the in-game browser, navigate to
   `https://verifiedaccess.mkt/internal-ops/` → should show the
   "Internal Ops — not indexed" page, with the healthcare-sector listing
   naming the hospital-sector sale as SOLD, plus a mention of an FTP share
   with anonymous login.
   → Completes objective 06 (Read the verified-access listing).

   **Report back:** did step 8 (lynx) and step 9 (browsing the page) feel
   like two distinct, meaningful actions — or did it feel redundant, like
   you were told to do the same "read the listing" thing twice? This
   decides whether the two objectives stay separate or get merged.

## 4. Breach the FTP share — **[CHECKPOINT 2]**

10. `ftp -h 203.0.113.90 -u anonymous -p anonymous` (real in-game syntax
    confirmed 2026-09-18 — a bare `ftp <ip>` only prints usage; see
    `docs/bugs.md` entry 1).
    → Completes objective 07 (Access the leaked FTP share).
    → **At the exact moment this connects**, a new mail should arrive:
      subject "FTP Transfer Complete", with an attachment named
      `wordlist.txt`.
11. Open that mail, download the `wordlist.txt` attachment.

    **Report back:** does the attachment actually save as a real,
    readable file on your system (something `hydra` can point at as a
    wordlist argument)? Or does it fail to download / not behave like a
    normal file? This is the biggest unknown — HackHub's `ftp` command
    itself can't hand over a real file on this SDK version, so the
    wordlist is delivered as a mail attachment instead. If that doesn't
    work as a real file, this whole step needs a different delivery
    mechanism.

## 5. Crack the panel and get in — **[CHECKPOINT 3]**

12. `hydra` against `203.0.113.90`, user `opsadmin`, using the
    downloaded `wordlist.txt` as the wordlist. The correct password
    inside that wordlist is `verified_2024!`.
    → Completes objective 08 (Brute-force the broker's SSH login) —
    should print the found credentials (`opsadmin` / `verified_2024!`).
13. `ssh -h opsadmin@203.0.113.90`, enter password `verified_2024!` when
    prompted. **If that prints a usage message instead of connecting**
    (like the bare `ftp <ip>` did — see `docs/bugs.md` entry 1), the game
    is telling you the exact flag syntax it wants; match that instead
    (e.g. it may want `-u`/`-p` flags like `ftp` did rather than
    `user@ip`).
    → Completes objective 09 (Connect to the broker's server).

    **Report back:** did `ssh` actually prompt for a password and accept
    `verified_2024!`? A `Shell.addCommandData("ssh", {host, key: password}, ...)`
    fixture is registered (added preemptively after the `ftp` fixture
    turned out to be required, `docs/bugs.md` entry 1), but it's
    unconfirmed whether `key` means "the password" the way that fixture
    assumes. If login fails, try the flag-based syntax `ftp` needed
    (`-h`/`-u`/`-p`-style) instead of `user@ip`.

## 6. Find the ledger entry

14. Once connected, `ls` then `cat sales_ledger.log` (should be at the
    remote root, no subfolder).
    → Should show a transaction log row naming buyer alias
      **A7xC0DEFACE**.
    → Completes objective 10 (Find the sales ledger entry).

## 7. Confirm via IRC

15. `weechat relay.blkledger.dark` (password `n0ledger`) — again, if this
    prints a usage message, match whatever flag syntax it shows.
    → Completes objective 11 (Confirm the lead via IRC) as soon as the
    connection succeeds.
    → The chat history should include a stored line about "the new
    build's client" wanting it fast.

    **Report back (same checkpoint as step 13):** did `weechat` connect
    and accept the password the same way `ssh` did (or didn't)? Same
    underlying concern — a fixture is registered but unconfirmed live.

## 8. Report findings

16. Compose a mail to `drop@ashline.void`. Either:
    - Use the **"Mission 1 Findings"** template from the compose dropdown
      and fill in `broker: verifiedaccess.mkt`, `buyer: A7xC0DEFACE`, or
    - Send a freehand mail with subject **"Broker identified — buyer
      alias attached"** and body matching the exact report text (broker +
      buyer alias lines).
    → Completes objective 12 (Send findings to the dead drop) and finishes
    the mission — reward `250` money / `60` xp should be granted
    automatically.

---

## What to report back overall

For each of the 3 checkpoints above: **worked as expected**, or **broke —
here's exactly what happened** (command typed, what the game showed/didn't
show, any error text). Anything outside the 3 checkpoints that also breaks
is worth reporting too, but those are the known risk areas.

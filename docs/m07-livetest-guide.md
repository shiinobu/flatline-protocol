# M07 "The Architect" — Panduan Live-Test (WP4 + WP5)

Sekali pakai, to the point. Status: typecheck bersih + harness SDK tiruan lolos, **belum pernah dilihat di game**.
Revisi 2026-10-07 (ruang buku BLACKLEDGER, README #83): 23 langkah; situs BLACKLEDGER pindah dari M2 ke M7 dan menjadi kunci terakhir setelah Duel 2 menang; laporan bukan lagi jalan keluar Duel 2; surel "what now?" dikirim saat Duel 2 menang.
Revisi 2026-10-07 (audit petunjuk, README #82): balasan "not yet" untuk setiap laporan templat, toast unduhan dini, surel tip lima butir, catatan segel diurutkan seperti token.
Revisi 2026-10-07 (review live-test): satu segel (22 langkah), jendela Duel 1 180 detik dan Duel 2 300 detik, host C2 berupa pohon folder, dua surel petunjuk,
paket RDC (panel Help, saran langsung, lampu monitor, file keras: Browser kosong, Trash + Restore, Decrypt).
Semua nama, host, dan data fiktif dan berjalan di simulasi HackHub. Kolom `Ok?`: `[x]` lulus, `[-]` dilewati.
Papan BACKTRACE M7 (WP6) sudah ikut di kode; bagian 4 menjelaskan apa yang dicek.

## 0. Persiapan

1. `src/guard/flags.ts` keadaan rilis: `isDev = false`, `isDebug = false`, semua `DEV_FOCUS_QUEST` `false`. Untuk uji M7 terpisah:
   `isDev = true`, `isDebug = false`, `DEV_FOCUS_QUEST.m07 = true` (lainnya `false`). Kembalikan ke keadaan rilis sebelum build rilis.
2. `.\build-install.ps1`, restart HackHub. Log harus memuat `FLATLINE PROTOCOL COMPLETELY LOADED!`. Di GoMail sudah ada surel
   dari `drop@drop.null`, subjek *"you have the name. now the books."*
3. Log (PowerShell terpisah):

```powershell
Get-Content "$env:APPDATA\hackhub\logs\hackhub-$(Get-Date -Format yyyy-MM-dd).log" -Wait -Tail 0 | Select-String '\[FP\]\[M07\]'
```

4. Bahan dari save lamamu: `net_tree.py` (dibuat di M3, nama berkas persis `net_tree`), paket `dirhunter` terpasang.
   Cipher Desk (`https://cipherdesk.io`) dan RDC (`https://rdcdesk.io`) situs permanen.
5. Di mode fokus tidak ada kartu BACKTRACE M1-M6, jadi semua kunci Cipher ada di tabel di bawah, bukan dari catatanmu.

## 1. Jalur utama (23 langkah, berurutan)

Langkah yang dilakukan sebelum gilirannya **tidak mencatat apa pun**. Itu disengaja.

| Ok? | # | Aksi | Harus terlihat | Log `[FP][M07]` / trace |
|---|---|---|---|---|
| [ ] | 1 | Baca surel tip (subjek tidak berubah) | portal klaim terbuka. Isi surel: kalimat situasi, blok "How I would work it" 5 butir (tanya meja klaim Nordhaven Mutual Assurance di `portal.nordhaven-mutual.com`, ikuti uang ke endpoint, gambar peta, tanya versi, cari ruang yang tak ditautkan), peringatan penutup | - |
| [ ] | 2 | Browser: `https://portal.nordhaven-mutual.com` (harus https) | "Nordhaven Mutual Assurance — Claims status" | `probe:portal-seen` |
| [ ] | 3 | Cari `CASE-A7X-0417`, `FIN-NA-0091`, `LOG-EU-2209` | tiap hasil **Paid**, rekening lewat SKN. `FIN-EU-2214` sekarang = "That reference is on file. Its record has not been posted yet. Try again later." (referensi ngawur tetap "No claim found for that reference.") | `probe:claim-found 1/3 … 3/3`; trace `claims` |
| [ ] | 4 | `python3 net_tree.py 203.0.113.160` | host di balik router | - |
| [ ] | 5 | `nmap -sV 203.0.113.161` | `443 OPEN https LegacyCMS 2.1`, `46721 FILTERED rdp FreeRDP 5.2.1` | - |
| [ ] | 6 | `dirhunter 203.0.113.161`, lalu buka `https://203.0.113.161/legacy-cms/` | tabel node (`index-01`, `ash-gate`, `node-07`, `node-11`). Sebelum langkah 5 harus 404. **Surel kedua** dari `drop@drop.null`, subjek *"retired on paper."* (sekali): cara membaca dua mesin yang "pensiun" (butir 2 memuat baris tahun rilis: OpenSSH 5.3 = 2009, OpenSSH 9.6 = 2023), sumber akun bawaan (butir 4) | trace `nodes` |
| [ ] | 7 | `nmap -sV 146.70.44.18` (OpenSSH 5.3) dan `185.220.101.42` (OpenSSH 9.6), lalu `ssh 146.70.44.18` (`admin` / `admin`) | Ash-Vector = yang benar-benar terlupakan | - |
| [ ] | 8 | `cat ash-gate_backup.txt` (atau `open`, atau klik dua kali di Files) | panel `194.60.38.12`, `fw.admin` / `Ashgate#2022r2` | trace `credential` |
| [ ] | 9 | Browser `http://194.60.38.12`, login `fw.admin` | panel pfSense. User/sandi lain **ditolak** | - |
| [ ] | 10 | Firewall Rules: hapus atau ubah aturan port `46721`, **Save** | `nmap -sV 203.0.113.161` kini `46721 OPEN` | trace `firewall` |
| [ ] | 11 | `metasploit`, `use exploit/rdp/cve_2019_0708_bluekeep`, `set RHOST 203.0.113.161`, `set RPORT 46721`, `set Version 5.2.1`, `exploit` | sesi Meterpreter; **Duel 1 mulai**: banner SESSION TRACED 03:00 ("Read what you came for, take the ledger whole, get out.") + toast "The session is being traced." | `probe:c2-session port=46721`; trace `c2` |
| [ ] | 12 | `ls` (root hanya memuat folder: `etc home lib logs opt var`), lalu `cd opt`, `cd settlecare`, `cat manifest.txt` (`agent.conf` di situ pengecoh) | MASTER LEDGER INDEX: `[reserves]` FIN-EU-2214 dan MED-APAC-6689, `[settlement network]` (index-01 192.168.1.4, NMA-CL-01 192.168.1.40, claims-02 192.168.1.42), `[integrity]` ("is sealed. the key: the settlement account that holds the reserves, then the healthcare reserve reference, joined by a dash. ... open it at a cipher desk, away from this host") | trace `manifest` |
| [ ] | 13 | `cd /logs` lalu `cat release_orders.log` (`settlecare-agent.log` pengecoh) | tiga proses rilis; `RO-2608-14`: **02:11 authorised by sentry**, sesi dari `x7xsentry9.tech` (194.36.108.20) akun `rnatnaree` | trace `orders` |
| [ ] | 14 | `cd /opt/settlecare/reports` lalu `cat survey_visits.txt` | survei `LC-07`, kunjungan 2026-08-03 | trace `survey` |
| [ ] | 15 | `cd /var/ledger`, lalu `download master_ledger_backup.enc` (**jangan `open` di host**; `master_ledger_2025.enc` dan `volumes.txt` pengecoh, mengunduh yang 2025 tidak dihitung). Unduhan sebelum langkah 12-14 selesai berurutan tidak dihitung dan memunculkan toast "That transfer does not count yet..." | banner EXTRACTION COMPLETE | trace `ledger` |
| [ ] | 16 | Portal: cari `FIN-EU-2214` dan `MED-APAC-6689` | **Reserved**, "Held in settlement account **PC-114772** (SKN Capital Nominees Ltd)". Nomor itu hanya tampil di sini | `probe:reserve-found 1/2 … 2/2` |
| [ ] | 17 | `back` (Meterpreter tidak menutup sendiri, sengaja), lalu `open ~/downloads/master_ledger_backup.enc` (atau Files) | satu blok hex di bawah header `AES256-CBC` | - |
| [ ] | 18 | Cipher Desk, **Decrypt**, kunci `PC-114772-MED-APAC-6689` (nomor rekening dari langkah 16, referensi MED dari manifest, disambung tanda hubung) | "Chair console. User clindqvist, password Reserve-Flat-1967. Address as in the settlement network index. Change: the release order of the PacificCare run. Device tag NMA-CL-01. A token is those five, in that order, joined by colons. Tokens are sealed with that same release order, and so is every file on that machine. What he throws away there is only set aside, not gone." | `probe:cipher-opened id=ledgerSeal`; trace `seal` |
| [ ] | 19 | Cipher Desk **Encrypt**: teks `clindqvist:Reserve-Flat-1967:192.168.1.40:RO-2608-14:NMA-CL-01`, kunci `RO-2608-14`. Tempel hex ke `rdcdesk.io`, Login | target Steady-State | `probe:rdc-login chair` |
| [ ] | 20 | Puzzle layar seperti M5 (`signal calibrate`, `signal apply`, `agent attach`). Panel **Help** (tombol di bilah judul konsol, atau ketik `help`) dan saran perintah muncul saat mengetik; setelah puzzle selesai lima lampu monitor berganti pola sendiri | desktop Steady-State; **Duel 2 mulai**: banner SENTRY ON YOUR LINE 05:00, toast, surel "i can see you" | `probe:rdc-attached` |
| [ ] | 21 | Dalam 300 detik, di desktop: Browser hanya menampilkan "Archive index offline", file lewat **Computer** (`/etc /home /lib /logs`). `/home/clindqvist/chair/instruction_2026-06-24.txt` dan `model_note.txt` terenkripsi: isi kunci `RO-2608-14` lalu **Decrypt** (kunci salah: "Wrong key. The file stays encrypted."). `private/file_ghostwire.txt` ada di **Trash**: pilih, **Restore**, lalu Decrypt dengan kunci yang sama | setiap dokumen yang terdekripsi mencatat gerbangnya; `model_note.txt` baris 5 dan `file_ghostwire.txt` menyebut alamat ruang buku BLACKLEDGER. Ketiganya terdekripsi = banner ACCESS COMPLETE, jam berhenti, surel "what now?" (tanpa URL: "He wrote down where he keeps the rest"). Laporan **bukan** jalan keluar: tanpa ketiga dokumen, tidak ada ruang buku. Pengecoh biasa: `/etc/hostname`, `/lib/agent-sync.txt`, `/logs/agent-sync.log`. Membuka file terenkripsi tanpa kunci **tidak** mencatat gerbang | `probe:rdc-read gate=1/2/3`; `duel two won`; trace `instruction`, `model`, `dossier` |
| [ ] | 22 | Buka alamat dari berkas Duel 2 di Chrome game (`fc3dhvrvxdw4qdnzcruwf233nyk6rtea.blackledger`, https). Sebelum Duel 2 menang halaman menjawab 404 | halaman Accounts muncul; toast "Last event on this mission, go report it!" sekali, ditambah satu toast `BACKTRACE: new trace and log recorded.` (kunci `ledgerRoom`). Enam halaman (Accounts, Organisation, Notice, Payments, Proof, Support) dapat dibuka dari navigasi; Notice memuat tangkapan desktop TR4C3404 | `probe:ledger-room-seen`; `ledger room opened after duel two` |
| [ ] | 23 | GoMail ke `drop@drop.null`, template **Mission 7 Findings** (bagian 2) | misi selesai, penutup sesuai pilihan (bagian 3) | `ending applied choice=…` |

Salah token RDC menjawab berurutan: "Token unreadable." → "Token format not recognised." → "Sign-in failed." → "Address is not on the monitoring network." → "Address and device tag do not match." → "Approval does not cover this address."

## 2. Isian laporan (semua kolom kosong, ketik sendiri)

| Kolom | Isi yang lolos |
|---|---|
| architect | `Conrad Lindqvist, SENTRY` (ditolak bila memuat voss / hartley) |
| path | `Ash-Vector, ash-gate, 203.0.113.161` (minimal dua; ditolak bila memuat null crown) |
| claims | `paid by Nordhaven` |
| reserves | `FIN-EU-2214, MED-APAC-6689` |
| orders | `RO-2608-14, 02:11, sentry, from 194.36.108.20` |
| survey | `loss-control survey LC-07, 2026-08-03` |
| account | `PC-114772 (SKN)` |
| instruction | `Orchid, 2026-06-24` |
| choice | tepat satu dari `expose` / `handoff` / `destroy` |

Laporan sebelum waktunya: setiap laporan templat ke `drop@drop.null` selama rantai belum lengkap (isi kolom apa pun, termasuk kosong) mendapat satu balasan "not yet" berisi satu petunjuk untuk langkah pertama yang belum terpenuhi, **diganti** (bukan ditumpuk) tiap kirim. Rantai lengkap tetapi kolom salah: tanpa balasan. Surel bebas (bukan templat) tidak dibalas.

## 3. Tiga ending (satu per run; ulang dengan `mods.reset`, coba ulang bila race)

| choice | Harus terlihat |
|---|---|
| `expose` | surel Roxanne "you don't know me" (versi publik), surel "done" ("It is out…"), 6 baris log Moment |
| `handoff` | surel Roxanne versi pengacara, surel "done" ("It is filed…"), 6 baris log Moment |
| `destroy` | **tanpa** surel Roxanne, surel "done" = "Someone closed it.", `.enc` dihapus dari host, `C2 network torn down` di log, `nmap 203.0.113.161` tidak menjawab |

Reward: di mode fokus `reward skipped under focus: 4500` (normal).

## 4. BACKTRACE

WP6 sudah ada di kode (harus ikut build ulang). Diuji di Chrome headless, belum di game.

- Dev: `backtrace m7 keys` mencetak 15 kunci dengan `[x]`/`[ ]`. 12 wajib, 3 opsional (`decoy`, `model`, `dossier`).
- Tiap aksi bertanda "trace" di tabel = satu toast `BACKTRACE: new trace and log recorded.`
- Kartu M7 selama berjalan: "Traced so far, N of 12", satu baris per kunci, bisa digulir. N bisa 15 (opsional ikut dihitung, disengaja).
- Setelah laporan diterima: laporan M7 (ringkasan, 14 temuan, 6 kartu bukti `EV-M7-01` sampai `-06`, entitas, log pribadi
  bercaption `Trace 1` sampai `Trace 15` dan `Moment`, blok Skipped bila ada opsional yang terlewat) dan papan kasus.
- Papan kasus (2026-10-07): terbuka di zoom 60% dengan Conrad dekat tengah; ↺ kembali ke 60%; kabel siku, label tanggal per misi dan catatan baru muncul sesuai misi yang selesai. Halaman cerita memakai "Five weeks ago" dan "ten days".
- Di mode fokus kartu M1-M6 kosong, jadi tag operator dan pengambil keputusan tidak muncul di papan, dan `EV-M7-03` serta
  `EV-M7-04` ikut tersembunyi. Itu artefak uji terpisah, bukan bug.

## 5. Uji kegagalan (urutan bebas, bagian 1 sebagai dasar)

| Uji | Cara | Harus terlihat |
|---|---|---|
| Duel 1 kalah | sesi C2, tunggu 180 detik tanpa `download`. Jendela terminal Meterpreter dan explorer tertutup layar breach (probe r3: sesi tetap hidup di belakangnya, jendela kembali utuh setelah pulih) | penalti `min(saldo, 500)` + toast; banner TRACE COMPLETE; `ledger payload wiped`; surel "SYSTEM ALERT — session traced"; breach desktop ~2 detik kemudian (`duel breach started=true alias=index`); log Moment di BACKTRACE |
| Pulih Duel 1 | pulihkan desktop seperti M4 (`sysdiag`, build yang benar dari `/boot/recovery`, `sysrepair --rebuild`), lalu sesi **baru** ke C2 | `ledger payload restored`, jam 03:00 baru, `download` berhasil. Tidak ada jalan buntu |
| `.enc` dibuka di host | di sesi, `open master_ledger_backup.enc` sebelum `download` | jendela dipangkas jadi maksimal 01:30, toast "That read was logged…", surel "SYSTEM ALERT — read attempt logged" **sekali**; diulang tidak memangkas lagi |
| Pengecoh `.enc` | di `/var/ledger`, `download master_ledger_2025.enc` | tidak ada banner EXTRACTION COMPLETE, `ledgerTaken` tetap kosong; unduh yang `master_ledger_backup.enc` setelahnya berhasil |
| Unduh terlalu dini | di sesi C2, `download master_ledger_backup.enc` sebelum manifest, orders, survey terbaca berurutan | toast "That transfer does not count yet. Read the manifest, the release orders and the survey ...", tidak ada banner EXTRACTION COMPLETE, jam jalan terus, `ledger download ignored` di log. Baca ketiganya berurutan lalu `download` lagi: berhasil (terbukti dari engine: setiap `download` membuka jendela transfer baru dan memicu `Files.Transfer`; salinan kedua bernama `master_ledger_backup (1).enc`) |
| Laporan kosong di tengah misi | GoMail ke `drop@drop.null`, template **Mission 7 Findings**, semua kolom dibiarkan kosong, kirim | satu surel "not yet" dengan satu petunjuk untuk langkah berikutnya; kirim lagi: diganti, bukan ditumpuk |
| Referensi cadangan terlalu dini | di portal (sebelum langkah 15), cari `FIN-EU-2214` | "That reference is on file. Its record has not been posted yet. Try again later." |
| `flatline` saat duel | `flatline 203.0.113.161` (perintah ini akan dihapus pemilik sebelum produksi) | "flatline refused: there is no beacon here to cut…". Jam tidak berhenti |
| Laporan sebelum ruang buku | semua kolom benar, sebelum langkah 22 (termasuk setelah dokumen 1 terdekripsi di tengah Duel 2) | balasan "not yet": belum menang Duel 2 = "One file is not the whole machine…"; sudah menang tapi belum membuka situs = "He wrote down where he keeps the rest. Look again at what you read.". Misi tidak selesai, jam Duel 2 tetap jalan |
| Alamat ruang buku terlalu dini | ketik alamat dari catatan ini sebelum Duel 2 menang | halaman 404; langkah tidak tercatat |
| Alamat lewat http, atau langsung ke subhalaman | `http://…` atau `…/proof` | http: 400; subhalaman tidak menghitung langkah (hanya halaman depan lewat https) |
| Duel 2 kalah | `agent attach`, jangan dekripsi ketiga dokumen, tunggu 300 detik | penalti, sesi RDC putus, breach desktop (`alias=chair`), log Moment. Login + attach baru memasang jam lagi sampai ketiganya terbaca. Dokumen yang sudah terbaca tetap tercatat |
| Honeypot | `ssh 185.220.101.42` (`admin` / `admin`) | surel "SYSTEM ALERT — decoy host touched" sekali, penalti 500, kunci opsional `decoy`. Rantai tidak maju |
| Port lama | `set RPORT 3389` lalu `exploit` | gagal (D15: hanya 46721 yang cocok) |
| `mods.reset` di tengah duel | reset saat banner jalan | tidak ada jam atau banner sisa setelah mulai ulang |

## 6. Yang saya tunggu darimu

- Langkah mana yang macet, dengan baris `[FP][M07]` terakhir (log kubaca sendiri; tak perlu salin).
- Bagian yang terasa tidak jelas tanpa petunjuk: apakah balasan "not yet" cukup menuntun?
- Duel 1: apakah 180 detik cukup untuk menjelajah pohon folder (`ls`, `cd`, `cat`, `download`) tanpa terasa buntu?
- Duel 2: apakah 300 detik cukup untuk tiga dokumen dengan Decrypt dan Restore. Sejak D16 ketiganya wajib (tanpa jalan keluar lewat laporan atau `flatline`); bila terlalu ketat, durasi dinaikkan, bukan ada pintu darurat.
- Ruang buku BLACKLEDGER: apakah browser game membuka host `.blackledger` (32 huruf, https) dan memuat gambar `./assets/m07/…`; apakah toast "Last event on this mission, go report it!" muncul sekali.
- Dua surel petunjuk: apakah arahnya cukup jelas tanpa menyebut perintah (peta, versi, ruang tak tertaut, akun bawaan)?
- Setelah en lulus, ulang jalur dalam zh. Teks Cipher dan RDC memang hanya Inggris. Cari bocoran Inggris di banner, tabel node, portal, surel, dan log.

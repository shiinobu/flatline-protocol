# 01 — Canon, hook, dan diagnosis

Status: dasar analisis (2026-10-02). Semua rujukan dibaca langsung dari sumber
pada tanggal itu.

## A. Canon sekarang vs `docs/story.md`

| # | Topik | `story.md` | Isi game | Tindakan |
|---|---|---|---|---|
| 1 | Garis waktu | "~8-12 months before the story starts" (`story.md:45`) | Serangan rumah sakit **14 Agu 2026** (`content/global/finance.ts` `RANSOM_BATCH_HOSPITAL.settledAt`; `i18n/m02/core.ts:102-103`). Berkas LedgerVault bertanggal "Sep 18, 2026" (`websites/m01/ledgervault/home.html`). Draf spreadsheet Reyes "dated Aug 16, 2026" (`i18n/m03/core.ts:144`). Jarak 14 Agu ke 18 Sep = 35 hari, sekitar 5 minggu | Revisi premis jadi sekitar 5 minggu saat `story.md` disinkronkan |
| 2 | Cover-up | Rumah sakit "quietly paid the ransom" dan penyelidikan resmi dihentikan cepat (`story.md:45-50`) | **Tidak ada teks in-game** (grep seluruh `src/` kecuali `*.original.ts`, 2026-10-02). Yang ada hanya situs PacificCare ("IT team investigates a network issue") dan opsi Ending B "I know someone clean" (`content/m04.ts:110-117`) | Benang bebas, tidak menabrak M1-M3. Dihidupkan di M5 (DECIDED) |
| 3 | Nama Architect | Tidak memuat nama (hanya "The Architect") | `M04_ARCHITECT_REAL_NAME = "Damien Okoro"` (`content/m04.ts:45`), tanpa petunjuk satu pun di M1-M3. Mirip decoy M3 `@m.okafor` (`content/m03/network.ts:50`) | Diganti **Conrad Lindqvist** (DECIDED). Penggantian kode menunggu implementasi M7 |
| 4 | Custodian dua suara | "A recurring anonymous dead-drop contact" | Tip M1 datang dari `ANONYMOUS_TIPSTER` ("Unknown Sender", `ghost.tip@ghost.index`; `controller/m01/recon.ts:19`). Tip M2 dan M3 dari `DEAD_DROP_CONTACT` ("the Custodian", `drop@drop.null`; `controller/m02/recon.ts:15`, `controller/m03/recon.ts:15`; `content/global/characters.ts`) | Custodian tetap kosong (DECIDED). Dua alamat tidak perlu dijelaskan |
| 5 | Motif pembukuan | Tidak dinamai | BLACKLEDGER bicara dengan bahasa pembukuan: ledger, settled, escrow, "management fee", "consulting fees", "customs brokerage", Nominees, tagline "every account, settled." (`websites/m02/blkledger/home.html`) | Dijadikan tulang punggung tema (`02-peta-misi.md`, bagian A) |
| 6 | Jumlah misi | "Exactly 4 missions" (`story.md:376`) dan "4 different targets" (`story.md:24`) | M1-M3 jadi dan live. M4 lama belum dimigrasi dan belum pernah dimainkan | Menjadi 7 misi (DECIDED) |
| 7 | M4 lama | Rantai 11 langkah (`story.md:346-372`) | `main/m04.ts` masih flat. `initialShellAccess` mendengarkan `Metasploit.Meterpreter.Connected` (`docs/bugs.md` #29, OPEN untuk M4). Masih mendengarkan `Rootgrab` dan unduhan `Files.Transfer` (`docs/changelog.md` 2026-10-01). Aturan Firewall ke Device di dalam Splitter belum teruji (`docs/network.md`, bagian M4) | Dimigrasi sekali di posisi barunya sebagai M7 |
| 8 | Manifest | - | `manifest.json` menulis "across four missions" | Diperbarui saat implementasi |

## B. Benang yang sudah tertanam di M1-M3

Dikunci sebagai kenyataan dunia. Misi baru hanya boleh bersandar pada ini atau
pada konten baru yang berdiri sendiri.

| ID | Benang | Sumber | Status | Dipakai |
|---|---|---|---|---|
| H1 | Custodian berjanji bersuara hanya bila ada yang salah: "I won't check in. If something's wrong, you'll hear from me." | `i18n/m01/core.ts:92-93` | Belum dibayar | M4 |
| H2 | Pemain bisa ditemukan lewat aturan forward yang tertinggal: "A rule that's still open when they audit is how people like us get found." | `i18n/m03/core.ts:69-70` | Belum dibayar | M4 |
| H3 | "this one needs to go clean. no loose ends this time" dan "talk when the next one's ready" | `i18n/m01/core.ts:195-196` | Dibayar sebagian oleh M4 | M4 (satu baris `old_targets.txt`: "next: prepping") |
| H4 | `found_note.txt` bertanda R.a.N: "Q3-2026-SEA -- what does it mean? -- R.a.N" (tiga inisial; dulu "G", diganti 2026-10-06; teks gambar SVG berbasis base64 di `home.html`). Bukti fisik di folder Q3 kini foto "Access kit — USB / badge / key" (`q3-accesskit.jpg`, Aug 07 2026): USB bertulisan spidol putih "Q3-2026-SEA", lencana staf IT dan stiker aset "PC-IT-017". Label "Evidence PC-IT-017 — USB / staff badge / memo" dan fotonya yang lama sudah tidak ada | `websites/m01/ledgervault/home.html` (folder `q3`); `i18n/m01/ledgervault.ts` (`NAME_Q3_ACCESSKIT`) | Belum dibayar | M5 (R.a.N = Roxanne Anindita Natnaree, DECIDED) |
| H5 | Lencana terpulihkan di dua insiden lama: Northstar Port Authority 2020 dan Rheinland Energie AG 2023 | `i18n/m01/ledgervault.ts:50-51` | Belum dibayar | Latar (tidak dirujuk langsung oleh M4-M7). INFERENSI: ada pihak di lapangan |
| H6 | "Architect's cut goes out same day as settlement ... they flagged it twice already." dan "a second signer above the shell company" | `i18n/m02/core.ts:176-177`, `:86`, `:96` | "second signer" dibayar M6 dan M7. "they" (siapa yang menandai) belum | M4, M6 |
| H7 | Catatan Reyes: "i want it on record that i wrote this down first." dan spreadsheet: "told this is normal for the holding company's structure. Hope that's true." | `i18n/m03/core.ts:162`, `:142` | Dibayar sebagian oleh M4 dan M7 | M4 (`old_targets.txt`: "d.reyes: monitor"), M7 (`manifest.txt`, log pribadi per ending) |
| H8 | "Nominees isn't an operating company -- someone real still owns it, off every filing. That endpoint is where they answer." dan `owner_note = SKN Capital Nominees -- do not name in the panel, route only` | `i18n/m03/core.ts:99`, `:173` | Dibayar oleh M6 (pemilik terbukti) dan M7 | M6 |
| H9 | Pernyataan publik rumah sakit hanya menyebut "a network issue" | `websites/m01/pacificcare-health/home.html` | Belum dibayar | M5 (benih cover-up) |
| H10 | "This isn't the only job, and it won't be the last time you use it." | `i18n/m01/core.ts:94` | Belum dibayar | Tidak ada rencana (Custodian kosong) |
| H11 | Watchdog Architect: "Someone just poked one of the dead boxes ... they're not as careful as they think." Dan LegacyCMS 2.1 "build 2011.04 — unpatched since deployment" | `content/m04.ts:33-37`, `websites/m04/architect-c2/legacy-cms.html` | Ada di M7 | M4 (suara musuh lebih awal), M7 |
| H12 | Sisi manusia TR4C3404: daftar belanja, pesan tak terkirim ("tell mom I said hi") | `i18n/m02/core.ts:138-147` | Belum dibayar | Tema (M5, M7) |
| H13 | Korban lain di buku besar: FIN-NA-0091 ($4.100.000, 2026-07-22) dan LOG-EU-2209 ($1.400.000, 2026-05-02), "Q3 closes: 4" | `content/global/finance.ts`; `i18n/m02/core.ts:85` | Dibayar sebagian oleh M7 | M7 (`manifest.txt` memuat rekening korban). Claims tracker belum dipakai (OPEN) |
| H14 | Situs BLACKLEDGER (`blkledger.dark`): tiga klaim PAID (Northstar 2020 NA, Rheinland 2023 EU, PacificCare 2026 SEA), "every account, settled.", "this page is not for you. close it." | `websites/m02/blkledger/home.html`; `content/global/blackledger.ts` | Statis | Tema. M7 (`manifest.txt`: "every account, settled.") |

## C. Pagar teks terkunci

Jawaban apa pun untuk G dan Custodian harus tetap benar terhadap kalimat ini.

**Custodian** (`i18n/m01/core.ts:90-94`):

- "This address is the only channel between us. Whatever you find, however you find it, it comes here -- one report per job, nothing partial, no side conversations."
- "I won't confirm receipt and I won't check in. If something's wrong, you'll hear from me. Otherwise assume silence means it's been read and it's enough."
- "Keep this address off anything that can be traced back to you. This isn't the only job, and it won't be the last time you use it."
- Balasan "belum waktunya" (`i18n/m01/core.ts:99-100`): "Every line in it has to come from somewhere you've actually been."
- Tip M2 (`i18n/m02/core.ts:54-60`) memakai pola "kembali ke vault, ada nama yang belum menuntun ke mana-mana". Pola ini bisa dipakai lagi untuk G.
- Dialog akhir (`content/m04.ts:101-103`): "You have everything. The Architect's real identity, the whole chain, all of it. What now?"

**G** (H4, H9): catatan di atas, ditambah log M1 "That's the hallway. That's the door." (`i18n/m01/core.ts:148`) dan situs PacificCare.

## D. Diagnosis

1. **Penjahat pasif.** Pemain tidak pernah dirugikan atau dikejar sebelum jebakan statis di M4 lama. Tidak ada titik balik sebelum klimaks.
2. **Orang kecil tidak menanggung akibat.** Reyes (H7) dan keluarga pengembang (H12) ditanam sebagai orang yang terseret, tetapi tidak ada konsekuensinya.
3. **Identitas Architect tidak diperoleh.** Nama baru muncul dari berkas terenkripsi di M4 lama. Tidak ada satu petunjuk pun di M1-M3.
4. **Jalur resmi tidak pernah dipertanyakan.** Pilihan "I know someone clean" di Ending B tidak punya alasan, karena cover-up tidak ada di teks in-game.

Menambah satu anak tangga lagi (recon, tembus, baca berkas, lapor) hanya
mengulang pola. Misi baru harus mengubah jenis permainan (`02-peta-misi.md`).

## E. Anggaran hook dan syarat kunci (DECIDED: kunci setelah anggaran hook)

Prinsip anggaran hook:

- Hanya edit teks (`i18n/m0N/core.ts`, en dan zh). Tanpa perubahan gerbang atau mekanik.
- Satu batch, lalu live test, lalu kunci.
- **Bawaan: tidak ada edit.** Lapisan web membaca status dan fakta BACKTRACE (`04-web-layer.md`), jadi konsekuensi untuk M1-M3 muncul tanpa mengedit M1-M3.
- Edit hanya bila sebuah misi baru tidak bisa dijangkau lewat H1-H14 atau lewat konten baru yang berdiri sendiri. Setelah audit M4-M7 tidak ada kandidat (hasilnya di bawah).

### Hasil audit (2026-10-02): nol edit (DECIDED)

M4 sampai M7 sudah final, jadi ketergantungan tiap misi pada teks M1-M3 bisa diperiksa. Semuanya
sudah ada:

| Misi | Bergantung pada | Sumber |
|---|---|---|
| M4 | Custodian berjanji bersuara bila ada yang salah, audit aturan forward, "no loose ends", peer `SKN-CENTRAL`, Reyes | `i18n/m01/core.ts:92-93`, `i18n/m03/core.ts:70`, `i18n/m01/core.ts:195`, `content/m03/network.ts:47` |
| M5 | Folder `q3` dan event pembukaannya, `found_note.txt` bertanda R.a.N, garis waktu 02:41 sampai 09:02 dari `deploy.log` | `content/m01/report.ts:9`, `websites/m01/ledgervault/index.ts:25`, `i18n/m02/core.ts:110-119` (tanggal dari `settledAt`) |
| M6 | "Nominees ... someone real still owns it", `owner_note`, `203.0.113.160` | `i18n/m03/core.ts:99`, `:173`, `M04_ARCHITECT_VPN_IP` (dipakai M2 dan M3) |
| M7 | Router `203.0.113.160` dan fixture `whois`/`geoip`-nya di M3 | `content/m03/fixtures.ts:93-97` |

**Keputusan: anggaran hook nol edit.** Setiap edit teks harus dibuat dalam en dan zh lalu M1-M3 diuji
ulang (M2 dan M3 sudah lulus live test 2026-10-01), padahal kandidat yang masih mungkin hanya
memperkuat H2 dan H4 yang sudah ada.

**Catatan whois.** Fixture `whois` M3 untuk `203.0.113.160` menjawab "Bulletproof VPN Ltd." (`i18n/m03/core.ts`
OSINT_WHOIS_VPN_CONTACT). Supaya M4 dan M6 pas tanpa mengedit M3, registrant host kontrol M4
(Night-Shift) dan domain asuransi M6 (`nordhaven-mutual.com`) memakai nama yang sama:
**Bulletproof VPN Ltd.**. "SKN-CENTRAL" tetap label peer di config M3 dan domain `skn-central.net`
(HostTrail); nama "SKN-CENTRAL Services Ltd" dibuang.

**Perubahan kode bersama (bukan anggaran hook, M1-M3 tidak dibuka).** `BacktraceMissionId` dan
`BACKTRACE_KEYS`, `QuestId` di `guard/flags.ts`, `manifest.json`, jalur impor di
`content/global/mail-senders.ts`, serta `commands/attrcheck.ts` dan `open`. Konstanta
`M04_ARCHITECT_VPN_IP` tidak di-rename karena dipakai M2 dan M3. Cukup typecheck bersih.

Syarat sebelum kunci:

1. Live test `open` di sesi Meterpreter (`docs/bugs.md` #30 follow-up; belum diuji).
2. Teks ZH M1-M3 dimainkan (live test sejauh ini hanya bahasa Inggris, `docs/changelog.md` 2026-10-01).
3. Toggle fokus dev di `src/guard/flags.ts` kembali ke nilai commit.
4. Pekerjaan yang belum di-commit (daftar `git status` 2026-10-02) dirapikan dan di-commit ke `clouds-modify`.

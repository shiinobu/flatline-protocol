# 13 — Timeline cerita M1-M7: sumber tanggal untuk berkas

Status: dibuat 2026-10-02 atas permintaan pemilik proyek ("tanggal di berkas SSH, Meterpreter, dan evidence untuk M1-M7 mengikuti timeline cerita"). Tanggal tetap di bagian B dibaca dari kode M1-M3 yang terkunci dan dari spesifikasi DECIDED. **Hari-cerita M2-M7 di bagian C adalah PROPOSAL turunan** (belum diputuskan pemilik) yang dibuat supaya setiap fase implementasi, yang berjalan terpisah, memakai kalender yang sama (`06-pertanyaan.md` T-d). Mengikuti keputusan #36 di `README.md`.

## A. Aturan pakai

1. Semua tanggal dan jam yang muncul di **nama dan isi** berkas yang bisa dijangkau pemain (lewat SSH, sesi Meterpreter, berkas unduhan atau evidence, log, surel, dokumen, dan halaman situs) di M1-M7 mengambil nilainya dari dokumen ini. Tidak pernah dari `Time.now()`, `Date.now()`, atau `new Date()`.
   - Alasan: SDK tidak punya field tanggal untuk berkas dan `ls` hanya mencetak nama (`docs/app-asar-reference.md` E-6, `docs/bugs.md` #43). Jam game (`Time`) berjalan di kalendernya sendiri dan hubungannya dengan tanggal cerita belum diriset (`06-pertanyaan.md` T-b OPEN). Jadi tanggal hanya hidup di nama dan isi berkas.
2. Tahun cerita adalah 2026. Peristiwa yang berlangsung selalu bertahun 2026; peristiwa historis memakai tahun pada bagian B.
3. **Tidak ada berkas dari masa depan.** Tanggal pada berkas yang ditemukan di misi N tidak boleh lebih akhir dari hari-cerita misi N (bagian C). Pengecualian: rencana atau jadwal yang jelas ditulis sebagai rencana (mis. "next: prepping"), serta surat epilog Greta dan log pribadi BACKTRACE per ending, yang ditulis dari sudut pandang sesudah M7 dan boleh memakai tanggal sesudah 2026-10-03 atau "beberapa hari kemudian".
4. **Sebab mendahului akibat.** Akibat dari aksi pemain di misi N hanya bisa muncul di berkas bertanggal sesudah hari-cerita misi N.
5. Format menurut jenis berkas (ikuti preseden):
   - Log gaya syslog Linux: `Mon DD HH:MM:SS host proses[pid]: pesan`, tanpa tahun (`src/content/m01/server-files.ts`). Jangan menulis hari dalam seminggu.
   - Dokumen dan log aplikasi: `YYYY-MM-DD` dan `HH:MM UTC`, mis. `2026-08-14 09:02 UTC` (`src/content/m03/ledger.ts:40`, `deploy.log` M2).
   - Nama folder atau berkas bertanggal: ISO, mis. `/var/ir/2026-08-14/`.
   - Antarmuka web: format yang sudah dipakai situs itu (LedgerVault memakai `Aug 14, 2026`).
   - Cap epoch Unix (mis. `audit(...)` kernel): hitung dari tanggal cerita 2026 dengan `Date.UTC`; jangan menyalin angka dari contoh lain.
6. Hari dalam seminggu hanya boleh diambil dari bagian D (sudah dihitung). Jangan menulis "kamis" atau "Thu" untuk tanggal yang tidak ada di sana tanpa menghitungnya.
7. Peristiwa serangan memakai UTC. Log server yang tidak menyebut zona dianggap UTC.
8. Nominal uang, nomor batch, dan tanggal penyelesaian ransomware diturunkan dari `src/content/global/finance.ts` (`docs/rules.md` §14), bukan diketik ulang.
9. M1-M3 terkunci. Tanggal di berkasnya hanya dicatat di bagian B dan anomalinya dilaporkan di bagian F; tidak diedit. Pengecualian 2026-10-04: pemilik menyetujui tanggal baru untuk `sales_ledger.log` dan `ops-relay.log` M1 supaya bisa tampil di Log Viewer (bagian B, README #50). Bila berkas M4-M7 bertabrakan dengan tanggal M1-M3, ubah berkas M4-M7 dan laporkan.
10. Tanggal baru yang tidak ada di dokumen ini hanya boleh dibuat bila perlu dan harus memenuhi aturan 3 dan 4. Catat tiap tanggal baru di laporan akhir (butir "values you chose").

## B. Tanggal tetap

LOCKED = ada di kode M1-M3 yang terkunci. DECIDED = ada di spesifikasi yang sudah diputuskan. Hari dalam seminggu dari bagian D.

| Tanggal | Peristiwa | Sumber | Status |
|---|---|---|---|
| 2009-2018 | Conrad Lindqvist Chief Actuary, Nordhaven Mutual Assurance | `09-konten-m5-m6.md` C1 | DECIDED |
| 2017-03-09 | SKN Capital Nominees Ltd didirikan (Port Calder) | `09` C1 | DECIDED |
| 2018-2024 | Conrad Chairman Risk Committee, Nordhaven Mutual | `09` C1 | DECIDED |
| 2019 | Pengajuan Registry 2019: pemilik SKN adalah Halvard Trust. Null-Crown "decommissioned" | `09` C2, `11-spec-m7.md` I | DECIDED |
| 2019-2024 | Vivien Orchid Head of Cyber Risk, Nordhaven Mutual | `09` C1 | DECIDED |
| 2020-03-19 dan 2020-03-31 | Evidence Q1-2020-NA (Northstar Port Authority) dan foldernya di LedgerVault | `src/websites/m01/ledgervault/home.html:530,579` | LOCKED |
| 2021-11-30 | Halvard Trust dibubarkan | `09` C1 | DECIDED |
| 2021-12-02 | Nordhaven Holdings (PC) Ltd didirikan; Conrad direktur sampai 2024-03-01 | `09` C1 | DECIDED |
| 2022 | Ash-Vector "decommissioned"; `ash-gate_backup.txt` bertanggal 2022 | `11` I | DECIDED |
| 2022-06-13 dan 2022-06-14 | Tomas Brandt mundur; Imogen Hartley menjabat direktur | `09` C2 | DECIDED |
| 2023-06-28 dan 2023-06-30 | Evidence Q2-2023-EU (Rheinland Energie AG) dan foldernya di LedgerVault | `home.html:531,582` | LOCKED |
| 2024 | Pengajuan Registry 2024. Kebijakan keamanan Skynet berlaku sejak 2024. Kotak lama "seharusnya dinonaktifkan 2024" | `09` C2, `src/content/m03/network.ts:14`, `src/i18n/m01/core.ts:199` | DECIDED dan LOCKED |
| 2024-03-01 | Conrad keluar dari direksi Nordhaven Holdings | `09` C1 | DECIDED |
| 2025-11-03 | Snapshot Echoline: halaman staf IT PacificCare memuat Greta dan Gareth | `09` B3 | DECIDED |
| 2026-05-02 (Sab) | LOG-EU-2209, batch PB-2605-01, $1.400.000 | `src/content/global/finance.ts:35-40` | LOCKED |
| 2026-06-18 11:42 UTC | Baris ledger penjualan akses `FIN-EU-2214` di `sales_ledger.log` (be7) | `src/i18n/m01/core.ts` LEDGER_CONTENT | DECIDED 2026-10-04 |
| 2026-07-09 dan 2026-07-26 | Foto eksterior dan foto koridor di folder Q3-2026-SEA | `home.html:586-587` | LOCKED |
| 2026-07-14 16:05 UTC | Baris ledger penjualan akses `MED-APAC-6689` di `sales_ledger.log` | `LEDGER_CONTENT` | DECIDED 2026-10-04 |
| 2026-07-22 (Rab) | FIN-NA-0091, batch PB-2607-01, $4.100.000 | `finance.ts:42-47` | LOCKED |
| 2026-07-31 (Jum) | Kontrak Gareth Lim berakhir | `09` B2 | DECIDED |
| 2026-08-03 13:20 UTC | Baris ledger penjualan akses rumah sakit (kode listing per-simpanan, mis. `MED-SEA-0417`) di `sales_ledger.log`: 7 hari sebelum posting USB Greta, 11 hari sebelum serangan | `LEDGER_CONTENT` | DECIDED 2026-10-04 |
| 2026-08-10 (Sen) | Greta memposting temuan USB berlabel "Q3-2026-SEA" | `09` B2 | DECIDED |
| 2026-08-11 (Sel) 00:12 UTC | USB dicolokkan ke PC-IT-017 oleh `g.desouza` | `09` B5, B6 | DECIDED |
| 2026-08-14 (Jum) | Serangan PacificCare, batch PB-2608-01, CASE-A7X-0417, $2.850.000. Jam UTC: 02:14 payload didorong, 02:41 sistem terkunci, 02:55 jadwal ruang operasi dan rekam medis mati, 03:20 tim krisis, 03:58 asuransi dihubungi, 04:35 negosiator dilibatkan, 05:12 "Clinical incident logged, Operating Theatre 3", 06:10 tuntutan terkonfirmasi, 07:30 asuransi setuju, 08:40 CRO mengotorisasi, 09:02 pembayaran (escrow released), 09:04 diterima, 09:15 paperwork diarsipkan, 09:20 parent dan sinkron, 09:24 panel, 09:27 broker. Jeda terkunci ke bayar: 6 jam 21 menit | `finance.ts:28-33,49-54`, `src/i18n/m02/core.ts:102,110-118`, `09` B5 | LOCKED dan DECIDED |
| 2026-08-14 | Scan `q3receipt` dan `q3notice` di vault bertanggal Aug 14, 2026 | `home.html:585,588` | LOCKED |
| 2026-08-15 (Sab) | Draf temuan insiden v1 (penyebab: alat dukungan jarak jauh pihak ketiga) | `09` B5 | DECIDED |
| 2026-08-16 (Min) | Draf rekonsiliasi Reyes "dated Aug 16, 2026", dua hari sesudah otorisasi transfer | `src/i18n/m03/core.ts:144` | LOCKED |
| 2026-08-17 (Sen) | Persetujuan Nordhaven atas klasifikasi (catatan di `manifest.txt`). Posting terakhir Greta | `11` I, `09` B2 | DECIDED |
| 2026-08-18 (Sel) | Greta menandatangani pengakuan; tiket USB dibuka | `09` B5 | DECIDED |
| 2026-08-19 (Rab) | Temuan final; Greta diberhentikan | `09` B5 | DECIDED |
| 2026-08-24 (Sen) | Penyelidikan ditutup | `09` B5 | DECIDED |
| 2026-08-29 (Sab) | Foto penjadwalan ruang operasi di vault | `home.html:589` | LOCKED |
| 2026-09-02 (Rab) | Snapshot Echoline: halaman staf IT tanpa Greta dan Gareth | `09` B3 | DECIDED |
| 2026-09-09 sampai 2026-09-18 | Rentang log backend `be7` M1 (sshd, cron, kernel) | `src/content/m01/server-files.ts:33-80` | LOCKED |
| 2026-09-16 (Rab) 14:55-15:20 | Sesi SSH broker X7xS3NTRY9 di `be7` | `server-files.ts:46-49` | LOCKED |
| 2026-09-16 (Rab) 15:01:00 UTC | `ops-relay.log` di `be7` (satu entri: Log Viewer hanya menampilkan `[ENCRYPTED]`, blob base64 ada di kolom tipe yang dicetak `cat`), di dalam sesi SSH broker | `src/content/m01/irc.ts` | DECIDED 2026-10-04 |
| 2026-09-18 (Jum) | Folder Q3-2026-SEA di LedgerVault dan scan `found_note` bertanggal Sep 18, 2026; log `be7` berakhir pukul 02:47. **Hari-cerita M1** | `home.html:532,590-600`, `server-files.ts:50-51,80` | LOCKED |

Selisih serangan ke hari-cerita M1: 35 hari (2026-08-14 ke 2026-09-18). Premis "8-12 bulan" di `docs/story.md` bertentangan dengan ini dan belum diubah (`06-pertanyaan.md` T-a OPEN); tanggal di kode yang berlaku.

Jam konstan M4 yang sudah diputuskan (`10-spec-m4.md` F, keputusan #26): serangan 2 pukul 03:14:07, Quiet-Mirror 03:14:06, Paper-Moth 03:14:41. Jamnya tetap, tanggalnya hari-cerita M4.

## C. Hari-cerita per misi (PROPOSAL)

Hari-cerita adalah "sekarang" di dalam cerita ketika pemain menjalankan misi itu. Batas atas tanggal berkas pada aturan A.3.

| Misi | Hari-cerita | Hari | Dasar |
|---|---|---|---|
| M1 | 2026-09-18 | Jum | LOCKED (vault dan log `be7`) |
| M2 | 2026-09-19 | Sab | PROPOSAL: sehari sesudah M1. Berkas M2 hanya memuat tanggal 2026-08-14 |
| M3 | 2026-09-21 | Sen | PROPOSAL: draf Reyes bertanggal 2026-08-16 |
| M4 | 2026-09-24 | Kam | PROPOSAL: serangan malam hari, 03:14:07 |
| M5 | 2026-09-27 | Min | PROPOSAL |
| M6 | 2026-09-30 | Rab | PROPOSAL |
| M7 | 2026-10-03 | Sab | PROPOSAL |

Tanggal turunan lain (PROPOSAL):

| Tanggal | Peristiwa | Dipakai di |
|---|---|---|
| 2026-09-23 (Rab) | Skynet Import-Export "struck off" di Registry (hanya tampil bila M3 selesai). Sesudah M3, sebelum M4 | M6 |
| 2024-06-10 | Snapshot Echoline Skynet 2024 (D. Reyes masih terdaftar) | M6 |
| 2026-09-26 (Sab) | Snapshot Echoline Skynet 2026 ("D. Reyes: no longer listed" bila M3 selesai). Sesudah M4, sebelum M6 | M6 |
| 2026-07-31 (Jum) | Postingan perpisahan Gareth Lim (hari terakhir kontrak) | M5 |

## D. Kalender

Hari dalam seminggu, dihitung untuk 2026 (UTC).

| Tanggal | Hari | Tanggal | Hari |
|---|---|---|---|
| 2026-05-02 | Sabtu | 2026-08-29 | Sabtu |
| 2026-07-22 | Rabu | 2026-09-02 | Rabu |
| 2026-07-31 | Jumat | 2026-09-09 | Rabu |
| 2026-08-10 | Senin | 2026-09-16 | Rabu |
| 2026-08-11 | Selasa | 2026-09-18 | Jumat |
| 2026-08-14 | Jumat | 2026-09-19 | Sabtu |
| 2026-08-15 | Sabtu | 2026-09-21 | Senin |
| 2026-08-16 | Minggu | 2026-09-23 | Rabu |
| 2026-08-17 | Senin | 2026-09-24 | Kamis |
| 2026-08-18 | Selasa | 2026-09-26 | Sabtu |
| 2026-08-19 | Rabu | 2026-09-27 | Minggu |
| 2026-08-24 | Senin | 2026-09-30 | Rabu |
| | | 2026-10-03 | Sabtu |

## E. Berkas M4-M7 yang sudah tersirat spesifikasi

"Jendela" berarti agen memilih nilai di dalam batas itu dan mencatatnya di laporan akhir.

### M4 (hari-cerita 2026-09-24)

| Berkas | Tanggal dan jam | Sumber | Status |
|---|---|---|---|
| `~/logs/firewall.log` di PC pemain (serangan 1) | 2026-09-24, jam 02:20 sampai 03:05, gaya syslog `Sep 24 HH:MM:SS` | `10-spec-m4.md` F | jam konstan DECIDED; jendela PROPOSAL |
| `incident.txt` (serangan 2) | 2026-09-24 03:14:07 (waktu serangan) | `10` F | jam DECIDED; tanggal PROPOSAL |
| `auth.log` di Static-Hop | 2026-09-24: Quiet-Mirror 03:14:06, Paper-Moth 03:14:41, tiga koneksi lain sebelum 03:00 | `10` F | jam DECIDED; tanggal PROPOSAL |
| `watchdog.conf`, `old_targets.txt`, `notes.txt` | tanpa tanggal; bila perlu, paling akhir 2026-09-24 | `10` F | |

### M5 (hari-cerita 2026-09-27)

| Berkas | Tanggal | Sumber | Status |
|---|---|---|---|
| `/var/ir/2026-08-14/decision_memo.txt` | linimasa 2026-08-14 pada bagian B | `09` B5 | DECIDED |
| `/var/ir/2026-08-14/finding_draft_v1.txt` | 2026-08-15 | `09` B5 | DECIDED |
| `/var/ir/2026-08-14/finding_final.txt` | 2026-08-19; Greta diberhentikan 2026-08-19; penyelidikan ditutup 2026-08-24 | `09` B5 | DECIDED |
| `/var/ir/2026-08-14/acknowledgement_gdesouza.txt` | 2026-08-18 | `09` B5 | DECIDED |
| `/var/ir/tickets/usb_ticket_PC-IT-017.txt` | dibuka 2026-08-18; USB dicolokkan 2026-08-11 00:12 UTC | `09` B5 | DECIDED |
| `/var/ir/tickets/asset_register.txt` | "per 2026-08-18" bila diberi tanggal | `09` B5 | PROPOSAL |
| `/home/g.desouza/notes.txt` | 2026-08-18 (batas: 2026-08-14 sampai 2026-08-18, sebelum ia diberhentikan) | `09` B5 | PROPOSAL |
| Bedside-17 `usb_history.log` | 2026-08-11 00:12 UTC | `09` B6 | DECIDED |
| Bedside-17 `found_note.txt` | tanpa tanggal (sticky note) | `09` B6 | DECIDED |
| Situs Echoline, halaman M5 | snapshot 2025-11-03 dan 2026-09-02 | `09` B3 | DECIDED |
| LeakIndex | tahun kebocoran seperti di tabel `09` B4 (MedVendor Portal 2025, FoodForum 2022) | `09` B4 | DECIDED |
| Twotter Greta | sampai 2026-08-17; Gareth: perpisahan 2026-07-31 | `09` B2 | DECIDED |

### M6 (hari-cerita 2026-09-30)

| Berkas | Tanggal | Sumber | Status |
|---|---|---|---|
| Rekaman Registry dan pengajuan 2019 dan 2024 | tanggal pada bagian B (2017-03-09, 2021-11-30, 2021-12-02, 2022-06-13, 2022-06-14, 2024-03-01, dan seterusnya) | `09` C1, C2 | DECIDED |
| Stempel "terakhir diperbarui" atau "diambil" di Registry, HostTrail, Echoline | paling akhir 2026-09-30 | | PROPOSAL |
| Tanggal sertifikat bersama yang ditampilkan HostTrail | harus mencakup 2026-09-30, kecuali sengaja kedaluwarsa | `09` C2 | PROPOSAL |
| Konsekuensi M3 pada rekaman | tanggal pada bagian C | `09` C2 | PROPOSAL |

### M7 (hari-cerita 2026-10-03)

| Berkas | Tanggal | Sumber | Status |
|---|---|---|---|
| `/legacy-cms/`, tabel status node | Null-Crown dinonaktifkan 2019, Ash-Vector 2022; C2 dan ash-gate tanpa tanggal nonaktif | `11` I | DECIDED |
| `ash-gate_backup.txt` di Ash-Vector | 2022 | `11` I | DECIDED |
| `manifest.txt` | Northstar 2020 NA; Rheinland 2023 EU; LOG-EU-2209 2026-05-02; FIN-NA-0091 2026-07-22; CASE-A7X-0417 2026-08-14; persetujuan Nordhaven 2026-08-17. Nominal dan tanggal dari `finance.ts` | `11` I, `finance.ts` | DECIDED dan LOCKED |
| Tanggal tambahan di `manifest.txt` (mis. "terakhir direkonsiliasi") | antara 2026-08-17 dan 2026-10-03 | | PROPOSAL |
| Surat epilog Greta, log pribadi per ending | dari sudut pandang sesudah M7 (aturan A.3) | `05-ending.md` B2 | DECIDED |

Surel Custodian, surel `sentry@darknull.io`, dan surel `watchdog@architect-c2.dark` tidak memuat tanggal di spesifikasi; cap waktunya dari jam game dan tidak diatur mod.

## F. Anomali di M1-M3 (terkunci; hanya dilaporkan)

1. `src/content/m01/server-files.ts:80`: baris kernel `audit(1758169650.512:88)`. Epoch 1758169650 adalah 2025-09-18T04:27:30Z: tahun 2025 (cerita 2026) dan jam 04:27 tidak cocok dengan cap syslog `Sep 18 02:47:31` di baris yang sama. Untuk 2026-09-18T02:47:30Z nilainya 1789699650. Dampak: kosmetik; hanya terlihat bila pemain membaca log kernel. Perbaikan, bila pemilik mengizinkan edit M1: ganti angka epoch.
2. `server-files.ts:71,79,80`: penghitung uptime kernel `[041502.912004]` (Sep 09 04:17:02), `[128841.552310]` (Sep 17 22:14:55), dan `[131022.114857]` (Sep 18 02:47:31) tidak konsisten dengan jarak waktunya. Selang pertama 8 hari 17 jam 57 menit 53 detik (755.873 detik) tetapi penghitung hanya naik 87.339 detik; selang kedua 4 jam 32 menit 36 detik (16.356 detik) tetapi penghitung naik 2.181 detik. Dampak: kosmetik.
3. `src/applications/backtrace.html`: data contoh pratinjau lama memakai `completedAt: Date.UTC(2026,4,4)` (4 Mei 2026), sebelum serangan. SELESAI 2026-10-03: redesain BACKTRACE membuang data contoh itu dan tidak lagi membaca `completedAt`. Tanggal "Completed" tiap laporan kini konstanta `STORY_DATES` dengan hari-cerita bagian C (M1 18 Sep, M2 19 Sep, M3 21 Sep, M4 24 Sep, M5 27 Sep, M6 30 Sep, M7 03 Okt 2026).
4. `docs/story.md` memuat premis "~8-12 bulan sebelum cerita dimulai"; kode mengatakan 35 hari. Sudah tercatat di `01-canon-dan-hook.md` A dan `06-pertanyaan.md` T-a.

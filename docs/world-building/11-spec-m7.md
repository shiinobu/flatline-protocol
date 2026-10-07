# 11 — M7 "The Architect": spesifikasi v2

Status: **v2, disusun 2026-10-06** setelah M6 FINAL LOCK dan merge `clouds-modify` ke `main` (247273e). Menggantikan v1 (2026-10-02, migrasi M4 lama), yang disimpan utuh di `11-spec-m7.v1.md`. Keputusan pemilik tercatat di README #73-#76. Mengikuti templat `07-arsitektur-misi-baru.md` bagian D. Nilai konkret (alamat, kata sandi, id, angka) berstatus PROPOSAL sampai pemilik meninjau berkas ini; prosa en dan zh ditulis saat implementasi.

Label: **CANON** terverifikasi di kode atau dokumen; **INFERENSI** kesimpulan dari bukti; **PROPOSAL** rancangan baru; **OPEN** menunggu pemilik. Semua nama, tempat, situs, dan orang fiktif dan berjalan di simulasi HackHub; berkas ini membahas desain cerita dan mekanik (event, gating, bentuk data), bukan cara serangan dunia nyata.

## Brief pemilik (mengikat; 2026-10-06)

1. M7 menjawab semua petunjuk, laporan, dan hasil investigasi M1-M6.
2. M7 adalah misi paling kompleks (cerita, mekanik, penyelesaian). Kunci BACKTRACE boleh paling banyak.
3. Cerita disusun ulang karena M1-M6 berubah besar.
4. Dipakai: Cipher Desk, RDC, Metasploit, dan duel peretasan berpewaktu yang mulai saat pemain memasuki titik tertentu; gagal berarti breach; lawannya Conrad (pemain berada di server atau komputer pribadinya).
5. **Tidak ada mekanik baru.** Semua dari investigasi dan pengalaman pemain di M1-M6.
6. **Playfair hanya di M6.** M7 tidak memakainya.
7. M7 dibangun di `main`. Hadiah disesuaikan di akhir.

## Keputusan D1-D14

| # | Keputusan | Status |
|---|---|---|
| D1 | Conrad adalah `SENTRY`: satu akun yang menyetujui rilis 2026-08-14 02:11 UTC dan menyerang pemain di M4 | DECIDED 2026-10-06 |
| D2 | `194.36.108.20` kanon: infrastruktur broker M1 = sumber login pertama dengan kredensial Roxanne (M5) | DECIDED 2026-10-06 |
| D3 | "next: prepping" = dua cadangan klaim FIN-EU-2214 dan MED-APAC-6689 | DECIDED 2026-10-06 |
| D4 | Konsultan 3 Agu = survei pengendalian kerugian Nordhaven, tak bernama | DECIDED 2026-10-06 |
| D5 | HoneyCheck dan `attrcheck` dibuang dari M7 | DECIDED 2026-10-06 |
| D6 | Halaman RDC global boleh diubah (profil lewat `Exports`) dengan **salinan cadangan asli lebih dulu** supaya dapat dipulihkan (bagian J.4) | DECIDED 2026-10-06 |
| D7 | Portal klaim `portal.nordhaven-mutual.com` sebagai situs misi | DECIDED 2026-10-06 |
| D8 | 12 kunci BACKTRACE wajib + 3 opsional (kunci `ledgerRoom` ditambah 2026-10-07, README #84) | DECIDED 2026-10-06, diubah 2026-10-07 |
| D9 | Apakah Duel 2 boleh diputus lebih awal dengan `flatline` | TIDAK, dan tidak ada jalan keluar lain (2026-10-07): tidak ada repel di duel dan perintah `flatline` akan dihapus pemilik sebelum produksi. Sempat CLOSED dengan "laporan adalah jalan keluar aman", lalu dibuka lagi oleh D16: laporan butuh kunjungan ke ruang buku BLACKLEDGER, yang baru terbuka setelah Duel 2 menang. Kalah = ulang, tanpa jalan buntu (bagian K) |
| D10 | Penutup lengkap per ending (log pribadi untuk Reyes, TR4C3404, Orchid, korban) | DECIDED 2026-10-06 |
| D11 | Hadiah | DECIDED 2026-10-07: 4500; total M1-M7 15.000 (M1-M3 1000, M4 1500, M5 2500, M6 3500) |
| D12 | Urutan membangun: lapis demi lapis (Inti, lalu Tambahan, lalu Opsional) dengan titik uji live setelah Inti | DECIDED A 2026-10-06 |
| D13 | Judul tetap "The Architect" | DECIDED 2026-10-06 |
| D14 | Berkas tentang pemain (kerabat pasien OT3, alias GHOSTWIRE) disertakan | DECIDED 2026-10-06 |
| D15 | Semua sesi Metasploit di M7 memakai port eksternal khusus minimal 5 digit (C2: 46721 -> internal 3389). Pemain wajib `set RPORT` dan `set Version`; port dan versi ditemukan lewat `nmap -sV`. M2, M3, M5 (FINAL LOCK) tidak diubah | DECIDED 2026-10-07 |
| D16 | Situs BLACKLEDGER pindah dari M2 ke M7 sebagai kunci wajib terakhir: langkah `blackledgerSeen` (23 langkah), terbuka saat Duel 2 menang. Host acak `fc3dhvrvxdw4qdnzcruwf233nyk6rtea.blackledger` (`BLACKLEDGER_DOMAIN`), tidak diindeks Goagle, wajib HTTPS, URL hanya tertulis di `model_note.txt` dan `file_ghostwire.txt` di komputer Conrad. Toast "Last event on this mission, go report it!" muncul sekali saat kunjungan terhitung. Situs lama di M2 diarsipkan (`src/archive/websites/m02/blkledger.original/`) dan baris `deploy.log` M2 tak lagi menyebut domain. `relay.blkledger.dark` (host IRC M1) dibiarkan. Urusan BACKTRACE ditahan sampai perombakan BACKTRACE pemilik (H.2) | DECIDED dan DIJALANKAN 2026-10-07 |

## A. Identitas

`name: "flatline.m07"`, grup `storyline`, `autoStart: true`, `questGate("m07", ["flatline.m06"])`, bukan `Abandonable`, satu objective `m07.objective.00`. Hari-cerita 2026-10-03 (Sabtu).
Objective (en, draf): "You have the name. Take the proof from the Architect's own books, reach the machine he keeps closest, and report what it proves and what you will do with it to the dead drop."
Hadiah: `Bank.transaction` di `OnComplete`, `Rewards` quest tidak diisi, dilewati saat dev/tester focus (README #34). Nilai final 4500 (D11, diputuskan 2026-10-07).

## B. Dari draf M7 lama ke v2 (cacat v1 dan nasibnya)

| Bagian draf lama (kode di `main`) | Nasib |
|---|---|
| Topologi Router, Splitter, Firewall `ash-gate` (hidden), C2, Null-Crown, Ash-Vector; LAN `192.168.1.x` | Dipertahankan (cacat v1 #1, #2, #3, #6, #7, #8, #9, #10, #11 tetap terperbaiki) |
| Gerbang 12 langkah, laporan, `choice`, tiga efek ending, surat A/B | Dikembangkan menjadi 23 langkah (bagian E; satu segel sejak 2026-10-07; langkah ruang buku BLACKLEDGER sejak D16) |
| Jejak 240 detik, penalti, breach, `.enc` ditimpa lalu dipulihkan | Dipertahankan sebagai Duel 1 (bagian K) |
| HoneyCheck (`websites/global/honeycheck/`, `content/m07/honeycheck.ts`) | **Dibuang** (D5); diarsipkan di `src/archive/`, bukan dihapus |
| `attrcheck` dan jebakan buka-`.enc` (cacat v1 #4, #5) | **Dibuang** (D5). Aturan dalam dunia: membuka `.enc` dengan `open` di host memangkas jendela; memakai event `open` yang sudah dikenal sejak M2 |
| Manifest "employee negligence (R. Natnaree)", tanpa Cipher, RDC, atau portal | Ditulis ulang |
| `M07_ARCHITECT_VPN_IP` | Nama tidak diganti (dipakai M2 dan M3) |

## C. Buku bukti (hasil investigasi)

### C.1 Benang yang belum dijawab

| ID | Benang | Sumber | Status |
|---|---|---|---|
| T1 | Penyusup fisik: foto "Visitor pass — consultant" (3 Agu), tiket HD-4468 "VPN token for visiting consultant" (3 Agu 07:15, diminta `hazel.t`, dikeluarkan `rafael.bautista` 08:00), foto "Access kit" (7 Agu), foto recon (9 Jul); lencana "recovered" di Northstar 2020 dan Rheinland 2023 | `i18n/m01/ledgervault.ts`, `13` B, `content/m05/portal-data.ts` | CANON (fakta); pelakunya belum terjawab |
| T2 | Sumber login pertama dengan kredensial Roxanne: `194.36.108.20`, 2026-08-11 00:41 UTC, lima sesi sampai 08-14 02:09. Sama dengan `M01_BROKER_INFRA_IP` (`x7xsentry9.tech`) | `content/m05/network.ts:92`, `content/m01/network.ts:30`, `portal-signins.ts` | CANON: dua konstanta sama; kini kanon (D2) |
| T3 | CHG-2606-022 (30 Jun 03:00): sinkron direktori dijeda, media lepas log-only, "Office of the CRO", revert 15 Jul tidak pernah | `content/m05/portal-data.ts` | CANON; siapa yang memerintahkan belum terjawab |
| T4 | Memo: "05:12 Clinical incident logged, Operating Theatre 3 ... Excluded from external statement". Adik pemain tak bernama | `content/m05/rdc.ts`, `i18n/m02/core.ts` | Bahwa adik ada di OT3: INFERENSI |
| T5 | Dua penjualan akses tanpa batch pelunasan: FIN-EU-2214 (18 Jun) dan MED-APAC-6689 (14 Jul), pembeli TR4C3#404; log M1 pemain: "Two of the three were healthcare". M2: "Closes this quarter: 4" padahal `finance.ts` hanya punya dua batch di kuartal itu | `i18n/m01/core.ts`, `i18n/m02/core.ts`, `finance.ts` | CANON (tidak cocok); jawaban lewat D3 |
| T6 | `old_targets.txt` M4: "pacificcare/it: closed", "next: prepping" | `i18n/m04/core.ts` | Dijawab D3 |
| T7 | Pemburu `SENTRY` (`sentry@darknull.io`, tag operator, beacon 60 detik); "wonder who else has your name"; Custodian: "Someone will close it." | `content/m04/network.ts`, `i18n/m04/core.ts` | Dijawab D1 |
| T8 | M2: "Architect's cut goes out same day ... they flagged it twice already." | `i18n/m02/core.ts` | Dijawab di `release_orders.log` (bagian I) |
| T9 | Notulen 12 Des 2023 (ditandatangani 14 Des): item 1 "Reserve position — cyber reserves against the quarter's claims. Found adequate."; item 2 dua penyelesaian di luar polis (NA 2020, EU 2023) dilepas ke rekening yang dipegang lewat SKN; item 3 kepentingan Holdings dinyatakan | `i18n/m06/site.ts`, `content/m06/minutes.ts` | CANON. Kata "reserves" sudah ada di M6, jadi tema cadangan klaim tertanam |
| T10 | Nasib Reyes, TR4C3404, Closer-Rig, Orchid, Roxanne | `05-ending.md`, `06` E-b | Dijawab di bagian N |
| T11 | Tomas Brandt mundur 2022-06-13, Hartley menggantikan 2022-06-14; Voss umpan | `content/m06/network.ts` | Tetap umpan |
| T12 | Roxanne diberhentikan 2026-08-19 tetapi capture Echoline 2026-08-18 sudah tak memuatnya | `content/m05`, `14-rename-m5.md` | Dibaca sebagai tekanan sebelum pemberhentian; tidak diubah |

### C.2 Tautan lintas misi yang sudah tertanam

1. `194.36.108.20`: M1 (infrastruktur broker), M5 (sumber foothold), M2 (sesi terakhir 08-14 02:09, lima menit sebelum "02:14 pushed" di `deploy.log`; kunci 02:41 dan bayar 09:02 sama dengan memo M5).
2. 3 Agu: baris ledger 13:20 UTC, kwitansi ClearEscrow, foto visitor pass, tiket VPN konsultan.
3. Tanggal vault Northstar (2020-03-19/31) dan Rheinland (2023-06-28/30) cocok dengan tahun di notulen M6.
4. `SENTRY` hanya ada di M4; belum dipakai tempat lain.
5. `203.0.113.159` (Night-Shift), `.160` (titik akhir), `.161` (C2 M7) bertetangga; registrant Bulletproof VPN Ltd. di M3, M4, dan whois asuransi M6.
6. Sertifikat portal Nordhaven dan `vpn.skn-central.net` berbagi sidik jari (`5d86`); `portal.nordhaven-mutual.com` (193.42.33.60) belum punya situs.

## D. Cerita M7 tersusun ulang

**Premis.** Pemain punya nama. Nama bukan kasus. Conrad Lindqvist menjalankan sindikat lewat pembukuan: asuransinya membayar tebusan, tebusan mengalir ke entitasnya (60% ke SKN), dan "garis kerugian" tetap datar. M7 membuktikannya dengan dokumen miliknya sendiri, lalu memaksa pemain menghadapinya di komputer pribadinya, di bawah jam yang berjalan mundur.

**Gagasan pengunci.** Asuransi memasang **cadangan klaim sebelum kejadian**. Ledger broker M1 mencatat penjualan akses 18 Jun dan 14 Jul; cadangan di buku asuransi bertanggal sama. Mereka tahu karena merekalah yang mengatur. Notulen M6 sudah menyebut komite meninjau "cyber reserves"; M7 menunjukkan apa isinya.

### D.1 Peta penyelesaian (benang → jawaban → pembuktian)

| Benang | Jawaban M7 | Dibuktikan lewat | Kunci / kolom laporan |
|---|---|---|---|
| T9 uang asuransi → SKN | Portal klaim: CASE-A7X-0417, FIN-NA-0091, LOG-EU-2209 berstatus "Paid" pada tanggal penyelesaian BLACKLEDGER, dibayar lewat rekening yang dipegang SKN. Penyelesaian 2020 dan 2023 tidak punya klaim ("outside policy terms", sesuai notulen) | S3 | `claims` |
| T5, T6 korban berikutnya | Manifest `[reserves]`: FIN-EU-2214 (cadangan 2026-06-18) dan MED-APAC-6689 (2026-07-14), "pre-notified, insured not notified". Portal memverifikasi | S12 dan S16 | `manifest` (kolom `reserves`) |
| T2 foothold | `release_orders.log` mencatat sesi dari `x7xsentry9.tech` (194.36.108.20) dengan akun `rnatnaree` pada 08-11 00:41 dan seterusnya | S13 | `orders` |
| T7 SENTRY | Operator yang menyetujui rilis 08-14 02:11 adalah akun `sentry` = Conrad; di Duel 2 ia bicara lewat siaran `sentry@darknull.io` yang sama dengan M4 | S13, S20 | `orders`, kolom `architect` |
| T1 penyusup | `survey_visits.txt`: survei pengendalian kerugian Nordhaven (kode survei, orang tak bernama) mengunjungi PacificCare 3 Agu, menyiapkan "media + lencana + kunci" 7 Agu; catatan lama Northstar 2020 dan Rheinland 2023 | S14 | `survey` |
| T3 CHG-2606-022 | Instruksi 24 Jun dari Conrad kepada Orchid di komputer pribadinya | S21 | `instruction` |
| T4 adik pemain | Berkas tentang kerabat pasien OT3 dan alias GHOSTWIRE (menjawab "who else has your name"; nama pemain disamarkan, tetap tak bernama) | RDC dokumen 3 (di luar rantai) | `dossier` (opsional) |
| T8 "they flagged it twice" | `release_orders.log`: pembayaran bagian Architect dipercepat setelah dua teguran audit rekening penyelesaian | S13 | bagian dari `orders` |
| Model Conrad | Memo "supply managed, the line stays flat" | RDC dokumen 2 (di luar rantai) | `model` (opsional) |
| T10 Reyes, TR4C3404, Closer-Rig, Orchid, Roxanne | Daftar `[watch]` dan `[affiliates]` di manifest; nasib per ending (bagian N) | S12, S22 | log pribadi |
| "Someone will close it" | Pemain yang menutupnya; satu baris Custodian setelah laporan | S22 | - |
| T11 Brandt, Voss, Hartley | Tetap umpan; laporan menolak Voss sebagai Architect | - | validator |

### D.2 Tokoh

- **Conrad Lindqvist** (59, lahir 1967): aktuaris; juga operator `SENTRY`. Dingin, bahasa pembukuan. Kata sandi komputer pribadi memakai tahun lahirnya.
- **Vivien Orchid**: CRO PacificCare; menerima instruksi 24 Jun (melemahkan kontrol), memutuskan membayar dan menyalahkan Roxanne. Bukan penjahat utama (batas `03` tetap).
- **Roxanne Anindita Natnaree**: tak berubah; surat epilog A dan B, tanpa surat di C.
- **Penyurvei Nordhaven**: tak bernama; hanya kode survei.
- **Custodian**: tetap kosong (README #7); bicara hanya lewat tip, "belum waktunya" (J.7: kini untuk setiap laporan templat selama rantai belum lengkap, apa pun isi kolomnya), "What now?" (sejak D16 dikirim saat Duel 2 menang, tanpa URL), dan satu baris penutup.

### D.3 Tanggal (semua memenuhi `13` A.3-A.4; kutipan juga di `13`)

| Tanggal | Peristiwa |
|---|---|
| 2026-06-18, 2026-07-14 | Cadangan klaim FIN-EU-2214, MED-APAC-6689 (sama dengan baris ledger M1) |
| 2026-06-24 | Instruksi Conrad kepada Orchid (mendahului CHG-2606-022 30 Jun) |
| 2026-07-09 | Survei luar PacificCare (sama dengan foto recon) |
| 2026-08-03 | Kunjungan survei, token jarak jauh 14 hari (sama dengan HD-4468) |
| 2026-08-07 | Kit disiapkan (sama dengan foto access kit) |
| 2026-08-11 00:41 dan 01:03; 08-12 02:17; 08-13 01:58; 08-14 02:09 | Sesi dari 194.36.108.20 (persis `FOOTHOLD_SESSIONS`) |
| 2026-08-14 02:11 UTC | Rilis disetujui oleh `sentry` (di antara sesi 02:09 dan "02:14 pushed") |
| 2026-08-17 | Persetujuan klasifikasi oleh Nordhaven (sudah ada di manifest lama) |
| 2026-09-24 | Berkas tentang pemain diperbarui (setelah serangan M4); opsional |
| Sampai 2026-10-03 | Stempel "terakhir diperbarui" di dunia M7 |

## E. Rantai gerbang (23 langkah, transitif)

Semua pemicu Tier 1 dan sudah dipakai di M1-M6 (status live per butir ada di bagian Q). Satu objective; langkah berurutan lewat `advanceStep` (`rules.md` §11).

| # | Langkah | Requires | Pemicu | Belajar di | Efek |
|---|---|---|---|---|---|
| 1 | `tipReviewed` | - | `Mail.Read` tip Custodian | M2, M5, M6 | situs portal klaim terbuka |
| 2 | `claimsPortalSeen` | 1 | `Browser.Meta` beranda portal | M5, M6 | - |
| 3 | `paidClaimsMatched` | 2 | tiga pencarian klaim lewat `Exports.flatlineClaimLookup(ref)`: CASE-A7X-0417, FIN-NA-0091, LOG-EU-2209 | M5 (flag `seen`) | kunci `claims` |
| 4 | `endpointMapped` | 3 | `Python3.ExecFile` `net_tree.py` pada 203.0.113.160 | M3 | fixture `nmap` C2 |
| 5 | `edgeScanned` | 4 | `Terminal.NmapScan` -sV pada C2 | M2, M3 | halaman `/legacy-cms/` |
| 6 | `dashboardFound` | 5 | `Browser.Meta` `/legacy-cms/` (ditemukan lewat `dirhunter`) | M6 | kunci `nodes` |
| 7 | `deadBoxEntered` | 6 | `RemoteConnection.Established` SSH ke Ash-Vector | M1-M4 | - |
| 8 | `credentialRead` | 7 | `onFileRead` `ash-gate_backup.txt` | M2, M4 | kunci `credential` |
| 9 | `firewallLoggedIn` | 8 | `PFSense.Login` | M1, M2 | - |
| 10 | `firewallBreached` | 9 | `PFSense.Changes` | M1, M2 | kunci `firewall`; port RDP khusus (D15) dibuka |
| 11 | `shellObtained` | 10 | `RemoteConnection.Established` METASPLOIT | M2 | kunci `c2`; **Duel 1 mulai** |
| 12 | `manifestRead` | 11 | `onFileRead` `manifest.txt` | M2, M3 | kunci `manifest` |
| 13 | `ordersRead` | 12 | `onFileRead` `release_orders.log` (entri Log Viewer) | M1, M4 | kunci `orders` |
| 14 | `surveyRead` | 13 | `onFileRead` `survey_visits.txt` | M2 | kunci `survey` |
| 15 | `ledgerTaken` | 14 | `Files.Transfer` DOWNLOAD `master_ledger_backup.enc` (terbukti live di sesi Metasploit, probe P2, 2026-10-07; `#45` bukan butir ini) | M2 | kunci `ledger`; **Duel 1 selesai** |
| 16 | `reservesChecked` | 15 | `Exports.flatlineClaimLookup(ref)` untuk kedua cadangan (MED-APAC-6689 dan FIN-EU-2214) | langkah 3 | halaman cadangan terbuka; nomor rekening penyelesaian tampil hanya di sini |
| 17 | `sealRead` | 16 | `onFileRead` `master_ledger_backup.enc` di `~/downloads` | M2, M3 | - |
| 18 | `sealOpened` | 17 | `flatline.cipher.opened` id `ledgerSeal` (kunci = rekening penyelesaian dari langkah 16 + referensi cadangan MED dari manifest, disambung tanda hubung) | M5, M6 | kunci `seal` |
| 19 | `workstationLoggedIn` | 18 | `flatline.rdc.login` kode target pribadi (token dibuat dengan Cipher Encrypt) | M5 | - |
| 20 | `displayAttached` | 19 | `flatline.rdc.attached` | M5 | **Duel 2 mulai**; dokumen bergerbang terbuka |
| 21 | `instructionRead` | 20 | `flatline.rdc.read` gate 1 (terjadi saat dokumen terenkripsi **berhasil didekripsi**, bukan saat dibuka) | M5 | kunci `instruction` |
| 22 | `blackledgerSeen` | 21 | `Browser.Meta` halaman depan `fc3dhvrvxdw4qdnzcruwf233nyk6rtea.blackledger` (https), hanya terhitung bila ketiga dokumen komputer pribadi sudah terbaca (Duel 2 menang) | M6 | surel "What now?" dikirim saat Duel 2 menang; toast "Last event on this mission, go report it!"; BACKTRACE belum disentuh |
| 23 | `reportSent` | 22 | `Mail.Sent` ke Custodian, `matchesFields`, `choice` | M1-M6 | `completeObjective`; efek ending |

**Di luar rantai (tidak pernah prasyarat; `rules.md` memori "Optional steps stay off the gate chain"):**
- Dokumen 2 dan 3 di komputer pribadi (gate 2 `modelRead`, gate 3 `dossierRead`): kunci opsional `model` dan `dossier`. Duel 2 baru selesai bila ketiganya terbaca atau waktu habis.
- Menyentuh Null-Crown (honeypot): surel peringatan, penalti `min(saldo, 500)`, kunci opsional `decoy`.
- Membuka `.enc` dengan `open` di host sebelum `ledgerTaken`: jendela Duel 1 dipangkas separuh, surel peringatan satu kali.
- `nuclei` pada C2, kunjungan LedgerVault.

## F. Dunia per langkah (`UnlockSpec`)

| Langkah | Terbuka |
|---|---|
| 1 | situs portal klaim (`openMissionSites("m07")`; cermin `SharedVariables` untuk gerbang halaman) |
| 4 | fixture `nmap`/`whois`/`geoip` C2 |
| 5 | halaman `/legacy-cms/` |
| 10 | `removeFirewallRule` port RDP khusus, `openPorts` port RDP khusus C2, fixture `nmap` port itu OPEN |
| 11 | berkas C2 terjangkau (ada sejak dunia dibangun) |
| 15 | cadangan klaim dapat dicari di portal (sebelumnya "No claim found") |
| 18 | plaintext 1 terbaca |
| 19 | token RDC dapat dibuat (semua lima bagian tersedia) |
| 21 | dokumen bergerbang RDC |
| Duel 2 menang (ketiga dokumen terbaca) | ruang buku BLACKLEDGER (`isM07LedgerRoomOpen`), surel "What now?" |

## G. Topologi (bentuk M2 yang sudah live)

```text
Router 203.0.113.160 (titik akhir M3)
└─ Splitter 45.76.180.9
   ├─ Firewall "ash-gate" 194.60.38.12 (isIpHidden)  satu pengguna valid fw.admin
   │     aturan blok 22 dan 46721 dengan destination = lanIp C2
   ├─ Device C2 "index-01" 203.0.113.161  443 https "LegacyCMS 2.1" aktif, 46721 rdp (internal 3389) "FreeRDP 5.2.1" diblok sampai langkah 10
   │     pengguna online svc-cms, root; berkas lihat bagian I
   ├─ Device "Null-Crown" 185.220.101.42  honeypot, ssh admin/admin, OpenSSH 9.6
   └─ Device "Ash-Vector" 146.70.44.18    kotak terlupakan, ssh admin/admin, OpenSSH 5.3, ash-gate_backup.txt
```

Alamat dan LAN (`192.168.1.1` sampai `.6`) tetap seperti draf lama (CANON di kode). `PFSense.Login` hanya membawa `{ip}`; firewall punya satu pengguna valid (E-9). `destination` memakai `lanIp`, tidak pernah IP publik (E-8). Tidak ada aturan port 22 tanpa `destination`.
Komputer pribadi Conrad **tidak punya node jaringan**: ia target virtual RDC (token diperiksa mod), jadi topologi tidak bertambah.

## H. Situs

| Situs | Jenis | Isi | Catatan |
|---|---|---|---|
| `portal.nordhaven-mutual.com` (193.42.33.60) | baru, situs misi Tier 1, `gateMissionPages("m07")` | Satu halaman pencarian status klaim (`<input>` dan JS, bukan `<form>`, E-10) dengan panel hasil; alias `/search` untuk klik Goagle bila perlu | Tanpa subnet (E-3). Fungsi `Exports.flatlineClaimLookup(ref)` mengembalikan objek; kerja yang butuh mod dilakukan sebelum `await` pertama (E-16). Gaya terpisah dari Registry dan HostTrail |
| `/legacy-cms/` di C2 | ada, disesuaikan | Tabel status node: label netral `index-01`, `ash-gate`, `node-07`, `node-11`; dua kotak "retired" berperan sama supaya tabel tidak membocorkan honeypot | Tanpa HoneyCheck. Pembeda adil: banner `nmap -sV` (OpenSSH 9.6 tidak cocok dengan "retired 2019", OpenSSH 5.3 cocok dengan "retired 2022"), keterampilan membaca penanda waktu dari M4 |
| RDC `rdcdesk.io` | global permanen | Profil M7 (bagian J.3) | Pekerjaan "tahap 2" (J.4) |
| Cipher Desk `cipherdesk.io` | global permanen | Dua artefak baru, token via Encrypt | Situs tidak berubah |
| LedgerVault | permanen | Tidak berubah | Ingatan pemain |
| `fc3dhvrvxdw4qdnzcruwf233nyk6rtea.blackledger` (ruang buku BLACKLEDGER) | baru, situs misi M7, `gateMissionPages("m07")` dan cermin `ledgerRoomOpen`, tanpa `seo` | enam halaman (H.2) | Menggantikan `blkledger.dark` milik M2 |

### H.1 Data klaim (konstanta, bukan angka uang; `rules.md` §14)

| Referensi | Tertanggung | Status | Tanggal | Rekening |
|---|---|---|---|---|
| CASE-A7X-0417 | PacificCare Health | Paid, cyber endorsement; klasifikasi "Retained risk, employee negligence", disetujui 2026-08-17 | 2026-08-14 (`settledAt`) | Paid to a settlement account held through SKN Capital Nominees Ltd (nomor tidak ditampilkan) |
| FIN-NA-0091 | withheld | Paid | 2026-07-22 | idem |
| LOG-EU-2209 | withheld | Paid | 2026-05-02 | idem |
| FIN-EU-2214 | withheld | Reserved, pre-notified; insured not notified | cadangan 2026-06-18 | Held in settlement account PC-114772 (SKN Capital Nominees Ltd) |
| MED-APAC-6689 | withheld | Reserved, pre-notified; insured not notified | cadangan 2026-07-14 | Held in settlement account PC-114772 (SKN Capital Nominees Ltd) |
| nama lain (termasuk Northstar, Rheinland) | - | "No claim found for that reference." | - | - |

Cadangan hanya dikembalikan setelah langkah 15 (sebelumnya "No claim found", tak dapat dibedakan dari referensi lain).

### H.2 Ruang buku BLACKLEDGER (D16, DIJALANKAN 2026-10-07)

Bingkai: sesi Chair yang tertinggal terbuka ("Chair session, read only, clindqvist"), cocok dengan pil "Chair copy, view only" di browser RDC. Teks halaman hanya Inggris (seperti situs BLACKLEDGER lama dan Cipher/RDC); data dari konstanta kanon (`content/m07/blackledger.ts`, `finance.ts`, `blackledger.ts`, `m06/records.ts`), jadi tidak ada angka yang diketik ulang. Kode proyek per akun: Q1-2020-NA, Q2-2023-EU, Q2-2026-EU (LOG-EU-2209), Q3-2026-NA (FIN-NA-0091), Q3-2026-SEA (CASE-A7X-0417), Q3-2026-EU (FIN-EU-2214), Q3-2026-APAC (MED-APAC-6689): empat akun Q3 menjawab "Q3 closes: 4". Dua nama terakhir adalah kode baru, bukan kanon M1-M6.

| Halaman | Isi | Menjawab |
|---|---|---|
| `/` Accounts | tujuh akun dengan status SETTLED atau RESERVED | "Q3 closes: 4", "next: prepping" |
| `/organisation` | bagan: Chair, Nordhaven, SKN 60%, nominee, Skynet 10%, TR4C3#404 25%, X7xS3NTRY9 5%, Closer-Rig (lewat panel, tanpa persen: inferensi), survei LC-07, Orchid, Brightwater, rantai kepemilikan | siapa Architect, "second signer" |
| `/notice` | tangkapan desktop TR4C3404 saat membuat prototipe locker (2019-11-18, `public/assets/m07/tr4c3404-desktop.png`), percakapan pemesanan sentry dan t404, layar kunci PacificCare (`m05/pacificcare-lockscreen.jpg`), surat tuntutan "ACCOUNT OPENED" (`m07/settlement-notice.png`) | bagaimana serangan dipesan dan seperti apa bagi korban; foto Ruang Operasi 3 sengaja tidak dipakai |
| `/payments` | pembagian 60/25/10/5 per batch dan total, jam posting 09:02-09:27, dua teguran audit, tiga release order | ke mana uangnya, "they flagged it twice" |
| `/proof` | kwitansi ClearEscrow 2026-08-03 (`m01/q3-receipt.jpg`), rekening PC-114772, klasifikasi "employee negligence", survei LC-07, release order, kepemilikan | cara masuk dan kenapa Roxanne disalahkan |
| `/support` | transkrip escrow `support` dan `brightwater` 14 Agu (04:35-09:04, 6j21m, jendela 12 jam) | jeda keputusan, siapa yang memutuskan |

Gerbang: halaman menjawab 404 sampai Duel 2 menang (`isM07LedgerRoomOpen`, cermin `SharedVariables` yang dipulihkan saat dimuat ulang dari `isDuelTwoWon`) dan setelah misi selesai (`closeMissionSites`). Kunjungan halaman depan lewat https saat ruang terbuka dan `instructionRead` sudah ada memajukan `blackledgerSeen`; kunjungan lebih awal, lewat http, atau ke subhalaman langsung tidak terhitung. Surel "What now?" (tanpa URL: "He wrote down where he keeps the rest") dikirim saat Duel 2 menang. URL ada di `model_note.txt` (baris 5) dan `file_ghostwire.txt`; surat untuk Orchid tidak memuatnya. Petunjuk "not yet" untuk langkah ini: bila Duel 2 belum menang "One file is not the whole machine. He kept more than one. Read all of it before he closes the line."; bila sudah menang "He wrote down where he keeps the rest. Look again at what you read." BACKTRACE ditahan sampai perombakan pemilik (kunci wajib baru untuk kunjungan, kunci per halaman, log ending yang menyebut BLACKLEDGER, dan kalimat pembuka "Eight months ago" / "three weeks" yang bertentangan dengan timeline 35 hari).


## I. Fixture dan data

**Berkas di C2 (`rootFiles`).**

| Berkas | Isi (beat) |
|---|---|
| `manifest.txt` | "MASTER LEDGER INDEX". `[accounts]` lima akun selesai (Northstar 2020 NA, Rheinland 2023 EU, LOG-EU-2209, FIN-NA-0091, CASE-A7X-0417 dengan nominal dan tanggal dari `finance.ts`). `[reserves]` FIN-EU-2214 dan MED-APAC-6689 dengan tanggal cadangan. `[note CASE-A7X-0417]` klasifikasi "employee negligence (R. Natnaree)", disusun bersama V. Orchid, disetujui Nordhaven 2026-08-17. `[settlement network]` `index-01` 192.168.1.4, `nma-cl-01` 192.168.1.40, `claims-02` 192.168.1.42. `[integrity]` "master_ledger_backup.enc is sealed. The key: the settlement account that holds the reserves, then the healthcare reserve reference, joined by a dash. Opening it on this host raises the watcher: take it whole. Open it at a cipher desk, away from this host." `[watch]` `d.reyes: monitor`, `[affiliates]` supply line TR4C3#404 dan operator FIN-NA. `[model]` baris model lama ("A loss you can calculate is not a disaster..."). Penutup "every account, settled." |
| `release_orders.log` | Entri Log Viewer (format ISO, `components/log-file.ts`). Tiga proses rilis: `RO-2605-02` (LOG-EU-2209), `RO-2607-22` (FIN-NA-0091), `RO-2608-14` (CASE-A7X-0417). Untuk `RO-2608-14`: 08-11 00:12 kit executed, 00:41 dan 01:03 sesi diterima dari `x7xsentry9.tech` (194.36.108.20) dengan akun `rnatnaree`; 08-12 02:17; 08-13 01:58; 08-14 02:09 sesi diterima; **02:11 authorised by sentry**; 02:14 push; 02:41 lock confirmed; 09:02 payment confirmed. Catatan: dua teguran audit rekening penyelesaian ("Architect share advanced to same day"). Hindari kata drop, closed, released, terminated, dropped, "did not receive" di baris yang bukan pemutusan (itu memicu tipe Disconnected, `components/log-file.ts`); jangan memakai tipe SHELL_OBTAIN |
| `survey_visits.txt` | Kode survei `LC-07`, "Nordhaven loss-control survey (cyber)". 2020-03-19 Northstar Port Authority: badge recovered. 2023-06-28 Rheinland Energie AG: badge recovered. 2026-07-09 PacificCare exterior survey (annotated). 2026-08-03 on-site visit, visitor pass issued, remote token 14 days. 2026-08-07 kit prepared: media, badge, key. Tanpa nama orang |
| `master_ledger_backup.enc` | Kepala "AES256-CBC" lalu satu blok heks (garis 48 digit, spasi dan baris diabaikan `compactHex`). Plaintext harus ASCII tercetak satu baris (`readableText` menolak selain 32-126). Berkas memuat satu segel (rencana B 2026-10-07: dua segel berantai dianggap terlalu banyak teka-teki berantai) |
| `/etc/hosts` | tidak dipakai (alamat LAN ada di manifest) |

**Pohon folder host C2 (DECIDED 2026-10-07, README #81).** Keempat berkas asli tidak lagi di root. `etc/settlecare/gateway.conf` (pengecoh); `logs/release_orders.log` (asli) dan `logs/settlecare-agent.log` (pengecoh, tipe event netral); `opt/settlecare/manifest.txt` (asli), `agent.conf` (pengecoh), `reports/survey_visits.txt` (asli); `var/ledger/master_ledger_backup.enc` (asli), `master_ledger_2025.enc` dan `volumes.txt` (pengecoh). Folder `etc` dan `logs` bergabung dengan folder bawaan SDK. Pemicu baca dan unduh memakai nama berkas (`isNamedFile`, `Files.Transfer`), jadi tidak bergantung lokasi; pencarian `.enc` untuk timpa, pulih, dan ending Destroy kini lewat `controller/m07/ledger-file.ts` (`/var/ledger`). `cd`, `ls <folder>`, `cat <nama>`, dan `download <nama>` di sesi Meterpreter sudah dibuktikan pemilik di game.

**Komputer pribadi (profil RDC `Steady-State`, tag `NMA-CL-01`, Windows 11, LAN 192.168.1.40).** Dokumen bergerbang: gate 1 `instruction_2026-06-24.txt` (kepada V. Orchid: jeda sinkron, longgarkan media lepas, revert 15 Jul, "do not minute"); gate 2 `model_note.txt` ("keep the supply managed, the line stays flat", cadangan sebagai harga); gate 3 `file_ghostwire.txt` (kerabat pasien OT3 yang meminta catatan 2026-08-27, dicocokkan dengan alias GHOSTWIRE lewat posting umpan 2026-09-18; nama disamarkan "[redacted by the Chair]"; pembaruan 2026-09-24). Umpan (gate 0): `minutes_2023_Q4_draft.txt`, `calendar.txt`, `notes.txt`. Semua teks Inggris saja (K15), satu hex satu plaintext.

## J. Cipher Desk dan RDC

### J.1 Prinsip bahan

Situs misi M5 dan M6 sudah tutup di M7. Semua bahan kunci dan token datang dari: (a) **BACKTRACE** (fakta dan baris `EVIDENCE`), (b) dunia M7 (berkas di C2, portal klaim), (c) situs permanen. Nomor referensi notulen (`NMA/RC/2023/Q4`) dan nomor perusahaan (PC-114772) tidak ada di BACKTRACE; kunci tidak boleh bergantung padanya kecuali nilainya tampil di dunia M7 (nomor rekening muncul di halaman cadangan portal).

### J.2 Artefak tersegel dan token

| id | Kunci | Asal kunci | Plaintext (garis besar, satu baris ASCII) |
|---|---|---|---|
| `ledgerSeal` | `PC-114772-MED-APAC-6689` | Nomor rekening penyelesaian hanya tampil di halaman cadangan portal (langkah 16); referensi MED dari manifest; bentuknya disebut manifest `[integrity]` | "Chair console: user clindqvist, password Reserve-Flat-1967, device NMA-CL-01. Address as in the settlement network index. Change: the release order of the PacificCare run. Tokens are sealed with the same release order." |
| token RDC | `RO-2608-14` (id rilis dari `release_orders.log`; juga bagian `change`) | Cipher **Encrypt** | `clindqvist:Reserve-Flat-1967:192.168.1.40:RO-2608-14:NMA-CL-01` |

Kunci enkripsi token = `RO-2608-14`, id rilis yang sama dengan bagian `change`; plaintext segel menyebut bentuknya ("Tokens are sealed with the same release order"). Bagian token berasal dari tiga sumber: `user`, `password`, `tag` dari segel; `LAN` dari manifest `[settlement network]` (langkah 12); `change` dari `release_orders.log` (langkah 13). Tiga target RDC: `Steady-State` (tag `NMA-CL-01`, 192.168.1.40, change `RO-2608-14`, punya modul layar) dan dua umpan berupa konsol tanpa modul layar seperti Bedside-17 M5: `index-01` (tag `index-01`, 192.168.1.4, change `RO-2607-22`) dan `Claims-Desk` (tag `claims-02`, 192.168.1.42, change `RO-2605-02`). Pesan penolakan memakai urutan M5.
Tangga Cipher: segel = anak tangga 5 (kunci dari dunia M7: rekening dari portal + referensi dari manifest); token = anak tangga 3 (Encrypt). Playfair tidak dipakai. Dua token dalam satu berkas (segel 1 + segel 2) dibuang: dua token boleh hanya bila dipakai di tempat berbeda.

### J.3 Profil RDC M7

`RdcProfile { id: "m07", mission: "m07", key: "RO-2608-14", user: "clindqvist", password: "Reserve-Flat-1967", advanceCode, targets (3), docs (gate 1-3 + 3 umpan) }` memakai registri `content/global/rdc.ts` (sudah generik). Tingkat puzzle layar: baseline (sama dengan M5); tingkat lebih berat OPEN dan opsional. Pelaksanaan WP2 dan WP3 (2026-10-06): profil memuat `narrative` (48 kunci) yang menggantikan teks M5 di konsol dan desktop; Steady-State bersistem Ubuntu 22.04 (bukan Windows 11); dua umpan bernama `Index-Host` (index-01) dan `Claims-Desk` (claims-02); folder desktop `chair`, `private`, `committee`.

### J.4 Pekerjaan RDC "tahap 2" (D6 disetujui, dengan cadangan asli)

Fakta terverifikasi: registri profil dan pemeriksaan token generik, tetapi `websites/global/rdcdesk/script.html` (2070 baris) masih memuat konstanta M5: `TARGETS` empat host, `buildColdFs()` dan `buildDecoyFs()`, tujuh dokumen arsip (sebagian kembar dengan `content/m05/rdc.ts`), nama `rnatnaree` dan `arc-ir-01` di banyak string; `exports.ts` memakai `getM05RdcState`.
Rencana (opsi A): halaman statis tetap (kata kunci pencarian utuh); profil dimuat lewat `Exports.flatlineRdcProfile()` (nilai balik objek terbukti live, E-16); profil M5 diekstrak apa adanya ke `content/m05/rdc.ts`.
**Cadangan dan pemulihan (syarat pemilik):**
1. Sebelum menyentuh apa pun, salin seluruh `src/websites/global/rdcdesk/` ke `src/archive/websites/global/rdcdesk.original/` (`index.original.ts`, `exports.original.ts`, `script.original.html`, `style.original.html`, `shell.original.html`), dan `src/context/m05/progress.ts` bagian RDC bila diubah. `tsconfig.json` memasukkan seluruh `src`, jadi salinan `.ts` diberi satu `../` tambahan pada impor relatif (aturan arsip proyek), tidak diimpor dari `src/index.ts`, dan `tsc` harus tetap bersih. Catat hash SHA-256 tiap berkas asli di `docs/scratch.md` dan verifikasi salinan identik sebelum perubahan pertama.
2. Penjaga regresi: harness SDK tiruan merender halaman M5 sebelum dan sesudah, membandingkan DOM dan teks; harus identik.
3. Bila ada kendala: pulihkan dengan menyalin balik dari `rdcdesk.original/` (atau `git checkout` berkas itu); M5 kembali ke keadaan FINAL LOCK. Komit dibuat per bagian supaya dapat di-revert terpisah.

### J.5 File RDC lebih keras (OK pemilik 2026-10-07)

Hanya dua mekanik baru, keduanya di dalam `rdcdesk`: **Trash + Restore** dan **Decrypt**. Browser kosong ("Archive index offline", tanpa daftar arsip); file hanya lewat Computer atau Home; akar Computer = `/etc /home /lib /logs` (tiga pengecoh kecil: `/etc/hostname`, `/lib/agent-sync.txt`, `/logs/agent-sync.log`). Tiga dokumen bergerbang disegel dengan `RO-2608-14` (kunci token RDC, dipakai ulang, tanpa rantai baru); `file_ghostwire.txt` mulai di Trash dan Restore mengembalikannya ke `/home/clindqvist/private`. Gerbang menyala saat **dekripsi berhasil**, bukan saat dibuka.
Bendera opsional dan aditif (`sealed`, `trashed` pada dokumen; naratif `browserArchive: "off"`, `fsTree: "on"`) supaya M5 tak tersentuh (penjaga DOM: 16 dari 16 langkah identik). Sisi mod: `Exports.flatlineRdcDecrypt(name, key)` (cocok persis lewat `sealText`; halaman hanya menerima heks untuk dokumen tersegel, plaintext baru dikirim setelah kunci benar). Panel Help di tepi kanan konsol (saran langsung saat mengetik, tanpa "langkah berikutnya") dan 11 pola lampu monitor ikut paket yang sama. Cadangan sebelum port: `src/archive/websites/global/rdcdesk.pre-m07-hard/` (`script.before.html`, `style.before.html`); berkas `.ts` yang disentuh dapat dipulihkan dari git.

### J.6 Surel petunjuk (OK pemilik 2026-10-07)

Dua surel dari Custodian, nada sama, bentuk sama (kalimat situasi, blok bernomor "How I would work it", satu baris peringatan), tanpa nama perintah. (1) Surel tip: subjek tidak berubah karena `tipReviewed` dideteksi dari subjek; lima butir sejak 2026-10-07 (J.7): tanya meja klaim asuransi (nama dan alamat portal), ikuti uang ke endpoint, gambar peta sebelum mengetuk, tanya apa bahannya (versi, bukan hanya pintu), cari ruang yang tak ditautkan beranda. (2) `retired on paper.`, terkirim sekali saat `dashboardFound`: cara membaca dua mesin yang "pensiun" (perangkat lunak lebih baru dari tahun pensiun = masih dirawat, umpan; lebih tua = terlupakan; sejak 2026-10-07 dengan satu baris tahun rilis, J.7) dan sumber akun bawaan SSH ("the account every box starts with, and the password it starts with", tanpa menyebut `admin`). Meterpreter tidak menutup sendiri di akhir duel (probe live 2026-10-07: `Shell.exec` dari job Scheduler tidak mencapai terminal pemain); duel kalah ditutup layar breach (probe r3: sesi tetap hidup di belakangnya, jendela kembali utuh setelah pulih), duel menang dilanjutkan dengan `back` manual.

### J.7 Audit petunjuk (DECIDED dan DIJALANKAN 2026-10-07, README #82)

Audit baca-saja atas semua petunjuk M7 dari langkah 1 sampai 22 menemukan tiga celah besar dan beberapa celah sedang. Pemilik menyetujui semuanya ("EKSEKUSI SEMUA"); `docs/m07-playtest.md` (v1) sengaja diabaikan. Yang berubah:

| Celah | Perbaikan |
|---|---|
| Tangga "not yet" tak terjangkau: balasan hanya keluar bila semua kolom laporan cocok | `isReportTemplateAttempt` (`components/report.ts`) dan `controller/m07/ending.ts`: setiap laporan templat ke kotak drop selama `firstUnmetStep` ada mendapat balasan "not yet" berisi satu petunjuk untuk langkah itu, apa pun isi kolomnya. Rantai lengkap tapi kolom salah tetap tanpa balasan; rantai lengkap dan kolom benar menyelesaikan misi. Balasan diganti, bukan ditumpuk |
| Duel 1: unduhan `.enc` sebelum manifest, orders, survey terbaca berurutan diabaikan diam-diam | `controller/m07/extract.ts`: toast `M07.TOAST.READ_FIRST` ("That transfer does not count yet. Read the manifest, the release orders and the survey ... in that order, then take the ledger again.") plus trace. Urutan baca tetap berurutan. Banner Duel 1 kini "Read what you came for, take the ledger whole, get out." |
| Duel 2: dokumen model dan dossier "opsional" di BACKTRACE tetapi dibutuhkan untuk menang; surel "what now?" berkata "whole job" tanpa menyebut jam | Surel "what now?" dulu ditutup dengan "He is still on your line. Send the report before he closes it." (laporan menghentikan jam); kalimat itu dicabut oleh D16 dan banner Duel 2 kini menyuruh membaca semua berkas. Catatan segel menyebut bahwa semua file di mesin itu disegel dengan release order yang sama dan bahwa yang dibuang hanya disisihkan (Trash) |
| Urutan teks segel tidak sama dengan token | `M07_SEAL_PLAINTEXT`: user, password, address, change, device tag, lalu "A token is those five, in that order, joined by colons" (cocok dengan `checkRdcToken`: `user:password:address:change:tag`) |
| Kotak mati: membandingkan versi dengan tahun pensiun butuh pengetahuan luar | Surel `retired on paper.` memuat satu baris tahun rilis (OpenSSH 5.3 = 2009, OpenSSH 9.6 = 2023); butir 2 kini meminta memindai kedua mesin yang dihapus |
| Cipher Desk tidak disebut di teks M7 | Manifest `[integrity]` ("open it at a cipher desk, away from this host"), petunjuk "not yet" untuk `sealOpened` dan `workstationLoggedIn`, dan log `LEDGER_2` |
| Portal tidak disebut namanya | Surel tip menyebut nama asuransi dan `portal.nordhaven-mutual.com` sebagai butir 1; petunjuk "not yet" untuk `claimsPortalSeen` ikut menyebutnya |
| Referensi cadangan sebelum `ledgerTaken` dijawab sama dengan referensi ngawur | `isHeldM07Reserve` (`content/m07/claims.ts`): referensi cadangan yang belum terbuka dijawab "That reference is on file. Its record has not been posted yet. Try again later." tanpa event `claimLookup`; referensi lain tetap "No claim found" |
| `sealRead` dan `sealOpened` memakai petunjuk yang sama | `sealRead`: "You took it whole. You have not looked at what you took."; `sealOpened`: "A cipher desk will open it. The key is in your own notes." |
| Log `EDGE_1` berkata "two deny rules are gone" | Hanya aturan port RDP yang dihapus unlock (`world.ts`); log kini "The rule that kept the remote-desktop port shut is gone, and the port is open." |

D9 (ditutup di sini, lalu dibuka lagi oleh D16, lihat H.2): pemilik akan menghapus perintah `flatline` sebelum produksi karena tidak ada repel di duel. Teks `REPEL_REFUSED` dan `repellable: false` dibiarkan sampai perintahnya dihapus. Diuji di harness SDK tiruan (balasan "not yet", toast unduhan dini, portal, paritas kunci en dan zh, token dari urutan catatan diterima `checkRdcToken`); belum dilihat di game.

## K. Duel berpewaktu

Memakai kit M4 yang sudah ada: `components/intrusion.ts` (`beginStrike`, `escapeStrike`, `registerIntrusionHandlers`), `desktop-breach.ts` (`startBreach`), `incident-banner`, `kernel-layout.ts` (log insiden), penalti `penalty()` dari `components/reward.ts`.

| | Duel 1: host indeks | Duel 2: komputer pribadi |
|---|---|---|
| Mulai | Sesi Metasploit di C2 terbentuk (langkah 11) | `agent attach` selesai, desktop Conrad tampil (langkah 20) |
| Lawan | Pemantau host indeks (`watchdog@architect-c2.dark`) | Conrad sebagai `SENTRY` (siaran `wall` dari `sentry@darknull.io`, banner varian `broadcast` seperti M4) |
| Jendela | 180 detik nyata (DECIDED 2026-10-07; file kini di pohon folder, mekanik tidak ditambah) | 300 detik nyata (DECIDED 2026-10-07; tiga dokumen terenkripsi, satu di Trash) |
| Tugas | Baca manifest, release_orders, survey; unduh `.enc` utuh | Baca tiga dokumen bergerbang |
| Menang | `.enc` terunduh utuh setelah manifest, orders, survey terbaca berurutan: banner "EXTRACTION COMPLETE". Unduhan lebih awal tidak dihitung dan memunculkan toast (J.7) | Ketiga dokumen terbaca: banner selesai. Menang membuka ruang buku BLACKLEDGER dan mengirim surel "What now?" (D16). Laporan tidak lagi menjadi jalan keluar; tidak ada `flatline` |
| Kurang | Buka `.enc` dengan `open` di host: jendela dipangkas separuh (90 detik atau sisa, mana yang lebih kecil), surel peringatan sekali | Siaran Conrad makin tajam dalam tiga tahap banner |
| Kalah | Penalti `min(saldo, 500)`, `.enc` ditimpa, breach desktop (pemain sudah memperbaikinya di M4); sesi baru ke C2 memulihkan `.enc` dan memasang jam lagi | Penalti `min(saldo, 500)`, sesi RDC diputus, breach desktop; log insiden menyebut alamat sumber penyerang, yaitu gerbang komputer Conrad. Dokumen yang sudah dibaca tetap tercatat; login baru dan attach baru memasang jam lagi sampai ketiga dokumen terbaca |
| Jalan buntu | Tidak ada | Tidak ada |

Catatan: kegagalan Duel 2 tidak menghilangkan dokumen yang sudah terbaca (`instructionRead`, `modelRead`, `dossierRead` tersimpan); ia menghasilkan penalti dan breach, lalu pemain login dan attach lagi sampai ketiganya terbaca. Sejak D16 tidak ada jalan keluar lewat laporan: rantainya Duel 2 menang, ruang buku BLACKLEDGER, laporan.
Prasyarat teknis terbukti live oleh probe WP1 (2026-10-07): job `Scheduler` `{ realMs }` meledak tepat waktu di dalam sesi Metasploit dan dibatalkan benar dari handler `Files.Transfer`; `Files.Transfer` DOWNLOAD terpancar di sesi Metasploit; `open` jalur remote memicu event baca. "Sesi RDP" sebenarnya sesi Metasploit (`RemoteConnection` `t` hanya SSH atau METASPLOIT).

## L. BACKTRACE (15 kunci: 12 wajib, 3 opsional)

| # | Kunci | Aksi pembukti | W/O | Nilai (garis besar) |
|---|---|---|---|---|
| 1 | `claims` | S3 | W | Tiga klaim dibayar pada tanggal BLACKLEDGER lewat rekening SKN |
| 2 | `nodes` | S6 | W | Inventaris node di dasbor |
| 3 | `credential` | S8 | W | `fw.admin` @ ash-gate |
| 4 | `firewall` | S10 | W | 194.60.38.12 dibuka, port RDP khusus terjangkau |
| 5 | `c2` | S11 | W | Sesi di index-01 |
| 6 | `manifest` | S12 | W | Indeks: lima akun selesai, dua cadangan |
| 7 | `orders` | S13 | W | Rilis 2026-08-14 02:11 UTC oleh `sentry`, sesi dari 194.36.108.20 |
| 8 | `survey` | S14 | W | Survei LC-07, kunjungan 2026-08-03 |
| 9 | `ledger` | S15 | W | `.enc` diambil utuh |
| 10 | `seal` | S18 | W | Segel terbuka, rekening penyelesaian |
| 11 | `instruction` | S21 | W | Perintah 2026-06-24 kepada Orchid, dibaca di komputer Conrad |
| 12 | `decoy` | Null-Crown disentuh | O | Honeypot tersentuh (di luar rantai) |
| 13 | `model` | RDC gate 2 | O | Memo "supply managed" |
| 14 | `dossier` | RDC gate 3 | O | Berkas tentang pemain |
| 15 | `ledgerRoom` | S22 | W | Situs BLACKLEDGER dibuka (`probe:ledger-room-seen`); nilainya memuat host, tiga ekstra (`accounts`, `split`, `orderChat`) dan berbagi kolom laporan `account` dengan `seal` |

Aturan terpenuhi: satu aksi satu kunci; nilai tiap kunci wajib masuk laporan (kolom bersama untuk langkah berurutan, README #53); `reserves` tidak punya kunci sendiri (nilainya di kunci `manifest`); fakta yang hanya terbawa (nomor kasus, entitas induk) berstatus extra. `decoy`, `model`, `dossier` ada di `BACKTRACE_OPTIONAL_KEYS`; yang tak dikerjakan tampil "Skipped" setelah selesai.
Tiap kunci punya log pribadi di panggilan yang sama (`traceBacktraceFinding(mission, key, logs, options)`), terdaftar di `MISSION_LOGS` (`backtrace-logs.ts`). Log momen (breach gagal, ending) tanpa toast, bertanda Moment. Bahasa: antarmuka Inggris saja; prosa terbaca dan log dua bahasa (README #54).
Pekerjaan: `BACKTRACE_KEYS.m7` dan `buildM7Facts` di `backtrace-facts.ts`; `MISSION_LOGS.m7`; bagian M7 di `backtrace.html` (`KEY_LABELS.m7`, temuan, `EVIDENCE` `EV-M7-*`, entitas dan tautan papan, chip); `i18n/global/backtrace.ts`. Desain terkunci tidak diubah; uji tampilan 15 kunci (kartu M7 dirancang untuk 6) di harness.

Papan kasus (2026-10-07, README #84): 22 simpul, 16 dokumen, 49 kabel; simpul baru Static-Hop, Quiet-Mirror, rumah sakit, pengunjung LC-07, akun PC-114772, d.reyes dan BLACKLEDGER; dokumen `EV-M7-05` (Locker order) dan `EV-M7-06` (Ledger room) di atas hubungan masing-masing. Kabel lurus seperti desain asli; enam kabel siku memakai tabel `ROUTES` (BLACKLEDGER ke buyer dan broker, host indeks ke Conrad dan registrant, insurer ke akun); satu persilangan siku tegak lurus (host indeks dan kabel control ke registrant). Zoom awal 60% (`OPEN_ZOOM`), minimum 30%, tombol ↺ kembali ke 60%. Dekorasi mengikuti kasusnya: 12 catatan, 3 stempel, label tanggal per misi dari `STORY_DATES`, dua klip, barcode, benang dan kantong bukti; dua foto lama dihapus. Fakta baru di `buildM5Facts` dan `buildM7Facts`: `hospital`, `account`, `indexHost`, `visitor`, `syndicate`, `ledgerRoom`, `prototype`, `orderChat`, `split`, `accounts`, `affiliates`.

## M. Laporan "Mission 7 Findings" (templat saja, tanpa badan bebas; README #41)

Kolom (sembilan; langkah berurutan berbagi kolom): `architect`, `path`, `claims`, `reserves`, `orders`, `survey`, `account`, `instruction`, `choice`.

| Kolom | Menjawab | Pencocokan (longgar, en dan zh; kata kunci, urutan bebas) |
|---|---|---|
| `architect` | Conrad Lindqvist, operator SENTRY | "lindqvist" dan "sentry"; menolak "voss", "hartley" |
| `path` | ash-gate lalu index-01 | dua dari ash-vector, ash-gate, 203.0.113.161, index-01; menolak null-crown sebagai jalur |
| `claims` | asuransi membayar tebusan | "paid" dan ("nordhaven" atau "insurer") |
| `reserves` | dua cadangan | "fin-eu-2214" dan "med-apac-6689" |
| `orders` | rilis 02:11 oleh sentry dari IP broker | "02:11" dan "sentry" dan ("194.36.108.20" atau "x7xsentry9") |
| `survey` | survei Nordhaven | ("survey" atau "loss-control") dan ("2026-08-03" atau "3 aug") |
| `account` | rekening penyelesaian SKN | "pc-114772" atau "skn" |
| `instruction` | perintah kepada Orchid | "orchid" dan ("2026-06-24" atau "24 jun") |
| `choice` | `expose`, `handoff`, `destroy` | tepat salah satu |

Balasan "belum waktunya": satu balasan per langkah pertama yang belum selesai, diganti (bukan ditumpuk), dengan petunjuk dalam dunia tanpa membocorkan langkah berikutnya. Beat per langkah: tip belum dibaca: baca kabar Custodian; portal belum dilihat: ada tempat yang menjawab siapa pun yang memegang nomor klaim; klaim belum dicocokkan: periksa ketiganya, bukan satu; tepi belum dipetakan: alamat itu punya tetangga; dasbor belum ditemukan: tidak semua jalan ditautkan; kotak mati belum dimasuki: hanya satu yang benar-benar lupa; kredensial belum dibaca: isi kotak itu; firewall belum dibuka: pintunya masih terkunci; sesi belum didapat: pintu sudah terbuka, sekarang ketuk; manifest/orders/survey belum dibaca: baca semuanya sebelum pergi; berkas belum diambil: bawa utuh, jangan dibuka di sana; cadangan belum dicek: nomor-nomor itu menanyakan sesuatu; segel belum dibuka: kuncinya ada di catatanmu sendiri; token belum dibuat: kamu punya lima potongan, bangun satu; komputer belum dimasuki: layarnya belum menampilkan mesinnya; dokumen belum dibaca: kamu sudah masuk dan belum membaca perintahnya.

## N. Ending (dijalankan controller setelah laporan diterima, sebelum `completeObjective`; log BACKTRACE dan surat ditulis lebih dulu, README #41)

| Benang | A `expose` | B `handoff` | C `destroy` |
|---|---|---|---|
| Efek mekanis | bukti dilepas | bukti diserahkan | `unregister` C2 setelah `.enc` dihapus (satu panggilan, README #41) |
| Dua korban berikutnya | diperingatkan publik, menutup akses | diberi tahu diam-diam lewat jalur resmi | tetap terkompromi tanpa diberi tahu; cadangan tak pernah jadi klaim |
| Roxanne | surat A | surat B | tanpa surat; tetap kambing hitam |
| Reyes | namanya ikut keluar | saksi | aman, tak lagi dipantau |
| TR4C3404 dan operator FIN-NA | teridentifikasi | bekerja sama | tak tersentuh |
| Orchid | terbongkar | diselidiki | utuh |
| Conrad | nasibnya di tangan publik | diadili, hasil tak pasti | tak diadili, infrastruktur hancur |
| OT3 dan cover-up | insiden klinis masuk catatan publik | diselidiki | tetap "excluded" |
| Custodian | satu baris singkat | satu baris singkat | "Someone closed it." |

Semua baris adalah log pribadi BACKTRACE (Tier 1) dan surat searah (Tier 1); tidak ada mekanik baru. Surat Roxanne A dan B ditulis ulang agar menyebut yang berubah (A: baris OT3 ada di catatan sekarang). Prosa final saat implementasi, en dan zh; surat Roxanne en dan zh seperti bentuk lama.

## O. Teks dan lapisan visual

- Kunci i18n en dan zh: `i18n/m07/core.ts`, `site.ts` (portal), `site-keys.ts`. Teks Cipher dan RDC hanya Inggris.
- Lapisan visual (aturan "bukan hanya terminal"): portal klaim, dasbor `/legacy-cms/`, banner duel, desktop RDC, papan BACKTRACE.
- Arah visual: gelap/merah CRT yang berkomitmen; satu layar (portal klaim) ditampilkan dulu sebelum build penuh (memori pemilik). Skill `frontend-design` untuk situs baru, bukan superdesign.
- Teks pemain menegaskan fiksi; tanpa data nyata.

## P. Penempatan arsitektur dan perubahan global

| Area | Berkas | Tindakan |
|---|---|---|
| Arsip (jangan hapus) | `src/archive/{content,main,applications,websites}/m07.original.*` dan `honeycheck.original.*` | salinan draf lama sebelum rewrite |
| `content/m07` | `state, gates, network, topology, fixtures, scan, server-files, mail, report, quest, quest-logs, legacy-cms, intro` | tulis ulang; `claims.ts`, `sealed.ts`, `rdc.ts` baru; `honeycheck.ts` diarsipkan |
| `controller/m07` | `index, spec, world, report, recon, deadbox, firewall, shell, extract, tracking, ending, types` | tulis ulang; `claims.ts`, `cipher.ts`, `rdc.ts`, `duel.ts` baru (pola `controller/m05/{cipher,rdc}.ts`, `controller/m06/cipher.ts`) |
| `context/m07/progress.ts` | cermin `SharedVariables` | tambah tahap portal dan dasbor |
| `i18n/m07` | `core, site, site-keys` | en dan zh |
| websites | `websites/m07/portal/` baru; `websites/m07/architect-c2/` disesuaikan; `websites/global/honeycheck/` diarsipkan; `websites/global/rdcdesk/*` **menyentuh permukaan M5 terkunci** (J.4) | |
| global content | `content/global/{sealed,rdc}.ts` | artefak dan profil M7 |
| BACKTRACE | `applications/backtrace-facts.ts`, `backtrace-logs.ts`, `backtrace.html` (bagian M7), `i18n/global/backtrace.ts` | hanya M7 |
| lain | `commands/attrcheck.ts` (hapus registrasinya bila tak terpakai; berkas diarsipkan), `guard/flags.ts` (`DEV_FOCUS_QUEST.m07`), `manifest.json`, `content/global/mail-senders.ts` | perubahan kecil |
| Dokumen | `docs/world-building/*`, `changelog.md`, `bugs.md`, `network.md`, `m07-playtest.md` | WP0 (spesifikasi) dan WP9 (playtest) |

Permukaan terkunci yang disentuh: `rdcdesk` (M5, izin D6) dan bagian M7 di `backtrace.html`. M1-M4 tidak disentuh (anggaran hook nol edit).

## Q. Verifikasi mekanik (tier dan butir bug)

| Butir | Status |
|---|---|
| Surel, `Mail.Sent`, gerbang transitif, `onFileRead` tunggal, entri Log Viewer | Live (M1-M5) |
| `net_tree.py`, `nmap -sV`, `dirhunter`, SSH ke Device, pfSense login dan simpan | Live (M1-M3, M6) |
| Bluekeep dan `RemoteConnection.Established` METASPLOIT | Live (M2, M3) |
| Cipher Desk (dekripsi, enkripsi), RDC (token, puzzle, attach, dokumen) | Live (M5) |
| Segel berantai antar dokumen (M6 v2) | Belum dilihat di game utuh (M6 v2 hanya typecheck dan Chrome headless, README #72) |
| Kit duel: banner, breach, konsol pemulihan | Live (M4) di pipeline; **belum** di dalam sesi Metasploit/RDC |
| Situs tanpa subnet dengan `Exports` objek | Live (M5, M6 v1, E-16 di lab) |
| Job `{ realMs }` di dalam sesi | Live (probe P1, 2026-10-07) |
| `Files.Transfer` DOWNLOAD di sesi Metasploit | Live (probe P2, 2026-10-07) |
| `open` jalur remote di sesi Meterpreter | Live (probe P3, 2026-10-07) |
| Menyalin heks dari terminal ke halaman Cipher Desk | Live (probe P4, 2026-10-07; baris heks 48 digit, terminal tanpa pembungkus baris) |
| Objek profil RDC besar lewat `Exports` | Live (probe P5-P6, 2026-10-07) |

### Probe lab (WP1; `src/debug/`, bebas EKSEKUSI)

| Probe | Pertanyaan | Lulus bila |
|---|---|---|
| P1 | Job `Scheduler` `{ realMs }` 60 detik tetap meledak di dalam sesi Metasploit dan RDC, dan dibatalkan benar | event kedaluwarsa muncul tepat waktu; pembatalan berhasil |
| P2 | `Files.Transfer` DOWNLOAD terpancar saat `download` di sesi Metasploit | event terbaca controller |
| P3 | `open` jalur remote di sesi Meterpreter membaca berkas target | isi tercetak dan event `open` terpancar |
| P4 | Teks heks dari keluaran terminal bisa dipilih dan disalin ke Cipher Desk | tempel berhasil didekripsi |
| P5 | `Exports` mengembalikan objek profil RDC (target, dokumen) sebesar profil M7 | objek utuh di halaman |
| P6 | Heks 380 digit (dua segel) lewat `Exports` Cipher | artefak terbuka |

## R. Risiko

| Risiko | Penanganan |
|---|---|
| RDC tahap 2 merusak M5 FINAL LOCK | Cadangan asli, penjaga regresi DOM, komit per bagian (J.4) |
| `{ realMs }` di sesi (P1) | Cadangan: jendela dihitung dari event dan penanda waktu tanpa job |
| `Files.Transfer` di sesi Metasploit (P2) | Cadangan: `download` lalu `open` salinan lokal sebagai pemicu |
| Menyalin heks dari terminal (P4) | Cadangan: tampilkan segel juga di halaman portal klaim yang dapat disalin |
| Tata letak BACKTRACE untuk 15 kunci | Uji di harness; kurangi opsional bila perlu |
| Bahan kunci hilang karena situs M5/M6 tutup | Aturan J.1 |
| Waktu bermain panjang | Perkiraan 120-180 menit; titik uji live setelah lapisan Inti (D12) |
| Teks zh tanpa tinjauan pemilik | Tandai draf; pemilik menulis surat penutup BACKTRACE sendiri |

## S. Rencana kerja

| WP | Isi | EKSEKUSI? | Gerbang pemilik |
|---|---|---|---|
| WP0 | Spesifikasi v2, README #73-#76, 02/03/05/06/13, changelog (berkas ini) | ya (dijalankan 2026-10-06) | Pemilik meninjau spesifikasi sebelum kode |
| WP1 | Probe P1-P6 di `src/debug/` | tidak | Hasil memutuskan jendela duel dan cadangan |
| WP2 | Arsip draf M7 lama dan RDC lama; RDC tahap 2; registri sealed/RDC M7 | ya | Keluaran M5 identik; cadangan ada. **DIJALANKAN 2026-10-06** (hash di `docs/scratch.md`, penjaga DOM identik) |
| WP3 | `content/m07` dan `i18n/m07` (en, zh) | ya | **DIJALANKAN 2026-10-06**; zh draf; teks situs portal menyusul di WP5; kerangka controller sudah ada |
| WP4 | `controller/m07`: gerbang, unlock, Duel 1, Cipher, RDC, laporan, ending; lalu Duel 2 | ya | **DIJALANKAN 2026-10-07** (typecheck bersih, harness SDK tiruan lolos, belum di game); pemilik melihat Duel 2 sebelum D9 diputuskan |
| WP5 | Situs: satu layar portal klaim dulu, lalu build penuh; `/legacy-cms/` | ya | **DIJALANKAN 2026-10-07** atas perintah langsung pemilik (satu halaman, tanpa tahap satu-layar terpisah); `/legacy-cms/` sudah sesuai dari WP3 |
| WP6 | BACKTRACE M7 | ya | Uji tampilan 14 kunci. **DIJALANKAN 2026-10-07** (README #79; harness SDK tiruan dan Chrome headless lolos, belum di game) |
| WP7 | Perubahan global kecil | ya | - |
| WP8 | Harness SDK tiruan dan `tsc --noEmit` (tanpa esbuild kecuali diminta) | ya | - |
| WP9 | Live test pemilik (en lalu zh), temuan ke `docs/bugs.md`; tulis ulang `m07-playtest.md` | ya per temuan | Lulus live test |
| WP10 | Review kode di akhir sesi, hapus `trace()` M7, FINAL LOCK, sinkron `story.md`, hadiah final (D11) | ya | Pemilik menyatakan FINAL LOCK |

Urutan: WP0 → WP1 → (WP2, WP3) → WP4 → WP5 → WP6 → WP7 → WP8 → WP9 → WP10. Cakupan berlapis (D12): **Inti** = Babak tepi, host indeks, Cipher, RDC, dua duel, laporan, tiga ending, 11 kunci wajib; **Tambahan** = portal klaim (langkah 1-3 dan 16), entri Log Viewer, kunci opsional `decoy`; **Opsional** = berkas tentang pemain, puzzle RDC lebih berat. Konten ketiga lapis sudah disetujui; D12 hanya mengatur urutan dan titik uji.

## T. Rencana uji

1. Probe WP1 sebelum kode misi.
2. Harness SDK tiruan (esbuild dengan SDK dialiaskan ke Proxy stub, uji DOM Chrome headless) untuk state, gerbang, laporan, halaman portal, dan guard regresi RDC M5.
3. `npx tsc -p tsconfig.json --noEmit` bersih; `grep -rn "^\s*//" src/` kosong.
4. Live test pemilik, naskah baru `docs/m07-playtest.md` (sekali pakai): jalur penuh, kegagalan Duel 1 dan 2, tiga ending, `mods.reset` di tengah duel, lintasan zh.
5. Review kode dikumpulkan di akhir sesi (bukan setiap perubahan).

## U. Definisi selesai

Sama dengan `07-arsitektur-misi-baru.md` E. Tambahan M7: keluaran M5 identik (guard RDC), Playfair tidak muncul, setiap benang T1-T10 punya satu baris pembuktian di BACKTRACE atau di surat ending, tidak ada alat atau perintah yang belum pernah dialami pemain di M1-M6.

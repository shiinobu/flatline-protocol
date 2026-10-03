# 11 — M7 "The Architect": spesifikasi dan konten final

Status: DECIDED 2026-10-02 untuk bentuk, rantai, nama, dan angka awal. Prosa en dan zh ditulis
saat implementasi. Dialog bergaya panggilan telepon diganti surel Custodian dan kolom `choice`
(diterima lewat EKSEKUSI). Mengikuti templat `07-arsitektur-misi-baru.md` bagian D. M7 adalah
migrasi M4 lama dan harus dikerjakan **lebih dulu** dari M4 baru (id `m04` harus kosong).

## A. Identitas

`name: "flatline.m07"`, grup `storyline`, `autoStart: true`, `questGate("m07", ["flatline.m06"])`,
bukan `Abandonable`, satu objective. **Hadiah: 5000 uang** (XP dilewati, keputusan #34), dibayar lewat
`Bank.transaction` di `OnComplete` (bukan `Quest.Rewards`, tidak membayar di prototipe; `Rewards` quest
tidak diisi dan pembayaran dilewati saat dev/tester focus). Nilai lama `M04_REWARDS` adalah 800 uang dan
200 xp.

## B. Cacat M4 lama dan perbaikannya

| # | Cacat (terverifikasi di kode) | Perbaikan di M7 |
|---|---|---|
| 1 | `initialShellAccess` menunggu `Metasploit.Meterpreter.Connected` (`docs/bugs.md` #29), yang tidak terpancar oleh `exploit` biasa | `RemoteConnection.Established` dengan `t === "METASPLOIT"` |
| 2 | Banner `LegacyCMS 2.1` tidak diterima modul mana pun, dan C2 hanya punya `root` tanpa password | Modul RDP bluekeep (live di M2 dan M3) dengan banner `FreeRDP 5.2.1` dan satu pengguna online `svc-cms` |
| 3 | Firewall di tingkat Router dan perangkat di dalam Splitter (bentuk belum teruji, `docs/network.md`) | Bentuk M2 yang sudah live: Splitter berisi Firewall dan perangkat bersaudara |
| 4 | `attrcheck` memakai `Files.getByPath` (session-aware hanya lewat SSH), jadi tidak melihat berkas di sesi Meterpreter (#30) | Pakai pencarian Meterpreter-aware (`commands/meterpreter-files.ts`). Bergantung pada live test `open` yang masih tertunda |
| 5 | `cat` hanya membaca `.txt` dan `.log` (`docs/mechanics.md`), jadi jebakan lewat `Terminal.Cat` pada `.enc` tidak pernah terpicu | Pemicu jebakan diganti `open` (`OPEN_FILE_READ_EVENT`) |
| 6 | `rootgrab` sebagai langkah rantai | Dibuang (pelajaran M3) |
| 7 | `identityFileListed` bergantung pada SSH ke host tanpa password | Diganti membaca `manifest.txt` |
| 8 | `Dialog` panggilan telepon, `switchBranch` tidak terhubung ke apa pun, dan SDK tidak punya event untuk cabang yang dipilih | Dibuang. Surel Custodian "What now?" dan kolom `choice` di laporan. Telepon dari Custodian juga melanggar aturan yang sudah terkunci ("the only channel", "no side conversations", `i18n/m01/core.ts:90-94`) |
| 9 | Dua langkah awal (menelusuri IP VPN) mengulang M3 dan M4 | Dibuang |
| 10 | Pilihan A/B/C hanya mengubah teks laporan | Efek nyata (bagian H) |
| 11 | Aturan Firewall memakai IP publik C2 sebagai `destination` (`content/m04.ts`). Engine membandingkan `destination` dengan `lanIp` target, jadi aturan itu tidak pernah cocok, dan Save di panel pfSense menolaknya ("outside this network") selama aturan itu ada. LAN `172.16.0.x` juga bukan alamat lokal menurut engine (`IsLocalIp` hanya menerima `192.168.1.x`) | `destination` = `lanIp` C2 (`192.168.1.x`); LAN seluruh node diganti ke `192.168.1.x`; tidak ada aturan port 22 tanpa `destination` (memblokir SSH ke Null-Crown dan Ash-Vector). Lihat `docs/app-asar-reference.md` E-7 dan E-8, `docs/bugs.md` #41 |

## C. Rantai gerbang (12 langkah, transitif)

Keputusan dan laporan adalah satu surel (kolom `choice`), jadi tidak ada langkah keputusan terpisah.

| # | Langkah | Requires | Pemicu | Tier | Efek |
|---|---|---|---|---|---|
| 1 | `tipReviewed` | - | `Mail.Read` tip terakhir Custodian ("Kamu sudah punya nama. Sekarang buktinya.") | 1 | - |
| 2 | `edgeScanned` | 1 | `Terminal.NmapScan -sV` pada C2: 443 terbuka (LegacyCMS), 3389 FILTERED | 1 | buka halaman `/legacy-cms/` |
| 3 | `dashboardFound` | 2 | `Browser.Meta` `/legacy-cms/` (halaman tersembunyi, tabel status node) | 1 | kunci `nodes` |
| 4 | `deadBoxEntered` | 3 | `RemoteConnection.Established` SSH ke **Ash-Vector** (kotak mati sungguhan) | 1 | - |
| 5 | `credentialRead` | 4 | `Terminal.Cat` `ash-gate_backup.txt` | 1 | kunci `credential` |
| 6 | `firewallLoggedIn` | 5 | `PFSense.Login` pada Firewall (pola `controller/m01/breach.ts:27`) | 1 | - |
| 7 | `firewallBreached` | 6 | `PFSense.Changes` | 1 | kunci `firewall`; `removeFirewallRules` dan `openPorts` 3389 C2 |
| 8 | `shellObtained` | 7 | `RemoteConnection.Established` METASPLOIT pada C2 | 1 | kunci `c2`; pelacakan dimulai |
| 9 | `manifestRead` | 8 | `Terminal.Cat` `manifest.txt` | 1 | kunci `manifest` |
| 10 | `trapRevealed` | 9 | `attrcheck` pada `master_ledger_backup.enc` (event mod) | 1 | - |
| 11 | `fileExtracted` | 10 | `Files.Transfer` DOWNLOAD `master_ledger_backup` | 1 | kunci `ledger`; pelacakan berakhir; surel "What now?" dikirim |
| 12 | `reportSent` | 11 | `Mail.Sent` ke Custodian dengan `matchesFields` | 1 | `completeObjective`; efek ending |

**Di luar rantai** (langkah opsional tidak masuk gerbang): menyentuh Null-Crown (honeypot), `nuclei`
pada C2, membuka `.enc` dengan `open` sebelum `attrcheck`.

## D. Dunia per langkah (`UnlockSpec`)
- Langkah 2: halaman `/legacy-cms/` dan tabel node terbuka (cermin `SharedVariables`, #36).
- Langkah 7: aturan Firewall untuk 3389 C2 dicabut dan port dibuka (`Network.openPort`).
- Langkah 11: surel "What now?" dikirim.
- Berkas di C2 ada sejak dunia dibangun, tetapi tak terjangkau sebelum sesi terbuka.

## E. Topologi (bentuk M2 yang sudah live)

```text
Router 203.0.113.160 (titik akhir M3)
└─ Splitter 45.76.180.9
   ├─ Firewall "ash-gate" 194.60.38.12 (isIpHidden)  satu pengguna valid fw.admin/<P>
   │     aturan blok 22 dan 3389 dengan destination = lanIp C2 (192.168.1.x)
   ├─ Device C2 203.0.113.161  443 https "LegacyCMS 2.1" (aktif), 3389 rdp "FreeRDP 5.2.1" (blok)
   │     pengguna: svc-cms (online), root. rootFiles: master_ledger_backup.enc, manifest.txt
   ├─ Device "Null-Crown" 185.220.101.42  honeypot, ssh 22 admin/admin, banner OpenSSH 9.6
   └─ Device "Ash-Vector" 146.70.44.18    kotak mati, ssh 22 admin/admin, banner OpenSSH 5.3
         berkas: ash-gate_backup.txt (kredensial fw.admin)
```

- Alamat publik dan nama diambil dari M4 lama (`content/m04.ts`); sisi LAN diganti ke `192.168.1.x`
  (`.1` untuk Router, berurutan sesudahnya) karena `IsLocalIp` hanya menerima awalan itu
  (`docs/app-asar-reference.md` E-7). Alamat M4 baru bertetangga dengan `203.0.113.160`
  (Night-Shift, `10-spec-m4.md`).
- Aturan Firewall: `destination`, bila diisi, sama dengan `lanIp` target dan bukan IP publik
  (`docs/app-asar-reference.md` E-8). Tidak ada aturan port 22 tanpa `destination`: Ash-Vector dan
  Null-Crown harus tetap terjangkau lewat SSH sebelum Firewall dibuka. `removeFirewallRule(ip, port)`
  menghapus semua aturan pada port itu.
- `PFSense.Login` hanya membawa `{ip}` dan hanya terpancar saat sukses (engine `index.js` ~9313749,
  `docs/app-asar-reference.md` E-9), jadi Firewall punya **satu** pengguna valid.
- RDP: modul `exploit/rdp/cve_2019_0708_bluekeep`, `RHOST` = alamat publik C2 (#27), `Version 5.2.1`
  dari banner `nmap -sV`, butuh pengguna online (`svc-cms`). Port C2: `external` dan `internal` 3389,
  `version` `FreeRDP 5.2.1`, aktif sesudah langkah 7; syarat lengkap modul di
  `docs/app-asar-reference.md` E-11.
- Firewall ditemukan lewat tabel node di `/legacy-cms/` atau `python3 net_tree.py`.

## F. HoneyCheck (`honeycheck.net`)

Situs global `websites/global/honeycheck/` (JS di dalam halaman dengan dataset tertanam, pola
ClearEscrow), dibungkus `gateMissionPages("m07")`. M4 dapat memakainya nanti (OPEN).

| Host | Penilaian | Kenyataan |
|---|---|---|
| C2 `203.0.113.161` | bukan honeypot (91%) | asli |
| Null-Crown `185.220.101.42` | **bersih (88%)** | **honeypot yang disetel supaya lolos** |
| Ash-Vector `146.70.44.18` | **honeypot kemungkinan besar (71%)** | **kotak mati sungguhan** |

Catatan bawah halaman: "This is not a foolproof method. Just because a host reads clean today does
not mean it will tomorrow." (disadur dari honeypot.is).

**Pembeda yang adil (alat hanya petunjuk).** Tabel node di `/legacy-cms/` menulis keduanya
"decommissioned" (Null-Crown 2019, Ash-Vector 2022). `nmap -sV` memperlihatkan Null-Crown memakai
OpenSSH modern, tidak konsisten dengan "decommissioned 2019", sedangkan Ash-Vector memakai OpenSSH 5.3
yang konsisten. **Salah pilih tidak membuntukan:** menyentuh Null-Crown memicu surel peringatan
(`M04_HONEYPOT_ALERT_*` dari `watchdog@architect-c2.dark`) dan serangan tambahan (penalti
`min(saldo, 500)`), lalu pemain tinggal memakai Ash-Vector.

## G. Pelacakan waktu nyata (komponen kit M4 dipakai ulang)

- Mulai di langkah 8 dan dipasang lagi di setiap sesi baru ke C2 selama `fileExtracted` belum
  tercapai. Banner hitung mundur **240 detik**.
- Membuka `.enc` dengan `open` sebelum `attrcheck`/ekstraksi: tenggat dipangkas setengah, surel
  peringatan jebakan (`M04_TRAP_WARNING_*`). Berkas tidak terhapus.
- **Gagal (tenggat habis):** penalti `min(saldo, 500)`, desktop dibobol lagi (kit `desktop-breach`),
  `.enc` terhapus sendiri. `sysdiag` menolak berjalan di sesi remote ("Disconnect first"), jadi pemain
  harus keluar dari sesi untuk memulihkan. `.enc` dibuat ulang (`Files.create` di dalam handler,
  `docs/bugs.md` #19) saat sesi baru ke C2 dimulai, dan pelacakan dipasang lagi. Firewall tetap terbuka.
  Tidak ada jalan buntu.

## H. Efek ending (dijalankan controller setelah `reportSent`)

| `choice` | Efek mekanis | Epilog |
|---|---|---|
| `expose` | bukti dilepas | surat Greta A dari `greta.desouza@postbox.my`, log pribadi BACKTRACE A |
| `handoff` | bukti diserahkan | surat Greta B, log pribadi B |
| `destroy` | jaringan C2 dihancurkan (`unregister`, berurutan #35), `.enc` hilang | **tanpa surat**, log pribadi C |

Beat surat (dari `09-konten-m5-m6.md` B10): A, namanya bersih tetapi tidak ada yang kembali seperti
semula. B, seorang pengacara menelepon dan prosesnya akan lama. C, kotak masuk tetap sunyi.
Log pribadi per ending memuat nasib Reyes, Vivien Orchid, dan Conrad Lindqvist sesuai
`05-ending.md` bagian B. `greta.desouza@postbox.my` adalah alamat pribadi Greta, yang sama dengan
rekaman umpan #2 di LeakIndex (M5).

## I. Konten (beat)

**Surel.** Tip terakhir Custodian: nama sudah ada, sekarang bukti, semua milik mereka ada di satu
berkas, dan mereka tahu begitu kau menyentuhnya. "What now?" (sesudah ekstraksi): pertanyaan yang sama
dengan dialog lama, tiga pilihan, jawab lewat laporan. Peringatan honeypot dan jebakan memakai teks yang
sudah ada di `content/m04.ts`.

**`/legacy-cms/`.** LegacyCMS 2.1, build 2011.04, "unpatched since deployment", dengan tabel status
node (alamat publik, status, tanggal decommission) untuk C2, ash-gate, Null-Crown, dan Ash-Vector.

**`ash-gate_backup.txt` (Ash-Vector).** Cadangan konfigurasi lama dengan kredensial `fw.admin`
dalam teks biasa, tanggal 2022.

**`manifest.txt` (C2, bisa dibaca).** "MASTER LEDGER INDEX": rekening korban (Northstar Port Authority
2020 NA, Rheinland Energie AG 2023 EU, LOG-EU-2209 $1.400.000 2026-05-02, FIN-NA-0091 $4.100.000
2026-07-22, PacificCare Health CASE-A7X-0417 $2.850.000 2026-08-14), tiap baris "settled". Catatan
PacificCare: klasifikasi "employee negligence (G. de Souza)", disusun bersama V. Orchid, persetujuan
Nordhaven 2026-08-17. Catatan pantauan: "d.reyes: monitor". Pernyataan model Conrad: kerugian yang bisa
dihitung bukan bencana, melainkan satu baris pembukuan, dan semua rekening dilunasi. Penutup:
"every account, settled."

**`master_ledger_backup.enc`.** Isi tetap `AES256-CBC::[REDACTED-BINARY-BLOB]` (konstanta lama), nama
diganti dari `master_identity_backup` karena identitas sudah dibuktikan di M6.

**Conrad Lindqvist (DECIDED).** 59 tahun (lahir 1967). Aktuaris yang memberi harga pada risiko yang
ia ciptakan sendiri: tebusan sebagai kerugian yang bisa diprediksi bila pasokannya dikelola. Ini
menutup X-b.

**Laporan.** Kolom `architect` (Conrad Lindqvist), `evidence` (ringkasan: kelalaian karyawan
disusun, G. de Souza dijadikan kambing hitam), `choice` (`expose`/`handoff`/`destroy`). Validator
menolak nama lain dan pilihan di luar tiga itu.

**Petunjuk "belum waktunya" (beat).** Tip belum dibaca: baca kabar Custodian. C2 belum dipindai: lihat
apa yang terbuka. Halaman tersembunyi belum ditemukan: tidak semua jalan ditautkan. Kotak mati belum
dimasuki: ada yang terlupakan. Kredensial belum dibaca: isi kotak itu. Firewall belum dibuka: pintu
masih terkunci. Berkas belum diekstrak: jangan membukanya begitu saja.

**BACKTRACE.**

| Kunci | Nilai |
|---|---|
| `nodes` | Tabel status node di `/legacy-cms/`: C2, ash-gate, dua kotak "mati" |
| `credential` | Kredensial `fw.admin` dari cadangan lama di Ash-Vector |
| `firewall` | ash-gate dibuka, 3389 C2 terbuka |
| `c2` | Sesi di C2 (`svc-cms`) |
| `manifest` | Master Ledger Index: lima rekening korban |
| `ledger` | `master_ledger_backup.enc` diekstrak tanpa memicu jebakan |

## J. Penempatan arsitektur dan perubahan global
- Berkas: `main/m07.ts`, `controller/m07/` (`index`, `spec`, `report`, `world`, `recon`, `deadbox`,
  `firewall`, `shell`, `extract`, `ending`), `content/m07/*`, `i18n/m07/`, `websites/m07/architect-c2/`
  (dipindah), `websites/global/honeycheck/`.
- `commands/attrcheck.ts`: konstanta dan nama berkas diperbarui, pakai pencarian Meterpreter-aware, event
  menjadi `flatline.m07.attrcheckRevealed`.
- **`M04_ARCHITECT_VPN_IP` di `content/global/characters.ts` tidak di-rename** (dipakai M2 dan M3 yang
  terkunci). `content/global/mail-senders.ts` hanya diubah jalur impornya. `M04_ARCHITECT_REAL_NAME`
  menjadi `M07_ARCHITECT_REAL_NAME` = "Conrad Lindqvist".
- Global: `QuestId` (`guard/flags.ts`), `BacktraceMissionId` dan `BACKTRACE_KEYS` (m7), `manifest.json`.
- Nasib `*.original.ts` M4 lama: ARCHIVED 2026-10-03 (dipindah ke `src/archive/`, X-e ditutup).

## K. Verifikasi mekanik dan risiko
| Butir | Status |
|---|---|
| Bluekeep RDP, `PFSense.Login/Changes`, SSH ke Device, bentuk Splitter, `cat` `.txt` di sesi Meterpreter | Live (M1, M2, M3) |
| Kit pelacakan, banner, kunci desktop, pemulihan | Live di lab, belum di pipeline |
| HoneyCheck (JS dalam halaman dengan dataset tertanam) | Pola ClearEscrow, live |
| `attrcheck` Meterpreter-aware | Bergantung pada live test `open` yang tertunda |
| `Files.Transfer` DOWNLOAD pada `download` di sesi RDP | Belum diuji di jalur ini |
| `Files.create` untuk membuat ulang `.enc` | Aturan konteks mod (#19) |

**Risiko.** (1) Dua event belum teruji di sesi RDP M7: `attrcheck` Meterpreter-aware dan `Files.Transfer`.
(2) Sesi non-RDP (modul Apache) belum jelas kemampuannya, jadi dipilih RDP. (3) Tenggat pelacakan
harus adil. (4) Migrasi harus mendahului M4 baru.

## L. Rencana uji
Kerangka jalan M7 lebih dulu: topologi bentuk M2, satu sesi RDP, `cat manifest.txt`, `attrcheck`, dan
`download` untuk memastikan tiga event itu terpancar, sebelum konten lain ditulis. Prasyarat bersama:
live test `open` Meterpreter (juga syarat kunci M1-M3).

## M. Masih OPEN
Prosa en dan zh, alamat IP dan password, penyesuaian angka (tenggat 240 detik, penalti),
pemakaian HoneyCheck di M4.

## Catatan implementasi (2026-10-02, fase 1)

Fase 1 dari prompt implementasi: **kerangka jalan M7**. Migrasi selesai, konten
penuh belum. Semua di cabang kerja sesi ini, bukan `clouds-modify`.

**Yang sudah masuk kode.** `content/m04.ts` dan `main/m04.ts` diganti bentuk
pipeline M1-M3: `content/m07/*` (network, scan, topology, server-files,
fixtures, gates, state, mail, report, quest, intro), `i18n/m07/core.ts`,
`controller/m07/*` (spec, world, report, recon, deadbox, firewall, shell,
extract, probes), `main/m07.ts` tipis, dan `websites/m04/architect-c2/`
dipindah ke `websites/m07/` dengan `git mv`. Rantai 12 langkah bagian C lengkap
sebagai tabel gerbang, topologi bagian E lengkap, laporan dan surel honeypot
serta jebakan lengkap. Enam cacat bagian B diperbaiki: #1, #2, #3, #4, #6, #11.

**Yang ditunda ke fase 4** (sesuai peta fase prompt): HoneyCheck (bagian F),
tabel status node `/legacy-cms/` yang dirancang (bagian I), pelacakan 240 detik
beserta banner, penalti dan pembobolan desktop (bagian G), efek ending dan
surat Greta (bagian H), surel "What now?" dan kolom `choice`, pembayaran hadiah
5000, kunci BACKTRACE m7 (bagian I), dan teks zh. `Rewards` quest sengaja tidak
diisi (prompt D1).

**Nilai yang dipilih agen** (bisa diveto pemilik):

| Hal | Nilai | Alasan |
|---|---|---|
| LAN | Router `.1`, Splitter `.2`, Firewall `.3`, C2 `.4`, Null-Crown `.5`, Ash-Vector `.6`, semua `192.168.1.x` | E-7; berurutan dari `.1`, tanpa pengulangan |
| Pengguna Firewall | `fw.admin` / `Ashgate#2022r2` | satu-satunya pengguna valid (E-9). Kata sandi dibaca dari cadangan 2022 |
| `M07_ARCHITECT_REAL_NAME` | `Conrad Lindqvist` | keputusan #8; nilai lama "Damien Okoro" dibuang |
| Kolom `evidence` | `employee negligence (G. de Souza)` | persis seperti tercetak di `manifest.txt`, jadi pemain terbukti membacanya |
| Tenggat probe pelacakan | 60 detik (`realMs`) | hanya probe fase 1; angka sebenarnya 240 detik di fase 4 |

**Tanggal.** Semua dari `13-story-timeline.md`: `manifest.txt` memakai 2020,
2023, 2026-05-02, 2026-07-22, 2026-08-14 (nominal dan tanggal dari
`finance.ts`) dan persetujuan Nordhaven 2026-08-17; `ash-gate_backup.txt`
bertanggal 2022. **Tidak ada tanggal baru.** Baris "terakhir direkonsiliasi"
yang diizinkan bagian E tabel M7 belum dipakai.

**IP publik dan nama** tetap seperti M4 lama, sesuai bagian E. Tidak ada IP
publik baru di fase ini.

**Dua hal yang masih UNVERIFIED, masing-masing dengan probe di build ini.**
`docs/bugs.md` #45: apakah Firewall di dalam Splitter melindungi perangkat
sebelahnya (`GetFirewall` mencocokkan `parent === router.ip`). M2 memakai
bentuk yang sama dan lulus live test, dan progres tidak bergantung padanya
karena port 3389 `active: false` di produksi dan `UnlockSpec` memanggil
`Network.openPort` juga. `docs/bugs.md` #46: apakah job `Scheduler` berdelay
`{ realMs }` puluhan detik tetap meledak di dalam sesi Meterpreter, benar
dibatalkan `cancelKind`, dan apa yang terjadi sesudah `mods.reset`.

**Penyimpangan dari spesifikasi.** (1) Port 3389 `active` sejak build
(`M07_RDP_OPEN_FROM_BUILD`), jalan pintas kerangka saja, dicabut fase 4.
(2) `ash-gate_backup.txt` sekarang juga memuat **host** panel, bukan hanya
kredensial, karena Firewall `isIpHidden` dan tabel node `/legacy-cms/` baru ada
di fase 4; tanpa itu langkah 6 tak terjangkau. (3) Unlock langkah 7 juga
mengganti fixture `nmap` C2 supaya 3389 terbaca `OPEN` sesudah firewall dibuka;
bagian D hanya menyebut pencabutan aturan dan pembukaan port, tetapi tanpa
fixture baru `nmap` tetap menjawab `FILTERED` (E-12: fixture dibaca lebih dulu).
(4) Nama `ash-gate` tidak dipasang sebagai `name` node Firewall, mengikuti
konvensi `docs/network.md` (hanya Device internal diberi `name`); nama itu hidup
di teks.

**Uji pemilik:** `docs/m07-playtest.md`. Yang dicari di log:
`[FP][M07] probe:metasploit-session`, `probe:manifest-cat`,
`probe:attrcheck-revealed`, `probe:ledger-download`, dan pasangan
`probe:tracking-armed` / `probe:tracking-disarmed` / `probe:tracking-expired`.

## Catatan implementasi (2026-10-02, fase 4)

Fase 4: **M7 penuh**. Semua yang fase 1 tunda sudah masuk.

**Dicabut dari kerangka.** Port 3389 tidak lagi `active` sejak build
(`M07_RDP_OPEN_FROM_BUILD = false`), dan lima probe telanjang di
`controller/m07/probes.ts` dihapus bersama berkasnya.

**Yang ditambahkan.** Pelacakan 240 detik di atas kit fase 3 (dipasang di
langkah 8, dipasang lagi di setiap sesi baru ke C2 sampai `fileExtracted`,
dipangkas jadi 120 detik bila `.enc` dibuka dengan `open`); HoneyCheck di
`websites/global/honeycheck/` dengan penilaian yang sengaja salah pada kedua
kotak mati; tabel status node `/legacy-cms/` yang dirancang; kolom `choice`
dengan ketiga efek ending; dua surat epilog Greta dan kesunyian pada `destroy`;
hadiah 5000 lewat `Bank.transaction`; enam kunci BACKTRACE m7 dengan kartu
laporan penuh di `backtrace.html`; dan teks zh lengkap.

**Nilai yang dipilih agen** (bisa diveto):

| Hal | Nilai | Alasan |
|---|---|---|
| `honeycheck.net` | `185.93.2.117` | IP publik baru, tidak bertabrakan |
| Tanggal sampel HoneyCheck | 2026-10-01 | di dalam batas hari-cerita M7 (2026-10-03) |
| Tenggat dipangkas | 120 detik | separuh dari 240, sesuai bagian G |
| Penalti pelacakan | `min(saldo, 500)` | bagian G |
| Label node di `/legacy-cms/` | `index-01`, `ash-gate`, `node-07`, `node-11` | kedua kotak mati diberi label dan peran yang sama supaya tabel tidak membocorkan mana yang honeypot |

**Tanggal.** Tidak ada tanggal baru selain **2026-10-01** (stempel sampel
HoneyCheck), yang memenuhi aturan `13` §A.3. `manifest.txt` tetap dari
`finance.ts`; `ash-gate_backup.txt` tetap 2022; tabel node tetap 2019 dan 2022.
Surat Greta dan log pribadi per ending tanpa tanggal (sudut pandang sesudah M7,
diizinkan `13` §A.3).

**Penyimpangan.** (1) `.enc` tidak dihapus lalu dibuat ulang, melainkan
**payload-nya ditimpa** dan dipulihkan lewat `Files.write` pada berkas yang
ditemukan lewat jalan-id; alasannya di `docs/bugs.md` #49 (`Files.create` hanya
menerima `parentPath`, dan path tidak pernah menjangkau target Meterpreter,
#30). Tanpa ini misi bisa jalan buntu, yang bagian G larang. Gerbangnya juga
memeriksa bendera `ledgerWiped`, jadi kebenarannya tidak bergantung pada
penulisan berkas. (2) Pelacakan diberi `repellable: false` di kit, supaya pemain
tidak bisa membatalkan hitung mundurnya sendiri dengan `repel <ip C2>`.
(3) HoneyCheck dibungkus `gateMissionPages("m07")` sebagai situs misi, bukan
situs alat permanen (menunggu `weblab`, `04-web-layer.md` §E). (4) Plugin
`frontend-design` **tidak tersedia** di lingkungan build, jadi kedua permukaan
dirancang manual mengikuti brief prompt §6; dicatat di laporan sesuai perintah
prompt.

**Uji pemilik:** `docs/m07-playtest.md` (sudah ditulis ulang untuk misi penuh,
13 bagian termasuk jalur gagal, ketiga ending, dan lintasan zh).

## Catatan implementasi (2026-10-02, perbaikan audit)

Perbaikan setelah audit pemilik atas run fase 2-8 (cabang `fix/phases2-8-m04-m07-audit`).
Keputusannya ada di README #38, #39, dan #41; yang di bawah ini hanya selisih terhadap spesifikasi
dan catatan fase 4.

**Ending (bagian H).** Log BACKTRACE dan surat Greta ditulis saat laporan diterima, sebelum
`completeObjective`, yang menjalankan `OnComplete` secara sinkron: log yang ditulis sesudahnya hilang.
Hanya `destroy` menghancurkan jaringan C2, dengan satu `unregister` sesudah berkas ledger dihapus.
`expose` dan `handoff` membiarkan C2 hidup, dan `onCompleteM07` tidak lagi memanggil `unregister`.
Laporan hanya lewat templat, tanpa badan freehand, dan baris `Decision` di templat en kini memuat
`{{choice}}` seperti zh.

**Dasbor dan pelacakan.** `/legacy-cms/` baru terbuka sesudah `edgeScanned`, lewat cermin
`SharedVariables` (`context/m07/progress.ts`); `dirhunter` hanya mencatat probe dan tidak lagi
memajukan `dashboardFound`, yang hanya dipicu `Browser.Meta` (bagian C). Membuka `.enc` hanya bekerja
sesudah shell didapat dan memangkas jendela jadi paling lama 120 detik, tidak pernah lebih panjang dari
sisa waktu: `Scheduler.remaining` mengembalikan milidetik dalam game, jadi dikonversi lewat
`Time.toRealMs` (`docs/bugs.md` #46). Surel watchdog dikirim sekali.

**Penunjuk dalam dunia.** Tip menyebut HoneyCheck dan menegaskan bahwa itu pendapat, bukan bukti;
manifest memuat bagian `[integrity]` yang menyebut `attrcheck`; catatan kaki tabel node menyebut login
bawaan pabrik pada node yang sudah dihapus (README #38).

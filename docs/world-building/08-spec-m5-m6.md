# 08 — Lembar spesifikasi: M5 dan M6

Status: bentuk dan konten DECIDED 2026-10-02, mengikuti templat `07-arsitektur-misi-baru.md` bagian D.
Yang mengikat (DECIDED 2026-10-02): situs M5 dan M6 adalah **situs misi**, Very Hard
sesuai standar proyek, umpan G kedua dan dua versi pernyataan diterima, Vivien Orchid
perempuan. Nama, rantai, tanggal, dan beat final ada di `09-konten-m5-m6.md`. Prosa en dan zh dikerjakan saat implementasi. Setiap langkah dipetakan ke Tier 1 dan butir
bug-nya (`04-web-layer.md` bagian D).

## A. Prinsip bersama

- **Situs misi, bukan situs permanen.** Halaman statis ber-link plus JS di dalam halaman
  (pola ClearEscrow dan LedgerVault, keduanya live), dibungkus `gateMissionPages`. Fitur
  Tier 2 (pencarian lewat `HackhubSDK`, situs alat permanen) ditunda sampai `weblab` lulus.
- **Bukti langkah.** `Browser.Meta` (membawa `href`, `hostname`, path, query) untuk kunjungan
  halaman. Untuk aksi di dalam halaman, halaman memanggil fungsi `Exports` yang memancarkan
  event (pola `flatlineOpenProject` di LedgerVault).
- **Visibilitas per langkah.** Controller menulis cermin `SharedVariables` dari `onAdvance`,
  dan halaman hanya membaca cermin itu (`docs/bugs.md` #36).
- **Satu host, satu kelas `Website`.** Archive dipakai M5 dan M6, jadi satu situs global dengan
  halaman per misi dibungkus `gateMissionPages`. Isi dan nama final: `09-konten-m5-m6.md`.
- **Berkas dokumen berformat `.txt`** dan dibaca dengan `cat` di sesi SSH (live di M2).
  `open` di sesi Meterpreter belum live, jadi tidak dipakai sebagai gerbang.
- **Sinkron dengan template laporan:** satu mail ke Custodian, validator `matchesFields`,
  balasan "belum waktunya" per langkah (pola M1-M3).

## B. M5 "The Door" (`m05`)

### B1. Identitas
`name: "flatline.m05"`, grup `storyline`, `autoStart: true`, `questGate("m05", ["flatline.m04"])`,
bukan `Abandonable`. Satu objective. Tiga lapis kesulitan: OSINT dan arsip (page layer),
kredensial yang harus dipecahkan (crack), dan firewall tersembunyi lalu SSH (network layer).

### B2. Rantai gerbang (14 langkah, transitif)

| # | Langkah | Requires | Pemicu | Tier | Efek |
|---|---|---|---|---|---|
| 1 | `tipReviewed` | - | `Mail.Read` tip Custodian ("kembali ke vault") | 1 | - |
| 2 | `vaultRevisited` | 1 | `flatline.m01.projectOpened`, folder `M01_LEDGERVAULT_PROJECT_FOLDER` | 1 | buka halaman Archive, fixture `lynx` blurb staf |
| 3 | `staff2025Seen` dan `staff2026Seen` lalu `staffArchiveCompared` | 2 | `Browser.Meta` halaman staf IT 2025 dan 2026 (dua flag, digabung) | 1 | kunci `dismissed`. Buka domain tepi jaringan dan fixture `whois`/`nslookup` |
| 4 | `gretaProfiled` | 2 | `Terminal.Lynx.Lookup` akun Greta (bukan Gareth) | 1 | kunci `greta` |
| 5 | `edgeMapped` | 3, 4 | `Terminal.NmapScan` pada tepi jaringan | 1 | buka fixture `nmap` mendalam, buka situs Breach lookup |
| 6 | `credentialFound` | 5 | `Exports` halaman Breach lookup memancarkan event untuk rekaman Greta yang benar | 1 | - |
| 7 | `passwordCracked` | 6 | `John.DecryptHash` dengan hash rekaman itu | 1 (#13) | - |
| 8 | `firewallLoggedIn` | 7 | `PFSense.Login` pada Firewall tersembunyi (pola `controller/m01/breach.ts:27`, `m02/home.ts:39`) | 1 | - |
| 9 | `firewallBreached` | 8 | `PFSense.Changes` (pola yang sama) | 1 | `removeFirewallRules` dan `openPorts` untuk 22 `Cold-Chart` dan 3389 `PC-IT-017` |
| 10 | `archiveAccessed` | 9 | `RemoteConnection.Established` dengan `t === "SSH"` ke `Cold-Chart` (#17: Device, bukan Firewall) | 1 | kunci `archive` |
| 11 | `statementRead` | 10 | `Terminal.Cat` pengakuan Greta (`acknowledgement_gdesouza.txt`) | 1 | kunci `statement` |
| 12 | `memoRead` | 10 | `Terminal.Cat` memo keputusan Vivien Orchid | 1 | kunci `decisionMemo` |
| 13 | `ticketRead` | 10 | `Terminal.Cat` tiket USB (`usb_ticket_PC-IT-017.txt`) | 1 | kunci `usbTicket` |
| 14 | `reportSent` | 11, 12, 13 | `Mail.Sent` ke Custodian dengan `matchesFields` | 1 | `completeObjective`. Balasan "belum waktunya" memakai `firstUnmetStep` |

Bonus **di luar rantai** (pelajaran `rootgrab`, `docs/changelog.md` 2026-10-01): `PC-IT-017` dengan
RDP yang bisa dieksploitasi (Metasploit `exploit` biasa, `RemoteConnection.Established` dengan
`t === "METASPLOIT"`). Di sesi itu `cat` membaca catatan pribadi Greta, dan hasilnya hanya log
pribadi BACKTRACE.

### B3. Dunia per langkah (`UnlockSpec`)
- Langkah 2: halaman Archive dan fixture `lynx` (blurb staf) terbuka.
- Langkah 3: domain tepi jaringan dan fixture `whois`/`nslookup` terbuka.
- Langkah 5: fixture `nmap` dan situs Breach lookup terbuka.
- Langkah 9: aturan Firewall untuk 22 dan 3389 dicabut dan port dibuka (`Network.openPort`).
- Berkas di `Cold-Chart` ada sejak dunia dibangun, tetapi tidak terjangkau sebelum SSH berhasil.

### B4. Topologi (bentuk M2 yang sudah live: Router, Splitter, Firewall tersembunyi, Device)

```text
Router (tepi rumah sakit)  [domain dari Archive]   443 terbuka, 80 tertutup
└─ Splitter (pass-through)
   ├─ Firewall (isIpHidden)   pfSense: satu pengguna valid g.desouza/<P>; aturan blok 22 dan 3389
   ├─ Device "Cold-Chart" (arsip IR)  ssh 22 (nonaktif sampai langkah 9), users g.desouza/<P>, root
   ├─ Device "Bedside-17" (PC-IT-017)  rdp 3389 FreeRDP (nonaktif sampai langkah 9), bonus
   └─ Umpan: Lead-Apron (radiologi), Pay-Station (penagihan), Printer
```

- `python3 net_tree.py <ip tepi>` menemukan Firewall tersembunyi dan perangkat (`docs/bugs.md` #27).
- Alamat publik acak dan baru; LAN `192.168.1.x` (batasan `IsLocalIp`: hanya awalan `192.168.1.`,
  `docs/app-asar-reference.md` E-7).
- Aturan Firewall tanpa `destination` (pola M1 dan M2, tiap port milik satu perangkat) atau dengan
  `destination` sama dengan `lanIp` target; tidak pernah IP publik (`docs/app-asar-reference.md` E-8).
- Password `<P>` dipakai ulang di Firewall dan di `Cold-Chart` (kebiasaan Greta, sejalan dengan tema).
  `MD5(<P>)` otomatis terdaftar karena penggunanya ada di dunia (#13).

### B5. Data dan fixture
- **Breach lookup** (situs misi): 10 rekaman dalam halaman dengan pencarian JS (pola ClearEscrow).
  Setiap hash adalah MD5 asli dari password pengguna yang benar-benar ada di dunia, termasuk
  rekaman umpan (pengguna di perangkat umpan atau Firewall umpan), supaya semuanya bisa di-crack
  dan tidak ada jalan buntu diam-diam (#13). Varian nama pengguna: `g.desouza` (benar),
  `greta.desouza` dan `gdesouza` (gagal di Firewall dan SSH).
- **Archive** (situs misi): halaman staf IT 2025 dan 2026. Greta dihapus. Gareth Lim (kontrak
  berakhir) juga hilang dari 2026. Tidak ada halaman yang menyebut alasan.
- **Twotter:** persona Greta dan Gareth (umpan).
- **`Cold-Chart`:** dokumen, nama berkas, dan beat ada di `09-konten-m5-m6.md` bagian B5.

### B6. BACKTRACE
Kunci (satu per aksi, dilacak dari `onAdvance`): `dismissed`, `greta`, `archive`, `statement`,
`decisionMemo`, `usbTicket`. Extras: nama asuransi, jeda 6 jam 21 menit. Log pribadi: refleksi
pemain tentang "pintu" dan tentang Greta.

### B7. Laporan
Kolom `door`, `cause`, `decider`, `gap`, `motive`, dengan nilai benar dan yang ditolak di
`09-konten-m5-m6.md` bagian B7. Validator menolak Gareth Lim dan penyebab "vendor".

### B8. Teks, lapisan visual, berkas
- Teks en dan zh di `i18n/m05/core.ts`, `site.ts`, `site-keys.ts`, `twotter.ts`. Satu kunci
  petunjuk "belum waktunya" per langkah.
- Visual: situs Archive dan Breach lookup berdesain berbeda, linimasa Twotter Greta, kartu BACKTRACE.
- Berkas: `content/m05/*`, `controller/m05/` (`index`, `spec`, `report`, `world`, `recon`,
  `web`, `crack`, `firewall`, `access`, `documents`), `i18n/m05/*`, `websites/m05/` (`leakindex`),
  Archive di `websites/global/echoline/`, `context/m05/` (cermin visibilitas), `main/m05.ts`.
- Perubahan global: lihat `07-arsitektur-misi-baru.md` bagian C.

### B9. Risiko dan verifikasi
| Butir | Status |
|---|---|
| `John.DecryptHash` | Terbukti di M2 lama (#13). Pemilik proyek: tidak perlu lab, MD5 asli sudah cukup |
| Persona Twotter di-seed sejak awal (`core/seed.ts`) | Akun Greta bisa terlihat sebelum langkah 2. Diterima oleh pemilik proyek |
| `Exports` memancarkan event dari situs misi | Pola sama dengan LedgerVault (live), situs berbeda |
| Firewall dan Device sebagai saudara di dalam Splitter | Bentuk M2 (live) |
| Bonus `PC-IT-017` | Di luar rantai, jadi kegagalannya tidak menghentikan misi |

## C. M6 "Open Register" (`m06`)

### C1. Identitas
`name: "flatline.m06"`, `questGate("m06", ["flatline.m05"])`, bukan `Abandonable`. **Tanpa jaringan**
(`networkIps: []`, `networks: () => []`): diverifikasi di `core/register.ts` bahwa
`networksExist([])` bernilai `true` dan `buildNetworks([])` hanya loop kosong
(`components/topology.ts:14-15`, `:60-67`). Very Hard datang dari page layer dan analisis,
karena network layer sudah dipikul M5.

### C2. Rantai gerbang (10 langkah, transitif)

| # | Langkah | Requires | Pemicu | Efek |
|---|---|---|---|---|
| 1 | `tipReviewed` | - | `Mail.Read` tip Custodian ("Nominees: siapa yang menandatangani") | - |
| 2 | `registryReached` | 1 | `Browser.Meta` host Registry | buka rekaman SKN Capital Nominees, fixture `whois`/`nslookup` |
| 3 | `nomineesRead` | 2 | `Browser.Meta` rekaman Nominees | kunci `nominees` |
| 4 | `agentIdentified` | 3 | `Terminal.Whois` domain agen terdaftar | kunci `registeredAgent` |
| 5 | `hiddenFilingsFound` | 4 | `Browser.Meta` halaman arsip pengajuan tersembunyi (ditemukan lewat `dirhunter`, bukan lewat tautan) | buka snapshot 2019 dan 2024 |
| 6 | `snapshotsCompared` | 5 | `Browser.Meta` dua snapshot (flag per halaman, digabung) | kunci `ownershipChange` |
| 7 | `insurerLinked` | 6 | `Browser.Meta` rekaman asuransi dan jabatan Vivien Orchid | kunci `insurer` |
| 8 | `infraLinked` | 6 | `Terminal.Whois` domain asuransi (registrant Bulletproof VPN Ltd., sama dengan `whois` titik akhir `203.0.113.160` dari M3) | kunci `infra` |
| 9 | `identityProven` | 7, 8 | `Browser.Meta` rekaman Conrad Lindqvist (terbuka hanya sesudah 7 dan 8) | kunci `architect` |
| 10 | `reportSent` | 9 | `Mail.Sent` ke Custodian dengan `matchesFields` | `completeObjective` |

`dirhunter` hanya alat penemuan. Gerbangnya kunjungan halaman, karena `Terminal.Dirhunter`
belum pernah dipakai sebagai gerbang di pipeline.

### C3. Kesulitan (page layer dan analisis)
- Halaman tersembunyi hanya terjangkau lewat `dirhunter`.
- Rekaman saling bertentangan (status CONFLICTING dan VERIFIED) yang dibedakan lewat tanggal.
- Direktur nominee "berwajah" (profesional untuk ratusan cangkang) sebagai umpan.
- Dua gerbang CLI (`whois`) yang menautkan alamat dan domain ke infrastruktur M3.
- Konsekuensi M1-M3 di rekaman: controller M6 membaca status `backtrace` (konteks mod) dan
  mencerminkannya ke `SharedVariables` (pola #36): Skynet "dissolved", Reyes "no longer listed"
  bila M3 selesai.

### C4. Data, BACKTRACE, laporan
Situs misi: Registry dan HostTrail, plus halaman Archive M6 di situs global Echoline. Domain
didaftarkan tanpa subnet (`needsSubnet: false`) supaya `whois`/`nslookup` bisa memakainya. Kunci,
nilai, rekaman, dan kolom laporan: `09-konten-m5-m6.md` bagian C.

### C5. Berkas dan risiko
- `content/m06/*`, `controller/m06/`, `i18n/m06/*`, `websites/m06/` (`registry`, `hosttrail`),
  Archive di `websites/global/echoline/`, `context/m06/`, `main/m06.ts`.
- **Risiko.** Jalur `networkIps: []` terverifikasi di kode tetapi belum pernah dijalankan live.
  Pemilik proyek menetapkan: diuji, dimulai dari kerangka jalan M6 (`09-konten-m5-m6.md` bagian D). `dirhunter` mengenumerasi halaman situs mod
  (preseden M1), perlu dikonfirmasi untuk halaman tersembunyi M6.

## D. Masih OPEN
Nama, rantai, jumlah rekaman, bonus `PC-IT-017`, asuransi dan negosiator sudah DECIDED
(`09-konten-m5-m6.md`, `06-pertanyaan.md`). Tersisa untuk implementasi: prosa en dan zh, alamat IP,
password `<P>` dan hash, dan apakah `replyable` diuji di lab (`06-pertanyaan.md` G1-f).

---

## Catatan implementasi (2026-10-02, fase 2)

Fase 2: **kerangka jalan M6** saja, bukan misi penuh. Tujuannya satu — menjalankan
jalur `networkIps: []` di dalam permainan untuk pertama kalinya (bagian C5,
"Risiko"). Yang masuk: lima langkah pertama rantai bagian C, situs Registry dengan
jalur buram `/entity/r7k4/` dan halaman tak-tertaut `/filings/archive/`, fixture
`whois`/`nslookup` tanpa subnet, dan satu tujuan laporan. Yang **belum**: HostTrail,
halaman Archive M6, arsip 2019/2024 yang bertabrakan, perbandingan snapshot, tautan
asuransi dan infrastruktur, rekaman Conrad Lindqvist, cermin konsekuensi M1-M3 ke
`SharedVariables`, laporan 5 kolom, kunci BACKTRACE m6, dan teks zh. Skrip uji:
`docs/m06-playtest.md`. Fase 7 melanjutkan dari titik ini.

## Catatan implementasi (2026-10-02, fase 6)

Fase 6: **M5 penuh**, 13 langkah sesuai bagian B.

**Bentuk rantai.** Dua pasang paralel, bukan satu garis. Snapshot 2025 dan 2026
berdiri sendiri lalu bergabung di `staffArchiveCompared`; cabang arsip itu
bergabung dengan profil `lynx` Greta di `edgeMapped`. Tiga dokumen insiden
(`acknowledgement`, `decision_memo`, `usb_ticket`) juga paralel, bergantung hanya
pada sesi arsip, supaya urutan bacanya bebas dan tidak ada langkah yang bisa
menguncinya. Laporan menunggu ketiganya.

**Nilai yang dipilih agen** (bisa diveto):

| Hal | Nilai | Alasan |
|---|---|---|
| Edge rumah sakit | `198.244.91.37` / `remote.pacificcare-health.org` | satu-satunya node yang perlu domain |
| Splitter / Firewall | `37.120.145.62` / `193.29.57.184` | LAN `192.168.1.2` dan `.3` |
| Cold-Chart (arsip) | `141.98.252.76`, LAN `192.168.1.4`, ssh 22 | sasaran aturan deny pertama |
| Bedside-17 | `80.94.92.118`, LAN `192.168.1.5`, rdp 3389, FreeRDP 6.0.4, `it.station` daring | bonus bluekeep, bukan langkah |
| Tiga pengalih (Lead-Apron, Pay-Station, printer) | `45.142.193.29` / `176.113.115.84` / `195.133.40.17` | LAN `.6`-`.8`, port tertutup sejak build |
| `echoline.net` / `leakindex.net` | `185.31.164.22` / `91.229.23.105` | situs, tanpa subnet |
| Jalur snapshot | `/s/8fq2/` (2025-11-03) dan `/s/8fq7/` (2026-09-02) | buram, karena `dirhunter` mencetak semua jalur terdaftar (#40) |
| Password Greta | `Marigold2019` | MD5-nya `a3106b24578d51822fb862154d11b89d` |
| Password pengalih | `radiology2021`, `billing-desk-04`, `printroom01` | tiga hash pengalih di tabel LeakIndex |
| Hadiah | 1200 | kontrak terkecil dalam rangkaian, sesuai D1 |

**Semua hash adalah MD5 sungguhan dari password yang dideklarasikan pada
perangkat.** `docs/bugs.md` #13: `john` tidak pernah membaca sistem fixture
`Shell`, jadi hash hanya bisa dipecahkan kalau mesin sendiri memasukkannya ke
registri lewat array `users` sebuah perangkat. Keempatnya diperiksa di harness.

**Tanggal.** Tidak ada tanggal baru. Semua dari `13` §B: 2026-08-11 (media
dihubungkan), 2026-08-14 (insiden dan pembayaran), 2026-08-15 (draf), 2026-08-18
(tanda tangan), 2026-08-19 (temuan final), 2026-08-24 (ditutup), 2026-07-31
(kontrak Gareth berakhir), 2025-11-03 dan 2026-09-02 (dua snapshot). Jeda
02:41 -> 09:02 = 6 jam 21 menit, nilai yang diminta laporan.

**Penyimpangan.** (1) LeakIndex memakai `Exports` sebagai gerbang dan mengirim
**angka**, bukan string seperti M01; belum diuji live, dicatat di
`docs/m05-playtest.md` §15. (2) Kait M01 dibaca lewat
`src/content/global/vault-hook.ts` yang **menyalin ulang** nama event dan id
folder `q3`, bukan mengimpor konten M01 yang terkunci — aturan tanpa impor
antar-misi tetap utuh. (3) Fixture `nmap` untuk alamat edge dibuang: edge adalah
router sungguhan, dan fixture cetak akan menimpa pemindaian hidup. (4) Snapshot
2026 menghilangkan **dua** nama, bukan satu: Gareth Lim karena kontraknya memang
berakhir, Greta tanpa alasan apa pun — itulah pengalihnya, dan `Gareth Lim`
adalah jawaban `door` yang ditolak laporan. (5) Plugin `frontend-design`
**tidak tersedia** di lingkungan ini, jadi LeakIndex dan halaman Echoline
dirancang manual mengikuti brief prompt §6.

## Catatan implementasi (2026-10-02, fase 7)

Fase 7: **M6 penuh**, 10 langkah sesuai bagian C2. Semua yang fase 2 tunda sudah masuk.

**Bentuk rantai.** Dua pasang paralel. Pengajuan 2019 dan 2024 berdiri sendiri
(`filing2019Seen`, `filing2024Seen`) lalu bergabung di `snapshotsCompared`; cabang asuransi
(`insurerLinked`, kunjungan halaman) dan cabang infrastruktur (`infraLinked`, `whois`) berdiri
sendiri lalu bergabung di `identityProven`. Rekaman Conrad hanya terbuka sesudah keduanya.

**Gerbang halaman lewat satu angka tahap.** `context/m06/progress.ts` menyimpan satu tahap
monotonik 0-5 di `SharedVariables` (pola #36: render situs tidak punya konteks mod, jadi tidak
bisa membaca `SaveStorage` sendiri). Setiap rekaman menyatakan tahap pembukanya; pencarian di
halaman depan hanya menerbitkan rekaman yang sudah terbuka, jadi pencarian itu sekaligus
penunjuk kemajuan. `setM06Stage` menolak turun.

**Nilai yang dipilih agen** (bisa diveto):

| Hal | Nilai | Alasan |
|---|---|---|
| `nordhaven-mutual.com` / portal | `193.42.33.58` / `193.42.33.60` | domain asuransi dan portalnya |
| `hosttrail.net` | `45.133.1.76` | situs alat, tanpa subnet |
| Nomor perusahaan | PC-114772 (SKN), PC-079550 (agen), PC-132277 (Skynet), PC-098431 (Halvard), PC-141009 (Holdings), PC-061845 (Mutual) | satu format, satu yurisdiksi |
| Jalur rekaman | `/entity/r7k4/`, `/entity/m8w5/`, `/entity/s2k9/`, `/entity/h3p8/`, `/entity/n5v1/`, `/entity/n5v4/`, `/officer/a4t7/`, `/officer/v6r3/`, `/officer/c9m2/`, `/filings/f19x/`, `/filings/f24x/` | buram, karena `dirhunter` mencetak semua jalur terdaftar (#40) |
| Snapshot Archive M6 | `/s/3kq8/`, 2026-09-30 | hari-cerita M6, batas "paling akhir" di `13` E |
| Sidik sertifikat bersama | `9c:41:ab:...:5d:86` | satu sertifikat untuk `vpn.skn-central.net` dan `portal.nordhaven-mutual.com` |
| Sertifikat agen | sidik berbeda, satu nama | agen bukan bagian dari infrastruktur operator |
| Hadiah | 1800 | di antara M5 (1200) dan M7 (5000) |

**Tanggal.** Tidak ada tanggal baru. Semua dari `13` §B: 2017-03-09, 2021-11-30, 2021-12-02,
2022-06-13, 2022-06-14, 2024-03-01, periode 2009-2018, 2018-2024, 2019-2024, dan tahun pengajuan
2019 dan 2024 (tahun saja, karena `13` §B hanya memastikan tahunnya). Stempel Registry, HostTrail
dan snapshot: 2026-09-30, batas yang `13` §E izinkan. HostTrail memakai "pertama/terakhir terlihat"
alih-alih masa berlaku sertifikat, supaya tidak perlu tanggal di masa depan.

**Konsekuensi M1-M3.** Controller membaca status `backtrace` m3 di `OnObjectivesStart` dan
mencerminkannya ke `SharedVariables`. M3 selesai: Skynet Import-Export berstatus "struck off" di
Registry hidup, dan `d.reyes` tertulis "no longer listed" di snapshot Archive. Keduanya warna, bukan
gerbang; rantai tidak berubah bila M3 belum selesai.

**Penyimpangan.** (1) Dua pengajuan berada di Registry sendiri, bukan di Echoline: `09` C2 memang
menempatkan snapshot 2019 dan 2024 di `/filings/archive/`. Echoline tetap mendapat satu halaman
Archive M6, yaitu snapshot rekaman agen. (2) `Conrad Lindqvist` dipindahkan ke
`content/global/characters.ts`; M06 tidak boleh mengimpor `content/m07/`, dan static check sekarang
gagal pada impor antar-misi apa pun. (3) HostTrail dibuka pada tahap 4, bukan sejak awal, supaya
`portal.nordhaven-mutual.com` tidak bocor sebelum asuransi ditemukan. (4) Langkah 7 memakai satu
kunjungan halaman: rekaman Mutual sendiri yang memuat jabatan Vivien Orchid, jadi tidak perlu dua
kunjungan. (5) Plugin `frontend-design` **tidak tersedia**, jadi Registry, HostTrail dan snapshot
dirancang manual mengikuti brief prompt §6.

## Catatan implementasi (2026-10-02, perbaikan audit)

Perbaikan setelah audit pemilik atas run fase 2-8 (cabang `fix/phases2-8-m04-m07-audit`).
Keputusannya ada di README #38 sampai #41; yang di bawah ini hanya selisih terhadap spesifikasi
dan terhadap dua catatan di atas.

**M5.** Situs tidak bisa ditemukan lewat Goagle (`docs/bugs.md` #52), jadi dua surel susulan
Custodian menyebut `echoline.net` (saat `vaultRevisited`) dan `leakindex.net` (saat `edgeMapped`),
dan kedua snapshot staf memuat baris akses jarak jauh yang menyebut host edge. Fixture `nslookup`
dan `nmap` Echoline didaftarkan bersama `archiveLead`, bukan saat build, sesuai urutan langkah.
Gerbang `gretaProfiled` menerima handle dan nama lengkap, karena `lynx` mengubah nama lengkap
menjadi nama Twotter sebelum memicu event (#53); username persona Twotter disimpan tanpa `@` (#54).
Tabel LeakIndex hanya mencetak enam karakter pertama hash sampai rekaman dibuka. Hadiah 3200,
bukan 1200 (README #40). **Penyimpangan yang belum diputuskan:** folder insiden ada di `/ir/...`
(`rootFiles`), bukan `/var/ir/...` seperti `09` B5 dan `13`; `13` tidak diedit, jadi memindahkan
kode atau menerima `/ir/` masih OPEN.

**M6.** Surel susulan Custodian saat `snapshotsCompared` menyebut `hosttrail.net` dan portal asuransi.
Itu menggantikan sebagian penyimpangan (3) catatan fase 7: HostTrail dinamai pada tahap yang sama
dengan saat ia dibuka, jadi nama asuransi terbuka satu langkah lebih awal dari rancangan. Rekaman
Mutual memuat kolom Customer portal dan tautan ke rekaman arsitek, dan Registry menyembunyikan
tautan ke rekaman yang tahap pembukanya belum tercapai. Tahap diturunkan dari `tipReviewed`,
disinkronkan juga saat `Mail.Read`, dan direset saat misi mulai, karena `metadata()` berjalan sebelum
`Browser.Meta` (#55). Hadiah 4000, bukan 1800. Registrant `whois` asuransi di zh disamakan dengan
M3 dan M4 (README #32), dan `LOG_CERTIFICATE_1` ditulis ulang supaya tidak mengandaikan sesuatu
yang baru terlihat di HostTrail.

**Laporan M5 dan M6.** Validator mencocokkan kata kunci dan angka (README #39); nilai yang benar
tidak berubah.

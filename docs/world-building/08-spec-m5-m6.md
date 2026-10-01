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
- Alamat publik acak dan baru; LAN `192.168.x.x` (batasan `IsLocalIp`, `docs/network.md`).
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

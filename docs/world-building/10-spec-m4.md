# 10 — M4 "Burn Notice": spesifikasi dan konten final

Status: DECIDED 2026-10-02 untuk bentuk, rantai, nama, dan angka awal. Prosa en dan zh
ditulis saat implementasi. **Aplikasi Sentinel DITAHAN** (ongoing, di luar lingkup M4 sekarang).
Keputusan angka (hukuman, waktu, host kontrol, honeypot, stempel waktu tetap) diterima lewat
EKSEKUSI. Mengikuti templat `07-arsitektur-misi-baru.md` bagian D. Judul masih judul kerja.

## A. Identitas

`name: "flatline.m04"`, grup `storyline`, `autoStart: true`, `questGate("m04", ["flatline.m03"])`,
bukan `Abandonable`, satu objective. **Prasyarat penomoran:** M4 lama dimigrasi dan diganti id
menjadi `m07` lebih dulu (`07-arsitektur-misi-baru.md` bagian C). Hadiah dibayar lewat
`Bank.transaction` di `OnComplete`, bukan `Quest.Rewards` (tidak membayar di prototipe). Nilai awal
sama dengan M4 lama (`M04_REWARDS`: 800 uang, 200 xp), dapat disesuaikan.

## B. Kit rival-hacker: dipakai dan diubah

Sumber: `src/debug/rival-hacker-lab.ts`, `rival-breach.ts`, `rival-banner.ts` dan `.html`.

| Bagian kit | Nasib di M4 |
|---|---|
| Loop panas dan serangan acak (`runTick`, `Math.random()`) | **Dibuang.** Serangan berskrip lewat `Scheduler` (deterministik, bisa dites) |
| Identitas acak (the Custodian, GHOSTWIRE, TR4C3#404) | **Dibuang.** Satu alias tetap `sentry` (`sentry@darknull.io`). Custodian kosong, jadi tidak boleh jadi penyerang |
| `Bank.withdraw` tanpa cek saldo | **Diubah:** `min(saldo, jumlah)` dengan `Bank.getBalance()` |
| Banner hitung mundur (`Desktop.addWidget` dan `Variables`) | Dipakai |
| Kunci desktop CSS dan pelepas pengaman | Dipakai |
| Folder `~/compositor`, `sysdiag`, `sysrepair --rebuild` | Dipakai. Build benar dipilih acak dari tiga dan dicatat di log insiden |
| Stempel waktu log insiden dari `Time.now()` | **Diubah ke konstanta** supaya cocok dengan log relay |
| `repel <ip>` | Dipakai, dua sasaran: penyusup (langkah 3) dan host kontrol (langkah 14) |
| Pemantau terminal lewat DOM dan klik sintetis | Dipakai dengan pengaman pelepas kunci |

## C. Rantai gerbang (15 langkah, transitif)

| # | Langkah | Requires | Pemicu | Tier | Efek |
|---|---|---|---|---|---|
| 1 | `warningRead` | - | `Mail.Read` surel pertama Custodian yang tidak diminta | 1 | serangan 1 dijadwalkan |
| 2 | `probeStarted` | 1 | event mod dari job `Scheduler` | 1 | banner, `~/logs/firewall.log` dibuat |
| 3 | `intruderRepelled` | 2 | `repel <ip>` benar, event mod | 1 (lab live) | kunci `probe` |
| 4 | `breachBegan` | 3 | serangan 2 berskrip, event mod | 1 (lab live) | desktop dikunci, `~/compositor` dibuat |
| 5 | `incidentLogRead` | 4 | `Terminal.Cat` `incident.txt` | 1 | kunci `breach`, buka fixture relay-1 |
| 6 | `desktopRestored` | 4 | `sysrepair --rebuild` sukses, event mod | 1 (lab live) | kunci dilepas |
| 7 | `relayProfiled` | 5, 6 | `whois`/`geoip`/`nmap` pada relay-1 | 1 | buka fixture `hydra` Router R1 |
| 8 | `hydraRun` | 7 | `Terminal.Hydra` pada R1 (`-P` wordlist HackDB, `docs/m03-playtest.md` langkah 10) | 1 (M3 live) | buka port 22 Static-Hop |
| 9 | `relay1Accessed` | 8 | `RemoteConnection.Established` SSH ke Static-Hop | 1 | kunci `relay1` |
| 10 | `relayLogRead` | 9 | `Terminal.Cat` `auth.log` | 1 | buka port 22 Quiet-Mirror |
| 11 | `relay2Accessed` | 10 | SSH ke Quiet-Mirror | 1 | kunci `relay2` |
| 12 | `controlFound` | 11 | `Terminal.Cat` `watchdog.conf` | 1 | kunci `control`, buka fixture Night-Shift |
| 13 | `originLinked` | 12 | `Terminal.Whois`/`Terminal.Geoip` pada Night-Shift | 1 | kunci `origin` |
| 14 | `huntEnded` | 13 | `repel <ip Night-Shift>` | 1 | pengejaran berhenti, surel penutup |
| 15 | `reportSent` | 14 | `Mail.Sent` ke Custodian dengan `matchesFields` | 1 | `completeObjective` |

Langkah 5 dan 6 sengaja paralel dan digabung di 7: pemain bisa memperbaiki desktop dengan mencoba
tiga build tanpa membaca log, dan itu tidak boleh membuat misi macet.

**Kegagalan (tidak pernah jalan buntu).**
- Serangan 1: tenggat 120 detik real-time. Gagal: penalti `min(saldo, 300)`, log baru, serangan
  diulang. `repel` ke IP yang salah hanya memberi pesan, tanpa penalti.
- Honeypot Paper-Moth: `RemoteConnection.Established` ke host itu memicu serangan tambahan
  (penalti `min(saldo, 500)`) dan surel peringatan. Di luar rantai.

## D. Dunia per langkah (`UnlockSpec`)
- Langkah 5: fixture `whois`/`geoip`/`nmap`/`nslookup` relay-1.
- Langkah 7: fixture `hydra` untuk R1 (kunci pada pengguna bawaan `guest`, `docs/bugs.md` #25).
- Langkah 8: `openPorts` 22 Static-Hop. Langkah 10: 22 Quiet-Mirror.
- Langkah 12: fixture `whois`/`geoip`/`nmap` Night-Shift.

## E. Topologi (empat Router, masing-masing satu Device; bentuk rantai pengembang M2)

```text
R1 (panel TP-Link, 80)   -> Device "Static-Hop"  relay 1  ssh 22 (nonaktif sampai 8), svc/<pw>, root
R2                       -> Device "Quiet-Mirror" relay 2 ssh 22 (nonaktif sampai 10), ops/<pw2>
R3                       -> Device "Paper-Moth"  honeypot ssh 22, admin/admin
R4                       -> Device "Night-Shift" host kontrol, 443 https
```

- Alamat publik acak dan baru, LAN `192.168.x.x`. `networkIps` berisi keempat Router, teardown
  berurutan lewat `core/rebuild` (#35).
- `hydra` pada R1 mengungkap kredensial yang dipakai ulang untuk SSH Static-Hop (meniru M3).
- Night-Shift: `whois` menunjukkan registrant **Bulletproof VPN Ltd.**, contact yang sama dengan
  fixture `whois` titik akhir di M3 (`content/m03/fixtures.ts:93-97`). `geoip` Unknown (sama dengan
  M3). Alamatnya bertetangga dengan `203.0.113.160`. Ini menautkan M3 (whois yang sama), M4, M6
  (registrant yang sama untuk domain asuransi), dan M7. "SKN-CENTRAL" tetap label peer di config M3
  dan domain `skn-central.net`, bukan nama registrant.

## F. Konten (beat)

**Surel.** Pembuka (Custodian, tidak diminta, memenuhi H1 dan H2): ada yang salah, aturan yang
tertinggal di Skynet ditemukan, jangan dekati titik akhir, cari tahu siapa yang mencari. Serangan 1
(`sentry@darknull.io`): "you left a door open", tanpa menyebut IP, pelacakan lewat log firewall.
Serangan 2: "nice desktop" (kompositor dicopot). Penutup (`watchdog@architect-c2.dark`, pengirim yang
sama dengan peringatan honeypot M7): "You found the door. Someone will close it."

**`~/logs/firewall.log` (sekitar 12 baris).** Tiga baris wajar (cermin pembaruan, NTP, CDN), dua
pemindai (gagal 443 berulang lalu dilepas) sebagai umpan, satu penyusup yang dikenali dari perilaku
(sesi 443 diterima, memegang uid 0, beacon tiap 60 detik), plus derau. Stempel waktu tetap.
Alamat penyusup di serangan 1 adalah alamat sekali pakai, bukan host di dunia.

**`incident.txt`** (dari `buildIncidentLog`): sumber sesi adalah alamat publik Static-Hop; modul
dicopot, konfigurasi ditulis ulang, build yang diharapkan tertulis. Waktu serangan 03:14:07 (tetap).

**`auth.log` di Static-Hop (sekitar 14 baris).** Lima koneksi keluar. Hanya satu yang cocok dengan
03:14 di log insiden (Quiet-Mirror, 03:14:06). Umpan: Paper-Moth pukul 03:14:41 dan tiga lainnya
sebelum pukul 03:00. Kredensial `ops/<pw2>` ada di `notes.txt` operator yang ceroboh.

**`watchdog.conf` di Quiet-Mirror.** `control_host` (alamat Night-Shift), `operator_tag = SENTRY`,
`beacon_interval = 60`. Berkas umpan `old_targets.txt` (menyemai M5 dan memenuhi H3 tanpa
membocorkan identitas): satu baris "skynet/finance: d.reyes: monitor", satu baris "pacificcare/it:
closed" tanpa nama, dan satu baris "next: prepping".

**Laporan.** Kolom `hunter` (SENTRY), `relays` (Static-Hop lalu Quiet-Mirror), `control` (alamat
Night-Shift), `origin` (Bulletproof VPN Ltd., registrant yang sama dengan `203.0.113.160`), `contained`
(pengejaran dihentikan). Validator menolak Paper-Moth.

**BACKTRACE.**

| Kunci | Nilai |
|---|---|
| `probe` | Penyusup dikenali di log firewall dan diputus |
| `breach` | Desktop dibobol, log insiden menelusuri sesi ke Static-Hop |
| `relay1` | Static-Hop (relay 1) diakses |
| `relay2` | Quiet-Mirror (relay 2), hop dicocokkan lewat stempel waktu |
| `control` | Host kontrol Night-Shift disebut di `watchdog.conf` |
| `origin` | Night-Shift terdaftar atas Bulletproof VPN Ltd., registrant yang sama dengan titik akhir `203.0.113.160` |

Extras: alias SENTRY, total uang yang hilang. Log pribadi (beat): setelah `probe` ("mereka tahu
namaku"), setelah `breach` ("mereka mengambil desktop, bukan uang: mereka mau aku melihat"), setelah
`origin` ("alamat yang sama lagi").

**Petunjuk "belum waktunya" (beat).** Surel belum dibaca: periksa kabar dari Custodian. Intrusi belum
dihentikan: ada yang masih di dalam. Log insiden belum dibaca: yang tertinggal ada di rumahmu.
Relay belum dipetakan: alamat sumber tidak berhenti di sana. Hop belum dicocokkan: periksa jamnya.
Host kontrol belum ditemukan: satu hop lagi.

## G. Lapisan visual
Banner hitung mundur, kunci desktop dan layar pemulihan, kartu BACKTRACE. Sentinel (aplikasi
koneksi dan tombol Block) **ditahan**: bukan bagian M4 sampai diputuskan.

## H. Penempatan arsitektur dan perubahan global
- `components/`: `intrusion` (keadaan serangan dan `Scheduler`), `desktop-breach`, `incident-banner`
  (+ HTML widget). Mission-blind.
- `commands/`: `repel.ts`, `sysdiag.ts`, `sysrepair.ts` (terdaftar global, `default: true`,
  `scope: "local"` untuk dua terakhir; menolak dengan sopan bila M4 tidak aktif).
- `content/m04/`: `state`, `gates`, `network`, `topology`, `fixtures`, `scan`, `server-files`,
  `mail`, `report`, `quest`, `intro`. `controller/m04/`: `index`, `spec`, `report`, `world`,
  `intrusion`, `breach`, `relay`, `control`. `i18n/m04/core.ts` (en dan zh). `main/m04.ts` tipis.
- Keadaan kit di `SaveStorage` berawalan `flatline.m04.*`. Bendera misi di `quest.Data`.
- Global: isi `BACKTRACE_KEYS.m4` dan pembuat fakta (`backtrace-facts.ts`). `QuestId` `m04` sudah
  ada. Kit di `src/debug/` tetap sebagai lab sampai dimigrasi (nasibnya OPEN).

## I. Verifikasi mekanik
| Butir | Status |
|---|---|
| `Scheduler` (job, `remaining`) | Dipakai pipeline (rebuild) dan lab |
| Banner, kunci CSS, folder pemulihan, `repel`/`sysdiag`/`sysrepair` | Live di lab 2026-10-01 |
| `hydra` pada Router :80, SSH ke Device, bentuk Router ke Device | Live (M3, M2) |
| `RemoteConnection.Established`, `Terminal.Cat`, fixture `whois`/`geoip`/`nmap` | Live |
| `Bank.getBalance()` untuk membatasi hukuman | Terdokumentasi di SDK, belum dipakai |

**Risiko.** (1) Kit belum pernah dijalankan di dalam pipeline misi. (2) Pemulihan terminal memakai DOM
dan klik sintetis (pengaman pelepas kunci dipertahankan). (3) Tenggat real-time harus cukup longgar.
(4) `mods.reset` saat desktop terkunci: kit menangani di `Game.SessionStarted` (sudah dites di lab).
(5) Biaya membangun empat Router.

## J. Rencana uji
Kerangka jalan M4 lebih dulu: empat Router, satu serangan berskrip, banner, dan `repel`, tanpa konten
penuh. Diuji dengan harness SDK tiruan, lalu live, termasuk `mods.reset` saat serangan aktif. Baru
sesudah itu rantai penuh dan BACKTRACE.

## K. Masih OPEN
Prosa en dan zh, alamat IP dan password, penyesuaian angka (hukuman, tenggat, hadiah), nasib lab debug,
dan Sentinel (ditahan).

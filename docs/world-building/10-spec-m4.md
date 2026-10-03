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
uang sama dengan M4 lama (`M04_REWARDS`: 800 uang), dapat disesuaikan. XP dilewati (keputusan #34);
`Rewards` quest tidak diisi dan pembayaran dilewati saat dev/tester focus.

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
| 2 | `probeStarted` | 1 | event mod dari job `Scheduler` | 1 | banner (`~/logs/firewall.log` baru dibuat sesudah restore, README #45) |
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

- Alamat publik acak dan baru. LAN `192.168.1.x` (`IsLocalIp` hanya menerima awalan itu,
  `docs/app-asar-reference.md` E-7); Router lain di misi yang sama boleh memakai awalan `192.168.N.x`
  sendiri seperti M1. `networkIps` berisi keempat Router, teardown berurutan lewat `core/rebuild` (#35).
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

## Catatan implementasi (2026-10-02, perbaikan audit)

Perbaikan setelah audit pemilik atas run fase 2-8 (cabang `fix/phases2-8-m04-m07-audit`).
Keputusannya ada di README #39 dan #40; yang di bawah ini hanya selisih terhadap spesifikasi.

**Hadiah.** 2400, bukan 800 di bagian A (README #40).

**Langkah 5 sampai 9.** `incident.txt` memuat alamat publik Static-Hop sebagai sumber sesi
(bagian F) dan, di baris yang sama, gateway NAT di depannya, yaitu alamat Router R1. Dengan begitu
langkah 7 bisa dicapai dari teks yang dilihat pemain. Pengguna panel R1 adalah `svc`, akun yang sama
dengan SSH Static-Hop (bagian E: "hydra pada R1 mengungkap kredensial yang dipakai ulang"). Fixture
`hydra` menjawab `guest` (bawaan engine, `docs/bugs.md` #25), `admin`, dan `svc`, dan hasilnya selalu
menyebut `svc`.

**Laporan.** Kolom `hunter`, `relays`, `control`, `origin`, dan `contained` berupa token kosong di
jendela tulis. Pencocokan longgar (kata kunci, urutan bebas untuk `relays`), menolak Paper-Moth, dan
`control` harus alamat yang tepat (README #39).

## Catatan implementasi (2026-10-03, desain ulang breach)

Keputusannya ada di README #42; yang di bawah ini hanya selisih terhadap spesifikasi.

**Bagian B dan H.** Folder `~/compositor` dan `incident.txt` diganti tata letak kernel (`/lib/modules/6.8.0-flatline/extra/flcomp.ko`,
`/etc/flcomp/display.conf`, `/boot/recovery`, `/boot/initramfs-flatline.img`, `/var/log/flcomp-incident.log`). Pemantau terminal
lewat DOM dan klik sintetis dibuang; layar pemulihan adalah widget layar penuh. `sysdiag` dan `sysrepair` menjadi cadangan.

**Bagian C.** Langkah 5 (`incidentLogRead`) dipicu event widget `flatline.recovery.logRead` atau `Terminal.Cat`/`open` pada
`flcomp-incident.log`. Langkah 6 (`desktopRestored`) dipicu event `flatline.recovery.finished` dari widget setelah `sysrepair --rebuild`
lolos verifikasi (modul, `display.conf` ABI 7, initramfs dibangun ulang). Serangan 2 didahului banner "severed" yang bertahan 15 detik.

**Bagian F.** `flcomp-incident.log` memuat srcversion modul yang diharapkan (bukan nama build), sumber sesi, gateway NAT, dan urutan
pencopotan modul. Stempel waktu tetap 03:14:07 sampai 03:14:12.
**Kegagalan serangan 1 (bagian C).** Habis waktu tidak lagi memotong uang atau mengulang serangan: banner "TRACE COMPLETE" tampil 3 detik,
lalu breach dimulai. `breachBegan` hanya butuh `probeStarted`; `intruderRepelled` opsional (README #43). Hukuman honeypot tidak berubah.

**Berkas breach.** Dibuat saat breach dimulai, dihapus saat rebuild selesai kecuali `flcomp-incident.log` (README #43).

## Catatan implementasi (2026-10-03, desain ulang minor serangan 1)

Keputusannya ada di README #44; yang di bawah ini hanya selisih terhadap spesifikasi.

**Bagian B.** `repel <ip>` kini punya satu sasaran: host kontrol (langkah 14). Penyusup serangan 1 tidak bisa di-`repel`; selama hitung mundur `repel` dijawab penolakan khusus M4 (`noticeKey`).

**Bagian C.** Langkah 3 (`intruderRepelled`) dihapus dari rantai dan dari data misi. Serangan 1: tenggat 60 detik dengan banner `broadcast`, tanpa penalti dan tanpa pengulangan. Saat tenggat habis breach langsung dimulai tanpa jeda normal (opsi `handoff`: banner tetap di 00:00 dan glitch tetap level 3 sampai layar dipotong; breach dijadwalkan 100 ms sesudah tenggat). `breachBegan` hanya butuh `probeStarted`.

**Bagian F.** Surel serangan 1 naratif dan mengancam, menyebut 03:14:07 dan tetap tidak menyebut IP. Surel serangan 2 ("nice desktop") dihapus. Surel baru dari Custodian ("you're still there") dikirim 4 detik setelah `desktopRestored`, sesudah toast restore. Kunci BACKTRACE `probe` didapat dari membaca `~/logs/firewall.log` (bukan gerbang); temuan 02 di `backtrace.html` kini berbunyi "They could not be cut off, ...". Petunjuk "belum waktunya" untuk `breachBegan`: "They are already inside. You cannot stop this one; wait it out." Objective tidak lagi menyebut menahan penyerang.

**Bagian G.** Banner varian `broadcast` (pesan `wall` dari `sentry@darknull.io`, jam jarak jauh menuju 03:14:07, stempel `INCIDENT_START_STAMP`), hanya untuk M4. Banner default tetap dipakai M7 dan lab.

**Toast.** Awal serangan hanya satu toast peringatan. Toast restore tetap; log pribadi BACKTRACE untuk breach dicatat tanpa toast.

## Catatan implementasi (2026-10-03, log klue dan lompat breach)

Keputusannya ada di README #45; yang di bawah ini hanya selisih terhadap spesifikasi.

**Bagian C.** Langkah 2 (`probeStarted`) tidak lagi membuat `~/logs/firewall.log`; berkas itu dibuat 1,5 detik sesudah `desktopRestored`. Langkah 5, 10 dan 12 juga lolos lewat Log Viewer atau Code++ (`Files.Open`) selain `cat` dan `open`. Langkah 5 kini memanggil `unlock(M04_WORLD, "relayLead")`.

**Bagian F.** `firewall.log`, `flcomp-incident.log` dan `auth.log` adalah larik entri Log Viewer, bukan teks; isi baris dan stempel waktu tidak berubah. Surel serangan 1 menyebut log firewall sebagai sesuatu yang ditemukan sesudahnya.

**Dev.** Lompat breach untuk uji dev (`M04_DEV_SKIP_BREACH`) dihapus saat FINAL LOCK M4 (README #47).

## Catatan implementasi (2026-10-03, perintah `flatline`)

Keputusannya ada di README #46; yang di bawah ini hanya selisih terhadap spesifikasi.

**Bagian B.** Perintah `repel <ip>` bernama `flatline <ip>` di seluruh spesifikasi ini. Langkah 14 memutar animasi denyut beacon sekitar 3,8 detik sebelum `huntEnded`. Pemain mengetahui perintahnya dari baris komentar terakhir `watchdog.conf` (bagian F), bukan dari surel.

**Bagian C.** Langkah 14 menolak `flatline` ke host kontrol sebelum `originLinked` (langkah 13), tanpa animasi.

**Bagian F.** `watchdog.conf` mendapat satu baris: "# teardown: flatline <control_host>. the beacon stops and the schedule goes with it."

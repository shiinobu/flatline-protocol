# 04 — Lapisan web (situs alat di browser)

Status: diizinkan (DECIDED 2026-10-02). Fitur Tier 2 (JS halaman memanggil `HackhubSDK`, situs
permanen, `Popular`) belum dibuktikan di game, jadi `weblab` (bagian G) wajib lulus sebelum dipakai.
M4 sampai M7 memakai situs misi Tier 1 dan **tidak menunggu** `weblab`.

## A. Tujuan dan prinsip

Situs di dalam game dibuat sebagai layanan yang dipakai orang dan organisasi di dunia
cerita, bukan menu lore. Pemain menemukan pengenal, mencarinya, membandingkan sumber,
dan mengikuti hubungan. Prinsip dari referensi riset (DEADNET, bagian 22): pemain harus
merasa menemukan informasi yang sudah ada di dunia, bukan klue yang dibuat demi quest.

Batas: semua data, entitas, domain, dan insiden fiksi dan deterministik. Layanan
nyata hanya referensi arsitektur informasi, bukan ketergantungan.

## B. Referensi

- **honeypot.is** (dibuka 2026-10-02): pemeriksa token kripto di BSC, Ethereum, dan Base.
  Pengguna memasukkan alamat token, sistem mensimulasikan beli dan jual, hasilnya
  "honeypot" atau "aman". Ada catatan: "This is not a foolproof method. Just because
  it's not a honeypot now, does not mean it won't change!" Versi dalam game mengganti
  token dengan host atau domain dan token-aman dengan penilaian risiko.
- **DEADNET v1** (`C:\Users\Administrator\Downloads\DEADNET_Web_World_Building_System_v1.md`):
  riset ChatGPT untuk game "DEAD SIGNAL" yang memakai nama kita (Dana Reyes, Skynet) dan
  nama ilustrasi (Victor Hale, Adrian Cole). **Nama ilustrasi bukan canon.** Isinya:
  pencarian entitas, analisis domain, entity graph, arsip historis, change detector,
  indeks publik/privat/dalam, status keyakinan sumber (VERIFIED, LIKELY, PARTIAL,
  UNVERIFIED, CONFLICTING, CORRUPTED, REDACTED), web yang berubah setelah quest, incident
  database, dan cakupan V1/V2/V3. Referensi nyata di dalamnya: Wayback Machine,
  OpenCorporates, urlscan.io, Censys, SecurityTrails, ICANN Lookup, Have I Been Pwned,
  Hunter, Shodan, GDELT.

## C. Fakta engine (app.asar 1.3.13, `.reverse/extracted-1.3.13/index.js`)

Offset di tabel ini adalah posisi byte kira-kira di berkas itu; kutipan kode yang diverifikasi
dengan offset karakter yang tepat ada di `docs/app-asar-reference.md`. SDK 0.25.0 (dipakai sejak
2026-10-02, dipin eksak; sebelumnya 0.24.0 lewat `latest`) hanya menambah field `incognito` pada
`HttpRequest`, komentar `ModManifest.apiVersion`, dan nilai bawaan `apiVersion` di generator manifest
`build.mjs` (1 menjadi 2), tanpa mekanik baru (diff `index.d.ts`, `build.mjs`, dan README dibaca 2026-10-02).

| # | Fakta | Bukti | Status |
|---|---|---|---|
| 1 | Halaman dinamis menerima `params` (dari pola path), `query`, `searchStr` | `index.d.ts` `PageContext` (~146-156); engine ~20530904 | Live (PacificCare, listing M1) |
| 2 | iframe situs bersandbox `allow-scripts allow-same-origin`, tanpa `allow-forms`. Pencarian harus lewat JS, bukan `<form>` | engine ~20530904 | Terbaca di kode |
| 3 | JS halaman mendapat `HackhubSDK` (Files, Network, Http, Time, Scheduler, Events, Mail, Bank, UI, Storage, Variables, SaveStorage, SharedStorage, SharedVariables, Shell, Twotter, Kisscord, WeeChat, Random, Theme, Desktop, Menu, ContextMenu, Handbook, Localization, ModSettings). Tiap panggilan memasang konteks mod (`setCtx`). Daftar yang sama ada di jembatan situs (`Qwc`, ~20467723 dan seterusnya) dan jembatan app/widget (~20461200) | engine ~20461200-20472000 | Terbaca. Di app BACKTRACE sudah live (`src/applications/backtrace.html:696`). Di situs belum diuji |
| 4 | `HackhubSDK.Browser.navigate(url)` dan `.push(url)` ada di jembatan situs. Klik `<a href>` diarahkan ke dalam game | engine ~20467723-20472000 (jembatan situs `Qwc`) | Terbaca. Belum diuji |
| 5 | `Website.Popular = true` memasukkan situs ke daftar "Popular websites" di beranda Goagle (`https://goagle.com`) | engine ~9995464-9998999; `index.d.ts` `Website.Popular` | Terbaca. Belum diuji |
| 6 | Halaman punya `search?: string[]` (`WebsitePageDefinition`). Cara Goagle memakainya belum dibaca | `index.d.ts` ~138-145 | OPEN |
| 7 | `metadata()` tidak punya konteks mod. `SaveStorage` dan `Variables` di sana namespace lain, dan `Localization.t()` mengembalikan kunci mentah. Pola benar: tulis di konteks mod, cermin ke `SharedVariables`, baca cermin itu | `docs/bugs.md` #20, #22, #36 | RESOLVED, live 2026-10-01 |
| 8 | `Terminal.DnsHistory` hanya terpancar di multiplayer | `index.d.ts` ~1154-1160 | Tidak dipakai |
| 9 | Situs misi ditutup bila misinya tidak aktif (`gateMissionPages`). LedgerVault dan BLACKLEDGER sengaja dikecualikan | `src/websites/global/page-guards.ts`; `docs/changelog.md` 2026-10-01 | Terkode, belum live |
| 10 | Tidak ada API untuk menerbitkan artikel BCC News. Hanya event `BCC.News.Opened` yang bisa didengar | `index.d.ts` ~1389-1392, ~1535 | Tidak dipakai |

## D. Tier mekanik

| Tier | Isi |
|---|---|
| **1** (riset selesai, bug RESOLVED, live) | `nmap -sV`, `lynx`, `nslookup`, `whois`, `mxlookup`, `geoip`, `dirhunter`, `subfinder` (workaround #18), `nuclei`; `ssh` ke `Device` (#5, #17); panel pfSense dan TP-Link `Network.PortChanges` (#31); `hydra` (#25); `sqlmap` (#12); `openssl`; skrip `python3`; Metasploit `exploit` biasa (#29); IRC WeeChat (#7); persona Twotter; mail laporan dengan balasan "belum waktunya"; situs dinamis dengan cermin `SharedVariables` (#36); BACKTRACE; kit rival-hacker di `src/debug/` (live 2026-10-01 sebagai prototipe) |
| **2** (ada di SDK/asar, belum dipakai misi atau belum live) | JS halaman situs memanggil `HackhubSDK` (butir C3 dan C4), `Popular` (C5), Kisscord (DM NPC), event `Twotter.Post/PostSeen/ProfileSeen`, `Bank.Transfer`, `Terminal.Ping/Dig/Ifconfig`, `Time`, `RegisterPhoneApp`, `Database.DataUpdate`, `Files.Open/Deleted`, `Network.UserActivity`. Wajib lab dan live test dulu |
| **3** (jangan dipakai) | `ftp` native (#4 OPEN), Wireshark dan `Http.Intercepted` (#8, #9), `bettercap`/`fern`, `Meterpreter.Download`, reverse-TCP (dibuang), `Quest.Rewards` untuk uang, `Terminal.DnsHistory` (multiplayer), Suspicion dan Netrun bawaan (tidak terjangkau SDK), modul Metasploit baru (katalog tertutup) |

## E. Katalog situs (nama dan pemakaian M5-M7 DECIDED; Claims tracker dan Hackhub feed OPEN)

| Situs | Meniru | Isi (sumber canon) | Dipakai |
|---|---|---|---|
| **HoneyCheck** | honeypot.is | Penilaian risiko host/domain: "kemungkinan honeypot", "belum terverifikasi", "bersih", plus catatan "tidak pasti". Host M7: Null-Crown, Ash-Vector, C2 (`honeycheck.net`). Penilaiannya sengaja bisa salah (`11-spec-m7.md` bagian F) | M7 |
| **Registry** (Port Calder Companies Registry) | OpenCorporates | Skynet Import-Export Co., SKN Capital Nominees, direktur nominee (Alexander Voss, Imogen Hartley), agen terdaftar (Marlowe & Pryce), Nordhaven Mutual Assurance dan riwayat jabatan Vivien Orchid | M6 |
| **Archive** (Echoline) | Wayback Machine | Snapshot situs PacificCare 2025 dan 2026 (halaman staf IT), Skynet 2024 dan 2026, BLACKLEDGER. Perubahan antar snapshot adalah petunjuknya | M5, M6 |
| **Domain index** (HostTrail) | SecurityTrails, urlscan.io | Riwayat domain dan host: `x7xsentry9.tech`, `tr4c3404.dev`, `skynet-importexport.biz`, titik akhir `203.0.113.160` | M6 |
| **Breach lookup** (LeakIndex) | Have I Been Pwned | Rekaman breach lama dengan hash MD5 asli (termasuk milik Greta) dan rekaman umpan | M5 |
| **Claims tracker** | Pelacak ransomware | Klaim BLACKLEDGER (H14), korban lain (H13), "the next one" (H3) | belum dipakai misi mana pun (OPEN) |
| **Hackhub feed** | Hackhub | Postingan dengan komentar NPC (`QuestHackhubPostDefinition`; M1 sudah memakainya) | Belum dipakai spesifikasi M4-M7 (OPEN) |

Setiap situs memakai desain visual sendiri (identitas layanan berbeda), bukan satu
templat. Plugin frontend-design dipakai saat membangun, setelah diskusi selesai.

**Baseline (DECIDED 2026-10-02).** Di M5 dan M6 semua situs di atas adalah situs misi
(`websites/m05/`, `websites/m06/`, dibungkus `gateMissionPages`): halaman statis ber-link plus
JS di dalam halaman (pola ClearEscrow dan LedgerVault). Situs alat permanen dan fitur Tier 2
menyusul setelah `weblab` lulus, supaya cerita tidak bergantung pada teknologi yang belum
terbukti. Rincian: `08-spec-m5-m6.md`.

## F. Pembaca keadaan dunia (DESAIN)

- **Sumber.** `SaveStorage` kunci `backtrace` (status dan fakta tiap misi,
  `src/applications/backtrace-state.ts`). Harus diperluas ke M1-M7 saat implementasi.
- **Dua jalur baca.** (a) JS halaman membaca `HackhubSDK.SaveStorage` seperti
  `backtrace.html:696`. (b) `metadata()` membaca cermin `SharedVariables` yang ditulis di
  konteks mod (#36).
- **Visibilitas.** Informasi baru terbuka per langkah, bukan saat dunia dibangun
  (`docs/bugs.md` #38).
- **Konsekuensi retroaktif.** Status `complete` M1-M3 mengubah catatan publik tanpa
  mengedit M1-M3 (Skynet "dissolved", Reyes "no longer listed").
- **Situs misi vs situs alat.** Situs misi lewat `gateMissionPages`. Situs alat bersifat
  permanen, mengikuti preseden LedgerVault dan BLACKLEDGER. OPEN: kapan tiap situs alat terbuka.

## G. Rencana `weblab` (DECIDED boleh; `src/debug/` bebas EKSEKUSI)

Butir yang harus lulus, dicatat di log `[FP][WEBLAB]`:

1. Halaman dinamis `/search?q=` merender hasil dari `query.q`.
2. JS halaman memakai `HackhubSDK.Browser.navigate` dan `.push` tanpa `<form>`.
3. JS halaman membaca `HackhubSDK.SaveStorage.get("backtrace")` dan hasilnya sama dengan
   yang dibaca app BACKTRACE.
4. JS halaman memancarkan event lewat `HackhubSDK.Events.emit` dan listener mod menerimanya.
5. `Popular = true` muncul di daftar Goagle. Perilaku pencarian Goagle terhadap `search` dicatat.
6. `Network.getSubnet(ip)` dari JS halaman berjalan atau tidak (untuk HoneyCheck dengan
   data host nyata). Bila tidak, HoneyCheck memakai fixture deterministik.
7. Teks lokal en dan zh lewat cache (#22).

Temuan masuk `docs/bugs.md` sebagai entri baru. Bila butir 3 atau 4 gagal, cadangannya
Tier 1: dataset di HTML, `metadata()`, dan cermin `SharedVariables`.

## H. Risiko

- Beban konten: tiap situs = data, HTML, dan teks en dan zh.
- Cakupan DEADNET dipotong ke V1 untuk kita: pencarian, catatan orang dan perusahaan dan
  domain, silang-rujuk, arsip, keyakinan sumber, visibilitas berdasarkan flag. Entity graph,
  change detector penuh, dan incident database ditunda. M6 butuh deteksi perubahan sederhana.
- Tanpa `allow-forms`, semua input lewat JS.
- Situs alat yang permanen tidak boleh membocorkan langkah berikutnya sebelum waktunya.

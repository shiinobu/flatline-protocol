# World Building — FLATLINE PROTOCOL

Dibuat: 2026-10-02. Status: **desain M4 sampai M7 final, implementasi belum dimulai.** Belum ada satu
pun yang masuk kode. Semua nama, tempat, situs, dan orang di sini fiktif dan berjalan di
simulasi HackHub. Dokumen ini membahas desain cerita dan mekanik (event,
gating, bentuk data), bukan cara serangan dunia nyata.

Folder ini adalah lapisan desain di atas `docs/story.md`. Keputusan di folder ini tidak
disinkronkan ke `story.md` sampai M1-M3 dikunci; sesudah itu isinya disinkronkan dari sini.

## Label

| Label | Artinya |
|---|---|
| DECIDED | Keputusan pemilik proyek, dengan tanggal |
| PROPOSAL | Usulan, belum diputuskan |
| OPEN | Pertanyaan terbuka |
| INFERENSI | Kesimpulan dari bukti, bukan fakta tertulis |

Setiap klaim tentang kode atau engine memuat rujukan `file:baris` atau
`app.asar` (build 1.3.13, identik dengan `.reverse/extracted-1.3.13`). Kutipan engine yang
diverifikasi, lengkap dengan offset karakter, ada di `docs/app-asar-reference.md` (folder `.reverse/`
tidak ikut repo).

## Log keputusan

| # | Keputusan | Status |
|---|---|---|
| 1 | Ide reverse-TCP / callback d.reyes (`docs/idea.md` bagian 2) dibuang, bukan ditunda | DECIDED 2026-10-02 |
| 2 | Fokus ke world building. Mekanik baru hanya dari fitur yang sudah diriset dan bug-nya RESOLVED, dicek ke `app.asar` 1.3.13 | DECIDED 2026-10-02 |
| 3 | M1-M3 dikunci LIVE dan FINAL **setelah** "anggaran hook". Anggarannya kemudian ditetapkan nol edit (#31) | DECIDED 2026-10-02 |
| 4 | Tiga misi baru (M4-M6). Finale (M4 lama) menjadi M7 | DECIDED 2026-10-02 |
| 5 | Benang cover-up rumah sakit dihidupkan. Architect boleh diganti namanya | DECIDED 2026-10-02 |
| 6 | "G" di `found_note.txt` adalah **G1**: staf IT rumah sakit yang penasaran dengan kode proyek di memo pada USB, lalu mencolokkannya | DECIDED 2026-10-02 |
| 7 | Custodian **tetap kosong**: tanpa identitas, bukan G | DECIDED 2026-10-02 |
| 8 | Architect bernama **Conrad Lindqvist** (nama lama: Damien Okoro) | DECIDED 2026-10-02 |
| 9 | Situs alat di browser (gaya honeypot.is, referensi DEADNET) diizinkan. Situs permanen dan fitur Tier 2 dibuktikan dulu lewat `weblab` di `src/debug/` (lihat #16) | DECIDED 2026-10-02 |
| 10 | Profil Conrad Lindqvist: mantan aktuaris atau perwira risiko di sisi asuransi (rincian di `11-spec-m7.md` bagian I) | DECIDED 2026-10-02 (diterima lewat EKSEKUSI) |
| 11 | Judul kerja M4 "Burn Notice", M5 "The Door", M6 "Open Register" | PROPOSAL |
| 12 | G bernama **Greta de Souza** (perempuan). Hidup, dipecat, dijadikan penyebab resmi dalam laporan insiden, dan tak terjangkau di M5 | DECIDED 2026-10-02 |
| 13 | Pemain hanya mengenal Greta lewat dokumen selama M5. Setelah M7 ada satu surat epilog searah (ending C tanpa surat). Percakapan dua arah (`replyable`) ditunda: Tier 2, lab dulu | DECIDED 2026-10-02 |
| 14 | Tokoh rumah sakit: **Vivien Orchid**, CRO PacificCare, pernah di sisi asuransi (Nordhaven Mutual Assurance, asuransi fiktif di puncak rantai pemilikan SKN Capital Nominees). Memutuskan membayar dan menyebut Greta penyebab agar klaim asuransi tetap berlaku. Pembayaran lewat negosiator yang ditunjuk asuransi | DECIDED 2026-10-02 |
| 15 | Misi baru ditulis sebagai lembar spesifikasi sebelum kode (`07-arsitektur-misi-baru.md`) | DECIDED 2026-10-02 |
| 16 | Situs M5 dan M6 adalah **situs misi** (baseline Tier 1). Situs permanen dan fitur Tier 2 menyusul setelah `weblab` | DECIDED 2026-10-02 |
| 17 | M5 Very Hard berlapis: OSINT dan arsip (page layer), kredensial yang harus di-crack, Firewall tersembunyi lalu SSH (network layer) | DECIDED 2026-10-02 (bentuk; rincian di `08-spec-m5-m6.md`) |
| 18 | M6 Very Hard tanpa jaringan: page layer, halaman tersembunyi, rekaman bertentangan, gerbang CLI | DECIDED 2026-10-02 (bentuk) |
| 19 | Umpan diterima: staf G kedua (Gareth Lim) dan dua versi pernyataan. Vivien Orchid perempuan (nama depan diganti dari Lindy) | DECIDED 2026-10-02 |
| 20 | Konten final M5 dan M6 (nama situs, asuransi, negosiator, rantai pemilikan, tanggal, beat dokumen, laporan, kunci BACKTRACE): `09-konten-m5-m6.md` | DECIDED 2026-10-02 |
| 21 | Firewall M5 hanya punya satu pengguna valid (`PFSense.Login` hanya membawa `{ip}` dan hanya terpancar saat sukses). Archive menjadi satu situs global yang dipakai M5 dan M6 | DECIDED 2026-10-02 |
| 22 | Baris Operating Theatre 3 dibuat oblique di memo keputusan. Bonus Bedside-17 dipertahankan di luar rantai. Profil aktuaris Conrad diterima | DECIDED 2026-10-02 |
| 23 | Jalur M6 tanpa jaringan diuji paling awal lewat kerangka jalan (harness SDK tiruan, lalu live). `john` tanpa lab. Persona Twotter terlihat sejak awal: diterima | DECIDED 2026-10-02 |
| 24 | Spesifikasi dan konten M4 "Burn Notice": `10-spec-m4.md` (15 langkah, empat Router, kit rival-hacker berskrip) | DECIDED 2026-10-02 |
| 25 | Aplikasi Sentinel DITAHAN (ongoing), di luar M4 sekarang | DECIDED 2026-10-02 |
| 26 | Hukuman uang dibatasi saldo (serangan 1 sekitar $300, honeypot sekitar $500), stempel waktu log tetap, honeypot Paper-Moth, host kontrol Night-Shift bertetangga dengan `203.0.113.160` (registrant Bulletproof VPN Ltd.) | DECIDED 2026-10-02 (diterima lewat EKSEKUSI) |
| 27 | Spesifikasi dan konten M7 "The Architect": `11-spec-m7.md` (12 langkah, rute RDP, HoneyCheck yang bisa salah, pelacakan waktu nyata, sepuluh cacat M4 lama diperbaiki) | DECIDED 2026-10-02 |
| 28 | Dialog telepon dibuang: pertanyaan akhir lewat surel Custodian dan jawaban lewat kolom `choice`. Efek ending nyata: `expose`/`handoff` melepas bukti dan Greta mengirim surat, `destroy` menghancurkan C2 tanpa surat | DECIDED 2026-10-02 |
| 29 | Conrad Lindqvist 59 tahun (lahir 1967), aktuaris yang memberi harga pada risiko yang ia ciptakan. Berkas diganti nama `master_ledger_backup.enc` dengan `manifest.txt` yang bisa dibaca | DECIDED 2026-10-02 |
| 30 | Hadiah finale 5000 uang, dibayar lewat `Bank.transaction` (bagian "200 xp" dibatalkan oleh #34) | DECIDED 2026-10-02 |
| 31 | Anggaran hook: **nol edit** di M1-M3. Audit M4 sampai M7 terhadap teks M1-M3 menunjukkan semua ketergantungan sudah ada (`01-canon-dan-hook.md` bagian E) | DECIDED 2026-10-02 |
| 32 | Registrant `whois` disamakan dengan M3: **Bulletproof VPN Ltd.** (contact `whois` titik akhir `203.0.113.160` di M3) dipakai untuk host kontrol M4 dan domain asuransi M6. "SKN-CENTRAL" tetap label peer M3 dan domain `skn-central.net`. Nama "SKN-CENTRAL Services Ltd" dibuang | DECIDED 2026-10-02 |
| 33 | Prosa en dan zh, alamat IP, password, penyesuaian angka, nasib lab debug dan `*.original.ts`, dan hal lain di `06-pertanyaan.md` | OPEN |
| 34 | Hadiah semua misi baru hanya uang, XP dilewati. Uang dibayar lewat `Bank.transaction` di `OnComplete`, `Rewards` quest tidak diisi, pembayaran dilewati saat dev/tester focus. Menggantikan bagian "200 xp" dari #30 dan nilai xp di `10-spec-m4.md` bagian A | DECIDED 2026-10-02 |
| 35 | Implementasi memakai SDK `@hotbunny/hackhub-content-sdk` 0.25.0, dipin eksak di `package.json` dan `package-lock.json` (sebelumnya 0.24.0 lewat `latest`). Selisihnya: field `incognito` pada `HttpRequest`, komentar `ModManifest.apiVersion`, nilai bawaan `apiVersion` di `build.mjs`. `tsc` lolos di 0.25.0 | DECIDED 2026-10-02 |
| 36 | Tanggal di nama dan isi berkas SSH, Meterpreter, dan evidence M1-M7 mengikuti timeline cerita di `13-story-timeline.md`, bukan jam game atau jam nyata. M1-M3 tidak diedit (anomali hanya dilaporkan). Hari-cerita M2-M7 di bagian C berstatus PROPOSAL (`06-pertanyaan.md` T-d) | DECIDED 2026-10-02 (aturan); PROPOSAL (hari-cerita) |
| 37 | Implementasi M4-M7 dikerjakan agen cloud dalam satu run untuk fase 2-8 berurutan (permintaan pemilik 2026-10-02), bukan satu fase per run. Tiap fase adalah checkpoint: baseline, diff guard, harness, dokumen uji, changelog, commit, dan push. Live test dan review penuh dilakukan pemilik sesudah run. Untuk run ini live test per fase pada "Batasan urutan implementasi" #3 dan #4 dilewati, sehingga fase 4 dibangun di atas event yang belum diuji live dan agen mendaftarkannya sebagai UNVERIFIED. Urutan fase tidak berubah, hanya batas run | DECIDED 2026-10-02 |
| 38 | Penunjuk ke situs dan alat misi berupa **teks di dalam dunia**, bukan pencarian Goagle: halaman mod default `seo:false` sehingga tidak ada situs mod yang bisa dicari, dan `Popular`/`search` tetap Tier 2 (`docs/bugs.md` #52). Dipakai: dua surel susulan Custodian di M5 (saat `vaultRevisited` dan `edgeMapped`), satu di M6 (saat `snapshotsCompared`; menyebut HostTrail dan portal asuransi, jadi nama asuransi terbuka satu langkah lebih awal dari rancangan fase 7), baris akses jarak jauh di snapshot Echoline, kolom Customer portal di rekaman Mutual, tip M7 yang menyebut HoneyCheck, dan manifest M7 yang menyebut `attrcheck`. Surel susulan satu arah dari saluran yang sama, tanpa konfirmasi penerimaan. "I won't check in" (`01` bagian C) ditafsirkan sebagai tidak menanyakan kabar, bukan larangan memberi petunjuk, seperti tip M2. Pemilik menegaskan 2026-10-02 bahwa tambahan yang memberi bobot cerita boleh selama tidak bertentangan dengan world building | DECIDED 2026-10-02 (diterima lewat EKSEKUSI) |
| 39 | Laporan M4-M7: templat membiarkan token kolom terbuka (pola M3; `reportFacts()` hanya untuk badan freehand), validator mencocokkan kata kunci dan angka dalam en dan zh dan tetap menolak umpan (Gareth, alat vendor, Voss, Paper-Moth, IP kontrol yang salah). Nilai yang benar tetap seperti `08` B7 dan `09` B7/C3. Laporan yang ditolak tidak dibalas | DECIDED 2026-10-02 (diterima lewat EKSEKUSI) |
| 40 | Tangga hadiah uang: M4 **2400**, M5 **3200**, M6 **4000**, M7 5000 (#30). Menggantikan 800 di `10` bagian A serta 1200 dan 1800 di catatan implementasi `08` (fase 6 dan 7). Pembayaran tetap lewat `Bank.transaction` (#34) | DECIDED 2026-10-02 (diterima lewat EKSEKUSI) |
| 41 | Ending M7 (menegaskan #28): log BACKTRACE dan surat Greta ditulis saat laporan diterima, **sebelum** `completeObjective`. Hanya `destroy` menghancurkan jaringan C2 (satu `unregister` setelah berkas ledger dihapus); `expose` dan `handoff` membiarkan C2 hidup. Laporan M7 hanya lewat templat, tanpa badan freehand, karena `choice` tidak bisa dikodekan di badan | DECIDED 2026-10-02 (diterima lewat EKSEKUSI) |

## Isi folder

| Berkas | Isi |
|---|---|
| `01-canon-dan-hook.md` | Canon sekarang vs `story.md`, benang tertanam di M1-M3, pagar teks terkunci, diagnosis, anggaran hook |
| `02-peta-misi.md` | Busur M1-M7: fungsi, kaitan hook, mekanik, situs, biaya penomoran |
| `03-karakter.md` | Tokoh canon dan tokoh baru |
| `04-web-layer.md` | Situs alat di browser: fakta engine, tier mekanik, katalog situs, rencana `weblab` |
| `05-ending.md` | Matriks ending A/B/C |
| `06-pertanyaan.md` | Pertanyaan terbuka |
| `07-arsitektur-misi-baru.md` | Penyebab redesign M1-M3 sebagai aturan, peta berkas, perubahan global, templat lembar spesifikasi, definisi selesai |
| `08-spec-m5-m6.md` | Lembar spesifikasi M5 dan M6: rantai gerbang, topologi, risiko |
| `09-konten-m5-m6.md` | Konten final M5 dan M6: nama, rantai pemilikan, tanggal, beat dokumen, laporan, kunci BACKTRACE, rencana uji |
| `10-spec-m4.md` | Spesifikasi dan konten final M4: kit berskrip, 15 langkah, empat Router, konten, risiko |
| `11-spec-m7.md` | Spesifikasi dan konten final M7: perbaikan M4 lama, 12 langkah, HoneyCheck, pelacakan, efek ending |
| `12-implementation-prompt.md` | Prompt implementasi untuk agen cloud (English): peta fase, urutan baca, batas penyuntingan, skill `frontend-design` untuk situs, hadiah hanya uang |
| `13-story-timeline.md` | Timeline cerita M1-M7: tanggal tetap dari kode dan spesifikasi, hari-cerita per misi (usulan), format tanggal berkas, anomali tanggal M1-M3 |

## Aturan main yang berlaku di semua dokumen ini

- Setiap tulis di luar `src/debug/` menunggu kata EKSEKUSI dari pemilik proyek.
- Mekanik dipilih hanya dari **Tier 1** (lihat `04-web-layer.md`). Tier 2 butuh lab
  dan live test dulu. Tier 3 tidak dipakai.
- Semua mod singleplayer. Fitur yang hanya terpancar di multiplayer tidak dipakai.
- "Full mechanic, not full objective": satu objective per misi, rantai mekanik
  berurutan lewat `middleware/` (satu gerbang per langkah, dunia terbuka per langkah).
- Hanya M1 yang `Abandonable`. M2 dan seterusnya tidak.
- LedgerVault (`x7k2m9vdlq4wnyt3.dark`) adalah domain permanen. Tidak ada jalur
  teardown atau alur cerita yang menghapusnya.
- M1-M3 tidak disentuh: anggaran hook nol edit (DECIDED, `01-canon-dan-hook.md` bagian E).

## Batasan urutan implementasi (DECIDED)

1. Sebelum kunci M1-M3: live test `open` di sesi Meterpreter, teks ZH M1-M3 dimainkan, toggle fokus dev
   di `src/guard/flags.ts` kembali ke nilai commit, pekerjaan dirapikan dan di-commit
   (`01-canon-dan-hook.md` bagian E). Setelah kunci, `docs/story.md` disinkronkan dari folder ini.
2. M4 lama dimigrasi ke id `m07` **sebelum** M4 baru dibuat, supaya id `m04` kosong
   (`11-spec-m7.md`, `07-arsitektur-misi-baru.md` bagian C).
3. Jalur M6 tanpa jaringan (`networkIps: []`) diuji paling awal lewat kerangka jalan: harness SDK tiruan,
   lalu live (`09-konten-m5-m6.md` bagian D). Pada run fase 2-8 live test dilakukan sesudah run (#37).
4. Tiga event di sesi RDP M7 (`attrcheck` Meterpreter-aware, `Files.Transfer` pada `download`,
   pelacakan) diuji lewat kerangka jalan M7 sebelum konten lain (`11-spec-m7.md` bagian L). Pada run fase 2-8 fase 4 dibangun sebelum event ini diuji live (#37).
5. Tiap misi: lembar spesifikasi, lab untuk mekanik Tier 2 bila ada, lalu implementasi berurutan
   `content` -> `i18n` -> `controller` -> `main` -> `websites` -> perubahan global
   (`07-arsitektur-misi-baru.md` bagian F).

## Saran urutan (PROPOSAL, belum diputuskan)

Migrasi M7 (kerangka jalan lalu penuh), kerangka jalan M6, M4, M5, M6 penuh. `weblab` hanya diperlukan untuk
situs alat permanen dan fitur Tier 2, bukan prasyarat M4-M7 (keputusan #16). Urutan yang dipakai prompt
implementasi sedikit berbeda; lihat "Penyerahan implementasi".

## Penyerahan implementasi

Implementasi dikerjakan agen cloud atas permintaan pemilik proyek. Prompt-nya ada di
`12-implementation-prompt.md` (English, ditulis 2026-10-02): satu run memuat satu fase atau beberapa (baris PHASE),
dengan baris BASE dan catatan pemilik yang diisi sebelum dikirim. Fase 1 dikerjakan sebagai run sendiri (cabang
`phase1-m07-skeleton`, digabung ke `clouds-modify` lewat fast-forward 2026-10-02); fase 2-8 dijalankan sebagai satu
run (#37). Cara pakai: pilih `clouds-modify` sebagai cabang dasar
(`origin/main` tertinggal; semua perubahan dokumen dan `package*.json` harus sudah di-commit dan di-push),
isi bagian 0 prompt, kirim seluruh isi berkas sebagai pesan pertama. Run satu fase berhenti untuk live test
pemilik; hasilnya masuk ke baris "Owner notes" pada run berikutnya. Pada run beberapa fase (#37) live test dan review
penuh dilakukan pemilik sesudah run, dan temuannya dikerjakan sebagai perbaikan atau run lanjutan.

Prompt memakai SDK 0.25.0 (#35), `docs/app-asar-reference.md` sebagai pengganti `.reverse/` (agen cloud tidak
punya folder itu), `13-story-timeline.md` untuk tanggal di berkas (#36), dan hadiah hanya uang (#34).

Urutan fase di prompt (diterima lewat EKSEKUSI 2026-10-02): 1 kerangka M7, 2 kerangka M6, 3 kit rival-hacker
dan kerangka M4, 4 M7 penuh, 5 M4 penuh, 6 M5 penuh, 7 M6 penuh, 8 penutup. Dibanding saran urutan di atas,
kit M4 (fase 3) didahulukan sebelum M7 penuh (fase 4) karena M7 penuh memakai komponen kit M4, dan kerangka
M6 (fase 2) langsung menyusul kerangka M7. Situs dan permukaan visual baru dirancang dengan skill
`frontend-design`, sesuai `04-web-layer.md` bagian E.

Hadiah (#34): hadiah "200 xp" sudah dihapus dari `10-spec-m4.md` bagian A, `11-spec-m7.md` bagian A (yang
tersisa hanya nilai lama `M04_REWARDS`), dan `02-peta-misi.md`. Uang dibayar lewat `Bank.transaction` di
`OnComplete`, `Rewards` quest tidak diisi (prompt, bagian 8 D1).

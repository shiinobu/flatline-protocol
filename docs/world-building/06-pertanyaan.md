# 06 — Pertanyaan terbuka

Status: diperbarui 2026-10-02. Tandai `[x]` dan pindahkan ke log keputusan di
`README.md` saat dijawab.

## G (Greta de Souza)

- [x] **G1-a.** Status saat M5: hidup, dipecat, dijadikan penyebab resmi, tak terjangkau.
  DECIDED 2026-10-02.
- [x] **G1-b.** Nama dan jenis kelamin: Greta de Souza, perempuan. DECIDED 2026-10-02.
- [x] **G1-c.** Selama M5 pemain tidak bicara dengan Greta (dokumen saja). Setelah M7 satu
  surat epilog searah; ending C tanpa surat. Percakapan dua arah ditunda (Tier 2).
  DECIDED 2026-10-02.
- [x] **G1-d.** Cover-up: Greta dipecat dan dinamai penyebab resmi dalam laporan insiden
  (bukan ditahan). DECIDED 2026-10-02.
- [x] **G1-e.** Beat dokumen Greta (catatan, pengakuan paksa) dan surat epilog A dan B sudah
  final di `09-konten-m5-m6.md` (B5, B10). Prosa en dan zh ditulis saat implementasi.
- [ ] **G1-f.** Apakah percakapan dua arah (`replyable`) diuji di lab nanti atau dilepas.

## Rumah sakit (Vivien Orchid)

- [x] **H-a.** Tokoh pengambil keputusan: Vivien Orchid, CRO PacificCare. DECIDED 2026-10-02.
- [x] **H-b.** Hubungan ke Conrad Lindqvist lewat Nordhaven Mutual Assurance, asuransi fiktif di puncak
  rantai pemilikan SKN Capital Nominees. Vivien Orchid pernah bekerja di sana di bawah Conrad.
  DECIDED 2026-10-02 (strukturnya; rincian di H-d).
- [x] **H-c.** Pembayaran lewat negosiator yang ditunjuk asuransi (Brightwater Resolutions, H-d).
  DECIDED 2026-10-02.
- [x] **H-d.** Asuransi: Nordhaven Mutual Assurance. Negosiator: Brightwater Resolutions.
  Mekanisme keuntungan Conrad hanya latar cerita, tanpa mekanik. DECIDED 2026-10-02.
- [x] **H-e.** Baris oblique di memo keputusan: "05:12 Clinical incident logged, Operating
  Theatre 3. Escalated to Legal. Excluded from external statement." Jeda 6 jam 21 menit tampil
  di linimasa memo. DECIDED 2026-10-02.
- [x] **H-f.** Vivien Orchid perempuan. Nama depan diganti dari Lindy untuk menghindari gema
  "Lind-" dengan Lindqvist. DECIDED 2026-10-02.

## Conrad Lindqvist

- [x] **C-a.** Profil mantan aktuaris atau perwira risiko di sisi asuransi: dipakai rancangan M5
  dan M6 dan diterima lewat EKSEKUSI 2026-10-02.
- [x] **C-b.** Wajah publik: Chairman Risk Committee Nordhaven Mutual (2018-2024), mantan Chief
  Actuary (2009-2018). DECIDED 2026-10-02 (`09-konten-m5-m6.md` C1).
- [x] **C-c.** Alasan membangun BLACKLEDGER: tebusan sebagai kerugian yang bisa diprediksi bila pasokan
  dikelola. DECIDED 2026-10-02.

## Misi

- [ ] **M-a.** Judul final M4, M5, M6 (sekarang judul kerja).
- [x] **M-b.** M4: kerugian uang (dibatasi saldo) dan desktop dikunci sementara. "Menang" berarti
  pengejaran dihentikan (`repel` host kontrol). DECIDED 2026-10-02 (`10-spec-m4.md`).
- [x] **M-c.** M6 tanpa jaringan dan tanpa langkah akses. Very Hard lewat page layer dan
  analisis (`08-spec-m5-m6.md`). DECIDED 2026-10-02. Jumlah tokoh tambahan masih OPEN.
- [x] **M-d.** "The next one" (H3) dipakai sebagai satu baris "next: prepping" di `old_targets.txt`
  (M4), bukan jam berdetak. DECIDED 2026-10-02.

## Spesifikasi M5 dan M6 (`08-spec-m5-m6.md`)

- [x] **S-a.** Bonus Bedside-17 (PC-IT-017) dipertahankan di luar rantai: sticky note asli dan
  `usb_history.log`. DECIDED 2026-10-02.
- [x] **S-b.** 10 rekaman Breach lookup (satu benar, tiga umpan, enam derau). Persona Twotter
  terlihat sejak awal: diterima. DECIDED 2026-10-02.
- [x] **S-c.** Echoline Archive, LeakIndex, Port Calder Companies Registry, HostTrail.
  DECIDED 2026-10-02.
- [x] **S-d.** Beat pernyataan v1 dan final, memo keputusan, dan tiket USB final di
  `09-konten-m5-m6.md` B5. Prosa saat implementasi.

## Lapisan web

- [ ] **W-a.** Kapan situs alat terbuka: setelah misi tertentu, atau permanen sejak awal.
- [ ] **W-b.** Nama merek Claims tracker (belum dipakai misi mana pun). Archive, Breach lookup, Registry,
  Domain index final di `09-konten-m5-m6.md`, HoneyCheck (`honeycheck.net`) di `11-spec-m7.md`.
- [ ] **W-c.** HoneyCheck memakai data host nyata (`Network.getSubnet`) atau fixture. Tergantung `weblab`.

## Waktu dan teks

- [ ] **T-a.** Revisi premis jadi sekitar 5 minggu saat `docs/story.md` disinkronkan: setuju?
- [ ] **T-b.** Hubungan antara tanggal cerita (2026) dan jam game (`Time`): belum diriset.
- [ ] **T-c.** Semua teks baru butuh en dan zh (pipeline `i18n/m0N/core.ts`). Siapa yang menulis
  teks zh, dan apakah terjemahan boleh dibuat terlebih dahulu dari en.
- [ ] **T-d.** Hari-cerita M2-M7 dan tanggal turunan di `13-story-timeline.md` bagian C (usulan turunan
  dari tanggal tetap di kode M1-M3): setuju atau diganti? Anomali tanggal M1 di bagian F: dibiarkan
  atau diperbaiki lewat edit M1 yang diizinkan?

## Anggaran hook

- [x] **K-a.** Anggaran hook: nol edit di M1-M3. DECIDED 2026-10-02 (audit di
  `01-canon-dan-hook.md` bagian E).

## Spesifikasi M4 dan sisanya

- [x] **X-a.** Spesifikasi M4 "Burn Notice": `10-spec-m4.md`. DECIDED 2026-10-02.
- [x] **X-b.** Conrad Lindqvist 59 tahun (lahir 1967), aktuaris yang memberi harga pada risiko yang ia
  ciptakan sendiri (C-c). DECIDED 2026-10-02 (`11-spec-m7.md` bagian I).
- [ ] **X-c.** Aplikasi Sentinel (tabel koneksi dan tombol Block): DITAHAN, diputuskan nanti.
- [ ] **X-d.** Nasib `src/debug/rival-*` setelah kit dimigrasi (tetap sebagai lab atau dihapus).
- [x] **X-e.** Nasib `*.original.ts` M4 lama setelah migrasi ke M7: ARCHIVED 2026-10-03. Semua berkas `.original`
  dipindah ke `src/archive/`, tidak dihapus (README #48).
- [ ] **X-f.** Apakah HoneyCheck dipakai juga di M4 (hop relay) selain M7.

## Ending

- [x] **E-a.** Matriks konsekuensi di `05-ending.md` bagian B diterima sebagai dasar efek ending
  M7 (EKSEKUSI 2026-10-02, `11-spec-m7.md` bagian H).
- [ ] **E-b.** Bentuk epilog Reyes dan apakah ia muncul langsung di finale. Greta hanya
  lewat surat epilog (G1-c).

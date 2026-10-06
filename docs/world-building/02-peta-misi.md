# 02 — Peta misi M1-M7

Status: M1-M3 LIVE. M4-M6: bentuk dan konten DECIDED (judul kerja, rinci di `08` sampai `10`).
M7: spesifikasi v2 (`11-spec-m7.md`, 2026-10-06; v1 migrasi M4 lama di `11-spec-m7.v1.md`). Prosa en dan zh dikerjakan saat
implementasi.

## A. Tulang punggung tema (PROPOSAL)

- Semua orang di rantai punya alasan, dan kejahatan ini sebuah pembukuan.
- Pemain bergerak dari "ingin nama untuk dibenci", ke "melihat sistem yang berisi
  orang biasa", ke "memilih cara menutup buku".
- Tiga ending adalah tiga cara menutup buku: publik, hukum, atau diri sendiri (`05-ending.md`).
- Dasar di teks yang sudah ada: bahasa pembukuan BLACKLEDGER (`01-canon-dan-hook.md`
  A5, H14), Reyes (H7) dan keluarga pengembang (H12) sebagai orang yang terseret.

## B. Busur

| # | Judul | Fungsi naratif | Mode utama | Status |
|---|---|---|---|---|
| M1 | First Trace | Pengait, duka, broker | Investigasi dan penerobosan | LIVE. Dikunci sesudah syarat kunci (anggaran hook nol edit) |
| M2 | The Maker | Pengembang yang manusiawi, jejak uang | Investigasi dan penerobosan | LIVE. Idem |
| M3 | Money Trail | Pencucian uang, Nominees, Reyes | Investigasi dan pivot jaringan | LIVE. Idem |
| M4 | Burn Notice (kerja) | Titik balik: pemain diburu | Bertahan dan lacak balik | DECIDED (judul kerja) |
| M5 | The Door (kerja) | Asal-usul serangan, cover-up, G | Analisis arsip dan satu penerobosan | DECIDED (judul kerja) |
| M6 | Open Register (kerja) | Identitas Conrad Lindqvist terbukti lewat silang-rujuk | Analisis di browser | DECIDED (judul kerja) |
| M7 | The Architect | Finale, pilihan A/B/C | Penerobosan dan keputusan | DECIDED (spesifikasi v2, 2026-10-06) |

## C. Aturan lintas misi

1. **Cerita utuh bila berhenti di mana saja.** Setiap misi baru harus bisa langsung
   tersambung ke M7. Petunjuk identitas minimum ada di M4. M5 dan M6 memperdalam.
2. Satu objective per misi. Gerbang berurutan lewat `content/<misi>/gates.ts` dan
   `middleware/gate.ts`. Dunia terbuka per langkah (`docs/bugs.md` #38).
3. Bukan `Abandonable` (hanya M1). Mulai ulang lewat `mods.reset`.
4. Mekanik tidak boleh hanya lewat terminal: pasangkan dengan lapisan visual
   (widget, app, tema, situs). Preferensi pemilik proyek, 2026-10-01.
5. Laporan ke Custodian per misi, dengan balasan "belum waktunya" bila terlalu awal
   (pola M1-M3).
6. Satu kartu BACKTRACE per misi baru.

## D. Misi baru

### M4 "Burn Notice" (bentuk dan konten DECIDED: pemain diburu)

- **Fungsi.** Balik arah. Penjahat membalas dan pemain menjadi buruan.
- **Pemicu.** Surel pertama Custodian yang tidak diminta, setelah laporan M3 (H1).
- **Kaitan.** H1, H2 (audit M3), H3 ("no loose ends" tampil sebagai satu baris di `old_targets.txt`),
  H11 (suara watchdog).
- **Tiga babak.** (1) Bertahan di mesin sendiri: banner, log firewall, `repel`. (2) Desktop dibobol,
  puzzle pemulihan dengan log insiden. (3) Lacak balik: relay Static-Hop dan Quiet-Mirror (`hydra`
  dengan wordlist, SSH, mencocokkan stempel waktu), host kontrol Night-Shift, `repel` mengakhiri
  pengejaran.
- **Rantai.** 15 langkah transitif (`10-spec-m4.md` bagian C). Kit rival-hacker dipakai dengan serangan
  berskrip, bukan acak.
- **Hasil.** Suara musuh pertama (`watchdog@architect-c2.dark`) dan petunjuk identitas pertama:
  host kontrol terdaftar atas Bulletproof VPN Ltd., registrant yang sama dengan titik akhir `203.0.113.160`.
- **Batas.** LedgerVault tidak boleh dihapus, jadi bukti M1 tetap terjangkau. `Quest.Rewards` tidak
  membayar uang (bayar lewat kode). Sistem Suspicion dan Netrun bawaan game tidak terjangkau SDK
  (`.reverse/notes-*.md`). Aplikasi Sentinel ditahan.
- **OPEN.** Prosa en dan zh, angka, nasib lab debug (`06-pertanyaan.md`).

### M5 "The Door" (bentuk dan konten DECIDED: Very Hard berlapis)

- **Fungsi.** Asal-usul serangan, wajah manusia, cover-up.
- **Pemicu.** Tip Custodian "kembali ke vault" (pola tip M2, `01-canon-dan-hook.md` bagian C).
- **Kaitan.** H4 (G) dan H9 (pernyataan publik). H3 muncul di M4 (`old_targets.txt`: "pacificcare/it:
  closed"), H7 dan H13 di M7 (`manifest.txt`).
- **Tiga lapis kesulitan.** (1) Page layer: arsip situs PacificCare 2025 dan 2026, persona
  Twotter Roxanne dan Gideon (umpan), situs Breach lookup. (2) Crack: hash rekaman breach yang
  benar harus dipecahkan dengan `john` (#13). (3) Network layer: Firewall tersembunyi
  (`net_tree.py`), login pfSense lalu pencabutan aturan, SSH ke Cold-Chart (arsip IR).
  Bonus di luar rantai: Bedside-17 (PC-IT-017) lewat Metasploit.
- **Rantai.** 14 langkah transitif, semua Tier 1 (`08-spec-m5-m6.md` bagian B). Pemain tidak
  bicara dengan Roxanne (DECIDED).
- **Cover-up.** Rumah sakit membayar diam-diam (H9). Vivien Orchid (CRO) menandatangani
  temuan yang menyebut Roxanne penyebab, karena label "kelalaian staf" menjaga klaim asuransi
  tetap berlaku. Roxanne dipecat dan dijadikan penyebab resmi supaya penyelidikan cepat
  ditutup. Jeda 6 jam 21 menit antara kunci dan bayar tampil di memo keputusan.
- **Hasil.** Ending B punya alasan mencurigai jalur resmi. Vivien Orchid terhubung ke rantai
  Conrad Lindqvist lewat Nordhaven Mutual Assurance, asuransi fiktif di puncak rantai pemilikan SKN Capital Nominees
  (`09-konten-m5-m6.md` C1).
- **OPEN.** Prosa en dan zh dokumen. Nama, tanggal, dan beat final: `09-konten-m5-m6.md`.

### M6 "Open Register" (bentuk dan konten DECIDED: Very Hard tanpa jaringan)

- **Fungsi.** Identitas Conrad Lindqvist terbukti lewat silang-rujuk. Misi analisis di page
  layer, bukan rantai eksploit.
- **Pemicu.** Tip Custodian atau hasil M5.
- **Kaitan.** H6, H8 ("Nominees ... someone real still owns it").
- **Tautan rumah sakit.** Registry memuat Nordhaven Mutual Assurance dan riwayat jabatan
  Vivien Orchid. Silang-rujuk dari sana menuju Conrad Lindqvist.
- **Kesulitan.** Halaman tersembunyi hanya terjangkau lewat `dirhunter`, rekaman yang saling
  bertentangan dibedakan lewat tanggal, direktur nominee "berwajah" sebagai umpan, dua gerbang
  `whois` yang menautkan domain ke infrastruktur M3. Konsekuensi M1-M3 tampil lewat status
  BACKTRACE (M3 selesai: Skynet "dissolved", Reyes "no longer listed").
- **Rantai.** 10 langkah transitif, semua Tier 1, `networkIps: []` (`08-spec-m5-m6.md` bagian C).
- **Hasil.** Reveal di M7 menjadi konfirmasi, bukan pemberian nama.
- **OPEN.** Prosa en dan zh. Nama dan rantai pemilikan final: `09-konten-m5-m6.md`.

### M7 "The Architect" (spesifikasi v2, 2026-10-06; judul tetap)

- **Fungsi.** Finale. Menjawab semua benang terbuka M1-M6 dengan dokumen milik Conrad sendiri, lalu pilihan A/B/C (`05-ending.md`). Spesifikasi di `11-spec-m7.md` (v1 lama di `11-spec-m7.v1.md`).
- **Gagasan pengunci.** Asuransi memasang cadangan klaim sebelum kejadian: FIN-EU-2214 (2026-06-18) dan MED-APAC-6689 (2026-07-14), sama dengan baris ledger broker M1. Itu menjawab "next: prepping" dan "Q3 closes: 4".
- **Rantai.** 23 langkah transitif dalam enam bagian: cocokkan klaim di portal asuransi (halaman), peta dan tembus tepi (jaringan), host indeks di bawah Duel 1, segel Cipher (di rumah), komputer pribadi Conrad lewat RDC di bawah Duel 2, laporan dengan `choice`.
- **Lawan.** Conrad adalah `SENTRY`, operator yang menyetujui rilis 2026-08-14 02:11 UTC dan menyerang pemain di M4.
- **Mekanik.** Hanya yang sudah dialami pemain di M1-M6. Dibuang: HoneyCheck, `attrcheck`. Tidak dipakai: Playfair (hanya M6).
- **Efek ending nyata.** `expose` dan `handoff` melepas bukti; `destroy` menghancurkan jaringan C2. Penutup lengkap per ending (Roxanne, Reyes, TR4C3404, Orchid, dua korban berikutnya, OT3).
- **Hadiah.** Sementara 5000 uang (`Bank.transaction`), disesuaikan di akhir.
- **Prasyarat.** `questGate("m07", ["flatline.m06"])`.
- **OPEN.** D9 (pemutusan dini Duel 2), D11 (hadiah), D12 (urutan membangun); prosa en dan zh dan nilai konkret yang berstatus PROPOSAL di spesifikasi.

## E. Biaya penomoran (diverifikasi 2026-10-02)

- `main/m04.ts:217`: `questGate("m04", ["flatline.m03"])`. `questGate` sendiri di `src/guard/flags.ts:49`.
- `manifest.json`: deskripsi "across four missions".
- `src/applications/backtrace-facts.ts:41`: `m4: []`. Tipe `BacktraceMissionId = "m1" | "m2" | "m3" | "m4"` di `backtrace-state.ts:8`, status awal di `:25`, dan tata letak `backtrace.html`.
- Konstanta `M04_*` dan semua dokumen yang menyebut "4 missions".
- Setiap misi baru setara satu migrasi pipeline. M2 dan M3 masing-masing dimigrasi
  dan dites live dalam satu hari (`docs/changelog.md` 2026-10-01).

## F. Presedan di game dasar

`docs/basegame-reference/tjs-the-journalists-sister.md`: busur 13 bagian dengan finale
bercabang (Bagian 13: cabang "cover-up" dan cabang "justice"). Busur tujuh misi bukan
anomali. Twist pemberi misi sebagai pihak terlibat (Bagian 12) **tidak** dipakai di sini,
karena Custodian dibiarkan kosong (DECIDED).

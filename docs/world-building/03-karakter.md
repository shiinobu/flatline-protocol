# 03 — Karakter

Status: tokoh canon diverifikasi dari sumber (2026-10-02). Tokoh baru berlabel.
Jenis kelamin Conrad Lindqvist dan tokoh pendukung baru (Gareth Lim, Alexander Voss, Imogen
Hartley) belum ditentukan. Dokumen ini menulis mereka tanpa kata ganti gender.

## A. Canon

| Tokoh | Fakta | Sumber |
|---|---|---|
| **GHOSTWIRE** (pemain) | Hacktivist independen, tanpa majikan dan tanpa klien | `docs/story.md:44` |
| **Adik pemain** | Meninggal saat operasi ketika ransomware mengunci sistem rumah sakit, 14 Agu 2026 ("Same day my sibling never came out of surgery"). Tidak punya nama di teks mana pun | `i18n/m02/core.ts:102-103`; grep `src/` 2026-10-02 |
| **The Custodian** | Kanal laporan tunggal (`drop@drop.null`). **Kosong, tanpa identitas (DECIDED)**. Aturannya terkunci (`01-canon-dan-hook.md` bagian C) | `content/global/characters.ts`; `i18n/m01/core.ts:90-94` |
| **Unknown Sender** | Pengirim tip M1 saja (`ghost.tip@ghost.index`) | `content/global/characters.ts`; `controller/m01/recon.ts:19` |
| **X7xS3NTRY9** | Broker akses awal. Infrastruktur sendiri di `x7xsentry9.tech`. Menerima 5% ("customs brokerage") | `docs/story.md:119-124`; `content/global/finance.ts` |
| **TR4C3#404 / TR4C3404** | Pengembang toolkit dan admin panel afiliasi. Menerima 25% ("consulting fees"). Sisi manusia: daftar belanja, pesan tak terkirim ("tell mom I said hi") | `i18n/m02/core.ts:138-147`; `content/global/finance.ts` |
| **Closer-Rig** (`Qu0taCl0ser`) | Operator afiliasi "FIN-NA". Laporan kuota: 4 penutupan kuartal ini | `i18n/m02/core.ts:148-171` |
| **Dana Reyes** (`@d.reyes`) | Analis keuangan Skynet, perempuan (`docs/scratch.md:1443`). Host Faded-Ledger. Catatan `do_not_open_at_work` | `content/m03/network.ts:33-35`; `i18n/m03/core.ts:154-163` |
| **Marcus Okafor** (`@m.okafor`) | Fasilitas Skynet, laki-laki (`docs/scratch.md:1443`). Umpan merah: memamerkan akses yang tidak dimilikinya | `content/m03/network.ts:50`; `i18n/m03/core.ts:198-203` |
| **Skynet Import-Export Co.** | Perusahaan cangkang. Menyimpan 10% | `content/global/entities.ts`; `content/global/finance.ts` |
| **SKN Capital Nominees** | Entitas induk. Menerima 60% ("management fee") | `content/global/entities.ts`; `content/global/finance.ts` |
| **PacificCare Health** | Rumah sakit regional SEA (`pacificcare-health.org`). Kasus `CASE-A7X-0417` | `content/m01/network.ts`; `content/global/case.ts` |
| **BLACKLEDGER** | Sindikat ransomware-as-a-service. Situs `blkledger.dark` | `content/global/blackledger.ts` |

## B. Tokoh baru dan keputusan karakter

### G: Greta de Souza (G1, DECIDED 2026-10-02)

- **Siapa.** Greta de Souza, perempuan, staf IT PacificCare Health. Penasaran dengan kode
  proyek "Q3-2026-SEA" yang tercetak di memo pada sebuah USB, lalu mencolokkannya (G1).
  Latar keluarga Eurasia (komunitas Kristang) di Singapura atau Malaysia, yang membuat
  nama depan Barat wajar (usulan yang diterima pemilik proyek).
- **Bukti di canon.** `found_note.txt`: "Q3-2026-SEA -- what does it mean? -- G".
  Bukti dilabeli "PC-IT-017 — USB / staff badge / memo" (`01-canon-dan-hook.md` H4).
  INFERENSI: tiga barang itu (USB, lencana, memo) adalah cara masuknya.
- **Fungsi.** Titik masuk serangan (log M1: "That's the hallway. That's the door."),
  manusia yang hilang dari arsip 2026, dan kambing hitam cover-up.
- **Nasib (DECIDED).** Hidup. Dipecat dan dijadikan penyebab resmi dalam laporan insiden
  rumah sakit (bukan ditahan). Tidak bisa dihubungi: hilang dari arsip 2026.
- **Kehadiran (DECIDED).** Selama M5 pemain tidak bicara dengan Greta. Ia hadir lewat
  dokumen: catatannya sendiri, pernyataan yang ia dipaksa tandatangani, dan selisih arsip
  situs PacificCare 2025 dan 2026. Setelah M7: satu surat epilog searah lewat `Mail.send`
  (Tier 1) yang isinya mengikuti ending (`05-ending.md`; ending C tanpa surat).
  Percakapan dua arah (`MailDefinition.replyable`) ditunda: Tier 2, dicoba di lab dulu.
- **Cermin.** Reyes menjaga gaji ("That's how it gets you", `i18n/m03/core.ts` LOG_REYES_2).
  Greta yang hanya penasaran kehilangan segalanya.
- **OPEN.** Umur, teks dokumen Greta (catatan dan pernyataan paksa), bunyi surat epilog
  (`06-pertanyaan.md` G1-e).

### Vivien Orchid, CRO PacificCare (nama dan peran DECIDED 2026-10-02)

- **Siapa.** Vivien Orchid, Chief Risk Officer PacificCare Health. Memutuskan membayar
  tebusan dan menandatangani temuan insiden yang menyebut Greta sebagai penyebab. Pernah
  bekerja di sisi asuransi, di Nordhaven Mutual Assurance, asuransi fiktif di puncak rantai pemilikan SKN Capital Nominees,
  di bawah Conrad Lindqvist. Perempuan (DECIDED 2026-10-02).
- **Motif cover-up (PROPOSAL yang diterima).** Label "kelalaian staf" (human error) menjaga
  klaim asuransi rumah sakit tetap berlaku, sedangkan "kegagalan kontrol sistemik" bisa
  membatalkannya. Karena itu Greta yang dipilih dan penyelidikan ditutup cepat.
- **Perantara pembayaran.** Negosiator yang ditunjuk perusahaan asuransi menangani "client
  escrow released" (`deploy.log`): Brightwater Resolutions (DECIDED).
- **Garis waktu canon.** Pada 2026-08-14 sistem terkunci pukul 02:41 UTC dan tebusan dibayar
  pukul 09:02 UTC: selisih 6 jam 21 menit (`i18n/m02/core.ts:110-119`). Arsip insiden M5
  bisa menampilkan jeda itu sebagai keputusan yang diambil. "Operating Theatre 3" sudah ada
  di canon (`i18n/m01/ledgervault.ts:55`). Memo keputusan memuat satu baris oblique tentangnya
  (H-e DECIDED, `09-konten-m5-m6.md` B5).
- **Batas.** Vivien Orchid bukan penjahat utama. Kesalahan utama tetap pada BLACKLEDGER.
- **Catatan nama.** Nama depan sempat "Lindy", diganti "Vivien" (2026-10-02) untuk
  menghindari gema awalan "Lind-" dengan Lindqvist di halaman Registry dan Archive.
- **Latar (DECIDED).** Mekanisme keuntungan Conrad dari asuransi hanya latar cerita, tanpa mekanik
  (`06-pertanyaan.md` H-d).

### Conrad Lindqvist (nama dan profil DECIDED)

- **Peran.** The Architect. Pemilik akhir SKN Capital Nominees (lewat rantai Nordhaven,
  `09-konten-m5-m6.md` C1) dan penerima 60% setiap batch.
- **Nama.** Menggantikan Damien Okoro (`content/m04.ts:45`). Dipilih dari empat
  kandidat tanpa tabrakan dengan nama canon. Tiga lainnya tidak dipilih: Elias Varga,
  Julian Kessler, Anselm Reiss.
- **Profil (DECIDED 2026-10-02).** Mantan aktuaris atau perwira risiko di sisi asuransi. Memandang
  korban sebagai baris pembukuan, kebalikan dari cara pemain memandang adiknya. Selaras
  dengan motif pembukuan BLACKLEDGER dan dengan cover-up rumah sakit (keputusan
  membayar adalah keputusan risiko).
- **Petunjuk yang sudah ada.** Infrastruktur lama dan tak ditambal (LegacyCMS 2.1,
  build 2011.04) menyiratkan sejarah panjang (H11). Watchdog yang bersuara
  (`content/m04.ts:33-37`).
- **Wajah publik (DECIDED).** Chairman Risk Committee Nordhaven Mutual (2018-2024), mantan Chief
  Actuary (2009-2018), direktur Nordhaven Holdings (PC) Ltd 2021-12-02 sampai 2024-03-01
  (`09-konten-m5-m6.md` C1). Tokoh pendukung M5 dan M6 (Gareth Lim, Alexander Voss, Imogen
  Hartley) juga di sana.
- **Umur dan motif (DECIDED 2026-10-02).** 59 tahun (lahir 1967). Aktuaris yang memberi harga pada
  risiko yang ia ciptakan sendiri: tebusan sebagai kerugian yang bisa diprediksi bila pasokannya dikelola,
  dan semua rekening dilunasi (`11-spec-m7.md` bagian I).

### Reyes di M4 dan M7 (kemunculan DECIDED, nasib per ending PROPOSAL)

Muncul di M4 (`old_targets.txt`: "d.reyes: monitor") dan M7 (`manifest.txt`). Menjadi saksi yang
rentan (H7). Nasibnya bergantung pada ending (`05-ending.md`).

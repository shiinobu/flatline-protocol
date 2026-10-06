# 05 — Ending dan konsekuensi

Status: tiga opsi A/B/C adalah canon. Matriks konsekuensi diterima sebagai dasar efek ending M7
(EKSEKUSI 2026-10-02, `11-spec-m7.md` bagian H); teks epilog OPEN.
Custodian kosong (DECIDED), jadi bobot ending bertumpu pada **G** dan **Reyes**,
bukan pada Custodian.

## A. Canon

Pertanyaan akhir dari Custodian: "You have everything. The Architect's real identity,
the whole chain, all of it. What now?" (`content/m04.ts:98-143`, `docs/story.md:363-372`).
Di M7 pertanyaan ini dikirim lewat **surel** dan dijawab lewat kolom `choice` di laporan. Dialog
telepon dibuang (`11-spec-m7.md` bagian B, nomor 8).

| Opsi | Teks pemain | Isi |
|---|---|---|
| A (`expose`) | "Everyone should know what BLACKLEDGER did. Let the world decide what happens next." | Publikasikan semuanya |
| B (`handoff`) | "This goes through the system, clean. My sibling deserved due process. So does this." | Serahkan ke penegak hukum yang bersih |
| C (`destroy`) | "No more victims. This ends tonight, and nobody else gets to decide what happens to BLACKLEDGER." | Hancurkan infrastruktur C2 (efeknya dijalankan mod: `unregister`), tanpa memberi tahu siapa pun |

Tidak ada ending yang "benar" (`docs/story.md:372`). Isi laporan akhir M4 lama (`M04_REPORT_BODY_*`): nama asli The Architect, entitas induk, dan keputusan.
Di M7 kolomnya `architect`, `evidence`, `choice` (`11-spec-m7.md` bagian I).

## B. Matriks konsekuensi (dasar efek ending M7, DECIDED lewat EKSEKUSI)

Tiga cara menutup buku (`02-peta-misi.md`, bagian A):

| Ending | Roxanne (G) | Reyes | Conrad Lindqvist | Rumah sakit (Vivien Orchid) | Siapa yang menutup buku |
|---|---|---|---|---|---|
| **A** publikasi | Dibersihkan di mata publik | Namanya ikut bocor | Terbuka di depan publik, nasibnya diputuskan publik | Cover-up terbongkar | Publik |
| **B** hukum | Dibersihkan pelan-pelan lewat proses | Menjadi saksi | Diadili, hasil tidak pasti | Cover-up diselidiki | Hukum |
| **C** hancurkan | Tetap menjadi kambing hitam | Aman, tidak terseret | Tidak diadili, infrastruktur hancur | Cover-up bertahan | Pemain sendiri. Buku orang lain tetap terbuka |

## B2. Surat epilog Roxanne (bentuk DECIDED 2026-10-02, teks OPEN)

Satu surat searah dari Roxanne Anindita Natnaree lewat `Mail.send` setelah M7 (Tier 1, bentuk sama
dengan balasan Custodian). Pemain tidak membalas. Percakapan dua arah
(`MailDefinition.replyable`, Tier 2) ditunda dan hanya dicoba di lab.

| Ending | Surat Roxanne |
|---|---|
| **A** publikasi | Pendek: namanya bersih, tetapi tidak ada yang kembali seperti semula |
| **B** hukum | Hati-hati: prosesnya baru dimulai dan belum ada jaminan |
| **C** hancurkan | **Tidak ada surat.** Kotak masuk tetap sunyi, sejalan dengan "buku orang lain tetap terbuka" |

## C. Syarat desain

1. **Opsi B butuh M5.** Tanpa cover-up (M5), "I know someone clean" tidak punya alasan.
   Bila ending B dipertahankan, M5 tidak boleh dibuang.
2. **Pertanyaan akhir tetap generik.** Custodian kosong, jadi "What now?" tidak membawa
   kepentingan pribadi. Bobotnya datang dari G dan Reyes.
3. **Epilog memakai Tier 1.** Epilog M7 berupa surel Roxanne dan log pribadi BACKTRACE per ending
   (`11-spec-m7.md` bagian H). Perubahan situs (Registry, Archive) sesudah ending bukan bagian
   spesifikasi M7 dan bergantung pada `weblab` (Tier 2).
4. **Opsi C tidak bergantung pada sesi terbuka.** Efeknya dijalankan controller sesudah laporan:
   jaringan C2 dihancurkan berurutan (#35) dan `.enc` hilang (`11-spec-m7.md` bagian H).
5. Nasib Roxanne sudah diputuskan (hidup, dipecat, penyebab resmi, tak terjangkau;
   `06-pertanyaan.md` G1-a dan G1-d), jadi kekuatan "bersih" tiap ending bisa dirancang.

## D. OPEN

- Prosa surat Roxanne A dan B, isi log pribadi per ending, serta apakah ada layar akhir BACKTRACE
  khusus atau postingan Twotter.
- Apakah Reyes muncul langsung di finale atau hanya lewat epilog. Roxanne hanya lewat
  surat epilog (DECIDED).
- Apakah nama Roxanne dan Reyes disebut dalam dialog akhir.

## E. Matriks M7 v2 (2026-10-06, README #73-#76)

Menambah bagian B (tidak menggantikan). Efek dijalankan controller setelah laporan diterima, log dan surat ditulis sebelum `completeObjective` (README #41). Rinci di `11-spec-m7.md` N.

| Benang | A publikasi | B hukum | C hancurkan |
|---|---|---|---|
| Dua korban berikutnya (FIN-EU-2214, MED-APAC-6689) | diperingatkan publik, menutup akses | diberi tahu diam-diam lewat jalur resmi | tetap terkompromi tanpa diberi tahu; cadangan tak pernah jadi klaim |
| TR4C3404 dan operator FIN-NA | teridentifikasi | bekerja sama | tak tersentuh |
| Orchid | terbongkar | diselidiki | utuh |
| OT3 dan cover-up | insiden klinis masuk catatan publik | diselidiki | tetap "excluded" |
| Custodian (satu baris) | singkat | singkat | "Someone closed it." |

Surat Roxanne A dan B ditulis ulang agar menyebut yang berubah (A: baris OT3 kini ada di catatan). Ending C tetap tanpa surat.

# 14. Rename tokoh M5 (2026-10-05)

Status: **DECIDED** oleh pemilik proyek (2026-10-05), dikerjakan di pohon kerja 2026-10-05 dan dicatat di `README.md` #66. Berkas ini hanya memuat
pemetaan nama dan aturan pemakaiannya; cerita dan kronologinya tidak berubah.

## Aturan

1. Setiap nama dan akun yang terlihat pemain di M5 (dan konstanta yang mengalir ke M7 dan BACKTRACE) memakai kolom "Nama baru" dan "Akun baru".
   Nama tampil dibaca dari konstanta (`GRETA_FULL_NAME`, `GRETA_SHORT_NAME`, `GRETA_PRIVATE_EMAIL` di `content/global/characters.ts`;
   `M05_GRETA_FIRST_NAME`, `M05_GARETH_FIRST_NAME`), jangan ditulis ulang.
2. Nama pendek: "G. de Souza" menjadi **"R. Natnaree"**, "G. Lim" menjadi "G. Teoh". Surel pribadi: `roxanne.natnaree@postbox.my`. Berkas pernyataan:
   `acknowledgement_rnatnaree.txt`; direktori rumah `/home/rnatnaree`.
3. Tanda tangan sticky note `found_note.txt`, petunjuk tip, catatan, dan surat epilog M7 memakai **"R.a.N"** (huruf a kecil), bukan "G".
4. Local-part surel = nama akun portal = kunci Cipher Desk = awal password: `rnatnaree` dan password `rnatnaree-OT3-2026-08-14`
   (format `<local-part>-<kode sistem>-<tanggal insiden>`). `Marigold2019` tetap sandi lama yang bocor. Pengguna Linux RDC: `rbautista`.
5. Id internal **tidak** diganti: `GRETA_*`, `GARETH_*`, `M05_GRETA_USERNAME`, flag `gretaSeen`, kunci BACKTRACE `greta`, probe `greta-seen`.
6. Tidak disentuh: Marcus Okafor (M3) dan rumah tangga Reyes (M3, M7). Penggantian memakai nama lengkap yang persis, jadi nama lain dengan nama depan yang sama tidak ikut berubah.
7. Istilah pencocok laporan (huruf kecil) bukan nama tampil dan tidak ikut diganti otomatis; lihat `docs/bugs.md` #69.

## Master timeline Echoline (halaman staf IT, `/it`)

Sembilan capture: C1 2024-05-14 (`1d7k`), C2 2024-10-18 (`5mw3`), C3 2025-03-12 (`9pt6`), C4 2025-07-29 (`3zx8`), C5 2025-11-03 (`8fq2`), C6 2026-01-22 (`6rn4`),
C7 2026-03-18 (`2vb7`), C8 2026-06-30 (`7ha5`), C9 2026-08-18 (`4ec9`). Halaman langsung memakai "Last updated 2026-09-02". Roxanne ada di C1 sampai C8
dan tidak di C9. Gideon (kontrak sampai 2026-07) ada di C5 sampai C8. Gerbang langkah 5: capture `8fq2` (`early`) dan `4ec9` (`late`). Data: `content/m05/echoline.ts`.

## Pemetaan

| Nama lama | Nama baru | Akun lama | Akun baru |
|---|---|---|---|
| Greta de Souza | Roxanne Anindita Natnaree | `g.desouza` | `rnatnaree` |
| Gareth Lim | Gideon Bayu Teoh | `g.lim` | `gteoh` |
| Tara Nair | Valerie Kirana Dizon | `t.nair` | `valerie.dizon` |
| Ruben Wong | Rafael Surya Bautista | `r.wong` | `rafael.bautista` |
| Daniel Park | Dorian Aditya Hoang | `d.park` | `hoang.dorian` |
| Helena Costa | Seraphina Laksmi Pangestu | `h.costa` | `spangestu` |
| Victor Ng | Caspian Danendra Yeoh | `v.ng` | `c.yeoh` |
| Priya Menon | Delphine Prabha Wattanakul | `p.menon` | `d.wattanakul` |
| Samir Patel | Sebastian Indra Siregar | `s.patel` | `sebastians` |
| Alina Petrova | Isadora Cahya Nguyen | `a.petrova` | `nguyen.isadora` |
| Minh Tran | Matteo Candra Dang | `m.tran` | `matteodang` |
| Joshua Reed | Jasper Dharma Aquino | `j.reed` | `jaquino` |
| Chen Wei | Cassian Wira Nasution | `c.wei` | `cassian.n` |
| Bianca Silva | Aurelia Padma Sutedja | `b.silva` | `aurelia.s` |
| Marcus Tan | Maxwell Satria Mercado | `m.tan` | `mercado.maxwell` |
| Nadia Karim | Zara Indira Abdullah | `n.karim` | `zaraabdullah` |
| Mei Lin | Celestine Mayang Ong | `m.lin` | `celestine.ong` |
| Omar Haddad | Orion Bima Ismail | `o.haddad` | `orion.ismail` |
| Noor Rahman | Ophelia Kinanti Salleh | `n.rahman` | `osalleh` |
| Siti Mahendra | Natalia Sari Dumlao | `s.mahendra` | `n.dumlao` |
| Leon Hart | Lucian Pranaja Bui | `l.hart` | `lucianbui` |
| Camille Reyes | Juliette Anjani Villanueva | `c.reyes` | `jvillanueva` |
| Evelyn Cho | Evangeline Chandra Phan | `e.cho` | `evangelinep` |
| Farid Akbar | Felix Jayendra Ramasamy | `f.akbar` | `f.ramasamy` |
| Sami Ibrahim | Silas Gandewa Krishnan | `s.ibrahim` | `skrishnan` |
| Ana Pereira | Anastasia Wulan Santiago | `a.pereira` | `anastasia.santiago` |
| Lin Chen | Linnea Ghita Chaiyasit | `l.chen` | `lchaiyasit` |
| Marco Santos | Kieran Arka Pradipta | `m.santos` | `kieran.pradipta` |
| Kai Tan | Kaelen Danu Phromsorn | `k.tan` | `kaelenp` |
| Hana Park | Hazel Ratna Tolentino | `h.park` | `hazel.t` |
| Duarte Ferreira | Dante Raksa Lau | `d.ferreira` | `dlau` |
| Yuki Matsuda | Yvette Tirta Boonmee | `y.matsuda` | `y.boonmee` |

Akun Linux `rwong` pada RDC menjadi `rbautista`. Pengguna konsol Firewall `r.wong` menjadi `rafael.bautista`.

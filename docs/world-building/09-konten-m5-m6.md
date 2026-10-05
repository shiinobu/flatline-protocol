# 09 — Konten final M5 dan M6

Status: DECIDED 2026-10-02 untuk nama, rantai, tanggal, dan beat. Prosa en dan zh
ditulis saat implementasi (`i18n/m05`, `i18n/m06`). Alamat IP, password `<P>`, dan semua
hash dipilih saat implementasi. Setiap hash harus MD5 asli dari password pengguna yang
benar-benar ada di dunia (`docs/bugs.md` #13). Dokumen ini melengkapi
`08-spec-m5-m6.md` (rantai gerbang dan topologi).

## A. Nama dan situs

| Entitas | Nama | Catatan |
|---|---|---|
| Arsip web | **Echoline Archive**, `echoline.net` | Satu situs global (`websites/global/echoline/`). Halaman M5 dan M6 dibungkus `gateMissionPages("m05")` atau `("m06")`, karena satu host hanya bisa dimiliki satu kelas `Website` |
| Breach lookup | **LeakIndex**, `leakindex.net` | M5 (`websites/m05/leakindex/`) |
| Registri perusahaan | **Port Calder Companies Registry**, `pcr-registry.org` | M6. Port Calder adalah yurisdiksi fiktif |
| Indeks domain | **HostTrail**, `hosttrail.net` | M6 (`websites/m06/hosttrail/`). Dijadikan global bila M4 memakainya |
| Asuransi | **Nordhaven Mutual Assurance**, `nordhaven-mutual.com` | |
| Negosiator | **Brightwater Resolutions** | Tanpa situs |
| Agen terdaftar | **Marlowe & Pryce Corporate Services**, `marlowepryce.biz` | |
| Infrastruktur Architect | registrant **Bulletproof VPN Ltd.** (sama dengan whois titik akhir M3), domain `skn-central.net` | `vpn.skn-central.net` menunjuk `203.0.113.160` (titik akhir dari M3). "SKN-CENTRAL" adalah label peer di config M3, bukan nama perusahaan |
| Tokoh pendukung | Gareth Lim (kontraktor IT, umpan), Alexander Voss dan Imogen Hartley (direktur nominee) | |

## B. M5 "The Door"

### B1. Jaringan dan pengguna
| Node | Isi |
|---|---|
| Router tepi | `remote.pacificcare-health.org`, 443 terbuka, 80 tertutup |
| Splitter | pass-through |
| Firewall (`isIpHidden`) | **satu pengguna valid: `g.desouza`**. `PFSense.Login` hanya terpancar saat login sukses dan hanya membawa `{ip}` (engine `index.js` ~9313749), jadi pengguna umpan yang valid akan ikut membuka gerbang. Varian nama (`greta.desouza`, `gdesouza`) hanya gagal login |
| **Cold-Chart** (arsip IR) | ssh 22 (nonaktif sampai langkah 9), pengguna `g.desouza/<P>` dan `root` |
| **Bedside-17** (PC-IT-017) | rdp 3389 FreeRDP (nonaktif sampai langkah 9), pengguna online `it.station` dan `root`. Bonus di luar rantai |
| **Lead-Apron** (radiologi) | umpan, pengguna `pacs/<P3>` |
| **Pay-Station** (penagihan) | umpan, pengguna `billing/<P2>` |
| Printer | umpan, pengguna `admin/<P4>` |

Password `<P>` dipakai ulang oleh Greta di Firewall dan Cold-Chart. `john` hanya mencari di
registri (#13), jadi men-crack adalah langkah, bukan teka-teki.

### B2. Persona Twotter (terlihat sejak awal, diterima)
- **Greta de Souza.** Sebelum 2026-08-14: humor IT sehari-hari. Postingan 2026-08-10: menemukan
  USB di mejanya berlabel "Q3-2026-SEA" dan bertanya artinya. Postingan terakhir 2026-08-17:
  "mereka mau aku menandatangani sesuatu". Setelah itu sunyi.
- **Gareth Lim (umpan).** Postingan perpisahan Juli 2026: hari terakhir sebagai kontraktor IT.
  Kontraknya berakhir 2026-07-31, sebelum USB dicolokkan (2026-08-11), dan itu pembeda utama.

### B3. Arsip (Echoline, halaman M5)
- Snapshot **2025-11-03**: halaman staf IT memuat Greta (Systems Administrator) dan Gareth
  (IT Contractor, sampai 2026-07). Halaman bantuan IT memuat format surel
  `<inisial>.<nama keluarga>@pacificcare-health.org`.
- Snapshot **2026-09-02**: keduanya tidak ada. Tidak ada halaman yang menyebut alasannya.

### B4. LeakIndex: 10 rekaman
| # | Surel | Sumber | Hash dari | Peran |
|---|---|---|---|---|
| 1 | `g.desouza@pacificcare-health.org` | MedVendor Portal 2025 | `<P>` | **benar** |
| 2 | `greta.desouza@postbox.my` | FoodForum 2022 | `<P2>` | umpan |
| 3 | `gdesouza@pacificcare-health.org` | MedVendor Portal 2025 | `<P3>` | umpan (format salah) |
| 4 | `g.lim@pacificcare-health.org` | MedVendor Portal 2025 | `<P4>` | umpan (Gareth) |
| 5 | `t.nair@...` | MedVendor Portal 2025 | `<P2>` | derau |
| 6 | `r.wong@...` | MedVendor Portal 2025 | `<P3>` | derau |
| 7 | `s.ibrahim@...` | MedVendor Portal 2025 | `<P4>` | derau |
| 8 | `a.pereira@...` | MedVendor Portal 2025 | `<P2>` | derau |
| 9 | `l.chen@...` | MedVendor Portal 2025 | `<P3>` | derau |
| 10 | `m.santos@...` | MedVendor Portal 2025 | `<P4>` | derau |

Semua hash bisa di-crack (dibagi lewat tiga pengguna umpan). Hanya rekaman 1 yang memberi
kombinasi yang benar. Bukti langkah 6: halaman memanggil fungsi `Exports` saat rekaman 1 dibuka.

### B5. Dokumen di Cold-Chart
| Berkas | Isi (beat) | Efek |
|---|---|---|
| `/var/ir/2026-08-14/decision_memo.txt` | Vivien Orchid. Linimasa UTC: 02:41 kunci, 02:55 jadwal ruang operasi dan rekam medis mati, 03:20 tim krisis, 03:58 asuransi dihubungi, 04:35 negosiator (Brightwater) dilibatkan, **05:12 "Clinical incident logged, Operating Theatre 3. Escalated to Legal. Excluded from external statement."**, 06:10 tuntutan $2.850.000 dikonfirmasi, 07:30 asuransi setuju, 08:40 CRO mengotorisasi, 09:02 bayar. Keputusan: klasifikasi "employee negligence", lampiran draf v1 digantikan | kunci `decisionMemo` |
| `/var/ir/2026-08-14/finding_draft_v1.txt` | 2026-08-15. Penyebab: alat dukungan jarak jauh pihak ketiga. Klasifikasi: serangan eksternal. Digantikan | lampiran, umpan |
| `/var/ir/2026-08-14/finding_final.txt` | 2026-08-19. Penyebab: media USB tidak sah dicolokkan ke PC-IT-017 oleh G. de Souza, kebijakan 7.2. Klasifikasi: kelalaian karyawan, risiko yang ditanggung. Greta diberhentikan 2026-08-19. Penyelidikan ditutup 2026-08-24 | lampiran |
| `/var/ir/2026-08-14/acknowledgement_gdesouza.txt` | 2026-08-18. Pengakuan yang Greta dipaksa tandatangani, disusun kantor CRO | kunci `statement` |
| `/var/ir/tickets/usb_ticket_PC-IT-017.txt` | Dibuka 2026-08-18. Perangkat berlabel "Q3-2026-SEA", dicolokkan 2026-08-11 00:12 UTC oleh `g.desouza`. Berkas biner tanpa tanda tangan berjalan saat dicolokkan (tanpa detail operasional) | kunci `usbTicket` |
| `/var/ir/tickets/asset_register.txt` | PC-IT-017 milik G. de Souza | pembeda dari Gareth |
| `/home/g.desouza/notes.txt` | Catatan Greta: ia mencolokkannya karena label itu terlihat seperti kode proyek dan ia ingin tahu artinya. Ia menceritakan yang sebenarnya, lalu yang tertulis berbeda. Rasa bersalah, dan ia terus memikirkan ruang operasi | log pribadi (pola `logReyes`), bukan gerbang |

### B6. Bonus Bedside-17 (S-a: dipertahankan, di luar rantai)
Berisi sticky note asli `found_note.txt` ("Q3-2026-SEA -- what does it mean? -- G") dan
`usb_history.log` (dicolokkan 2026-08-11 00:12 UTC). Hasilnya hanya log pribadi.

### B7. Laporan
| Kolom | Nilai benar | Ditolak |
|---|---|---|
| `door` | Greta de Souza | Gareth Lim |
| `cause` | media USB tidak sah, kelalaian karyawan | "vendor" (draf v1) |
| `decider` | Vivien Orchid | nama lain |
| `gap` | 6 jam 21 menit antara kunci dan bayar | |
| `motive` | klasifikasi klaim asuransi | |

### B8. Petunjuk "belum waktunya" (beat, tanpa membocorkan langkah berikutnya)
Tip belum dibaca: mulai dari vault. Belum membandingkan arsip: lihat siapa yang hilang.
Identitas belum dipersempit: ada lebih dari satu G. Tepi belum dipetakan: rumah sakit punya
sisi yang tidak terlihat. Kredensial belum ketemu: orang meninggalkan jejak di tempat lain.
Firewall belum dibuka: pintu masih terkunci. Dokumen belum dibaca: yang ada di dalam belum
dibaca semua.

### B9. BACKTRACE
| Kunci | Nilai |
|---|---|
| `dismissed` | Greta de Souza dihapus dari daftar staf (2025 ke 2026) |
| `greta` | Greta de Souza, Systems Administrator, PacificCare IT |
| `archive` | Arsip insiden (Cold-Chart) dibuka dengan kredensial Greta sendiri |
| `statement` | Pengakuan ditandatangani 2026-08-18 atas arahan kantor CRO |
| `decisionMemo` | Memo CRO: bayar 09:02 UTC, klasifikasi "employee negligence" |
| `usbTicket` | USB berlabel Q3-2026-SEA dicolokkan di PC-IT-017 pada 2026-08-11 |

Extras: Nordhaven Mutual Assurance, Brightwater Resolutions, jeda 6 jam 21 menit.

### B10. Epilog Greta (setelah M7, beat)
A: namanya bersih, tetapi tidak ada yang kembali seperti semula. B: seorang pengacara
menelepon, prosesnya akan lama. C: tidak ada surat.

## C. M6 "Open Register"

### C1. Rantai pemilikan
```text
SKN Capital Nominees Ltd (2017-03-09, Port Calder)
 2019: pemilik Halvard Trust (dibubarkan 2021-11-30)
 2024: Nordhaven Holdings (PC) Ltd (didirikan 2021-12-02)
        └─ Nordhaven Mutual Assurance Ltd
              ├─ Conrad Lindqvist: Chief Actuary 2009-2018, Chairman Risk Committee 2018-2024,
              │   direktur Nordhaven Holdings 2021-12-02 sampai 2024-03-01
              └─ Vivien Orchid: Head of Cyber Risk 2019-2024 (kemudian CRO PacificCare)
```

### C2. Rekaman Registry
| Rekaman | Isi | Peran |
|---|---|---|
| SKN Capital Nominees Ltd | Agen: Marlowe & Pryce. Direktur: Alexander Voss (sejak 2017-03-09), Imogen Hartley (sejak 2022-06-14, menggantikan Tomas Brandt yang mundur 2022-06-13) | `nominees` |
| Alexander Voss | Nominee profesional, direktur 412 perusahaan (VERIFIED) | **umpan** |
| Pengajuan 2019 | Pemilik: Halvard Trust (VERIFIED) | |
| Pengajuan 2024 | Pemilik: dirahasiakan (CONFLICTING), karena Halvard Trust sudah dibubarkan | bertentangan |
| Halvard Trust | Dibubarkan 2021-11-30 | pembeda lewat tanggal |
| Nordhaven Holdings (PC) Ltd | Pemegang saham: Nordhaven Mutual Assurance | `insurer` |
| Nordhaven Mutual Assurance | Daftar pejabat, termasuk Vivien Orchid dan Conrad Lindqvist | `insurer`, `architect` |
| Conrad Lindqvist | Hanya terbuka setelah langkah 7 dan 8 | `architect` |

- **Halaman tersembunyi:** `/filings/archive/` (snapshot 2019 dan 2024), hanya ditemukan lewat
  `dirhunter pcr-registry.org`. Gerbangnya kunjungan halaman, bukan event `dirhunter`.
- **Gerbang `whois`:** domain agen (`marlowepryce.biz`) dan domain asuransi (`nordhaven-mutual.com`,
  registrant Bulletproof VPN Ltd., sama dengan `whois` titik akhir M3).
- **HostTrail:** `vpn.skn-central.net` (`203.0.113.160`) berbagi sertifikat dengan
  `portal.nordhaven-mutual.com`.
- **Konsekuensi M1-M3** (controller M6 membaca status `backtrace`, mencerminkannya ke
  `SharedVariables`, #36): M3 selesai membuat Skynet Import-Export berstatus "struck off" di
  Registry, dan "D. Reyes: no longer listed" di snapshot Archive 2026.

### C3. Laporan
| Kolom | Nilai benar | Ditolak |
|---|---|---|
| `architect` | Conrad Lindqvist | Alexander Voss |
| `role` | Chairman Risk Committee, Nordhaven Mutual (mantan Chief Actuary) | |
| `chain` | Nordhaven Mutual, Nordhaven Holdings, SKN Capital Nominees | |
| `proof` | sertifikat bersama dan registrant Bulletproof VPN Ltd. | |
| `front` | Alexander Voss adalah nominee, bukan pemilik | |

### C4. BACKTRACE
| Kunci | Nilai |
|---|---|
| `nominees` | SKN Capital Nominees Ltd, Port Calder, didirikan 2017-03-09 |
| `registeredAgent` | Marlowe & Pryce Corporate Services |
| `ownershipChange` | Halvard Trust (dibubarkan 2021-11-30) ke Nordhaven Holdings (PC) Ltd |
| `insurer` | Nordhaven Mutual Assurance. Vivien Orchid, Head of Cyber Risk 2019-2024 |
| `infra` | `vpn.skn-central.net` berbagi sertifikat dengan `portal.nordhaven-mutual.com` |
| `architect` | Conrad Lindqvist, Chairman Risk Committee, Nordhaven Mutual (2018-2024) |

### C5. Petunjuk "belum waktunya" (beat)
Tip belum dibaca: tanyakan siapa yang menandatangani untuk Nominees. Agen belum teridentifikasi:
nominee punya agen. Arsip belum ditemukan: tidak semua halaman ditautkan. Snapshot belum
dibandingkan: pemilik berubah. Asuransi belum ditautkan: ikuti nama yang pernah bekerja di
rumah sakit. Infrastruktur belum ditautkan: tunjukkan alamat itu milik siapa.

## D. Rencana uji
- **M6 lebih dulu, sebagai kerangka jalan:** dunia dengan `networkIps: []`, satu situs, surel tip,
  satu gerbang. Diuji dengan harness SDK tiruan, lalu live, sebelum konten lain ditulis
  (jalur itu terverifikasi di kode, belum pernah dijalankan live).
- `john` tidak perlu lab (MD5 asli, #13).
- Persona Twotter terlihat sejak awal: diterima.

## E. Masih OPEN
Prosa en dan zh, alamat IP, password dan hash, nama merek Claims tracker
(W-b, belum dipakai misi mana pun), dan apakah `replyable` diuji di lab (G1-f).

## Pembaruan 2026-10-05 (M5 v2)

Bagian B (M5) di atas ditulis untuk rantai v1. Yang berubah: rumah sakit kini situs misi (delapan host), portal `remote.` menggantikan
gerbang edge, RDC menggantikan SSH (B1, B4, B5), dan tiga dokumen dibaca di jendela arsip RDC (B5). Sumber kebenarannya sekarang
`docs/m05-playtest.md`, README #58 sampai #64 dan catatan implementasi di `08-spec-m5-m6.md`; teks dan data kode ada di
`content/m05/` dan `i18n/m05/`.

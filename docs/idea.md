# Idea Plan

Dibuat: 2026-09-30. Status: **hanya usulan.** Belum ada satu pun yang dikerjakan.
Setiap butir menunggu keputusan dan kata EKSEKUSI. Semua host, alat, dan modul
di sini fiktif dan berjalan di simulasi HackHub. Dokumen ini hanya membahas
mekanik (event, gating, bentuk data), bukan cara serangan dunia nyata.

> **Pembaruan 2026-10-02.** Bagian 2 (d.reyes sebagai umpan balik: 2A, 2B, 2C) dan alur
> reverse-TCP dengan LHOST/LPORT **dibuang** atas keputusan pemilik proyek ("reverse tcp tidak
> saya pakai"), bukan ditunda. Arah cerita sekarang ada di `docs/world-building/`, yang menggantikan
> usulan d.reyes. Bagian 1 dan 3 tidak dibahas ulang oleh keputusan itu.

## Label

| Label | Artinya | Akibatnya |
|---|---|---|
| MERUBAH | Mengubah perilaku atau isi yang sudah ada: kode lama diedit atau jalur lama diganti | Menyentuh file yang sudah lolos live-test, jadi perlu tes ulang |
| MENAMBAH | Menambah ke sistem yang ada, jalur lama tetap berjalan | File lama disentuh sedikit (satu listener, satu baris data, satu impor) |
| MEMBUAT | Membuat file atau sistem baru yang berdiri sendiri | File baru, kode misi lama tidak berubah |

## Ringkasan

| # | Usulan | Merubah | Menambah | Membuat |
|---|---|---|---|---|
| 1 | Tool mandiri bergaya kerangka eksploitasi, teks sendiri | tidak ada | 1 baris impor, 1 baris docs | 2 file baru |
| 2A | d.reyes sebagai umpan balik, **menggantikan** SSH | jalur SSH M3 | 1 listener callback | tidak ada |
| 2B | d.reyes sebagai umpan balik, **jalur tambahan** | tidak ada | 1 listener callback, petunjuk | tidak ada |
| 2C | d.reyes sebagai umpan balik, **ditunda** ke M4 | tidak ada | tidak ada | tidak ada |
| 3 | Usulan kecil lain (bagian 3, tiap baris berlabel) | beberapa | beberapa | tidak ada |

## 1. Tool mandiri bergaya kerangka eksploitasi (MEMBUAT)

**Latar (terverifikasi).** Katalog modul `msfconsole` tertutup. SDK hanya
mengekspos event Metasploit (`Use`, `Search`, `SetOption`, `ShowOptions`,
`Msfconsole`, `Event`, `Event.Try`, `Meterpreter.Connected`, `Rootgrab`) dan
tidak punya API untuk mendaftarkan modul. SDK 0.25.0 tidak menambahkannya.
Jadi "modul baru" berarti command buatan kita sendiri, seperti mod temanmu
yang bergaya recon-ng, bukan entri di katalog asli.

**Rancangan.**

- Satu `Command` (`@RegisterCommand`, pola yang sama dengan `attrcheck`, `open`,
  dan `msflab`). `Command` di SDK hanya punya `CommandName`, `Description`,
  `Autocomplete`, `PackageName`, dan `Run(tools)`. Tidak ada sub-prompt bawaan
  ala `msfconsole`.
- REPL sendiri: satu `Run()` memanggil `tools.prompt(label)` berulang sampai
  pemain keluar. Label prompt bisa berubah menurut keadaan, misalnya memuat
  modul yang sedang dipilih.
- Teks 100% bebas. `println` menerima segmen berwarna dan tebal, dan tersedia
  `printTable`, `clear`, `sleep`, serta `prompt` berwarna. Nama sub-perintah dan
  gaya output tidak perlu meniru `msfconsole` asli.
- Modul adalah data kita: nama, service, port, deskripsi, opsi wajib, fungsi
  cek, teks sukses dan gagal. Datanya di `src/content/`.
- Gerbang tetap membaca jaringan sungguhan lewat `Network.getSubnet()` (seperti
  `msf-lab.ts`), jadi bisa mengenai host misi asli. Aturannya kita tulis
  sendiri, jadi bebas dari format versi `1.0.0`-`9.99.99`, syarat user `guest`
  atau user online, dan format banner `<Service> <versi>` milik mesin.
- Hasil sukses lewat event mod sendiri (pola `attrcheck`, yang memancarkan
  `flatline.m04.attrcheckRevealed`) atau langsung ke logika quest.

**Biaya yang perlu disadari.**

- Sesi ini bukan sesi mesin, jadi `ls`, `cat`, dan `rootgrab` di `meterpreter >`
  tidak otomatis ada. Harus dibuat sendiri di dalam REPL, atau tool berhenti di
  "sesi terbuka" lalu hasilnya diberikan lewat event dan berkas.
- Listener quest yang menunggu `RemoteConnection.Established` atau
  `Metasploit.*` tidak akan terpicu. Quest harus mendengarkan event kita.
- Pemain perlu tahu tool ini ada, jadi harus diperkenalkan lewat cerita (mail,
  berkas, atau halaman situs).

**Yang berubah.**

| Jenis | Isi |
|---|---|
| Merubah | Tidak ada kode yang berubah perilakunya |
| Menambah | `src/index.ts`: satu baris `import "./commands/<nama-tool>.js";`. `docs/mechanics-reference.md`: satu baris di Custom Commands Registry. `docs/changelog.md` |
| Membuat | `src/commands/<nama-tool>.ts` (REPL dan perintah). `src/content/<nama-tool>-modules.ts` (data modul) |

Kalau dipakai di sebuah misi, file misi itu ikut tersentuh. Labelnya menyusul
saat keputusan bagian 2 dan 3 diambil.

**Saran urutan kerja.** Prototipe dulu di `src/debug/` (bebas gate, seperti
`msflab`) dengan 2-3 modul contoh, live-test teks dan alurnya, baru pindahkan
ke `src/commands/` dan daftarkan di `src/index.ts`.

**Keputusan yang dibutuhkan.**

1. Nama dan tema tool. Harus punya identitas sendiri, bukan "Metasploit versi 2".
2. Dipakai di misi mana: pengganti Metasploit di satu titik, atau alat tambahan
   yang berdiri sendiri. M4 kandidat wajar, karena banner C2 `LegacyCMS 2.1`
   tidak diterima satu pun modul asli.
3. Daftar modul awal: berapa, dan tiap satu mewakili apa di cerita.
4. Cakupan: hanya singleplayer atau juga multiplayer. Belum dites.

## 2. d.reyes sebagai umpan balik (callback)

**Konteks cerita.** Dana Reyes (`@d.reyes`) adalah analis keuangan dan rekan
yang tidak sadar, di host `Faded-Ledger` (VLAN keuangan M3). Jalur sekarang
(langkah 9 di `docs/story.md`, opsional): SSH ke akunnya memakai password dari
tabel `helpdesk_resets`, setelah pemain menulis aturan forward
`22 -> 22 -> 192.168.1.4`. Membaca `do_not_open_at_work.txt` menulis log pribadi
BACKTRACE. Laporan M3 hanya menunggu ledger dan config, jadi jalur Reyes tidak
wajib.

**Mekanik umpan balik (tingkat game saja).** Pemain membuka listener
(`handler`) di `LHOST:LPORT` miliknya. Bila target menerima koneksi balik,
mesin memancarkan `Metasploit.Meterpreter.Connected`. Payload-nya memuat `ip`
(mesin tempat sesi berjalan) dan `handler` (`{ ip, port }` listener yang
menangkapnya). M3 sudah mendengarkan event ini untuk Vault-Line
(`data.ip === M03_VAULTLINE_IP`). Gerbang di game dasar: setelan "terima
koneksi balik" pada akun target, dan router pemain meneruskan `LPORT`.
Referensi game dasar: `docs/basegame-reference/tjs-the-journalists-sister.md`
(Bagian 10 dan 11).

**Kenapa cocok.** SSH dan callback sama-sama berakhir di berkas Reyes, tapi
gerbangnya berbeda. SSH butuh kredensial bocor dan aturan forward `22`.
Callback butuh listener milik pemain dan forward `LPORT`. Itu kerangka "gerbang
berbeda" yang sudah kamu setujui.

**Batasan untuk semua opsi.**

- Bukan objective baru ("full mechanic, not full objective"). Tetap bonus, dan
  laporan tetap hanya menunggu ledger dan config.
- Tidak menambah entri BACKTRACE baru. Tangkapan memakai log `reyes` yang sudah
  ada. `appendBacktraceLogs` menolak teks yang sama dua kali, dan sudah dipanggil
  tiga pemicu (`Terminal.Explorer`, `Terminal.Cat`, dan `open`).
- Pemicu di sisi Reyes dirancang di level event dan gating. Dokumen ini sengaja
  tidak memuat detail operasional dunia nyata.

**Opsi.**

| Opsi | Label | Merubah | Menambah | Membuat |
|---|---|---|---|---|
| 2A: callback menggantikan SSH | MERUBAH | `src/main/m03.ts`: listener `RemoteConnection.Established` untuk SSH ke Faded-Ledger. `src/content/m03.ts`: data dan teks yang menuntun ke SSH. `docs/story.md` langkah 9, `docs/m03-playtest.md` | listener callback (isi seperti 2B) | tidak ada |
| 2B: callback jalur tambahan | MENAMBAH | tidak ada | `src/main/m03.ts`: satu listener `Metasploit.Meterpreter.Connected` untuk host Faded-Ledger yang memanggil `markAccompliceReached()` dan log `reyes` yang sama. `src/content/m03.ts`: petunjuk (belum dirancang). Docs | tidak ada |
| 2C: ditunda ke M4 | tidak ada | tidak ada | tidak ada | tidak ada |

Kecenderungan saya: **2B.** Alasannya, jalur SSH yang sudah ada tidak disentuh,
dan pemain mendapat dua gerbang berbeda ke berkas yang sama. Keputusan tetap di
kamu, dan poin belum terverifikasi di bawah harus beres dulu.

**Belum terverifikasi (cek di klien `.reverse/` atau tes live, jangan ditebak).**

1. Apakah definisi user atau port fixture di SDK punya cara menandai "terima
   koneksi balik". Bentuk datanya belum dicek.
2. Apakah `Metasploit.Meterpreter.Connected` terpancar untuk host NPC fixture.
3. Cara pemain memicu koneksi balik dari sisi Reyes di dalam game belum
   dirancang. Kandidatnya perangkat cerita M3 yang sudah ada, seperti mail,
   berkas, atau dialog.

**Keterkaitan dengan bagian 1.** Kalau tool mandiri dibuat, callback Reyes bisa
menjadi salah satu "modul"-nya (listener buatan sendiri). Itu menghapus
ketergantungan pada setelan akun mesin (poin 1 dan 2), tapi yang terpancar
event mod sendiri, bukan `Metasploit.Meterpreter.Connected`.

## 3. Usulan kecil lain

| # | Usulan | Label | Berkas |
|---|---|---|---|
| 3.1 | Ganti `metasploit` menjadi `msfconsole` sebagai perintah konsol. `metasploit` hanya nama paket `apt-get install` | MERUBAH | `docs/msflab-livetest-guide.md`, `docs/m02-playtest.md`, `docs/m03-playtest.md` |
| 3.2 | Tabel modul Metasploit terverifikasi (10 modul, port, service, hasil live) | MENAMBAH | `docs/mechanics-reference.md` |
| 3.3 | Perbarui blok status di atas `m03-playtest.md` (masih menulis "report step unplayed") | MERUBAH | `docs/m03-playtest.md` |
| 3.4 | Opsi A/B/C desain M3: apakah VLAN keuangan perlu host lain yang bisa ditembus Metasploit. Rekomendasi A (Vault-Line tetap satu-satunya target). Rincian B dan C tidak tercatat di dokumen mana pun, jadi disusun ulang bila keputusan dibuka | keputusan | tidak ada |
| 3.5 | Pola "dua pintu" di Coin-Drift: ganti banner `mariadb` menjadi `MariaDB <versi>` supaya `sqlmap` dan `mysql_login` sama-sama cocok. Hanya relevan bila 3.4 tidak memilih A | MERUBAH | `src/content/m03.ts` (baris Coin-Drift) |
| 3.6 | M2: beri banner nyata dan satu user online pada telnet 23 WiFi extender, supaya jadi umpan yang memberi shell tapi tidak berisi hal penting. Opsional | MERUBAH | `src/main/m02.ts` (baris port WiFi extender) |
| 3.7 | M4: tentukan jalur "initial shell". Banner C2 `LegacyCMS 2.1` tidak diterima modul mana pun dan quest menunggu event (bug #29). Opsi: banner yang diterima modul lalu dengarkan `RemoteConnection.Established`, alat lain, atau tool mandiri bagian 1 | MERUBAH | `src/main/m04.ts`, `src/content/m04.ts` |
| 3.8 | Butir LOW hasil review: empat export tak terpakai, parameter `data` tak terpakai di `m04.ts`, dua handler `Terminal.Cat` di `m03.ts` yang bisa digabung | MERUBAH | beberapa file `src/` |
| 3.9 | **Selesai 2026-10-01** lewat restrukturisasi `src/`: `src/main/m01.ts` (dulu 1053 baris) kini kelas tipis, isinya dipecah ke `controller/m01/`, `core/`, `components/`, `middleware/`, `content/m01/`, `i18n/m01/` (lihat `docs/architecture.md`) | MERUBAH | selesai untuk M1; M2-M4 menyusul |
| 3.10 | Catatan host Database Manager dan komentar `.conf` M3 (ditunda, rincian belum ditulis) | ditentukan saat rincian ditulis | `src/content/m03.ts` |

## 4. Aturan penilai (dari diskusi 10 modul)

- Modul hanya langkah terakhir. Yang menarik adalah tumpukan gerbang di
  sekelilingnya: banner dan versi, port diteruskan, firewall, user online.
  Semuanya sudah jadi mekanik misi.
- Metasploit paling berguna sebagai penutup teka-teki, lemah sebagai teka-teki
  itu sendiri.
- Tambah host atau modul hanya bila menambah keputusan pemain. Tiga pertanyaan:
  apakah menambah keputusan atau hanya mengulang, apakah isi host membuat sesi
  berharga, dan apakah gerbangnya berbeda dari host sebelumnya (versi, forward,
  firewall, online). Kalau semuanya "tidak", lewati.
- Empat pola keputusan: dua pintu ke satu host, dua host mirip dengan satu
  umpan, seberapa jauh melangkah (`guest` atau `rootgrab`), dan jalan buntu yang
  harus dikenali. Banner seperti `8.2p1`, `2.4`, atau `10.1.0` tidak pernah bisa
  dicocokkan lewat `set Version`, jadi sah dipakai sebagai umpan.
- Isi host: tiga berkas per host. Satu petunjuk benar, satu umpan yang masuk
  akal, dan satu yang baru bermakna bila digabung dengan fakta misi lain
  (BACKTRACE). Batasi 2-3 host Metasploit per misi.
- Tidak menambah objective.

## 5. Sudah diputuskan

- Tujuan ke-10 modul lab: menambah keputusan pemain, bukan variasi teks.
- Kerangka "gerbang berbeda" disetujui.
- Kapabilitas sesi (7a) tidak perlu dites: semua sesi Metasploit adalah satu
  jenis Meterpreter, hanya beda pintu masuk.
- Teks output tool mandiri boleh berbeda total dari `msfconsole` asli.

## 6. Menunggu keputusan

- [ ] Bagian 1: nama dan tema, dipakai di misi mana, daftar modul awal, cakupan.
- [ ] Bagian 2: 2A, 2B, atau 2C.
- [ ] Butir 3.4: opsi A/B/C desain M3.
- [ ] Butir 3.5 sampai 3.10: diambil atau tidak, dan kapan.

Catatan proses (bukan usulan):

- `src/guard/flags.ts` harus kembali ke `isDebug = false` sebelum commit apa
  pun. Saat ini `true` untuk tes `msflab`.
- Commit dan push hanya ke `clouds-modify`, bukan `main`.

## Rujukan

- `docs/story.md`: M3 langkah 8 dan 9.
- `docs/basegame-reference/tjs-the-journalists-sister.md`: mekanik LHOST/LPORT
  di game dasar.
- `src/debug/msf-lab.ts`: pola command dan jaringan sandbox.
- `src/commands/attrcheck.ts`: pola command yang memancarkan event mod.
- `docs/mechanics-reference.md`: Custom Commands Registry.

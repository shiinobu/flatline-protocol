# Idea Plan

Diperbarui: 2026-10-08. Status: **catatan ide yang belum dikerjakan.** Setiap butir menunggu keputusan dan kata EKSEKUSI. Semua host,
alat, dan modul di sini fiktif dan berjalan di simulasi HackHub. Dokumen ini hanya membahas mekanik (event, gating, bentuk data), bukan
cara serangan dunia nyata.

## Sudah diputuskan (bukan ide lagi)

- Callback d.reyes lewat reverse-TCP (LHOST/LPORT) **dibuang** atas keputusan pemilik proyek (2026-10-02: "reverse tcp tidak saya
  pakai"). Jalur SSH ke Faded-Ledger tetap bonus di M3.
- Tujuan host atau modul tambahan adalah menambah keputusan pemain, bukan variasi teks. Kerangka "gerbang berbeda" disetujui.
- Kapabilitas sesi tidak perlu dites: semua sesi Metasploit adalah satu jenis Meterpreter, hanya beda pintu masuk.
- Teks output sebuah tool mandiri boleh berbeda total dari `msfconsole` asli.

## 1. Tool mandiri bergaya kerangka eksploitasi (MEMBUAT, belum dibuat)

**Latar (terverifikasi).** Katalog modul `msfconsole` tertutup. SDK hanya mengekspos event Metasploit (`Use`, `Search`, `SetOption`,
`ShowOptions`, `Msfconsole`, `Event`, `Event.Try`, `Meterpreter.Connected`, `Rootgrab`) dan tidak punya API untuk mendaftarkan modul. SDK
0.25.0 tidak menambahkannya. Jadi "modul baru" berarti command buatan kita sendiri, bukan entri di katalog asli.

**Rancangan.**

- Satu `Command` (`@RegisterCommand`, pola yang sama dengan `open` dan `flatline` di `src/commands/`). `Command` di SDK hanya punya
  `CommandName`, `Description`, `Autocomplete`, `PackageName`, dan `Run(tools)`. Tidak ada sub-prompt bawaan.
- REPL sendiri: satu `Run()` memanggil `tools.prompt(label)` berulang sampai pemain keluar. Label prompt bisa berubah menurut keadaan,
  misalnya memuat modul yang sedang dipilih.
- Teks bebas. `println` menerima segmen berwarna dan tebal, dan tersedia `printTable`, `clear`, `sleep`, serta `prompt` berwarna.
- Modul adalah data kita: nama, service, port, deskripsi, opsi wajib, fungsi cek, teks sukses dan gagal. Datanya di `src/content/`.
- Gerbang tetap membaca jaringan sungguhan lewat `Network.getSubnet()`, jadi bisa mengenai host misi asli. Aturannya kita tulis sendiri,
  jadi bebas dari format versi `1.0.0`-`9.99.99`, syarat user `guest` atau user online, dan format banner `<Service> <versi>` milik
  mesin.
- Hasil sukses lewat event mod sendiri (pola `flatline.open.fileRead` milik `open`) atau langsung ke logika quest.

**Biaya yang perlu disadari.**

- Sesi ini bukan sesi mesin, jadi `ls`, `cat`, dan `rootgrab` di `meterpreter >` tidak otomatis ada. Harus dibuat sendiri di dalam REPL,
  atau tool berhenti di "sesi terbuka" lalu hasilnya diberikan lewat event dan berkas.
- Listener quest yang menunggu `RemoteConnection.Established` atau `Metasploit.*` tidak akan terpicu. Quest harus mendengarkan event
  kita.
- Pemain perlu tahu tool ini ada, jadi harus diperkenalkan lewat cerita (mail, berkas, atau halaman situs) dan Handbook.

**Yang berubah bila dibuat.** Membuat: `src/commands/<nama-tool>.ts` (REPL dan perintah) dan `src/content/global/<nama-tool>-modules.ts`
(data modul). Menambah: satu baris `import "../commands/<nama-tool>.js";` di `src/main/global.ts` dan satu baris di Custom Commands
Registry (`docs/mechanics.md`). Tidak ada kode misi yang berubah perilakunya, kecuali misi yang memakainya.

**Saran urutan kerja.** Prototipe dulu di `src/debug/` di balik `isDebug` (lewat `debug/debug-gate.ts`) dengan 2-3 modul contoh,
live-test teks dan alurnya, baru pindahkan ke `src/commands/` dan daftarkan di `src/main/global.ts`.

**Keputusan yang dibutuhkan.**

1. Nama dan tema tool. Harus punya identitas sendiri, bukan "Metasploit versi 2".
2. Dipakai di misi mana: pengganti Metasploit di satu titik, atau alat tambahan yang berdiri sendiri.
3. Daftar modul awal: berapa, dan tiap satu mewakili apa di cerita.

## 2. Usulan kecil yang masih terbuka

- **Umpan telnet di M2.** Beri banner nyata dan satu user online pada telnet 23 milik WiFi extender (Ghost-Relay), supaya jadi umpan yang
  memberi shell tapi tidak berisi hal penting. Opsional. Menyentuh data topologi M2 (`content/m02/`), jadi M2 perlu dites ulang.

## 3. Aturan penilai (dari diskusi 10 modul)

- Modul hanya langkah terakhir. Yang menarik adalah tumpukan gerbang di sekelilingnya: banner dan versi, port diteruskan, firewall,
  user online. Semuanya sudah jadi mekanik misi.
- Metasploit paling berguna sebagai penutup teka-teki, lemah sebagai teka-teki itu sendiri.
- Tambah host atau modul hanya bila menambah keputusan pemain. Tiga pertanyaan: apakah menambah keputusan atau hanya mengulang, apakah
  isi host membuat sesi berharga, dan apakah gerbangnya berbeda dari host sebelumnya (versi, forward, firewall, online). Kalau semuanya
  "tidak", lewati.
- Empat pola keputusan: dua pintu ke satu host, dua host mirip dengan satu umpan, seberapa jauh melangkah (`guest` atau `rootgrab`), dan
  jalan buntu yang harus dikenali. Banner seperti `8.2p1`, `2.4`, atau `10.1.0` tidak pernah bisa dicocokkan lewat `set Version`, jadi
  sah dipakai sebagai umpan.
- Isi host: tiga berkas per host. Satu petunjuk benar, satu umpan yang masuk akal, dan satu yang baru bermakna bila digabung dengan
  fakta misi lain (BACKTRACE). Batasi 2-3 host Metasploit per misi.
- Tidak menambah objective.

## Rujukan

- `docs/mechanics.md`: registri tool dan Custom Commands Registry.
- `src/commands/open.ts` dan `src/commands/flatline.ts`: pola command yang memancarkan event mod.
- `docs/rules.md`: aturan struktur dan proses; `docs/bugs.md`: fakta engine.

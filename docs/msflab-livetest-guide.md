# MSF-LAB — Panduan Live-Test

Tujuan: menguji 10 modul Metasploit bawaan game pada 10 host sandbox buatan mod
kita. Semua host fiktif. Kolom `Ok?`: ubah `[ ]` menjadi `[x]`, `[-]` = dilewati.

## 1. Custom command `msflab` (buatan mod kita, bukan bawaan game)

| Ketik di terminal | Hasil |
|---|---|
| `msflab up` | Membangun lab: router `198.18.0.1` dan 10 host `198.18.0.2`–`.11`, lalu mencetak daftar `use <modul> \| RHOST \| RPORT \| Version` |
| `msflab` | Mencetak daftar itu lagi (atau "not up") |
| `msflab down` | Membongkar lab |

Baris pertama tiap output `msflab` adalah `msflab rev …` (versi build yang jalan).
**Tanpa `msflab up`, semua tes gagal**: tidak ada host yang bisa ditemukan.

## 2. Langkah

1. `src/guard/flags.ts`: `isDebug = true` (semua misi terkunci). Kembalikan ke
   `false` sebelum commit.
2. `.\build-install.ps1`, tunggu game reload. Log harus memuat
   `[FP][MSFLAB] loaded rev=…`.
3. Di terminal game: `msflab up`. Harus tercetak `MSF-LAB is up.` dan 10 baris
   daftar. Log: `[FP][MSFLAB] up router=198.18.0.1 targets=10`.
4. Cek lab hidup: `nmap 198.18.0.5 -sV` (IP dulu, baru flag; `nmap -sV <ip>`
   ditolak game). Harus muncul baris `22 OPEN ssh OpenSSH 1.0.0`.
5. Uji tiap modul di tabel:

```
metasploit
use <modul>
set RHOST <RHOST>
set RPORT <RPORT>
set Version 1.0.0
exploit
back
```

6. Kalau gagal: satu percobaan saja, salin pesan merahnya. Log kubaca sendiri.
7. Selesai: `msflab down`, lalu `isDebug = false`.

Log (PowerShell terpisah):

```powershell
Get-Content "$env:APPDATA\hackhub\logs\hackhub-$(Get-Date -Format yyyy-MM-dd).log" -Wait -Tail 0 | Select-String '\[FP\]\[MSFLAB\]'
```

## 3. Tabel uji

| Ok? | # | Target | RHOST | RPORT | Modul | Hasil dan catatan |
|---|---|---|---|---|---|---|
| [x] | 1 | Telnet | 198.18.0.2 | 23 | `exploit/telnet/telnet_access` | [*] Command shell session opened (198.18.0.2:23) at 2026-09-30 00:52:27 |
| [x] | 2 | MariaDB | 198.18.0.3 | 3306 | `auxiliary/scanner/mysql/mysql_login` | [*] Command shell session opened (198.18.0.3:3306) at 2026-09-30 00:54:38 |
| [x] | 3 | vsftpd | 198.18.0.4 | 21 | `auxiliary/dos/ftp/vsftpd` | [*] Command shell session opened (198.18.0.4:21) at 2026-09-30 00:55:48 |
| [x] | 4 | OpenSSH | 198.18.0.5 | 22 | `auxiliary/scanner/ssh/ssh_login` | [*] Command shell session opened (198.18.0.5:22) at 2026-09-30 00:56:43 |
| [x] | 5 | RDP | 198.18.0.6 | 3389 | `exploit/rdp/cve_2019_0708_bluekeep` | [*] Command shell session opened (198.18.0.6:3389) at 2026-09-30 00:57:17 |
| [x] | 6 | SMTP | 198.18.0.7 | 25 | `auxiliary/scanner/smtp/smtp_enum` | [*] Command shell session opened (198.18.0.7:25) at 2026-09-30 00:58:47 |
| [x] | 7 | Nginx | 198.18.0.8 | 80 | `exploits/http/nginx_chunked_size` | [*] Command shell session opened (198.18.0.8:80) at 2026-09-30 00:59:41 |
| [x] | 8 | Apache | 198.18.0.9 | 443 | `exploit/multi/http/apache_normalize_path_rce` | [*] Command shell session opened (198.18.0.9:443) at 2026-09-30 01:00:12 |
| [x] | 9 | POP3 | 198.18.0.10 | 110 | `auxiliary/scanner/pop3/capture` | [*] Command shell session opened (198.18.0.10:110) at 2026-09-30 01:00:43 |
| [x] | 10 | IMAP | 198.18.0.11 | 143 | `auxiliary/remote/remote/imap` | [*] Command shell session opened (198.18.0.11:143) at 2026-09-30 01:01:20 |

Putaran pertama gagal semua karena `msflab up` belum dijalankan; hasil itu tidak dihitung.

## 4. Pesan gagal dan artinya

| Pesan | Artinya |
|---|---|
| `Target subnet/router unreachable.` (Telnet) atau `No guest account or online user found.` (modul lain) | Host tidak ditemukan: `msflab up` belum dijalankan, atau RHOST salah |
| `Port N could not be accessed.` | RPORT atau Version salah, atau port tidak aktif. Baris `try` di log menunjukkan port yang dilihat game |
| `Connection blocked by firewall.` | Tidak seharusnya terjadi di lab: temuan |
| Telnet: `No service mapped…`, `Port N is closed…`, `…internal port…`, `No service banner…`, `Service on port…`, `Service version mismatch…` | Tiap pesan menyebut penyebabnya sendiri |

## 5. Tes tambahan (opsional)

| Ok? | Kode | Coba apa | Harusnya |
|---|---|---|---|
| [x] | S1 | `search telnet`, `mariadb`, `ssh`, `rdp`, `smtp`, `http`, `https`, `pop3`, `imap`, `ftp` | Muncul "Matching Modules" yang sesuai |
| [x] | N1 | Modul #4 dengan `set Version 2.0.0` | `Port 22 could not be accessed.` |
| [x] | N2 | Modul #1 dengan `set RPORT 2323` | `No service mapped to port 2323 on host.` |
| [x] | N3 | Modul #7 dengan `set RPORT 443` | `Port 443 could not be accessed.` |

## 6. Yang ingin kuketahui

1. Apakah ke-10 modul lolos, dan apa yang tercetak beserta prompt akhirnya
   (hanya RDP yang kita kenal: `meterpreter >`).
2. Untuk modul non-exploit (`auxiliary/…`): apakah ada baris `success` di log
   dan apakah terbentuk sesi.

## 7. Review

- Ya semua modul lolos ditest
- Ya ada

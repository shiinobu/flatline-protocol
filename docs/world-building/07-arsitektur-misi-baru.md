# 07 — Arsitektur misi baru dan lembar spesifikasi

Status: aturan kerja (DECIDED 2026-10-02: misi baru ditulis sebagai lembar
spesifikasi sebelum kode). Tujuan: M4-M7 sesuai Arsitektur, Mekanik, dan Story
Plot sejak lembar pertama, tanpa redesign berulang seperti M1-M3.

Sumber: `docs/architecture.md` (pipeline), `docs/rules.md`, `docs/bugs.md`
#1-#38, `docs/mechanics.md`, dan `04-web-layer.md` (tier mekanik).

## A. Penyebab redesign M1-M3 menjadi aturan

| Penyebab di M1-M3 | Bug | Aturan untuk misi baru |
|---|---|---|
| Fakta engine ketahuan terlambat | #1, #2, #4, #17, #25, #26, #27, #29, #30, #31, #33 | Setiap langkah dipetakan ke Tier 1 dan butir bug-nya sebelum masuk spec. Langkah Tier 2 dapat lab di `src/debug/` dulu, seperti `msflab` |
| Konteks mod hilang | #6, #19, #20, #22, #36 | Tanpa `await` sebelum `createSubnetNetwork` di handler yang sama. Rantai async di-`await` di dalam handler atau `Run`. Render situs hanya membaca cermin `SharedVariables`, tidak menulis dan tidak mengundi |
| Jaringan dibangun ulang | #21, #32, #35 | Pakai `core/register` (destroy berurutan, `restore`). Perubahan struktur pada save yang sudah berjalan berarti alamat baru |
| Langkah bisa dilompati dan dunia bocor | #38 | Gerbang transitif dan `UnlockSpec` per langkah sejak spec. Domain, fixture, dan halaman terbuka bersama langkahnya, bukan saat dunia dibangun |
| Syarat tersembunyi dan prasyarat rapuh | #34; `rootgrab` jadi prasyarat gerbang (`docs/changelog.md` 2026-10-01) | Langkah opsional tidak pernah masuk rantai gerbang. Setiap prasyarat adalah aksi wajib yang andal (Tier 1) |
| Hanya terminal | umpan balik pemilik proyek 2026-10-01 | Tiap misi punya lapisan visual sejak spec (widget, app, situs, tema) |

## B. Peta berkas per misi

Dari `docs/architecture.md` (pipeline M01-M03):

```text
main/mNN.ts        kelas tipis @RegisterQuest; tiap hook satu baris ke controller
controller/mNN/    index.ts (hook), spec.ts, report.ts, world.ts, listener per fase
content/mNN/       state, gates, network, topology, fixtures, scan, server-files,
                   mail, report, quest, intro (+ database, twotter, ledger bila perlu)
i18n/mNN/          core.ts (en + zh), site.ts, site-keys.ts, twotter.ts
websites/mNN/      situs misi, dibungkus gateMissionPages("mNN", ...)
context/mNN/       konteks per-save (SaveStorage + cermin SharedVariables), bila perlu
```

Modul yang dipakai dua misi atau lebih masuk `global/` pada lapisan yang sama:
`content/global/`, `websites/global/`, `i18n/global/site-keys.ts`, `context/global/`.

Aturan tetap:
- Konten dan logika tidak bercampur. Konten adalah nilai tanpa `this` dan tanpa perilaku quest.
- Arah dependensi tanpa siklus: `main` -> `controller` -> `core` / `components` / `middleware` / `content` / `i18n` / `context`. `core` -> `components`. `context` -> `content`. `websites` -> `content` / `i18n` / `context`. `content` hanya mengimpor tipe dari `core/types.ts`. `core`, `components`, `middleware` tidak pernah mengimpor `controller`, `content`, atau `context`.
- Nama berkas dalam folder misi tanpa awalan misi.
- Setiap berkas yang mendaftarkan sesuatu harus terjangkau dari `src/index.ts`.
- Tanpa komentar di `src/`, tanpa `console.log` (pakai `trace()`), berkas di bawah 800 baris.

## C. Perubahan global saat menambah misi (diverifikasi 2026-10-02)

| Tempat | Perubahan |
|---|---|
| `src/guard/flags.ts` | Tambah kunci di `DEV_FOCUS_QUEST` dan `TESTER_FOCUS_QUEST` (`QuestId` berasal dari kunci itu; paling banyak satu bernilai `true`). `questGate` dipakai `controller/mNN/spec.ts` |
| `src/applications/backtrace-state.ts:8,25` | `BacktraceMissionId` dan status awal |
| `src/applications/backtrace-facts.ts` | `BACKTRACE_KEYS` (daftar kunci berurutan, saat ini `m4: []` di baris 41) dan `buildBacktraceFacts` |
| `src/applications/backtrace.html` | Tampilan misi dan label fakta |
| `src/main/index.ts` | Impor kelas misi |
| `manifest.json` | Deskripsi "across four missions" |
| `src/i18n/global/site-keys.ts` | Gabungan kunci situs semua misi |
| Dokumen | `docs/changelog.md`, `docs/bugs.md`, `docs/network.md`, `docs/story.md` (setelah kunci) |

Dua skema id hidup berdampingan: `QuestId` memakai `m01`..`m04`, sedangkan BACKTRACE memakai `m1`..`m4`.

**Urutan penomoran (DECIDED; spesifikasi M7 di `11-spec-m7.md`).** M4 lama masih `main/m04.ts` dan `content/m04.ts`, dan
berkas global bergantung padanya: `content/global/characters.ts` mengekspor
`M04_ARCHITECT_VPN_IP`, `content/global/mail-senders.ts` mengimpor dari `../m04.js`.
Misi baru memakai id M4-M6, jadi M4 lama dimigrasi dan diganti id menjadi M7 lebih dulu,
supaya id M4 kosong sebelum misi baru dibuat.

## D. Lembar spesifikasi (templat; satu per misi, sebelum kode)

1. **Identitas.** Id, judul, urutan, prasyarat `questGate`, `Abandonable` (tidak, tidak ada misi yang boleh).
2. **Rantai gerbang.** Tabel `langkah | requires | pemicu (event dan filter) | tier dan butir bug | efek` (unlock, kunci BACKTRACE, log, `completeObjective`). Transitif, boolean saja, setiap listener lewat `advanceStep`.
3. **Dunia per langkah (`UnlockSpec`).** Fixture, domain, aturan firewall, port yang terbuka tepat pada langkahnya.
4. **Topologi (`RouterSpec`).** Tipe node (Router, Firewall, Splitter, Device), bentuk Router yang membungkus Device anak, alamat baru (publik dan LAN), port dan versi, pengguna dan kata sandi. `ssh` hanya ke `Device` (#17). Panel `Firewall` memberi `PFSense.*`, panel `Router` memberi `Network.PortChanges` (#31).
5. **Fixture dan data.** `nmap`/`lynx`/`whois`/`geoip`/..., database, berkas server, situs.
6. **BACKTRACE.** Kunci (satu per aksi, `docs/rules.md` §13), fakta tambahan, log pribadi, satu checkpoint pembuktian per kunci, dilacak dari `onAdvance` langkahnya.
7. **Laporan.** Templat mail, kolom, validator, dan balasan "belum waktunya" per langkah.
8. **Teks.** Kunci i18n en dan zh, termasuk kunci situs.
9. **Lapisan visual.** Widget, app, situs, atau tema yang menyertai langkah terminal.
10. **Peta berkas dan perubahan global** (bagian B dan C).
11. **Verifikasi mekanik.** Setiap langkah dipetakan ke Tier 1 dan butir bug. Tier 2 punya rencana lab.
12. **Rencana tes.** Typecheck, harness SDK tiruan (preseden M3), live test (en lalu zh), catatan bug.

## E. Definisi selesai

- `npx tsc -p tsconfig.json --noEmit` bersih. Build dan pasang dijalankan pemilik proyek (`.\build-install.ps1`).
- Zero komentar di `src/`, tanpa `console.log`, berkas di bawah 800 baris.
- Live test lulus dalam bahasa Inggris, lalu dimainkan dalam bahasa Mandarin.
- Review kode dikumpulkan di akhir sesi, bukan setelah tiap perubahan kecil.
- Catatan: `docs/changelog.md` (wajib), `docs/bugs.md` (temuan), `docs/network.md` (topologi), `docs/world-building/` (keputusan).

## F. Urutan kerja tiap misi baru

1. Lab untuk setiap mekanik Tier 2 (`src/debug/`, bebas EKSEKUSI).
2. Lembar spesifikasi, ditinjau pemilik proyek.
3. EKSEKUSI.
4. Implementasi berurutan: `content` -> `i18n` -> `controller` -> `main` -> `websites` -> perubahan global.
5. Typecheck dan harness SDK tiruan.
6. Live test oleh pemilik proyek, temuan ke `docs/bugs.md`.

## G. Komponen yang belum punya rumah di pipeline (PROPOSAL)

- **Kit rival-hacker (M4).** Bagian generik (loop panas dan serangan, kunci desktop, banner) masuk `components/`. Data dan teks di `content/m04/`, perilaku di `controller/m04/`. Rantai async harus di-`await` di dalam handler `Scheduler` atau `Run` (`docs/bugs.md` #19; catatan prototipe di `src/debug/rival-breach.ts`).
- **Situs alat (HoneyCheck, Registry, Archive, Domain index, Claims tracker).** Dipakai lebih dari satu misi, jadi mengikuti konvensi `global/`: situs di `websites/global/<nama>/`, data di `content/global/`, keadaan di `context/global/`. Permanen seperti LedgerVault, tidak lewat `gateMissionPages`. Syaratnya `weblab` lulus (`04-web-layer.md` bagian G).

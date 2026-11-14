# Timeline Pengembangan — Pertemuan 10–16

**Smart Farming Monitoring App** · Kelompok 3 · Workshop Mobile App

| | |
|---|---|
| Diperbarui | Pertemuan 11 |
| Jadwal | Mingguan, Pertemuan 10 sampai 16 |
| Pertemuan 10 | Sudah berlalu — sebagian target tercapai |
| Pertemuan 11 | Pertemuan berjalan saat dokumen ini diperbarui |
| Pertemuan 16 | **UAS — presentasi dan pengumpulan** |

> Penomoran mengikuti pertemuan kuliah, bukan tanggal. Yang menentukan adalah
> urutan dan isi tiap pertemuan. Pertemuan 15 sengaja dibiarkan longgar sebagai
> cadangan — kalau ada yang molor, di situlah tempat menutupnya, bukan di UAS.

---

## 1. Posisi Saat Ini

Timeline ini disusun dari kondisi nyata project, bukan dari rencana awal.
Tiga perubahan besar sejak versi sebelumnya: **komponen hardware sudah lengkap
di tangan**, **seluruh kode dan konfigurasi sudah masuk GitHub** setelah
dipulihkan dari kerusakan laptop, dan **`docs/API-CONTRACT.md` sudah ada**
sehingga firmware punya acuan pasti.

| Sprint PRD | Status | Keterangan |
|---|---|---|
| Sprint 1 — Requirement & Repository | **Selesai** | PRD, struktur repo, kontrak komunikasi; repo sudah terbit di GitHub |
| Sprint 2 — UI/UX | **Selesai sebagian** | 11 layar sudah didesain; 9 temuan masih menunggu revisi, belum ada export baru di repo |
| Sprint 3 — Mobile Development | **Selesai sebagian** | 9 layar terkode, lolos typecheck dan bundling; belum diuji tampilannya di perangkat |
| Sprint 4 — IoT Integration | **Siap mulai** | Komponen lengkap. Folder `iot/` masih kosong, firmware belum ada |
| Sprint 5 — Actuator Control | **Selesai sebagian** | Sisi aplikasi & backend sudah diuji memakai simulator; sisi ESP32 belum ada |
| Sprint 6 — Testing & Finalisasi | **Belum mulai** | `docs/TEST-PLAN.md` belum dibuat |

**Jalur kritis sekarang: firmware dan integrasi, bukan lagi pengadaan.**
Risiko terbesar versi lama — komponen terlambat datang — sudah hilang karena
barang ada di tangan. Yang menggantikannya adalah risiko yang tidak bisa
dibeli: firmware ESP32 belum ditulis sebaris pun, dan format payload-nya
belum dibakukan. Dua pertemuan cadangan sebelum UAS tetap dipertahankan.

### Pemulihan setelah laptop rusak

Laptop Zidan rusak tak lama setelah Pertemuan 10. Berkas yang saat itu belum
ter-commit ikut hilang bersamanya — bukan tertinggal karena lupa di-push,
melainkan memang sudah tidak ada lagi. Yang selamat hanya apa yang sudah
sempat masuk ke GitHub.

Yang hilang dan sudah **dibuat ulang serta ter-commit**:

| Berkas | Perannya |
|---|---|
| `backend/package.json`, `backend/tsconfig.json` | Tanpa ini backend tidak bisa dijalankan dari hasil clone |
| `mobile/package.json`, `mobile/tsconfig.json` | Sama, untuk aplikasi mobile |
| `shared/thresholds.ts` | Satu-satunya tempat angka ambang sensor ditulis |
| `mobile/src/theme.ts` | Token warna dan jarak seluruh layar |
| `.gitignore`, `mobile/.gitignore` | Penjaga agar `.env` dan database tidak ikut ter-commit |
| Ikon aplikasi dan adaptive icon Android | Dirujuk `app.json` |
| `README.md` | Cara menjalankan ketiga bagian |

**Kode intinya tidak ada yang hilang.** Backend dan mobile sudah diuji ulang
dengan `tsc --noEmit` dan **dua-duanya lolos tanpa satu pun error**, dengan
seluruh berkas sumber yang dirujuk commit lama masih lengkap. Jadi kerusakan
laptop memakan berkas konfigurasi, bukan hasil kerja.

Sebagai bagian dari pemulihan, `docs/API-CONTRACT.md` juga sudah ditulis —
dokumen ini dirujuk `docs/PRD.md`, `shared/thresholds.ts`, dan
`docs/UI-UX/README.md`, tapi belum pernah ada isinya. Sekarang isinya
diturunkan langsung dari kode yang berjalan, sehingga Radin punya acuan pasti
untuk format payload ESP32.

**Satu hal yang masih terbuka: riwayat kontribusi.** Radin, Rifki, dan Haris
belum punya satu pun commit di repo. Untuk penilaian per orang, riwayat commit
adalah bukti kontribusi — tanpa itu tidak ada yang bisa menunjukkan siapa
mengerjakan apa.

> **Pelajaran yang langsung berlaku: commit sekecil apa pun lebih baik daripada
> menunggu rapi.** Kerusakan laptop hanya memakan berkas yang belum ter-commit.
> Yang sudah di-push selamat seluruhnya. Inilah alasan aturan commit mingguan
> di Bagian 5 tidak bisa ditawar — bukan demi nilai saja, tapi supaya kejadian
> ini tidak terulang pada bagian yang lebih mahal, misalnya firmware.

---

## 2. Utang dari Pertemuan 10

**Sudah ditutup** sebagai bagian dari pemulihan setelah laptop rusak:

| Anggota | Yang sudah beres | Bukti |
|---|---|---|
| Zidan | Seluruh berkas konfigurasi dibuat ulang dan ter-commit | Repo kini bisa di-`npm install` dan dijalankan dari hasil clone |
| Zidan | `docs/API-CONTRACT.md` ditulis, diturunkan dari kode yang berjalan | Topic, nama field, satuan, format waktu, dan daftar periksa firmware tersedia |
| Zidan | Pesan commit deskriptif menggantikan kebiasaan `all` | Enam commit terpisah per kelompok perubahan |

**Masih terbuka**, harus ditutup di Pertemuan 11 sebelum pekerjaan baru dimulai:

| Anggota | Yang belum beres | Kenapa tidak bisa ditunda |
|---|---|---|
| Radin | Commit pertama ke repo — walau baru berupa inventaris komponen di `iot/README.md` | Belum ada jejak kontribusi sama sekali |
| Rifki | Commit revisi desain: teks threshold `< 30% / 30–70% / > 70%` dan kontrol buzzer tiga tombol | Belum ada export baru di `docs/UI-UX/`; perbaikan masih di Figma saja |
| Haris | Catat kredensial broker MQTT ber-autentikasi di `docs/` | Belum ada berkas kredensial di repo; migrasi broker di Pertemuan 12 bergantung pada ini |
| Haris | Susun `docs/TEST-PLAN.md` | Belum ada; jadi acuan pengujian di Pertemuan 13–14 |

> Semua anggota sudah punya akses collaborator. Belum adanya commit dari tiga
> orang bukan masalah akses, melainkan kebiasaan yang belum terbentuk. Mulai
> Pertemuan 11, pekerjaan yang tidak di-commit dianggap belum ada.

---

## 3. Penyesuaian Pembagian Tugas

Pembagian di PRD Bagian 7 perlu disesuaikan dengan apa yang sudah terjadi.

| Anggota | Peran di PRD | Peran sebenarnya mulai sekarang |
|---|---|---|
| Zidan | Mobile Developer | Mobile **dan** Backend — keduanya sudah dikerjakan sendiri, ditambah dokumen kontrak API |
| Radin | IoT Developer | Tetap: ESP32, sensor, aktuator. **Jalur kritis** |
| Rifki | UI/UX Designer | Tetap: desain, revisi, ditambah materi presentasi |
| Haris | Backend & Integration | Backend sudah dikerjakan Zidan, sehingga Haris bergeser ke **infrastruktur MQTT, pengujian integrasi, dan dokumentasi** |

Pergeseran Haris bukan pengurangan beban. Tiga hal yang kini jadi
tanggung jawabnya — broker yang andal, pengujian sistem menyeluruh, dan
laporan akhir — justru pekerjaan yang paling sering terbengkalai menjelang
presentasi karena tidak ada yang merasa memilikinya.

Haris juga menjadi **pendamping Radin** di jalur IoT. Dua orang di jalur kritis
mengurangi risiko project berhenti kalau satu orang berhalangan.

---

## 4. Timeline per Pertemuan

### Pertemuan 10 — sudah berlalu

**Target semula: semua kode masuk GitHub, dan kekurangan hardware diketahui persis.**

| Hasil | Status |
|---|---|
| Repository GitHub terbit, tiga anggota diundang sebagai collaborator | **Tercapai** |
| Kode backend, mobile, shared, dan docs ter-commit | **Sebagian** — berkas konfigurasi belum ter-commit saat laptop rusak, lalu hilang. Sudah dipulihkan di Pertemuan 11 |
| Komponen diinventaris dan yang kurang dibeli | **Tercapai** — komponen kini lengkap di tangan |
| Revisi desain threshold dan kontrol buzzer | **Belum ter-commit** |
| Kredensial broker MQTT ber-autentikasi | **Belum tercatat di repo** |

Sisa yang belum beres menjadi daftar utang di Bagian 2.

---

### Pertemuan 11 — pertemuan berjalan

**Target: semua sensor terbaca benar di serial monitor, dan utang Pertemuan 10 habis.**

| Anggota | Tugas | Hasil yang harus ada |
|---|---|---|
| Radin | Pasang Arduino IDE atau PlatformIO, uji upload program kosong ke ESP32 | Serial monitor menampilkan output |
| Radin | Rangkai DHT11, soil moisture, LDR, dan buzzer ke ESP32 | Foto rangkaian + diagram pin di `iot/README.md` |
| Radin | Program pembacaan keempat sensor, tampilkan di serial monitor | `iot/src/main.cpp` ter-commit |
| Radin | **Kalibrasi soil moisture dua titik**: sensor di udara terbuka = 0%, dicelup air = 100% | Nilai ADC kedua kondisi tercatat; pembacaan sudah dalam persen |
| Radin | Uji buzzer menyala saat kelembapan tanah di bawah 30% | Video pendek sebagai bukti |
| Zidan | ~~Pulihkan berkas konfigurasi yang hilang dan commit~~ | **Selesai** — typecheck backend dan mobile lolos tanpa error |
| Zidan | ~~Tulis `docs/API-CONTRACT.md`~~ | **Selesai** — termasuk daftar periksa firmware di Bagian 6 |
| Zidan | Jalankan aplikasi di HP, catat bagian tampilan yang meleset dari desain | Daftar temuan tampilan di issue GitHub |
| Zidan | Tambah tabel `notifications` di database dan endpoint pembacaannya | Layar Notifikasi tidak lagi kosong setelah app ditutup |
| Rifki | Commit revisi threshold `< 30% / 30–70% / > 70%` dan kontrol buzzer tiga tombol ON/OFF/AUTO | Export PNG baru di `docs/UI-UX/` |
| Rifki | Desain ulang 5 layar yang masih memakai navigasi template: Notifikasi, Profile, My, Setting, Konfirmasi Logout | Export PNG baru di `docs/UI-UX/` |
| Rifki | Lengkapi nama font, ukuran, dan jarak dari Figma | Dicatat di `docs/UI-UX/README.md` |
| Haris | Daftar akun broker MQTT ber-autentikasi (EMQX Serverless gratis), siapkan kredensial | Host, port, username, password tercatat di `docs/` |
| Haris | Uji broker memakai MQTT Explorer di laptop | Tangkapan layar pesan uji masuk |
| Haris | Susun matriks pengujian: daftar skenario yang harus lolos sebelum UAS | `docs/TEST-PLAN.md` |
| Haris | Clone repo dari nol dan coba jalankan sendiri mengikuti README | Laporan bagian README yang kurang jelas |

**Ditunjukkan saat pertemuan:** serial monitor menampilkan empat nilai sensor
dengan angka yang masuk akal, buzzer berbunyi saat tanah kering, dan hasil
clone repo yang bersih bisa dijalankan di laptop anggota lain.

> **Kalibrasi menentukan apakah angka 30% punya arti.** Tanpa kalibrasi, nilai
> ADC mentah tidak berhubungan dengan kelembapan sebenarnya, dan seluruh logika
> threshold di `shared/thresholds.ts` jadi tidak berdasar.

> **Dua penghalang terbesar Pertemuan 11 sudah hilang.** Repo kini bisa
> dijalankan dari hasil clone, dan `API-CONTRACT.md` sudah tersedia sebelum
> Radin menyentuh bagian MQTT — jadi tidak ada lagi yang perlu ditebak soal
> format payload. Yang tersisa dan tidak boleh mundur hanya **firmware sensor
> dari Radin**, karena itulah satu-satunya yang mengunci Pertemuan 12. Revisi
> 5 layar dan pencatatan font boleh bergeser ke Pertemuan 12 kalau waktu
> tidak cukup.

---

### Pertemuan 12 — data nyata masuk aplikasi

**Target: data dari ESP32 tampil di aplikasi.**

Ini pertemuan terpenting. Di sinilah simulator digantikan perangkat sungguhan.

| Anggota | Tugas | Hasil yang harus ada |
|---|---|---|
| Radin | Sambungkan ESP32 ke WiFi | ESP32 mendapat IP, tercetak di serial monitor |
| Radin | Publish telemetry ke MQTT sesuai format di `docs/API-CONTRACT.md` | Pesan terlihat di MQTT Explorer |
| Radin | Tambahkan Last Will & Testament supaya backend tahu kalau alat mati | Status `offline` terkirim saat ESP32 dicabut |
| Haris | Verifikasi payload ESP32 **sama persis** dengan kontrak: nama field, satuan, format waktu | Catatan verifikasi |
| Haris | Pindahkan backend dari broker publik `broker.emqx.io` ke broker ber-autentikasi | Backend tetap jalan dengan kredensial baru |
| Zidan | Matikan simulator, uji aplikasi dengan data ESP32 asli | Aplikasi menampilkan data nyata |
| Zidan | Tangani kasus perangkat offline dan data belum masuk | Aplikasi tidak error, menampilkan pesan yang jelas |
| Rifki | Mulai susun slide presentasi dan ikon aplikasi | Draf slide |

**Ditunjukkan saat pertemuan:** sensor disentuh atau tanah disiram, angka di
aplikasi berubah dalam hitungan detik.

> Kalau payload ESP32 berbeda sedikit saja dari kontrak — misalnya mengirim
> nilai ADC mentah, bukan persen — backend akan menolaknya dan data tidak akan
> muncul. Verifikasi oleh Haris ada untuk menangkap hal ini lebih cepat
> daripada menebak-nebak.

---

### Pertemuan 13 — kontrol dua arah

**Target: perintah dari aplikasi membunyikan buzzer sungguhan.**

| Anggota | Tugas | Hasil yang harus ada |
|---|---|---|
| Radin | ESP32 subscribe ke topic command dan menanggapi ON, OFF, dan AUTO | Buzzer menyala dari aplikasi |
| Radin | Mode AUTO mengembalikan kendali otomatis ESP32 | Setelah AUTO, buzzer kembali berbunyi sendiri saat tanah kering |
| Radin | Kirim status buzzer di setiap telemetry | Aplikasi menampilkan kondisi buzzer yang sebenarnya |
| Zidan | Uji tombol kontrol dengan perangkat nyata, pastikan indikator "menunggu konfirmasi" bekerja | Commit perbaikan bila perlu |
| Zidan | Uji fitur histori dengan data nyata yang sudah terkumpul beberapa hari | Tabel riwayat terisi benar |
| Haris | Jalankan seluruh skenario di `docs/TEST-PLAN.md`, catat yang gagal | Daftar bug berprioritas |
| Haris | Uji alat dibiarkan menyala 24 jam, periksa apakah koneksi bertahan | Laporan ketahanan |
| Rifki | Finalisasi slide, poster, dan dokumentasi desain | Slide lengkap |

**Ditunjukkan saat pertemuan:** demo penuh — tekan ON di HP, buzzer berbunyi;
tekan OFF, berhenti; tekan AUTO, siram tanah, alarm berbunyi sendiri.

> Mulai pertemuan ini **sistem sudah utuh**. Tiga pertemuan berikutnya murni
> untuk perbaikan dan persiapan, bukan menambah fitur. Kalau sampai di sini
> ada yang belum jalan, itu sinyal untuk mengurangi ruang lingkup, bukan
> menambah jam kerja.

---

### Pertemuan 14 — bug habis, APK jadi

**Target: tidak ada bug prioritas tinggi, APK bisa dipasang, laporan mulai disusun.**

| Anggota | Tugas | Hasil yang harus ada |
|---|---|---|
| Zidan | Perbaiki bug dari daftar Haris | Semua bug prioritas tinggi tertutup |
| Zidan | Build APK dengan EAS, uji pasang di HP anggota lain | File APK bisa dipasang dan berjalan |
| Radin | Rapikan rangkaian supaya aman dibawa dan tidak lepas saat demo | Rangkaian terpasang kokoh |
| Radin | Lengkapi dokumentasi perangkat keras: diagram pin, daftar komponen, cara upload, nilai kalibrasi | `iot/README.md` lengkap |
| Haris | Susun laporan akhir: arsitektur, hasil pengujian, kendala dan solusinya | Draf laporan lengkap |
| Haris | Uji ulang seluruh skenario pada APK hasil build, bukan pada mode pengembangan | Matriks pengujian terisi penuh |
| Rifki | Slide final, latihan alur presentasi | Slide siap pakai |

---

### Pertemuan 15 — gladi bersih dan cadangan

**Target: sekali jalan tanpa kendala, semua dokumen selesai.**

Pertemuan ini sengaja tidak diisi pekerjaan baru. Isinya gladi bersih dan
ruang untuk menutup apa pun yang molor di pertemuan sebelumnya.

| Anggota | Tugas | Hasil yang harus ada |
|---|---|---|
| **Semua** | **Gladi bersih lengkap**, memakai skenario presentasi sebenarnya | Sekali jalan tanpa kendala |
| Semua | Tutup sisa pekerjaan yang molor dari Pertemuan 11–14 | Tidak ada item terbuka menjelang UAS |
| Zidan | Siapkan rencana cadangan demo: data histori yang sudah terkumpul, siap ditampilkan kalau alat bermasalah | Skenario cadangan teruji |
| Haris | Laporan akhir final, matriks pengujian terisi lengkap | Laporan siap dikumpulkan |
| Rifki | Latihan presentasi penuh dengan pembagian waktu per orang | Durasi presentasi terukur |

> **Gladi bersih wajib memakai hotspot dari HP, bukan WiFi kampus.** Banyak
> jaringan kampus memblokir perangkat saling berhubungan, sehingga HP tidak
> bisa menjangkau laptop. Kalau baru ketahuan saat UAS, demo gagal total
> padahal sistemnya tidak bermasalah.

---

### Pertemuan 16 — UAS

**Target: presentasi dan pengumpulan.**

| Anggota | Bagian presentasi |
|---|---|
| Zidan | Demo aplikasi: login, dashboard, monitoring, kontrol buzzer, histori |
| Radin | Jelaskan perangkat keras: sensor, kalibrasi, logika buzzer otomatis |
| Rifki | Jelaskan proses desain: wireframe, hasil akhir, alasan keputusan desain |
| Haris | Jelaskan arsitektur dan hasil pengujian: alur MQTT, backend, keandalan |

**Yang dikumpulkan:** link repository, APK, laporan akhir, slide, PRD, dokumen
kontrak komunikasi, dan `docs/API-CONTRACT.md`.

**Sebutkan terus terang saat presentasi:** layar Monitoring kamera adalah
rancangan pengembangan lanjutan, bukan fitur yang sudah berjalan. Menjelaskan
batas ruang lingkup dengan jujur jauh lebih baik daripada ketahuan saat sesi
tanya jawab.

---

## 5. Yang Harus Dilakukan Setiap Anggota Setiap Minggu

Berlaku untuk semua, setiap pertemuan, tanpa kecuali:

- **Commit ke GitHub minimal sekali seminggu** dengan pesan commit yang
  menjelaskan apa yang dikerjakan — bukan `all` atau `update`. Ini bukti
  kontribusi per orang, dan sampai Pertemuan 10 baru satu orang yang punya.
- **Catat kendala di issue GitHub**, jangan disimpan sendiri sampai pertemuan
  berikutnya.
- **Kabari kelompok dalam 1×24 jam** kalau target minggu itu tidak akan
  tercapai. Keterlambatan yang diketahui lebih awal masih bisa diatur ulang;
  yang baru ketahuan saat pertemuan tidak bisa.

---

## 6. Risiko dan Penanganannya

| Risiko | Dampak | Penanganan |
|---|---|---|
| Firmware ESP32 belum ditulis sebaris pun | Jalur kritis mundur, integrasi Pertemuan 12 gagal | Komponen sudah lengkap, jadi tidak ada alasan menunda; Haris mendampingi Radin mulai Pertemuan 11 |
| **Perangkat kerja rusak lagi** | Pekerjaan yang belum ter-commit hilang permanen — sudah sekali terjadi | Commit dan push setiap selesai satu bagian, jangan menunggu rapi. Yang ada di GitHub selamat; yang di laptop saja tidak |
| Hanya satu anggota yang punya commit | Penilaian kontribusi per orang tidak punya bukti | Tiap anggota commit minimal sekali per pertemuan, mulai Pertemuan 11 |
| Firmware ESP32 hilang kalau laptop Radin bermasalah | Jalur kritis mundur dari nol, tidak ada cadangan | `iot/src/main.cpp` di-commit sejak versi pertama yang bisa compile, walau belum sempurna |
| ~~`API-CONTRACT.md` belum ada~~ | — | **Teratasi** — sudah ditulis dan diturunkan dari kode yang berjalan |
| ~~`package.json` belum ter-commit~~ | — | **Teratasi** — dipulihkan dan ter-commit; sisa verifikasi: Haris clone bersih lalu menjalankannya |
| Sensor rusak atau salah baca | Integrasi gagal di Pertemuan 12 | Siapkan DHT11 dan soil moisture **cadangan** — harganya murah, jauh lebih murah daripada kehilangan satu pertemuan |
| Kalibrasi mengubah angka threshold | Tampilan dan firmware tidak sinkron | Angka hanya ada di `shared/thresholds.ts`; ubah di satu tempat saja |
| WiFi kampus memblokir koneksi HP–laptop | Demo gagal saat UAS | Gladi bersih Pertemuan 15 memakai hotspot HP; hotspot jadi rencana utama, bukan cadangan |
| Hanya Zidan yang paham mobile dan backend | Project berhenti kalau Zidan berhalangan | README sudah memuat cara menjalankan; Haris mencobanya sendiri dari clone bersih di Pertemuan 11 |
| Kelompok lain memakai topic MQTT yang sama | Data tercampur saat demo | Pindah ke broker ber-autentikasi di Pertemuan 12 |
| Fitur bertambah di tengah jalan | Tidak selesai tepat waktu | Setelah Pertemuan 13 tidak ada fitur baru, hanya perbaikan |

---

## 7. Pemetaan ke Sprint PRD

| Sprint PRD | Diselesaikan pada |
|---|---|
| Sprint 1 — Requirement & Repository | Pertemuan 10, dirapikan di Pertemuan 11 |
| Sprint 2 — UI/UX | Revisi selesai Pertemuan 11–12 |
| Sprint 3 — Mobile Development | Penyempurnaan Pertemuan 11–12 |
| Sprint 4 — IoT Integration | Pertemuan 11–12 |
| Sprint 5 — Actuator Control | Pertemuan 13 |
| Sprint 6 — Testing & Finalisasi | Pertemuan 14–15 |
| Presentasi & pengumpulan | Pertemuan 16 (UAS) |

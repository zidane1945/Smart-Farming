# Timeline Pengembangan — 6 Pertemuan

**Smart Farming Monitoring App** · Kelompok 3 · Workshop Mobile App

| | |
|---|---|
| Disusun | 31 Oktober 2026 |
| Jadwal | Mingguan, 6 pertemuan |
| Pertemuan 1 | 7 November 2026 |
| Presentasi akhir | 12 Desember 2026 |

> Tanggal menyesuaikan hari kuliah yang berlaku. Yang penting adalah urutan
> dan isi tiap pertemuan, bukan tanggal persisnya.

---

## 1. Posisi Saat Ini

Timeline ini disusun dari kondisi nyata project, bukan dari rencana awal.
Beberapa sprint di PRD sudah terlampaui, satu sprint sama sekali belum mulai.

| Sprint PRD | Status | Keterangan |
|---|---|---|
| Sprint 1 — Requirement & Repository | **Selesai** | PRD, struktur repo, kontrak komunikasi |
| Sprint 2 — UI/UX | **Selesai sebagian** | 11 layar sudah didesain; 9 temuan menunggu revisi |
| Sprint 3 — Mobile Development | **Selesai sebagian** | 9 layar terkode, lolos typecheck dan bundling; belum diuji tampilannya di perangkat |
| Sprint 4 — IoT Integration | **Belum mulai** | Folder `iot/` masih kosong |
| Sprint 5 — Actuator Control | **Selesai sebagian** | Sisi aplikasi & backend sudah diuji memakai simulator; sisi ESP32 belum ada |
| Sprint 6 — Testing & Finalisasi | **Belum mulai** | — |

**Jalur kritis: IoT.** Semua bagian lain sudah punya pengganti sementara
(simulator), sehingga bisa jalan tanpa perangkat keras. IoT tidak punya
pengganti — kalau molor, tidak ada yang bisa menutupi. Karena itu jalur ini
dijadwalkan paling awal dan diberi dua minggu cadangan sebelum presentasi.

**Catatan: repository belum punya satu pun commit.** Seluruh kode masih berada
di komputer lokal. Untuk penilaian per orang, riwayat GitHub adalah bukti
kontribusi — selama belum di-commit, tidak ada jejak siapa mengerjakan apa.
Ini jadi item pertama di Pertemuan 1 dan berlaku untuk semua anggota setiap
minggu.

---

## 2. Penyesuaian Pembagian Tugas

Pembagian di PRD Bagian 7 perlu disesuaikan dengan apa yang sudah terjadi.

| Anggota | Peran di PRD | Peran sebenarnya mulai sekarang |
|---|---|---|
| Zidan | Mobile Developer | Mobile **dan** Backend — keduanya sudah dikerjakan sendiri |
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

## 3. Timeline per Pertemuan

### Pertemuan 1 — 7 November

**Target: semua kode masuk GitHub, dan kekurangan hardware diketahui persis.**

| Anggota | Tugas | Hasil yang harus ada |
|---|---|---|
| Zidan | Commit seluruh kode yang sudah dibuat, buat repository GitHub, undang tiga anggota lain sebagai collaborator | Repo berisi `backend/`, `mobile/`, `shared/`, `docs/`; semua anggota punya akses |
| Zidan | Jalankan aplikasi di HP, catat bagian tampilan yang meleset dari desain | Daftar temuan tampilan di issue GitHub |
| Radin | Inventaris komponen: ESP32, DHT11, soil moisture, LDR, buzzer, breadboard, kabel jumper | Daftar tertulis: ada apa, kurang apa |
| Radin | **Beli komponen yang kurang pada hari itu juga** | Bukti pemesanan |
| Radin | Pasang Arduino IDE atau PlatformIO, uji upload program kosong ke ESP32 | Serial monitor menampilkan output |
| Rifki | Perbaiki teks threshold di `Tanaman.png` jadi `< 30% / 30–70% / > 70%` | File desain diperbarui |
| Rifki | Ubah kontrol buzzer jadi tiga tombol: ON, OFF, AUTO | File desain diperbarui |
| Haris | Daftar akun broker MQTT dengan autentikasi (EMQX Serverless gratis), siapkan kredensial | Host, port, username, password tercatat di `docs/` |
| Haris | Uji broker memakai MQTT Explorer di laptop | Tangkapan layar pesan uji masuk |

**Ditunjukkan saat pertemuan:** link repository, aplikasi berjalan di HP memakai
simulator, daftar belanja komponen.

> **Pengadaan komponen adalah risiko terbesar minggu ini.** Pengiriman bisa
> 3–7 hari. Kalau pembelian mundur satu minggu saja, seluruh jalur IoT ikut
> mundur dan cadangan waktu habis.

---

### Pertemuan 2 — 14 November

**Target: semua sensor terbaca benar di serial monitor.**

| Anggota | Tugas | Hasil yang harus ada |
|---|---|---|
| Radin | Rangkai DHT11, soil moisture, LDR, dan buzzer ke ESP32 | Foto rangkaian + diagram pin di `docs/` |
| Radin | Program pembacaan keempat sensor, tampilkan di serial monitor | `iot/src/main.cpp` ter-commit |
| Radin | **Kalibrasi soil moisture dua titik**: sensor di udara terbuka = 0%, dicelup air = 100% | Nilai ADC kedua kondisi tercatat; pembacaan sudah dalam persen |
| Radin | Uji buzzer menyala saat kelembapan tanah di bawah 30% | Video pendek sebagai bukti |
| Zidan | Perbaiki tampilan sesuai temuan Pertemuan 1 | Commit perbaikan |
| Zidan | Tambah tabel `notifications` di database dan endpoint pembacaannya | Layar Notifikasi tidak lagi kosong setelah app ditutup |
| Rifki | Desain ulang 5 layar yang masih memakai navigasi template: Notifikasi, Profile, My, Setting, Konfirmasi Logout | Export PNG baru di `docs/UI-UX/` |
| Rifki | Lengkapi nama font, ukuran, dan jarak dari Figma | Dicatat di `docs/UI-UX/README.md` |
| Haris | Susun matriks pengujian: daftar skenario yang harus lolos sebelum presentasi | `docs/TEST-PLAN.md` |
| Haris | Dampingi Radin menguji pembacaan sensor | — |

**Ditunjukkan saat pertemuan:** serial monitor menampilkan empat nilai sensor
dengan angka yang masuk akal, buzzer berbunyi saat tanah kering.

> **Kalibrasi menentukan apakah angka 30% punya arti.** Tanpa kalibrasi, nilai
> ADC mentah tidak berhubungan dengan kelembapan sebenarnya, dan seluruh logika
> threshold jadi tidak berdasar.

---

### Pertemuan 3 — 21 November

**Target: data nyata dari ESP32 tampil di aplikasi.**

Ini pertemuan terpenting. Di sinilah simulator digantikan perangkat sungguhan.

| Anggota | Tugas | Hasil yang harus ada |
|---|---|---|
| Radin | Sambungkan ESP32 ke WiFi | ESP32 mendapat IP, tercetak di serial monitor |
| Radin | Publish telemetry ke MQTT sesuai format di `docs/API-CONTRACT.md` | Pesan terlihat di MQTT Explorer |
| Radin | Tambahkan Last Will & Testament supaya backend tahu kalau alat mati | Status `offline` terkirim saat ESP32 dicabut |
| Haris | Verifikasi payload ESP32 **sama persis** dengan kontrak: nama field, satuan, format waktu | Catatan verifikasi |
| Haris | Pindahkan backend dari broker publik ke broker ber-autentikasi | Backend tetap jalan dengan kredensial baru |
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

### Pertemuan 4 — 28 November

**Target: perintah dari aplikasi membunyikan buzzer sungguhan.**

| Anggota | Tugas | Hasil yang harus ada |
|---|---|---|
| Radin | ESP32 subscribe ke topic command dan menanggapi ON, OFF, dan AUTO | Buzzer menyala dari aplikasi |
| Radin | Mode AUTO mengembalikan kendali otomatis ESP32 | Setelah AUTO, buzzer kembali berbunyi sendiri saat tanah kering |
| Radin | Kirim status buzzer di setiap telemetry | Aplikasi menampilkan kondisi buzzer yang sebenarnya |
| Zidan | Uji tombol kontrol dengan perangkat nyata, pastikan indikator "menunggu konfirmasi" bekerja | Commit perbaikan bila perlu |
| Zidan | Uji fitur histori dengan data nyata yang sudah terkumpul beberapa hari | Tabel riwayat terisi benar |
| Haris | Jalankan seluruh skenario di `TEST-PLAN.md`, catat yang gagal | Daftar bug berprioritas |
| Haris | Uji alat dibiarkan menyala 24 jam, periksa apakah koneksi bertahan | Laporan ketahanan |
| Rifki | Finalisasi slide, poster, dan dokumentasi desain | Slide lengkap |

**Ditunjukkan saat pertemuan:** demo penuh — tekan ON di HP, buzzer berbunyi;
tekan OFF, berhenti; tekan AUTO, siram tanah, alarm berbunyi sendiri.

> Mulai pertemuan ini **sistem sudah utuh**. Dua pertemuan berikutnya murni
> untuk perbaikan dan persiapan, bukan menambah fitur. Kalau sampai di sini
> ada yang belum jalan, itu sinyal untuk mengurangi ruang lingkup, bukan
> menambah jam kerja.

---

### Pertemuan 5 — 5 Desember

**Target: bug habis, APK jadi, laporan selesai.**

| Anggota | Tugas | Hasil yang harus ada |
|---|---|---|
| Zidan | Perbaiki bug dari daftar Haris | Semua bug prioritas tinggi tertutup |
| Zidan | Build APK dengan EAS, uji pasang di HP anggota lain | File APK bisa dipasang dan berjalan |
| Radin | Rapikan rangkaian supaya aman dibawa dan tidak lepas saat demo | Rangkaian terpasang kokoh |
| Radin | Tulis dokumentasi perangkat keras: diagram pin, daftar komponen, cara upload | `iot/README.md` |
| Haris | Susun laporan akhir: arsitektur, hasil pengujian, kendala dan solusinya | Laporan lengkap |
| Haris | Uji ulang seluruh skenario pada APK hasil build, bukan pada mode pengembangan | Matriks pengujian terisi penuh |
| Rifki | Slide final, latihan alur presentasi | Slide siap pakai |
| **Semua** | **Gladi bersih lengkap**, memakai skenario presentasi sebenarnya | Sekali jalan tanpa kendala |

> **Gladi bersih wajib memakai hotspot dari HP, bukan WiFi kampus.** Banyak
> jaringan kampus memblokir perangkat saling berhubungan, sehingga HP tidak
> bisa menjangkau laptop. Kalau baru ketahuan saat presentasi, demo gagal total
> padahal sistemnya tidak bermasalah.

---

### Pertemuan 6 — 12 Desember

**Target: presentasi.**

| Anggota | Bagian presentasi |
|---|---|
| Zidan | Demo aplikasi: login, dashboard, monitoring, kontrol buzzer, histori |
| Radin | Jelaskan perangkat keras: sensor, kalibrasi, logika buzzer otomatis |
| Rifki | Jelaskan proses desain: wireframe, hasil akhir, alasan keputusan desain |
| Haris | Jelaskan arsitektur dan hasil pengujian: alur MQTT, backend, keandalan |

**Yang dikumpulkan:** link repository, APK, laporan akhir, slide, PRD, dan
dokumen kontrak komunikasi.

**Sebutkan terus terang saat presentasi:** layar Monitoring kamera adalah
rancangan pengembangan lanjutan, bukan fitur yang sudah berjalan. Menjelaskan
batas ruang lingkup dengan jujur jauh lebih baik daripada ketahuan saat sesi
tanya jawab.

---

## 4. Yang Harus Dilakukan Setiap Anggota Setiap Minggu

Berlaku untuk semua, setiap pertemuan, tanpa kecuali:

- **Commit ke GitHub minimal sekali seminggu** dengan pesan commit yang
  menjelaskan apa yang dikerjakan. Ini bukti kontribusi per orang.
- **Catat kendala di issue GitHub**, jangan disimpan sendiri sampai pertemuan
  berikutnya.
- **Kabari kelompok dalam 1×24 jam** kalau target minggu itu tidak akan
  tercapai. Keterlambatan yang diketahui lebih awal masih bisa diatur ulang;
  yang baru ketahuan saat pertemuan tidak bisa.

---

## 5. Risiko dan Penanganannya

| Risiko | Dampak | Penanganan |
|---|---|---|
| Komponen terlambat datang | Jalur kritis mundur, cadangan habis | Beli di Pertemuan 1, jangan ditunda; simulator menjaga bagian lain tetap bisa dikerjakan |
| Sensor rusak atau salah baca | Integrasi gagal di Pertemuan 3 | Beli DHT11 dan soil moisture **cadangan** — harganya murah, jauh lebih murah daripada kehilangan satu minggu |
| Kalibrasi mengubah angka threshold | Tampilan dan firmware tidak sinkron | Angka hanya ada di `shared/thresholds.ts`; ubah di satu tempat saja |
| WiFi kampus memblokir koneksi HP–laptop | Demo gagal | Gladi bersih memakai hotspot HP; siapkan hotspot sebagai rencana utama saat presentasi |
| Hanya Zidan yang paham mobile dan backend | Project berhenti kalau Zidan berhalangan | Zidan menulis catatan cara menjalankan; Haris mencobanya sendiri di Pertemuan 2 |
| Kelompok lain memakai topic MQTT yang sama | Data tercampur saat demo | Pindah ke broker ber-autentikasi di Pertemuan 3 |
| Fitur bertambah di tengah jalan | Tidak selesai tepat waktu | Setelah Pertemuan 4 tidak ada fitur baru, hanya perbaikan |

---

## 6. Pemetaan ke Sprint PRD

| Sprint PRD | Diselesaikan pada |
|---|---|
| Sprint 1 — Requirement & Repository | Sudah selesai, dirapikan di Pertemuan 1 |
| Sprint 2 — UI/UX | Revisi selesai Pertemuan 2 |
| Sprint 3 — Mobile Development | Penyempurnaan Pertemuan 1–2 |
| Sprint 4 — IoT Integration | Pertemuan 2–3 |
| Sprint 5 — Actuator Control | Pertemuan 4 |
| Sprint 6 — Testing & Finalisasi | Pertemuan 5–6 |

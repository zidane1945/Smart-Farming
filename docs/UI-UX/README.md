# Desain UI/UX — Catatan Implementasi

Folder ini berisi export desain dari Figma. Dokumen ini merangkum dua hal:
**design token** yang dipakai saat implementasi, dan **daftar temuan** yang
perlu diputuskan bersama sebelum layarnya dikodekan.

## Daftar Layar

| File | Layar | Status |
|---|---|---|
| `home.png` | Beranda / Dashboard | Siap dikodekan |
| `Monitoring.png` | Monitoring kamera ESP32-CAM | Perlu keputusan ruang lingkup |
| `kontrol Buzzer.png` | Kontrol Buzzer — kondisi mati | Siap dikodekan |
| `kontrol Buzzer-1.png` | Kontrol Buzzer — kondisi aktif | Siap dikodekan |
| `Riwayat.png` | Riwayat Monitoring | Siap dikodekan |
| `Tanaman.png` | Status Tanaman | Siap, tapi angka threshold bentrok |
| `Notifikasi.png` | Daftar notifikasi | Navigasi bawah beda sendiri |
| `Profile.png` | Menu profil | Navigasi bawah beda sendiri |
| `My.png` | Detail profil | Navigasi bawah beda sendiri |
| `Setting.png` | Pengaturan | Navigasi bawah beda sendiri |
| `Konfir Log.png` | Dialog konfirmasi logout | Navigasi bawah beda sendiri |

**Belum ada: layar Login.** Padahal PRD Bagian 5.1 mensyaratkannya dan backend
sudah menyediakan endpoint-nya.

---

## Design Token

Nilai di bawah diambil langsung dari pixel file PNG, jadi sudah persis sama
dengan desain — bukan perkiraan.

### Warna

| Token | Hex | Dipakai di |
|---|---|---|
| `primary` | `#336EE4` | Panel biru besar, latar utama semua layar |
| `accent` | `#FFF600` | Teks "LIVE DATA", subjudul kuning di header layar |
| `surface` | `#FFFFFF` | Kartu sensor, kartu kontrol, navigasi bawah |
| `ink` | `#203D34` | Teks utama, angka sensor |
| `muted` | `#8B9D94` | Label sensor, teks sekunder |
| `success` | `#79AA60` | Progress bar, teks pill status |
| `successBg` | `#DDF0D1` | Latar pill "NORMAL" |
| `successSoft` | `#F3FAF0` | Latar kartu status kondisi tanah |
| `tableHeader` | `#ECF6E8` | Baris kepala tabel riwayat |
| `forest` | `#2B5E48` | Kartu hijau tua di Status Tanaman |
| `lime` | `#B9E45B` | Bar progress di dalam kartu hijau tua |
| `tabActiveBg` | `#EFEFEF` | Latar tab yang sedang aktif |
| `tabActiveInk` | `#194D38` | Ikon & label tab aktif |

Chip ikon pada kartu sensor memakai warna lembut berbeda per sensor:

| Sensor | Latar chip |
|---|---|
| Suhu | `#FFF6ED` (oranye muda) |
| Kelembapan udara | biru muda |
| Kelembapan tanah | `#A2E3D0` (toska muda) |
| Intensitas cahaya | `#FFFAE9` (kuning muda) |

> **Dua pasang warna masih kembar beda tipis.** Kartu hijau tua di
> `Tanaman.png` adalah `#2B5E48` sedangkan di `Monitoring.png` `#194F38`; lime
> di `Tanaman.png` `#B9E45B` sedangkan di `Monitoring.png` `#C0DF7A`. Beda
> ini kemungkinan tidak disengaja. Implementasi memakai satu nilai saja
> (`#2B5E48` dan `#B9E45B`) kecuali Rifki memang menghendaki keduanya berbeda.

### Tipografi dan bentuk

Belum diambil dari Figma. Perlu dilengkapi Rifki: nama font, ukuran judul,
label, dan angka sensor, serta corner radius kartu dan jarak antar kartu.
Sementara itu implementasi memakai perkiraan dari proporsi gambar.

---

## Temuan yang Perlu Diputuskan

### 1. Layar Login belum ada

PRD Bagian 5.1 mewajibkan login, dan backend sudah punya
`POST /api/auth/login` lengkap dengan JWT. Yang ada di folder ini hanya
konfirmasi **logout** (`Konfir Log.png`).

**Keputusan:** layar login dibuat lebih dulu mengikuti gaya yang sudah ada —
panel biru `#336EE4`, kartu putih, tombol hijau `#79AA60`. Rifki silakan
merapikan kalau ada yang kurang pas; strukturnya sudah jadi sehingga alur
aplikasi bisa diuji utuh dari sekarang.

### 2. Angka threshold bentrok dengan kontrak

`Tanaman.png` menampilkan ke pengguna:

```
KERING < 25%     IDEAL 25–60%     BASAH > 60%
```

Sedangkan `docs/API-CONTRACT.md` Bagian 3 dan kode backend memakai:

```
KERING < 30%     NORMAL 30–70%    BASAH > 70%
```

Keduanya tidak boleh jalan bersamaan — kalau dibiarkan, aplikasi bisa
menampilkan "Normal" padahal buzzer sedang berbunyi.

**Keputusan: pakai angka kontrak, `< 30% / 30–70% / > 70%`.**

Artinya **teks di `Tanaman.png` perlu Rifki perbaiki** menjadi:

```
KERING < 30%     IDEAL 30–70%     BASAH > 70%
```

Di sisi kode, angka ini tidak ditulis ulang di layar mana pun — layar Status
Tanaman membacanya dari `shared/thresholds.ts`, sehingga kalau nanti berubah
setelah kalibrasi Radin, cukup satu berkas yang diubah dan tampilannya ikut
menyesuaikan sendiri.

### 3. Monitoring adalah layar kamera, bukan sensor

Ini perbedaan terbesar dengan PRD. PRD Bagian 5.3 mendefinisikan Monitoring
Realtime sebagai tampilan empat nilai sensor. Desainnya menampilkan hal lain:
kamera ESP32-CAM, foto tanaman, dan hasil deteksi kesehatan daun
(Sehat/Subur vs Kering).

Desainnya sendiri sudah menandai layar ini sebagai ilustrasi — ada label
"Mode demo", "CONTOH TANGKAPAN", dan "HASIL DETEKSI · CONTOH". Jadi niatnya
tampaknya memang bukan fitur nyata.

Yang perlu dipastikan:

- Apakah ESP32-CAM akan benar-benar dipakai? Ini perangkat keras tambahan di
  luar daftar sensor PRD Bagian 3, dan Radin perlu tahu secepatnya.
- Deteksi kesehatan daun memerlukan model computer vision. Itu ruang lingkup
  tersendiri, jauh di luar PRD, dan tidak masuk akal diselesaikan dalam sisa
  sprint.

**Keputusan: layar ini dibuat sebagai demo statis.** Gambar dan hasil deteksi
tetap, label "Mode demo" serta "CONTOH" dipertahankan dan **jangan dihapus**,
karena itulah yang membuat layar ini jujur. ESP32-CAM tidak diperlukan, jadi
Radin tidak perlu menyiapkan perangkat tambahan.

Di laporan dan presentasi, sebutkan bagian ini sebagai rancangan pengembangan
lanjutan — bukan fitur yang sudah berjalan.

Konsekuensi lain: kalau tab Monitoring dipakai untuk kamera, maka empat nilai
sensor hanya muncul di Beranda. Tautan "Lihat detail" di Beranda belum punya
tujuan — perlu layar detail sensor, atau tautannya dihapus.

### 4. Ada dua sistem navigasi bawah yang berbeda

Lima layar inti (`home`, `Monitoring`, `kontrol Buzzer`, `Riwayat`, `Tanaman`)
memakai navigasi putih dengan lima tab: **Beranda · Monitoring · Kontrol ·
Riwayat · Tanaman**.

Lima layar sisanya (`Notifikasi`, `Profile`, `My`, `Setting`, `Konfir Log`)
memakai navigasi ungu dengan empat ikon dan tombol bulat **+** di tengah —
sisa dari template, tidak berhubungan dengan aplikasi ini. Latar, font, dan
foto profilnya pun masih bawaan template.

Kelima layar itu perlu disesuaikan ke gaya yang sama.

### 5. Profil dan Pengaturan tidak bisa dicapai

Tidak ada tab untuk keduanya di navigasi lima tab. Kemungkinan lewat foto
profil di pojok kiri atas, tapi itu belum ditunjukkan di desain. Perlu
dipastikan.

### 6. Pengaturan menambah dua fitur di luar PRD

`Setting.png` menyediakan **Theme (Light/Dark)** dan **Language (Eng)**. Dark
mode berarti setiap warna di atas butuh pasangan gelap, dan ganti bahasa
berarti semua teks harus dipindahkan ke berkas terjemahan. Dua-duanya tidak
ada di PRD.

Saran: tampilkan saja sebagai elemen visual yang belum berfungsi, atau hapus
dari desain. Mengerjakannya betulan tidak sebanding dengan nilai yang didapat
untuk tugas ini.

### 7. Notifikasi butuh penyimpanan di backend

`Notifikasi.png` menampilkan daftar notifikasi beserta waktunya ("3 Min yg
lalu"). Saat ini backend hanya mengirim event `alert` secara realtime dan
tidak menyimpannya, sehingga daftarnya akan kosong setiap aplikasi dibuka
ulang.

Perlu tabel `notifications` di database dan endpoint untuk membacanya.
Pekerjaan kecil, tapi harus masuk kontrak API dulu.

### 8. Kontrol buzzer perlu tombol ketiga: AUTO

`kontrol Buzzer.png` hanya menyediakan ON dan OFF. Masalahnya, sekali pengguna
menekan OFF, buzzer tidak akan pernah berbunyi lagi — termasuk saat tanah
benar-benar kering. Fungsi utama alat jadi hilang hanya karena satu ketukan.

Implementasi menambahkan tombol ketiga **AUTO** yang mengembalikan buzzer ke
kendali otomatis ESP32. Segmented control-nya kini berisi tiga pilihan dengan
lebar sama. Rifki silakan menyesuaikan desainnya agar cocok.

### 9. Foto profil masih bawaan template

Avatar yang dipakai di semua layar adalah foto stok dari template. Untuk
aplikasi pertanian sebaiknya diganti — ikon sederhana sudah cukup.

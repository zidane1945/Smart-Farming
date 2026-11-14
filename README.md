# Smart Farming — Kelompok 3

Monitoring suhu, kelembapan udara, kelembapan tanah, dan intensitas cahaya
dari ESP32, dengan buzzer sebagai alarm saat tanah kering. Terdiri dari
backend Node.js dan aplikasi mobile Expo.

Dokumen lain: [`docs/PRD.md`](docs/PRD.md) (kebutuhan sistem),
[`docs/API-CONTRACT.md`](docs/API-CONTRACT.md) (topic MQTT, bentuk payload, endpoint — **acuan wajib untuk firmware ESP32**),
[`docs/TIMELINE.md`](docs/TIMELINE.md) (pembagian tugas),
[`docs/UI-UX/README.md`](docs/UI-UX/README.md) (design token dan temuan desain).

## Yang dibutuhkan

- **Node.js 22.13 atau lebih baru** (Expo SDK 58 mensyaratkan ini)
- HP Android dengan aplikasi **Expo Go**, satu WiFi dengan laptop
- Koneksi internet — broker MQTT yang dipakai (`broker.emqx.io`) ada di publik

## Struktur

```
backend/    REST API + Socket.IO + jembatan MQTT       (Express, SQLite)
mobile/     Aplikasi Expo Router                       (React Native)
shared/     Tipe dan threshold yang dipakai keduanya
docs/       PRD, timeline, dan export desain
```

`shared/` sengaja berada di luar `backend/` dan `mobile/` supaya bentuk data
dan angka threshold hanya ditulis satu kali. Kalau threshold berubah setelah
sensor dikalibrasi, cukup ubah [`shared/thresholds.ts`](shared/thresholds.ts).

## Menjalankan

Semuanya perlu **tiga terminal**. Jalankan `npm install` sekali saja di tiap
folder saat pertama kali.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # lalu isi JWT_SECRET dengan teks acak yang panjang
npm start
```

Server berjalan di `http://localhost:3000`. Cek dengan membuka
`http://localhost:3000/api/health` — harus menjawab `"status":"ok"`.

Saat pertama kali dijalankan, backend membuat database SQLite di
`backend/data/` beserta akun demo:

```
email    : petani@smartfarm.id
password : password123
```

### 2. Simulator (selama ESP32 belum siap)

```bash
cd backend
npm run simulate
```

Simulator mem-publish telemetry palsu dengan format yang sama persis seperti
ESP32 dan menanggapi command buzzer. Nilai kelembapan tanah dibuat menurun
perlahan lalu "disiram" kembali, jadi siklus normal → kering → alarm → normal
bisa dilihat tanpa menunggu lama.

Kalau ESP32 sudah jalan, langkah ini dilewati.

### 3. Aplikasi mobile

```bash
cd mobile
npm install
cp .env.example .env
npm start
```

Scan QR yang muncul dengan Expo Go. Aplikasi menemukan sendiri alamat backend
dari Expo, jadi IP yang berubah karena pindah WiFi tidak perlu diketik ulang.

> Kalau HP tidak bisa connect: pastikan HP dan laptop satu WiFi, dan izinkan
> Node.js di Windows Firewall untuk jaringan privat. Jaringan kampus sering
> memblokir perangkat saling berhubungan — pakai hotspot HP kalau begitu.

## Perintah lain

| Folder | Perintah | Kegunaan |
|---|---|---|
| `backend` | `npm run dev` | Jalan ulang otomatis saat kode diubah |
| `backend` | `npm run typecheck` | Periksa tipe |
| `mobile` | `npm run typecheck` | Periksa tipe |
| `mobile` | `npm run android` | Buka langsung di emulator/HP terhubung |
| `mobile` | `npm run doctor` | Diagnosa masalah dependency Expo |

## Konfigurasi

Keduanya memakai file `.env` yang **tidak ikut ke git**. Salin dari
`.env.example` dan sesuaikan. Yang paling sering perlu diubah:

| Variabel | Di mana | Keterangan |
|---|---|---|
| `JWT_SECRET` | `backend/.env` | Wajib diganti jadi teks acak yang panjang |
| `MQTT_URL` | `backend/.env` | Alamat broker |
| `DEVICE_ID` | `backend/.env` | Harus sama dengan `EXPO_PUBLIC_DEVICE_ID` di `mobile/.env` |
| `EXPO_PUBLIC_API_URL` | `mobile/.env` | Hanya diisi saat build APK |

## Alur data

```
ESP32 / simulator
   │  publish kelompok3/{device_id}/telemetry
   ▼
broker MQTT
   │  subscribe
   ▼
backend ── simpan ke SQLite
   │    └─ emit Socket.IO "reading" / "alert"
   ▼
aplikasi mobile
```

Perintah buzzer berjalan sebaliknya: aplikasi memanggil
`POST /api/devices/{id}/command`, backend mem-publish ke
`kelompok3/{device_id}/command`, dan ESP32 menanggapinya.

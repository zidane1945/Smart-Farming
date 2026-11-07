# Product Requirement Document (PRD)

**Smart Farming Monitoring App**

| | |
|---|---|
| Mata Kuliah | Workshop Mobile App |
| Kelompok | Kelompok 3 |
| Anggota | Zidan, Radin, Rifki, Haris |

---

## 1. Nama Produk & Tim

### Nama Produk

Smart Farming Monitoring App

### Deskripsi Produk

Smart Farming Monitoring App merupakan aplikasi mobile yang dirancang untuk
membantu pengguna memantau kondisi lingkungan tanaman melalui data dari
perangkat IoT.

Sistem menggunakan ESP32 sebagai controller yang terhubung dengan beberapa
sensor, yaitu sensor suhu dan kelembapan udara, sensor kelembapan tanah, serta
sensor intensitas cahaya.

Data dari sensor dikirimkan ke sistem komunikasi IoT dan kemudian ditampilkan
pada aplikasi mobile. Aplikasi juga dirancang untuk memberikan informasi
kondisi tanah serta mengirimkan command kepada aktuator.

### Tujuan Produk

- Memudahkan pengguna memantau kondisi tanaman.
- Menampilkan data sensor dalam aplikasi mobile.
- Membantu pengguna mengetahui kondisi tanah.
- Memberikan notifikasi ketika kondisi tanah terlalu kering.
- Memungkinkan pengguna mengontrol aktuator dari aplikasi.

### Target Pengguna

- Petani
- Pengelola greenhouse
- Pengelola lahan pertanian
- Pengguna yang membutuhkan monitoring tanaman berbasis IoT

---

## 2. Arsitektur Komunikasi

```
┌─────────────────────┐
│       SENSOR        │
│                     │
│ DHT11               │
│ Soil Moisture       │
│ Light Sensor        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│        ESP32        │
│  Controller / Edge  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    IoT Gateway /    │
│     MQTT Broker     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Network Server /  │
│      Backend API    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     MOBILE APP      │
│ Smart Farming App   │
└─────────────────────┘
```

### Komunikasi

Sistem menggunakan MQTT sebagai komunikasi antara perangkat IoT dan backend,
lalu REST API serta WebSocket antara backend dan aplikasi mobile.

Alur data sensor:

```
ESP32 → (publish) → MQTT Broker → Backend / Server → Mobile App
```

Alur kontrol aktuator:

```
Mobile App → (command) → Backend → MQTT Broker → ESP32 → Aktuator
```

> **Catatan:** Gateway, MQTT Broker, dan Network Server merupakan bagian dari
> rancangan integrasi. Prototype IoT yang dibuat berfokus pada ESP32, sensor,
> dan buzzer.

Detail teknis lengkap (nama topic, format payload, endpoint, threshold) ada di
[API-CONTRACT.md](API-CONTRACT.md).

---

## 3. Daftar Sensor (Input)

| No | Sensor | Data yang Dibaca | Satuan |
|---|---|---|---|
| 1 | DHT11 | Suhu | °C |
| 2 | DHT11 | Kelembapan Udara | % |
| 3 | Soil Moisture | Kelembapan Tanah | % |
| 4 | Light Sensor | Intensitas Cahaya | % |

### Format Payload JSON

Data sensor dikirim dalam format JSON agar mudah diproses backend maupun
aplikasi mobile.

```json
{
  "device_id": "smartfarm-01",
  "timestamp": "2026-10-24T09:00:00+07:00",
  "temperature": 25.4,
  "humidity": 72,
  "soil_moisture": 35,
  "light_intensity": 68
}
```

| Field | Keterangan |
|---|---|
| `device_id` | Identitas perangkat IoT |
| `timestamp` | Waktu data dikirim |
| `temperature` | Suhu udara |
| `humidity` | Kelembapan udara |
| `soil_moisture` | Kelembapan tanah |
| `light_intensity` | Intensitas cahaya |

---

## 4. Daftar Aktuator (Output)

Aktuator yang digunakan pada prototype adalah **buzzer**.

### Fungsi Buzzer

Buzzer digunakan sebagai alarm ketika kelembapan tanah berada di bawah
threshold yang telah ditentukan.

```
Soil Moisture  →  di bawah threshold  →  ESP32  →  Buzzer ON
```

### Command dari Mobile App

Aplikasi mobile dapat mengirim command untuk mengontrol buzzer.

```json
{ "device_id": "smartfarm-01", "command": "buzzer", "action": "ON" }
```

```json
{ "device_id": "smartfarm-01", "command": "buzzer", "action": "OFF" }
```

### Alur Command

```
Mobile App → Buzzer ON/OFF → Backend / MQTT Broker → ESP32 → Buzzer
```

---

## 5. Daftar Fitur Mobile

### 5.1 Login

Pengguna melakukan login sebelum mengakses sistem.

- Email/username
- Password

### 5.2 Dashboard

Dashboard menampilkan kondisi Smart Farming secara ringkas.

```
SMART FARM 01

Suhu                 25.4 °C
Kelembapan Udara     72 %
Kelembapan Tanah     35 %
Intensitas Cahaya    68 %
```

### 5.3 Monitoring Realtime

Aplikasi menampilkan data sensor dari perangkat IoT secara realtime:

- Suhu
- Kelembapan udara
- Kelembapan tanah
- Intensitas cahaya

### 5.4 Status Kondisi Tanah

Aplikasi memberikan informasi kondisi tanah berdasarkan threshold.

```
✓ Kondisi Tanah Normal
```

atau:

```
⚠ Tanah Kering
```

### 5.5 Kontrol Aktuator

Pengguna dapat mengontrol buzzer melalui aplikasi.

```
Buzzer      [ ON ]   [ OFF ]
```

Command dikirimkan dari mobile app menuju ESP32.

### 5.6 Histori Monitoring

Aplikasi menampilkan riwayat data sensor.

| Waktu | Suhu | Humidity | Tanah | Cahaya |
|---|---|---|---|---|
| 09:00 | 25.4°C | 72% | 35% | 68% |
| 08:55 | 25.1°C | 73% | 37% | 65% |
| 08:50 | 24.9°C | 74% | 39% | 63% |

---

## 6. UI/UX

Desain UI/UX dibuat menggunakan Figma.

### Halaman yang Direncanakan

```
Login
  ↓
Dashboard
  ├── Monitoring
  ├── Status Tanaman
  ├── Kontrol Buzzer
  └── Histori
```

### Konsep Dashboard

Dashboard dibuat sederhana agar pengguna dapat langsung melihat kondisi
tanaman tanpa harus membuka banyak halaman.

Informasi utama yang ditampilkan:

- Suhu
- Kelembapan udara
- Kelembapan tanah
- Intensitas cahaya
- Status tanah
- Status buzzer

---

## 7. Pembagian Tugas

| Anggota | Peran | Tanggung Jawab |
|---|---|---|
| Zidan | Mobile Developer | Pengembangan aplikasi mobile dan integrasi data IoT |
| Radin | IoT Developer | ESP32, sensor, dan aktuator |
| Rifki | UI/UX Designer | Desain UI/UX dan prototype Figma |
| Haris | Backend & Integration | MQTT, gateway, API, dan integrasi sistem |

Pembagian ini merupakan rancangan awal dan dapat disesuaikan berdasarkan
kesepakatan anggota kelompok.

---

## 8. Sprint Development

### Sprint 1 — Requirement & Repository

- Finalisasi PRD
- Membuat repository GitHub
- Menentukan struktur project
- Menentukan kebutuhan aplikasi
- Menentukan format komunikasi IoT

### Sprint 2 — UI/UX

- Membuat wireframe
- Membuat desain Figma
- Mendesain halaman login
- Mendesain dashboard
- Mendesain halaman monitoring
- Mendesain halaman kontrol

### Sprint 3 — Mobile Development

- Membuat project mobile
- Implementasi login
- Implementasi dashboard
- Implementasi monitoring sensor
- Implementasi halaman kontrol

### Sprint 4 — IoT Integration

- Integrasi ESP32
- Integrasi sensor
- Menentukan payload JSON
- Implementasi komunikasi MQTT/API
- Pengujian pengiriman data

### Sprint 5 — Actuator Control

- Implementasi command dari mobile
- Integrasi command dengan ESP32
- Kontrol buzzer
- Pengujian ON/OFF

### Sprint 6 — Testing & Finalisasi

- Testing aplikasi
- Testing sensor
- Testing komunikasi
- Testing actuator
- Perbaikan bug
- Dokumentasi
- Persiapan presentasi

---

## 9. Repository GitHub

Repository digunakan sebagai tempat penyimpanan source code dan dokumentasi
project.

```
Smart-Farming/
│
├── mobile/              # Source code aplikasi (Expo / React Native)
├── iot/                 # Source code ESP32
├── backend/             # API / MQTT integration (Node.js + Express)
├── docs/
│   ├── PRD.md
│   ├── API-CONTRACT.md
│   └── UI-UX/
└── README.md
```

README menjelaskan nama project, deskripsi, anggota kelompok, teknologi yang
digunakan, arsitektur sistem, dan cara menjalankan project.

---

## 10. Ringkasan Sistem

```
SENSOR → ESP32 → GATEWAY → SERVER → MOBILE APP
                                         ↓
                                      COMMAND
                                         ↓
                                       ESP32
                                         ↓
                                      BUZZER
```

Sensor mengirim data → ESP32 memproses → data diteruskan ke sistem → mobile app
menampilkan data → mobile app dapat mengirim command kembali ke ESP32 untuk
mengontrol aktuator.

---

## Lampiran — Keputusan Teknologi (Sprint 1)

Bagian ini bukan bagian dari PRD awal, melainkan hasil keputusan pada Sprint 1
yang melengkapi rancangan di atas.

| Bagian | Teknologi | Alasan |
|---|---|---|
| Mobile | Expo (React Native + TypeScript) | Satu bahasa dengan backend; bisa diuji langsung di HP lewat Expo Go tanpa Android Studio; build APK lewat EAS Build |
| Backend | Node.js + Express + Socket.IO | Library `mqtt.js` matang dan banyak contoh; TypeScript sama seperti mobile |
| Database | SQLite | Satu file, tanpa install server, cukup untuk skala prototype |
| MQTT Broker | EMQX publik (`broker.emqx.io`) | Gratis, mendukung TCP dan WebSocket sekaligus |
| IoT | ESP32 + Arduino framework | Sesuai perangkat yang tersedia |
| UI/UX | Figma | Sesuai rencana awal |

### Mengapa mobile tidak connect MQTT secara langsung

React Native di Expo Go tidak memiliki akses TCP socket mentah, sehingga tidak
dapat terhubung ke MQTT port 1883 secara langsung. Karena itu aplikasi
mengambil data melalui backend (REST + Socket.IO), sesuai diagram arsitektur
pada Bagian 2. Pendekatan ini sekaligus memberi tempat penyimpanan untuk fitur
histori (Bagian 5.6).

### Dukungan platform tambahan

Aplikasi mobile adalah produk utama. Expo juga dapat diekspor ke web
(`npx expo export -p web`) sebagai pelengkap opsional, bukan pengganti
aplikasi mobile.

# Kontrak Komunikasi

**Smart Farming Monitoring App** · Kelompok 3

Dokumen ini adalah acuan tunggal untuk bentuk data yang mengalir antara ESP32,
backend, dan aplikasi mobile. Isinya diturunkan dari kode yang sudah berjalan
(`backend/src/mqtt.ts`, `backend/src/config.ts`, `shared/types.ts`,
`shared/thresholds.ts`), bukan dari rencana — jadi apa yang tertulis di sini
memang yang diterima backend saat ini.

> **Kalau ada beda antara dokumen ini dan kode, kode yang benar.** Yang berubah
> harus dokumennya. Bentuk data didefinisikan di `shared/types.ts`, dan angka
> threshold di `shared/thresholds.ts` — dua berkas itu sumber kebenarannya.

---

## 1. Bentuk Sistem

```
ESP32  ──publish telemetry──►  Broker MQTT  ──subscribe──►  Backend  ──Socket.IO──►  Mobile
  ▲                                                            │
  └──────────────── subscribe command ◄───────publish──────────┘
```

Tiga hal yang perlu dipegang:

- **ESP32 tidak pernah berbicara langsung dengan aplikasi.** Semua lewat broker
  dan backend. Jadi ESP32 tidak perlu tahu alamat IP laptop atau HP.
- **ESP32 mengirim persen, bukan nilai ADC mentah.** Kalibrasi dilakukan di
  firmware. Backend menolak angka di luar 0–100.
- **Backend yang menentukan status tanah**, bukan ESP32. ESP32 hanya mengirim
  angka kelembapan; penerjemahan ke `kering`/`normal`/`basah` terjadi di
  backend memakai `getSoilStatus()`.

---

## 2. MQTT

### 2.1 Broker

| | Nilai sekarang | Diatur lewat |
|---|---|---|
| URL | `mqtt://broker.emqx.io:1883` | `MQTT_URL` di `backend/.env` |
| Prefix topic | `kelompok3` | `MQTT_TOPIC_PREFIX` |
| Device ID bawaan | `smartfarm-01` | `DEVICE_ID` |
| QoS | 1 (subscribe dan publish) | — |

> Broker publik bisa diakses siapa saja, termasuk kelompok lain yang mungkin
> memakai prefix yang sama. Karena itu backend memvalidasi setiap payload yang
> masuk dan membuang yang tidak sesuai bentuk — lihat Bagian 2.3. Rencana
> pindah ke broker ber-autentikasi ada di `docs/TIMELINE.md` Pertemuan 12.

### 2.2 Daftar Topic

Pola: `{prefix}/{device_id}/{jenis}`

| Topic | Arah | Siapa publish | Siapa subscribe |
|---|---|---|---|
| `kelompok3/smartfarm-01/telemetry` | ESP32 → backend | ESP32 | Backend |
| `kelompok3/smartfarm-01/command` | backend → ESP32 | Backend | ESP32 |
| `kelompok3/smartfarm-01/status` | ESP32 → backend | ESP32 (LWT) | Backend |

Backend subscribe memakai wildcard `kelompok3/+/telemetry` dan
`kelompok3/+/status`, sehingga perangkat tambahan otomatis terbaca tanpa ubah
kode.

> Nama topic di backend tidak pernah ditulis manual — semuanya lewat helper
> `topics` di `backend/src/config.ts`. Firmware ESP32 harus memakai ejaan yang
> sama persis; salah satu huruf saja membuat pesan tidak pernah sampai, tanpa
> pesan error apa pun. Ini jenis kesalahan yang paling lama dicari.

### 2.3 Telemetry — ESP32 ke Backend

Topic: `kelompok3/{device_id}/telemetry` · Format: JSON · Jeda: **5 detik**
(`TELEMETRY_INTERVAL_MS` di `shared/thresholds.ts`)

```json
{
  "device_id": "smartfarm-01",
  "timestamp": "2026-11-14T09:00:05+07:00",
  "temperature": 28.4,
  "humidity": 65.2,
  "soil_moisture": 42.0,
  "light_intensity": 78.5,
  "buzzer": false
}
```

Aturan tiap field — **payload yang melanggar salah satu baris ini dibuang
backend dan datanya tidak akan muncul di aplikasi**:

| Field | Tipe | Satuan | Batas yang divalidasi | Wajib |
|---|---|---|---|---|
| `device_id` | string | — | minimal 1 karakter, harus cocok dengan `DEVICE_ID` backend | Ya |
| `timestamp` | string | ISO 8601 **+07:00** | minimal 1 karakter | Ya |
| `temperature` | number | °C | −20 sampai 80 | Ya |
| `humidity` | number | % | 0 sampai 100 | Ya |
| `soil_moisture` | number | % **sudah dikalibrasi** | 0 sampai 100 | Ya |
| `light_intensity` | number | % | 0 sampai 100 | Ya |
| `buzzer` | boolean | — | `true` / `false` | Tidak — default `false` |

Empat kesalahan yang paling mungkin terjadi, semuanya membuat data hilang
tanpa jejak di aplikasi:

1. **Mengirim nilai ADC mentah** (`soil_moisture: 2480`) — ditolak karena di
   luar 0–100. Kalibrasi wajib dilakukan di firmware.
2. **`timestamp` tanpa zona waktu** atau memakai `Z`. Harus `+07:00`. Kalau
   ESP32 belum punya waktu dari NTP, pakai NTP dulu — jangan kirim waktu
   kosong atau waktu epoch 1970.
3. **Angka dikirim sebagai string** (`"temperature": "28.4"`) — ditolak karena
   tipenya harus number, tanpa tanda kutip.
4. **`buzzer` dikirim sebagai angka** `0`/`1` — harus `true`/`false`.

> Backend mencatat alasan penolakan di konsol dengan awalan `[mqtt] telemetry
> tidak valid:`. Kalau data tidak muncul di aplikasi, konsol backend adalah
> tempat pertama yang dilihat — bukan menebak dari sisi ESP32.

### 2.4 Command — Backend ke ESP32

Topic: `kelompok3/{device_id}/command` · QoS 1

```json
{
  "device_id": "smartfarm-01",
  "command": "buzzer",
  "action": "ON"
}
```

| `action` | Arti bagi firmware |
|---|---|
| `ON` | Nyalakan buzzer, **abaikan** logika otomatis sampai ada perintah lain |
| `OFF` | Matikan buzzer, **abaikan** logika otomatis sampai ada perintah lain |
| `AUTO` | Serahkan kembali ke logika otomatis ESP32 (berbunyi saat tanah kering) |

> `AUTO` bukan berarti "nyalakan sekarang". Artinya ESP32 kembali memutuskan
> sendiri berdasarkan kelembapan tanah. Setelah `AUTO`, buzzer bisa langsung
> berhenti kalau tanah sedang tidak kering — dan itu perilaku yang benar.

Setiap kali status buzzer berubah, **ESP32 harus melaporkannya di field
`buzzer` pada telemetry berikutnya.** Tanpa itu aplikasi menampilkan kondisi
tombol, bukan kondisi alat yang sebenarnya.

### 2.5 Status dan Last Will & Testament

Topic: `kelompok3/{device_id}/status` · **retained**

```json
{ "device_id": "smartfarm-01", "state": "online" }
```

`state` hanya boleh `"online"` atau `"offline"`.

Yang harus dilakukan firmware:

- Saat **connect**: daftarkan LWT ke topic ini dengan isi `state: "offline"`,
  QoS 1, retain `true`. Broker mengirimkannya otomatis kalau ESP32 mati atau
  kehilangan koneksi tanpa pamit.
- Setelah **berhasil connect**: publish sendiri `state: "online"`, retain `true`.

> Tanpa LWT, backend tidak punya cara membedakan "alat mati" dari "alat hidup
> tapi sedang tidak mengirim". Aplikasi akan terus menampilkan data lama
> seolah masih segar. Retain dipakai supaya backend yang baru dinyalakan
> langsung tahu kondisi terakhir perangkat.

---

## 3. Threshold dan Satuan

Semua angka di bawah berasal dari `shared/thresholds.ts`. **Jangan tulis ulang
angka ini di firmware sebagai nilai tetap tanpa mencatatnya di sana** — kalau
kalibrasi berubah, yang berubah harus satu tempat saja.

| Besaran | Rentang normal | Dipakai untuk |
|---|---|---|
| `temperature` | 20–32 °C | Pewarnaan kartu sensor |
| `humidity` | 50–80 % | Pewarnaan kartu sensor |
| `soil_moisture` | **30–70 %** | **Menentukan perilaku buzzer** |
| `light_intensity` | 30–90 % | Pewarnaan kartu sensor |

Status tanah (`getSoilStatus()`):

```
soil_moisture < 30   →  kering
30 ≤ soil_moisture ≤ 70  →  normal
soil_moisture > 70   →  basah
```

Tetapan waktu:

| Tetapan | Nilai | Arti |
|---|---|---|
| `TELEMETRY_INTERVAL_MS` | 5.000 ms | Jeda antar publish telemetry |
| `DRY_ALARM_DELAY_MS` | 30.000 ms | Lama tanah harus kering sebelum buzzer berbunyi |

> `DRY_ALARM_DELAY_MS` ada supaya nilai yang naik-turun tepat di sekitar 30%
> tidak membuat buzzer berbunyi dan berhenti berulang kali. Firmware harus
> menghormati jeda ini di mode `AUTO`: tanah kering 30 detik berturut-turut
> dulu, baru buzzer berbunyi.

Hanya `soil_moisture` yang ikut menentukan perilaku alat. Tiga lainnya murni
untuk tampilan, jadi batasnya boleh disesuaikan Rifki tanpa risiko.

---

## 4. REST API

Alamat dasar: `http://{ip-laptop}:3000/api`

Semua response memakai satu bentuk yang sama, sehingga aplikasi hanya perlu
memeriksa field `success`:

```json
{ "success": true,  "data": { } }
{ "success": false, "error": { "code": "DEVICE_OFFLINE", "message": "Perangkat tidak terhubung" } }
```

### 4.1 Daftar Endpoint

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| `GET` | `/api/health` | — | Status server dan koneksi MQTT |
| `POST` | `/api/auth/login` | — | Menukar email + password dengan token |
| `GET` | `/api/devices` | **Ya** | Daftar perangkat terdaftar |
| `GET` | `/api/devices/:deviceId/latest` | **Ya** | Pembacaan terbaru |
| `GET` | `/api/devices/:deviceId/history` | **Ya** | Histori pembacaan |
| `POST` | `/api/devices/:deviceId/command` | **Ya** | Kirim perintah buzzer |

Endpoint ber-auth memerlukan header:

```
Authorization: Bearer <token>
```

### 4.2 Login

`POST /api/auth/login`

```json
{ "email": "petani@smartfarm.id", "password": "password123" }
```

Jawaban berisi `token` dan `user`. Token berlaku 7 hari (`JWT_EXPIRES_IN`).

> Pesan error untuk email yang tidak terdaftar dan password yang salah
> disamakan menjadi `INVALID_CREDENTIALS`, supaya tidak membocorkan email mana
> yang terdaftar. Ini disengaja, bukan kurang detail.

### 4.3 Pembacaan Terbaru

`GET /api/devices/:deviceId/latest`

Isi `data` adalah telemetry ditambah dua field hasil olahan backend:

```json
{
  "device_id": "smartfarm-01",
  "timestamp": "2026-11-14T09:00:05+07:00",
  "temperature": 28.4,
  "humidity": 65.2,
  "soil_moisture": 42.0,
  "light_intensity": 78.5,
  "buzzer": false,
  "soil_status": "normal",
  "state": "online"
}
```

### 4.4 Histori

`GET /api/devices/:deviceId/history`

| Query | Tipe | Bawaan | Batas |
|---|---|---|---|
| `limit` | integer | 50 | 1–500 |
| `from` | string | — | opsional |
| `to` | string | — | opsional |
| `bucket` | integer (menit) | — | 1–1440, rata-rata per N menit |

Jawaban: `{ "readings": [ ], "count": 0 }`. Tiap baris hanya memuat
`timestamp`, `temperature`, `humidity`, `soil_moisture`, dan
`light_intensity` — field yang tidak dipakai grafik tidak dikirim.

### 4.5 Kirim Perintah

`POST /api/devices/:deviceId/command`

```json
{ "command": "buzzer", "action": "ON" }
```

Jawaban memuat `command`, `action`, dan `sent_at`.

> `sent_at` berarti perintah sudah diserahkan ke broker, **bukan** bahwa
> buzzer sudah berbunyi. Konfirmasi yang sebenarnya datang lewat field `buzzer`
> pada telemetry berikutnya. Karena itu aplikasi menampilkan indikator
> "menunggu konfirmasi" sampai telemetry membenarkannya.

### 4.6 Kode Error

| Kode | HTTP | Kapan muncul |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Body atau query tidak sesuai bentuk |
| `INVALID_CREDENTIALS` | 401 | Email atau password salah |
| `UNAUTHORIZED` | 401 | Token tidak ada, tidak valid, atau kedaluwarsa |
| `DEVICE_NOT_FOUND` | 404 | Perangkat tidak terdaftar |
| `NO_DATA` | 404 | Perangkat terdaftar tapi belum pernah mengirim telemetry |
| `DEVICE_OFFLINE` | 503 | Perangkat tidak terhubung, atau backend belum tersambung ke broker |
| `INTERNAL_ERROR` | 500 | Kesalahan tak terduga di server |

> Membedakan `DEVICE_NOT_FOUND` dari `NO_DATA` penting bagi aplikasi: yang
> pertama berarti salah `device_id`, yang kedua berarti alat benar tapi belum
> mengirim apa pun. Pesan yang ditampilkan ke pengguna berbeda.

---

## 5. Socket.IO

Aplikasi terhubung ke server yang sama (port 3000) dan mengirim satu event
untuk memilih perangkat yang dipantau:

| Arah | Event | Isi |
|---|---|---|
| Mobile → server | `subscribe` | `{ "device_id": "smartfarm-01" }` |
| Server → mobile | `reading` | Objek `Reading` — sama dengan Bagian 4.3 |
| Server → mobile | `device_state` | `{ "device_id": "…", "state": "online" }` |
| Server → mobile | `alert` | `{ "device_id": "…", "type": "soil_dry", "message": "…", "value": 28 }` |

> Event `alert` hanya dikirim **saat status berubah** menjadi kering
> (normal → kering), bukan setiap 5 detik selama tanah masih kering. Tanpa
> aturan ini, layar notifikasi akan terisi ratusan baris yang sama dalam
> beberapa menit.

---

## 6. Daftar Periksa Firmware ESP32

Dipakai Radin saat menulis firmware, dan Haris saat memverifikasi di
Pertemuan 12. Payload dianggap sesuai kontrak kalau seluruh baris ini
terpenuhi:

- [ ] Topic persis `kelompok3/{device_id}/telemetry`, tanpa garis miring di ujung
- [ ] `device_id` sama dengan `DEVICE_ID` di `backend/.env` (bawaan `smartfarm-01`)
- [ ] Waktu diambil dari NTP, dikirim ISO 8601 dengan akhiran `+07:00`
- [ ] `soil_moisture` sudah dikalibrasi ke 0–100, bukan nilai ADC
- [ ] Keempat nilai sensor dikirim sebagai number, tanpa tanda kutip
- [ ] `buzzer` dikirim sebagai boolean dan mencerminkan kondisi nyata
- [ ] Publish tiap 5 detik, QoS 1
- [ ] LWT terdaftar saat connect: `state: "offline"`, retain `true`
- [ ] Publish `state: "online"` retain `true` setelah connect berhasil
- [ ] Subscribe `kelompok3/{device_id}/command` dan menanggapi ON, OFF, AUTO
- [ ] Mode AUTO menghormati jeda 30 detik sebelum buzzer berbunyi

**Cara memeriksa tanpa menunggu aplikasi siap:** buka MQTT Explorer, subscribe
ke `kelompok3/#`, lalu bandingkan payload yang muncul dengan contoh di
Bagian 2.3 field demi field. Kalau cocok di MQTT Explorer, backend juga akan
menerimanya.

---

## 7. Catatan Penyimpangan

Hal-hal yang berbeda dari keadaan ideal, dicatat terbuka supaya tidak
mengagetkan saat pengujian:

| Hal | Keadaan sekarang |
|---|---|
| Broker | Masih publik tanpa autentikasi. Pindah ke broker ber-autentikasi dijadwalkan Pertemuan 12 |
| Simulator | `npm run simulate` di `backend/` meniru ESP32 memakai kontrak yang sama persis, sehingga aplikasi bisa dikembangkan tanpa perangkat |
| Endpoint tidak dikenal | Dijawab 404 dengan kode `DEVICE_NOT_FOUND`, padahal secara makna bukan soal perangkat. Tidak mengganggu aplikasi, tapi layak dirapikan kalau ada waktu |
| Notifikasi | Event `alert` belum disimpan ke database, jadi daftar notifikasi kosong setelah aplikasi ditutup. Perbaikannya ada di `docs/TIMELINE.md` Pertemuan 11 |
| Monitoring kamera | Layar ada di desain, tapi tidak ada endpoint maupun perangkatnya. Rancangan pengembangan lanjutan, bukan fitur berjalan |

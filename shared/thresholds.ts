/**
 * Ambang batas sensor dan tetapan waktu, dipakai bersama backend dan mobile.
 *
 * Satu sumber kebenaran untuk angka-angka ini. Layar Status Tanaman, kartu
 * sensor di Beranda, simulator, dan logika alert backend semuanya membacanya
 * dari sini — tidak ada angka threshold yang ditulis ulang di tempat lain.
 * Kalau sensor dikalibrasi ulang, cukup berkas ini yang diubah.
 *
 * Acuan: docs/API-CONTRACT.md Bagian 3, docs/UI-UX/README.md Temuan 2
 */

import type { SoilStatus } from "./types";

/** Rentang nilai yang dianggap wajar untuk satu sensor. */
export interface Range {
  /** Batas bawah rentang normal, inklusif. */
  low: number;
  /** Batas atas rentang normal, inklusif. */
  high: number;
}

/**
 * Rentang normal tiap sensor.
 *
 * `soil_moisture` adalah satu-satunya yang ikut menentukan perilaku alat —
 * di bawah `low` buzzer berbunyi. Tiga lainnya hanya dipakai tampilan untuk
 * mewarnai bar pada kartu sensor, jadi batasnya cukup berupa rentang yang
 * masuk akal untuk tanaman dan boleh disesuaikan Rifki tanpa risiko.
 */
export const THRESHOLDS = {
  /** °C — rentang nyaman tanaman di iklim tropis. */
  temperature: { low: 20, high: 32 },
  /** % kelembapan udara. */
  humidity: { low: 50, high: 80 },
  /** % kelembapan tanah. Angka inilah yang dipakai `getSoilStatus`. */
  soil_moisture: { low: 30, high: 70 },
  /** % intensitas cahaya. */
  light_intensity: { low: 30, high: 90 },
} as const satisfies Record<string, Range>;

/**
 * Menerjemahkan kelembapan tanah menjadi status yang dibaca pengguna.
 *
 *   kering  < 30%
 *   normal  30% – 70%
 *   basah   > 70%
 */
export function getSoilStatus(soilMoisture: number): SoilStatus {
  if (soilMoisture < THRESHOLDS.soil_moisture.low) return "kering";
  if (soilMoisture > THRESHOLDS.soil_moisture.high) return "basah";
  return "normal";
}

/** Jeda antar publish telemetry dari ESP32 maupun simulator. */
export const TELEMETRY_INTERVAL_MS = 5_000;

/**
 * Lama tanah harus kering sebelum buzzer berbunyi.
 *
 * Tanpa jeda ini, nilai yang naik-turun tepat di sekitar 30% membuat buzzer
 * berbunyi dan berhenti berulang kali. Nilainya sengaja pendek supaya masih
 * nyaman didemokan saat presentasi.
 */
export const DRY_ALARM_DELAY_MS = 30_000;

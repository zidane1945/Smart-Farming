/**
 * Semua timestamp di sistem ini memakai ISO 8601 dengan zona waktu Jakarta
 * (+07:00) — baik dari ESP32, backend, maupun simulator. Satu format saja,
 * supaya app tidak perlu menebak zona waktu dan urutan histori tidak kacau
 * saat dibandingkan sebagai teks.
 */

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Waktu sekarang, mis. `2026-10-24T09:00:05+07:00`. */
export function nowJakarta(): string {
  return toJakarta(new Date());
}

export function toJakarta(date: Date): string {
  return new Date(date.getTime() + JAKARTA_OFFSET_MS)
    .toISOString()
    .replace(/\.\d{3}Z$/, "+07:00");
}

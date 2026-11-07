/**
 * Tipe data bersama antara backend dan mobile.
 *
 * Satu sumber kebenaran untuk bentuk payload MQTT dan response API.
 * Kalau bentuk data berubah, ubah di sini — TypeScript akan menandai
 * semua tempat di backend dan mobile yang perlu ikut disesuaikan.
 *
 * Acuan: docs/API-CONTRACT.md
 */

export type DeviceId = string;

export type DeviceState = "online" | "offline";

export type SoilStatus = "kering" | "normal" | "basah";

export type BuzzerAction = "ON" | "OFF" | "AUTO";

/** Payload yang dipublish ESP32 ke `kelompok3/{device_id}/telemetry`. */
export interface Telemetry {
  device_id: DeviceId;
  /** ISO 8601 dengan zona +07:00 */
  timestamp: string;
  /** °C */
  temperature: number;
  /** % kelembapan udara */
  humidity: number;
  /** % kelembapan tanah, sudah dikalibrasi di ESP32 */
  soil_moisture: number;
  /** % intensitas cahaya */
  light_intensity: number;
  /** kondisi buzzer saat pembacaan ini */
  buzzer: boolean;
}

/** Payload command dari backend ke `kelompok3/{device_id}/command`. */
export interface BuzzerCommand {
  device_id: DeviceId;
  command: "buzzer";
  action: BuzzerAction;
}

/** Payload Last Will & Testament di `kelompok3/{device_id}/status`. */
export interface DeviceStatusMessage {
  device_id: DeviceId;
  state: DeviceState;
}

/** Telemetry yang sudah diperkaya backend, inilah yang diterima mobile. */
export interface Reading extends Telemetry {
  soil_status: SoilStatus;
  state: DeviceState;
}

export interface Device {
  device_id: DeviceId;
  name: string;
  state: DeviceState;
  last_seen: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

/* ── Response API ─────────────────────────────────────────────────────── */

export type ApiErrorCode =
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "DEVICE_NOT_FOUND"
  | "DEVICE_OFFLINE"
  /** Perangkat terdaftar, tapi belum pernah mengirim telemetry. */
  | "NO_DATA"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: { code: ApiErrorCode; message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/** Satu baris pada tabel histori — tanpa field yang tidak dipakai di grafik. */
export type HistoryReading = Pick<
  Telemetry,
  "timestamp" | "temperature" | "humidity" | "soil_moisture" | "light_intensity"
>;

export interface HistoryResponse {
  readings: HistoryReading[];
  count: number;
}

export interface CommandRequest {
  command: "buzzer";
  action: BuzzerAction;
}

export interface CommandResponse {
  command: "buzzer";
  action: BuzzerAction;
  sent_at: string;
}

/* ── Event Socket.IO ──────────────────────────────────────────────────── */

export interface AlertEvent {
  device_id: DeviceId;
  type: "soil_dry";
  message: string;
  value: number;
}

/** Event yang dikirim server ke mobile. */
export interface ServerToClientEvents {
  reading: (reading: Reading) => void;
  device_state: (payload: DeviceStatusMessage) => void;
  alert: (payload: AlertEvent) => void;
}

/** Event yang dikirim mobile ke server. */
export interface ClientToServerEvents {
  subscribe: (payload: { device_id: DeviceId }) => void;
}

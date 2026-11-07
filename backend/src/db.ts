import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { config } from "./config";
import type {
  Device,
  DeviceState,
  HistoryReading,
  Telemetry,
  User,
} from "../../shared/types";

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

export const db = new Database(config.dbPath);

// WAL membuat penulisan telemetry tidak memblokir pembacaan histori.
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS devices (
    device_id  TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    state      TEXT NOT NULL DEFAULT 'offline',
    last_seen  TEXT
  );

  CREATE TABLE IF NOT EXISTS readings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id       TEXT    NOT NULL REFERENCES devices(device_id),
    timestamp       TEXT    NOT NULL,
    temperature     REAL,
    humidity        REAL,
    soil_moisture   REAL,
    light_intensity REAL,
    buzzer          INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_readings_device_time
    ON readings(device_id, timestamp DESC);

  CREATE TABLE IF NOT EXISTS commands (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id  TEXT NOT NULL REFERENCES devices(device_id),
    command    TEXT NOT NULL,
    action     TEXT NOT NULL,
    sent_at    TEXT NOT NULL DEFAULT (datetime('now')),
    sent_by    INTEGER REFERENCES users(id)
  );
`);

/* ── Baris mentah dari SQLite ──────────────────────────────────────────── */

interface UserRow extends User {
  password_hash: string;
}

interface ReadingRow extends Omit<Telemetry, "buzzer"> {
  /** SQLite tidak punya tipe boolean — 0 atau 1. */
  buzzer: number;
}

/* ── Seed ─────────────────────────────────────────────────────────────── */

/**
 * Membuat akun demo dan perangkat utama kalau belum ada, supaya server bisa
 * langsung dipakai login tanpa langkah seed terpisah.
 */
function seed(): void {
  const userExists = db
    .prepare("SELECT 1 FROM users WHERE email = ?")
    .get(config.demo.email);

  if (!userExists) {
    db.prepare(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    ).run(
      config.demo.name,
      config.demo.email,
      bcrypt.hashSync(config.demo.password, 10),
    );
    console.log(`[db] akun demo dibuat: ${config.demo.email}`);
  }

  db.prepare(
    "INSERT INTO devices (device_id, name) VALUES (?, ?) ON CONFLICT(device_id) DO NOTHING",
  ).run(config.device.id, config.device.name);
}

seed();

/* ── Query ────────────────────────────────────────────────────────────── */

export function findUserByEmail(
  email: string,
): (User & { password_hash: string }) | undefined {
  return db
    .prepare(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
    )
    .get(email) as UserRow | undefined;
}

export function listDevices(): Device[] {
  return db
    .prepare(
      "SELECT device_id, name, state, last_seen FROM devices ORDER BY device_id",
    )
    .all() as Device[];
}

export function findDevice(deviceId: string): Device | undefined {
  return db
    .prepare(
      "SELECT device_id, name, state, last_seen FROM devices WHERE device_id = ?",
    )
    .get(deviceId) as Device | undefined;
}

/**
 * Mendaftarkan perangkat yang belum dikenal.
 *
 * Dipanggil saat telemetry masuk dari `device_id` yang belum ada di tabel,
 * supaya data tidak gagal disimpan hanya karena perangkat belum didaftarkan.
 */
export function ensureDevice(deviceId: string): void {
  db.prepare(
    "INSERT INTO devices (device_id, name) VALUES (?, ?) ON CONFLICT(device_id) DO NOTHING",
  ).run(deviceId, deviceId);
}

export function setDeviceState(deviceId: string, state: DeviceState): void {
  db.prepare("UPDATE devices SET state = ? WHERE device_id = ?").run(
    state,
    deviceId,
  );
}

export function insertReading(telemetry: Telemetry): void {
  db.prepare(
    `INSERT INTO readings
       (device_id, timestamp, temperature, humidity, soil_moisture, light_intensity, buzzer)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    telemetry.device_id,
    telemetry.timestamp,
    telemetry.temperature,
    telemetry.humidity,
    telemetry.soil_moisture,
    telemetry.light_intensity,
    telemetry.buzzer ? 1 : 0,
  );

  db.prepare(
    "UPDATE devices SET state = 'online', last_seen = ? WHERE device_id = ?",
  ).run(telemetry.timestamp, telemetry.device_id);
}

export function findLatestReading(deviceId: string): Telemetry | undefined {
  const row = db
    .prepare(
      `SELECT device_id, timestamp, temperature, humidity, soil_moisture, light_intensity, buzzer
         FROM readings
        WHERE device_id = ?
        ORDER BY timestamp DESC
        LIMIT 1`,
    )
    .get(deviceId) as ReadingRow | undefined;

  if (!row) return undefined;
  return { ...row, buzzer: row.buzzer === 1 };
}

export interface HistoryOptions {
  limit: number;
  from?: string;
  to?: string;
  /** Kalau diisi, baris dirata-ratakan per N menit. */
  bucketMinutes?: number;
}

export function findHistory(
  deviceId: string,
  options: HistoryOptions,
): HistoryReading[] {
  const where: string[] = ["device_id = ?"];
  const params: unknown[] = [deviceId];

  if (options.from) {
    where.push("timestamp >= ?");
    params.push(options.from);
  }
  if (options.to) {
    where.push("timestamp <= ?");
    params.push(options.to);
  }

  const filter = where.join(" AND ");

  // Tanpa bucket: baris mentah apa adanya.
  if (!options.bucketMinutes) {
    return db
      .prepare(
        `SELECT timestamp, temperature, humidity, soil_moisture, light_intensity
           FROM readings
          WHERE ${filter}
          ORDER BY timestamp DESC
          LIMIT ?`,
      )
      .all(...params, options.limit) as HistoryReading[];
  }

  // Dengan bucket: rata-rata per N menit. Telemetry masuk tiap 5 detik, jadi
  // tanpa peringkasan grafik di app akan menerima ribuan titik yang tidak
  // mungkin dibedakan di layar HP.
  return db
    .prepare(
      `SELECT MAX(timestamp)                   AS timestamp,
              ROUND(AVG(temperature), 1)       AS temperature,
              ROUND(AVG(humidity), 0)          AS humidity,
              ROUND(AVG(soil_moisture), 0)     AS soil_moisture,
              ROUND(AVG(light_intensity), 0)   AS light_intensity
         FROM readings
        WHERE ${filter}
        GROUP BY CAST(strftime('%s', timestamp) / ? AS INTEGER)
        ORDER BY timestamp DESC
        LIMIT ?`,
    )
    .all(...params, options.bucketMinutes * 60, options.limit) as HistoryReading[];
}

export function insertCommand(
  deviceId: string,
  command: string,
  action: string,
  sentBy: number | null,
): void {
  db.prepare(
    "INSERT INTO commands (device_id, command, action, sent_by) VALUES (?, ?, ?, ?)",
  ).run(deviceId, command, action, sentBy);
}

import mqtt from "mqtt";
import { z } from "zod";
import { config, topics } from "./config";
import {
  ensureDevice,
  findDevice,
  insertReading,
  setDeviceState,
} from "./db";
import { emitAlert, emitDeviceState, emitReading } from "./realtime";
import { getSoilStatus } from "../../shared/thresholds";
import type {
  BuzzerAction,
  Reading,
  SoilStatus,
} from "../../shared/types";

/**
 * Validasi payload yang masuk dari broker.
 *
 * Broker publik bisa diakses siapa saja, jadi pesan di topic kita belum tentu
 * datang dari ESP32 kelompok ini. Payload yang tidak sesuai bentuk dibuang,
 * bukan disimpan.
 */
const telemetrySchema = z.object({
  device_id: z.string().min(1),
  timestamp: z.string().min(1),
  temperature: z.number().min(-20).max(80),
  humidity: z.number().min(0).max(100),
  soil_moisture: z.number().min(0).max(100),
  light_intensity: z.number().min(0).max(100),
  buzzer: z.boolean().default(false),
});

const statusSchema = z.object({
  device_id: z.string().min(1),
  state: z.enum(["online", "offline"]),
});

let client: mqtt.MqttClient | null = null;

/**
 * Status tanah terakhir per perangkat.
 *
 * Dipakai supaya event `alert` hanya dikirim saat status berubah
 * (normal → kering), bukan setiap 5 detik selama tanah masih kering.
 */
const lastSoilStatus = new Map<string, SoilStatus>();

export function connectMqtt(): mqtt.MqttClient {
  console.log(`[mqtt] menghubungkan ke ${config.mqtt.url} ...`);

  client = mqtt.connect(config.mqtt.url, {
    clientId: `smartfarm-backend-${Math.random().toString(16).slice(2, 10)}`,
    reconnectPeriod: 2000,
    connectTimeout: 10_000,
    clean: true,
  });

  client.on("connect", () => {
    console.log("[mqtt] terhubung");
    client?.subscribe([topics.anyTelemetry, topics.anyStatus], { qos: 1 }, (err) => {
      if (err) console.error("[mqtt] gagal subscribe:", err.message);
      else console.log(`[mqtt] subscribe ${topics.anyTelemetry}, ${topics.anyStatus}`);
    });
  });

  client.on("message", (topic, payload) => {
    handleMessage(topic, payload.toString());
  });

  client.on("error", (err) => console.error("[mqtt] error:", err.message));
  client.on("offline", () => console.warn("[mqtt] offline"));
  client.on("reconnect", () => console.log("[mqtt] mencoba menghubungkan ulang ..."));

  return client;
}

function handleMessage(topic: string, raw: string): void {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    console.warn(`[mqtt] payload bukan JSON di ${topic}`);
    return;
  }

  if (topic.endsWith("/telemetry")) handleTelemetry(json);
  else if (topic.endsWith("/status")) handleStatus(json);
}

function handleTelemetry(json: unknown): void {
  const parsed = telemetrySchema.safeParse(json);
  if (!parsed.success) {
    console.warn("[mqtt] telemetry tidak valid:", parsed.error.issues[0]?.message);
    return;
  }

  const telemetry = parsed.data;
  ensureDevice(telemetry.device_id);
  insertReading(telemetry);

  const soilStatus = getSoilStatus(telemetry.soil_moisture);
  const reading: Reading = {
    ...telemetry,
    soil_status: soilStatus,
    state: "online",
  };

  emitReading(reading);

  const previous = lastSoilStatus.get(telemetry.device_id);
  lastSoilStatus.set(telemetry.device_id, soilStatus);

  if (soilStatus === "kering" && previous !== "kering") {
    emitAlert({
      device_id: telemetry.device_id,
      type: "soil_dry",
      message: `Tanah kering — kelembapan ${telemetry.soil_moisture}%`,
      value: telemetry.soil_moisture,
    });
    console.log(`[alert] ${telemetry.device_id} tanah kering (${telemetry.soil_moisture}%)`);
  }
}

function handleStatus(json: unknown): void {
  const parsed = statusSchema.safeParse(json);
  if (!parsed.success) return;

  const { device_id, state } = parsed.data;
  ensureDevice(device_id);
  setDeviceState(device_id, state);
  emitDeviceState({ device_id, state });
  console.log(`[mqtt] ${device_id} ${state}`);
}

export function isMqttConnected(): boolean {
  return client?.connected ?? false;
}

export function publishCommand(deviceId: string, action: BuzzerAction): boolean {
  if (!client?.connected) return false;

  client.publish(
    topics.command(deviceId),
    JSON.stringify({ device_id: deviceId, command: "buzzer", action }),
    { qos: 1 },
  );
  console.log(`[mqtt] command buzzer ${action} -> ${deviceId}`);
  return true;
}

/**
 * Menandai semua perangkat offline saat server baru dinyalakan.
 *
 * Status `online` di database adalah sisa dari sesi sebelumnya dan belum tentu
 * masih benar. Status yang sebenarnya akan terisi lagi begitu LWT retain atau
 * telemetry pertama masuk.
 */
export function resetDeviceStates(): void {
  const device = findDevice(config.device.id);
  if (device?.state === "online") setDeviceState(config.device.id, "offline");
}

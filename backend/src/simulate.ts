/**
 * Simulator perangkat IoT.
 *
 * Mem-publish telemetry palsu ke MQTT dengan format yang sama persis seperti
 * ESP32, dan menanggapi command buzzer seperti ESP32. Tujuannya supaya backend
 * dan aplikasi mobile bisa dikembangkan serta diuji penuh tanpa menunggu
 * perangkat keras siap.
 *
 * Jalankan di terminal terpisah dari server:
 *   npm run simulate
 *
 * Nilai kelembapan tanah dibuat menurun perlahan lalu "disiram" kembali, agar
 * siklus normal → kering → alarm → normal bisa dilihat tanpa menunggu lama.
 */

import mqtt from "mqtt";
import { config, topics } from "./config";
import { DRY_ALARM_DELAY_MS, THRESHOLDS, TELEMETRY_INTERVAL_MS } from "../../shared/thresholds";
import { nowJakarta } from "../../shared/time";
import type { BuzzerAction, Telemetry } from "../../shared/types";

const deviceId = config.device.id;

/** Kondisi perangkat palsu. */
const state = {
  temperature: 26.5,
  humidity: 70,
  soilMoisture: 65,
  lightIntensity: 60,
  buzzerMode: "AUTO" as BuzzerAction,
  buzzerOn: false,
  drySince: null as number | null,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Perubahan acak kecil, supaya grafik terlihat alami dan tidak kaku. */
function drift(scale: number): number {
  return (Math.random() - 0.5) * scale;
}

function step(): void {
  state.temperature = clamp(state.temperature + drift(0.6), 22, 34);
  state.humidity = clamp(state.humidity + drift(3), 45, 88);

  // Tanah mengering perlahan, lalu disiram ulang saat sudah sangat kering.
  state.soilMoisture = clamp(state.soilMoisture - 0.8 + drift(0.5), 0, 100);
  if (state.soilMoisture <= 12) {
    state.soilMoisture = 68;
    console.log("[sim] tanah disiram — kelembapan kembali ke 68%");
  }

  // Intensitas cahaya mengikuti pola harian sederhana.
  const hour = new Date().getHours() + new Date().getMinutes() / 60;
  const daylight = Math.sin(((hour - 6) / 12) * Math.PI);
  state.lightIntensity = clamp(Math.max(0, daylight) * 85 + drift(6), 0, 100);

  updateBuzzer();
}

function updateBuzzer(): void {
  if (state.buzzerMode === "ON") {
    state.buzzerOn = true;
    return;
  }
  if (state.buzzerMode === "OFF") {
    state.buzzerOn = false;
    state.drySince = null;
    return;
  }

  // Mode AUTO: buzzer berbunyi setelah tanah kering selama DRY_ALARM_DELAY_MS.
  const isDry = state.soilMoisture < THRESHOLDS.soil_moisture.low;

  if (!isDry) {
    state.drySince = null;
    state.buzzerOn = false;
    return;
  }

  state.drySince ??= Date.now();
  state.buzzerOn = Date.now() - state.drySince >= DRY_ALARM_DELAY_MS;
}

const client = mqtt.connect(config.mqtt.url, {
  clientId: `smartfarm-sim-${Math.random().toString(16).slice(2, 10)}`,
  reconnectPeriod: 2000,
  // Last Will: broker mengirim ini otomatis kalau simulator mati mendadak,
  // persis seperti yang dilakukan ESP32.
  will: {
    topic: topics.status(deviceId),
    payload: Buffer.from(JSON.stringify({ device_id: deviceId, state: "offline" })),
    qos: 1,
    retain: true,
  },
});

client.on("connect", () => {
  console.log(`[sim] terhubung ke ${config.mqtt.url}`);
  console.log(`[sim] perangkat ${deviceId}, publish tiap ${TELEMETRY_INTERVAL_MS / 1000} detik`);

  client.publish(
    topics.status(deviceId),
    JSON.stringify({ device_id: deviceId, state: "online" }),
    { qos: 1, retain: true },
  );

  client.subscribe(topics.command(deviceId), { qos: 1 });
});

client.on("message", (topic, payload) => {
  if (topic !== topics.command(deviceId)) return;

  try {
    const message = JSON.parse(payload.toString()) as { action?: BuzzerAction };
    if (message.action === "ON" || message.action === "OFF" || message.action === "AUTO") {
      state.buzzerMode = message.action;
      updateBuzzer();
      console.log(`[sim] command diterima: buzzer ${message.action}`);
    }
  } catch {
    console.warn("[sim] command bukan JSON yang valid");
  }
});

client.on("error", (err) => console.error("[sim] error:", err.message));

setInterval(() => {
  step();

  const telemetry: Telemetry = {
    device_id: deviceId,
    timestamp: nowJakarta(),
    temperature: Number(state.temperature.toFixed(1)),
    humidity: Math.round(state.humidity),
    soil_moisture: Math.round(state.soilMoisture),
    light_intensity: Math.round(state.lightIntensity),
    buzzer: state.buzzerOn,
  };

  client.publish(topics.telemetry(deviceId), JSON.stringify(telemetry), { qos: 0 });

  console.log(
    `[sim] ${telemetry.temperature}°C  udara ${telemetry.humidity}%  ` +
      `tanah ${telemetry.soil_moisture}%  cahaya ${telemetry.light_intensity}%  ` +
      `buzzer ${telemetry.buzzer ? "ON" : "off"} (${state.buzzerMode})`,
  );
}, TELEMETRY_INTERVAL_MS);

function shutdown(): void {
  console.log("\n[sim] berhenti, menandai perangkat offline ...");
  client.publish(
    topics.status(deviceId),
    JSON.stringify({ device_id: deviceId, state: "offline" }),
    { qos: 1, retain: true },
    () => client.end(false, {}, () => process.exit(0)),
  );
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

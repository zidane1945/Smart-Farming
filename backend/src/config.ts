import "dotenv/config";

const prefix = process.env.MQTT_TOPIC_PREFIX ?? "kelompok3";

export const config = {
  port: Number(process.env.PORT ?? 3000),

  jwt: {
    secret: process.env.JWT_SECRET ?? "dev-secret-jangan-dipakai-di-produksi",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },

  mqtt: {
    url: process.env.MQTT_URL ?? "mqtt://broker.emqx.io:1883",
    prefix,
  },

  device: {
    id: process.env.DEVICE_ID ?? "smartfarm-01",
    name: process.env.DEVICE_NAME ?? "Smart Farm 01",
  },

  dbPath: process.env.DB_PATH ?? "data/smartfarm.db",

  demo: {
    name: process.env.DEMO_NAME ?? "Petani Demo",
    email: process.env.DEMO_EMAIL ?? "petani@smartfarm.id",
    password: process.env.DEMO_PASSWORD ?? "password123",
  },
} as const;

/**
 * Nama topic MQTT. Dikumpulkan di satu tempat supaya backend, simulator, dan
 * firmware ESP32 tidak pernah salah ketik topic.
 *
 * Acuan: docs/API-CONTRACT.md Bagian 2.2
 */
export const topics = {
  telemetry: (deviceId: string) => `${prefix}/${deviceId}/telemetry`,
  command: (deviceId: string) => `${prefix}/${deviceId}/command`,
  status: (deviceId: string) => `${prefix}/${deviceId}/status`,

  /** Wildcard untuk subscribe semua perangkat sekaligus. */
  anyTelemetry: `${prefix}/+/telemetry`,
  anyStatus: `${prefix}/+/status`,
} as const;

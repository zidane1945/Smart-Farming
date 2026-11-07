import { Router } from "express";
import { z } from "zod";
import {
  findDevice,
  findHistory,
  findLatestReading,
  insertCommand,
  listDevices,
} from "../db";
import { fail, ok } from "../http";
import { isMqttConnected, publishCommand } from "../mqtt";
import { getSoilStatus } from "../../../shared/thresholds";
import { nowJakarta } from "../../../shared/time";
import type {
  CommandResponse,
  HistoryResponse,
  Reading,
} from "../../../shared/types";

export const devicesRouter = Router();

/** GET /api/devices */
devicesRouter.get("/", (_req, res) => {
  ok(res, listDevices());
});

/** GET /api/devices/:deviceId/latest */
devicesRouter.get("/:deviceId/latest", (req, res) => {
  const { deviceId } = req.params;

  const device = findDevice(deviceId);
  if (!device) {
    fail(res, 404, "DEVICE_NOT_FOUND", `Perangkat ${deviceId} tidak terdaftar`);
    return;
  }

  const telemetry = findLatestReading(deviceId);
  if (!telemetry) {
    fail(res, 404, "NO_DATA", "Perangkat belum pernah mengirim data sensor");
    return;
  }

  const reading: Reading = {
    ...telemetry,
    soil_status: getSoilStatus(telemetry.soil_moisture),
    state: device.state,
  };

  ok(res, reading);
});

const historyQuery = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(50),
  from: z.string().min(1).optional(),
  to: z.string().min(1).optional(),
  /** Rata-ratakan per N menit. Kosong berarti data mentah. */
  bucket: z.coerce.number().int().min(1).max(1440).optional(),
});

/** GET /api/devices/:deviceId/history */
devicesRouter.get("/:deviceId/history", (req, res) => {
  const { deviceId } = req.params;

  if (!findDevice(deviceId)) {
    fail(res, 404, "DEVICE_NOT_FOUND", `Perangkat ${deviceId} tidak terdaftar`);
    return;
  }

  const parsed = historyQuery.safeParse(req.query);
  if (!parsed.success) {
    fail(res, 400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Query tidak valid");
    return;
  }

  const readings = findHistory(deviceId, {
    limit: parsed.data.limit,
    from: parsed.data.from,
    to: parsed.data.to,
    bucketMinutes: parsed.data.bucket,
  });

  const payload: HistoryResponse = { readings, count: readings.length };
  ok(res, payload);
});

const commandSchema = z.object({
  command: z.literal("buzzer"),
  action: z.enum(["ON", "OFF", "AUTO"]),
});

/** POST /api/devices/:deviceId/command */
devicesRouter.post("/:deviceId/command", (req, res) => {
  const { deviceId } = req.params;

  const device = findDevice(deviceId);
  if (!device) {
    fail(res, 404, "DEVICE_NOT_FOUND", `Perangkat ${deviceId} tidak terdaftar`);
    return;
  }

  const parsed = commandSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, 400, "VALIDATION_ERROR", "Command harus 'buzzer' dengan action ON, OFF, atau AUTO");
    return;
  }

  if (!isMqttConnected()) {
    fail(res, 503, "DEVICE_OFFLINE", "Server belum terhubung ke MQTT broker");
    return;
  }

  if (device.state !== "online") {
    fail(res, 503, "DEVICE_OFFLINE", "Perangkat tidak terhubung");
    return;
  }

  const sent = publishCommand(deviceId, parsed.data.action);
  if (!sent) {
    fail(res, 503, "DEVICE_OFFLINE", "Command gagal dikirim ke broker");
    return;
  }

  insertCommand(deviceId, "buzzer", parsed.data.action, req.user?.userId ?? null);

  const payload: CommandResponse = {
    command: "buzzer",
    action: parsed.data.action,
    sent_at: nowJakarta(),
  };

  ok(res, payload);
});

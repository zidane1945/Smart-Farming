import type {
  CommandResponse,
  Device,
  BuzzerAction,
  HistoryResponse,
  LoginResponse,
  Reading,
} from "@shared/types";
import { request } from "./client";

export function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function listDevices(): Promise<Device[]> {
  return request<Device[]>("/devices");
}

export function getLatest(deviceId: string): Promise<Reading> {
  return request<Reading>(`/devices/${deviceId}/latest`);
}

export interface HistoryParams {
  limit?: number;
  /** Rata-ratakan per N menit. Desain tabel riwayat memakai selang 5 menit. */
  bucket?: number;
  from?: string;
  to?: string;
}

export function getHistory(
  deviceId: string,
  params: HistoryParams = {},
): Promise<HistoryResponse> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }
  const suffix = query.toString() ? `?${query}` : "";
  return request<HistoryResponse>(`/devices/${deviceId}/history${suffix}`);
}

export function sendBuzzerCommand(
  deviceId: string,
  action: BuzzerAction,
): Promise<CommandResponse> {
  return request<CommandResponse>(`/devices/${deviceId}/command`, {
    method: "POST",
    body: { command: "buzzer", action },
  });
}

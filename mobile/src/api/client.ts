import Constants from "expo-constants";
import type { ApiErrorCode, ApiResponse } from "@shared/types";

const BACKEND_PORT = 3000;

/**
 * Menentukan alamat backend.
 *
 * Saat pengembangan, IP laptop berubah setiap kali berpindah jaringan atau
 * saat DHCP memberi alamat baru. Mengetik ulang IP di .env setiap kali itu
 * terjadi membuang waktu dan sering jadi penyebab "aplikasi tidak connect"
 * yang membingungkan.
 *
 * Karena itu alamatnya diturunkan otomatis dari Expo: `hostUri` berisi alamat
 * laptop yang menjalankan Metro, misalnya "192.168.1.5:8081". Backend berada
 * di laptop yang sama pada port 3000, jadi cukup tukar nomor portnya.
 *
 * EXPO_PUBLIC_API_URL tetap dihormati dan diprioritaskan — dibutuhkan untuk
 * build APK, yang tidak punya Metro untuk ditanyai.
 */
function resolveApiUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

  const host = hostUri?.split(":")[0];
  if (host) return `http://${host}:${BACKEND_PORT}`;

  // Jalur terakhir: hanya benar kalau aplikasi dibuka di browser laptop.
  return `http://localhost:${BACKEND_PORT}`;
}

export const API_URL = resolveApiUrl();

/** Error yang membawa kode dari backend, supaya layar bisa membedakan sebabnya. */
export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode | "NETWORK_ERROR",
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  /** Dibatalkan setelah sekian milidetik supaya layar tidak menggantung. */
  timeoutMs?: number;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, timeoutMs = 10_000 } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // Gagal sebelum sempat dapat response: server mati, salah IP, beda WiFi,
    // atau diblokir firewall. Semua terasa sama dari sisi aplikasi.
    throw new ApiError(
      "NETWORK_ERROR",
      `Tidak bisa menghubungi server di ${API_URL}. Pastikan backend berjalan dan HP satu WiFi dengan laptop.`,
    );
  } finally {
    clearTimeout(timer);
  }

  let json: ApiResponse<T>;
  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError("INTERNAL_ERROR", "Response server bukan JSON yang valid");
  }

  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message);
  }

  return json.data;
}

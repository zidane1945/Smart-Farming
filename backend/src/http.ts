import type { Response } from "express";
import type { ApiErrorCode } from "../../shared/types";

/**
 * Pembungkus response. Semua endpoint memakai dua fungsi ini supaya bentuk
 * response selalu sama dengan docs/API-CONTRACT.md Bagian 4 — mobile cuma
 * perlu memeriksa satu field `success`.
 */

export function ok<T>(res: Response, data: T): Response {
  return res.json({ success: true, data });
}

export function fail(
  res: Response,
  status: number,
  code: ApiErrorCode,
  message: string,
): Response {
  return res.status(status).json({ success: false, error: { code, message } });
}

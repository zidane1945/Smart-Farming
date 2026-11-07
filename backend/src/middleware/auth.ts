import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { fail } from "../http";

export interface AuthPayload {
  userId: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/** Memeriksa header `Authorization: Bearer <token>`. */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.header("authorization");

  if (!header?.startsWith("Bearer ")) {
    fail(res, 401, "UNAUTHORIZED", "Token tidak ditemukan di header Authorization");
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwt.secret);

    if (
      typeof payload === "string" ||
      typeof payload.userId !== "number" ||
      typeof payload.email !== "string"
    ) {
      fail(res, 401, "UNAUTHORIZED", "Isi token tidak sesuai");
      return;
    }

    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    fail(res, 401, "UNAUTHORIZED", "Token tidak valid atau sudah kedaluwarsa");
  }
}

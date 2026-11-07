import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config";
import { findUserByEmail } from "../db";
import { fail, ok } from "../http";
import type { LoginResponse } from "../../../shared/types";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

authRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, 400, "VALIDATION_ERROR", "Format email atau password tidak valid");
    return;
  }

  const user = findUserByEmail(parsed.data.email);

  // Pesan error disamakan untuk email yang tidak ada dan password yang salah,
  // supaya tidak membocorkan email mana yang terdaftar.
  if (!user || !bcrypt.compareSync(parsed.data.password, user.password_hash)) {
    fail(res, 401, "INVALID_CREDENTIALS", "Email atau password salah");
    return;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"] },
  );

  const payload: LoginResponse = {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };

  ok(res, payload);
});

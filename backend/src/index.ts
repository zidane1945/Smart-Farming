import http from "node:http";
import cors from "cors";
import express from "express";
import { config } from "./config";
import { connectMqtt, isMqttConnected, resetDeviceStates } from "./mqtt";
import { requireAuth } from "./middleware/auth";
import { initRealtime } from "./realtime";
import { authRouter } from "./routes/auth";
import { devicesRouter } from "./routes/devices";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      mqtt: isMqttConnected() ? "connected" : "disconnected",
      uptime_seconds: Math.round(process.uptime()),
    },
  });
});

app.use("/api/auth", authRouter);
app.use("/api/devices", requireAuth, devicesRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "DEVICE_NOT_FOUND", message: "Endpoint tidak ditemukan" },
  });
});

const server = http.createServer(app);

initRealtime(server);
resetDeviceStates();
connectMqtt();

server.listen(config.port, () => {
  console.log(`[http] server berjalan di http://localhost:${config.port}`);
  console.log(`[http] cek kesehatan: http://localhost:${config.port}/api/health`);
  console.log(`[http] login demo: ${config.demo.email} / ${config.demo.password}`);
});

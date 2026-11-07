import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type {
  AlertEvent,
  ClientToServerEvents,
  DeviceStatusMessage,
  Reading,
  ServerToClientEvents,
} from "../../shared/types";

type IoServer = Server<ClientToServerEvents, ServerToClientEvents>;

let io: IoServer | null = null;

export function initRealtime(httpServer: HttpServer): IoServer {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    // Mobile diakses dari IP lokal yang berubah-ubah (hotspot, WiFi kampus),
    // jadi origin tidak dibatasi. Cukup untuk prototype di jaringan lokal.
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`[socket] terhubung: ${socket.id}`);

    // Satu room per perangkat, supaya telemetry hanya dikirim ke klien yang
    // memang sedang membuka perangkat itu.
    socket.on("subscribe", ({ device_id }) => {
      void socket.join(device_id);
      console.log(`[socket] ${socket.id} subscribe ${device_id}`);
    });

    socket.on("disconnect", () => {
      console.log(`[socket] terputus: ${socket.id}`);
    });
  });

  return io;
}

export function emitReading(reading: Reading): void {
  io?.to(reading.device_id).emit("reading", reading);
}

export function emitDeviceState(payload: DeviceStatusMessage): void {
  io?.to(payload.device_id).emit("device_state", payload);
}

export function emitAlert(alert: AlertEvent): void {
  io?.to(alert.device_id).emit("alert", alert);
}

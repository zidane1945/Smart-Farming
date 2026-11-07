import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import type {
  AlertEvent,
  ClientToServerEvents,
  Reading,
  ServerToClientEvents,
} from "@shared/types";
import { API_URL, ApiError } from "../api/client";
import { getLatest } from "../api/devices";
import { useAuth } from "./auth";

export const DEVICE_ID = process.env.EXPO_PUBLIC_DEVICE_ID ?? "smartfarm-01";

/** Peringatan beserta waktu diterimanya, untuk label "N menit yang lalu". */
export interface ReceivedAlert extends AlertEvent {
  receivedAt: number;
}

interface DeviceState {
  reading: Reading | null;
  /** Sudah tersambung ke server realtime */
  connected: boolean;
  /** Pembacaan pertama sedang diambil */
  loading: boolean;
  /** Pesan kesalahan yang layak ditampilkan ke pengguna */
  error: string | null;
  /**
   * Peringatan tanah kering, terbaru lebih dulu.
   *
   * Hanya bertahan selama aplikasi terbuka — backend belum menyimpan
   * notifikasi. Lihat docs/UI-UX/README.md temuan nomor 7.
   */
  alerts: ReceivedAlert[];
  refresh: () => Promise<void>;
}

const DeviceContext = createContext<DeviceState | null>(null);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [reading, setReading] = useState<Reading | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<ReceivedAlert[]>([]);

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  const refresh = useCallback(async () => {
    try {
      setReading(await getLatest(DEVICE_ID));
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        // Perangkat terdaftar tapi belum mengirim apa pun bukan kesalahan —
        // tampilannya cukup "menunggu data", bukan pesan error merah.
        setError(
          err.code === "NO_DATA"
            ? "Menunggu data pertama dari perangkat"
            : err.message,
        );
      } else {
        setError("Terjadi kesalahan yang tidak dikenali");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Satu socket untuk seluruh aplikasi. Kalau tiap layar membuka koneksi
  // sendiri, server akan mengirim data yang sama berkali-kali.
  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      setReading(null);
      setAlerts([]);
      setLoading(true);
      return;
    }

    void refresh();

    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(API_URL, {
      transports: ["websocket"],
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("subscribe", { device_id: DEVICE_ID });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("reading", (next) => {
      setReading(next);
      setError(null);
      setLoading(false);
    });

    socket.on("device_state", ({ state }) => {
      setReading((current) => (current ? { ...current, state } : current));
    });

    socket.on("alert", (alert) => {
      setAlerts((current) =>
        [{ ...alert, receivedAt: Date.now() }, ...current].slice(0, 50),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, refresh]);

  const value = useMemo<DeviceState>(
    () => ({ reading, connected, loading, error, alerts, refresh }),
    [reading, connected, loading, error, alerts, refresh],
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDevice(): DeviceState {
  const context = useContext(DeviceContext);
  if (!context) throw new Error("useDevice harus dipakai di dalam DeviceProvider");
  return context;
}

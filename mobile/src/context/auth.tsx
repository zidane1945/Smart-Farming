import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@shared/types";
import { setAuthToken } from "../api/client";
import { login as loginRequest } from "../api/devices";

const TOKEN_KEY = "smartfarm.token";
const USER_KEY = "smartfarm.user";

interface AuthState {
  user: User | null;
  /** true selama token tersimpan sedang dibaca saat aplikasi dibuka */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Memulihkan sesi dari penyimpanan aman supaya pengguna tidak perlu login
  // ulang setiap kali aplikasi dibuka.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [token, storedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);

        if (!cancelled && token && storedUser) {
          setAuthToken(token);
          setUser(JSON.parse(storedUser) as User);
        }
      } catch {
        // Penyimpanan rusak atau tidak tersedia — anggap belum login.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);

    setAuthToken(result.token);
    setUser(result.user);

    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, result.token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user)),
    ]);
  }, []);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setUser(null);

    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return context;
}

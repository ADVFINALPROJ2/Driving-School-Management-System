"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  logout as apiLogout,
  getMe,
  clearToken,
  getToken,
  refreshToken as apiRefresh,
  getJwtExpiresIn,
  type User,
} from "@/lib/api";
<<<<<<< HEAD
import { setRole, clearAuth as clearAuthStorage } from "@/lib/auth";
import { MOCK_USERS } from "@/lib/mock-users";
=======
import { loadLicenseCategories } from "@/lib/enrollment-types";
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

<<<<<<< HEAD
export const AuthContext = createContext<AuthContextType | null>(null);
=======
const AuthContext = createContext<AuthContextValue | null>(null);
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !isLoading && user !== null && token !== null;

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
<<<<<<< HEAD
    const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";
    
    if (useMockAuth) {
      // Use mock authentication
      const mockUser = MOCK_USERS[email];
      if (mockUser && mockUser.password === password) {
        // Store a mock token and role
        setToken("mock-token-" + Date.now());
        setRole(mockUser.user.role as any);
        setUser(mockUser.user);
        return null;
      }
      return "Invalid email or password";
    }
    
    // Use API authentication
    const res = await apiLogin(email, password);
    if (res.success && res.data) {
      setToken(res.data.token);
      setRole(res.data.user.role as any);
      setUser(res.data.user);
=======
    const result = await apiLogin(email, password);
    if (result.success && result.data) {
      setUser(result.data.user);
      setTokenState(result.data.token);
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
      return null;
    }
    return result.error || "Login failed";
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
<<<<<<< HEAD
    clearAuthStorage();
=======
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
    setUser(null);
    setTokenState(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const storedToken = getToken();
    if (!storedToken) {
      startTransition(() => setIsLoading(false));
      return;
    }

    startTransition(() => setTokenState(storedToken));

    getMe().then((result) => {
      startTransition(() => {
        if (result.success && result.data) {
          setUser(result.data.user);
        } else {
          clearToken();
          setTokenState(null);
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
      });
    });
  }, []);

  // Auto-refresh the JWT before it expires.
  useEffect(() => {
    if (!token) return;

    const expiresIn = getJwtExpiresIn(token);
    // Refresh 5 minutes before expiry, or at 80% lifetime — whichever is sooner.
    const refreshIn = Math.max(0, Math.min(expiresIn - 300, expiresIn * 0.8)) * 1000;

    // If already expired or very close, refresh immediately.
    if (refreshIn < 10_000) {
      apiRefresh().then((r) => {
        if (r.success && r.data) {
          setTokenState(r.data.token);
          setUser(r.data.user);
        } else {
          clearToken();
          setTokenState(null);
          setUser(null);
        }
      });
    }

    const timer = setTimeout(() => {
      apiRefresh().then((r) => {
        if (r.success && r.data) {
          setTokenState(r.data.token);
          setUser(r.data.user);
        } else {
          clearToken();
          setTokenState(null);
          setUser(null);
        }
      });
    }, refreshIn);

    return () => clearTimeout(timer);
  }, [token]);

  // Load license categories from backend once at startup.
  // Falls back to hardcoded data if the API is unreachable.
  useEffect(() => {
    loadLicenseCategories();
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, isAuthenticated, login, logout }),
    [user, token, isLoading, isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

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
  register as apiRegister,
  getMe,
  setToken,
  clearToken,
  getToken,
  refreshToken as apiRefresh,
  getJwtExpiresIn,
  type User,
} from "@/lib/api";
import { loadLicenseCategories } from "@/lib/enrollment-types";
import {
  MOCK_USERS,
  generateMockToken,
  decodeMockToken,
  isMockAuth,
} from "@/lib/mock-users";

type RegisterParams = {
  email: string;
  password: string;
  password_confirmation: string;
  full_name: string;
  phone_number?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  register: (params: RegisterParams) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !isLoading && user !== null && token !== null;

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (isMockAuth()) {
      const mockUser = MOCK_USERS[email];
      if (!mockUser || mockUser.password !== password) {
        return "Invalid email or password";
      }
      const token = generateMockToken(mockUser.user);
      setUser(mockUser.user);
      setTokenState(token);
      setToken(token);
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `role=${mockUser.user.role}; path=/; max-age=86400; SameSite=Lax`;
      return null;
    }

    const result = await apiLogin(email, password);
    if (result.success && result.data) {
      setUser(result.data.user);
      setTokenState(result.data.token);
      setToken(result.data.token);
      document.cookie = `token=${result.data.token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `role=${result.data.user.role}; path=/; max-age=86400; SameSite=Lax`;

      return null;
    }
    return result.error || "Login failed";
  }, []);

  const logout = useCallback(async () => {
    if (!isMockAuth()) {
      await apiLogout();
    }
    setUser(null);
    setTokenState(null);
    clearToken();
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    router.push("/login");
  }, [router]);

  const register = useCallback(async (params: RegisterParams): Promise<string | null> => {
    if (isMockAuth()) {
      return "Registration is not available in mock mode. Use one of the predefined mock accounts.";
    }
    const result = await apiRegister(params);
    if (result.success && result.data) {
      setUser(result.data.user);
      setTokenState(result.data.token);
      setToken(result.data.token);
      document.cookie = `token=${result.data.token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `role=${result.data.user.role}; path=/; max-age=86400; SameSite=Lax`;
      return null;
    }
    return result.error || "Registration failed";
  }, []);

  useEffect(() => {
    const storedToken = getToken();
    if (!storedToken) {
      startTransition(() => setIsLoading(false));
      return;
    }

    startTransition(() => setTokenState(storedToken));

    if (isMockAuth()) {
      const user = decodeMockToken(storedToken);
      if (user) {
        setUser(user);
      } else {
        clearToken();
        setTokenState(null);
      }
      setIsLoading(false);
      return;
    }

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

    if (isMockAuth()) {
      const user = decodeMockToken(token);
      if (user) {
        const newToken = generateMockToken(user);
        setTokenState(newToken);
        setToken(newToken);
        document.cookie = `token=${newToken}; path=/; max-age=86400; SameSite=Lax`;
      }
      return;
    }

    const expiresIn = getJwtExpiresIn(token);
    // Refresh 5 minutes before expiry, or at 80% lifetime — whichever is sooner.
    const refreshIn = Math.max(0, Math.min(expiresIn - 300, expiresIn * 0.8)) * 1000;

    // If already expired or very close, refresh immediately.
    if (refreshIn < 10_000) {
      apiRefresh().then((r) => {
        if (r.success && r.data) {
          setTokenState(r.data.token);
          setToken(r.data.token);
          setUser(r.data.user);
          document.cookie = `token=${r.data.token}; path=/; max-age=86400; SameSite=Lax`;
        } else {
          clearToken();
          setTokenState(null);
          setUser(null);
          document.cookie = "token=; path=/; max-age=0";
          document.cookie = "role=; path=/; max-age=0";
        }
      });
    }

    const timer = setTimeout(() => {
      apiRefresh().then((r) => {
        if (r.success && r.data) {
          setTokenState(r.data.token);
          setToken(r.data.token);
          setUser(r.data.user);
          document.cookie = `token=${r.data.token}; path=/; max-age=86400; SameSite=Lax`;
        } else {
          clearToken();
          setTokenState(null);
          setUser(null);
          document.cookie = "token=; path=/; max-age=0";
          document.cookie = "role=; path=/; max-age=0";
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
    () => ({ user, token, isLoading, isAuthenticated, login, logout, register }),
    [user, token, isLoading, isAuthenticated, login, logout, register],
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

"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  getToken, setToken, clearToken,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
  type User,
} from "@/lib/api";
import { setRole, clearAuth as clearAuthStorage } from "@/lib/auth";
import { MOCK_USERS } from "@/lib/mock-users";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (data: {
    email: string;
    password: string;
    password_confirmation: string;
    full_name: string;
    phone_number?: string;
  }) => Promise<string | null>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    let cancelled = false;

    const done = () => {
      if (!cancelled) setLoading(false);
    };

    if (token) {
      getMe().then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setUser(res.data.user);
        } else {
          clearToken();
        }
        done();
      });
    } else {
      Promise.resolve().then(done);
    }

    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
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
      return null;
    }
    return res.error || "Login failed";
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    password_confirmation: string;
    full_name: string;
    phone_number?: string;
  }): Promise<string | null> => {
    const res = await apiRegister(data);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      return null;
    }
    return res.error || "Registration failed";
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    clearAuthStorage();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

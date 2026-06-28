<<<<<<< HEAD
// Authentication utilities for token management and user role handling.
// Provides localStorage-based token storage and role type definitions.

const TOKEN_KEY = "driving_school_token";
const ROLE_KEY = "user_role";

export type UserRole = "admin" | "receptionist" | "instructor" | "staff" | "student" | "manager";
=======
export type UserRole = "admin" | "receptionist" | "instructor";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

const TOKEN_KEY = "driving_school_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

<<<<<<< HEAD
export function getRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem(ROLE_KEY);
  return role as UserRole | null;
}

export function setRole(role: UserRole): void {
  localStorage.setItem(ROLE_KEY, role);
}

export function removeRole(): void {
  localStorage.removeItem(ROLE_KEY);
}

export function clearAuth(): void {
  removeToken();
  removeRole();
=======
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    const json = await response.json();
    return json as User;
  } catch {
    return null;
  }
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
}

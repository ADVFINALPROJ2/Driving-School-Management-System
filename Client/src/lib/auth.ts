// Authentication utilities for token management and user role handling.
// Provides localStorage-based token storage and role type definitions.

const TOKEN_KEY = "driving_school_token";
const ROLE_KEY = "user_role";

export type UserRole = "admin" | "receptionist" | "instructor" | "staff" | "student" | "manager";

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
}

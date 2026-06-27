// Auth utilities for client-side role checking.
// Decodes the JWT payload (base64) to extract user role and other claims.
// TODO: Replace with a proper auth library / middleware-based role check
//       once backend RBAC is fully integrated (Pundit roles).

import { getToken } from "@/lib/api";

type JwtPayload = {
  sub?: number;
  email?: string;
  role?: string;
  exp?: number;
  [key: string]: unknown;
};

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getUserRole(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  return payload?.role ?? null;
}

export function isAdmin(): boolean {
  return getUserRole() === "admin";
}

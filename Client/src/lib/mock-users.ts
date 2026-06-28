// Mock users for development when the API is not available.
// These users simulate different roles in the Driving School Management System.

import type { User } from "./api";

export const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "admin@driving-school.com": {
    password: "admin123",
    user: {
      id: 1,
      email: "admin@driving-school.com",
      full_name: "System Administrator",
      role: "admin",
      phone_number: "+251911000001",
      is_qualified_instructor: false,
      created_at: new Date().toISOString(),
    },
  },
  "instructor@driving-school.com": {
    password: "instructor123",
    user: {
      id: 2,
      email: "instructor@driving-school.com",
      full_name: "John Instructor",
      role: "instructor",
      phone_number: "+251911000002",
      is_qualified_instructor: true,
      created_at: new Date().toISOString(),
    },
  },
  "manager@driving-school.com": {
    password: "manager123",
    user: {
      id: 3,
      email: "manager@driving-school.com",
      full_name: "Sarah Manager",
      role: "admin",
      phone_number: "+251911000003",
      is_qualified_instructor: false,
      created_at: new Date().toISOString(),
    },
  },
  "staff@driving-school.com": {
    password: "staff123",
    user: {
      id: 4,
      email: "staff@driving-school.com",
      full_name: "Mike Staff",
      role: "clerk",
      phone_number: "+251911000004",
      is_qualified_instructor: false,
      created_at: new Date().toISOString(),
    },
  },
  "student@driving-school.com": {
    password: "student123",
    user: {
      id: 5,
      email: "student@driving-school.com",
      full_name: "Alex Student",
      role: "student",
      phone_number: "+251911000005",
      is_qualified_instructor: false,
      created_at: new Date().toISOString(),
    },
  },
};

export function useMockAuth() {
  const USE_MOCK_AUTH = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";

  return {
    enabled: USE_MOCK_AUTH,
    users: MOCK_USERS,
  };
}

/** Generates a pseudo-JWT for mock auth. The token embeds the full user object
 *  so it can be restored on page refresh without calling the backend. */
export function generateMockToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: user.email,
      user,
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
      iat: Math.floor(Date.now() / 1000),
    }),
  );
  return `${header}.${payload}.mock_sig`;
}

/** Decodes a mock token back to a User object. Returns null for invalid tokens. */
export function decodeMockToken(token: string): User | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.user ?? null;
  } catch {
    return null;
  }
}

/** Returns true when the environment is configured for mock auth. */
export function isMockAuth(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";
}

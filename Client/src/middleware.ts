import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

<<<<<<< HEAD
// Protected routes that require authentication
const protectedRoutes = ["/dashboard", "/admin", "/receptionist", "/instructor"];

// Role-based route access
const roleRoutes = {
=======
const protectedPaths = [
  "/",
  "/students",
  "/dashboard",
  "/admin",
  "/receptionist",
  "/instructor",
];

function matchesProtectedPath(pathname: string): boolean {
  return protectedPaths.some(
    (p) =>
      pathname === p ||
      pathname.startsWith(p + "/") ||
      (p === "/" && pathname === "/"),
  );
}

const roleAccess: Record<string, string[]> = {
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
  "/admin": ["admin"],
  "/receptionist": ["admin", "receptionist"],
  "/instructor": ["admin", "instructor"],
};

<<<<<<< HEAD
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("driving_school_token")?.value;
  const role = request.cookies.get("user_role")?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect to login if no token and trying to access protected route
  if (isProtectedRoute && !token) {
=======
function getRequiredSegments(pathname: string): string[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];
  return segments.reduce<string[]>((acc, _, i) => {
    acc.push("/" + segments.slice(0, i + 1).join("/"));
    return acc;
  }, []);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!matchesProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  if (!token) {
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

<<<<<<< HEAD
  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route) && token) {
      if (!role || !allowedRoles.includes(role)) {
        const unauthorizedUrl = new URL("/unauthorized", request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }
=======
  const role = request.cookies.get("role")?.value as string | undefined;
  const pathSegments = getRequiredSegments(pathname);

  for (const segment of pathSegments) {
    const allowed = roleAccess[segment];
    if (allowed && role && !allowed.includes(role)) {
      const unauthorizedUrl = new URL("/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
    }
  }

  return NextResponse.next();
}

export const config = {
<<<<<<< HEAD
  matcher: ["/dashboard/:path*", "/admin/:path*", "/receptionist/:path*", "/instructor/:path*"],
=======
  matcher: [
    "/",
    "/students/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/receptionist/:path*",
    "/instructor/:path*",
  ],
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
};

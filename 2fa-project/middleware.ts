import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "./lib/session";

// Add routes that should be accessible without authentication
const publicRoutes = ["/login", "/register"];

// Add routes that only require the initial authentication without 2FA
const basicAuthRoutes = ["/verify-totp", "/dashboard/setup-2fa"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes without authentication
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get session
  const session = await getIronSession<SessionData>(
    request,
    NextResponse.next(),
    sessionOptions
  );

  // If not authenticated, redirect to login
  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle authenticated routes based on 2FA status
  const isTotpEnabled = session.isTotpEnabled;
  const isTotpVerified = session.isTotpVerified;

  // If 2FA is enabled but not verified for this session, redirect to verification
  if (isTotpEnabled && !isTotpVerified && !basicAuthRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/verify-totp", request.url));
  }

  // Allow access for authenticated users
  return NextResponse.next();
}

// Configure the middleware to match specific paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/verify-totp",
    "/profile",
    // Add other protected routes here
  ],
};

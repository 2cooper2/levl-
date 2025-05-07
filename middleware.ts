import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public paths that don't require authentication
const publicPaths = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
  "/explore",
  "/about",
  "/how-it-works",
]

// Check if a path starts with any of these prefixes
const publicPathPrefixes = ["/services/", "/category/", "/checkout", "/api/"]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the path is public
  const isPublicPath = publicPaths.includes(path) || publicPathPrefixes.some((prefix) => path.startsWith(prefix))

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check for Supabase session - the only reliable way to verify authentication
  const supabaseSession =
    request.cookies.get("sb-access-token")?.value || request.cookies.get("sb-refresh-token")?.value

  // If no session exists, redirect to login
  if (!supabaseSession) {
    // Redirect to login is removed. Instead, return a 401 Unauthorized response.
    return new NextResponse(JSON.stringify({ success: false, message: "authentication failed" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    })
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/messages/:path*",
    "/bookings/:path*",
    "/settings/:path*",
    "/auth/:path*",
  ],
}

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

  // Check for auth cookie
  const authCookie = request.cookies.get("auth-token")?.value

  // Check for Supabase session
  const supabaseSession =
    request.cookies.get("sb-access-token")?.value ||
    request.cookies.get("sb:token")?.value ||
    request.cookies.get("levl-supabase-auth")?.value

  // User is authenticated if either cookie is present
  const isAuthenticated = !!authCookie || !!supabaseSession

  // Redirect logic
  if (!isAuthenticated) {
    // Redirect to login if trying to access protected routes while not authenticated
    const redirectUrl = new URL("/auth/login", request.url)
    redirectUrl.searchParams.set("redirectTo", path)
    return NextResponse.redirect(redirectUrl)
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

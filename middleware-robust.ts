import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Provider-only routes
const PROVIDER_ROUTES = ["/skill-progress", "/dashboard/services/new", "/portfolio/edit"]

// Auth-required routes
const AUTH_REQUIRED_ROUTES = [
  "/dashboard",
  "/skill-progress",
  "/portfolio",
  "/messages",
  "/bookings",
  "/settings",
  "/profile",
]

// Safe function to extract auth state from cookies
function isUserAuthenticated(request: NextRequest): boolean {
  try {
    // Check for auth token in cookies
    const authCookie = request.cookies.get("sb-auth-token")
    const supabaseAuthCookie = request.cookies.get("supabase-auth-token")

    return Boolean(authCookie?.value || supabaseAuthCookie?.value)
  } catch (error) {
    console.error("Error checking auth state in middleware:", error)
    // Default to not authenticated on error
    return false
  }
}

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const pathname = request.nextUrl.pathname

    // Skip middleware on static assets and API routes
    if (pathname.startsWith("/_next/") || pathname.startsWith("/static/") || pathname.startsWith("/api/")) {
      return response
    }

    const isAuthenticated = isUserAuthenticated(request)

    // Handle auth-required routes
    if (AUTH_REQUIRED_ROUTES.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
      const url = new URL("/auth/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    // Handle provider-only routes
    if (PROVIDER_ROUTES.some((route) => pathname.startsWith(route))) {
      if (!isAuthenticated) {
        const url = new URL("/auth/login", request.url)
        url.searchParams.set("redirect", pathname)
        return NextResponse.redirect(url)
      }

      // Since we can't check user roles directly in middleware,
      // set a header so the page can check roles
      response.headers.set("x-check-provider-role", "true")
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // Don't break the app on middleware errors
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/skill-progress/:path*",
    "/portfolio/:path*",
    "/messages/:path*",
    "/bookings/:path*",
    "/settings/:path*",
    "/profile/:path*",
  ],
}

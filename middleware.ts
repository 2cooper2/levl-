import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/auth/login" ||
    path === "/auth/signup" ||
    path === "/explore" ||
    path === "/about" ||
    path === "/how-it-works" ||
    path.startsWith("/services/") ||
    path.startsWith("/category/") ||
    path.startsWith("/checkout") ||
    path === "/api/webhooks/stripe" // Allow unauthenticated access to the webhook

  // Check if user is logged in
  const isAuthenticated = request.cookies.has("levl_user")

  // Redirect logic
  // if (!isPublicPath && !isAuthenticated) {
  //   // Redirect to login if trying to access protected routes while not authenticated
  //   return NextResponse.redirect(new URL("/auth/login", request.url))
  // }

  if ((path === "/auth/login" || path === "/auth/signup") && isAuthenticated) {
    // Redirect to dashboard if trying to access auth pages while already authenticated
    return NextResponse.redirect(new URL("/dashboard", request.url))
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
    "/api/webhooks/stripe", // Protect the webhook route
  ],
}

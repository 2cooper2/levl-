import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase"

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
    path.startsWith("/checkout")

  // Create a Supabase client for server-side authentication check
  const supabase = createServerClient()

  // Get the session from the request cookies
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthenticated = !!session

  // Redirect logic
  // Uncomment this block if you want to enforce authentication for protected routes
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
  ],
}

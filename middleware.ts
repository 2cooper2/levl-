import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Provider-only routes
const PROVIDER_ROUTES = ["/skill-progress", "/dashboard/services/new", "/portfolio/edit"]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // For provider-only routes, check user role
  const pathname = request.nextUrl.pathname
  if (PROVIDER_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    try {
      // Get user role
      const { data: userProfile, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single()

      // Handle potential error
      if (error) {
        console.error("Error fetching user profile:", error)
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }

      // Redirect clients away from provider-only routes
      if (!userProfile || userProfile.role !== "provider") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      console.error("Error in middleware:", error)
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return response
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

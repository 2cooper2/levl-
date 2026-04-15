import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Tracks requests per IP. Runs on the Edge so persists across requests
// on the same edge node. Caps at 100 req/min for general, 10 req/min for auth.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) return false
  record.count++
  return true
}

// ─── Allowed origins for CORS ─────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_BASE_URL,
  "http://localhost:3000",
].filter(Boolean)

// ─── Provider-only routes ─────────────────────────────────────────────────────
const PROVIDER_ROUTES = ["/skill-progress", "/dashboard/services/new", "/portfolio/edit"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const origin = request.headers.get("origin") ?? ""

  // ── Rate limiting ────────────────────────────────────────────────────────────
  const isAuthRoute = pathname.startsWith("/api/auth") || pathname.startsWith("/api/signup")
  const allowed = isAuthRoute
    ? checkRateLimit(`auth:${ip}`, 10, 60_000)   // 10 req/min on auth endpoints
    : checkRateLimit(`gen:${ip}`, 100, 60_000)   // 100 req/min everywhere else

  if (!allowed) {
    return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    })
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  // ── CORS (API routes only) ────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const originAllowed = ALLOWED_ORIGINS.includes(origin)

    if (request.method === "OPTIONS") {
      // Preflight
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": originAllowed ? origin : "",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      })
    }

    if (originAllowed) {
      response.headers.set("Access-Control-Allow-Origin", origin)
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    }
  }

  // ── Supabase auth ─────────────────────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options })
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options })
        response.cookies.set({ name, value: "", ...options })
      },
    },
  })

  const { data: { session } } = await supabase.auth.getSession()

  // Provider-only route protection
  if (PROVIDER_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    try {
      const { data: userProfile, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (error) {
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }

      if (!userProfile || userProfile.role !== "provider") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch {
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
    "/api/:path*",
  ],
}

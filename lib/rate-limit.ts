import { type NextRequest, NextResponse } from "next/server"

interface RateLimitOptions {
  limit: number
  windowMs: number
  keyGenerator?: (req: NextRequest) => string
}

const defaultOptions: RateLimitOptions = {
  limit: 100,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (req: NextRequest) => {
    return req.ip || "unknown"
  },
}

// In-memory store for rate limiting (replace with Redis for production)
const requestCounts: Record<string, { count: number; resetTime: number }> = {}

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now()
      Object.keys(requestCounts).forEach((key) => {
        if (requestCounts[key].resetTime <= now) {
          delete requestCounts[key]
        }
      })
    },
    5 * 60 * 1000,
  )
}

export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options }

  return function rateLimitMiddleware(req: NextRequest) {
    // Skip rate limiting for non-API routes
    if (!req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.next()
    }

    const key = opts.keyGenerator(req)
    const now = Date.now()

    // Initialize or get existing request count
    if (!requestCounts[key] || requestCounts[key].resetTime <= now) {
      requestCounts[key] = {
        count: 1,
        resetTime: now + opts.windowMs,
      }
    } else {
      requestCounts[key].count++
    }

    const currentCount = requestCounts[key].count
    const resetTime = requestCounts[key].resetTime

    // Set rate limit headers
    const response = NextResponse.next()

    response.headers.set("X-RateLimit-Limit", String(opts.limit))
    response.headers.set("X-RateLimit-Remaining", String(Math.max(0, opts.limit - currentCount)))
    response.headers.set("X-RateLimit-Reset", String(resetTime))

    // If rate limit is exceeded, return 429 Too Many Requests
    if (currentCount > opts.limit) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests, please try again later.",
          retryAfter: Math.ceil((resetTime - now) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((resetTime - now) / 1000)),
            "X-RateLimit-Limit": String(opts.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(resetTime),
          },
        },
      )
    }

    return response
  }
}

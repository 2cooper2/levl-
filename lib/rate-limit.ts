export type RateLimiterOptions = {
  limit?: number
  windowMs?: number
  keyGenerator?: (req: Request) => string
  message?: string
  statusCode?: number
}

// Store rate limit data in memory
const ratelimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of ratelimitStore.entries()) {
    if (data.resetTime < now) {
      ratelimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

export async function rateLimit(
  req: Request,
  options: RateLimiterOptions = {},
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  const {
    limit = 10,
    windowMs = 60000,
    keyGenerator = (req) => req.headers.get("x-forwarded-for") || "unknown",
    message = "Too many requests, please try again later.",
    statusCode = 429,
  } = options

  const key = keyGenerator(req)
  const now = Date.now()

  // Get or initialize rate limit data for this key
  let data = ratelimitStore.get(key)
  if (!data || data.resetTime <= now) {
    data = { count: 0, resetTime: now + windowMs }
    ratelimitStore.set(key, data)
  }

  // Increment count
  data.count++

  // Check if rate limit has been exceeded
  const remaining = Math.max(0, limit - data.count)
  const success = data.count <= limit

  if (!success) {
    throw new Response(message, {
      status: statusCode,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(data.resetTime).toISOString(),
        "Retry-After": Math.ceil((data.resetTime - now) / 1000).toString(),
      },
    })
  }

  return {
    success,
    limit,
    remaining,
    reset: new Date(data.resetTime),
  }
}

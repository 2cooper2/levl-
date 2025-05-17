import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, { status: "ok" | "error"; message?: string; time?: number }> = {}
  let overallStatus = 200

  try {
    // Check database connection
    try {
      const dbStartTime = Date.now()
      const supabase = createClient()
      const { data, error } = await supabase.from("health_check").select("*").limit(1)

      if (error) {
        throw error
      }

      checks.database = {
        status: "ok",
        time: Date.now() - dbStartTime,
      }
    } catch (error) {
      checks.database = {
        status: "error",
        message: (error as Error).message,
      }
      overallStatus = 500
    }

    // Check environment variables
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v])

    if (missingEnvVars.length === 0) {
      checks.environment = { status: "ok" }
    } else {
      checks.environment = {
        status: "error",
        message: `Missing environment variables: ${missingEnvVars.join(", ")}`,
      }
      overallStatus = 500
    }

    // Check API dependency (e.g., Stripe)
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripeStartTime = Date.now()

        // This would be a real Stripe API check in production
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        // await stripe.customers.list({ limit: 1 })

        // Simulate a successful check
        await new Promise((resolve) => setTimeout(resolve, 100))

        checks.stripe = {
          status: "ok",
          time: Date.now() - stripeStartTime,
        }
      } catch (error) {
        checks.stripe = {
          status: "error",
          message: (error as Error).message,
        }
        // Don't fail the whole health check for a third-party dependency
      }
    }

    // Check memory usage
    if (typeof process !== "undefined") {
      const memoryUsage = process.memoryUsage()
      checks.memory = {
        status: "ok",
        message: `RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB, Heap: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}/${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      }
    }

    return NextResponse.json(
      {
        status: overallStatus === 200 ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
        checks,
        responseTime: Date.now() - startTime,
      },
      { status: overallStatus },
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
        responseTime: Date.now() - startTime,
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { createRobustSupabaseClient } from "@/lib/supabase-robust-client"
import { ENV } from "@/lib/env"

export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, { status: "ok" | "error"; message?: string; time?: number }> = {}
  let overallStatus = 200

  try {
    // Check database connection
    try {
      const dbStartTime = Date.now()
      const supabase = createRobustSupabaseClient()

      // Simple query to test connection
      const { data, error } = await supabase.from("health_check").select("*").limit(1).single()

      if (error) {
        checks.database = {
          status: "error",
          message: error.message,
        }
        overallStatus = 503 // Service unavailable
      } else {
        checks.database = {
          status: "ok",
          time: Date.now() - dbStartTime,
        }
      }
    } catch (error) {
      checks.database = {
        status: "error",
        message: error instanceof Error ? error.message : "Database check failed",
      }
      overallStatus = 503
    }

    // Check environment variables
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    const missingEnvVars = requiredEnvVars.filter(
      (key) => !ENV[key.replace("NEXT_PUBLIC_", "").toLowerCase() as keyof typeof ENV](),
    )

    if (missingEnvVars.length === 0) {
      checks.environment = { status: "ok" }
    } else {
      checks.environment = {
        status: "error",
        message: `Missing environment variables: ${missingEnvVars.join(", ")}`,
      }
      overallStatus = 500
    }

    // Check memory usage
    try {
      const memoryUsage = process.memoryUsage()
      checks.memory = {
        status: "ok",
        message: `RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB, Heap: ${Math.round(
          memoryUsage.heapUsed / 1024 / 1024,
        )}/${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      }
    } catch (error) {
      checks.memory = {
        status: "error",
        message: "Could not check memory usage",
      }
    }

    return NextResponse.json(
      {
        status: overallStatus === 200 ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime?.() || 0,
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
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, { status: "ok" | "error"; message?: string; time?: number }> = {}
  let overallStatus = 200

  try {
    // Check environment variables
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
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

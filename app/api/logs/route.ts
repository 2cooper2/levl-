import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const rateLimitMiddleware = rateLimit({
      limit: 50,
      windowMs: 60 * 1000, // 1 minute
    })

    const response = rateLimitMiddleware(request as any)
    if (response.status === 429) {
      return response
    }

    const body = await request.json()
    const { logs } = body

    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json({ error: "Invalid logs format" }, { status: 400 })
    }

    const supabase = createClient()

    // Transform logs for database insertion
    const logsToInsert = logs.map((log) => ({
      level: log.level,
      message: log.message,
      data: log.data,
      timestamp: log.timestamp,
      context: log.context,
      user_agent: log.userAgent,
      url: log.url,
    }))

    const { error } = await supabase.from("application_logs").insert(logsToInsert)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error storing logs:", error)
    return NextResponse.json({ error: "Failed to store logs" }, { status: 500 })
  }
}

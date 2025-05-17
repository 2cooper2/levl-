import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { rateLimit } from "@/lib/rate-limit"
import { z } from "zod"

// Define a schema for log validation
const logSchema = z.object({
  logs: z.array(
    z.object({
      level: z.enum(["debug", "info", "warn", "error"]),
      message: z.string(),
      data: z.any().optional(),
      timestamp: z.string().datetime(),
      context: z.string(),
      userAgent: z.string().optional(),
      url: z.string().url().optional(),
    }),
  ),
})

export async function POST(request: Request) {
  try {
    // Rate limiting functionality
    const limiter = rateLimit({
      limit: 50,
      windowMs: 60 * 1000, // 1 minute
    })

    const rateLimited = await limiter.check(request)
    if (rateLimited) {
      return NextResponse.json({ error: "Too many requests", message: "Please try again later" }, { status: 429 })
    }

    // Parse and validate the request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Error parsing log request body:", error)
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 })
    }

    // Validate logs format
    const validation = logSchema.safeParse(body)
    if (!validation.success) {
      console.error("Log validation failed:", validation.error)
      return NextResponse.json({ error: "Invalid logs format", details: validation.error.format() }, { status: 400 })
    }

    const { logs } = validation.data

    if (logs.length === 0) {
      return NextResponse.json({ success: true, message: "No logs to process" }, { status: 200 })
    }

    // Get Supabase client
    const supabase = createClient()
    if (!supabase) {
      console.error("Failed to create Supabase client")
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

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

    // Insert logs in batches to avoid payload size limits
    const BATCH_SIZE = 50
    const batches = []

    for (let i = 0; i < logsToInsert.length; i += BATCH_SIZE) {
      batches.push(logsToInsert.slice(i, i + BATCH_SIZE))
    }

    for (const batch of batches) {
      const { error } = await supabase.from("application_logs").insert(batch)
      if (error) {
        console.error("Error storing logs batch:", error)
        throw error
      }
    }

    return NextResponse.json({ success: true, count: logs.length }, { status: 200 })
  } catch (error) {
    console.error("Error storing logs:", error)
    return NextResponse.json(
      {
        error: "Failed to store logs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

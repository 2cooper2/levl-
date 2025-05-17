import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { z } from "zod"

// Define a schema for performance metric validation
const metricSchema = z.object({
  metricId: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  url: z.string().url(),
  timestamp: z.number(),
})

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Error parsing performance metric request body:", error)
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 })
    }

    // Validate metric format
    const validation = metricSchema.safeParse(body)
    if (!validation.success) {
      console.error("Metric validation failed:", validation.error)
      return NextResponse.json({ error: "Invalid metric format", details: validation.error.format() }, { status: 400 })
    }

    const { metricId, name, value, unit, url, timestamp } = validation.data

    // Get Supabase client
    const supabase = createClient()
    if (!supabase) {
      console.error("Failed to create Supabase client")
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Insert the metric
    const { error } = await supabase.from("performance_metrics").insert([
      {
        metric_id: metricId,
        name,
        value,
        unit,
        url,
        timestamp: new Date(timestamp).toISOString(),
      },
    ])

    if (error) {
      console.error("Error storing performance metric:", error)
      throw error
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error storing performance metrics:", error)
    return NextResponse.json(
      {
        error: "Failed to store metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

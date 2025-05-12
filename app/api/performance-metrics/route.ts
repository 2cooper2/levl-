import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { metricId, name, value, unit, url, timestamp } = body

    const supabase = createClient()

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
      throw error
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error storing performance metrics:", error)
    return NextResponse.json({ error: "Failed to store metrics" }, { status: 500 })
  }
}

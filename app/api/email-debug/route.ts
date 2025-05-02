import { NextResponse } from "next/server"
import { getEmailDebugInfo } from "@/lib/email-debug"

export async function GET() {
  try {
    const debugInfo = await getEmailDebugInfo()
    return NextResponse.json(debugInfo)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get email debug info" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { isEmailFunctionalityAvailable } from "@/lib/env"

export async function POST(request: Request) {
  if (!isEmailFunctionalityAvailable()) {
    return NextResponse.json({ success: true, message: "Email functionality is disabled" })
  }

  try {
    const { name, email } = await request.json()

    // Implementation would depend on which email service you're using
    // This is just a placeholder that will always succeed

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending waitlist email:", error)
    return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 })
  }
}

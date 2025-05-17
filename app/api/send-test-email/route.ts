import { NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/email-service"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    const result = await sendVerificationEmail({
      email,
      verificationToken: "TEST-TOKEN-123456",
      name: "Test User",
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}

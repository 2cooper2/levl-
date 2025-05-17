import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET() {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    return NextResponse.json(
      { success: false, error: "RESEND_API_KEY is not set in environment variables" },
      { status: 400 },
    )
  }

  try {
    const resend = new Resend(resendApiKey)

    // Send a test email to a predefined admin email
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"

    const { data, error } = await resend.emails.send({
      from: "Levl <onboarding@resend.dev>", // Use Resend's default domain
      to: [adminEmail],
      subject: "Levl Email Test",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366F1;">Levl Email Test</h1>
          <p>This is a test email from the Levl platform.</p>
          <p>If you're receiving this, your email configuration is working correctly!</p>
          <p>Time sent: ${new Date().toISOString()}</p>
        </div>
      `,
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      details: data,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to send test email" }, { status: 500 })
  }
}

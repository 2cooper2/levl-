import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  const type = requestUrl.searchParams.get("type") || "signup"

  // Handle error case
  if (error) {
    console.error("Auth callback error:", error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${error}&error_description=${errorDescription}`, requestUrl.origin),
    )
  }

  if (code) {
    const supabase = createServerClient()

    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(new URL(`/auth/login?error=exchange_error`, requestUrl.origin))
      }

      // Handle different callback types
      if (type === "recovery") {
        // Password reset flow
        return NextResponse.redirect(new URL("/auth/reset-password", requestUrl.origin))
      } else if (type === "signup" || type === "invite") {
        // Email verification after signup
        return NextResponse.redirect(new URL("/auth/login?verified=success", requestUrl.origin))
      }

      // Default: If we have a user, redirect to dashboard
      if (data?.session) {
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
      }
    } catch (err) {
      console.error("Exception in auth callback:", err)
      return NextResponse.redirect(new URL(`/auth/login?error=server_error`, requestUrl.origin))
    }
  }

  // Fallback redirect if no code or other issues
  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
}

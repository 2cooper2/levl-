import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Handle error case
  if (error) {
    console.error("Auth callback error:", error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${error}&error_description=${errorDescription}`, requestUrl.origin),
    )
  }

  if (code) {
    const supabase = createServerClient()

    if (!supabase) {
      console.error("Failed to create Supabase client in auth callback")
      return NextResponse.redirect(new URL(`/auth/login?error=server_error`, requestUrl.origin))
    }

    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(new URL(`/auth/login?error=exchange_error`, requestUrl.origin))
      }

      // If we have a user, redirect to dashboard
      if (data?.session) {
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
      }
    } catch (err) {
      console.error("Exception in auth callback:", err)
      return NextResponse.redirect(new URL(`/auth/login?error=server_error`, requestUrl.origin))
    }
  }

  // Fallback redirect if no code or other issues
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
}

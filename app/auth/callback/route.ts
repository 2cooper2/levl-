import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createServerClient()

    if (!supabase) {
      return NextResponse.redirect(new URL(`/auth/login?error=server_error`, requestUrl.origin))
    }

    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
}

"use server"
import { createServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate inputs
  if (!email || !password) {
    return {
      error: "Email and password are required",
    }
  }

  const supabase = createServerClient()

  if (!supabase) {
    return {
      error: "Could not connect to authentication service",
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in error:", error.message)
      return {
        error: error.message,
      }
    }

    if (!data.user) {
      return {
        error: "Invalid credentials",
      }
    }

    // Update last login timestamp
    await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", data.user.id)

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error during sign in:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  // Validate inputs
  if (!email || !password || !name) {
    return {
      error: "Name, email and password are required",
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      error: "Invalid email format",
    }
  }

  // Validate password strength
  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters",
    }
  }

  const supabase = createServerClient()

  if (!supabase) {
    return {
      error: "Could not connect to authentication service",
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        data: {
          name,
        },
      },
    })

    if (error) {
      console.error("Sign up error:", error.message)
      return {
        error: error.message,
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error during sign up:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function signOut() {
  const supabase = createServerClient()

  if (!supabase) {
    return {
      error: "Could not connect to authentication service",
    }
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      error: error.message,
    }
  }

  redirect("/")
}

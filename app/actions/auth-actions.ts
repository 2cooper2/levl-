"use server"
import { createServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createServerClient()

  if (!supabase) {
    return {
      error: "Could not connect to authentication service",
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  return { success: true }
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createServerClient()

  if (!supabase) {
    return {
      error: "Could not connect to authentication service",
    }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  return { success: true }
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

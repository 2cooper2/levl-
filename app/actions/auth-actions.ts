"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * @deprecated Use the auth context instead
 */
export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return redirect("/dashboard")
}

/**
 * @deprecated Use the auth context instead
 */
export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const role = formData.get("role") as string
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      data: {
        name,
        role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data?.user) {
    // Create user profile
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: data.user.id,
        name,
        email,
        role,
        avatar_url: `/placeholder.svg?height=200&width=200&text=${name.charAt(0)}`,
        is_active: true,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    if (profileError) {
      return { error: profileError.message }
    }
  }

  return { success: true }
}

/**
 * @deprecated Use the auth context instead
 */
export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  cookies().delete("levl_user")
  return redirect("/")
}

/**
 * @deprecated Use the auth context instead
 */
export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/**
 * @deprecated Use the auth context instead
 */
export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return redirect("/dashboard")
}

export async function logout() {
  const cookieStore = cookies()
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  await supabase.auth.signOut()
  cookieStore.delete("levl_user")

  redirect("/auth/login")
}

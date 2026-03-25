import { createServerDatabaseClient } from "@/lib/database"

export async function getCurrentUser() {
  const supabase = createServerDatabaseClient()
  if (!supabase) {
    return { user: null, error: "Database connection failed" }
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { user: null, error: error?.message || "User not found" }
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return { user: null, error: "User profile not found" }
    }

    return { user: profile, error: null }
  } catch (error: any) {
    console.error("Error in getCurrentUser:", error)
    return { user: null, error: error.message || "An unexpected error occurred" }
  }
}

export async function isAuthenticated() {
  const { user, error } = await getCurrentUser()
  return { isAuthenticated: !!user, user, error }
}

export async function requireAuth() {
  const { user, error } = await getCurrentUser()

  if (!user) {
    throw new Error(error || "Authentication required")
  }

  return user
}

export async function hasRole(requiredRole: string | string[]) {
  const { user, error } = await getCurrentUser()

  if (!user) {
    return { hasRole: false, error: error || "Authentication required" }
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

  return {
    hasRole: roles.includes(user.role),
    user,
    error: roles.includes(user.role) ? null : "Insufficient permissions",
  }
}

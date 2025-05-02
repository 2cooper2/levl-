"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { Session as SupabaseSession } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase-client" // Import the singleton instance
// Add these imports at the top
import { cacheUser, getCachedUser, clearUserCache } from "@/lib/user-cache"

// Define our user type
export type User = {
  id: string
  name: string
  email: string
  avatar: string
  role: "client" | "provider" | "admin"
  phone?: string
  bio?: string
  location?: string
  website?: string
  is_verified?: boolean
  is_active?: boolean
  last_login_at?: string
}

// Define Session type
export type Session = SupabaseSession | null

type AuthContextType = {
  user: User | null
  session: Session
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (
    name: string,
    email: string,
    password: string,
    role: "client" | "provider" | "admin",
  ) => Promise<{ success: boolean; error?: string; userId?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
  getUserSessions: () => Promise<any[]>
  terminateSession: (sessionId: string) => Promise<boolean>
  terminateAllOtherSessions: () => Promise<boolean>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      // Check cache first for immediate response
      const cachedUser = getCachedUser()
      if (cachedUser && cachedUser.id === userId) {
        console.log("Using cached user data")
        return cachedUser
      }

      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      if (!data) return null

      const user = {
        id: data.id,
        name: data.name || "",
        email: data.email || "",
        avatar: data.avatar_url || `/placeholder.svg?height=200&width=200&text=${data.name?.charAt(0) || "U"}`,
        role: (data.role as "client" | "provider" | "admin") || "client",
        phone: data.phone,
        bio: data.bio,
        location: data.location,
        website: data.website,
        is_verified: data.is_verified,
        is_active: data.is_active,
        last_login_at: data.last_login_at,
      }

      // Cache the user data for future use
      cacheUser(user)

      return user
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
      return null
    }
  }

  // Function to refresh user data
  const refreshUser = async () => {
    if (!session?.user?.id) return

    const userData = await fetchUserProfile(session.user.id)
    if (userData) {
      setUser(userData)
    }
  }

  // Function to get user sessions
  const getUserSessions = async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase.auth.listSessions()

      if (error) {
        console.error("Error fetching user sessions:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getUserSessions:", error)
      return []
    }
  }

  // Function to terminate a session
  const terminateSession = async (sessionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(sessionId)

      if (error) {
        console.error("Error terminating session:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in terminateSession:", error)
      return false
    }
  }

  // Function to terminate all other sessions
  const terminateAllOtherSessions = async (): Promise<boolean> => {
    try {
      if (!session?.user?.id) return false

      const { error } = await supabase.auth.admin.deleteUser(session.user.id)

      if (error) {
        console.error("Error terminating all other sessions:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in terminateAllOtherSessions:", error)
      return false
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)

      try {
        // Get the current session
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()
        setSession(currentSession)

        if (currentSession?.user) {
          const userData = await fetchUserProfile(currentSession.user.id)
          setUser(userData)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event)

      setSession(newSession)

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (newSession?.user) {
          const userData = await fetchUserProfile(newSession.user.id)
          setUser(userData)
        }
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        setUser(null)
      }
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        const userData = await fetchUserProfile(data.user.id)
        setUser(userData)
        setSession(data.session)
        return { success: true }
      }

      return { success: false, error: "Failed to retrieve user data" }
    } catch (error: any) {
      console.error("Login error:", error)
      return { success: false, error: error.message || "An error occurred during login" }
    }
  }

  // Signup function - USING DIRECT API ROUTE TO BYPASS EMAIL VERIFICATION COMPLETELY
  const signup = async (name: string, email: string, password: string, role: "client" | "provider" | "admin") => {
    try {
      // Use our custom API route for signup
      const response = await fetch("/api/auth/direct-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error || "Failed to create account" }
      }

      // After successful signup, log the user in
      const loginResult = await login(email, password)

      if (!loginResult.success) {
        return {
          success: true,
          error: "Account created but couldn't log in automatically. Please try logging in manually.",
          userId: result.userId,
        }
      }

      return {
        success: true,
        userId: result.userId,
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      return { success: false, error: error.message || "An error occurred during signup" }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      clearUserCache()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Reset password function - SIMPLIFIED
  const resetPassword = async (email: string) => {
    try {
      // Use Supabase's built-in password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        // If there's an error, just log it and return success anyway
        console.error("Reset password error:", error)
        return {
          success: true,
          error:
            "Password reset may not work due to email configuration issues. Please contact support if you don't receive an email.",
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Reset password error:", error)
      return {
        success: false,
        error: error.message || "An error occurred while sending reset password email",
      }
    }
  }

  // Update password function
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Update password error:", error)
      return { success: false, error: error.message || "An error occurred while updating password" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user && !!session,
        login,
        signup,
        logout,
        resetPassword,
        updatePassword,
        refreshUser,
        getUserSessions,
        terminateSession,
        terminateAllOtherSessions,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

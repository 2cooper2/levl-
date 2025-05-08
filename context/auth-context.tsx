"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createDatabaseClient } from "@/lib/database"
import type { User } from "@/types/database.types"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  signIn: async () => ({ success: false, error: "Not implemented" }),
  signUp: async () => ({ success: false, error: "Not implemented" }),
  signOut: async () => {},
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const refreshUser = async () => {
    try {
      const supabase = createDatabaseClient()
      if (!supabase) {
        setError("Database connection failed")
        setIsLoading(false)
        return
      }

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authUser) {
        setUser(null)
        setIsLoading(false)
        return
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (profileError) {
        console.error("Error fetching user profile:", profileError)
        setUser(null)
        setError("User profile not found")
        setIsLoading(false)
        return
      }

      setUser(profile)
      setError(null)
    } catch (err: any) {
      console.error("Error refreshing user:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()

    const supabase = createDatabaseClient()
    if (!supabase) return

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        refreshUser()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createDatabaseClient()
      if (!supabase) {
        throw new Error("Database connection failed")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      await refreshUser()
      return { success: true }
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message || "Failed to sign in")
      return { success: false, error: err.message || "Failed to sign in" }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createDatabaseClient()
      if (!supabase) {
        throw new Error("Database connection failed")
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error("Failed to create user")
      }

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        role: "client", // Default role
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        // Try to clean up auth user if profile creation fails
        // This is a best effort and may not always succeed
        try {
          // Note: There's no direct API to delete a user, but we can sign out
          await supabase.auth.signOut()
        } catch (cleanupError) {
          console.error("Error cleaning up auth user:", cleanupError)
        }

        throw new Error("Failed to create user profile")
      }

      return { success: true }
    } catch (err: any) {
      console.error("Sign up error:", err)
      setError(err.message || "Failed to sign up")
      return { success: false, error: err.message || "Failed to sign up" }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)

      const supabase = createDatabaseClient()
      if (!supabase) {
        throw new Error("Database connection failed")
      }

      await supabase.auth.signOut()
      setUser(null)
      router.push("/")
    } catch (err: any) {
      console.error("Sign out error:", err)
      setError(err.message || "Failed to sign out")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

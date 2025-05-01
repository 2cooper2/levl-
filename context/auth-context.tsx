"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

// Update the User type to include all the fields from our database
type User = {
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

export interface Session {
  id: string
  user_id: string
  device_info: any
  ip_address: string
  user_agent: string
  expires_at: string
  created_at: string
  isCurrent?: boolean
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, role: "client" | "provider" | "admin") => Promise<void>
  logout: () => void
  checkEmailExists: (email: string) => Promise<boolean>
  getUserSessions: () => Promise<Session[]>
  terminateSession: (sessionId: string) => Promise<boolean>
  terminateAllOtherSessions: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in from Supabase session
    const checkSession = async () => {
      try {
        if (!supabase) {
          console.error("Supabase client not initialized")
          setIsLoading(false)
          return
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Session check:", session ? "Found session" : "No session")

        if (session) {
          // Get user profile from users table
          const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (userData && !error) {
            const userObj = {
              id: userData.id,
              name: userData.name || "",
              email: userData.email || "",
              avatar:
                userData.avatar_url || `/placeholder.svg?height=200&width=200&text=${userData.name?.charAt(0) || "U"}`,
              role: (userData.role as "client" | "provider" | "admin") || "client",
              phone: userData.phone,
              bio: userData.bio,
              location: userData.location,
              website: userData.website,
              is_verified: userData.is_verified,
              is_active: userData.is_active,
              last_login_at: userData.last_login_at,
            }
            console.log("Setting user from session:", userObj.email)
            setUser(userObj)

            // Also store in localStorage as a fallback
            localStorage.setItem("levl_user", JSON.stringify(userObj))
          } else if (error) {
            console.error("Error fetching user data:", error)
          }
        } else {
          // Check localStorage as fallback
          const storedUser = localStorage.getItem("levl_user")
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser)
              console.log("Setting user from localStorage:", parsedUser.email)
              setUser(parsedUser)
            } catch (e) {
              console.error("Error parsing stored user:", e)
              localStorage.removeItem("levl_user")
            }
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Set up auth state change listener
    const { data } = supabase?.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)

      if (session?.user) {
        // Get user profile when auth state changes
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (userData && !error) {
          const userObj = {
            id: userData.id,
            name: userData.name || "",
            email: userData.email || "",
            avatar:
              userData.avatar_url || `/placeholder.svg?height=200&width=200&text=${userData.name?.charAt(0) || "U"}`,
            role: (userData.role as "client" | "provider" | "admin") || "client",
            phone: userData.phone,
            bio: userData.bio,
            location: userData.location,
            website: userData.website,
            is_verified: userData.is_verified,
            is_active: userData.is_active,
            last_login_at: userData.last_login_at,
          }

          console.log("Setting user from auth change:", userObj.email)
          setUser(userObj)

          // Also store in localStorage as a fallback
          localStorage.setItem("levl_user", JSON.stringify(userObj))
        } else if (error) {
          console.error("Error fetching user data on auth change:", error)
        }
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out, clearing user state")
        setUser(null)
        localStorage.removeItem("levl_user")
      }
    }) || { subscription: null }

    return () => {
      data?.subscription?.unsubscribe()
    }
  }, [supabase])

  // Check if email exists
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      if (!supabase) return false

      const { data, error } = await supabase.from("users").select("id").eq("email", email).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error checking email:", error)
        return false
      }

      return !!data
    } catch (error) {
      console.error("Error checking email:", error)
      return false
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      console.log("Attempting login with email:", email)

      // For testing purposes, let's try a mock login if we're in development
      if (process.env.NODE_ENV === "development" && email === "test@example.com" && password === "password") {
        console.log("Using mock login for development")

        // Create a mock user
        const mockUser = {
          id: "mock-user-id",
          name: "Test User",
          email: "test@example.com",
          avatar: `/placeholder.svg?height=200&width=200&text=TU`,
          role: "client" as const,
          is_active: true,
          is_verified: true,
        }

        setUser(mockUser)
        localStorage.setItem("levl_user", JSON.stringify(mockUser))
        return Promise.resolve()
      }

      // Real Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Login response:", data?.user?.id, error?.message)

      if (error) {
        console.error("Supabase login failed:", error)
        let errorMessage = "Invalid login credentials"
        if (error.message?.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again."
        } else if (error.message?.includes("Email not confirmed")) {
          errorMessage = "Please confirm your email address before logging in."
        }
        throw new Error(errorMessage) // Re-throw the error with a more specific message
      }

      // Get user profile after login
      if (data.user) {
        const { data: userData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          console.error("Error fetching user profile:", profileError)
          throw profileError
        }

        if (userData) {
          const userObj = {
            id: userData.id,
            name: userData.name || "",
            email: userData.email || "",
            avatar:
              userData.avatar_url || `/placeholder.svg?height=200&width=200&text=${userData.name?.charAt(0) || "U"}`,
            role: (userData.role as "client" | "provider" | "admin") || "client",
            phone: userData.phone,
            bio: userData.bio,
            location: userData.location,
            website: userData.website,
            is_verified: userData.is_verified,
            is_active: userData.is_active,
            last_login_at: userData.last_login_at,
          }

          console.log("Setting user after login:", userObj.email)
          setUser(userObj)

          // Also store in localStorage as a fallback
          localStorage.setItem("levl_user", JSON.stringify(userObj))

          // Create a session record
          try {
            const userAgent = navigator.userAgent
            await supabase.from("sessions").insert([
              {
                user_id: data.user.id,
                device_info: { userAgent },
                ip_address: "client-side", // We can't get the real IP on client side
                user_agent: userAgent,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
              },
            ])
          } catch (sessionError) {
            console.error("Error creating session:", sessionError)
            // Non-critical error, don't throw
          }
        } else {
          console.error("No user data found after login")
          throw new Error("User profile not found")
        }
      }

      return Promise.resolve()
    } catch (error: any) {
      console.error("Login failed:", error)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Simplified signup function
  const signup = async (name: string, email: string, password: string, role: "client" | "provider" | "admin") => {
    setIsLoading(true)
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      // First check if email already exists
      const emailExists = await checkEmailExists(email)
      if (emailExists) {
        throw new Error("Email already in use. Please use a different email or try logging in.")
      }

      console.log("Creating new user with email:", email)

      // 1. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role,
          },
        },
      })

      if (error) {
        console.error("Signup auth error:", error)
        throw error
      }

      if (!data.user || !data.user.id) {
        console.error("Signup failed: No user ID returned")
        throw new Error("Failed to create user account. Please try again.")
      }

      console.log("Auth signup response:", data.user.id)

      // 2. Create user profile in users table
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          name: name,
          email: email,
          role: role,
          avatar_url: `/placeholder.svg?height=200&width=200&text=${name.charAt(0)}`,
          is_active: true,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        throw new Error(`Error creating user profile: ${profileError.message}`)
      }

      // 3. Set user in state
      const userObj = {
        id: data.user.id,
        name: name,
        email: email,
        avatar: `/placeholder.svg?height=200&width=200&text=${name.charAt(0)}`,
        role: role,
        is_active: true,
        is_verified: false,
      }

      console.log("Setting user after signup:", userObj.email)
      setUser(userObj)

      // Also store in localStorage as a fallback
      localStorage.setItem("levl_user", JSON.stringify(userObj))

      return Promise.resolve()
    } catch (error) {
      console.error("Signup failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Get user sessions
  const getUserSessions = async (): Promise<Session[]> => {
    if (!user || !supabase) return []

    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })

      if (error) throw error

      // Mark the current session
      const currentUserAgent = navigator.userAgent
      const sessionsWithCurrent = data.map((session) => ({
        ...session,
        isCurrent: session.user_agent === currentUserAgent,
      }))

      return sessionsWithCurrent
    } catch (error) {
      console.error("Error fetching sessions:", error)
      return []
    }
  }

  // Terminate a specific session
  const terminateSession = async (sessionId: string): Promise<boolean> => {
    if (!user || !supabase) return false

    try {
      const { error } = await supabase.from("sessions").delete().eq("id", sessionId)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error terminating session:", error)
      return false
    }
  }

  // Terminate all other sessions
  const terminateAllOtherSessions = async (): Promise<boolean> => {
    if (!user || !supabase) return false

    try {
      const currentUserAgent = navigator.userAgent
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("user_id", user.id)
        .neq("user_agent", currentUserAgent)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error terminating all sessions:", error)
      return false
    }
  }

  // Update the logout function to clean up sessions
  const logout = async () => {
    console.log("Logging out user")
    if (supabase && user) {
      try {
        // Delete the current session
        await supabase.from("sessions").delete().eq("user_id", user.id).gt("expires_at", new Date().toISOString())
      } catch (error) {
        console.error("Error deleting session:", error)
      }

      await supabase.auth.signOut()
    }
    setUser(null)
    localStorage.removeItem("levl_user")
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        checkEmailExists,
        getUserSessions,
        terminateSession,
        terminateAllOtherSessions,
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

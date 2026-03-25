"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!supabase) {
          console.error("Supabase client not initialized")
          router.push("/auth/login")
          return
        }

        const { data } = await supabase.auth.getSession()

        if (!data.session) {
          // No session, redirect to login
          router.push("/auth/login")
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}

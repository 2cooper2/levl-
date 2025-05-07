"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function DirectProfilePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Wait until auth state is loaded
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to the home page if not authenticated
        router.push("/")
      } else {
        // Force navigation to the profile page if authenticated
        router.push("/profile")
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  )
}

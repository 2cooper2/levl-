"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { VerificationProcess } from "@/components/verification/verification-process"
import type { VerificationLevel } from "@/components/ui/verification-badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database.types"

export default function VerificationPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [currentLevel, setCurrentLevel] = useState<VerificationLevel | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth/login?redirect=/verification")
          return
        }

        setUserId(session.user.id)

        // Fetch user verification level from database
        const { data: userData, error } = await supabase
          .from("users")
          .select("verification_level")
          .eq("id", session.user.id)
          .single()

        if (error) throw error

        if (userData?.verification_level) {
          setCurrentLevel(userData.verification_level as VerificationLevel)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router, supabase])

  const handleVerificationComplete = async (level: VerificationLevel) => {
    if (!userId) return

    try {
      // Update user verification level in database
      const { error } = await supabase.from("users").update({ verification_level: level }).eq("id", userId)

      if (error) throw error

      setCurrentLevel(level)
    } catch (error) {
      console.error("Error updating verification level:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      {userId && (
        <VerificationProcess userId={userId} currentLevel={currentLevel} onComplete={handleVerificationComplete} />
      )}
    </div>
  )
}

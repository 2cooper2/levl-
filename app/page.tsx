"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EnhancedHeroSection } from "@/components/enhanced-hero-section"
import { AIServiceMatchmaker } from "@/components/ai-matchmaker/ai-service-matchmaker"

export default function Home() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem("levl-session")) {
      router.replace("/role")
    } else {
      setReady(true)
    }
  }, [])

  if (!ready) return null

  return (
    <div className="flex min-h-screen flex-col" style={{ margin: 0, padding: 0 }}>
      {/* Levl Void — full-page cyclorama background */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 55% 20% at 50% 100%, rgba(255,252,248,0.38) 0%, transparent 70%),
            linear-gradient(180deg, #e6e6e6 0%, #f2f2f2 10%, #fafafa 28%, #ffffff 50%, #ffffff 100%)
          `,
        }}
      />

      {/* AI Service Matchmaker */}
      <div className="relative z-50" style={{ marginTop: 0 }}>
        <AIServiceMatchmaker />
      </div>

      <main className="flex-1" style={{ marginTop: 0, paddingTop: 0 }}>
        <EnhancedHeroSection />
      </main>
    </div>
  )
}

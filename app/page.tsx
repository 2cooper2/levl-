"use client"

import { useRouter } from "next/navigation"
import { EnhancedHeroSection } from "@/components/enhanced-hero-section"
import { AIServiceMatchmaker } from "@/components/ai-matchmaker/ai-service-matchmaker"

export default function Home() {
  const router = useRouter()

  const switchToWorker = () => {
    localStorage.setItem("levl-role", "worker")
    router.push("/work")
  }

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

      {/* Role switch — fixed pill top-right */}
      <button
        onClick={switchToWorker}
        className="fixed top-4 right-4 z-[100] text-xs font-black px-3 py-1.5 rounded-full transition-all active:scale-95 hover:scale-105"
        style={{
          background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.82))",
          border: "1px solid rgba(167,139,250,0.45)",
          boxShadow: "0 4px 10px -3px rgba(0,0,0,0.22), 0 -1px 3px 0 rgba(255,255,255,0.9) inset",
          color: "#7c3aed",
        }}
      >
        Worker
      </button>

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

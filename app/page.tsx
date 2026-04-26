"use client"

import Link from "next/link"
import { LevlLogo } from "@/components/levl-logo"

const cardStyle: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.92) 60%, rgba(237,233,254,0.85) 100%)",
  border: "1px solid rgba(167,139,250,0.3)",
  boxShadow:
    "0 20px 25px -5px rgba(0,0,0,0.18), 0 10px 10px -5px rgba(0,0,0,0.1), 0 -2px 6px 0 rgba(255,255,255,0.8) inset",
  borderRadius: "1rem",
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6" style={{ margin: 0 }}>
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 55% 20% at 50% 100%, rgba(255,252,248,0.38) 0%, transparent 70%),
            linear-gradient(180deg, #e6e6e6 0%, #f2f2f2 10%, #fafafa 28%, #ffffff 50%, #ffffff 100%)
          `,
        }}
      />

      <div className="mb-10 flex flex-col items-center gap-3">
        <LevlLogo />
        <p className="text-sm font-medium" style={{ color: "#8b5cf6" }}>
          How are you using Levl today?
        </p>
      </div>

      <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:max-w-2xl sm:grid-cols-2">
        <Link
          href="/client"
          className="group relative flex flex-col items-center justify-center gap-2 px-8 py-10 transition-transform hover:scale-[1.02] active:scale-[0.99]"
          style={cardStyle}
        >
          <span className="text-3xl font-bold" style={{ color: "#7c3aed" }}>
            Client
          </span>
          <span className="text-sm" style={{ color: "#a78bfa" }}>
            Find a pro for the job
          </span>
        </Link>

        <Link
          href="/work"
          className="group relative flex flex-col items-center justify-center gap-2 px-8 py-10 transition-transform hover:scale-[1.02] active:scale-[0.99]"
          style={cardStyle}
        >
          <span className="text-3xl font-bold" style={{ color: "#7c3aed" }}>
            Worker
          </span>
          <span className="text-sm" style={{ color: "#a78bfa" }}>
            Get matched to paying work
          </span>
        </Link>
      </div>
    </div>
  )
}

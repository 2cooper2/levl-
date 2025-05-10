"use client"

import type React from "react"

export function PremiumBackground() {
  return (
    <>
      <div
        className="fixed -z-20 bg-noise opacity-[0.03]"
        style={{
          width: "100vw",
          height: "100vh",
          top: 0,
        }}
      />

      {/* Gradient blob */}
      <div
        className="fixed -z-10 opacity-20 dark:opacity-15 blur-[100px]"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(var(--primary-rgb), 0.8) 0%, rgba(var(--primary-rgb), 0) 70%)`,
          width: "100vw",
          height: "100vh",
          top: 0,
        }}
      />

      {/* Grid pattern */}
      <div
        className="fixed -z-10"
        style={{
          width: "100vw",
          height: "100vh",
          top: 0,
        }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.03]" />
      </div>
    </>
  )
}

// Section divider with animated wave
export function WaveDivider({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height: "120px" }}>
      <svg
        className={`absolute w-full h-full ${inverted ? "rotate-180" : ""}`}
        preserveAspectRatio="none"
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="fill-background"
          d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,96C960,107,1056,117,1152,112C1248,107,1344,85,1392,74.7L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        ></path>
      </svg>
    </div>
  )
}

// Glass card effect for premium UI elements
export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 shadow-xl ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Animated gradient border
export function GradientBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`gradient-border-container ${className}`}>
      <div className="gradient-border-content">{children}</div>
    </div>
  )
}

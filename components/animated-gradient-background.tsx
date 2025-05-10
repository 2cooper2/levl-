"use client"

import type React from "react"

export function AnimatedGradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

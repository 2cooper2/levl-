"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function SimpleBackground() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 -z-10 h-full w-full"
      style={{
        background:
          theme === "dark"
            ? "radial-gradient(circle at top center, rgba(37, 38, 44, 0.7) 0%, rgba(17, 24, 39, 0.9) 100%)"
            : "radial-gradient(circle at top center, rgba(243, 244, 246, 0.7) 0%, rgba(249, 250, 251, 0.9) 100%)",
        opacity: 0.8,
      }}
    />
  )
}

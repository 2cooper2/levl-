"use client"

import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface LevlLoaderProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
  fullScreen?: boolean
}

export function LevlLoader({ size = "md", className, text, fullScreen = false }: LevlLoaderProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark =
    mounted && (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches))

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  }

  const textSizeClasses = {
    sm: "text-xs mt-1",
    md: "text-sm mt-2",
    lg: "text-base mt-3",
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullScreen && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
        className,
      )}
    >
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer circle */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-t-2 border-r-2 border-transparent",
            isDark ? "border-l-2 border-b-2 border-primary/20" : "border-l-2 border-b-2 border-primary/10",
            "animate-spin-slow",
          )}
        ></div>

        {/* Inner circle */}
        <div
          className={cn(
            "absolute inset-[15%] rounded-full border-b-2 border-l-2 border-transparent",
            isDark ? "border-t-2 border-r-2 border-primary/60" : "border-t-2 border-r-2 border-primary/40",
            "animate-spin-reverse",
          )}
        ></div>

        {/* Center dot */}
        <div
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
            size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2.5 h-2.5" : "w-4 h-4",
            "bg-primary animate-pulse",
          )}
        ></div>
      </div>

      {text && <p className={cn("text-muted-foreground animate-pulse", textSizeClasses[size])}>{text}</p>}
    </div>
  )
}

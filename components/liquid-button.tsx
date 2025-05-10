"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  variant?: "default" | "gradient" | "outline"
}

export function LiquidButton({ children, className, variant = "default", ...props }: LiquidButtonProps) {
  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-r from-primary to-purple-500 text-primary-foreground"
      case "outline":
        return "bg-transparent border border-primary/20 text-foreground hover:bg-primary/5"
      default:
        return "bg-primary text-primary-foreground"
    }
  }

  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-full px-6 py-3 font-medium transition-all hover:shadow-md active:scale-[0.98]",
        getVariantStyles(),
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center">{children}</span>
    </button>
  )
}

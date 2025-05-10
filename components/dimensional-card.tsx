"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface DimensionalCardProps {
  children: React.ReactNode
  className?: string
  depth?: number
  backgroundColor?: string
  glowColor?: string
  borderColor?: string
}

export function DimensionalCard({
  children,
  className,
  depth = 20,
  backgroundColor = "hsl(var(--card))",
  glowColor = "rgba(var(--primary-rgb), 0.15)",
  borderColor = "rgba(var(--primary-rgb), 0.1)",
}: DimensionalCardProps) {
  return (
    <div
      className={cn("relative rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300", className)}
      style={{
        perspective: 1000,
      }}
    >
      <div
        className="relative rounded-xl border overflow-hidden"
        style={{
          backgroundColor,
          borderColor,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          transition: "box-shadow 0.3s",
        }}
      >
        <div
          style={{
            transform: `translateZ(${depth}px)`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

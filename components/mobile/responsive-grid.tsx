"use client"

import type React from "react"

import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  desktopClassName?: string
}

export function ResponsiveGrid({
  children,
  className,
  mobileClassName = "grid grid-cols-1 gap-4",
  desktopClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
}: ResponsiveGridProps) {
  const isMobile = useMobile()

  return <div className={cn(isMobile ? mobileClassName : desktopClassName, className)}>{children}</div>
}

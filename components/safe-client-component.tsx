"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface SafeClientComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SafeClientComponent({
  children,
  fallback = <div className="min-h-[50px] bg-muted/20 animate-pulse rounded-md" />,
}: SafeClientComponentProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return fallback
  }

  return <>{children}</>
}

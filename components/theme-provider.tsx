"use client"

import type React from "react"

// Simplified ThemeProvider that doesn't inject script tags
// Since we're forcing light theme, we don't need the full next-themes functionality
export function ThemeProvider({ 
  children,
  ...props 
}: { 
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}) {
  return <>{children}</>
}

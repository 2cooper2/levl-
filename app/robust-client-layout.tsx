"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { useClientInit } from "@/lib/client-init"
import { BetterErrorBoundary } from "@/components/better-error-boundary"

interface ClientRootLayoutProps {
  children: React.ReactNode
}

export default function RobustClientRootLayout({ children }: ClientRootLayoutProps) {
  // Initialize client-side functionality
  useClientInit()

  return (
    <BetterErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </BetterErrorBoundary>
  )
}

"use client"

import type React from "react"

import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { UniversalErrorBoundary } from "@/components/universal-error-boundary"
import { initClientEnv } from "@/lib/env"

export function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize environment variables on the client
  useEffect(() => {
    initClientEnv()
  }, [])

  return (
    <UniversalErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </UniversalErrorBoundary>
  )
}

"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useEffect } from "react"
import { AuthProvider } from "@/context/auth-context"

// Improved client-side layout with performance optimizations
export function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Reset scroll position when navigating to new pages
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Register service worker for offline capabilities
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((error) => {
          console.error("Service worker registration failed:", error)
        })
      })
    }
  }, [])

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default ClientRootLayout

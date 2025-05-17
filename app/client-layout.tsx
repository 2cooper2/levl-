"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { useEffect, useState } from "react"

const inter = Inter({ subsets: ["latin"] })

// Client component to handle scroll reset
function ScrollToTop({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      // Reset scroll position on page load
      window.scrollTo(0, 0)
    } catch (error) {
      console.error("Error resetting scroll position:", error)
    }
  }, [])

  return <>{children}</>
}

export function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Add state to track if the component is mounted
  const [isMounted, setIsMounted] = useState(false)

  // Only render on client-side to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Return a minimal layout during server rendering
    return <div className={inter.className}>{children}</div>
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <ScrollToTop>{children}</ScrollToTop>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default ClientRootLayout

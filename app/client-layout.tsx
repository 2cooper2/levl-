"use client"

import type React from "react"

import { usePathname, useRouter } from "next/navigation"
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
  const router = useRouter()

  // Role-based redirect: on root, check saved role and send to correct side
  useEffect(() => {
    if (pathname !== "/") return
    const role = localStorage.getItem("levl-role")
    if (!role) {
      router.replace("/role")
    } else if (role === "worker") {
      router.replace("/work")
    }
  }, [pathname])

  // Reset scroll position immediately on mount and when navigating
  useEffect(() => {
    // Immediate scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    // Also force scroll after a brief delay to handle any async content loading
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, 0)
    return () => clearTimeout(timeout)
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

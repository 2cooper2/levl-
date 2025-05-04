"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Hide bottom navigation on certain pages
  const shouldHideOnPages = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/checkout",
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) return null

  // Don't render if we should hide on this page
  if (shouldHideOnPages.some((page) => pathname?.startsWith(page))) return null

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Explore", path: "/explore" },
    { icon: PlusCircle, label: "New", path: "/dashboard/services/new" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: User, label: "Profile", path: "/profile" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t flex items-center justify-around z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path !== "/" && pathname?.startsWith(item.path))

        return (
          <button
            key={item.path}
            className={cn(
              "flex flex-col items-center justify-center h-full px-2",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
            onClick={() => router.push(item.path)}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

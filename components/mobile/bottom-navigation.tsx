"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Hide bottom navigation on certain pages
  const shouldHideOnPages = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/checkout",
  ]

  const shouldHide = shouldHideOnPages.some((page) => pathname?.startsWith(page))

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false)
      } else {
        setVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) return null

  // Don't render if we should hide on this page
  if (shouldHide) return null

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Explore", path: "/explore" },
    { icon: PlusCircle, label: "New", path: "/dashboard/services/new" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: User, label: "Profile", path: "/profile" },
  ]

  return (
    <motion.div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t"
      initial={{ y: 100 }}
      animate={{ y: visible ? 0 : 100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/" && pathname?.startsWith(item.path))

          return (
            <button
              key={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
              onClick={() => router.push(item.path)}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive && "fill-primary/10")} />
              <span className="text-xs">{item.label}</span>
              {isActive && (
                <motion.div
                  className="absolute bottom-0 w-10 h-0.5 bg-primary rounded-full"
                  layoutId="bottomNavIndicator"
                />
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

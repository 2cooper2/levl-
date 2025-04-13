"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { LevlLogo } from "@/components/levl-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { useAuth } from "@/context/auth-context"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function EnhancedMainNav() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href

    return (
      <Link
        href={href}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary relative group py-1",
          isActive ? "text-primary" : "text-muted-foreground",
        )}
      >
        {children}
        <span className="absolute -bottom-[2px] left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
        {isActive && (
          <motion.span
            className="absolute -bottom-[2px] left-0 h-[2px] bg-primary"
            layoutId="navbar-indicator"
            style={{ width: "100%" }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          />
        )}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2.5 mr-8">
            <LevlLogo className="h-8 w-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              LevL
            </span>
          </Link>
          <nav className="hidden md:flex gap-8 ml-2">
            <NavLink href="/explore">Find Services</NavLink>
            <NavLink href="/providers">Become a Provider</NavLink>
            <NavLink href="/how-it-works">How it Works</NavLink>
            <NavLink href="/about">About</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <NavLink href="/messages">Messages</NavLink>
                <NavLink href="/dashboard">Dashboard</NavLink>
                <Link href="/profile">
                  <div className="relative">
                    <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-background shadow-sm hover:border-primary transition-colors">
                      <img
                        src={user?.avatar || "/placeholder.svg?height=36&width=36&text=U"}
                        alt={user?.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium transition-colors hover:text-primary">
                  Sign In
                </Link>
                <Link href="/auth/signup">
                  <EnhancedButton variant="gradient">Sign Up</EnhancedButton>
                </Link>
              </>
            )}
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

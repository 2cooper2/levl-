"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LevlLogo } from "@/components/levl-logo"
import { cn } from "@/lib/utils"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export function EnhancedMainNav() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <LevlLogo className="h-8 w-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              LevL
            </span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-6">
            <Link
              href="/explore"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/explore" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Find Services
            </Link>
            <Link
              href="/providers"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/providers" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Become a Provider
            </Link>
            <Link
              href="/how-it-works"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/how-it-works" ? "text-primary" : "text-muted-foreground",
              )}
            >
              How it Works
            </Link>
            <Link
              href="/about"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/about" ? "text-primary" : "text-muted-foreground",
              )}
            >
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/messages" className="text-sm font-medium transition-colors hover:text-primary">
                  Messages
                </Link>
                <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <img
                      src={user?.avatar || "/placeholder.svg?height=32&width=32&text=U"}
                      alt={user?.name || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium transition-colors hover:text-primary">
                  Sign In
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                    Sign Up
                  </Button>
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

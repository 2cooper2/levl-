"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LevlLogo } from "@/components/levl-logo"
import { UserNav } from "@/components/dashboard/user-nav"
import { useAuth } from "@/context/auth-context"
import { User, Menu, LayoutDashboard, Compass, Users, Info, LogIn, UserPlus } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export function EnhancedMainNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Add this style to the head
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (!hasMounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-2">
        <Link href="/" className="flex items-center space-x-2 ml-0">
          <LevlLogo className="h-14 w-14 sm:h-12 sm:w-12" />
          <span className="hidden text-2xl font-bold sm:inline-block">LevL</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-3">
            <div className="relative" ref={menuRef}>
              <button
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-black/5 dark:bg-white/10 backdrop-blur-md border border-purple-500/30 hover:border-purple-500/70 transition-all duration-300 group"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-label="Navigation Menu"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
                <span className="absolute -inset-px bg-gradient-to-r from-purple-500 to-indigo-500 opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300 rounded-lg"></span>
                <Menu className="h-5 w-5 text-purple-600 dark:text-purple-400 relative z-10" />
              </button>

              {isMenuOpen && (
                <div
                  className="absolute top-full mt-2 right-0 w-56 rounded-md bg-background/95 backdrop-blur-md border border-border shadow-lg z-50 overflow-hidden"
                  style={{
                    animation: "fadeIn 0.2s ease-out forwards",
                  }}
                >
                  <div className="py-2 px-1">
                    <Link
                      href="/dashboard"
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        pathname === "/dashboard"
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground/70 hover:text-foreground hover:bg-accent",
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/explore"
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        pathname === "/explore"
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground/70 hover:text-foreground hover:bg-accent",
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Compass className="mr-2 h-4 w-4" />
                      Explore
                    </Link>
                    <Link
                      href="/providers"
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        pathname?.startsWith("/providers")
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground/70 hover:text-foreground hover:bg-accent",
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Providers
                    </Link>
                    <Link
                      href="/profile"
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        pathname?.startsWith("/profile")
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground/70 hover:text-foreground hover:bg-accent",
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/about"
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        pathname?.startsWith("/about")
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground/70 hover:text-foreground hover:bg-accent",
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      About
                    </Link>

                    {!isAuthenticated && (
                      <>
                        <div className="my-1 border-t border-border/40"></div>
                        <Link
                          href="/auth/login"
                          className={cn(
                            "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                            pathname?.startsWith("/auth/login")
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground/70 hover:text-foreground hover:bg-accent",
                          )}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <LogIn className="mr-2 h-4 w-4" />
                          Log in
                        </Link>
                        <Link
                          href="/auth/signup"
                          className={cn(
                            "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                            pathname?.startsWith("/auth/signup")
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground/70 hover:text-foreground hover:bg-accent",
                          )}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Sign up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            {isAuthenticated ? <UserNav /> : <></>}
          </nav>
        </div>
      </div>
    </header>
  )
}

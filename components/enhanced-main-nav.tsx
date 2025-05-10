"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LevlLogo } from "@/components/levl-logo"
import { UserNav } from "@/components/dashboard/user-nav"
import { useAuth } from "@/context/auth-context"
import { MobileNav } from "@/components/mobile-nav"
import { User, Menu, LayoutDashboard, Info, LogIn, UserPlus, PlusCircle } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export function EnhancedMainNav() {
  const pathname = usePathname()
  const router = useRouter()
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
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(147, 51, 234, 0); }
        100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0); }
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
      <div className="flex h-16 items-center px-4 justify-between">
        {/* Left side - Logo and mobile nav */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <LevlLogo className="h-12 w-12" />
            <span className="hidden text-2xl font-bold sm:inline-block">LevL</span>
          </Link>
          <MobileNav className="ml-2 md:hidden" />
        </div>

        {/* Right side - Menu button */}
        <div className="flex items-center space-x-4" ref={menuRef}>
          {isAuthenticated ? <UserNav /> : null}

          <div className="relative">
            <button
              className="relative inline-flex items-center px-3 py-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-md border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500/70 transition-all duration-300 group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Navigation Menu"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute -inset-px bg-gradient-to-r from-purple-500 to-indigo-500 opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300"></span>

              <Menu className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400 relative z-10" />
              <span className="font-medium text-foreground relative z-10 tracking-wide">Menu</span>

              <span className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent transform translate-y-[1px] opacity-70"></span>
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

                  {/* Add Service Button */}
                  <Link
                    href="/dashboard/services/new"
                    className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-foreground/70 hover:text-foreground hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Service
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
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

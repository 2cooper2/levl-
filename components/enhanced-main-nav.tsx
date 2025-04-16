"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LevlLogo } from "@/components/levl-logo"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { Menu, Moon, Sun } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { FloatingWaitlistButton } from "@/components/waitlist/floating-waitlist-button"

export function EnhancedMainNav() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between pl-2">
        <div className="flex items-center gap-2 -ml-2">
          <Link href="/" className="flex items-center relative">
            <LevlLogo className="h-16 w-16" />
            <span className="text-3xl font-bold text-black dark:text-white absolute left-14 bottom-2 z-10">LevL</span>
          </Link>
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
                <div className="mr-2">
                  <FloatingWaitlistButton inHeader={true} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-purple-500 hover:text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 border-purple-500"
                    >
                      <Menu className="h-7 w-7" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/explore">Find Services</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/providers">Become a Provider</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/how-it-works">How it Works</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/about">About</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                      <div className="flex items-center">
                        {theme === "dark" ? (
                          <>
                            <Sun className="h-4 w-4 mr-2" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon className="h-4 w-4 mr-2" />
                            <span>Dark Mode</span>
                          </>
                        )}
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
          {!isAuthenticated && (
            <div className="md:hidden mr-2">
              <FloatingWaitlistButton inHeader={true} />
            </div>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

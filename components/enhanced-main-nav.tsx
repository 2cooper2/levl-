"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LevlLogo } from "@/components/levl-logo"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/dashboard/user-nav"
import { useAuth } from "@/context/auth-context"
import { MobileNav } from "@/components/mobile-nav"
import { User } from "lucide-react"

export function EnhancedMainNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-2">
        <Link href="/" className="flex items-center space-x-2 ml-0">
          <LevlLogo className="h-12 w-12" />
          <span className="hidden text-2xl font-bold sm:inline-block">LevL</span>
        </Link>
        <MobileNav className="ml-2" />
        <div className="ml-6 hidden md:flex">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/explore"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/explore" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Explore
            </Link>
            <Link
              href="/providers"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/providers") ? "text-foreground" : "text-foreground/60",
              )}
            >
              Providers
            </Link>
            <Link
              href="/about"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/about") ? "text-foreground" : "text-foreground/60",
              )}
            >
              About
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link
              href="/profile"
              className="relative inline-flex items-center px-4 py-1.5 mr-2 bg-black/5 dark:bg-white/10 backdrop-blur-md border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500/70 transition-all duration-300 group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute -inset-px bg-gradient-to-r from-purple-500 to-indigo-500 opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300"></span>

              <User className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400 relative z-10" />
              <span className="font-medium text-foreground relative z-10 tracking-wide">Profile</span>

              <span className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent transform translate-y-[1px] opacity-70"></span>
            </Link>
            {isAuthenticated ? (
              <UserNav />
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button size="sm" asChild className="hidden md:flex">
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

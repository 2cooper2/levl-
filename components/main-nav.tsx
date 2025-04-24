"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { LevlLogo } from "@/components/levl-logo"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <LevlLogo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">Levl</span>
      </Link>
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
        <div className="flex items-center space-x-3">
          <Link
            href="/auth/signup"
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md"
          >
            Sign Up
          </Link>
          <Link
            href="/auth/login"
            className="border border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
          >
            Log In
          </Link>
        </div>
      </nav>
    </div>
  )
}

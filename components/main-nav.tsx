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
          href="/about"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/about") ? "text-foreground" : "text-foreground/60",
          )}
        >
          About
        </Link>
        <div className="flex items-center space-x-3">
          {/* Sign Up button removed from here */}
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

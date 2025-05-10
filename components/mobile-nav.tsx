"use client"
import Link from "next/link"
import { LevlLogo } from "@/components/levl-logo"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileNav() {
  return (
    <div className="flex items-center justify-between w-full md:hidden p-4">
      <Link href="/" className="flex items-center">
        <LevlLogo className="h-8 w-8" />
      </Link>

      <Button variant="ghost" size="icon">
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  )
}

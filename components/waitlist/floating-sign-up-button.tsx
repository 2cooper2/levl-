"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface FloatingWaitlistButtonProps {
  inHeader?: boolean
}

export function FloatingWaitlistButton({ inHeader = false }: FloatingWaitlistButtonProps) {
  // Styles for the button when in header vs floating
  const buttonClasses = inHeader
    ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium relative px-4 py-2.5 text-base"
    : "rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium px-6 py-3.5 h-auto fixed bottom-6 right-6 z-50 text-base"

  return (
    <>
      {inHeader ? (
        <Link href="/auth/signup">
          <Button className={buttonClasses}>
            <span className="absolute inset-0 rounded-md bg-purple-500 opacity-30 animate-pulse"></span>
            <span className="relative z-10">Sign Up</span>
          </Button>
        </Link>
      ) : (
        <div className="fixed bottom-6 right-6 z-50">
          <Link href="/auth/signup">
            <Button className={buttonClasses}>
              <span className="absolute inset-0 rounded-full bg-purple-500 opacity-30 animate-ping"></span>
              <span className="relative z-10">Sign Up</span>
            </Button>
          </Link>
        </div>
      )}
    </>
  )
}

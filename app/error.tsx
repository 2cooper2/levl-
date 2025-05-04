"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LevlLogo } from "@/components/levl-logo"
import { AlertCircle, Home, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <LevlLogo className="h-12 w-12 text-primary" />
      </div>

      <div className="mb-8 flex items-center justify-center rounded-full bg-red-100 p-3 dark:bg-red-900/20">
        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>

      <h1 className="mb-2 text-3xl font-bold">Something went wrong</h1>

      <p className="mb-8 max-w-md text-muted-foreground">
        We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Button onClick={reset} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>

        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Return home
          </Link>
        </Button>
      </div>
    </div>
  )
}

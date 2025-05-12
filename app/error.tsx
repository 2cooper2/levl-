"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/enhanced-card"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md mx-auto p-8 text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We apologize for the inconvenience. Our team has been notified of this issue.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-6 text-left">
              <p className="font-mono text-sm text-red-800 dark:text-red-200 break-words">{error.message}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

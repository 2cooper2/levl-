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
    console.error("Application error:", error)

    // You could add additional error reporting here
    // Example: reportErrorToAnalyticsService(error)
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
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-6 text-left overflow-auto max-h-[200px]">
              <p className="font-mono text-sm text-red-800 dark:text-red-200 break-words">
                {error.message || "Unknown error"}
              </p>
              {error.stack && (
                <pre className="mt-2 font-mono text-xs text-red-700 dark:text-red-300 break-words whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => {
              // Attempt to reset the error boundary
              try {
                reset()
              } catch (resetError) {
                console.error("Error during reset:", resetError)
                // If reset fails, redirect to home
                window.location.href = "/"
              }
            }}
          >
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error)
      setError(event.error)
      // Prevent the error from bubbling up
      event.preventDefault()
    }

    window.addEventListener("error", handleError)

    return () => {
      window.removeEventListener("error", handleError)
    }
  }, [])

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">We encountered an unexpected error. Our team has been notified.</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null)
                }}
              >
                Try again
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.reload()
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}

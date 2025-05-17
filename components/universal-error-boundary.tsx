"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function UniversalErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [errorInfo, setErrorInfo] = useState<{ message: string; stack?: string } | null>(null)

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("Error caught by boundary:", event.error)
      setHasError(true)
      setErrorInfo({
        message: event.error?.message || "Unknown error occurred",
        stack: event.error?.stack,
      })
      // Prevent the error from bubbling up
      event.preventDefault()
    }

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection caught by boundary:", event.reason)
      setHasError(true)
      setErrorInfo({
        message: event.reason?.message || String(event.reason) || "Promise rejection",
        stack: event.reason?.stack,
      })
      event.preventDefault()
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", rejectionHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", rejectionHandler)
    }
  }, [])

  if (hasError) {
    if (fallback) return <>{fallback}</>

    return (
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-6">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mb-4">We're having trouble displaying this content.</p>
            {process.env.NODE_ENV === "development" && errorInfo && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4 text-left overflow-auto max-h-[200px] w-full">
                <p className="text-sm text-red-800 dark:text-red-200 break-words">{errorInfo.message}</p>
                {errorInfo.stack && (
                  <pre className="mt-2 text-xs text-red-700 dark:text-red-300 break-words whitespace-pre-wrap">
                    {errorInfo.stack}
                  </pre>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setHasError(false)}>
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

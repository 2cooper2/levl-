"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function BetterErrorBoundary({ children, fallback = <DefaultErrorFallback /> }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("Error caught by boundary:", event.error)
      setHasError(true)
      // Prevent the error from bubbling up
      event.preventDefault()
    }

    window.addEventListener("error", errorHandler)
    return () => window.removeEventListener("error", errorHandler)
  }, [])

  if (hasError) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

function DefaultErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-white rounded-lg shadow-sm border border-red-100">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-500 text-center mb-4">
        We're having trouble displaying this content. Please try again later.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
      >
        Refresh page
      </button>
    </div>
  )
}

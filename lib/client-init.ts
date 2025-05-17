"use client"

import { useEffect } from "react"
import { setupGlobalErrorHandler } from "./error-handler"

// Used to ensure the client is properly initialized with environment variables
export function useClientInit() {
  useEffect(() => {
    // Set up global error handler
    setupGlobalErrorHandler()

    // Initialize environment variables on the client
    // This makes NEXT_PUBLIC_ variables available through our getEnv function
    if (typeof window !== "undefined") {
      const win = window as any
      win.__ENV = {}

      // Extract NEXT_PUBLIC_ variables from the DOM
      document.querySelectorAll('meta[name^="env-"]').forEach((meta) => {
        const key = meta.getAttribute("name")?.replace("env-", "") || ""
        const value = meta.getAttribute("content") || ""
        if (key && key.startsWith("NEXT_PUBLIC_")) {
          win.__ENV[key] = value
        }
      })
    }
  }, [])
}

// Utility component to inject public env vars into the DOM
export function EnvInitializer({
  env,
}: {
  env: Record<string, string>
}) {
  const publicEnv = Object.entries(env).filter(([key]) => key.startsWith("NEXT_PUBLIC_"))

  if (publicEnv.length === 0) return null

  return (
    <>
      {publicEnv.map(([key, value]) => (
        <meta key={key} name={`env-${key}`} content={value} />
      ))}
    </>
  )
}

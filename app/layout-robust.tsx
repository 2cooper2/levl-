import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientRootLayout } from "./client-layout-robust"
import { EnvInjector, ENV } from "@/lib/env"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Levl Platform Concept",
  description: "AI powered marketplace for personal coaching and home services",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
}

// Get all public environment variables
function getPublicEnvVars(): Record<string, string> {
  const envVars: Record<string, string> = {}

  // Add NEXT_PUBLIC_ vars from process.env
  if (typeof process !== "undefined" && process.env) {
    Object.entries(process.env).forEach(([key, value]) => {
      if (key.startsWith("NEXT_PUBLIC_") && value) {
        envVars[key] = value
      }
    })
  }

  // Add specific public env vars we need
  envVars["NEXT_PUBLIC_SUPABASE_URL"] = ENV.SUPABASE_URL()
  envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = ENV.SUPABASE_ANON_KEY()
  envVars["NEXT_PUBLIC_BASE_URL"] = ENV.NEXT_PUBLIC_BASE_URL()
  envVars["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] = ENV.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY()

  return envVars
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const publicEnvVars = getPublicEnvVars()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
        {/* Inject public env vars for client-side access */}
        <EnvInjector env={publicEnvVars} />
      </head>
      <body className={inter.className}>
        <ClientRootLayout>{children}</ClientRootLayout>
      </body>
    </html>
  )
}

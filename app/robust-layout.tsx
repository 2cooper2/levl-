import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { RobustClientRootLayout } from "./robust-client-layout"
import { EnvInitializer } from "@/lib/client-init"
import { ENV } from "@/lib/enhanced-env"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Levl Platform Concept",
  description: "AI powered marketplace for personal coaching and home services",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
}

// Collect public env vars to pass to the client
function getPublicEnvVars() {
  const envVars: Record<string, string> = {}

  // Add all NEXT_PUBLIC_ env vars from process.env
  Object.entries(process.env).forEach(([key, value]) => {
    if (key.startsWith("NEXT_PUBLIC_") && value) {
      envVars[key] = value
    }
  })

  // Add specific env vars we know we need
  envVars["NEXT_PUBLIC_SUPABASE_URL"] = ENV.SUPABASE_URL()
  envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = ENV.SUPABASE_ANON_KEY()
  envVars["NEXT_PUBLIC_BASE_URL"] = ENV.BASE_URL()
  envVars["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] = ENV.STRIPE_PUBLIC_KEY()

  return envVars
}

export default function RobustRootLayout({
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
        <EnvInitializer env={publicEnvVars} />
      </head>
      <body className={inter.className}>
        <RobustClientRootLayout>{children}</RobustClientRootLayout>
      </body>
    </html>
  )
}

"use client"

import type { ReactNode } from "react"

interface StripeProviderProps {
  children: ReactNode
}

export function StripeProvider({ children }: StripeProviderProps) {
  return <>{children}</>
}

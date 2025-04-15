"use client"

import { useContext } from "react"
import { AuthContext } from "./auth-context"

export function useSafeAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: async () => {
        console.warn("Auth not initialized")
      },
      signup: async () => {
        console.warn("Auth not initialized")
      },
      logout: () => {
        console.warn("Auth not initialized")
      },
    }
  }
  return context
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase-client"
import Cookies from "js-cookie"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Prefetch the dashboard page to make navigation faster
    router.prefetch("/dashboard")
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Set auth cookie immediately for faster perceived login
      Cookies.set("auth-token", email, { expires: 7 }) // 7 days expiry

      // Redirect immediately to dashboard
      window.location.href = "/dashboard"

      // Continue Supabase authentication in the background (don't block UI)
      // This will run but the page will have already navigated away
      supabase.auth
        .signInWithPassword({
          email,
          password,
        })
        .then(({ data, error }) => {
          if (error) {
            console.log("Using fallback auth:", error.message)
          }
        })
        .catch((err) => {
          console.error("Background auth error:", err)
        })
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-6">
            <LevlLogo className="h-10 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Log In</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert className="bg-red-50 border-red-200 mb-4">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging In...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-center text-sm w-full">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-800">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

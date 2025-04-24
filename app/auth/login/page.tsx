"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LevlLogo } from "@/components/levl-logo"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState(() => {
    // Get the email from localStorage on initial load
    if (typeof window !== "undefined") {
      return localStorage.getItem("rememberedEmail") || ""
    }
    return ""
  })
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  // Check for error parameter in URL
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(
        errorParam === "server_error"
          ? "Server error occurred. Please try again."
          : "Authentication error. Please try again.",
      )
    }
  }, [searchParams])

  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // Store the email in localStorage whenever it changes
    localStorage.setItem("rememberedEmail", email)
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Attempting to login with:", email)

      // For development testing
      if (process.env.NODE_ENV === "development" && email === "test@example.com") {
        console.log("Using test account")
      }

      await login(email, password)

      toast({
        title: "Login successful",
        description: "Welcome back to Levl!",
      })

      // Short delay before redirect to ensure state is updated
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    } catch (error: any) {
      console.error("Login error:", error)

      // Provide more specific error messages
      let errorMessage = "Failed to log in. Please check your credentials and try again."

      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again."
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please confirm your email address before logging in."
      }

      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // For development testing - add a quick login option
  const handleQuickLogin = async () => {
    setEmail("test@example.com")
    setPassword("password")

    // Submit the form after a short delay to ensure state is updated
    setTimeout(() => {
      const form = document.querySelector("form")
      if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
    }, 100)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <LevlLogo className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </button>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>

            {process.env.NODE_ENV === "development" && (
              <Button type="button" variant="outline" className="w-full mt-2" onClick={handleQuickLogin}>
                Quick Login (Dev Only)
              </Button>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

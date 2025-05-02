"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CheckCircle } from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"
import { directSignup } from "@/app/actions/direct-signup"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"client" | "provider">("client")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Basic validation
      if (!name || !email || !password) {
        setError("All fields are required")
        setIsLoading(false)
        return
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters")
        setIsLoading(false)
        return
      }

      // Use the server action for signup
      const result = await directSignup(name, email, password, role)

      if (!result.success) {
        setError(result.error || "Failed to create account")
        setIsLoading(false)
        return
      }

      // If signup was successful, show success and redirect
      setSignupSuccess(true)

      // Redirect to login page after successful signup
      setTimeout(() => {
        router.push("/auth/login?signup=success")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // If signup was successful but we're still on this page, show success message
  if (signupSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <LevlLogo className="h-10 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Account Created!</CardTitle>
            <CardDescription className="text-center">Your account has been successfully created.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-lg">Your account has been created successfully! Redirecting to login page...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-6">
            <LevlLogo className="h-10 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Sign up to get started with Levl</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500">Password must be at least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label>I want to</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as "client" | "provider")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="cursor-pointer">
                    Find services (Client)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="provider" id="provider" />
                  <Label htmlFor="provider" className="cursor-pointer">
                    Offer services (Provider)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-800">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

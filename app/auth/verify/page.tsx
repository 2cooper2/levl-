"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"

export default function VerifyPage() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resendConfirmationEmail } = useAuth()
  const token = searchParams.get("token")
  const email = token ? atob(token).split(":")[0] : ""

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("Invalid verification link. Please request a new one.")
      return
    }

    // In a real implementation, you would verify the token with your backend
    // For now, we'll just simulate a successful verification
    setTimeout(() => {
      setStatus("success")
    }, 1500)
  }, [token])

  const handleResendEmail = async () => {
    if (!email) {
      setErrorMessage("Cannot resend verification email. Please sign up again.")
      return
    }

    const result = await resendConfirmationEmail(email)
    if (result.success) {
      setErrorMessage("Verification email sent! Please check your inbox.")
    } else {
      setErrorMessage(result.error || "Failed to resend verification email.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {status === "verifying"
              ? "We're verifying your email address..."
              : status === "success"
                ? "Your email has been verified!"
                : "There was a problem verifying your email."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "verifying" && (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p>Thank you for verifying your email address. You can now access all features of your account.</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="mb-4">{errorMessage}</p>
              {email && (
                <Button variant="outline" onClick={handleResendEmail}>
                  Resend Verification Email
                </Button>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === "success" && <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>}
          {status === "error" && !email && (
            <Button variant="outline" onClick={() => router.push("/auth/signup")}>
              Back to Sign Up
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

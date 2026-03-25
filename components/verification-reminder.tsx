"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export function VerificationReminder() {
  const { user, resendConfirmationEmail } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle")

  // Don't show if user is verified or no user
  if (!user || user.is_verified) {
    return null
  }

  const handleResendEmail = async () => {
    if (!user.email) return

    setIsResending(true)
    setResendStatus("idle")

    try {
      const result = await resendConfirmationEmail(user.email)

      if (result.success) {
        setResendStatus("success")
      } else {
        setResendStatus("error")
      }
    } catch (error) {
      console.error("Error resending verification email:", error)
      setResendStatus("error")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Alert className="mb-6 border-amber-500 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertTitle>Please verify your email address</AlertTitle>
      <AlertDescription className="flex flex-col space-y-2">
        <p>
          To access all features, please verify your email address. We sent a verification link to{" "}
          <strong>{user.email}</strong>.
        </p>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendEmail}
            disabled={isResending || resendStatus === "success"}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </Button>

          {resendStatus === "success" && (
            <span className="flex items-center text-sm text-green-600">
              <CheckCircle className="mr-1 h-4 w-4" />
              Email sent!
            </span>
          )}

          {resendStatus === "error" && <span className="text-sm text-red-600">Failed to send. Try again later.</span>}
        </div>
      </AlertDescription>
    </Alert>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { joinWaitlist } from "@/app/actions/waitlist-actions"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface WaitlistFormProps {
  onSuccess?: () => void
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [role, setRole] = useState<string>("client")

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    setDebugInfo(null)

    // Add the role to the form data
    formData.append("role", role)

    try {
      const result = await joinWaitlist(formData)

      if (result.success) {
        setIsSuccess(true)
        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
          }, 2000)
        }
      } else {
        setError(result.message || "Something went wrong. Please try again.")

        // Check console logs for more information
        setDebugInfo(
          "Check browser console for more details. The issue might be that the waitlist table doesn't exist in your Supabase database or there are permission issues.",
        )
      }
    } catch (err) {
      console.error("Error in waitlist submission:", err)
      setError("An unexpected error occurred. Please try again later.")
      setDebugInfo("Check browser console for more details.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-green-100 p-3 text-green-600 mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
        <p className="text-muted-foreground">
          Thank you for joining our waitlist. We'll notify you when LevL launches!
        </p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Input name="name" placeholder="Your name" required className="w-full" />
      </div>
      <div className="space-y-2">
        <Input name="email" type="email" placeholder="Your email" required className="w-full" />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">I am interested in joining as:</Label>
        <RadioGroup defaultValue="client" value={role} onValueChange={setRole} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="client" id="client" />
            <Label htmlFor="client" className="cursor-pointer">
              Client - I want to hire talent
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="worker" id="worker" />
            <Label htmlFor="worker" className="cursor-pointer">
              Worker - I want to offer my skills
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="both" id="both" />
            <Label htmlFor="both" className="cursor-pointer">
              Both - I want to do both
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Textarea name="message" placeholder="Give us feedback on the page!" className="min-h-[100px] w-full" />
      </div>
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-500 mt-2 p-2 bg-red-50 rounded">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p>{error}</p>
            {debugInfo && <p className="text-xs mt-1 text-gray-500">{debugInfo}</p>}
          </div>
        </div>
      )}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining...
          </>
        ) : (
          "Join Waitlist"
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground mt-4">
        We'll notify you when we launch. No spam, we promise!
      </p>
    </form>
  )
}

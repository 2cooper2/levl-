"use client"

import type React from "react"

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
  showName?: boolean
}

export function WaitlistForm({ onSuccess, showName = true }: WaitlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [role, setRole] = useState<string>("client")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setDebugInfo(null)

    try {
      // Create FormData object
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("role", role)
      formData.append("message", message)

      console.log("Submitting waitlist form:", { name, email, role, message })

      const result = await joinWaitlist(formData)

      if (result.success) {
        console.log("Waitlist submission successful")
        setIsSuccess(true)
        // Clear form
        setName("")
        setEmail("")
        setMessage("")

        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
          }, 2000)
        }
      } else {
        console.error("Waitlist submission failed:", result.message)
        setError(result.message || "Something went wrong. Please try again.")
        setDebugInfo(
          "The issue might be that the waitlist table doesn't exist in your Supabase database or there are permission issues.",
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
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {showName && (
        <div className="space-y-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full px-4 py-2 text-base"
            autoComplete="name"
          />
        </div>
      )}

      <div className="space-y-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Your email"
          required
          className="w-full px-4 py-2 text-base"
          autoComplete="email"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">I am interested in joining as:</Label>
        <RadioGroup value={role} onValueChange={setRole} className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="client" id="client" />
            <Label htmlFor="client" className="cursor-pointer text-base">
              Client - I want to hire talent
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="worker" id="worker" />
            <Label htmlFor="worker" className="cursor-pointer text-base">
              Worker - I want to offer my skills
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="both" id="both" />
            <Label htmlFor="both" className="cursor-pointer text-base">
              Both - I want to do both
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Give us feedback on the page!"
          className="min-h-[100px] w-full px-4 py-2 text-base"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-500 mt-2 p-3 bg-red-50 rounded">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p>{error}</p>
            {debugInfo && <p className="text-xs mt-1 text-gray-500">{debugInfo}</p>}
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-3 text-base font-medium"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { joinWaitlist } from "@/app/actions/waitlist-actions"
import { z } from "zod"

const waitlistSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  message: z.string().optional(),
})

export function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{
    success?: boolean
    message?: string
  }>({})

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setFormStatus({})

    const formData = new FormData(event.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    }

    try {
      // Validate the data client-side first
      waitlistSchema.parse(data)

      // Store in localStorage for demo purposes
      const waitlistEntries = JSON.parse(localStorage.getItem("waitlistEntries") || "[]")
      waitlistEntries.push({
        ...data,
        date: new Date().toISOString(),
      })
      localStorage.setItem("waitlistEntries", JSON.stringify(waitlistEntries))
      console.log("New waitlist entry:", data)
      console.log("Total waitlist entries:", waitlistEntries.length)

      // Also send to server (optional in demo mode)
      const result = await joinWaitlist(data)

      setFormStatus({
        success: true,
        message: "You've been added to our waitlist! We'll notify you when we launch.",
      })

      // Reset form on success
      event.currentTarget.reset()
    } catch (error) {
      console.error("Error in form submission:", error)
      let errorMessage = "Something went wrong. Please try again."

      if (error instanceof z.ZodError) {
        errorMessage = error.errors[0].message
      }

      setFormStatus({
        success: false,
        message: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div className="space-y-2">
        <Input name="name" placeholder="Your name" required className="bg-background/80 backdrop-blur-sm" />
      </div>
      <div className="space-y-2">
        <Input
          name="email"
          type="email"
          placeholder="Your email"
          required
          className="bg-background/80 backdrop-blur-sm"
        />
      </div>
      <div className="space-y-2">
        <Textarea
          name="message"
          placeholder="Tell us what you're looking for (optional)"
          className="bg-background/80 backdrop-blur-sm min-h-[100px]"
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Joining..." : "Join Waitlist"}
      </Button>

      {formStatus.message && (
        <div
          className={`p-3 rounded-md text-sm ${
            formStatus.success
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {formStatus.message}
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        <p>Demo Mode: Entries are stored locally in your browser.</p>
        <button
          type="button"
          onClick={() => {
            console.table(JSON.parse(localStorage.getItem("waitlistEntries") || "[]"))
            alert("Waitlist entries logged to console. Press F12 to view.")
          }}
          className="text-primary hover:underline mt-1"
        >
          View Entries in Console
        </button>
      </div>
    </form>
  )
}

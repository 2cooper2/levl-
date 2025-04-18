"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { joinWaitlist } from "@/app/actions/waitlist-actions"

export function WaitlistDemo() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [status, setStatus] = useState<{
    success?: boolean
    message?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({})

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("message", "Submitted from demo page")

      const result = await joinWaitlist(formData)

      setStatus({
        success: result.success,
        message: result.message,
      })

      if (result.success) {
        setEmail("")
        setName("")
      }
    } catch (error) {
      setStatus({
        success: false,
        message: "An error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Joining..." : "Join Waitlist"}
      </Button>

      {status.message && (
        <div
          className={`p-3 rounded-md text-sm ${
            status.success
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {status.message}
        </div>
      )}
    </form>
  )
}

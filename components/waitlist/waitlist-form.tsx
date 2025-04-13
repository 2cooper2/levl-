"use client"

import type React from "react"

import { useState } from "react"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { joinWaitlist } from "@/app/actions/waitlist-actions"
import { CheckCircle, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WaitlistFormProps {
  showName?: boolean
  className?: string
  onSuccess?: () => void
}

export function WaitlistForm({ showName = false, className, onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    const formData = new FormData()
    formData.append("email", email)
    if (showName && name) {
      formData.append("name", name)
    }

    const response = await joinWaitlist(formData)
    setResult(response)
    setIsSubmitting(false)

    if (response.success) {
      setEmail("")
      setName("")
      if (onSuccess) {
        onSuccess()
      }
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {showName && (
          <div>
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="h-12"
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className="h-12"
          />
          <EnhancedButton
            type="submit"
            variant="gradient"
            className="h-12 px-6 whitespace-nowrap"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Joining..." : "Join Waitlist"}
          </EnhancedButton>
        </div>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 p-3 rounded-md flex items-center gap-2 ${
              result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {result.success ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <div className="text-sm">
              <p>{result.message}</p>
              {result.success && (
                <p className="mt-1 text-xs">The Levl team has been notified and will be in touch soon!</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

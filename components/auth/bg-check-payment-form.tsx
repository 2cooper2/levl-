"use client"

import type React from "react"
import { useState } from "react"
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Loader2, Lock } from "lucide-react"

const PURPLE = "#7c3aed"
const PURPLE_DEEP = "#5B2A9E"

const submitBtnStyle: React.CSSProperties = {
  background:
    "linear-gradient(135deg,rgba(167,139,250,0.85) 0%,rgba(139,92,246,0.85) 45%,rgba(109,40,217,0.85) 100%)",
  boxShadow:
    "0 8px 16px -4px rgba(124,58,237,0.45), 0 4px 8px -4px rgba(124,58,237,0.25), 0 -1px 4px 0 rgba(255,255,255,0.18) inset",
  color: "#fff",
  padding: "0.875rem 1rem",
  borderRadius: "0.75rem",
  fontWeight: 600,
  fontSize: "1rem",
  cursor: "pointer",
  width: "100%",
}

interface Props {
  onSuccess: () => void
}

export function BgCheckPaymentForm({ onSuccess }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError(null)

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    })

    if (submitError) {
      setError(submitError.message || "Payment failed")
      setSubmitting(false)
      return
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess()
    } else {
      setError(`Payment status: ${paymentIntent?.status || "unknown"}`)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(255,255,255,0.7)",
          boxShadow: "0 0 0 1px rgba(88,82,100,0.12), inset 0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <PaymentElement />
      </div>

      {error && (
        <div
          className="rounded-lg p-3 text-sm"
          style={{ background: "rgba(220,38,38,0.08)", color: "#b91c1c" }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        style={{ ...submitBtnStyle, opacity: !stripe || submitting ? 0.7 : 1 }}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            Pay $40 securely
          </span>
        )}
      </button>

      <p className="flex items-center justify-center gap-1 text-center text-xs" style={{ color: "#888" }}>
        <Lock className="h-3 w-3" />
        Powered by Stripe — encrypted end to end
      </p>
    </form>
  )
}

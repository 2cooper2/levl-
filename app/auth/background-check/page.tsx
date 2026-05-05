"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { Shield, Clock, AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"
import { BgCheckPaymentForm } from "@/components/auth/bg-check-payment-form"
import { supabase } from "@/lib/supabase-client"

const PURPLE = "#7c3aed"
const PURPLE_LIGHT = "#9E52DC"
const PURPLE_DEEP = "#5B2A9E"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

const cardStyle: React.CSSProperties = {
  background: `
    radial-gradient(ellipse at 25% 30%, rgba(245,240,255,0.35) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 80%, rgba(230,240,255,0.35) 0%, transparent 55%),
    radial-gradient(ellipse at 60% 50%, rgba(248,245,252,0.3) 0%, transparent 60%),
    linear-gradient(135deg, #ffffff 0%, #fdfcff 100%)
  `,
  boxShadow:
    "0 0 0 1px rgba(88,82,100,0.09), 0 -1px 0 rgba(255,255,255,0.88), 0 20px 40px -12px rgba(124,58,237,0.18)",
  borderRadius: "1.25rem",
}

const startBtnStyle: React.CSSProperties = {
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

type BgStatus = "none" | "pending" | "cleared" | "rejected" | null

export default function BackgroundCheckPage() {
  const router = useRouter()
  const [status, setStatus] = useState<BgStatus>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      router.push("/")
      return
    }
    ;(async () => {
      const { data: { session } } = await supabase!.auth.getSession()
      if (!session) {
        router.push("/")
        return
      }
      const { data } = await supabase!
        .from("users")
        .select("role, background_check_status")
        .eq("id", session.user.id)
        .single()
      if (data) {
        setRole((data as any).role)
        setStatus((data as any).background_check_status)
      }
      setLoading(false)
    })()
  }, [router])

  const startPayment = async () => {
    setPaymentError(null)
    try {
      const res = await fetch("/api/create-bg-check-payment", { method: "POST" })
      const text = await res.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        setPaymentError(`Server returned ${res.status}: ${text.slice(0, 200)}`)
        return
      }

      if (data.alreadyCleared) {
        router.push("/work")
        return
      }
      if (!res.ok) {
        setPaymentError(data.error || `Payment setup failed (${res.status})`)
        return
      }
      setClientSecret(data.clientSecret)
      setShowPayment(true)
    } catch (e: any) {
      setPaymentError(e?.message || "Could not start payment")
    }
  }

  const handlePaymentSuccess = () => {
    setStatus("pending")
    setShowPayment(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#fff" }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: PURPLE }} />
      </div>
    )
  }

  // Already cleared (or master) — bounce them into /work
  if (status === "cleared" || role === "both") {
    router.replace("/work")
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10" style={{ background: "#fff" }}>
      <button
        type="button"
        onClick={() => router.push("/")}
        className="absolute left-6 top-6 flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
        style={{ color: PURPLE_LIGHT }}
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 flex flex-col items-center gap-2"
      >
        <LevlLogo className="h-16 w-16" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-7"
        style={cardStyle}
      >
        {status === "pending" ? (
          <PendingState />
        ) : status === "rejected" ? (
          <RejectedState />
        ) : showPayment && clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: { colorPrimary: PURPLE },
              },
            }}
          >
            <PaymentStep onCancel={() => setShowPayment(false)} onSuccess={handlePaymentSuccess} />
          </Elements>
        ) : (
          <StartState onStart={startPayment} error={paymentError} />
        )}
      </motion.div>
    </div>
  )
}

function StartState({ onStart, error }: { onStart: () => void; error: string | null }) {
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    setBusy(true)
    await onStart()
    setBusy(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg,rgba(167,139,250,0.85) 0%,rgba(139,92,246,0.85) 45%,rgba(109,40,217,0.85) 100%)",
          boxShadow: "0 8px 16px -4px rgba(124,58,237,0.45), 0 -1px 4px 0 rgba(255,255,255,0.18) inset",
        }}
      >
        <Shield className="h-7 w-7 text-white" />
      </div>

      <h1 className="text-center text-2xl font-bold" style={{ color: PURPLE_DEEP }}>
        Background check
      </h1>
      <p className="text-center text-sm" style={{ color: "#666" }}>
        Workers on Levl complete a one-time background check before accepting jobs.
        Run by Checkr — used by Uber, Lyft, and DoorDash.
      </p>

      <div
        className="w-full rounded-xl p-4"
        style={{ background: "rgba(124,58,237,0.06)", boxShadow: "0 0 0 1px rgba(124,58,237,0.12)" }}
      >
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold" style={{ color: PURPLE_DEEP }}>
            One-time fee
          </span>
          <span className="text-2xl font-bold" style={{ color: PURPLE_DEEP }}>
            $40
          </span>
        </div>
        <ul className="mt-2 space-y-1 text-xs" style={{ color: "#555" }}>
          <li>• National + county criminal records</li>
          <li>• SSN trace + sex offender registry</li>
          <li>• Global watchlist</li>
          <li>• Results in 1–3 business days</li>
        </ul>
      </div>

      {error && (
        <div className="w-full rounded-lg p-3 text-sm" style={{ background: "rgba(220,38,38,0.08)", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      <button type="button" onClick={handleClick} disabled={busy} style={{ ...startBtnStyle, opacity: busy ? 0.7 : 1 }}>
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Setting up...
          </span>
        ) : (
          "Pay $40 & start check"
        )}
      </button>

      <p className="text-center text-xs" style={{ color: "#999" }}>
        You can use the Client side anytime, even before your check completes.
      </p>
    </div>
  )
}

function PaymentStep({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: PURPLE_DEEP }}>
          Pay $40 for your check
        </h1>
      </div>
      <BgCheckPaymentForm onSuccess={onSuccess} />
      <button
        type="button"
        onClick={onCancel}
        className="text-center text-xs"
        style={{ color: PURPLE_LIGHT }}
      >
        Cancel
      </button>
    </div>
  )
}

function PendingState() {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "rgba(124,58,237,0.12)" }}
      >
        <Clock className="h-7 w-7" style={{ color: PURPLE }} />
      </div>
      <h1 className="text-center text-2xl font-bold" style={{ color: PURPLE_DEEP }}>
        Check in progress
      </h1>
      <p className="text-center text-sm" style={{ color: "#666" }}>
        We received your $40 payment. Levl is finalizing your background check —
        most complete in 1–3 business days. We'll email you the moment it's done.
      </p>
      <button
        type="button"
        onClick={() => router.push("/client")}
        style={{ ...startBtnStyle, marginTop: "0.5rem" }}
      >
        Use the Client side meanwhile
      </button>
    </div>
  )
}

function RejectedState() {
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "rgba(220,38,38,0.1)" }}
      >
        <AlertCircle className="h-7 w-7" style={{ color: "#dc2626" }} />
      </div>
      <h1 className="text-center text-2xl font-bold" style={{ color: PURPLE_DEEP }}>
        Check incomplete
      </h1>
      <p className="text-center text-sm" style={{ color: "#666" }}>
        We couldn't approve your background check at this time. You can still use the Client side.
        For questions, reach support@levl.app.
      </p>
    </div>
  )
}

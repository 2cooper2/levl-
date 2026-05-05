"use client"

import type React from "react"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"
import { directSignup } from "@/app/actions/direct-signup"

type SignupRole = "client" | "worker"

const PURPLE = "#7c3aed"
const PURPLE_LIGHT = "#9E52DC"
const PURPLE_DEEP = "#5B2A9E"

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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "0.625rem",
  background: "rgba(255,255,255,0.85)",
  boxShadow: "0 0 0 1px rgba(88,82,100,0.12), inset 0 1px 2px rgba(0,0,0,0.04)",
  outline: "none",
  fontSize: "0.95rem",
  color: "#111",
}

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
  transition: "transform 0.15s ease",
  width: "100%",
}

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get("role") as SignupRole) || "client"

  const [role, setRole] = useState<SignupRole>(initialRole)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !email || !password) {
      setError("All fields are required")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)
    try {
      const result = await directSignup(name, email, password, role)
      if (!result.success) {
        setError(result.error || "Failed to create account")
        setIsLoading(false)
        return
      }

      setSignupSuccess(true)

      // Worker → kick off background check flow. Client/master → straight in.
      setTimeout(() => {
        if (role === "worker") {
          router.push("/auth/background-check")
        } else {
          router.push("/client")
        }
      }, 900)
    } catch (err: any) {
      setError(err?.message || "Unexpected error")
      setIsLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-10"
      style={{ background: "#ffffff" }}
    >
      <Link
        href="/"
        className="absolute left-6 top-6 flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
        style={{ color: PURPLE_LIGHT }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <LevlLogo className="h-24 w-24" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8"
        style={cardStyle}
      >
        {signupSuccess ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle className="h-12 w-12" style={{ color: PURPLE }} />
            <h2 className="text-xl font-bold" style={{ color: PURPLE_DEEP }}>
              Welcome to Levl
            </h2>
            <p className="text-sm" style={{ color: "#666" }}>
              {role === "worker" ? "Setting up your background check..." : "Taking you in..."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold" style={{ color: PURPLE_DEEP }}>
                {role === "worker" ? "Sign up as a Worker" : "Sign up as a Client"}
              </h1>
              <p className="mt-1 text-sm" style={{ color: "#666" }}>
                {role === "worker"
                  ? "Get matched to paying jobs near you"
                  : "Find a pro for the job"}
              </p>
            </div>

            {/* Role toggle */}
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl p-1" style={{ background: "rgba(124,58,237,0.06)" }}>
              {(["client", "worker"] as const).map((r) => {
                const selected = role === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      padding: "0.55rem 0.5rem",
                      borderRadius: "0.625rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      ...(selected
                        ? {
                            background:
                              "linear-gradient(135deg,rgba(167,139,250,0.85) 0%,rgba(139,92,246,0.85) 45%,rgba(109,40,217,0.85) 100%)",
                            color: "#fff",
                            boxShadow:
                              "0 4px 10px -3px rgba(124,58,237,0.4), 0 -1px 3px 0 rgba(255,255,255,0.18) inset",
                          }
                        : { background: "transparent", color: PURPLE_DEEP }),
                    }}
                  >
                    {r === "client" ? "Client" : "Worker"}
                  </button>
                )
              })}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: PURPLE_DEEP }}>
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  style={inputStyle}
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: PURPLE_DEEP }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: PURPLE_DEEP }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  style={inputStyle}
                  autoComplete="new-password"
                  required
                />
              </div>

              {role === "worker" && (
                <div
                  className="mt-1 rounded-lg p-3 text-xs"
                  style={{
                    background: "rgba(124,58,237,0.06)",
                    color: PURPLE_DEEP,
                    boxShadow: "0 0 0 1px rgba(124,58,237,0.12)",
                  }}
                >
                  <strong>Workers pay $40</strong> for a one-time background check after signup.
                  You won't be charged until the next step.
                </div>
              )}

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
                disabled={isLoading}
                style={{
                  ...submitBtnStyle,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "wait" : "pointer",
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : role === "worker" ? (
                  "Continue to background check"
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-xs" style={{ color: "#888" }}>
              Already have an account?{" "}
              <Link href="/auth/login" style={{ color: PURPLE, fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ background: "#fff" }}>
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: PURPLE }} />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  )
}

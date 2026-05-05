"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, X } from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"
import { directSignup } from "@/app/actions/direct-signup"
import { supabase } from "@/lib/supabase-client"

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
    "0 0 0 1px rgba(88,82,100,0.09), 0 -1px 0 rgba(255,255,255,0.88), 0 25px 60px -12px rgba(124,58,237,0.35)",
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
  width: "100%",
}

interface Props {
  open: boolean
  onClose: () => void
  initialRole: SignupRole
}

export function SignupModal({ open, onClose, initialRole }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<"signup" | "signin">("signup")
  const [role, setRole] = useState<SignupRole>(initialRole)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) setRole(initialRole)
  }, [open, initialRole])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === "signup" && !name) {
      setError("Full name is required")
      return
    }
    if (!email || !password) {
      setError("Email and password are required")
      return
    }
    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)
    try {
      if (mode === "signup") {
        const result = await directSignup(name, email, password, role)
        if (!result.success) {
          setError(result.error || "Failed to create account")
          setIsLoading(false)
          return
        }
        // Auto-sign-in so cookies are set for middleware
        if (supabase) {
          await supabase.auth.signInWithPassword({ email, password })
        }
        // Look up role to handle master case (caydonac@gmail.com → both)
        let dest = role === "worker" ? "/auth/background-check" : "/client"
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase
              .from("users")
              .select("role, background_check_status")
              .eq("id", user.id)
              .single()
            if ((profile as any)?.role === "both") {
              dest = role === "worker" ? "/work" : "/client"
            }
          }
        }
        onClose()
        router.refresh()
        router.push(dest)
      } else {
        // Sign in
        if (!supabase) {
          setError("Auth client unavailable")
          setIsLoading(false)
          return
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) {
          setError(signInError.message)
          setIsLoading(false)
          return
        }
        onClose()
        router.refresh()
        router.push(role === "worker" ? "/work" : "/client")
      }
    } catch (err: any) {
      setError(err?.message || "Unexpected error")
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
          style={{ background: "rgba(20,4,40,0.45)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md p-7"
            style={cardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ background: "rgba(124,58,237,0.08)", color: PURPLE_DEEP }}
            >
              <X className="h-4 w-4" />
            </button>

            <>
                <div className="mb-4 flex flex-col items-center gap-2">
                  <LevlLogo className="h-16 w-16" />
                  <h1 className="text-xl font-bold" style={{ color: PURPLE_DEEP }}>
                    {mode === "signup"
                      ? role === "worker"
                        ? "Sign up as a Worker"
                        : "Sign up as a Client"
                      : "Sign in"}
                  </h1>
                  {mode === "signup" && (
                    <p className="text-xs" style={{ color: "#666" }}>
                      {role === "worker"
                        ? "Get matched to paying jobs"
                        : "Find a pro for the job"}
                    </p>
                  )}
                </div>

                {mode === "signup" && (
                  <div
                    className="mb-4 grid grid-cols-2 gap-2 rounded-xl p-1"
                    style={{ background: "rgba(124,58,237,0.06)" }}
                  >
                    {(["client", "worker"] as const).map((r) => {
                      const selected = role === r
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          style={{
                            padding: "0.5rem 0.5rem",
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
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                  {mode === "signup" && (
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
                  )}

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
                      placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                      style={inputStyle}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      required
                    />
                  </div>

                  {mode === "signup" && role === "worker" && (
                    <div
                      className="mt-1 rounded-lg p-3 text-xs"
                      style={{
                        background: "rgba(124,58,237,0.06)",
                        color: PURPLE_DEEP,
                        boxShadow: "0 0 0 1px rgba(124,58,237,0.12)",
                      }}
                    >
                      <strong>$40 background check</strong> — required to accept jobs.
                      You'll pay on the next screen.
                    </div>
                  )}

                  {error && (
                    <div
                      className="rounded-lg p-2.5 text-sm"
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
                      marginTop: "0.5rem",
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {mode === "signup" ? "Creating account..." : "Signing in..."}
                      </span>
                    ) : mode === "signup" ? (
                      role === "worker" ? "Continue to background check" : "Create account"
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </form>

                <p className="mt-4 text-center text-xs" style={{ color: "#888" }}>
                  {mode === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signin")
                          setError(null)
                        }}
                        style={{ color: PURPLE, fontWeight: 600 }}
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      Need an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signup")
                          setError(null)
                        }}
                        style={{ color: PURPLE, fontWeight: 600 }}
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </p>
              </>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

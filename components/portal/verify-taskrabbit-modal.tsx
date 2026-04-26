"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, CheckCircle, AlertCircle, Loader2, Star, Briefcase, ShieldCheck,
  Copy, Check,
} from "lucide-react"

export type VerifiedSkill = {
  name: string
  taskCount: number
  ratingAverage: number | null
  ratingReviews: number
  rate: string | null
  description: string
}

export type VerifiedProfile = {
  platform: "taskrabbit"
  profileUrl: string
  displayName: string
  avatarUrl: string | null
  ratingAverage: number
  ratingReviews: number
  taskCount: number
  metroName: string
  vehiclesDisplay: string | null
  description: string
  taskerSince: string | null
  idVerified: boolean
  skills: VerifiedSkill[]
  verifiedAt: string
}

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.97), rgba(237,233,254,0.82))",
  border: "1px solid rgba(167,139,250,0.45)",
  boxShadow: "0 8px 16px -4px rgba(0,0,0,0.3), 0 4px 8px -4px rgba(0,0,0,0.18), 0 -2px 4px 0 rgba(255,255,255,0.9) inset",
  borderRadius: "0.75rem",
}

const activeStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,rgba(167,139,250,0.72) 0%,rgba(139,92,246,0.65) 45%,rgba(109,40,217,0.55) 100%)",
  boxShadow: "0 8px 16px -4px rgba(0,0,0,0.35), 0 4px 8px -4px rgba(0,0,0,0.2), 0 -1px 4px 0 rgba(255,255,255,0.15) inset",
  border: "1px solid rgba(167,139,250,0.6)",
}

type Phase = "idle" | "previewing" | "ownership" | "confirming" | "success" | "error"

export function VerifyTaskRabbitModal({
  open,
  onClose,
  onVerified,
}: {
  open: boolean
  onClose: () => void
  onVerified: (profile: VerifiedProfile) => void
}) {
  const [url, setUrl] = useState("")
  const [phase, setPhase] = useState<Phase>("idle")
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<VerifiedProfile | null>(null)
  const [ownershipCode, setOwnershipCode] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)

  function reset() {
    setUrl("")
    setPhase("idle")
    setError(null)
    setProfile(null)
    setOwnershipCode(null)
    setCodeCopied(false)
  }

  async function handlePreview() {
    if (!url.trim()) {
      setError("Paste your TaskRabbit profile link")
      return
    }
    setPhase("previewing")
    setError(null)
    try {
      const resp = await fetch("/api/verify/taskrabbit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", url: url.trim() }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        setPhase("error")
        setError(data.error ?? "Verification failed")
        return
      }
      setProfile(data.profile)
      setOwnershipCode(data.ownershipCode)
      setPhase("ownership")
    } catch (err: any) {
      setPhase("error")
      setError(err.message ?? "Network error")
    }
  }

  async function handleConfirm() {
    if (!ownershipCode) return
    setPhase("confirming")
    setError(null)
    try {
      const resp = await fetch("/api/verify/taskrabbit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          url: url.trim(),
          code: ownershipCode,
        }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        setPhase("ownership")
        setError(data.error ?? "Could not confirm ownership")
        return
      }
      setProfile(data.profile)
      setPhase("success")
    } catch (err: any) {
      setPhase("ownership")
      setError(err.message ?? "Network error")
    }
  }

  async function copyCode() {
    if (!ownershipCode) return
    try {
      await navigator.clipboard.writeText(ownershipCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch {}
  }

  function handleSave() {
    if (profile) onVerified(profile)
    reset()
    onClose()
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(76,29,149,0.35)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md p-6 md:p-8"
            style={cardStyle}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-purple-100"
              aria-label="Close"
            >
              <X size={16} style={{ color: "#7c3aed" }} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 text-white"
                style={activeStyle}
              >
                TR
              </div>
              <div>
                <p className="text-[11px] tracking-[0.18em] font-bold uppercase" style={{ color: "#a78bfa" }}>
                  Step {phase === "ownership" || phase === "confirming" ? "2 of 2" : phase === "success" ? "Done" : "1 of 2"}
                </p>
                <h2 className="text-lg font-bold" style={{ color: "#7c3aed" }}>
                  {phase === "ownership" || phase === "confirming"
                    ? "Prove it's your account"
                    : phase === "success"
                    ? "Verified!"
                    : "TaskRabbit profile"}
                </h2>
              </div>
            </div>

            {/* PHASE: idle / previewing / error (URL input) */}
            {(phase === "idle" || phase === "previewing" || phase === "error") && (
              <>
                <p className="text-sm mb-4" style={{ color: "#a78bfa" }}>
                  Paste the link to your TaskRabbit profile. We'll fetch your public stats from
                  the profile page — nothing private, no password.
                </p>

                <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: "#7c3aed" }}>
                  Profile link
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://tr.co/your-handle"
                  disabled={phase === "previewing"}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium outline-none focus:ring-2 transition-shadow"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(167,139,250,0.45)",
                    color: "#4c1d95",
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") handlePreview() }}
                />

                <p className="text-[11px] mt-2" style={{ color: "#c4b5fd" }}>
                  Don't know where to find it? Open the TaskRabbit app → tap <b>Share Profile</b> → copy the link.
                </p>

                {error && (
                  <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                    <span className="text-xs" style={{ color: "#dc2626" }}>{error}</span>
                  </div>
                )}

                <button
                  onClick={handlePreview}
                  disabled={phase === "previewing"}
                  className="mt-5 w-full px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  style={activeStyle}
                >
                  {phase === "previewing" ? (
                    <><Loader2 size={14} className="animate-spin" /> Looking up profile…</>
                  ) : (
                    "Continue"
                  )}
                </button>
              </>
            )}

            {/* PHASE: ownership / confirming (proof of ownership) */}
            {(phase === "ownership" || phase === "confirming") && profile && ownershipCode && (
              <>
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.25)" }}>
                  {profile.avatarUrl && (
                    <img src={profile.avatarUrl} alt={profile.displayName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold leading-tight truncate" style={{ color: "#7c3aed" }}>{profile.displayName}</div>
                    <div className="text-[11px]" style={{ color: "#a78bfa" }}>
                      {profile.taskCount.toLocaleString()} jobs · {profile.ratingAverage.toFixed(1)}★
                    </div>
                  </div>
                </div>

                <p className="text-sm mb-3" style={{ color: "#7c3aed" }}>
                  To prove this is your account, add this code to your TaskRabbit <b>About me</b> section:
                </p>

                <button
                  onClick={copyCode}
                  className="w-full p-3 mb-3 rounded-lg flex items-center justify-between transition-transform hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.85)", border: "1px dashed rgba(167,139,250,0.6)" }}
                >
                  <span className="font-mono font-black text-base tracking-wider" style={{ color: "#7c3aed" }}>
                    {ownershipCode}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: codeCopied ? "#10b981" : "#a78bfa" }}>
                    {codeCopied ? (<><Check size={12} /> Copied</>) : (<><Copy size={12} /> Copy</>)}
                  </span>
                </button>

                <ol className="text-xs space-y-1.5 mb-4 pl-5 list-decimal" style={{ color: "#a78bfa" }}>
                  <li>Open TaskRabbit (app or web) and go to <b>Edit profile</b></li>
                  <li>Paste the code anywhere in your <b>About me</b> section</li>
                  <li>Save your changes</li>
                  <li>Come back here and click "I've added it"</li>
                </ol>

                <p className="text-[11px] mb-4 italic" style={{ color: "#c4b5fd" }}>
                  Once we verify, you can remove the code from TaskRabbit.
                </p>

                {error && (
                  <div className="mb-3 flex items-start gap-2 p-2.5 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                    <span className="text-xs" style={{ color: "#dc2626" }}>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleConfirm}
                  disabled={phase === "confirming"}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  style={activeStyle}
                >
                  {phase === "confirming" ? (
                    <><Loader2 size={14} className="animate-spin" /> Checking…</>
                  ) : (
                    "I've added it"
                  )}
                </button>
              </>
            )}

            {/* PHASE: success */}
            {phase === "success" && profile && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={16} style={{ color: "#7c3aed" }} />
                  <span className="text-sm font-bold" style={{ color: "#7c3aed" }}>
                    Ownership verified
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  {profile.avatarUrl && (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      style={{ border: "1px solid rgba(167,139,250,0.45)" }}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-base font-bold leading-tight truncate" style={{ color: "#7c3aed" }}>
                      {profile.displayName}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Stat icon={<Briefcase size={12} />} label="Jobs" value={profile.taskCount.toLocaleString()} />
                  <Stat icon={<Star size={12} />} label="Rating" value={`${profile.ratingAverage.toFixed(1)}★`} />
                  <Stat icon={<CheckCircle size={12} />} label="Reviews" value={profile.ratingReviews.toLocaleString()} />
                </div>

                {profile.idVerified && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold mb-4" style={{ color: "#7c3aed" }}>
                    <ShieldCheck size={12} /> ID Verified on TaskRabbit
                  </div>
                )}

                <div className="p-3 mb-3 rounded-lg" style={{ background: "rgba(167,139,250,0.10)", border: "1px solid rgba(167,139,250,0.30)" }}>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "#7c3aed" }}>
                    Don't forget — remove the code from your TaskRabbit profile
                  </p>
                  <p className="text-[11px]" style={{ color: "#a78bfa" }}>
                    Levl already has your data. You can delete{" "}
                    <span className="font-mono font-bold">{ownershipCode}</span> from your About me anytime.
                  </p>
                  <a
                    href="https://www.taskrabbit.com/profile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide mt-2 transition-colors hover:opacity-80"
                    style={{ color: "#7c3aed" }}
                  >
                    Open TaskRabbit to remove ↗
                  </a>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide text-white transition-transform hover:-translate-y-0.5"
                  style={activeStyle}
                >
                  Save to my Levl profile
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="p-2.5 text-center rounded-lg"
      style={{
        background: "rgba(167,139,250,0.10)",
        border: "1px solid rgba(167,139,250,0.25)",
      }}
    >
      <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#a78bfa" }}>
        {icon}
        {label}
      </div>
      <div className="text-base font-black leading-none" style={{ color: "#7c3aed" }}>
        {value}
      </div>
    </div>
  )
}

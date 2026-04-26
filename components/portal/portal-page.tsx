"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Shield, Star, Award, Crown,
  ArrowRight, RefreshCw, Eye, Link2,
  HelpCircle, Plus, Verified, Briefcase,
  ShieldCheck, MapPin, Calendar,
} from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"
import { VerifyTaskRabbitModal, type VerifiedProfile } from "@/components/portal/verify-taskrabbit-modal"
import { getCredentials, saveCredential } from "@/lib/credentials-store"

// ─── Locked Levl style — matches feedback_levl_card_style.md ──────────────
const levlCardStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.97), rgba(237,233,254,0.82))",
  border: "1px solid rgba(167,139,250,0.45)",
  boxShadow: "0 8px 16px -4px rgba(0,0,0,0.3), 0 4px 8px -4px rgba(0,0,0,0.18), 0 -2px 4px 0 rgba(255,255,255,0.9) inset",
  borderRadius: "0.75rem",
}

const groundShadow: React.CSSProperties = {
  background: "radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)",
  filter: "blur(5px)",
  zIndex: 0,
}

// Active/selected state (matches selected calendar day on worker page)
const levlActiveStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,rgba(167,139,250,0.72) 0%,rgba(139,92,246,0.65) 45%,rgba(109,40,217,0.55) 100%)",
  boxShadow: "0 8px 16px -4px rgba(0,0,0,0.35), 0 4px 8px -4px rgba(0,0,0,0.2), 0 -1px 4px 0 rgba(255,255,255,0.15) inset",
  border: "1px solid rgba(167,139,250,0.6)",
}

const tagChipStyle: React.CSSProperties = {
  background: "rgba(167,139,250,0.15)",
  color: "#7c3aed",
  border: "1px solid rgba(167,139,250,0.25)",
}

// ─── Mock pro account state (replace with real auth/data later) ────────────
const accountState = {
  handle: "caydon",
  name: "Caydon Cooper",
  badgeTier: "Top Pro" as "Standard" | "Verified Pro" | "Top Pro" | "Elite Pro",
}

// ─── Platform data ──────────────────────────────────────────────────────────
type Platform = {
  id: string
  name: string
  logo: string
  connected: boolean
  jobs: number
  rating: number
  verifiedAt?: string
  data?: VerifiedProfile
}

const initialPlatforms: Platform[] = [
  { id: "taskrabbit", name: "TaskRabbit", logo: "TR", connected: false, jobs: 0, rating: 0 },
  { id: "thumbtack",  name: "Thumbtack",  logo: "TT", connected: false, jobs: 0, rating: 0 },
  { id: "angi",       name: "Angi",       logo: "AG", connected: false, jobs: 0, rating: 0 },
  { id: "handy",      name: "Handy",      logo: "HD", connected: false, jobs: 0, rating: 0 },
  { id: "upwork",     name: "Upwork",     logo: "UW", connected: false, jobs: 0, rating: 0 },
  { id: "fiverr",     name: "Fiverr",     logo: "FV", connected: false, jobs: 0, rating: 0 },
]

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatJobs(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return n.toString()
}

function tierIcon(tier: string) {
  if (tier === "Elite Pro") return <Crown size={14} />
  if (tier === "Top Pro")   return <Award size={14} />
  if (tier === "Verified Pro") return <Verified size={14} />
  return <Shield size={14} />
}

// ─── Header ────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header
      className="sticky top-0 z-20 backdrop-blur-md border-b"
      style={{
        background: "linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(237,233,254,0.92) 50%, rgba(255,255,255,0.96) 100%)",
        borderColor: "rgba(167,139,250,0.25)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LevlLogo className="h-10 w-10" />
          <span
            className="hidden md:inline text-[11px] tracking-[0.18em] font-bold uppercase"
            style={{ color: "#7c3aed" }}
          >
            Pro Portal
          </span>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}>
          CC
        </div>
      </div>
    </header>
  )
}

// ─── Welcome ───────────────────────────────────────────────────────────────
function WelcomeCard() {
  return (
    <div className="relative pb-3">
      <div className="absolute bottom-0 left-[8%] right-[8%] h-4 rounded-full pointer-events-none" style={groundShadow} />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="relative p-6 md:p-8"
        style={{ ...levlCardStyle, zIndex: 1 }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.18em] font-bold uppercase mb-2" style={{ color: "#a78bfa" }}>
              Welcome back
            </p>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: "#7c3aed" }}>
              {accountState.name}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#a78bfa" }}>
              Manage your verified professional history.
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide px-3 py-1.5 rounded-full"
            style={tagChipStyle}
          >
            {tierIcon(accountState.badgeTier)}
            {accountState.badgeTier}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Verified platform card (rich detail) ─────────────────────────────────
function PlatformVerifiedCard({
  platform,
  onRefresh,
  refreshing,
}: {
  platform: Platform
  onRefresh: () => void
  refreshing: boolean
}) {
  const d = platform.data!
  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ ...levlActiveStyle, color: "#fff" }}
          >
            {platform.logo}
          </div>
          <div className="min-w-0">
            <div
              className="text-sm font-bold leading-tight truncate"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {platform.name}
            </div>
            <div className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "#a78bfa" }}>
              <ShieldCheck size={10} /> Verified · {platform.verifiedAt}
            </div>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 px-2 py-1 rounded-md transition-colors disabled:opacity-60"
          style={{ color: "#7c3aed" }}
          title={`Refresh stats from ${platform.name}`}
        >
          <RefreshCw size={10} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <MicroStat label="Jobs"    value={d.taskCount.toLocaleString()} />
        <MicroStat label="Rating"  value={`${d.ratingAverage.toFixed(1)}★`} />
        <MicroStat label="Reviews" value={d.ratingReviews.toLocaleString()} />
      </div>

      <div className="space-y-1 text-[10px]" style={{ color: "#a78bfa" }}>
        {d.metroName && (
          <div className="flex items-center gap-1.5">
            <MapPin size={10} /> {d.metroName}
            {d.taskerSince && (
              <>
                <span style={{ color: "#c4b5fd" }}>·</span>
                <Calendar size={9} /> Since {d.taskerSince}
              </>
            )}
          </div>
        )}
        {d.idVerified && (
          <div className="flex items-center gap-1.5 font-bold" style={{ color: "#7c3aed" }}>
            <ShieldCheck size={10} /> ID Verified on {platform.name}
          </div>
        )}
        {d.skills.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Award size={10} /> {d.skills.length} skills tracked
          </div>
        )}
      </div>
    </div>
  )
}

function MicroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-1.5 rounded-md" style={{ background: "rgba(167,139,250,0.10)", border: "1px solid rgba(167,139,250,0.20)" }}>
      <div className="text-sm font-black leading-none" style={{ color: "#7c3aed" }}>{value}</div>
      <div className="text-[8px] font-bold uppercase tracking-wide mt-0.5" style={{ color: "#a78bfa" }}>{label}</div>
    </div>
  )
}

// ─── Credential verification center ────────────────────────────────────────
function CredentialCenter({
  platforms,
  onVerify,
  onRefresh,
  refreshingId,
}: {
  platforms: Platform[]
  onVerify: (id: string) => void
  onRefresh: (id: string) => void
  refreshingId: string | null
}) {
  return (
    <section>
      <div className="mb-5 px-1">
        <p className="text-[11px] tracking-[0.18em] font-bold uppercase mb-2" style={{ color: "#a78bfa" }}>
          Credential Verification
        </p>
        <h2 className="text-xl md:text-2xl font-bold leading-tight" style={{ color: "#7c3aed" }}>
          Verify your professional history
        </h2>
        <p className="text-sm mt-1.5 max-w-xl" style={{ color: "#a78bfa" }}>
          Paste your public profile link from each platform — we'll pull your job count and ratings instantly. Levl never sees your password.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((p, i) => (
          <div key={p.id} className="relative pb-3">
            <div className="absolute bottom-0 left-[8%] right-[8%] h-3 rounded-full pointer-events-none" style={{ ...groundShadow, filter: "blur(4px)" }} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="relative p-4"
              style={{ ...levlCardStyle, zIndex: 1 }}
            >
              {p.connected && p.data ? (
                <PlatformVerifiedCard
                  platform={p}
                  onRefresh={() => onRefresh(p.id)}
                  refreshing={refreshingId === p.id}
                />
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ ...levlActiveStyle, color: "#fff" }}
                    >
                      {p.logo}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-sm font-bold leading-tight truncate"
                        style={{
                          background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {p.name}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: "#c4b5fd" }}>
                        Not verified yet
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onVerify(p.id)}
                    className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 px-3 py-1.5 rounded-md text-white transition-transform hover:-translate-y-0.5"
                    style={levlActiveStyle}
                  >
                    <Plus size={11} /> Verify
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Imported numbers overview ─────────────────────────────────────────────
function ImportedOverview({ platforms }: { platforms: Platform[] }) {
  const connected = platforms.filter(p => p.connected)
  const totalJobs = connected.reduce((s, p) => s + p.jobs, 0)
  const avgRating = connected.length > 0
    ? (connected.reduce((s, p) => s + p.rating, 0) / connected.length).toFixed(1)
    : "—"
  const platformCount = connected.length

  const stats = [
    { label: "Verified jobs",       value: formatJobs(totalJobs),  icon: <Briefcase size={14} /> },
    { label: "Average rating",      value: `${avgRating}★`,        icon: <Star size={14} /> },
    { label: "Platforms verified",  value: platformCount.toString(), icon: <Verified size={14} /> },
  ]

  return (
    <section>
      <h2 className="text-base font-bold mb-4 px-1" style={{ color: "#7c3aed" }}>Your imported reputation</h2>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="relative pb-3">
            <div className="absolute bottom-0 left-[10%] right-[10%] h-3 rounded-full pointer-events-none" style={{ ...groundShadow, filter: "blur(4px)" }} />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="relative p-4 text-center"
              style={{ ...levlCardStyle, zIndex: 1 }}
            >
              <div className="text-2xl font-black leading-none mb-1" style={{ color: "#7c3aed" }}>{s.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#a78bfa" }}>{s.label}</div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Quick actions ─────────────────────────────────────────────────────────
function QuickActions() {
  const actions = [
    { label: "Refresh all credentials", icon: <RefreshCw size={14} />, href: "#" },
    { label: "Preview public profile",  icon: <Eye size={14} />,       href: `/profile/${accountState.handle}` },
    { label: "Copy profile link",       icon: <Link2 size={14} />,     href: "#" },
    { label: "Help & support",          icon: <HelpCircle size={14} />, href: "#" },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((a, i) => (
        <div key={a.label} className="relative pb-3">
          <div className="absolute bottom-0 left-[8%] right-[8%] h-3 rounded-full pointer-events-none" style={{ ...groundShadow, filter: "blur(4px)" }} />
          <motion.a
            href={a.href}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            whileHover={{ y: -2 }}
            className="relative p-4 flex items-center justify-between gap-2 rounded-xl"
            style={{ ...levlActiveStyle, zIndex: 1, display: "flex" }}
          >
            <span className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="text-white/90">{a.icon}</span>
              {a.label}
            </span>
            <ArrowRight size={12} className="text-white/70" />
          </motion.a>
        </div>
      ))}
    </div>
  )
}

// ─── Page root ─────────────────────────────────────────────────────────────
export function LevlPortal() {
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms)
  const [verifyingPlatform, setVerifyingPlatform] = useState<string | null>(null)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)

  // Hydrate verified credentials from storage on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const stored = await getCredentials(accountState.handle)
      if (cancelled) return
      setPlatforms((prev) =>
        prev.map((p) => {
          const v = stored[p.id]
          if (!v) return p
          return {
            ...p,
            connected: true,
            jobs: v.taskCount,
            rating: v.ratingAverage,
            verifiedAt: new Date(v.verifiedAt).toLocaleDateString(),
            data: v,
          }
        }),
      )
    })()
    return () => { cancelled = true }
  }, [])

  function handleVerifyClick(id: string) {
    if (id === "taskrabbit") {
      setVerifyingPlatform("taskrabbit")
    }
    // other platforms get their own modals later
  }

  async function handleRefresh(id: string) {
    const target = platforms.find((p) => p.id === id)
    if (!target?.data?.profileUrl) return
    setRefreshingId(id)
    try {
      const resp = await fetch(`/api/verify/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", url: target.data.profileUrl }),
      })
      const json = await resp.json()
      if (!resp.ok || !json.profile) return
      const profile: VerifiedProfile = json.profile
      await saveCredential(accountState.handle, id, profile)
      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                connected: true,
                jobs: profile.taskCount,
                rating: profile.ratingAverage,
                verifiedAt: new Date(profile.verifiedAt).toLocaleDateString(),
                data: profile,
              }
            : p,
        ),
      )
    } finally {
      setRefreshingId(null)
    }
  }

  async function handleTaskRabbitVerified(profile: VerifiedProfile) {
    await saveCredential(accountState.handle, "taskrabbit", profile)
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === "taskrabbit"
          ? {
              ...p,
              connected: true,
              jobs: profile.taskCount,
              rating: profile.ratingAverage,
              verifiedAt: new Date(profile.verifiedAt).toLocaleDateString(),
              data: profile,
            }
          : p,
      ),
    )
    setVerifyingPlatform(null)
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(237,233,254,0.6) 0%, rgba(245,243,255,0.3) 40%, rgba(255,255,255,0.95) 80%)",
      }}
    >
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-4 md:space-y-6">
        <WelcomeCard />
        <CredentialCenter
          platforms={platforms}
          onVerify={handleVerifyClick}
          onRefresh={handleRefresh}
          refreshingId={refreshingId}
        />
        <ImportedOverview platforms={platforms} />
        <QuickActions />
      </main>

      <VerifyTaskRabbitModal
        open={verifyingPlatform === "taskrabbit"}
        onClose={() => setVerifyingPlatform(null)}
        onVerified={handleTaskRabbitVerified}
      />
    </div>
  )
}

export default LevlPortal

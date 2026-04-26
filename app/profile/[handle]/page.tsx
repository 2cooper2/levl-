"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldCheck, Briefcase, ArrowLeft, MapPin, Calendar } from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"
import { getCredentials, type CredentialMap } from "@/lib/credentials-store"
import type { VerifiedProfile, VerifiedSkill } from "@/components/portal/verify-taskrabbit-modal"

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

const activeStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,rgba(167,139,250,0.72) 0%,rgba(139,92,246,0.65) 45%,rgba(109,40,217,0.55) 100%)",
  boxShadow: "0 8px 16px -4px rgba(0,0,0,0.35), 0 4px 8px -4px rgba(0,0,0,0.2), 0 -1px 4px 0 rgba(255,255,255,0.15) inset",
  border: "1px solid rgba(167,139,250,0.6)",
}

// Aggregate skills across all verified platforms — same skill name from
// different platforms gets summed. Drop zero-job skills, sort by job count desc.
function aggregateSkills(profiles: VerifiedProfile[]): VerifiedSkill[] {
  const byName = new Map<string, VerifiedSkill>()
  for (const p of profiles) {
    for (const s of p.skills) {
      if (!s.name || s.taskCount <= 0) continue
      const existing = byName.get(s.name)
      if (existing) {
        existing.taskCount += s.taskCount
        existing.ratingReviews += s.ratingReviews
        // average ratings weighted by review count when both have ratings
        if (s.ratingAverage != null && existing.ratingAverage != null) {
          const totalReviews = existing.ratingReviews
          if (totalReviews > 0) {
            existing.ratingAverage =
              (existing.ratingAverage * (totalReviews - s.ratingReviews) +
                s.ratingAverage * s.ratingReviews) /
              totalReviews
          }
        } else if (s.ratingAverage != null) {
          existing.ratingAverage = s.ratingAverage
        }
        // keep first rate seen (rates rarely differ across platforms anyway)
      } else {
        byName.set(s.name, { ...s })
      }
    }
  }
  return Array.from(byName.values()).sort((a, b) => b.taskCount - a.taskCount)
}

export default function PublicProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params)
  const [credentials, setCredentials] = useState<CredentialMap | null>(null)

  useEffect(() => {
    getCredentials(handle).then(setCredentials)
  }, [handle])

  const profiles = credentials ? Object.values(credentials) : []
  const totalJobs = profiles.reduce((s, p) => s + p.taskCount, 0)
  const totalReviews = profiles.reduce((s, p) => s + p.ratingReviews, 0)
  const avgRating = profiles.length
    ? (profiles.reduce((s, p) => s + p.ratingAverage * p.ratingReviews, 0) /
        Math.max(totalReviews, 1)
      ).toFixed(1)
    : "—"
  const platformCount = profiles.length
  const idVerified = profiles.some((p) => p.idVerified)
  const allSkills = aggregateSkills(profiles)

  // Pull a representative profile for the hero (first verified platform)
  const hero = profiles[0] ?? null

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(237,233,254,0.6) 0%, rgba(245,243,255,0.3) 40%, rgba(255,255,255,0.95) 80%)",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 backdrop-blur-md border-b"
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(237,233,254,0.92) 50%, rgba(255,255,255,0.96) 100%)",
          borderColor: "rgba(167,139,250,0.25)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/work" className="flex items-center gap-3">
            <LevlLogo className="h-10 w-10" />
            <span className="hidden md:inline text-[11px] tracking-[0.18em] font-bold uppercase" style={{ color: "#7c3aed" }}>
              Levl
            </span>
          </Link>
          <Link
            href="/work"
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide transition-colors hover:opacity-80"
            style={{ color: "#7c3aed" }}
          >
            <ArrowLeft size={12} /> Back to portal
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-5">
        {/* Hero card — centered identity */}
        <div className="relative pb-3">
          <div className="absolute bottom-0 left-[8%] right-[8%] h-4 rounded-full pointer-events-none" style={groundShadow} />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative p-6 md:p-8 text-center"
            style={{ ...levlCardStyle, zIndex: 1 }}
          >
            <div className="flex flex-col items-center">
              {hero?.avatarUrl ? (
                <img
                  src={hero.avatarUrl}
                  alt={hero.displayName}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover"
                  style={{
                    border: "2px solid rgba(167,139,250,0.55)",
                    boxShadow: "0 8px 16px -4px rgba(76,29,149,0.25), 0 4px 8px -4px rgba(76,29,149,0.15)",
                  }}
                />
              ) : (
                <div
                  className="w-28 h-28 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-4xl font-black text-white"
                  style={activeStyle}
                >
                  {handle.charAt(0).toUpperCase()}
                </div>
              )}

              <p className="text-[11px] tracking-[0.18em] font-bold uppercase mt-5" style={{ color: "#a78bfa" }}>
                Verified pro
              </p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mt-1" style={{ color: "#7c3aed" }}>
                {hero?.displayName ?? handle}
              </h1>
              {/* Hardcoded for demo — replace with Levl user-profile fields in prod */}
              <p className="text-sm mt-2 flex items-center justify-center gap-2 flex-wrap" style={{ color: "#a78bfa" }}>
                <span className="inline-flex items-center gap-1"><MapPin size={12} /> Springfield, MO</span>
                <span style={{ color: "#c4b5fd" }}>·</span>
                <span className="inline-flex items-center gap-1"><Calendar size={11} /> Since 2018</span>
              </p>

              {idVerified && (
                <div
                  className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-[11px] font-bold"
                  style={{
                    background: "rgba(167,139,250,0.15)",
                    border: "1px solid rgba(167,139,250,0.45)",
                    color: "#7c3aed",
                  }}
                >
                  <ShieldCheck size={12} /> ID Verified
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Topline stats — 3 active-style tiles, each its own card with ground shadow */}
        {profiles.length > 0 && (
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <StatCard label="Verified jobs" value={totalJobs.toLocaleString()} delay={0} />
            <StatCard label="Avg rating"    value={`${avgRating}★`} delay={0.06} />
            <StatCard label="Reviews"       value={totalReviews.toLocaleString()} delay={0.12} />
          </div>
        )}

        {/* Skills — always visible, sorted by job count desc, zero-job skills filtered */}
        {allSkills.length > 0 && (
          <section>
            <h2 className="text-base font-bold mb-4 px-1" style={{ color: "#7c3aed" }}>
              Skills & specialties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allSkills.map((s, i) => (
                <SkillRow key={s.name} skill={s} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {profiles.length === 0 && (
          <div className="relative pb-3">
            <div className="absolute bottom-0 left-[8%] right-[8%] h-4 rounded-full pointer-events-none" style={groundShadow} />
            <div className="relative p-8 text-center" style={{ ...levlCardStyle, zIndex: 1 }}>
              <p className="text-sm" style={{ color: "#a78bfa" }}>
                No verified credentials yet for <b>@{handle}</b>.
              </p>
              <Link
                href="/work"
                className="inline-block mt-3 text-xs font-bold uppercase tracking-wide"
                style={{ color: "#7c3aed" }}
              >
                Verify a platform →
              </Link>
            </div>
          </div>
        )}

        <p className="text-[11px] text-center pt-4" style={{ color: "#c4b5fd" }}>
          Verified by{" "}
          <Link href="/work" className="font-bold" style={{ color: "#7c3aed" }}>
            Levl
          </Link>
        </p>
      </main>
    </div>
  )
}

function StatCard({ label, value, delay = 0 }: { label: string; value: string; delay?: number }) {
  return (
    <div className="relative pb-3">
      <div
        className="absolute bottom-0 left-[8%] right-[8%] h-4 rounded-full pointer-events-none"
        style={{ ...groundShadow, filter: "blur(5px)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative p-5 md:p-6 text-center rounded-xl"
        style={{ ...activeStyle, zIndex: 1 }}
      >
        <div
          className="text-3xl md:text-4xl font-black leading-none text-white"
          style={{ textShadow: "0 2px 4px rgba(76,29,149,0.35)" }}
        >
          {value}
        </div>
        <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] mt-2 text-white/80">
          {label}
        </div>
      </motion.div>
    </div>
  )
}

function SkillRow({ skill, index }: { skill: VerifiedSkill; index: number }) {
  return (
    <div className="relative pb-2">
      <div className="absolute bottom-0 left-[10%] right-[10%] h-2 rounded-full pointer-events-none" style={{ ...groundShadow, filter: "blur(3px)" }} />
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
        className="relative p-3 flex items-center justify-between gap-3"
        style={{ ...levlCardStyle, zIndex: 1 }}
      >
        <div className="min-w-0 flex items-center gap-2">
          <Briefcase size={12} className="flex-shrink-0" style={{ color: "#a78bfa" }} />
          <span
            className="text-sm font-bold truncate"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {skill.name}
          </span>
        </div>
        <div className="text-[11px] flex-shrink-0 text-right" style={{ color: "#a78bfa" }}>
          <span className="font-black" style={{ color: "#7c3aed" }}>{skill.taskCount.toLocaleString()}</span> jobs
          {skill.ratingAverage != null && (
            <span> · {skill.ratingAverage.toFixed(1)}★</span>
          )}
          {skill.rate && <span> · {skill.rate}</span>}
        </div>
      </motion.div>
    </div>
  )
}

"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Zap, Users, DollarSign, Star, Shield, Clock } from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.92) 60%, rgba(237,233,254,0.85) 100%)",
  border: "1px solid rgba(167,139,250,0.3)",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.18), 0 10px 10px -5px rgba(0,0,0,0.1), 0 -2px 6px 0 rgba(255,255,255,0.8) inset",
  borderRadius: "0.75rem",
}

const stats = [
  { label: "Active providers", value: "2,840+", icon: Users },
  { label: "Avg payout time", value: "24hrs",  icon: Clock },
  { label: "Pool earnings",   value: "$1.2M",  icon: DollarSign },
  { label: "Avg rating",      value: "4.9★",   icon: Star },
]

const tiers = [
  {
    name: "Starter",
    cut: "8%",
    perks: ["Priority matching", "Instant payouts", "Dispute protection"],
    color: "rgba(167,139,250,0.15)",
    border: "rgba(167,139,250,0.3)",
  },
  {
    name: "Pro",
    cut: "5%",
    perks: ["All Starter perks", "Premium clients only", "Dedicated support", "Bonus multipliers"],
    color: "rgba(124,58,237,0.12)",
    border: "rgba(124,58,237,0.5)",
    highlight: true,
  },
  {
    name: "Elite",
    cut: "3%",
    perks: ["All Pro perks", "Top-of-feed placement", "White-glove onboarding", "Revenue analytics"],
    color: "rgba(109,40,217,0.10)",
    border: "rgba(109,40,217,0.4)",
  },
]

export default function PoolPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #faf9ff 0%, #f0ebff 50%, #e8e0ff 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full"
        style={{
          background: "linear-gradient(135deg,rgba(255,255,255,0.08),rgba(237,233,254,0.05))",
          backdropFilter: "blur(28px) saturate(2.2)",
          WebkitBackdropFilter: "blur(28px) saturate(2.2)",
          boxShadow: "0 6px 24px -4px rgba(0,0,0,0.10)",
        }}>
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center">
            <LevlLogo className="h-14 w-14" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "#7c3aed" }}>
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-10 space-y-10">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2"
            style={{ background: "rgba(124,58,237,0.12)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.25)" }}>
            <Zap size={11} className="fill-purple-500" /> LEVL HUB
          </div>
          <h1 className="text-3xl font-black"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Earn more. Work smarter.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
            Join the Levl Hub and get matched to high-value jobs automatically.
            Lower platform fees, faster payouts, better clients.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="relative pb-4">
              <div className="absolute -bottom-1 left-[10%] right-[10%] h-4 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.38) 0%, transparent 70%)", filter: "blur(6px)" }} />
              <div className="relative p-4 rounded-xl" style={cardStyle}>
                <s.icon size={16} className="mb-2" style={{ color: "#a78bfa" }} />
                <div className="text-xl font-black"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {s.value}
                </div>
                <div className="text-[11px] font-semibold mt-0.5" style={{ color: "#a78bfa" }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tiers */}
        <div className="space-y-3">
          <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#a78bfa" }}>Pool tiers</p>
          {tiers.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
              className="relative pb-3">
              <div className="absolute -bottom-0.5 left-[10%] right-[10%] h-4 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%)", filter: "blur(5px)" }} />
              <div className="relative p-4 rounded-xl" style={{ ...cardStyle, border: `1px solid ${t.border}`, background: t.highlight
                ? "linear-gradient(135deg,rgba(124,58,237,0.08),rgba(167,139,250,0.12))"
                : cardStyle.background as string }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {t.highlight && <Shield size={13} className="fill-purple-500" style={{ color: "#7c3aed" }} />}
                    <span className="text-sm font-black" style={{ color: "#7c3aed" }}>{t.name}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: t.color, color: "#7c3aed", border: `1px solid ${t.border}` }}>
                    {t.cut} fee
                  </span>
                </div>
                <ul className="space-y-1">
                  {t.perks.map((p, j) => (
                    <li key={j} className="text-xs flex items-center gap-1.5" style={{ color: "#6b7280" }}>
                      <span style={{ color: "#a78bfa" }}>✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
          className="text-center pb-10">
          <button className="px-8 py-3 rounded-full text-sm font-black text-white transition-all active:scale-95 hover:scale-105"
            style={{
              background: "linear-gradient(135deg,rgba(109,40,217,0.92),rgba(124,58,237,0.85))",
              border: "1px solid rgba(167,139,250,0.5)",
              boxShadow: "0 8px 20px -4px rgba(109,40,217,0.45), 0 -1px 3px 0 rgba(255,255,255,0.2) inset",
            }}>
            Apply to join Hub
          </button>
          <p className="text-[10px] mt-3" style={{ color: "#c4b5fd" }}>Invite-only beta · 48hr review</p>
        </motion.div>

      </main>
    </div>
  )
}

"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function RolePage() {
  const router = useRouter()

  const choose = (role: "client" | "worker") => {
    sessionStorage.setItem("levl-session", "true")
    localStorage.setItem("levl-role", role)
    router.push(role === "worker" ? "/work" : "/")
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ overscrollBehavior: "none" }}
    >
      {/* Levl Void background */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 55% 20% at 50% 100%, rgba(255,252,248,0.38) 0%, transparent 70%),
            linear-gradient(180deg, #e6e6e6 0%, #f2f2f2 10%, #fafafa 28%, #ffffff 50%, #ffffff 100%)
          `,
        }}
      />

      {/* Floating SVG logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16 relative"
        style={{ width: 104, height: 104 }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <defs>
            {/* Main body gradient — light lavender → deep purple */}
            <linearGradient id="pg" x1="0.45" y1="0" x2="0.55" y2="1">
              <stop offset="0%" stopColor="#ddd6fe" />
              <stop offset="42%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            {/* Chart line + dots — deeper purple */}
            <linearGradient id="dg" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>

          {/* Vertical stem — wide italic parallelogram */}
          <polygon points="34,12 50,12 50,64 30,70" fill="url(#pg)" />

          {/* Sweep stripe 1 — top */}
          <polygon points="43,62 49,56 30,76 24,82" fill="url(#pg)" opacity="0.88" />

          {/* Sweep stripe 2 — mid */}
          <polygon points="37,68 43,62 24,82 18,88" fill="url(#pg)" opacity="0.76" />

          {/* Sweep stripe 3 — bottom */}
          <polygon points="31,74 37,68 18,88 13,94" fill="url(#pg)" opacity="0.62" />

          {/* Foot — diagonal bar going right */}
          <polygon points="30,70 74,80 71,87 27,79" fill="url(#pg)" />

          {/* Chart trend line */}
          <line x1="46" y1="76" x2="59" y2="64" stroke="url(#dg)" strokeWidth="1.9" strokeLinecap="round" />
          <line x1="59" y1="64" x2="74" y2="47" stroke="url(#dg)" strokeWidth="1.9" strokeLinecap="round" />

          {/* Chart dots */}
          <circle cx="46" cy="76" r="3.1" fill="url(#dg)" />
          <circle cx="59" cy="64" r="3.1" fill="url(#dg)" />
          <circle cx="74" cy="47" r="3.1" fill="url(#dg)" />
        </svg>

        {/* Floating ground shadow */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-12px",
            left: "10%",
            right: "10%",
            height: "20px",
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.30) 0%, transparent 70%)",
            filter: "blur(6px)",
          }}
        />
      </motion.div>

      {/* Role cards */}
      <div className="flex gap-10 w-full max-w-[300px]">
        {(["client", "worker"] as const).map((role, i) => (
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 + 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 relative pb-4"
          >
            {/* Ground shadow */}
            <div
              className="absolute -bottom-0 left-[10%] right-[10%] h-4 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, rgba(0,0,0,0.32) 0%, transparent 70%)",
                filter: "blur(5px)",
                zIndex: 0,
              }}
            />
            <button
              onClick={() => choose(role)}
              className="relative w-full py-7 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.97), rgba(237,233,254,0.82))",
                border: "1px solid rgba(0,0,0,0.13)",
                boxShadow: [
                  "0 10px 22px -4px rgba(0,0,0,0.38)",
                  "0 5px 10px -4px rgba(0,0,0,0.22)",
                  "0 -2px 4px 0 rgba(255,255,255,0.92) inset",
                ].join(", "),
                zIndex: 1,
              }}
            >
              <span
                className="text-lg font-black capitalize tracking-wide"
                style={{ color: "#111" }}
              >
                {role}
              </span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

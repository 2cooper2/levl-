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

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
        style={{ width: 220, height: 220, marginBottom: 48 }}
      >
        {/* Logo image */}
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/D86926DF-2501-4C99-9452-927116E45324-oXEcNS38lLlIRweavHw5KIvvgR32ot.jpeg"
          alt="LevL"
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />

        {/* Page-background overlay with darken blend:
            darken(page_color, white_jpeg) = page_color → white box disappears
            darken(page_color, purple_logo) = purple_logo → logo stays visible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 55% 20% at 50% 100%, rgba(255,252,248,0.38) 0%, transparent 70%),
              linear-gradient(180deg, #e6e6e6 0%, #f2f2f2 10%, #fafafa 28%, #ffffff 50%, #ffffff 100%)
            `,
            backgroundAttachment: "fixed",
            mixBlendMode: "darken",
          }}
        />

        {/* Floating ground shadow */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-14px",
            left: "10%",
            right: "10%",
            height: "20px",
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.26) 0%, transparent 70%)",
            filter: "blur(6px)",
          }}
        />
      </motion.div>

      {/* Role cards — lowered, more spread */}
      <div className="flex gap-12 w-full max-w-[320px]" style={{ marginTop: 32 }}>
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

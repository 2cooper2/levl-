"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LevlLogo } from "@/components/levl-logo"
import { SignupModal } from "@/components/auth/signup-modal"
import { supabase } from "@/lib/supabase-client"

const cardStyle: React.CSSProperties = {
  // White pearlescent — multi-radial soft lavender hints (no pink, no blue, no gradient deepening)
  background:
    "radial-gradient(ellipse at 25% 30%, rgba(240,235,250,0.35) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(235,230,248,0.35) 0%, transparent 55%), radial-gradient(ellipse at 60% 50%, rgba(245,240,250,0.3) 0%, transparent 60%), linear-gradient(135deg, #ffffff 0%, #fcfaff 100%)",
  border: "1px solid rgba(167,139,250,0.45)",
  boxShadow:
    "0 8px 16px -4px rgba(0,0,0,0.3), 0 4px 8px -4px rgba(0,0,0,0.18), 0 -2px 4px 0 rgba(255,255,255,0.9) inset",
  borderRadius: "0.75rem",
}

type SignupRole = "client" | "worker"
type Profile = { role: "client" | "worker" | "both"; background_check_status: string } | null

export default function Home() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalRole, setModalRole] = useState<SignupRole>("client")
  const [profile, setProfile] = useState<Profile>(null)
  const [profileChecked, setProfileChecked] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setProfileChecked(true)
      return
    }
    let cancelled = false
    ;(async () => {
      const { data: { session } } = await supabase!.auth.getSession()
      if (cancelled) return
      if (!session) {
        setProfile(null)
        setProfileChecked(true)
        return
      }
      const { data } = await supabase!
        .from("users")
        .select("role, background_check_status")
        .eq("id", session.user.id)
        .single()
      if (cancelled) return
      setProfile((data as any) ?? null)
      setProfileChecked(true)
    })()
    return () => { cancelled = true }
  }, [])

  const handlePick = (target: SignupRole) => {
    // Not signed in yet → open signup modal pre-set to that role
    if (!profile) {
      setModalRole(target)
      setModalOpen(true)
      return
    }

    // Signed in: route based on role + bg-check status
    if (target === "client") {
      // Anyone signed in can access /client
      router.push("/client")
      return
    }

    // target === 'worker'
    if (profile.role === "both") {
      router.push("/work")
      return
    }
    if (profile.role === "worker" && profile.background_check_status === "cleared") {
      router.push("/work")
      return
    }
    // Client wants worker side, OR worker without cleared check
    router.push("/auth/background-check")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6" style={{ margin: 0, background: "#ffffff" }}>
      <div className="mb-10 flex flex-col items-center gap-3">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 1.08, filter: "blur(24px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{
            filter: "drop-shadow(0 16px 32px rgba(124,58,237,0.18))",
            willChange: "transform, filter, opacity",
          }}
        >
          <LevlLogo className="h-64 w-64" />
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ borderRadius: "inherit", maskImage: "radial-gradient(circle, black 60%, transparent 80%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, delay: 1.5, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute"
              style={{
                width: "200%",
                height: "200%",
                top: "-50%",
                left: "-100%",
                background:
                  "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.55) 55%, transparent 65%)",
                filter: "blur(6px)",
              }}
              initial={{ x: "-30%" }}
              animate={{ x: "60%" }}
              transition={{ duration: 1.4, delay: 1.5, ease: [0.45, 0, 0.55, 1] }}
            />
          </motion.div>
        </motion.div>

        <motion.p
          className="text-sm font-medium"
          style={{ color: "#9E52DC" }}
          initial={{ opacity: 0, y: 8, letterSpacing: "0.15em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0em" }}
          transition={{ duration: 1.0, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          How are you using Levl today?
        </motion.p>
      </div>

      <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:max-w-2xl sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            type="button"
            onClick={() => handlePick("client")}
            disabled={!profileChecked}
            className="group relative flex w-full flex-col items-center justify-center gap-2 px-8 py-10 transition-transform hover:scale-[1.02] active:scale-[0.99]"
            style={cardStyle}
          >
            <span className="text-3xl font-bold" style={{ color: "#9E52DC" }}>
              Client
            </span>
            <span className="text-sm" style={{ color: "#C388F4" }}>
              Find a pro for the job
            </span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            type="button"
            onClick={() => handlePick("worker")}
            disabled={!profileChecked}
            className="group relative flex w-full flex-col items-center justify-center gap-2 px-8 py-10 transition-transform hover:scale-[1.02] active:scale-[0.99]"
            style={cardStyle}
          >
            <span className="text-3xl font-bold" style={{ color: "#9E52DC" }}>
              Worker
            </span>
            <span className="text-sm" style={{ color: "#C388F4" }}>
              Get matched to paying work
            </span>
          </button>
        </motion.div>
      </div>

      <SignupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialRole={modalRole}
      />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, CheckCircle, XCircle, ArrowLeft, Loader2, ExternalLink } from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"
import { supabase } from "@/lib/supabase-client"

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
  borderRadius: "1rem",
}

interface PendingWorker {
  id: string
  name: string | null
  email: string | null
  background_check_status: string
  created_at: string
}

export default function AdminBackgroundChecksPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [workers, setWorkers] = useState<PendingWorker[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"pending" | "all">("pending")

  useEffect(() => {
    if (!supabase) {
      setAuthorized(false)
      return
    }
    ;(async () => {
      const { data: { session } } = await supabase!.auth.getSession()
      if (!session) {
        router.push("/")
        return
      }
      const { data: profile } = await supabase!
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if ((profile as any)?.role !== "both") {
        setAuthorized(false)
        return
      }
      setAuthorized(true)
      await loadWorkers()
    })()
  }, [router])

  const loadWorkers = async () => {
    setLoading(true)
    const query = supabase!
      .from("users")
      .select("id, name, email, background_check_status, created_at")
      .eq("role", "worker")
      .order("created_at", { ascending: false })

    const { data } = filter === "pending"
      ? await query.eq("background_check_status", "pending")
      : await query

    setWorkers((data as any) || [])
    setLoading(false)
  }

  useEffect(() => {
    if (authorized) loadWorkers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, authorized])

  const updateStatus = async (workerId: string, newStatus: "cleared" | "rejected") => {
    setBusyId(workerId)
    const { error } = await supabase!
      .from("users")
      .update({
        background_check_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", workerId)

    if (error) {
      alert(`Update failed: ${error.message}`)
      setBusyId(null)
      return
    }

    setWorkers((prev) => prev.filter((w) => w.id !== workerId))
    setBusyId(null)
  }

  if (authorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#fff" }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: PURPLE }} />
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6" style={{ background: "#fff" }}>
        <h1 className="text-2xl font-bold" style={{ color: PURPLE_DEEP }}>
          Access denied
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#666" }}>
          This page is for the Levl master account only.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 text-sm"
          style={{ color: PURPLE_LIGHT }}
        >
          ← Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "#fff" }}>
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-4 flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
          style={{ color: PURPLE_LIGHT }}
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </button>

        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-6 w-6" style={{ color: PURPLE }} />
          <h1 className="text-3xl font-bold" style={{ color: PURPLE_DEEP }}>
            Background-check queue
          </h1>
        </div>

        <p className="mb-4 text-sm" style={{ color: "#666" }}>
          Workers who paid $40 and are awaiting your manual review. Run their check in{" "}
          <a
            href="https://dashboard.checkr.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: PURPLE, fontWeight: 600 }}
          >
            Checkr <ExternalLink className="ml-0.5 inline h-3 w-3" />
          </a>{" "}
          → click <strong>Order background check</strong> → paste the worker's email.
          When results come back, hit Approve or Reject below.
        </p>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter("pending")}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={
              filter === "pending"
                ? {
                    background:
                      "linear-gradient(135deg,rgba(167,139,250,0.85) 0%,rgba(139,92,246,0.85) 45%,rgba(109,40,217,0.85) 100%)",
                    color: "#fff",
                  }
                : { background: "rgba(124,58,237,0.06)", color: PURPLE_DEEP }
            }
          >
            Pending only
          </button>
          <button
            onClick={() => setFilter("all")}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={
              filter === "all"
                ? {
                    background:
                      "linear-gradient(135deg,rgba(167,139,250,0.85) 0%,rgba(139,92,246,0.85) 45%,rgba(109,40,217,0.85) 100%)",
                    color: "#fff",
                  }
                : { background: "rgba(124,58,237,0.06)", color: PURPLE_DEEP }
            }
          >
            All workers
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: PURPLE }} />
          </div>
        ) : workers.length === 0 ? (
          <div className="p-8 text-center" style={cardStyle}>
            <p className="text-sm" style={{ color: "#666" }}>
              {filter === "pending" ? "No pending checks. Inbox zero." : "No workers yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {workers.map((w) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-4 p-4"
                style={cardStyle}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold" style={{ color: PURPLE_DEEP }}>
                    {w.name || "(no name)"}
                  </div>
                  <div className="truncate text-sm" style={{ color: "#666" }}>
                    {w.email}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "#999" }}>
                    Signed up {new Date(w.created_at).toLocaleDateString()} • status:{" "}
                    <span
                      style={{
                        color:
                          w.background_check_status === "pending"
                            ? "#d97706"
                            : w.background_check_status === "cleared"
                              ? "#059669"
                              : w.background_check_status === "rejected"
                                ? "#dc2626"
                                : "#666",
                        fontWeight: 600,
                      }}
                    >
                      {w.background_check_status}
                    </span>
                  </div>
                </div>

                {w.background_check_status === "pending" && (
                  <div className="flex flex-shrink-0 gap-2">
                    <button
                      onClick={() => updateStatus(w.id, "rejected")}
                      disabled={busyId === w.id}
                      title="Reject"
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{
                        background: "rgba(220,38,38,0.1)",
                        color: "#dc2626",
                        opacity: busyId === w.id ? 0.5 : 1,
                      }}
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => updateStatus(w.id, "cleared")}
                      disabled={busyId === w.id}
                      title="Approve"
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{
                        background: "rgba(5,150,105,0.12)",
                        color: "#059669",
                        opacity: busyId === w.id ? 0.5 : 1,
                      }}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

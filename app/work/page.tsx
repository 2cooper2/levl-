"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  DollarSign, Star, Shield, Zap, Clock,
  CheckCircle, ArrowRight, Hammer, Paintbrush, Wrench,
  Truck, Leaf, Scissors, ChevronDown, ChevronUp,
  ThumbsUp, Eye, BookOpen, Users, Calendar, Plus, X,
} from "lucide-react"
import Link from "next/link"
import { createPortal } from "react-dom"
import { EnhancedCategoryCard } from "@/components/enhanced-category-card"
import { LevlLogo } from "@/components/levl-logo"
import { Button } from "@/components/ui/button"

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.92) 60%, rgba(237,233,254,0.85) 100%)",
  border: "1px solid rgba(167,139,250,0.3)",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.18), 0 10px 10px -5px rgba(0,0,0,0.1), 0 -2px 6px 0 rgba(255,255,255,0.8) inset",
  borderRadius: "0.75rem",
}

// ─── Forum preview ────────────────────────────────────────────────────────────
const forumPosts = [
  { author: "HandyPro", rating: 5, reviews: 1187, title: "Landed a $1,200 bathroom reno through Levl — easiest booking I've ever done", likes: 84, views: 412, tag: "Success Story" },
  { author: "PipeWizard", rating: 5, reviews: 1467, title: "AI matched me with a client whose budget was 40% higher than what I usually charge", likes: 63, views: 318, tag: "Earnings" },
  { author: "EdgeMaster", rating: 5, reviews: 1329, title: "How I went from 3 jobs a week to 9 in my first month on the platform", likes: 97, views: 541, tag: "Growth" },
]

function ForumPreview() {
  return (
    <div className="space-y-3">
      {forumPosts.map((post, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.45 }}
          className="p-4 cursor-pointer hover:scale-[1.01] transition-transform"
          style={cardStyle}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(167,139,250,0.15)", color: "#7c3aed", border: "1px solid rgba(167,139,250,0.25)" }}>
                  {post.tag}
                </span>
              </div>
              <p className="text-sm font-semibold leading-snug mb-2" style={{ color: "#8b5cf6" }}>{post.title}</p>
              <div className="flex items-center gap-3 text-xs" style={{ color: "#c4b5fd" }}>
                <span className="font-medium" style={{ color: "#a78bfa" }}>{post.author}</span>
                <span className="flex items-center gap-0.5">
                  {[...Array(post.rating)].map((_, j) => <Star key={j} size={10} className="fill-yellow-400 text-yellow-400" />)}
                </span>
                <span>{post.reviews.toLocaleString()} reviews</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 text-xs shrink-0" style={{ color: "#c4b5fd" }}>
              <span className="flex items-center gap-1"><ThumbsUp size={11} /> {post.likes}</span>
              <span className="flex items-center gap-1"><Eye size={11} /> {post.views}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Provider stats ──────────────────────────────────────────────────────────
function ProviderStats() {
  const stats = [
    { label: "Avg job value",  value: "$112", sub: "+$8 vs last mo."  },
    { label: "On-time rate",   value: "100%", sub: "Perfect streak"   },
    { label: "Response rate",  value: "97%",  sub: "Top 5% of pros"   },
    { label: "Repeat clients", value: "68%",  sub: "Avg 41% industry" },
  ]
  return (
    <div>
      <p className="text-[10px] font-black tracking-widest uppercase text-purple-500 mb-2.5">Your performance</p>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.25 }}
            className="relative pb-4">
            {/* Ground shadow */}
            <div className="absolute -bottom-1 left-[10%] right-[10%] h-5 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 70%)",
                filter: "blur(6px)",
                zIndex: 0,
              }} />
            <div className="relative p-3 rounded-xl"
              style={{
                background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.82))",
                border: "1px solid rgba(167,139,250,0.45)",
                boxShadow: "0 10px 20px -6px rgba(0,0,0,0.35), 0 4px 8px -4px rgba(0,0,0,0.2), 0 -2px 5px 0 rgba(255,255,255,0.9) inset",
                zIndex: 1,
              }}>
              <div className="text-xl font-black leading-none mb-1"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {s.value}
              </div>
              <div className="text-[10px] font-bold" style={{ color: "#a78bfa" }}>{s.label}</div>
              <div className="text-[9px] font-semibold mt-0.5" style={{ color: "#a855f7" }}>{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Monthly Calendar ─────────────────────────────────────────────────────────
type CalJob = { date: number; month: number; time: string; title: string; client: string; pay: string; status: "confirmed" | "pending" }

const JOB_DATA: CalJob[] = [
  // Apr 1 — 2 jobs
  { date:  1, month: 3, time: "9:00am",  title: "Bathroom faucet replace",  client: "Greg H.",   pay: "$115", status: "confirmed" },
  { date:  1, month: 3, time: "1:00pm",  title: "TV wall mount — 55″",      client: "Wendy S.",  pay: "$100", status: "confirmed" },
  // Apr 2 — 3 jobs
  { date:  2, month: 3, time: "8:00am",  title: "Deep clean — 3BR",         client: "Carlos M.", pay: "$160", status: "confirmed" },
  { date:  2, month: 3, time: "12:00pm", title: "Furniture assembly × 2",   client: "Tina L.",   pay: "$110", status: "confirmed" },
  { date:  2, month: 3, time: "3:30pm",  title: "Smart lock install",       client: "Paul R.",   pay: "$80",  status: "pending"   },
  // Apr 3 — 1 job
  { date:  3, month: 3, time: "10:00am", title: "Ceiling fan install",      client: "Yuki T.",   pay: "$130", status: "confirmed" },
  // Apr 4 — 4 jobs
  { date:  4, month: 3, time: "8:00am",  title: "Move assist — 2BR",        client: "Aisha K.",  pay: "$220", status: "confirmed" },
  { date:  4, month: 3, time: "11:30am", title: "IKEA bed frame assembly",  client: "Noel B.",   pay: "$90",  status: "confirmed" },
  { date:  4, month: 3, time: "2:00pm",  title: "Shelf install × 4",        client: "Rosa P.",   pay: "$75",  status: "pending"   },
  { date:  4, month: 3, time: "4:30pm",  title: "Curtain rod install",      client: "Jake W.",   pay: "$55",  status: "confirmed" },
  // Apr 6 — 3 jobs
  { date:  6, month: 3, time: "9:00am",  title: "Drywall patch",            client: "Mel C.",    pay: "$95",  status: "confirmed" },
  { date:  6, month: 3, time: "12:00pm", title: "Exterior light install",   client: "Pam O.",    pay: "$85",  status: "confirmed" },
  { date:  6, month: 3, time: "3:00pm",  title: "Garbage disposal replace", client: "Ian D.",    pay: "$140", status: "pending"   },
  // Apr 7 — 2 jobs
  { date:  7, month: 3, time: "10:00am", title: "Picture hanging × 6",      client: "Lara F.",   pay: "$65",  status: "confirmed" },
  { date:  7, month: 3, time: "2:00pm",  title: "Door hinge repair × 3",   client: "Sam V.",    pay: "$70",  status: "confirmed" },
  // Apr 14 — 4 jobs
  { date: 14, month: 3, time: "8:00am",  title: "TV wall mount — 65″",      client: "James R.",  pay: "$120", status: "confirmed" },
  { date: 14, month: 3, time: "11:00am", title: "Shelf install × 3",        client: "Amy T.",    pay: "$80",  status: "confirmed" },
  { date: 14, month: 3, time: "2:00pm",  title: "Picture hanging × 8",      client: "Julia K.",  pay: "$60",  status: "confirmed" },
  { date: 14, month: 3, time: "4:30pm",  title: "Curtain rod install",      client: "Ben M.",    pay: "$55",  status: "pending"   },
  // Apr 15 — 2 jobs
  { date: 15, month: 3, time: "10:00am", title: "IKEA PAX assembly",        client: "Sara M.",   pay: "$95",  status: "confirmed" },
  { date: 15, month: 3, time: "2:00pm",  title: "Floating shelves",         client: "Derek L.",  pay: "$65",  status: "pending"   },
  // Apr 17 — 3 jobs
  { date: 17, month: 3, time: "9:00am",  title: "Drywall patch & paint",    client: "Nina K.",   pay: "$140", status: "confirmed" },
  { date: 17, month: 3, time: "1:00pm",  title: "Furniture assembly",       client: "Leo B.",    pay: "$90",  status: "pending"   },
  { date: 17, month: 3, time: "3:30pm",  title: "Baby gate install",        client: "Carla D.",  pay: "$70",  status: "confirmed" },
  // Apr 18 — 1 job
  { date: 18, month: 3, time: "11:00am", title: "Light fixture swap",       client: "Tom B.",    pay: "$75",  status: "confirmed" },
  // Apr 21 — 4 jobs
  { date: 21, month: 3, time: "8:00am",  title: "Deep clean — 2BR",         client: "Priya S.",  pay: "$110", status: "confirmed" },
  { date: 21, month: 3, time: "11:00am", title: "Appliance hookup — dryer", client: "Owen C.",   pay: "$85",  status: "confirmed" },
  { date: 21, month: 3, time: "1:30pm",  title: "Door lock replacement",    client: "Hana R.",   pay: "$65",  status: "confirmed" },
  { date: 21, month: 3, time: "4:00pm",  title: "Ceiling fan install",      client: "Marco T.",  pay: "$120", status: "pending"   },
  // Apr 22 — 1 job
  { date: 22, month: 3, time: "2:00pm",  title: "Bathroom caulk & grout",  client: "Mia W.",    pay: "$130", status: "confirmed" },
  // Apr 24 — 1 job
  { date: 24, month: 3, time: "10:00am", title: "Deck staining",            client: "Chris P.",  pay: "$160", status: "pending"   },
  // Apr 26 — 3 jobs
  { date: 26, month: 3, time: "9:00am",  title: "Move assist — 1BR",        client: "Fiona D.",  pay: "$200", status: "confirmed" },
  { date: 26, month: 3, time: "1:00pm",  title: "TV mount — bedroom",       client: "Raj S.",    pay: "$95",  status: "confirmed" },
  { date: 26, month: 3, time: "3:30pm",  title: "Shelf assembly × 2",       client: "Lily H.",   pay: "$70",  status: "pending"   },
  // Apr 28 — 2 jobs
  { date: 28, month: 3, time: "8:00am",  title: "Exterior light install",   client: "Ryan K.",   pay: "$85",  status: "confirmed" },
  { date: 28, month: 3, time: "11:00am", title: "Smart thermostat install", client: "Diane P.",  pay: "$90",  status: "confirmed" },
  // May
  { date:  5, month: 4, time: "10:00am", title: "TV mount — living room",   client: "Dana S.",   pay: "$110", status: "pending"   },
  { date:  9, month: 4, time: "9:00am",  title: "Full clean — 3BR house",   client: "Emma L.",   pay: "$175", status: "confirmed" },
  { date: 12, month: 4, time: "1:00pm",  title: "Fence panel repair",       client: "Mark T.",   pay: "$95",  status: "confirmed" },
]

const WEEKDAYS = ["S","M","T","W","T","F","S"]
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"]

function AvailabilityPreview() {
  const today = new Date(2026, 3, 14)   // Apr 14 2026
  const [viewYear,  setViewYear]  = useState(2026)
  const [viewMonth, setViewMonth] = useState(3)          // 0-indexed (3 = April)
  const [selectedDate, setSelectedDate] = useState<number | null>(14)

  const [showAvailModal, setShowAvailModal] = useState(false)
  const [availForm, setAvailForm] = useState({ date: "", startTime: "8:00am", endTime: "5:00pm", repeat: "once", note: "" })
  const [savedAvail, setSavedAvail] = useState<{day:number,month:number,year:number,startTime:string,endTime:string,repeat:string,note:string}[]>([])

  const TIME_SLOTS = ["6:00am","7:00am","8:00am","9:00am","10:00am","11:00am","12:00pm","1:00pm","2:00pm","3:00pm","4:00pm","5:00pm","6:00pm","7:00pm","8:00pm"]

  const firstDow  = new Date(viewYear, viewMonth, 1).getDay()   // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1) } else setViewMonth(m => m-1); setSelectedDate(null) }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1) } else setViewMonth(m => m+1); setSelectedDate(null) }

  const jobsOnDay = (d: number) => JOB_DATA.filter(j => j.date === d && j.month === viewMonth)
  const selectedJobs = selectedDate ? jobsOnDay(selectedDate) : []

  const confirmed = JOB_DATA.filter(j => j.month === viewMonth && j.status === "confirmed").reduce((s, j) => s + parseInt(j.pay.replace("$","")), 0)
  const pending   = JOB_DATA.filter(j => j.month === viewMonth && j.status === "pending").reduce((s, j) => s + parseInt(j.pay.replace("$","")), 0)

  return (
    <div className="p-5 md:p-6 h-full flex flex-col w-full" style={{ ...cardStyle, boxSizing: "border-box", maxWidth: "100%" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-bold" style={{ color: "#111" }}>Your Schedule</span>
        </div>
        <div className="relative pb-2">
          <div className="absolute -bottom-0 left-[10%] right-[10%] h-3 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center,rgba(0,0,0,0.38) 0%,transparent 70%)", filter: "blur(4px)" }} />
          <button onClick={() => { setAvailForm({ date: "", startTime: "8:00am", endTime: "5:00pm", repeat: "once", note: "" }); setShowAvailModal(true) }}
            className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              background: "linear-gradient(135deg,rgba(167,139,250,0.72) 0%,rgba(139,92,246,0.65) 45%,rgba(109,40,217,0.55) 100%)",
              boxShadow: "0 6px 14px -4px rgba(0,0,0,0.35), 0 3px 6px -3px rgba(0,0,0,0.2), 0 -1px 0 rgba(255,255,255,0.25) inset",
              border: "1px solid rgba(167,139,250,0.5)",
              color: "#fff",
            }}>
            <span className="relative w-full h-full">
              <span className="absolute text-[11px] font-black" style={{ top: "14%", left: "22%" }}>+</span>
              <div className="absolute opacity-90" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(30deg)", width: "1.5px", height: "17px", background: "#fff", borderRadius: "1px" }} />
              <span className="absolute text-[11px] font-black" style={{ bottom: "14%", right: "22%" }}>−</span>
            </span>
          </button>
        </div>
      </div>

      {/* ── Add Availability Modal ── */}
      {showAvailModal && createPortal(
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowAvailModal(false) }}>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25, ease: [0.22,1,0.36,1] }}
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.82))",
              border: "1px solid rgba(167,139,250,0.45)",
              boxShadow: "0 24px 48px -8px rgba(0,0,0,0.4), 0 12px 20px -6px rgba(0,0,0,0.25), 0 -2px 6px 0 rgba(255,255,255,0.9) inset",
            }}>

            {/* Purple gradient header bar */}
            <div className="px-6 pt-5 pb-4"
              style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.72) 0%,rgba(139,92,246,0.65) 45%,rgba(109,40,217,0.55) 100%)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black tracking-widest uppercase text-purple-200 mb-0.5">Schedule</p>
                  <h3 className="text-lg font-black text-white">Add availability</h3>
                </div>
                <button onClick={() => setShowAvailModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(4px)" }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="px-6 pt-5 pb-6">
              {/* Input style shared */}
              {(() => {
                const inputStyle: React.CSSProperties = {
                  background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.7))",
                  border: "1px solid rgba(167,139,250,0.35)",
                  boxShadow: "0 4px 10px -3px rgba(0,0,0,0.18), 0 2px 4px -2px rgba(0,0,0,0.1), 0 -1px 3px 0 rgba(255,255,255,0.9) inset",
                  color: "#111", borderRadius: "0.75rem", width: "100%",
                  padding: "0.625rem 0.875rem", fontSize: "0.875rem", fontWeight: 600, outline: "none",
                }
                return (
                  <>
                    {/* Free days for current month */}
                    {(() => {
                      const busyDays = new Set(JOB_DATA.filter(j => j.month === viewMonth).map(j => j.date))
                      const daysInMo = new Date(viewYear, viewMonth + 1, 0).getDate()
                      const freeDays = Array.from({ length: daysInMo }, (_, i) => i + 1).filter(d => !busyDays.has(d))
                      const selectedDay = availForm.date ? parseInt(availForm.date) : null
                      return (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#a855f7" }}>Free days</label>
                            <span className="text-[9px] font-bold" style={{ color: "#c4b5fd" }}>{MONTHS[viewMonth]} {viewYear}</span>
                          </div>
                          <div className="grid grid-cols-7 gap-1.5">
                            {freeDays.map(d => {
                              const isSel = selectedDay === d
                              return (
                                <div key={d} className="relative pb-1.5">
                                  {isSel && (
                                    <div className="absolute -bottom-0 left-[10%] right-[10%] h-2.5 rounded-full pointer-events-none"
                                      style={{ background: "radial-gradient(ellipse at center,rgba(0,0,0,0.32) 0%,transparent 70%)", filter: "blur(3px)" }} />
                                  )}
                                  <button key={d} onClick={() => setAvailForm(f => ({ ...f, date: isSel ? "" : String(d) }))}
                                    className="relative w-full aspect-square rounded-lg text-xs font-black transition-all hover:scale-105"
                                    style={isSel ? {
                                      background: "linear-gradient(135deg,rgba(167,139,250,0.72) 0%,rgba(139,92,246,0.65) 45%,rgba(109,40,217,0.55) 100%)",
                                      color: "#fff",
                                      boxShadow: "0 6px 12px -4px rgba(0,0,0,0.3), 0 -1px 0 rgba(255,255,255,0.2) inset",
                                      border: "1px solid rgba(167,139,250,0.5)",
                                    } : {
                                      background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.8))",
                                      color: "#7c3aed",
                                      boxShadow: "0 4px 8px -3px rgba(0,0,0,0.2), 0 -1px 2px 0 rgba(255,255,255,0.9) inset",
                                      border: "1px solid rgba(167,139,250,0.35)",
                                    }}>
                                    {d}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Time range */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {(["startTime","endTime"] as const).map((key, i) => (
                        <div key={key}>
                          <label className="text-[10px] font-black tracking-widest uppercase block mb-1.5" style={{ color: "#a855f7" }}>
                            {i === 0 ? "Start" : "End"}
                          </label>
                          <select value={availForm[key]} onChange={e => setAvailForm(f => ({ ...f, [key]: e.target.value }))}
                            style={{ ...inputStyle, appearance: "none" as any }}>
                            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>

                    {/* Repeat */}
                    <div className="mb-4">
                      <label className="text-[10px] font-black tracking-widest uppercase block mb-1.5" style={{ color: "#a855f7" }}>Repeat</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[["once","One time"],["weekly","Weekly"],["biweekly","Biweekly"]].map(([val, label]) => (
                          <div key={val} className="relative pb-2">
                            {availForm.repeat === val && (
                              <div className="absolute -bottom-0 left-[10%] right-[10%] h-3 rounded-full pointer-events-none"
                                style={{ background: "radial-gradient(ellipse at center,rgba(0,0,0,0.35) 0%,transparent 70%)", filter: "blur(4px)" }} />
                            )}
                            <button onClick={() => setAvailForm(f => ({ ...f, repeat: val }))}
                              className="relative w-full py-2 rounded-xl text-xs font-black transition-all hover:scale-[1.02]"
                              style={availForm.repeat === val ? {
                                background: "linear-gradient(135deg,rgba(167,139,250,0.72),rgba(109,40,217,0.55))",
                                color: "#fff",
                                boxShadow: "0 6px 14px -4px rgba(0,0,0,0.3), 0 2px 6px -2px rgba(0,0,0,0.15), 0 -1px 0 rgba(255,255,255,0.2) inset",
                                border: "1px solid rgba(167,139,250,0.5)",
                              } : {
                                background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.7))",
                                color: "#a855f7",
                                boxShadow: "0 4px 8px -3px rgba(0,0,0,0.15), 0 -1px 3px 0 rgba(255,255,255,0.9) inset",
                                border: "1px solid rgba(167,139,250,0.3)",
                              }}>
                              {label}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Note */}
                    <div className="mb-5">
                      <label className="text-[10px] font-black tracking-widest uppercase block mb-1.5" style={{ color: "#a855f7" }}>
                        Note <span style={{ color: "#c4b5fd", fontWeight: 400 }}>(optional)</span>
                      </label>
                      <input type="text" placeholder="e.g. mornings only, no heavy lifting…" value={availForm.note}
                        onChange={e => setAvailForm(f => ({ ...f, note: e.target.value }))} style={inputStyle} />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button onClick={() => setShowAvailModal(false)}
                        className="flex-1 py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.01]"
                        style={{
                          background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.7))",
                          color: "#a855f7", border: "1px solid rgba(167,139,250,0.35)",
                          boxShadow: "0 4px 10px -3px rgba(0,0,0,0.15), 0 -1px 3px 0 rgba(255,255,255,0.9) inset",
                        }}>
                        Cancel
                      </button>
                      <div className="flex-1 relative pb-1">
                        <div className="absolute -bottom-0 left-[8%] right-[8%] h-3 rounded-full pointer-events-none"
                          style={{ background: "radial-gradient(ellipse at center,rgba(0,0,0,0.35) 0%,transparent 70%)", filter: "blur(4px)" }} />
                        <button onClick={() => { if (availForm.date) { setSavedAvail(a => [...a, { day: parseInt(availForm.date), month: viewMonth, year: viewYear, startTime: availForm.startTime, endTime: availForm.endTime, repeat: availForm.repeat, note: availForm.note }]); setShowAvailModal(false) } }}
                          className="relative w-full py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-95"
                          style={{
                            background: "linear-gradient(135deg,rgba(167,139,250,0.72) 0%,rgba(139,92,246,0.65) 45%,rgba(109,40,217,0.55) 100%)",
                            boxShadow: "0 8px 16px -4px rgba(0,0,0,0.3), 0 -1px 0 rgba(255,255,255,0.2) inset",
                            border: "1px solid rgba(167,139,250,0.5)",
                          }}>
                          Save availability
                        </button>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{ border: "1px solid rgba(167,139,250,0.25)", color: "#a855f7" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(124,58,237,0.08)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <ChevronDown size={13} className="rotate-90" />
        </button>
        <span className="font-black text-sm tracking-wide" style={{ color: "#111" }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{ border: "1px solid rgba(167,139,250,0.25)", color: "#a855f7" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(124,58,237,0.08)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <ChevronDown size={13} className="-rotate-90" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-black py-1" style={{ color: "#111" }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const jobs     = jobsOnDay(d)
          const hasConf  = jobs.some(j => j.status === "confirmed")
          const hasPend  = jobs.some(j => j.status === "pending")
          const isToday  = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
          const isSel    = d === selectedDate
          const hasJobs  = jobs.length > 0
          const isAvail  = savedAvail.some(a => a.day === d && a.month === viewMonth && a.year === viewYear)
          return (
            <button key={d} onClick={() => setSelectedDate(isSel ? null : d)}
              className="flex flex-col items-center justify-center rounded-lg transition-all relative"
              style={{
                aspectRatio: "1",
                ...(isSel ? {
                  background: "linear-gradient(135deg,rgba(167,139,250,0.72) 0%,rgba(139,92,246,0.65) 45%,rgba(109,40,217,0.55) 100%)",
                  boxShadow: "0 8px 16px -4px rgba(0,0,0,0.35), 0 4px 8px -4px rgba(0,0,0,0.2), 0 -1px 4px 0 rgba(255,255,255,0.15) inset",
                  border: "1px solid rgba(167,139,250,0.6)",
                  transform: "translateY(-2px)",
                } : hasJobs ? {
                  background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.8))",
                  boxShadow: "0 4px 10px -3px rgba(0,0,0,0.25), 0 2px 4px -2px rgba(0,0,0,0.15), 0 -1px 3px 0 rgba(255,255,255,0.9) inset",
                  border: "1px solid rgba(167,139,250,0.4)",
                } : isAvail ? {
                  background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.8))",
                  boxShadow: "0 4px 10px -3px rgba(0,0,0,0.25), 0 2px 4px -2px rgba(0,0,0,0.15), 0 -1px 3px 0 rgba(255,255,255,0.9) inset",
                  border: "1px solid rgba(167,139,250,0.4)",
                } : isToday ? {
                  background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.8))",
                  boxShadow: "0 4px 10px -3px rgba(0,0,0,0.25), 0 -1px 3px 0 rgba(255,255,255,0.9) inset",
                  border: "1px solid rgba(124,58,237,0.5)",
                } : {
                  background: "linear-gradient(135deg,rgba(255,255,255,0.6),rgba(237,233,254,0.3))",
                  boxShadow: "0 2px 6px -2px rgba(0,0,0,0.12), 0 -1px 2px 0 rgba(255,255,255,0.7) inset",
                  border: "1px solid rgba(167,139,250,0.15)",
                }),
              }}>
              <span className="text-xs font-bold leading-none"
                style={isSel ? { color: "#fff" }
                  : isToday  ? { color: "#7c3aed" }
                  : (hasJobs || isAvail) ? { color: "#111" }
                  : { color: "#c4b5fd" }}>
                {d}
              </span>
              {hasJobs && (
                <div className="grid grid-cols-2 gap-0.5 mt-0.5">
                  {jobs.slice(0, 4).map((j, di) => (
                    <div key={di} className="w-1 h-1 rounded-full"
                      style={{ background: isSel
                        ? (j.status === "confirmed" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)")
                        : (j.status === "confirmed" ? "#7c3aed" : "#c4b5fd") }} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Monthly earnings goal ── */}
      {(() => {
        const GOAL = 6000
        const total    = confirmed + pending
        const confPct  = parseFloat(Math.min(100, (confirmed / GOAL) * 100).toFixed(1))
        const totalPct = Math.min(100, Math.round((total     / GOAL) * 100))
        const jobCount = JOB_DATA.filter(j => j.month === viewMonth).length
        const toGoal   = Math.max(0, GOAL - confirmed)
        return (
          <div className="mt-4 pb-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.2)" }}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black" style={{ color: "#111" }}>Monthly goal</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black" style={{ color: "#111" }}>${confirmed.toLocaleString()}</span>
                <span className="text-xs font-semibold" style={{ color: "#111" }}>/ ${GOAL.toLocaleString()}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 rounded-full mb-3"
              style={{
                background: "rgba(167,139,250,0.18)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.14) inset, 0 1px 0 rgba(255,255,255,0.8)",
                border: "1px solid rgba(167,139,250,0.22)",
              }}>
              <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{
                  width: `${confPct}%`,
                  background: "linear-gradient(180deg,rgba(255,255,255,0.55) 0%,#c4b5fd 25%,#a78bfa 60%,#8b5cf6 100%)",
                  boxShadow: "0 4px 14px rgba(167,139,250,0.5), 0 2px 4px rgba(0,0,0,0.12), 0 -1px 0 rgba(255,255,255,0.7) inset, 0 1px 0 rgba(109,40,217,0.15) inset",
                }} />
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[10px] font-black" style={{ color: "#a78bfa" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#a78bfa" }} />
                  {confPct}% complete
                </span>
                {pending > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: "#111" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#c4b5fd" }} />
                    +${pending} pending
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold" style={{ color: "#111" }}>{jobCount} jobs · ${toGoal.toLocaleString()} to go</span>
            </div>
          </div>
        )
      })()}

      {/* Daily + Weekly metrics */}
      <div className="flex-1 mt-4 flex flex-col w-full min-w-0">
        {(() => {
          const d = selectedDate ?? today.getDate()

          // ── Day data ──
          const dayJobs        = JOB_DATA.filter(j => j.date === d && j.month === viewMonth)
          const dayConf        = dayJobs.filter(j => j.status === "confirmed")
          const dayPend        = dayJobs.filter(j => j.status === "pending")
          const dayEarnConf    = dayConf.reduce((s, j) => s + parseInt(j.pay.replace("$","")), 0)
          const dayEarnPend    = dayPend.reduce((s, j) => s + parseInt(j.pay.replace("$","")), 0)

          // ── Week data ──
          const dow            = new Date(viewYear, viewMonth, d).getDay()
          const weekStart      = d - dow
          const weekEnd        = weekStart + 6
          const weekJobs       = JOB_DATA.filter(j => j.date >= weekStart && j.date <= weekEnd && j.month === viewMonth)
          const weekConf       = weekJobs.filter(j => j.status === "confirmed")
          const weekPend       = weekJobs.filter(j => j.status === "pending")
          const weekEarn       = weekConf.reduce((s, j) => s + parseInt(j.pay.replace("$","")), 0)
          const weekPendEarn   = weekPend.reduce((s, j) => s + parseInt(j.pay.replace("$","")), 0)
          const weekDaysActive = new Set(weekJobs.map(j => j.date)).size

          // ── Month averages ──
          const monthJobs      = JOB_DATA.filter(j => j.month === viewMonth)
          const monthDaysActive= new Set(monthJobs.map(j => j.date)).size
          const avgDayEarn     = monthDaysActive > 0 ? Math.round(confirmed / monthDaysActive) : 0
          const weeksElapsed   = Math.max(1, Math.ceil(d / 7))
          const avgWeekEarn    = Math.round(confirmed / weeksElapsed)
          const allJobVals     = monthJobs.map(j => parseInt(j.pay.replace("$","")))
          const avgJobVal      = allJobVals.length > 0 ? Math.round(allJobVals.reduce((a,b) => a+b,0) / allJobVals.length) : 0

          // ── Avg time per job (estimated from job type — typical handyman durations) ──
          const timeMap: Record<string,number> = { "mount":1.5,"install":1.5,"assembly":2,"clean":3,"move":4,"patch":2,"stain":4,"repair":1.5,"hang":1,"replace":1.5,"hook":1,"swap":1,"caulk":1.5 }
          const avgHrs = (() => {
            const hrs = monthJobs.map(j => {
              const key = Object.keys(timeMap).find(k => j.title.toLowerCase().includes(k))
              return key ? timeMap[key] : 1.5
            })
            return hrs.length > 0 ? (hrs.reduce((a,b) => a+b,0) / hrs.length).toFixed(1) : "1.5"
          })()
          const totalHrsMo = Math.round(parseFloat(avgHrs) * monthJobs.length)

          // ── Avg expenses (materials ~15% of job value, platform fee ~8%) ──
          const expensePct     = 0.15
          const platformPct    = 0.08
          const avgExpPerJob   = Math.round(avgJobVal * expensePct)
          const avgPlatformFee = Math.round(avgJobVal * platformPct)
          const avgNetPerJob   = avgJobVal - avgExpPerJob - avgPlatformFee
          const monthExpenses  = Math.round(confirmed * expensePct)
          const netMarginPct   = avgJobVal > 0 ? Math.round((avgNetPerJob / avgJobVal) * 100) : 0

          // ── Month pace ──
          const daysInMo       = new Date(viewYear, viewMonth + 1, 0).getDate()
          const daysRemaining  = daysInMo - d
          const dailyRate      = d > 0 ? confirmed / d : 0
          const projected      = Math.round(confirmed + (dailyRate * daysRemaining))
          const projectedPct   = Math.min(100, Math.round((projected / 6000) * 100))
          const onTrack        = projected >= 6000
          const neededPerDay   = daysRemaining > 0 ? Math.round((6000 - confirmed) / daysRemaining) : 0

          const statCard = (content: React.ReactNode, delay = 0) => (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.2 }}
              className="relative pb-4 min-w-0">
              <div className="absolute -bottom-1 left-[10%] right-[10%] h-4 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center,rgba(0,0,0,0.38) 0%,transparent 70%)", filter: "blur(6px)", zIndex: 0 }} />
              <div className="relative p-3 rounded-xl overflow-hidden" style={{
                background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.82))",
                border: "1px solid rgba(167,139,250,0.45)",
                boxShadow: "0 10px 20px -6px rgba(0,0,0,0.35), 0 4px 8px -4px rgba(0,0,0,0.2), 0 -2px 5px 0 rgba(255,255,255,0.9) inset",
                zIndex: 1,
              }}>{content}</div>
            </motion.div>
          )

          const gradText: React.CSSProperties = { background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }
          const miniBar = (pct: number, color = "linear-gradient(90deg,#c4b5fd,#8b5cf6)") => (
            <div className="mt-2 h-1.5 rounded-full w-full" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.18)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
            </div>
          )
          const row = (l: string, r: string, rCol?: string) => (
            <div className="flex justify-between gap-1 mt-1.5 min-w-0">
              <span className="text-[8px] font-bold truncate" style={{ color: "#111" }}>{l}</span>
              <span className="text-[8px] font-bold shrink-0" style={{ color: rCol ?? "#111" }}>{r}</span>
            </div>
          )

          return (
            <motion.div key={d} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="w-full min-w-0">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#111" }}>{MONTHS[viewMonth]} {d}</p>
                <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#111" }}>Week {Math.ceil(d / 7)} of 4</p>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full min-w-0">

                {/* Card 1 — Avg Day Earnings */}
                {statCard(<>
                  <div className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: "#111" }}>Avg Day Earnings</div>
                  <div className="text-xl font-black leading-none" style={gradText}>${avgDayEarn.toLocaleString()}</div>
                  <div className="text-[9px] font-semibold mt-0.5" style={{ color: "#111" }}>
                    {dayEarnConf > 0 ? `$${dayEarnConf} today` : "No earnings today"}
                    {dayEarnPend > 0 ? ` · +$${dayEarnPend} pend.` : ""}
                  </div>
                  {row(`${monthDaysActive} active days`, `$${avgJobVal} avg/job`)}
                </>, 0)}

                {/* Card 2 — Avg Week Earnings */}
                {statCard(<>
                  <div className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: "#111" }}>Avg Week Earnings</div>
                  <div className="text-xl font-black leading-none" style={gradText}>${avgWeekEarn.toLocaleString()}</div>
                  <div className="text-[9px] font-semibold mt-0.5" style={{ color: "#111" }}>
                    ${weekEarn.toLocaleString()} this week
                    {weekPendEarn > 0 ? ` · +$${weekPendEarn} pend.` : ""}
                  </div>
                  {row(`${weekDaysActive} active days`, `${weekJobs.length} jobs`)}
                </>, 0.05)}

                {/* Card 3 — Avg Time Per Job */}
                {statCard(<>
                  <div className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: "#111" }}>Avg Time / Job</div>
                  <div className="text-xl font-black leading-none" style={gradText}>{avgHrs}<span className="text-sm font-bold ml-0.5" style={{ ...gradText }}>hrs</span></div>
                  <div className="text-[9px] font-semibold mt-0.5" style={{ color: "#111" }}>{totalHrsMo} hrs booked this month</div>
                  {row(`${monthJobs.length} total jobs`, `~$${Math.round(avgJobVal / parseFloat(avgHrs))}/hr effective`)}
                </>, 0.1)}

                {/* Card 4 — Avg Expenses & Net */}
                {statCard(<>
                  <div className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: "#111" }}>Avg Expenses / Job</div>
                  <div className="text-xl font-black leading-none" style={gradText}>${avgExpPerJob}</div>
                  <div className="text-[9px] font-semibold mt-0.5" style={{ color: "#111" }}>Net ${avgNetPerJob} after fees & materials</div>
                  {row(`${netMarginPct}% net margin`, `$${monthExpenses.toLocaleString()} mo. materials`)}
                </>, 0.15)}

              </div>

              {/* Pace — full width */}
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.2 }}
                className="relative pb-4 mt-2">
                <div className="absolute -bottom-1 left-[6%] right-[6%] h-4 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center,rgba(0,0,0,0.38) 0%,transparent 70%)", filter: "blur(6px)", zIndex: 0 }} />
                <div className="relative p-3 rounded-xl" style={{
                  background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.82))",
                  border: "1px solid rgba(167,139,250,0.45)",
                  boxShadow: "0 10px 20px -6px rgba(0,0,0,0.35), 0 4px 8px -4px rgba(0,0,0,0.2), 0 -2px 5px 0 rgba(255,255,255,0.9) inset",
                  zIndex: 1,
                }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[9px] font-black tracking-widest uppercase" style={{ color: "#111" }}>Month Pace</div>
                    <div className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={onTrack
                        ? { background: "rgba(124,58,237,0.1)", color: "#7c3aed", border: "1px solid rgba(167,139,250,0.35)" }
                        : { background: "rgba(196,181,253,0.1)", color: "#111", border: "1px solid rgba(196,181,253,0.25)" }}>
                      {onTrack ? "On track" : `Need $${neededPerDay}/day`}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <div className="text-xl font-black" style={gradText}>${projected.toLocaleString()}</div>
                    <div className="text-[9px] font-semibold" style={{ color: "#111" }}>projected · ${(6000).toLocaleString()} goal</div>
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[8px] font-bold" style={{ color: "#111" }}>${confirmed.toLocaleString()} confirmed · {d} days in</span>
                    <span className="text-[8px] font-bold" style={{ color: "#111" }}>{daysRemaining} days left</span>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          )
        })()}
      </div>

    </div>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "How much does Levl charge?",    a: "A small, fixed platform fee — lower than every major competitor. Early providers lock in our founding rate permanently." },
  { q: "When do I get paid?",           a: "Funds release the moment a job is marked complete. Instant payouts via Stripe — no 7-day holds." },
  { q: "Can I set my own prices?",      a: "Yes. You control your rates, availability, and the types of jobs you accept. We never force a booking on you." },
  { q: "How does AI matching work?",    a: "Our AI reads the client's job description, matches it to your skills, location, and schedule — only sends jobs you're likely to win." },
  { q: "Do I need a background check?", a: "Yes. It keeps the platform premium — better clients, higher rates for you. Takes 24–48 hrs." },
  { q: "What if a client disputes?",    a: "We have a dedicated resolution process. Providers are protected from fraudulent disputes — it's on us, not you." },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-2">
      {FAQS.map((f, i) => (
        <div key={i} onClick={() => setOpen(open === i ? null : i)}
          className="cursor-pointer hover:scale-[1.01] transition-transform" style={cardStyle}>
          <div className="flex items-center justify-between px-5 py-4 gap-4">
            <span className="font-semibold text-sm" style={{ color: "#8b5cf6" }}>{f.q}</span>
            {open === i ? <ChevronUp size={15} className="text-purple-400 shrink-0" /> : <ChevronDown size={15} className="shrink-0" style={{ color: "#c4b5fd" }} />}
          </div>
          {open === i && <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: "#c4b5fd" }}>{f.a}</div>}
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const categories = [
  { icon: Hammer,     name: "Mounting",    count: 240, growth:  24 },
  { icon: Paintbrush, name: "Painting",    count: 180, growth:  -8 },
  { icon: Wrench,     name: "Plumbing",    count: 160, growth:  31 },
  { icon: Leaf,       name: "Landscaping", count: 210, growth: -11 },
  { icon: Scissors,   name: "Cleaning",    count: 290, growth:  28 },
  { icon: Truck,      name: "Moving",      count: 175, growth:  19 },
]

const perks = [
  { icon: DollarSign, title: "Lower fees, period",      body: "We charge less than Thumbtack and TaskRabbit — by design. More of every dollar stays with you." },
  { icon: Zap,        title: "No bidding wars",         body: "Our AI matches you to jobs. You don't compete against 12 other guys for the same job." },
  { icon: Clock,      title: "Instant payouts",         body: "Job complete → money in your account. No holds, no surprises." },
  { icon: Shield,     title: "Dispute protection",      body: "Fraudulent chargebacks are on us, not you. We built this to protect providers." },
  { icon: BookOpen,   title: "Skill accelerator",       body: "Level up your trade, unlock higher-paying jobs. Built-in learning paths for every category." },
  { icon: Users,      title: "Pro community",           body: "Connect with top providers. Share tips, get advice, build your referral network." },
]

export default function WorkPage() {
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  const switchToClient = useCallback(() => {
    localStorage.setItem("levl-role", "client")
    router.push("/")
  }, [router])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <div className="flex min-h-screen flex-col" style={{ margin: 0, padding: 0, overscrollBehavior: "none", WebkitOverflowScrolling: "touch" as any, overflowX: "hidden" }}>

      {/* Levl Void background */}
      <div className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 55% 20% at 50% 100%, rgba(255,252,248,0.38) 0%, transparent 70%),
            linear-gradient(180deg, #e6e6e6 0%, #f2f2f2 10%, #fafafa 28%, #ffffff 50%, #ffffff 100%)
          `,
        }}
      />

      {/* Nav — logo stays on /work */}
      <header className="sticky top-0 z-50 w-full relative"
        style={{
          transition: "background 80ms ease, box-shadow 80ms ease",
          background: scrolled ? "linear-gradient(135deg,rgba(255,255,255,0.08),rgba(237,233,254,0.05))" : "transparent",
          backdropFilter: scrolled ? "blur(28px) saturate(2.2)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(28px) saturate(2.2)" : "none",
          boxShadow: scrolled ? "0 6px 24px -4px rgba(0,0,0,0.14), 0 2px 8px -2px rgba(0,0,0,0.08)" : "none",
        }}>
        <div className="container flex h-20 items-center justify-between">
          <Link href="/work" className="flex items-center">
            <LevlLogo className="h-14 w-14" />
          </Link>
          <button
            onClick={switchToClient}
            className="text-xs font-black px-3 py-1.5 rounded-full transition-all active:scale-95 hover:scale-105"
            style={{
              background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.82))",
              border: "1px solid rgba(167,139,250,0.45)",
              boxShadow: "0 4px 10px -3px rgba(0,0,0,0.22), 0 -1px 3px 0 rgba(255,255,255,0.9) inset",
              color: "#7c3aed",
            }}
          >
            Client
          </button>
        </div>
        {/* Rounded pill border at bottom — only visible when scrolled */}
        <div className="absolute bottom-0 left-[8%] right-[8%] h-px rounded-full pointer-events-none"
          style={{
            background: "rgba(167,139,250,0.07)",
            opacity: scrolled ? 1 : 0,
            transition: "opacity 80ms ease",
          }} />
      </header>

      <main className="flex-1" style={{ width: "100%", minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}>

        {/* ── Categories ── */}
        <section style={{ paddingTop: "1rem", paddingBottom: "1.5rem", overflowX: "auto", scrollbarWidth: "none" as any, msOverflowStyle: "none" as any, WebkitOverflowScrolling: "touch" as any }}>
          <div className="flex gap-4 px-6" style={{ width: "max-content" }}>
            {categories.map((cat, i) => (
              <div key={cat.name} className="relative" style={{ width: "7rem" }}>
                {/* Floating growth badge */}
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.85 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 + 0.2, duration: 0.35, ease: [0.22,1,0.36,1] }}
                  className="absolute -top-3 -right-1 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black pointer-events-none select-none"
                  style={cat.growth >= 0 ? {
                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(34,197,94,0.45), 0 1px 0 rgba(255,255,255,0.2) inset",
                  } : {
                    background: "linear-gradient(135deg,#ef4444,#dc2626)",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(239,68,68,0.45), 0 1px 0 rgba(255,255,255,0.2) inset",
                  }}
                >
                  {cat.growth >= 0 ? `↑${cat.growth}%` : `↓${Math.abs(cat.growth)}%`}
                </motion.div>
                <EnhancedCategoryCard icon={cat.icon} name={cat.name} count={cat.count} index={i} size="small" className="w-28 h-32 scale-[1.04]" onClick={() => {}}
                  boxShadow="6px 10px 8px -6px rgba(0,0,0,0.45), -6px 10px 8px -6px rgba(0,0,0,0.45), 0 28px 22px -4px rgba(0,0,0,0.16), 0 19px 12px -4px rgba(0,0,0,0.11)"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Availability + Scheduled Tasks ── */}
        <section className="px-4 pt-0 pb-14 w-full md:max-w-6xl md:mx-auto md:px-6" style={{ overflow: "hidden" }}>
          <div className="grid md:grid-cols-2 gap-6 items-stretch">

            {/* Availability grid — first on mobile (calendar above jobs) */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="w-full order-1 md:order-2 md:pr-0 pr-2" style={{ minWidth: 0 }}>
              <AvailabilityPreview />
            </motion.div>

            {/* Scheduled tasks — second on mobile */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
              className="p-5 md:p-6 h-full order-2 md:order-1" style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold" style={{ color: "#111" }}>Scheduled jobs</h3>
              </div>
              <div className="space-y-3">
                {[
                  { day: "Mon", time: "8:00am",  title: "TV wall mount — 65″ Samsung",  client: "James R.",  pay: "$120", status: "confirmed" },
                  { day: "Tue", time: "10:00am", title: "Furniture assembly — IKEA PAX", client: "Sara M.",   pay: "$95",  status: "confirmed" },
                  { day: "Tue", time: "2:00pm",  title: "Shelf install — 3 floating",   client: "Derek L.",  pay: "$80",  status: "pending"   },
                  { day: "Thu", time: "9:00am",  title: "Drywall patch & paint touch-up",client: "Nina K.",  pay: "$140", status: "confirmed" },
                  { day: "Fri", time: "11:00am", title: "Outdoor light fixture swap",    client: "Tom B.",   pay: "$75",  status: "confirmed" },
                  { day: "Sat", time: "2:00pm",  title: "Deep clean — 2BR apartment",   client: "Priya S.", pay: "$110", status: "pending"   },
                ].map((job, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.35 }}
                    className="relative pb-3">
                    {/* Ground shadow */}
                    <div className="absolute -bottom-0 left-[8%] right-[8%] h-4 rounded-full pointer-events-none"
                      style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)", filter: "blur(5px)", zIndex: 0 }} />
                    <div className="relative flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.82))",
                        border: "1px solid rgba(167,139,250,0.45)",
                        boxShadow: "0 8px 16px -4px rgba(0,0,0,0.3), 0 4px 8px -4px rgba(0,0,0,0.18), 0 -2px 4px 0 rgba(255,255,255,0.9) inset",
                        zIndex: 1,
                      }}>
                      {/* Day pill */}
                      <div className="flex flex-col items-center justify-center w-10 shrink-0">
                        <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: "#111" }}>{job.day}</span>
                        <span className="text-[10px] font-bold" style={{ color: "#111" }}>{job.time}</span>
                      </div>
                      <div className="w-px h-8 shrink-0" style={{ background: "rgba(167,139,250,0.3)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#111" }}>{job.title}</p>
                        <p className="text-xs" style={{ color: "#111" }}>{job.client}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-sm font-black" style={{ color: "#111" }}>{job.pay}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={job.status === "confirmed"
                            ? { color: "#7c3aed", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(167,139,250,0.3)" }
                            : { color: "#a78bfa", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(196,181,253,0.3)" }
                          }>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── Forum preview ── */}
        <section className="px-6 py-14 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="order-2 md:order-1">
              <ForumPreview />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="order-1 md:order-2">
              <p className="text-xs font-bold tracking-widest uppercase text-purple-500 mb-2">Built-in community</p>
              <h2 className="text-3xl font-black mb-4" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Learn from the pros</h2>
              <p className="leading-relaxed mb-6" style={{ color: "#c4b5fd" }}>Connect with thousands of top providers. Share wins, get advice on pricing, tools, difficult clients.</p>
              <div className="space-y-3">
                {["Success stories & earnings breakdowns", "Tool reviews & job tips by trade", "Referral network for overflow work", "Direct access to Levl support"].map(t => (
                  <div key={t} className="flex items-center gap-2.5 text-sm" style={{ color: "#a78bfa" }}>
                    <CheckCircle size={15} className="text-purple-500 shrink-0" /> {t}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Perks ── */}
        <section className="px-6 py-14 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-10">
            <p className="text-xs font-bold tracking-widest uppercase text-purple-500 mb-2">Why providers choose Levl</p>
            <h2 className="text-3xl font-black" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Built for the people doing the work</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {perks.map(({ icon: Icon, title, body }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                className="p-6" style={cardStyle}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.2),rgba(109,40,217,0.15))", border: "1px solid rgba(167,139,250,0.3)" }}>
                  <Icon size={17} className="text-purple-600" />
                </div>
                <h3 className="font-bold mb-2" style={{ color: "#7c3aed" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#c4b5fd" }}>{body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Comparison ── */}
        <section className="px-6 py-14 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-10">
            <p className="text-xs font-bold tracking-widest uppercase text-purple-500 mb-2">The honest comparison</p>
            <h2 className="text-3xl font-black" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Why pros are switching</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="overflow-hidden" style={cardStyle}>
            <div className="grid grid-cols-4 text-[11px] font-bold tracking-widest uppercase px-6 py-4 border-b border-purple-50">
              <div style={{ color: "#c4b5fd" }}>Feature</div>
              <div className="text-center text-purple-600">Levl</div>
              <div className="text-center" style={{ color: "#c4b5fd" }}>Thumbtack</div>
              <div className="text-center" style={{ color: "#c4b5fd" }}>TaskRabbit</div>
            </div>
            {[
              ["Platform fee",       "Low fixed %", "Up to 35%",  "15% + fees"],
              ["Job matching",       "AI-matched",  "You bid",    "You bid"],
              ["Payout speed",       "Instant",     "3–5 days",   "3–5 days"],
              ["Forced bidding",     "Never",       "Always",     "Sometimes"],
              ["Provider support",   "Dedicated",   "Email only", "Chat only"],
              ["Dispute protection", "Full",        "Limited",    "Limited"],
            ].map(([feature, levl, thumb, tr], i) => (
              <div key={feature} className="grid grid-cols-4 px-6 py-3.5 text-sm border-b border-gray-50 last:border-0"
                style={{ background: i % 2 === 0 ? "rgba(167,139,250,0.03)" : "transparent" }}>
                <div className="font-medium" style={{ color: "#a78bfa" }}>{feature}</div>
                <div className="text-center font-bold text-purple-600 flex items-center justify-center gap-1">
                  <CheckCircle size={12} className="text-purple-500" /> {levl}
                </div>
                <div className="text-center" style={{ color: "#c4b5fd" }}>{thumb}</div>
                <div className="text-center" style={{ color: "#c4b5fd" }}>{tr}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-6 py-14 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-10">
            <p className="text-xs font-bold tracking-widest uppercase text-purple-500 mb-2">Got questions</p>
            <h2 className="text-3xl font-black" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>We've got answers</h2>
          </motion.div>
          <FAQ />
        </section>

        {/* ── CTA ── */}
        <section className="px-6 pb-24">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center py-16 px-8"
            style={{
              background: "linear-gradient(135deg, rgba(167,139,250,0.72) 0%, rgba(139,92,246,0.65) 45%, rgba(109,40,217,0.55) 100%)",
              borderRadius: "1.25rem",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 20px 50px -10px rgba(109,40,217,0.4), 0 -2px 6px rgba(255,255,255,0.15) inset",
            }}>
            <div className="flex justify-center mb-5">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-yellow-300 fill-yellow-300" />)}
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to work smarter?</h2>
            <p className="text-purple-100 mb-8 text-base leading-relaxed">Early providers lock in our founding rate — forever.<br />No upfront cost. No credit card required.</p>
            <Button size="lg" variant="outline" className="bg-white text-purple-700 border-white hover:bg-white/90 font-black" asChild>
              <Link href="/auth/signup" className="flex items-center gap-2">Apply to work on Levl <ArrowRight size={18} /></Link>
            </Button>
          </motion.div>
        </section>

      </main>

      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: "#c4b5fd" }}>
          <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent text-lg font-black">LevL</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-purple-500 transition-colors">For clients</Link>
            <Link href="/auth/login" className="hover:text-purple-500 transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="hover:text-purple-500 transition-colors">Sign up</Link>
          </div>
          <div>© 2025 Levl. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

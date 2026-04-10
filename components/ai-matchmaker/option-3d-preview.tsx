"use client"

import dynamic from "next/dynamic"
import { memo, Suspense, useState, useEffect, Component, type ReactNode } from "react"
import { motion } from "framer-motion"

class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}

// Dynamic import — ssr:false keeps WebGL off the server.
// The dynamic wrapper is stable across renders (module-level singleton).
const Option3DImpl = dynamic(
  () => import("./option-3d-impl").then((m) => ({ default: m.Option3DImpl })),
  { ssr: false }
)

export const THREE_D_OPTIONS = new Set([
  "TV/Monitor",
  "Art/Picture Frame",
  "Floating Shelves",
  "Mirror",
  "Light Fixture",
  "Fixed (flat against wall)",
  "Tilting (angle adjustment)",
  "Full-motion/Articulating (swivel and tilt)",
  "Ceiling mount",
  "Drywall/Sheetrock",
  "Brick",
  "Concrete",
  "Plaster",
  "Stone",
  "Metal studs",
  "Yes, hide all cables in wall",
  "Yes, use cable covers",
  "No, cables visible is fine",
])

// ─── Option3DPreview ─────────────────────────────────────────────────────────
// memo() — Canvas identity is preserved across parent re-renders.
export const Option3DPreview = memo(function Option3DPreview({
  option,
  className,
}: {
  option: string
  className?: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <motion.div
      className={`relative w-full h-full cursor-pointer ${className ?? ""}`}
      whileHover="hover"
      initial="initial"
    >
      <motion.div
        variants={{
          initial: { rotateX: 0, rotateY: 0, scale: 1 },
          hover:   { rotateX: 5, rotateY: -8, scale: 1.05 },
        }}
        style={{ transformStyle: "preserve-3d", perspective: 1200 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        className="w-full h-full"
      >
        <WebGLErrorBoundary>
          <Suspense fallback={null}>
            <Option3DImpl option={option} />
          </Suspense>
        </WebGLErrorBoundary>
      </motion.div>
    </motion.div>
  )
})

// ─── CategoryCard3D (unused by category row but kept for future use) ─────────
export const CategoryCard3D = memo(function CategoryCard3D({
  option,
  name,
  onClick,
}: {
  option: string
  name: string
  onClick?: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-5% 0px" }}
      whileHover={{ y: -6, scale: 1.04, transition: { duration: 0.22 } }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl
                 w-36 h-32 my-2 mx-1 shrink-0
                 bg-gradient-to-b from-white/98 to-white/85
                 dark:from-gray-800/98 dark:to-gray-900/85
                 border border-white/30
                 shadow-[0_8px_24px_rgba(79,70,229,0.18),0_2px_8px_rgba(0,0,0,0.06)]
                 hover:shadow-[0_16px_36px_rgba(79,70,229,0.28),0_4px_12px_rgba(0,0,0,0.08)]
                 backdrop-blur-md transition-shadow duration-300"
      style={{ willChange: "transform" }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      pointer-events-none z-10 rounded-2xl" />
      <div className="relative w-full" style={{ height: "72%" }}>
        {mounted ? (
          <WebGLErrorBoundary>
            <Suspense fallback={null}>
              <Option3DImpl option={option} thumbnail />
            </Suspense>
          </WebGLErrorBoundary>
        ) : null}
      </div>
      <div className="flex items-center justify-center w-full flex-1
                      bg-white/50 dark:bg-gray-900/50
                      backdrop-blur-md border-t border-white/20 px-2">
        <span className="text-[11px] font-semibold text-center leading-tight
                         bg-gradient-to-r from-gray-800 to-gray-500
                         dark:from-white dark:to-gray-400
                         bg-clip-text text-transparent">
          {name}
        </span>
      </div>
    </motion.button>
  )
})

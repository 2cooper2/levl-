"use client"

import dynamic from "next/dynamic"
import { Suspense, useState, useEffect } from "react"
import { motion } from "framer-motion"

// All Three.js / R3F code is isolated behind a dynamic import so it never
// executes on the server (WebGL requires browser APIs).
const Option3DImpl = dynamic(
  () => import("./option-3d-impl").then((m) => ({ default: m.Option3DImpl })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-purple-50/60 to-indigo-50/60 animate-pulse rounded-xl" />
    ),
  }
)

// Options that get full 3D treatment
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

const PLACEHOLDER = (
  <div className="w-full h-full bg-gradient-to-br from-purple-50/60 to-indigo-50/60 animate-pulse rounded-xl" />
)

export function Option3DPreview({
  option,
  className,
}: {
  option: string
  className?: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return PLACEHOLDER

  return (
    <motion.div
      className={`relative w-full h-full ${className ?? ""}`}
      whileHover={{ rotateX: 3, rotateY: -5, scale: 1.02 }}
      style={{ transformStyle: "preserve-3d", perspective: 900 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <Suspense fallback={PLACEHOLDER}>
        <Option3DImpl option={option} />
      </Suspense>
    </motion.div>
  )
}

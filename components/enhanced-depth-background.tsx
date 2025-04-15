"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"

export function EnhancedDepthBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Motion values for parallax effects
  const mouseX = useSpring(0, { stiffness: 40, damping: 30 })
  const mouseY = useSpring(0, { stiffness: 40, damping: 30 })

  // Transform mouse position for different parallax layers
  const farLayerX = useTransform(mouseX, (value) => value * 0.01)
  const farLayerY = useTransform(mouseY, (value) => value * 0.01)

  const midLayerX = useTransform(mouseX, (value) => value * 0.03)
  const midLayerY = useTransform(mouseY, (value) => value * 0.03)

  const nearLayerX = useTransform(mouseX, (value) => value * 0.05)
  const nearLayerY = useTransform(mouseY, (value) => value * 0.05)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e

      // Calculate mouse position relative to center of screen
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      mouseX.set(clientX - centerX)
      mouseY.set(clientY - centerY)

      // Update light position
      if (containerRef.current) {
        const x = (clientX / window.innerWidth) * 100
        const y = (clientY / window.innerHeight) * 100
        containerRef.current.style.setProperty("--light-x", `${x}%`)
        containerRef.current.style.setProperty("--light-y", `${y}%`)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-50 overflow-hidden pointer-events-none"
      style={
        {
          "--light-x": "50%",
          "--light-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* Base layer */}
      <div className="absolute inset-0 bg-background opacity-90" />

      {/* Subtle noise texture for depth */}
      <div className="absolute inset-0 bg-noise opacity-[0.03]" />

      {/* Far depth layer - Deep atmospheric gradient */}
      <motion.div className="absolute inset-0" style={{ x: farLayerX, y: farLayerY }}>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-primary/5 opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/[0.02] to-transparent opacity-30" />
      </motion.div>

      {/* Middle depth layer - Atmospheric haze */}
      <motion.div className="absolute inset-0" style={{ x: midLayerX, y: midLayerY }}>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/[0.01] to-transparent opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/[0.015] to-transparent opacity-50" />
      </motion.div>

      {/* Near depth layer - Subtle gradients */}
      <motion.div className="absolute inset-0" style={{ x: nearLayerX, y: nearLayerY }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.01] to-transparent opacity-60" />
      </motion.div>

      {/* Dynamic lighting effect */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at var(--light-x) var(--light-y), rgba(255,255,255,0.1) 0%, transparent 60%)`,
        }}
      />

      {/* Vignette for depth framing */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(0,0,0,0.15)_100%)] opacity-40" />

      {/* Depth haze effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-white/[0.02] dark:via-black/[0.01] dark:to-black/[0.02] opacity-70 mix-blend-overlay" />
    </div>
  )
}

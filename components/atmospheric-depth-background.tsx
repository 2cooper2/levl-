"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useScroll } from "framer-motion"

export function AtmosphericDepthBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const controls = useAnimation()

  // Motion values for subtle parallax effects
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smoothed mouse movement for more natural parallax
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  // Transform mouse position for different parallax layers with subtle range
  const layer1X = useTransform(smoothMouseX, [0, windowSize.width], [-10, 10])
  const layer1Y = useTransform(smoothMouseY, [0, windowSize.height], [-10, 10])

  const layer2X = useTransform(smoothMouseX, [0, windowSize.width], [-20, 20])
  const layer2Y = useTransform(smoothMouseY, [0, windowSize.height], [-20, 20])

  const layer3X = useTransform(smoothMouseX, [0, windowSize.width], [-30, 30])
  const layer3Y = useTransform(smoothMouseY, [0, windowSize.height], [-30, 30])

  // Scroll-based transformations
  const scrollTranslateY1 = useTransform(scrollY, [0, 1000], [0, -50])
  const scrollTranslateY2 = useTransform(scrollY, [0, 1000], [0, -30])
  const scrollTranslateY3 = useTransform(scrollY, [0, 1000], [0, -15])

  // Scroll-based opacity
  const scrollOpacity1 = useTransform(scrollY, [0, 300], [1, 0.9])
  const scrollOpacity2 = useTransform(scrollY, [0, 500], [1, 0.95])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      setMousePosition({ x: clientX, y: clientY })

      // Update motion values
      mouseX.set(clientX)
      mouseY.set(clientY)

      // Animate light source
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = ((clientX - rect.left) / rect.width) * 100
        const y = ((clientY - rect.top) / rect.height) * 100

        containerRef.current.style.setProperty("--light-position-x", `${x}%`)
        containerRef.current.style.setProperty("--light-position-y", `${y}%`)
      }
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Initial animation
    controls.start({
      opacity: [0, 1],
      transition: { duration: 1.5 },
    })

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [controls, mouseX, mouseY])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-50 overflow-hidden"
      style={
        {
          "--light-position-x": "50%",
          "--light-position-y": "50%",
          perspective: "1500px",
        } as React.CSSProperties
      }
    >
      {/* Base layer */}
      <div className="fixed inset-0 -z-50 bg-background opacity-95" />

      {/* Subtle noise texture */}
      <div className="fixed inset-0 -z-49 bg-noise opacity-[0.02]" />

      {/* Depth layer 1 - Deepest background gradient */}
      <motion.div
        className="fixed inset-0 -z-48"
        style={{
          x: layer3X,
          y: layer3Y,
          translateY: scrollTranslateY3,
          opacity: scrollOpacity1,
        }}
        animate={controls}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent" />
      </motion.div>

      {/* Depth layer 2 - Middle atmospheric layer */}
      <motion.div
        className="fixed inset-0 -z-47"
        style={{
          x: layer2X,
          y: layer2Y,
          translateY: scrollTranslateY2,
          opacity: scrollOpacity2,
        }}
        animate={controls}
      >
        {/* Atmospheric gradient that creates depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-primary/[0.04] opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/[0.01] to-transparent opacity-60" />
      </motion.div>

      {/* Depth layer 3 - Foreground atmospheric layer */}
      <motion.div
        className="fixed inset-0 -z-46"
        style={{
          x: layer1X,
          y: layer1Y,
          translateY: scrollTranslateY1,
        }}
        animate={controls}
      >
        {/* Subtle gradient that enhances depth perception */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-500/[0.01] to-transparent opacity-50" />
      </motion.div>

      {/* Dynamic lighting effect */}
      <div
        className="fixed inset-0 -z-45 opacity-30 dark:opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at var(--light-position-x) var(--light-position-y), rgba(255, 255, 255, 0.15) 0%, transparent 70%)`,
        }}
      />

      {/* Subtle vignette for depth framing */}
      <div className="fixed inset-0 -z-44 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(0,0,0,0.2)_100%)] opacity-40 dark:opacity-60 pointer-events-none" />

      {/* Depth haze effect */}
      <div className="fixed inset-0 -z-43 bg-gradient-to-b from-transparent via-white/[0.01] to-white/[0.02] dark:via-black/[0.01] dark:to-black/[0.02] opacity-70 pointer-events-none mix-blend-overlay" />

      {/* Extremely subtle dust particles */}
      <SubtleDustParticles />
    </div>
  )
}

function SubtleDustParticles() {
  // Create an array of very subtle dust particles
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 2 + 0.5, // Very small particles
    x: Math.random() * 100,
    y: Math.random() * 100,
    depth: Math.random() * 10 + 1,
    duration: Math.random() * 40 + 20, // Slower movement
    delay: Math.random() * 10,
    opacity: Math.random() * 0.1 + 0.05, // Very low opacity
  }))

  return (
    <div className="fixed inset-0 -z-42 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white dark:bg-primary/10"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity / (particle.depth / 3),
            filter: `blur(${(particle.depth - 1) * 0.3}px)`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, particle.opacity / (particle.depth / 3), 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

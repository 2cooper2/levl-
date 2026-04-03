"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function PremiumBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Calculate positions for the gradient blobs that follow mouse movement
  const blobOnePosition = {
    x: mousePosition.x * 0.05,
    y: mousePosition.y * 0.05,
  }

  const blobTwoPosition = {
    x: -mousePosition.x * 0.03,
    y: -mousePosition.y * 0.03,
  }

  return (
    <>
      {/* Base layer with noise texture - extended width */}
      <div
        className="fixed -z-20 bg-background opacity-90"
        style={{
          width: "calc(100vw + 100px)",
          height: "100vh",
          left: "-50px",
          right: "-50px",
          top: 0,
        }}
      />
      <div
        className="fixed -z-20 bg-noise opacity-[0.03]"
        style={{
          width: "calc(100vw + 100px)",
          height: "100vh",
          left: "-50px",
          right: "-50px",
          top: 0,
        }}
      />

      {/* Gradient blobs that subtly move with mouse - extended width */}
      <div
        className="fixed -z-10 opacity-20 dark:opacity-15 blur-[100px] md:blur-[130px] lg:blur-[160px]"
        style={{
          background: `radial-gradient(circle at ${windowSize.width / 2 + blobOnePosition.x}px ${
            windowSize.height / 2 + blobOnePosition.y
          }px, rgba(var(--primary-rgb), 0.8) 0%, rgba(var(--primary-rgb), 0) 70%)`,
          width: "calc(100vw + 100px)",
          height: "100vh",
          transform: "translate3d(0, 0, 0)",
          left: "-50px",
          right: "-50px",
          top: 0,
        }}
      />
      <div
        className="fixed -z-10 opacity-20 dark:opacity-15 blur-[100px] md:blur-[130px] lg:blur-[160px]"
        style={{
          background: `radial-gradient(circle at ${windowSize.width / 3 + blobTwoPosition.x}px ${
            windowSize.height / 3 + blobTwoPosition.y
          }px, rgba(147, 51, 234, 0.8) 0%, rgba(147, 51, 234, 0) 70%)`,
          width: "calc(100vw + 100px)",
          height: "100vh",
          transform: "translate3d(0, 0, 0)",
          left: "-50px",
          right: "-50px",
          top: 0,
        }}
      />

      {/* Additional gradient specifically for top-right corner */}
      <div
        className="fixed -z-10 opacity-20 dark:opacity-15 blur-[100px] md:blur-[130px] lg:blur-[160px]"
        style={{
          background: `radial-gradient(circle at 90% 10%, rgba(147, 51, 234, 0.8) 0%, rgba(147, 51, 234, 0) 70%)`,
          width: "calc(100vw + 100px)",
          height: "100vh",
          transform: "translate3d(0, 0, 0)",
          left: "-50px",
          right: "-50px",
          top: 0,
        }}
      />

      {/* Animated grid pattern - extended width */}
      <div
        className="fixed -z-10"
        style={{
          width: "calc(100vw + 100px)",
          height: "100vh",
          left: "-50px",
          right: "-50px",
          top: 0,
        }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.03]" />
      </div>

      {/* Subtle floating particles */}
      <ParticlesEffect />
    </>
  )
}

function ParticlesEffect() {
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 120 - 10, // Extended range to cover potential gaps
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div
      className="fixed -z-10 overflow-hidden pointer-events-none"
      style={{
        width: "calc(100vw + 100px)",
        height: "100vh",
        left: "-50px",
        right: "-50px",
        top: 0,
      }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20 dark:bg-primary/10"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.5, 0],
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

// Section divider with animated wave
export function WaveDivider({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height: "120px" }}>
      <svg
        className={`absolute w-full h-full ${inverted ? "rotate-180" : ""}`}
        preserveAspectRatio="none"
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="fill-background"
          d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,96C960,107,1056,117,1152,112C1248,107,1344,85,1392,74.7L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        ></path>
      </svg>
    </div>
  )
}

// Glass card effect for premium UI elements
export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 shadow-xl ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Animated gradient border
export function GradientBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`gradient-border-container ${className}`}>
      <div className="gradient-border-animation"></div>
      <div className="gradient-border-content">{children}</div>
    </div>
  )
}

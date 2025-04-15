"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

export function PremiumBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })
  const requestRef = useRef<number | null>(null)
  const previousTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle mouse move updates to reduce performance impact
      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame((time) => {
          if (previousTimeRef.current !== null) {
            setMousePosition({ x: e.clientX, y: e.clientY })
          }
          previousTimeRef.current = time
          requestRef.current = null
        })
      }
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)

    // Initial size setup
    handleResize()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  // Calculate positions for the gradient blobs with parallax effect
  const blobOnePosition = {
    x: mousePosition.x * 0.03,
    y: mousePosition.y * 0.03 - scrollY * 0.05,
  }

  const blobTwoPosition = {
    x: -mousePosition.x * 0.02,
    y: -mousePosition.y * 0.02 - scrollY * 0.02,
  }

  const blobThreePosition = {
    x: mousePosition.x * 0.01,
    y: mousePosition.y * 0.01 - scrollY * 0.08,
  }

  return (
    <>
      {/* Base layer with depth */}
      <div className="fixed inset-0 -z-30 bg-background opacity-95" style={{ width: "100vw", height: "100vh" }} />

      {/* Noise texture with depth */}
      <div
        className="fixed inset-0 -z-25 bg-noise opacity-[0.04]"
        style={{ width: "100vw", height: "100vh", filter: "contrast(120%)" }}
      />

      {/* Depth layer 1 - Furthest back, moves slowest */}
      <div
        className="fixed -z-20 opacity-30 dark:opacity-20"
        style={{
          position: "fixed",
          top: "-20vh",
          left: "-20vw",
          width: "140vw",
          height: "140vh",
          background: `radial-gradient(circle at ${windowSize.width / 2 + blobOnePosition.x * 0.3}px ${
            windowSize.height / 2 + blobOnePosition.y * 0.3
          }px, rgba(var(--primary-rgb), 0.8) 0%, rgba(var(--primary-rgb), 0) 70%)`,
          transform: `translate3d(0, ${scrollY * 0.02}px, 0)`,
          willChange: "transform",
          filter: "blur(40px)",
        }}
      />

      {/* Depth layer 2 - Middle layer, moves at medium speed */}
      <div
        className="fixed -z-15 opacity-25 dark:opacity-20"
        style={{
          position: "fixed",
          top: "-20vh",
          right: "-20vw",
          width: "140vw",
          height: "140vh",
          background: `radial-gradient(circle at ${windowSize.width / 3 + blobTwoPosition.x}px ${
            windowSize.height / 3 + blobTwoPosition.y
          }px, rgba(147, 51, 234, 0.8) 0%, rgba(147, 51, 234, 0) 70%)`,
          transform: `translate3d(0, ${scrollY * 0.04}px, 0)`,
          willChange: "transform",
          filter: "blur(30px)",
        }}
      />

      {/* Depth layer 3 - Closest layer, moves fastest */}
      <div
        className="fixed -z-10 opacity-20 dark:opacity-15"
        style={{
          position: "fixed",
          top: "10vh",
          right: "10vw",
          width: "80vw",
          height: "80vh",
          background: `radial-gradient(circle at ${windowSize.width * 0.7 + blobThreePosition.x}px ${
            windowSize.height * 0.3 + blobThreePosition.y
          }px, rgba(79, 70, 229, 0.6) 0%, rgba(79, 70, 229, 0) 70%)`,
          transform: `translate3d(${mousePosition.x * 0.01}px, ${scrollY * 0.06}px, 0)`,
          willChange: "transform",
          filter: "blur(20px)",
        }}
      />

      {/* Additional accent gradient for depth */}
      <div
        className="fixed -z-12 opacity-15 dark:opacity-10"
        style={{
          position: "fixed",
          bottom: "0",
          left: "20vw",
          width: "60vw",
          height: "60vh",
          background: `radial-gradient(ellipse at 50% 100%, rgba(236, 72, 153, 0.5) 0%, rgba(236, 72, 153, 0) 70%)`,
          transform: `translate3d(0, ${scrollY * -0.03}px, 0)`,
          willChange: "transform",
          filter: "blur(40px)",
        }}
      />

      {/* Grid pattern with parallax effect */}
      <div
        className="fixed inset-0 -z-18"
        style={{
          width: "100vw",
          height: "100vh",
          transform: `translate3d(0, ${scrollY * 0.03}px, 0)`,
        }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.04]" />
      </div>

      {/* Subtle vignette effect for depth */}
      <div
        className="fixed inset-0 -z-5 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.03) 100%)",
          width: "100vw",
          height: "100vh",
        }}
      />

      {/* Enhanced particles with depth */}
      <EnhancedParticlesEffect scrollY={scrollY} />

      {/* Floating orbs for additional depth */}
      <FloatingOrbs scrollY={scrollY} />
    </>
  )
}

function EnhancedParticlesEffect({ scrollY }: { scrollY: number }) {
  // Create particles with varying sizes and depths
  const particles = Array.from({ length: 15 }).map((_, i) => {
    const size = Math.random() * 3 + 1
    const depth = Math.random() * 0.8 + 0.2 // 0.2 to 1.0 - used for parallax effect

    return {
      id: i,
      size,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      depth,
      opacity: 0.2 + depth * 0.3, // More distant particles are more transparent
      blur: (1 - depth) * 2, // More distant particles are more blurred
    }
  })

  return (
    <div className="fixed inset-0 -z-8 overflow-hidden pointer-events-none" style={{ width: "100vw", height: "100vh" }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20 dark:bg-primary/15"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            willChange: "transform, opacity",
            opacity: particle.opacity,
            filter: `blur(${particle.blur}px)`,
            transform: `translateY(${scrollY * particle.depth * 0.1}px)`,
            boxShadow: particle.size > 2 ? `0 0 ${particle.size * 2}px rgba(var(--primary-rgb), 0.2)` : "none",
          }}
          animate={{
            y: [0, -30 * particle.depth, 0],
            opacity: [particle.opacity * 0.7, particle.opacity, particle.opacity * 0.7],
            scale: [1, 1.1, 1],
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

function FloatingOrbs({ scrollY }: { scrollY: number }) {
  // Create larger orbs with glow effects for depth
  const orbs = [
    {
      id: 1,
      size: 80,
      x: 15,
      y: 20,
      color: "rgba(79, 70, 229, 0.15)",
      glow: "rgba(79, 70, 229, 0.2)",
      depth: 0.3,
      duration: 25,
    },
    {
      id: 2,
      size: 120,
      x: 75,
      y: 60,
      color: "rgba(147, 51, 234, 0.12)",
      glow: "rgba(147, 51, 234, 0.15)",
      depth: 0.5,
      duration: 30,
    },
    {
      id: 3,
      size: 60,
      x: 85,
      y: 30,
      color: "rgba(236, 72, 153, 0.1)",
      glow: "rgba(236, 72, 153, 0.15)",
      depth: 0.7,
      duration: 20,
    },
  ]

  return (
    <div className="fixed inset-0 -z-9 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            backgroundColor: orb.color,
            boxShadow: `0 0 40px ${orb.glow}`,
            willChange: "transform",
            transform: `translateY(${scrollY * orb.depth * -0.1}px)`,
            filter: `blur(${(1 - orb.depth) * 15}px)`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// Section divider with enhanced 3D wave
export function WaveDivider({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height: "120px" }}>
      <svg
        className={`absolute w-full h-full ${inverted ? "rotate-180" : ""}`}
        preserveAspectRatio="none"
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: "translate3d(0, 0, 0)",
          filter: "drop-shadow(0 -5px 10px rgba(0,0,0,0.03))", // Adds subtle shadow for depth
        }}
      >
        <path
          className="fill-background"
          d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,96C960,107,1056,117,1152,112C1248,107,1344,85,1392,74.7L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        ></path>
      </svg>
    </div>
  )
}

// Enhanced glass card with better depth
export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 shadow-xl ${className}`}
      style={{
        transform: "translate3d(0, 0, 0)",
        boxShadow:
          "0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 2px 10px -3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 dark:from-white/10 dark:to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Enhanced gradient border with better depth
export function GradientBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`gradient-border-container ${className}`}
      style={{
        transform: "translate3d(0, 0, 0)",
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="gradient-border-animation"></div>
      <div className="gradient-border-content">{children}</div>
    </div>
  )
}

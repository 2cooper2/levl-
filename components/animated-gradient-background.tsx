"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function AnimatedGradientBackground() {
  const [scrollY, setScrollY] = useState(0)
  const [time, setTime] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Gentle animation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 1)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <>
      {/* Elegant color streaks */}
      <ElegantColorStreaks scrollY={scrollY} mousePosition={mousePosition} time={time} />

      {/* Soft gradient layers */}
      <SoftGradientLayers scrollY={scrollY} mousePosition={mousePosition} />

      {/* Subtle flowing lines */}
      <SubtleFlowingLines scrollY={scrollY} time={time} />
    </>
  )
}

function ElegantColorStreaks({
  scrollY,
  mousePosition,
  time,
}: {
  scrollY: number
  mousePosition: { x: number; y: number }
  time: number
}) {
  // Create elegant color streaks that flow across the screen
  const streaks = [
    {
      startX: "-10%",
      endX: "110%",
      y: "20%",
      color: "rgba(139, 92, 246, 0.04)", // Lavender
      height: "15vh",
      duration: 35,
      delay: 0,
    },
    {
      startX: "110%",
      endX: "-10%",
      y: "35%",
      color: "rgba(124, 58, 237, 0.03)", // Purple
      height: "10vh",
      duration: 40,
      delay: 5,
    },
    {
      startX: "-10%",
      endX: "110%",
      y: "55%",
      color: "rgba(167, 139, 250, 0.05)", // Light lavender
      height: "12vh",
      duration: 38,
      delay: 12,
    },
    {
      startX: "110%",
      endX: "-10%",
      y: "75%",
      color: "rgba(99, 102, 241, 0.03)", // Indigo
      height: "8vh",
      duration: 42,
      delay: 20,
    },
  ]

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {streaks.map((streak, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            left: streak.startX,
            top: streak.y,
            height: streak.height,
            width: "60%",
            background: `linear-gradient(to right, transparent, ${streak.color} 30%, ${streak.color} 70%, transparent)`,
            filter: "blur(40px)",
            transform: `translateY(${scrollY * 0.02}px)`,
          }}
          animate={{
            left: [streak.startX, streak.endX],
          }}
          transition={{
            duration: streak.duration,
            delay: streak.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}

      {/* Mouse-following subtle glow */}
      <motion.div
        className="absolute"
        style={{
          width: "30vw",
          height: "30vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)",
          filter: "blur(50px)",
          left: mousePosition.x,
          top: mousePosition.y,
          transform: "translate(-50%, -50%)",
          opacity: 0,
        }}
        animate={{
          opacity: [0, 0.5, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Diagonal streaks */}
      <DiagonalStreaks scrollY={scrollY} time={time} />
    </div>
  )
}

function DiagonalStreaks({ scrollY, time }: { scrollY: number; time: number }) {
  // Create diagonal streaks that move slowly
  const diagonals = [
    {
      angle: 45,
      color: "rgba(139, 92, 246, 0.03)", // Lavender
      duration: 50,
      delay: 0,
    },
    {
      angle: -30,
      color: "rgba(124, 58, 237, 0.02)", // Purple
      duration: 60,
      delay: 10,
    },
    {
      angle: 60,
      color: "rgba(167, 139, 250, 0.04)", // Light lavender
      duration: 55,
      delay: 25,
    },
  ]

  return (
    <>
      {diagonals.map((diagonal, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${diagonal.angle}deg, transparent, ${diagonal.color} 50%, transparent)`,
            transform: `translateY(${scrollY * 0.01}px)`,
            filter: "blur(60px)",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: diagonal.duration,
            delay: diagonal.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </>
  )
}

function SoftGradientLayers({
  scrollY,
  mousePosition,
}: {
  scrollY: number
  mousePosition: { x: number; y: number }
}) {
  // Create soft gradient layers that move subtly
  const gradients = [
    {
      position: "top left",
      color: "rgba(139, 92, 246, 0.15)", // Lavender
      size: "80%",
      x: mousePosition.x * 0.01,
      y: mousePosition.y * 0.01 - scrollY * 0.02,
      duration: 30,
    },
    {
      position: "bottom right",
      color: "rgba(124, 58, 237, 0.12)", // Purple
      size: "70%",
      x: -mousePosition.x * 0.008,
      y: -mousePosition.y * 0.008 - scrollY * 0.015,
      duration: 35,
    },
    {
      position: "center",
      color: "rgba(167, 139, 250, 0.18)", // Light lavender
      size: "60%",
      x: mousePosition.x * 0.005,
      y: mousePosition.y * 0.005 - scrollY * 0.01,
      duration: 40,
    },
  ]

  return (
    <div className="fixed inset-0 -z-15 overflow-hidden pointer-events-none">
      {gradients.map((gradient, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            width: "100%",
            height: "100%",
            background: `radial-gradient(circle at ${gradient.position}, ${gradient.color} 0%, transparent ${gradient.size})`,
            transform: `translate3d(${gradient.x}px, ${gradient.y}px, 0)`,
            filter: "blur(80px)",
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: gradient.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

function SubtleFlowingLines({ scrollY, time }: { scrollY: number; time: number }) {
  // Create subtle flowing lines
  const horizontalLines = [
    {
      y: "25%",
      color: "rgba(139, 92, 246, 0.02)", // Lavender
      duration: 45,
    },
    {
      y: "50%",
      color: "rgba(124, 58, 237, 0.015)", // Purple
      duration: 50,
    },
    {
      y: "75%",
      color: "rgba(167, 139, 250, 0.025)", // Light lavender
      duration: 40,
    },
  ]

  const verticalLines = [
    {
      x: "25%",
      color: "rgba(139, 92, 246, 0.015)", // Lavender
      duration: 48,
    },
    {
      x: "50%",
      color: "rgba(124, 58, 237, 0.01)", // Purple
      duration: 52,
    },
    {
      x: "75%",
      color: "rgba(167, 139, 250, 0.02)", // Light lavender
      duration: 44,
    },
  ]

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      {/* Horizontal lines */}
      {horizontalLines.map((line, index) => (
        <motion.div
          key={`h-${index}`}
          className="absolute w-full"
          style={{
            height: "1px",
            top: line.y,
            background: line.color,
            boxShadow: `0 0 8px ${line.color}`,
            transform: `translateY(${scrollY * 0.01}px)`,
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            filter: ["blur(0px)", "blur(1px)", "blur(0px)"],
          }}
          transition={{
            duration: line.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Vertical lines */}
      {verticalLines.map((line, index) => (
        <motion.div
          key={`v-${index}`}
          className="absolute h-full"
          style={{
            width: "1px",
            left: line.x,
            background: line.color,
            boxShadow: `0 0 8px ${line.color}`,
            transform: `translateX(${scrollY * 0.005}px)`,
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            filter: ["blur(0px)", "blur(1px)", "blur(0px)"],
          }}
          transition={{
            duration: line.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

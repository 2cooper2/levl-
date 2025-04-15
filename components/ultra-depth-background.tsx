"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useScroll } from "framer-motion"

export function UltraDepthBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const controls = useAnimation()

  // Motion values for parallax effects with increased range
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smoothed mouse movement for more natural parallax
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  // Transform mouse position for different parallax layers with increased range
  const layer1X = useTransform(smoothMouseX, [0, windowSize.width], [-25, 25])
  const layer1Y = useTransform(smoothMouseY, [0, windowSize.height], [-25, 25])

  const layer2X = useTransform(smoothMouseX, [0, windowSize.width], [-50, 50])
  const layer2Y = useTransform(smoothMouseY, [0, windowSize.height], [-50, 50])

  const layer3X = useTransform(smoothMouseX, [0, windowSize.width], [-75, 75])
  const layer3Y = useTransform(smoothMouseY, [0, windowSize.height], [-75, 75])

  const layer4X = useTransform(smoothMouseX, [0, windowSize.width], [30, -30])
  const layer4Y = useTransform(smoothMouseY, [0, windowSize.height], [30, -30])

  const layer5X = useTransform(smoothMouseX, [0, windowSize.width], [15, -15])
  const layer5Y = useTransform(smoothMouseY, [0, windowSize.height], [15, -15])

  // Scroll-based transformations
  const scrollTranslateY1 = useTransform(scrollY, [0, 1000], [0, -150])
  const scrollTranslateY2 = useTransform(scrollY, [0, 1000], [0, -100])
  const scrollTranslateY3 = useTransform(scrollY, [0, 1000], [0, -50])
  const scrollTranslateY4 = useTransform(scrollY, [0, 1000], [0, 50])
  const scrollTranslateY5 = useTransform(scrollY, [0, 1000], [0, 100])

  // Scroll-based opacity and scale
  const scrollOpacity1 = useTransform(scrollY, [0, 300], [1, 0.7])
  const scrollOpacity2 = useTransform(scrollY, [0, 500], [1, 0.8])
  const scrollScale1 = useTransform(scrollY, [0, 500], [1, 1.1])
  const scrollScale2 = useTransform(scrollY, [0, 500], [1, 0.9])

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

        // Update perspective origin for 3D effect
        containerRef.current.style.setProperty("--perspective-origin-x", `${x}%`)
        containerRef.current.style.setProperty("--perspective-origin-y", `${y}%`)
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
          "--perspective-origin-x": "50%",
          "--perspective-origin-y": "50%",
          perspective: "1500px",
          perspectiveOrigin: "var(--perspective-origin-x) var(--perspective-origin-y)",
        } as React.CSSProperties
      }
    >
      {/* Base layer */}
      <div className="fixed inset-0 -z-50 bg-background opacity-95" />

      {/* Noise texture */}
      <div className="fixed inset-0 -z-49 bg-noise opacity-[0.03]" />

      {/* Atmospheric fog effect */}
      <div className="fixed inset-0 -z-48 bg-gradient-radial from-transparent via-transparent to-black/10 dark:to-black/20 opacity-70" />

      {/* Depth layer 1 - Deepest background */}
      <motion.div
        className="fixed inset-0 -z-47"
        style={{
          x: layer5X,
          y: layer5Y,
          translateY: scrollTranslateY5,
          opacity: scrollOpacity1,
          scale: scrollScale1,
          filter: "blur(8px)",
        }}
        animate={controls}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-70" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.03]" />

        {/* Deep space elements */}
        <div className="absolute h-[600px] w-[600px] rounded-full bg-blue-900/5 dark:bg-blue-500/5 blur-[150px] -top-[10%] -left-[10%] opacity-30 dark:opacity-20 transform rotate-45" />
        <div className="absolute h-[500px] w-[500px] rounded-full bg-purple-900/5 dark:bg-purple-500/5 blur-[120px] -bottom-[5%] -right-[5%] opacity-30 dark:opacity-20 transform -rotate-12" />
      </motion.div>

      {/* Depth layer 2 - Far background with blurred shapes */}
      <motion.div
        className="fixed inset-0 -z-46"
        style={{
          x: layer4X,
          y: layer4Y,
          translateY: scrollTranslateY4,
          opacity: scrollOpacity2,
          scale: scrollScale2,
          filter: "blur(6px)",
          transformStyle: "preserve-3d",
        }}
        animate={controls}
      >
        {/* Floating blurred circles */}
        <div className="absolute h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] top-[5%] left-[10%] opacity-40 dark:opacity-20 transform-gpu translate-z-[-200px]" />
        <div className="absolute h-[450px] w-[450px] rounded-full bg-purple-500/10 blur-[100px] bottom-[15%] right-[5%] opacity-40 dark:opacity-20 transform-gpu translate-z-[-150px]" />
        <div className="absolute h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[80px] top-[35%] right-[25%] opacity-30 dark:opacity-15 transform-gpu translate-z-[-100px]" />
      </motion.div>

      {/* Depth layer 3 - Middle layer with more defined shapes */}
      <motion.div
        className="fixed inset-0 -z-45"
        style={{
          x: layer3X,
          y: layer3Y,
          translateY: scrollTranslateY3,
          filter: "blur(4px)",
          transformStyle: "preserve-3d",
        }}
        animate={controls}
      >
        {/* 3D floating geometric shapes */}
        <div className="absolute w-[300px] h-[300px] border border-white/10 dark:border-white/5 rounded-full backdrop-blur-sm bg-white/5 dark:bg-white/5 top-[20%] left-[15%] opacity-60 transform-gpu translate-z-[-50px] rotate-12" />
        <div className="absolute w-[250px] h-[250px] border border-white/10 dark:border-white/5 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-white/5 bottom-[25%] right-[20%] opacity-60 transform-gpu translate-z-[-75px] rotate-45" />
        <div className="absolute w-[200px] h-[200px] border border-white/10 dark:border-white/5 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-white/5 top-[50%] right-[10%] opacity-60 transform-gpu translate-z-[-25px] -rotate-12" />
      </motion.div>

      {/* Depth layer 4 - Closer layer with sharper elements */}
      <motion.div
        className="fixed inset-0 -z-44"
        style={{
          x: layer2X,
          y: layer2Y,
          translateY: scrollTranslateY2,
          filter: "blur(2px)",
          transformStyle: "preserve-3d",
        }}
        animate={controls}
      >
        {/* Sharper geometric elements */}
        <div className="absolute w-[180px] h-[180px] border border-white/15 dark:border-white/10 rounded-md backdrop-blur-sm bg-white/10 dark:bg-white/5 top-[30%] left-[25%] transform-gpu translate-z-[50px] rotate-[25deg] shadow-xl" />
        <div className="absolute w-[150px] h-[150px] border border-white/15 dark:border-white/10 rounded-full backdrop-blur-sm bg-white/10 dark:bg-white/5 bottom-[35%] right-[30%] transform-gpu translate-z-[75px] shadow-xl" />
        <div className="absolute w-[120px] h-[120px] border border-white/15 dark:border-white/10 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-white/5 top-[65%] right-[20%] transform-gpu translate-z-[25px] -rotate-[15deg] shadow-xl" />
      </motion.div>

      {/* Depth layer 5 - Foreground elements */}
      <motion.div
        className="fixed inset-0 -z-43"
        style={{
          x: layer1X,
          y: layer1Y,
          translateY: scrollTranslateY1,
          transformStyle: "preserve-3d",
        }}
        animate={controls}
      >
        {/* Crisp foreground elements */}
        <div className="absolute w-[100px] h-[100px] border border-white/20 dark:border-white/15 rounded-lg backdrop-blur-sm bg-white/15 dark:bg-white/10 top-[20%] left-[30%] transform-gpu translate-z-[150px] rotate-[35deg] shadow-2xl" />
        <div className="absolute w-[80px] h-[80px] border border-white/20 dark:border-white/15 rounded-full backdrop-blur-sm bg-white/15 dark:bg-white/10 bottom-[25%] right-[35%] transform-gpu translate-z-[200px] shadow-2xl" />
        <div className="absolute w-[60px] h-[60px] border border-white/20 dark:border-white/15 rounded-md backdrop-blur-sm bg-white/15 dark:bg-white/10 top-[70%] left-[20%] transform-gpu translate-z-[100px] -rotate-[20deg] shadow-2xl" />
      </motion.div>

      {/* Dynamic lighting effect with increased intensity */}
      <div
        className="fixed inset-0 -z-42 opacity-40 dark:opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at var(--light-position-x) var(--light-position-y), rgba(255, 255, 255, 0.25) 0%, transparent 70%)`,
        }}
      />

      {/* Enhanced vignette */}
      <div className="fixed inset-0 -z-41 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(0,0,0,0.3)_100%)] opacity-50 dark:opacity-70 pointer-events-none" />

      {/* Depth haze effect */}
      <div className="fixed inset-0 -z-40 bg-gradient-to-b from-transparent via-white/5 to-white/10 dark:via-black/5 dark:to-black/10 opacity-30 dark:opacity-40 pointer-events-none mix-blend-overlay" />

      {/* Enhanced floating particles with depth */}
      <EnhancedFloatingParticles />
    </div>
  )
}

function EnhancedFloatingParticles() {
  // Create an array of particles with random properties and more variation
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    depth: Math.random() * 10 + 1, // Increased depth range for more variation
    duration: Math.random() * 30 + 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.5 + 0.1,
    blur: Math.random() * 5,
    // Add 3D transform
    translateZ: Math.random() * 300 - 150,
  }))

  return (
    <div className="fixed inset-0 -z-39 overflow-hidden pointer-events-none" style={{ perspective: "1000px" }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white dark:bg-primary/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity / (particle.depth / 5),
            filter: `blur(${(particle.depth - 1) * 0.5 + particle.blur}px)`,
            zIndex: Math.floor(20 - particle.depth),
            transform: `translateZ(${particle.translateZ}px)`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, particle.id % 2 === 0 ? 20 : -20, 0],
            opacity: [0, particle.opacity / (particle.depth / 5), 0],
            scale: [1, particle.id % 3 === 0 ? 1.2 : 0.8, 1],
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

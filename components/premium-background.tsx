"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function PremiumBackground() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })
  const [time, setTime] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

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

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("resize", handleResize, { passive: true })

    // Initial size setup
    handleResize()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <>
      {/* Base layer */}
      <div className="fixed inset-0 -z-30 bg-background" />

      {/* Subtle noise texture */}
      <div className="fixed inset-0 -z-25 bg-noise opacity-[0.02]" style={{ filter: "contrast(120%)" }} />

      {/* Dynamic floating elements */}
      <FloatingElements scrollY={scrollY} mousePosition={mousePosition} windowSize={windowSize} time={time} />

      {/* Interactive particle system */}
      <ParticleSystem scrollY={scrollY} mousePosition={mousePosition} windowSize={windowSize} time={time} />

      {/* Elegant color streaks */}
      <ColorStreaks
        scrollY={scrollY}
        mousePosition={mousePosition}
        windowSize={windowSize}
        time={time}
        isHovering={isHovering}
      />

      {/* Animated geometric patterns */}
      <GeometricPatterns scrollY={scrollY} mousePosition={mousePosition} windowSize={windowSize} time={time} />

      {/* Soft gradient background */}
      <SoftGradientBackground scrollY={scrollY} mousePosition={mousePosition} windowSize={windowSize} />

      {/* Dynamic light effects */}
      <DynamicLightEffects scrollY={scrollY} mousePosition={mousePosition} windowSize={windowSize} time={time} />

      {/* Subtle vignette for depth */}
      <div
        className="fixed inset-0 -z-5 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.02) 100%)",
        }}
      />
    </>
  )
}

function FloatingElements({
  scrollY,
  mousePosition,
  windowSize,
  time,
}: {
  scrollY: number
  mousePosition: { x: number; y: number }
  windowSize: { width: number; height: number }
  time: number
}) {
  // Create floating 3D elements with parallax effect
  const elements = [
    {
      size: 180,
      shape: "circle",
      color: "rgba(139, 92, 246, 0.15)",
      x: windowSize.width * 0.2,
      y: windowSize.height * 0.3,
      depth: 2,
      speed: 0.03,
    },
    {
      size: 220,
      shape: "square",
      color: "rgba(124, 58, 237, 0.12)",
      x: windowSize.width * 0.8,
      y: windowSize.height * 0.2,
      depth: 1.5,
      speed: 0.02,
    },
    {
      size: 150,
      shape: "triangle",
      color: "rgba(167, 139, 250, 0.18)",
      x: windowSize.width * 0.3,
      y: windowSize.height * 0.7,
      depth: 3,
      speed: 0.04,
    },
    {
      size: 200,
      shape: "hexagon",
      color: "rgba(99, 102, 241, 0.14)",
      x: windowSize.width * 0.7,
      y: windowSize.height * 0.6,
      depth: 2.5,
      speed: 0.035,
    },
    {
      size: 160,
      shape: "circle",
      color: "rgba(236, 72, 153, 0.1)",
      x: windowSize.width * 0.5,
      y: windowSize.height * 0.4,
      depth: 1.8,
      speed: 0.025,
    },
  ]

  // Calculate mouse influence for parallax
  const mouseOffsetX = (mousePosition.x - windowSize.width / 2) / 50
  const mouseOffsetY = (mousePosition.y - windowSize.height / 2) / 50

  return (
    <div className="fixed inset-0 -z-22 overflow-hidden">
      {elements.map((element, index) => {
        // Calculate element-specific offsets based on depth
        const elementOffsetX = mouseOffsetX * element.depth
        const elementOffsetY = mouseOffsetY * element.depth
        const scrollOffset = scrollY * 0.05 * element.depth

        // Determine shape path
        let shapePath
        switch (element.shape) {
          case "square":
            shapePath = <rect width={element.size} height={element.size} rx={element.size * 0.1} fill={element.color} />
            break
          case "triangle":
            shapePath = (
              <polygon
                points={`${element.size / 2},0 ${element.size},${element.size} 0,${element.size}`}
                fill={element.color}
              />
            )
            break
          case "hexagon":
            const hexPoints = []
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i
              const x = element.size / 2 + (element.size / 2) * Math.cos(angle)
              const y = element.size / 2 + (element.size / 2) * Math.sin(angle)
              hexPoints.push(`${x},${y}`)
            }
            shapePath = <polygon points={hexPoints.join(" ")} fill={element.color} />
            break
          case "circle":
          default:
            shapePath = <circle cx={element.size / 2} cy={element.size / 2} r={element.size / 2} fill={element.color} />
        }

        return (
          <motion.div
            key={`floating-element-${index}`}
            className="absolute"
            style={{
              width: element.size,
              height: element.size,
              x: element.x + elementOffsetX,
              y: element.y + elementOffsetY - scrollOffset,
              filter: "blur(40px)",
            }}
            animate={{
              x: [
                element.x + elementOffsetX,
                element.x + elementOffsetX + Math.sin(time * element.speed) * 30,
                element.x + elementOffsetX,
              ],
              y: [
                element.y + elementOffsetY - scrollOffset,
                element.y + elementOffsetY - scrollOffset + Math.cos(time * element.speed) * 20,
                element.y + elementOffsetY - scrollOffset,
              ],
              rotate: [0, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 20 + index * 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <svg width="100%" height="100%" viewBox={`0 0 ${element.size} ${element.size}`}>
              {shapePath}
            </svg>
          </motion.div>
        )
      })}
    </div>
  )
}

function ParticleSystem({
  scrollY,
  mousePosition,
  windowSize,
  time,
}: {
  scrollY: number
  mousePosition: { x: number; y: number }
  windowSize: { width: number; height: number }
  time: number
}) {
  // Create particles with different properties
  const particleCount = 40
  const particles = Array.from({ length: particleCount }).map((_, i) => {
    const size = Math.random() * 4 + 1
    const x = Math.random() * windowSize.width
    const y = Math.random() * windowSize.height
    const speed = Math.random() * 0.4 + 0.2
    const delay = Math.random() * 10
    const opacity = Math.random() * 0.5 + 0.3
    const depth = Math.random() * 3 + 1

    // Determine color based on position (creates color zones)
    let color
    const colorZone = Math.floor(Math.random() * 4)
    switch (colorZone) {
      case 0:
        color = `rgba(139, 92, 246, ${opacity})` // Lavender
        break
      case 1:
        color = `rgba(124, 58, 237, ${opacity})` // Purple
        break
      case 2:
        color = `rgba(167, 139, 250, ${opacity})` // Light lavender
        break
      case 3:
        color = `rgba(99, 102, 241, ${opacity})` // Indigo
        break
      default:
        color = `rgba(139, 92, 246, ${opacity})` // Default to lavender
    }

    return { size, x, y, speed, delay, color, depth }
  })

  // Calculate mouse influence radius
  const mouseInfluenceRadius = 150
  const mouseInfluenceStrength = 0.2

  return (
    <div className="fixed inset-0 -z-21 overflow-hidden pointer-events-none">
      {particles.map((particle, index) => {
        // Calculate distance to mouse
        const dx = mousePosition.x - particle.x
        const dy = mousePosition.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Calculate mouse influence
        let mouseX = 0
        let mouseY = 0

        if (distance < mouseInfluenceRadius) {
          const influence = (1 - distance / mouseInfluenceRadius) * mouseInfluenceStrength
          mouseX = dx * influence
          mouseY = dy * influence
        }

        return (
          <motion.div
            key={`particle-${index}`}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              x: particle.x,
              y: particle.y,
              background: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            animate={{
              x: [
                particle.x + Math.sin(time * 0.01 * particle.speed) * 50 + mouseX,
                particle.x + Math.sin((time + 50) * 0.01 * particle.speed) * 50 + mouseX,
              ],
              y: [
                particle.y + Math.cos(time * 0.01 * particle.speed) * 30 - scrollY * 0.05 * particle.depth + mouseY,
                particle.y +
                  Math.cos((time + 50) * 0.01 * particle.speed) * 30 -
                  scrollY * 0.05 * particle.depth +
                  mouseY,
              ],
              opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + particle.speed * 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        )
      })}
    </div>
  )
}

function ColorStreaks({
  scrollY,
  mousePosition,
  windowSize,
  time,
  isHovering,
}: {
  scrollY: number
  mousePosition: { x: number; y: number }
  windowSize: { width: number; height: number }
  time: number
  isHovering: boolean
}) {
  // Create elegant streaks
  const streaks = [
    // Lavender streak - top right to bottom left
    {
      startX: "80%",
      startY: "10%",
      endX: "20%",
      endY: "90%",
      color: "rgba(139, 92, 246, 0.08)",
      width: "40%",
      height: "150%",
      duration: 25,
      delay: 0,
    },
    // Purple streak - top left to bottom right
    {
      startX: "10%",
      startY: "20%",
      endX: "90%",
      endY: "80%",
      color: "rgba(124, 58, 237, 0.06)",
      width: "35%",
      height: "140%",
      duration: 28,
      delay: 2,
    },
    // Indigo streak - middle to bottom
    {
      startX: "50%",
      startY: "0%",
      endX: "50%",
      endY: "100%",
      color: "rgba(99, 102, 241, 0.07)",
      width: "50%",
      height: "120%",
      duration: 22,
      delay: 5,
    },
    // Pink streak - right to left
    {
      startX: "100%",
      startY: "60%",
      endX: "0%",
      endY: "40%",
      color: "rgba(236, 72, 153, 0.05)",
      width: "45%",
      height: "30%",
      duration: 30,
      delay: 8,
    },
    // Light lavender streak - diagonal
    {
      startX: "70%",
      startY: "30%",
      endX: "30%",
      endY: "70%",
      color: "rgba(167, 139, 250, 0.07)",
      width: "30%",
      height: "130%",
      duration: 26,
      delay: 12,
    },
  ]

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      {streaks.map((streak, index) => (
        <motion.div
          key={index}
          className="absolute opacity-0"
          style={{
            background: `linear-gradient(to bottom right, ${streak.color}, transparent)`,
            width: streak.width,
            height: streak.height,
            borderRadius: "100%",
            filter: "blur(80px)",
            transform: `translate3d(0, ${scrollY * 0.03}px, 0)`,
          }}
          animate={{
            opacity: [0, 0.7, 0],
            left: [streak.startX, streak.endX],
            top: [streak.startY, streak.endY],
          }}
          transition={{
            duration: streak.duration,
            delay: streak.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Mouse-following subtle streak */}
      <motion.div
        className="absolute opacity-0"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
          width: "30vw",
          height: "30vw",
          borderRadius: "50%",
          filter: "blur(60px)",
          left: mousePosition.x,
          top: mousePosition.y,
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          opacity: [0, 0.6, 0],
          scale: [0.8, 1.2],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Elegant flowing lines */}
      <FlowingLines scrollY={scrollY} time={time} />
    </div>
  )
}

function FlowingLines({ scrollY, time }: { scrollY: number; time: number }) {
  // Create elegant flowing lines
  const lines = [
    {
      color: "rgba(139, 92, 246, 0.04)",
      height: "1px",
      top: "20%",
      duration: 20,
      delay: 0,
    },
    {
      color: "rgba(124, 58, 237, 0.03)",
      height: "1px",
      top: "35%",
      duration: 25,
      delay: 5,
    },
    {
      color: "rgba(167, 139, 250, 0.05)",
      height: "1px",
      top: "50%",
      duration: 22,
      delay: 10,
    },
    {
      color: "rgba(99, 102, 241, 0.04)",
      height: "1px",
      top: "65%",
      duration: 28,
      delay: 15,
    },
    {
      color: "rgba(236, 72, 153, 0.03)",
      height: "1px",
      top: "80%",
      duration: 24,
      delay: 20,
    },
  ]

  return (
    <>
      {lines.map((line, index) => (
        <motion.div
          key={index}
          className="absolute w-full"
          style={{
            height: line.height,
            top: line.top,
            background: line.color,
            transform: `translateY(${scrollY * 0.02}px)`,
            boxShadow: `0 0 10px ${line.color}`,
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scaleY: [1, 1.5, 1],
            filter: ["blur(0px)", "blur(1px)", "blur(0px)"],
          }}
          transition={{
            duration: line.duration,
            delay: line.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Vertical flowing lines */}
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={`v-${i}`}
          className="absolute h-full"
          style={{
            width: "1px",
            left: `${i * 20}%`,
            background: "rgba(139, 92, 246, 0.03)",
            transform: `translateX(${scrollY * 0.01}px)`,
            boxShadow: "0 0 8px rgba(139, 92, 246, 0.03)",
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scaleX: [1, 1.5, 1],
            filter: ["blur(0px)", "blur(1px)", "blur(0px)"],
          }}
          transition={{
            duration: 20 + i * 2,
            delay: i * 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  )
}

function GeometricPatterns({
  scrollY,
  mousePosition,
  windowSize,
  time,
}: {
  scrollY: number
  mousePosition: { x: number; y: number }
  windowSize: { width: number; height: number }
  time: number
}) {
  // Create geometric patterns that animate subtly
  const patterns = [
    {
      type: "grid",
      color: "rgba(139, 92, 246, 0.03)",
      size: 40,
      x: windowSize.width * 0.2,
      y: windowSize.height * 0.2,
      width: windowSize.width * 0.3,
      height: windowSize.height * 0.3,
      rotation: 0,
      speed: 0.01,
    },
    {
      type: "dots",
      color: "rgba(124, 58, 237, 0.025)",
      size: 30,
      x: windowSize.width * 0.6,
      y: windowSize.height * 0.3,
      width: windowSize.width * 0.4,
      height: windowSize.height * 0.4,
      rotation: 15,
      speed: 0.015,
    },
    {
      type: "hexagons",
      color: "rgba(167, 139, 250, 0.035)",
      size: 50,
      x: windowSize.width * 0.3,
      y: windowSize.height * 0.6,
      width: windowSize.width * 0.35,
      height: windowSize.height * 0.35,
      rotation: 30,
      speed: 0.02,
    },
  ]

  // Calculate mouse influence for parallax
  const mouseOffsetX = (mousePosition.x - windowSize.width / 2) / 100
  const mouseOffsetY = (mousePosition.y - windowSize.height / 2) / 100

  return (
    <div className="fixed inset-0 -z-19 overflow-hidden pointer-events-none">
      {patterns.map((pattern, index) => (
        <motion.div
          key={`pattern-${index}`}
          className="absolute"
          style={{
            width: pattern.width,
            height: pattern.height,
            x: pattern.x + mouseOffsetX * (index + 1) * 10,
            y: pattern.y + mouseOffsetY * (index + 1) * 10 - scrollY * 0.03,
            background:
              pattern.type === "grid"
                ? `linear-gradient(${pattern.rotation}deg, ${pattern.color} 1px, transparent 1px), 
                   linear-gradient(${pattern.rotation + 90}deg, ${pattern.color} 1px, transparent 1px)`
                : pattern.type === "dots"
                  ? `radial-gradient(${pattern.color} 1px, transparent 1px)`
                  : `repeating-linear-gradient(${pattern.rotation}deg, ${pattern.color}, ${pattern.color} 1px, transparent 1px, transparent ${pattern.size}px)`,
            backgroundSize:
              pattern.type === "grid"
                ? `${pattern.size}px ${pattern.size}px`
                : pattern.type === "dots"
                  ? `${pattern.size}px ${pattern.size}px`
                  : `${pattern.size}px ${pattern.size}px`,
            opacity: 0.7,
          }}
          animate={{
            x: [
              pattern.x + mouseOffsetX * (index + 1) * 10,
              pattern.x + mouseOffsetX * (index + 1) * 10 + Math.sin(time * pattern.speed) * 20,
              pattern.x + mouseOffsetX * (index + 1) * 10,
            ],
            y: [
              pattern.y + mouseOffsetY * (index + 1) * 10 - scrollY * 0.03,
              pattern.y + mouseOffsetY * (index + 1) * 10 - scrollY * 0.03 + Math.cos(time * pattern.speed) * 15,
              pattern.y + mouseOffsetY * (index + 1) * 10 - scrollY * 0.03,
            ],
            rotate: [pattern.rotation, pattern.rotation + 5, pattern.rotation],
            scale: [1, 1.03, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 15 + index * 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

function SoftGradientBackground({
  scrollY,
  mousePosition,
  windowSize,
}: {
  scrollY: number
  mousePosition: { x: number; y: number }
  windowSize: { width: number; height: number }
}) {
  // Calculate positions with subtle parallax
  const gradientOnePosition = {
    x: mousePosition.x * 0.01,
    y: mousePosition.y * 0.01 - scrollY * 0.02,
  }

  const gradientTwoPosition = {
    x: -mousePosition.x * 0.008,
    y: -mousePosition.y * 0.008 - scrollY * 0.01,
  }

  const gradientThreePosition = {
    x: mousePosition.x * 0.005,
    y: mousePosition.y * 0.005 - scrollY * 0.03,
  }

  return (
    <>
      {/* Primary gradient - subtle lavender */}
      <motion.div
        className="fixed -z-15 opacity-20"
        style={{
          position: "fixed",
          top: "-10vh",
          left: "-10vw",
          width: "120vw",
          height: "120vh",
          background: `radial-gradient(circle at ${windowSize.width / 2 + gradientOnePosition.x}px ${
            windowSize.height / 2 + gradientOnePosition.y
          }px, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%)`,
          transform: `translate3d(0, ${scrollY * 0.01}px, 0)`,
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.2, 0.22, 0.2],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Secondary gradient - deeper purple */}
      <motion.div
        className="fixed -z-16 opacity-15"
        style={{
          position: "fixed",
          top: "-10vh",
          right: "-10vw",
          width: "120vw",
          height: "120vh",
          background: `radial-gradient(circle at ${windowSize.width / 3 + gradientTwoPosition.x}px ${
            windowSize.height / 3 + gradientTwoPosition.y
          }px, rgba(124, 58, 237, 0.3) 0%, rgba(124, 58, 237, 0) 70%)`,
          transform: `translate3d(0, ${scrollY * 0.015}px, 0)`,
          filter: "blur(70px)",
        }}
        animate={{
          scale: [1, 1.03, 1],
          opacity: [0.15, 0.17, 0.15],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Tertiary gradient - indigo */}
      <motion.div
        className="fixed -z-17 opacity-10"
        style={{
          position: "fixed",
          bottom: "-10vh",
          left: "20vw",
          width: "80vw",
          height: "80vh",
          background: `radial-gradient(circle at ${windowSize.width * 0.6 + gradientThreePosition.x}px ${
            windowSize.height * 0.7 + gradientThreePosition.y
          }px, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0) 70%)`,
          transform: `translate3d(0, ${scrollY * 0.02}px, 0)`,
          filter: "blur(80px)",
        }}
        animate={{
          scale: [1, 1.04, 1],
          opacity: [0.1, 0.12, 0.1],
        }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Accent gradient - soft pink */}
      <motion.div
        className="fixed -z-18 opacity-10"
        style={{
          position: "fixed",
          top: "30vh",
          right: "10vw",
          width: "50vw",
          height: "50vh",
          background: `radial-gradient(circle at center, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0) 70%)`,
          transform: `translate3d(${mousePosition.x * 0.003}px, ${scrollY * -0.01}px, 0)`,
          filter: "blur(90px)",
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.1, 0.13, 0.1],
        }}
        transition={{
          duration: 22,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Additional lavender accent */}
      <motion.div
        className="fixed -z-19 opacity-15"
        style={{
          position: "fixed",
          bottom: "10vh",
          left: "10vw",
          width: "40vw",
          height: "40vh",
          background: `radial-gradient(ellipse at center, rgba(167, 139, 250, 0.3) 0%, rgba(167, 139, 250, 0) 75%)`,
          transform: `translate3d(${mousePosition.x * -0.002}px, ${scrollY * -0.02}px, 0)`,
          filter: "blur(70px)",
        }}
        animate={{
          scale: [1, 1.03, 1],
          opacity: [0.15, 0.18, 0.15],
        }}
        transition={{
          duration: 28,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </>
  )
}

function DynamicLightEffects({
  scrollY,
  mousePosition,
  windowSize,
  time,
}: {
  scrollY: number
  mousePosition: { x: number; y: number }
  windowSize: { width: number; height: number }
  time: number
}) {
  // Create dynamic light sources
  const lightSources = [
    {
      x: windowSize.width * 0.3,
      y: windowSize.height * 0.2,
      size: 300,
      color: "rgba(139, 92, 246, 0.15)",
      speed: 0.02,
    },
    {
      x: windowSize.width * 0.7,
      y: windowSize.height * 0.3,
      size: 250,
      color: "rgba(124, 58, 237, 0.12)",
      speed: 0.015,
    },
    {
      x: windowSize.width * 0.4,
      y: windowSize.height * 0.7,
      size: 350,
      color: "rgba(167, 139, 250, 0.1)",
      speed: 0.025,
    },
  ]

  // Mouse-following light
  const mouseLight = {
    size: 200,
    color: "rgba(139, 92, 246, 0.08)",
  }

  return (
    <div className="fixed inset-0 -z-12 overflow-hidden pointer-events-none">
      {/* Static light sources */}
      {lightSources.map((light, index) => (
        <motion.div
          key={`light-${index}`}
          className="absolute rounded-full"
          style={{
            width: light.size,
            height: light.size,
            left: light.x,
            top: light.y,
            background: `radial-gradient(circle, ${light.color} 0%, transparent 70%)`,
            transform: "translate(-50%, -50%)",
            filter: "blur(80px)",
          }}
          animate={{
            x: [0, Math.sin(time * light.speed) * 50, 0],
            y: [0, Math.cos(time * light.speed) * 30 - scrollY * 0.05, 0],
            opacity: [0.7, 0.9, 0.7],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15 + index * 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Mouse-following light */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: mouseLight.size,
          height: mouseLight.size,
          left: mousePosition.x,
          top: mousePosition.y,
          background: `radial-gradient(circle, ${mouseLight.color} 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          filter: "blur(60px)",
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Light rays */}
      <LightRays scrollY={scrollY} time={time} windowSize={windowSize} />
    </div>
  )
}

function LightRays({
  scrollY,
  time,
  windowSize,
}: {
  scrollY: number
  time: number
  windowSize: { width: number; height: number }
}) {
  // Create light rays that emanate from different points
  const rays = [
    {
      x: windowSize.width * 0.3,
      y: windowSize.height * 0.2,
      length: 300,
      width: 1,
      color: "rgba(139, 92, 246, 0.1)",
      angle: 45,
      speed: 0.05,
    },
    {
      x: windowSize.width * 0.7,
      y: windowSize.height * 0.3,
      length: 250,
      width: 2,
      color: "rgba(124, 58, 237, 0.08)",
      angle: 135,
      speed: 0.03,
    },
    {
      x: windowSize.width * 0.4,
      y: windowSize.height * 0.7,
      length: 200,
      width: 1,
      color: "rgba(167, 139, 250, 0.12)",
      angle: 225,
      speed: 0.04,
    },
  ]

  return (
    <>
      {rays.map((ray, index) => (
        <motion.div
          key={`ray-${index}`}
          className="absolute origin-top"
          style={{
            width: ray.width,
            height: ray.length,
            left: ray.x,
            top: ray.y,
            background: `linear-gradient(to bottom, ${ray.color}, transparent)`,
            transform: `rotate(${ray.angle}deg)`,
            transformOrigin: "top",
            filter: "blur(2px)",
          }}
          animate={{
            height: [ray.length * 0.8, ray.length * 1.2, ray.length * 0.8],
            opacity: [0.6, 1, 0.6],
            rotate: [ray.angle, ray.angle + 10 * Math.sin(time * ray.speed), ray.angle],
          }}
          transition={{
            duration: 10 + index * 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  )
}

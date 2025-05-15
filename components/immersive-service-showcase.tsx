"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion } from "framer-motion"

const ImmersiveServiceShowcase = () => {
  const [isHovering, setIsHovering] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const showcaseRef = useRef<HTMLDivElement>(null)

  // Generate random particles for background effect
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 15 + 10,
  }))

  // Handle mouse move for 3D effect with debounce
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!showcaseRef.current || !isHovering) return

    const rect = showcaseRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    setMousePosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setMousePosition({ x: 0, y: 0 })
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.div
      ref={containerRef}
      className={`w-full py-12 md:py-20 relative overflow-hidden ${isExpanded ? "min-h-[700px]" : "min-h-[550px]"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative">
            <motion.div
              ref={showcaseRef}
              className="relative rounded-lg overflow-hidden shadow-lg"
              style={{
                transformStyle: "preserve-3d",
                perspective: "600px",
              }}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Particle Background */}
              <div className="absolute inset-0">
                {particles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-white opacity-40"
                    style={{
                      width: `${particle.size}px`,
                      height: `${particle.size}px`,
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      transformOrigin: "center",
                      translateX: "-50%",
                      translateY: "-50%",
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 0, 0.4],
                    }}
                    transition={{
                      duration: particle.duration,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  />
                ))}
              </div>

              <motion.img
                src="/placeholder-image.jpg"
                alt="Immersive Service"
                className="w-full h-full object-cover"
                style={{
                  transform: `rotateX(${mousePosition.y * 20}deg) rotateY(${mousePosition.x * 20}deg) translateZ(50px)`,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </motion.div>
          </div>

          <div>
            <h2 className="text-3xl font-semibold mb-4">Immersive Service Showcase</h2>
            <p className="text-gray-600 mb-6">
              Experience our innovative service in a whole new way. Our immersive showcase allows you to explore the
              features and benefits like never before.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleToggleExpand}
            >
              {isExpanded ? "Show Less" : "Learn More"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ImmersiveServiceShowcase

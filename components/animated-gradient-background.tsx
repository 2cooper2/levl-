"use client"

import { useEffect, useRef } from "react"

export function AnimatedGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set initial dimensions
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const resizeCanvas = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener("resize", resizeCanvas)

    // Create gradient circles with improved aesthetics - reduced number for better performance
    const circles = [
      {
        x: width * 0.3,
        y: height * 0.4,
        radius: 300,
        vx: 0.02,
        vy: -0.01,
        hue: 230,
        opacity: 0.07,
      },
      {
        x: width * 0.7,
        y: height * 0.6,
        radius: 350,
        vx: -0.01,
        vy: 0.02,
        hue: 270,
        opacity: 0.08,
      },
    ]

    const animate = () => {
      // Clear canvas with a slight fade effect
      ctx.fillStyle = "rgba(var(--background), 0.05)"
      ctx.fillRect(0, 0, width, height)

      // Draw circles
      for (const circle of circles) {
        circle.x += circle.vx
        circle.y += circle.vy

        // Simple edge bounce
        if (circle.x < 0 || circle.x > width) {
          circle.vx *= -1
          circle.x = Math.max(0, Math.min(width, circle.x))
        }
        if (circle.y < 0 || circle.y > height) {
          circle.vy *= -1
          circle.y = Math.max(0, Math.min(height, circle.y))
        }

        // Simplified gradient
        const gradient = ctx.createRadialGradient(circle.x, circle.y, 0, circle.x, circle.y, circle.radius)
        gradient.addColorStop(0, `hsla(${circle.hue}, 85%, 65%, ${circle.opacity})`)
        gradient.addColorStop(1, `hsla(${circle.hue}, 85%, 45%, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 opacity-40 dark:opacity-25"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  )
}

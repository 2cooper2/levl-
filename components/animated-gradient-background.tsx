"use client"

import { useEffect, useRef } from "react"

export function AnimatedGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set initial dimensions with significant extra width to prevent any gaps
    let width = (canvas.width = window.innerWidth + 100)
    let height = (canvas.height = window.innerHeight)

    const resizeCanvas = () => {
      width = canvas.width = window.innerWidth + 100 // Add extra width to prevent gaps
      height = canvas.height = window.innerHeight
    }

    window.addEventListener("resize", resizeCanvas)

    // Create gradient circles with improved aesthetics
    const circles: Circle[] = []

    // Optimize with fewer circles
    for (let i = 0; i < 4; i++) {
      circles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 300 + 200,
        vx: Math.random() * 0.1 - 0.05,
        vy: Math.random() * 0.1 - 0.05,
        hue: Math.random() * 40 + 210,
        opacity: Math.random() * 0.1 + 0.05,
      })
    }

    // Keep just one accent circle
    circles.push({
      x: width * 0.8,
      y: height * 0.2,
      radius: 350,
      vx: -0.04,
      vy: 0.02,
      hue: 270, // Purple accent
      opacity: 0.08,
    })

    const animate = () => {
      // Clear canvas with a slight fade effect for smoother transitions
      ctx.fillStyle = "rgba(var(--background), 0.03)"
      ctx.fillRect(0, 0, width, height)

      // Simplified drawing of circles
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
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 opacity-40 dark:opacity-25"
        style={{
          width: "calc(100vw + 100px)",
          height: "100vh",
          left: "-50px",
          right: "-50px",
        }}
      />
    </>
  )
}

interface Circle {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  hue: number
  opacity: number
}

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

    // Add more circles with varied sizes and speeds for a richer effect
    for (let i = 0; i < 5; i++) {
      circles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 300 + 200, // Slightly smaller radius range
        vx: Math.random() * 0.1 - 0.05, // Slower movement for better performance
        vy: Math.random() * 0.1 - 0.05,
        hue: Math.random() * 40 + 210, // More focused blue-purple palette
        opacity: Math.random() * 0.12 + 0.04, // Slightly reduced opacity
      })
    }

    // Add a few accent circles with different colors
    circles.push({
      x: width * 0.2,
      y: height * 0.8,
      radius: 300,
      vx: 0.05,
      vy: -0.03,
      hue: 180, // Teal accent
      opacity: 0.07,
    })

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
      // Use a more efficient clear method
      ctx.globalAlpha = 0.03
      ctx.fillStyle = "rgba(var(--background), 1)"
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1

      // Draw and update circles
      for (const circle of circles) {
        // Move circle with improved physics
        circle.x += circle.vx
        circle.y += circle.vy

        // Bounce off edges with slight dampening for natural movement
        if (circle.x < 0 || circle.x > width) {
          circle.vx *= -0.98
          circle.x = Math.max(0, Math.min(width, circle.x))
        }
        if (circle.y < 0 || circle.y > height) {
          circle.vy *= -0.98
          circle.y = Math.max(0, Math.min(height, circle.y))
        }

        // Create gradient with improved color blending
        const gradient = ctx.createRadialGradient(circle.x, circle.y, 0, circle.x, circle.y, circle.radius)

        gradient.addColorStop(0, `hsla(${circle.hue}, 85%, 65%, ${circle.opacity})`)
        gradient.addColorStop(0.5, `hsla(${circle.hue}, 85%, 55%, ${circle.opacity * 0.5})`)
        gradient.addColorStop(1, `hsla(${circle.hue}, 85%, 45%, 0)`)

        // Draw circle
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
      <div
        className="fixed -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"
        style={{
          width: "calc(100vw + 100px)",
          height: "100vh",
          left: "-50px",
          right: "-50px",
          top: 0,
        }}
      ></div>
      <div
        className="fixed -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent pointer-events-none"
        style={{
          width: "calc(100vw + 100px)",
          height: "100vh",
          left: "-50px",
          right: "-50px",
          top: 0,
        }}
      ></div>

      {/* Additional full-width background to ensure coverage */}
      <div
        className="fixed -z-15 bg-background pointer-events-none"
        style={{
          width: "calc(100vw + 100px)",
          height: "100vh",
          left: "-50px",
          right: "-50px",
          top: 0,
        }}
      ></div>
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

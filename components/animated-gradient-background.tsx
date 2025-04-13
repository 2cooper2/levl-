"use client"

import { useEffect, useRef } from "react"

export function AnimatedGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const resizeCanvas = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener("resize", resizeCanvas)

    // Create gradient circles with improved aesthetics
    const circles: Circle[] = []

    // Add more circles with varied sizes and speeds for a richer effect
    for (let i = 0; i < 8; i++) {
      circles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 400 + 200, // Larger radius range
        vx: Math.random() * 0.15 - 0.075, // Slower, more subtle movement
        vy: Math.random() * 0.15 - 0.075,
        hue: Math.random() * 40 + 210, // More focused blue-purple palette
        opacity: Math.random() * 0.15 + 0.05, // Varied opacity for depth
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
      // Clear canvas with a slight fade effect for smoother transitions
      ctx.fillStyle = "rgba(var(--background), 0.03)"
      ctx.fillRect(0, 0, width, height)

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
      <canvas ref={canvasRef} className="fixed inset-0 -z-10 w-full h-full opacity-40 dark:opacity-25" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent pointer-events-none"></div>
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

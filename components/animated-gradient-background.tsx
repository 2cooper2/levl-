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

    // Create gradient circles
    const circles: Circle[] = []
    for (let i = 0; i < 5; i++) {
      circles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 300 + 100,
        vx: Math.random() * 0.2 - 0.1,
        vy: Math.random() * 0.2 - 0.1,
        hue: Math.random() * 60 + 200, // Blue to purple range
      })
    }

    const animate = () => {
      // Clear canvas with a slight fade effect
      ctx.fillStyle = "rgba(var(--background), 0.05)"
      ctx.fillRect(0, 0, width, height)

      // Draw and update circles
      for (const circle of circles) {
        // Move circle
        circle.x += circle.vx
        circle.y += circle.vy

        // Bounce off edges
        if (circle.x < 0 || circle.x > width) circle.vx *= -1
        if (circle.y < 0 || circle.y > height) circle.vy *= -1

        // Create gradient
        const gradient = ctx.createRadialGradient(circle.x, circle.y, 0, circle.x, circle.y, circle.radius)

        gradient.addColorStop(0, `hsla(${circle.hue}, 80%, 60%, 0.2)`)
        gradient.addColorStop(1, `hsla(${circle.hue}, 80%, 60%, 0)`)

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

  return <canvas ref={canvasRef} className="absolute inset-0 -z-10 w-full h-full opacity-30 dark:opacity-20" />
}

interface Circle {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  hue: number
}

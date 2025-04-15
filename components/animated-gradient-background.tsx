"use client"

import { useEffect, useRef, useState } from "react"

export function AnimatedGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [scrollY, setScrollY] = useState(0)

  // Fix: Define handleScroll outside of useEffect or consolidate scroll logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true }) // Enable alpha for better blending
    if (!ctx) return

    // Define handleScroll here so it's accessible in the cleanup function
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Make sure canvas covers the entire viewport plus some extra
    const updateCanvasSize = () => {
      const width = Math.max(window.innerWidth, document.documentElement.clientWidth) + 100
      const height = Math.max(window.innerHeight, document.documentElement.clientHeight) + 100

      // Set device pixel ratio for sharper rendering
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      // Set canvas size in CSS - make it larger than viewport to ensure coverage
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      return { width, height }
    }

    let { width, height } = updateCanvasSize()

    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout | null = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const newSize = updateCanvasSize()
        width = newSize.width
        height = newSize.height
      }, 200)
    }

    window.addEventListener("resize", handleResize, { passive: true })

    // Create gradient circles with depth
    const circles: Circle[] = []

    // Create circles with varying depths
    for (let i = 0; i < 6; i++) {
      const depth = Math.random() * 0.8 + 0.2 // 0.2 to 1.0 - used for parallax effect

      circles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 600 + 400,
        vx: (Math.random() * 0.08 - 0.04) * (1 - depth * 0.5), // Deeper circles move slower
        vy: (Math.random() * 0.08 - 0.04) * (1 - depth * 0.5),
        hue: Math.random() * 40 + 210, // Blue-purple palette
        opacity: 0.04 + depth * 0.08, // Deeper circles are more visible
        depth,
        lastParallaxY: 0,
      })
    }

    // Add specific circles to ensure coverage of right side with depth
    circles.push({
      x: width * 0.8,
      y: height * 0.5,
      radius: 600,
      vx: -0.01,
      vy: 0.01,
      hue: 240, // Blue
      opacity: 0.08,
      depth: 0.3, // Far back
      lastParallaxY: 0,
    })

    circles.push({
      x: width * 0.9,
      y: height * 0.2,
      radius: 500,
      vx: -0.02,
      vy: 0.01,
      hue: 270, // Purple
      opacity: 0.07,
      depth: 0.7, // Closer
      lastParallaxY: 0,
    })

    // Add a warm accent for contrast and depth
    circles.push({
      x: width * 0.2,
      y: height * 0.8,
      radius: 450,
      vx: 0.01,
      vy: -0.01,
      hue: 330, // Pink/magenta
      opacity: 0.06,
      depth: 0.5, // Middle
      lastParallaxY: 0,
    })

    let lastTime = 0
    const fps = 30 // Limit to 30 FPS for better performance
    const interval = 1000 / fps

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime

      if (deltaTime > interval) {
        // Clear canvas with transparent background for better layering
        ctx.clearRect(0, 0, width, height)

        // Draw and update circles with depth
        for (const circle of circles) {
          // Apply parallax effect based on scroll
          const parallaxY = scrollY * circle.depth * 0.1

          // Move circle with improved physics
          circle.x += circle.vx
          circle.y += circle.vy + (parallaxY - circle.lastParallaxY)
          circle.lastParallaxY = parallaxY

          // Bounce off edges with slight dampening - extend boundaries to prevent gaps
          if (circle.x < -circle.radius * 0.5 || circle.x > width + circle.radius * 0.5) {
            circle.vx *= -0.98
            circle.x = Math.max(-circle.radius * 0.5, Math.min(width + circle.radius * 0.5, circle.x))
          }
          if (circle.y < -circle.radius * 0.5 || circle.y > height + circle.radius * 0.5) {
            circle.vy *= -0.98
            circle.y = Math.max(-circle.radius * 0.5, Math.min(height + circle.radius * 0.5, circle.y))
          }

          // Create gradient with improved color blending and depth
          const gradient = ctx.createRadialGradient(circle.x, circle.y, 0, circle.x, circle.y, circle.radius)

          // Add more color stops for better depth
          gradient.addColorStop(0, `hsla(${circle.hue}, 85%, 65%, ${circle.opacity})`)
          gradient.addColorStop(0.3, `hsla(${circle.hue}, 85%, 60%, ${circle.opacity * 0.7})`)
          gradient.addColorStop(0.7, `hsla(${circle.hue}, 85%, 55%, ${circle.opacity * 0.3})`)
          gradient.addColorStop(1, `hsla(${circle.hue}, 85%, 45%, 0)`)

          // Draw circle
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
          ctx.fill()
        }

        lastTime = currentTime - (deltaTime % interval)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      // Clean up all event listeners and animation frames
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  }, [scrollY]) // Include scrollY in dependencies

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed -z-10 opacity-40 dark:opacity-25"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
          imageRendering: "optimizeSpeed",
        }}
      />

      {/* Depth layer 1 - Static gradient */}
      <div
        className="fixed -z-11 pointer-events-none"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0) 50%)",
          transform: `translate3d(0, ${scrollY * 0.02}px, 0)`,
        }}
      />

      {/* Depth layer 2 - Bottom right gradient with parallax */}
      <div
        className="fixed -z-12 pointer-events-none"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background:
            "radial-gradient(ellipse at bottom right, rgba(147, 51, 234, 0.07) 0%, rgba(147, 51, 234, 0) 70%)",
          transform: `translate3d(0, ${scrollY * -0.03}px, 0)`,
        }}
      />

      {/* Depth layer 3 - Additional accent for depth */}
      <div
        className="fixed -z-13 pointer-events-none"
        style={{
          position: "fixed",
          top: "30vh",
          left: "10vw",
          width: "40vw",
          height: "40vh",
          background: "radial-gradient(circle at center, rgba(236, 72, 153, 0.05) 0%, rgba(236, 72, 153, 0) 70%)",
          transform: `translate3d(0, ${scrollY * 0.05}px, 0)`,
          filter: "blur(40px)",
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
  depth: number
  lastParallaxY: number
}

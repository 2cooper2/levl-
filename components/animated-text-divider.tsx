"use client"
import { useEffect, useState } from "react"

interface AnimatedTextDividerProps {
  firstText?: string
  secondText?: string
  thirdText?: string
  className?: string
}

export function AnimatedTextDivider({
  firstText = "LEARN",
  secondText = "GROW YOUR BUSINESS",
  thirdText = "EARN",
  className = "",
}: AnimatedTextDividerProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return (
    <section
      className={`relative w-full py-12 md:py-16 overflow-hidden ${className}`}
      aria-label={`${firstText} and ${secondText} section`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-background pointer-events-none"></div>

      {/* Enhanced background with gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-background"></div>

        {/* Diagonal gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-lavender-300/30 via-transparent to-purple-400/30 dark:from-lavender-600/30 dark:via-transparent dark:to-purple-800/30"></div>

        {/* Radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)]"></div>

        {/* Subtle color shifts */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-pink-300/5 to-transparent dark:via-pink-600/5"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex flex-col items-center max-w-5xl mx-auto w-full">
            {/* First word */}
            <div className="relative mb-3 md:mb-4 group w-full">
              {/* Luxury frame */}
              <div
                className="absolute -inset-6 md:-inset-8"
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  background:
                    "linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0) 100%)",
                  opacity: 0.7,
                }}
              ></div>

              {/* Corner accents */}
              <div
                className="absolute top-0 left-0 w-4 h-4 md:w-6 md:h-6"
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              ></div>
              <div
                className="absolute top-0 right-0 w-4 h-4 md:w-6 md:h-6"
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRight: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              ></div>
              <div
                className="absolute bottom-0 left-0 w-4 h-4 md:w-6 md:h-6"
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              ></div>
              <div
                className="absolute bottom-0 right-0 w-4 h-4 md:w-6 md:h-6"
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRight: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              ></div>

              {/* Luxury text container */}
              <div className="relative px-8 py-2 flex flex-col items-center">
                {/* Elegant label */}
                <span
                  className="text-sm tracking-[0.4em] uppercase mb-1 opacity-80"
                  style={{
                    color: "#ffffff",
                    fontFamily: "'Montserrat', sans-serif",
                    letterSpacing: "0.4em",
                    fontWeight: 300,
                    position: "relative",
                    textShadow: "0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)",
                  }}
                >
                  Elevate Your Potential
                </span>

                {/* Main heading */}
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl relative tracking-widest"
                  style={{
                    color: "#ffffff",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    letterSpacing: "0.15em",
                    lineHeight: 1.2,
                    textAlign: "center",
                    textTransform: "uppercase",
                    textShadow: "0 6px 12px rgba(0,0,0,0.4), 0 0 40px rgba(255,255,255,0.25)",
                  }}
                >
                  {firstText}
                </h2>
              </div>
            </div>

            {/* Middle word */}
            <div className="relative mb-3 md:mb-4 group w-full">
              {/* Luxury frame */}
              <div
                className="absolute -inset-6 md:-inset-8"
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  background:
                    "linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0) 100%)",
                  opacity: 0.7,
                }}
              ></div>

              {/* Corner accents */}
              <div
                className="absolute top-0 left-0 w-4 h-4 md:w-6 md:h-6"
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              ></div>
              <div
                className="absolute top-0 right-0 w-4 h-4 md:w-6 md:h-6"
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRight: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              ></div>
              <div
                className="absolute bottom-0 left-0 w-4 h-4 md:w-6 md:h-6"
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              ></div>
              <div
                className="absolute bottom-0 right-0 w-4 h-4 md:w-6 md:h-6"
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRight: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              ></div>

              {/* Luxury text container */}
              <div className="relative px-8 py-2 flex flex-col items-center">
                {/* Main heading */}
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl relative tracking-widest"
                  style={{
                    color: "#ffffff",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    letterSpacing: "0.15em",
                    lineHeight: 1.2,
                    textAlign: "center",
                    textTransform: "uppercase",
                    textShadow: "0 4px 8px rgba(0,0,0,0.3), 0 0 25px rgba(255,255,255,0.2)",
                    opacity: 0.9,
                  }}
                >
                  {secondText}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

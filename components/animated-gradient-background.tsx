"use client"

export function AnimatedGradientBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
      style={{ willChange: "auto" }}
    >
      {/* Primary gradient background - pure CSS, no JS animation */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at 20% 80%, hsla(180, 85%, 65%, 0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, hsla(270, 85%, 65%, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, hsla(230, 85%, 65%, 0.06) 0%, transparent 60%)",
        }}
      />
      {/* Top gradient overlay */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"
      />
      {/* Bottom-right gradient overlay */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent"
      />
    </div>
  )
}

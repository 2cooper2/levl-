import type { SVGProps } from "react"

export function LevlLogo({ className, ...props }: SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      {...props}
    >
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/D86926DF-2501-4C99-9452-927116E45324-oXEcNS38lLlIRweavHw5KIvvgR32ot.jpeg"
        alt="LevL Logo"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  )
}

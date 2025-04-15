import type { SVGProps } from "react"

export function LevlLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="none"
      className={props.className}
      {...props}
    >
      {/* Modern Levl logo with rounded squares and diagonal element positioned at the very top */}
      <g transform="translate(2, 2) scale(0.85)">
        {/* Top left square */}
        <rect x="1" y="1" width="8" height="8" rx="2" fill="#7C3AED" />

        {/* Bottom left square */}
        <rect x="1" y="10" width="8" height="8" rx="2" fill="#8B5CF6" />

        {/* Bottom right square */}
        <rect x="10" y="10" width="8" height="8" rx="2" fill="#7C3AED" />

        {/* Larger diagonal flag/ribbon element positioned at the very top */}
        <path d="M11 0.5 L18 0.5 L18 7.5 L11 0.5 Z" fill="#9333EA" />
      </g>
    </svg>
  )
}

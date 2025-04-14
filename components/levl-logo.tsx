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
      {/* Circular path (invisible) that guides the dots */}
      <circle cx="12" cy="12" r="7" fill="none" />

      {/* Four dots arranged in a circle, with the top dot highlighted */}
      <circle cx="12" cy="5" r="2.2" fill="#5B21B6" opacity="1" />
      <circle cx="19" cy="12" r="1.8" fill="#5B21B6" opacity="0.7" />
      <circle cx="12" cy="19" r="1.8" fill="#5B21B6" opacity="0.5" />
      <circle cx="5" cy="12" r="1.8" fill="#5B21B6" opacity="0.3" />

      {/* Optional: central dot */}
      <circle cx="12" cy="12" r="1" fill="#5B21B6" opacity="0.5" />
    </svg>
  )
}

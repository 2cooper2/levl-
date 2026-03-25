import { cn } from "@/lib/utils"
import { Sparkles, Award, DollarSign } from "lucide-react"

type BadgeType = "ai" | "founder" | "fees"

interface FeatureBadgeProps {
  type: BadgeType
  className?: string
  size?: "sm" | "md" | "lg"
}

export function FeatureBadge({ type, className, size = "md" }: FeatureBadgeProps) {
  // Define size classes
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-0.5",
    md: "text-xs px-2 py-1 gap-1",
    lg: "text-sm px-2.5 py-1 gap-1.5",
  }

  // Define badge configurations
  const badgeConfig = {
    ai: {
      icon: <Sparkles className={size === "sm" ? "h-2.5 w-2.5" : size === "md" ? "h-3 w-3" : "h-4 w-4"} />,
      text: "AI-Powered",
      colors: "bg-primary/20 text-primary",
    },
    founder: {
      icon: <Award className={size === "sm" ? "h-2.5 w-2.5" : size === "md" ? "h-3 w-3" : "h-4 w-4"} />,
      text: "Founder: 3K+ Gigs",
      colors: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    },
    fees: {
      icon: <DollarSign className={size === "sm" ? "h-2.5 w-2.5" : size === "md" ? "h-3 w-3" : "h-4 w-4"} />,
      text: "Lower Fees",
      colors: "bg-green-500/20 text-green-600 dark:text-green-400",
    },
  }

  const config = badgeConfig[type]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium transition-colors",
        sizeClasses[size],
        config.colors,
        className,
      )}
    >
      {config.icon}
      {config.text}
    </span>
  )
}

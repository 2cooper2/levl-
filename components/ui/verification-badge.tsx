"use client"

import { motion } from "framer-motion"
import { CheckCircle, Shield, Award, BadgeCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type VerificationLevel = "basic" | "identity" | "background" | "expert"

interface VerificationBadgeProps {
  level: VerificationLevel
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
  className?: string
}

export function VerificationBadge({ level, size = "md", showTooltip = true, className = "" }: VerificationBadgeProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  const badgeConfig = {
    basic: {
      icon: CheckCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      pulseColor: "bg-blue-500",
      title: "Basic Verification",
      description: "Email and phone verified",
    },
    identity: {
      icon: Shield,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      pulseColor: "bg-green-500",
      title: "Identity Verified",
      description: "Government ID verified",
    },
    background: {
      icon: BadgeCheck,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      pulseColor: "bg-purple-500",
      title: "Background Checked",
      description: "Comprehensive background check completed",
    },
    expert: {
      icon: Award,
      color: "text-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      pulseColor: "bg-amber-500",
      title: "Certified Expert",
      description: "Skills verified by independent assessment",
    },
  }

  const config = badgeConfig[level]
  const IconComponent = config.icon

  const badge = (
    <motion.div
      className={`inline-flex items-center gap-1 ${config.bgColor} ${config.color} px-2 py-0.5 rounded-full ${className}`}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        <IconComponent className={sizeClasses[size]} />
        <motion.span
          className={`absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full ${config.pulseColor}`}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>
      <span className={textSize[size]}>{config.title}</span>
    </motion.div>
  )

  if (!showTooltip) return badge

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <div className="text-sm font-medium">{config.title}</div>
          <div className="text-xs text-gray-500">{config.description}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

"use client"

import { motion } from "framer-motion"
import { Star, CheckCircle, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ServiceProvider } from "@/types/matchmaker"

interface ProviderCardProps {
  provider: ServiceProvider
  onSelect: (providerId: string | number) => void
  onViewServices: (providerId: string | number) => void
  onContact: (providerId: string | number) => void
}

export function ProviderCard({ provider, onSelect, onViewServices, onContact }: ProviderCardProps) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden group transition-all transform translate-y-0 hover:translate-y-[-4px] duration-300"
      style={{
        background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.82))",
        border: "1px solid rgba(167,139,250,0.45)",
        boxShadow:
          "0 24px 48px -8px rgba(0,0,0,0.4), 0 12px 20px -6px rgba(0,0,0,0.25), 0 -2px 6px 0 rgba(255,255,255,0.9) inset",
      }}
    >
      {/* Header with very light gradient (matches the light date cells, not the selected one) */}
      <div
        className="h-24 relative"
        style={{
          background:
            "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.6))",
        }}
      >
        {/* Subtle corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-lavender-200/15 to-transparent rounded-bl-[100px]"></div>
        {/* Avatar */}
        <div className="absolute -bottom-10 left-4">
          <div className="h-20 w-20 rounded-full border-4 border-lavender-300/70 dark:border-lavender-500/70 overflow-hidden shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08),0_4px_8px_-4px_rgba(0,0,0,0.06)] flex items-center justify-center bg-lavender-100/70 dark:bg-lavender-600/70">
            <span className="text-2xl font-bold text-lavender-600 dark:text-lavender-100">
              {provider.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 px-4 pb-4">
        {/* Name and verification */}
        <div className="flex items-center mb-1">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{provider.name}</h3>
          {provider.verified && (
            <Badge
              variant="outline"
              className="ml-2 bg-lavender-50/80 text-lavender-600 dark:bg-lavender-700/20 dark:text-lavender-100 border-lavender-200/60 dark:border-lavender-600/40"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(provider.rating)
                    ? "fill-lavender-500 text-lavender-500"
                    : i < provider.rating
                      ? "fill-lavender-300/50 text-lavender-300/50"
                      : "fill-lavender-100 text-lavender-100 dark:fill-lavender-200/20 dark:text-lavender-200/20"
                } mr-0.5`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{provider.rating}</span>
          <span className="text-xs text-lavender-600 dark:text-lavender-300 ml-1">({provider.reviews} reviews)</span>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          {/* Response time */}
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-lavender-500" />
            <span>
              Responds in <span className="font-medium">{provider.responseTime}</span>
            </span>
          </div>

          {/* Completion rate */}
          <div className="flex flex-col text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-lavender-500" />
              <span>
                <span className="font-medium">{provider.completionRate}%</span> Completion rate
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-lavender-400 to-lavender-500 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${provider.completionRate}%` }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div>
          <Button
            className="w-full transition-all duration-300 relative overflow-hidden group/button rounded-xl py-2.5 font-bold"
            style={{
              background:
                "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.8))",
              border: "1px solid rgba(167,139,250,0.45)",
              boxShadow:
                "0 4px 10px -3px rgba(0,0,0,0.25), 0 2px 4px -2px rgba(0,0,0,0.15), 0 -1px 3px 0 rgba(255,255,255,0.9) inset",
              color: "#7c3aed",
            }}
            onClick={() => onSelect(provider.id)}
          >
            <span className="relative z-10">Select</span>
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-lavender-500/0 via-white/20 to-lavender-500/0 -translate-x-full group-hover/button:translate-x-full transition-transform duration-1000"></span>
          </Button>
        </div>
      </div>
    </div>
  )
}

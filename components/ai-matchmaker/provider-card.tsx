"use client"

import { motion } from "framer-motion"
import { Star, CheckCircle, MessageCircle, Calendar, Shield, Clock, ArrowRight } from "lucide-react"
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
    <div className="relative rounded-xl overflow-hidden group transition-all bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 hover:translate-y-[-4px] transition-all duration-300">
      {/* Header with background gradient - using exact AI chat bubble colors */}
      <div className="h-24 bg-gradient-to-br from-lavender-100/80 via-white/80 to-lavender-200/80 dark:from-lavender-900/30 dark:via-gray-800/30 dark:to-lavender-800/30 relative">
        {/* Add decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-lavender-300/40 to-transparent rounded-bl-[100px] dark:from-lavender-600/20"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lavender-400/80 to-lavender-600/80 rounded-t-xl"></div>
        {/* Avatar */}
        <div className="absolute -bottom-10 left-4">
          <div className="h-20 w-20 rounded-full border-4 border-lavender-400/80 dark:border-lavender-600/80 overflow-hidden shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center bg-lavender-200/80 dark:bg-lavender-700/80">
            <span className="text-2xl font-bold text-lavender-800 dark:text-lavender-200">
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
              className="ml-2 bg-lavender-100/80 text-lavender-800 dark:bg-lavender-800/30 dark:text-lavender-200 border-lavender-300/70 dark:border-lavender-700/50"
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
                    ? "fill-lavender-700 text-lavender-700"
                    : i < provider.rating
                      ? "fill-lavender-400/50 text-lavender-400/50"
                      : "fill-lavender-200 text-lavender-200 dark:fill-lavender-300/30 dark:text-lavender-300/30"
                } mr-0.5`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{provider.rating}</span>
          <span className="text-xs text-lavender-800 dark:text-lavender-400 ml-1">({provider.reviews} reviews)</span>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          {/* Response time */}
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-lavender-700" />
            <span>
              Responds in <span className="font-medium">{provider.responseTime}</span>
            </span>
          </div>

          {/* Completion rate */}
          <div className="flex flex-col text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-lavender-700" />
              <span>
                <span className="font-medium">{provider.completionRate}%</span> Completion rate
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-lavender-700 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${provider.completionRate}%` }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-between border-lavender-300/70 dark:border-lavender-700/50 hover:bg-lavender-100/80 dark:hover:bg-lavender-800/20 group-hover:shadow-sm transition-all"
            onClick={() => onViewServices(provider.id)}
          >
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-lavender-700" />
              View Services
            </span>
            <ArrowRight className="h-4 w-4 text-lavender-400" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between border-lavender-400 dark:border-lavender-700 hover:bg-lavender-200 dark:hover:bg-lavender-700/30"
            onClick={() => onContact(provider.id)}
          >
            <span className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2 text-lavender-700" />
              Contact
            </span>
            <ArrowRight className="h-4 w-4 text-lavender-400" />
          </Button>

          <Button
            className="w-full bg-gradient-to-r from-lavender-500 to-lavender-600 hover:from-lavender-600 hover:to-lavender-700 text-white shadow-[0_4px_12px_-2px_rgba(124,58,237,0.3),0_2px_6px_-1px_rgba(124,58,237,0.2)] hover:shadow-[0_6px_18px_-2px_rgba(124,58,237,0.4),0_3px_8px_-1px_rgba(124,58,237,0.3)] transition-all duration-300"
            onClick={() => onSelect(provider.id)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </div>
      </div>
    </div>
  )
}

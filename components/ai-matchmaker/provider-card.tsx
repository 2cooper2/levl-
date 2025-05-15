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
    <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white/95 via-white/90 to-lavender-200/90">
      {/* Header with background gradient - using exact AI chat bubble colors */}
      <div className="h-24 bg-gradient-to-br from-white/95 via-white/90 to-lavender-300/90 relative">
        {/* Avatar */}
        <div className="absolute -bottom-10 left-4">
          <div className="h-20 w-20 rounded-full border-4 border-lavender-400 dark:border-lavender-700 overflow-hidden shadow-md flex items-center justify-center bg-lavender-200 dark:bg-lavender-700">
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
              className="ml-2 bg-lavender-200 text-lavender-800 dark:bg-lavender-700/30 dark:text-lavender-200 border-lavender-400 dark:border-lavender-700"
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
            className="w-full justify-between border-lavender-400 dark:border-lavender-700 hover:bg-lavender-200 dark:hover:bg-lavender-700/30"
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
            className="w-full bg-lavender-700 hover:bg-lavender-800 text-white"
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

"use client"

import { motion } from "framer-motion"
import { Star, Clock, Shield, CheckCircle, MessageCircle, Calendar } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ServiceProvider } from "@/types/matchmaker"

interface ProviderCardProps {
  provider: ServiceProvider
  onSelect: (providerId: string | number) => void
  onViewServices: (providerId: string | number) => void
  onContact: (providerId: string | number) => void
  matchScore?: number
}

export function ProviderCard({ provider, onSelect, onViewServices, onContact, matchScore }: ProviderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="relative">
        {/* Cover image */}
        <div className="h-24 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {/* Avatar */}
        <div className="absolute -bottom-10 left-4">
          <div className="relative h-20 w-20 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden">
            <Image src={provider.avatar || "/placeholder.svg"} alt={provider.name} layout="fill" objectFit="cover" />
          </div>
        </div>

        {/* Verification badge */}
        {provider.verified && (
          <div className="absolute -bottom-2 left-16">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}

        {/* Match score */}
        {matchScore && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-indigo-600 text-white">{matchScore}% Match</Badge>
          </div>
        )}
      </div>

      <div className="pt-12 px-4 pb-4">
        <h3 className="font-semibold text-lg">{provider.name}</h3>

        <div className="mt-2 space-y-2">
          {/* Rating */}
          <div className="flex items-center text-sm">
            <Star className="h-4 w-4 mr-1.5 text-amber-500" />
            <span className="font-medium">{provider.rating}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">({provider.reviews} reviews)</span>
          </div>

          {/* Response time */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Clock className="h-4 w-4 mr-1.5 text-blue-500" />
            <span>Responds in {provider.responseTime}</span>
          </div>

          {/* Completion rate */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Shield className="h-4 w-4 mr-1.5 text-green-500" />
            <span>{provider.completionRate}% Completion rate</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => onViewServices(provider.id)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            View Services
          </Button>

          <Button variant="outline" className="w-full justify-start" onClick={() => onContact(provider.id)}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact
          </Button>

          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => onSelect(provider.id)}>
            <Calendar className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

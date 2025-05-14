"use client"

import { motion } from "framer-motion"
import { Star, Clock, Shield, CheckCircle, MessageCircle, Calendar, ArrowRight, Sparkles } from "lucide-react"
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
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-xl border border-indigo-100/50 dark:border-indigo-800/50 bg-gradient-to-br from-white/95 via-white/90 to-indigo-50/90 dark:from-gray-800/95 dark:via-gray-800/90 dark:to-indigo-950/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-violet-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-violet-500/10 opacity-70"></div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

      <div className="relative">
        {/* Cover image with gradient overlay */}
        <div className="h-28 w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-10 left-4">
          <div className="relative h-20 w-20 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900 dark:to-gray-800"></div>
            <Image
              src={provider.avatar || "/professional-avatar.png"}
              alt={provider.name}
              layout="fill"
              objectFit="cover"
              className="z-10"
            />
          </div>
        </div>

        {/* Match score */}
        {matchScore && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-3 py-1.5 shadow-md flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              {matchScore}% Match
            </Badge>
          </div>
        )}
      </div>

      <div className="pt-12 px-5 pb-5">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg tracking-tight">{provider.name}</h3>

          {/* Verification badge */}
          {provider.verified && (
            <Badge
              variant="outline"
              className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 ml-1"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        <div className="mt-3 space-y-2.5">
          {/* Rating */}
          <div className="flex items-center text-sm">
            <div className="flex items-center bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full px-2.5 py-1">
              <Star className="h-3.5 w-3.5 mr-1.5 fill-amber-500 text-amber-500" />
              <span className="font-medium">{provider.rating}</span>
              <span className="text-amber-600/70 dark:text-amber-400/70 ml-1 text-xs">({provider.reviews})</span>
            </div>
          </div>

          {/* Response time */}
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-indigo-500" />
            <span>
              Responds in <span className="font-medium">{provider.responseTime}</span>
            </span>
          </div>

          {/* Completion rate */}
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <Shield className="h-4 w-4 mr-2 text-green-500" />
            <span>
              <span className="font-medium">{provider.completionRate}%</span> Completion rate
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          <Button
            variant="outline"
            className="w-full justify-between group hover:border-indigo-300 dark:hover:border-indigo-700"
            onClick={() => onViewServices(provider.id)}
          >
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-indigo-500" />
              View Services
            </span>
            <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between group hover:border-indigo-300 dark:hover:border-indigo-700"
            onClick={() => onContact(provider.id)}
          >
            <span className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2 text-indigo-500" />
              Contact
            </span>
            <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => onSelect(provider.id)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

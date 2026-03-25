"use client"
import { motion } from "framer-motion"
import { Star, CheckCircle, MessageCircle, User, Shield, Clock } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Provider {
  id: string | number
  name: string
  rating: number
  reviews: number
  avatar: string
  specialty?: string
  responseTime?: string
  completionRate?: number
  verified?: boolean
  featured?: boolean
  background?: string
}

interface ProviderCardProps {
  provider: Provider
  onSelect?: (providerId: string | number) => void
  onContact?: (providerId: string | number) => void
  onViewProfile?: (providerId: string | number) => void
  featured?: boolean
  matchScore?: number
}

export function ProviderCard({
  provider,
  onSelect,
  onContact,
  onViewProfile,
  featured = false,
  matchScore,
}: ProviderCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
      {/* Header with background gradient */}
      <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
        {/* Avatar */}
        <div className="absolute -bottom-10 left-4">
          <div className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden">
            <Image
              src={provider.avatar || "/professional-avatar.png"}
              alt={provider.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>

        {/* Match score */}
        {matchScore && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-indigo-800 font-medium">{matchScore}% Match</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-12 px-4 pb-4">
        {/* Name and verification */}
        <div className="flex items-center mb-1">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{provider.name}</h3>
          {provider.verified && (
            <Badge
              variant="outline"
              className="ml-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        {/* Specialty */}
        {provider.specialty && <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{provider.specialty}</p>}

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(provider.rating)
                    ? "fill-amber-400 text-amber-400"
                    : i < provider.rating
                      ? "fill-amber-400/50 text-amber-400/50"
                      : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                } mr-0.5`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{provider.rating}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({provider.reviews} reviews)</span>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          {/* Response time */}
          {provider.responseTime && (
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <Clock className="h-4 w-4 mr-2 text-indigo-500" />
              <span>
                Responds in <span className="font-medium">{provider.responseTime}</span>
              </span>
            </div>
          )}

          {/* Completion rate */}
          {provider.completionRate && (
            <div className="flex flex-col text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-green-500" />
                <span>
                  <span className="font-medium">{provider.completionRate}%</span> Completion rate
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${provider.completionRate}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          {onViewProfile && (
            <Button variant="outline" className="w-full" onClick={() => onViewProfile(provider.id)}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          )}

          {onContact && (
            <Button variant="outline" className="w-full" onClick={() => onContact(provider.id)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact
            </Button>
          )}

          {onSelect && (
            <Button
              className="w-full col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
              onClick={() => onSelect(provider.id)}
            >
              Book Now
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, Clock, CheckCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getMatchingProviders } from "@/services/provider-matching-service"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"

interface ProviderMatchingProps {
  userModel: any
  categoryId?: string
  onSelectProvider: (providerId: string) => void
}

export function ProviderMatching({ userModel, categoryId, onSelectProvider }: ProviderMatchingProps) {
  const { user } = useAuth()
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true)
      try {
        const matchingProviders = await getMatchingProviders(user?.id || null, userModel, categoryId, 3)
        setProviders(matchingProviders)
      } catch (error) {
        console.error("Error fetching matching providers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [user?.id, userModel, categoryId])

  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        <h3 className="text-sm font-medium">Finding the perfect providers for you...</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex space-x-2 mt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No matching providers found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-sm font-medium">Top providers matched to your needs:</h3>

      {providers.map((provider, index) => (
        <motion.div
          key={provider.id}
          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="p-4">
            <div className="flex items-start space-x-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                <Image
                  src={provider.avatar || "/placeholder.svg"}
                  alt={provider.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{provider.name}</h4>
                  <div className="flex items-center text-amber-500">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    <span className="font-medium">{provider.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({provider.reviews})</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {provider.bio || "Professional service provider on LEVL."}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {provider.specialties.slice(0, 3).map((specialty: string) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-3 space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{provider.responseTime}</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span>{provider.completionRate}% completion</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t flex items-center justify-between">
              <div className="text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">{provider.matchScore}% match</span>
                {provider.matchReasons.length > 0 && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">{provider.matchReasons[0].explanation}</span>
                )}
              </div>

              <Button size="sm" className="flex items-center" onClick={() => onSelectProvider(provider.id)}>
                View Profile
                <ChevronRight className="hidden md:block ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

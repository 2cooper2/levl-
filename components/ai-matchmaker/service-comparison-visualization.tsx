"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, Star, Clock, DollarSign, Award, Shield, Zap } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { Service } from "@/types/matchmaker"

interface ServiceComparisonVisualizationProps {
  services: Service[]
  onServiceSelect: (serviceId: string | number) => void
  onClose: () => void
}

export function ServiceComparisonVisualization({
  services,
  onServiceSelect,
  onClose,
}: ServiceComparisonVisualizationProps) {
  const [highlightedFeature, setHighlightedFeature] = useState<string | null>(null)

  // Only compare up to 3 services
  const servicesToCompare = services.slice(0, 3)

  // Get unique features across all services
  const getUniqueFeatures = () => {
    const allTags = servicesToCompare.flatMap((service) => service.tags)
    return [...new Set(allTags)]
  }

  const uniqueFeatures = getUniqueFeatures()

  // Check if a service has a specific feature
  const hasFeature = (service: Service, feature: string) => {
    return service.tags.includes(feature)
  }

  // Get color class based on rating
  const getRatingColorClass = (rating: number) => {
    if (rating >= 4.5) return "text-green-500"
    if (rating >= 4.0) return "text-emerald-500"
    if (rating >= 3.5) return "text-yellow-500"
    return "text-gray-500"
  }

  // Get price comparison
  const getPriceComparison = (service: Service) => {
    const priceValue = Number.parseFloat(service.price.replace(/[^0-9.]/g, ""))
    const avgPrice =
      servicesToCompare.reduce((sum, s) => {
        const price = Number.parseFloat(s.price.replace(/[^0-9.]/g, ""))
        return sum + price
      }, 0) / servicesToCompare.length

    if (priceValue < avgPrice * 0.9) return "Affordable"
    if (priceValue > avgPrice * 1.1) return "Premium"
    return "Average"
  }

  // Get price color class
  const getPriceColorClass = (comparison: string) => {
    if (comparison === "Affordable") return "text-green-500"
    if (comparison === "Premium") return "text-amber-500"
    return "text-blue-500"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold">Compare Services</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header row with service cards */}
          <div className="grid grid-cols-4 gap-4 p-4">
            <div className="col-span-1"></div>
            {servicesToCompare.map((service) => (
              <div
                key={service.id}
                className="col-span-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
              >
                <div className="relative h-32 w-full rounded-md overflow-hidden mb-3">
                  <Image
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    layout="fill"
                    objectFit="cover"
                  />
                  {service.matchScore && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {service.matchScore}% Match
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-sm mb-1">{service.title}</h4>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <Star className="h-3 w-3 mr-1 text-amber-500" />
                  <span>{service.provider.rating}</span>
                  <span className="ml-1">({service.provider.reviews})</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{service.price}</span>
                  <Button
                    size="sm"
                    onClick={() => onServiceSelect(service.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>

          {/* Price row */}
          <div
            className={`grid grid-cols-4 gap-4 p-4 ${
              highlightedFeature === "price" ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
            }`}
            onMouseEnter={() => setHighlightedFeature("price")}
            onMouseLeave={() => setHighlightedFeature(null)}
          >
            <div className="col-span-1 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-indigo-600" />
              <span className="font-medium">Price</span>
            </div>
            {servicesToCompare.map((service) => {
              const priceComparison = getPriceComparison(service)
              return (
                <div key={`${service.id}-price`} className="col-span-1">
                  <div className="flex flex-col">
                    <span className="font-semibold">{service.price}</span>
                    <span className={`text-xs ${getPriceColorClass(priceComparison)}`}>{priceComparison}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Rating row */}
          <div
            className={`grid grid-cols-4 gap-4 p-4 ${
              highlightedFeature === "rating" ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
            }`}
            onMouseEnter={() => setHighlightedFeature("rating")}
            onMouseLeave={() => setHighlightedFeature(null)}
          >
            <div className="col-span-1 flex items-center">
              <Star className="h-4 w-4 mr-2 text-amber-500" />
              <span className="font-medium">Rating</span>
            </div>
            {servicesToCompare.map((service) => (
              <div key={`${service.id}-rating`} className="col-span-1">
                <div className="flex items-center">
                  <span className={`font-semibold ${getRatingColorClass(service.provider.rating)}`}>
                    {service.provider.rating}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">({service.provider.reviews} reviews)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Time estimate row */}
          <div
            className={`grid grid-cols-4 gap-4 p-4 ${
              highlightedFeature === "time" ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
            }`}
            onMouseEnter={() => setHighlightedFeature("time")}
            onMouseLeave={() => setHighlightedFeature(null)}
          >
            <div className="col-span-1 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              <span className="font-medium">Time Estimate</span>
            </div>
            {servicesToCompare.map((service) => (
              <div key={`${service.id}-time`} className="col-span-1">
                <span className="font-medium">{service.timeEstimate}</span>
              </div>
            ))}
          </div>

          {/* Completed projects row */}
          <div
            className={`grid grid-cols-4 gap-4 p-4 ${
              highlightedFeature === "projects" ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
            }`}
            onMouseEnter={() => setHighlightedFeature("projects")}
            onMouseLeave={() => setHighlightedFeature(null)}
          >
            <div className="col-span-1 flex items-center">
              <Award className="h-4 w-4 mr-2 text-purple-600" />
              <span className="font-medium">Completed Projects</span>
            </div>
            {servicesToCompare.map((service) => (
              <div key={`${service.id}-projects`} className="col-span-1">
                <span className="font-medium">{service.completedProjects}</span>
              </div>
            ))}
          </div>

          {/* Satisfaction row */}
          <div
            className={`grid grid-cols-4 gap-4 p-4 ${
              highlightedFeature === "satisfaction" ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
            }`}
            onMouseEnter={() => setHighlightedFeature("satisfaction")}
            onMouseLeave={() => setHighlightedFeature(null)}
          >
            <div className="col-span-1 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-600" />
              <span className="font-medium">Satisfaction</span>
            </div>
            {servicesToCompare.map((service) => (
              <div key={`${service.id}-satisfaction`} className="col-span-1">
                <span className="font-medium">{service.satisfaction}%</span>
              </div>
            ))}
          </div>

          {/* Response time row */}
          <div
            className={`grid grid-cols-4 gap-4 p-4 ${
              highlightedFeature === "response" ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
            }`}
            onMouseEnter={() => setHighlightedFeature("response")}
            onMouseLeave={() => setHighlightedFeature(null)}
          >
            <div className="col-span-1 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-amber-600" />
              <span className="font-medium">Response Time</span>
            </div>
            {servicesToCompare.map((service) => (
              <div key={`${service.id}-response`} className="col-span-1">
                <span className="font-medium">{service.provider.responseTime}</span>
              </div>
            ))}
          </div>

          {/* Features section */}
          <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
          <div className="p-4">
            <h4 className="font-medium mb-2">Features</h4>
            {uniqueFeatures.map((feature) => (
              <div
                key={feature}
                className={`grid grid-cols-4 gap-4 p-2 rounded-md ${
                  highlightedFeature === feature ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                }`}
                onMouseEnter={() => setHighlightedFeature(feature)}
                onMouseLeave={() => setHighlightedFeature(null)}
              >
                <div className="col-span-1 text-sm">{feature}</div>
                {servicesToCompare.map((service) => (
                  <div key={`${service.id}-${feature}`} className="col-span-1 flex justify-center">
                    {hasFeature(service, feature) ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

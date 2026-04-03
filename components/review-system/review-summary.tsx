"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ReviewSummaryProps {
  serviceId: string
  providerId?: string
}

interface ReviewStats {
  avgRating: number
  totalCount: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  recommendationPercentage: number
}

export function ReviewSummary({ serviceId, providerId }: ReviewSummaryProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviewStats = async () => {
      setLoading(true)
      try {
        // Mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 800))

        // In a real app, you would fetch from an API
        // const response = await fetch(`/api/reviews/stats?serviceId=${serviceId}`)
        // const data = await response.json()

        const mockStats: ReviewStats = {
          avgRating: 4.7,
          totalCount: 142,
          distribution: {
            5: 102,
            4: 28,
            3: 8,
            2: 3,
            1: 1,
          },
          recommendationPercentage: 96,
        }

        setStats(mockStats)
      } catch (error) {
        console.error("Error fetching review stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviewStats()
  }, [serviceId, providerId])

  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-2 mx-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
        <p className="text-gray-500">No review data available.</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-sm font-medium text-gray-500">Customer Reviews</h3>

      <div className="flex items-center mt-1 mb-4">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</span>
          <span className="text-sm text-gray-500 ml-1">out of 5</span>
        </div>

        <div className="flex ml-3 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(stats.avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>

        <span className="ml-2 text-sm text-gray-500">({stats.totalCount} reviews)</span>
      </div>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.distribution[rating as keyof typeof stats.distribution] || 0
          const percentage = (count / stats.totalCount) * 100

          return (
            <div key={rating} className="flex items-center">
              <div className="flex items-center w-12">
                <span className="text-sm">{rating}</span>
                <Star className="h-3 w-3 text-gray-400 ml-1" />
              </div>

              <Progress value={percentage} className="h-2 mx-2 flex-1" />

              <div className="w-12 text-right">
                <span className="text-xs text-gray-500">{percentage.toFixed(0)}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center">
          <span className="text-lg font-bold">{stats.recommendationPercentage}%</span>
          <span className="ml-2 text-sm text-gray-500">of customers recommend this service</span>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface Service {
  id: string
  title: string
  base_price: number
  match_score?: number
  category: {
    name: string
  }
}

interface RecommendationWidgetProps {
  userId: string
  limit?: number
}

export function RecommendationWidget({ userId, limit = 3 }: RecommendationWidgetProps) {
  const [recommendations, setRecommendations] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      try {
        // In a real app, you would fetch from an API
        // const response = await fetch(`/api/recommendations?userId=${userId}&limit=${limit}`)
        // const data = await response.json()

        // Mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockRecommendations: Service[] = [
          {
            id: "rec1",
            title: "Professional Website Development",
            base_price: 1200,
            category: {
              name: "Web Development",
            },
            match_score: 98,
          },
          {
            id: "rec2",
            title: "SEO Optimization Package",
            base_price: 800,
            category: {
              name: "Digital Marketing",
            },
            match_score: 92,
          },
          {
            id: "rec3",
            title: "Content Creation Strategy",
            base_price: 650,
            category: {
              name: "Content Creation",
            },
            match_score: 87,
          },
        ]

        setRecommendations(mockRecommendations.slice(0, limit))
      } catch (error) {
        console.error("Error fetching recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [userId, limit])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-primary" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((service) => (
              <div key={service.id} className="flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">{service.title}</span>
                    {service.match_score && (
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">
                        {service.match_score}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{service.category.name}</div>
                </div>
                <span className="font-semibold">${service.base_price}</span>
              </div>
            ))}

            <div className="pt-2 mt-2 border-t text-center">
              <Button variant="link" asChild className="gap-1">
                <Link href="/recommendations">
                  View All Recommendations
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-gray-500">
            No recommendations available yet. Check back after you've used more services.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

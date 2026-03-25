"use client"

import { useState, useEffect } from "react"
import { Sparkles, ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface Service {
  id: string
  title: string
  description: string
  base_price: number
  provider: {
    name: string
    avatar_url?: string
    rating?: number
  }
  category: {
    name: string
  }
  tags?: string[]
  match_score?: number
  match_reason?: string
}

interface SmartRecommendationsProps {
  userId?: string
  categoryId?: string
  limit?: number
  showFeedback?: boolean
}

export function SmartRecommendations({
  userId,
  categoryId,
  limit = 3,
  showFeedback = true,
}: SmartRecommendationsProps) {
  const { toast } = useToast()
  const [recommendations, setRecommendations] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "positive" | "negative" | null>>({})

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      try {
        // In a real app, you would fetch from an API
        // const response = await fetch(`/api/recommendations?userId=${userId}&categoryId=${categoryId}&limit=${limit}`)
        // const data = await response.json()

        // Mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const mockRecommendations: Service[] = [
          {
            id: "rec1",
            title: "Professional Website Development",
            description: "Custom website development tailored to your business needs with responsive design.",
            base_price: 1200,
            provider: {
              name: "Alex Chen",
              avatar_url: "/placeholder.svg?height=40&width=40&text=AC",
              rating: 4.9,
            },
            category: {
              name: "Web Development",
            },
            tags: ["website", "responsive", "business"],
            match_score: 98,
            match_reason: "Based on your previous web design purchases and browsing history",
          },
          {
            id: "rec2",
            title: "SEO Optimization Package",
            description: "Comprehensive SEO service to improve your website's visibility and ranking.",
            base_price: 800,
            provider: {
              name: "Sarah Johnson",
              avatar_url: "/placeholder.svg?height=40&width=40&text=SJ",
              rating: 4.7,
            },
            category: {
              name: "Digital Marketing",
            },
            tags: ["seo", "marketing", "visibility"],
            match_score: 92,
            match_reason: "Complements your recent web development services",
          },
          {
            id: "rec3",
            title: "Content Creation Strategy",
            description: "Strategic content planning and creation to engage your target audience.",
            base_price: 650,
            provider: {
              name: "Michael Rodriguez",
              avatar_url: "/placeholder.svg?height=40&width=40&text=MR",
              rating: 4.8,
            },
            category: {
              name: "Content Creation",
            },
            tags: ["content", "strategy", "engagement"],
            match_score: 87,
            match_reason: "Popular among users with similar profiles",
          },
        ]

        setRecommendations(mockRecommendations)
      } catch (error) {
        console.error("Error fetching recommendations:", error)
        toast({
          title: "Error",
          description: "Failed to load recommendations. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [userId, categoryId, limit, toast])

  const handleFeedback = async (serviceId: string, isPositive: boolean) => {
    try {
      // In a real app, you would send feedback to an API
      // await fetch('/api/recommendations/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ serviceId, isPositive, userId })
      // })

      // For demo purposes, just update local state
      setFeedbackGiven((prev) => ({
        ...prev,
        [serviceId]: isPositive ? "positive" : "negative",
      }))

      toast({
        title: "Thank you for your feedback!",
        description: "Your input helps us improve our recommendations.",
      })

      // If negative feedback, we could fetch a replacement recommendation
      if (!isPositive) {
        // In a real app, fetch a replacement
        // const response = await fetch(`/api/recommendations/replacement?userId=${userId}&excludeId=${serviceId}`)
        // const data = await response.json()
        // setRecommendations(prev => prev.map(rec => rec.id === serviceId ? data.replacement : rec))
      }
    } catch (error) {
      console.error("Error sending feedback:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Recommended for You
          </h2>
          <p className="text-sm text-gray-500 mt-1">Personalized suggestions based on your profile and activity</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {recommendations.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      {service.match_score && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {service.match_score}% Match
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{service.category.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-500 line-clamp-3 mb-3">{service.description}</p>
                    {service.match_reason && (
                      <div className="bg-muted/50 p-2 rounded-md text-xs text-muted-foreground">
                        <span className="font-medium">Why we recommend this:</span> {service.match_reason}
                      </div>
                    )}
                    {service.tags && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {service.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 pt-2 border-t">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center">
                        <span className="font-semibold">${service.base_price}</span>
                        {service.provider.rating && (
                          <div className="flex items-center ml-2 text-yellow-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-xs ml-1">{service.provider.rating}</span>
                          </div>
                        )}
                      </div>
                      <Button size="sm" className="gap-1">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {showFeedback && !feedbackGiven[service.id] && (
                      <div className="w-full flex items-center justify-between text-xs text-gray-500 pt-2">
                        <span>Is this recommendation helpful?</span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleFeedback(service.id, true)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Yes
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleFeedback(service.id, false)}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            No
                          </Button>
                        </div>
                      </div>
                    )}

                    {feedbackGiven[service.id] && (
                      <div className="w-full text-center text-xs text-green-600 pt-2">Thank you for your feedback!</div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Sparkles className="h-10 w-10 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No recommendations available</h3>
          <p className="text-gray-500">
            We're still learning about your preferences. Check back after you've used more services.
          </p>
        </div>
      )}
    </div>
  )
}

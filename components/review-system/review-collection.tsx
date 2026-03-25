"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, Search, BarChart, MessageSquare, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  date: string
  likes: number
  userHasLiked?: boolean
  images?: string[]
  serviceId: string
  verified: boolean
  serviceName: string
  response?: {
    comment: string
    date: string
  }
}

interface ReviewAnalytics {
  avgRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
  verifiedPercentage: number
  mostMentionedKeywords: string[]
}

interface ReviewCollectionProps {
  serviceId?: string
  providerId: string
  onSubmitReview?: (review: Partial<Review>) => Promise<void>
  canReview?: boolean
}

export function ReviewCollection({ serviceId, providerId, onSubmitReview, canReview = false }: ReviewCollectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    images: [] as string[],
  })

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)

      try {
        // In a real app, you would fetch from an API
        // const response = await fetch(`/api/reviews?serviceId=${serviceId || ''}&providerId=${providerId}`)
        // const data = await response.json()

        // Mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 800))

        const mockReviews: Review[] = [
          {
            id: "1",
            userId: "user1",
            userName: "Sarah Johnson",
            userAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
            rating: 5,
            comment:
              "Exceptional service! The mounting was done perfectly and they even helped with cable management. Highly recommend for any TV mounting needs.",
            date: new Date(2023, 4, 15).toISOString(),
            likes: 8,
            serviceId: "service1",
            verified: true,
            serviceName: "TV Mounting",
          },
          {
            id: "2",
            userId: "user2",
            userName: "Michael Chen",
            userAvatar: "/placeholder.svg?height=40&width=40&text=MC",
            rating: 4,
            comment:
              "Good work overall. Came on time and completed the job efficiently. The only minor issue was some clean-up afterward, but the mounting itself is solid and secure.",
            date: new Date(2023, 3, 22).toISOString(),
            likes: 3,
            serviceId: "service1",
            verified: true,
            serviceName: "TV Mounting",
            response: {
              comment:
                "Thank you for your feedback! We appreciate your comments about the clean-up and will make sure to improve on that aspect.",
              date: new Date(2023, 3, 23).toISOString(),
            },
          },
          {
            id: "3",
            userId: "user3",
            userName: "Emily Rodriguez",
            userAvatar: "/placeholder.svg?height=40&width=40&text=ER",
            rating: 5,
            comment:
              "Fantastic work! They mounted my TV exactly where I wanted it and made sure everything was level. The team was professional and cleaned up afterward.",
            date: new Date(2023, 2, 10).toISOString(),
            likes: 12,
            images: [
              "/placeholder.svg?height=200&width=300&text=TV+Mounting+Result",
              "/placeholder.svg?height=200&width=300&text=Clean+Installation",
            ],
            serviceId: "service2",
            verified: true,
            serviceName: "TV & Soundbar Mounting",
          },
          {
            id: "4",
            userId: "user4",
            userName: "Robert Williams",
            userAvatar: "/placeholder.svg?height=40&width=40&text=RW",
            rating: 3,
            comment:
              "The mounting itself is good, but they were late for the appointment and communication could have been better.",
            date: new Date(2023, 1, 5).toISOString(),
            likes: 1,
            serviceId: "service1",
            verified: false,
            serviceName: "TV Mounting",
          },
          {
            id: "5",
            userId: "user5",
            userName: "Jennifer Taylor",
            userAvatar: "/placeholder.svg?height=40&width=40&text=JT",
            rating: 5,
            comment:
              "Couldn't be happier with the service! They were prompt, professional, and did an amazing job mounting my TV and hiding all the cables. Will definitely use again!",
            date: new Date(2023, 0, 20).toISOString(),
            likes: 15,
            serviceId: "service2",
            verified: true,
            serviceName: "TV & Soundbar Mounting",
            response: {
              comment:
                "Thank you for your kind words, Jennifer! We're glad you're satisfied with our service and look forward to helping you again in the future.",
              date: new Date(2023, 0, 21).toISOString(),
            },
          },
        ]

        // Generate analytics based on reviews
        const avgRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length

        const ratingDistribution = mockReviews.reduce(
          (acc, review) => {
            acc[review.rating] = (acc[review.rating] || 0) + 1
            return acc
          },
          {} as Record<number, number>,
        )

        const verifiedCount = mockReviews.filter((review) => review.verified).length

        const mockAnalytics: ReviewAnalytics = {
          avgRating,
          totalReviews: mockReviews.length,
          ratingDistribution,
          verifiedPercentage: (verifiedCount / mockReviews.length) * 100,
          mostMentionedKeywords: ["professional", "clean", "on time", "careful", "quality"],
        }

        setReviews(mockReviews)
        setFilteredReviews(mockReviews)
        setAnalytics(mockAnalytics)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [serviceId, providerId])

  // Apply filters when they change
  useEffect(() => {
    if (!reviews.length) return

    let filtered = [...reviews]

    // Apply rating filter
    if (activeFilter !== "all") {
      const rating = Number.parseInt(activeFilter)
      filtered = filtered.filter((review) => review.rating === rating)
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (review) => review.comment.toLowerCase().includes(query) || review.userName.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else if (sortBy === "helpful") {
      filtered.sort((a, b) => b.likes - a.likes)
    } else if (sortBy === "highest") {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === "lowest") {
      filtered.sort((a, b) => a.rating - b.rating)
    }

    setFilteredReviews(filtered)
  }, [reviews, activeFilter, sortBy, searchQuery])

  const handleLikeReview = (reviewId: string) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              likes: review.userHasLiked ? review.likes - 1 : review.likes + 1,
              userHasLiked: !review.userHasLiked,
            }
          : review,
      ),
    )
  }

  const handleSubmitReview = async () => {
    if (newReview.rating === 0 || !newReview.comment.trim()) {
      // Show error
      return
    }

    const review = {
      ...newReview,
      serviceId: serviceId || "",
      providerId,
    }

    try {
      // In a real app, call the provided onSubmitReview function
      // await onSubmitReview?.(review)

      // For demo purposes, just update the local state
      const mockNewReview: Review = {
        id: `new-${Date.now()}`,
        userId: "currentUser",
        userName: "You",
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString(),
        likes: 0,
        images: newReview.images,
        serviceId: serviceId || "",
        verified: true,
        serviceName: "TV Mounting",
      }

      setReviews((prev) => [mockNewReview, ...prev])

      // Reset form
      setNewReview({
        rating: 0,
        comment: "",
        images: [],
      })

      setShowReviewForm(false)
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && setNewReview({ ...newReview, rating: star })}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            Reviews
            <span className="ml-2 text-lg font-normal text-gray-500">({reviews.length})</span>
          </h2>

          {analytics && (
            <div className="flex items-center mt-1">
              <div className="flex mr-2">{renderStars(Math.round(analytics.avgRating))}</div>
              <span className="font-semibold text-lg">{analytics.avgRating.toFixed(1)}</span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-sm text-gray-500">{analytics.verifiedPercentage.toFixed(0)}% verified reviews</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowAnalytics(!showAnalytics)}>
            <BarChart className="h-4 w-4" />
            {showAnalytics ? "Hide" : "Show"} Analytics
          </Button>

          {canReview && (
            <Button variant="default" size="sm" className="gap-1" onClick={() => setShowReviewForm(!showReviewForm)}>
              <MessageSquare className="h-4 w-4" />
              Write a Review
            </Button>
          )}
        </div>
      </div>

      {/* Analytics section */}
      <AnimatePresence>
        {showAnalytics && analytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border"
          >
            <h3 className="font-semibold mb-4">Review Analytics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rating distribution */}
              <div>
                <h4 className="text-sm font-medium mb-2">Rating Distribution</h4>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = analytics.ratingDistribution[rating] || 0
                    const percentage = (count / analytics.totalReviews) * 100

                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <div className="flex items-center w-16">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-sm">{rating}</span>
                        </div>

                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>

                        <div className="text-sm text-gray-500 w-16 text-right">
                          {count} ({percentage.toFixed(0)}%)
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Most mentioned keywords */}
              <div>
                <h4 className="text-sm font-medium mb-2">Most Mentioned Keywords</h4>

                <div className="flex flex-wrap gap-2">
                  {analytics.mostMentionedKeywords.map((keyword, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-sm border flex items-center"
                    >
                      <span>{keyword}</span>
                      <span className="ml-1.5 bg-gray-100 dark:bg-gray-600 text-xs px-1.5 rounded-full">
                        {Math.floor(Math.random() * 10) + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm"
          >
            <h3 className="font-semibold mb-4">Write a Review</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex">{renderStars(newReview.rating, true)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Review</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Share your experience with this service..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Add Photos (optional)</label>
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6">
                  <div className="text-center">
                    <div className="mt-1 flex justify-center">
                      <Button variant="outline" size="sm" className="gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-image"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        Upload Images
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, or GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitReview} disabled={newReview.rating === 0 || !newReview.comment.trim()}>
                  Submit Review
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reviews..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Most Recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.userAvatar || "/placeholder.svg"} alt={review.userName} />
                  <AvatarFallback>{review.userName[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium">{review.userName}</h4>
                        {review.verified && (
                          <div className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                            <CheckIcon className="h-3 w-3 mr-0.5" />
                            Verified
                          </div>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDistanceToNow(new Date(review.date), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">{review.serviceName}</div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-3">{review.comment}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                      {review.images.map((image, i) => (
                        <img
                          key={i}
                          src={image || "/placeholder.svg"}
                          alt={`Review image ${i + 1}`}
                          className="h-20 w-20 object-cover rounded-md border"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-gray-500 hover:text-gray-700"
                      onClick={() => handleLikeReview(review.id)}
                    >
                      <ThumbsUp className={`h-4 w-4 mr-1 ${review.userHasLiked ? "text-primary fill-primary" : ""}`} />
                      Helpful ({review.likes})
                    </Button>

                    <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-gray-700">
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>

                  {/* Provider response */}
                  {review.response && (
                    <div className="mt-3 pl-3 border-l-2 border-primary/30 bg-primary/5 p-3 rounded-md">
                      <p className="text-sm font-medium">Response from Provider</p>
                      <p className="text-sm mt-1">{review.response.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(review.response.date), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          <div className="flex justify-center mt-4">
            <Button variant="outline">Load More Reviews</Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <MessageSquare className="h-10 w-10 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No reviews found</h3>
          <p className="text-gray-500">
            {searchQuery ? "Try adjusting your search or filters" : "Be the first to leave a review"}
          </p>
        </div>
      )}
    </div>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

export function ServiceReviews() {
  const reviews = [
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40&text=SJ",
        country: "United States",
      },
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Alex did an amazing job on my website! The design is modern, clean, and exactly what I was looking for. The site loads quickly and works perfectly on all devices. I highly recommend his services to anyone looking for a professional website.",
    },
    {
      id: 2,
      user: {
        name: "Michael Brown",
        avatar: "/placeholder.svg?height=40&width=40&text=MB",
        country: "Canada",
      },
      rating: 5,
      date: "1 month ago",
      comment:
        "Working with Alex was a pleasure. He was responsive, professional, and delivered the website ahead of schedule. The final product exceeded my expectations, and I've already received compliments from my customers on the new design.",
    },
    {
      id: 3,
      user: {
        name: "Emily Chen",
        avatar: "/placeholder.svg?height=40&width=40&text=EC",
        country: "Australia",
      },
      rating: 4,
      date: "2 months ago",
      comment:
        "Great experience overall. The website looks fantastic and functions well. The only reason I'm giving 4 stars instead of 5 is that there were a few minor revisions needed after the initial delivery, but Alex was quick to make the changes.",
    },
  ]

  const ratingStats = {
    average: 4.9,
    total: 124,
    distribution: [
      { stars: 5, count: 110, percentage: 89 },
      { stars: 4, count: 10, percentage: 8 },
      { stars: 3, count: 3, percentage: 2 },
      { stars: 2, count: 1, percentage: 1 },
      { stars: 1, count: 0, percentage: 0 },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold">{ratingStats.average}</span>
            <div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(ratingStats.average) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{ratingStats.total} reviews</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {ratingStats.distribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm">{item.stars}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
              <Progress value={item.percentage} className="h-2 flex-1" />
              <span className="text-sm text-muted-foreground w-12 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                    <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{review.user.name}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{review.user.country}</p>
                      <span className="text-sm text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground">{review.comment}</p>
            </div>
            {index < reviews.length - 1 && <Separator className="mt-6" />}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

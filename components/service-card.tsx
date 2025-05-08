"use client"

import type React from "react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, Heart, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { FeatureBadge } from "@/components/ui/feature-badge"

interface ServiceCardProps {
  image: string
  title: string
  price: string
  rating: number
  reviews: number
  provider: {
    name: string
    avatar: string
    level: string
  }
  tags: string[]
  delay?: number
  id?: string
}

export function ServiceCard({
  image,
  title,
  price,
  rating,
  reviews,
  provider,
  tags,
  delay = 0,
  id = "web-development",
}: ServiceCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsSaved(!isSaved)

    toast({
      title: isSaved ? "Removed from saved" : "Saved to favorites",
      description: isSaved ? "Service removed from your saved list" : "Service added to your saved list",
    })
  }

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push("/messages")
  }

  const handleCardClick = () => {
    router.push(`/services/${id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={handleCardClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="font-medium">
              {price}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 left-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm ${
              isSaved ? "text-red-500" : "text-muted-foreground"
            }`}
            onClick={handleSave}
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
          </Button>
        </div>
        <CardContent className="flex-1 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={provider.avatar || "/placeholder.svg"} alt={provider.name} />
              <AvatarFallback>{provider.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{provider.name}</span>
            <Badge variant="outline" className="ml-auto text-xs">
              {provider.level}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            <FeatureBadge type="founder" size="sm" />
            <FeatureBadge type="fees" size="sm" />
          </div>
          <h3 className="font-semibold line-clamp-2 mb-2">{title}</h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground ml-1">({reviews})</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={handleContact}>
            <MessageSquare className="h-3 w-3" />
            Contact
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

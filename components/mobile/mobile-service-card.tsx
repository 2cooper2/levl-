"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, Star, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface MobileServiceCardProps {
  id: string
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
}

export function MobileServiceCard({
  id,
  image,
  title,
  price,
  rating,
  reviews,
  provider,
  tags,
  delay = 0,
}: MobileServiceCardProps) {
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
    router.push(`/messages?service=${id}`)
  }

  const handleCardClick = () => {
    router.push(`/services/${id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      onClick={handleCardClick}
      className="w-full cursor-pointer touch-manipulation"
    >
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="relative aspect-[3/2] overflow-hidden">
          <img src={image || "/placeholder.svg"} alt={title} className="object-cover w-full h-full" loading="lazy" />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="font-medium shadow-sm">
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
        <CardContent className="pt-3 pb-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar className="h-5 w-5">
              <AvatarImage src={provider.avatar || "/placeholder.svg"} alt={provider.name} />
              <AvatarFallback>{provider.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{provider.name}</span>
            <Badge variant="outline" className="ml-auto text-[10px] py-0 h-5">
              {provider.level}
            </Badge>
          </div>
          <h3 className="font-medium text-sm line-clamp-2 mb-1.5">{title}</h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-[10px] font-normal py-0 h-5">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-[10px] font-normal py-0 h-5">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-2 pb-3 flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground ml-1">({reviews})</span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs p-0 px-2" onClick={handleContact}>
            <MessageSquare className="h-3 w-3" />
            Contact
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

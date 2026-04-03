"use client"

import type React from "react"

import { useState } from "react"
import { EnhancedCard, EnhancedCardContent, EnhancedCardFooter } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Star, Heart, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

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

export function EnhancedServiceCard({
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
      onClick={handleCardClick}
      className="cursor-pointer h-full"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <EnhancedCard interactive elevation="low" className="overflow-hidden h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden group">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="font-medium shadow-sm">
              {price}
            </Badge>
          </div>
          <EnhancedButton
            variant="ghost"
            size="icon"
            className={`absolute top-3 left-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm ${
              isSaved ? "text-red-500" : "text-muted-foreground"
            }`}
            onClick={handleSave}
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
          </EnhancedButton>
        </div>
        <EnhancedCardContent className="flex-1 pt-5">
          <div className="flex items-center gap-2.5 mb-3.5">
            <Avatar className="h-7 w-7 border-2 border-background">
              {provider.level === "Expert" ? (
                <AvatarImage src="/professional-expert-avatar.png" alt={provider.name} />
              ) : provider.level === "Professional" ? (
                <AvatarImage src="/professional-avatar.png" alt={provider.name} />
              ) : provider.level === "Executive" ? (
                <AvatarImage src="/avatar-executive.png" alt={provider.name} />
              ) : (
                <AvatarImage src="/avatar-executive-professional.png" alt={provider.name} />
              )}
              <AvatarFallback>{provider.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{provider.name}</span>
            <Badge variant="outline" className="ml-auto text-xs font-normal">
              {provider.level}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-3.5 group-hover:text-primary transition-colors tracking-tight">
            {title}
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs font-medium bg-background/60 px-2.5 py-0.5 rounded-md"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </EnhancedCardContent>
        <EnhancedCardFooter className="border-t pt-4 flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1.5" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground ml-1">({reviews})</span>
          </div>
          <EnhancedButton variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleContact}>
            <MessageSquare className="h-3.5 w-3.5" />
            Contact
          </EnhancedButton>
        </EnhancedCardFooter>
      </EnhancedCard>
    </motion.div>
  )
}

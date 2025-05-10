"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, Heart, MessageSquare, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

interface ServiceCardProps {
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
  index: number
}

export function InteractiveServiceCard({
  id,
  image,
  title,
  price,
  rating,
  reviews,
  provider,
  tags,
  index,
}: ServiceCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  return (
    <div
      className="cursor-pointer h-full opacity-0 translate-y-4 animate-[fadeIn_0.5s_ease-out_forwards]"
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/services/${id}`)}
    >
      <Card className="overflow-hidden h-full flex flex-col relative border-primary/10 transition-shadow duration-300 hover:shadow-md">
        {/* Glow effect on hover */}
        {isHovered && (
          <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 z-0 blur-sm" />
        )}

        <div className="relative aspect-[4/3] overflow-hidden">
          {loading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoadingComplete={() => setLoading(false)}
            />
          )}

          <div className="absolute top-3 right-3 z-20">
            <Badge variant="secondary" className="font-medium shadow-sm">
              {price}
            </Badge>
          </div>

          <button
            className={`absolute top-3 left-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm z-20 flex items-center justify-center ${
              isSaved ? "text-red-500" : "text-muted-foreground"
            }`}
            onClick={(e) => {
              e.stopPropagation()
              setIsSaved(!isSaved)
            }}
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </button>

          {/* Animated overlay on hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4">
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/services/${id}`)
                }}
              >
                View Details <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-7 w-7 border-2 border-background">
              <AvatarImage src={provider.avatar || "/placeholder.svg"} alt={provider.name} />
              <AvatarFallback>{provider.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{provider.name}</span>
            <Badge variant="outline" className="ml-auto text-xs font-normal">
              {provider.level}
            </Badge>
          </div>

          <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs font-normal bg-background/50">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="border-t p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1.5" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground ml-1">({reviews})</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              router.push("/messages")
            }}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Contact
          </Button>
        </div>
      </Card>
    </div>
  )
}

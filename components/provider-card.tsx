"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Star, MapPin, Clock, CheckCircle, ArrowRight, Calendar, MessageSquare, Briefcase } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface Provider {
  id: string
  name: string
  title: string
  avatar: string
  rating: number
  reviews: number
  location: string
  hourlyRate: number
  responseTime: string
  tags: string[]
  description: string
  featured: boolean
  availability: string
  completedProjects: number
  languages: string[]
  packages: {
    name: string
    price: number
    description: string
  }[]
}

interface ProviderCardProps {
  provider: Provider
  index: number
  isLoaded: boolean
  onSelect: () => void
}

export function ProviderCard({ provider, index, isLoaded, onSelect }: ProviderCardProps) {
  const router = useRouter()

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/providers/${provider.id}`)
  }

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/messages?provider=${provider.id}`)
  }

  const handleHire = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/checkout?provider=${provider.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onSelect}
      className="cursor-pointer"
    >
      <Card className={`overflow-hidden ${provider.featured ? "border-primary/40 bg-primary/5" : ""}`}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center text-center md:w-44">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarImage src={provider.avatar || "/placeholder.svg"} alt={provider.name} />
                <AvatarFallback>
                  {provider.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{provider.name}</h3>
              <p className="text-sm text-muted-foreground">{provider.title}</p>
              <div className="mt-2 flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-medium">{provider.rating}</span>
                <span className="ml-1 text-xs text-muted-foreground">({provider.reviews})</span>
              </div>
              <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {provider.location}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                {provider.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">{provider.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Rate</p>
                  <p className="font-semibold">${provider.hourlyRate}/hr</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Response Time</p>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                    <p className="text-sm">{provider.responseTime}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Availability</p>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                    <p className="text-sm">{provider.availability}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Button variant="outline" size="sm" className="gap-1" onClick={handleViewProfile}>
                  <Briefcase className="h-3 w-3" /> View Services
                </Button>

                <Button variant="ghost" size="sm" className="gap-1" onClick={handleContact}>
                  <MessageSquare className="h-3 w-3" /> Contact
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  className="bg-purple-500/80 hover:bg-purple-600/90 backdrop-blur-sm border border-purple-300/30 shadow-sm hover:shadow-md transition-all duration-300"
                  onClick={handleHire}
                >
                  Hire Now <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {provider.featured && (
          <div className="bg-primary/10 px-6 py-2 flex items-center">
            <CheckCircle className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium">Featured Professional</span>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

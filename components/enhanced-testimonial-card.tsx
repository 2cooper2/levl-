"use client"

import { EnhancedCard, EnhancedCardContent, EnhancedCardFooter } from "@/components/ui/enhanced-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  avatar: string
  index: number
}

export function EnhancedTestimonialCard({ quote, author, role, avatar, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <EnhancedCard className="h-full flex flex-col relative overflow-visible">
        <div className="absolute -top-3 left-6 text-primary">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9.33333 21.3333C7.86667 21.3333 6.66667 20.8 5.73333 19.7333C4.8 18.6667 4.33333 17.3333 4.33333 15.7333C4.33333 14.2667 4.73333 12.8667 5.53333 11.5333C6.33333 10.2 7.46667 9.06667 8.93333 8.13333L10.6667 10.1333C9.46667 10.8 8.53333 11.6 7.86667 12.5333C7.2 13.4667 6.86667 14.4667 6.86667 15.5333C6.86667 15.7333 6.93333 15.9333 7.06667 16.1333C7.2 16.3333 7.4 16.4667 7.66667 16.5333C8.06667 16.6667 8.46667 16.6 8.86667 16.3333C9.26667 16.0667 9.53333 15.6667 9.66667 15.1333L10.6667 12H14.6667V21.3333H9.33333ZM21.3333 21.3333C19.8667 21.3333 18.6667 20.8 17.7333 19.7333C16.8 18.6667 16.3333 17.3333 16.3333 15.7333C16.3333 14.2667 16.7333 12.8667 17.5333 11.5333C18.3333 10.2 19.4667 9.06667 20.9333 8.13333L22.6667 10.1333C21.4667 10.8 20.5333 11.6 19.8667 12.5333C19.2 13.4667 18.8667 14.4667 18.8667 15.5333C18.8667 15.7333 18.9333 15.9333 19.0667 16.1333C19.2 16.3333 19.4 16.4667 19.6667 16.5333C20.0667 16.6667 20.4667 16.6 20.8667 16.3333C21.2667 16.0667 21.5333 15.6667 21.6667 15.1333L22.6667 12H26.6667V21.3333H21.3333Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <EnhancedCardContent className="pt-6 flex-1">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="italic text-muted-foreground leading-relaxed">"{quote}"</p>
        </EnhancedCardContent>
        <EnhancedCardFooter className="border-t pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={avatar || "/placeholder.svg"} alt={author} />
              <AvatarFallback>{author[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{author}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          </div>
        </EnhancedCardFooter>
      </EnhancedCard>
    </motion.div>
  )
}

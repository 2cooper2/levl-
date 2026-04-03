"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
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

export function TestimonialCard({ quote, author, role, avatar, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="h-full flex flex-col">
        <CardContent className="pt-6 flex-1">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="italic text-muted-foreground">"{quote}"</p>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatar || "/placeholder.svg"} alt={author} />
              <AvatarFallback>{author[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{author}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

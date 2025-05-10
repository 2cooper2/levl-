"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
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
  const cardRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  // Mouse position values for 3D effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Transform mouse position into rotation values
  const rotateX = useTransform(y, [-100, 100], [5, -5])
  const rotateY = useTransform(x, [-100, 100], [-5, 5])

  // Handle mouse move for 3D effect
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set(event.clientX - centerX)
    y.set(event.clientY - centerY)
  }

  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => router.push(`/services/${id}`)}
      className="cursor-pointer h-full"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="h-full"
      >
        <Card className="overflow-hidden h-full flex flex-col relative border-primary/10">
          {/* Glow effect on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 z-0 blur-sm"
              />
            )}
          </AnimatePresence>

          <div className="relative aspect-[4/3] overflow-hidden">
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <Image
                src={image || "/placeholder.svg"}
                alt={title}
                className="object-cover w-full h-full"
                style={{
                  z: 20,
                  transformStyle: "preserve-3d",
                  transform: "translateZ(20px)",
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoadingComplete={() => setLoading(false)}
              />
            )}

            <motion.div className="absolute top-3 right-3 z-20" style={{ transform: "translateZ(40px)" }}>
              <Badge variant="secondary" className="font-medium shadow-sm">
                {price}
              </Badge>
            </motion.div>

            <motion.button
              className={`absolute top-3 left-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm z-20 flex items-center justify-center ${
                isSaved ? "text-red-500" : "text-muted-foreground"
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setIsSaved(!isSaved)
              }}
              whileTap={{ scale: 0.9 }}
              style={{ transform: "translateZ(40px)" }}
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </motion.button>

            {/* Animated overlay on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4"
                >
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/services/${id}`)
                    }}
                  >
                    View Details <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className="flex-1 p-5"
            style={{
              transformStyle: "preserve-3d",
              transform: "translateZ(10px)",
            }}
          >
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
          </motion.div>

          <motion.div
            className="border-t p-4 flex items-center justify-between"
            style={{
              transformStyle: "preserve-3d",
              transform: "translateZ(10px)",
            }}
          >
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
          </motion.div>

          {/* Particle effect on hover */}
          <AnimatePresence>
            {isHovered && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-primary/60"
                    initial={{
                      x: "50%",
                      y: "50%",
                      opacity: 0,
                    }}
                    animate={{
                      x: `${50 + (Math.random() * 100 - 50)}%`,
                      y: `${50 + (Math.random() * 100 - 50)}%`,
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1 + Math.random(),
                      ease: "easeOut",
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  )
}

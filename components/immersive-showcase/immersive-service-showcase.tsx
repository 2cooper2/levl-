"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion"
import {
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  Zap,
  Users,
  MessageSquare,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import Image from "next/image"

// Define featured services data
const featuredServices = [
  {
    id: 1,
    title: "Professional TV Mounting",
    category: "Mounting",
    provider: {
      name: "Alex Morgan",
      avatar: "/professional-avatar.png",
      rating: 4.9,
      reviews: 124,
      verified: true,
    },
    price: "$85",
    timeEstimate: "1-2 hours",
    description:
      "Professional TV mounting service for all TV sizes. Includes wall mount, cable management, and device setup.",
    images: ["/tv-mounting-service.png", "/wall-mounted-tv-clean-cables.png", "/modern-living-room-tv.png"],
    tags: ["TV Mounting", "Cable Management", "Electronics Setup"],
    featured: true,
    completedProjects: 215,
    satisfaction: 98,
  },
  {
    id: 2,
    title: "Custom Furniture Assembly",
    category: "Assembly",
    provider: {
      name: "Sarah Johnson",
      avatar: "/avatar-executive.png",
      rating: 4.8,
      reviews: 98,
      verified: true,
    },
    price: "$65",
    timeEstimate: "2-4 hours",
    description:
      "Expert furniture assembly service for all types of furniture. Fast, reliable, and professional service.",
    images: [
      "/furniture-assembly.png",
      "/modern-bookshelf-living-room.png",
      "/placeholder.svg?height=600&width=800&query=Before and after furniture assembly",
    ],
    tags: ["Furniture Assembly", "IKEA", "Custom Furniture"],
    featured: true,
    completedProjects: 187,
    satisfaction: 96,
  },
  {
    id: 3,
    title: "Interior Painting Service",
    category: "Painting",
    provider: {
      name: "Michael Chen",
      avatar: "/professional-expert-avatar.png",
      rating: 4.9,
      reviews: 156,
      verified: true,
    },
    price: "$45/hour",
    timeEstimate: "Varies by project",
    description:
      "Professional interior painting service with premium materials. Transform your space with expert painting.",
    images: [
      "/placeholder.svg?height=600&width=800&query=Professional painter working on interior wall",
      "/placeholder.svg?height=600&width=800&query=Modern living room with freshly painted accent wall",
      "/placeholder.svg?height=600&width=800&query=Before and after interior painting transformation",
    ],
    tags: ["Interior Painting", "Color Consultation", "Wall Repair"],
    featured: true,
    completedProjects: 230,
    satisfaction: 99,
  },
  {
    id: 4,
    title: "Smart Home Installation",
    category: "Technology",
    provider: {
      name: "Jamie Wilson",
      avatar: "/avatar-executive-professional.png",
      rating: 4.7,
      reviews: 87,
      verified: true,
    },
    price: "$120",
    timeEstimate: "2-3 hours",
    description:
      "Complete smart home setup and integration. Connect all your devices for a seamless smart home experience.",
    images: [
      "/placeholder.svg?height=600&width=800&query=Smart home installation with technician",
      "/placeholder.svg?height=600&width=800&query=Smart home devices connected in modern living room",
      "/placeholder.svg?height=600&width=800&query=Smart home control panel and automation",
    ],
    tags: ["Smart Home", "Home Automation", "IoT Setup"],
    featured: true,
    completedProjects: 145,
    satisfaction: 97,
  },
]

// Define categories
const categories = [
  { id: "all", name: "All Services", icon: Briefcase },
  { id: "mounting", name: "Mounting", icon: Briefcase },
  { id: "assembly", name: "Assembly", icon: Briefcase },
  { id: "painting", name: "Painting", icon: Briefcase },
  { id: "technology", name: "Technology", icon: Briefcase },
]

export function ImmersiveServiceShowcase() {
  const [activeService, setActiveService] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRotating, setIsRotating] = useState(true)
  const [rotationAngle, setRotationAngle] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipContent, setTooltipContent] = useState("")
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const showcaseRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const inView = useInView(containerRef, { once: false, threshold: 0.2 })
  const router = useRouter()
  const isMobile = useMobile()

  // Filter services based on active category
  const filteredServices =
    activeCategory === "all"
      ? featuredServices
      : featuredServices.filter((service) => service.category.toLowerCase() === activeCategory)

  // Handle mouse move for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!showcaseRef.current) return

    const rect = showcaseRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    setMousePosition({ x, y })
  }

  // Handle service selection
  const handleServiceSelect = (id: number) => {
    setActiveService(id === activeService ? null : id)
    setActiveImageIndex(0)
    setIsRotating(false)
  }

  // Handle tooltip display
  const handleTooltip = (content: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setTooltipContent(content)
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
    setShowTooltip(true)
  }

  // Reset tooltip on mouse leave
  const handleTooltipLeave = () => {
    setShowTooltip(false)
  }

  // Animate rotation
  useEffect(() => {
    if (!isRotating) return

    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 1) % 360)
    }, 50)

    return () => clearInterval(interval)
  }, [isRotating])

  // Auto-rotate through images
  useEffect(() => {
    if (activeService === null) return

    const interval = setInterval(() => {
      const service = featuredServices.find((s) => s.id === activeService)
      if (!service) return

      setActiveImageIndex((prev) => (prev + 1) % service.images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [activeService])

  // Animate when in view
  useEffect(() => {
    if (inView) {
      controls.start("visible")
      setIsLoaded(true)
    }
  }, [controls, inView])

  // Generate random particles for background effect
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
  }))

  return (
    <motion.section
      ref={containerRef}
      className={`w-full py-16 md:py-24 relative overflow-hidden ${isExpanded ? "min-h-[800px]" : "min-h-[600px]"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 z-0" />

      {/* Particle system */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/10 z-0"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      ))}

      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_14px] z-0 opacity-20" />

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          initial="hidden"
          animate={controls}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Immersive Service Showcase</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <span className="block">Explore Services in</span>
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              Stunning 3D
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover top-rated services with our immersive 3D showcase. Browse, compare, and find the perfect service
            for your needs.
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="flex overflow-x-auto pb-4 -mx-2 px-2 mb-8 scrollbar-hide space-x-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center whitespace-nowrap ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/20"
                  : "bg-white/80 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/70 border border-gray-200 dark:border-gray-700"
              }`}
              onClick={() => setActiveCategory(category.id)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <category.icon className="h-4 w-4 mr-2" />
              {category.name}
            </motion.button>
          ))}
        </div>

        {/* 3D Showcase */}
        <div
          ref={showcaseRef}
          className="relative"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Main showcase */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate={controls}
          >
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                className={`group relative ${activeService === service.id ? "md:col-span-2 md:row-span-2" : ""}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5 }}
                onClick={() => handleServiceSelect(service.id)}
                style={{
                  zIndex: activeService === service.id ? 10 : 1,
                }}
              >
                <motion.div
                  className={`relative overflow-hidden rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-lg transition-all duration-500 h-full ${
                    activeService === service.id
                      ? "bg-white dark:bg-gray-900"
                      : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl"
                  }`}
                  layout
                  style={{
                    transform:
                      isHovering && !isMobile && activeService !== service.id
                        ? `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`
                        : "perspective(1000px) rotateY(0) rotateX(0)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  {/* Service image */}
                  <div className="relative">
                    <div className={`overflow-hidden ${activeService === service.id ? "h-64 md:h-80" : "h-48"}`}>
                      <AnimatePresence mode="wait">
                        {activeService === service.id ? (
                          <motion.div
                            key={`active-${activeImageIndex}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative h-full w-full"
                          >
                            <Image
                              src={service.images[activeImageIndex] || "/placeholder.svg"}
                              alt={service.title}
                              fill
                              className="object-cover"
                            />

                            {/* Image navigation */}
                            <div className="absolute bottom-4 right-4 flex space-x-2">
                              {service.images.map((_, imgIndex) => (
                                <button
                                  key={imgIndex}
                                  className={`w-2 h-2 rounded-full ${
                                    activeImageIndex === imgIndex ? "bg-white" : "bg-white/50"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveImageIndex(imgIndex)
                                  }}
                                />
                              ))}
                            </div>

                            {/* Image navigation arrows */}
                            <button
                              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveImageIndex((prev) => (prev === 0 ? service.images.length - 1 : prev - 1))
                              }}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveImageIndex((prev) => (prev + 1) % service.images.length)
                              }}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key={`preview-${service.id}`}
                            className="relative h-full w-full group-hover:scale-110 transition-transform duration-700"
                          >
                            <Image
                              src={service.images[0] || "/placeholder.svg"}
                              alt={service.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Category tag */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full text-xs font-medium shadow-sm">
                        {service.category}
                      </span>
                    </div>

                    {/* Featured badge */}
                    {service.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-primary/90 text-white rounded-full text-xs font-medium shadow-sm flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Service details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{service.title}</h3>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="ml-1 text-sm font-medium">{service.provider.rating}</span>
                          </div>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">{service.provider.reviews} reviews</span>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-primary">{service.price}</div>
                    </div>

                    {activeService === service.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {service.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{service.timeEstimate}</span>
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{service.completedProjects} projects</span>
                          </div>
                          <div className="flex items-center">
                            <Zap className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{service.satisfaction}% satisfaction</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">Top provider</span>
                          </div>
                        </div>

                        <div className="flex items-center mb-4">
                          <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                            <Image
                              src={service.provider.avatar || "/placeholder.svg"}
                              alt={service.provider.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium">{service.provider.name}</span>
                              {service.provider.verified && (
                                <span className="ml-1 bg-blue-500 text-white rounded-full p-0.5">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-3 w-3"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">Professional Service Provider</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <EnhancedButton
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/services/${service.id}`)
                            }}
                          >
                            Book Now
                          </EnhancedButton>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle save/favorite
                            }}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle message
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {activeService !== service.id && (
                      <>
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{service.timeEstimate}</span>
                          <span className="mx-2">•</span>
                          <Briefcase className="h-4 w-4 mr-1" />
                          <span>{service.completedProjects} completed</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="relative h-6 w-6 rounded-full overflow-hidden mr-2">
                              <Image
                                src={service.provider.avatar || "/placeholder.svg"}
                                alt={service.provider.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="text-sm">{service.provider.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{Math.floor(Math.random() * 100) + 50}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Hover effect overlay */}
                  {activeService !== service.id && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  )}

                  {/* 3D effect elements */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_0%,transparent_60%)]" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating action buttons */}
          <div className="fixed bottom-8 right-8 flex flex-col space-y-2 z-20">
            <motion.button
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsRotating(!isRotating)}
            >
              {isRotating ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </motion.button>
            <motion.button
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>

        {/* View all services button */}
        <div className="mt-12 text-center">
          <EnhancedButton onClick={() => router.push("/explore")}>
            View All Services <ArrowRight className="ml-2 h-4 w-4" />
          </EnhancedButton>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="fixed bg-black/80 text-white rounded-md px-2 py-1 text-xs z-50 pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: "translate(-50%, -100%)",
            }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            {tooltipContent}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

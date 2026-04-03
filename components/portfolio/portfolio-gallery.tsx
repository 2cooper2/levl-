"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ExternalLink, Award, Filter, Grid3X3, LayoutList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface PortfolioItem {
  id: string
  title: string
  description: string
  image: string
  category: string
  tags: string[]
  date: string
  featured?: boolean
  clientName?: string
  testimonial?: {
    text: string
    name: string
    title: string
  }
  additionalImages?: string[]
}

interface PortfolioGalleryProps {
  items: PortfolioItem[]
  userId: string
  className?: string
  initialCategory?: string
  compact?: boolean
}

export function PortfolioGallery({
  items,
  userId,
  className,
  initialCategory = "all",
  compact = false,
}: PortfolioGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState(initialCategory)
  const [viewMode, setViewMode] = useState<"grid" | "carousel" | "list">("grid")
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)

  const categories = ["all", ...Array.from(new Set(items.map((item) => item.category)))]

  const filteredItems = items.filter((item) => activeFilter === "all" || item.category === activeFilter)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
  }

  const handleItemClick = (item: PortfolioItem) => {
    setSelectedItem(item)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold">Portfolio</h2>

          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "carousel" | "list")}>
              <TabsList className="h-9">
                <TabsTrigger value="grid" className="px-3">
                  <Grid3X3 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="carousel" className="px-3">
                  <LayoutList className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-3">
                  <Filter className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeFilter === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div
          className={cn(
            "grid gap-4",
            compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                {item.featured && (
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && <span className="text-xs text-gray-500">+{item.tags.length - 3} more</span>}
                </div>

                {item.testimonial && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-sm italic text-gray-600 dark:text-gray-400">"{item.testimonial.text}"</p>
                    <p className="text-xs mt-1">- {item.testimonial.name}</p>
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                      onClick={() => handleItemClick(item)}
                    >
                      View Details <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                    <PortfolioItemDetail item={item} />
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Carousel View */}
      {viewMode === "carousel" && (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[16/9]"
            >
              <img
                src={filteredItems[currentIndex]?.image || "/placeholder.svg"}
                alt={filteredItems[currentIndex]?.title}
                className="object-cover w-full h-full"
              />

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                <h3 className="text-xl font-bold mb-2">{filteredItems[currentIndex]?.title}</h3>
                <p className="text-white/80">{filteredItems[currentIndex]?.description}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2">
            {filteredItems.map((_, i) => (
              <button
                key={i}
                className={`h-2 w-2 rounded-full ${i === currentIndex ? "bg-white" : "bg-white/30"}`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-48 h-48">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
                      {item.featured && (
                        <Badge className="absolute top-2 right-2 bg-primary text-white">Featured</Badge>
                      )}
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                        </div>
                        <div className="text-sm text-gray-500">{item.date}</div>
                      </div>

                      <p className="mt-2 text-gray-700 dark:text-gray-300">{item.description}</p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => handleItemClick(item)}>
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                            <PortfolioItemDetail item={item} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!compact && filteredItems.length > 6 && (
        <div className="flex justify-center mt-6">
          <Button variant="outline">Load More</Button>
        </div>
      )}
    </div>
  )
}

function PortfolioItemDetail({ item }: { item: PortfolioItem }) {
  const [activeImage, setActiveImage] = useState(item.image)

  const allImages = [item.image, ...(item.additionalImages || [])]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-full">
      <div className="relative bg-black flex items-center justify-center">
        <img src={activeImage || "/placeholder.svg"} alt={item.title} className="max-h-[70vh] object-contain" />
      </div>

      <div className="p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <p className="text-gray-500 capitalize">{item.category}</p>
          </div>
          {item.featured && (
            <Badge className="bg-primary">
              <Award className="h-3 w-3 mr-1" /> Featured
            </Badge>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
          </div>

          {item.clientName && (
            <div>
              <h3 className="text-lg font-medium mb-2">Client</h3>
              <p className="text-gray-700 dark:text-gray-300">{item.clientName}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {item.testimonial && (
            <div>
              <h3 className="text-lg font-medium mb-2">Client Testimonial</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="italic text-gray-700 dark:text-gray-300">"{item.testimonial.text}"</p>
                <div className="mt-2">
                  <p className="font-medium">{item.testimonial.name}</p>
                  <p className="text-sm text-gray-500">{item.testimonial.title}</p>
                </div>
              </div>
            </div>
          )}

          {allImages.length > 1 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Gallery</h3>
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-md overflow-hidden border-2 ${
                      activeImage === image ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setActiveImage(image)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Gallery ${index + 1}`}
                      className="h-16 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">Completed on {item.date}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

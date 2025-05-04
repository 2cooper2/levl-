"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MainNav } from "@/components/main-nav"
import { MobileServiceCard } from "@/components/mobile/mobile-service-card"
import { ResponsiveGrid } from "@/components/mobile/responsive-grid"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { motion } from "framer-motion"
import { MobileFilterModal, type FilterState } from "@/components/explore/mobile-filter-modal"
import { useMobile } from "@/hooks/use-mobile"
import { ServiceCard } from "@/components/service-card"

export default function MobileExplore() {
  const router = useRouter()
  const isMobile = useMobile()
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    categories: [
      { id: "technology", name: "Technology", checked: false },
      { id: "creative", name: "Creative", checked: false },
      { id: "writing", name: "Writing", checked: false },
      { id: "marketing", name: "Marketing", checked: false },
      { id: "business", name: "Business", checked: false },
    ],
    priceRange: [0, 1000],
    ratings: [
      { id: "4.5", name: "4.5 & up", checked: false },
      { id: "4.0", name: "4.0 & up", checked: false },
      { id: "3.5", name: "3.5 & up", checked: false },
      { id: "3.0", name: "3.0 & up", checked: false },
    ],
    locations: [
      { id: "remote", name: "Remote", checked: false },
      { id: "local", name: "Local", checked: false },
      { id: "onsite", name: "On-site", checked: false },
    ],
  })

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const services = [
    {
      id: "web-development",
      image: "/placeholder.svg?height=300&width=400&text=Web+Development",
      title: "Professional Website Development",
      price: "From $499",
      rating: 4.9,
      reviews: 124,
      provider: {
        name: "Alex Morgan",
        avatar: "/placeholder.svg?height=40&width=40&text=AM",
        level: "Top Rated",
      },
      tags: ["Web Design", "Responsive", "E-commerce"],
      category: "Technology",
    },
    {
      id: "logo-design",
      image: "/placeholder.svg?height=300&width=400&text=Logo+Design",
      title: "Custom Logo Design & Branding",
      price: "From $199",
      rating: 4.8,
      reviews: 89,
      provider: {
        name: "Sarah Chen",
        avatar: "/placeholder.svg?height=40&width=40&text=SC",
        level: "Level 2",
      },
      tags: ["Logo", "Branding", "Identity"],
      category: "Creative",
    },
    {
      id: "content-writing",
      image: "/placeholder.svg?height=300&width=400&text=Content+Writing",
      title: "SEO Content Writing & Copywriting",
      price: "From $99",
      rating: 4.7,
      reviews: 56,
      provider: {
        name: "James Wilson",
        avatar: "/placeholder.svg?height=40&width=40&text=JW",
        level: "Rising Talent",
      },
      tags: ["SEO", "Content", "Copywriting"],
      category: "Writing",
    },
    {
      id: "social-media",
      image: "/placeholder.svg?height=300&width=400&text=Social+Media",
      title: "Social Media Management & Strategy",
      price: "From $299/mo",
      rating: 4.8,
      reviews: 72,
      provider: {
        name: "Emma Davis",
        avatar: "/placeholder.svg?height=40&width=40&text=ED",
        level: "Top Rated",
      },
      tags: ["Social Media", "Marketing", "Strategy"],
      category: "Marketing",
    },
    {
      id: "app-development",
      image: "/placeholder.svg?height=300&width=400&text=App+Development",
      title: "Mobile App Development",
      price: "From $999",
      rating: 4.9,
      reviews: 48,
      provider: {
        name: "Michael Zhang",
        avatar: "/placeholder.svg?height=40&width=40&text=MZ",
        level: "Level 2",
      },
      tags: ["iOS", "Android", "React Native"],
      category: "Technology",
    },
    {
      id: "video-editing",
      image: "/placeholder.svg?height=300&width=400&text=Video+Editing",
      title: "Professional Video Editing",
      price: "From $149",
      rating: 4.7,
      reviews: 63,
      provider: {
        name: "Olivia Johnson",
        avatar: "/placeholder.svg?height=40&width=40&text=OJ",
        level: "Rising Talent",
      },
      tags: ["Video", "Editing", "Animation"],
      category: "Creative",
    },
  ]

  const filteredServices = services.filter((service) => {
    // Filter by search query
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by category
    const matchesCategory =
      !filters.categories.some((cat) => cat.checked) ||
      filters.categories.find((cat) => cat.id.toLowerCase() === service.category.toLowerCase())?.checked

    // Filter by rating
    const matchesRating =
      !filters.ratings.some((r) => r.checked) ||
      filters.ratings.some((r) => r.checked && service.rating >= Number.parseFloat(r.id))

    // Filter by price range
    const servicePrice = Number.parseInt(service.price.replace(/\D/g, ""))
    const matchesPrice = servicePrice >= filters.priceRange[0] && servicePrice <= filters.priceRange[1]

    return matchesSearch && matchesCategory && matchesRating && matchesPrice
  })

  const resetFilters = () => {
    setSearchQuery("")
    setFilters({
      ...filters,
      categories: filters.categories.map((cat) => ({ ...cat, checked: false })),
      ratings: filters.ratings.map((r) => ({ ...r, checked: false })),
      locations: filters.locations.map((loc) => ({ ...loc, checked: false })),
      priceRange: [0, 1000],
    })
  }

  const countActiveFilters = () => {
    let count = 0

    // Count checked categories
    count += filters.categories.filter((cat) => cat.checked).length

    // Count checked ratings
    count += filters.ratings.filter((r) => r.checked).length

    // Count checked locations
    count += filters.locations.filter((loc) => loc.checked).length

    // Count if price range is not default
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      count += 1
    }

    return count
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 py-8 pt-20">
        <div className="container px-4 md:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Explore Services</h1>
            <p className="text-sm text-muted-foreground">
              Find the perfect service for your needs from our talented providers.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for services..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setMobileFiltersOpen(true)}>
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filters</span>
              </Button>
            </div>

            {countActiveFilters() > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Active filters:</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={resetFilters}>
                    <X className="h-3 w-3" /> Clear all
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">{filteredServices.length} results</span>
              </div>
            )}
          </div>

          {filteredServices.length > 0 ? (
            <motion.div
              className="mt-6"
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              <ResponsiveGrid>
                {filteredServices.map((service, index) =>
                  isMobile ? (
                    <MobileServiceCard
                      key={service.id}
                      id={service.id}
                      image={service.image}
                      title={service.title}
                      price={service.price}
                      rating={service.rating}
                      reviews={service.reviews}
                      provider={service.provider}
                      tags={service.tags}
                      delay={index}
                    />
                  ) : (
                    <ServiceCard
                      key={service.id}
                      id={service.id}
                      image={service.image}
                      title={service.title}
                      price={service.price}
                      rating={service.rating}
                      reviews={service.reviews}
                      provider={service.provider}
                      tags={service.tags}
                      delay={index}
                    />
                  ),
                )}
              </ResponsiveGrid>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center mt-6">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                We couldn't find any services matching your search criteria.
              </p>
              <Button onClick={resetFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </main>

      <MobileFilterModal
        isOpen={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        filters={filters}
        setFilters={setFilters}
        onResetFilters={resetFilters}
        countActiveFilters={countActiveFilters}
      />
    </div>
  )
}

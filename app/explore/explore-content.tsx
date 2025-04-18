"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ServiceCard } from "@/components/service-card"
import { Filter, Search, SlidersHorizontal, X, Star, ArrowUpDown, Tag, Globe } from "lucide-react"
import { MobileFilterModal, type FilterState } from "@/components/explore/mobile-filter-modal"
import { FilterDropdown } from "@/components/explore/filter-dropdown"

export default function ExploreContent() {
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
      { id: "worldwide", name: "Worldwide", checked: false },
      { id: "north-america", name: "North America", checked: false },
      { id: "europe", name: "Europe", checked: false },
      { id: "asia", name: "Asia", checked: false },
      { id: "australia", name: "Australia", checked: false },
    ],
  })
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<string | null>("relevance")

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
      location: "North America",
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
      location: "Asia",
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
      location: "Europe",
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
      location: "North America",
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
      location: "Asia",
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
      location: "Europe",
    },
    {
      id: "accounting",
      image: "/placeholder.svg?height=300&width=400&text=Accounting",
      title: "Bookkeeping & Financial Statements",
      price: "From $199/mo",
      rating: 4.8,
      reviews: 42,
      provider: {
        name: "Robert Lee",
        avatar: "/placeholder.svg?height=40&width=40&text=RL",
        level: "Top Rated",
      },
      tags: ["Accounting", "Bookkeeping", "Finance"],
      category: "Business",
      location: "North America",
    },
    {
      id: "translation",
      image: "/placeholder.svg?height=300&width=400&text=Translation",
      title: "Professional Translation Services",
      price: "From $0.10/word",
      rating: 4.9,
      reviews: 37,
      provider: {
        name: "Maria Garcia",
        avatar: "/placeholder.svg?height=40&width=40&text=MG",
        level: "Level 2",
      },
      tags: ["Translation", "Localization", "Proofreading"],
      category: "Writing",
      location: "Asia",
    },
    {
      id: "voice-over",
      image: "/placeholder.svg?height=300&width=400&text=Voice+Over",
      title: "Professional Voice Over Services",
      price: "From $99",
      rating: 4.7,
      reviews: 29,
      provider: {
        name: "David Kim",
        avatar: "/placeholder.svg?height=40&width=40&text=DK",
        level: "Rising Talent",
      },
      tags: ["Voice Over", "Narration", "Commercial"],
      category: "Creative",
      location: "Europe",
    },
  ]

  const filteredServices = services.filter((service) => {
    // Filter by search query
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by category
    const matchesCategory = !selectedCategory || service.category === selectedCategory

    // Filter by rating
    const matchesRating = !selectedRating || service.rating >= Number.parseFloat(selectedRating)

    // Filter by location
    const matchesLocation = !selectedLocation || service.location === selectedLocation

    // Filter by price range
    const servicePrice = Number.parseInt(service.price.replace(/\D/g, ""))
    const matchesPrice = servicePrice >= filters.priceRange[0] && servicePrice <= filters.priceRange[1]

    return matchesSearch && matchesCategory && matchesRating && matchesLocation && matchesPrice
  })

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory(null)
    setSelectedRating(null)
    setSelectedLocation(null)
    setFilters({
      ...filters,
      priceRange: [0, 1000],
      categories: filters.categories.map((cat) => ({ ...cat, checked: false })),
      ratings: filters.ratings.map((rating) => ({ ...rating, checked: false })),
      locations: filters.locations.map((location) => ({ ...location, checked: false })),
    })
    setSortOption("relevance")
  }

  const countActiveFilters = () => {
    let count = 0

    if (selectedCategory) count++
    if (selectedRating) count++
    if (selectedLocation) count++

    // Count checked categories, ratings, locations
    count += filters.categories.filter((c) => c.checked).length
    count += filters.ratings.filter((r) => r.checked).length
    count += filters.locations.filter((l) => l.checked).length

    // Count if price range is not default
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++

    return count
  }

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "technology", name: "Technology" },
    { id: "creative", name: "Creative" },
    { id: "writing", name: "Writing" },
    { id: "marketing", name: "Marketing" },
    { id: "business", name: "Business" },
  ]

  const sortOptions = [
    { id: "relevance", name: "Relevance" },
    { id: "price-low", name: "Price: Low to High" },
    { id: "price-high", name: "Price: High to Low" },
    { id: "rating", name: "Top Rated" },
    { id: "newest", name: "Newest" },
  ]

  const locations = [
    { id: "all", name: "All Locations" },
    { id: "worldwide", name: "Worldwide" },
    { id: "north-america", name: "North America" },
    { id: "europe", name: "Europe" },
    { id: "asia", name: "Asia" },
    { id: "australia", name: "Australia" },
  ]

  const ratings = [
    { id: "all", name: "Any Rating" },
    { id: "4.5", name: "4.5 & up" },
    { id: "4.0", name: "4.0 & up" },
    { id: "3.5", name: "3.5 & up" },
    { id: "3.0", name: "3.0 & up" },
  ]

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Filters</h3>
        <Button variant="outline" size="sm" className="flex items-center gap-1 mb-4" onClick={resetFilters}>
          <X className="h-3 w-3" /> Clear All
        </Button>
      </div>
      <div className="space-y-4">
        <h4 className="font-medium">Category</h4>
        <div className="space-y-2">
          {filters.categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                checked={category.checked}
                onChange={() => {
                  setFilters((prev) => ({
                    ...prev,
                    categories: prev.categories.map((cat) =>
                      cat.id === category.id ? { ...cat, checked: !cat.checked } : cat,
                    ),
                  }))

                  // Also update the dropdown selection if needed
                  if (!category.checked) {
                    setSelectedCategory(category.name)
                  } else if (category.name === selectedCategory) {
                    setSelectedCategory(null)
                  }
                }}
                className="rounded border-gray-300"
              />
              <label htmlFor={`category-${category.id}`}>{category.name}</label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <h4 className="font-medium">Price Range</h4>
        <div className="space-y-4">
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={filters.priceRange[1]}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                priceRange: [prev.priceRange[0], Number.parseInt(e.target.value)],
              }))
            }
            className="w-full"
          />
          <div className="flex items-center justify-between">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <h4 className="font-medium">Rating</h4>
        <div className="space-y-2">
          {filters.ratings.map((rating) => (
            <div key={rating.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`rating-${rating.id}`}
                checked={rating.checked}
                onChange={() => {
                  setFilters((prev) => ({
                    ...prev,
                    ratings: prev.ratings.map((r) => (r.id === rating.id ? { ...r, checked: !r.checked } : r)),
                  }))

                  // Also update the dropdown selection if needed
                  if (!rating.checked) {
                    setSelectedRating(rating.id)
                  } else if (rating.id === selectedRating) {
                    setSelectedRating(null)
                  }
                }}
                className="rounded border-gray-300"
              />
              <label htmlFor={`rating-${rating.id}`} className="flex items-center">
                {rating.name}
                <Star className="h-3 w-3 ml-1 fill-yellow-400 text-yellow-400" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <main className="flex-1 py-8">
      <div className="container px-4 md:px-6">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight mb-2">Explore Services</h1>
          <p className="text-muted-foreground">Find the perfect service for your needs from our talented providers.</p>
        </motion.div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Filters */}
          <motion.div
            className="hidden md:block w-64 shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FiltersContent />
          </motion.div>

          {/* Mobile Filters Modal */}
          <MobileFilterModal
            isOpen={mobileFiltersOpen}
            onOpenChange={setMobileFiltersOpen}
            filters={filters}
            setFilters={setFilters}
            onResetFilters={resetFilters}
            countActiveFilters={countActiveFilters}
          />

          <div className="flex-1">
            <motion.div
              className="flex flex-col gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for services..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Category Dropdown */}
                <div className="w-[180px] hidden md:block">
                  <FilterDropdown
                    label="All Categories"
                    options={categories}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    icon={<Tag className="h-4 w-4" />}
                  />
                </div>

                {/* Location Dropdown (desktop only) */}
                <div className="w-[180px] hidden lg:block">
                  <FilterDropdown
                    label="All Locations"
                    options={locations}
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    icon={<Globe className="h-4 w-4" />}
                  />
                </div>

                <Button variant="outline" size="icon" className="md:hidden" onClick={() => setMobileFiltersOpen(true)}>
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">Filters</span>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredServices.length} results
                  {countActiveFilters() > 0 && (
                    <Button variant="ghost" size="sm" className="ml-2 h-7 px-2 text-xs" onClick={resetFilters}>
                      <X className="h-3 w-3 mr-1" /> Clear filters
                    </Button>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden gap-1"
                    onClick={() => setMobileFiltersOpen(true)}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {countActiveFilters() > 0 && (
                      <span className="ml-1 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                        {countActiveFilters()}
                      </span>
                    )}
                  </Button>

                  {/* Sort Dropdown */}
                  <div className="w-[160px]">
                    <FilterDropdown
                      label="Sort by"
                      options={sortOptions}
                      value={sortOption}
                      onChange={(value) => setSortOption(value || "relevance")}
                      icon={<ArrowUpDown className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {filteredServices.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
              >
                {filteredServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <ServiceCard
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
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center py-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any services matching your search criteria.
                </p>
                <Button onClick={resetFilters}>Clear Filters</Button>
              </motion.div>
            )}

            {filteredServices.length > 0 && (
              <motion.div
                className="mt-8 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button variant="outline" className="gap-2">
                  Load More <ArrowUpDown className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

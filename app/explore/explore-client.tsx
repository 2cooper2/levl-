"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MainNav } from "@/components/main-nav"
import { ServiceCard } from "@/components/service-card"
import { Filter, Search, SlidersHorizontal, X, Star, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function ExploreClientPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState("relevance")
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)

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
    },
  ]

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

  const ratings = [
    { id: "4.5", name: "4.5 & up" },
    { id: "4.0", name: "4.0 & up" },
    { id: "3.5", name: "3.5 & up" },
    { id: "3.0", name: "3.0 & up" },
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

    // Filter by price range
    const servicePrice = Number.parseInt(service.price.replace(/\D/g, ""))
    const matchesPrice = servicePrice >= priceRange[0] && servicePrice <= priceRange[1]

    return matchesSearch && matchesCategory && matchesRating && matchesPrice
  })

  const resetFilters = () => {
    setSearchQuery("")
    setPriceRange([0, 1000])
    setSelectedCategory(null)
    setSelectedRating(null)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setCategoryDropdownOpen(false)
      setSortDropdownOpen(false)
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

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
          {categories.slice(1).map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategory === category.name}
                onCheckedChange={() => {
                  setSelectedCategory(selectedCategory === category.name ? null : category.name)
                }}
              />
              <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <h4 className="font-medium">Price Range</h4>
        <div className="space-y-4">
          <Slider defaultValue={[0, 1000]} max={1000} step={10} value={priceRange} onValueChange={setPriceRange} />
          <div className="flex items-center justify-between">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <h4 className="font-medium">Rating</h4>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <div key={rating.id} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating.id}`}
                checked={selectedRating === rating.id}
                onCheckedChange={() => {
                  setSelectedRating(selectedRating === rating.id ? null : rating.id)
                }}
              />
              <Label htmlFor={`rating-${rating.id}`} className="flex items-center gap-1">
                {rating.name}
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Simple dropdown component that doesn't use any shadcn components
  const SimpleDropdown = ({
    options,
    value,
    onChange,
    placeholder,
    isOpen,
    setIsOpen,
  }: {
    options: { id: string; name: string }[]
    value: string | null
    onChange: (value: string | null) => void
    placeholder: string
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
  }) => {
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsOpen(!isOpen)
    }

    const selectedOption = value ? options.find((option) => option.id === value || option.name === value) : options[0]

    return (
      <div className="relative">
        <button
          type="button"
          className="flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md shadow-sm bg-background hover:bg-accent"
          onClick={handleClick}
        >
          <span>{value ? selectedOption?.name : placeholder}</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-accent ${
                    value === option.id || value === option.name ? "bg-accent/50" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onChange(option.id === "all" ? null : option.name)
                    setIsOpen(false)
                  }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Explore Services</h1>
            <p className="text-muted-foreground">
              Find the perfect service for your needs from our talented providers.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop Filters */}
            <div className="hidden md:block w-64 shrink-0">
              <FiltersContent />
            </div>

            {/* Mobile Filters */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetContent side="left" className="w-full sm:max-w-md">
                <FiltersContent />
              </SheetContent>
            </Sheet>

            <div className="flex-1">
              <div className="flex flex-col gap-4 mb-6">
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

                  {/* Simple dropdown for categories */}
                  <div className="w-[180px]">
                    <SimpleDropdown
                      options={categories}
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      placeholder="All Categories"
                      isOpen={categoryDropdownOpen}
                      setIsOpen={setCategoryDropdownOpen}
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileFiltersOpen(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="sr-only">Filters</span>
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Showing {filteredServices.length} results</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:hidden gap-1"
                      onClick={() => setMobileFiltersOpen(true)}
                    >
                      <Filter className="h-4 w-4" /> Filters
                    </Button>

                    {/* Simple dropdown for sort options */}
                    <div className="w-[140px]">
                      <SimpleDropdown
                        options={sortOptions}
                        value={sortOption}
                        onChange={(value) => setSortOption(value || "relevance")}
                        placeholder="Sort by"
                        isOpen={sortDropdownOpen}
                        setIsOpen={setSortDropdownOpen}
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                  ))}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find any services matching your search criteria.
                  </p>
                  <Button onClick={resetFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

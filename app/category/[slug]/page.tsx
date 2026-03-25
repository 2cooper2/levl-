"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { LevlLogo } from "@/components/levl-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Filter,
  ArrowUpDown,
  MapPin,
  Clock,
  Search,
  ChevronDown,
  Heart,
  MessageSquare,
  Briefcase,
  DollarSign,
  Award,
  Users,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Add these keyframe animations
const animationKeyframes = {
  shimmer: `@keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }`,
  float: `@keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }`,
  pulse: `@keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }`,
  gradientMove: `@keyframes gradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }`,
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 500])
  const [showFilters, setShowFilters] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const categorySlug = params.slug

  // Convert slug to display name (e.g., "web-development" -> "Web Development")
  const categoryName = categorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Mock data for providers in this category
  const providers = [
    {
      id: "caydon-cooper",
      name: "Caydon Cooper",
      title: "Professional TV & Art Mounting Specialist",
      avatar: "/placeholder.svg?height=80&width=80&text=CC",
      rating: 4.9,
      reviews: 124,
      location: "Los Angeles, USA",
      hourlyRate: 75,
      responseTime: "Under 2 hours",
      tags: ["TV Mounting", "Art Installation", "Cable Management"],
      featured: true,
      description:
        "Experienced mounting specialist providing professional TV, artwork, and home theater installation with clean cable management.",
      completedProjects: 87,
      languages: ["English", "Spanish"],
    },
  ]

  // Category stats
  const categoryStats = {
    experts: providers.length,
    averageRating: 4.8,
    completedProjects: 244,
    averageResponse: "2.5 hours",
  }

  // Filter options
  const expertiseOptions = [
    { id: "frontend", name: "Frontend Development" },
    { id: "backend", name: "Backend Development" },
    { id: "fullstack", name: "Full Stack Development" },
    { id: "ui-design", name: "UI Design" },
    { id: "ux-design", name: "UX Design" },
    { id: "mobile", name: "Mobile Development" },
  ]

  const ratingOptions = [
    { id: "4.5", name: "4.5 & up" },
    { id: "4.0", name: "4.0 & up" },
    { id: "3.5", name: "3.5 & up" },
  ]

  const locationOptions = [
    { id: "worldwide", name: "Worldwide" },
    { id: "north-america", name: "North America" },
    { id: "europe", name: "Europe" },
    { id: "asia", name: "Asia" },
    { id: "australia", name: "Australia" },
  ]

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  // Star rating component
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  )

  // Filter panel component
  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Add subtle animation to filter panel */}
      <style jsx>{`
        .filter-item {
          transition: all 0.2s ease;
        }
        .filter-item:hover {
          background-color: rgba(147, 51, 234, 0.05);
          transform: translateX(5px);
        }
        .filter-header {
          position: relative;
          overflow: hidden;
        }
        .filter-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.3), transparent);
        }
      `}</style>
      <div className="bg-background/80 backdrop-blur-sm rounded-xl border border-purple-200/30 dark:border-purple-900/30 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 border-b border-purple-200/30 dark:border-purple-900/30 filter-header">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center text-base bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              <Filter className="mr-2 h-4 w-4 text-primary" />
              <span className="text-foreground">Filters</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-normal text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Reset All
            </Button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Search Section */}
          <div className="group">
            <h4 className="text-sm font-medium mb-3 flex items-center group-hover:text-primary transition-colors duration-200">
              <div className="mr-2 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
                <Search className="h-3 w-3 text-white" />
              </div>
              Search
            </h4>
            <div className="relative">
              <Input
                placeholder="Search experts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 border-purple-200/50 dark:border-purple-900/50 focus-visible:ring-primary transition-all duration-200"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <Separator className="bg-purple-200/30 dark:bg-purple-900/30" />

          {/* Expertise Section */}
          <div className="group">
            <h4 className="text-sm font-medium mb-3 flex items-center group-hover:text-primary transition-colors duration-200">
              <div className="mr-2 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
                <Briefcase className="h-3 w-3 text-white" />
              </div>
              Expertise
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {expertiseOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors duration-200 filter-item"
                >
                  <Checkbox
                    id={`expertise-${option.id}`}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor={`expertise-${option.id}`} className="text-sm font-normal cursor-pointer">
                    {option.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-purple-200/30 dark:bg-purple-900/30" />

          {/* Hourly Rate Section */}
          <div className="group">
            <h4 className="text-sm font-medium mb-3 flex items-center group-hover:text-primary transition-colors duration-200">
              <div className="mr-2 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
                <DollarSign className="h-3 w-3 text-white" />
              </div>
              Hourly Rate
            </h4>
            <div className="px-2 space-y-5">
              <Slider
                value={priceRange}
                min={0}
                max={200}
                step={5}
                onValueChange={setPriceRange}
                className="[&>span]:bg-primary"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-primary">${priceRange[0]}</span>
                <span className="font-medium text-primary">${priceRange[1]}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs justify-start h-auto py-2 border-purple-200/50 dark:border-purple-900/50 hover:border-primary hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                  onClick={() => setPriceRange([0, 50])}
                >
                  <span className="flex flex-col items-start">
                    <span className="font-medium">Budget</span>
                    <span className="text-muted-foreground text-[10px]">Under $50/hr</span>
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs justify-start h-auto py-2 border-purple-200/50 dark:border-purple-900/50 hover:border-primary hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                  onClick={() => setPriceRange([50, 100])}
                >
                  <span className="flex flex-col items-start">
                    <span className="font-medium">Mid-range</span>
                    <span className="text-muted-foreground text-[10px]">$50-$100/hr</span>
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs justify-start h-auto py-2 border-purple-200/50 dark:border-purple-900/50 hover:border-primary hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                  onClick={() => setPriceRange([100, 150])}
                >
                  <span className="flex flex-col items-start">
                    <span className="font-medium">Premium</span>
                    <span className="text-muted-foreground text-[10px]">$100-$150/hr</span>
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs justify-start h-auto py-2 border-purple-200/50 dark:border-purple-900/50 hover:border-primary hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                  onClick={() => setPriceRange([150, 200])}
                >
                  <span className="flex flex-col items-start">
                    <span className="font-medium">Enterprise</span>
                    <span className="text-muted-foreground text-[10px]">$150/hr and up</span>
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-purple-200/30 dark:bg-purple-900/30" />

          {/* Rating Section */}
          <div className="group">
            <h4 className="text-sm font-medium mb-3 flex items-center group-hover:text-primary transition-colors duration-200">
              <div className="mr-2 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
              Rating
            </h4>
            <RadioGroup defaultValue="4.5" className="space-y-2">
              {ratingOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors duration-200 filter-item"
                >
                  <RadioGroupItem
                    value={option.id}
                    id={`rating-${option.id}`}
                    className="text-primary border-purple-200 dark:border-purple-800"
                  />
                  <Label
                    htmlFor={`rating-${option.id}`}
                    className="text-sm font-normal cursor-pointer flex items-center justify-between w-full"
                  >
                    <span>{option.name}</span>
                    <div className="ml-2 flex">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Number.parseFloat(option.id)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator className="bg-purple-200/30 dark:bg-purple-900/30" />

          {/* Location Section */}
          <div className="group">
            <h4 className="text-sm font-medium mb-3 flex items-center group-hover:text-primary transition-colors duration-200">
              <div className="mr-2 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
                <MapPin className="h-3 w-3 text-white" />
              </div>
              Location
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {locationOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors duration-200 filter-item"
                >
                  <Checkbox
                    id={`location-${option.id}`}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor={`location-${option.id}`} className="text-sm font-normal cursor-pointer">
                    {option.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-md hover:shadow-lg transition-all duration-300 group">
              <span>Apply Filters</span>
              <Filter className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <AnimatedGradientBackground />
      <EnhancedMainNav />

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden border-b z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-purple-400/5 to-background z-0 animate-gradient-slow"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full filter blur-[120px] animate-pulse-slow-delay-2"></div>

        {/* Add decorative elements */}
        <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-primary/20 animate-[float_5s_ease-in-out_infinite_1.5s]"></div>

        {/* Add subtle particle effect */}

        {/* Add subtle light beam effect */}

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {categoryName} Experts
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Connect with top-rated {categoryName.toLowerCase()} professionals ready to help you succeed
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Add subtle hover effect to each stat card */}
              <style jsx>{`
                .stat-card {
                  transition: all 0.3s ease;
                  position: relative;
                  overflow: hidden;
                }
                .stat-card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .stat-card::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 200%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                  transform: translateX(-100%);
                }
                .stat-card:hover::after {
                  transition: transform 0.6s ease;
                  transform: translateX(100%);
                }
              `}</style>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border stat-card">
                <div className="text-2xl md:text-3xl font-bold text-primary">{categoryStats.experts}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 mr-1.5" /> Available Experts
                </div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border stat-card">
                <div className="text-2xl md:text-3xl font-bold text-primary flex items-center justify-center">
                  {categoryStats.averageRating} <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border stat-card">
                <div className="text-2xl md:text-3xl font-bold text-primary">{categoryStats.completedProjects}+</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Award className="h-3.5 w-3.5 mr-1.5" /> Completed Projects
                </div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border stat-card">
                <div className="text-2xl md:text-3xl font-bold text-primary">{categoryStats.averageResponse}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 mr-1.5" /> Avg. Response Time
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="flex-1 py-8 md:py-12 relative z-20 w-full">
        <div className="container px-4 md:px-6 relative">
          {/* Mobile Filter Button */}
          <div className="md:hidden mb-4 relative z-10">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-between">
                  <span className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                <div className="py-4">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop Filters */}
            <div className="md:w-72 lg:w-80 hidden md:block">
              <FilterPanel />
            </div>

            {/* Providers Grid */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold">
                  {providers.length} {providers.length === 1 ? "Expert" : "Experts"} Available
                </h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select defaultValue="relevance">
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Most Relevant</SelectItem>
                      <SelectItem value="rating">Highest Rating</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="projects">Most Projects</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6">
                {providers.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="group"
                  >
                    <Card
                      className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] border border-purple-200/30 dark:border-purple-900/30 ${
                        provider.featured
                          ? "bg-gradient-to-br from-purple-50/50 via-background to-primary/5 dark:from-purple-900/20 dark:via-background dark:to-primary/10"
                          : "hover:bg-gradient-to-br hover:from-purple-50/30 hover:via-background hover:to-primary/5 dark:hover:from-purple-900/10 dark:hover:via-background dark:hover:to-primary/5"
                      }`}
                    >
                      <div className="p-6 relative">
                        {/* Add subtle glow effect */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full filter blur-[80px] opacity-60 pointer-events-none"></div>
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full filter blur-[80px] opacity-60 pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row gap-6 relative">
                          {/* Provider Info */}
                          <div className="flex flex-col sm:flex-row md:flex-col items-center gap-4 md:w-48">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-md transition-all duration-300"></div>
                              <Avatar className="h-20 w-20 border-2 border-background shadow-md group-hover:border-primary/50 transition-colors duration-300 ring-2 ring-purple-200/20 dark:ring-purple-900/20 group-hover:ring-primary/30">
                                <AvatarImage src={provider.avatar || "/placeholder.svg"} alt={provider.name} />
                                <AvatarFallback>
                                  {provider.name
                                    .split(" ")
                                    .map((n) => n.charAt(0))
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {provider.featured && (
                                <div className="absolute -top-2 -right-2">
                                  <Badge className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary hover:to-purple-500 text-white border-none shadow-md">
                                    <Award className="h-3 w-3 mr-1" /> Top Rated
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="text-center sm:text-left md:text-center">
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-300">
                                {provider.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">{provider.title}</p>
                              <div className="mt-1 flex items-center justify-center sm:justify-start md:justify-center">
                                <StarRating rating={provider.rating} />
                                <span className="ml-1.5 text-sm font-medium">{provider.rating}</span>
                                <span className="ml-1 text-xs text-muted-foreground">({provider.reviews})</span>
                              </div>
                              <div className="mt-1 flex items-center justify-center sm:justify-start md:justify-center text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                {provider.location}
                              </div>
                            </div>
                          </div>

                          {/* Provider Details */}
                          <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {provider.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs font-normal bg-purple-100/50 dark:bg-purple-900/20 hover:bg-purple-200/70 dark:hover:bg-purple-800/30 transition-colors duration-200"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">{provider.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-1 bg-purple-50/50 dark:bg-purple-900/10 p-2 rounded-md">
                                <p className="text-xs text-muted-foreground">Hourly Rate</p>
                                <p className="font-semibold flex items-center text-primary">
                                  <DollarSign className="h-3.5 w-3.5 text-primary" />
                                  {provider.hourlyRate}/hr
                                </p>
                              </div>
                              <div className="space-y-1 bg-purple-50/50 dark:bg-purple-900/10 p-2 rounded-md">
                                <p className="text-xs text-muted-foreground">Response Time</p>
                                <div className="flex items-center">
                                  <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                                  <p className="text-sm">{provider.responseTime}</p>
                                </div>
                              </div>
                              <div className="space-y-1 bg-purple-50/50 dark:bg-purple-900/10 p-2 rounded-md">
                                <p className="text-xs text-muted-foreground">Completed</p>
                                <div className="flex items-center">
                                  <Briefcase className="h-3.5 w-3.5 mr-1 text-primary" />
                                  <p className="text-sm">{provider.completedProjects} projects</p>
                                </div>
                              </div>
                              <div className="space-y-1 bg-purple-50/50 dark:bg-purple-900/10 p-2 rounded-md">
                                <p className="text-xs text-muted-foreground">Languages</p>
                                <p className="text-sm">{provider.languages.join(", ")}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-4">
                              <Button
                                className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                                onClick={() => router.push(`/services/${provider.id}`)}
                              >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <span className="relative z-10 flex items-center">
                                  View Profile
                                  <svg
                                    className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              </Button>
                              <Button
                                variant="outline"
                                className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-200"
                              >
                                <MessageSquare className="h-4 w-4 mr-2" /> Contact
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-9 w-9 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-200"
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Add subtle interaction cues */}
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>
                      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-purple-500/0 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center"></div>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>
                      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-purple-500/0 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center"></div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  className="gap-2 px-8 relative overflow-hidden group"
                  aria-label="Load more experts"
                >
                  <span>Load More</span>
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="absolute inset-0 w-full h-full bg-primary/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Related Categories Section */}
      <section className="py-12 border-t relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-background/0"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Related Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore other categories that might help you find the perfect expert for your needs
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "UI/UX Design",
              "Mobile Development",
              "Backend Development",
              "DevOps",
              "Data Science",
              "Digital Marketing",
            ].map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link href={`/category/${category.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border text-center hover:border-primary hover:shadow-md transition-all duration-300 h-full flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <h3 className="font-medium text-sm relative z-10">{category}</h3>
                    <p className="text-xs text-muted-foreground mt-1 relative z-10">120+ Experts</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="w-full border-t bg-background py-6 md:py-12 relative">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2">
                <LevlLogo className="h-8 w-8" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  LevL
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                The marketplace where skills meet opportunity. Connect, collaborate, and level up your career or
                business.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <span className="sr-only">Twitter</span>
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <span className="sr-only">Instagram</span>
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <span className="sr-only">LinkedIn</span>
                  <Linkedin className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">For Clients</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Find Services
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Payment Protection
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">For Providers</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Start Selling
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Create Profile
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} LevL. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

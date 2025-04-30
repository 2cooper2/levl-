"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"
import { BackgroundPattern } from "@/components/background-pattern"
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

export default function CategoryPage({ params }) {
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
      title: "Senior Web Developer",
      avatar: "/placeholder.svg?height=80&width=80&text=CC",
      rating: 4.9,
      reviews: 124,
      location: "New York, USA",
      hourlyRate: 65,
      responseTime: "Under 2 hours",
      tags: ["React", "Next.js", "TypeScript", "UI/UX"],
      featured: true,
      description: "Experienced web developer specializing in modern frontend frameworks and responsive design.",
      completedProjects: 87,
      languages: ["English", "Spanish"],
    },
    {
      id: "alex-rivera",
      name: "Alex Rivera",
      title: "Full Stack Developer",
      avatar: "/placeholder.svg?height=80&width=80&text=AR",
      rating: 4.7,
      reviews: 98,
      location: "San Francisco, USA",
      hourlyRate: 75,
      responseTime: "Same day",
      tags: ["React", "Node.js", "MongoDB", "AWS"],
      featured: false,
      description:
        "Full stack developer with expertise in building scalable web applications and cloud infrastructure.",
      completedProjects: 64,
      languages: ["English", "Portuguese"],
    },
    {
      id: "maya-patel",
      name: "Maya Patel",
      title: "UX/UI Designer & Developer",
      avatar: "/placeholder.svg?height=80&width=80&text=MP",
      rating: 4.8,
      reviews: 112,
      location: "London, UK",
      hourlyRate: 70,
      responseTime: "Under 3 hours",
      tags: ["UI Design", "UX Research", "Figma", "React"],
      featured: true,
      description: "Designer-developer hybrid specializing in creating beautiful, user-centered digital experiences.",
      completedProjects: 93,
      languages: ["English", "Hindi"],
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

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="bg-background/80 backdrop-blur-sm rounded-xl border shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center text-base">
              <Filter className="mr-2 h-4 w-4 text-primary" /> Filters
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-normal text-muted-foreground hover:text-foreground"
            >
              Reset All
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-5">
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Search className="h-3.5 w-3.5 mr-1.5 text-primary" /> Search
            </h4>
            <div className="relative">
              <Input
                placeholder="Search experts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Briefcase className="h-3.5 w-3.5 mr-1.5 text-primary" /> Expertise
            </h4>
            <div className="space-y-2">
              {expertiseOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox id={`expertise-${option.id}`} />
                  <Label htmlFor={`expertise-${option.id}`} className="text-sm font-normal cursor-pointer">
                    {option.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <DollarSign className="h-3.5 w-3.5 mr-1.5 text-primary" /> Hourly Rate
            </h4>
            <div className="px-2 space-y-5">
              <Slider value={priceRange} min={0} max={200} step={5} onValueChange={setPriceRange} />
              <div className="flex items-center justify-between text-sm">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs justify-start h-auto py-2"
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
                  className="text-xs justify-start h-auto py-2"
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
                  className="text-xs justify-start h-auto py-2"
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
                  className="text-xs justify-start h-auto py-2"
                  onClick={() => setPriceRange([150, 200])}
                >
                  <span className="flex flex-col items-start">
                    <span className="font-medium">Enterprise</span>
                    <span className="text-muted-foreground text-[10px]">$150+/hr</span>
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Star className="h-3.5 w-3.5 mr-1.5 text-primary" /> Rating
            </h4>
            <RadioGroup defaultValue="4.5">
              {ratingOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={`rating-${option.id}`} />
                  <Label
                    htmlFor={`rating-${option.id}`}
                    className="text-sm font-normal cursor-pointer flex items-center"
                  >
                    {option.name}
                    <div className="ml-2 flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Number(option.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" /> Location
            </h4>
            <div className="space-y-2">
              {locationOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox id={`location-${option.id}`} />
                  <Label htmlFor={`location-${option.id}`} className="text-sm font-normal cursor-pointer">
                    {option.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
              Apply Filters
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
      <section className="relative py-12 md:py-16 overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-background"></div>
        <BackgroundPattern className="opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-[100px]"></div>

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
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border">
                <div className="text-2xl md:text-3xl font-bold text-primary">{categoryStats.experts}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 mr-1.5" /> Available Experts
                </div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border">
                <div className="text-2xl md:text-3xl font-bold text-primary flex items-center justify-center">
                  {categoryStats.averageRating} <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border">
                <div className="text-2xl md:text-3xl font-bold text-primary">{categoryStats.completedProjects}+</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Award className="h-3.5 w-3.5 mr-1.5" /> Completed Projects
                </div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border">
                <div className="text-2xl md:text-3xl font-bold text-primary">{categoryStats.averageResponse}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 mr-1.5" /> Avg. Response Time
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="flex-1 py-8 md:py-12">
        <div className="container px-4 md:px-6">
          {/* Mobile Filter Button */}
          <div className="md:hidden mb-4">
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
                      className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                        provider.featured
                          ? "border-purple-400/50 bg-gradient-to-r from-purple-50/30 to-background dark:from-purple-900/10 dark:to-background"
                          : ""
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Provider Info */}
                          <div className="flex flex-col sm:flex-row md:flex-col items-center gap-4 md:w-48">
                            <div className="relative">
                              <Avatar className="h-20 w-20 border-2 border-background shadow-md group-hover:border-primary transition-colors duration-300">
                                <AvatarImage src={provider.avatar || "/placeholder.svg"} alt={provider.name} />
                                <AvatarFallback>
                                  {provider.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {provider.featured && (
                                <div className="absolute -top-2 -right-2">
                                  <Badge className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary hover:to-purple-500 text-white border-none">
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
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3.5 w-3.5 ${i < Math.floor(provider.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                                    />
                                  ))}
                                </div>
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
                                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">{provider.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Hourly Rate</p>
                                <p className="font-semibold flex items-center">
                                  <DollarSign className="h-3.5 w-3.5 text-primary" />
                                  {provider.hourlyRate}/hr
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Response Time</p>
                                <div className="flex items-center">
                                  <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                                  <p className="text-sm">{provider.responseTime}</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Completed</p>
                                <div className="flex items-center">
                                  <Briefcase className="h-3.5 w-3.5 mr-1 text-primary" />
                                  <p className="text-sm">{provider.completedProjects} projects</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Languages</p>
                                <p className="text-sm">{provider.languages.join(", ")}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-4">
                              <Button
                                className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-sm hover:shadow-md transition-all duration-300"
                                onClick={() => router.push(`/services/${provider.id}`)}
                              >
                                View Profile
                              </Button>
                              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                                <MessageSquare className="h-4 w-4 mr-2" /> Contact
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-9 w-9 text-muted-foreground hover:text-rose-500"
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {provider.featured && (
                        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 px-6 py-2 flex items-center">
                          <Award className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm font-medium">Featured Expert • Top 1% in {categoryName}</span>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <Button variant="outline" className="gap-2 px-8">
                  Load More <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Related Categories Section */}
      <section className="py-12 border-t relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-background/0"></div>
        <BackgroundPattern className="opacity-10" />

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
                  <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border text-center hover:border-primary hover:shadow-md transition-all duration-300 h-full flex flex-col items-center justify-center">
                    <h3 className="font-medium text-sm">{category}</h3>
                    <p className="text-xs text-muted-foreground mt-1">120+ Experts</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="w-full border-t bg-background py-6 md:py-12 relative">
        <BackgroundPattern className="opacity-30" />
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

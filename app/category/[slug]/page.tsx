"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
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
import { Star, Filter, ArrowUpDown, MapPin, Clock, Check } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const categorySlug = params.slug as string

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
      id: "alex-morgan",
      name: "Alex Morgan",
      title: "Senior Web Developer",
      avatar: "/placeholder.svg?height=80&width=80&text=AM",
      rating: 4.9,
      reviews: 124,
      location: "New York, USA",
      hourlyRate: "$65",
      responseTime: "Under 2 hours",
      tags: ["React", "Next.js", "TypeScript", "UI/UX"],
      featured: true,
    },
    {
      id: "sarah-chen",
      name: "Sarah Chen",
      title: "Full Stack Developer",
      avatar: "/placeholder.svg?height=80&width=80&text=SC",
      rating: 4.8,
      reviews: 89,
      location: "San Francisco, USA",
      hourlyRate: "$75",
      responseTime: "Under 1 hour",
      tags: ["Node.js", "React", "MongoDB", "AWS"],
      featured: true,
    },
    {
      id: "james-wilson",
      name: "James Wilson",
      title: "WordPress Expert",
      avatar: "/placeholder.svg?height=80&width=80&text=JW",
      rating: 4.7,
      reviews: 56,
      location: "London, UK",
      hourlyRate: "$55",
      responseTime: "Under 3 hours",
      tags: ["WordPress", "PHP", "SEO", "E-commerce"],
    },
    {
      id: "emma-davis",
      name: "Emma Davis",
      title: "Frontend Developer",
      avatar: "/placeholder.svg?height=80&width=80&text=ED",
      rating: 4.8,
      reviews: 72,
      location: "Berlin, Germany",
      hourlyRate: "$60",
      responseTime: "Under 2 hours",
      tags: ["HTML/CSS", "JavaScript", "React", "Vue.js"],
    },
    {
      id: "michael-zhang",
      name: "Michael Zhang",
      title: "Mobile App Developer",
      avatar: "/placeholder.svg?height=80&width=80&text=MZ",
      rating: 4.9,
      reviews: 48,
      location: "Toronto, Canada",
      hourlyRate: "$80",
      responseTime: "Under 4 hours",
      tags: ["React Native", "iOS", "Android", "Flutter"],
    },
    {
      id: "olivia-johnson",
      name: "Olivia Johnson",
      title: "UI/UX Designer & Developer",
      avatar: "/placeholder.svg?height=80&width=80&text=OJ",
      rating: 4.7,
      reviews: 63,
      location: "Sydney, Australia",
      hourlyRate: "$70",
      responseTime: "Under 3 hours",
      tags: ["Figma", "Adobe XD", "React", "CSS"],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <AnimatedGradientBackground />
      <EnhancedMainNav />
      <main className="flex-1">
        {/* Providers Section */}
        <section className="w-full py-12 md:py-16 bg-muted/50 relative">
          <BackgroundPattern className="opacity-50" />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-8 md:grid-cols-4">
              {/* Filters Sidebar */}
              <div className="space-y-6">
                <div className="bg-background rounded-xl border p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center">
                      <Filter className="mr-2 h-4 w-4" /> Filters
                    </h3>
                    <Button variant="ghost" size="sm" className="text-xs h-8">
                      Clear All
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Expertise</h4>
                      <div className="space-y-2">
                        {["All", "Frontend", "Backend", "Full Stack", "Mobile", "UI/UX"].map((filter) => (
                          <div key={filter} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`filter-${filter}`}
                              className="mr-2"
                              checked={selectedFilter === filter.toLowerCase()}
                              onChange={() => setSelectedFilter(filter.toLowerCase())}
                            />
                            <label htmlFor={`filter-${filter}`} className="text-sm">
                              {filter}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium mb-2">Price Range</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" id="price-1" className="mr-2" />
                          <label htmlFor="price-1" className="text-sm">
                            Under $50/hr
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="price-2" className="mr-2" />
                          <label htmlFor="price-2" className="text-sm">
                            $50-$75/hr
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="price-3" className="mr-2" />
                          <label htmlFor="price-3" className="text-sm">
                            $75-$100/hr
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="price-4" className="mr-2" />
                          <label htmlFor="price-4" className="text-sm">
                            $100+/hr
                          </label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium mb-2">Rating</h4>
                      <div className="space-y-2">
                        {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                          <div key={rating} className="flex items-center">
                            <input type="checkbox" id={`rating-${rating}`} className="mr-2" />
                            <label htmlFor={`rating-${rating}`} className="text-sm flex items-center">
                              {rating}+ <Star className="h-3 w-3 ml-1 fill-yellow-400 text-yellow-400" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium mb-2">Location</h4>
                      <div className="space-y-2">
                        {["Worldwide", "North America", "Europe", "Asia", "Australia"].map((location) => (
                          <div key={location} className="flex items-center">
                            <input type="checkbox" id={`location-${location}`} className="mr-2" />
                            <label htmlFor={`location-${location}`} className="text-sm">
                              {location}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Providers Grid */}
              <div className="md:col-span-3">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {providers.length} {providers.length === 1 ? "Expert" : "Experts"} Available
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <Select defaultValue="relevance">
                      <SelectTrigger className="w-[160px] h-8 text-sm">
                        <SelectValue placeholder="Relevance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="rating">Highest Rating</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
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
                    >
                      <Card className={`overflow-hidden ${provider.featured ? "border-primary/50 bg-primary/5" : ""}`}>
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Provider Info */}
                            <div className="flex flex-col sm:flex-row md:flex-col items-center gap-4 md:w-48">
                              <Avatar className="h-20 w-20">
                                <AvatarImage src={provider.avatar || "/placeholder.svg"} alt={provider.name} />
                                <AvatarFallback>
                                  {provider.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-center sm:text-left md:text-center">
                                <h3 className="font-semibold">{provider.name}</h3>
                                <p className="text-sm text-muted-foreground">{provider.title}</p>
                                <div className="mt-1 flex items-center justify-center sm:justify-start md:justify-center">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="ml-1 text-sm font-medium">{provider.rating}</span>
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

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">Hourly Rate</p>
                                  <p className="font-semibold">{provider.hourlyRate}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">Response Time</p>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <p className="text-sm">{provider.responseTime}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                <Button
                                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                                  onClick={() => router.push(`/services/${provider.id}`)}
                                >
                                  View Services
                                </Button>
                                <Button variant="outline">Contact</Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {provider.featured && (
                          <div className="bg-primary/10 px-6 py-2 flex items-center">
                            <Check className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium">Featured Expert</span>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <Button variant="outline" className="gap-2">
                    Load More <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <span className="sr-only">Instagram</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
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

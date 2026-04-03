"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertCircle,
  Check,
  Clock,
  DollarSign,
  HelpCircle,
  Info,
  Minus,
  Star,
  Search,
  Trash2,
  PlusCircle,
  X,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Service {
  id: string
  title: string
  provider: {
    id: string
    name: string
    avatar_url?: string
    rating?: number
    is_verified?: boolean
  }
  category: {
    id: string
    name: string
  }
  base_price: number
  currency: string
  delivery_time?: string
  description: string
  features?: string[]
  rating?: number
  reviews_count?: number
  completion_rate?: number
}

interface ComparisonFeature {
  id: string
  name: string
  description: string
  type: "boolean" | "rating" | "value" | "price" | "time"
}

// Predefined comparison features
const defaultFeatures: ComparisonFeature[] = [
  { id: "price", name: "Price", description: "Base price of the service", type: "price" },
  { id: "delivery", name: "Delivery Time", description: "Estimated time to deliver the service", type: "time" },
  { id: "rating", name: "Rating", description: "Average rating from reviews", type: "rating" },
  { id: "reviews", name: "Reviews", description: "Number of reviews received", type: "value" },
  {
    id: "completion",
    name: "Completion Rate",
    description: "Percentage of successfully completed orders",
    type: "value",
  },
  { id: "verified", name: "Verified Provider", description: "Provider has been verified", type: "boolean" },
]

interface ServiceComparisonProps {
  initialServices?: Service[]
  maxServices?: number
}

export function ServiceComparison({ initialServices = [], maxServices = 4 }: ServiceComparisonProps) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Service[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedFeatures, setSelectedFeatures] = useState<ComparisonFeature[]>(defaultFeatures.slice(0, 5))
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false)
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  // Mock fetch categories
  useEffect(() => {
    // In a real app, fetch from API
    const mockCategories = [
      { id: "cat1", name: "Web Development" },
      { id: "cat2", name: "Graphic Design" },
      { id: "cat3", name: "Digital Marketing" },
      { id: "cat4", name: "Writing & Translation" },
      { id: "cat5", name: "Video & Animation" },
    ]
    setCategories(mockCategories)
  }, [])

  // Mock search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      // In a real app, fetch from API
      // const response = await fetch(`/api/services/search?query=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`)
      // const data = await response.json()

      // Mock search results
      await new Promise((resolve) => setTimeout(resolve, 600))
      const mockResults: Service[] = [
        {
          id: "serv1",
          title: "Professional Website Development",
          provider: {
            id: "prov1",
            name: "John Developer",
            rating: 4.8,
            is_verified: true,
          },
          category: { id: "cat1", name: "Web Development" },
          base_price: 500,
          currency: "USD",
          delivery_time: "7 days",
          description: "Professional website development with responsive design and SEO optimization.",
          features: ["Responsive Design", "SEO Optimization", "Contact Form", "5 Pages"],
          rating: 4.8,
          reviews_count: 124,
          completion_rate: 98,
        },
        {
          id: "serv2",
          title: "E-commerce Website Setup",
          provider: {
            id: "prov2",
            name: "Web Solutions Inc",
            rating: 4.5,
            is_verified: true,
          },
          category: { id: "cat1", name: "Web Development" },
          base_price: 800,
          currency: "USD",
          delivery_time: "14 days",
          description: "Complete e-commerce website setup with payment gateway integration.",
          features: ["Product Management", "Payment Gateway", "Inventory System", "Customer Accounts"],
          rating: 4.5,
          reviews_count: 89,
          completion_rate: 95,
        },
        {
          id: "serv3",
          title: "WordPress Website Design",
          provider: {
            id: "prov3",
            name: "Sarah Designer",
            rating: 4.9,
            is_verified: false,
          },
          category: { id: "cat1", name: "Web Development" },
          base_price: 350,
          currency: "USD",
          delivery_time: "5 days",
          description: "Custom WordPress website design with premium theme installation.",
          features: ["Premium Theme", "Plugin Setup", "Content Upload", "Basic SEO"],
          rating: 4.9,
          reviews_count: 56,
          completion_rate: 100,
        },
        {
          id: "serv4",
          title: "Logo Design Package",
          provider: {
            id: "prov4",
            name: "Creative Designs",
            rating: 4.7,
            is_verified: true,
          },
          category: { id: "cat2", name: "Graphic Design" },
          base_price: 150,
          currency: "USD",
          delivery_time: "3 days",
          description: "Professional logo design with unlimited revisions and source files.",
          features: ["3 Concepts", "Unlimited Revisions", "Source Files", "Copyright Transfer"],
          rating: 4.7,
          reviews_count: 230,
          completion_rate: 97,
        },
        {
          id: "serv5",
          title: "Social Media Marketing Campaign",
          provider: {
            id: "prov5",
            name: "Digital Marketers Pro",
            rating: 4.6,
            is_verified: true,
          },
          category: { id: "cat3", name: "Digital Marketing" },
          base_price: 300,
          currency: "USD",
          delivery_time: "10 days",
          description: "Comprehensive social media marketing campaign for your business.",
          features: ["Strategy Development", "Content Creation", "Performance Tracking", "Monthly Report"],
          rating: 4.6,
          reviews_count: 78,
          completion_rate: 94,
        },
      ]

      // Filter by category if selected
      const filteredResults = selectedCategory
        ? mockResults.filter((service) => service.category.id === selectedCategory)
        : mockResults

      setSearchResults(filteredResults)
    } catch (error) {
      console.error("Error searching services:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const addServiceToComparison = (service: Service) => {
    if (services.length >= maxServices) {
      alert(`You can compare up to ${maxServices} services at once.`)
      return
    }

    if (services.some((s) => s.id === service.id)) {
      alert("This service is already in your comparison.")
      return
    }

    setServices([...services, service])
    // Clear search results after adding
    setSearchResults([])
    setSearchQuery("")
  }

  const removeServiceFromComparison = (serviceId: string) => {
    setServices(services.filter((service) => service.id !== serviceId))
  }

  const toggleFeature = (feature: ComparisonFeature) => {
    if (selectedFeatures.some((f) => f.id === feature.id)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f.id !== feature.id))
    } else {
      setSelectedFeatures([...selectedFeatures, feature])
    }
  }

  // Render feature value based on feature type
  const renderFeatureValue = (service: Service, feature: ComparisonFeature) => {
    switch (feature.id) {
      case "price":
        return (
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-green-600" />
            <span>
              {service.base_price} {service.currency}
            </span>
          </div>
        )
      case "delivery":
        return service.delivery_time ? (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-blue-600" />
            <span>{service.delivery_time}</span>
          </div>
        ) : (
          <Minus className="h-4 w-4 text-gray-400" />
        )
      case "rating":
        return service.rating ? (
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
            <span>{service.rating}</span>
            <span className="text-xs text-gray-500 ml-1">/ 5</span>
          </div>
        ) : (
          <Minus className="h-4 w-4 text-gray-400" />
        )
      case "reviews":
        return service.reviews_count ? (
          <span>{service.reviews_count} reviews</span>
        ) : (
          <span className="text-gray-500">No reviews</span>
        )
      case "completion":
        return service.completion_rate ? (
          <div className="flex items-center">
            <span
              className={cn(
                service.completion_rate >= 95
                  ? "text-green-600"
                  : service.completion_rate >= 85
                    ? "text-yellow-600"
                    : "text-red-600",
              )}
            >
              {service.completion_rate}%
            </span>
          </div>
        ) : (
          <Minus className="h-4 w-4 text-gray-400" />
        )
      case "verified":
        return service.provider.is_verified ? (
          <Check className="h-5 w-5 text-green-600" />
        ) : (
          <X className="h-5 w-5 text-red-500" />
        )
      default:
        if (feature.type === "boolean") {
          const value = (service as any)[feature.id]
          return value ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-500" />
        }
        return <span>{(service as any)[feature.id] || "-"}</span>
    }
  }

  // Highlight the best option for each feature
  const getBestValueHighlight = (featureId: string) => {
    if (services.length <= 1) return null

    const getValueForComparison = (service: Service, featureId: string) => {
      switch (featureId) {
        case "price":
          return service.base_price
        case "delivery":
          if (!service.delivery_time) return Number.POSITIVE_INFINITY
          const days = Number.parseInt(service.delivery_time.split(" ")[0])
          return isNaN(days) ? Number.POSITIVE_INFINITY : days
        case "rating":
          return service.rating || 0
        case "reviews":
          return service.reviews_count || 0
        case "completion":
          return service.completion_rate || 0
        case "verified":
          return service.provider.is_verified ? 1 : 0
        default:
          return (service as any)[featureId] || 0
      }
    }

    const values = services.map((service) => getValueForComparison(service, featureId))

    // For price and delivery time, lower is better; for everything else, higher is better
    const isBetter = (a: number, b: number, featureId: string) => {
      if (featureId === "price" || featureId === "delivery") {
        return a < b
      }
      return a > b
    }

    let bestIndex = 0
    for (let i = 1; i < values.length; i++) {
      if (isBetter(values[i], values[bestIndex], featureId)) {
        bestIndex = i
      }
    }

    return services[bestIndex].id
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Service Comparison</h2>
          <p className="text-gray-500">Compare services side by side to find the best option for your needs.</p>
        </div>

        <div className="flex space-x-2">
          <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Info className="h-4 w-4 mr-2" />
                <span>Customize Features</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Customize Comparison Features</DialogTitle>
                <DialogDescription>Select which features to include in your comparison.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 my-4">
                {defaultFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{feature.name}</Label>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                    <Button
                      variant={selectedFeatures.some((f) => f.id === feature.id) ? "default" : "outline"}
                      onClick={() => toggleFeature(feature)}
                      size="sm"
                    >
                      {selectedFeatures.some((f) => f.id === feature.id) ? "Selected" : "Select"}
                    </Button>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={() => setIsFeatureDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>Add Service</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Service to Compare</DialogTitle>
                <DialogDescription>
                  Search for services to add to your comparison. You can compare up to {maxServices} services at once.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <div className="flex gap-2">
                  <Dialog open={isCategoryFilterOpen} onOpenChange={setIsCategoryFilterOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        {selectedCategory
                          ? categories.find((c) => c.id === selectedCategory)?.name || "Category"
                          : "Category"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Filter by Category</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 my-4">
                        <Button
                          variant={selectedCategory === "" ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => {
                            setSelectedCategory("")
                            setIsCategoryFilterOpen(false)
                          }}
                        >
                          All Categories
                        </Button>
                        {categories.map((category) => (
                          <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedCategory(category.id)
                              setIsCategoryFilterOpen(false)
                            }}
                          >
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="flex items-center flex-1 gap-2">
                    <Input
                      placeholder="Search for services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((service) => (
                      <Card key={service.id} className="overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{service.title}</h3>
                              <p className="text-sm text-gray-500">by {service.provider.name}</p>
                              <div className="flex items-center mt-1">
                                <Badge variant="outline" className="mr-2">
                                  {service.category.name}
                                </Badge>
                                {service.provider.is_verified && (
                                  <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                                    Verified Provider
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-green-600">
                                {service.base_price} {service.currency}
                              </div>
                              {service.delivery_time && (
                                <div className="text-sm text-gray-500">{service.delivery_time}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center">
                              {service.rating && (
                                <div className="flex items-center mr-3">
                                  <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                                  <span>
                                    {service.rating}
                                    <span className="text-xs text-gray-500 ml-1">
                                      ({service.reviews_count} reviews)
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button size="sm" onClick={() => addServiceToComparison(service)}>
                              Add to Compare
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : searchQuery.trim() && !isSearching ? (
                    <div className="text-center py-10 text-gray-500">
                      <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No services found. Try a different search term or category.</p>
                    </div>
                  ) : !isSearching ? (
                    <div className="text-center py-10 text-gray-500">
                      <Search className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>Search for services to add to your comparison.</p>
                    </div>
                  ) : null}

                  {isSearching && (
                    <div className="text-center py-10">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-500">Searching...</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {services.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <HelpCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Services to Compare</h3>
            <p className="text-gray-500 mb-4">Add services to start comparing your options.</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span>Add Services</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Service to Compare</DialogTitle>
                  <DialogDescription>
                    Search for services to add to your comparison. You can compare up to {maxServices} services at once.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search for services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {/* Search results would go here - same as above */}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table className="border">
            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
              <TableRow>
                <TableHead className="min-w-[200px]">Service Details</TableHead>
                {services.map((service) => (
                  <TableHead key={service.id} className="min-w-[200px]">
                    <div className="flex flex-col items-center">
                      <div className="text-center font-medium mb-2 w-full truncate">{service.title}</div>
                      <div className="flex justify-center mb-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeServiceFromComparison(service.id)}
                          className="h-7 w-7"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/services/${service.id}`}>
                          <span className="flex items-center justify-center">
                            View Service
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </span>
                        </Link>
                      </Button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Provider</TableCell>
                {services.map((service) => (
                  <TableCell key={service.id} className="text-center">
                    <div className="flex flex-col items-center">
                      <div className="font-medium">{service.provider.name}</div>
                      {service.provider.is_verified && (
                        <Badge variant="outline" className="mt-1 bg-green-50 text-green-800 border-green-200">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Category</TableCell>
                {services.map((service) => (
                  <TableCell key={service.id} className="text-center">
                    {service.category.name}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Description</TableCell>
                {services.map((service) => (
                  <TableCell key={service.id} className="max-w-[280px]">
                    <div className="line-clamp-3 text-sm">{service.description}</div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Dynamic feature rows based on selected features */}
              {selectedFeatures.map((feature) => {
                const bestValueId = getBestValueHighlight(feature.id)

                return (
                  <TableRow key={feature.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <span>{feature.name}</span>
                        <HelpCircle className="h-4 w-4 ml-1 text-gray-400 cursor-help" />
                      </div>
                    </TableCell>
                    {services.map((service) => (
                      <TableCell
                        key={service.id}
                        className={cn(
                          "text-center",
                          bestValueId === service.id && services.length > 1 ? "bg-green-50 dark:bg-green-950/20" : "",
                        )}
                      >
                        {renderFeatureValue(service, feature)}
                        {bestValueId === service.id && services.length > 1 && (
                          <Badge variant="outline" className="mt-1 bg-green-50 text-green-800 border-green-200">
                            Best value
                          </Badge>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}

              {/* Features list */}
              <TableRow>
                <TableCell className="font-medium">Features</TableCell>
                {services.map((service) => (
                  <TableCell key={service.id}>
                    {service.features && service.features.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {service.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500">No features listed</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

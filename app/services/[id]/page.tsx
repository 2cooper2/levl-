"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ServiceReviews } from "@/components/services/service-reviews"
import { ServiceFAQ } from "@/components/services/service-faq"
import { ServiceGallery } from "@/components/services/service-gallery"
import { Check, Clock, Heart, MessageSquare, Share2, Star } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function ServiceDetailPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const service = {
    id: "web-development",
    title: "Professional Website Development",
    description:
      "I will create a professional, responsive website for your business or personal brand. The website will be built using modern technologies and best practices to ensure it's fast, secure, and SEO-friendly.",
    price: "From $499",
    rating: 4.9,
    reviews: 124,
    deliveryTime: "7 days",
    revisions: "Unlimited",
    provider: {
      name: "Alex Morgan",
      avatar: "/placeholder.svg?height=80&width=80&text=AM",
      level: "Top Rated",
      memberSince: "Jan 2020",
      responseTime: "Under 2 hours",
      lastDelivery: "About 16 hours ago",
      completedProjects: 87,
      rating: 4.9,
    },
    tags: ["Web Design", "Responsive", "E-commerce", "WordPress", "Custom Code"],
    features: [
      "Responsive design for all devices",
      "SEO optimization",
      "Contact form integration",
      "Social media integration",
      "Google Analytics setup",
      "Basic SEO setup",
      "Cross-browser compatibility",
      "Loading speed optimization",
    ],
    packages: [
      {
        name: "Basic",
        price: "$499",
        description: "Perfect for personal websites or small businesses just getting started online.",
        deliveryTime: "7 days",
        features: ["Up to 5 pages", "Responsive design", "Contact form", "Basic SEO setup", "Social media integration"],
      },
      {
        name: "Standard",
        price: "$799",
        description: "Ideal for growing businesses that need more functionality and customization.",
        deliveryTime: "10 days",
        features: [
          "Up to 10 pages",
          "Responsive design",
          "Contact form",
          "Advanced SEO setup",
          "Social media integration",
          "Blog setup",
          "Newsletter integration",
          "Google Analytics",
        ],
        recommended: true,
      },
      {
        name: "Premium",
        price: "$1,299",
        description: "Complete solution for established businesses requiring advanced features and e-commerce.",
        deliveryTime: "14 days",
        features: [
          "Up to 15 pages",
          "Responsive design",
          "Contact form",
          "Advanced SEO setup",
          "Social media integration",
          "Blog setup",
          "Newsletter integration",
          "Google Analytics",
          "E-commerce functionality",
          "Payment gateway integration",
          "Product management system",
          "Customer account area",
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
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
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" strokeWidth="0" className="text-primary" />
                <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2" />
              </svg>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                LevL
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
              Explore
            </Link>
            <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
              Messages
            </Link>
            <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32&text=JD" alt="@johndoe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{service.title}</h1>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{service.rating}</span>
                    <span className="ml-1 text-sm text-muted-foreground">({service.reviews} reviews)</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{service.deliveryTime}</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{service.revisions} revisions</span>
                  </div>
                </div>
              </div>

              <ServiceGallery />

              <div>
                <h2 className="text-xl font-bold mb-4">About This Service</h2>
                <p className="text-muted-foreground">{service.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">What's Included</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-4">
                  <div className="space-y-4">
                    <p>
                      I specialize in creating modern, responsive websites that not only look great but also perform
                      exceptionally well. With over 5 years of experience in web development, I've helped businesses of
                      all sizes establish a strong online presence.
                    </p>
                    <p>
                      My approach focuses on creating websites that are not just visually appealing but also
                      user-friendly, fast-loading, and optimized for search engines. I use the latest technologies and
                      best practices to ensure your website stands out from the competition.
                    </p>
                    <p>
                      Whether you need a simple portfolio website, a blog, a business website, or an e-commerce store, I
                      can create a custom solution tailored to your specific needs and goals.
                    </p>
                    <h3 className="text-lg font-bold mt-6">My Process</h3>
                    <ol className="list-decimal list-inside space-y-2 pl-4">
                      <li>Initial consultation to understand your requirements and goals</li>
                      <li>Research and planning to create a strategy for your website</li>
                      <li>Design mockups for your approval</li>
                      <li>Development of the website</li>
                      <li>Testing and quality assurance</li>
                      <li>Launch and post-launch support</li>
                    </ol>
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="pt-4">
                  <ServiceReviews />
                </TabsContent>
                <TabsContent value="faq" className="pt-4">
                  <ServiceFAQ />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <Tabs defaultValue="standard" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="standard">Standard</TabsTrigger>
                      <TabsTrigger value="premium">Premium</TabsTrigger>
                    </TabsList>
                    {service.packages.map((pkg) => (
                      <TabsContent key={pkg.name.toLowerCase()} value={pkg.name.toLowerCase()} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold">{pkg.name}</h3>
                          <p className="text-xl font-bold">{pkg.price}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{pkg.deliveryTime} delivery</span>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">What's included:</h4>
                          <ul className="space-y-2">
                            {pkg.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-primary mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                          Continue ({pkg.price})
                        </Button>
                        <Button variant="outline" className="w-full">
                          Contact Seller
                        </Button>
                      </TabsContent>
                    ))}
                  </Tabs>
                  <div className="mt-6 flex justify-between">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Heart className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Save</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Share</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Message</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hidden lg:block"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={service.provider.avatar || "/placeholder.svg"} alt={service.provider.name} />
                      <AvatarFallback>{service.provider.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold">{service.provider.name}</h3>
                      <p className="text-sm text-muted-foreground">Web Developer</p>
                      <div className="mt-1 flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm">{service.provider.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member since</span>
                      <span>{service.provider.memberSince}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response time</span>
                      <span>{service.provider.responseTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last delivery</span>
                      <span>{service.provider.lastDelivery}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed projects</span>
                      <span>{service.provider.completedProjects}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 w-full">
                    Contact Me
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

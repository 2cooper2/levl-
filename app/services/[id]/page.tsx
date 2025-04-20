"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { ServiceGallery } from "@/components/services/service-gallery"
import { ServiceReviews } from "@/components/services/service-reviews"
import { ServiceFAQ } from "@/components/services/service-faq"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Clock, MessageSquare, ArrowRight, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context" // Import the custom auth context

export default function ServicePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch service data from your API or database
    const fetchService = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data with hourly rate instead of packages
        setService({
          id: params.id,
          title: "Professional Website Development",
          description:
            "I will create a professional, responsive website tailored to your business needs. With over 5 years of experience in web development, I deliver high-quality websites that not only look great but also perform exceptionally well. My approach focuses on creating websites that are user-friendly, fast-loading, and optimized for search engines.",
          provider: {
            id: "alex-morgan",
            name: "Alex Morgan",
            title: "Senior Web Developer",
            avatar: "/placeholder.svg?height=100&width=100&text=AM",
            rating: 4.9,
            reviews: 127,
            responseTime: "Under 2 hours",
            hourlyRate: 85, // Hourly rate in USD
          },
          gallery: [
            "/placeholder.svg?height=600&width=800&text=Website+Preview+1",
            "/placeholder.svg?height=600&width=800&text=Website+Preview+2",
            "/placeholder.svg?height=600&width=800&text=Website+Preview+3",
          ],
          skills: [
            "Web Development",
            "React",
            "UI/UX Design",
            "Responsive Design",
            "E-commerce",
            "WordPress",
            "JavaScript",
            "HTML/CSS",
          ],
          reviews: [
            {
              id: "1",
              user: {
                name: "Sarah Johnson",
                avatar: "/placeholder.svg?height=40&width=40&text=SJ",
              },
              rating: 5,
              date: "2023-05-15",
              comment:
                "Alex created an amazing website for my small business. The design is beautiful and the functionality is exactly what I needed. Highly recommend!",
            },
            {
              id: "2",
              user: {
                name: "Michael Chen",
                avatar: "/placeholder.svg?height=40&width=40&text=MC",
              },
              rating: 5,
              date: "2023-04-22",
              comment:
                "Great experience working with Alex. Very professional and delivered the project ahead of schedule. The website looks fantastic and has already helped increase my online sales.",
            },
            {
              id: "3",
              user: {
                name: "Emily Rodriguez",
                avatar: "/placeholder.svg?height=40&width=40&text=ER",
              },
              rating: 4,
              date: "2023-03-10",
              comment:
                "Alex did a great job on our company website. The design is modern and the site is easy to navigate. Would definitely work with again.",
            },
          ],
          faqs: [
            {
              question: "What information do you need to get started?",
              answer:
                "To get started, I'll need your business information, brand guidelines (if available), content for the website (text, images, videos), and any specific requirements or preferences you have for the design and functionality.",
            },
            {
              question: "Do you provide website hosting?",
              answer:
                "I can help set up hosting for your website, but the hosting fees are not included in my service packages. I can recommend reliable hosting providers based on your needs and budget.",
            },
            {
              question: "Can you help with domain registration?",
              answer:
                "Yes, I can assist with domain registration, but the domain registration fee is not included in my service packages. If you already have a domain, I can help you set it up with your new website.",
            },
            {
              question: "Do you offer website maintenance services?",
              answer:
                "Yes, I offer website maintenance services for an additional fee. This includes regular updates, security patches, content updates, and technical support.",
            },
            {
              question: "What if I need changes after the project is completed?",
              answer:
                "I charge my standard hourly rate for any changes or additions after the project is completed. I'm always happy to continue working with clients on ongoing improvements.",
            },
          ],
        })
      } catch (error) {
        console.error("Error fetching service:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [params.id])

  const handleContact = () => {
    router.push(`/messages?provider=${service.provider.id}`)
  }

  const handleHireNow = () => {
    router.push(`/checkout/${service.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedMainNav />
        <main className="container py-8">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/3 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-[400px] w-full" />
              </div>
              <div className="md:w-1/3 space-y-4">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
              <p className="text-muted-foreground">{service.description}</p>
            </div>

            <ServiceGallery images={service.gallery} />

            <Tabs defaultValue="about">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="space-y-6 pt-4">
                <div className="prose max-w-none">
                  <h3>My Expertise</h3>
                  <p>
                    With over 5 years of experience in web development, I specialize in creating modern, responsive
                    websites that not only look great but also perform exceptionally well. My approach focuses on
                    creating websites that are user-friendly, fast-loading, and optimized for search engines.
                  </p>

                  <h3>My Process</h3>
                  <ol>
                    <li>Initial consultation to understand your requirements and goals</li>
                    <li>Research and planning to create a strategy for your website</li>
                    <li>Design mockups for your approval</li>
                    <li>Development of the website</li>
                    <li>Testing and quality assurance</li>
                    <li>Launch and post-launch support</li>
                  </ol>

                  <h3>What You Can Expect</h3>
                  <ul>
                    <li>Professional, responsive communication</li>
                    <li>High-quality work delivered on time</li>
                    <li>Attention to detail and focus on your specific needs</li>
                    <li>Transparent pricing with no hidden fees</li>
                    <li>Ongoing support after project completion</li>
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-lg border border-purple-100 dark:border-purple-800/30">
                  <h3 className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-300">Hourly Rate</h3>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                      ${service.provider.hourlyRate}
                    </span>
                    <span className="text-sm text-purple-600 dark:text-purple-400 ml-1">/hour</span>
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                    Typical projects range from 10-40 hours depending on complexity.
                  </p>
                  <Button
                    className="mt-4 w-full bg-purple-500/80 hover:bg-purple-600/90 backdrop-blur-sm border border-purple-300/30 shadow-sm hover:shadow-md transition-all duration-300"
                    onClick={handleHireNow}
                  >
                    Book <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="reviews">
                <ServiceReviews reviews={service.reviews} />
              </TabsContent>
              <TabsContent value="faq">
                <ServiceFAQ faqs={service.faqs} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={service.provider.avatar || "/placeholder.svg"} alt={service.provider.name} />
                  <AvatarFallback>
                    {service.provider.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{service.provider.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.provider.title}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(service.provider.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{service.provider.rating}</span>
                <span className="text-sm text-muted-foreground">({service.provider.reviews} reviews)</span>
              </div>

              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Response time: {service.provider.responseTime}</span>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/30">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xl font-bold text-purple-700 dark:text-purple-300">
                    ${service.provider.hourlyRate}
                  </span>
                  <span className="text-sm text-purple-600 dark:text-purple-400 ml-1">/hour</span>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button variant="outline" className="w-full" onClick={handleContact}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Contact
                </Button>

                <Button
                  className="w-full bg-purple-500/80 hover:bg-purple-600/90 backdrop-blur-sm border border-purple-300/30 shadow-sm hover:shadow-md transition-all duration-300"
                  onClick={handleHireNow}
                >
                  Book <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {service.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

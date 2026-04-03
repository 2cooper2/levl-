"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ServiceReviews } from "@/components/services/service-reviews"
import { ServiceFAQ } from "@/components/services/service-faq"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Star,
  Clock,
  MessageSquare,
  ArrowRight,
  DollarSign,
  CheckCircle,
  Calendar,
  Camera,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context" // Import the custom auth context
import { ServiceBadges } from "@/components/services/service-badges"
import { LevlLogo } from "@/components/levl-logo"

// Add these animation keyframes after the imports
const fadeInAnimation = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`

const fadeInUpAnimation = `
@keyframes fadeInUp {
@keyframes fadeInUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
}
`

// Add this style tag after the animations
const animationStyles = `
<style jsx global>
  ${fadeInAnimation}
  ${fadeInUpAnimation}
  
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  
  .delay-100 {
    animation-delay: 0.1s;
  }
  
  .delay-200 {
    animation-delay: 0.2s;
  }
  
  .bg-grid-pattern {
    background-image: linear-gradient(to right, rgba(128, 90, 213, 0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(128, 90, 213, 0.1) 1px, transparent 1px);
    background-size: 24px 24px;
  }
</style>
`

export default function ServicePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    // In a real app, fetch service data from your API or database
    const fetchService = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data with hourly rate instead of packages
        setService({
          id: params.id,
          title: "Professional TV & Wall Mounting Services",
          description:
            "I provide expert TV and wall mounting services for your home or office. With over 5 years of experience, I ensure secure and professional installation of TVs, shelves, artwork, and more. My approach focuses on safety, precision, and attention to detail, leaving your walls looking clean and organized.",
          provider: {
            id: "caydon-cooper",
            name: "Caydon Cooper",
            title: "TV & Wall Mounting Specialist",
            avatar: "/placeholder.svg?height=100&width=100&text=CC",
            rating: 4.9,
            reviews: 127,
            responseTime: "Under 2 hours",
            hourlyRate: 2, // Hourly rate in USD
          },
          gallery: [
            "/placeholder.svg?height=600&width=800&text=Website+Preview+1",
            "/placeholder.svg?height=600&width=800&text=Website+Preview+2",
            "/placeholder.svg?height=600&width=800&text=Website+Preview+3",
          ],
          skills: [
            "TV Mounting",
            "Wall Shelving",
            "Sound Bar Installation",
            "Cable Management",
            "Mirror Hanging",
            "Artwork Installation",
            "Home Theater Setup",
            "Projector Mounting",
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
    // Ensure we have a valid service ID before navigation
    if (service && service.id) {
      let checkoutUrl = `/checkout/${service.id}`

      // Add date and time parameters if they are selected
      if (selectedDate && selectedTimeSlot) {
        checkoutUrl += `?date=${selectedDate}&time=${encodeURIComponent(selectedTimeSlot)}`
      }

      console.log("Navigating to checkout page:", checkoutUrl)
      router.push(checkoutUrl)
    } else {
      console.error("Service ID is missing")
      // Fallback to a generic checkout page if service ID is missing
      router.push("/checkout")
    }
  }

  // Get the month name for display
  const getMonthName = (month: number) => {
    return new Date(0, month).toLocaleString("default", { month: "long" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lavender-50/50 via-white to-lavender-100/30">
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all duration-200">
          <div className="container flex h-20 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 relative">
                <div className="absolute inset-0 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 dark:border-white/10 shadow-sm pointer-events-none"></div>
                <LevlLogo className="h-8 w-8 relative z-10" />
                <span className="text-xl font-bold bg-gradient-to-r from-lavender-400 to-lavender-600 bg-clip-text text-transparent relative z-10">
                  LevL
                </span>
              </Link>
            </div>
          </div>
        </header>
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
    <div className="min-h-screen bg-gradient-to-b from-lavender-50/50 via-white to-lavender-100/30 relative overflow-x-hidden">
      {/* Background elements with pointer-events-none to ensure they don't block interactions */}
      <div
        className="absolute inset-0 pointer-events-none z-[-1]"
        style={{
          background: "radial-gradient(circle at 30% 20%, rgba(233,213,255,0.2) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all duration-200">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 relative">
              <div className="absolute inset-0 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 dark:border-white/10 shadow-sm pointer-events-none"></div>
              <LevlLogo className="h-8 w-8 relative z-10" />
              <span className="text-xl font-bold bg-gradient-to-r from-lavender-400 to-lavender-600 bg-clip-text text-transparent relative z-10">
                LevL
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-10 md:py-16 relative z-20 max-w-6xl mx-auto animate-fade-in">
        {/* Breadcrumb navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8 p-2 bg-white/30 dark:bg-black/10 backdrop-blur-sm rounded-lg border border-lavender-200/20 dark:border-lavender-800/10 shadow-sm">
          <Link href="/" className="hover:text-lavender-600 transition-colors flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          <Link href="/category/mounting" className="hover:text-lavender-600 transition-colors">
            Mounting Services
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          <span className="text-foreground font-medium truncate max-w-[200px] bg-lavender-100/30 px-2 py-0.5 rounded-md">
            {service.title}
          </span>
        </nav>

        {/* Service header section with enhanced styling */}
        <div className="mb-12 relative p-6 rounded-xl border bg-card text-card-foreground transition-all group relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-lavender-400/10 to-transparent rounded-bl-full transform transition-transform duration-700 group-hover:scale-110"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-tr from-lavender-500/15 to-transparent rounded-tr-full transform transition-transform duration-700 group-hover:scale-110"></div>

          {/* Animated accent line */}
          <div className="absolute h-[2px] w-1/3 bg-gradient-to-r from-transparent via-lavender-400/60 to-transparent top-0 left-0 animate-shimmer"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-lavender-500/20 text-lavender-600 dark:text-lavender-400 border-none px-2 py-0.5 text-xs">
                  Top Rated
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-lavender-400 via-lavender-500 to-lavender-600 animate-gradient-x">
                {service.title}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed relative z-10">{service.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* Main content area - expanded to 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service gallery with enhanced styling */}
            <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground transition-all group relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-r from-lavender-400/5 to-lavender-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="aspect-video overflow-hidden">
                <img
                  src={service.gallery[0] || "/placeholder.svg"}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                {service.gallery.slice(0, 3).map((image, index) => (
                  <div
                    key={index}
                    className={`w-14 h-14 rounded-md overflow-hidden border-2 ${
                      index === 0 ? "border-lavender-500" : "border-white/50 hover:border-lavender-500/70"
                    } transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-1`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {service.gallery.length > 3 && (
                  <div className="w-14 h-14 rounded-md bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-xs font-medium border-2 border-white/30 cursor-pointer hover:bg-black/70 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    +{service.gallery.length - 3}
                  </div>
                )}
              </div>
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-sm z-10">
                <Camera className="h-4 w-4" />
                <span>{service.gallery.length} Photos</span>
              </div>
            </div>

            {/* Quick info cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/60 dark:bg-black/30 backdrop-blur-sm rounded-xl border border-lavender-200/30 dark:border-lavender-800/20 p-5 flex items-center gap-4 group hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="h-12 w-12 rounded-full bg-lavender-500/10 flex items-center justify-center text-lavender-500 group-hover:bg-lavender-500/20 transition-all duration-300">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Response Time</p>
                  <p className="font-semibold text-lg">{service.provider.responseTime}</p>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-black/30 backdrop-blur-sm rounded-xl border border-lavender-200/30 dark:border-lavender-800/20 p-5 flex items-center gap-4 group hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500/20 transition-all duration-300">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Completion Rate</p>
                  <p className="font-semibold text-lg">98% Success</p>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-black/30 backdrop-blur-sm rounded-xl border border-lavender-200/30 dark:border-lavender-800/20 p-5 flex items-center gap-4 group hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/20 transition-all duration-300">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Availability</p>
                  <p className="font-semibold text-lg">Next 7 Days</p>
                </div>
              </div>
            </div>

            {/* Tabs section with enhanced styling */}
            <div className="rounded-xl border bg-card text-card-foreground transition-all group relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] overflow-hidden">
              <Tabs defaultValue="about" className="w-full">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-lavender-50/70 dark:bg-lavender-950/30 p-1 rounded-xl">
                    <TabsTrigger
                      value="about"
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-lavender-400 data-[state=active]:to-lavender-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
                    >
                      About
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-lavender-400 data-[state=active]:to-lavender-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
                    >
                      Reviews
                    </TabsTrigger>
                    <TabsTrigger
                      value="faq"
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-lavender-400 data-[state=active]:to-lavender-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
                    >
                      FAQ
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="about" className="p-6 pt-0 space-y-8">
                  <div className="prose max-w-none dark:prose-invert">
                    <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-lavender-400 to-lavender-600 mb-4">
                      My Expertise
                    </h3>
                    <p className="text-base leading-relaxed">
                      With over 5 years of experience in furniture and TV mounting, I specialize in secure and
                      professional installations that enhance your living or working space. My approach focuses on
                      safety, precision, and attention to detail, ensuring that all your items are mounted correctly and
                      securely.
                    </p>

                    <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-lavender-400 to-lavender-600 mt-8 mb-4">
                      My Process
                    </h3>
                    <div className="space-y-4">
                      {[
                        "Initial consultation to understand your mounting needs and space requirements",
                        "Assessment of wall type and structure to determine the best mounting approach",
                        "Selection of appropriate mounting hardware for your specific items",
                        "Professional installation with careful attention to level and security",
                        "Cable management and organization for a clean look",
                        "Testing to ensure all mounted items are secure and stable",
                      ].map((step, index) => (
                        <div key={index} className="flex items-center gap-4 group">
                          <div className="relative">
                            <div className="absolute inset-0 bg-lavender-500/20 dark:bg-lavender-500/20 rounded-full blur-md group-hover:bg-lavender-500/30 dark:group-hover:bg-lavender-500/30 transition-all duration-300 pointer-events-none"></div>
                            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600 text-white text-sm font-medium shadow-lg shadow-lavender-500/20 group-hover:shadow-lavender-500/30 transition-all duration-300">
                              {index + 1}
                            </div>
                          </div>
                          <p className="text-base group-hover:translate-x-1 transition-transform duration-300">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-lavender-400 to-lavender-600 mt-8 mb-4">
                      What You Can Expect
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Professional, responsive communication",
                        "High-quality work delivered on time",
                        "Attention to detail and focus on your specific needs",
                        "Transparent pricing with no hidden fees",
                        "Ongoing support after project completion",
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 group bg-lavender-500/5 dark:bg-lavender-500/10 p-3 rounded-lg border border-lavender-500/10 dark:border-lavender-500/20 hover:bg-lavender-500/10 dark:hover:bg-lavender-500/15 transition-all duration-300"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600 flex items-center justify-center text-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
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
          </div>

          {/* Sidebar - now in the third column */}
          <div className="space-y-6">
            {/* Provider card with enhanced styling */}
            <div className="sticky top-20">
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-lavender-500/20 to-lavender-600/20 blur-sm opacity-75 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
                <div className="relative rounded-xl border bg-card text-card-foreground transition-all group relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-lavender-400 to-lavender-600 blur-sm opacity-50 pointer-events-none"></div>
                      <div className="relative h-16 w-16 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden">
                        <img
                          src={service.provider.avatar || "/placeholder.svg?height=56&width=56&text=CC"}
                          alt={service.provider.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-lavender-400 to-lavender-600">
                        {service.provider.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{service.provider.title}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.floor(service.provider.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium ml-1.5">{service.provider.rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">({service.provider.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative group/price">
                    <div className="relative bg-gradient-to-br from-lavender-500/10 to-lavender-600/10 dark:from-lavender-500/15 dark:to-lavender-600/15 p-4 rounded-lg border border-lavender-500/20 dark:border-lavender-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-lavender-500 dark:text-lavender-400" />
                          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lavender-400 to-lavender-600 ml-1">
                            $75
                          </span>
                          <span className="text-sm text-lavender-500 dark:text-lavender-400 ml-1">/service</span>
                        </div>
                        <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-none">
                          Best Value
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Fixed price includes all standard mounting services
                      </p>
                    </div>
                  </div>

                  {/* Booking calendar preview */}
                  <div className="bg-white/80 dark:bg-black/40 rounded-lg p-4 border border-lavender-500/10 dark:border-lavender-500/20 mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-lavender-500" /> Available Dates
                      </h4>
                      <div className="flex items-center space-x-1">
                        <button
                          className="p-1 rounded-full hover:bg-lavender-500/10 text-lavender-500 transition-colors"
                          onClick={() => {
                            if (currentMonth === 0) {
                              setCurrentMonth(11)
                              setCurrentYear(currentYear - 1)
                            } else {
                              setCurrentMonth(currentMonth - 1)
                            }
                          }}
                          aria-label="Previous month"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        <span className="text-xs font-medium">
                          {getMonthName(currentMonth)} {currentYear}
                        </span>
                        <button
                          className="p-1 rounded-full hover:bg-lavender-500/10 text-lavender-500 transition-colors"
                          onClick={() => {
                            if (currentMonth === 11) {
                              setCurrentMonth(0)
                              setCurrentYear(currentYear + 1)
                            } else {
                              setCurrentMonth(currentMonth + 1)
                            }
                          }}
                          aria-label="Next month"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                        <div key={i} className="text-muted-foreground font-medium">
                          {day}
                        </div>
                      ))}
                      {[...Array(31)].map((_, i) => {
                        const isAvailable = [2, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29].includes(i + 1)
                        const isSelected = selectedDate === i + 1

                        return (
                          <div
                            key={i}
                            className={`relative rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? "bg-lavender-500 text-white ring-2 ring-lavender-500/20 ring-offset-1"
                                : isAvailable
                                  ? "hover:bg-lavender-500/20 hover:text-lavender-500 cursor-pointer"
                                  : "text-muted-foreground/50 bg-gray-100/50 dark:bg-gray-800/30 cursor-not-allowed"
                            }`}
                            onClick={() => {
                              if (isAvailable) {
                                setSelectedDate(isSelected ? null : i + 1)
                                setSelectedTimeSlot(null)
                              }
                            }}
                            title={
                              isAvailable
                                ? `Available on the ${i + 1}${["st", "nd", "rd"][(i % 10) - 1] || "th"}`
                                : "Not available"
                            }
                          >
                            {i + 1}
                          </div>
                        )
                      })}
                    </div>

                    {selectedDate ? (
                      <div className="mt-3 space-y-2 animate-fade-in">
                        <div className="text-xs font-medium text-lavender-500 flex items-center justify-between">
                          <span>Available on {selectedDate}:</span>
                          <span
                            className="text-xs text-muted-foreground hover:text-lavender-500 cursor-pointer"
                            onClick={() => setSelectedDate(null)}
                          >
                            Clear
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {["9:00 AM", "10:30 AM", "1:00 PM", "3:30 PM", "5:00 PM"].map((time, i) => (
                            <div
                              key={i}
                              className={`text-xs p-1.5 rounded text-center cursor-pointer transition-all duration-200 ${
                                selectedTimeSlot === time
                                  ? "bg-lavender-500 text-white ring-2 ring-lavender-500/20"
                                  : "bg-lavender-500/10 hover:bg-lavender-500/20"
                              }`}
                              onClick={() => {
                                setSelectedTimeSlot(selectedTimeSlot === time ? null : time)
                              }}
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-center text-muted-foreground">
                        Select a date to see available time slots
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-3 pt-2">
                    <Button
                      variant="outline"
                      className="w-full border-lavender-500/20 hover:bg-lavender-500/5 dark:hover:bg-lavender-500/10 transition-all duration-300 h-11"
                      onClick={handleContact}
                    >
                      <MessageSquare className="h-4 w-4 mr-2 text-lavender-500" /> Contact Provider
                    </Button>

                    <Button
                      className="w-full bg-gradient-to-r from-lavender-400 to-lavender-600 hover:from-lavender-400/90 hover:to-lavender-600/90 text-white border-none shadow-md hover:shadow-lg transition-all duration-300 group h-11"
                      onClick={handleHireNow}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {selectedDate && selectedTimeSlot
                          ? `Book for ${selectedDate} at ${selectedTimeSlot}`
                          : "Book Now"}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-center text-sm text-muted-foreground border-t border-lavender-100/20 dark:border-lavender-800/20 pt-4 mt-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-lavender-500" />
                      <span>Response in ~2 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <ServiceBadges />
            </div>

            {/* Guarantee badge */}
          </div>
        </div>

        <div className="mb-10"></div>
      </main>

      {/* Add animation keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-shimmer {
          animation: shimmer 6s infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        @keyframes pulse-slow-delay {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.7; }
        }

        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }

        .animate-pulse-slow-delay {
          animation: pulse-slow-delay 8s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { ServiceReviews } from "@/components/services/service-reviews"
import { ServiceFAQ } from "@/components/services/service-faq"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Clock, MessageSquare, ArrowRight, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context" // Import the custom auth context

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background elements matching the Mounting Experts category page */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-background"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(160,120,213,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(160,120,213,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-[100px]"></div>

      <EnhancedMainNav />

      <main className="container py-16 relative z-10">
        {/* No additional background elements inside main as they're now at the page level */}

        {/* Hero section with service title */}
        <div className="mb-12 relative">
          <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-purple-500/80 via-purple-400/80 to-transparent rounded-full blur-[1px]"></div>
          <h1
            className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500 animate-gradient-x"
            style={{ animationDuration: "8s" }}
          >
            {service.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">{service.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {/* Main content area */}
          <div className="md:col-span-2 space-y-10">
            {/* Provider card moved to gallery position */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-300"></div>
              <div className="relative bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-xl border border-purple-200/20 dark:border-purple-800/20 p-6 space-y-6 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center">
                  <div>
                    <h3 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-500">
                      {service.provider.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{service.provider.title}</p>
                  </div>
                </div>

                <div className="bg-purple-50/70 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100/50 dark:border-purple-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
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
                      <span className="text-sm font-medium ml-2">{service.provider.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({service.provider.reviews} reviews)</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Response time: {service.provider.responseTime}</span>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-purple-400 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-300"></div>
                  <div className="relative bg-gradient-to-br from-purple-50 to-purple-100/80 dark:from-purple-950/40 dark:to-purple-900/40 p-4 rounded-lg border border-purple-200/30 dark:border-purple-800/30">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                      <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400 ml-1">
                        $75
                      </span>
                      <span className="text-sm text-purple-500 dark:text-purple-400 ml-1">/service</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-purple-200/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-300 h-11"
                    onClick={handleContact}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 text-purple-400" /> Contact Provider
                  </Button>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 text-white border-none shadow-md hover:shadow-lg transition-all duration-300 group h-11"
                    onClick={handleHireNow}
                  >
                    <span className="relative z-10 flex items-center">
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs section with enhanced styling */}
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-purple-300/20 dark:border-purple-800/20 shadow-[0_8px_30px_rgb(120,90,213,0.08)] overflow-hidden">
              <Tabs defaultValue="about" className="w-full">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-purple-50/70 dark:bg-purple-950/30 p-1 rounded-xl">
                    <TabsTrigger
                      value="about"
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500/90 data-[state=active]:to-purple-400/90 data-[state=active]:text-white rounded-lg transition-all duration-300"
                    >
                      About
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500/90 data-[state=active]:to-purple-400/90 data-[state=active]:text-white rounded-lg transition-all duration-300"
                    >
                      Reviews
                    </TabsTrigger>
                    <TabsTrigger
                      value="faq"
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500/90 data-[state=active]:to-purple-400/90 data-[state=active]:text-white rounded-lg transition-all duration-300"
                    >
                      FAQ
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="about" className="p-6 pt-0 space-y-8">
                  <div className="prose max-w-none dark:prose-invert">
                    <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-500 mb-4">
                      My Expertise
                    </h3>
                    <p className="text-base leading-relaxed">
                      With over 5 years of experience in furniture and TV mounting, I specialize in secure and
                      professional installations that enhance your living or working space. My approach focuses on
                      safety, precision, and attention to detail, ensuring that all your items are mounted correctly and
                      securely.
                    </p>

                    <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-500 mt-8 mb-4">
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
                            <div className="absolute inset-0 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-md group-hover:bg-purple-400/30 dark:group-hover:bg-purple-600/30 transition-all duration-300"></div>
                            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 text-white text-sm font-medium shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/30 transition-all duration-300">
                              {index + 1}
                            </div>
                          </div>
                          <p className="text-base group-hover:translate-x-1 transition-transform duration-300">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-500 mt-8 mb-4">
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
                          className="flex items-center gap-3 group bg-purple-50/50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-200/30 dark:border-purple-800/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-all duration-300"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-white">
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

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Skills card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-300"></div>
              <div className="relative bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-xl border border-purple-200/20 dark:border-purple-800/20 p-6 transition-all duration-300 hover:shadow-xl">
                <h3 className="font-bold text-xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-500">
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.skills.map((skill: string) => (
                    <div key={skill} className="group/skill relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/60 to-purple-400/60 rounded-full blur opacity-0 group-hover/skill:opacity-50 transition duration-300"></div>
                      <Badge
                        variant="secondary"
                        className="relative text-xs bg-gradient-to-r from-purple-100/80 to-purple-50 text-purple-700 dark:text-purple-300 border border-purple-200/30 dark:border-purple-800/30 px-3 py-1 group-hover/skill:border-purple-300/50 dark:group-hover/skill:border-purple-700/50 transition-all duration-300"
                      >
                        {skill}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add animation keyframes */}
      <style jsx global>{`
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
      `}</style>
    </div>
  )
}

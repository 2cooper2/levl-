"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery"
import { PortfolioEditor } from "@/components/portfolio/portfolio-editor"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import type { Database } from "@/types/database.types"

interface PortfolioItem {
  id: string
  title: string
  description: string
  image: string
  category: string
  tags: string[]
  date: string
  featured?: boolean
  clientName?: string
  testimonial?: {
    text: string
    name: string
    title: string
  }
  additionalImages?: string[]
}

export default function PortfolioPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  // Sample categories
  const categories = [
    "Web Development",
    "Mobile Apps",
    "UI/UX Design",
    "Graphic Design",
    "Photography",
    "Video Production",
    "Writing",
    "Marketing",
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth/login?redirect=/portfolio")
          return
        }

        setUserId(session.user.id)

        // In a real app, fetch portfolio items from database
        // const { data, error } = await supabase
        //   .from('portfolio_items')
        //   .select('*')
        //   .eq('user_id', session.user.id)

        // if (error) throw error

        // For demo purposes, use mock data
        const mockPortfolioItems: PortfolioItem[] = [
          {
            id: "1",
            title: "Modern E-commerce Website",
            description:
              "A fully responsive e-commerce website with product filtering, user accounts, and secure checkout integration.",
            image: "/placeholder.svg?height=600&width=800&text=E-commerce+Website",
            category: "Web Development",
            tags: ["React", "Next.js", "Tailwind CSS", "Stripe"],
            date: "2023-06-15",
            featured: true,
            clientName: "Fashion Boutique Inc.",
            testimonial: {
              text: "The website exceeded our expectations. Sales have increased by 30% since launch, and customers love the smooth shopping experience.",
              name: "Sarah Johnson",
              title: "Marketing Director, Fashion Boutique",
            },
            additionalImages: [
              "/placeholder.svg?height=600&width=800&text=Product+Page",
              "/placeholder.svg?height=600&width=800&text=Checkout+Flow",
              "/placeholder.svg?height=600&width=800&text=Mobile+View",
            ],
          },
          {
            id: "2",
            title: "Fitness Tracking Mobile App",
            description:
              "A cross-platform mobile app that helps users track workouts, nutrition, and progress with personalized recommendations.",
            image: "/placeholder.svg?height=600&width=800&text=Fitness+App",
            category: "Mobile Apps",
            tags: ["React Native", "Firebase", "Health API", "UI/UX"],
            date: "2023-04-22",
            clientName: "FitLife Coaching",
            testimonial: {
              text: "This app has transformed how we engage with clients. The intuitive design and powerful features have received overwhelmingly positive feedback.",
              name: "Michael Chen",
              title: "Founder, FitLife Coaching",
            },
          },
          {
            id: "3",
            title: "Corporate Brand Identity",
            description:
              "Complete brand identity design including logo, color palette, typography, and brand guidelines for a tech startup.",
            image: "/placeholder.svg?height=600&width=800&text=Brand+Identity",
            category: "Graphic Design",
            tags: ["Branding", "Logo Design", "Typography", "Guidelines"],
            date: "2023-02-10",
            featured: true,
            clientName: "TechNova Solutions",
            additionalImages: [
              "/placeholder.svg?height=600&width=800&text=Logo+Variations",
              "/placeholder.svg?height=600&width=800&text=Color+Palette",
              "/placeholder.svg?height=600&width=800&text=Typography",
              "/placeholder.svg?height=600&width=800&text=Business+Cards",
            ],
          },
        ]

        setPortfolioItems(mockPortfolioItems)
      } catch (error) {
        console.error("Error fetching portfolio data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router, supabase])

  const handleUpdatePortfolio = async (updatedItems: PortfolioItem[]) => {
    // In a real app, save to database
    // const { error } = await supabase.from('portfolio_items').upsert(updatedItems)
    // if (error) throw error

    setPortfolioItems(updatedItems)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Tabs defaultValue="view">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Portfolio</h1>
          <TabsList>
            <TabsTrigger value="view">View Portfolio</TabsTrigger>
            <TabsTrigger value="edit">Edit Portfolio</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="view">
          {portfolioItems.length > 0 ? (
            <PortfolioGallery items={portfolioItems} userId={userId || ""} />
          ) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">Your Portfolio is Empty</h2>
              <p className="text-gray-500 mb-6">Showcase your work by adding projects to your portfolio.</p>
              <Tabs.Trigger value="edit" asChild>
                <button className="px-4 py-2 bg-primary text-white rounded-md">Add Your First Project</button>
              </Tabs.Trigger>
            </div>
          )}
        </TabsContent>

        <TabsContent value="edit">
          {userId && (
            <PortfolioEditor
              userId={userId}
              items={portfolioItems}
              categories={categories}
              onUpdate={handleUpdatePortfolio}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

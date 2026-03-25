"use client"

import { useState, useEffect } from "react"
import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
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

interface PortfolioSectionProps {
  userId: string
  isOwnProfile?: boolean
  limit?: number
  showViewAll?: boolean
  className?: string
}

export function PortfolioSection({
  userId,
  isOwnProfile = false,
  limit = 3,
  showViewAll = true,
  className,
}: PortfolioSectionProps) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchPortfolioItems = async () => {
      try {
        // In a real app, fetch from database
        // const { data, error } = await supabase
        //   .from('portfolio_items')
        //   .select('*')
        //   .eq('user_id', userId)
        //   .order('featured', { ascending: false })
        //   .order('created_at', { ascending: false })
        //   .limit(limit)

        // if (error) throw error

        // For demo purposes, use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

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
          },
        ]

        setPortfolioItems(mockPortfolioItems.slice(0, limit))
      } catch (error) {
        console.error("Error fetching portfolio items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioItems()
  }, [userId, limit, supabase])

  const handleViewAll = () => {
    if (isOwnProfile) {
      router.push("/portfolio")
    } else {
      router.push(`/profile/${userId}/portfolio`)
    }
  }

  if (loading) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (portfolioItems.length === 0) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
        {isOwnProfile ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-medium mb-2">No portfolio items yet</h3>
            <p className="text-gray-500 mb-4">Showcase your work by adding projects to your portfolio.</p>
            <Button onClick={() => router.push("/portfolio?tab=edit")}>Add Your First Project</Button>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500">This user hasn't added any portfolio items yet.</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Portfolio</h2>
        {showViewAll && portfolioItems.length >= limit && (
          <Button variant="outline" onClick={handleViewAll}>
            View All
          </Button>
        )}
      </div>

      <PortfolioGallery items={portfolioItems} userId={userId} initialCategory="all" compact={true} />

      {showViewAll && portfolioItems.length >= limit && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleViewAll}>View All Portfolio Items</Button>
        </div>
      )}
    </div>
  )
}

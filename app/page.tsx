"use client"

import Link from "next/link"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"
import { BackgroundPattern } from "@/components/background-pattern"
import { EnhancedHeroSection } from "@/components/enhanced-hero-section"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LevlLogo } from "@/components/levl-logo"
import { ThemeToggle } from "@/components/theme-toggle"
// Import the new AI Service Matchmaker component
import { AIServiceMatchmaker } from "@/components/ai-matchmaker/ai-service-matchmaker"
// Import more specialized Lucide icons for categories
import {
  Hammer,
  Wrench,
  LightbulbIcon,
  Paintbrush,
  Camera,
  Globe,
  Armchair,
  GraduationCap,
  Sparkles,
  Scissors,
} from "lucide-react"
import { EnhancedCategoryCard } from "@/components/enhanced-category-card"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="flex min-h-screen flex-col" style={{ margin: 0, padding: 0 }}>
      <AnimatedGradientBackground />

      {/* AI Service Matchmaker */}
      <div className="relative z-50" style={{ marginTop: 0 }}>
        <AIServiceMatchmaker />
      </div>

      <main className="flex-1" style={{ marginTop: 0, paddingTop: 0 }}>
        <EnhancedHeroSection />

        {/* Categories Section */}
        <section className="w-full py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Browse Categories</h2>
                <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Find skilled professionals in various categories to help with your projects.
                </p>
              </div>
            </div>
            <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
              <div onClick={() => router.push("/category/home-repair")}>
                <EnhancedCategoryCard name="Home Repair" icon={Hammer} index={0} count={0} />
              </div>
              <div onClick={() => router.push("/category/plumbing")}>
                <EnhancedCategoryCard name="Plumbing" icon={Wrench} index={1} count={0} />
              </div>
              <div onClick={() => router.push("/category/electrical")}>
                <EnhancedCategoryCard name="Electrical" icon={LightbulbIcon} index={2} count={0} />
              </div>
              <div onClick={() => router.push("/category/painting")}>
                <EnhancedCategoryCard name="Painting" icon={Paintbrush} index={3} count={0} />
              </div>
              <div onClick={() => router.push("/category/cleaning")}>
                <EnhancedCategoryCard name="Cleaning" icon={Sparkles} index={4} count={0} />
              </div>
              <div onClick={() => router.push("/category/photography")}>
                <EnhancedCategoryCard name="Photography" icon={Camera} index={5} count={0} />
              </div>
              <div onClick={() => router.push("/category/web-development")}>
                <EnhancedCategoryCard name="Web Development" icon={Globe} index={6} count={0} />
              </div>
              <div onClick={() => router.push("/category/interior-design")}>
                <EnhancedCategoryCard name="Interior Design" icon={Armchair} index={7} count={0} />
              </div>
              <div onClick={() => router.push("/category/education")}>
                <EnhancedCategoryCard name="Education" icon={GraduationCap} index={8} count={0} />
              </div>
              <div onClick={() => router.push("/category/hair-styling")}>
                <EnhancedCategoryCard name="Hair Styling" icon={Scissors} index={9} count={0} />
              </div>
            </div>
            <div className="flex justify-center mt-8">
              <Link
                href="/categories"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                View All Categories
              </Link>
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

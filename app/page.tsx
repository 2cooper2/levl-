"use client"

import Link from "next/link"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"
import { BackgroundPattern } from "@/components/background-pattern"
import { EnhancedHeroSection } from "@/components/enhanced-hero-section"
import { MessageSquare, Users, Search } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LevlLogo } from "@/components/levl-logo"
import { ThemeToggle } from "@/components/theme-toggle"
// REMOVE THIS IMPORT
// import { ValueProposition } from "@/components/value-proposition"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <AnimatedGradientBackground />
      <EnhancedMainNav />
      <main className="flex-1">
        <EnhancedHeroSection />

        {/* Journey Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-muted/50 relative">
          <BackgroundPattern className="opacity-50" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Your Path to Success
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Transform Your Career with LevL
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover the steps to unlock your full potential and achieve your goals
                </p>
              </div>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3 lg:gap-12 mt-8 relative">
              <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2"></div>
              {[
                {
                  step: "01",
                  title: "Create an account",
                  description: "Sign up for free and set up your profile with your skills or needs.",
                  icon: Users,
                },
                {
                  step: "02",
                  title: "Browse or list services",
                  description: "Search for services you need or create listings for services you offer.",
                  icon: Search,
                },
                {
                  step: "03",
                  title: "Connect and collaborate",
                  description: "Hire professionals or get hired, communicate, and complete projects.",
                  icon: MessageSquare,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="relative flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="absolute -top-10 text-8xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent opacity-70">
                    {item.step}
                  </div>
                  <div className="relative z-10 mt-12">
                    <div className="mb-4 rounded-full bg-purple-400/20 backdrop-blur-sm border border-purple-300/30 p-4 text-purple-600 mx-auto w-16 h-16 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300">
                      <item.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        {/* REMOVE THIS SECTION */}
        {/* Value Proposition */}
        {/* <ValueProposition /> */}
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

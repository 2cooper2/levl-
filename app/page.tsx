"use client"

import Link from "next/link"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"
import { EnhancedCategoryCard } from "@/components/enhanced-category-card"
import { EnhancedTestimonialCard } from "@/components/enhanced-testimonial-card"
import { EnhancedHeroSection } from "@/components/enhanced-hero-section"
import {
  Briefcase,
  CheckCircle,
  Code,
  CreditCard,
  Headphones,
  Heart,
  HomeIcon,
  Lightbulb,
  MessageSquare,
  Palette,
  Shield,
  Star,
  Users,
  Zap,
  Search,
} from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LevlLogo } from "@/components/levl-logo"
import { ThemeToggle } from "@/components/theme-toggle"
// Import the WaitlistSection at the top of the file with other imports
import { WaitlistSection } from "@/components/waitlist/waitlist-section"

// Then add it to the main content, right before the footer
export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <AnimatedGradientBackground />
      <EnhancedMainNav />
      <main className="flex-1">
        <EnhancedHeroSection />

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Popular Categories
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Find the perfect service for your needs
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Browse through thousands of services across various categories
                </p>
              </div>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
              {[
                { icon: Briefcase, name: "Business", count: 1240 },
                { icon: CreditCard, name: "Finance", count: 840 },
                { icon: Users, name: "Marketing", count: 1120 },
                { icon: Shield, name: "Legal", count: 560 },
                { icon: Palette, name: "Creative", count: 1450 },
                { icon: HomeIcon, name: "Lifestyle", count: 980 },
                { icon: Heart, name: "Health", count: 760 },
                { icon: Code, name: "Technology", count: 1680 },
              ].map((category, index) => (
                <EnhancedCategoryCard
                  key={index}
                  icon={category.icon}
                  name={category.name}
                  count={category.count}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  How It Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simple steps to get started
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Whether you're looking to hire or offer services, LevL makes it easy
                </p>
              </div>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-3 lg:gap-12 mt-8 relative">
              <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2"></div>
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
                  <div className="absolute -top-4 text-8xl font-bold text-primary/10">{item.step}</div>
                  <div className="relative z-10 mt-8">
                    <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary mx-auto w-16 h-16 flex items-center justify-center">
                      <item.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <motion.div
                className="flex flex-col justify-center space-y-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-2">
                  <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    Testimonials
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What our users say</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Join thousands of satisfied users who have found success on LevL
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <EnhancedButton
                    size="lg"
                    className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                    onClick={() => router.push("/auth/signup")}
                  >
                    Join Now
                  </EnhancedButton>
                  <EnhancedButton size="lg" variant="outline">
                    Learn More
                  </EnhancedButton>
                </div>
              </motion.div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    quote:
                      "LevL helped me find amazing clients for my freelance business. The platform is intuitive and secure.",
                    author: "Sarah J.",
                    role: "Graphic Designer",
                    avatar: "/placeholder.svg?height=80&width=80&text=SJ",
                  },
                  {
                    quote:
                      "I needed help with my website and found the perfect developer within hours. Highly recommended!",
                    author: "Michael T.",
                    role: "Small Business Owner",
                    avatar: "/placeholder.svg?height=80&width=80&text=MT",
                  },
                  {
                    quote:
                      "As someone who offers multiple services, LevL makes it easy to manage my gigs and find new opportunities.",
                    author: "David R.",
                    role: "Marketing Consultant",
                    avatar: "/placeholder.svg?height=80&width=80&text=DR",
                  },
                  {
                    quote: "The payment protection and review system gives me confidence when hiring professionals.",
                    author: "Emma L.",
                    role: "Startup Founder",
                    avatar: "/placeholder.svg?height=80&width=80&text=EL",
                  },
                ].map((testimonial, index) => (
                  <EnhancedTestimonialCard
                    key={index}
                    quote={testimonial.quote}
                    author={testimonial.author}
                    role={testimonial.role}
                    avatar={testimonial.avatar}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to level up your career or project?
                </h2>
                <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join LevL today and connect with thousands of professionals and clients
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <EnhancedButton
                  size="lg"
                  variant="secondary"
                  className="font-medium"
                  onClick={() => router.push("/auth/signup")}
                >
                  Sign Up Now
                </EnhancedButton>
                <EnhancedButton
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
                >
                  Learn More
                </EnhancedButton>
              </div>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
                {[
                  { icon: Zap, label: "Fast Matching", value: "2 min avg" },
                  { icon: Users, label: "Active Users", value: "50,000+" },
                  { icon: CheckCircle, label: "Completed Jobs", value: "120,000+" },
                  { icon: Headphones, label: "Support", value: "24/7" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="rounded-full bg-white/10 p-3 mb-3">
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-80">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Why Choose LevL
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Benefits that set us apart
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover why thousands of professionals and clients choose LevL
                </p>
              </div>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Shield,
                  title: "Secure Payments",
                  description: "Our escrow system ensures you only pay when you're satisfied with the work.",
                },
                {
                  icon: Users,
                  title: "Verified Professionals",
                  description: "All service providers undergo a thorough verification process.",
                },
                {
                  icon: Lightbulb,
                  title: "Skill Matching",
                  description: "Our AI matches you with the perfect professionals for your specific needs.",
                },
                {
                  icon: MessageSquare,
                  title: "Seamless Communication",
                  description: "Built-in messaging and collaboration tools make working together easy.",
                },
                {
                  icon: Star,
                  title: "Quality Guarantee",
                  description: "Not satisfied? Our satisfaction guarantee has you covered.",
                },
                {
                  icon: Headphones,
                  title: "24/7 Support",
                  description: "Our support team is always available to help with any issues.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center p-6 rounded-xl border bg-card text-card-foreground shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Add the waitlist section before the footer */}
        <WaitlistSection />
      </main>
      <footer className="w-full border-t bg-background py-6 md:py-12">
        <div className="container px-4 md:px-6">
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

"use client"
import { useState, useEffect, useRef, lazy } from "react"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Trophy,
  Rocket,
  Star,
  BookOpen,
  Clock,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  Compass,
  BarChart,
  Layers,
  Cpu,
  Users,
  Target,
  Zap,
  Search,
  Shield,
  BrushIcon as Broom,
  WrenchIcon as ScrewDriver,
  Hammer,
  Paintbrush,
  CreditCard,
  HomeIcon,
  Heart,
  Headphones,
} from "lucide-react"
import { AnimatedTextDivider } from "@/components/animated-text-divider"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { BackgroundPattern } from "@/components/background-pattern"
import { EnhancedCategoryCard } from "@/components/enhanced-category-card"
import { useMobile } from "@/hooks/use-mobile"
import { FeatureBadge } from "@/components/ui/feature-badge"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load the ForumTab component
const ForumTab = lazy(() =>
  import("./skill-accelerator/forum-component").then((module) => ({ default: module.ForumTab })),
)

// Add styles for hiding scrollbars
const scrollbarHideStyles = `
.scrollbar-hide::-webkit-scrollbar {
 display: none;
}
.scrollbar-hide {
 -ms-overflow-style: none;
 scrollbar-width: none;
}
`

// Define the FounderIcon component
const FounderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 4C11.6569 4 13 5.34315 13 7C13 8.65685 11.6569 10 10 10C8.34315 10 7 8.65685 7 7C7 5.34315 8.34315 4 10 4ZM10 16.5C7.94 16.5 6.04 15.41 5.06 13.6H14.94C13.96 15.41 12.06 16.5 10 16.5Z"
      fill="currentColor"
    />
  </svg>
)

// Forum Tab
const ForumTabPlaceholder = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full rounded-md" />
    <Skeleton className="h-40 w-full rounded-md" />
    <Skeleton className="h-10 w-32 rounded-md" />
  </div>
)

const SkillsData = [
  {
    name: "Mounting",
    icon: <Hammer className="h-5 w-5 text-white" />,
    level: "Intermediate",
    nextLevel: "Advanced",
    earnings: "$2,500/month",
    nextEarnings: "+$1,000/month",
    description:
      "Master the art of securely mounting TVs, shelves, and artwork on various wall types. Learn proper techniques, tool usage, and safety procedures.",
    progress: 60,
    color: "#4C6EF5",
    mentors: 12,
    projects: 25,
    stats: {
      repeatClients: 15,
    },
    testimonial: {
      author: "Jane Smith",
      rating: 5,
      text: "The Mounting skill accelerator helped me start my own TV mounting business. The techniques I learned were professional-grade and the projects gave me real-world experience.",
    },
  },
  {
    name: "Painting",
    icon: <Paintbrush className="h-5 w-5 text-white" />,
    level: "Beginner",
    nextLevel: "Intermediate",
    earnings: "$1,200/month",
    nextEarnings: "+$800/month",
    description:
      "Learn professional painting techniques for interior and exterior surfaces. Master color selection, surface preparation, and proper application methods for flawless results.",
    progress: 30,
    color: "#7950F2",
    mentors: 8,
    projects: 15,
    stats: {
      repeatClients: 8,
    },
    testimonial: {
      author: "John Davis",
      rating: 4,
      text: "The Painting skill accelerator gave me the foundation I needed to start taking on painting jobs. The instructors were knowledgeable and the projects were practical.",
    },
  },
  {
    name: "Furniture Assembly",
    icon: <ScrewDriver className="h-5 w-5 text-white" />,
    level: "Intermediate",
    nextLevel: "Advanced",
    earnings: "$3,000/month",
    nextEarnings: "+$1,200/month",
    description:
      "Become an expert at assembling all types of furniture from various manufacturers. Learn efficient techniques, proper tool usage, and troubleshooting methods for complex assemblies.",
    progress: 70,
    color: "#6741D9",
    mentors: 10,
    projects: 20,
    stats: {
      repeatClients: 12,
    },
    testimonial: {
      author: "Emily Wilson",
      rating: 5,
      text: "The Furniture Assembly skill accelerator helped me grow my assembly business exponentially. The techniques I learned made me much more efficient and the support from mentors was invaluable.",
    },
  },
]

export function EnhancedHeroSection() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [activeSkill, setActiveSkill] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [progress, setProgress] = useState(0)
  const skillsRef = useRef<HTMLDivElement>(null)
  const progressInterval = useRef<NodeJS.Timeout>()
  const [hoverSkill, setHoverSkill] = useState<number | null>(null)
  const isMobile = useMobile()

  // Define handleHireNow function inside the component
  const handleHireNow = () => {
    router.push("/stripe-checkout")
  }

  // Animate progress bar when skill changes
  useEffect(() => {
    setProgress(0)

    if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= SkillsData[activeSkill].progress) {
          clearInterval(progressInterval.current)
          return SkillsData[activeSkill].progress
        }
        return prev + 1
      })
    }, 20)

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [activeSkill])

  return (
    <>
      <section className="w-full relative overflow-hidden bg-gradient-to-br from-white via-lavender-100/30 to-white">
        {/* Simplified background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-lavender-50 to-white/90 z-0" />
        <div className="absolute inset-0 bg-noise opacity-5 dark:opacity-10 z-0"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

        <AnimatedTextDivider firstText="Learn. Earn." secondText="Grow Your Business" className="mb-12 text-gray-800" />

        <div className="container px-3 md:px-6 relative z-10">
          <div className="flex flex-col gap-6 md:gap-10 lg:gap-12">
            {/* Enhanced Skill Accelerator UI */}
            <div className="flex items-center justify-center w-full">
              <div className="relative w-full max-w-full">
                <div
                  className="relative rounded-xl overflow-hidden bg-gradient-to-br from-white via-lavender-50/50 to-white backdrop-blur-md p-3 sm:p-4 md:p-6 shadow-xl border border-lavender-200/50 hover:shadow-lavender-300/30 transition-all duration-300"
                  style={{
                    border: "1px solid rgba(147, 51, 234, 0.2)",
                    boxShadow: "0 10px 30px -5px rgba(147, 51, 234, 0.1), 0 0 20px -10px rgba(147, 51, 234, 0.2)",
                  }}
                >
                  <div className="space-y-3 md:space-y-4 relative z-10 lg:grid lg:grid-cols-12 lg:gap-4 lg:space-y-0">
                    <div className="flex items-center justify-between lg:col-span-12">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center mr-3 relative group">
                          <Rocket className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Skill Accelerator
                          <div className="ml-2 flex flex-wrap gap-1.5">
                            <FeatureBadge type="ai" />
                            <FeatureBadge type="founder" />
                            <FeatureBadge type="fees" />
                          </div>
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 lg:col-span-12">
                      The world's first AI-powered gig ecosystem that helps you earn while you learn and grow your
                      freelance career exponentially.
                      <span className="inline-flex items-center ml-2 text-primary">
                        <Lightbulb className="h-3 w-3 mr-1" /> Smart matching technology
                      </span>
                    </p>

                    <div className="flex flex-wrap gap-2 md:flex-nowrap overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide lg:col-span-12">
                      {SkillsData.map((skill, index) => (
                        <button
                          key={index}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center ${
                            activeSkill === index
                              ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/20"
                              : "bg-white/10 dark:bg-black/20 text-gray-800 hover:bg-white/20 dark:hover:bg-black/30"
                          }`}
                          onClick={() => setActiveSkill(index)}
                          onMouseEnter={() => setHoverSkill(index)}
                          onMouseLeave={() => setHoverSkill(null)}
                        >
                          <span className="mr-1.5">{skill.icon}</span>
                          {skill.name}
                          {hoverSkill === index && <span className="ml-1.5 text-xs opacity-70">{skill.level}</span>}
                          {activeSkill === index && (
                            <span className="ml-1.5 flex items-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex border-b border-white/10 overflow-x-auto -mx-1 px-1 scrollbar-hide md:justify-start lg:col-span-12">
                      {["overview", "learning", "projects", "forum", "analytics", "milestones"].map((tab) => (
                        <button
                          key={tab}
                          className={`px-2 sm:px-3 py-2 text-xs font-medium capitalize whitespace-nowrap transition-all duration-300 ${
                            activeTab === tab ? "text-primary relative" : "text-gray-500 hover:text-gray-800"
                          }`}
                          onClick={() => setActiveTab(tab)}
                        >
                          {tab === "overview" && <Compass className="h-3 w-3 inline mr-1" />}
                          {tab === "learning" && <BookOpen className="h-3 w-3 inline mr-1" />}
                          {tab === "projects" && <Layers className="h-3 w-3 inline mr-1" />}
                          {tab === "forum" && <MessageSquare className="h-3 w-3 inline mr-1" />}
                          {tab === "analytics" && <BarChart className="h-3 w-3 inline mr-1" />}
                          {tab === "milestones" && <Trophy className="h-3 w-3 inline mr-1" />}
                          {tab}
                          {activeTab === tab && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="min-h-[280px] md:min-h-[260px] lg:min-h-[240px] lg:col-span-8">
                      {/* Overview Tab */}
                      {activeTab === "overview" && (
                        <div className="space-y-4">
                          {/* Active Skill Card */}
                          <div
                            className="bg-gradient-to-br from-white via-lavender-50/50 to-white backdrop-blur-sm rounded-lg p-5 border border-lavender-300/50 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-lavender-500/20 hover:border-lavender-400/50"
                            style={{ borderLeft: `4px solid ${SkillsData[activeSkill].color}` }}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 relative z-10">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mr-3 relative shadow-md shadow-primary/20">
                                    {SkillsData[activeSkill].icon}
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-bold text-gray-800 flex items-center">
                                      {SkillsData[activeSkill].name}
                                      <div className="ml-2 h-2 w-2 rounded-full bg-green-500"></div>
                                    </h4>
                                    <div className="flex items-center mt-1 gap-2">
                                      <div className="px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/30 text-xs font-medium">
                                        {SkillsData[activeSkill].level}
                                      </div>
                                      <ArrowRight className="h-3 w-3 text-white/50" />
                                      <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/50 to-purple-500/50 text-xs text-white font-medium">
                                        {SkillsData[activeSkill].nextLevel}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                                  {SkillsData[activeSkill].description}
                                  <span className="inline-flex items-center ml-2 text-xs text-primary font-medium">
                                    <Cpu className="h-3 w-3 mr-1" /> AI-optimized learning path
                                  </span>
                                </p>
                              </div>

                              <div className="bg-white/10 dark:bg-black/20 rounded-lg p-3 shadow-inner min-w-[140px]">
                                <div className="text-xs text-gray-500">Current Earnings</div>
                                <div className="font-bold text-xl text-gray-800 mt-1">
                                  {SkillsData[activeSkill].earnings}
                                </div>
                                <div className="text-xs text-green-500 mt-1 flex items-center">
                                  <TrendingUp className="h-3 w-3 mr-0.5" />
                                  <span className="font-medium">{SkillsData[activeSkill].nextEarnings}</span>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-5">
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-gray-500 font-medium">
                                  Progress to {SkillsData[activeSkill].nextLevel}
                                </span>
                                <span className="font-semibold text-primary">{progress}%</span>
                              </div>
                              <div className="h-3 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden shadow-inner relative">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-primary via-purple-500/80 to-primary relative"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                {
                                  label: "Mentors",
                                  value: SkillsData[activeSkill].mentors,
                                  icon: Users,
                                },
                                {
                                  label: "Projects",
                                  value: SkillsData[activeSkill].projects,
                                  icon: Layers,
                                },
                                { label: "Rating", value: "4.8", icon: Star, showStar: true },
                                {
                                  label: "Clients",
                                  value: SkillsData[activeSkill].stats.repeatClients,
                                  icon: Users,
                                },
                              ].map((stat, i) => (
                                <div
                                  key={i}
                                  className="bg-white rounded-lg p-3 relative overflow-hidden hover:bg-lavender-50 transition-colors duration-200 shadow-sm border border-lavender-100"
                                >
                                  <div className="flex flex-col items-center text-center">
                                    <div className="mb-1 opacity-80">
                                      <stat.icon className="h-4 w-4" />
                                    </div>
                                    <div className="text-lg font-bold text-gray-800 flex items-center">
                                      {stat.value}
                                      {stat.showStar && (
                                        <Star className="h-4 w-4 ml-0.5 text-yellow-400 fill-yellow-400" />
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Testimonial */}
                          <div className="bg-white rounded-lg p-4 border border-lavender-200/50 relative overflow-hidden shadow-sm">
                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-primary shadow-inner relative">
                                {SkillsData[activeSkill].testimonial.author.split(" ")[0][0]}
                                {SkillsData[activeSkill].testimonial.author.split(" ")[1][0]}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <div className="text-sm font-medium text-gray-800 mr-2">
                                    {SkillsData[activeSkill].testimonial.author}
                                  </div>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3.5 w-3.5 ${i < SkillsData[activeSkill].testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                      />
                                    ))}
                                  </div>
                                  <div className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                    Verified Client
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 italic leading-relaxed">
                                  "{SkillsData[activeSkill].testimonial.text}"
                                </p>
                                <div className="flex items-center justify-end mt-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" /> 2 months ago
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <button className="bg-white hover:bg-lavender-50 rounded-lg p-3 flex flex-col items-center text-center transition-colors duration-200 border border-lavender-100 shadow-sm">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-xs font-medium text-gray-800">Continue Learning</div>
                              <div className="text-[10px] text-gray-500 mt-1">4 lessons left</div>
                            </button>

                            <button className="bg-white hover:bg-lavender-50 rounded-lg p-3 flex flex-col items-center text-center transition-colors duration-200 border border-lavender-100 shadow-sm">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <Layers className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-xs font-medium text-gray-800">Find Projects</div>
                              <div className="text-[10px] text-gray-500 mt-1">12 available</div>
                            </button>

                            <button className="bg-white hover:bg-lavender-50 rounded-lg p-3 flex flex-col items-center text-center transition-colors duration-200 border border-lavender-100 shadow-sm">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-xs font-medium text-gray-800">Community</div>
                              <div className="text-[10px] text-gray-500 mt-1">3 new topics</div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5">
                            <MessageSquare className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-800">Forum</h4>
                            <p className="text-xs text-gray-700">Community support</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5">
                            <Users className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-800">Mentor Network</h4>
                            <p className="text-xs text-gray-700">Expert feedback</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5">
                            <Target className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-800">Skill Projects</h4>
                            <p className="text-xs text-gray-700">Learn while earning</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5">
                            <Trophy className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-800">Skill Certification</h4>
                            <p className="text-xs text-gray-700">Verified credentials</p>
                          </div>
                        </div>
                      </div>

                      <EnhancedButton variant="gradient" size="sm" className="w-full" onClick={handleHireNow}>
                        <Zap className="mr-2 h-4 w-4" />
                        Accelerate Your Skills
                      </EnhancedButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Find the perfect service section */}
            <section className="w-screen max-w-none py-16 md:py-24 lg-py-32 relative">
              <BackgroundPattern className="opacity-50" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
              <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                  <div className="w-full max-w-md mx-auto mt-8 relative">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <input
                        type="search"
                        placeholder="Search categories or services..."
                        className="w-full rounded-full border border-primary/30 bg-white/5 dark:bg-black/10 backdrop-blur-xl px-10 py-3 text-sm shadow-lg transition-all duration-300 hover:border-primary/50 focus:border-primary/70 focus:ring-2 focus:ring-primary/30 focus-visible:outline-none"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                        <ArrowRight className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 mt-10">
                    {["all", "trending", "popular", "new"].map((tab) => (
                      <button
                        key={tab}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                          activeTab === tab
                            ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/30"
                            : "bg-white/5 dark:bg-black/20 border border-white/10 hover:border-primary/40 hover:bg-white/10 dark:hover:bg-black/30"
                        }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab === "all" && (
                          <span className="flex items-center">
                            <Layers className="mr-1.5 h-3.5 w-3.5" /> All Categories
                          </span>
                        )}
                        {tab === "trending" && (
                          <span className="flex items-center">
                            <TrendingUp className="mr-1.5 h-3.5 w-3.5" /> Trending
                          </span>
                        )}
                        {tab === "popular" && (
                          <span className="flex items-center">
                            <Star className="mr-1.5 h-3.5 w-3.5" /> Popular
                          </span>
                        )}
                        {tab === "new" && (
                          <span className="flex items-center">
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> New
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured categories */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Featured Categories</h3>
                    <Link
                      href="/explore"
                      className="text-primary text-sm font-medium flex items-center hover:underline"
                    >
                      View all <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <EnhancedCategoryCard
                        icon={Hammer}
                        name="Mounting"
                        count={1680}
                        index={0}
                        className="bg-purple-300/30 dark:bg-purple-400/20"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center -mt-3">
                        <span className="bg-purple-200 text-purple-700 text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          Coming Soon
                        </span>
                      </div>
                      <EnhancedCategoryCard
                        icon={Broom}
                        name="Cleaning"
                        count={1450}
                        index={1}
                        className="bg-purple-300/30 dark:bg-purple-400/20"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center -mt-3">
                        <span className="bg-purple-200 text-purple-700 text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          Coming Soon
                        </span>
                      </div>
                      <EnhancedCategoryCard
                        icon={Paintbrush}
                        name="Painting"
                        count={1120}
                        index={2}
                        className="bg-purple-300/30 dark:bg-purple-400/20"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center -mt-3">
                        <span className="bg-purple-200 text-purple-700 text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          Coming Soon
                        </span>
                      </div>
                      <EnhancedCategoryCard
                        icon={ScrewDriver}
                        name="Furniture Assembly"
                        count={1240}
                        index={3}
                        className="bg-purple-300/30 dark:bg-purple-400/20"
                      />
                    </div>
                  </div>
                </div>

                {/* All categories */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {[
                    { icon: CreditCard, name: "Finance", count: 840 },
                    { icon: Shield, name: "Legal", count: 560 },
                    { icon: HomeIcon, name: "Lifestyle", count: 980 },
                    { icon: Heart, name: "Health", count: 760 },
                    { icon: MessageSquare, name: "Writing", count: 920 },
                    { icon: Headphones, name: "Music", count: 540 },
                    { icon: Zap, name: "Video", count: 680 },
                    { icon: Lightbulb, name: "Education", count: 890 },
                  ].map((category, index) => (
                    <div className="relative" key={index}>
                      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center -mt-3">
                        <span className="bg-purple-200 text-purple-700 text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          Coming Soon
                        </span>
                      </div>
                      <EnhancedCategoryCard
                        key={index}
                        icon={category.icon}
                        name={category.name}
                        count={category.count}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  )
}

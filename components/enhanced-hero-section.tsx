"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { SkillAcceleratorSignup } from "@/components/skill-accelerator-signup"
import {
  Trophy,
  Rocket,
  Star,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  PenToolIcon as Tool,
  Lightbulb,
  Compass,
  BarChart,
  Layers,
  Cpu,
  ThumbsUp,
  Reply,
  Users,
  Target,
  Zap,
  Search,
  Code,
  CreditCard,
  Shield,
  HomeIcon,
  Heart,
  Headphones,
  BrushIcon as Broom,
  WrenchIcon as ScrewDriver,
  Hammer,
  Paintbrush,
} from "lucide-react"
import { AnimatedTextDivider } from "@/components/animated-text-divider"
import wave from "@/public/wave.png"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { BackgroundPattern } from "@/components/background-pattern"
import { EnhancedCategoryCard } from "@/components/enhanced-category-card"
import { useMobile } from "@/hooks/use-mobile"

// Add keyframes for the shimmer animation
const shimmerAnimation = {
  "0%": { transform: "translateX(-100%)" },
  "100%": { transform: "translateX(100%)" },
}

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

// Add detailed visual styles
const detailedVisualStyles = `
 .detailed-card {
   position: relative;
   overflow: hidden;
   isolation: isolate;
 }
 
 .grid-pattern {
   opacity: 0.7;
 }

 .tech-pattern {
   opacity: 0.7;
   
 }
 
 .circuit-lines {
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   overflow: hidden;
   pointer-events: none;
   z-index: 1;
 }
 
 .circuit-line {
   position: absolute;
   background: linear-gradient(90deg, rgba(var(--primary-rgb), 0.1), rgba(var(--primary-rgb), 0.3), rgba(var(--primary-rgb), 0.1));
   height: 1px;
   opacity: 0.3;
 }
 
 .circuit-dot {
   position: absolute;
   width: 4px;
   height: 4px;
   border-radius: 50%;
   background-color: rgba(var(--primary-rgb), 0.5);
   box-shadow: 0 0 5px rgba(var(--primary-rgb), 0.5);
 }
 
 .glow-dot {
   position: absolute;
   width: 2px;
   height: 2px;
   border-radius: 50%;
   background-color: white;
   opacity: 0.6;
   box-shadow: 0 0 5px 2px rgba(255, 255, 255, 0.3);
   animation: pulse-glow 3s infinite;
 }
 
 @keyframes pulse-glow {
   0%, 100% { opacity: 0.2; transform: scale(1); }
   50% { opacity: 0.8; transform: scale(1.5); }
 }
 
 .geometric-shape {
   position: absolute;
   opacity: 0.15;
   pointer-events: none;
   z-index: 1;
 }
 
 .skill-card {
   position: relative;
   overflow: hidden;
 }
 
 .skill-card::before {
   content: '';
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: radial-gradient(circle at 50% 0%, rgba(var(--primary-rgb), 0.1), transparent 70%);
   pointer-events: none;
   z-index: 1;
 }
 
 .progress-track {
   position: relative;
   overflow: hidden;
   border-radius: 9999px;
 }
 
 .progress-track::after {
   content: '';
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background-image: linear-gradient(90deg, 
     rgba(255,255,255,0) 0%, 
     rgba(255,255,255,0.2) 20%, 
     rgba(255,255,255,0.2) 80%, 
     rgba(255,255,255,0) 100%);
   background-size: 200% 100%;
   animation: shimmer 2s infinite;
   pointer-events: none;
 }
 
 @keyframes shimmer {
   0% { background-position: -200% 0; }
   100% { background-position: 200% 0; }
 }
 
 .detailed-tab {
   position: relative;
 }
 
 .detailed-tab::after {
   content: '';
   position: absolute;
   bottom: -2px;
   left: 0;
   right: 0;
   height: 2px;
   background: linear-gradient(90deg, 
     rgba(var(--primary-rgb), 0) 0%, 
     rgba(var(--primary-rgb), 1) 50%, 
     rgba(var(--primary-rgb), 0) 100%);
   opacity: 0;
   transition: opacity 0.3s ease;
 }
 
 .detailed-tab.active::after {
   opacity: 1;
 }
 
 .tech-pattern {
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background-image: radial-gradient(circle at 10px 10px, rgba(255,255,255,0.05) 1px, transparent 1px);
   background-size: 20px 20px;
   pointer-events: none;
   z-index: 1;
 }

  .bg-grid-pattern {
    background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 50px 50px;
  }
`

// Custom function to format the last active time
const formatLastActive = (lastActive: string): string => {
  // Implement your formatting logic here
  return lastActive
}

// Define the FounderIcon component
const FounderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 4C11.6569 4 13 5.34315 13 7C13 8.65685 11.6569 10 10 10C8.34315 10 7 8.65685 7 7C7 5.34315 8.34315 4 10 4ZM10 16.5C7.94 16.5 6.04 15.41 5.06 13.6H14.94C13.96 15.41 12.06 16.5 10 16.5Z"
      fill="currentColor"
    />
  </svg>
)

// Define forumTopics
const forumTopics = [
  {
    id: 1,
    title: "Best drill for mounting?",
    author: "ToolLover",
    replies: 12,
    likes: 25,
    lastActive: "1 day ago",
    tags: ["mounting", "tools", "drilling"],
    preview: "I'm looking for a reliable drill for mounting shelves and TVs. Any recommendations?",
    responses: [
      {
        author: "HandyMan",
        time: "1 day ago",
        content: "I recommend the Dewalt DCD791D2. It's powerful and versatile.",
        likes: 5,
      },
      {
        author: "DrillMaster",
        time: "1 day ago",
        content: "I prefer the Milwaukee M18. It's a bit more expensive, but it's worth it.",
        likes: 3,
      },
    ],
  },
  {
    id: 2,
    title: "How to find studs in a wall?",
    author: "DIYNewbie",
    replies: 8,
    likes: 15,
    lastActive: "3 days ago",
    tags: ["studs", "walls", "mounting"],
    preview: "What's the best way to locate studs behind drywall?",
    responses: [
      {
        author: "WallExpert",
        time: "3 days ago",
        content:
          "A stud finder is the easiest way. You can also try tapping on the wall and listening for a solid sound.",
        likes: 7,
      },
      {
        author: "DIYPro",
        time: "3 days ago",
        content: "Don't forget to check for electrical wires before drilling!",
        likes: 2,
      },
    ],
  },
  {
    id: 3,
    title: "Best way to hide cables?",
    author: "CableGuy",
    replies: 5,
    likes: 10,
    lastActive: "1 week ago",
    tags: ["cables", "tv", "mounting"],
    preview: "What are some creative ways to hide TV cables after mounting?",
    responses: [
      {
        author: "HomeTheaterPro",
        time: "1 week ago",
        content: "You can use cable sleeves or in-wall cable management kits.",
        likes: 4,
      },
      {
        author: "TechGuru",
        time: "1 week ago",
        content: "Consider using a power bridge to safely run cables behind the wall.",
        likes: 1,
      },
    ],
  },
]

// Forum Tab
const ForumTab = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTopic, setActiveTopic] = useState<number | null>(null)
  const [topics, setTopics] = useState(forumTopics)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredTopics = topics.filter((topic) => topic.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const loadMoreTopics = () => {
    setIsLoading(true)
    setTimeout(() => {
      // Simulate loading more topics
      const newTopics = [
        {
          id: 4,
          title: "How to choose the right drill bit for mounting?",
          author: "DrillMaster",
          replies: 4,
          likes: 6,
          lastActive: "5 days ago",
          tags: ["mounting", "tools", "drilling"],
          preview: "What type of drill bit should I use for different wall materials?",
          responses: [],
        },
      ]
      setTopics([...topics, ...newTopics])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-black dark:text-white">Community Discussions</h4>
        <div className="flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Search topics..."
            className="h-8 text-xs"
            value={searchQuery}
            onChange={handleSearch}
          />
          <EnhancedButton variant="outline" size="sm" className="h-8 text-xs">
            New Topic
          </EnhancedButton>
        </div>
      </div>

      <div className="space-y-2">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className={`p-3 rounded-lg bg-white/5 dark:bg-black/10 border hover:border-primary/30 transition-all duration-300 relative overflow-hidden cursor-pointer ${
              activeTopic === topic.id ? "border-primary/30" : "border-white/10"
            }`}
            onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-black dark:text-white">{topic.title}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {topic.tags.map((tag) => (
                    <div key={tag} className="px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/30 text-xs">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="text-black/60 dark:text-white/60">{formatLastActive(topic.lastActive)}</div>
                <div className="flex items-center justify-end mt-1">
                  <MessageSquare className="h-3 w-3 mr-1 text-primary" />
                  <span>{topic.replies}</span>
                </div>
              </div>
            </div>

            {activeTopic === topic.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 pt-3 border-t border-white/10"
              >
                <p className="text-xs text-black/80 dark:text-white/80 mb-3">{topic.preview}</p>

                {topic.responses && topic.responses.length > 0 ? (
                  <div className="space-y-2">
                    {topic.responses.map((response, i) => (
                      <div key={i} className="bg-white/5 dark:bg-black/20 rounded-md p-2 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-medium text-black dark:text-white">{response.author}</div>
                          <div className="text-black/60 dark:text-white/60">{response.time}</div>
                        </div>
                        <p className="text-black/80 dark:text-white/80">{response.content}</p>
                        <div className="flex items-center justify-end mt-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-xs">
                            <ThumbsUp className="h-3 w-3 mr-1" /> {response.likes}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-xs">
                            <Reply className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 dark:bg-black/20 rounded-md p-2 text-xs text-center text-black/60 dark:text-white/60">
                    No responses yet. Be the first to reply!
                  </div>
                )}

                <div className="mt-2 flex gap-2">
                  <Input placeholder="Add your response..." className="text-xs h-8" />
                  <EnhancedButton variant="outline" size="sm" className="h-8 text-xs bg-white/5">
                    Reply
                  </EnhancedButton>
                </div>
              </motion.div>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full" onClick={loadMoreTopics} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load More"}
        </Button>
      </div>
    </div>
  )
}

// Define fadeIn animation
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
}

const handleApplyForProject = (projectName: string) => {
  alert(`Applying for project: ${projectName}`)
  // Add your logic here to handle the project application
}

// Mock skills data
const skillsData = [
  {
    name: "UI/UX Design",
    icon: <Tool className="h-5 w-5 text-white" />,
    level: "Intermediate",
    nextLevel: "Advanced",
    earnings: "$2,500/month",
    nextEarnings: "+$1,000/month",
    description:
      "Master the art of creating intuitive and visually appealing user interfaces. Learn design principles, wireframing, prototyping, and user testing.",
    progress: 60,
    color: "#4C6EF5",
    mentors: 12,
    projects: 25,
    stats: {
      repeatClients: 15,
    },
    learningPath: [
      { name: "UI Design Fundamentals", duration: "4h 30m", status: "completed" },
      { name: "UX Research Methods", duration: "3h 15m", status: "completed" },
      { name: "Prototyping with Figma", duration: "5h 00m", status: "in-progress" },
      { name: "User Testing and Feedback", duration: "4h 45m", status: "upcoming" },
    ],
    skills: [
      { name: "Visual Design", level: 75 },
      { name: "Interaction Design", level: 60 },
      { name: "User Research", level: 50 },
      { name: "Prototyping", level: 80 },
    ],
    skillProjects: [
      {
        name: "Design a mobile app for a local business",
        difficulty: "Intermediate",
        earnings: "$500",
        status: "completed",
      },
      {
        name: "Redesign a website for a non-profit organization",
        difficulty: "Advanced",
        earnings: "$800",
        status: "in-progress",
      },
      {
        name: "Create a design system for a startup",
        difficulty: "Intermediate",
        earnings: "$600",
        status: "available",
      },
    ],
    testimonial: {
      author: "Jane Doe",
      rating: 5,
      text: "The UI/UX Design skill accelerator helped me land my dream job as a UX designer. The learning path was comprehensive and the projects were challenging and rewarding.",
    },
    milestones: [
      { name: "Complete UI Design Fundamentals", progress: 100, total: 100 },
      { name: "Complete UX Research Methods", progress: 100, total: 100 },
      { name: "Complete Prototyping with Figma", progress: 75, total: 100 },
      { name: "Complete User Testing and Feedback", progress: 0, total: 100 },
    ],
  },
  {
    name: "Web Development",
    icon: <Code className="h-5 w-5 text-white" />,
    level: "Beginner",
    nextLevel: "Intermediate",
    earnings: "$1,200/month",
    nextEarnings: "+$800/month",
    description:
      "Build dynamic and responsive websites using HTML, CSS, and JavaScript. Learn front-end and back-end development, and deploy your projects to the web.",
    progress: 30,
    color: "#7950F2",
    mentors: 8,
    projects: 15,
    stats: {
      repeatClients: 8,
    },
    learningPath: [
      { name: "HTML and CSS Basics", duration: "3h 00m", status: "completed" },
      { name: "JavaScript Fundamentals", duration: "4h 00m", status: "in-progress" },
      { name: "Front-End Frameworks (React)", duration: "6h 00m", status: "upcoming" },
      { name: "Back-End Development (Node.js)", duration: "5h 30m", status: "upcoming" },
    ],
    skills: [
      { name: "HTML", level: 80 },
      { name: "CSS", level: 70 },
      { name: "JavaScript", level: 40 },
      { name: "React", level: 20 },
    ],
    skillProjects: [
      { name: "Build a personal portfolio website", difficulty: "Beginner", earnings: "$300", status: "completed" },
      {
        name: "Create a landing page for a local business",
        difficulty: "Intermediate",
        earnings: "$500",
        status: "available",
      },
      { name: "Develop a simple e-commerce website", difficulty: "Advanced", earnings: "$700", status: "available" },
    ],
    testimonial: {
      author: "John Smith",
      rating: 4,
      text: "The Web Development skill accelerator gave me the foundation I needed to start my career as a web developer. The instructors were knowledgeable and the projects were practical.",
    },
    milestones: [
      { name: "Complete HTML and CSS Basics", progress: 100, total: 100 },
      { name: "Complete JavaScript Fundamentals", progress: 50, total: 100 },
      { name: "Complete Front-End Frameworks (React)", progress: 0, total: 100 },
      { name: "Complete Back-End Development (Node.js)", progress: 0, total: 100 },
    ],
  },
  {
    name: "Digital Marketing",
    icon: <TrendingUp className="h-5 w-5 text-white" />,
    level: "Intermediate",
    nextLevel: "Advanced",
    earnings: "$3,000/month",
    nextEarnings: "+$1,200/month",
    description:
      "Drive traffic and generate leads for businesses using SEO, social media marketing, email marketing, and content marketing. Learn how to analyze data and optimize your campaigns for maximum ROI.",
    progress: 70,
    color: "#6741D9",
    mentors: 10,
    projects: 20,
    stats: {
      repeatClients: 12,
    },
    learningPath: [
      { name: "SEO Fundamentals", duration: "4h 00m", status: "completed" },
      { name: "Social Media Marketing", duration: "3h 30m", status: "completed" },
      { name: "Email Marketing Strategies", duration: "5h 00m", status: "completed" },
      { name: "Content Marketing and Blogging", duration: "4h 30m", status: "in-progress" },
    ],
    skills: [
      { name: "SEO", level: 85 },
      { name: "Social Media", level: 75 },
      { name: "Email Marketing", level: 65 },
      { name: "Content Marketing", level: 55 },
    ],
    skillProjects: [
      {
        name: "Develop an SEO strategy for a local business",
        difficulty: "Intermediate",
        earnings: "$600",
        status: "completed",
      },
      {
        name: "Manage social media accounts for a startup",
        difficulty: "Advanced",
        earnings: "$900",
        status: "available",
      },
      {
        name: "Create an email marketing campaign for a non-profit organization",
        difficulty: "Intermediate",
        earnings: "$700",
        status: "available",
      },
    ],
    testimonial: {
      author: "Emily Brown",
      rating: 5,
      text: "The Digital Marketing skill accelerator helped me grow my freelance business exponentially. The strategies I learned were effective and the support from the mentors was invaluable.",
    },
    milestones: [
      { name: "Complete SEO Fundamentals", progress: 100, total: 100 },
      { name: "Complete Social Media Marketing", progress: 100, total: 100 },
      { name: "Complete Email Marketing Strategies", progress: 100, total: 100 },
      { name: "Complete Content Marketing and Blogging", progress: 60, total: 100 },
    ],
  },
]

export function EnhancedHeroSection() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [activeSkill, setActiveSkill] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [progress, setProgress] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const skillsRef = useRef<HTMLDivElement>(null)
  const progressInterval = useRef<NodeJS.Timeout>()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartAnimationRef = useRef<number>(0)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipContent, setTooltipContent] = useState({ title: "", description: "" })
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [selectedMilestone, setSelectedMilestone] = useState(0)
  const [showDiamondGlint, setShowDiamondGlint] = useState(false)
  const [hoverSkill, setHoverSkill] = useState<number | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [circuitLines, setCircuitLines] = useState<Array<{ top: number; width: number; left: number }>>([])
  const [circuitDots, setCircuitDots] = useState<Array<{ top: number; left: number }>>([])
  const [glowDots, setGlowDots] = useState<Array<{ top: number; left: number; delay: number }>>([])
  const [dataFlows, setDataFlows] = useState<Array<{ top: number; left: number; delay: number }>>([])
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; duration: number }>
  >(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 6 + 4,
    })),
  )

  // Initialize skills state with the skillsData
  const [skills, setSkills] = useState(skillsData)
  const isMobile = useMobile()

  // Generate decorative elements
  useEffect(() => {
    // Generate circuit lines
    const lines = Array.from({ length: 8 }, (_, i) => ({
      top: Math.random() * 100,
      width: 50 + Math.random() * 150,
      left: Math.random() * 100,
    }))
    setCircuitLines(lines)

    // Generate circuit dots
    const dots = Array.from({ length: 12 }, (_, i) => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
    }))
    setCircuitDots(dots)

    // Generate glow dots
    const glows = Array.from({ length: 15 }, (_, i) => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 5,
    }))
    setGlowDots(glows)

    // Generate data flows
    const flows = Array.from({ length: 10 }, (_, i) => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 4,
    }))
    setDataFlows(flows)
  }, [])

  // Auto-rotate through skills
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSkill((prev) => (prev + 1) % skills.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [skills.length])

  // Diamond glint effect
  useEffect(() => {
    const glintInterval = setInterval(() => {
      setShowDiamondGlint(true)
      setTimeout(() => {
        setShowDiamondGlint(false)
      }, 800)
    }, 3000)

    return () => clearInterval(glintInterval)
  }, [])

  // Animate progress bar when skill changes
  useEffect(() => {
    setProgress(0)

    if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= skills[activeSkill].progress) {
          clearInterval(progressInterval.current)
          return skills[activeSkill].progress
        }
        return prev + 1
      })
    }, 20)

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [activeSkill, skills])

  // Animate the skill path visualization
  useEffect(() => {
    if (!skillsRef.current) return

    const animateNodes = () => {
      const nodes = skillsRef.current?.querySelectorAll(".skill-node") || []

      nodes.forEach((node, index) => {
        const delay = index * 300
        setTimeout(() => {
          node.classList.add("animate-pulse")
          setTimeout(() => {
            node.classList.remove("animate-pulse")
          }, 1000)
        }, delay)
      })
    }

    animateNodes()
    const interval = setInterval(animateNodes, 5000)

    return () => clearInterval(interval)
  }, [])

  // Draw the earnings growth chart
  useEffect(() => {
    if (!chartRef.current || activeTab !== "analytics") return

    const canvas = chartRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with proper scaling
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    let animationId: number

    const drawChart = () => {
      try {
        const width = rect.width
        const height = rect.height

        ctx.clearRect(0, 0, width, height)

        // Draw grid lines
        ctx.beginPath()
        for (let i = 0; i < width; i += 20) {
          ctx.moveTo(i, 0)
          ctx.lineTo(i, height)
        }
        for (let i = 0; i < height; i += 20) {
          ctx.moveTo(0, i)
          ctx.lineTo(width, height)
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
        ctx.stroke()

        // Generate earnings data - simulating growth over time
        const now = Date.now()
        const points = 60
        const data = Array.from({ length: points }, (_, i) => {
          const x = (width / points) * i

          // Current earnings line (with some fluctuation)
          const baseY = height * 0.8 - (i / points) * height * 0.6
          const currentY = baseY + Math.sin((now + i * 1000) / 2000) * 5

          // Projected earnings with skill advancement (higher, less fluctuation)
          const projectedY = baseY * 0.7 + Math.sin((now + i * 3000) / 6000) * 2

          return { x, currentY, projectedY }
        })

        // Draw area under current earnings line
        ctx.beginPath()
        ctx.moveTo(0, height)
        data.forEach((point) => {
          ctx.lineTo(point.x, point.currentY)
        })
        ctx.lineTo(width, height)
        ctx.closePath()
        ctx.fillStyle = "rgba(76, 110, 245, 0.1)"
        ctx.fill()

        // Draw area under projected earnings line
        ctx.beginPath()
        data.forEach((point) => {
          ctx.lineTo(point.x, point.projectedY)
        })
        ctx.lineTo(width, height)
        ctx.closePath()
        ctx.fillStyle = "rgba(121, 80, 242, 0.1)"
        ctx.fill()

        // Draw current earnings line
        ctx.beginPath()
        data.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.currentY)
          else ctx.lineTo(point.x, point.currentY)
        })
        ctx.strokeStyle = "#4C6EF5"
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw projected earnings line
        ctx.beginPath()
        data.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.projectedY)
          else ctx.lineTo(point.x, point.projectedY)
        })
        ctx.strokeStyle = "#7950F2"
        ctx.lineWidth = 2
        ctx.stroke()

        // Add labels
        ctx.fillStyle = "#4C6EF5"
        ctx.font = "10px Arial"
        ctx.fillText("Current Earnings", 10, 15)

        ctx.fillStyle = "#7950F2"
        ctx.font = "10px Arial"
        ctx.fillText("Projected Earnings", 10, 30)

        // Add data points with hover effect
        data
          .filter((_, i) => i % 10 === 0)
          .forEach((point, i) => {
            ctx.beginPath()
            ctx.arc(point.x, point.currentY, 3, 0, Math.PI * 2)
            ctx.fillStyle = "#4C6EF5"
            ctx.fill()

            ctx.beginPath()
            ctx.arc(point.x, point.projectedY, 3, 0, Math.PI * 2)
            ctx.fillStyle = "#7950F2"
            ctx.fill()
          })

        animationId = requestAnimationFrame(drawChart)
      } catch (error) {
        console.error("Error drawing chart:", error)
      }
    }

    drawChart()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [activeTab, activeSkill])

  const handleGetStarted = () => {
    router.push("/waitlist")
  }

  return (
    <>
      <section
        className="w-full relative overflow-hidden"
        style={{
          backgroundImage: `url(${wave})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-0" />

        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-noise opacity-5 dark:opacity-10 z-0"></div>

        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 z-0" />

        {/* Particle system */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-primary/10 z-0"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}

        {/* 3D perspective container */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url(${wave})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "hue-rotate(240deg)", // Adjust hue for purple
          }}
        />

        <AnimatedTextDivider firstText="Learn. Earn." secondText="Grow Your Business" className="mb-12 text-white" />
        {/* Animated background elements */}
        <div
          className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl opacity-50 animate-pulse"
          style={{ animationDuration: "15s" }}
        ></div>
        <div
          className="absolute -right-64 -bottom-64 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl opacity-50 animate-pulse"
          style={{ animationDuration: "20s" }}
        ></div>

        {/* Futuristic grid lines */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

        <div className="container px-3 md:px-6 relative z-10">
          {/* Changed grid layout to be a flex column on all screen sizes */}
          <div className="flex flex-col gap-6 md:gap-10 lg:gap-12">
            {/* Hero content */}

            {/* Enhanced Skill Accelerator UI - Now below the hero content and more horizontal */}
            <motion.div
              className="flex items-center justify-center w-full"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <div className="relative w-full max-w-full">
                <motion.div
                  className={`relative rounded-xl overflow-hidden bg-gradient-to-br from-purple-100/10 via-white/5 to-purple-50/10 dark:from-purple-900/10 dark:via-black/5 dark:to-purple-800/10 backdrop-blur-md p-3 sm:p-4 md:p-5 shadow-lg detailed-card ${isMobile ? "simple-card" : ""}`}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.4,
                  }}
                  style={{
                    boxShadow: "0 0 40px 5px rgba(147, 51, 234, 0.25)",
                    border: "1px solid rgba(147, 51, 234, 0.2)",
                  }}
                  whileHover={
                    !isMobile
                      ? {
                          boxShadow: "0 0 60px 10px rgba(147, 51, 234, 0.3)",
                          y: -5,
                          transition: { duration: 0.5 },
                        }
                      : {}
                  }
                >
                  {/* Tech pattern overlay */}
                  <div className="tech-pattern absolute inset-0 bg-[radial-gradient(circle_at_10px_10px,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-1"></div>

                  {/* Even background overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/5 via-transparent to-purple-100/5 pointer-events-none"></div>

                  {/* Circuit lines */}
                  <div className="circuit-lines">
                    {circuitLines.map((line, i) => (
                      <div
                        key={`line-${i}`}
                        className="circuit-line"
                        style={{
                          top: `${line.top}%`,
                          left: `${line.left}%`,
                          width: `${line.width}px`,
                          background:
                            "linear-gradient(90deg, rgba(147, 51, 234, 0.05), rgba(147, 51, 234, 0.15), rgba(147, 51, 234, 0.05))",
                        }}
                      ></div>
                    ))}
                    {circuitDots.map((dot, i) => (
                      <div
                        key={`dot-${i}`}
                        className="circuit-dot"
                        style={{
                          top: `${dot.top}%`,
                          left: `${dot.left}%`,
                          backgroundColor: "rgba(147, 51, 234, 0.2)",
                          boxShadow: "0 0 5px rgba(147, 51, 234, 0.2)",
                        }}
                      ></div>
                    ))}
                  </div>

                  {/* Success message toast */}
                  <AnimatePresence>
                    {showSuccessMessage && (
                      <motion.div
                        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/90 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-lg"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Application submitted successfully!
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3 md:space-y-4 relative z-10 lg:grid lg:grid-cols-12 lg:gap-4 lg:space-y-0">
                    <div className="flex items-center justify-between lg:col-span-12">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center mr-3 relative group">
                          <motion.div
                            animate={
                              !isMobile
                                ? {
                                    y: [0, -3, 0],
                                    rotate: [0, 2, -2, 0],
                                  }
                                : {}
                            }
                            transition={{
                              duration: 4,
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: "reverse",
                              ease: "easeInOut",
                            }}
                          >
                            <Rocket className="h-5 w-5 text-white" />
                          </motion.div>
                          <motion.div
                            className="absolute inset-0 rounded-full bg-white/30 scale-0"
                            whileHover={!isMobile ? { scale: 1.5, opacity: [0, 0.5, 0] } : {}}
                            transition={{ duration: 1 }}
                          />
                          {/* Orbital rings around the rocket icon */}
                          <motion.div
                            className="absolute inset-0 rounded-full border border-white/20"
                            animate={
                              !isMobile
                                ? {
                                    scale: [1.1, 1.3, 1.1],
                                    opacity: [0.7, 1, 0.7],
                                  }
                                : {}
                            }
                            transition={{
                              duration: 3,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-full border border-white/10"
                            animate={
                              !isMobile
                                ? {
                                    scale: [1.4, 1.6, 1.4],
                                    opacity: [0.5, 0.8, 0.5],
                                  }
                                : {}
                            }
                            transition={{
                              duration: 3.5,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                              delay: 0.2,
                            }}
                          />
                        </div>
                        <h3 className="text-xl font-bold text-black dark:text-white">
                          Skill Accelerator
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-primary/20 text-primary">
                            <Sparkles className="h-3 w-3 mr-1" /> AI-Powered
                          </span>
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-black/80 dark:text-white/80 lg:col-span-12">
                      The world's first AI-powered gig ecosystem that helps you earn while you learn and grow your
                      freelance career exponentially.
                      <span className="inline-flex items-center ml-2 text-primary">
                        <Lightbulb className="h-3 w-3 mr-1" /> Smart matching technology
                      </span>
                    </p>

                    <div className="flex flex-wrap gap-2 md:flex-nowrap overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide lg:col-span-12">
                      {skills.map((skill, index) => (
                        <motion.button
                          key={index}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center ${
                            activeSkill === index
                              ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/20"
                              : "bg-white/10 dark:bg-black/20 text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/30"
                          }`}
                          onClick={() => setActiveSkill(index)}
                          onMouseEnter={() => setHoverSkill(index)}
                          onMouseLeave={() => setHoverSkill(null)}
                          whileHover={
                            !isMobile
                              ? {
                                  scale: 1.05,
                                  boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.3)",
                                }
                              : {}
                          }
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="mr-1.5">{skill.icon}</span>
                          {skill.name}
                          {hoverSkill === index && (
                            <motion.span
                              className="ml-1.5 text-xs opacity-0"
                              animate={{ opacity: 0.7 }}
                              transition={{ duration: 0.2 }}
                            >
                              {skill.level}
                            </motion.span>
                          )}
                          {activeSkill === index && (
                            <span className="ml-1.5 flex items-center">
                              <motion.div
                                className="h-1.5 w-1.5 rounded-full bg-white"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                              />
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex border-b border-white/10 overflow-x-auto -mx-1 px-1 scrollbar-hide md:justify-start lg:col-span-12">
                      {["overview", "learning", "projects", "forum", "analytics", "milestones"].map((tab) => (
                        <motion.button
                          key={tab}
                          className={`px-2 sm:px-3 py-2 text-xs font-medium capitalize whitespace-nowrap transition-all duration-300 detailed-tab ${
                            activeTab === tab
                              ? "active text-primary relative"
                              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                          }`}
                          onClick={() => setActiveTab(tab)}
                          whileHover={{ y: -1 }}
                          whileTap={{ y: 0 }}
                        >
                          {tab === "overview" && <Compass className="h-3 w-3 inline mr-1" />}
                          {tab === "learning" && <BookOpen className="h-3 w-3 inline mr-1" />}
                          {tab === "projects" && <Layers className="h-3 w-3 inline mr-1" />}
                          {tab === "forum" && <MessageSquare className="h-3 w-3 inline mr-1" />}
                          {tab === "analytics" && <BarChart className="h-3 w-3 inline mr-1" />}
                          {tab === "milestones" && <Trophy className="h-3 w-3 inline mr-1" />}
                          {tab}
                          {activeTab === tab && (
                            <motion.span
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50"
                              layoutId="activeTabLine"
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>

                    <div className="min-h-[280px] md:min-h-[260px] lg:min-h-[240px] lg:col-span-8">
                      {/* Tab Content */}
                      {/* Overview Tab */}
                      {activeTab === "overview" && (
                        <div className="space-y-4">
                          {/* Active Skill Card */}
                          <div
                            className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-purple-400/50 skill-card"
                            style={{ borderLeft: `4px solid ${skills[activeSkill].color}` }}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center">
                                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center mr-2 relative group">
                                    {skills[activeSkill].icon}
                                  </div>
                                  <h4 className="font-bold text-black dark:text-white">{skills[activeSkill].name}</h4>
                                  <div className="ml-2 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                </div>
                                <div className="flex items-center mt-1">
                                  <div className="px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/30 text-xs">
                                    {skills[activeSkill].level}
                                  </div>
                                  <ArrowRight className="h-3 w-3 mx-1 text-white/50" />
                                  <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/50 to-purple-500/50 text-xs text-white">
                                    {skills[activeSkill].nextLevel}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-black/60 dark:text-white/60">Current Earnings</div>
                                <div className="font-bold text-black dark:text-white">
                                  {skills[activeSkill].earnings}
                                </div>
                                <div className="text-xs text-green-500 mt-0.5 flex items-center justify-end">
                                  <TrendingUp className="h-3 w-3 mr-0.5" /> {skills[activeSkill].nextEarnings}
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-black/80 dark:text-white/80 mb-3">
                              {skills[activeSkill].description}
                              <span className="inline-flex items-center ml-2 text-xs text-primary">
                                <Cpu className="h-3 w-3 mr-1" /> AI-optimized learning path
                              </span>
                            </p>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-black/60 dark:text-white/60">
                                  Progress to {skills[activeSkill].nextLevel}
                                </span>
                                <span className="font-medium text-black dark:text-white">{progress}%</span>
                              </div>
                              <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden progress-track">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-purple-500 relative"
                                  style={{ width: `${progress}%` }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{
                                    duration: 1.5,
                                    ease: [0.34, 1.56, 0.64, 1],
                                  }}
                                >
                                  {/* Add animated shine effect */}
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    animate={{
                                      x: ["-100%", "100%"],
                                    }}
                                    transition={{
                                      repeat: Number.POSITIVE_INFINITY,
                                      repeatType: "loop",
                                      duration: 2,
                                      ease: "easeInOut",
                                      delay: 0.5,
                                    }}
                                  />
                                </motion.div>
                                {/* Progress markers */}
                                <div className="absolute top-0 left-1/4 h-full w-0.5 bg-white/10"></div>
                                <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white/10"></div>
                                <div className="absolute top-0 left-3/4 h-full w-0.5 bg-white/10"></div>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                              <div className="bg-white/5 dark:bg-black/10 rounded-md p-2 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                                <div className="text-xs text-black/60 dark:text-white/60">Mentors</div>
                                <div className="font-bold text-black dark:text-white">
                                  {skills[activeSkill].mentors}
                                </div>
                              </div>
                              <div className="bg-white/5 dark:bg-black/10 rounded-md p-2 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
                                <div className="text-xs text-black/60 dark:text-white/60">Projects</div>
                                <div className="font-bold text-black dark:text-white">
                                  {skills[activeSkill].projects}
                                </div>
                              </div>
                              <div className="bg-white/5 dark:bg-black/10 rounded-md p-2 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent"></div>
                                <div className="text-xs text-black/60 dark:text-white/60">Rating</div>
                                <div className="font-bold text-black dark:text-white flex items-center justify-center">
                                  4.8 <Star className="h-4 w-4 ml-0.5 text-yellow-400 fill-yellow-400" />
                                </div>
                              </div>
                              <div className="bg-white/5 dark:bg-black/10 rounded-md p-2 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
                                <div className="text-xs text-black/60 dark:text-white/60">Clients</div>
                                <div className="font-bold text-black dark:text-white flex items-center justify-center">
                                  {skills[activeSkill].stats.repeatClients}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Testimonial */}
                          <div className="bg-white/5 dark:bg-black/10 rounded-lg p-3 border border-white/10 relative overflow-hidden">
                            {/* Quote marks */}
                            <div className="absolute top-2 left-2 text-3xl text-primary/10 font-serif">"</div>
                            <div className="absolute bottom-2 right-2 text-3xl text-primary/10 font-serif">"</div>

                            <div className="flex items-start">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center mr-3 text-xs font-bold text-primary">
                                {skills[activeSkill].testimonial.author.split(" ")[0][0]}
                                {skills[activeSkill].testimonial.author.split(" ")[1][0]}
                              </div>
                              <div>
                                <div className="flex items-center mb-1">
                                  <div className="text-xs font-medium text-black dark:text-white mr-2">
                                    {skills[activeSkill].testimonial.author}
                                  </div>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${i < skills[activeSkill].testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-xs text-black/80 dark:text-white/80 italic">
                                  "{skills[activeSkill].testimonial.text}"
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Learning Tab */}
                      {activeTab === "learning" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-black dark:text-white">Learning Path</h4>
                            <div className="text-xs text-primary">
                              {skills[activeSkill].learningPath.filter((item) => item.status === "completed").length} /{" "}
                              {skills[activeSkill].learningPath.length} Completed
                            </div>
                          </div>

                          <div className="space-y-2">
                            {skills[activeSkill].learningPath.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center p-2 rounded-lg bg-white/5 dark:bg-black/10 border border-white/10 hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
                              >
                                {/* Background pattern */}
                                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_10px_10px,rgba(var(--primary-rgb),0.4)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

                                <div
                                  className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                                    item.status === "completed"
                                      ? "bg-green-500/20"
                                      : item.status === "in-progress"
                                        ? "bg-primary/20"
                                        : "bg-white/10"
                                  }`}
                                >
                                  {item.status === "completed" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : item.status === "in-progress" ? (
                                    <Clock className="h-4 w-4 text-primary" />
                                  ) : (
                                    <BookOpen className="h-4 w-4 text-white/50" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-black dark:text-white">{item.name}</div>
                                  <div className="text-xs text-black/60 dark:text-white/60">
                                    {item.duration} •{" "}
                                    {item.status === "completed"
                                      ? "Completed"
                                      : item.status === "in-progress"
                                        ? "In Progress"
                                        : "Upcoming"}
                                  </div>
                                </div>
                                {item.status !== "completed" && (
                                  <EnhancedButton variant="outline" size="sm" className="h-8 text-xs bg-white/5">
                                    {item.status === "in-progress" ? "Continue" : "Start"}
                                  </EnhancedButton>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-black dark:text-white mb-2">Skill Breakdown</h4>
                            <div className="space-y-2">
                              {skills[activeSkill].skills.map((skill, index) => (
                                <div key={index} className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-black dark:text-white">{skill.name}</span>
                                    <span className="text-black/60 dark:text-white/60">{skill.level}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden progress-track">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500"
                                      style={{ width: `${skill.level}%` }}
                                    ></div>
                                    {/* Skill level markers */}
                                    <div className="absolute top-0 left-1/4 h-full w-0.5 bg-white/10"></div>
                                    <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white/10"></div>
                                    <div className="absolute top-0 left-3/4 h-full w-0.5 bg-white/10"></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Projects Tab */}
                      {activeTab === "projects" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-black dark:text-white">Available Projects</h4>
                            <div className="text-xs text-primary">Earn while you learn</div>
                          </div>

                          <div className="space-y-2">
                            {skills[activeSkill].skillProjects.map((project, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg bg-white/5 dark:bg-black/10 border border-white/10 hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
                              >
                                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_10px_10px,rgba(var(--primary-rgb),0.4)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="text-sm font-medium text-black dark:text-white">{project.name}</div>
                                    <div className="flex items-center mt-1">
                                      <div className="px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/30 text-xs">
                                        {project.difficulty}
                                      </div>
                                      <div className="text-xs text-black/60 dark:text-white/60">
                                        Est. earnings: {project.earnings}
                                      </div>
                                    </div>
                                  </div>
                                  <EnhancedButton
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs bg-white/5"
                                    onClick={() => handleApplyForProject(project.name)}
                                  >
                                    {project.status === "in-progress" ? "Continue" : "Apply"}
                                  </EnhancedButton>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <div className="flex items-start">
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 text-primary">
                                <Lightbulb className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-black dark:text-white">
                                  AI-Matched Projects
                                </h4>
                                <p className="text-xs text-black/80 dark:text-white/80">
                                  Projects are matched to your skill level to maximize learning and earning potential.
                                </p>
                              </div>
                            </div>
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
                            <h4 className="text-xs font-semibold text-black dark:text-white">Forum</h4>
                            <p className="text-xs text-black/60 dark:text-white/60">Community support</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5">
                            <Users className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-black dark:text-white">Mentor Network</h4>
                            <p className="text-xs text-black/60 dark:text-white/60">Expert feedback</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5">
                            <Target className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-black dark:text-white">Skill Projects</h4>
                            <p className="text-xs text-black/60 dark:text-white/60">Learn while earning</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5">
                            <Trophy className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-black dark:text-white">Skill Certification</h4>
                            <p className="text-xs text-black/60 dark:text-white/60">Verified credentials</p>
                          </div>
                        </div>
                      </div>

                      <EnhancedButton variant="gradient" size="sm" className="w-full" onClick={handleHireNow}>
                        <Zap className="mr-2 h-4 w-4" />
                        Accelerate Your Skills
                      </EnhancedButton>
                    </div>
                  </div>
                  {/* Futuristic decorative elements */}
                  <div className="absolute top-1/4 right-6 w-2 h-2 rounded-full bg-primary/50 animate-pulse"></div>
                  <div
                    className="absolute bottom-1/3 left-8 w-1.5 h-1.5 rounded-full bg-purple-500/50 animate-ping"
                    style={{ animationDuration: "3s" }}
                  ></div>
                </motion.div>
              </div>
            </motion.div>

            {/* Find the perfect service section - enhanced with matching background */}
            <section className="w-full py-16 md:py-24 lg-py-32 bg-muted/50 relative">
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
                  <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    Popular Categories
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl max-w-[800px]">
                    Find the perfect service for your needs
                  </h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                    Browse through thousands of services across various categories
                  </p>

                  <div className="w-full max-w-md mx-auto mt-8 relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="search"
                        placeholder="Search categories or services..."
                        className="w-full rounded-full border border-input bg-background/80 backdrop-blur-sm px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>

                  {/* Category tabs */}
                  <div className="flex flex-wrap justify-center gap-2 mt-8">
                    {["all", "trending", "popular", "new"].map((tab) => (
                      <motion.button
                        key={tab}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          activeTab === tab
                            ? "bg-primary text-primary-foreground"
                            : "bg-background/80 backdrop-blur-sm hover:bg-background"
                        }`}
                        onClick={() => setActiveTab(tab)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {tab === "all" && "All Categories"}
                        {tab === "trending" && (
                          <span className="flex items-center">
                            <TrendingUp className="mr-1 h-3 w-3" /> Trending
                          </span>
                        )}
                        {tab === "popular" && (
                          <span className="flex items-center">
                            <Star className="mr-1 h-3 w-3" /> Popular
                          </span>
                        )}
                        {tab === "new" && (
                          <span className="flex items-center">
                            <Sparkles className="mr-1 h-3 w-3" /> New
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Featured categories */}
                <motion.div
                  className="mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
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
                      <EnhancedCategoryCard icon={Hammer} name="Mounting" count={1680} index={0} />
                    </div>
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center -mt-3">
                        <span className="bg-purple-200 text-purple-700 text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          Coming Soon
                        </span>
                      </div>
                      <EnhancedCategoryCard icon={Broom} name="Cleaning" count={1450} index={1} />
                    </div>
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center -mt-3">
                        <span className="bg-purple-200 text-purple-700 text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          Coming Soon
                        </span>
                      </div>
                      <EnhancedCategoryCard icon={Paintbrush} name="Painting" count={1120} index={2} />
                    </div>
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center -mt-3">
                        <span className="bg-purple-200 text-purple-700 text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          Coming Soon
                        </span>
                      </div>
                      <EnhancedCategoryCard icon={ScrewDriver} name="Furniture Assembly" count={1240} index={3} />
                    </div>
                  </div>
                </motion.div>

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
                        index={index + 4} // Offset for animation delay
                      />
                    </div>
                  ))}
                </div>

                <motion.div
                  className="flex justify-center mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <EnhancedButton
                    variant="gradient"
                    size="lg"
                    className="font-medium"
                    onClick={() => router.push("/explore")}
                  >
                    Explore All Categories
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </EnhancedButton>
                </motion.div>
              </div>
            </section>
          </div>
        </div>
      </section>
      <SkillAcceleratorSignup isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />
    </>
  )
}

const handleHireNow = () => {
  const router = useRouter()
  router.push("/stripe-checkout")
}

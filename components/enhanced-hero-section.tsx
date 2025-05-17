"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Trophy,
  Rocket,
  Star,
  BookOpen,
  CheckCircle,
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
  WrenchIcon as ScrewDriver,
  Hammer,
  Paintbrush,
} from "lucide-react"
import { AnimatedTextDivider } from "@/components/animated-text-divider"
import { useAuth } from "@/context/auth-context"
import { useMobile } from "@/hooks/use-mobile"
import { FeatureBadge } from "@/components/ui/feature-badge"

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
    learningPath: [
      { name: "Wall Types & Materials", duration: "4h 30m", status: "completed" },
      { name: "Mounting Hardware Selection", duration: "3h 15m", status: "completed" },
      { name: "TV Mounting Techniques", duration: "5h 0m", status: "in-progress" },
      { name: "Advanced Mounting Solutions", duration: "4h 45m", status: "upcoming" },
    ],
    skills: [
      { name: "Stud Finding", level: 75 },
      { name: "Hardware Selection", level: 60 },
      { name: "Level Mounting", level: 50 },
      { name: "Cable Management", level: 80 },
    ],
    skillProjects: [
      {
        name: "Mount a 65-inch TV on drywall",
        difficulty: "Intermediate",
        earnings: "$500",
        status: "completed",
      },
      {
        name: "Install floating shelves in a living room",
        difficulty: "Advanced",
        earnings: "$800",
        status: "in-progress",
      },
      {
        name: "Mount a projector and screen in home theater",
        difficulty: "Intermediate",
        earnings: "$600",
        status: "available",
      },
    ],
    testimonial: {
      author: "Jane Smith",
      rating: 5,
      text: "The Mounting skill accelerator helped me start my own TV mounting business. The techniques I learned were professional-grade and the projects gave me real-world experience.",
    },
    milestones: [
      { name: "Complete Wall Types & Materials", progress: 100, total: 100 },
      { name: "Complete Mounting Hardware Selection", progress: 100, total: 100 },
      { name: "Complete TV Mounting Techniques", progress: 75, total: 100 },
      { name: "Complete Advanced Mounting Solutions", progress: 0, total: 100 },
    ],
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
    learningPath: [
      { name: "Surface Preparation", duration: "3h 0m", status: "completed" },
      { name: "Paint Types & Selection", duration: "4h 0m", status: "in-progress" },
      { name: "Brush & Roller Techniques", duration: "6h 0m", status: "upcoming" },
      { name: "Advanced Finishes & Effects", duration: "5h 30m", status: "upcoming" },
    ],
    skills: [
      { name: "Surface Prep", level: 80 },
      { name: "Color Matching", level: 70 },
      { name: "Brush Technique", level: 40 },
      { name: "Spray Painting", level: 20 },
    ],
    skillProjects: [
      { name: "Paint a bedroom with accent wall", difficulty: "Beginner", earnings: "$300", status: "completed" },
      {
        name: "Refinish kitchen cabinets",
        difficulty: "Intermediate",
        earnings: "$500",
        status: "available",
      },
      { name: "Paint exterior of small house", difficulty: "Advanced", earnings: "$700", status: "available" },
    ],
    testimonial: {
      author: "John Davis",
      rating: 4,
      text: "The Painting skill accelerator gave me the foundation I needed to start taking on painting jobs. The instructors were knowledgeable and the projects were practical.",
    },
    milestones: [
      { name: "Complete Surface Preparation", progress: 100, total: 100 },
      { name: "Complete Paint Types & Selection", progress: 50, total: 100 },
      { name: "Complete Brush & Roller Techniques", progress: 0, total: 100 },
      { name: "Complete Advanced Finishes & Effects", progress: 0, total: 100 },
    ],
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
    learningPath: [
      { name: "Basic Assembly Tools", duration: "4h 0m", status: "completed" },
      { name: "Reading Assembly Instructions", duration: "3h 30m", status: "completed" },
      { name: "Complex Furniture Types", duration: "5h 0m", status: "completed" },
      { name: "Custom Modifications", duration: "4h 30m", status: "in-progress" },
    ],
    skills: [
      { name: "Tool Proficiency", level: 85 },
      { name: "Instruction Reading", level: 75 },
      { name: "Problem Solving", level: 65 },
      { name: "Finishing Touches", level: 55 },
    ],
    skillProjects: [
      {
        name: "Assemble a complete bedroom set",
        difficulty: "Intermediate",
        earnings: "$600",
        status: "completed",
      },
      {
        name: "Build a complex entertainment center",
        difficulty: "Advanced",
        earnings: "$900",
        status: "available",
      },
      {
        name: "Assemble office furniture for small business",
        difficulty: "Intermediate",
        earnings: "$700",
        status: "available",
      },
    ],
    testimonial: {
      author: "Emily Wilson",
      rating: 5,
      text: "The Furniture Assembly skill accelerator helped me grow my assembly business exponentially. The techniques I learned made me much more efficient and the support from mentors was invaluable.",
    },
    milestones: [
      { name: "Complete Basic Assembly Tools", progress: 100, total: 100 },
      { name: "Complete Reading Assembly Instructions", progress: 100, total: 100 },
      { name: "Complete Complex Furniture Types", progress: 100, total: 100 },
      { name: "Complete Custom Modifications", progress: 60, total: 100 },
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

  const [circuitLines, setCircuitLines] = useState<
    Array<{
      top: number
      width: number
      left: number
    }>
  >([])

  const [circuitDots, setCircuitDots] = useState<
    Array<{
      top: number
      left: number
    }>
  >([])

  const [glowDots, setGlowDots] = useState<
    Array<{
      top: number
      left: number
      delay: number
    }>
  >([])

  const [dataFlows, setDataFlows] = useState<
    Array<{
      top: number
      left: number
      delay: number
    }>
  >([])

  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      duration: number
    }>
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
  const [notificationMessage, setNotificationMessage] = useState("")
  const [showNotification, setShowNotification] = useState(false)
  const [timeRange, setTimeRange] = useState("1m")

  // Define handleHireNow function inside the component
  const handleHireNow = () => {
    router.push("/stripe-checkout")
  }

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

  // Removed auto-rotation of skills as requested
  useEffect(() => {
    // Skills will now stay on the selected skill without auto-rotating
  }, [])

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
          ctx.lineTo(width, i)
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
        data.forEach((point, i) => {
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
      <section className="w-full relative overflow-hidden bg-gradient-to-br from-white via-lavender-100/30 to-white">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-lavender-50 to-white/90 z-0" />

        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-noise opacity-5 dark:opacity-10 z-0"></div>

        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-lavender-200/20 to-white/90 z-0" />

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
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br from-purple-500/20 to-primary/20"></div>

        <AnimatedTextDivider firstText="Learn. Earn." secondText="Grow Your Business" className="mb-12 text-gray-800" />
        {/* Animated background elements */}
        <div
          className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl opacity-50
animate-pulse"
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
                  className={`relative rounded-xl overflow-hidden bg-gradient-to-br from-white via-lavender-50/50 to-white backdrop-blur-md p-3 sm:p-4 md:p-6 shadow-xl border border-lavender-200/50 detailed-card hover:shadow-lavender-300/30 transition-all duration-300 ${isMobile ? "simple-card" : ""}`}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.4,
                  }}
                  style={{
                    border: "1px solid rgba(147, 51, 234, 0.2)",
                    boxShadow: "0 10px 30px -5px rgba(147, 51, 234, 0.1), 0 0 20px -10px rgba(147, 51, 234, 0.2)",
                  }}
                >
                  {/* Improved tech pattern overlay with subtle animation */}
                  <motion.div
                    className="tech-pattern absolute inset-0 bg-[radial-gradient(circle_at_10px_10px,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-1"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  />

                  {/* Enhanced background overlay with gradient animation */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-50/10 via-transparent to-purple-100/10 pointer-events-none"
                    animate={{
                      background: [
                        "radial-gradient(circle at 20% 30%, rgba(233, 213, 255, 0.1), transparent 70%)",
                        "radial-gradient(circle at 70% 60%, rgba(233, 213, 255, 0.1), transparent 70%)",
                        "radial-gradient(circle at 20% 30%, rgba(233, 213, 255, 0.1), transparent 70%)",
                      ],
                    }}
                    transition={{
                      duration: 15,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  />

                  {/* Circuit lines with improved styling */}
                  <div className="circuit-lines">
                    {circuitLines.map((line, i) => (
                      <motion.div
                        key={`line-${i}`}
                        className="circuit-line"
                        style={{
                          top: `${line.top}%`,
                          left: `${line.left}%`,
                          width: `${line.width}px`,
                          background:
                            "linear-gradient(90deg, rgba(147, 51, 234, 0.05), rgba(147, 51, 234, 0.15), rgba(147, 51, 234, 0.05))",
                        }}
                        animate={{
                          opacity: [0.3, 0.7, 0.3],
                          width: [line.width, line.width + 20, line.width],
                        }}
                        transition={{
                          duration: 5 + (i % 3),
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                          ease: "easeInOut",
                          delay: i * 0.5,
                        }}
                      />
                    ))}
                    {circuitDots.map((dot, i) => (
                      <motion.div
                        key={`dot-${i}`}
                        className="circuit-dot"
                        style={{
                          top: `${dot.top}%`,
                          left: `${dot.left}%`,
                          backgroundColor: "rgba(147, 51, 234, 0.2)",
                          boxShadow: "0 0 5px rgba(147, 51, 234, 0.2)",
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 3 + (i % 2),
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                          ease: "easeInOut",
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </div>

                  {/* Success message toast with improved animation */}
                  <AnimatePresence>
                    {showSuccessMessage && (
                      <motion.div
                        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-500/90 to-emerald-500/90 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-lg shadow-green-500/20"
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
                      {skills.map((skill, index) => (
                        <motion.button
                          key={index}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center ${
                            activeSkill === index
                              ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/20"
                              : "bg-white/10 dark:bg-black/20 text-gray-800 hover:bg-white/20 dark:hover:bg-black/30"
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
                      {["overview", "learning", "projects", "analytics", "milestones"].map((tab) => (
                        <motion.button
                          key={tab}
                          className={`px-2 sm:px-3 py-2 text-xs font-medium capitalize whitespace-nowrap transition-all duration-300 detailed-tab ${
                            activeTab === tab ? "active text-primary relative" : "text-gray-500 hover:text-gray-800"
                          }`}
                          onClick={() => setActiveTab(tab)}
                          whileHover={{ y: -1 }}
                          whileTap={{ y: 0 }}
                        >
                          {tab === "overview" && <Compass className="h-3 w-3 inline mr-1" />}
                          {tab === "learning" && <BookOpen className="h-3 w-3 inline mr-1" />}
                          {tab === "projects" && <Layers className="h-3 w-3 inline mr-1" />}
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
                          {/* Active Skill Card - Enhanced with better UI/UX */}
                          <div
                            className="bg-gradient-to-br from-white via-lavender-50/50 to-white backdrop-blur-sm rounded-lg p-5 border border-lavender-300/50 skill-card shadow-lg relative overflow-hidden group transition-all duration-300 hover:shadow-lavender-500/20 hover:border-lavender-400/50"
                            style={{ borderLeft: `4px solid ${skills[activeSkill].color}` }}
                          >
                            {/* Animated background elements */}
                            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 blur-3xl group-hover:opacity-70 transition-opacity duration-500 opacity-50"></div>
                            <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-gradient-to-tr from-primary/10 to-purple-500/20 blur-3xl group-hover:opacity-70 transition-opacity duration-500 opacity-40"></div>

                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 relative z-10">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mr-3 relative group shadow-md shadow-primary/20">
                                    <motion.div
                                      animate={{
                                        scale: [1, 1.1, 1],
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Number.POSITIVE_INFINITY,
                                        repeatType: "reverse",
                                      }}
                                    >
                                      {skills[activeSkill].icon}
                                    </motion.div>
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/50 to-purple-500/50 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-bold text-gray-800 flex items-center">
                                      {skills[activeSkill].name}
                                      <div className="ml-2 h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    </h4>
                                    <div className="flex items-center mt-1 gap-2">
                                      <div className="px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/30 text-xs font-medium">
                                        {skills[activeSkill].level}
                                      </div>
                                      <ArrowRight className="h-3 w-3 text-white/50" />
                                      <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/50 to-purple-500/50 text-xs text-white font-medium">
                                        {skills[activeSkill].nextLevel}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                                  {skills[activeSkill].description}
                                  <span className="inline-flex items-center ml-2 text-xs text-primary font-medium">
                                    <Cpu className="h-3 w-3 mr-1" /> AI-optimized learning path
                                  </span>
                                </p>
                              </div>

                              <div className="bg-white/10 dark:bg-black/20 rounded-lg p-3 shadow-inner min-w-[140px]">
                                <div className="text-xs text-gray-500">Current Earnings</div>
                                <div className="font-bold text-xl text-gray-800 mt-1">
                                  {skills[activeSkill].earnings}
                                </div>
                                <div className="text-xs text-green-500 mt-1 flex items-center">
                                  <TrendingUp className="h-3 w-3 mr-0.5" />
                                  <span className="font-medium">{skills[activeSkill].nextEarnings}</span>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar - Enhanced */}
                            <div className="mb-5">
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-gray-500 font-medium">
                                  Progress to {skills[activeSkill].nextLevel}
                                </span>
                                <span className="font-semibold text-primary">{progress}%</span>
                              </div>
                              <div className="h-3 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden progress-track shadow-inner relative">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-primary via-purple-500/80 to-primary relative"
                                  style={{ width: `${progress}%` }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{
                                    duration: 1.5,
                                    ease: [0.34, 1.56, 0.64, 1],
                                  }}
                                >
                                  {/* Animated shine effect */}
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                    animate={{
                                      x: ["-100%", "100%"],
                                    }}
                                    transition={{
                                      repeat: Number.POSITIVE_INFINITY,
                                      repeatType: "loop",
                                      duration: 2,
                                      ease: "easeInOut",
                                    }}
                                  />
                                </motion.div>

                                {/* Progress markers with tooltips */}
                                {[25, 50, 75].map((marker) => (
                                  <div
                                    key={marker}
                                    className={`absolute top-0 bottom-0 w-0.5 ${
                                      progress >= marker ? "bg-white/30" : "bg-white/10"
                                    }`}
                                    style={{ left: `${marker}%` }}
                                  >
                                    <div
                                      className={`absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] ${
                                        progress >= marker
                                          ? "bg-primary text-white"
                                          : "bg-white/10 dark:bg-black/30 text-gray-500"
                                      } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                                    >
                                      {marker}%
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Stats - Enhanced with better layout and hover effects */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                { label: "Mentors", value: skills[activeSkill].mentors, icon: Users, color: "primary" },
                                {
                                  label: "Projects",
                                  value: skills[activeSkill].projects,
                                  icon: Layers,
                                  color: "purple-500",
                                },
                                { label: "Rating", value: "4.8", icon: Star, color: "yellow-400", showStar: true },
                                {
                                  label: "Clients",
                                  value: skills[activeSkill].stats.repeatClients,
                                  icon: Users,
                                  color: "green-500",
                                },
                              ].map((stat, i) => (
                                <motion.div
                                  key={i}
                                  className={`bg-white rounded-lg p-3 relative overflow-hidden hover:bg-lavender-50 transition-colors duration-200 shadow-sm border border-lavender-100 group/stat`}
                                  whileHover={{ y: -2 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  <div
                                    className={`absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-${stat.color}/10 to-transparent rounded-bl-full`}
                                  ></div>
                                  <div className="absolute -bottom-2 -left-2 h-12 w-12 bg-gradient-to-tr from-${stat.color}/5 to-transparent rounded-tr-full"></div>
                                  <div className="flex flex-col items-center text-center">
                                    <div
                                      className={`text-${stat.color} mb-1 opacity-80 group-hover/stat:opacity-100 transition-opacity`}
                                    >
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
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Testimonial - Enhanced */}
                          <motion.div
                            className="bg-white rounded-lg p-4 border border-lavender-200/50 relative overflow-hidden group hover:border-primary/30 transition-all duration-300 shadow-sm"
                            whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                          >
                            {/* Quote marks */}
                            <div className="absolute top-2 left-2 text-4xl text-primary/10 font-serif">"</div>
                            <div className="absolute bottom-2 right-2 text-4xl text-primary/10 font-serif">"</div>

                            {/* Background pattern */}
                            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_10px_10px,rgba(var(--primary-rgb),0.4)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-primary shadow-inner relative">
                                {skills[activeSkill].testimonial.author.split(" ")[0][0]}
                                {skills[activeSkill].testimonial.author.split(" ")[1][0]}
                                <motion.div
                                  className="absolute inset-0 rounded-full border border-primary/30"
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <div className="text-sm font-medium text-gray-800 mr-2">
                                    {skills[activeSkill].testimonial.author}
                                  </div>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1, duration: 0.3 }}
                                      >
                                        <Star
                                          className={`h-3.5 w-3.5 ${i < skills[activeSkill].testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                        />
                                      </motion.div>
                                    ))}
                                  </div>
                                  <div className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                    Verified Client
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 italic leading-relaxed">
                                  "{skills[activeSkill].testimonial.text}"
                                </p>
                                <div className="flex items-center justify-end mt-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" /> 2 months ago
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          {/* Quick Actions - New section */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <motion.button
                              className="bg-white hover:bg-lavender-50 rounded-lg p-3 flex flex-col items-center text-center transition-colors duration-200 border border-lavender-100 shadow-sm"
                              whileHover={{ y: -2 }}
                              whileTap={{ y: 0 }}
                            >
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-xs font-medium text-gray-800">Continue Learning</div>
                              <div className="text-[10px] text-gray-500 mt-1">4 lessons left</div>
                            </motion.button>

                            <motion.button
                              className="bg-white hover:bg-lavender-50 rounded-lg p-3 flex flex-col items-center text-center transition-colors duration-200 border border-lavender-100 shadow-sm"
                              whileHover={{ y: -2 }}
                              whileTap={{ y: 0 }}
                            >
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <Layers className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-xs font-medium text-gray-800">Find Projects</div>
                              <div className="text-[10px] text-gray-500 mt-1">12 available</div>
                            </motion.button>

                            <motion.button
                              className="bg-white hover:bg-lavender-50 rounded-lg p-3 flex flex-col items-center text-center transition-colors duration-200 border border-lavender-100 shadow-sm"
                              whileHover={{ y: -2 }}
                              whileTap={{ y: 0 }}
                            >
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-xs font-medium text-gray-800">Community</div>
                              <div className="text-[10px] text-gray-500 mt-1">3 new topics</div>
                            </motion.button>
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
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

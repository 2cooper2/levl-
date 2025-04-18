"use client"

import type React from "react"

import { EnhancedButton } from "@/components/ui/enhanced-button"
import { SkillAcceleratorSignup } from "@/components/skill-accelerator-signup"
import {
  ArrowRight,
  Zap,
  Trophy,
  Users,
  Target,
  Rocket,
  Star,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Truck,
  Paintbrush,
  Hammer,
  Gem,
  MessageSquare,
  PenToolIcon as Tool,
  Sparkles,
  Lightbulb,
  Compass,
  BarChart,
  Layers,
  Cpu,
  ThumbsUp,
  Reply,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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

// Custom founder icon component
const FounderIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Professional person silhouette */}
    <path d="M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
    <path d="M12 11c-3.5 0-7 1.5-7 5v3h14v-3c0-3.5-3.5-5-7-5z" />

    {/* Business suit/tie */}
    <path d="M12 11v9" />
    <path d="M10.5 13L12 15l1.5-2" />

    {/* Leadership crown */}
    <path d="M9 4l1 1h4l1-1" />

    {/* Growth chart */}
    <path d="M18 8l1.5-1.5" />
    <path d="M19.5 6.5v1.5h-1.5" />
  </svg>
)

const forumTopics = [
  {
    id: 1,
    title: "Best way to find studs without a stud finder?",
    author: "MountingPro",
    replies: 12,
    likes: 8,
    lastActive: "2 hours ago",
    tags: ["mounting", "beginner", "tools"],
    preview: "I'm trying to mount a TV but don't have a stud finder. Any reliable methods to locate studs?",
    responses: [
      {
        author: "HandyHelper",
        content: "Try the knock test - tap along the wall and listen for a less hollow sound. That's usually a stud!",
        likes: 5,
        time: "1 hour ago",
      },
      {
        author: "MountMaster",
        content:
          "Look for outlets - they're typically attached to studs. Measure 16 inches from there for the next one.",
        likes: 3,
        time: "45 min ago",
      },
    ],
  },
  {
    id: 2,
    title: "TV mounting height recommendations?",
    author: "DesignSavvy",
    replies: 8,
    likes: 15,
    lastActive: "1 day ago",
    tags: ["mounting", "tv", "ergonomics"],
    preview: "What's the ideal height to mount a TV in a living room? Is eye level when seated the best approach?",
    responses: [
      {
        author: "ErgoExpert",
        content:
          "Eye level when seated is ideal. For most living rooms, that's about 42-48 inches from the floor to the center of the TV.",
        likes: 7,
        time: "20 hours ago",
      },
    ],
  },
  {
    id: 3,
    title: "Cable management tips for wall-mounted TVs",
    author: "CleanSetup",
    replies: 6,
    likes: 10,
    lastActive: "3 days ago",
    tags: ["mounting", "cables", "organization"],
    preview: "Just mounted my TV but the cables look messy. Any tips for clean cable management?",
    responses: [],
  },
]

// Custom function to format the last active time
const formatLastActive = (lastActive: string): string => {
  // Implement your formatting logic here
  return lastActive
}

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

                {topic.responses.length > 0 ? (
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

  // Updated skills data with home service categories
  const skills = [
    {
      name: "Mounting",
      level: "Beginner",
      nextLevel: "Intermediate",
      progress: 68,
      mentors: 24,
      projects: 156,
      earnings: "$25-45/hr",
      nextEarnings: "$50-75/hr",
      color: "#4C6EF5",
      icon: <Tool className="h-4 w-4" />,
      description: "Learn to mount TVs, shelves, artwork, and other items securely on walls",
      learningPath: [
        { name: "Wall Types & Materials", status: "completed", duration: "2 weeks" },
        { name: "Mounting Hardware", status: "completed", duration: "3 weeks" },
        { name: "TV Mounting", status: "in-progress", duration: "2 weeks" },
        { name: "Heavy Item Mounting", status: "upcoming", duration: "3 weeks" },
        { name: "Artwork & Decor", status: "upcoming", duration: "2 weeks" },
      ],
      skills: [
        { name: "Stud Finding", level: 75 },
        { name: "Drill Operation", level: 60 },
        { name: "Level Usage", level: 80 },
        { name: "Cable Management", level: 65 },
        { name: "Weight Distribution", level: 70 },
      ],
      skillProjects: [
        { name: "TV Wall Mount Installation", difficulty: "Beginner", earnings: "$60", status: "available" },
        { name: "Floating Shelf Installation", difficulty: "Intermediate", earnings: "$45", status: "available" },
        { name: "Gallery Wall Setup", difficulty: "Beginner", earnings: "$80", status: "in-progress" },
      ],
      milestones: [
        { name: "Complete 5 TV Mounts", progress: 3, total: 5, reward: "Intermediate Badge" },
        { name: "Earn 5 Client Reviews", progress: 4, total: 5, reward: "$50 Bonus" },
        { name: "Complete Hardware Course", progress: 80, total: 100, reward: "Certificate" },
      ],
      stats: {
        avgCompletionTime: "45 mins",
        clientSatisfaction: "4.8/5",
        repeatClients: "65%",
        topEarners: "$95/hr",
      },
      testimonial: {
        text: "The mounting skills I learned helped me earn $1,200 in my first month!",
        author: "Michael T.",
        rating: 5,
      },
    },
    {
      name: "Moving",
      level: "Intermediate",
      nextLevel: "Advanced",
      progress: 42,
      mentors: 36,
      projects: 210,
      earnings: "$30-50/hr",
      nextEarnings: "$55-85/hr",
      color: "#7950F2",
      icon: <Truck className="h-4 w-4" />,
      description: "Master the techniques for safely moving furniture, boxes, and other items",
      learningPath: [
        { name: "Lifting Techniques", status: "completed", duration: "4 weeks" },
        { name: "Furniture Protection", status: "completed", duration: "3 weeks" },
        { name: "Space Planning", status: "in-progress", duration: "2 weeks" },
        { name: "Vehicle Loading", status: "upcoming", duration: "2 weeks" },
        { name: "Team Coordination", status: "upcoming", duration: "3 weeks" },
      ],
      skills: [
        { name: "Heavy Lifting", level: 90 },
        { name: "Furniture Disassembly", level: 75 },
        { name: "Space Optimization", level: 65 },
        { name: "Fragile Item Handling", level: 50 },
        { name: "Time Management", level: 80 },
      ],
      skillProjects: [
        { name: "Studio Apartment Move", difficulty: "Intermediate", earnings: "$120", status: "available" },
        { name: "Furniture Rearrangement", difficulty: "Beginner", earnings: "$80", status: "available" },
        { name: "Office Relocation Help", difficulty: "Intermediate", earnings: "$150", status: "in-progress" },
      ],
      milestones: [
        { name: "Complete 3 Full Moves", progress: 2, total: 3, reward: "Advanced Badge" },
        { name: "Zero Damage Reports", progress: 1, total: 3, reward: "Featured Profile" },
        { name: "Complete Safety Course", progress: 60, total: 100, reward: "Certificate" },
      ],
      stats: {
        avgCompletionTime: "3.5 hours",
        clientSatisfaction: "4.7/5",
        repeatClients: "40%",
        topEarners: "$110/hr",
      },
      testimonial: {
        text: "I've turned weekend moving gigs into a reliable income stream that pays better than my old job!",
        author: "Sarah K.",
        rating: 5,
      },
    },
    {
      name: "Painting",
      level: "Advanced",
      nextLevel: "Expert",
      progress: 89,
      mentors: 18,
      projects: 94,
      earnings: "$35-60/hr",
      nextEarnings: "$65-100/hr",
      color: "#F59F0B",
      icon: <Paintbrush className="h-4 w-4" />,
      description: "Learn professional painting techniques for walls, trim, furniture and more",
      learningPath: [
        { name: "Surface Preparation", status: "completed", duration: "4 weeks" },
        { name: "Paint Selection", status: "completed", duration: "3 weeks" },
        { name: "Brush & Roller Techniques", status: "completed", duration: "3 weeks" },
        { name: "Trim & Detail Work", status: "in-progress", duration: "2 weeks" },
        { name: "Special Finishes", status: "upcoming", duration: "3 weeks" },
      ],
      skills: [
        { name: "Wall Painting", level: 90 },
        { name: "Trim Work", level: 85 },
        { name: "Color Matching", level: 80 },
        { name: "Surface Prep", level: 75 },
        { name: "Spray Painting", level: 95 },
      ],
      skillProjects: [
        { name: "Bedroom Repaint", difficulty: "Advanced", earnings: "$200", status: "available" },
        { name: "Cabinet Refinishing", difficulty: "Advanced", earnings: "$180", status: "available" },
        { name: "Accent Wall Creation", difficulty: "Expert", earnings: "$250", status: "in-progress" },
      ],
      milestones: [
        { name: "Complete 5 Room Paints", progress: 4, total: 5, reward: "Expert Badge" },
        { name: "Generate $2K in Revenue", progress: 1800, total: 2000, reward: "$200 Bonus" },
        { name: "Complete Finishes Course", progress: 90, total: 100, reward: "Certificate" },
      ],
      stats: {
        avgCompletionTime: "6 hours",
        clientSatisfaction: "4.9/5",
        repeatClients: "75%",
        topEarners: "$125/hr",
      },
      testimonial: {
        text: "The advanced techniques I learned helped me charge premium rates and build a waiting list of clients!",
        author: "David R.",
        rating: 5,
      },
    },
    {
      name: "Furniture Assembly",
      level: "Beginner",
      nextLevel: "Intermediate",
      progress: 35,
      mentors: 29,
      projects: 178,
      earnings: "$20-40/hr",
      nextEarnings: "$45-65/hr",
      color: "#12B886",
      icon: <Hammer className="h-4 w-4" />,
      description: "Master the assembly of flat-pack furniture from IKEA and other retailers",
      learningPath: [
        { name: "Tool Fundamentals", status: "completed", duration: "2 weeks" },
        { name: "Instruction Reading", status: "in-progress", duration: "3 weeks" },
        { name: "IKEA Furniture Types", status: "upcoming", duration: "2 weeks" },
        { name: "Hardware Organization", status: "upcoming", duration: "2 weeks" },
        { name: "Troubleshooting", status: "upcoming", duration: "2 weeks" },
      ],
      skills: [
        { name: "Allen Wrench Usage", level: 65 },
        { name: "Part Identification", level: 80 },
        { name: "Instruction Following", level: 70 },
        { name: "Problem Solving", level: 40 },
        { name: "Finishing Touches", level: 60 },
      ],
      milestones: [
        { name: "Assemble 10 Furniture Pieces", progress: 4, total: 10, reward: "Intermediate Badge" },
        { name: "Earn 5 Client Reviews", progress: 2, total: 5, reward: "$50 Bonus" },
        { name: "Complete IKEA Course", progress: 30, total: 100, reward: "Certificate" },
      ],
      stats: {
        avgCompletionTime: "1.5 hours",
        clientSatisfaction: "4.6/5",
        repeatClients: "55%",
        topEarners: "$75/hr",
      },
      testimonial: {
        text: "I turned my knack for furniture assembly into a weekend side hustle that pays for my vacations!",
        author: "Jamie L.",
        rating: 5,
      },
    },
  ]

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

  // Medal glow effect
  // Remove this useEffect

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
  }, [activeSkill])

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

  const handleNodeHover = (index: number, event: React.MouseEvent) => {
    const levels = ["Beginner", "Intermediate", "Advanced", "Expert", "Master"]
    const tooltips = [
      {
        title: levels[0],
        description: "Learn fundamentals and complete basic projects",
      },
      {
        title: levels[1],
        description: "Apply skills to real-world projects with guidance",
      },
      {
        title: levels[2],
        description: "Handle complex projects independently",
      },
      {
        title: levels[3],
        description: "Mentor others and tackle challenging projects",
      },
      {
        title: levels[4],
        description: "Industry leader with exceptional expertise",
      },
    ]

    setTooltipContent(tooltips[index])

    // Use safer positioning that doesn't depend on client coordinates
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })

    setShowTooltip(true)
  }

  const handleNodeLeave = () => {
    setShowTooltip(false)
  }

  const handleApplyForProject = (projectName: string) => {
    setShowSuccessMessage(true)
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <>
      <style jsx global>
        {scrollbarHideStyles}
      </style>
      <style jsx global>
        {detailedVisualStyles}
      </style>
      <section className="w-full py-6 md:py-10 lg:py-16 xl:py-24 relative overflow-hidden">
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
            <motion.div
              className="flex flex-col justify-center space-y-4 max-w-3xl"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <div className="space-y-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="relative">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-black dark:text-white leading-relaxed pb-1">
                      Learn. Earn. Grow Your Business.
                    </h1>
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-xl opacity-0"
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <div
                      className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 backdrop-blur-sm border border-white/10 shadow-sm relative overflow-hidden group"
                      onMouseEnter={() => setShowDiamondGlint(true)}
                      onMouseLeave={() => setShowDiamondGlint(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
                      <div className="relative">
                        <div className="relative">
                          <Gem className="h-4 w-4 mr-2 text-primary" />
                          {showDiamondGlint && (
                            <>
                              {/* Enhanced Diamond-shaped glint animation */}
                              <motion.div
                                className="absolute inset-0"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 0.8 }}
                              >
                                {/* Top facet - enhanced */}
                                <div className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-sm -translate-x-1/2 -translate-y-1/4 rotate-45 opacity-90 shadow-[0_0_8px_3px_rgba(255,255,255,0.9)]" />

                                {/* Right facet - enhanced */}
                                <div className="absolute top-1/2 right-0 w-2 h-2 bg-white rounded-sm -translate-y-1/2 translate-x-1/4 rotate-45 opacity-90 shadow-[0_0_8px_3px_rgba(255,255,255,0.9)]" />

                                {/* Bottom facet - enhanced */}
                                <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-white rounded-sm -translate-x-1/2 translate-y-1/4 rotate-45 opacity-90 shadow-[0_0_8px_3px_rgba(255,255,255,0.9)]" />

                                {/* Left facet - enhanced */}
                                <div className="absolute top-1/2 left-0 w-2 h-2 bg-white rounded-sm -translate-y-1/2 -translate-x-1/4 rotate-45 opacity-90 shadow-[0_0_8px_3px_rgba(255,255,255,0.9)]" />

                                {/* Center sparkle - enhanced */}
                                <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-white rounded-full opacity-100 shadow-[0_0_10px_5px_rgba(255,255,255,1)]" />
                              </motion.div>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-black dark:text-white relative z-10">
                        Lower fees than Competitors!
                      </span>
                    </div>

                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-violet-500/10 backdrop-blur-sm border border-white/10 shadow-sm relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
                      <div className="relative">
                        <FounderIcon className="mr-2 text-black dark:text-white" />
                      </div>
                      <span className="text-sm font-medium text-black dark:text-white relative z-10">
                        Founder who's completed over 3k+ gig jobs
                      </span>
                    </div>
                  </div>
                </motion.div>
                <motion.p
                  className="max-w-[600px] md:text-xl leading-relaxed text-black dark:text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Empowering limitless connections, shaping the future of work.
                </motion.p>
              </div>
              <motion.div
                className="flex flex-col gap-3 min-[400px]:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {/* Hero buttons removed */}
              </motion.div>
            </motion.div>

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
                  className="relative rounded-xl overflow-hidden bg-gradient-to-br from-purple-100/10 via-white/5 to-purple-50/10 dark:from-purple-900/10 dark:via-black/5 dark:to-purple-800/10 backdrop-blur-md p-3 sm:p-4 md:p-5 shadow-lg detailed-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1, y: 10 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  style={{
                    boxShadow: "0 0 40px 5px rgba(147, 51, 234, 0.25)",
                    border: "1px solid rgba(147, 51, 234, 0.2)",
                  }}
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
                          <Rocket className="h-5 w-5 text-white" />
                          <div className="absolute inset-0 rounded-full bg-white/30 scale-0 group-hover:scale-150" />
                          <div className="absolute inset-0 rounded-full bg-white/30 scale-0 group-hover:scale-150 opacity-0 transition-all duration-700"></div>
                          {/* Orbital rings around the rocket icon */}
                          <div className="absolute inset-0 rounded-full border border-white/20 scale-[1.3] animate-pulse"></div>
                          <div
                            className="absolute inset-0 rounded-full border border-white/10 scale-[1.6] animate-pulse"
                            style={{ animationDuration: "0.5s" }}
                          ></div>
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
                        <button
                          key={index}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center ${
                            activeSkill === index
                              ? "bg-gradient-to-r from-primary to-purple-500 text-white"
                              : "bg-white/10 dark:bg-black/20 text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/30"
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
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex border-b border-white/10 overflow-x-auto -mx-1 px-1 scrollbar-hide md:justify-start lg:col-span-12">
                      {["overview", "learning", "projects", "forum", "analytics", "milestones"].map((tab) => (
                        <button
                          key={tab}
                          className={`px-2 sm:px-3 py-2 text-xs font-medium capitalize whitespace-nowrap transition-all duration-300 detailed-tab ${
                            activeTab === tab
                              ? "active text-primary"
                              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
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
                            <span className="ml-1 inline-block h-1 w-1 rounded-full bg-primary"></span>
                          )}
                        </button>
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
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 relative"
                                  style={{ width: `${progress}%`, transition: "width 0.5s ease-out" }}
                                ></div>
                                {/* Progress markers */}
                                <div className="absolute top-0 left-1/4 h-full w-0.5 bg-white/20"></div>
                                <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white/20"></div>
                                <div className="absolute top-0 left-3/4 h-full w-0.5 bg-white/20"></div>
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
                                  4.8 <Star className="h-3 w-3 ml-0.5 text-yellow-400 fill-yellow-400" />
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
                                      <div className="px-2 py-0.5 rounded-full bg-white/10 dark:bg-black/30 text-xs mr-2">
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

                      {/* Forum Tab */}
                      {activeTab === "forum" && <ForumTab />}

                      {/* Analytics Tab */}
                      {activeTab === "analytics" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-black dark:text-white">Skill Analytics</h4>
                            <div className="text-xs text-primary">Track your progress</div>
                          </div>

                          <div className="bg-white/5 dark:bg-black/10 rounded-lg p-3 border border-white/10">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="text-xs font-medium text-black dark:text-white">Earnings Projection</h5>
                              <div className="text-xs text-black/60 dark:text-white/60">Based on skill advancement</div>
                            </div>

                            <div className="relative h-40 w-full">
                              <canvas ref={chartRef} className="w-full h-full"></canvas>
                            </div>

                            <div className="flex justify-between mt-2 text-xs">
                              <div className="text-black/60 dark:text-white/60">Current</div>
                              <div className="text-black/60 dark:text-white/60">After advancement</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/5 dark:bg-black/10 rounded-lg p-3 border border-white/10">
                              <h5 className="text-xs font-medium text-black dark:text-white mb-2">Completion Time</h5>
                              <div className="text-lg font-bold text-black dark:text-white">
                                {skills[activeSkill].stats.avgCompletionTime}
                              </div>
                              <div className="text-xs text-black/60 dark:text-white/60">Average per project</div>
                            </div>

                            <div className="bg-white/5 dark:bg-black/10 rounded-lg p-3 border border-white/10">
                              <h5 className="text-xs font-medium text-black dark:text-white mb-2">
                                Client Satisfaction
                              </h5>
                              <div className="text-lg font-bold text-black dark:text-white flex items-center">
                                {skills[activeSkill].stats.clientSatisfaction}
                                <Star className="h-4 w-4 ml-1 text-yellow-400 fill-yellow-400" />
                              </div>
                              <div className="text-xs text-black/60 dark:text-white/60">Based on reviews</div>
                            </div>
                          </div>

                          <div className="bg-white/5 dark:bg-black/10 rounded-lg p-3 border border-white/10">
                            <h5 className="text-xs font-medium text-black dark:text-white mb-2">Top Earners</h5>
                            <div className="text-lg font-bold text-black dark:text-white">
                              {skills[activeSkill].stats.topEarners}
                            </div>
                            <div className="text-xs text-black/60 dark:text-white/60">In this skill category</div>
                            <div className="mt-2 text-xs text-primary">
                              You're in the top 40% of earners in this category
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Milestones Tab */}
                      {activeTab === "milestones" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-black dark:text-white">Skill Milestones</h4>
                            <div className="text-xs text-primary">Unlock rewards</div>
                          </div>

                          <div className="space-y-3">
                            {skills[activeSkill].milestones.map((milestone, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg bg-white/5 dark:bg-black/10 border ${
                                  selectedMilestone === index ? "border-primary/30" : "border-white/10"
                                } hover:border-primary/30 transition-all duration-300 relative overflow-hidden cursor-pointer`}
                                onClick={() => setSelectedMilestone(selectedMilestone === index ? -1 : index)}
                              >
                                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_10px_10px,rgba(var(--primary-rgb),0.4)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="text-sm font-medium text-black dark:text-white">
                                      {milestone.name}
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <div className="text-xs text-black/60 dark:text-white/60">
                                        Progress: {milestone.progress}/{milestone.total}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-primary">Reward:</div>
                                    <div className="text-xs font-medium text-black dark:text-white">
                                      {milestone.reward}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-2 h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden progress-track">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500"
                                    style={{ width: `${(milestone.progress / milestone.total) * 100}%` }}
                                  ></div>
                                </div>

                                {selectedMilestone === index && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-3 pt-3 border-t border-white/10"
                                  >
                                    <div className="text-xs text-black/80 dark:text-white/80">
                                      {milestone.name === "Complete 5 TV Mounts" && (
                                        <p>
                                          Complete 5 TV mounting projects to earn the Intermediate Badge, which will
                                          increase your visibility to clients and allow you to charge higher rates.
                                        </p>
                                      )}
                                      {milestone.name === "Earn 5 Client Reviews" && (
                                        <p>
                                          Receive 5 positive client reviews to earn a $50 bonus. Quality reviews help
                                          build your reputation and attract more clients.
                                        </p>
                                      )}
                                      {milestone.name === "Complete Hardware Course" && (
                                        <p>
                                          Finish the Hardware Course to earn a certificate that you can display on your
                                          profile, demonstrating your expertise to potential clients.
                                        </p>
                                      )}
                                      {milestone.name === "Complete 3 Full Moves" && (
                                        <p>
                                          Successfully complete 3 full moving projects to earn the Advanced Badge, which
                                          will boost your ranking in search results.
                                        </p>
                                      )}
                                      {milestone.name === "Zero Damage Reports" && (
                                        <p>
                                          Maintain a perfect record with no damage reports across 3 consecutive projects
                                          to get featured on our homepage.
                                        </p>
                                      )}
                                      {milestone.name === "Complete Safety Course" && (
                                        <p>
                                          Complete the Safety Course to earn a certificate that demonstrates your
                                          commitment to safe moving practices.
                                        </p>
                                      )}
                                      {milestone.name === "Complete 5 Room Paints" && (
                                        <p>
                                          Complete 5 room painting projects to earn the Expert Badge, which will allow
                                          you to access premium clients and projects.
                                        </p>
                                      )}
                                      {milestone.name === "Generate $2K in Revenue" && (
                                        <p>
                                          Earn $2,000 in painting projects to receive a $200 bonus as a reward for your
                                          success and client satisfaction.
                                        </p>
                                      )}
                                      {milestone.name === "Complete Finishes Course" && (
                                        <p>
                                          Finish the Specialty Finishes Course to earn a certificate that will help you
                                          command premium rates for specialty painting services.
                                        </p>
                                      )}
                                      {milestone.name === "Assemble 10 Furniture Pieces" && (
                                        <p>
                                          Successfully assemble 10 furniture pieces to earn the Intermediate Badge,
                                          which will increase your visibility to clients.
                                        </p>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <div className="flex items-start">
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 text-primary">
                                <Trophy className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-black dark:text-white">Milestone Rewards</h4>
                                <p className="text-xs text-black/80 dark:text-white/80">
                                  Complete milestones to earn badges, certificates, and bonuses that boost your earning
                                  potential.
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

                      <EnhancedButton
                        variant="gradient"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowSignupModal(true)}
                      >
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
          </div>
        </div>
      </section>
      <SkillAcceleratorSignup isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />
    </>
  )
}

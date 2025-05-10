"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Search,
  MessageSquare,
  TrendingUp,
  Clock,
  Tag,
  BookOpen,
  Award,
  ThumbsUp,
  MoreHorizontal,
  MessageCircle,
  Check,
  Filter,
  Bell,
  ChevronRight,
  ChevronDown,
  Eye,
  Star,
  Heart,
  CircleCheck,
  PlusCircle,
  Settings,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMobile } from "@/hooks/use-mobile"
import { Skeleton } from "@/components/ui/skeleton"

// Types
type Author = {
  name: string
  avatar: string
  reputation: number
  badge: string
  level?: number
  activeStatus?: "online" | "away" | "offline"
}

type Response = {
  id: number
  author: Author
  time: string
  content: string
  likes: number
  isBestAnswer?: boolean
  codeSnippet?: string
  attachments?: string[]
}

type Topic = {
  id: number
  title: string
  author: Author
  category: string
  replies: number
  views: number
  likes: number
  lastActive: string
  tags: string[]
  preview: string
  pinned: boolean
  solved: boolean
  responses: Response[]
  recentActivityUsers?: Author[]
}

type Category = {
  id: string
  name: string
  count: number
  icon?: React.ReactNode
  color?: string
}

// Animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
}

// Forum Data
const forumCategories: Category[] = [
  { id: "all", name: "All Topics", count: 124, icon: <BookOpen className="h-4 w-4" />, color: "bg-slate-100" },
  {
    id: "general",
    name: "General Discussion",
    count: 42,
    icon: <MessageSquare className="h-4 w-4" />,
    color: "bg-blue-100",
  },
  {
    id: "questions",
    name: "Questions & Help",
    count: 36,
    icon: <MessageCircle className="h-4 w-4" />,
    color: "bg-emerald-100",
  },
  { id: "showcase", name: "Project Showcase", count: 18, icon: <Star className="h-4 w-4" />, color: "bg-amber-100" },
  { id: "resources", name: "Resources & Tools", count: 28, icon: <Tag className="h-4 w-4" />, color: "bg-purple-100" },
]

const mockTopics: Topic[] = [
  {
    id: 1,
    title: "Best practices for UI/UX portfolio presentation?",
    author: {
      name: "DesignPro",
      avatar: "/professional-avatar.png",
      reputation: 1250,
      badge: "Expert",
      level: 4,
      activeStatus: "online",
    },
    category: "questions",
    replies: 12,
    views: 342,
    likes: 25,
    lastActive: "2 hours ago",
    tags: ["portfolio", "ui-design", "career"],
    preview:
      "I'm preparing my portfolio for job applications and wondering what format works best for presenting UI/UX work. Should I focus on process or final designs?",
    pinned: true,
    solved: true,
    recentActivityUsers: [
      { name: "UXMaster", avatar: "/professional-avatar.png", reputation: 3420, badge: "Mentor" },
      { name: "DesignDirector", avatar: "/avatar-executive.png", reputation: 5680, badge: "Industry Leader" },
    ],
    responses: [
      {
        id: 101,
        author: {
          name: "UXMaster",
          avatar: "/professional-expert-avatar.png",
          reputation: 3420,
          badge: "Mentor",
          level: 6,
          activeStatus: "online",
        },
        time: "1 hour ago",
        content:
          "Focus on telling a story with your portfolio. For each project, outline: 1) The problem you were solving, 2) Your research and process, 3) Design iterations, and 4) Final solution with outcomes. Recruiters want to see your thinking process more than just pretty screens.",
        likes: 18,
        isBestAnswer: true,
      },
      {
        id: 102,
        author: {
          name: "DesignDirector",
          avatar: "/avatar-executive-professional.png",
          reputation: 5680,
          badge: "Industry Leader",
          level: 8,
          activeStatus: "away",
        },
        time: "45 minutes ago",
        content:
          "I've reviewed hundreds of portfolios. The ones that stand out include measurable results. Did your redesign increase conversion? Improve user satisfaction? Include these metrics. Also, keep it concise - quality over quantity.",
        likes: 12,
        codeSnippet: `// Example portfolio structure
const PortfolioProject = {
  title: "App Redesign for Company X",
  problem: "Users were abandoning checkout (40% drop-off)",
  research: ["User interviews", "Heatmap analysis", "Competitor research"],
  solution: "Simplified checkout process with visual progress indicator",
  results: "Reduced checkout abandonment by 24%, increased revenue by $420K annually"
}`,
      },
    ],
  },
  {
    id: 2,
    title: "How to handle complex animations in React?",
    author: {
      name: "ReactDeveloper",
      avatar: "/avatar-developer-tech.png",
      reputation: 890,
      badge: "Rising Talent",
      level: 3,
      activeStatus: "online",
    },
    category: "questions",
    replies: 8,
    views: 215,
    likes: 15,
    lastActive: "5 hours ago",
    tags: ["react", "animations", "performance"],
    preview:
      "I'm working on a dashboard with multiple animated components and experiencing performance issues. What's the best approach for complex animations in React?",
    pinned: false,
    solved: false,
    recentActivityUsers: [
      {
        name: "AnimationGuru",
        avatar: "/avatar-animation-expert.png",
        reputation: 2340,
        badge: "Specialist",
      },
    ],
    responses: [
      {
        id: 201,
        author: {
          name: "AnimationGuru",
          avatar: "/avatar-animation-specialist.png",
          reputation: 2340,
          badge: "Specialist",
          level: 5,
          activeStatus: "online",
        },
        time: "4 hours ago",
        content:
          "For complex animations in React, I recommend using Framer Motion or React Spring. They're optimized for performance and handle hardware acceleration. Also, make sure you're not re-rendering unnecessarily - use React.memo and useMemo for components with heavy animations.",
        likes: 9,
        codeSnippet: `import { motion } from 'framer-motion';

// Efficient animation in React
function AnimatedComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      Smoothly Animated Content
    </motion.div>
  );
}`,
      },
    ],
  },
  {
    id: 3,
    title: "Transitioning from graphic design to UX design",
    author: {
      name: "GraphicArtist",
      avatar: "/creative-avatar-artist.png",
      reputation: 560,
      badge: "Member",
      level: 2,
      activeStatus: "offline",
    },
    category: "general",
    replies: 15,
    views: 428,
    likes: 32,
    lastActive: "1 day ago",
    tags: ["career-change", "ux-design", "learning"],
    preview:
      "I've been working as a graphic designer for 5 years and want to transition to UX design. What skills should I focus on learning first? Any course recommendations?",
    pinned: false,
    solved: true,
    recentActivityUsers: [
      { name: "UXMaster", avatar: "/professional-avatar.png", reputation: 3420, badge: "Mentor" },
      {
        name: "CareerCoach",
        avatar: "/avatar-coach.png",
        reputation: 1850,
        badge: "Career Advisor",
      },
      {
        name: "UXNewbie",
        avatar: "/avatar-student.png",
        reputation: 340,
        badge: "Member",
      },
    ],
    responses: [],
  },
]

// Trending topics
const trendingTopics = [
  { id: 1, title: "Getting started with Figma Auto Layout", views: 1240 },
  { id: 2, title: "How to price your freelance UX services", views: 980 },
  { id: 3, title: "Building a design system from scratch", views: 875 },
  { id: 4, title: "Portfolio review thread - May 2023", views: 750 },
]

// Active users
const activeUsers = [
  { name: "UXMaster", avatar: "/professional-avatar.png", status: "online" },
  { name: "DesignDirector", avatar: "/avatar-executive.png", status: "online" },
  { name: "ReactDeveloper", avatar: "/avatar-developer.png", status: "away" },
  { name: "GraphicArtist", avatar: "/avatar-artist.png", status: "online" },
]

// Components
const TopicCard = ({
  topic,
  isExpanded = false,
  onClick,
}: { topic: Topic; isExpanded?: boolean; onClick?: () => void }) => {
  const isMobile = useMobile()

  return (
    <motion.div
      className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mb-4 border border-slate-200 dark:border-slate-800 overflow-hidden ${isExpanded ? "p-0" : "p-4"}`}
      variants={fadeInUp}
      whileHover={{ y: -2 }}
      onClick={onClick}
    >
      <div className={`${isExpanded ? "p-4 pb-2 border-b border-slate-100 dark:border-slate-800" : ""}`}>
        <div className="flex items-start gap-3">
          {/* Topic header with author info */}
          <div className="hidden md:block">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={topic.author.avatar || "/placeholder.svg"} alt={topic.author.name} />
              <AvatarFallback>{topic.author.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {topic.pinned && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600">
                        <PlusCircle className="h-3 w-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Pinned Topic</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {topic.solved && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600">
                        <Check className="h-3 w-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Solved</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <h3 className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {topic.title}
              </h3>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {topic.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2 py-0 h-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Preview or full content based on expanded state */}
            {!isExpanded && (
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{topic.preview}</p>
            )}

            {/* Topic metadata */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{topic.replies}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{topic.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  <span>{topic.likes}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{topic.lastActive}</span>
              </div>
            </div>

            {/* Recent activity avatars on expanded view */}
            {isExpanded && topic.recentActivityUsers && topic.recentActivityUsers.length > 0 && (
              <div className="flex items-center mt-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">Recent activity:</span>
                <div className="flex -space-x-2">
                  {topic.recentActivityUsers.map((user, index) => (
                    <Avatar key={index} className="h-6 w-6 border-2 border-white dark:border-slate-900">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Author badge on desktop */}
          {!isMobile && (
            <div className="hidden md:flex flex-col items-end gap-1">
              <ReputationBadge badge={topic.author.badge} />
              <div className="flex items-center text-xs text-slate-500">
                <span>{topic.author.name}</span>
                <div className="ml-2 flex items-center">
                  <Award className="h-3 w-3 text-amber-500 mr-0.5" />
                  <span>{topic.author.reputation}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Responses section in expanded view */}
      {isExpanded && topic.responses.length > 0 && (
        <div className="responses-section pt-1">
          {topic.responses.map((response) => (
            <ResponseCard key={response.id} response={response} />
          ))}
        </div>
      )}

      {/* Quick reply in expanded view */}
      {isExpanded && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
              <AvatarImage src="/stylized-user-avatar.png" alt="You" />
              <AvatarFallback>YO</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder="Write a reply..."
                className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
              />
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Reply
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

const ResponseCard = ({ response }: { response: Response }) => {
  const [liked, setLiked] = useState(false)

  return (
    <motion.div
      className={`p-4 border-t border-slate-100 dark:border-slate-800 ${response.isBestAnswer ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
            <AvatarImage src={response.author.avatar || "/placeholder.svg"} alt={response.author.name} />
            <AvatarFallback>{response.author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 dark:text-slate-100">{response.author.name}</span>
                <ReputationBadge badge={response.author.badge} />
                {response.isBestAnswer && (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50">
                    <CircleCheck className="h-3 w-3 mr-1" />
                    Best Answer
                  </Badge>
                )}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{response.time}</span>
                <span className="mx-1">•</span>
                <div className="flex items-center">
                  <Award className="h-3 w-3 text-amber-500 mr-0.5" />
                  <span>{response.author.reputation}</span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  <span>Like</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span>Reply</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Check className="h-4 w-4 mr-2" />
                  <span>Mark as Solution</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="text-sm text-slate-700 dark:text-slate-300">{response.content}</div>

          {response.codeSnippet && (
            <div className="rounded-md bg-slate-900 p-3 text-sm font-mono text-slate-200 overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words">{response.codeSnippet}</pre>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs gap-1 h-7 ${liked ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
              onClick={() => setLiked(!liked)}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{liked ? response.likes + 1 : response.likes}</span>
            </Button>

            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 text-slate-500 dark:text-slate-400">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Reply</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const ReputationBadge = ({ badge }: { badge: string }) => {
  let color = "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"

  if (badge === "Expert") {
    color = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
  } else if (badge === "Mentor") {
    color = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
  } else if (badge === "Industry Leader") {
    color = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
  } else if (badge === "Rising Talent") {
    color = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  } else if (badge === "Specialist") {
    color = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
  } else if (badge === "Career Advisor") {
    color = "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400"
  }

  return <span className={`text-xs px-2 py-0.5 rounded-full ${color} font-medium`}>{badge}</span>
}

// Main Component
export default function ForumComponent() {
  const [activeTab, setActiveTab] = useState("latest")
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTopics, setFilteredTopics] = useState(mockTopics)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMobile()
  const [loading, setLoading] = useState(true)

  // Filter topics based on category and search
  useEffect(() => {
    let filtered = [...mockTopics]

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((topic) => topic.category === selectedCategory)
    }

    // Filter by search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (topic) =>
          topic.title.toLowerCase().includes(query) ||
          topic.preview.toLowerCase().includes(query) ||
          topic.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    setFilteredTopics(filtered)
    setLoading(false)
  }, [selectedCategory, searchQuery])

  // Handle topic click for expansion
  const handleTopicClick = (topicId: number) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId)
  }

  // Focus search on keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center">
              <MessageSquare className="h-6 w-6 mr-2" />
              Community Forum
            </h2>
            <p className="text-blue-100 dark:text-blue-200 text-sm md:text-base">
              Connect, learn, and grow with other skill accelerator members
            </p>
          </div>

          <div className="flex gap-2">
            <Button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20">
              <PlusCircle className="h-4 w-4 mr-2" />
              <span>New Topic</span>
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Forum Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar - only on desktop */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="mb-6">
              <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400 mb-2">Categories</h3>
              <ul className="space-y-1">
                {forumCategories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 ${category.color}`}
                        >
                          {category.icon}
                        </span>
                        <span>{category.name}</span>
                      </div>
                      <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full px-2 py-0.5">
                        {category.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400 mb-2">Trending Topics</h3>
              <ul className="space-y-2">
                {trendingTopics.map((topic) => (
                  <li key={topic.id} className="group">
                    <a href="#" className="flex justify-between text-sm hover:text-blue-600 dark:hover:text-blue-400">
                      <span className="line-clamp-1 group-hover:underline">{topic.title}</span>
                      <span className="text-xs text-slate-500 flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {topic.views}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400 mb-2">Online Members</h3>
              <div className="flex flex-wrap gap-1">
                {activeUsers.map((user, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Avatar className="h-8 w-8 border-2 border-white dark:border-slate-900">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-1 ring-white ${
                              user.status === "online"
                                ? "bg-green-500"
                                : user.status === "away"
                                  ? "bg-amber-500"
                                  : "bg-slate-300"
                            }`}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="text-xs">
                          <p className="font-medium">{user.name}</p>
                          <p className="capitalize">{user.status}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full">
                  <span className="sr-only">View more</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            {/* Search and filter bar */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics, tags, or users..."
                  className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-slate-400"
                    onClick={() => setSearchQuery("")}
                  >
                    <span className="sr-only">Clear</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </Button>
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hidden md:flex items-center pointer-events-none">
                  <span className="hidden md:inline-block">Press</span>
                  <kbd className="ml-1 font-sans font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    <abbr title="Command" className="no-underline">
                      ⌘
                    </abbr>
                  </kbd>
                  <kbd className="mx-0.5 font-sans font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    K
                  </kbd>
                </div>
              </div>

              {isMobile ? (
                <Button variant="outline" className="w-full md:w-auto flex items-center justify-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        <span>All Categories</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Solved Topics</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Unsolved Topics</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Pinned Topics</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Topics tabs */}
            <Tabs defaultValue="latest" className="mb-6" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger
                  value="latest"
                  className="data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Latest
                </TabsTrigger>
                <TabsTrigger
                  value="popular"
                  className="data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Popular
                </TabsTrigger>
                <TabsTrigger
                  value="unsolved"
                  className="data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Unsolved
                </TabsTrigger>
              </TabsList>

              <TabsContent value="latest">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : filteredTopics.length > 0 ? (
                  filteredTopics.map((topic) => {
                    return (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        isExpanded={expandedTopic === topic.id}
                        onClick={() => handleTopicClick(topic.id)}
                      />
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No topics found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("all")
                      }}
                    >
                      Reset filters
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="popular">
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <TrendingUp className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Popular Topics</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    This section will show the most popular topics based on views, likes, and engagement.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="unsolved">
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <MessageCircle className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Unsolved Questions</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Help the community by answering questions that haven't been solved yet.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-medium">{filteredTopics.length}</span> of{" "}
                <span className="font-medium">{mockTopics.length}</span> topics
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0">
                  <span className="sr-only">Previous</span>
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-slate-100 dark:bg-slate-800">
                  <span>1</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <span>2</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <span>3</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

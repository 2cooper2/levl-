"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  MessageSquare,
  TrendingUp,
  Star,
  Filter,
  PlusCircle,
  Sparkles,
  Target,
  Shield,
  WrenchIcon as ScrewDriver,
  Hammer,
  Layers,
  ThumbsUp,
  Eye,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

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

export function ForumTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTopic, setActiveTopic] = useState<number | null>(null)
  const [topics, setTopics] = useState(forumTopics)
  const [isLoading, setIsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const [showNewTopicForm, setShowNewTopicForm] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState("")
  const [newTopicContent, setNewTopicContent] = useState("")
  const [newTopicTags, setNewTopicTags] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [userVotes, setUserVotes] = useState<Record<string, Record<string, boolean>>>({})
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [replyContent, setReplyContent] = useState("")
  const [expandedTags, setExpandedTags] = useState(false)
  const [userBookmarks, setUserBookmarks] = useState<number[]>([])
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false)

  const [viewMode, setViewMode] = useState<"card" | "compact">("card")
  const [showUserTooltip, setShowUserTooltip] = useState<number | null>(null)

  const categoriesRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content:
        "Hey there! I'm Levl, your AI assistant. I'm here to help you find the right service provider for your needs. What are you looking for today?",
      timestamp: new Date(),
      options: ["Mounting a TV", "Moving", "Painting", "Furniture Assembly"],
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredTopics = topics
    .filter((topic) => {
      const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === "all" || topic.tags.includes(activeCategory)
      const matchesBookmark = showOnlyBookmarked ? userBookmarks.includes(topic.id) : true
      return matchesSearch && matchesCategory && matchesBookmark
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      } else if (sortBy === "popular") {
        return b.likes - a.likes
      } else if (sortBy === "replies") {
        return b.replies - a.replies
      }
      return 0
    })

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
        {
          id: 5,
          title: "Best anchors for heavy items?",
          author: "WallMountPro",
          replies: 7,
          likes: 12,
          lastActive: "2 days ago",
          tags: ["mounting", "anchors", "heavy-duty"],
          preview: "I need to hang a 50lb mirror. What anchors should I use for drywall?",
          responses: [
            {
              author: "HardwareExpert",
              time: "2 days ago",
              content:
                "Toggle bolts are your best bet for heavy items on drywall. They can hold up to 100lbs when installed correctly.",
              likes: 5,
            },
          ],
        },
      ]
      setTopics([...topics, ...newTopics])
      setIsLoading(false)
    }, 1000)
  }

  const handleCreateTopic = () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return

    const newTopic = {
      id: Math.floor(Math.random() * 1000) + 10,
      title: newTopicTitle,
      author: "You",
      replies: 0,
      likes: 0,
      lastActive: "Just now",
      tags: newTopicTags.split(",").map((tag) => tag.trim().toLowerCase()),
      preview: newTopicContent,
      responses: [],
    }

    setTopics([newTopic, ...topics])
    setNewTopicTitle("")
    setNewTopicContent("")
    setNewTopicTags("")
    setShowNewTopicForm(false)

    // Show success notification
    setNotificationMessage("Topic created successfully!")
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleVote = (topicId: number, responseIndex: number | null, type: "up" | "down") => {
    // Create a unique ID for the vote target
    const targetId = responseIndex !== null ? `${topicId}-${responseIndex}` : `${topicId}`

    // Check if user has already voted
    const hasVoted = userVotes[targetId]?.[type]

    // Update user votes state
    setUserVotes((prev) => {
      const newVotes = { ...prev }
      if (!newVotes[targetId]) newVotes[targetId] = {}

      // If already voted this type, remove vote
      if (hasVoted) {
        newVotes[targetId][type] = false
      }
      // If voted opposite type, switch vote
      else if (newVotes[targetId][type === "up" ? "down" : "up"]) {
        newVotes[targetId][type === "up" ? "down" : "up"] = false
        newVotes[targetId][type] = true
      }
      // New vote
      else {
        newVotes[targetId][type] = true
      }

      return newVotes
    })

    // Update topic/response likes count
    setTopics((prev) => {
      return prev.map((topic) => {
        if (topic.id === topicId) {
          if (responseIndex === null) {
            // Voting on the topic itself
            let newLikes = topic.likes
            if (hasVoted && type === "up") newLikes--
            else if (!hasVoted && type === "up") newLikes++
            else if (hasVoted && type === "down") newLikes++
            else if (!hasVoted && type === "down") newLikes--

            return { ...topic, likes: newLikes }
          } else {
            // Voting on a response
            const newResponses = [...(topic.responses || [])]
            if (newResponses[responseIndex]) {
              let newLikes = newResponses[responseIndex].likes
              if (hasVoted && type === "up") newLikes--
              else if (!hasVoted && type === "up") newLikes++
              else if (hasVoted && type === "down") newLikes++
              else if (!hasVoted && type === "down") newLikes--

              newResponses[responseIndex] = { ...newResponses[responseIndex], likes: newLikes }
            }
            return { ...topic, responses: newResponses }
          }
        }
        return topic
      })
    })
  }

  const handleReply = (topicId: number) => {
    if (!replyContent.trim()) return

    setTopics((prev) => {
      return prev.map((topic) => {
        if (topic.id === topicId) {
          const newResponses = [
            ...(topic.responses || []),
            {
              author: "You",
              time: "Just now",
              content: replyContent,
              likes: 0,
            },
          ]
          return {
            ...topic,
            responses: newResponses,
            replies: topic.replies + 1,
            lastActive: "Just now",
          }
        }
        return topic
      })
    })

    setReplyContent("")

    // Show success notification
    setNotificationMessage("Reply posted successfully!")
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const toggleBookmark = (topicId: number) => {
    setUserBookmarks((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId)
      } else {
        return [...prev, topicId]
      }
    })

    // Show notification
    setNotificationMessage(userBookmarks.includes(topicId) ? "Bookmark removed" : "Topic bookmarked!")
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const categories = [
    { id: "all", name: "All Topics", icon: <Layers className="h-3.5 w-3.5" /> },
    { id: "mounting", name: "Mounting", icon: <Hammer className="h-3.5 w-3.5" /> },
    { id: "tools", name: "Tools", icon: <ScrewDriver className="h-3.5 w-3.5" /> },
    { id: "drilling", name: "Drilling", icon: <Target className="h-3.5 w-3.5" /> },
    { id: "anchors", name: "Anchors", icon: <Shield className="h-3.5 w-3.5" /> },
  ]

  const allTags = Array.from(new Set(topics.flatMap((topic) => topic.tags)))
    .filter((tag) => !categories.some((cat) => cat.id === tag))
    .slice(0, expandedTags ? undefined : 5)

  const handleCategoryClick = (category: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        type: "user",
        content: `I'm looking for ${category} services.`,
        timestamp: new Date(),
      },
      {
        id: Date.now() + 1,
        type: "loading",
        content: "Levl is searching for the best matches...",
        timestamp: new Date(),
      },
    ])

    setTimeout(() => {
      setMessages((prevMessages) => {
        const loadingMessageIndex = prevMessages.findIndex((msg) => msg.type === "loading")
        const newMessages = [...prevMessages]
        if (loadingMessageIndex !== -1) {
          newMessages.splice(loadingMessageIndex, 1, {
            id: Date.now() + 2,
            type: "ai",
            content: `Okay, I found some great ${category} service providers for you!`,
            timestamp: new Date(),
            services: [
              {
                id: 1,
                provider: {
                  id: "provider1",
                  name: "John's Handyman Services",
                  rating: 4.5,
                  reviews: 120,
                  image: "/placeholder-service.jpg",
                  category: "Mounting",
                },
                matchScore: 0.85,
              },
              {
                id: 2,
                provider: {
                  id: "provider2",
                  name: "Jane's Moving Co.",
                  rating: 4.2,
                  reviews: 85,
                  image: "/placeholder-service.jpg",
                  category: "Moving",
                },
                matchScore: 0.78,
              },
            ],
          })
        }
        return newMessages
      })
      scrollToBottom()
    }, 2000)
  }

  const handleOptionSelect = (option: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), type: "user", content: option, timestamp: new Date() },
      { id: Date.now() + 1, type: "loading", content: "Levl is searching...", timestamp: new Date() },
    ])

    setTimeout(() => {
      setMessages((prevMessages) => {
        const loadingMessageIndex = prevMessages.findIndex((msg) => msg.type === "loading")
        const newMessages = [...prevMessages]
        if (loadingMessageIndex !== -1) {
          newMessages.splice(loadingMessageIndex, 1, {
            id: Date.now() + 2,
            type: "ai",
            content: `Great choice! Here are some top-rated providers for ${option.toLowerCase()}.`,
            timestamp: new Date(),
            services: [
              {
                id: 1,
                provider: {
                  id: "provider1",
                  name: "John's Handyman Services",
                  rating: 4.5,
                  reviews: 120,
                  image: "/placeholder-service.jpg",
                  category: "Mounting",
                },
                matchScore: 0.85,
              },
              {
                id: 2,
                provider: {
                  id: "provider2",
                  name: "Jane's Moving Co.",
                  rating: 4.2,
                  reviews: 85,
                  image: "/placeholder-service.jpg",
                  category: "Moving",
                },
                matchScore: 0.78,
              },
            ],
          })
        }
        return newMessages
      })
      scrollToBottom()
    }, 2000)
  }

  const handleServiceSelect = (serviceId: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        type: "ai",
        content: `You selected service with ID: ${serviceId}. Do you want to proceed with this provider?`,
        timestamp: new Date(),
        feedbackOptions: ["Yes", "No"],
      },
    ])
    scrollToBottom()
  }

  const handleFeedbackSelect = (feedback: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), type: "feedback", content: `You selected: ${feedback}`, timestamp: new Date() },
    ])
    scrollToBottom()
  }

  const sendMessage = async (message: string) => {
    setIsTyping(true)
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), type: "user", content: message, timestamp: new Date() },
    ])
    setInputValue("")

    // Simulate AI response after a short delay
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now() + 1,
          type: "ai",
          content: `Thanks for your message! I'm processing your request: "${message}"`,
          timestamp: new Date(),
        },
      ])
      setIsTyping(false)
      scrollToBottom()
    }, 1500)
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (inputValue.trim()) {
      await sendMessage(inputValue)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="space-y-4 pb-8 bg-gradient-to-b from-lavender-50/50 via-white to-lavender-100/30 min-h-screen">
      {/* Notification toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-lavender-400 to-lavender-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with search and new topic button - Enhanced with Levl UI/UX */}
      <div className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground transition-all relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]">
        {/* Decorative elements exactly like category cards */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-lavender-400/10 to-transparent rounded-bl-full transform transition-transform duration-700 group-hover:scale-110"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-tr from-lavender-500/15 to-transparent rounded-tr-full transform transition-transform duration-700 group-hover:scale-110"></div>
        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-500"
          style={{
            background: "radial-gradient(circle at 30% 20%, rgba(233,213,255,0.2) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* Animated accent line exactly like category cards */}
        <div className="absolute h-[2px] w-1/3 bg-gradient-to-r from-transparent via-lavender-400/60 to-transparent top-0 left-0 animate-shimmer"></div>

        {/* Additional decorative elements from category cards */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-lavender-300/5 to-transparent rounded-tl-full"></div>
        <div className="absolute top-1/2 left-0 w-12 h-24 bg-gradient-to-r from-lavender-400/5 to-transparent"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-lavender-500/70 transition-colors duration-200" />
            </div>
            <Input
              type="text"
              placeholder="Search forum topics..."
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-lavender-200 focus:border-lavender-400/60 focus:ring-2 focus:ring-lavender-300/30 bg-white/80 transition-all duration-200 text-sm placeholder:text-gray-400"
              value={searchQuery}
              onChange={handleSearch}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-0 transition-opacity duration-200">
              <span className="text-xs text-gray-400">Press / to search</span>
            </div>
          </div>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-lavender-300 to-lavender-500 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-lavender-400/20"
            onClick={() => setShowNewTopicForm(true)}
          >
            <PlusCircle className="h-4 w-4 transition-transform duration-300" />
            <span>New Topic</span>
          </button>
        </div>

        {/* Forum categories */}
        <div className="flex flex-wrap gap-2 mb-2 relative z-10">
          {["All Topics", "Announcements", "Discussions", "Questions", "Resources", "Events"].map((category) => (
            <button
              key={category}
              className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 ${
                category === "All Topics"
                  ? "bg-lavender-100/80 text-lavender-700 font-medium border-2 border-lavender-300/40"
                  : "bg-lavender-50 text-gray-600 border border-lavender-200/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort options */}
        <div className="flex items-center justify-between text-xs text-gray-500 relative z-10">
          <div className="flex items-center gap-3">
            <span className="font-medium">Sort by:</span>
            <div className="flex items-center gap-3">
              {["Latest", "Popular", "Unanswered"].map((option, index) => (
                <button
                  key={option}
                  className={`transition-colors duration-200 ${index === 0 ? "text-lavender-600 font-medium" : ""}`}
                  onClick={() => setSortBy(index === 0 ? "recent" : index === 1 ? "popular" : "replies")}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3 text-lavender-500" />
            <span>Filters</span>
          </div>
        </div>
      </div>

      {/* New Topic Form */}
      <AnimatePresence>
        {showNewTopicForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground transition-all relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] mb-4"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_10px_10px,rgba(var(--primary-rgb),0.4)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-lavender-600" />
              Create New Discussion
            </h3>

            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="Topic title"
                  className="text-sm bg-white/5 dark:bg-black/20 border-white/10 pr-16"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  {newTopicTitle.length}/100
                </div>
              </div>

              <div className="relative">
                <textarea
                  placeholder="What would you like to discuss?"
                  className="w-full h-24 px-3 py-2 text-sm bg-white/5 dark:bg-black/20 rounded-md border border-white/10 focus:border-lavender-500/50 focus:ring-1 focus:ring-lavender-400/30 outline-none transition-colors resize-none text-gray-800"
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                />
                <div className="absolute right-2 bottom-2 text-xs text-gray-500">{newTopicContent.length}/500</div>
              </div>

              <div className="flex items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Target className="h-3.5 w-3.5 text-lavender-500/60" />
                  </div>
                  <Input
                    placeholder="Tags (comma separated)"
                    className="pl-10 text-sm bg-white/5 dark:bg-black/20 border-white/10"
                    value={newTopicTags}
                    onChange={(e) => setNewTopicTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">Use tags to help others find your topic</div>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1 text-xs bg-gradient-to-r from-lavender-300 to-lavender-500 hover:from-lavender-400 hover:to-lavender-600 text-white"
                  onClick={handleCreateTopic}
                  disabled={!newTopicTitle.trim() || !newTopicContent.trim()}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Post Topic
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category tabs - Enhanced with Levl UI/UX */}
      <div className="flex overflow-x-auto pb-1 -mx-1 px-1 hide-scrollbar space-x-1 mb-1 relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-lavender-400/20 to-transparent"></div>

        {categories.map((category) => (
          <motion.button
            key={category.id}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center relative ${
              activeCategory === category.id
                ? "bg-gradient-to-r from-lavender-400 to-lavender-600 text-white shadow-lg shadow-lavender-400/20"
                : "bg-white/80 text-gray-700 hover:bg-lavender-50 border border-lavender-200/70"
            }`}
            onClick={() => setActiveCategory(category.id)}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="mr-1.5">{category.icon}</span>
            {category.name}
            {activeCategory === category.id && (
              <>
                <span className="ml-1.5 flex items-center">
                  <motion.div
                    className="h-1.5 w-1.5 rounded-full bg-white"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  />
                </span>
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0"
                  animate={{
                    boxShadow: [
                      "0 0 0px 0px rgba(147, 112, 219, 0)",
                      "0 0 8px 2px rgba(147, 112, 219, 0.3)",
                      "0 0 0px 0px rgba(147,  112, 219, 0)",
                    ],
                    opacity: [0, 0.7, 0],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </>
            )}
          </motion.button>
        ))}
      </div>

      {/* Trending Topics - Enhanced with Levl UI/UX */}
      <div className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground transition-all group relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] mb-3">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-lavender-400/10 to-transparent rounded-bl-full transform transition-transform duration-700 group-hover:scale-110"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-lavender-500/15 to-transparent rounded-tr-full transform transition-transform duration-700 group-hover:scale-110"></div>
        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-500"
          style={{
            background: "radial-gradient(circle at 30% 20%, rgba(233,213,255,0.2) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* Animated accent line */}
        <div className="absolute h-[2px] w-1/3 bg-gradient-to-r from-transparent via-lavender-400/60 to-transparent top-0 left-0 animate-shimmer"></div>

        <div className="flex items-center justify-between mb-3 relative z-10">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-lavender-300 to-lavender-400 flex items-center justify-center mr-2 shadow-sm shadow-lavender-300/30">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Trending Discussions
            </span>
          </h4>
          <motion.button
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
            className="text-xs text-lavender-600 flex items-center font-medium px-2 py-1 rounded-full bg-lavender-50/80 border border-lavender-200/50 hover:bg-lavender-100/80 transition-colors duration-200"
          >
            View All <ArrowRight className="h-3 w-3 ml-1" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {[
            { title: "Best power drill for mounting TVs", views: 342, hot: true, time: "3h ago", replies: 18 },
            { title: "How to find studs without a stud finder", views: 289, hot: false, time: "5h ago", replies: 12 },
            { title: "Wall anchors vs. toggle bolts comparison", views: 215, hot: false, time: "1d ago", replies: 9 },
            { title: "Mounting a TV on drywall safely", views: 198, hot: true, time: "2d ago", replies: 14 },
          ].map((topic, i) => (
            <motion.div
              key={i}
              className="group/card cursor-pointer bg-white/70 hover:bg-white rounded-lg p-3 border border-lavender-200/30 hover:border-lavender-300/50 transition-all duration-200 relative overflow-hidden"
              whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(147, 51, 234, 0.08)" }}
            >
              {/* Card accent */}
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-lavender-300/40 via-lavender-400/20 to-lavender-300/40 rounded-l-lg"></div>

              <div className="flex justify-between items-start pl-2">
                <div className="text-sm text-gray-800 group-hover/card:text-lavender-700 transition-colors line-clamp-1 font-medium">
                  {topic.title}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pl-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-xs text-gray-500">
                    <Eye className="h-3 w-3 mr-1 text-lavender-400" />
                    <span>{topic.views}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <MessageSquare className="h-3 w-3 mr-1 text-lavender-400" />
                    <span>{topic.replies}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  {topic.hot && (
                    <span className="mr-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-lavender-100 text-lavender-700 font-medium">
                      <TrendingUp className="h-2 w-2 mr-0.5" /> Hot
                    </span>
                  )}
                  <div className="text-xs text-gray-400">{topic.time}</div>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-lavender-300 to-lavender-400 transform scale-x-0 group-hover/card:scale-x-100 transition-transform duration-300 origin-left"></div>
            </motion.div>
          ))}
        </div>

        {/* Add this to your globals.css or inline style */}
        <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-shimmer {
          animation: shimmer 6s infinite;
        }
      `}</style>
      </div>

      {/* Topics list */}
      <div className="space-y-3 mb-6">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <motion.div
              key={topic.id}
              className={`${
                viewMode === "card" ? "p-6" : "p-5"
              } flex flex-col rounded-xl border bg-card text-card-foreground transition-all cursor-pointer group relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] ${activeTopic === topic.id ? "border-lavender-400/60 bg-lavender-50/40" : "hover:border-lavender-300/60"}
${viewMode === "card" ? "min-h-[240px]" : "min-h-[120px]"}`}
              onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
              whileTap={{ scale: 0.99 }}
              layout
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-lavender-400/10 to-transparent rounded-bl-full transform transition-transform duration-700 group-hover:scale-110"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-lavender-500/10 to-transparent rounded-tr-full transform transition-transform duration-700 group-hover:scale-110"></div>

              {/* Animated accent line */}
              <div
                className={`absolute h-[3px] w-1/2 bg-gradient-to-r from-transparent via-lavender-500/70 to-transparent top-0 left-0 ${activeTopic === topic.id ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
              ></div>

              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_10px_10px,rgba(var(--primary-rgb),0.4)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

              {/* Bookmark button with enhanced styling */}
              <div
                className="absolute top-3 right-3 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleBookmark(topic.id)
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.2, rotate: userBookmarks.includes(topic.id) ? 0 : 20 }}
                  whileTap={{ scale: 0.9 }}
                  className={`h-8 w-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                    userBookmarks.includes(topic.id)
                      ? "bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-md shadow-yellow-200/30"
                      : "bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  <Star
                    className={`h-4 w-4 ${
                      userBookmarks.includes(topic.id)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-lavender-400 hover:text-lavender-500"
                    }`}
                  />
                </motion.button>
              </div>

              {viewMode === "card" ? (
                <>
                  <div className="flex justify-between items-start pr-8">
                    <div>
                      <div className="flex items-center">
                        <div className="text-base font-medium text-gray-800 group-hover:text-lavender-700 transition-colors duration-200">
                          {topic.title}
                        </div>
                        {topic.replies > 10 && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-lavender-100 text-lavender-700 rounded-full flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" /> Hot
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {topic.tags.map((tag) => (
                          <div
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full bg-white/80 text-xs flex items-center text-lavender-700 font-medium border border-lavender-200/70 shadow-sm"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-lavender-400 mr-1.5"></span>
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-gray-500 font-medium">{topic.lastActive}</div>
                      <div className="flex items-center justify-end mt-1.5 space-x-3">
                        <div className="flex items-center px-2 py-1 rounded-full bg-white/70 border border-lavender-200/50 shadow-sm">
                          <MessageSquare className="h-3 w-3 mr-1 text-lavender-500" />
                          <span className="text-gray-700 font-medium">{topic.replies}</span>
                        </div>
                        <div className="flex items-center px-2 py-1 rounded-full bg-white/70 border border-lavender-200/50 shadow-sm">
                          <ThumbsUp className="h-3 w-3 mr-1 text-lavender-500" />
                          <span className="text-gray-700 font-medium">{topic.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview text with enhanced styling */}
                  <div className="mt-4 text-sm text-gray-600 line-clamp-2 leading-relaxed bg-white/50 p-3 rounded-lg border border-lavender-100/50">
                    {topic.preview}
                  </div>

                  {/* Author info with enhanced styling */}
                  <div
                    className="flex items-center mt-5 pt-4 border-t border-lavender-200/30"
                    onMouseEnter={() => setShowUserTooltip(topic.id)}
                    onMouseLeave={() => setShowUserTooltip(null)}
                  >
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-r from-lavender-300 to-lavender-400 flex items-center justify-center text-sm font-bold text-white border border-lavender-200/50 shadow-md">
                        {topic.author.charAt(0)}
                      </div>

                      {/* User tooltip with enhanced styling */}
                      {showUserTooltip === topic.id && (
                        <motion.div
                          className="absolute bottom-full left-0 mb-2 w-60 bg-white rounded-lg shadow-xl p-4 z-50 border border-lavender-200"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2, type: "spring", stiffness: 500 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-lavender-400 to-lavender-500 flex items-center justify-center text-base font-bold text-white shadow-md">
                              {topic.author.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{topic.author}</div>
                              <div className="text-xs text-gray-500">Member since 2023</div>
                              <div className="flex items-center mt-2 text-xs text-gray-600">
                                <div className="flex items-center bg-lavender-50 px-2 py-1 rounded-full">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                  <span>4.8</span>
                                </div>
                                <span className="mx-1.5">•</span>
                                <div className="flex items-center bg-lavender-50 px-2 py-1 rounded-full">
                                  <MessageSquare className="h-3 w-3 text-lavender-500 mr-1" />
                                  <span>42 topics</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-b border-r border-lavender-200 transform rotate-45"></div>
                        </motion.div>
                      )}
                    </div>
                    <div className="ml-2">
                      <span className="text-sm font-medium text-gray-700">{topic.author}</span>
                      <div className="text-xs text-gray-500">Active contributor</div>
                    </div>
                  </div>

                  {/* Expanded topic with responses - enhanced styling */}
                  {activeTopic === topic.id && (
                    <motion.div
                      className="mt-5 pt-5 border-t border-lavender-200/30"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-4">
                        {topic.responses && topic.responses.length > 0 ? (
                          topic.responses.map((response, index) => (
                            <div
                              key={index}
                              className="bg-white/70 rounded-lg p-4 border border-lavender-200/50 min-h-[120px] shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white"
                            >
                              <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-lavender-200 to-lavender-300 flex items-center justify-center text-xs font-bold text-white border border-lavender-200/30 shadow-sm">
                                  {response.author.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-700">{response.author}</span>
                                      <span className="mx-2 text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-500">{response.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        className="p-1.5 rounded-full hover:bg-lavender-100/50 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleVote(topic.id, index, "up")
                                        }}
                                      >
                                        <ThumbsUp
                                          className={`h-3.5 w-3.5 ${
                                            userVotes[`${topic.id}-${index}`]?.up
                                              ? "text-lavender-500 fill-lavender-500"
                                              : "text-gray-400"
                                          }`}
                                        />
                                      </button>
                                      <span className="text-xs font-medium text-gray-600">{response.likes}</span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-2 bg-lavender-50/50 p-3 rounded-lg border border-lavender-100/30">
                                    {response.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-sm text-gray-500 bg-white/50 rounded-lg border border-lavender-200/30">
                            <MessageSquare className="h-5 w-5 mx-auto mb-2 text-lavender-300" />
                            <p>No responses yet. Be the first to reply!</p>
                          </div>
                        )}
                      </div>

                      {/* Reply form with enhanced styling */}
                      <div className="mt-5 flex gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-lavender-300 to-lavender-400 flex items-center justify-center text-sm font-bold text-white border border-lavender-200/50 shadow-md">
                          Y
                        </div>
                        <div className="flex-1 relative">
                          <textarea
                            placeholder="Write a reply..."
                            className="w-full h-36 px-4 py-3 text-sm bg-white rounded-lg border border-lavender-200/70 focus:border-lavender-400/60 focus:ring-2 focus:ring-lavender-300/30 outline-none transition-colors resize-none shadow-sm"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            variant="default"
                            size="sm"
                            className="absolute bottom-3 right-3 gap-1 text-xs bg-gradient-to-r from-lavender-400 to-lavender-500 hover:from-lavender-500 hover:to-lavender-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReply(topic.id)
                            }}
                            disabled={!replyContent.trim()}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                // Compact view with enhanced styling
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-r from-lavender-300 to-lavender-400 flex items-center justify-center text-sm font-bold text-white border border-lavender-200/50 shadow-md">
                      {topic.author.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{topic.title}</div>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="font-medium">{topic.author}</span>
                        <span className="mx-1.5">•</span>
                        <span>{topic.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <div className="flex items-center px-2 py-1 rounded-full bg-white/70 border border-lavender-200/50 shadow-sm">
                      <MessageSquare className="h-3 w-3 mr-1 text-lavender-500" />
                      <span className="text-xs text-gray-700 font-medium">{topic.replies}</span>
                    </div>
                    <div className="flex items-center px-2 py-1 rounded-full bg-white/70 border border-lavender-200/50 shadow-sm">
                      <ThumbsUp className="h-3 w-3 mr-1 text-lavender-500" />
                      <span className="text-xs text-gray-700 font-medium">{topic.likes}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground transition-all group relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-lavender-500/50" />
            <h3 className="text-sm font-medium text-gray-800 mb-1">No topics found</h3>
            <p className="text-xs text-gray-500 mb-3">
              {searchQuery ? "Try adjusting your search or filters" : "Be the first to start a discussion"}
            </p>
            <Button
              variant="default"
              size="sm"
              className="mx-auto gap-1 text-xs bg-gradient-to-r from-lavender-300 to-lavender-500 hover:from-lavender-400 hover:to-lavender-600 text-white"
              onClick={() => setShowNewTopicForm(true)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Create New Topic
            </Button>
          </div>
        )}

        {/* Load more button */}
        {filteredTopics.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full relative overflow-hidden group border-white/10 text-gray-600 hover:text-gray-800 py-3"
              onClick={loadMoreTopics}
              disabled={isLoading}
            >
              {/* Animated gradient background on hover */}
              <div className="absolute inset-0 w-full bg-gradient-to-r from-lavender-400/0 via-lavender-400/20 to-lavender-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-lavender-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading more topics...
                </span>
              ) : (
                <span className="flex items-center">
                  <ArrowRight className="mr-2 h-4 w-4 text-lavender-500" />
                  Load More Topics
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Footer spacer */}
      <div className="h-12"></div>
    </div>
  )
}

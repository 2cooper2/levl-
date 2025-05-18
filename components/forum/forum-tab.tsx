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
  WrenchIcon as ScrewDriver,
  Hammer,
  Layers,
  ThumbsUp,
  Eye,
  ArrowRight,
  CheckCircle,
  Truck,
  Droplet,
  Scissors,
  PaintBucket,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Define forumTopics
const forumTopics = [
  {
    id: 1,
    title: "Best power drill for home DIY projects under $150?",
    author: "ToolEnthusiast",
    replies: 14,
    likes: 32,
    lastActive: "2 hours ago",
    tags: ["tools", "power-tools", "recommendations"],
    preview:
      "I'm looking to invest in a quality power drill for various home projects. Need something versatile with good battery life that won't break the bank. Any recommendations under $150?",
    responses: [
      {
        author: "HandyPro",
        time: "1 hour ago",
        content:
          "The DeWalt 20V MAX has been my go-to for years. Great battery life, comes with multiple bits, and you can often find it on sale for around $130. Perfect balance of quality and price for home DIY.",
        likes: 8,
      },
      {
        author: "DIYQueen",
        time: "30 minutes ago",
        content:
          "If you want something lighter, the Bosch 12V is excellent for home use. Very comfortable grip and enough power for most household tasks. The battery lasts forever and it's usually around $120.",
        likes: 5,
      },
    ],
  },
  {
    id: 2,
    title: "Tips for assembling IKEA furniture efficiently?",
    author: "FurnitureNewbie",
    replies: 8,
    likes: 15,
    lastActive: "3 days ago",
    tags: ["assembly", "furniture", "tools"],
    preview:
      "Just bought several IKEA pieces for my new apartment. Any tips for assembling them quickly and correctly? Tools I should have on hand?",
    responses: [
      {
        author: "AssemblyExpert",
        time: "3 days ago",
        content:
          "Get a quality electric screwdriver with multiple bits - it's a game changer. Sort all hardware by type before starting, and always build drawers last.",
        likes: 7,
      },
      {
        author: "DIYEnthusiast",
        time: "3 days ago",
        content:
          "Follow the instructions in order! And use a rubber mallet instead of a hammer to avoid damaging the pieces. Also, those little IKEA wrenches are terrible - use your own tools.",
        likes: 2,
      },
    ],
  },
  {
    id: 3,
    title: "Best packing materials for fragile items?",
    author: "CarefulPacker",
    replies: 5,
    likes: 10,
    lastActive: "1 week ago",
    tags: ["moving", "packing", "fragile"],
    preview:
      "I have several valuable glass and ceramic items to pack for an upcoming move. What packing materials provide the best protection beyond basic bubble wrap?",
    responses: [
      {
        author: "MoveCoordinator",
        time: "1 week ago",
        content:
          "Dish packing kits with cell dividers are excellent for glassware. For odd-shaped items, expandable foam bags that conform to the shape are worth the investment.",
        likes: 4,
      },
      {
        author: "AntiquesCollector",
        time: "1 week ago",
        content:
          "I double-box my valuable items with foam inserts between boxes. Also, microfiber cloths work better than newspaper as they don't leave print residue.",
        likes: 1,
      },
    ],
  },
  {
    id: 4,
    title: "Best anchors for hanging heavy mirrors on drywall?",
    author: "DecorLover",
    replies: 4,
    likes: 6,
    lastActive: "5 days ago",
    tags: ["mounting", "hardware", "drywall"],
    preview:
      "I have a 40-pound decorative mirror to hang on drywall. What anchors would you recommend that won't fail over time? Studs aren't in the right position.",
    responses: [
      {
        author: "HardwareSpecialist",
        time: "5 days ago",
        content:
          "Toggle bolts are your best option for heavy items on drywall. The TOGGLER SnapSkru has a 65lb rating per anchor - I'd use at least two for your mirror.",
        likes: 3,
      },
    ],
  },
  {
    id: 5,
    title: "Most effective cleaning solution for shower glass?",
    author: "CleanFreak",
    replies: 7,
    likes: 12,
    lastActive: "2 days ago",
    tags: ["cleaning", "bathroom", "glass"],
    preview:
      "My shower glass gets cloudy with hard water stains no matter what I try. What cleaning products or DIY solutions actually work for stubborn mineral buildup?",
    responses: [
      {
        author: "CleaningPro",
        time: "2 days ago",
        content:
          "Equal parts white vinegar and Dawn dish soap, heated slightly and sprayed on. Let sit for 30 minutes, then scrub with a non-scratch sponge. Follow with a squeegee after each shower.",
        likes: 5,
      },
    ],
  },
  {
    id: 6,
    title: "Tools needed for basic plumbing repairs?",
    author: "DIYPlumber",
    replies: 9,
    likes: 18,
    lastActive: "1 day ago",
    tags: ["plumbing", "tools", "repairs"],
    preview:
      "Want to handle simple plumbing issues myself. What's a good starter tool kit for tasks like fixing leaky faucets, unclogging drains, and replacing p-traps?",
    responses: [
      {
        author: "PlumbingExpert",
        time: "1 day ago",
        content:
          "Must-haves: adjustable wrench, pipe wrench, basin wrench, plunger, drain snake, plumber's tape, and a good set of screwdrivers. Add channel locks and a hacksaw for plastic pipes.",
        likes: 7,
      },
    ],
  },
  {
    id: 7,
    title: "Best technique for painting clean edges without tape?",
    author: "PaintingNewbie",
    replies: 15,
    likes: 22,
    lastActive: "3 days ago",
    tags: ["painting", "techniques", "edges"],
    preview:
      "I'm tired of paint bleeding under tape. Are there techniques for cutting in edges freehand with professional results? What brush works best for this?",
    responses: [
      {
        author: "PaintContractor",
        time: "3 days ago",
        content:
          'Use a 2-2.5" angled sash brush with quality bristles. Hold it like a pencil, load only the first 1/3 of bristles, and pull the brush along the edge with steady pressure. Practice makes perfect!',
        likes: 12,
      },
    ],
  },
  {
    id: 8,
    title: "Best drill bits for concrete walls?",
    author: "DIYMounter",
    replies: 6,
    likes: 9,
    lastActive: "4 days ago",
    tags: ["drilling", "concrete", "tools"],
    preview:
      "Need to mount several items on concrete walls. Regular bits aren't working. What type of drill bits should I use, and do I need a hammer drill or will my regular drill work?",
    responses: [
      {
        author: "ContractorPro",
        time: "4 days ago",
        content:
          "You need carbide-tipped masonry bits and ideally a hammer drill. For occasional use, Bosch Multipurpose bits work well. For many holes, invest in a rotary hammer drill - your arms will thank you.",
        likes: 4,
      },
    ],
  },
  {
    id: 9,
    title: "How to properly measure for furniture before buying?",
    author: "SpacePlanner",
    replies: 11,
    likes: 17,
    lastActive: "2 days ago",
    tags: ["furniture", "measuring", "planning"],
    preview:
      "I've made mistakes buying furniture that didn't fit my space well. What's the best approach to measuring rooms and planning furniture layout before purchasing?",
    responses: [
      {
        author: "InteriorDesigner",
        time: "2 days ago",
        content:
          "Create a floor plan with all measurements, including windows, doors, and their swing paths. Account for walking paths (min 30\"). Use painter's tape on the floor to visualize size. Don't forget to measure doorways for delivery!",
        likes: 8,
      },
    ],
  },
  {
    id: 10,
    title: "In-wall cable management solutions for mounted TVs?",
    author: "CableHater",
    replies: 8,
    likes: 14,
    lastActive: "6 days ago",
    tags: ["mounting", "cables", "organization"],
    preview:
      "What are the best products for running TV cables through walls? Looking for something that's code-compliant and relatively easy to install for a DIYer.",
    responses: [
      {
        author: "AVInstaller",
        time: "6 days ago",
        content:
          "Legrand's in-wall power and cable management kits are excellent and code-compliant. They include everything you need and are fairly straightforward to install if you're comfortable cutting drywall.",
        likes: 6,
      },
    ],
  },
  {
    id: 11,
    title: "Best grass seed for shady areas?",
    author: "GreenThumb",
    replies: 7,
    likes: 11,
    lastActive: "5 days ago",
    tags: ["landscaping", "lawn", "shade"],
    preview:
      "Part of my yard gets only 2-3 hours of direct sunlight. Regular grass seed isn't thriving there. What varieties work best in shady conditions in the Northeast?",
    responses: [
      {
        author: "LandscaperPro",
        time: "5 days ago",
        content:
          "Fine fescues are your best bet for shade. Look for a mix with Creeping Red Fescue, Chewings Fescue, and Hard Fescue. Jonathan Green's Shady Nooks blend has worked well for my clients.",
        likes: 6,
      },
    ],
  },
  {
    id: 12,
    title: "Space-saving home office organization ideas?",
    author: "WFHWarrior",
    replies: 10,
    likes: 19,
    lastActive: "3 days ago",
    tags: ["organization", "home-office", "small-space"],
    preview:
      "My home office is tiny (8x8 ft). Looking for creative storage and organization solutions that maximize the limited space while keeping everything accessible.",
    responses: [
      {
        author: "OrganizationConsultant",
        time: "3 days ago",
        content:
          "Wall-mounted monitor arms free up desk space. Use vertical storage with floating shelves. A pegboard system for frequently used items keeps them accessible without cluttering your desk.",
        likes: 7,
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
          id: topics.length + 1,
          title: "Recommended power tools for a beginner DIYer?",
          author: "ToolNewbie",
          replies: 8,
          likes: 14,
          lastActive: "6 days ago",
          tags: ["tools", "beginner", "recommendations"],
          preview:
            "Setting up my first home workshop. What are the essential power tools I should invest in first? Looking for quality but budget-friendly options.",
          responses: [],
        },
        {
          id: topics.length + 2,
          title: "Best way to remove old wallpaper without damaging walls?",
          author: "RenovationRookie",
          replies: 11,
          likes: 19,
          lastActive: "3 days ago",
          tags: ["wallpaper", "removal", "walls"],
          preview:
            "Bought a house with outdated wallpaper in several rooms. What's the most effective method to remove it without damaging the drywall underneath?",
          responses: [],
        },
        {
          id: topics.length + 3,
          title: "Recommendations for cordless vacuum for pet hair?",
          author: "DogOwner",
          replies: 7,
          likes: 16,
          lastActive: "4 days ago",
          tags: ["cleaning", "vacuum", "pets"],
          preview:
            "Have two shedding dogs and hardwood floors with area rugs. Need a powerful cordless vacuum specifically good for pet hair. Budget around $300.",
          responses: [],
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
    { id: "painting", name: "Painting", icon: <PaintBucket className="h-3.5 w-3.5" /> },
    { id: "tools", name: "Tools", icon: <ScrewDriver className="h-3.5 w-3.5" /> },
    { id: "furniture", name: "Furniture", icon: <Truck className="h-3.5 w-3.5" /> },
    { id: "cleaning", name: "Cleaning", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "plumbing", name: "Plumbing", icon: <Droplet className="h-3.5 w-3.5" /> },
    { id: "landscaping", name: "Landscaping", icon: <Scissors className="h-3.5 w-3.5" /> },
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
          className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-60"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(233,213,255,0.3) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(233,213,255,0.25) 1px, transparent 1px)",
            backgroundSize: "20px 20px, 25px 25px",
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
            <motion.div
              className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: searchQuery ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="h-5 w-5 bg-lavender-100 rounded-full flex items-center justify-center text-lavender-500 hover:bg-lavender-200 transition-colors"
                onClick={() => setSearchQuery("")}
              >
                <span className="sr-only">Clear search</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </motion.div>
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
          {["All Topics", "Recommendations", "How-To", "Tips & Tricks", "Product Reviews", "DIY Projects"].map(
            (category) => (
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
            ),
          )}
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
      <div className="flex overflow-x-auto pb-2 -mx-1 px-1 hide-scrollbar space-x-2 mb-2 relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-lavender-400/30 to-transparent"></div>

        {categories.map((category) => (
          <motion.button
            key={category.id}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center relative ${
              activeCategory === category.id
                ? "bg-gradient-to-r from-lavender-400 to-lavender-600 text-white shadow-lg shadow-lavender-400/20"
                : "bg-white/90 text-gray-700 hover:bg-lavender-50 border border-lavender-200/70"
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
            {
              title: "Best drill bits for different wall materials",
              views: 342,
              hot: true,
              time: "3h ago",
              replies: 18,
            },
            {
              title: "Top-rated paint brands for bathroom humidity",
              views: 289,
              hot: false,
              time: "5h ago",
              replies: 12,
            },
            { title: "Cable management solutions for mounted TVs", views: 215, hot: false, time: "1d ago", replies: 9 },
            { title: "Most durable anchors for heavy mirrors", views: 198, hot: true, time: "2d ago", replies: 14 },
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
      <div className="space-y-4 mb-8">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className={`${
                viewMode === "card" ? "p-6" : "p-5"
              } flex flex-col rounded-xl border bg-card text-card-foreground cursor-pointer group relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] ${activeTopic === topic.id ? "border-lavender-400/60 bg-lavender-50/40" : "hover:border-lavender-300/60"}
${viewMode === "card" ? "min-h-[240px]" : "min-h-[120px]"}`}
              onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
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
                    <div className="flex-1">
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
                            className="px-2.5 py-0.5 rounded-full bg-white/80 text-xs flex items-center text-lavender-700 font-medium border border-lavender-200/70 shadow-sm hover:bg-lavender-50 hover:border-lavender-300/70 transition-all duration-200"
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
                  <div className="mt-4 text-sm text-gray-600 line-clamp-2 leading-relaxed bg-white/50 p-3 rounded-lg border border-lavender-100/50 hover:bg-white/80 transition-all duration-200">
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
                    <div className="mt-5 pt-5 border-t border-lavender-200/30">
                      <div className="space-y-4 mt-2 overflow-visible">
                        {topic.responses && topic.responses.length > 0 ? (
                          topic.responses.map((response, index) => (
                            <div
                              key={index}
                              className="bg-white/80 rounded-lg p-4 shadow-sm border border-lavender-100/50"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center">
                                    <div className="h-7 w-7 rounded-full bg-gradient-to-r from-lavender-300 to-lavender-400 flex items-center justify-center text-sm font-bold text-white border border-lavender-200/50 shadow-md mr-2">
                                      {response.author.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{response.author}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">{response.time}</div>
                                  <div className="mt-2 text-gray-600">{response.content}</div>
                                </div>
                                <div className="flex items-center">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`flex items-center px-2 py-1 rounded-full transition-colors duration-200 ${
                                      userVotes[`${topic.id}-${index}`]?.up
                                        ? "bg-lavender-100 text-lavender-700"
                                        : "bg-white/70 text-gray-600 hover:bg-lavender-50"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleVote(topic.id, index, "up")
                                    }}
                                  >
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    <span>{response.likes}</span>
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`ml-2 flex items-center px-2 py-1 rounded-full transition-colors duration-200 ${
                                      userVotes[`${topic.id}-${index}`]?.down
                                        ? "bg-red-100 text-red-700"
                                        : "bg-white/70 text-gray-600 hover:bg-red-50"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleVote(topic.id, index, "down")
                                    }}
                                  >
                                    <ThumbsUp className="h-3 w-3 mr-1 transform rotate-180" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500">No responses yet. Be the first to reply!</div>
                        )}
                      </div>

                      {/* Reply input */}
                      <div className="mt-5">
                        <textarea
                          placeholder="Write your reply..."
                          className="w-full h-20 px-3 py-2 text-sm bg-white/5 dark:bg-black/20 rounded-md border border-white/10 focus:border-lavender-500/50 focus:ring-1 focus:ring-lavender-400/30 outline-none transition-colors resize-none text-gray-800"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-1 text-xs bg-gradient-to-r from-lavender-300 to-lavender-500 hover:from-lavender-400 hover:to-lavender-600 text-white"
                            onClick={() => handleReply(topic.id)}
                            disabled={!replyContent.trim()}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Post Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-base font-medium text-gray-800 group-hover:text-lavender-700 transition-colors duration-200">
                      {topic.title}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-1">{topic.preview}</div>
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
              )}
            </div>
          ))
        ) : (
          <div className="text-gray-500">No topics found.</div>
        )}
        {isLoading && <div className="text-center">Loading more topics...</div>}
        {!isLoading && filteredTopics.length > 0 && (
          <div className="text-center">
            <Button variant="outline" onClick={loadMoreTopics}>
              Load More Topics
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

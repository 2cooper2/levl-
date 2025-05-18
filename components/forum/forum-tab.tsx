"use client"

import type React from "react"

import { useState } from "react"
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

  return (
    <div className="space-y-4">
      {/* Notification toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
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
      <div className="bg-gradient-to-br from-purple-50/90 via-lavender-100/80 to-white/90 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-lavender-300/50 transition-all duration-300 hover:shadow-lavender-200/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors duration-200" />
            </div>
            <Input
              type="text"
              placeholder="Search forum topics..."
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-lavender-200 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 bg-white/80 hover:bg-white transition-all duration-200 text-sm placeholder:text-gray-400"
              value={searchQuery}
              onChange={handleSearch}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-xs text-gray-400">Press / to search</span>
            </div>
          </div>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/90 to-purple-500 hover:from-primary hover:to-purple-400 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-md hover:shadow-primary/20 active:scale-[0.98] group"
            onClick={() => setShowNewTopicForm(true)}
          >
            <PlusCircle className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Topic</span>
          </button>
        </div>

        {/* Forum categories */}
        <div className="flex flex-wrap gap-2 mb-2">
          {["All Topics", "Announcements", "Discussions", "Questions", "Resources", "Events"].map((category) => (
            <button
              key={category}
              className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 ${
                category === "All Topics"
                  ? "bg-primary/10 text-primary font-medium border-2 border-primary/20"
                  : "bg-lavender-50 text-gray-600 hover:bg-lavender-100 border border-lavender-200/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort options */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="font-medium">Sort by:</span>
            <div className="flex items-center gap-3">
              {["Latest", "Popular", "Unanswered"].map((option, index) => (
                <button
                  key={option}
                  className={`transition-colors duration-200 ${
                    index === 0 ? "text-primary font-medium" : "hover:text-gray-700"
                  }`}
                  onClick={() => setSortBy(index === 0 ? "recent" : index === 1 ? "popular" : "replies")}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3" />
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
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-primary/20 mb-4 relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_10px_10px,rgba(var(--primary-rgb),0.4)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
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
                  className="w-full h-24 px-3 py-2 text-sm bg-white/5 dark:bg-black/20 rounded-md border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-colors resize-none text-gray-800"
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                />
                <div className="absolute right-2 bottom-2 text-xs text-gray-500">{newTopicContent.length}/500</div>
              </div>

              <div className="flex items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Target className="h-3.5 w-3.5 text-primary/60" />
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
                  className="gap-1 text-xs bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
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
      <div className="flex overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide space-x-1 mb-1 relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

        {categories.map((category) => (
          <motion.button
            key={category.id}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center relative ${
              activeCategory === category.id
                ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/20"
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
                      "0 0 0px 0px rgba(147, 51, 234, 0)",
                      "0 0 8px 2px rgba(147, 51, 234, 0.3)",
                      "0 0 0px 0px rgba(147, 51, 234, 0)",
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
      <div className="bg-gradient-to-br from-white/80 via-lavender-50/80 to-white/80 backdrop-blur-sm rounded-xl p-3 mb-2 border border-lavender-200/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full"></div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-primary/10 to-transparent rounded-tr-full"></div>

        <div className="flex items-center justify-between mb-3 relative z-10">
          <h4 className="text-xs font-medium text-gray-800 flex items-center">
            <div className="h-5 w-5 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center mr-1.5">
              <TrendingUp className="h-3 w-3 text-primary" />
            </div>
            Trending Topics
          </h4>
          <motion.button
            whileHover={{ scale: 1.05, x: 1 }}
            whileTap={{ scale: 0.95 }}
            className="text-xs text-primary flex items-center"
          >
            View All <ArrowRight className="h-3 w-3 ml-1" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { title: "Best power drill for beginners", views: 342, hot: true },
            { title: "How to find studs without a stud finder", views: 289 },
            { title: "Wall anchors vs. toggle bolts", views: 215 },
            { title: "Mounting a TV on drywall safely", views: 198 },
          ].map((topic, i) => (
            <motion.div
              key={i}
              className="group cursor-pointer bg-white/50 hover:bg-white rounded-lg p-2 border border-transparent hover:border-lavender-200/70 transition-all duration-200"
              whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            >
              <div className="flex justify-between items-start">
                <div className="text-xs text-gray-700 group-hover:text-primary transition-colors line-clamp-1 font-medium">
                  {topic.title}
                  {topic.hot && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">
                      <TrendingUp className="h-2 w-2 mr-0.5" /> Hot
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center text-xs text-gray-500">
                  <Eye className="h-3 w-3 mr-1 text-gray-400" />
                  {topic.views} views
                </div>
                <div className="text-xs text-gray-400">3h ago</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Topics list */}
      <div className="space-y-2">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <motion.div
              key={topic.id}
              className={`${
                viewMode === "card" ? "p-5" : "p-4"
              } rounded-xl bg-gradient-to-br from-white/95 via-lavender-50/80 to-white/90 backdrop-blur-sm border hover:border-primary/40 transition-all duration-300 relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md ${
                activeTopic === topic.id ? "border-primary/40 bg-primary/5 shadow-primary/10" : "border-lavender-200/50"
              }`}
              onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
              whileHover={{ scale: 1.01, y: -2, boxShadow: "0 8px 24px rgba(147, 51, 234, 0.08)" }}
              layout
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-bl-full"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-full"></div>

              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_10px_10px,rgba(var(--primary-rgb),0.4)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

              {/* Bookmark button */}
              <div
                className="absolute top-3 right-3 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleBookmark(topic.id)
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Star
                    className={`h-4 w-4 ${userBookmarks.includes(topic.id) ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`}
                  />
                </motion.button>
              </div>

              {viewMode === "card" ? (
                <>
                  <div className="flex justify-between items-start pr-8">
                    <div>
                      <div className="flex items-center">
                        <div className="text-base font-medium text-gray-800 group-hover:text-primary transition-colors duration-200">
                          {topic.title}
                        </div>
                        {topic.replies > 10 && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" /> Hot
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {topic.tags.map((tag) => (
                          <div
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full bg-lavender-100/80 text-xs flex items-center text-primary/80 font-medium border border-lavender-200/50"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/70 mr-1.5"></span>
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-gray-500 font-medium">{topic.lastActive}</div>
                      <div className="flex items-center justify-end mt-1.5 space-x-3">
                        <div className="flex items-center px-2 py-1 rounded-full bg-lavender-50/80 border border-lavender-200/30">
                          <MessageSquare className="h-3 w-3 mr-1 text-primary" />
                          <span className="text-gray-700 font-medium">{topic.replies}</span>
                        </div>
                        <div className="flex items-center px-2 py-1 rounded-full bg-lavender-50/80 border border-lavender-200/30">
                          <ThumbsUp className="h-3 w-3 mr-1 text-primary/70" />
                          <span className="text-gray-700 font-medium">{topic.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview text */}
                  <div className="mt-3 text-sm text-gray-600 line-clamp-2 leading-relaxed">{topic.preview}</div>

                  {/* Author info */}
                  <div
                    className="flex items-center mt-4 pt-3 border-t border-lavender-200/30"
                    onMouseEnter={() => setShowUserTooltip(topic.id)}
                    onMouseLeave={() => setShowUserTooltip(null)}
                  >
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-primary border border-lavender-200/50 shadow-sm">
                        {topic.author.charAt(0)}
                      </div>

                      {/* User tooltip */}
                      {showUserTooltip === topic.id && (
                        <motion.div
                          className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-lg shadow-lg p-3 z-50 border border-lavender-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                              {topic.author.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{topic.author}</div>
                              <div className="text-xs text-gray-500">Member since 2023</div>
                              <div className="flex items-center mt-1 text-xs text-gray-600">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-0.5" />
                                <span>4.8</span>
                                <span className="mx-1">•</span>
                                <span>42 topics</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <div className="ml-2">
                      <span className="text-sm font-medium text-gray-700">{topic.author}</span>
                      <div className="text-xs text-gray-500">Active contributor</div>
                    </div>
                  </div>

                  {/* Expanded topic with responses */}
                  {activeTopic === topic.id && (
                    <motion.div
                      className="mt-4 pt-4 border-t border-lavender-200/30"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-3">
                        {topic.responses && topic.responses.length > 0 ? (
                          topic.responses.map((response, index) => (
                            <div key={index} className="bg-white/50 rounded-lg p-3 border border-lavender-200/30">
                              <div className="flex items-start gap-3">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 flex items-center justify-center text-xs font-bold text-primary border border-lavender-200/30">
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
                                        className="p-1 rounded-full hover:bg-lavender-100/50 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleVote(topic.id, index, "up")
                                        }}
                                      >
                                        <ThumbsUp
                                          className={`h-3.5 w-3.5 ${
                                            userVotes[`${topic.id}-${index}`]?.up
                                              ? "text-primary fill-primary"
                                              : "text-gray-400"
                                          }`}
                                        />
                                      </button>
                                      <span className="text-xs font-medium text-gray-600">{response.likes}</span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{response.content}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-3 text-sm text-gray-500">
                            No responses yet. Be the first to reply!
                          </div>
                        )}
                      </div>

                      {/* Reply form */}
                      <div className="mt-3 flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-primary border border-lavender-200/50">
                          Y
                        </div>
                        <div className="flex-1 relative">
                          <textarea
                            placeholder="Write a reply..."
                            className="w-full h-20 px-3 py-2 text-sm bg-white rounded-lg border border-lavender-200/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-colors resize-none"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            variant="default"
                            size="sm"
                            className="absolute bottom-2 right-2 gap-1 text-xs bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
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
                // Compact view
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-primary border border-lavender-200/50 shadow-sm">
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
                    <div className="flex items-center px-2 py-1 rounded-full bg-lavender-50/80 border border-lavender-200/30">
                      <MessageSquare className="h-3 w-3 mr-1 text-primary" />
                      <span className="text-xs text-gray-700 font-medium">{topic.replies}</span>
                    </div>
                    <div className="flex items-center px-2 py-1 rounded-full bg-lavender-50/80 border border-lavender-200/30">
                      <ThumbsUp className="h-3 w-3 mr-1 text-primary/70" />
                      <span className="text-xs text-gray-700 font-medium">{topic.likes}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary/50" />
            <h3 className="text-sm font-medium text-gray-800 mb-1">No topics found</h3>
            <p className="text-xs text-gray-500 mb-3">
              {searchQuery ? "Try adjusting your search or filters" : "Be the first to start a discussion"}
            </p>
            <Button
              variant="default"
              size="sm"
              className="mx-auto gap-1 text-xs bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
              onClick={() => setShowNewTopicForm(true)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Create New Topic
            </Button>
          </div>
        )}

        {/* Load more button */}
        {filteredTopics.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Button
              variant="outline"
              size="sm"
              className="w-full relative overflow-hidden group border-white/10 text-gray-600 hover:text-gray-800"
              onClick={loadMoreTopics}
              disabled={isLoading}
            >
              {/* Animated gradient background on hover */}
              <div className="absolute inset-0 w-full bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
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
                  <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                  Load More Topics
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

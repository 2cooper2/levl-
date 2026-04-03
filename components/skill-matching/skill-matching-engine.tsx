"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion"
import {
  Brain,
  Sparkles,
  Zap,
  ArrowRight,
  Search,
  X,
  Check,
  Star,
  Users,
  Clock,
  Briefcase,
  Award,
  Cpu,
  Lightbulb,
  Compass,
  Shuffle,
  DollarSign,
  TrendingUp,
  BarChart,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { useRouter } from "next/navigation"

// Define skill categories with their respective skills
const skillCategories = [
  {
    id: "tech",
    name: "Technology",
    icon: Cpu,
    color: "#9333ea",
    skills: ["Web Development", "Mobile Apps", "Data Science", "UI/UX Design", "DevOps", "Blockchain"],
  },
  {
    id: "creative",
    name: "Creative",
    icon: Lightbulb,
    color: "#8b5cf6",
    skills: ["Graphic Design", "Video Editing", "Animation", "Illustration", "Photography", "Music Production"],
  },
  {
    id: "business",
    name: "Business",
    color: "#6366f1",
    icon: Briefcase,
    skills: ["Marketing", "Sales", "Consulting", "Project Management", "Financial Analysis", "Legal Services"],
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    color: "#ec4899",
    icon: Compass,
    skills: [
      "Fitness Training",
      "Nutrition",
      "Interior Design",
      "Personal Shopping",
      "Travel Planning",
      "Life Coaching",
    ],
  },
]

// Define skill matching results
const matchingResults = [
  {
    id: 1,
    skill: "Web Development",
    category: "Technology",
    matchScore: 98,
    description: "Building and maintaining websites with responsive design and modern frameworks.",
    demandLevel: "Very High",
    avgEarnings: "$75/hr",
    topProviders: 1240,
    growthRate: "+15% yearly",
    requiredSkills: ["HTML/CSS", "JavaScript", "React", "Node.js", "Responsive Design"],
    relatedSkills: ["UI/UX Design", "Mobile Apps", "DevOps"],
    projectTypes: ["E-commerce Sites", "Web Applications", "Corporate Websites", "Blogs & Portfolios"],
    learningPath: [
      { name: "HTML/CSS Fundamentals", duration: "2 weeks" },
      { name: "JavaScript Essentials", duration: "4 weeks" },
      { name: "Frontend Frameworks", duration: "6 weeks" },
      { name: "Backend Development", duration: "8 weeks" },
      { name: "Full Stack Projects", duration: "10 weeks" },
    ],
  },
  {
    id: 2,
    skill: "Digital Marketing",
    category: "Business",
    matchScore: 95,
    description: "Promoting products and services using digital channels to reach consumers.",
    demandLevel: "High",
    avgEarnings: "$65/hr",
    topProviders: 980,
    growthRate: "+12% yearly",
    requiredSkills: ["SEO", "Social Media", "Content Marketing", "Email Marketing", "Analytics"],
    relatedSkills: ["Copywriting", "Graphic Design", "Video Production"],
    projectTypes: ["Social Media Campaigns", "SEO Optimization", "Email Marketing", "Content Strategy"],
    learningPath: [
      { name: "Marketing Fundamentals", duration: "2 weeks" },
      { name: "SEO & SEM Basics", duration: "3 weeks" },
      { name: "Social Media Marketing", duration: "4 weeks" },
      { name: "Analytics & Reporting", duration: "3 weeks" },
      { name: "Campaign Management", duration: "6 weeks" },
    ],
  },
  {
    id: 3,
    skill: "UI/UX Design",
    category: "Creative",
    matchScore: 92,
    description: "Creating intuitive, accessible, and visually appealing user interfaces and experiences.",
    demandLevel: "High",
    avgEarnings: "$70/hr",
    topProviders: 860,
    growthRate: "+18% yearly",
    requiredSkills: ["User Research", "Wireframing", "Prototyping", "Visual Design", "Usability Testing"],
    relatedSkills: ["Graphic Design", "Web Development", "Product Management"],
    projectTypes: ["Mobile App Interfaces", "Website Redesigns", "Design Systems", "User Research"],
    learningPath: [
      { name: "Design Principles", duration: "3 weeks" },
      { name: "User Research Methods", duration: "4 weeks" },
      { name: "Wireframing & Prototyping", duration: "5 weeks" },
      { name: "Interaction Design", duration: "6 weeks" },
      { name: "Design Systems", duration: "4 weeks" },
    ],
  },
]

// Define the SkillMatchingEngine component
export function SkillMatchingEngine() {
  const [step, setStep] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [matchResults, setMatchResults] = useState<typeof matchingResults>([])
  const [selectedResult, setSelectedResult] = useState<(typeof matchingResults)[0] | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipContent, setTooltipContent] = useState("")
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const inView = useInView(containerRef, { once: false, threshold: 0.2 })
  const router = useRouter()

  // Handle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Handle skill selection
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  // Filter skills based on search query
  const filteredSkills = searchQuery
    ? skillCategories
        .flatMap((category) => category.skills)
        .filter((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  // Handle form submission
  const handleSubmit = () => {
    setIsAnalyzing(true)

    // Simulate AI analysis with a delay
    setTimeout(() => {
      setMatchResults(matchingResults)
      setStep(3)
      setIsAnalyzing(false)
    }, 3000)
  }

  // Handle result selection
  const handleResultSelect = (result: (typeof matchingResults)[0]) => {
    setSelectedResult(result)
    setStep(4)
  }

  // Handle tooltip display
  const handleTooltip = (content: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setTooltipContent(content)
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
    setShowTooltip(true)
  }

  // Animate when in view
  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  // Reset tooltip on mouse leave
  const handleTooltipLeave = () => {
    setShowTooltip(false)
  }

  // Generate random particles for background effect
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
  }))

  return (
    <motion.section
      ref={containerRef}
      className={`w-full py-16 md:py-24 relative overflow-hidden ${isExpanded ? "min-h-[800px]" : "min-h-[500px]"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 z-0" />

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
          }}
        />
      ))}

      {/* Neural network visualization */}
      <div className="absolute inset-0 z-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={i}>
              <motion.circle
                cx={`${Math.random() * 100}%`}
                cy={`${Math.random() * 100}%`}
                r="3"
                fill="#9333ea"
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <motion.path
                d={`M ${Math.random() * 100}% ${Math.random() * 100}% Q ${Math.random() * 100}% ${Math.random() * 100}%, ${Math.random() * 100}% ${Math.random() * 100}%`}
                stroke="url(#neuralGradient)"
                strokeWidth="1"
                fill="none"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          initial="hidden"
          animate={controls}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Brain className="h-4 w-4 mr-2" />
            <span>AI-Powered Skill Matching</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <span className="block">Discover Your Perfect</span>
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              Skill Match
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our advanced AI analyzes your preferences and market demand to find the perfect skill match for your career
            growth or project needs.
          </p>
        </motion.div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900/30 overflow-hidden"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate={controls}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Progress bar */}
            <div className="relative h-1.5 bg-gray-100 dark:bg-gray-800">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-indigo-500"
                initial={{ width: "25%" }}
                animate={{ width: `${step * 25}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Step indicator */}
            <div className="flex justify-between px-8 pt-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      stepNumber <= step ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    }`}
                    animate={
                      stepNumber === step
                        ? {
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              "0 0 0 0 rgba(147, 51, 234, 0)",
                              "0 0 0 10px rgba(147, 51, 234, 0.3)",
                              "0 0 0 0 rgba(147, 51, 234, 0)",
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: stepNumber === step ? Number.POSITIVE_INFINITY : 0 }}
                  >
                    {stepNumber}
                  </motion.div>
                  <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    {stepNumber === 1
                      ? "Interests"
                      : stepNumber === 2
                        ? "Skills"
                        : stepNumber === 3
                          ? "Results"
                          : "Details"}
                  </span>
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Select categories */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl font-semibold mb-4">What are you interested in?</h3>
                    <p className="text-muted-foreground mb-6">
                      Select the categories that interest you to help our AI find your perfect skill match.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {skillCategories.map((category) => (
                        <motion.div
                          key={category.id}
                          className={`relative rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                            selectedCategories.includes(category.id)
                              ? "bg-primary/10 border-2 border-primary"
                              : "bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent hover:border-primary/30"
                          }`}
                          onClick={() => toggleCategory(category.id)}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <category.icon className="h-5 w-5" style={{ color: category.color }} />
                          </div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{category.skills.length} skills</p>

                          {selectedCategories.includes(category.id) && (
                            <motion.div
                              className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <Check className="h-3 w-3 text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-8 flex justify-end">
                      <EnhancedButton onClick={() => setStep(2)} disabled={selectedCategories.length === 0}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </EnhancedButton>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Select skills */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl font-semibold mb-4">What skills interest you?</h3>
                    <p className="text-muted-foreground mb-6">
                      Select specific skills or search for skills you're interested in learning or hiring.
                    </p>

                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search for skills..."
                        className="pl-10 pr-4 py-2 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {searchQuery && filteredSkills.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium mb-2">Search Results</h4>
                        <div className="flex flex-wrap gap-2">
                          {filteredSkills.map((skill) => (
                            <motion.div
                              key={skill}
                              className={`px-3 py-1.5 rounded-full text-sm cursor-pointer ${
                                selectedSkills.includes(skill)
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                              }`}
                              onClick={() => toggleSkill(skill)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {skill}
                              {selectedSkills.includes(skill) ? (
                                <X className="ml-1 h-3 w-3 inline" />
                              ) : (
                                <Plus className="ml-1 h-3 w-3 inline" />
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {selectedCategories.map((categoryId) => {
                        const category = skillCategories.find((c) => c.id === categoryId)
                        if (!category) return null

                        return (
                          <div key={categoryId} className="mb-4">
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                              <category.icon className="h-4 w-4 mr-1.5" style={{ color: category.color }} />
                              {category.name}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {category.skills.map((skill) => (
                                <motion.div
                                  key={skill}
                                  className={`px-3 py-1.5 rounded-full text-sm cursor-pointer ${
                                    selectedSkills.includes(skill)
                                      ? "bg-primary text-white"
                                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                  }`}
                                  onClick={() => toggleSkill(skill)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {skill}
                                  {selectedSkills.includes(skill) ? (
                                    <X className="ml-1 h-3 w-3 inline" />
                                  ) : (
                                    <Plus className="ml-1 h-3 w-3 inline" />
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-8 flex justify-between">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <EnhancedButton onClick={handleSubmit} disabled={selectedSkills.length === 0}>
                        Find Matches <Sparkles className="ml-2 h-4 w-4" />
                      </EnhancedButton>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Analyzing or Results */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isAnalyzing ? (
                      <div className="py-12 flex flex-col items-center">
                        <motion.div
                          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 180, 360],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        >
                          <Brain className="h-10 w-10 text-primary" />
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-2">Analyzing your preferences</h3>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                          Our AI is analyzing your selections and matching them with market demand and growth
                          opportunities.
                        </p>

                        <div className="w-full max-w-md h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-indigo-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5 }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Your Skill Matches</h3>
                        <p className="text-muted-foreground mb-6">
                          Based on your preferences and current market demand, here are your top skill matches.
                        </p>

                        <div className="space-y-4">
                          {matchResults.map((result) => (
                            <motion.div
                              key={result.id}
                              className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/30 p-4 cursor-pointer hover:shadow-md transition-all duration-300"
                              onClick={() => handleResultSelect(result)}
                              whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.1)" }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: result.id * 0.1 }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <h4 className="text-lg font-semibold">{result.skill}</h4>
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                      {result.category}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{result.description}</p>

                                  <div className="flex flex-wrap gap-4 mt-3">
                                    <div className="flex items-center">
                                      <Zap className="h-4 w-4 text-amber-500 mr-1.5" />
                                      <span className="text-sm">Demand: {result.demandLevel}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <DollarSign className="h-4 w-4 text-green-500 mr-1.5" />
                                      <span className="text-sm">Avg: {result.avgEarnings}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <TrendingUp className="h-4 w-4 text-indigo-500 mr-1.5" />
                                      <span className="text-sm">{result.growthRate}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-center">
                                  <div className="relative w-16 h-16">
                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                                      <motion.circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="#9333ea"
                                        strokeWidth="10"
                                        strokeDasharray="283"
                                        strokeDashoffset="283"
                                        initial={{ strokeDashoffset: 283 }}
                                        animate={{
                                          strokeDashoffset: 283 - (283 * result.matchScore) / 100,
                                        }}
                                        transition={{ duration: 1.5, delay: result.id * 0.1 }}
                                        strokeLinecap="round"
                                        transform="rotate(-90 50 50)"
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-lg font-bold">{result.matchScore}%</span>
                                    </div>
                                  </div>
                                  <span className="text-xs text-muted-foreground mt-1">Match Score</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <div className="mt-8 flex justify-between">
                          <Button variant="outline" onClick={() => setStep(2)}>
                            Back
                          </Button>
                          <Button variant="outline" onClick={() => setSelectedCategories([])}>
                            <Shuffle className="mr-2 h-4 w-4" /> Try Different Skills
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 4: Detailed View */}
                {step === 4 && selectedResult && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{selectedResult.skill}</h3>
                        <div className="flex items-center mt-1">
                          <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            {selectedResult.category}
                          </span>
                          <span className="ml-2 text-sm text-muted-foreground">{selectedResult.matchScore}% Match</span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Results
                      </Button>
                    </div>

                    <p className="text-muted-foreground">{selectedResult.description}</p>

                    {/* Tabs */}
                    <div className="border-b">
                      <div className="flex space-x-6">
                        {["overview", "market", "learning", "projects"].map((tab) => (
                          <button
                            key={tab}
                            className={`pb-2 text-sm font-medium capitalize ${
                              activeTab === tab
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                            onClick={() => setActiveTab(tab)}
                          >
                            {tab === "overview" && <Compass className="h-4 w-4 inline mr-1.5" />}
                            {tab === "market" && <BarChart className="h-4 w-4 inline mr-1.5" />}
                            {tab === "learning" && <BookOpen className="h-4 w-4 inline mr-1.5" />}
                            {tab === "projects" && <Briefcase className="h-4 w-4 inline mr-1.5" />}
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tab content */}
                    <AnimatePresence mode="wait">
                      {activeTab === "overview" && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <Zap className="h-5 w-5 text-amber-500 mr-2" />
                                <h4 className="font-medium">Demand Level</h4>
                              </div>
                              <p className="text-2xl font-bold">{selectedResult.demandLevel}</p>
                              <p className="text-sm text-muted-foreground mt-1">Current market demand</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                                <h4 className="font-medium">Average Earnings</h4>
                              </div>
                              <p className="text-2xl font-bold">{selectedResult.avgEarnings}</p>
                              <p className="text-sm text-muted-foreground mt-1">Typical rate</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <TrendingUp className="h-5 w-5 text-indigo-500 mr-2" />
                                <h4 className="font-medium">Growth Rate</h4>
                              </div>
                              <p className="text-2xl font-bold">{selectedResult.growthRate}</p>
                              <p className="text-sm text-muted-foreground mt-1">Projected growth</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Required Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedResult.requiredSkills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Related Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedResult.relatedSkills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-3 py-1.5 bg-primary/10 rounded-full text-sm text-primary"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "market" && (
                        <motion.div
                          key="market"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-medium mb-4">Market Demand Trend</h4>
                              <div className="h-64 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 relative">
                                {/* Simplified chart visualization */}
                                <div className="absolute inset-x-0 bottom-0 h-40 flex items-end px-4">
                                  {[35, 42, 38, 45, 60, 75, 85, 82, 90, 95, 92, 98].map((value, i) => (
                                    <motion.div
                                      key={i}
                                      className="flex-1 mx-1 bg-gradient-to-t from-primary to-indigo-500 rounded-t-sm"
                                      initial={{ height: 0 }}
                                      animate={{ height: `${value}%` }}
                                      transition={{ duration: 1, delay: i * 0.05 }}
                                    />
                                  ))}
                                </div>
                                <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs text-muted-foreground px-4">
                                  <span>Jan</span>
                                  <span>Dec</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Top Industries</h4>
                                <ul className="space-y-2">
                                  {["Technology", "E-commerce", "Healthcare", "Education", "Finance"].map(
                                    (industry) => (
                                      <li key={industry} className="flex items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                                        {industry}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Geographic Demand</h4>
                                <ul className="space-y-2">
                                  {[
                                    { region: "North America", percentage: 35 },
                                    { region: "Europe", percentage: 28 },
                                    { region: "Asia Pacific", percentage: 22 },
                                    { region: "Latin America", percentage: 10 },
                                    { region: "Africa & Middle East", percentage: 5 },
                                  ].map((item) => (
                                    <li key={item.region} className="flex items-center justify-between">
                                      <span>{item.region}</span>
                                      <span className="text-sm font-medium">{item.percentage}%</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Market Insights</h4>
                              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                <p className="text-sm">
                                  The {selectedResult.skill} market is experiencing{" "}
                                  {selectedResult.growthRate.includes("+") ? "growth" : "decline"} due to increased
                                  digital transformation across industries. Companies are actively seeking professionals
                                  with these skills to remain competitive in an evolving landscape.
                                </p>
                                <div className="mt-4 flex items-center text-sm text-primary">
                                  <Lightbulb className="h-4 w-4 mr-1.5" />
                                  <span>AI-generated insight based on current market data</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "learning" && (
                        <motion.div
                          key="learning"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-medium mb-4">Learning Path</h4>
                              <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                                <div className="space-y-6">
                                  {selectedResult.learningPath.map((step, index) => (
                                    <motion.div
                                      key={index}
                                      className="relative pl-10"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                                      </div>
                                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                        <h5 className="font-medium">{step.name}</h5>
                                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                          <Clock className="h-4 w-4 mr-1.5" />
                                          <span>{step.duration}</span>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Learning Resources</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                  { type: "Online Courses", count: 24 },
                                  { type: "Books & Guides", count: 18 },
                                  { type: "Video Tutorials", count: 42 },
                                  { type: "Practice Projects", count: 15 },
                                ].map((resource) => (
                                  <div
                                    key={resource.type}
                                    className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 flex items-center justify-between"
                                  >
                                    <span>{resource.type}</span>
                                    <span className="text-sm font-medium">{resource.count} available</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Certification Options</h4>
                              <div className="space-y-2">
                                {[
                                  { name: "Professional Certification", duration: "3 months", level: "Intermediate" },
                                  { name: "Advanced Specialization", duration: "6 months", level: "Advanced" },
                                  { name: "Expert Mastery Program", duration: "12 months", level: "Expert" },
                                ].map((cert) => (
                                  <div key={cert.name} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                    <div className="flex items-center">
                                      <Award className="h-5 w-5 text-amber-500 mr-2" />
                                      <h5 className="font-medium">{cert.name}</h5>
                                    </div>
                                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                      <Clock className="h-4 w-4 mr-1.5" />
                                      <span>{cert.duration}</span>
                                      <span className="mx-2">•</span>
                                      <span>{cert.level}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "projects" && (
                        <motion.div
                          key="projects"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-medium mb-4">Common Project Types</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedResult.projectTypes.map((project, index) => (
                                  <motion.div
                                    key={project}
                                    className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                  >
                                    <h5 className="font-medium">{project}</h5>
                                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                      <Users className="h-4 w-4 mr-1.5" />
                                      <span>{Math.floor(Math.random() * 500) + 100} active projects</span>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-4">Success Stories</h4>
                              <div className="space-y-4">
                                {[
                                  {
                                    name: "Sarah Johnson",
                                    title: "Freelance Developer",
                                    story: `"I started learning ${selectedResult.skill} six months ago and have already completed 15 client projects. The demand is incredible!"`,
                                    rating: 5,
                                  },
                                  {
                                    name: "Michael Chen",
                                    title: "Agency Owner",
                                    story: `"Adding ${selectedResult.skill} services to our agency offerings increased our revenue by 40% in just one quarter."`,
                                    rating: 5,
                                  },
                                ].map((story, index) => (
                                  <motion.div
                                    key={index}
                                    className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                  >
                                    <p className="italic text-sm mb-2">{story.story}</p>
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">{story.name}</p>
                                        <p className="text-xs text-muted-foreground">{story.title}</p>
                                      </div>
                                      <div className="flex">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < story.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-primary/10 rounded-lg p-4">
                              <div className="flex items-start">
                                <div className="bg-primary/20 rounded-full p-2 mr-3">
                                  <Cpu className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium">AI Recommendation</h4>
                                  <p className="text-sm mt-1">
                                    Based on your profile and market analysis, {selectedResult.skill} is an excellent
                                    skill to develop. With high demand and strong growth projections, investing time in
                                    learning this skill could yield significant returns.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-4 flex justify-between">
                      <Button variant="outline" onClick={() => setStep(3)}>
                        Back to Results
                      </Button>
                      <EnhancedButton onClick={() => router.push("/waitlist")}>
                        Start Learning <Zap className="ml-2 h-4 w-4" />
                      </EnhancedButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="fixed bg-black/80 text-white rounded-md px-2 py-1 text-xs z-50 pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: "translate(-50%, -100%)",
            }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            {tooltipContent}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

// Helper component for the plus icon
function Plus({ className }: { className?: string }) {
  return (
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
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

// Helper component for the arrow left icon
function ArrowLeft({ className }: { className?: string }) {
  return (
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
      className={className}
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

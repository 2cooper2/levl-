"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  BarChart3,
  Settings,
  Menu,
  Plus,
  CheckCircle,
  User,
  Shield,
  Link,
  Download,
  Verified,
  RefreshCw,
  Star,
  TrendingUp,
  Zap,
  Eye,
  Lock,
  Share2,
  ExternalLink,
  Sparkles,
  Crown,
  Award,
  Target,
  DollarSign,
  Briefcase,
  Clock,
  ArrowRight,
  ChevronRight,
  Activity,
  Globe,
  Database,
  Cpu,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LevlLogo } from "@/components/levl-logo"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { FeatureBadge } from "@/components/ui/feature-badge"

// Platform data with enhanced information
const platforms = [
  {
    id: "taskrabbit",
    name: "TaskRabbit",
    logo: "TR",
    color: "from-green-400 to-green-600",
    bgColor: "bg-green-500",
    connected: true,
    jobs: 347,
    rating: 4.8,
    reviews: 298,
    earnings: "$42,150",
    tenure: "3.2 years",
    lastSync: "2 hours ago",
    status: "active",
    growth: "+12%",
    category: "Home Services",
  },
  {
    id: "thumbtack",
    name: "Thumbtack",
    logo: "TT",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-500",
    connected: true,
    jobs: 156,
    rating: 4.9,
    reviews: 142,
    earnings: "$18,900",
    tenure: "1.8 years",
    lastSync: "5 hours ago",
    status: "active",
    growth: "+8%",
    category: "Professional Services",
  },
  {
    id: "handy",
    name: "Handy",
    logo: "HD",
    color: "from-orange-400 to-orange-600",
    bgColor: "bg-orange-500",
    connected: false,
    jobs: 0,
    rating: 0,
    reviews: 0,
    earnings: "$0",
    tenure: "0 years",
    lastSync: "Never",
    status: "disconnected",
    growth: "0%",
    category: "Home Maintenance",
  },
  {
    id: "angi",
    name: "Angi",
    logo: "AG",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-500",
    connected: false,
    jobs: 0,
    rating: 0,
    reviews: 0,
    earnings: "$0",
    tenure: "0 years",
    lastSync: "Never",
    status: "disconnected",
    growth: "0%",
    category: "Home Improvement",
  },
  {
    id: "upwork",
    name: "Upwork",
    logo: "UW",
    color: "from-emerald-400 to-emerald-600",
    bgColor: "bg-emerald-500",
    connected: true,
    jobs: 89,
    rating: 4.7,
    reviews: 76,
    earnings: "$12,400",
    tenure: "2.1 years",
    lastSync: "1 day ago",
    status: "active",
    growth: "+15%",
    category: "Freelance Work",
  },
  {
    id: "fiverr",
    name: "Fiverr",
    logo: "FV",
    color: "from-green-300 to-green-500",
    bgColor: "bg-green-400",
    connected: false,
    jobs: 0,
    rating: 0,
    reviews: 0,
    earnings: "$0",
    tenure: "0 years",
    lastSync: "Never",
    status: "disconnected",
    growth: "0%",
    category: "Digital Services",
  },
]

// Enhanced Header Component
function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="border-b bg-gradient-to-r from-white/95 via-lavender-50/90 to-white/95 backdrop-blur-md px-4 lg:px-6 h-16 flex items-center justify-between relative z-10 shadow-sm">
      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-lavender-400/60 to-transparent"></div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden hover:bg-lavender-50">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <LevlLogo className="w-8 h-8" />
            <motion.div
              className="absolute inset-0 rounded-full bg-lavender-400/20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>
          <div>
            <span className="font-bold text-xl bg-gradient-to-r from-lavender-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              LevL Portal
            </span>
            <div className="text-xs text-gray-500 -mt-1">Reputation Import & Verification</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FeatureBadge type="ai" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-lavender-50">
              <Avatar className="h-8 w-8 border-2 border-lavender-200">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback className="bg-gradient-to-r from-lavender-300 to-lavender-500 text-white font-bold">
                  JD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-md border-lavender-200" align="end">
            <DropdownMenuItem className="hover:bg-lavender-50">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-lavender-50">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-lavender-50">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

// Enhanced Sidebar Component
function Sidebar({
  isOpen,
  onClose,
  currentSection,
  onSectionChange,
}: {
  isOpen: boolean
  onClose: () => void
  currentSection: string
  onSectionChange: (section: string) => void
}) {
  const navItems = [
    { id: "overview", label: "Overview", icon: Home, description: "Dashboard & stats" },
    { id: "platforms", label: "Connected Platforms", icon: Link, description: "Manage connections" },
    { id: "verification", label: "Verification Status", icon: Shield, description: "Legacy verification" },
    { id: "import", label: "Import Data", icon: Download, description: "Import history" },
    { id: "analytics", label: "Cross-Platform Analytics", icon: BarChart3, description: "Performance insights" },
    { id: "settings", label: "Settings", icon: Settings, description: "Portal preferences" },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={`
  fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-white/98 via-lavender-50/95 to-lavender-100/90 backdrop-blur-xl border-r border-lavender-200/60 shadow-[4px_0_24px_-2px_rgba(147,51,234,0.12)] transform transition-all duration-300 ease-in-out
  ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
`}
        initial={false}
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-lavender-400/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-lavender-500/10 to-transparent rounded-tr-full"></div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-lavender-50 to-purple-50 rounded-xl p-4 border border-lavender-200/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-lavender-100 rounded-lg">
                <Crown className="h-4 w-4 text-lavender-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">Legacy Verified</div>
                <div className="text-xs text-gray-500">Professional status</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">Your cross-platform reputation is verified and trusted.</div>
          </div>
        </div>

        <nav className="px-4 py-6 space-y-2 relative z-10">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = currentSection === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id)
                  onClose()
                }}
                className={`
                  w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden
                  ${
                    isActive
                      ? "bg-gradient-to-r from-lavender-100 to-lavender-50 text-lavender-700 shadow-md shadow-lavender-200/50 border border-lavender-200/50"
                      : "text-gray-700 hover:bg-lavender-50/50 hover:text-lavender-600"
                  }
                `}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-lavender-400 to-lavender-600 rounded-r-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                <div
                  className={`p-2 rounded-lg ${isActive ? "bg-lavender-200/50" : "bg-gray-100 group-hover:bg-lavender-100"} transition-colors`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${isActive ? "rotate-90" : "group-hover:translate-x-1"}`}
                />
              </motion.button>
            )
          })}
        </nav>
      </motion.div>
    </>
  )
}

// Enhanced Overview Section
function OverviewSection() {
  const connectedPlatforms = platforms.filter((p) => p.connected)
  const totalJobs = connectedPlatforms.reduce((sum, p) => sum + p.jobs, 0)
  const totalReviews = connectedPlatforms.reduce((sum, p) => sum + p.reviews, 0)
  const avgRating = connectedPlatforms.reduce((sum, p) => sum + p.rating, 0) / connectedPlatforms.length
  const totalEarnings = connectedPlatforms.reduce(
    (sum, p) => sum + Number.parseFloat(p.earnings.replace(/[$,]/g, "")),
    0,
  )

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        className="relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-lavender-100/50 via-white to-purple-100/30 rounded-2xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-lavender-400/10 to-transparent rounded-bl-full"></div>
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-full"></div>

        {/* Animated particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-lavender-400/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}

        <Card className="relative border-0 shadow-[0_25px_60px_-15px_rgba(147,51,234,0.4),0_15px_30px_-5px_rgba(147,51,234,0.3),0_5px_15px_-3px_rgba(147,51,234,0.2)] bg-white/90 backdrop-blur-xl border border-lavender-200/50">
          <CardContent className="p-8 lg:p-12">
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-lavender-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  Your Cross-Platform Legacy
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Aggregate your professional history from {connectedPlatforms.length} connected platforms and showcase
                  your verified expertise
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Jobs", value: totalJobs, icon: Briefcase, color: "lavender", suffix: "" },
                { label: "Total Reviews", value: totalReviews, icon: Star, color: "lavender", suffix: "" },
                { label: "Avg Rating", value: avgRating.toFixed(1), icon: Award, color: "lavender", suffix: "★" },
                {
                  label: "Success Rate",
                  value: "98%",
                  icon: Target,
                  color: "lavender",
                  suffix: "",
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative mb-4">
                    <div
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-${stat.color}-100 to-${stat.color}-200 flex items-center justify-center group-hover:shadow-lg transition-all duration-300`}
                    >
                      <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
                    </div>
                    <motion.div
                      className={`absolute inset-0 rounded-2xl bg-${stat.color}-400/20 scale-0 group-hover:scale-110`}
                      whileHover={{ scale: 1.1, opacity: [0, 0.5, 0] }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-gray-800 mb-1">
                    {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Platform Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {connectedPlatforms.map((platform, index) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-[0_35px_70px_-15px_rgba(147,51,234,0.4),0_20px_40px_-8px_rgba(147,51,234,0.25)] transition-all duration-500 bg-gradient-to-br from-white/95 via-lavender-50/80 to-white/95 backdrop-blur-sm border-lavender-200/60 transform hover:scale-[1.02] hover:-translate-y-2">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-lavender-400/10 to-transparent rounded-bl-full group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-full group-hover:scale-110 transition-transform duration-500"></div>

              {/* Animated accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lavender-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${platform.color} flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-${platform.bgColor}/30 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {platform.logo}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-800 group-hover:text-lavender-700 transition-colors">
                        {platform.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-600">Member for {platform.tenure}</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-600 font-semibold flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {platform.growth}
                    </div>
                    <div className="text-xs text-gray-500">{platform.category}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-3 bg-white/60 rounded-xl border border-lavender-100/50">
                    <div className="text-2xl font-bold text-gray-800">{platform.jobs}</div>
                    <div className="text-xs text-gray-600 font-medium">Jobs Completed</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-xl border border-lavender-100/50">
                    <div className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-1">
                      {platform.rating}
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div className="text-xs text-gray-600 font-medium">{platform.reviews} Reviews</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-xl border border-lavender-100/50">
                    <div className="text-2xl font-bold text-gray-800">{platform.earnings}</div>
                    <div className="text-xs text-gray-600 font-medium">Total Earned</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-xl border border-lavender-100/50">
                    <div className="text-2xl font-bold text-green-600">Active</div>
                    <div className="text-xs text-gray-600 font-medium">Status</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white/50 hover:bg-lavender-50 border-lavender-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Data
                  </EnhancedButton>
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white/50 hover:bg-lavender-50 border-lavender-200"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </EnhancedButton>
                </div>

                <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
                  <span>Last synced: {platform.lastSync}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live sync</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Verification Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50/90 via-white/95 to-emerald-50/90 border-green-200/60 shadow-[0_25px_50px_-12px_rgba(34,197,94,0.3),0_15px_30px_-5px_rgba(34,197,94,0.2)] backdrop-blur-sm">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-400/10 to-transparent rounded-bl-full"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-tr-full"></div>

          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-green-100 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <span className="text-gray-800">Legacy Verification Status</span>
                <div className="text-sm font-normal text-gray-600 mt-1">
                  Your professional history is verified and trusted
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="relative z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-100/80 to-emerald-100/80 rounded-2xl border border-green-200/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-200/50 rounded-2xl">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-green-800">Platform History Verified</div>
                    <div className="text-sm text-green-700">
                      {totalJobs} jobs and {totalReviews} reviews verified across {connectedPlatforms.length} platforms
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-600 hover:bg-green-700 text-white px-4 py-2">
                  <Verified className="w-4 h-4 mr-2" />
                  Verified
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Platforms Connected", value: `${connectedPlatforms.length}/6`, icon: Globe },
                  { label: "Data Accuracy", value: "98%", icon: Database },
                  { label: "Verification Time", value: "24h", icon: Clock },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center p-6 bg-white/80 rounded-2xl border border-green-100/50 hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="p-3 bg-green-100/50 rounded-xl w-fit mx-auto mb-3">
                      <stat.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-lavender-50 via-white to-purple-50 border-lavender-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-6 w-6 text-lavender-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Share Profile", icon: Share2, description: "Share your verified profile", color: "blue" },
                { label: "Export Data", icon: Download, description: "Download your data", color: "green" },
                {
                  label: "View Public Profile",
                  icon: ExternalLink,
                  description: "See how others see you",
                  color: "purple",
                },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  className={`p-6 bg-white/80 rounded-2xl border border-${action.color}-100/50 hover:shadow-lg transition-all duration-300 text-left group`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`p-3 bg-${action.color}-100/50 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <div className="font-semibold text-gray-800 mb-2">{action.label}</div>
                  <div className="text-sm text-gray-600">{action.description}</div>
                  <ArrowRight className="h-4 w-4 text-gray-400 mt-2 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Enhanced Platforms Section
function PlatformsSection() {
  return (
    <div className="space-y-8">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-lavender-600 to-purple-600 bg-clip-text text-transparent">
            Connected Platforms
          </h1>
          <p className="text-gray-600 mt-2">Manage your platform connections and sync your professional history</p>
        </div>
        <EnhancedButton variant="gradient" className="bg-gradient-to-r from-lavender-400 to-purple-500">
          <Plus className="w-4 h-4 mr-2" />
          Connect New Platform
        </EnhancedButton>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card
              className={`relative overflow-hidden group transition-all duration-300 ${
                platform.connected
                  ? "bg-gradient-to-br from-white via-lavender-50/30 to-white border-lavender-200/50 hover:shadow-[0_20px_40px_-8px_rgba(147,51,234,0.15)]"
                  : "bg-gradient-to-br from-gray-50 via-white to-gray-50 border-gray-200/50 hover:shadow-lg"
              }`}
            >
              {/* Status indicator */}
              <div
                className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                  platform.connected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-lavender-400/5 to-transparent rounded-bl-full group-hover:scale-110 transition-transform duration-500"></div>

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${platform.color} flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {platform.logo}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{platform.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-600">
                          {platform.connected ? `Connected • ${platform.tenure}` : "Not connected"}
                        </p>
                        <Badge
                          variant={platform.connected ? "default" : "secondary"}
                          className={platform.connected ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {platform.connected ? "Connected" : "Available"}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{platform.category}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {platform.connected ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Jobs", value: platform.jobs, icon: Briefcase },
                        { label: "Rating", value: `${platform.rating}★`, icon: Star },
                        { label: "Earned", value: platform.earnings, icon: DollarSign },
                        { label: "Growth", value: platform.growth, icon: TrendingUp },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="text-center p-4 bg-white/60 rounded-xl border border-lavender-100/50"
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <stat.icon className="h-4 w-4 text-lavender-600" />
                            <span className="text-lg font-bold text-gray-800">{stat.value}</span>
                          </div>
                          <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <EnhancedButton variant="outline" size="sm" className="flex-1 bg-white/50 hover:bg-lavender-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                      </EnhancedButton>
                      <EnhancedButton variant="outline" size="sm" className="flex-1 bg-white/50 hover:bg-lavender-50">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </EnhancedButton>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>Last synced: {platform.lastSync}</span>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Live</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 text-center">
                      <div className="p-3 bg-gray-200/50 rounded-xl w-fit mx-auto mb-4">
                        <Link className="h-6 w-6 text-gray-500" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        Connect your {platform.name} account to import your job history, reviews, and ratings.
                      </p>
                      <div className="text-sm text-gray-500 mb-4">
                        • Import job history
                        <br />• Sync reviews and ratings
                        <br />• Verify professional experience
                      </div>
                    </div>
                    <EnhancedButton
                      variant="gradient"
                      className="w-full bg-gradient-to-r from-lavender-400 to-purple-500"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Connect {platform.name}
                    </EnhancedButton>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Enhanced Verification Section
function VerificationSection() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-lavender-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Verification Status
        </h1>
        <p className="text-gray-600">Your professional legacy verification and trust indicators</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 border-green-200/50 shadow-[0_25px_60px_-15px_rgba(34,197,94,0.2)]">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-green-400/10 to-transparent rounded-bl-full"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-tr-full"></div>

          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-4 text-2xl">
              <div className="p-3 bg-green-100 rounded-2xl">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <span className="text-gray-800">Legacy Verification Complete</span>
                <div className="text-sm font-normal text-gray-600 mt-1">Professional status verified and trusted</div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="relative z-10 space-y-8">
            <div className="flex items-center gap-6 p-8 bg-gradient-to-r from-green-100/80 to-emerald-100/80 rounded-2xl border border-green-200/50">
              <div className="p-4 bg-green-200/50 rounded-2xl">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-2xl text-green-800 mb-2">Verified Professional</div>
                <div className="text-green-700 mb-4">
                  Your cross-platform history has been successfully verified and is trusted across the LevL ecosystem
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-600 hover:bg-green-700 text-white px-4 py-2">
                    <Crown className="w-4 h-4 mr-2" />
                    Legacy Verified
                  </Badge>
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Trusted Provider
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                  <Target className="h-5 w-5 text-lavender-600" />
                  Verification Details
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Identity Verification", status: "Verified", icon: User },
                    { label: "Platform History", status: "Verified", icon: Database },
                    { label: "Review Authenticity", status: "Verified", icon: Star },
                    { label: "Job Completion Rate", status: "Verified", icon: CheckCircle },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-green-100/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100/50 rounded-lg">
                          <item.icon className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">{item.label}</span>
                      </div>
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                  <Award className="h-5 w-5 text-lavender-600" />
                  Verification Benefits
                </h3>
                <div className="space-y-3">
                  {[
                    "Higher visibility in search results",
                    "Trusted provider badge display",
                    "Priority customer support access",
                    "Access to premium platform features",
                    "Enhanced profile credibility",
                    "Cross-platform reputation portability",
                  ].map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-green-100/30"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-lavender-50 via-white to-purple-50 border-lavender-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-6 w-6 text-lavender-600" />
              Platform Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platforms
                .filter((p) => p.connected)
                .map((platform, index) => (
                  <motion.div
                    key={platform.id}
                    className="flex items-center justify-between p-6 bg-white/80 rounded-2xl border border-lavender-100/50 hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${platform.color} flex items-center justify-center text-white font-bold shadow-lg`}
                      >
                        {platform.logo}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{platform.name}</div>
                        <div className="text-sm text-gray-600">
                          {platform.jobs} jobs • {platform.reviews} reviews • {platform.rating}★ rating
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{platform.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-600 text-white px-4 py-2">
                        <Verified className="w-4 h-4 mr-2" />
                        Verified
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">{platform.growth}</div>
                        <div className="text-xs text-gray-500">Growth</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Enhanced Import Section
function ImportSection() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-lavender-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Import Professional History
        </h1>
        <p className="text-gray-600">
          Import your job history, reviews, and ratings from other platforms to build your comprehensive professional
          profile
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-lavender-50 via-white to-purple-50 border-lavender-200/50 shadow-[0_20px_40px_-8px_rgba(147,51,234,0.15)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-3 bg-lavender-100 rounded-2xl">
                <Download className="h-6 w-6 text-lavender-600" />
              </div>
              Import Your Professional Legacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.id}
                  className={`border-2 rounded-2xl p-6 transition-all duration-300 ${
                    platform.connected
                      ? "border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg"
                      : "border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg hover:border-lavender-300"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${platform.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    >
                      {platform.logo}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-800">{platform.name}</div>
                      <div className="text-sm text-gray-600">{platform.category}</div>
                      <div
                        className={`text-xs font-medium mt-1 ${platform.connected ? "text-green-600" : "text-gray-500"}`}
                      >
                        {platform.connected ? "Connected & Synced" : "Not connected"}
                      </div>
                    </div>
                  </div>

                  {platform.connected ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-white/80 rounded-xl">
                          <div className="text-lg font-bold text-gray-800">{platform.jobs}</div>
                          <div className="text-xs text-gray-600">Jobs</div>
                        </div>
                        <div className="text-center p-3 bg-white/80 rounded-xl">
                          <div className="text-lg font-bold text-gray-800">{platform.reviews}</div>
                          <div className="text-xs text-gray-600">Reviews</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 bg-white/60 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Last import: {platform.lastSync}</span>
                        </div>
                        <div className="text-xs text-gray-500">Data is automatically synced every 24 hours</div>
                      </div>
                      <EnhancedButton
                        variant="outline"
                        className="w-full bg-white/50 hover:bg-green-50 border-green-200"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Re-import Latest Data
                      </EnhancedButton>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white/80 p-4 rounded-xl border border-gray-200/50">
                        <div className="text-sm text-gray-600 space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                            <span>Import job history and ratings</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                            <span>Sync reviews and feedback</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                            <span>Verify professional experience</span>
                          </div>
                        </div>
                      </div>
                      <EnhancedButton
                        variant="gradient"
                        className="w-full bg-gradient-to-r from-lavender-400 to-purple-500"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        Connect & Import from {platform.name}
                      </EnhancedButton>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.div
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-2xl">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-3 text-lg">Data Privacy & Security</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>Your data is encrypted and securely stored using industry-standard security protocols.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span>End-to-end encryption</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span>No personal client data stored</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span>GDPR compliant</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span>Data portability guaranteed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Enhanced Analytics Section
function AnalyticsSection() {
  const connectedPlatforms = platforms.filter((p) => p.connected)

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-lavender-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Cross-Platform Analytics
        </h1>
        <p className="text-gray-600">
          Comprehensive insights into your professional performance across all connected platforms
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Performance Overview",
            icon: Activity,
            data: [
              { label: "Job Completion Rate", value: 98, color: "green" },
              { label: "On-Time Delivery", value: 94, color: "blue" },
              { label: "Customer Satisfaction", value: 96, color: "purple" },
            ],
          },
          {
            title: "Platform Distribution",
            icon: Globe,
            data: connectedPlatforms.map((p) => ({
              label: p.name,
              value: p.jobs,
              color: p.bgColor.replace("bg-", ""),
            })),
          },
          {
            title: "Earnings Breakdown",
            icon: DollarSign,
            data: connectedPlatforms.map((p) => ({
              label: p.name,
              value: p.earnings,
              color: p.bgColor.replace("bg-", ""),
            })),
          },
        ].map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-white via-lavender-50/30 to-white border-lavender-200/50 hover:shadow-[0_20px_40px_-8px_rgba(147,51,234,0.15)] transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-lavender-100 rounded-xl">
                    <section.icon className="h-5 w-5 text-lavender-600" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.data.map((item, itemIndex) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{item.label}</span>
                        <span className="font-bold text-gray-800">
                          {typeof item.value === "number" && section.title === "Performance Overview"
                            ? `${item.value}%`
                            : item.value}
                        </span>
                      </div>
                      {section.title === "Performance Overview" ? (
                        <Progress value={item.value} className="h-3" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 bg-${item.color}-500 rounded`}></div>
                          <span className="text-sm font-medium text-gray-600">{item.value}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-lavender-50 via-white to-purple-50 border-lavender-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 bg-lavender-100 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-lavender-600" />
              </div>
              Rating Trends & Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {connectedPlatforms.map((platform, index) => (
                <motion.div
                  key={platform.id}
                  className="text-center p-6 bg-white/80 rounded-2xl border border-lavender-100/50 hover:shadow-lg transition-all duration-300 group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${platform.color} flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {platform.logo}
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1 flex items-center justify-center gap-1">
                    {platform.rating}
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{platform.reviews} reviews</div>
                  <div className="text-xs text-gray-500 mb-3">{platform.name}</div>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">{platform.growth}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Main Portal Component
export function LevlPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState("overview")

  const renderMainContent = () => {
    switch (currentSection) {
      case "overview":
        return <OverviewSection />
      case "platforms":
        return <PlatformsSection />
      case "verification":
        return <VerificationSection />
      case "import":
        return <ImportSection />
      case "analytics":
        return <AnalyticsSection />
      default:
        return (
          <motion.div
            className="flex items-center justify-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <div className="p-4 bg-lavender-100 rounded-2xl w-fit mx-auto mb-4">
                <Cpu className="h-8 w-8 text-lavender-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Coming Soon</h2>
              <p className="text-gray-600">This section is under development and will be available soon.</p>
            </div>
          </motion.div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-white to-lavender-100 relative">
      {/* Premium 3D background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orbs with 3D effect */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-lavender-400/30 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob shadow-[0_0_100px_rgba(147,51,234,0.3)]"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-lavender-500/25 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000 shadow-[0_0_120px_rgba(99,102,241,0.25)]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-lavender-300/20 to-purple-400/15 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>

        {/* Floating particles for depth */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-gradient-to-r from-lavender-400/40 to-purple-500/30 rounded-full shadow-lg"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* 3D grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="flex min-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
        />

        <main className="flex-1 overflow-y-auto h-screen">
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderMainContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

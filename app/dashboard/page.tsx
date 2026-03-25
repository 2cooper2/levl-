"use client"
import { PersonalizedDashboard } from "@/components/learning/personalized-dashboard"
import { SkillAssessmentTool } from "@/components/skill-assessment/assessment-tool"
import { CollaborationHub } from "@/components/collaboration/collaboration-hub"
import { MarketplaceAnalytics } from "@/components/provider/marketplace-analytics"
import { SkillChallenges } from "@/components/community/skill-challenges"
import { motion } from "framer-motion"
import { Sparkles, LayoutDashboard, ChevronRight } from "lucide-react"

// Add these imports
import { useEffect, useState } from "react"

// Add this CSS at the top of the component, before the return statement
const DashboardPage = () => {
  // Add this state and effect for the floating animations
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Add the CSS for the animations
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes pulse-slow {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 0.8; }
      }
      
      @keyframes gradient-x {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
      }
      
      @keyframes float-1 {
        0%, 100% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(-20px) translateX(10px); }
      }
      
      @keyframes float-2 {
        0%, 100% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(15px) translateX(-10px); }
      }
      
      @keyframes float-3 {
        0%, 100% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(-15px) translateX(-15px); }
      }
      
      @keyframes float-4 {
        0%, 100% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(10px) translateX(20px); }
      }
      
      @keyframes float-5 {
        0%, 100% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(-10px) translateX(-5px); }
      }
      
      @keyframes float-6 {
        0%, 100% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(20px) translateX(15px); }
      }
      
      .animate-pulse-slow {
        animation: pulse-slow 4s ease-in-out infinite;
      }
      
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      
      .animate-gradient-x {
        animation: gradient-x 15s linear infinite;
      }
      
      .bg-size-200 {
        background-size: 200% 100%;
      }
      
      .perspective {
        perspective: 1000px;
      }
      
      .rotate-x-2 {
        transform: rotateX(2deg);
      }
      
      .rotate-y-2 {
        transform: rotateY(2deg);
      }
      
      .animate-float-1 { animation: float-1 5s ease-in-out infinite; }
      .animate-float-2 { animation: float-2 7s ease-in-out infinite; }
      .animate-float-3 { animation: float-3 6s ease-in-out infinite; }
      .animate-float-4 { animation: float-4 8s ease-in-out infinite; }
      .animate-float-5 { animation: float-5 9s ease-in-out infinite; }
      .animate-float-6 { animation: float-6 10s ease-in-out infinite; }

      @keyframes particleAnimation-0 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-1 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-2 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-3 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-4 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-5 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-6 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-7 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-8 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-9 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-10 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-11 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-12 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-13 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      @keyframes particleAnimation-14 {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }

      @keyframes animate-network-line-1 {
        0%, 100% { stroke-dasharray: 0 100%; }
        50% { stroke-dasharray: 100% 0; }
      }
      @keyframes animate-network-line-2 {
        0%, 100% { stroke-dasharray: 0 100%; }
        50% { stroke-dasharray: 100% 0; }
      }
      @keyframes animate-network-line-3 {
        0%, 100% { stroke-dasharray: 0 100%; }
        50% { stroke-dasharray: 100% 0; }
      }
      @keyframes animate-network-line-4 {
        0%, 100% { stroke-dasharray: 0 100%; }
        50% { stroke-dasharray: 100% 0; }
      }
      @keyframes animate-network-line-5 {
        0%, 100% { stroke-dasharray: 0 100%; }
        50% { stroke-dasharray: 100% 0; }
      }
      @keyframes animate-network-line-6 {
        0%, 100% { stroke-dasharray: 0 100%; }
        50% { stroke-dasharray: 100% 0; }
      }

      .animate-network-line-1 {
        animation: animate-network-line-1 4s ease-in-out infinite;
        animation-delay: 0s;
      }
      .animate-network-line-2 {
        animation: animate-network-line-2 4s ease-in-out infinite;
        animation-delay: 0.5s;
      }
      .animate-network-line-3 {
        animation: animate-network-line-3 4s ease-in-out infinite;
        animation-delay: 1s;
      }
      .animate-network-line-4 {
        animation: animate-network-line-4 4s ease-in-out infinite;
        animation-delay: 1.5s;
      }
      .animate-network-line-5 {
        animation: animate-network-line-5 4s ease-in-out infinite;
        animation-delay: 2s;
      }
      .animate-network-line-6 {
        animation: animate-network-line-6 4s ease-in-out infinite;
        animation-delay: 2.5s;
      }

      .bg-noise-pattern {
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-lavender-50/50 via-white to-lavender-100/30">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-lavender-400/10 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-lavender-500/10 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      {/* Main content */}
      <div className="container mx-auto py-12 px-4 sm:px-6 relative z-10 space-y-12">
        {/* Enhanced Header section with advanced animations */}
        <div className="relative mb-16">
          {/* Animated background elements */}
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-lavender-300/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-lavender-500/5 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full bg-gradient-to-r from-lavender-400 to-lavender-500 opacity-70 animate-float-${i + 1}`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${5 + Math.random() * 5}s`,
                }}
              />
            ))}
          </div>

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 3D Card Effect Header */}
            <div className="group perspective">
              <div className="relative transform transition-all duration-500 ease-out group-hover:rotate-x-2 group-hover:rotate-y-2 group-hover:scale-[1.01]">
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-lavender-200/50 shadow-xl relative overflow-hidden">
                  {/* Enhanced Gradient overlay with animated particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Base gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-lavender-400/10 via-transparent to-lavender-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Animated gradient mesh */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-700">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)] animate-pulse-slow"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)] animate-float-1"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.1),transparent_50%)] animate-float-2"></div>
                    </div>

                    {/* Particle system */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full mix-blend-plus-lighter"
                          style={{
                            width: `${Math.random() * 6 + 2}px`,
                            height: `${Math.random() * 6 + 2}px`,
                            backgroundColor:
                              i % 3 === 0
                                ? "rgba(167,139,250,0.7)"
                                : i % 3 === 1
                                  ? "rgba(168,85,247,0.7)"
                                  : "rgba(192,132,252,0.7)",
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.3,
                            transform: "scale(0)",
                            animation: `particleAnimation-${i} ${Math.random() * 3 + 2}s ease-out infinite ${Math.random() * 2}s`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Neural network effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-1000 delay-200 pointer-events-none">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgb(167, 139, 250)" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.5" />
                          </linearGradient>
                        </defs>
                        <g stroke="url(#networkGradient)" strokeWidth="0.5">
                          <line x1="10%" y1="20%" x2="40%" y2="30%" className="animate-network-line-1" />
                          <line x1="30%" y1="60%" x2="70%" y2="50%" className="animate-network-line-2" />
                          <line x1="60%" y1="30%" x2="90%" y2="40%" className="animate-network-line-3" />
                          <line x1="20%" y1="80%" x2="60%" y2="70%" className="animate-network-line-4" />
                          <line x1="40%" y1="30%" x2="70%" y2="60%" className="animate-network-line-5" />
                          <line x1="70%" y1="40%" x2="80%" y2="70%" className="animate-network-line-6" />
                        </g>
                        <g fill="rgb(167, 139, 250)" className="animate-pulse-slow">
                          <circle cx="10%" cy="20%" r="3" />
                          <circle cx="30%" cy="60%" r="2" />
                          <circle cx="40%" cy="30%" r="4" />
                          <circle cx="60%" cy="30%" r="3" />
                          <circle cx="70%" cy="50%" r="2" />
                          <circle cx="70%" cy="60%" r="3" />
                          <circle cx="80%" cy="70%" r="2" />
                          <circle cx="90%" cy="40%" r="3" />
                          <circle cx="20%" cy="80%" r="4" />
                          <circle cx="60%" cy="70%" r="2" />
                        </g>
                      </svg>
                    </div>

                    {/* Subtle noise texture */}
                    <div
                      className="absolute inset-0 bg-noise-pattern opacity-0 group-hover:opacity-5 transition-opacity duration-700 mix-blend-overlay"
                      style={{
                        background: "radial-gradient(circle at 30% 20%, rgba(233,213,255,0.2) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    ></div>
                  </div>

                  {/* Enhanced shine effect with multiple layers */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    {/* Primary shine sweep */}
                    <div className="absolute inset-0 translate-x-full group-hover:translate-x-[-250%] bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-[-20deg] transition-transform duration-1000 ease-in-out"></div>

                    {/* Secondary subtle shines */}
                    <div className="absolute inset-0 translate-x-full group-hover:translate-x-[-250%] bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-[-20deg] transition-transform duration-1000 ease-in-out delay-100"></div>
                    <div className="absolute inset-0 translate-x-full group-hover:translate-x-[-250%] bg-gradient-to-r from-transparent via-white/5 to-transparent transform skew-x-[-20deg] transition-transform duration-1000 ease-in-out delay-200"></div>

                    {/* Edge highlight */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                      <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                      <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-start gap-5">
                      {/* Animated icon */}
                      <motion.div
                        className="relative h-16 w-16 rounded-2xl bg-gradient-to-r from-lavender-400 to-lavender-500 flex items-center justify-center shadow-lg group-hover:shadow-lavender-400/20 transition-all duration-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-lavender-400 to-lavender-500 opacity-70 blur-md group-hover:opacity-100 transition-opacity"></div>
                        <LayoutDashboard className="h-8 w-8 text-white relative z-10" />

                        {/* Pulsing ring */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-white/20 scale-[1.15] opacity-0 group-hover:opacity-100 group-hover:scale-[1.25] transition-all duration-700"></div>
                      </motion.div>

                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center text-sm text-lavender-500/70 font-medium">
                            <span className="hover:text-lavender-400 transition-colors">Home</span>
                            <ChevronRight className="h-3 w-3 mx-1" />
                            <span className="text-lavender-800">Dashboard</span>
                          </div>

                          <div className="flex items-center">
                            <span className="inline-block h-2 w-2 rounded-full bg-lavender-500 animate-pulse mr-2"></span>
                            <span className="text-xs text-lavender-600 font-medium">Live</span>
                          </div>
                        </div>

                        <h1 className="text-5xl font-bold text-lavender-800 tracking-tight mb-2">
                          Your{" "}
                          <span className="relative">
                            <span className="relative z-10 bg-gradient-to-r from-lavender-600 to-lavender-400 bg-clip-text text-transparent">
                              Dashboard
                            </span>
                            <span className="absolute bottom-1 left-0 w-full h-3 bg-lavender-300/10 rounded-full -z-10 transform skew-x-3"></span>
                          </span>
                        </h1>

                        <p className="text-lavender-600/80 max-w-2xl mt-3 leading-relaxed">
                          Track your progress, explore new skills, and connect with the community. Your personalized
                          learning journey starts here with real-time insights and recommendations.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm border border-lavender-200/50 hover:border-lavender-400/20 hover:shadow-md transition-all duration-300 group cursor-pointer">
                        <div className="relative">
                          <Sparkles className="h-4 w-4 text-lavender-500" />
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-lavender-500 animate-ping"></span>
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap">Updated just now</span>
                      </div>

                      <motion.button
                        className="flex items-center gap-2 bg-gradient-to-r from-lavender-400 to-lavender-500 text-white px-4 py-2.5 rounded-full shadow-md hover:shadow-lg hover:shadow-lavender-400/20 transition-all duration-300"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className="font-medium">Customize View</span>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 15L17 10M17 10H7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.button>
                    </div>
                  </div>

                  {/* Interactive progress indicator */}
                  <div className="mt-8 relative">
                    <div className="h-1.5 w-full bg-lavender-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lavender-400 via-lavender-500 to-lavender-400 bg-size-200 animate-gradient-x rounded-full"
                        style={{ width: "68%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-lavender-500/70">
                      <span>Weekly Progress</span>
                      <span className="font-medium text-lavender-600">68%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content grid with staggered animation */}
        <div className="grid grid-cols-1 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground transition-all relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]"
          >
            <PersonalizedDashboard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground transition-all relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]"
          >
            <SkillAssessmentTool />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground transition-all relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]"
          >
            <CollaborationHub />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground transition-all relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]"
          >
            <MarketplaceAnalytics />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground transition-all relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]"
          >
            <SkillChallenges />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

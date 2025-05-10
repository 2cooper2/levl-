"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Award,
  BookOpen,
  BarChart,
  ArrowRight,
  CheckCircle,
  Star,
  Lightbulb,
  Users,
} from "lucide-react"

export function PersonalizedDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  // Add this after the imports

  // Add this style tag inside the component before the return statement
  const spotlightRef = useRef<HTMLDivElement>(null)
  const spotlightDelayedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !spotlightDelayedRef.current) return

      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100

      // Immediate follow
      spotlightRef.current.style.setProperty("--x", `${x}%`)
      spotlightRef.current.style.setProperty("--y", `${y}%`)

      // Delayed follow with smoother animation
      setTimeout(() => {
        if (spotlightDelayedRef.current) {
          spotlightDelayedRef.current.style.setProperty("--x", `${x}%`)
          spotlightDelayedRef.current.style.setProperty("--y", `${y}%`)
        }
      }, 100)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/30 to-white p-8 rounded-2xl border border-slate-200/50 shadow-xl">
      {/* Advanced background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-primary/20 via-transparent to-transparent animate-pulse-slow"
            style={{ width: "70%", height: "70%", transform: "translate(-20%, -20%)" }}
          ></div>
          <div
            className="absolute bottom-0 right-0 w-full h-full bg-gradient-radial from-purple-500/20 via-transparent to-transparent animate-pulse-slower"
            style={{ width: "70%", height: "70%", transform: "translate(20%, 20%)" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-full h-full bg-gradient-radial from-blue-400/20 via-transparent to-transparent animate-pulse-slowest"
            style={{ width: "80%", height: "80%", transform: "translate(-50%, -50%)" }}
          ></div>
        </div>

        {/* Enhanced grid pattern with animated highlights */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-scan"></div>
        </div>

        {/* Advanced spotlight effect with multiple layers */}
        <div
          className="absolute inset-0 spotlight-advanced"
          style={{ "--x": "50%", "--y": "50%" } as React.CSSProperties}
        >
          <div
            className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent spotlight-follow"
            ref={spotlightRef}
            style={{ width: "100%", height: "100%" }}
          ></div>
          <div
            className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent spotlight-follow-delayed"
            ref={spotlightDelayedRef}
            style={{ width: "80%", height: "80%" }}
          ></div>
        </div>

        {/* Advanced Particle System */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Larger glowing particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`large-${i}`}
              className="absolute rounded-full animate-pulse-custom"
              style={{
                width: `${Math.random() * 6 + 4}px`,
                height: `${Math.random() * 6 + 4}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.4 + 0.1,
                animationDuration: `${Math.random() * 8 + 4}s`,
                animationDelay: `${Math.random() * 5}s`,
                background: `radial-gradient(circle at center, ${
                  ["rgba(var(--primary-rgb), 0.8)", "rgba(147, 51, 234, 0.8)", "rgba(59, 130, 246, 0.8)"][i % 3]
                }, transparent)`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px ${
                  ["rgba(var(--primary-rgb), 0.4)", "rgba(147, 51, 234, 0.4)", "rgba(59, 130, 246, 0.4)"][i % 3]
                }`,
                filter: "blur(1px)",
                transform: "translateZ(0)",
              }}
            ></div>
          ))}

          {/* Tiny floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`tiny-${i}`}
              className={`absolute rounded-full animate-float-${(i % 4) + 1}`}
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                animationDelay: `${Math.random() * 5}s`,
                background: "white",
                filter: "blur(0.5px)",
              }}
            ></div>
          ))}

          {/* Particle trails */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`trail-${i}`}
              className="absolute animate-trail"
              style={{
                width: "1px",
                height: `${Math.random() * 40 + 20}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.3 + 0.1,
                animationDuration: `${Math.random() * 15 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
                background: `linear-gradient(to bottom, transparent, ${
                  ["rgba(var(--primary-rgb), 0.6)", "rgba(147, 51, 234, 0.6)", "rgba(59, 130, 246, 0.6)"][i % 3]
                }, transparent)`,
                filter: "blur(1px)",
                transform: "translateZ(0) rotate(${Math.random() * 360}deg)",
              }}
            ></div>
          ))}

          {/* Constellation lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(var(--primary-rgb), 0.5)" />
                <stop offset="100%" stopColor="rgba(147, 51, 234, 0.5)" />
              </linearGradient>
            </defs>
            <g
              className="animate-dash-offset"
              style={{ "--dash-length": "20", "--dash-gap": "200" } as React.CSSProperties}
            >
              <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="url(#line-gradient)" strokeWidth="0.5" />
              <line x1="30%" y1="40%" x2="50%" y2="30%" stroke="url(#line-gradient)" strokeWidth="0.5" />
              <line x1="50%" y1="30%" x2="70%" y2="60%" stroke="url(#line-gradient)" strokeWidth="0.5" />
              <line x1="70%" y1="60%" x2="90%" y2="40%" stroke="url(#line-gradient)" strokeWidth="0.5" />
            </g>
            <g
              className="animate-dash-offset"
              style={{ "--dash-length": "20", "--dash-gap": "200", "--delay": "2s" } as React.CSSProperties}
            >
              <line x1="20%" y1="80%" x2="40%" y2="60%" stroke="url(#line-gradient)" strokeWidth="0.5" />
              <line x1="40%" y1="60%" x2="60%" y2="70%" stroke="url(#line-gradient)" strokeWidth="0.5" />
              <line x1="60%" y1="70%" x2="80%" y2="50%" stroke="url(#line-gradient)" strokeWidth="0.5" />
            </g>
          </svg>

          {/* Interactive particle nodes */}
          {Array.from({ length: 6 }).map((_, i) => {
            const x = 20 + (i % 3) * 30
            const y = 30 + Math.floor(i / 3) * 40
            return (
              <div
                key={`node-${i}`}
                className="absolute rounded-full animate-pulse-slow"
                style={{
                  width: "4px",
                  height: "4px",
                  top: `${y}%`,
                  left: `${x}%`,
                  background: "white",
                  boxShadow: "0 0 8px rgba(var(--primary-rgb), 0.8)",
                  zIndex: 1,
                }}
              ></div>
            )
          })}

          {/* Light flares */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`flare-${i}`}
              className="absolute rounded-full animate-flare"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0,
                background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
                animationDelay: `${i * 7}s`,
                animationDuration: "15s",
                filter: "blur(8px)",
                transform: "translateZ(0)",
              }}
            ></div>
          ))}
        </div>

        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center mr-4 shadow-md transform hover:scale-105 transition-transform duration-300">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 gradient-text">Your Learning Journey</h3>
              <p className="text-sm text-gray-500 mt-1">Track your progress and achievements</p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="gap-2 group hover:border-primary/50 transition-all duration-300 self-start sm:self-center"
          >
            <Calendar className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
            This Month
            <span className="sr-only">View this month's progress</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="glass-card rounded-xl p-5 border border-slate-200/50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600">Learning Streak</div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center shadow-sm">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold gradient-text">12</span>
              <span className="text-sm text-gray-500">days</span>
            </div>
            <div className="text-xs text-green-600 flex items-center mt-2 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+3 from last week</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 border border-slate-200/50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600">Hours Invested</div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-sm">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold gradient-text">24.5</span>
              <span className="text-sm text-gray-500">hours</span>
            </div>
            <div className="text-xs text-blue-600 flex items-center mt-2 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+5.5 from last month</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 border border-slate-200/50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600">Skills Improved</div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-sm">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold gradient-text">3</span>
              <span className="text-sm text-gray-500">skills</span>
            </div>
            <div className="text-xs text-purple-600 flex items-center mt-2 font-medium">
              <Award className="h-3 w-3 mr-1" />
              <span>1 new certification earned</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-3 mb-8 p-1 bg-slate-100/70 rounded-lg">
            <TabsTrigger
              value="overview"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
            >
              Skills
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
            >
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="animate-in fade-in-50 duration-300">
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-medium mb-4 flex items-center text-gray-700">
                  <Target className="h-4 w-4 mr-2 text-primary" />
                  Current Focus Areas
                </h4>

                <div className="space-y-5">
                  <div className="glass-card rounded-xl p-5 border border-slate-200/50 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between mb-2">
                      <h5 className="font-medium text-gray-800">TV Mounting</h5>
                      <span className="text-sm font-medium text-primary">75% Complete</span>
                    </div>
                    <Progress value={75} className="h-2 mb-4 bg-slate-100" />
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Next: Advanced Bracket Installation</div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs hover:bg-primary hover:text-white transition-colors duration-300"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-5 border border-slate-200/50 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between mb-2">
                      <h5 className="font-medium text-gray-800">Drywall Repair</h5>
                      <span className="text-sm font-medium text-primary">40% Complete</span>
                    </div>
                    <Progress value={40} className="h-2 mb-4 bg-slate-100" />
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Next: Patching Large Holes</div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs hover:bg-primary hover:text-white transition-colors duration-300"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-4 flex items-center text-gray-700">
                  <Award className="h-4 w-4 mr-2 text-primary" />
                  Recent Achievements
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-card rounded-xl p-4 border border-slate-200/50 hover:shadow-md transition-all duration-300 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-100 flex items-center justify-center shrink-0 shadow-sm">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800">Stud Finder Pro</h5>
                      <p className="text-sm text-gray-500 mt-1">Completed all stud finding exercises</p>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-4 border border-slate-200/50 hover:shadow-md transition-all duration-300 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-200 to-green-100 flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800">7-Day Streak</h5>
                      <p className="text-sm text-gray-500 mt-1">Learned for 7 consecutive days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="animate-in fade-in-50 duration-300">
            <div className="space-y-6">
              {[
                { name: "TV Mounting", level: 75, category: "Installation" },
                { name: "Drywall Repair", level: 40, category: "Repair" },
                { name: "Furniture Assembly", level: 60, category: "Assembly" },
                { name: "Painting", level: 25, category: "Finishing" },
              ].map((skill, i) => (
                <div
                  key={i}
                  className="glass-card rounded-xl p-5 border border-slate-200/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-gray-800">{skill.name}</h5>
                      <div className="text-xs text-gray-500 mt-1">{skill.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">{skill.level}%</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {skill.level < 30
                          ? "Beginner"
                          : skill.level < 60
                            ? "Intermediate"
                            : skill.level < 85
                              ? "Advanced"
                              : "Expert"}
                      </div>
                    </div>
                  </div>
                  <Progress value={skill.level} className="h-2 mb-3 bg-slate-100" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Advanced</span>
                    <span>Expert</span>
                  </div>
                </div>
              ))}

              <div className="text-center mt-8">
                <Button variant="outline" className="gap-2 group hover:border-primary/50 transition-all duration-300">
                  View All Skills{" "}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="animate-in fade-in-50 duration-300">
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-medium mb-4 flex items-center text-gray-700">
                  <BarChart className="h-4 w-4 mr-2 text-primary" />
                  Learning Patterns
                </h4>

                <div className="glass-card rounded-xl p-5 border border-slate-200/50 hover:shadow-md transition-all duration-300">
                  <h5 className="font-medium text-sm mb-4 text-gray-800">Best Learning Times</h5>
                  <div className="h-48 flex items-end gap-2">
                    {[3, 5, 8, 12, 15, 10, 6].map((value, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div
                          className="w-full bg-gradient-to-t from-primary/90 to-purple-500/90 rounded-t-md group-hover:from-primary group-hover:to-purple-500 transition-all duration-300 shadow-sm"
                          style={{ height: `${value * 6}px` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2 font-medium">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mt-4 bg-slate-50 p-3 rounded-lg">
                    You learn most effectively on <span className="font-medium text-primary">Wednesdays</span> and{" "}
                    <span className="font-medium text-primary">Thursdays</span>.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-4 text-gray-700">Personalized Recommendations</h4>

                <div className="space-y-4">
                  <div className="glass-card rounded-xl p-5 border border-slate-200/50 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                        <Lightbulb className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">Focus on Practical Projects</h5>
                        <p className="text-sm text-gray-600 mt-2">
                          Based on your learning style, you learn best by doing. Try completing 2-3 hands-on projects
                          this week to accelerate your progress.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-5 border border-slate-200/50 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">Join a Study Group</h5>
                        <p className="text-sm text-gray-600 mt-2">
                          We've noticed you learn faster when collaborating. There's a mounting techniques study group
                          starting this Thursday at 7 PM.
                        </p>
                        <Button
                          size="sm"
                          className="mt-3 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 transition-all duration-300 shadow-sm"
                        >
                          Join Group
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="gradient-border-container mt-8">
          <div className="gradient-border-animation"></div>
          <div className="gradient-border-content p-6 bg-white/80">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0 shadow-sm">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">Weekly Learning Goal</h4>
                <p className="text-sm text-gray-600 mt-2 mb-4">
                  You've completed <span className="font-medium text-primary">3.5 hours</span> of learning this week.
                  You're on track to reach your 5-hour goal!
                </p>
                <Progress value={70} className="h-3 mb-3 bg-slate-100 rounded-full" />
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-green-600">3.5 hours completed</span>
                  <span className="text-gray-500">1.5 hours remaining</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

{
  /* Add these keyframe animations to your globals.css or add them inline */
}
;<style jsx>{`
  @keyframes pulse-custom {
    0%, 100% { opacity: var(--initial-opacity, 0.2); transform: scale(1); }
    50% { opacity: var(--peak-opacity, 0.5); transform: scale(1.2); }
  }
  
  @keyframes trail {
    0% { 
      opacity: 0;
      transform: translateY(-100px) rotate(var(--rotation, 0deg));
    }
    10% { opacity: var(--opacity, 0.2); }
    90% { opacity: var(--opacity, 0.2); }
    100% { 
      opacity: 0;
      transform: translateY(100px) rotate(var(--rotation, 0deg));
    }
  }
  
  @keyframes dash-offset {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: 400;
    }
  }
  
  @keyframes flare {
    0%, 100% { opacity: 0; transform: scale(0.8); }
    50% { opacity: 0.05; transform: scale(1); }
  }
  
  .animate-pulse-custom {
    animation: pulse-custom var(--duration, 6s) infinite ease-in-out;
    --initial-opacity: 0.2;
    --peak-opacity: 0.5;
  }
  
  .animate-trail {
    animation: trail var(--duration, 12s) infinite linear;
    --opacity: 0.2;
    --rotation: 45deg;
  }
  
  .animate-dash-offset {
    stroke-dasharray: var(--dash-length, 20) var(--dash-gap, 200);
    animation: dash-offset 30s infinite linear;
    animation-delay: var(--delay, 0s);
  }
  
  .animate-flare {
    animation: flare var(--duration, 15s) infinite ease-in-out;
  }
`}</style>

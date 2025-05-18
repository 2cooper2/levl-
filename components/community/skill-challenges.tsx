"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, Calendar, Clock, DollarSign } from "lucide-react"

export function SkillChallenges() {
  const [activeTab, setActiveTab] = useState("featured")

  return (
    <div className="bg-gradient-to-br from-white via-lavender-50/50 to-white backdrop-blur-md p-6 rounded-xl border border-lavender-200/50 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center mr-3">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Skill Challenges</h3>
        </div>

        <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600">
          Create Challenge
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="featured">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/90 to-purple-600 text-white p-6">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10px_10px,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

              <div className="absolute top-0 right-0">
                <svg width="150" height="150" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M100 0L120 60L180 80L120 100L100 160L80 100L20 80L80 60L100 0Z"
                    fill="rgba(255,255,255,0.1)"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">Featured Challenge</div>
                  <div className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    $1,000 Prize Pool
                  </div>
                </div>

                <h4 className="text-xl font-bold mb-2">Ultimate TV Mounting Challenge</h4>
                <p className="text-white/80 mb-4">
                  Showcase your TV mounting skills by completing a series of increasingly difficult mounting scenarios.
                  Win prizes and earn client recognition!
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Participants</div>
                    <div className="text-lg font-bold">128</div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Duration</div>
                    <div className="text-lg font-bold">14 Days</div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Difficulty</div>
                    <div className="text-lg font-bold">Advanced</div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Status</div>
                    <div className="text-lg font-bold">Active</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white/70" />
                    <span className="text-sm">Ends in 8 days</span>
                  </div>
                  <Button className="bg-white text-primary hover:bg-white/90">Join Challenge</Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-lavender-100 hover:border-primary/40 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-0.5 bg-lavender-100 rounded-full text-xs font-medium text-lavender-600">
                    Intermediate
                  </div>
                  <div className="px-2 py-0.5 bg-green-100 rounded-full text-xs font-medium text-green-600 flex items-center">
                    <DollarSign className="h-3 w-3 mr-0.5" />
                    $500
                  </div>
                </div>

                <h4 className="font-medium mb-1">Furniture Assembly Sprint</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Assemble a complete bedroom set in record time while maintaining quality.
                </p>

                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>64 participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Ends in 5 days</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  View Challenge
                </Button>
              </div>

              <div className="bg-white rounded-lg p-4 border border-lavender-100 hover:border-primary/40 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-0.5 bg-purple-100 rounded-full text-xs font-medium text-purple-600">
                    Beginner Friendly
                  </div>
                  <div className="px-2 py-0.5 bg-green-100 rounded-full text-xs font-medium text-green-600 flex items-center">
                    <DollarSign className="h-3 w-3 mr-0.5" />
                    $250
                  </div>
                </div>

                <h4 className="font-medium mb-1">Perfect Paint Challenge</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Demonstrate your painting skills with perfect edges and even coverage.
                </p>

                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>92 participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Ends in 12 days</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  View Challenge
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="space-y-4">
            {[
              {
                title: "Ultimate TV Mounting Challenge",
                description:
                  "Showcase your TV mounting skills by completing a series of increasingly difficult mounting scenarios.",
                difficulty: "Advanced",
                prize: "$1,000",
                participants: 128,
                daysLeft: 8,
                progress: 60,
              },
              {
                title: "Furniture Assembly Sprint",
                description: "Assemble a complete bedroom set in record time while maintaining quality.",
                difficulty: "Intermediate",
                prize: "$500",
                participants: 64,
                daysLeft: 5,
                progress: 75,
              },
              {
                title: "Perfect Paint Challenge",
                description: "Demonstrate your painting skills with perfect edges and even coverage.",
                difficulty: "Beginner",
                prize: "$250",
                participants: 92,
                daysLeft: 12,
                progress: 40,
              },
            ].map((challenge, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 border border-lavender-100 hover:border-primary/40 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          challenge.difficulty === "Advanced"
                            ? "bg-red-100 text-red-600"
                            : challenge.difficulty === "Intermediate"
                              ? "bg-lavender-100 text-lavender-600"
                              : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {challenge.difficulty}
                      </div>
                      <div className="px-2 py-0.5 bg-green-100 rounded-full text-xs font-medium text-green-600 flex items-center">
                        <DollarSign className="h-3 w-3 mr-0.5" />
                        {challenge.prize}
                      </div>
                    </div>

                    <h4 className="font-medium">{challenge.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                  </div>

                  <Button variant="outline" size="sm" className="shrink-0">
                    Continue
                  </Button>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Your progress</span>
                    <span className="font-medium text-primary">{challenge.progress}%</span>
                  </div>
                  <Progress value={challenge.progress} className="h-2" />
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    <span>{challenge.participants} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Ends in {challenge.daysLeft} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming">
          <div className="space-y-4">
            {[
              {
                title: "Home Theater Setup Challenge",
                description: "Create the perfect home theater setup with optimal audio and visual placement.",
                difficulty: "Advanced",
                prize: "$1,500",
                startDate: "July 15, 2023",
                duration: "21 days",
              },
              {
                title: "Shelf Design Showcase",
                description: "Design and install creative shelving solutions for small spaces.",
                difficulty: "Intermediate",
                prize: "$750",
                startDate: "July 22, 2023",
                duration: "14 days",
              },
              {
                title: "Quick Fix Challenge",
                description: "Solve common household problems with creative and efficient solutions.",
                difficulty: "Beginner",
                prize: "$300",
                startDate: "July 10, 2023",
                duration: "10 days",
              },
            ].map((challenge, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 border border-lavender-100 hover:border-primary/40 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          challenge.difficulty === "Advanced"
                            ? "bg-red-100 text-red-600"
                            : challenge.difficulty === "Intermediate"
                              ? "bg-lavender-100 text-lavender-600"
                              : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {challenge.difficulty}
                      </div>
                      <div className="px-2 py-0.5 bg-green-100 rounded-full text-xs font-medium text-green-600 flex items-center">
                        <DollarSign className="h-3 w-3 mr-0.5" />
                        {challenge.prize}
                      </div>
                    </div>

                    <h4 className="font-medium">{challenge.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                  </div>

                  <Button variant="outline" size="sm" className="shrink-0">
                    Remind Me
                  </Button>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Starts on {challenge.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Duration: {challenge.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {[
              {
                title: "Speed Mounting Challenge",
                description: "Mount TVs and shelves with speed and precision.",
                difficulty: "Intermediate",
                prize: "$500",
                participants: 86,
                yourPlace: 3,
                completed: "May 28, 2023",
              },
              {
                title: "Cable Management Mastery",
                description: "Create the cleanest, most organized cable setups for home entertainment systems.",
                difficulty: "Advanced",
                prize: "$750",
                participants: 64,
                yourPlace: 12,
                completed: "May 15, 2023",
              },
              {
                title: "Beginner's DIY Challenge",
                description: "Complete a series of entry-level home improvement tasks.",
                difficulty: "Beginner",
                prize: "$250",
                participants: 120,
                yourPlace: 5,
                completed: "April 30, 2023",
              },
            ].map((challenge, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 border border-lavender-100 hover:border-primary/40 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          challenge.difficulty === "Advanced"
                            ? "bg-red-100 text-red-600"
                            : challenge.difficulty === "Intermediate"
                              ? "bg-lavender-100 text-lavender-600"
                              : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {challenge.difficulty}
                      </div>
                      <div className="px-2 py-0.5 bg-green-100 rounded-full text-xs font-medium text-green-600 flex items-center">
                        <DollarSign className="h-3 w-3 mr-0.5" />
                        {challenge.prize}
                      </div>
                    </div>

                    <h4 className="font-medium">{challenge.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                  </div>

                  <div className="bg-yellow-100 px-3 py-1 rounded-full text-yellow-700 text-sm font-medium flex items-center">
                    <Trophy className="h-3.5 w-3.5 mr-1" />
                    {challenge.yourPlace === 1
                      ? "1st Place"
                      : challenge.yourPlace === 2
                        ? "2nd Place"
                        : challenge.yourPlace === 3
                          ? "3rd Place"
                          : `${challenge.yourPlace}th Place`}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    <span>{challenge.participants} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Completed on {challenge.completed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import type React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import {
  User,
  Bell,
  Shield,
  Clock,
  Calendar,
  Star,
  CheckCircle,
  Edit,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Globe,
  FileText,
  Award,
  BookOpen,
  MessageSquare,
} from "lucide-react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
  const { user } = useAuth()

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "User Profile",
    email: user?.email || "user@example.com",
    location: "San Francisco, CA",
    profession: "Software Developer",
    about:
      "Passionate software developer with expertise in React and Next.js. I love building beautiful, responsive web applications and exploring new technologies.",
    phone: "+1 (555) 123-4567",
    website: "portfolio-website.com",
    avatar: user?.avatar || "/diverse-group.png",
  })

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSubmit = () => {
    // In a real app, you would save to backend here

    // Update the avatar if there's a preview
    if (avatarPreview) {
      setProfileData((prev) => ({
        ...prev,
        avatar: avatarPreview,
      }))
    }

    // Close the dialog and reset the preview
    setIsEditProfileOpen(false)
    setAvatarPreview(null)

    // Visual feedback (in a real app, you might use a toast notification)
    alert("Profile updated successfully!")
  }

  return (
    <div className="container py-10">
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 p-8">
        {/* Animated background pattern - hidden on mobile */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] opacity-60 sm:block hidden" />
        {/* Solid background for mobile */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 sm:hidden" />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start pb-10">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
              <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.name} />
              <AvatarFallback className="text-2xl">{profileData.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1 text-white shadow-md">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400">
                {profileData.name}
              </h1>
              <div className="flex gap-2 flex-wrap justify-center">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 transition-all duration-300 hover:bg-primary/20"
                >
                  Verified Account
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-600 border-green-500/20 transition-all duration-300 hover:bg-green-500/20"
                >
                  Top Rated
                </Badge>
              </div>
            </div>

            <p className="text-muted-foreground mb-2">{profileData.email}</p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start max-w-full">
              <div className="flex items-center gap-1.5 text-sm bg-background/50 sm:backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 hover:bg-background hover:shadow">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{profileData.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm bg-background/50 sm:backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 hover:bg-background hover:shadow">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>{profileData.profession}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm bg-background/50 sm:backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 hover:bg-background hover:shadow">
                <Clock className="h-4 w-4 text-primary" />
                <span>Member since 2023</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm bg-background/50 sm:backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 hover:bg-background hover:shadow">
                <Star className="h-4 w-4 text-amber-500" />
                <span>
                  <span className="font-medium">42</span> Reviews
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm bg-background/50 sm:backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 hover:bg-background hover:shadow">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>
                  <span className="font-medium">18</span> Jobs
                </span>
              </div>
            </div>
          </div>

          <div className="md:ml-auto flex gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 bg-background/50 sm:backdrop-blur-sm hover:bg-background transition-all duration-300 hover:shadow"
              onClick={() => setIsEditProfileOpen(true)}
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button size="sm" className="gap-1 transition-all duration-300 hover:shadow-md">
              <MessageSquare className="h-4 w-4" />
              Messages
            </Button>
          </div>
        </div>

        {/* Profile completion indicator */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="relative h-2.5 bg-gray-100/30 dark:bg-gray-800/30 sm:backdrop-blur-sm">
            <div
              className="absolute top-0 left-0 h-full w-[85%] rounded-r-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(124,58,237,0.7) 0%, rgba(139,92,246,0.8) 35%, rgba(124,58,237,0.9) 100%)",
                boxShadow: "0 0 10px rgba(124,58,237,0.5), 0 0 20px rgba(124,58,237,0.3)",
              }}
            >
              {/* Animated glow effect - hidden on mobile */}
              <div className="absolute inset-0 rounded-r-full bg-white/10 animate-pulse opacity-70 sm:block hidden"></div>

              {/* Progress markers - simplified on mobile */}
              <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-white/30 hidden sm:block"></div>
              <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-white/40 hidden sm:block"></div>
              <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-white/50 hidden sm:block"></div>
            </div>
          </div>

          <div className="flex justify-between px-2 py-1.5 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="font-medium text-primary dark:text-primary">Profile 85% complete</span>
            </div>
            <div className="flex items-center gap-1 sm:mt-0 mt-1 w-full sm:w-auto justify-end">
              <span className="text-muted-foreground text-[10px] sm:text-xs">Complete profile for all features</span>
              <svg
                className="h-3.5 w-3.5 text-primary animate-bounce hidden sm:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="relative">
          <TabsList className="w-full max-w-md mx-auto flex justify-between bg-transparent p-0 h-auto overflow-x-auto">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-transparent data-[state=active]:bg-transparent relative whitespace-nowrap"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <span className="font-medium">Overview</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-300 origin-left"></div>
            </TabsTrigger>

            <TabsTrigger
              value="activity"
              className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-transparent data-[state=active]:bg-transparent relative whitespace-nowrap"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <span className="font-medium">Activity</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-300 origin-left"></div>
            </TabsTrigger>

            <TabsTrigger
              value="security"
              className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-transparent data-[state=active]:bg-transparent relative whitespace-nowrap"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-medium">Security</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-300 origin-left"></div>
            </TabsTrigger>
          </TabsList>

          <div className="w-full h-px bg-gray-200 dark:bg-gray-800 mt-0.5"></div>
        </div>

        <TabsContent value="overview" className="space-y-4 animate-fade-in">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* About Me Card */}
            <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-950 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Card accent */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary to-purple-400"></div>

              {/* Card header with icon */}
              <div className="pt-6 px-6 flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mr-3">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-primary">About Me</h3>
              </div>

              {/* Card content */}
              <div className="p-6 pt-4">
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{profileData.about}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors group-hover:translate-x-1 duration-300">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm">{profileData.email}</span>
                  </div>

                  <div
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors group-hover:translate-x-1 duration-300"
                    style={{ transitionDelay: "50ms" }}
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{profileData.phone}</span>
                  </div>

                  <div
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors group-hover:translate-x-1 duration-300"
                    style={{ transitionDelay: "100ms" }}
                  >
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-sm">{profileData.website}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Card */}
            <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-950 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Card accent */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary to-purple-400"></div>

              {/* Card header with icon */}
              <div className="pt-6 px-6 flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mr-3">
                  <Star className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-primary">Skills</h3>
              </div>

              {/* Card content */}
              <div className="p-6 pt-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "Next.js",
                    "TypeScript",
                    "Tailwind CSS",
                    "Node.js",
                    "GraphQL",
                    "UI/UX Design",
                    "Responsive Design",
                  ].map((skill, index) => (
                    <div
                      key={skill}
                      className="bg-gray-50 dark:bg-gray-900 text-primary px-3 py-1.5 rounded-full text-sm font-medium border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-sm"
                      style={{ transitionDelay: `${index * 30}ms` }}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Achievements Card */}
            <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-950 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Card accent */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary to-purple-400"></div>

              {/* Card header with icon */}
              <div className="pt-6 px-6 flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mr-3">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-primary">Achievements</h3>
              </div>

              {/* Card content */}
              <div className="p-6 pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors group-hover:translate-x-1 duration-300">
                    <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Verified Provider</p>
                      <p className="text-sm text-muted-foreground">Completed identity verification</p>
                    </div>
                  </div>

                  <div
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors group-hover:translate-x-1 duration-300"
                    style={{ transitionDelay: "50ms" }}
                  >
                    <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Top Rated</p>
                      <p className="text-sm text-muted-foreground">Maintained 4.8+ rating</p>
                    </div>
                  </div>

                  <div
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors group-hover:translate-x-1 duration-300"
                    style={{ transitionDelay: "100ms" }}
                  >
                    <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Fast Responder</p>
                      <p className="text-sm text-muted-foreground">Responds within 2 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Services Offered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-lg border p-3">
                    <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Web Development</h3>
                      <p className="text-sm text-muted-foreground">Custom websites and web applications</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                          $75/hr
                        </Badge>
                        <span className="text-sm text-muted-foreground">⭐ 4.9 (24 reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-lg border p-3">
                    <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">UI/UX Design</h3>
                      <p className="text-sm text-muted-foreground">User interface and experience design</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                          $65/hr
                        </Badge>
                        <span className="text-sm text-muted-foreground">⭐ 4.8 (16 reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  View All Services
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/diverse-group.png" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">John Doe</span>
                      </div>
                      <div className="flex items-center text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Excellent work! Delivered the project ahead of schedule and exceeded my expectations.
                    </p>
                    <p className="text-xs text-muted-foreground">2 weeks ago</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/diverse-group.png" />
                          <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">Jane Smith</span>
                      </div>
                      <div className="flex items-center text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Great communication and very professional. Would definitely work with again.
                    </p>
                    <p className="text-xs text-muted-foreground">1 month ago</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  View All Reviews
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your activity on the platform in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Activity Timeline */}
                <div className="relative border-l pl-6 pb-2">
                  <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white -translate-x-1/2">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="font-medium">Completed Project</p>
                    <p className="text-sm text-muted-foreground">
                      Finished "E-commerce Website Redesign" for Client XYZ
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Today at 2:34 PM</p>
                  </div>
                </div>

                <div className="relative border-l pl-6 pb-2">
                  <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white -translate-x-1/2">
                    <MessageSquare className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="font-medium">New Message</p>
                    <p className="text-sm text-muted-foreground">
                      Received message from Sarah Johnson about project details
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Yesterday at 10:15 AM</p>
                  </div>
                </div>

                <div className="relative border-l pl-6 pb-2">
                  <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white -translate-x-1/2">
                    <Star className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="font-medium">New Review</p>
                    <p className="text-sm text-muted-foreground">Received a 5-star review from John Doe</p>
                    <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                  </div>
                </div>

                <div className="relative border-l pl-6 pb-2">
                  <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white -translate-x-1/2">
                    <Calendar className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="font-medium">New Booking</p>
                    <p className="text-sm text-muted-foreground">
                      Accepted booking for "Mobile App Development Consultation"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">1 week ago</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-6">
                View Full Activity Log
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Password</h3>
                <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Enabled
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Protect your account with an extra layer of security</p>
                <Button variant="outline" size="sm">
                  Manage 2FA
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-start justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <p className="font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">MacBook Pro • San Francisco, CA</p>
                      <p className="text-xs text-muted-foreground">Started 2 hours ago</p>
                    </div>
                    <Badge>Current</Badge>
                  </div>

                  <div className="flex items-start justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <p className="font-medium">iPhone 13</p>
                      <p className="text-xs text-muted-foreground">iOS 16 • San Francisco, CA</p>
                      <p className="text-xs text-muted-foreground">Started 1 day ago</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-destructive hover:text-destructive">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="destructive" size="sm">
                  Log Out All Devices
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates about your account via email</p>
                </div>
                <div className="flex h-6 w-11 items-center rounded-full bg-primary p-1 transition-colors">
                  <div className="h-4 w-4 rounded-full bg-white transition-all ml-auto"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive real-time updates on your device</p>
                </div>
                <div className="flex h-6 w-11 items-center rounded-full bg-muted p-1 transition-colors">
                  <div className="h-4 w-4 rounded-full bg-muted-foreground transition-all"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Communications</p>
                  <p className="text-sm text-muted-foreground">Receive offers, promotions, and updates</p>
                </div>
                <div className="flex h-6 w-11 items-center rounded-full bg-muted p-1 transition-colors">
                  <div className="h-4 w-4 rounded-full bg-muted-foreground transition-all"></div>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-2">
                Update Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 my-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-muted">
                <AvatarImage src={avatarPreview || profileData.avatar} alt={profileData.name} />
                <AvatarFallback className="text-2xl">{profileData.name[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <label
                  htmlFor="avatar-upload"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Click the edit icon to change your profile picture</p>
          </div>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm">
                Email
              </label>
              <Input
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="location" className="text-right text-sm">
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={profileData.location}
                onChange={handleProfileChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="profession" className="text-right text-sm">
                Profession
              </label>
              <Input
                id="profession"
                name="profession"
                value={profileData.profession}
                onChange={handleProfileChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone" className="text-right text-sm">
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="website" className="text-right text-sm">
                Website
              </label>
              <Input
                id="website"
                name="website"
                value={profileData.website}
                onChange={handleProfileChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="about" className="text-right text-sm">
                About
              </label>
              <Textarea
                id="about"
                name="about"
                value={profileData.about}
                onChange={handleProfileChange}
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProfileSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

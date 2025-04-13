"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ServicesList } from "@/components/dashboard/services-list"
import { ServiceReviews } from "@/components/services/service-reviews"
import { Calendar, Clock, MapPin, MessageSquare, Star, User } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const profile = {
    username: "alexmorgan",
    name: "Alex Morgan",
    title: "Web Developer & UI/UX Designer",
    avatar: "/placeholder.svg?height=200&width=200&text=AM",
    location: "San Francisco, CA",
    memberSince: "January 2020",
    lastActive: "2 hours ago",
    responseTime: "Under 2 hours",
    languages: ["English", "Spanish"],
    skills: ["Web Development", "UI/UX Design", "WordPress", "React", "Node.js", "Responsive Design", "E-commerce"],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "University of California, Berkeley",
        year: "2015-2019",
      },
    ],
    certifications: [
      {
        name: "Certified Web Developer",
        issuer: "Web Development Institute",
        year: "2020",
      },
      {
        name: "UI/UX Design Certification",
        issuer: "Design Academy",
        year: "2021",
      },
    ],
    bio: "I'm a passionate web developer and UI/UX designer with over 5 years of experience creating beautiful, functional websites and applications. I specialize in responsive design, e-commerce solutions, and creating seamless user experiences. My goal is to help businesses establish a strong online presence through modern, high-performing websites that convert visitors into customers.",
    stats: {
      completedProjects: 87,
      rating: 4.9,
      reviews: 124,
      onTimeDelivery: 98,
      onBudget: 100,
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" strokeWidth="0" className="text-primary" />
                <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2" />
              </svg>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                LevL
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
              Explore
            </Link>
            <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
              Messages
            </Link>
            <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32&text=JD" alt="@johndoe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                    <AvatarFallback>
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="mt-4 text-2xl font-bold">{profile.name}</h1>
                  <p className="text-muted-foreground">{profile.title}</p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{profile.stats.rating}</span>
                    <span className="text-muted-foreground">({profile.stats.reviews} reviews)</span>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {profile.location}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Member since {profile.memberSince}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {profile.lastActive}
                    </Badge>
                  </div>
                  <div className="mt-6 w-full space-y-4">
                    <Button className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                      Contact Me
                    </Button>
                    <Button variant="outline" className="w-full">
                      View Resume
                    </Button>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Languages</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.languages.map((language) => (
                        <Badge key={language} variant="secondary">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Skills</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{profile.stats.completedProjects}</p>
                    <p className="text-xs text-muted-foreground">Projects Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profile.stats.onTimeDelivery}%</p>
                    <p className="text-xs text-muted-foreground">On-time Delivery</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profile.stats.onBudget}%</p>
                    <p className="text-xs text-muted-foreground">On Budget</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profile.responseTime}</p>
                    <p className="text-xs text-muted-foreground">Response Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="mt-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold">About Me</h2>
                  <p className="mt-2 text-muted-foreground">{profile.bio}</p>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Education</h2>
                  <div className="mt-4 space-y-4">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{edu.degree}</h3>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          <p className="text-sm text-muted-foreground">{edu.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Certifications</h2>
                  <div className="mt-4 space-y-4">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Badge className="mt-0.5" variant="outline">
                          {cert.year}
                        </Badge>
                        <div>
                          <h3 className="font-medium">{cert.name}</h3>
                          <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="services" className="mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">My Services</h2>
                  <Button variant="outline" className="gap-1">
                    <MessageSquare className="h-4 w-4" /> Contact for Custom Quote
                  </Button>
                </div>
                <ServicesList />
              </TabsContent>
              <TabsContent value="reviews" className="mt-6">
                <h2 className="text-xl font-bold mb-6">Client Reviews</h2>
                <ServiceReviews />
              </TabsContent>
              <TabsContent value="portfolio" className="mt-6">
                <h2 className="text-xl font-bold mb-6">Portfolio</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Card key={item} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={`/placeholder.svg?height=300&width=500&text=Portfolio+${item}`}
                          alt={`Portfolio item ${item}`}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium">Project Title {item}</h3>
                        <p className="text-sm text-muted-foreground">
                          Brief description of the project and the technologies used.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

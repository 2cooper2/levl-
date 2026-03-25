"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Shield, Award, BadgeCheck, ChevronRight, Upload, Camera, FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VerificationBadge, type VerificationLevel } from "@/components/ui/verification-badge"
import { Progress } from "@/components/ui/progress"

interface VerificationProcessProps {
  userId: string
  currentLevel?: VerificationLevel | null
  onComplete?: (level: VerificationLevel) => void
}

export function VerificationProcess({ userId, currentLevel = null, onComplete }: VerificationProcessProps) {
  const [activeTab, setActiveTab] = useState<VerificationLevel>(currentLevel ? getNextLevel(currentLevel) : "basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "uploading" | "processing" | "completed">(
    "idle",
  )

  // Helper function to determine the next verification level
  function getNextLevel(level: VerificationLevel): VerificationLevel {
    const levels: VerificationLevel[] = ["basic", "identity", "background", "expert"]
    const currentIndex = levels.indexOf(level)
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : level
  }

  const verificationLevels = [
    {
      id: "basic" as VerificationLevel,
      title: "Basic Verification",
      description: "Verify your email and phone number",
      icon: CheckCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      requirements: ["Valid email address", "Phone number", "Agree to terms of service"],
      timeToVerify: "Instant",
      documents: [],
    },
    {
      id: "identity" as VerificationLevel,
      title: "Identity Verification",
      description: "Verify your identity with government-issued ID",
      icon: Shield,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      requirements: ["Government-issued ID (passport, driver's license)", "Selfie photo", "Address verification"],
      timeToVerify: "1-2 business days",
      documents: ["ID Card (front and back)", "Selfie with ID", "Proof of address"],
    },
    {
      id: "background" as VerificationLevel,
      title: "Background Check",
      description: "Complete a comprehensive background check",
      icon: BadgeCheck,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      requirements: [
        "Criminal background check",
        "Employment history verification",
        "Education verification",
        "Professional references",
      ],
      timeToVerify: "3-5 business days",
      documents: ["Consent form", "Employment history", "Education certificates", "Reference contacts"],
    },
    {
      id: "expert" as VerificationLevel,
      title: "Expert Certification",
      description: "Verify your professional skills and expertise",
      icon: Award,
      color: "text-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      requirements: ["Skill assessment test", "Portfolio review", "Professional certifications", "Client testimonials"],
      timeToVerify: "5-7 business days",
      documents: ["Portfolio samples", "Professional certificates", "Client references"],
    },
  ]

  const handleStartVerification = () => {
    setVerificationStatus("uploading")

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setVerificationStatus("processing")

          // Simulate processing time
          setTimeout(() => {
            setVerificationStatus("completed")
            setIsSubmitting(false)
            onComplete?.(activeTab)
          }, 2000)

          return 100
        }
        return prev + 10
      })
    }, 300)

    setIsSubmitting(true)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as VerificationLevel)
    setVerificationStatus("idle")
    setUploadProgress(0)
  }

  // Determine which levels are completed based on current level
  const isLevelCompleted = (level: VerificationLevel): boolean => {
    if (!currentLevel) return false

    const levels: VerificationLevel[] = ["basic", "identity", "background", "expert"]
    const currentIndex = levels.indexOf(currentLevel)
    const levelIndex = levels.indexOf(level)

    return levelIndex <= currentIndex
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Verification Center</h2>
          <p className="text-gray-500">Increase trust and credibility with verification badges</p>
        </div>

        {currentLevel && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Current Level:</span>
            <VerificationBadge level={currentLevel} />
          </div>
        )}
      </div>

      {/* Verification Progress */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
        <div className="relative flex justify-between">
          {verificationLevels.map((level, index) => {
            const isCompleted = isLevelCompleted(level.id)
            const isActive = activeTab === level.id

            return (
              <div key={level.id} className="flex flex-col items-center">
                <motion.div
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                        ? `${level.bgColor} ${level.color}`
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <level.icon className="w-5 h-5" />}

                  {index < verificationLevels.length - 1 && (
                    <div
                      className={`absolute top-1/2 left-full w-full h-0.5 -translate-y-1/2 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    ></div>
                  )}
                </motion.div>
                <span className="mt-2 text-xs font-medium">{level.title}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Verification Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4">
          {verificationLevels.map((level) => (
            <TabsTrigger
              key={level.id}
              value={level.id}
              disabled={
                isLevelCompleted(level.id) ||
                (currentLevel &&
                  verificationLevels.indexOf(level) >
                    verificationLevels.findIndex((l) => l.id === getNextLevel(currentLevel)))
              }
            >
              {level.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {verificationLevels.map((level) => (
          <TabsContent key={level.id} value={level.id} className="mt-6">
            <Card>
              <CardHeader className={level.bgColor}>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <level.icon className={`h-5 w-5 ${level.color}`} />
                      {level.title}
                    </CardTitle>
                    <CardDescription className="mt-1">{level.description}</CardDescription>
                  </div>

                  {isLevelCompleted(level.id) && (
                    <div className="flex items-center px-3 py-1 text-sm text-white bg-green-500 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-1" /> Verified
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {verificationStatus === "completed" ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">Verification Submitted</h3>
                    <p className="mb-6 text-center text-gray-500">
                      Your verification is being processed. We'll notify you once it's complete.
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      Estimated time: {level.timeToVerify}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="mb-2 text-sm font-medium">Requirements</h3>
                      <ul className="space-y-2">
                        {level.requirements.map((req, i) => (
                          <li key={i} className="flex items-start">
                            <ChevronRight className="w-4 h-4 mr-2 text-gray-400 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {level.documents.length > 0 && (
                      <div className="mb-6">
                        <h3 className="mb-2 text-sm font-medium">Required Documents</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {level.documents.map((doc, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center p-4 border border-dashed rounded-lg border-gray-300 hover:border-primary"
                            >
                              <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-gray-100">
                                {i === 0 ? (
                                  <FileText className="w-5 h-5 text-gray-500" />
                                ) : i === 1 ? (
                                  <Camera className="w-5 h-5 text-gray-500" />
                                ) : (
                                  <Upload className="w-5 h-5 text-gray-500" />
                                )}
                              </div>
                              <p className="mb-1 text-sm font-medium">{doc}</p>
                              <p className="text-xs text-gray-500">Click to upload</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {verificationStatus === "uploading" && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Uploading documents...</span>
                          <span className="text-sm text-gray-500">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    {verificationStatus === "processing" && (
                      <div className="flex items-center justify-center py-4 mb-6">
                        <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
                        <span className="ml-3 text-sm font-medium">Processing your verification...</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>

              <CardFooter className="flex justify-between border-t pt-6">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  Estimated time: {level.timeToVerify}
                </div>

                {!isLevelCompleted(level.id) && verificationStatus !== "completed" && (
                  <Button
                    onClick={handleStartVerification}
                    disabled={isSubmitting || verificationStatus === "processing"}
                  >
                    {verificationStatus === "idle"
                      ? "Start Verification"
                      : verificationStatus === "uploading"
                        ? "Uploading..."
                        : "Processing..."}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="flex items-center justify-center w-10 h-10 mr-4 rounded-full bg-blue-100">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-medium">Build Trust</h3>
                <p className="text-sm text-gray-500">
                  Verification badges help build trust with potential clients, increasing your chances of getting hired.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="flex items-center justify-center w-10 h-10 mr-4 rounded-full bg-green-100">
                <Award className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-medium">Stand Out</h3>
                <p className="text-sm text-gray-500">
                  Verified professionals appear higher in search results and get featured in recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="flex items-center justify-center w-10 h-10 mr-4 rounded-full bg-purple-100">
                <BadgeCheck className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-medium">Earn More</h3>
                <p className="text-sm text-gray-500">
                  Verified professionals can charge premium rates and access exclusive opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

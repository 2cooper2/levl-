"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Award, BadgeCheck, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { VerificationBadge, type VerificationLevel } from "@/components/ui/verification-badge"
import { useRouter } from "next/navigation"

interface VerificationCardProps {
  userId: string
  currentLevel?: VerificationLevel | null
  compact?: boolean
  className?: string
}

export function VerificationCard({
  userId,
  currentLevel = null,
  compact = false,
  className = "",
}: VerificationCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const verificationLevels: { id: VerificationLevel; title: string; icon: any; benefits: string[] }[] = [
    {
      id: "basic",
      title: "Basic Verification",
      icon: Shield,
      benefits: ["Email and phone verified", "Can receive messages", "Can submit proposals"],
    },
    {
      id: "identity",
      title: "Identity Verification",
      icon: Shield,
      benefits: ["Government ID verified", "Increased trust score", "Higher visibility in search"],
    },
    {
      id: "background",
      title: "Background Check",
      icon: BadgeCheck,
      benefits: ["Criminal record checked", "Employment history verified", "Featured in recommendations"],
    },
    {
      id: "expert",
      title: "Expert Certification",
      icon: Award,
      benefits: ["Skills independently verified", "Top search placement", "Access to premium clients"],
    },
  ]

  // Get the next verification level
  const getNextLevel = (): VerificationLevel => {
    if (!currentLevel) return "basic"

    const currentIndex = verificationLevels.findIndex((level) => level.id === currentLevel)
    if (currentIndex === verificationLevels.length - 1) return currentLevel

    return verificationLevels[currentIndex + 1].id
  }

  const nextLevel = getNextLevel()
  const nextLevelData = verificationLevels.find((level) => level.id === nextLevel)

  const handleVerificationClick = () => {
    router.push("/verification")
  }

  if (compact) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3">
                {currentLevel ? (
                  <VerificationBadge level={currentLevel} size="sm" />
                ) : (
                  <span className="text-xs text-gray-500">Not Verified</span>
                )}
              </div>

              {nextLevelData && currentLevel !== "expert" && (
                <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={handleVerificationClick}>
                  Upgrade to {nextLevelData.title}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Verification Status</h3>

          {currentLevel && <VerificationBadge level={currentLevel} />}
        </div>

        {currentLevel ? (
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Verification Progress</span>
                <span className="text-sm text-gray-500">
                  {verificationLevels.findIndex((level) => level.id === currentLevel) + 1} of{" "}
                  {verificationLevels.length}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${((verificationLevels.findIndex((level) => level.id === currentLevel) + 1) / verificationLevels.length) * 100}%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                ></motion.div>
              </div>
            </div>

            {currentLevel !== "expert" && nextLevelData && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Next Level: {nextLevelData.title}</h4>
                <ul className="space-y-1">
                  {nextLevelData.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start text-xs text-gray-600 dark:text-gray-300">
                      <ChevronRight className="h-3 w-3 text-primary mr-1 shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Shield className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">You're not verified yet</p>
            <p className="text-xs text-gray-500">
              Get verified to build trust and increase your chances of getting hired
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 dark:bg-gray-800 px-6 py-4">
        <Button className="w-full" onClick={handleVerificationClick} variant={isHovered ? "default" : "outline"}>
          {currentLevel ? "Upgrade Verification" : "Get Verified"}
        </Button>
      </CardFooter>
    </Card>
  )
}

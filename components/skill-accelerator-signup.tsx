"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SkillAcceleratorSignupProps {
  isOpen: boolean
  onClose: () => void
}

export function SkillAcceleratorSignup({ isOpen, onClose }: SkillAcceleratorSignupProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    location: "",
    role: "both" as "worker" | "client" | "both",
  })

  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    dob?: string
    location?: string
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as "worker" | "client" | "both" }))
  }

  const validateStep = (currentStep: number) => {
    const newErrors: {
      name?: string
      email?: string
      dob?: string
      location?: string
    } = {}

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required"
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid"
      }
    } else if (currentStep === 2) {
      if (!formData.dob) {
        newErrors.dob = "Date of birth is required"
      } else {
        // Check if user is at least 18 years old
        const dobDate = new Date(formData.dob)
        const today = new Date()
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())

        if (dobDate > eighteenYearsAgo) {
          newErrors.dob = "You must be at least 18 years old"
        }
      }

      if (!formData.location.trim()) {
        newErrors.location = "Location is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(step)) return
    if (!termsAccepted) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success state
      setIsSuccess(true)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setIsSuccess(false)
    setTermsAccepted(false)
    setFormData({
      name: "",
      email: "",
      dob: "",
      location: "",
      role: "both",
    })
  }

  const handleClose = () => {
    onClose()
    // Reset form after dialog is closed
    setTimeout(resetForm, 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md overflow-hidden bg-white border border-purple-200 shadow-md shadow-purple-100/50 max-h-[90vh] overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white opacity-80 pointer-events-none"></div>
        <DialogHeader className="pb-2 border-b border-purple-100 relative">
          <DialogTitle className="text-lg font-bold text-center">
            {isSuccess ? "Registration Complete!" : "Join Skill Accelerator"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {isSuccess
              ? "You're now part of our community!"
              : "Accelerate your skills and grow your career with our AI-powered platform."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full bg-green-100 p-3 text-green-600 mb-4"
            >
              <CheckCircle className="h-8 w-8" />
            </motion.div>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center text-lg font-medium mb-2"
            >
              Thank you for joining!
            </motion.p>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground text-center mb-6"
            >
              We'll be in touch soon with next steps.
            </motion.p>
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <Button
                onClick={handleClose}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                Return to Home
              </Button>
            </motion.div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="flex justify-between mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                      step === i
                        ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-md"
                        : step > i
                          ? "bg-purple-100 text-purple-600"
                          : "bg-purple-50 text-purple-400"
                    }`}
                  >
                    {step > i ? <CheckCircle className="h-3 w-3" /> : i}
                  </div>
                  <span className="text-[10px] mt-1 text-muted-foreground">
                    {i === 1 ? "Info" : i === 2 ? "Details" : "Role"}
                  </span>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className={`transition-all duration-200 ${errors.name ? "border-red-500 ring-1 ring-red-500" : "focus:border-purple-400 focus:ring-1 focus:ring-purple-400"}`}
                    />
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center"
                      >
                        <span className="mr-1">⚠️</span> {errors.name}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={
                        errors.email ? "border-red-500" : "focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                      }
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      className={
                        errors.dob ? "border-red-500" : "focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                      }
                    />
                    {errors.dob && <p className="text-sm text-red-500">{errors.dob}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={handleChange}
                      className={
                        errors.location
                          ? "border-red-500"
                          : "focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                      }
                    />
                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div className="space-y-3">
                    <Label>I want to join as</Label>
                    <RadioGroup
                      value={formData.role}
                      onValueChange={handleRoleChange}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2 rounded-lg border border-purple-100 p-4 hover:bg-purple-50 transition-colors cursor-pointer group">
                        <RadioGroupItem value="worker" id="worker" className="text-purple-600" />
                        <Label htmlFor="worker" className="font-normal cursor-pointer flex-1">
                          <div className="font-medium group-hover:text-purple-600 transition-colors">
                            Service Provider
                          </div>
                          <div className="text-sm text-muted-foreground">Offer your skills and earn money</div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 rounded-lg border border-purple-100 p-4 hover:bg-purple-50 transition-colors cursor-pointer group">
                        <RadioGroupItem value="client" id="client" className="text-purple-600" />
                        <Label htmlFor="client" className="font-normal cursor-pointer flex-1">
                          <div className="font-medium group-hover:text-purple-600 transition-colors">Client</div>
                          <div className="text-sm text-muted-foreground">Hire skilled professionals</div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 rounded-lg border border-purple-100 p-4 hover:bg-purple-50 transition-colors cursor-pointer group">
                        <RadioGroupItem value="both" id="both" className="text-purple-600" />
                        <Label htmlFor="both" className="font-normal cursor-pointer flex-1">
                          <div className="font-medium group-hover:text-purple-600 transition-colors">Both</div>
                          <div className="text-sm text-muted-foreground">I want to do both</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                    />
                    <Label htmlFor="terms" className="text-sm font-normal">
                      I agree to the Terms of Service and Privacy Policy
                    </Label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogFooter className="flex justify-between mt-4 gap-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  Back
                </Button>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  disabled={isSubmitting || !termsAccepted}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  ChevronRight,
  Upload,
  Trash2,
  Camera,
  PaintBucket,
  Wrench,
  Briefcase,
  Home,
  Scissors,
  Car,
  Book,
  Music,
  Code,
  Server,
  Heart,
  Utensils,
} from "lucide-react"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { MobileNav } from "@/components/mobile-nav"

const categories = [
  { id: "painting", name: "Painting", icon: <PaintBucket className="h-6 w-6" /> },
  { id: "cleaning", name: "Cleaning", icon: <Home className="h-6 w-6" /> },
  { id: "furniture", name: "Furniture Assembly", icon: <Wrench className="h-6 w-6" /> },
  { id: "handyman", name: "Handyman", icon: <Briefcase className="h-6 w-6" /> },
  { id: "haircut", name: "Haircut & Styling", icon: <Scissors className="h-6 w-6" /> },
  { id: "automotive", name: "Automotive", icon: <Car className="h-6 w-6" /> },
  { id: "tutoring", name: "Tutoring", icon: <Book className="h-6 w-6" /> },
  { id: "music", name: "Music Lessons", icon: <Music className="h-6 w-6" /> },
  { id: "programming", name: "Programming", icon: <Code className="h-6 w-6" /> },
  { id: "webdesign", name: "Web Design", icon: <Server className="h-6 w-6" /> },
  { id: "healthcare", name: "Healthcare", icon: <Heart className="h-6 w-6" /> },
  { id: "cooking", name: "Cooking", icon: <Utensils className="h-6 w-6" /> },
]

export default function AddServicePage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    tags: [],
    price: 50,
    deliveryTime: 3,
    revisions: 2,
    features: [],
    images: [],
    requirements: [],
  })

  // Redirect if not authenticated - but only after component mounts
  useEffect(() => {
    let mounted = true

    // Only redirect after component is mounted to avoid SSR issues
    if (mounted && typeof window !== "undefined" && !isAuthenticated) {
      router.push("/auth/login?redirect=/add-service")
    }

    return () => {
      mounted = false
    }
  }, [isAuthenticated, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategorySelect = (categoryId: string) => {
    setFormData((prev) => ({ ...prev, category: categoryId }))
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      e.preventDefault()
      const newTag = e.currentTarget.value.trim()
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }))
      }
      e.currentTarget.value = ""
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => {
      const features = prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature]
      return { ...prev, features }
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // In a real app, you would upload these to a storage service
    // For now, we'll just create object URLs
    const newImages = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      url: URL.createObjectURL(file),
      name: file.name,
    }))

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }))
  }

  const removeImage = (imageId: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }))
  }

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [
        ...prev.requirements,
        { id: Math.random().toString(36).substring(2, 9), question: "", type: "text" },
      ],
    }))
  }

  const updateRequirement = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req) => (req.id === id ? { ...req, [field]: value } : req)),
    }))
  }

  const removeRequirement = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((req) => req.id !== id),
    }))
  }

  const nextStep = () => {
    if (step === 1 && (!formData.title || !formData.category || !formData.description)) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields before proceeding.",
        variant: "destructive",
      })
      return
    }

    if (step < 4) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In a real app, you would submit to your API here
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call

      toast({
        title: "Service created!",
        description: "Your service has been successfully created and is now live.",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem creating your service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatedGradientBackground />
      <div className="hidden md:block">
        <EnhancedMainNav />
      </div>
      <div className="md:hidden">
        <MobileNav />
      </div>

      <main className="flex-1 container py-8 relative z-10 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              Create a New Service
            </h1>
            <p className="text-muted-foreground mt-2">Share your skills with the world and start earning</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-10 relative">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                initial={{ width: "25%" }}
                animate={{ width: `${step * 25}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <div
                className={`text-sm ${step >= 1 ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}`}
              >
                Basic Info
              </div>
              <div
                className={`text-sm ${step >= 2 ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}`}
              >
                Pricing
              </div>
              <div
                className={`text-sm ${step >= 3 ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}`}
              >
                Gallery
              </div>
              <div
                className={`text-sm ${step >= 4 ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}`}
              >
                Requirements
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl shadow-lg overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-4 md:p-6"
              >
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Basic Info */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="title" className="text-base font-medium">
                          Service Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g., Professional Painting Services"
                          className="mt-1"
                          required
                        />
                      </div>

                      <div>
                        <Label className="text-base font-medium">
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                          {categories.map((category) => (
                            <div
                              key={category.id}
                              className={`relative rounded-lg border p-3 cursor-pointer transition-all duration-200 hover:border-purple-400 ${
                                formData.category === category.id
                                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                  : "border-border"
                              }`}
                              onClick={() => handleCategorySelect(category.id)}
                            >
                              <div className="flex flex-col items-center text-center">
                                <div
                                  className={`p-2 rounded-full mb-2 ${
                                    formData.category === category.id
                                      ? "text-purple-600 dark:text-purple-400"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {category.icon}
                                </div>
                                <span className="text-sm">{category.name}</span>
                              </div>
                              {formData.category === category.id && (
                                <div className="absolute top-2 right-2 h-4 w-4 bg-purple-500 rounded-full flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-base font-medium">
                          Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe your service in detail..."
                          className="mt-1 min-h-[150px]"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="tags" className="text-base font-medium">
                          Tags
                        </Label>
                        <div className="mt-1">
                          <Input
                            id="tags"
                            placeholder="Add tags (press Enter after each tag)"
                            onKeyDown={handleTagInput}
                            className="mb-2"
                          />
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag) => (
                              <div
                                key={tag}
                                className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm flex items-center"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Pricing */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <Label className="text-base font-medium">Price</Label>
                        <div className="mt-6 px-2">
                          <Slider
                            defaultValue={[formData.price]}
                            max={500}
                            step={5}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, price: value[0] }))}
                          />
                          <div className="mt-2 text-center text-2xl font-bold text-purple-600 dark:text-purple-400">
                            ${formData.price}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div>
                          <Label htmlFor="deliveryTime" className="text-base font-medium">
                            Delivery Time (days)
                          </Label>
                          <Input
                            id="deliveryTime"
                            name="deliveryTime"
                            type="number"
                            min={1}
                            value={formData.deliveryTime}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="revisions" className="text-base font-medium">
                            Number of Revisions
                          </Label>
                          <Input
                            id="revisions"
                            name="revisions"
                            type="number"
                            min={0}
                            value={formData.revisions}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <Label className="text-base font-medium">Features Included</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {[
                            "Source Files",
                            "Commercial Use",
                            "Rush Delivery Available",
                            "Satisfaction Guarantee",
                            "Responsive Design",
                            "Premium Support",
                            "Detailed Documentation",
                            "Aftercare Service",
                          ].map((feature) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <Checkbox
                                id={`feature-${feature}`}
                                checked={formData.features.includes(feature)}
                                onCheckedChange={() => handleFeatureToggle(feature)}
                              />
                              <label
                                htmlFor={`feature-${feature}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {feature}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Gallery */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <Label className="text-base font-medium">Service Gallery</Label>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                          Upload high-quality images that showcase your service (up to 5 images)
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                          <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center ${
                              formData.images.length >= 5
                                ? "opacity-50 pointer-events-none"
                                : "border-purple-300 dark:border-purple-800"
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <Camera className="h-10 w-10 text-purple-500 dark:text-purple-400 mb-2" />
                              <p className="text-sm font-medium mb-1">Drag and drop your images here</p>
                              <p className="text-xs text-muted-foreground mb-4">PNG, JPG or WEBP (max 5MB each)</p>
                              <label
                                htmlFor="image-upload"
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer transition-colors"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Browse Files
                              </label>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={formData.images.length >= 5}
                              />
                            </div>
                          </div>

                          {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                              {formData.images.map((image) => (
                                <div key={image.id} className="relative group rounded-lg overflow-hidden">
                                  <img
                                    src={image.url || "/placeholder.svg"}
                                    alt={image.name}
                                    className="w-full h-40 object-cover rounded-lg"
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => removeImage(image.id)}
                                      className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Requirements */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center">
                          <Label className="text-base font-medium">Client Requirements</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addRequirement}
                            className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20"
                          >
                            Add Requirement
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                          Add questions that clients need to answer before ordering your service
                        </p>

                        {formData.requirements.length === 0 ? (
                          <div className="text-center py-8 border border-dashed rounded-lg">
                            <p className="text-muted-foreground">No requirements added yet</p>
                            <Button type="button" variant="outline" onClick={addRequirement} className="mt-2">
                              Add Your First Requirement
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {formData.requirements.map((req, index) => (
                              <div key={req.id} className="p-4 border rounded-lg bg-card">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-medium">Requirement #{index + 1}</h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeRequirement(req.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-auto"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <Label htmlFor={`question-${req.id}`} className="text-sm">
                                      Question
                                    </Label>
                                    <Input
                                      id={`question-${req.id}`}
                                      value={req.question}
                                      onChange={(e) => updateRequirement(req.id, "question", e.target.value)}
                                      placeholder="e.g., What specific areas need painting?"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`type-${req.id}`} className="text-sm">
                                      Answer Type
                                    </Label>
                                    <RadioGroup
                                      value={req.type}
                                      onValueChange={(value) => updateRequirement(req.id, "type", value)}
                                      className="flex space-x-4 mt-1"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="text" id={`type-text-${req.id}`} />
                                        <Label htmlFor={`type-text-${req.id}`} className="text-sm">
                                          Text
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="choice" id={`type-choice-${req.id}`} />
                                        <Label htmlFor={`type-choice-${req.id}`} className="text-sm">
                                          Multiple Choice
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="attachment" id={`type-attachment-${req.id}`} />
                                        <Label htmlFor={`type-attachment-${req.id}`} className="text-sm">
                                          Attachment
                                        </Label>
                                      </div>
                                    </RadioGroup>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    {step > 1 ? (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Back
                      </Button>
                    ) : (
                      <div></div>
                    )}
                    {step < 4 ? (
                      <Button type="button" onClick={nextStep} className="bg-purple-600 hover:bg-purple-700">
                        Continue <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500"
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create Service"}
                      </Button>
                    )}
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}

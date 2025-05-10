"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  PlusCircle,
  Trash2,
  Upload,
  Check,
  ArrowRight,
  ArrowLeft,
  ImageIcon,
  DollarSign,
  FileText,
  ClipboardList,
  X,
  Camera,
  Sparkles,
} from "lucide-react"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function AddServicePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    category: "cleaning",
    description: "",
    price: 50,
    images: [] as string[],
    requirements: [] as { id: string; question: string }[],
  })
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [animatePrice, setAnimatePrice] = useState(false)

  const categories = [
    { id: "cleaning", name: "Cleaning", icon: "🧹" },
    { id: "painting", name: "Painting", icon: "🎨" },
    { id: "furniture", name: "Furniture Assembly", icon: "🪑" },
    { id: "plumbing", name: "Plumbing", icon: "🚿" },
    { id: "electrical", name: "Electrical", icon: "💡" },
    { id: "gardening", name: "Gardening", icon: "🌱" },
    { id: "moving", name: "Moving", icon: "📦" },
    { id: "design", name: "Design", icon: "✏️" },
  ]

  useEffect(() => {
    setAnimatePrice(true)
    const timeout = setTimeout(() => setAnimatePrice(false), 600)
    return () => clearTimeout(timeout)
  }, [formData.price])

  // Add this style to the head
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(147, 51, 234, 0); }
        100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0); }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handlePriceChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, price: value[0] }))
  }

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, { id: crypto.randomUUID(), question: "" }],
    }))
  }

  const updateRequirement = (id: string, question: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req) => (req.id === id ? { ...req, question } : req)),
    }))
  }

  const removeRequirement = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((req) => req.id !== id),
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newImages = Array.from(e.dataTransfer.files)
        .filter((file) => file.type.startsWith("image/"))
        .map((file) => URL.createObjectURL(file))

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const nextStep = () => setStep((prev) => prev + 1)
  const prevStep = () => setStep((prev) => prev - 1)
  const goToStep = (stepNumber: number) => setStep(stepNumber)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log("Submitting service:", formData)

    // Simulate successful submission
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <FileText className="w-5 h-5" />
      case 2:
        return <DollarSign className="w-5 h-5" />
      case 3:
        return <ImageIcon className="w-5 h-5" />
      case 4:
        return <ClipboardList className="w-5 h-5" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      <EnhancedMainNav />

      <main className="container py-12 relative z-10">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-4xl font-bold text-foreground"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Create Your Service
            </motion.h1>
            <motion.p
              className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Showcase your skills and start earning. We'll guide you through the process step by step.
            </motion.p>
          </div>

          {/* Progress Steps */}
          <motion.div
            className="mb-10 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="absolute h-1 bg-gray-200 dark:bg-gray-700 top-7 left-0 right-0 z-0 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>

            <div className="relative z-10 flex justify-between">
              {[1, 2, 3, 4].map((stepNumber) => (
                <motion.button
                  key={stepNumber}
                  type="button"
                  onClick={() => stepNumber < step && goToStep(stepNumber)}
                  className={`flex flex-col items-center ${stepNumber <= step ? "cursor-pointer" : "cursor-not-allowed"}`}
                  whileHover={stepNumber < step ? { scale: 1.05 } : {}}
                  whileTap={stepNumber < step ? { scale: 0.95 } : {}}
                >
                  <motion.div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
                      stepNumber < step
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30"
                        : stepNumber === step
                          ? "bg-white dark:bg-gray-800 border-2 border-purple-500/30 text-purple-500 shadow-lg shadow-purple-200 dark:shadow-purple-900/30"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400"
                    }`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 * stepNumber, duration: 0.5 }}
                  >
                    {stepNumber < step ? <Check className="w-6 h-6" /> : getStepIcon(stepNumber)}
                  </motion.div>
                  <motion.span
                    className={`text-sm font-medium ${
                      stepNumber <= step ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 * stepNumber, duration: 0.5 }}
                  >
                    {stepNumber === 1 && "Basic Info"}
                    {stepNumber === 2 && "Pricing"}
                    {stepNumber === 3 && "Gallery"}
                    {stepNumber === 4 && "Requirements"}
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.form
                  key={`step-${step}`}
                  onSubmit={handleSubmit}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={fadeIn}
                >
                  {/* Step 1: Basic Info */}
                  {step === 1 && (
                    <motion.div variants={staggerContainer} className="space-y-8">
                      <motion.div variants={fadeIn} className="space-y-2">
                        <Label htmlFor="title" className="text-lg font-medium">
                          Service Title
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="e.g., Professional House Cleaning"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="h-12 text-base border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                        />
                      </motion.div>

                      <motion.div variants={fadeIn} className="space-y-4">
                        <Label className="text-lg font-medium">Category</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {categories.map((category) => (
                            <motion.div
                              key={category.id}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 ${
                                formData.category === category.id
                                  ? "border-purple-500/70 bg-black/5 dark:bg-white/10"
                                  : "border-gray-200 dark:border-gray-700 hover:border-purple-500/30"
                              }`}
                              onClick={() => handleCategoryChange(category.id)}
                            >
                              <div className="flex flex-col items-center text-center">
                                <span className="text-2xl mb-2">{category.icon}</span>
                                <span
                                  className={`text-sm font-medium ${
                                    formData.category === category.id
                                      ? "text-purple-600 dark:text-purple-400"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {category.name}
                                </span>
                              </div>
                              {formData.category === category.id && (
                                <motion.div
                                  className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full p-1"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                >
                                  <Check className="w-3 h-3" />
                                </motion.div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div variants={fadeIn} className="space-y-2">
                        <Label htmlFor="description" className="text-lg font-medium">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Describe your service in detail..."
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          className="min-h-[180px] text-base border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                        />
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Step 2: Pricing */}
                  {step === 2 && (
                    <motion.div variants={staggerContainer} className="space-y-8">
                      <motion.div variants={fadeIn} className="text-center mb-8">
                        <motion.div
                          className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-2 inline-flex items-center"
                          animate={animatePrice ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          <span className="text-3xl mr-1">$</span>
                          {formData.price}
                        </motion.div>
                        <p className="text-gray-500 dark:text-gray-400">Set your service price</p>
                      </motion.div>

                      <motion.div variants={fadeIn} className="space-y-8 max-w-2xl mx-auto">
                        <div className="space-y-6">
                          <Slider
                            defaultValue={[formData.price]}
                            value={[formData.price]}
                            max={500}
                            step={5}
                            onValueChange={handlePriceChange}
                            className="py-6"
                          />
                          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>$0</span>
                            <span>$100</span>
                            <span>$200</span>
                            <span>$300</span>
                            <span>$400</span>
                            <span>$500</span>
                          </div>
                        </div>

                        <div className="bg-black/5 dark:bg-white/10 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
                          <h3 className="text-lg font-medium text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Pricing Tips
                          </h3>
                          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                            <li className="flex items-start">
                              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>Research competitors to position your service appropriately</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>Consider your experience level and expertise</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>Factor in the time and resources required</span>
                            </li>
                          </ul>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Step 3: Gallery */}
                  {step === 3 && (
                    <motion.div variants={staggerContainer} className="space-y-8">
                      <motion.div variants={fadeIn} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-lg font-medium">Service Images</Label>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formData.images.length}/8 images
                          </span>
                        </div>

                        <motion.div
                          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                            isDragging
                              ? "border-purple-500/70 bg-black/5 dark:bg-white/10"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          variants={fadeIn}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Camera className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Drag & Drop Images Here
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                            Upload high-quality images that showcase your service. PNG, JPG or WEBP (max. 5MB each)
                          </p>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="relative inline-flex items-center px-4 py-2 bg-black/5 dark:bg-white/10 backdrop-blur-md border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500/70 transition-all duration-300 group"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <span className="absolute -inset-px bg-gradient-to-r from-purple-500 to-purple-500 opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300"></span>
                            <Upload className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400 relative z-10" />
                            <span className="font-medium text-foreground relative z-10 tracking-wide">
                              Browse Files
                            </span>
                            <span className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent transform translate-y-[1px] opacity-70"></span>
                          </button>
                        </motion.div>

                        {formData.images.length > 0 && (
                          <motion.div
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                          >
                            {formData.images.map((image, index) => (
                              <motion.div
                                key={index}
                                className="relative group rounded-lg overflow-hidden aspect-square"
                                variants={fadeIn}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Service image ${index + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="relative inline-flex items-center justify-center p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 hover:scale-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Step 4: Requirements */}
                  {step === 4 && (
                    <motion.div variants={staggerContainer} className="space-y-8">
                      <motion.div variants={fadeIn} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-lg font-medium">Client Requirements</Label>
                          <button
                            type="button"
                            onClick={addRequirement}
                            className="relative inline-flex items-center px-3 py-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-md border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500/70 transition-all duration-300 group"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <span className="absolute -inset-px bg-gradient-to-r from-purple-500 to-purple-500 opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300"></span>
                            <PlusCircle className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400 relative z-10" />
                            <span className="font-medium text-foreground relative z-10 tracking-wide">
                              Add Question
                            </span>
                            <span className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent transform translate-y-[1px] opacity-70"></span>
                          </button>
                        </div>

                        <motion.div
                          className="bg-black/5 dark:bg-white/10 backdrop-blur-md border border-purple-500/30 rounded-xl p-6"
                          variants={fadeIn}
                        >
                          <h3 className="text-lg font-medium text-purple-600 dark:text-purple-400 mb-2">
                            Why Add Requirements?
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            Requirements help you gather essential information from clients before they book your
                            service, ensuring you have everything needed to deliver excellent results.
                          </p>
                        </motion.div>

                        {formData.requirements.length === 0 ? (
                          <motion.div
                            className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl"
                            variants={fadeIn}
                          >
                            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 mb-4">No requirements added yet</p>
                            <button
                              type="button"
                              onClick={addRequirement}
                              className="relative inline-flex items-center px-4 py-2 bg-black/5 dark:bg-white/10 backdrop-blur-md border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500/70 transition-all duration-300 group"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                              <span className="absolute -inset-px bg-gradient-to-r from-purple-500 to-purple-500 opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300"></span>
                              <PlusCircle className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400 relative z-10" />
                              <span className="font-medium text-foreground relative z-10 tracking-wide">
                                Add Your First Question
                              </span>
                              <span className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent transform translate-y-[1px] opacity-70"></span>
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div className="space-y-4" variants={staggerContainer}>
                            {formData.requirements.map((req, index) => (
                              <motion.div
                                key={req.id}
                                className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                                variants={fadeIn}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/30">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <Input
                                    value={req.question}
                                    onChange={(e) => updateRequirement(req.id, e.target.value)}
                                    placeholder="e.g., What is the size of your space?"
                                    className="border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeRequirement(req.id)}
                                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <motion.div
                    className="flex justify-between mt-10 pt-6 border-t border-gray-100 dark:border-gray-700"
                    variants={fadeIn}
                  >
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="relative inline-flex items-center px-4 py-2 bg-black/5 dark:bg-white/10 backdrop-blur-md border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500/70 transition-all duration-300 group"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="absolute -inset-px bg-gradient-to-r from-purple-500 to-purple-500 opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300"></span>
                        <ArrowLeft className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400 relative z-10" />
                        <span className="font-medium text-foreground relative z-10 tracking-wide">Back</span>
                        <span className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent transform translate-y-[1px] opacity-70"></span>
                      </button>
                    ) : (
                      <div></div>
                    )}

                    {step < 4 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="relative inline-flex items-center px-4 py-2 bg-black/5 dark:bg-white/10 backdrop-blur-md border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500/70 transition-all duration-300 group"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="absolute -inset-px bg-gradient-to-r from-purple-500 to-purple-500 opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300"></span>
                        <span className="font-medium text-foreground relative z-10 tracking-wide">Continue</span>
                        <ArrowRight className="h-4 w-4 ml-2 text-purple-600 dark:text-purple-400 relative z-10" />
                        <span className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent transform translate-y-[1px] opacity-70"></span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="relative inline-flex items-center px-6 py-2 bg-black/5 dark:bg-white/10 backdrop-blur-md border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500/70 transition-all duration-300 group"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="absolute -inset-px bg-gradient-to-r from-purple-500 to-purple-500 opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300"></span>
                        <span className="font-medium text-foreground relative z-10 tracking-wide">Create Service</span>
                        <span className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent transform translate-y-[1px] opacity-70"></span>
                      </button>
                    )}
                  </motion.div>
                </motion.form>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

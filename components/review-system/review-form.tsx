"use client"

import { useState } from "react"
import { Star, ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface ReviewFormProps {
  serviceId: string
  onSubmit: (reviewData: ReviewData) => Promise<void>
  onCancel?: () => void
  defaultRating?: number
}

export interface ReviewData {
  serviceId: string
  rating: number
  comment: string
  images: string[]
}

export function ReviewForm({ serviceId, onSubmit, onCancel, defaultRating = 0 }: ReviewFormProps) {
  const { toast } = useToast()
  const [rating, setRating] = useState(defaultRating)
  const [comment, setComment] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isValid = rating > 0 && comment.trim().length > 0

  const handleSubmit = async () => {
    if (!isValid) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        serviceId,
        rating,
        comment,
        images,
      })

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })

      // Reset form if not cancelled
      if (!onCancel) {
        setRating(0)
        setComment("")
        setImages([])
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "There was a problem submitting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Simulate adding an image (in a real app, this would handle file uploads)
  const handleAddImage = () => {
    // For demo purposes, add a random placeholder image
    const placeholderImage = `/placeholder.svg?height=200&width=200&text=Review+Image+${images.length + 1}`
    setImages([...images, placeholderImage])
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
      <h3 className="text-lg font-semibold">Write a Review</h3>

      <div className="space-y-3">
        <div>
          <Label htmlFor="rating" className="block text-sm font-medium mb-1">
            Rating <span className="text-red-500">*</span>
          </Label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={`h-7 w-7 cursor-pointer transition-all ${
                  value <= (hoverRating || rating)
                    ? "text-yellow-400 fill-yellow-400 scale-110"
                    : "text-gray-300 hover:text-gray-400"
                }`}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
              />
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="comment" className="block text-sm font-medium mb-1">
            Your Review <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="comment"
            placeholder="Share your experience with this service..."
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length < 10 && comment.length > 0
              ? "Please write at least 10 characters"
              : `${comment.length}/1000 characters`}
          </p>
        </div>

        <div>
          <Label className="block text-sm font-medium mb-1">Photos (Optional)</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((src, index) => (
              <div key={index} className="relative group w-20 h-20">
                <img
                  src={src || "/placeholder.svg"}
                  alt={`Review photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <button
                type="button"
                onClick={handleAddImage}
                className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors"
              >
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">You can upload up to 5 photos (Max 5MB each)</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="button" onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </div>
    </div>
  )
}

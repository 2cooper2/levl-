"use client"

import { useState } from "react"
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface LLMFeedbackProps {
  onFeedback: (rating: number, feedbackText?: string) => void
}

export function LLMFeedback({ onFeedback }: LLMFeedbackProps) {
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleQuickFeedback = (isPositive: boolean) => {
    onFeedback(isPositive ? 5 : 2)
    setFeedbackSubmitted(true)
  }

  const handleDetailedFeedback = () => {
    setShowFeedbackDialog(true)
  }

  const submitDetailedFeedback = () => {
    onFeedback(rating, feedbackText)
    setShowFeedbackDialog(false)
    setFeedbackSubmitted(true)
  }

  if (feedbackSubmitted) {
    return (
      <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
        <ThumbsUp className="h-3 w-3 mr-1" />
        <span>Feedback submitted</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-1 mt-1">
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => handleQuickFeedback(true)}>
          <ThumbsUp className="h-3 w-3 mr-1" />
          <span>Helpful</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => handleQuickFeedback(false)}>
          <ThumbsDown className="h-3 w-3 mr-1" />
          <span>Not helpful</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleDetailedFeedback}>
          <MessageSquare className="h-3 w-3 mr-1" />
          <span>Detailed feedback</span>
        </Button>
      </div>

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate this response</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
                  <Star
                    className={`h-8 w-8 ${
                      rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Textarea
              placeholder="Tell us what you think about this response..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitDetailedFeedback} disabled={rating === 0}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

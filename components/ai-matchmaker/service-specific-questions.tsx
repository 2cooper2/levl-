"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

interface ServiceSpecificQuestionsProps {
  serviceType: string
  questions: string[]
  options: { [key: string]: string[] }
  required: boolean[]
  currentQuestion: number
  onAnswer: (answer: string) => void
  onSkip?: () => void
}

export function ServiceSpecificQuestions({
  serviceType,
  questions,
  options,
  required,
  currentQuestion,
  onAnswer,
  onSkip,
}: ServiceSpecificQuestionsProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")

  // Format service type name for display
  const formatServiceType = (type: string): string => {
    switch (type) {
      case "tvMounting":
        return "TV Mounting"
      case "plumbing":
        return "Plumbing"
      case "painting":
        return "Painting"
      case "furniture":
        return "Furniture Assembly"
      case "webDevelopment":
        return "Web Development"
      case "photography":
        return "Photography"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  // Get current question and options
  const currentQuestionText = questions[currentQuestion]
  const currentOptions = options[currentQuestionText] || []
  const isRequired = required[currentQuestion]

  // Handle submitting the answer
  const handleSubmit = () => {
    if (selectedOption) {
      onAnswer(selectedOption)
      setSelectedOption("")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="w-full border-indigo-100 dark:border-indigo-900/30 shadow-md">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-b border-indigo-100 dark:border-indigo-900/30">
          <CardTitle className="text-lg font-semibold text-indigo-800 dark:text-indigo-300">
            {formatServiceType(serviceType)} Service
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-5">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <h3 className="text-lg font-medium mb-4">{currentQuestionText}</h3>

          {currentOptions.length > 0 ? (
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-3">
              {currentOptions.map((option) => (
                <div
                  key={option}
                  className="flex items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => setSelectedOption(option)}
                >
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              No options available for this question.
            </div>
          )}

          <div className="flex justify-between mt-6">
            {!isRequired && onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Skip
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className={`${!isRequired && onSkip ? "ml-auto" : "w-full"}`}
            >
              {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

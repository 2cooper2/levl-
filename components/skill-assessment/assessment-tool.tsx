"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Brain, Target, ArrowRight } from "lucide-react"

export function SkillAssessmentTool() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<null | {
    level: string
    score: number
    recommendations: string[]
  }>(null)

  // Mock assessment questions
  const questions = [
    {
      id: "q1",
      question: "How comfortable are you with mounting a TV on drywall?",
      options: [
        { id: "a", text: "Never done it before" },
        { id: "b", text: "Done it once with help" },
        { id: "c", text: "Done it multiple times" },
        { id: "d", text: "Professional level expertise" },
      ],
    },
    {
      id: "q2",
      question: "What tools are you familiar with for finding wall studs?",
      options: [
        { id: "a", text: "I don't know what studs are" },
        { id: "b", text: "Knocking on the wall" },
        { id: "c", text: "Basic stud finder" },
        { id: "d", text: "Advanced electronic stud finders and techniques" },
      ],
    },
    {
      id: "q3",
      question: "How would you rate your ability to hide TV cables?",
      options: [
        { id: "a", text: "I leave them hanging" },
        { id: "b", text: "I use basic cable management clips" },
        { id: "c", text: "I can route them through cable channels" },
        { id: "d", text: "I can run them through walls professionally" },
      ],
    },
  ]

  const handleAnswer = (questionId: string, answerId: string) => {
    setAnswers({ ...answers, [questionId]: answerId })

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Calculate result based on answers
      calculateResult()
    }
  }

  const calculateResult = () => {
    // This would connect to an AI service in production
    // For now, we'll simulate a result
    const scoreMap: Record<string, number> = { a: 25, b: 50, c: 75, d: 100 }
    const totalScore = Object.values(answers).reduce((sum, answer) => sum + scoreMap[answer], 0)
    const averageScore = Math.round(totalScore / questions.length)

    let level = "Beginner"
    if (averageScore > 75) level = "Expert"
    else if (averageScore > 50) level = "Intermediate"
    else if (averageScore > 25) level = "Novice"

    setResult({
      level,
      score: averageScore,
      recommendations: [
        'Complete the "Advanced Mounting Techniques" course',
        'Practice with the "Multi-Material Mounting" project',
        "Join the mounting professionals community",
      ],
    })
  }

  return (
    <div className="bg-gradient-to-br from-white via-lavender-50/50 to-white backdrop-blur-md p-6 rounded-xl border border-lavender-200/50 shadow-xl">
      <div className="flex items-center mb-6">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center mr-3">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">AI Skill Assessment</h3>
      </div>

      {!result ? (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>
                Question {currentStep + 1} of {questions.length}
              </span>
              <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
            </div>
            <Progress value={((currentStep + 1) / questions.length) * 100} className="h-2" />
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-medium mb-4">{questions[currentStep].question}</h4>
            <div className="space-y-3">
              {questions[currentStep].options.map((option) => (
                <motion.button
                  key={option.id}
                  className="w-full text-left p-4 rounded-lg border border-lavender-200 hover:border-primary/60 hover:bg-lavender-50/50 transition-all"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  onClick={() => handleAnswer(questions[currentStep].id, option.id)}
                >
                  {option.text}
                </motion.button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
              <Target className="h-10 w-10 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-1">Your Skill Level: {result.level}</h4>
            <div className="flex justify-center items-center gap-2 mb-4">
              <Progress value={result.score} className="h-2 w-40" />
              <span className="text-sm font-medium">{result.score}%</span>
            </div>
          </div>

          <div className="bg-lavender-50/50 rounded-lg p-4 mb-6">
            <h5 className="font-medium mb-3">Personalized Recommendations:</h5>
            <ul className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center">
            <Button className="bg-gradient-to-r from-primary to-purple-600">
              Start Learning Path <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

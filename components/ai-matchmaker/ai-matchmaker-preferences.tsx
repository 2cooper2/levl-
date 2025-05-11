"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { AIModelState } from "@/types/matchmaker"

interface AIMatchmakerPreferencesProps {
  showPreferences: boolean
  setShowPreferences: (show: boolean) => void
  categories: { id: string; name: string }[]
  aiModel: AIModelState
}

export function AIMatchmakerPreferences({
  showPreferences,
  setShowPreferences,
  categories,
  aiModel,
}: AIMatchmakerPreferencesProps) {
  const [preferences, setPreferences] = useState({
    budget: aiModel.userModel.budget.sensitivity,
    quality: aiModel.userModel.quality.importance,
    timing: aiModel.userModel.timing.urgency,
    certificationRequired: aiModel.userModel.quality.certificationRequired,
    selectedCategories: Array.from(aiModel.userModel.categories.keys()),
  })

  const handleApplyPreferences = () => {
    // In a real app, this would update the AI model
    setShowPreferences(false)
  }

  return (
    <AnimatePresence>
      {showPreferences && (
        <motion.div
          className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4">
            <h4 className="font-medium mb-3 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Matchmaking Preferences
            </h4>

            <div className="space-y-6">
              {/* Budget Sensitivity */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">Budget Sensitivity</Label>
                  <span className="text-xs text-gray-500">
                    {preferences.budget < 4
                      ? "Not important"
                      : preferences.budget < 7
                        ? "Somewhat important"
                        : "Very important"}
                  </span>
                </div>
                <Slider
                  value={[preferences.budget]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setPreferences({ ...preferences, budget: value[0] })}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Price not important</span>
                  <span>Very price sensitive</span>
                </div>
              </div>

              {/* Quality Importance */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">Quality Importance</Label>
                  <span className="text-xs text-gray-500">
                    {preferences.quality < 4
                      ? "Not important"
                      : preferences.quality < 7
                        ? "Somewhat important"
                        : "Very important"}
                  </span>
                </div>
                <Slider
                  value={[preferences.quality]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setPreferences({ ...preferences, quality: value[0] })}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Basic quality is fine</span>
                  <span>Only the best</span>
                </div>
              </div>

              {/* Time Urgency */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">Time Urgency</Label>
                  <span className="text-xs text-gray-500">
                    {preferences.timing < 4 ? "Not urgent" : preferences.timing < 7 ? "Somewhat urgent" : "Very urgent"}
                  </span>
                </div>
                <Slider
                  value={[preferences.timing]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setPreferences({ ...preferences, timing: value[0] })}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Flexible timing</span>
                  <span>Need it ASAP</span>
                </div>
              </div>

              {/* Certification Required */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Require Verified Providers</Label>
                <Switch
                  checked={preferences.certificationRequired}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, certificationRequired: checked })}
                />
              </div>

              {/* Categories */}
              <div>
                <Label className="text-sm font-medium block mb-2">Preferred Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={preferences.selectedCategories.includes(category.name) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setPreferences({
                          ...preferences,
                          selectedCategories: preferences.selectedCategories.includes(category.name)
                            ? preferences.selectedCategories.filter((c) => c !== category.name)
                            : [...preferences.selectedCategories, category.name],
                        })
                      }}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" className="mr-2" onClick={() => setShowPreferences(false)}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleApplyPreferences}>
                Apply Preferences
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

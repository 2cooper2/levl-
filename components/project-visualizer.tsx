"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ProjectVisualizer() {
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!description.trim()) return

    setIsLoading(true)
    try {
      // In a real app, this would call an API
      // For now, we'll just set a placeholder image after a brief delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      setImageUrl(`/placeholder.svg?height=300&width=400&text=${encodeURIComponent(description)}`)
    } catch (error) {
      console.error("Error generating image:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Visualize Your Project</h3>
      <p className="text-sm text-muted-foreground">
        Describe your project and let AI generate a visual representation.
      </p>
      <Input
        type="text"
        placeholder="Describe your project..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isLoading}
      />
      <Button onClick={handleGenerate} disabled={isLoading || !description.trim()}>
        {isLoading ? <>Generating...</> : <>Generate Visual</>}
      </Button>
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-[4/3] overflow-hidden rounded-md border"
        >
          <img src={imageUrl || "/placeholder.svg"} alt="AI Generated Visual" className="object-cover w-full h-full" />
        </motion.div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { UltraDepthCard } from "@/components/ultra-depth-card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"

export default function UltraDepthDemo() {
  const [depthLevel, setDepthLevel] = useState(5)

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1
            className="text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            Ultra Depth Experience
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          >
            Explore our new ultra-depth UI with advanced 3D effects, parallax scrolling, and dynamic lighting
          </motion.p>
        </div>

        <div className="flex flex-col items-center justify-center mb-12 max-w-md mx-auto">
          <label className="text-lg mb-2">Depth Intensity: {depthLevel}</label>
          <Slider
            value={[depthLevel]}
            min={1}
            max={10}
            step={1}
            onValueChange={(value) => setDepthLevel(value[0])}
            className="mb-8"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <UltraDepthCard depth={depthLevel} className="h-[300px]">
              <h3 className="text-2xl font-bold mb-4">Enhanced 3D Effect</h3>
              <p className="mb-6">
                Experience our new ultra-depth cards with realistic 3D transformations and lighting effects.
              </p>
              <div className="absolute bottom-6 right-6">
                <Button>Explore</Button>
              </div>
            </UltraDepthCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <UltraDepthCard depth={depthLevel} className="h-[300px]">
              <h3 className="text-2xl font-bold mb-4">Dynamic Lighting</h3>
              <p className="mb-6">
                Notice how light interacts with surfaces, creating realistic highlights and shadows as you move.
              </p>
              <div className="absolute bottom-6 right-6">
                <Button>Learn More</Button>
              </div>
            </UltraDepthCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <UltraDepthCard depth={depthLevel} className="h-[300px]">
              <h3 className="text-2xl font-bold mb-4">Parallax Layers</h3>
              <p className="mb-6">
                Multiple depth layers create an immersive experience as you scroll and move your cursor.
              </p>
              <div className="absolute bottom-6 right-6">
                <Button>Details</Button>
              </div>
            </UltraDepthCard>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Move your mouse over the cards and scroll the page to experience the full depth effect
          </p>
          <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Back to Top
          </Button>
        </div>
      </div>
    </div>
  )
}

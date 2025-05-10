"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SkillAcceleratorSignup } from "./skill-accelerator-signup"
import { motion } from "framer-motion"

export function HorizontalSkillAccelerator() {
  const [isSignupOpen, setIsSignupOpen] = useState(false)

  return (
    <div className="w-full px-4 py-6 md:py-10">
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
        <div className="flex flex-row items-center p-4">
          {/* Logo/Icon Section */}
          <div className="flex-shrink-0 mr-4">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-0.5">Skill Accelerator</h3>

            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3 mr-1"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                AI-Powered
              </span>

              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3 mr-1"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                3K+ Gigs
              </span>

              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3 mr-1"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Lower Fees
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-2">AI-powered gig ecosystem to help you earn while you learn</p>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0 ml-2">
            <Button
              onClick={() => setIsSignupOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 h-auto text-sm rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              Join Now
            </Button>
          </div>
        </div>

        {/* Skills Section */}
        <div className="flex overflow-x-auto gap-2 px-4 pb-4 scrollbar-hide">
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-medium"
            >
              Mounting
            </motion.div>
          </div>
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium"
            >
              Painting
            </motion.div>
          </div>
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium"
            >
              Furniture Assembly
            </motion.div>
          </div>
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium"
            >
              Plumbing
            </motion.div>
          </div>
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium"
            >
              Electrical
            </motion.div>
          </div>
        </div>
      </div>

      <SkillAcceleratorSignup isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
    </div>
  )
}

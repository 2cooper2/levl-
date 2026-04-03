"use client"

import { useState } from "react"

export function ServiceGallery() {
  const images = [
    "/placeholder.svg?height=600&width=800&text=Website+Example+1",
    "/placeholder.svg?height=600&width=800&text=Website+Example+2",
    "/placeholder.svg?height=600&width=800&text=Website+Example+3",
    "/placeholder.svg?height=600&width=800&text=Website+Example+4",
    "/placeholder.svg?height=600&width=800&text=Website+Example+5",
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="relative">
      <div className="mt-4 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full ${currentIndex === index ? "bg-primary" : "bg-muted"}`}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronDown, Check } from "lucide-react"

interface FilterDropdownProps {
  label: string
  options: { id: string; name: string }[]
  value: string | null
  onChange: (value: string | null) => void
  icon?: ReactNode
}

export function FilterDropdown({ label, options, value, onChange, icon }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = value ? options.find((option) => option.id === value || option.name === value) : null

  const handleOptionClick = (option: { id: string; name: string }) => {
    // If selecting the same option, clear the selection
    if (value === option.id || value === option.name) {
      onChange(null)
    } else {
      onChange(option.id === "all" ? null : option.name)
    }
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="outline"
        className="w-full justify-between bg-background hover:bg-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {selectedOption ? selectedOption.name : label}
        </span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
        </motion.span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg"
            style={{
              transformOrigin: "top center",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="py-1 max-h-60 overflow-auto">
              {options.map((option) => {
                const isSelected = value === option.id || value === option.name

                return (
                  <motion.button
                    key={option.id}
                    className={`flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-accent ${
                      isSelected ? "bg-primary/10 text-primary font-medium" : ""
                    }`}
                    onClick={() => handleOptionClick(option)}
                    whileHover={{ backgroundColor: "rgba(var(--primary-rgb), 0.05)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option.name}
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

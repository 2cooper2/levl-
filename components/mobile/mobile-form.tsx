"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface FormField {
  id: string
  label: string
  type: "text" | "email" | "tel" | "number" | "password" | "textarea" | "select"
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  autoComplete?: string
  inputMode?: "text" | "numeric" | "tel" | "email" | "url" | "search" | "none" | "decimal"
}

interface MobileFormProps {
  title: string
  description?: string
  fields: FormField[]
  submitLabel: string
  onSubmit: (data: Record<string, string>) => void
  isLoading?: boolean
  className?: string
}

export function MobileForm({
  title,
  description,
  fields,
  submitLabel,
  onSubmit,
  isLoading = false,
  className,
}: MobileFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))

    // Clear error when user types
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`
      }

      if (field.type === "email" && formData[field.id] && !/^\S+@\S+\.\S+$/.test(formData[field.id])) {
        newErrors[field.id] = "Please enter a valid email address"
      }

      if (field.type === "tel" && formData[field.id] && !/^[+\d\s()-]{7,}$/.test(formData[field.id])) {
        newErrors[field.id] = "Please enter a valid phone number"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    } else {
      // Scroll to first error
      const firstErrorId = Object.keys(errors)[0]
      const element = document.getElementById(firstErrorId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.focus()
      }
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>

            {field.type === "textarea" ? (
              <Textarea
                id={field.id}
                placeholder={field.placeholder}
                value={formData[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className={cn(errors[field.id] && "border-destructive")}
                required={field.required}
                autoComplete={field.autoComplete}
              />
            ) : field.type === "select" ? (
              <select
                id={field.id}
                value={formData[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  errors[field.id] && "border-destructive",
                )}
                required={field.required}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className={cn(errors[field.id] && "border-destructive")}
                required={field.required}
                autoComplete={field.autoComplete}
                inputMode={field.inputMode}
              />
            )}

            {errors[field.id] && <p className="text-xs text-destructive">{errors[field.id]}</p>}
          </div>
        ))}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Please wait..." : submitLabel}
        </Button>
      </form>
    </div>
  )
}

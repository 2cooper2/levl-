"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { validateForm, type ValidationRules } from "@/lib/form-validation"

interface UseFormOptions<T> {
  initialValues: T
  validationRules?: ValidationRules
  onSubmit?: (values: T) => Promise<void> | void
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target

      setValues((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }))

      // Clear error for this field when user types
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    },
    [errors],
  )

  const setValue = useCallback(
    (name: string, value: any) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }))

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    },
    [errors],
  )

  const validate = useCallback(() => {
    if (Object.keys(validationRules).length === 0) return true

    const validation = validateForm(values, validationRules)
    setErrors(validation.errors)
    return validation.isValid
  }, [values, validationRules])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      setIsSubmitted(true)

      if (!validate()) {
        return
      }

      setIsSubmitting(true)

      try {
        await onSubmit?.(values)
      } catch (error) {
        console.error("Form submission error:", error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validate, onSubmit],
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setIsSubmitted(false)
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    isSubmitting,
    isSubmitted,
    handleChange,
    setValue,
    handleSubmit,
    reset,
    validate,
  }
}

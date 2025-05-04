export type ValidationRule = {
  validate: (value: any) => boolean
  message: string
}

export type ValidationRules = {
  [key: string]: ValidationRule[]
}

export function validateForm(
  data: Record<string, any>,
  rules: ValidationRules,
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  for (const field in rules) {
    const fieldRules = rules[field]
    const value = data[field]

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        errors[field] = rule.message
        break
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Common validation rules
export const required = (message = "This field is required"): ValidationRule => ({
  validate: (value) => value !== undefined && value !== null && value !== "",
  message,
})

export const email = (message = "Please enter a valid email address"): ValidationRule => ({
  validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  message,
})

export const minLength = (length: number, message = `Must be at least ${length} characters`): ValidationRule => ({
  validate: (value) => value && value.length >= length,
  message,
})

export const maxLength = (length: number, message = `Must be no more than ${length} characters`): ValidationRule => ({
  validate: (value) => !value || value.length <= length,
  message,
})

export const match = (field: string, message = "Fields do not match"): ValidationRule => ({
  validate: (value, formData) => value === formData[field],
  message,
})

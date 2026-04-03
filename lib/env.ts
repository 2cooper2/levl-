// Environment variables with proper typing and defaults
export const env = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",

  // App
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",

  // Auth
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "your-secret-key",

  // Email
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@example.com",

  // AI
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
}

// Simple function to check if a value exists and is not empty
export const getEnvVariable = (key: string, required = false): string => {
  const value = process.env[key]

  if (!value) {
    if (required) {
      console.warn(`Environment variable ${key} is not set`)
    }
    return ""
  }

  return value
}

// Function to check if email functionality is available
export const isEmailFunctionalityAvailable = (): boolean => {
  return !!process.env.RESEND_API_KEY
}

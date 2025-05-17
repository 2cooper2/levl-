type EnvVar = {
  key: string
  defaultValue?: string
  isRequired?: boolean
  isPublic?: boolean
}

// Cache for environment variables
const envCache = new Map<string, string>()

/**
 * Enhanced environment variable getter with caching, validation and fallbacks
 */
export function getEnv(
  key: string,
  options: {
    defaultValue?: string
    isRequired?: boolean
    isPublic?: boolean
  } = {},
): string {
  // For server-side code, directly fetch env vars
  if (typeof window === "undefined") {
    // Check cache first
    if (envCache.has(key)) {
      return envCache.get(key) as string
    }

    const { defaultValue = "", isRequired = false, isPublic = false } = options

    // Handle public vs private env vars
    const fullKey = isPublic ? `NEXT_PUBLIC_${key}` : key
    let value = process.env[fullKey] || defaultValue

    // For non-public vars, make sure they're only used server-side
    if (!isPublic && typeof window !== "undefined") {
      console.warn(`Attempted to access non-public env var ${key} on client side`)
      value = defaultValue
    }

    if (!value && isRequired) {
      // Log warning but don't crash the application
      console.warn(`Required environment variable ${fullKey} is not set`)
    }

    // Cache the result
    envCache.set(key, value)
    return value
  }

  // For client-side code, only allow access to NEXT_PUBLIC vars
  const publicKey = `NEXT_PUBLIC_${key}`
  // TypeScript only - window is actually available here
  const windowObj = window as any
  return windowObj.__ENV && windowObj.__ENV[publicKey] ? windowObj.__ENV[publicKey] : options.defaultValue || ""
}

// System environment configuration
export const ENV = {
  // Supabase
  SUPABASE_URL: () => getEnv("SUPABASE_URL", { isRequired: true, isPublic: true }),
  SUPABASE_ANON_KEY: () => getEnv("SUPABASE_ANON_KEY", { isRequired: true, isPublic: true }),
  SUPABASE_SERVICE_ROLE_KEY: () => getEnv("SUPABASE_SERVICE_ROLE_KEY", { isRequired: true }),

  // Stripe
  STRIPE_PUBLIC_KEY: () => getEnv("STRIPE_PUBLISHABLE_KEY", { isPublic: true }),
  STRIPE_SECRET_KEY: () => getEnv("STRIPE_SECRET_KEY", { isRequired: true }),
  STRIPE_WEBHOOK_SECRET: () => getEnv("STRIPE_WEBHOOK_SECRET"),

  // Email
  RESEND_API_KEY: () => getEnv("RESEND_API_KEY"),
  ADMIN_EMAIL: () => getEnv("ADMIN_EMAIL", { defaultValue: "admin@example.com" }),

  // Other
  NODE_ENV: () => getEnv("NODE_ENV", { defaultValue: "development", isPublic: true }),
  BASE_URL: () =>
    getEnv("NEXT_PUBLIC_BASE_URL", {
      defaultValue: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
      isPublic: true,
    }),
  LOG_LEVEL: () => getEnv("LOG_LEVEL", { defaultValue: "info", isPublic: true }),
  JWT_SECRET: () => getEnv("JWT_SECRET", { defaultValue: "development-jwt-secret" }),
}

// To be used in client components to check if we're in a dev environment
export const isDev = ENV.NODE_ENV() === "development"

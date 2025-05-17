// Cached environment variables to avoid repeated lookups
const envCache = new Map<string, string>()

export type EnvVar = {
  key: string
  defaultValue?: string
  required?: boolean
  public?: boolean
}

/**
 * Gets an environment variable with validation, caching, and default values
 */
export function getEnv(
  key: string,
  options: {
    defaultValue?: string
    required?: boolean
    public?: boolean
  } = {},
): string {
  // Check cache first
  const cacheKey = `${key}:${options.public ? "public" : "private"}`
  if (envCache.has(cacheKey)) {
    return envCache.get(cacheKey) || options.defaultValue || ""
  }

  const { defaultValue = "", required = false, public: isPublic = false } = options

  // Handle public vs private env vars
  const fullKey = isPublic ? `NEXT_PUBLIC_${key}` : key
  let value: string | undefined

  // For server-side execution
  if (typeof window === "undefined") {
    value = process.env[fullKey]
  }
  // For client-side execution, only allow public vars
  else if (isPublic) {
    // Using a safe approach for client-side env access
    value = (window as any).__ENV?.[`NEXT_PUBLIC_${key}`]
  }

  // Use default if value not found
  const finalValue = value || defaultValue

  if (required && !finalValue) {
    // Log a warning but don't crash in production
    const message = `Required environment variable ${fullKey} is missing`
    console.error(message)

    if (process.env.NODE_ENV === "development") {
      // In development, we might want to make this more visible
      console.warn(`⚠️ ${message} - Please check your .env file`)
    }
  }

  // Cache the result
  envCache.set(cacheKey, finalValue)
  return finalValue
}

/**
 * Define all environment variables used in the app
 */
export const ENV = {
  // Database
  SUPABASE_URL: () => getEnv("SUPABASE_URL", { required: true, public: true }),
  SUPABASE_ANON_KEY: () => getEnv("SUPABASE_ANON_KEY", { required: true, public: true }),
  SUPABASE_SERVICE_ROLE_KEY: () => getEnv("SUPABASE_SERVICE_ROLE_KEY", { required: true }),

  // Auth
  JWT_SECRET: () => getEnv("JWT_SECRET", { required: true, defaultValue: "fallback-local-development-secret" }),
  JWT_SECRET_KEY: () => getEnv("JWT_SECRET_KEY", { required: false }),

  // Email
  RESEND_API_KEY: () => getEnv("RESEND_API_KEY", { required: false }),
  ADMIN_EMAIL: () => getEnv("ADMIN_EMAIL", { defaultValue: "admin@example.com" }),

  // Payments
  STRIPE_SECRET_KEY: () => getEnv("STRIPE_SECRET_KEY", { required: false }),
  STRIPE_WEBHOOK_SECRET: () => getEnv("STRIPE_WEBHOOK_SECRET", { required: false }),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: () => getEnv("STRIPE_PUBLISHABLE_KEY", { public: true, required: false }),

  // App settings
  NEXT_PUBLIC_BASE_URL: () =>
    getEnv("BASE_URL", {
      public: true,
      defaultValue: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    }),

  // AI/LLM
  GROQ_API_KEY: () => getEnv("GROQ_API_KEY", { required: false }),

  // File storage
  BLOB_READ_WRITE_TOKEN: () => getEnv("BLOB_READ_WRITE_TOKEN", { required: false }),
}

// Client-side initialization to make env vars available
export function initClientEnv() {
  if (typeof window !== "undefined") {
    ;(window as any).__ENV = {}

    // Extract env vars from meta tags (which will be set in our layout)
    document.querySelectorAll('meta[name^="env-"]').forEach((meta) => {
      const key = meta.getAttribute("name")?.replace("env-", "") || ""
      const value = meta.getAttribute("content") || ""
      if (key.startsWith("NEXT_PUBLIC_")) {
        ;(window as any).__ENV[key] = value
      }
    })
  }
}

// Helper component to inject public env vars into meta tags
export function EnvInjector({ env = {} }: { env?: Record<string, string> }) {
  const publicEnvVars = Object.entries(env).filter(([key]) => key.startsWith("NEXT_PUBLIC_"))

  return (
    <>
      {publicEnvVars.map(([key, value]) => (
        <meta key={key} name={`env-${key}`} content={value} />
      ))}
    </>
  )
}

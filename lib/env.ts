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
  // In a real app, you would check for actual email service credentials
  // For this demo, we'll just return false to avoid any errors
  return false
}

// Add these environment variables to the existing file
export const getLogLevel = (): string => {
  return getEnvVariable("LOG_LEVEL", false) || "info"
}

export const getAppVersion = (): string => {
  return process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0"
}

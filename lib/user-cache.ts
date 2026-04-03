"use client"

// Define the User type
type User = {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  [key: string]: any // Allow for additional properties
}

const USER_CACHE_KEY = "levl-user-cache"
const CACHE_EXPIRY = 1000 * 60 * 5 // 5 minutes

type CachedUser = {
  user: User
  timestamp: number
}

export function cacheUser(user: User): void {
  if (!user) return

  try {
    const cacheData: CachedUser = {
      user,
      timestamp: Date.now(),
    }
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.error("Failed to cache user data:", error)
  }
}

export function getCachedUser(): User | null {
  try {
    const cachedData = localStorage.getItem(USER_CACHE_KEY)
    if (!cachedData) return null

    const { user, timestamp }: CachedUser = JSON.parse(cachedData)

    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(USER_CACHE_KEY)
      return null
    }

    return user
  } catch (error) {
    console.error("Failed to retrieve cached user data:", error)
    return null
  }
}

export function clearUserCache(): void {
  try {
    localStorage.removeItem(USER_CACHE_KEY)
  } catch (error) {
    console.error("Failed to clear user cache:", error)
  }
}

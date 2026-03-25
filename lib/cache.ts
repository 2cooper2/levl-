type CacheItem<T> = {
  value: T
  expiry: number
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map()
  private readonly defaultTTL: number

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.defaultTTL = defaultTTL

    // Clean expired cache items periodically
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanExpiredItems(), 60 * 1000) // Clean every minute
    }
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key)

    if (!item) return undefined

    // Check if the cache item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return undefined
    }

    return item.value
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in milliseconds (optional, uses default if not provided)
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { value, expiry })
  }

  /**
   * Delete a value from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache items
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cached value or fetch and cache if not available
   * @param key Cache key
   * @param fetchFn Function to fetch the data if not in cache
   * @param ttl Time to live in milliseconds (optional)
   * @returns The cached or fetched value
   */
  async getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key)

    if (cached !== undefined) {
      return cached
    }

    const value = await fetchFn()
    this.set(key, value, ttl)
    return value
  }

  /**
   * Clean expired items from the cache
   */
  private cleanExpiredItems(): void {
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// Export a singleton instance
export const cacheService = new CacheService()

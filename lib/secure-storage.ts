class SecureStorage {
  private prefix: string
  private encryptionKey: string | null = null

  constructor(prefix = "levl_") {
    this.prefix = prefix

    // Try to get or generate an encryption key
    if (typeof window !== "undefined") {
      this.encryptionKey = localStorage.getItem(`${this.prefix}encryption_key`)

      if (!this.encryptionKey) {
        // Generate a random key
        const array = new Uint8Array(32)
        window.crypto.getRandomValues(array)
        this.encryptionKey = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")

        localStorage.setItem(`${this.prefix}encryption_key`, this.encryptionKey)
      }
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  // Simple encryption for sensitive data
  private encrypt(data: string): string {
    if (!this.encryptionKey) return data

    // Very basic XOR encryption (for demonstration - use a proper crypto library in production)
    let result = ""
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
      result += String.fromCharCode(charCode)
    }
    return btoa(result) // Base64 encode
  }

  // Decrypt data
  private decrypt(data: string): string {
    if (!this.encryptionKey) return data

    try {
      // Base64 decode
      const decoded = atob(data)
      let result = ""

      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        result += String.fromCharCode(charCode)
      }
      return result
    } catch (e) {
      console.error("Failed to decrypt data", e)
      return data
    }
  }

  // Set an item in storage with optional encryption
  setItem(key: string, value: any, encrypt = false): void {
    if (typeof window === "undefined") return

    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)
    const storedValue = encrypt ? this.encrypt(stringValue) : stringValue

    localStorage.setItem(this.getKey(key), storedValue)
  }

  // Get an item from storage with decryption if needed
  getItem(key: string, decrypt = false): any {
    if (typeof window === "undefined") return null

    const value = localStorage.getItem(this.getKey(key))
    if (value === null) return null

    const decryptedValue = decrypt ? this.decrypt(value) : value

    try {
      // Try to parse as JSON
      return JSON.parse(decryptedValue)
    } catch {
      // Return as is if not valid JSON
      return decryptedValue
    }
  }

  // Remove an item from storage
  removeItem(key: string): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.getKey(key))
  }

  // Clear all items with this prefix
  clear(): void {
    if (typeof window === "undefined") return

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }

  // Set a session-only item (cleared when browser is closed)
  setSessionItem(key: string, value: any, encrypt = false): void {
    if (typeof window === "undefined") return

    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)
    const storedValue = encrypt ? this.encrypt(stringValue) : stringValue

    sessionStorage.setItem(this.getKey(key), storedValue)
  }

  // Get a session item
  getSessionItem(key: string, decrypt = false): any {
    if (typeof window === "undefined") return null

    const value = sessionStorage.getItem(this.getKey(key))
    if (value === null) return null

    const decryptedValue = decrypt ? this.decrypt(value) : value

    try {
      // Try to parse as JSON
      return JSON.parse(decryptedValue)
    } catch {
      // Return as is if not valid JSON
      return decryptedValue
    }
  }

  // Remove a session item
  removeSessionItem(key: string): void {
    if (typeof window === "undefined") return
    sessionStorage.removeItem(this.getKey(key))
  }
}

// Export a singleton instance
export const secureStorage = typeof window !== "undefined" ? new SecureStorage() : null

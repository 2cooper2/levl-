type FetchOptions = RequestInit & {
  params?: Record<string, string>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })
  }

  async put<T>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })
  }

  async delete<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options

    let url = `${this.baseUrl}${endpoint}`

    // Add query parameters if provided
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value)
      })
      url += `?${searchParams.toString()}`
    }

    try {
      const response = await fetch(url, fetchOptions)

      // Parse the JSON response
      const data = await response.json()

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(data.error || "An unexpected error occurred")
      }

      return data as T
    } catch (error) {
      console.error(`API request failed: ${url}`, error)
      throw error
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient()

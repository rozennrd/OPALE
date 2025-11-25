// HTTP Client using native fetch with enterprise patterns

import { ApiResponse, ApiError, RequestConfig, DEFAULT_API_CONFIG } from './types'

class ApiClient {
  private baseUrl: string
  private defaultTimeout: number
  private defaultRetries: number

  constructor(config: { baseUrl?: string; timeout?: number; retries?: number } = {}) {
    this.baseUrl = config.baseUrl || DEFAULT_API_CONFIG.baseUrl
    this.defaultTimeout = config.timeout ?? DEFAULT_API_CONFIG.timeout
    this.defaultRetries = config.retries ?? DEFAULT_API_CONFIG.retries
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const timeout = config.timeout ?? this.defaultTimeout
    const retries = config.retries ?? this.defaultRetries

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: 'include', // Important for JWT cookies
    }

    if (data !== undefined && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(data)
    }

    // Implement timeout and retries
    let lastError: Error = new Error('Unknown error')

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        })

        clearTimeout(id)

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const error: ApiError = {
            code: response.status,
            message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            details: errorData,
          }

          return {
            success: false,
            error,
          }
        }

        // Handle successful responses
        const contentType = response.headers.get('content-type')
        let responseData: T

        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json()
        } else {
          responseData = await response.text() as T
        }

        return {
          success: true,
          data: responseData,
        }

      } catch (error) {
        lastError = error as Error

        // Don't retry on client errors (4xx) or specific errors
        if (error instanceof Error && error.name === 'AbortError') {
          lastError.message = 'Request timeout'
          break
        }

        // Exponential backoff delay
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    // All retries failed
    const error: ApiError = {
      code: 'NETWORK_ERROR',
      message: lastError.message || 'Unknown network error',
      details: lastError,
    }

    return {
      success: false,
      error,
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, config)
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, config)
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, config)
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, data, config)
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, config)
  }

  // Special method for file uploads
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const timeout = config?.timeout ?? this.defaultTimeout

    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value as string)
      })
    }

    let lastError: Error = new Error('Unknown error')
    for (let attempt = 0; attempt <= (config?.retries ?? this.defaultRetries); attempt++) {
      try {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          credentials: 'include',
          signal: controller.signal,
        })

        clearTimeout(id)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const error: ApiError = {
            code: response.status,
            message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            details: errorData,
          }

          return {
            success: false,
            error,
          }
        }

        const contentType = response.headers.get('content-type')
        let responseData: T

        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json()
        } else {
          responseData = response.statusText as T // For downloads, might be empty
        }

        return {
          success: true,
          data: responseData,
        }

      } catch (error) {
        lastError = error as Error

        if (error instanceof Error && error.name === 'AbortError') {
          lastError.message = 'Request timeout'
          break
        }

        if (attempt < (config?.retries ?? this.defaultRetries)) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    const error: ApiError = {
      code: 'NETWORK_ERROR',
      message: lastError.message || 'Unknown network error',
      details: lastError,
    }

    return {
      success: false,
      error,
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Export class for custom instances if needed
export { ApiClient }

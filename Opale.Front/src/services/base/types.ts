// Base service types for API client

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export interface ApiError {
  code: string | number
  message: string
  details?: any
}

export interface RequestConfig {
  timeout?: number
  retries?: number
  headers?: Record<string, string>
}

export interface User {
  id: string
  email: string
  name?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  userId: string
}

// Default API configuration
export const DEFAULT_API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  retries: 2,
}

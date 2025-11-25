// Authentication service for managing JWT tokens and user sessions

import { apiClient } from './ApiClient'
import { ApiResponse, LoginCredentials, LoginResponse, User } from './types'

class AuthService {
  private readonly STORAGE_KEY = 'opale:auth'

  // Store user context in memory (could be expanded to include user data)
  private user: User | null = null

  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/login', credentials)

    if (response.success && response.data) {
      // Store minimal user context (assuming backend sets JWT in cookie)
      // If we need to store additional user info, fetch it here
      this.user = {
        id: response.data.userId,
        email: credentials.email,
      }

      // Optionally store in localStorage for persistence across sessions
      this.persistAuth(credentials.email)
    }

    return response
  }

  logout(): void {
    this.user = null
    this.clearPersistedAuth()

    // Optionally call backend logout endpoint if it exists
    // For cookie-based auth, just clearing would logout client-side
  }

  async getCurrentUser(): Promise<User | null> {
    // For cookie-based auth, we trust the cookie to be valid
    // If we need user details, we could call a /me endpoint
    return this.user
  }

  isAuthenticated(): boolean {
    // For cookie-based auth, we can't directly check if cookie is valid
    // without making a request. For now, assume authenticated if user is set
    // and cookie exists. In a production app, you might want to verify with backend
    return this.user !== null || this.hasPersistedAuth()
  }

  // Handle authentication errors (e.g., redirect to login)
  onAuthError(): void {
    this.logout()
    // Could trigger a global event or redirect
    // window.location.href = '/login'
  }

  // Private methods for persistence
  private persistAuth(identifier: string): void {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
          email: identifier,
          timestamp: Date.now(),
        }))
      } catch (error) {
        console.warn('Failed to persist auth:', error)
      }
    }
  }

  private clearPersistedAuth(): void {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(this.STORAGE_KEY)
      } catch (error) {
        console.warn('Failed to clear persisted auth:', error)
      }
    }
  }

  private hasPersistedAuth(): boolean {
    if (typeof window === 'undefined') return false

    try {
      const stored = window.localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return false

      const data = JSON.parse(stored)
      // Optional: Check if stored data is recent (e.g., within 24 hours)
      const age = Date.now() - data.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in ms

      return age < maxAge
    } catch (error) {
      console.warn('Failed to check persisted auth:', error)
      this.clearPersistedAuth()
      return false
    }
  }

  // Restore auth state from localStorage (call this on app init)
  restoreAuth(): void {
    if (this.hasPersistedAuth()) {
      try {
        const stored = window.localStorage.getItem(this.STORAGE_KEY)
        const data = JSON.parse(stored!)
        this.user = {
          id: 'restored', // We don't have the original ID, but can populate on first API call
          email: data.email,
        }
      } catch (error) {
        console.warn('Failed to restore auth:', error)
        this.clearPersistedAuth()
      }
    }
  }
}

// Singleton instance
export const authService = new AuthService()

// Export class for custom instances if needed
export { AuthService }

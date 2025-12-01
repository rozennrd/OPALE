// Authentication service for managing JWT tokens and user sessions

import { apiClient } from './ApiClient'
import { LoginCredentials, LoginResponse, User, VerifyResponse } from './types'
import CryptoJS from 'crypto-js';

class AuthService {
  // Store user context in memory (could be expanded to include user data)
  private user: User | null = null

  hashPassword = (password: string) => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  };

  async login(credentials: LoginCredentials): Promise<{ success: boolean, response?: import('./types').ApiResponse<LoginResponse> }>{
    credentials.password = this.hashPassword(credentials.password);
    const response = await apiClient.post<LoginResponse>('/login', credentials)
    if (response.success && response.data && response.data.token) {
      // Store minimal user context
      // JWT is stored in HTTP-only cookie by backend, not in localStorage
      this.user = {
        id: response.data.userId,
        email: credentials.email,
      }
      return { success: true, response }
    }

    return { success: false, response }
  }

  logout(): void {
    this.user = null
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('authToken')
    }

    // Optionally call backend logout endpoint if it exists
    // For cookie-based auth, just clearing would logout client-side
  }

  async getCurrentUser(): Promise<User | null> {
    // For cookie-based auth, we trust the cookie to be valid
    // If we need user details, we could call a /me endpoint
    return this.user
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false

    const token = window.localStorage.getItem('authToken')
    if (!token) return false

    return !this.isTokenExpired(token) && this.user !== null
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiration = payload.exp * 1000
      return Date.now() > expiration
    } catch (e) {
      console.error('Error parsing token:', e)
      return true
    }
  }

  // Handle authentication errors (e.g., redirect to login)
  onAuthError(): void {
    this.logout()
    // Could trigger a global event or redirect
    // window.location.href = '/login'
  }
}

// Singleton instance
export const authService = new AuthService()

// Export class for custom instances if needed
export { AuthService }

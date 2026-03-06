import { apiClient } from './ApiClient'
import { LoginCredentials, LoginResponse, User } from './types'
import * as CryptoJS from 'crypto-js'
import {
    setTokenInLocalStorage,
    removeTokenFromLocalStorage,
    getTokenFromLocalStorage
} from '../../constants/tokenStorage'

class AuthService {
    // Store user context in memory (could be expanded to include user data)
    private user: User | null = null

    hashPassword = (password: string) => {
        return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    };

    private decodeTokenPayload = (token: string): Record<string, unknown> | null => {
        try {
            const payloadSegment = token.split('.')[1]
            if (!payloadSegment) return null

            const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
            const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
            const json = atob(padded)

            const parsed = JSON.parse(json)
            if (parsed && typeof parsed === 'object') {
                return parsed as Record<string, unknown>
            }
        } catch (error) {
            console.error('Error decoding token payload:', error)
        }

        return null
    }

    private getUserFromToken = (token: string): User | null => {
        const payload = this.decodeTokenPayload(token)
        if (!payload) return null

        const idValue = payload.id
        const emailValue = payload.email
        const nameValue = payload.name

        const user: User = {
            id: typeof idValue === 'string' || typeof idValue === 'number' ? String(idValue) : 'unknown',
            email: typeof emailValue === 'string' ? emailValue : '',
            name: typeof nameValue === 'string' ? nameValue : undefined,
        }

        return user
    }

    private ensureUserFromToken = (token: string): void => {
        if (this.user) return
        const derived = this.getUserFromToken(token)
        if (derived) {
            this.user = derived
        }
    }

    async login(credentials: LoginCredentials): Promise<{ success: boolean, response?: import('./types').ApiResponse<LoginResponse> }>{
        credentials.password = this.hashPassword(credentials.password);
        const response = await apiClient.post<LoginResponse>('/login', credentials)
        if (response.success && response.data && response.data.token) {
            // Store JWT token in localStorage like BobPlanning.front
            setTokenInLocalStorage(response.data.token)
            // Store minimal user context
            this.user = this.getUserFromToken(response.data.token) || {
                id: 'unknown', // Not provided in this simple login response
                email: credentials.email,
            }
            return { success: true, response }
        }

        return { success: false, response }
    }

    logout(): void {
        this.user = null
        // Clear token from localStorage
        removeTokenFromLocalStorage()
    }

    async getCurrentUser(): Promise<User | null> {
        if (this.user) return this.user

        if (typeof window !== 'undefined') {
            const token = getTokenFromLocalStorage()
            if (token && !this.isTokenExpired(token)) {
                this.ensureUserFromToken(token)
            }
        }

        return this.user
    }

    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false

        const token = getTokenFromLocalStorage()
        if (!token) return false
        if (this.isTokenExpired(token)) return false

        this.ensureUserFromToken(token)
        return true
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
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
    }
}

// Singleton instance
export const authService = new AuthService()

// Export class for custom instances if needed
export { AuthService }

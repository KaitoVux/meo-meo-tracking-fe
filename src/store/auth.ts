import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { DEV_CONFIG, isDevelopment } from '@/config/development'
import { apiClient } from '@/lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ACCOUNTANT' | 'USER'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  checkAuth: () => Promise<void>
  clearAuth: () => void
  // Mock authentication methods
  loginWithMockUser: () => void
  isMockMode: boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isMockMode: false,

      login: (user, token) => {
        apiClient.setToken(token)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        apiClient.setToken(null)
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isMockMode: false,
        })
      },

      updateUser: userData => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },

      clearAuth: () => {
        apiClient.setToken(null)
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isMockMode: false,
        })
      },

      loginWithMockUser: () => {
        if (isDevelopment && DEV_CONFIG.enableMockAuth) {
          console.log('🚀 Mock authentication enabled - logging in as dev user')
          set({
            user: DEV_CONFIG.mockUser,
            token: DEV_CONFIG.mockToken,
            isAuthenticated: true,
            isMockMode: true,
          })
        }
      },

      checkAuth: async () => {
        // This method is now simplified since TanStack Query handles the profile fetching
        const { token, isMockMode } = get()

        // Auto-login with mock user in development if no existing auth
        if (
          isDevelopment &&
          DEV_CONFIG.enableMockAuth &&
          !token &&
          !isMockMode
        ) {
          get().loginWithMockUser()
          return
        }

        // Set the token in API client if we have one
        if (token) {
          apiClient.setToken(token)
        }

        // TanStack Query will handle the actual profile fetching and error handling
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isMockMode: state.isMockMode,
      }),
    }
  )
)

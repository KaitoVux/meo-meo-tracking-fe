import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

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
        })
      },

      checkAuth: async () => {
        // This method is now simplified since TanStack Query handles the profile fetching
        const { token } = get()

        // Set the token in API client if we have one
        if (token) {
          apiClient.setToken(token)
        }

        // TanStack Query will handle the actual profile fetching and error handling
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => state => {
        // When the store is rehydrated from localStorage, set the token in the API client
        if (state?.token) {
          apiClient.setToken(state.token)
        }
      },
    }
  )
)

import { useEffect, type ReactNode } from 'react'

import { isDevelopment } from '@/config/development'
import { useProfileQuery } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    token,
    isAuthenticated,
    isMockMode,
    login,
    clearAuth,
    loginWithMockUser,
    isLoading: authStoreLoading,
  } = useAuthStore()

  // TanStack Query for profile data - only when we have a token and not in mock mode
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useProfileQuery({
    enabled: !!token && !isMockMode && isAuthenticated,
    retry: false, // Don't retry on auth failures
  })

  const isLoading =
    authStoreLoading || (!!token && !isMockMode && profileLoading)

  useEffect(() => {
    // Auto-login with mock user in development if no existing auth
    if (isDevelopment && !token && !isMockMode) {
      loginWithMockUser()
      return
    }

    // If we have a token but no profile data and not in mock mode, the query will handle fetching
    // If profile query fails, clear auth
    if (profileError && token && !isMockMode) {
      console.error('Auth check failed:', profileError)
      clearAuth()
    }

    // Sync profile data with auth store when it loads
    if (profileData && token && !isMockMode) {
      login(profileData, token)
    }
  }, [
    token,
    isMockMode,
    profileData,
    profileError,
    login,
    clearAuth,
    loginWithMockUser,
  ])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Development mode indicator */}
      {isDevelopment && isMockMode && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500/90 text-yellow-900 px-4 py-2 text-center text-sm font-medium z-50">
          🚀 Development Mode - Mock User Active
        </div>
      )}
      <div className={isDevelopment && isMockMode ? 'pt-10' : ''}>
        {children}
      </div>
    </>
  )
}

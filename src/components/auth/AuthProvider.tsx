import { useEffect, type ReactNode } from 'react'

import { useProfileQuery } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    token,
    isAuthenticated,
    login,
    clearAuth,
    isLoading: authStoreLoading,
  } = useAuthStore()

  // TanStack Query for profile data - only when we have a token
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useProfileQuery({
    enabled: !!token && isAuthenticated,
    retry: false, // Don't retry on auth failures
  })

  const isLoading = authStoreLoading || (!!token && profileLoading)

  useEffect(() => {
    // If profile query fails, clear auth
    if (profileError && token) {
      console.error('Auth check failed:', profileError)
      clearAuth()
    }

    // Sync profile data with auth store when it loads
    if (profileData && token) {
      login(profileData, token)
    }
  }, [token, profileData, profileError, login, clearAuth])

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

  return <>{children}</>
}

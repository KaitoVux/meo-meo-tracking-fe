import { useEffect, type ReactNode } from 'react'

import { isDevelopment } from '@/config/development'
import { useAuthStore } from '@/store/auth'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, isLoading, isMockMode } = useAuthStore()

  useEffect(() => {
    // Check authentication status on app load
    checkAuth()
  }, [checkAuth])

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

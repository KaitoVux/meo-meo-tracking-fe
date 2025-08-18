import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'ACCOUNTANT' | 'USER'
  fallbackPath?: string
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user, token } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    // Set token for API client if user is authenticated
    if (isAuthenticated && token) {
      apiClient.setToken(token)
    }
  }, [isAuthenticated, token])

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // If specific role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    // Accountants can access everything, but users are restricted
    if (requiredRole === 'ACCOUNTANT' && user.role !== 'ACCOUNTANT') {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">
              Access Denied
            </h1>
            <p className="text-muted-foreground mb-4">
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              This page requires Accountant privileges.
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

// Higher-order component for role-based access
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'ACCOUNTANT' | 'USER'
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Hook for checking permissions
export function usePermissions() {
  const { user } = useAuthStore()

  const hasRole = (role: 'ACCOUNTANT' | 'USER') => {
    if (!user) return false

    // Accountants have access to everything
    if (user.role === 'ACCOUNTANT') return true

    // Users only have access to USER role features
    return user.role === role
  }

  const isAccountant = () => hasRole('ACCOUNTANT')
  const isUser = () => user?.role === 'USER'

  return {
    hasRole,
    isAccountant,
    isUser,
    user,
  }
}

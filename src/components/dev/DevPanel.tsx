import { User, LogOut, LogIn, Settings } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { isDevelopment } from '@/config/development'
import { useAuthStore } from '@/store/auth'

export function DevPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isMockMode, loginWithMockUser, logout } = useAuthStore()

  // Only show in development
  if (!isDevelopment) {
    return null
  }

  return (
    <>
      {/* Toggle button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Dev panel */}
      {isOpen && (
        <Card className="fixed bottom-16 right-4 w-80 z-50 bg-background/95 backdrop-blur border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🛠️ Dev Panel
            </CardTitle>
            <CardDescription>
              Development tools and mock authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current user info */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Current User</span>
              </div>
              {user ? (
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                  <p>
                    <strong>Mode:</strong> {isMockMode ? '🚀 Mock' : '🌐 Real'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not authenticated
                </p>
              )}
            </div>

            {/* Auth controls */}
            <div className="flex gap-2">
              {!user ? (
                <Button
                  onClick={loginWithMockUser}
                  size="sm"
                  className="flex-1"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Mock Login
                </Button>
              ) : (
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>

            {/* Instructions */}
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <p>
                <strong>Auto-login:</strong> Mock user will auto-login on page
                refresh
              </p>
              <p>
                <strong>Mock user:</strong> Has ACCOUNTANT role for full access
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

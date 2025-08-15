import React from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { Moon, Sun, User, LogOut } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuthStore()
  const [isDark, setIsDark] = React.useState(true)

  React.useEffect(() => {
    // Set dark mode by default as per requirements
    document.documentElement.classList.add('dark')
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Expense Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Manage your business expenses efficiently
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          {user && (
            <>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({user.role})
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { LoginForm } from '@/components/auth/LoginForm'
import { useAuthStore } from '@/store/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return <LoginForm />
}

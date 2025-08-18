import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { RegisterForm } from '@/components/auth/RegisterForm'
import { useAuthStore } from '@/store/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return <RegisterForm />
}

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { useAuthStore } from './store/auth'

// Placeholder components for other routes
const Expenses = () => <div>Expenses Page - Coming Soon</div>
const NewExpense = () => <div>New Expense Page - Coming Soon</div>
const Reports = () => <div>Reports Page - Coming Soon</div>
const Import = () => <div>Import Page - Coming Soon</div>
const Settings = () => <div>Settings Page - Coming Soon</div>
const Login = () => <div>Login Page - Coming Soon</div>

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  // For demo purposes, let's auto-login a user
  const { login, isAuthenticated } = useAuthStore()
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      // Auto-login for demo - remove this in production
      login(
        {
          id: '1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ACCOUNTANT'
        },
        'demo-token'
      )
    }
  }, [login, isAuthenticated])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="expenses/new" element={<NewExpense />} />
          <Route path="reports" element={<Reports />} />
          <Route path="import" element={<Import />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

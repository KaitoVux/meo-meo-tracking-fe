import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { AuthProvider, ProtectedRoute } from './components/auth'
import { DevPanel } from './components/dev/DevPanel'
import { AppLayout } from './components/layout/AppLayout'
import { CategoriesPage } from './pages/CategoriesPage'
import { Dashboard } from './pages/Dashboard'
import { ExpensesPage } from './pages/ExpensesPage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { VendorsPage } from './pages/VendorsPage'
import { WorkflowPage } from './pages/WorkflowPage'

// Placeholder components for other routes
const NewExpense = () => <div>New Expense Page - Coming Soon</div>
const Reports = () => <div>Reports Page - Coming Soon</div>
const Import = () => <div>Import Page - Coming Soon</div>
const Settings = () => <div>Settings Page - Coming Soon</div>

function App() {
  return (
    <AuthProvider>
      <Router>
        <DevPanel />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes with nested layout */}
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
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="workflow" element={<WorkflowPage />} />
            <Route path="expenses/new" element={<NewExpense />} />
            <Route path="reports" element={<Reports />} />
            <Route path="import" element={<Import />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

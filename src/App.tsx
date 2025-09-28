import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { AuthProvider, ProtectedRoute } from './components/auth'
import { AppLayout } from './components/layout/AppLayout'
import { CategoriesPage } from './pages/CategoriesPage'
import { Dashboard } from './pages/Dashboard'
import { ExpenseDetailPage } from './pages/ExpenseDetailPage'
import { ExpenseEditPage } from './pages/ExpenseEditPage'
import { ExpensesPage } from './pages/ExpensesPage'
import ImportPage from './pages/ImportPage'
import { LoginPage } from './pages/LoginPage'
import { NewExpensePage } from './pages/NewExpensePage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { ReportsPage } from './pages/ReportsPage'
import { VendorsPage } from './pages/VendorsPage'
import { WorkflowPage } from './pages/WorkflowPage'

// Placeholder components for other routes
const Settings = () => <div>Settings Page - Coming Soon</div>

function App() {
  return (
    <AuthProvider>
      <Router>
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
            <Route path="expenses/new" element={<NewExpensePage />} />
            <Route path="expenses/:id" element={<ExpenseDetailPage />} />
            <Route path="expenses/:id/edit" element={<ExpenseEditPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="workflow" element={<WorkflowPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="import" element={<ImportPage />} />
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

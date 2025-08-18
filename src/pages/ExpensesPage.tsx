import React, { useState, useEffect } from 'react'

import { ExpenseForm, ExpenseList, ExpenseDetail } from '@/components/expenses'
import {
  apiClient,
  type Expense,
  type Category,
  type CreateExpenseRequest,
  type UpdateExpenseRequest,
} from '@/lib/api'
import { type ExpenseFormData } from '@/lib/validations'
import { useAuthStore } from '@/store/auth'

type ViewMode = 'list' | 'create' | 'edit' | 'detail'

export function ExpensesPage() {
  const { user } = useAuthStore()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  const loadCategories = async () => {
    try {
      const response = await apiClient.getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to load categories:', error)
      // You might want to show a toast notification here
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleCreateExpense = () => {
    setSelectedExpense(null)
    setViewMode('create')
  }

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setViewMode('edit')
  }

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setViewMode('detail')
  }

  const handleDeleteExpense = async (expense: Expense) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      await apiClient.deleteExpense(expense.id)
      // Refresh the list by going back to list view
      setViewMode('list')
      // You might want to show a success toast here
    } catch (error) {
      console.error('Failed to delete expense:', error)
      // You might want to show an error toast here
    }
  }

  const handleSubmitExpense = async (
    data: ExpenseFormData & { invoiceFileId?: string }
  ) => {
    if (!user) return

    setLoading(true)
    try {
      if (viewMode === 'create') {
        const createData: CreateExpenseRequest = {
          ...data,
          submitterId: user.id,
        }
        await apiClient.createExpense(createData)
        // You might want to show a success toast here
      } else if (viewMode === 'edit' && selectedExpense) {
        const updateData: UpdateExpenseRequest = data
        await apiClient.updateExpense(selectedExpense.id, updateData)
        // You might want to show a success toast here
      }

      setViewMode('list')
    } catch (error) {
      console.error('Failed to save expense:', error)
      // You might want to show an error toast here
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!selectedExpense) return

    try {
      await apiClient.updateExpenseStatus(selectedExpense.id, status)
      // Update the selected expense with new status
      setSelectedExpense(prev =>
        prev ? { ...prev, status: status as any } : null
      )
      // You might want to show a success toast here
    } catch (error) {
      console.error('Failed to update expense status:', error)
      // You might want to show an error toast here
    }
  }

  const handleCancel = () => {
    setViewMode('list')
    setSelectedExpense(null)
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedExpense(null)
  }

  const handleEditFromDetail = () => {
    setViewMode('edit')
  }

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <ExpenseForm
        expense={selectedExpense || undefined}
        categories={categories}
        onSubmit={handleSubmitExpense}
        onCancel={handleCancel}
        isLoading={loading}
      />
    )
  }

  if (viewMode === 'detail' && selectedExpense) {
    return (
      <ExpenseDetail
        expense={selectedExpense}
        onBack={handleBackToList}
        onEdit={handleEditFromDetail}
        onStatusChange={handleStatusChange}
      />
    )
  }

  return (
    <ExpenseList
      onCreateExpense={handleCreateExpense}
      onEditExpense={handleEditExpense}
      onViewExpense={handleViewExpense}
      onDeleteExpense={handleDeleteExpense}
    />
  )
}

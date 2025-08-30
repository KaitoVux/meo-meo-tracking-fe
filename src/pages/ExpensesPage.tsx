import { useState } from 'react'

import { ExpenseDetail, ExpenseForm, ExpenseList } from '@/components/expenses'
import { apiClient, type Expense } from '@/lib/api'
import { useExpenseQuery } from '@/lib/queries/expenses'

type ViewMode = 'list' | 'create' | 'edit' | 'detail'

export function ExpensesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  )

  // Fetch full expense details when editing or viewing
  const { data: expenseDetailResponse, isLoading: isLoadingExpenseDetail } =
    useExpenseQuery(selectedExpenseId || '')

  // Use the detailed expense data when available
  const expenseToUse = expenseDetailResponse?.data || selectedExpense

  const handleCreateExpense = () => {
    setSelectedExpense(null)
    setViewMode('create')
  }

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setSelectedExpenseId(expense.id)
    setViewMode('edit')
  }

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setSelectedExpenseId(expense.id)
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

  const handleSubmitExpense = (_expense: Expense) => {
    // Handle the created/updated expense
    setViewMode('list')
    setSelectedExpense(null)
    // You might want to show a success toast here
  }

  const handleStatusChange = async (status: string) => {
    if (!selectedExpense) return

    try {
      await apiClient.updateExpenseStatus(selectedExpense.id, status)
      // Update the selected expense with new status
      setSelectedExpense(prev =>
        prev ? { ...prev, status: status as Expense['status'] } : null
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
    setSelectedExpenseId(null)
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedExpense(null)
    setSelectedExpenseId(null)
  }

  const handleEditFromDetail = () => {
    setViewMode('edit')
  }

  if (viewMode === 'create') {
    return (
      <ExpenseForm onSubmit={handleSubmitExpense} onCancel={handleCancel} />
    )
  }

  if (viewMode === 'edit') {
    if (isLoadingExpenseDetail) {
      return <div>Loading expense details...</div>
    }
    return (
      <ExpenseForm
        expense={expenseToUse || undefined}
        onSubmit={handleSubmitExpense}
        onCancel={handleCancel}
      />
    )
  }

  if (viewMode === 'detail' && expenseToUse) {
    if (isLoadingExpenseDetail) {
      return <div>Loading expense details...</div>
    }
    return (
      <ExpenseDetail
        expense={expenseToUse}
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

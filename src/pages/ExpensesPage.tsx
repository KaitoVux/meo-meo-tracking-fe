import { useNavigate } from 'react-router-dom'

import { ExpenseList } from '@/components/expenses'
import { apiClient, type Expense } from '@/lib/api'

export function ExpensesPage() {
  const navigate = useNavigate()

  const handleCreateExpense = () => {
    navigate('/expenses/new')
  }

  const handleEditExpense = (expense: Expense) => {
    navigate(`/expenses/${expense.id}/edit`)
  }

  const handleViewExpense = (expense: Expense) => {
    navigate(`/expenses/${expense.id}`)
  }

  const handleDeleteExpense = async (expense: Expense) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      await apiClient.deleteExpense(expense.id)
      // The ExpenseList component will automatically refresh via React Query
      // You might want to show a success toast here
    } catch (error) {
      console.error('Failed to delete expense:', error)
      // You might want to show an error toast here
    }
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

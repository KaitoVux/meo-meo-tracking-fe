import { useNavigate, useParams } from 'react-router-dom'

import { ExpenseForm } from '@/components/expenses'
import { type Expense } from '@/lib/api'
import { useExpenseQuery } from '@/lib/queries/expenses'

export function ExpenseEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: expenseResponse, isLoading, error } = useExpenseQuery(id || '')

  const handleSubmit = (expense: Expense) => {
    // Navigate back to the expense detail page after successful update
    navigate(`/expenses/${expense.id}`)
  }

  const handleCancel = () => {
    // Navigate back to the expense detail page
    navigate(`/expenses/${id}`)
  }

  if (isLoading) {
    return <div>Loading expense details...</div>
  }

  if (error) {
    return <div>Error loading expense details. Please try again.</div>
  }

  if (!expenseResponse?.data) {
    return <div>Expense not found.</div>
  }

  return (
    <ExpenseForm
      expense={expenseResponse.data}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}

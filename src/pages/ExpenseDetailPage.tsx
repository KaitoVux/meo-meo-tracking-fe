import { useNavigate, useParams } from 'react-router-dom'

import { ExpenseDetail } from '@/components/expenses'
import {
  useExpenseQuery,
  useUpdateExpenseStatusMutation,
} from '@/lib/queries/expenses'

export function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: expenseResponse, isLoading, error } = useExpenseQuery(id || '')
  const updateStatusMutation = useUpdateExpenseStatusMutation()

  const handleBack = () => {
    navigate('/expenses')
  }

  const handleEdit = () => {
    navigate(`/expenses/${id}/edit`)
  }

  const handleStatusChange = async (status: string, notes?: string) => {
    if (!id) return

    try {
      await updateStatusMutation.mutateAsync({ id, status, notes })
    } catch (error) {
      console.error('Failed to update expense status:', error)
      throw error
    }
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
    <ExpenseDetail
      expense={expenseResponse.data}
      onBack={handleBack}
      onEdit={handleEdit}
      onStatusChange={handleStatusChange}
    />
  )
}

import { useNavigate } from 'react-router-dom'

import { ExpenseForm } from '@/components/expenses'
import { type Expense } from '@/lib/api'

export function NewExpensePage() {
  const navigate = useNavigate()

  const handleSubmit = (expense: Expense) => {
    // Navigate to the newly created expense detail page
    navigate(`/expenses/${expense.id}`)
  }

  const handleCancel = () => {
    // Navigate back to the expenses list
    navigate('/expenses')
  }

  return <ExpenseForm onSubmit={handleSubmit} onCancel={handleCancel} />
}

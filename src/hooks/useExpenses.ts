/**
 * Convenient re-exports for expense-related hooks
 * This provides a cleaner import path for components
 */

export {
  useExpensesQuery,
  useExpenseQuery,
  useExpenseStatusHistoryQuery,
  useInfiniteExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useUpdateExpenseStatusMutation,
  useDeleteExpenseMutation,
} from '../lib/queries/expenses'

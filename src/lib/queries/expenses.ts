import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type {
  ApiResponse,
  CreateExpenseRequest,
  Expense,
  ExpenseQueryParams,
  UpdateExpenseRequest,
} from '../api'
import { apiClient } from '../api'
import { invalidateQueries, queryKeys } from '../query-keys'

// Expense Query Hooks

/**
 * Query hook for fetching paginated expenses with filters
 */
export function useExpensesQuery(params?: ExpenseQueryParams) {
  return useQuery({
    queryKey: queryKeys.expenses.list(params),
    queryFn: () => apiClient.getExpenses(params),
    placeholderData: previousData => previousData, // Keep previous data while loading new
  })
}

/**
 * Query hook for fetching a single expense by ID
 */
export function useExpenseQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.expenses.detail(id),
    queryFn: () => apiClient.getExpense(id),
    enabled: !!id, // Only run query if ID is provided
  })
}

/**
 * Query hook for fetching expense status history
 */
export function useExpenseStatusHistoryQuery(expenseId: string) {
  return useQuery({
    queryKey: queryKeys.expenses.statusHistory(expenseId),
    queryFn: () => apiClient.getExpenseStatusHistory(expenseId),
    enabled: !!expenseId,
  })
}

/**
 * Infinite query hook for expenses (useful for infinite scrolling)
 */
export function useInfiniteExpensesQuery(
  baseParams?: Omit<ExpenseQueryParams, 'page'>
) {
  return useInfiniteQuery({
    queryKey: queryKeys.expenses.list({ ...baseParams, infinite: true }),
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getExpenses({ ...baseParams, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: ApiResponse<Expense[]>) => {
      if (!lastPage.pagination) return undefined
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    getPreviousPageParam: (firstPage: ApiResponse<Expense[]>) => {
      if (!firstPage.pagination) return undefined
      const { page } = firstPage.pagination
      return page > 1 ? page - 1 : undefined
    },
  })
}

// Expense Mutation Hooks

/**
 * Mutation hook for creating a new expense
 */
export function useCreateExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (expenseData: CreateExpenseRequest) =>
      apiClient.createExpense(expenseData),
    onMutate: async newExpense => {
      // Cancel any outgoing refetches for expense lists
      await queryClient.cancelQueries({ queryKey: queryKeys.expenses.lists() })

      // Snapshot the previous value
      const previousExpenses = queryClient.getQueriesData({
        queryKey: queryKeys.expenses.lists(),
      })

      // Optimistically update expense lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.expenses.lists() },
        (old: ApiResponse<Expense[]> | undefined) => {
          if (!old || !old.data) return old

          // Create optimistic expense object
          const optimisticExpense: Expense = {
            id: `temp-${Date.now()}`,
            paymentId: 'PENDING',
            status: 'DRAFT',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            submitter: {
              id: 'current-user',
              email: 'current@user.com',
              firstName: 'Current',
              lastName: 'User',
            },
            vendor:
              typeof newExpense.vendorId === 'string'
                ? {
                    id: newExpense.vendorId,
                    name: 'Loading...',
                    status: 'ACTIVE',
                    createdAt: '',
                    updatedAt: '',
                  }
                : newExpense.vendorId,
            ...newExpense,
          } as Expense

          return {
            ...old,
            data: [optimisticExpense, ...old.data],
            pagination: old.pagination
              ? {
                  ...old.pagination,
                  total: old.pagination.total + 1,
                }
              : undefined,
          }
        }
      )

      return { previousExpenses }
    },
    onError: (error, newExpense, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousExpenses) {
        context.previousExpenses.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to create expense:', error)
    },
    onSuccess: data => {
      // Add the new expense to the cache
      if (data.data) {
        queryClient.setQueryData(queryKeys.expenses.detail(data.data.id), data)
      }
    },
    onSettled: () => {
      // Always refetch expense lists to ensure consistency
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.expenseLists(),
      })
    },
  })
}

/**
 * Mutation hook for updating an expense
 */
export function useUpdateExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
      apiClient.updateExpense(id, data),
    onMutate: async ({ id, data: updateData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.expenses.detail(id),
      })

      // Snapshot the previous value
      const previousExpense = queryClient.getQueryData(
        queryKeys.expenses.detail(id)
      )

      // Optimistically update the expense
      queryClient.setQueryData(
        queryKeys.expenses.detail(id),
        (old: ApiResponse<Expense> | undefined) => {
          if (!old || !old.data) return old
          return {
            ...old,
            data: {
              ...old.data,
              ...updateData,
              updatedAt: new Date().toISOString(),
            },
          }
        }
      )

      // Also update the expense in any list queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.expenses.lists() },
        (old: ApiResponse<Expense[]> | undefined) => {
          if (!old || !old.data) return old
          return {
            ...old,
            data: old.data.map((expense: Expense) =>
              expense.id === id
                ? {
                    ...expense,
                    ...updateData,
                    updatedAt: new Date().toISOString(),
                  }
                : expense
            ),
          }
        }
      )

      return { previousExpense }
    },
    onError: (error, { id }, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousExpense) {
        queryClient.setQueryData(
          queryKeys.expenses.detail(id),
          context.previousExpense
        )
      }
      console.error('Failed to update expense:', error)
    },
    onSettled: (data, error, { id }) => {
      // Always refetch the specific expense and lists
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.detail(id) })
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.expenseLists(),
      })
    },
  })
}

/**
 * Mutation hook for updating expense status
 */
export function useUpdateExpenseStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string
      status: string
      notes?: string
    }) => apiClient.updateExpenseStatus(id, status, notes),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.expenses.detail(id),
      })

      // Snapshot the previous value
      const previousExpense = queryClient.getQueryData(
        queryKeys.expenses.detail(id)
      )

      // Optimistically update the expense status
      queryClient.setQueryData(
        queryKeys.expenses.detail(id),
        (old: ApiResponse<Expense> | undefined) => {
          if (!old || !old.data) return old
          return {
            ...old,
            data: {
              ...old.data,
              status: status as Expense['status'],
              updatedAt: new Date().toISOString(),
            },
          }
        }
      )

      // Also update the expense in any list queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.expenses.lists() },
        (old: ApiResponse<Expense[]> | undefined) => {
          if (!old || !old.data) return old
          return {
            ...old,
            data: old.data.map((expense: Expense) =>
              expense.id === id
                ? {
                    ...expense,
                    status: status as Expense['status'],
                    updatedAt: new Date().toISOString(),
                  }
                : expense
            ),
          }
        }
      )

      return { previousExpense }
    },
    onError: (error, { id }, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousExpense) {
        queryClient.setQueryData(
          queryKeys.expenses.detail(id),
          context.previousExpense
        )
      }
      console.error('Failed to update expense status:', error)
    },
    onSuccess: (data, { id }) => {
      // Invalidate status history to refetch latest
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.statusHistory(id),
      })
    },
    onSettled: (data, error, { id }) => {
      // Always refetch the specific expense and lists
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.detail(id) })
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.expenseLists(),
      })
    },
  })
}

/**
 * Mutation hook for deleting an expense
 */
export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteExpense(id),
    onMutate: async id => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.expenses.lists() })

      // Snapshot the previous value
      const previousExpenses = queryClient.getQueriesData({
        queryKey: queryKeys.expenses.lists(),
      })

      // Optimistically remove the expense from lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.expenses.lists() },
        (old: ApiResponse<Expense[]> | undefined) => {
          if (!old || !old.data) return old
          return {
            ...old,
            data: old.data.filter((expense: Expense) => expense.id !== id),
            pagination: old.pagination
              ? {
                  ...old.pagination,
                  total: old.pagination.total - 1,
                }
              : undefined,
          }
        }
      )

      return { previousExpenses }
    },
    onError: (error, id, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousExpenses) {
        context.previousExpenses.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to delete expense:', error)
    },
    onSuccess: (_data, id) => {
      // Remove the expense detail from cache
      queryClient.removeQueries({ queryKey: queryKeys.expenses.detail(id) })
    },
    onSettled: () => {
      // Always refetch expense lists to ensure consistency
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.expenseLists(),
      })
    },
  })
}

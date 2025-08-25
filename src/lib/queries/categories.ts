import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '../api'
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQueryParams,
} from '../api'
import { queryKeys, invalidateQueries } from '../query-keys'

// Category Query Hooks

/**
 * Query hook for fetching categories
 */
export function useCategoriesQuery(params?: CategoryQueryParams) {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => apiClient.getCategories(params),
    staleTime: 10 * 60 * 1000, // Categories don't change often, keep fresh for 10 minutes
  })
}

/**
 * Query hook for fetching a single category by ID
 */
export function useCategoryQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => apiClient.getCategory(id),
    enabled: !!id,
  })
}

/**
 * Query hook for fetching category usage statistics
 */
export function useCategoryUsageQuery(
  id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.categories.usage(id),
    queryFn: () => apiClient.getCategoryUsage(id),
    enabled: !!id && options?.enabled !== false,
  })
}

/**
 * Query hook for fetching category statistics
 */
export function useCategoryStatisticsQuery() {
  return useQuery({
    queryKey: queryKeys.categories.statistics(),
    queryFn: () => apiClient.getCategoryStatistics(),
  })
}

// Category Mutation Hooks

/**
 * Mutation hook for creating a new category
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryData: CreateCategoryRequest) =>
      apiClient.createCategory(categoryData),
    onMutate: async newCategory => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.categories.lists(),
      })

      // Snapshot the previous value
      const previousCategories = queryClient.getQueriesData({
        queryKey: queryKeys.categories.lists(),
      })

      // Optimistically update category lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.categories.lists() },
        (old: { success: boolean; data: Category[] } | undefined) => {
          if (!old) return old

          // Create optimistic category object
          const optimisticCategory: Category = {
            id: `temp-${Date.now()}`,
            name: newCategory.name,
            code: newCategory.code,
            description: newCategory.description,
            isActive: newCategory.isActive ?? true,
            parentId: newCategory.parentId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
          }

          return {
            ...old,
            data: [...old.data, optimisticCategory],
          }
        }
      )

      return { previousCategories }
    },
    onError: (error, newCategory, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousCategories) {
        context.previousCategories.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to create category:', error)
    },
    onSuccess: data => {
      // Add the new category to the cache
      queryClient.setQueryData(queryKeys.categories.detail(data.data.id), {
        success: true,
        data: data.data,
      })
    },
    onSettled: () => {
      // Always refetch category lists and statistics
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.categoryLists(),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.statistics(),
      })
    },
  })
}

/**
 * Mutation hook for updating a category
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      apiClient.updateCategory(id, data),
    onMutate: async ({ id, data: updateData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.categories.detail(id),
      })

      // Snapshot the previous value
      const previousCategory = queryClient.getQueryData(
        queryKeys.categories.detail(id)
      )

      // Optimistically update the category
      queryClient.setQueryData(
        queryKeys.categories.detail(id),
        (old: { success: boolean; data: Category } | undefined) => {
          if (!old) return old
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

      // Also update the category in any list queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.categories.lists() },
        (old: { success: boolean; data: Category[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map(category =>
              category.id === id
                ? {
                    ...category,
                    ...updateData,
                    updatedAt: new Date().toISOString(),
                  }
                : category
            ),
          }
        }
      )

      return { previousCategory }
    },
    onError: (error, { id }, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousCategory) {
        queryClient.setQueryData(
          queryKeys.categories.detail(id),
          context.previousCategory
        )
      }
      console.error('Failed to update category:', error)
    },
    onSettled: (data, error, { id }) => {
      // Always refetch the specific category and lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.detail(id),
      })
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.categoryLists(),
      })
    },
  })
}

/**
 * Mutation hook for updating category status (active/inactive)
 */
export function useUpdateCategoryStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.updateCategoryStatus(id, isActive),
    onMutate: async ({ id, isActive }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.categories.detail(id),
      })

      // Snapshot the previous value
      const previousCategory = queryClient.getQueryData(
        queryKeys.categories.detail(id)
      )

      // Optimistically update the category status
      queryClient.setQueryData(
        queryKeys.categories.detail(id),
        (old: { success: boolean; data: Category } | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: {
              ...old.data,
              isActive,
              updatedAt: new Date().toISOString(),
            },
          }
        }
      )

      // Also update the category in any list queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.categories.lists() },
        (old: { success: boolean; data: Category[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map(category =>
              category.id === id
                ? { ...category, isActive, updatedAt: new Date().toISOString() }
                : category
            ),
          }
        }
      )

      return { previousCategory }
    },
    onError: (error, { id }, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousCategory) {
        queryClient.setQueryData(
          queryKeys.categories.detail(id),
          context.previousCategory
        )
      }
      console.error('Failed to update category status:', error)
    },
    onSettled: (data, error, { id }) => {
      // Always refetch the specific category and lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.detail(id),
      })
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.categoryLists(),
      })
    },
  })
}

/**
 * Mutation hook for deleting a category
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCategory(id),
    onMutate: async id => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.categories.lists(),
      })

      // Snapshot the previous value
      const previousCategories = queryClient.getQueriesData({
        queryKey: queryKeys.categories.lists(),
      })

      // Optimistically remove the category from lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.categories.lists() },
        (old: { success: boolean; data: Category[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter(category => category.id !== id),
          }
        }
      )

      return { previousCategories }
    },
    onError: (error, id, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousCategories) {
        context.previousCategories.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to delete category:', error)
    },
    onSuccess: (data, id) => {
      // Remove the category detail from cache
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(id) })
    },
    onSettled: () => {
      // Always refetch category lists and statistics
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.categoryLists(),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.statistics(),
      })
    },
  })
}

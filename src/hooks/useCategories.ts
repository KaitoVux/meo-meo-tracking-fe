/**
 * Convenient re-exports for category-related hooks
 * This provides a cleaner import path for components
 */

export {
  useCategoriesQuery,
  useCategoryQuery,
  useCategoryUsageQuery,
  useCategoryStatisticsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useUpdateCategoryStatusMutation,
  useDeleteCategoryMutation,
} from '../lib/queries/categories'

/**
 * Centralized query key factory for TanStack Query
 *
 * This provides a hierarchical structure for query keys that enables
 * efficient cache invalidation and management.
 *
 * Structure:
 * - Level 1: Feature area (auth, expenses, categories, etc.)
 * - Level 2: Operation type (list, detail, etc.)
 * - Level 3: Specific parameters (filters, IDs, etc.)
 */

export const queryKeys = {
  // Authentication queries
  auth: {
    all: ['auth'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
    user: (id: string) => [...queryKeys.auth.all, 'user', id] as const,
  },

  // Expense queries
  expenses: {
    all: ['expenses'] as const,
    lists: () => [...queryKeys.expenses.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.expenses.lists(), filters] as const,
    details: () => [...queryKeys.expenses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.expenses.details(), id] as const,
    statusHistory: (id: string) =>
      [...queryKeys.expenses.detail(id), 'statusHistory'] as const,
    availableTransitions: (id: string) =>
      [...queryKeys.expenses.detail(id), 'availableTransitions'] as const,
  },

  // Category queries
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.categories.lists(), params] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
    usage: (id: string) =>
      [...queryKeys.categories.detail(id), 'usage'] as const,
    statistics: () => [...queryKeys.categories.all, 'statistics'] as const,
  },

  // Vendor queries
  vendors: {
    all: ['vendors'] as const,
    lists: () => [...queryKeys.vendors.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.vendors.lists(), params] as const,
    active: () => [...queryKeys.vendors.lists(), 'active'] as const,
    details: () => [...queryKeys.vendors.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.vendors.details(), id] as const,
  },

  // File queries
  files: {
    all: ['files'] as const,
    detail: (id: string) => [...queryKeys.files.all, 'detail', id] as const,
    upload: () => [...queryKeys.files.all, 'upload'] as const,
  },

  // Notification queries
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (params?: any) =>
      [...queryKeys.notifications.lists(), params] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
  },

  // Workflow queries
  workflow: {
    all: ['workflow'] as const,
    transitions: (expenseId: string) =>
      [...queryKeys.workflow.all, 'transitions', expenseId] as const,
    history: (expenseId: string) =>
      [...queryKeys.workflow.all, 'history', expenseId] as const,
  },

  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
  },

  // Report queries
  reports: {
    all: ['reports'] as const,
    lists: () => [...queryKeys.reports.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.reports.lists(), params] as const,
    export: (params?: Record<string, unknown>) =>
      [...queryKeys.reports.all, 'export', params] as const,
  },

  // Currency queries
  currency: {
    all: ['currency'] as const,
    exchangeRate: (from: string, to: string) =>
      [...queryKeys.currency.all, 'exchangeRate', from, to] as const,
    conversion: (amount: number, from: string, to: string) =>
      [...queryKeys.currency.all, 'conversion', amount, from, to] as const,
  },
} as const

// Type helpers for query keys
export type QueryKey = typeof queryKeys

// Helper type to extract return type from functions or return the type itself for arrays
type ExtractQueryKey<T> = T extends (...args: unknown[]) => infer R ? R : T

export type AuthQueryKey = ExtractQueryKey<
  (typeof queryKeys.auth)[keyof typeof queryKeys.auth]
>
export type ExpenseQueryKey = ExtractQueryKey<
  (typeof queryKeys.expenses)[keyof typeof queryKeys.expenses]
>
export type CategoryQueryKey = ExtractQueryKey<
  (typeof queryKeys.categories)[keyof typeof queryKeys.categories]
>
export type VendorQueryKey = ExtractQueryKey<
  (typeof queryKeys.vendors)[keyof typeof queryKeys.vendors]
>
export type FileQueryKey = ExtractQueryKey<
  (typeof queryKeys.files)[keyof typeof queryKeys.files]
>
export type NotificationQueryKey = ExtractQueryKey<
  (typeof queryKeys.notifications)[keyof typeof queryKeys.notifications]
>
export type WorkflowQueryKey = ExtractQueryKey<
  (typeof queryKeys.workflow)[keyof typeof queryKeys.workflow]
>

// Utility functions for cache invalidation
export const invalidateQueries = {
  // Invalidate all auth-related queries
  auth: () => queryKeys.auth.all,

  // Invalidate all expense queries
  expenses: () => queryKeys.expenses.all,

  // Invalidate expense lists (but keep detail queries)
  expenseLists: () => queryKeys.expenses.lists(),

  // Invalidate specific expense detail
  expenseDetail: (id: string) => queryKeys.expenses.detail(id),

  // Invalidate all category queries
  categories: () => queryKeys.categories.all,

  // Invalidate category lists
  categoryLists: () => queryKeys.categories.lists(),

  // Invalidate all vendor queries
  vendors: () => queryKeys.vendors.all,

  // Invalidate vendor lists
  vendorLists: () => queryKeys.vendors.lists(),

  // Invalidate notifications
  notifications: () => queryKeys.notifications.all,

  // Invalidate dashboard
  dashboard: () => queryKeys.dashboard.all,

  // Invalidate reports
  reports: () => queryKeys.reports.all,

  // Invalidate currency data
  currency: () => queryKeys.currency.all,
}

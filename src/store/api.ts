import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Types for loading states
export interface LoadingState {
  isLoading: boolean
  progress?: number
  message?: string
}

export interface ApiLoadingState {
  // Global loading state
  globalLoading: boolean

  // Feature-specific loading states
  auth: LoadingState
  expenses: LoadingState
  categories: LoadingState
  vendors: LoadingState
  files: LoadingState
  notifications: LoadingState
  reports: LoadingState
  dashboard: LoadingState

  // Upload progress tracking
  uploadProgress: Record<string, number>

  // Actions
  setGlobalLoading: (loading: boolean) => void
  setFeatureLoading: (
    feature: keyof Omit<
      ApiLoadingState,
      | 'globalLoading'
      | 'uploadProgress'
      | 'setGlobalLoading'
      | 'setFeatureLoading'
      | 'setUploadProgress'
      | 'clearUploadProgress'
      | 'reset'
    >,
    state: Partial<LoadingState>
  ) => void
  setUploadProgress: (fileId: string, progress: number) => void
  clearUploadProgress: (fileId: string) => void
  reset: () => void
}

const initialLoadingState: LoadingState = {
  isLoading: false,
  progress: undefined,
  message: undefined,
}

export const useApiStore = create<ApiLoadingState>()(
  devtools(
    set => ({
      // Initial state
      globalLoading: false,
      auth: { ...initialLoadingState },
      expenses: { ...initialLoadingState },
      categories: { ...initialLoadingState },
      vendors: { ...initialLoadingState },
      files: { ...initialLoadingState },
      notifications: { ...initialLoadingState },
      reports: { ...initialLoadingState },
      dashboard: { ...initialLoadingState },
      uploadProgress: {},

      // Actions
      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading }, false, 'setGlobalLoading')
      },

      setFeatureLoading: (feature, state) => {
        set(
          prevState => ({
            [feature]: {
              ...prevState[feature],
              ...state,
            },
          }),
          false,
          `setFeatureLoading:${feature}`
        )
      },

      setUploadProgress: (fileId: string, progress: number) => {
        set(
          prevState => ({
            uploadProgress: {
              ...prevState.uploadProgress,
              [fileId]: progress,
            },
          }),
          false,
          'setUploadProgress'
        )
      },

      clearUploadProgress: (fileId: string) => {
        set(
          prevState => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [fileId]: _, ...rest } = prevState.uploadProgress
            return { uploadProgress: rest }
          },
          false,
          'clearUploadProgress'
        )
      },

      reset: () => {
        set(
          {
            globalLoading: false,
            auth: { ...initialLoadingState },
            expenses: { ...initialLoadingState },
            categories: { ...initialLoadingState },
            vendors: { ...initialLoadingState },
            files: { ...initialLoadingState },
            notifications: { ...initialLoadingState },
            reports: { ...initialLoadingState },
            dashboard: { ...initialLoadingState },
            uploadProgress: {},
          },
          false,
          'reset'
        )
      },
    }),
    {
      name: 'api-store',
    }
  )
)

// Selector hooks for better performance
export const useGlobalLoading = () => useApiStore(state => state.globalLoading)
export const useFeatureLoading = (
  feature: keyof Pick<
    ApiLoadingState,
    | 'auth'
    | 'expenses'
    | 'categories'
    | 'vendors'
    | 'files'
    | 'notifications'
    | 'reports'
    | 'dashboard'
  >
) => useApiStore(state => state[feature])
export const useUploadProgress = (fileId?: string) =>
  useApiStore(state =>
    fileId ? state.uploadProgress[fileId] : state.uploadProgress
  )

// Helper hooks for common loading patterns
export const useIsAnyLoading = () =>
  useApiStore(
    state =>
      state.globalLoading ||
      state.auth.isLoading ||
      state.expenses.isLoading ||
      state.categories.isLoading ||
      state.vendors.isLoading ||
      state.files.isLoading ||
      state.notifications.isLoading ||
      state.reports.isLoading ||
      state.dashboard.isLoading
  )

export const useLoadingMessage = () =>
  useApiStore(state => {
    if (state.globalLoading) return 'Loading...'
    if (state.auth.isLoading) return state.auth.message || 'Authenticating...'
    if (state.expenses.isLoading)
      return state.expenses.message || 'Loading expenses...'
    if (state.categories.isLoading)
      return state.categories.message || 'Loading categories...'
    if (state.vendors.isLoading)
      return state.vendors.message || 'Loading vendors...'
    if (state.files.isLoading)
      return state.files.message || 'Processing files...'
    if (state.notifications.isLoading)
      return state.notifications.message || 'Loading notifications...'
    if (state.reports.isLoading)
      return state.reports.message || 'Generating report...'
    if (state.dashboard.isLoading)
      return state.dashboard.message || 'Loading dashboard...'
    return null
  })

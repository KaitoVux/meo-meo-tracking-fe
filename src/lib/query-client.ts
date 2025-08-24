import { QueryClient } from '@tanstack/react-query'

// Create a client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Time before inactive queries are garbage collected (10 minutes)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      // Retry delay with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Refetch on network reconnection
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: 'always',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
})

// Global error handler for queries
queryClient.setMutationDefaults(['auth', 'login'], {
  mutationFn: async (_variables: any) => {
    // This will be overridden by specific mutations
    throw new Error('Mutation function not implemented')
  },
  onError: (error: any) => {
    console.error('Authentication error:', error)
    // Handle auth errors globally
    if (error?.status === 401) {
      // Clear auth state and redirect to login
      queryClient.clear()
    }
  },
})

// Configure global query error handling
queryClient.setQueryDefaults(['auth'], {
  staleTime: 10 * 60 * 1000, // Auth data stays fresh for 10 minutes
  gcTime: 15 * 60 * 1000, // Keep auth data in cache for 15 minutes
})

// Configure caching for different data types
queryClient.setQueryDefaults(['expenses'], {
  staleTime: 2 * 60 * 1000, // Expenses data stale after 2 minutes
  gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
})

queryClient.setQueryDefaults(['categories'], {
  staleTime: 10 * 60 * 1000, // Categories change less frequently
  gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
})

queryClient.setQueryDefaults(['vendors'], {
  staleTime: 5 * 60 * 1000, // Vendors data stale after 5 minutes
  gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
})

queryClient.setQueryDefaults(['notifications'], {
  staleTime: 30 * 1000, // Notifications stale after 30 seconds
  gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
  refetchInterval: 60 * 1000, // Auto-refetch every minute
})

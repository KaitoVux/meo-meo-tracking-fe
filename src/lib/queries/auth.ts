import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '../api'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UpdateProfileRequest,
} from '../api'
import { queryKeys } from '../query-keys'

// Auth Query Hooks

/**
 * Query hook for fetching user profile
 */
export function useProfileQuery(options?: {
  enabled?: boolean
  retry?: boolean | number | ((failureCount: number, error: any) => boolean)
}) {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => apiClient.getProfile(),
    retry:
      options?.retry !== undefined
        ? options.retry
        : (failureCount, error: any) => {
            // Don't retry on 401 errors (unauthorized)
            if (error?.status === 401) {
              return false
            }
            return failureCount < 2
          },
    enabled: options?.enabled,
  })
}

// Auth Mutation Hooks

/**
 * Mutation hook for user login
 */
export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => apiClient.login(credentials),
    onSuccess: (data: AuthResponse) => {
      // Set the token in the API client
      apiClient.setToken(data.access_token)

      // Cache the user profile data
      queryClient.setQueryData(queryKeys.auth.profile(), data.user)

      // Invalidate and refetch any auth-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
    },
    onError: error => {
      console.error('Login failed:', error)
      // Clear any existing auth data on login failure
      queryClient.removeQueries({ queryKey: queryKeys.auth.all })
    },
  })
}

/**
 * Mutation hook for user registration
 */
export function useRegisterMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: RegisterRequest) => apiClient.register(userData),
    onSuccess: (data: AuthResponse) => {
      // Set the token in the API client
      apiClient.setToken(data.access_token)

      // Cache the user profile data
      queryClient.setQueryData(queryKeys.auth.profile(), data.user)

      // Invalidate and refetch any auth-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
    },
    onError: error => {
      console.error('Registration failed:', error)
    },
  })
}

/**
 * Mutation hook for updating user profile
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: UpdateProfileRequest) =>
      apiClient.updateProfile(userData),
    onMutate: async newUserData => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.profile() })

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(queryKeys.auth.profile())

      // Optimistically update the cache
      if (previousUser) {
        queryClient.setQueryData(queryKeys.auth.profile(), {
          ...previousUser,
          ...newUserData,
        })
      }

      // Return a context object with the snapshotted value
      return { previousUser }
    },
    onError: (error, newUserData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.auth.profile(), context.previousUser)
      }
      console.error('Profile update failed:', error)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() })
    },
  })
}

/**
 * Mutation hook for user logout
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // Clear the token from the API client
      apiClient.setToken(null)
      return Promise.resolve()
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear()
    },
    onError: error => {
      console.error('Logout failed:', error)
      // Even if logout fails, clear the cache
      queryClient.clear()
    },
  })
}

/**
 * Mutation hook for token refresh
 */
export function useRefreshTokenMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.refreshToken(),
    onSuccess: (data: AuthResponse) => {
      // Update the token in the API client
      apiClient.setToken(data.access_token)

      // Update cached user data
      queryClient.setQueryData(queryKeys.auth.profile(), data.user)
    },
    onError: error => {
      console.error('Token refresh failed:', error)
      // Clear auth data if refresh fails
      queryClient.removeQueries({ queryKey: queryKeys.auth.all })
    },
  })
}

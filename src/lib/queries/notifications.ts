import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useApiStore } from '../../store/api'
import { apiClient } from '../api'
import type { NotificationData } from '../api'
import { queryKeys, invalidateQueries } from '../query-keys'

// Notification Query Hooks

/**
 * Query hook for fetching notifications with loading state management
 */
export function useNotificationsQuery(
  status?: string,
  limit: number = 50,
  offset: number = 0
) {
  const setFeatureLoading = useApiStore(state => state.setFeatureLoading)

  return useQuery({
    queryKey: queryKeys.notifications.list({ status, limit, offset }),
    queryFn: async () => {
      setFeatureLoading('notifications', {
        isLoading: true,
        message: 'Loading notifications...',
      })
      try {
        const result = await apiClient.getNotifications(status, limit, offset)
        return result
      } finally {
        setFeatureLoading('notifications', { isLoading: false })
      }
    },
    staleTime: 30 * 1000, // Notifications stale after 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  })
}

/**
 * Query hook for fetching unread notification count
 */
export function useUnreadNotificationCountQuery() {
  const setFeatureLoading = useApiStore(state => state.setFeatureLoading)

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      setFeatureLoading('notifications', {
        isLoading: true,
        message: 'Checking notifications...',
      })
      try {
        const result = await apiClient.getUnreadNotificationCount()
        return result
      } finally {
        setFeatureLoading('notifications', { isLoading: false })
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// Notification Mutation Hooks

/**
 * Mutation hook for marking a notification as read
 */
export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient()
  const setFeatureLoading = useApiStore(state => state.setFeatureLoading)

  return useMutation({
    mutationFn: async (notificationId: string) => {
      setFeatureLoading('notifications', {
        isLoading: true,
        message: 'Updating notification...',
      })
      try {
        return await apiClient.markNotificationAsRead(notificationId)
      } finally {
        setFeatureLoading('notifications', { isLoading: false })
      }
    },
    onMutate: async notificationId => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.lists(),
      })

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueriesData({
        queryKey: queryKeys.notifications.lists(),
      })

      // Optimistically update notification status
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.lists() },
        (
          old: { notifications: NotificationData[]; total: number } | undefined
        ) => {
          if (!old) return old
          return {
            ...old,
            notifications: old.notifications.map(notification =>
              notification.id === notificationId
                ? {
                    ...notification,
                    status: 'READ' as const,
                    readAt: new Date().toISOString(),
                  }
                : notification
            ),
          }
        }
      )

      return { previousNotifications }
    },
    onError: (error, notificationId, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to mark notification as read:', error)
    },
    onSettled: () => {
      // Always refetch notification lists and unread count
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.notifications(),
      })
    },
  })
}

/**
 * Mutation hook for dismissing a notification
 */
export function useDismissNotificationMutation() {
  const queryClient = useQueryClient()
  const setFeatureLoading = useApiStore(state => state.setFeatureLoading)

  return useMutation({
    mutationFn: async (notificationId: string) => {
      setFeatureLoading('notifications', {
        isLoading: true,
        message: 'Dismissing notification...',
      })
      try {
        return await apiClient.dismissNotification(notificationId)
      } finally {
        setFeatureLoading('notifications', { isLoading: false })
      }
    },
    onMutate: async notificationId => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.lists(),
      })

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueriesData({
        queryKey: queryKeys.notifications.lists(),
      })

      // Optimistically remove notification from lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.lists() },
        (
          old: { notifications: NotificationData[]; total: number } | undefined
        ) => {
          if (!old) return old
          return {
            ...old,
            notifications: old.notifications.filter(
              notification => notification.id !== notificationId
            ),
            total: old.total - 1,
          }
        }
      )

      return { previousNotifications }
    },
    onError: (error, notificationId, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to dismiss notification:', error)
    },
    onSettled: () => {
      // Always refetch notification lists and unread count
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.notifications(),
      })
    },
  })
}

/**
 * Mutation hook for marking all notifications as read
 */
export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient()
  const setFeatureLoading = useApiStore(state => state.setFeatureLoading)

  return useMutation({
    mutationFn: async () => {
      setFeatureLoading('notifications', {
        isLoading: true,
        message: 'Marking all notifications as read...',
      })
      try {
        return await apiClient.markAllNotificationsAsRead()
      } finally {
        setFeatureLoading('notifications', { isLoading: false })
      }
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.lists(),
      })

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueriesData({
        queryKey: queryKeys.notifications.lists(),
      })

      // Optimistically mark all notifications as read
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.lists() },
        (
          old: { notifications: NotificationData[]; total: number } | undefined
        ) => {
          if (!old) return old
          return {
            ...old,
            notifications: old.notifications.map(notification => ({
              ...notification,
              status: 'READ' as const,
              readAt: notification.readAt || new Date().toISOString(),
            })),
          }
        }
      )

      // Update unread count to 0
      queryClient.setQueryData(queryKeys.notifications.unreadCount(), {
        count: 0,
      })

      return { previousNotifications }
    },
    onError: (error, _, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to mark all notifications as read:', error)
    },
    onSettled: () => {
      // Always refetch notification lists and unread count
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.notifications(),
      })
    },
  })
}

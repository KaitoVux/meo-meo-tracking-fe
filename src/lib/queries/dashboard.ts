import { useQuery } from '@tanstack/react-query'

import { useApiStore } from '../../store/api'
import type { ReportQueryParams } from '../api'
import { apiClient } from '../api'
import { queryKeys } from '../query-keys'

// Dashboard Query Hooks

/**
 * Query hook for fetching dashboard statistics with loading state management
 */
export function useDashboardStatsQuery() {
  const setFeatureLoading = useApiStore(state => state.setFeatureLoading)

  return useQuery({
    queryKey: queryKeys.dashboard?.stats?.() || ['dashboard', 'stats'],
    queryFn: async () => {
      setFeatureLoading('dashboard', {
        isLoading: true,
        message: 'Loading dashboard statistics...',
      })
      try {
        const result = await apiClient.getDashboardStats()
        return result
      } finally {
        setFeatureLoading('dashboard', { isLoading: false })
      }
    },
    staleTime: 2 * 60 * 1000, // Dashboard data stale after 2 minutes
    refetchOnWindowFocus: true,
  })
}

/**
 * Query hook for fetching reports with loading state management
 */
export function useReportsQuery(params: ReportQueryParams) {
  const setFeatureLoading = useApiStore(state => state.setFeatureLoading)

  return useQuery({
    queryKey: queryKeys.reports?.list?.(params) || ['reports', 'list', params],
    queryFn: async () => {
      setFeatureLoading('reports', {
        isLoading: true,
        message: 'Generating report...',
      })
      try {
        const result = await apiClient.getReports(params)
        return result
      } finally {
        setFeatureLoading('reports', { isLoading: false })
      }
    },
    enabled: !!params, // Only run query if params are provided
    staleTime: 5 * 60 * 1000, // Reports stay fresh for 5 minutes
  })
}

/**
 * Query hook for fetching exchange rates with loading state management
 */
export function useExchangeRateQuery(from: string, to: string) {
  const setFeatureLoading = useApiStore(state => state.setFeatureLoading)

  return useQuery({
    queryKey: queryKeys.currency?.exchangeRate?.(from, to) || [
      'currency',
      'exchangeRate',
      from,
      to,
    ],
    queryFn: async () => {
      setFeatureLoading('dashboard', {
        isLoading: true,
        message: 'Fetching exchange rates...',
      })
      try {
        const result = await apiClient.getExchangeRate(from, to)
        return result
      } finally {
        setFeatureLoading('dashboard', { isLoading: false })
      }
    },
    enabled: !!from && !!to,
    staleTime: 10 * 60 * 1000, // Exchange rates stay fresh for 10 minutes
    refetchInterval: 15 * 60 * 1000, // Auto-refetch every 15 minutes
  })
}

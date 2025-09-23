import { useQuery, useMutation } from '@tanstack/react-query'

import { toast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import type { ExpenseStatus, Currency, PaymentMethod } from '@/lib/api'

interface ReportFilters {
  dateFrom?: Date
  dateTo?: Date
  categories?: string[]
  vendors?: string[]
  statuses?: ExpenseStatus[]
  currency?: Currency
  paymentMethod?: PaymentMethod
  submitterId?: string
  paymentId?: string
  expenseMonth?: string
  groupBy?: 'month' | 'category' | 'vendor' | 'status'
  sortBy?: 'date' | 'amount' | 'category' | 'vendor' | 'status'
  sortOrder?: 'ASC' | 'DESC'
}

interface ExportQuery extends ReportFilters {
  format: 'excel' | 'csv' | 'pdf'
  reportType: string
}

// Report generation hook
export function useReportQuery(filters: ReportFilters) {
  return useQuery({
    queryKey: ['reports', 'generate', filters],
    queryFn: async () => {
      const response = await api.generateReport({
        dateFrom: filters.dateFrom?.toISOString(),
        dateTo: filters.dateTo?.toISOString(),
        categories: filters.categories,
        vendors: filters.vendors,
        statuses: filters.statuses,
        groupBy: filters.groupBy as
          | 'category'
          | 'vendor'
          | 'month'
          | 'status'
          | undefined,
      })
      return response
    },
    enabled: Object.keys(filters).length > 0,
  })
}

// Paginated report hook
export function usePaginatedReportQuery(
  filters: ReportFilters,
  page: number = 1,
  limit: number = 100
) {
  return useQuery({
    queryKey: ['reports', 'generate', 'paginated', filters, page, limit],
    queryFn: async () => {
      const response = await api.generatePaginatedReport(
        {
          dateFrom: filters.dateFrom?.toISOString(),
          dateTo: filters.dateTo?.toISOString(),
          categories: filters.categories,
          vendors: filters.vendors,
          statuses: filters.statuses,
          groupBy: filters.groupBy as
            | 'category'
            | 'vendor'
            | 'month'
            | 'status'
            | undefined,
        },
        page,
        limit
      )
      return response
    },
    enabled: Object.keys(filters).length > 0,
  })
}

// Payment due reports hook
export function usePaymentDueReportsQuery(
  period: 'weekly' | 'monthly' | 'overdue'
) {
  return useQuery({
    queryKey: ['reports', 'payments-due', period],
    queryFn: async () => {
      if (period === 'weekly') {
        return await api.getPaymentsDueWeekly()
      } else if (period === 'monthly') {
        return await api.getPaymentsDueMonthly()
      } else {
        return await api.getOverduePayments()
      }
    },
  })
}

// Payment statistics hook
export function usePaymentStatisticsQuery(dateFrom: Date, dateTo: Date) {
  return useQuery({
    queryKey: ['reports', 'payments', 'statistics', dateFrom, dateTo],
    queryFn: async () => {
      // For now, use the dashboard stats as a fallback until this endpoint is implemented
      const response = await api.getDashboardStats()
      return response
    },
    enabled: !!dateFrom && !!dateTo,
  })
}

// Report generation and export hook
export function useReportGeneration() {
  const generateMutation = useMutation({
    mutationFn: async (
      filters: ReportFilters & {
        totalCategories?: number
        totalVendors?: number
      }
    ) => {
      // Check if "select all" is active for each filter type
      const isAllCategories =
        filters.categories &&
        filters.totalCategories &&
        filters.categories.length === filters.totalCategories
      const isAllVendors =
        filters.vendors &&
        filters.totalVendors &&
        filters.vendors.length === filters.totalVendors
      const isAllStatuses = filters.statuses && filters.statuses.length >= 4 // All 4 statuses

      const response = await api.generateReport({
        dateFrom: filters.dateFrom?.toISOString(),
        dateTo: filters.dateTo?.toISOString(),
        // Use optimized payload structure
        selectAllCategories: !!isAllCategories,
        selectAllVendors: !!isAllVendors,
        selectAllStatuses: !!isAllStatuses,
        categories: isAllCategories ? [] : filters.categories,
        vendors: isAllVendors ? [] : filters.vendors,
        statuses: isAllStatuses ? [] : filters.statuses,
        groupBy: filters.groupBy as
          | 'category'
          | 'vendor'
          | 'month'
          | 'status'
          | undefined,
      })
      return response
    },
    onSuccess: () => {
      toast({
        title: 'Report Generated',
        description: 'Your report has been generated successfully.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error Generating Report',
        description:
          error.response?.data?.message || 'Failed to generate report',
        variant: 'destructive',
      })
    },
  })

  const exportMutation = useMutation({
    mutationFn: async (
      query: ExportQuery & {
        totalCategories?: number
        totalVendors?: number
      }
    ) => {
      // Apply same optimization logic for export
      const isAllCategories =
        query.categories &&
        query.totalCategories &&
        query.categories.length === query.totalCategories
      const isAllVendors =
        query.vendors &&
        query.totalVendors &&
        query.vendors.length === query.totalVendors
      const isAllStatuses = query.statuses && query.statuses.length >= 4

      const blob = await api.exportReport({
        format: query.format,
        reportType: 'detailed' as const,
        filters: {
          dateFrom: query.dateFrom?.toISOString(),
          dateTo: query.dateTo?.toISOString(),
          selectAllCategories: !!isAllCategories,
          selectAllVendors: !!isAllVendors,
          selectAllStatuses: !!isAllStatuses,
          categories: isAllCategories ? [] : query.categories,
          vendors: isAllVendors ? [] : query.vendors,
          statuses: isAllStatuses ? [] : query.statuses,
        },
      })

      // Handle file download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report.${query.format}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return blob
    },
    onSuccess: () => {
      toast({
        title: 'Export Successful',
        description: 'Your report has been exported successfully.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Export Failed',
        description: error.response?.data?.message || 'Failed to export report',
        variant: 'destructive',
      })
    },
  })

  return {
    generateReport: generateMutation.mutateAsync,
    exportReport: exportMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    isExporting: exportMutation.isPending,
  }
}

// Category and vendor specific reports can be created using the main generateReport with filters

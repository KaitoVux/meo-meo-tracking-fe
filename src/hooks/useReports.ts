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
        startDate: filters.dateFrom?.toISOString(),
        endDate: filters.dateTo?.toISOString(),
        category: filters.categories?.[0], // For now, use first category
        vendor: filters.vendors?.[0], // For now, use first vendor
        status: filters.statuses?.[0], // For now, use first status
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
          startDate: filters.dateFrom?.toISOString(),
          endDate: filters.dateTo?.toISOString(),
          category: filters.categories?.[0],
          vendor: filters.vendors?.[0],
          status: filters.statuses?.[0],
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
    mutationFn: async (filters: ReportFilters) => {
      const response = await api.generateReport({
        startDate: filters.dateFrom?.toISOString(),
        endDate: filters.dateTo?.toISOString(),
        category: filters.categories?.[0],
        vendor: filters.vendors?.[0],
        status: filters.statuses?.[0],
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
    mutationFn: async (query: ExportQuery) => {
      const blob = await api.exportReport({
        format: query.format,
        reportType: 'detailed' as const,
        filters: {
          startDate: query.dateFrom?.toISOString(),
          endDate: query.dateTo?.toISOString(),
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

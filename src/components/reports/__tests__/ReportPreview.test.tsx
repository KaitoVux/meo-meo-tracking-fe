import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { vi, beforeEach, describe, it, expect } from 'vitest'

import { ReportPreview } from '../ReportPreview'

import { useReportQuery } from '@/hooks/useReports'
import { ExpenseStatus, type Currency } from '@/lib/api'

// Mock the hooks
const mockReportData = {
  data: {
    summary: {
      totalAmount: 150000,
      totalExpenses: 5,
      totalCategories: 3,
      currency: 'VND' as Currency,
    },
    expenses: [
      {
        id: '1',
        paymentId: 'P001',
        vendor: { name: 'Vendor A' },
        category: { name: 'HCMC' },
        description: 'Test expense 1',
        amount: 50000,
        currency: 'VND',
        date: '2024-01-01',
        status: ExpenseStatus.APPROVED,
      },
      {
        id: '2',
        paymentId: 'P002',
        vendor: { name: 'Vendor B' },
        category: { name: 'Travel' },
        description: 'Test expense 2',
        amount: 100000,
        currency: 'VND',
        date: '2024-01-02',
        status: ExpenseStatus.PAID,
      },
    ],
    groupedData: {
      HCMC: { count: 2, totalAmount: 75000 },
      Travel: { count: 3, totalAmount: 75000 },
    },
  },
}

vi.mock('@/hooks/useReports', () => ({
  useReportQuery: vi.fn(() => ({
    data: mockReportData,
    isLoading: false,
  })),
}))

vi.mock('@/lib/utils', () => ({
  formatCurrency: (amount: number, currency: string) =>
    `${currency} ${amount.toLocaleString()}`,
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
  )
}

describe('ReportPreview', () => {
  const mockFilters = {
    dateFrom: new Date('2024-01-01'),
    dateTo: new Date('2024-01-31'),
    categories: ['1'],
    vendors: ['1'],
    statuses: [ExpenseStatus.APPROVED],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the report preview with summary statistics', () => {
    renderWithProviders(<ReportPreview filters={mockFilters} />)

    expect(screen.getByText('Expense Report')).toBeInTheDocument()
    expect(screen.getByText('Total Amount')).toBeInTheDocument()
    expect(screen.getByText('Total Expenses')).toBeInTheDocument()
    expect(screen.getByText('Average Amount')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
  })

  it('displays correct summary values', () => {
    renderWithProviders(<ReportPreview filters={mockFilters} />)

    expect(screen.getByText('VND 150,000')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // Total expenses
    expect(screen.getByText('3')).toBeInTheDocument() // Total categories
  })

  it('renders expense details table', () => {
    renderWithProviders(<ReportPreview filters={mockFilters} />)

    expect(screen.getByText('Detailed Expenses')).toBeInTheDocument()
    expect(screen.getByText('P001')).toBeInTheDocument()
    expect(screen.getByText('P002')).toBeInTheDocument()
    expect(screen.getByText('Vendor A')).toBeInTheDocument()
    expect(screen.getByText('Vendor B')).toBeInTheDocument()
    expect(screen.getByText('Test expense 1')).toBeInTheDocument()
    expect(screen.getByText('Test expense 2')).toBeInTheDocument()
  })

  it('renders grouped data when groupBy is specified', () => {
    const filtersWithGroupBy = {
      ...mockFilters,
      groupBy: 'category' as const,
    }

    renderWithProviders(<ReportPreview filters={filtersWithGroupBy} />)

    expect(screen.getByText('Results by category')).toBeInTheDocument()
    expect(screen.getByText('HCMC')).toBeInTheDocument()
    expect(screen.getByText('Travel')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    vi.mocked(useReportQuery).mockReturnValue({
      data: null,
      isLoading: true,
    } as any)

    renderWithProviders(<ReportPreview filters={mockFilters} />)

    expect(screen.getByRole('generic')).toHaveClass('animate-pulse')
  })

  it('displays no data state', () => {
    vi.mocked(useReportQuery).mockReturnValue({
      data: null,
      isLoading: false,
    } as any)

    renderWithProviders(<ReportPreview filters={mockFilters} />)

    expect(
      screen.getByText('No data found for the selected filters')
    ).toBeInTheDocument()
  })

  it('displays date range in header', () => {
    renderWithProviders(<ReportPreview filters={mockFilters} />)

    expect(screen.getByText(/Jan 01, 2024 - Jan 31, 2024/)).toBeInTheDocument()
    expect(screen.getByText('2 expenses')).toBeInTheDocument()
  })
})

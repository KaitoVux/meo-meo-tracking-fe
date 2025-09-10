import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { vi, beforeEach, describe, it, expect } from 'vitest'

import { PaymentDueReports } from '../PaymentDueReports'

import { ExpenseStatus } from '@/lib/api'

// Mock the hooks
const mockWeeklyData = {
  data: [
    {
      id: '1',
      paymentId: 'P001',
      vendor: { name: 'Vendor A' },
      amount: 50000,
      currency: 'VND',
      date: '2024-01-01',
      dueDate: '2024-01-07',
      status: ExpenseStatus.APPROVED,
      description: 'Weekly payment 1',
    },
    {
      id: '2',
      paymentId: 'P002',
      vendor: { name: 'Vendor B' },
      amount: 75000,
      currency: 'VND',
      date: '2024-01-02',
      dueDate: '2024-01-08',
      status: ExpenseStatus.SUBMITTED,
      description: 'Weekly payment 2',
    },
  ],
}

const mockMonthlyData = {
  data: [
    {
      id: '3',
      paymentId: 'P003',
      vendor: { name: 'Vendor C' },
      amount: 100000,
      currency: 'VND',
      date: '2024-01-01',
      dueDate: '2024-01-31',
      status: ExpenseStatus.APPROVED,
      description: 'Monthly payment 1',
    },
  ],
}

const mockOverdueData = {
  data: [
    {
      id: '4',
      paymentId: 'P004',
      vendor: { name: 'Vendor D' },
      amount: 25000,
      currency: 'VND',
      date: '2023-12-01',
      dueDate: '2023-12-31',
      status: ExpenseStatus.APPROVED,
      description: 'Overdue payment 1',
      daysPastDue: 15,
    },
  ],
}

vi.mock('@/hooks/useReports', () => ({
  usePaymentDueReportsQuery: vi.fn(period => {
    if (period === 'weekly') {
      return { data: mockWeeklyData, isLoading: false }
    } else if (period === 'monthly') {
      return { data: mockMonthlyData, isLoading: false }
    } else if (period === 'overdue') {
      return { data: mockOverdueData, isLoading: false }
    }
    return { data: null, isLoading: false }
  }),
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

describe('PaymentDueReports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the payment due reports interface', () => {
    renderWithProviders(<PaymentDueReports />)

    expect(screen.getByText('This Week')).toBeInTheDocument()
    expect(screen.getByText('This Month')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText('Weekly View')).toBeInTheDocument()
    expect(screen.getByText('Monthly View')).toBeInTheDocument()
  })

  it('displays overview cards with correct totals', () => {
    renderWithProviders(<PaymentDueReports />)

    // Weekly total: 50000 + 75000 = 125000
    expect(screen.getByText('VND 125,000')).toBeInTheDocument()

    // Monthly total: 100000
    expect(screen.getByText('VND 100,000')).toBeInTheDocument()

    // Overdue total: 25000
    expect(screen.getByText('VND 25,000')).toBeInTheDocument()
  })

  it('displays weekly payments by default', () => {
    renderWithProviders(<PaymentDueReports />)

    expect(screen.getByText('P001')).toBeInTheDocument()
    expect(screen.getByText('P002')).toBeInTheDocument()
    expect(screen.getByText('Vendor A')).toBeInTheDocument()
    expect(screen.getByText('Vendor B')).toBeInTheDocument()
  })

  it('switches to monthly view when tab is clicked', () => {
    renderWithProviders(<PaymentDueReports />)

    const monthlyTab = screen.getByText('Monthly View')
    fireEvent.click(monthlyTab)

    expect(screen.getByText('P003')).toBeInTheDocument()
    expect(screen.getByText('Vendor C')).toBeInTheDocument()
  })

  it('switches to overdue view when tab is clicked', () => {
    renderWithProviders(<PaymentDueReports />)

    const overdueTab = screen.getByText('Overdue')
    fireEvent.click(overdueTab)

    expect(screen.getByText('P004')).toBeInTheDocument()
    expect(screen.getByText('Vendor D')).toBeInTheDocument()
    expect(screen.getByText('15 days')).toBeInTheDocument()
  })

  it('displays export button for each view', () => {
    renderWithProviders(<PaymentDueReports />)

    const exportButtons = screen.getAllByText('Export')
    expect(exportButtons.length).toBeGreaterThan(0)
  })

  it('shows summary statistics for each view', () => {
    renderWithProviders(<PaymentDueReports />)

    expect(screen.getByText('Total Amount')).toBeInTheDocument()
    expect(screen.getByText('Total Items')).toBeInTheDocument()
  })

  it('displays payment status badges', () => {
    renderWithProviders(<PaymentDueReports />)

    expect(screen.getByText('APPROVED')).toBeInTheDocument()
    expect(screen.getByText('SUBMITTED')).toBeInTheDocument()
  })

  it('shows overdue days in overdue view', () => {
    renderWithProviders(<PaymentDueReports />)

    const overdueTab = screen.getByText('Overdue')
    fireEvent.click(overdueTab)

    expect(screen.getByText('Days Overdue')).toBeInTheDocument()
    expect(screen.getByText('15 days')).toBeInTheDocument()
  })

  it('displays average days overdue in overdue summary', () => {
    renderWithProviders(<PaymentDueReports />)

    const overdueTab = screen.getByText('Overdue')
    fireEvent.click(overdueTab)

    expect(screen.getByText('Avg Days Overdue')).toBeInTheDocument()
    expect(screen.getByText('15 days')).toBeInTheDocument()
  })
})

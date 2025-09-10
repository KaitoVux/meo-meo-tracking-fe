import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import { Dashboard } from '../Dashboard'

// Mock the hooks
vi.mock('@/lib/queries/dashboard', () => ({
  useDashboardStatsQuery: vi.fn(),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategoriesQuery: vi.fn(),
}))

vi.mock('@/hooks/useVendors', () => ({
  useVendorsQuery: vi.fn(),
}))

// Mock Recharts components to avoid rendering issues in tests
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
}))

const mockDashboardData = {
  data: {
    totalExpenses: 150,
    totalAmount: 45231.89,
    monthlyExpenses: 25,
    monthlyAmount: 12234,
    pendingApprovals: 12,
    expensesByStatus: {
      DRAFT: 5,
      SUBMITTED: 8,
      APPROVED: 7,
      PAID: 4,
      CLOSED: 1,
    },
    expensesByCategory: [
      { category: 'Office Supplies', count: 15, amount: 2500 },
      { category: 'Travel', count: 10, amount: 5000 },
      { category: 'Meals', count: 8, amount: 1200 },
    ],
    recentExpenses: [],
  },
}

const mockCategoriesData = {
  data: [
    { id: '1', name: 'Office Supplies', code: 'OFFICE' },
    { id: '2', name: 'Travel', code: 'TRAVEL' },
  ],
}

const mockVendorsData = {
  data: [
    { id: '1', name: 'Staples Inc.', status: 'ACTIVE' },
    { id: '2', name: 'Uber', status: 'ACTIVE' },
  ],
}

describe('Dashboard', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    vi.clearAllMocks()
  })

  const renderDashboard = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    )
  }

  it('renders dashboard header correctly', async () => {
    const { useDashboardStatsQuery } = await import('@/lib/queries/dashboard')
    const { useCategoriesQuery } = await import('@/hooks/useCategories')
    const { useVendorsQuery } = await import('@/hooks/useVendors')

    vi.mocked(useDashboardStatsQuery).mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: null,
    } as never)

    vi.mocked(useCategoriesQuery).mockReturnValue({
      data: mockCategoriesData,
    } as never)

    vi.mocked(useVendorsQuery).mockReturnValue({
      data: mockVendorsData,
    } as never)

    renderDashboard()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText('Overview of your business expenses and key metrics')
    ).toBeInTheDocument()
  })

  it('displays loading state correctly', async () => {
    const { useDashboardStatsQuery } = await import('@/lib/queries/dashboard')
    const { useCategoriesQuery } = await import('@/hooks/useCategories')
    const { useVendorsQuery } = await import('@/hooks/useVendors')

    vi.mocked(useDashboardStatsQuery).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as never)

    vi.mocked(useCategoriesQuery).mockReturnValue({
      data: mockCategoriesData,
    } as never)

    vi.mocked(useVendorsQuery).mockReturnValue({
      data: mockVendorsData,
    } as never)

    renderDashboard()

    // Check for loading skeletons
    const loadingElements = screen.getAllByRole('generic')
    expect(
      loadingElements.some((el: HTMLElement) =>
        el.className.includes('animate-pulse')
      )
    ).toBe(true)
  })
})

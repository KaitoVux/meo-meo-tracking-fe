import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { vi, beforeEach, describe, it, expect } from 'vitest'

import { ReportBuilder } from '../ReportBuilder'

// Mock the hooks
vi.mock('@/hooks/useCategories', () => ({
  useCategoriesQuery: () => ({
    data: {
      data: [
        { id: '1', name: 'HCMC' },
        { id: '2', name: 'DN' },
        { id: '3', name: 'Travel' },
      ],
    },
  }),
}))

vi.mock('@/hooks/useVendors', () => ({
  useVendorsQuery: () => ({
    data: {
      data: [
        { id: '1', name: 'Vendor A' },
        { id: '2', name: 'Vendor B' },
      ],
    },
  }),
}))

vi.mock('@/hooks/useReports', () => ({
  useReportGeneration: () => ({
    generateReport: vi.fn(),
    exportReport: vi.fn(),
    isGenerating: false,
    isExporting: false,
  }),
}))

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
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

describe('ReportBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the report builder interface', () => {
    renderWithProviders(<ReportBuilder />)

    expect(screen.getByText('Report Filters')).toBeInTheDocument()
    expect(screen.getByText('From Date')).toBeInTheDocument()
    expect(screen.getByText('To Date')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Vendors')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Generate Report')).toBeInTheDocument()
    expect(screen.getByText('Export Report')).toBeInTheDocument()
  })

  it('displays category checkboxes', () => {
    renderWithProviders(<ReportBuilder />)

    expect(screen.getByLabelText('HCMC')).toBeInTheDocument()
    expect(screen.getByLabelText('DN')).toBeInTheDocument()
    expect(screen.getByLabelText('Travel')).toBeInTheDocument()
  })

  it('displays vendor checkboxes', () => {
    renderWithProviders(<ReportBuilder />)

    expect(screen.getByLabelText('Vendor A')).toBeInTheDocument()
    expect(screen.getByLabelText('Vendor B')).toBeInTheDocument()
  })

  it('displays status checkboxes', () => {
    renderWithProviders(<ReportBuilder />)

    expect(screen.getByLabelText('DRAFT')).toBeInTheDocument()
    expect(screen.getByLabelText('SUBMITTED')).toBeInTheDocument()
    expect(screen.getByLabelText('APPROVED')).toBeInTheDocument()
    expect(screen.getByLabelText('PAID')).toBeInTheDocument()
    expect(screen.getByLabelText('CLOSED')).toBeInTheDocument()
  })

  it('allows selecting filters', async () => {
    renderWithProviders(<ReportBuilder />)

    const hcmcCheckbox = screen.getByLabelText('HCMC')
    fireEvent.click(hcmcCheckbox)

    expect(hcmcCheckbox).toBeChecked()
  })

  it('shows active filters badge when filters are selected', async () => {
    renderWithProviders(<ReportBuilder />)

    const hcmcCheckbox = screen.getByLabelText('HCMC')
    fireEvent.click(hcmcCheckbox)

    await waitFor(() => {
      expect(screen.getByText('1 Categories')).toBeInTheDocument()
    })
  })

  it('allows clearing all filters', async () => {
    renderWithProviders(<ReportBuilder />)

    const hcmcCheckbox = screen.getByLabelText('HCMC')
    fireEvent.click(hcmcCheckbox)

    await waitFor(() => {
      expect(screen.getByText('1 Categories')).toBeInTheDocument()
    })

    const clearButton = screen.getByText('Clear Filters')
    fireEvent.click(clearButton)

    expect(hcmcCheckbox).not.toBeChecked()
  })

  it('allows selecting sort options', async () => {
    renderWithProviders(<ReportBuilder />)

    // Find the sort by select by looking for the label and then the button
    const sortByLabel = screen.getByText('Sort By')
    const sortBySelect = sortByLabel.parentElement?.querySelector('button')
    expect(sortBySelect).toBeInTheDocument()

    if (sortBySelect) {
      fireEvent.click(sortBySelect)

      const amountOption = screen.getByText('Amount')
      fireEvent.click(amountOption)

      // Check if the selection was made by looking for the Amount text in the select
      await waitFor(() => {
        expect(screen.getByText('Amount')).toBeInTheDocument()
      })
    }
  })

  it('allows selecting group by options', async () => {
    renderWithProviders(<ReportBuilder />)

    // Find the group by select by looking for the label and then the button
    const groupByLabel = screen.getByText('Group By')
    const groupBySelect = groupByLabel.parentElement?.querySelector('button')
    expect(groupBySelect).toBeInTheDocument()

    if (groupBySelect) {
      fireEvent.click(groupBySelect)

      const categoryOption = screen.getByText('Category')
      fireEvent.click(categoryOption)

      // Check if the selection was made by looking for the Category text in the select
      await waitFor(() => {
        expect(screen.getByText('Category')).toBeInTheDocument()
      })
    }
  })
})

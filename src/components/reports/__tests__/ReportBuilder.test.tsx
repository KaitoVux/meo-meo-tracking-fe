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
    expect(screen.getByLabelText('IN_PROGRESS')).toBeInTheDocument()
    expect(screen.getByLabelText('PAID')).toBeInTheDocument()
    expect(screen.getByLabelText('CLOSED')).toBeInTheDocument()
    expect(screen.getByLabelText('ON_HOLD')).toBeInTheDocument()
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

  it('renders Select All checkboxes for categories, vendors, and statuses', () => {
    renderWithProviders(<ReportBuilder />)

    expect(
      screen.getByLabelText('Select All', {
        selector: '#select-all-categories',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Select All', { selector: '#select-all-vendors' })
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Select All', { selector: '#select-all-statuses' })
    ).toBeInTheDocument()
  })

  it('selects all categories when Select All categories is clicked', async () => {
    renderWithProviders(<ReportBuilder />)

    const selectAllCategories = screen.getByLabelText('Select All', {
      selector: '#select-all-categories',
    })
    fireEvent.click(selectAllCategories)

    await waitFor(() => {
      expect(screen.getByLabelText('HCMC')).toBeChecked()
      expect(screen.getByLabelText('DN')).toBeChecked()
      expect(screen.getByLabelText('Travel')).toBeChecked()
      expect(screen.getByText('3 Categories')).toBeInTheDocument()
    })
  })

  it('selects all vendors when Select All vendors is clicked', async () => {
    renderWithProviders(<ReportBuilder />)

    const selectAllVendors = screen.getByLabelText('Select All', {
      selector: '#select-all-vendors',
    })
    fireEvent.click(selectAllVendors)

    await waitFor(() => {
      expect(screen.getByLabelText('Vendor A')).toBeChecked()
      expect(screen.getByLabelText('Vendor B')).toBeChecked()
      expect(screen.getByText('2 Vendors')).toBeInTheDocument()
    })
  })

  it('selects all statuses when Select All statuses is clicked', async () => {
    renderWithProviders(<ReportBuilder />)

    const selectAllStatuses = screen.getByLabelText('Select All', {
      selector: '#select-all-statuses',
    })
    fireEvent.click(selectAllStatuses)

    await waitFor(() => {
      expect(screen.getByLabelText('DRAFT')).toBeChecked()
      expect(screen.getByLabelText('SUBMITTED')).toBeChecked()
      expect(screen.getByLabelText('APPROVED')).toBeChecked()
      expect(screen.getByLabelText('IN_PROGRESS')).toBeChecked()
      expect(screen.getByLabelText('PAID')).toBeChecked()
      expect(screen.getByLabelText('CLOSED')).toBeChecked()
      expect(screen.getByLabelText('ON_HOLD')).toBeChecked()
      expect(screen.getByText('7 Statuses')).toBeInTheDocument()
    })
  })

  it('deselects all categories when Select All categories is clicked twice', async () => {
    renderWithProviders(<ReportBuilder />)

    const selectAllCategories = screen.getByLabelText('Select All', {
      selector: '#select-all-categories',
    })

    // First click - select all
    fireEvent.click(selectAllCategories)

    await waitFor(() => {
      expect(screen.getByText('3 Categories')).toBeInTheDocument()
    })

    // Second click - deselect all
    fireEvent.click(selectAllCategories)

    await waitFor(() => {
      expect(screen.getByLabelText('HCMC')).not.toBeChecked()
      expect(screen.getByLabelText('DN')).not.toBeChecked()
      expect(screen.getByLabelText('Travel')).not.toBeChecked()
      expect(screen.queryByText('3 Categories')).not.toBeInTheDocument()
    })
  })

  it('shows Select All as checked when all items are individually selected', async () => {
    renderWithProviders(<ReportBuilder />)

    // Select all categories individually
    fireEvent.click(screen.getByLabelText('HCMC'))
    fireEvent.click(screen.getByLabelText('DN'))
    fireEvent.click(screen.getByLabelText('Travel'))

    await waitFor(() => {
      const selectAllCategories = screen.getByLabelText('Select All', {
        selector: '#select-all-categories',
      })
      expect(selectAllCategories).toBeChecked()
    })
  })
})

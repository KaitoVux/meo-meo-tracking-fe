import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react'
import React from 'react'
import { vi, beforeEach, describe, it, expect } from 'vitest'

import { ImportInterface } from '../ImportInterface'

// Mock the hooks
vi.mock('@/hooks/useImport', () => ({
  useImportPreview: () => ({
    mutate: vi.fn(),
    reset: vi.fn(),
    data: mockPreviewData,
    isLoading: false,
    error: null,
  }),
  useImportUpload: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'import-123' }),
    isPending: false,
  }),
  useImportHistory: () => ({
    data: mockHistoryData,
    isLoading: false,
  }),
  useImportStatus: (importId: string | null) => ({
    data: importId ? mockCurrentImport : null,
  }),
}))

const mockPreviewData = {
  totalRows: 10,
  headers: [
    'vendor',
    'description',
    'type',
    'amountBeforeVat',
    'vatAmount',
    'amountAfterVat',
  ],
  sampleData: [
    {
      vendor: 'Test Vendor',
      description: 'Test expense',
      type: 'Out',
      amountBeforeVat: '100.00',
      vatAmount: '20.00',
      amountAfterVat: '120.00',
    },
    {
      vendor: 'Another Vendor',
      description: 'Another expense',
      type: 'Out',
      amountBeforeVat: '200.00',
      vatAmount: '40.00',
      amountAfterVat: '240.00',
    },
  ],
  errors: [],
}

const mockCurrentImport = {
  id: 'import-123',
  fileName: 'test-expenses.csv',
  status: 'processing',
  progress: 75,
  totalRows: 10,
  processedRows: 7,
  successfulRows: 6,
  errorRows: 1,
  createdAt: new Date().toISOString(),
  completedAt: null,
}

const mockHistoryData = [
  {
    id: 'import-1',
    fileName: 'expenses-old.csv',
    status: 'completed',
    totalRows: 15,
    successfulRows: 14,
    errorRows: 1,
    createdAt: '2023-10-01T10:00:00Z',
  },
  {
    id: 'import-2',
    fileName: 'expenses-failed.csv',
    status: 'failed',
    totalRows: 5,
    successfulRows: 0,
    errorRows: 5,
    createdAt: '2023-09-28T14:30:00Z',
  },
]

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('ImportInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the import interface', () => {
    render(<ImportInterface />, { wrapper: createWrapper() })

    expect(screen.getByText('Import Expenses')).toBeInTheDocument()
    expect(screen.getByText('Upload expense data file')).toBeInTheDocument()
    expect(
      screen.getByText('Support CSV and Excel files (.csv, .xlsx)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Drag & drop files here or click to browse')
    ).toBeInTheDocument()
  })

  it('should display file preview data', async () => {
    render(<ImportInterface />, { wrapper: createWrapper() })

    // Select a file first through dropzone
    const dropZone = screen
      .getByText('Drag & drop files here or click to browse')
      .closest('div')
    const hiddenInput = dropZone!.querySelector('input[type="file"]')
    const mockFile = new File(['test content'], 'test-expenses.csv', {
      type: 'text/csv',
    })

    Object.defineProperty(hiddenInput, 'files', {
      value: [mockFile],
      writable: false,
    })
    fireEvent.change(hiddenInput!, { target: { files: [mockFile] } })

    await waitFor(() => {
      expect(screen.getByText('Data Preview')).toBeInTheDocument()
    })

    // Check preview stats
    expect(screen.getByText('Total rows:')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Columns:')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()

    // Check sample data table
    expect(screen.getByText('Test Vendor')).toBeInTheDocument()
    expect(screen.getByText('Test expense')).toBeInTheDocument()
    expect(screen.getByText('Another Vendor')).toBeInTheDocument()
  })

  it('should display import progress', () => {
    render(<ImportInterface />, { wrapper: createWrapper() })

    expect(screen.getByText('Import Progress')).toBeInTheDocument()
    expect(screen.getByText('Processing')).toBeInTheDocument()

    // Check progress stats
    expect(screen.getByText('Total:')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Processed:')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Successful:')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('Errors:')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should display import history', () => {
    render(<ImportInterface />, { wrapper: createWrapper() })

    expect(screen.getByText('Import History')).toBeInTheDocument()

    // Check history table headers
    expect(screen.getByText('File Name')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Total Rows')).toBeInTheDocument()
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Errors')).toBeInTheDocument()

    // Check history data
    expect(screen.getByText('expenses-old.csv')).toBeInTheDocument()
    expect(screen.getByText('expenses-failed.csv')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('14')).toBeInTheDocument()
  })

  it('should enable start import button when file is selected and no errors', async () => {
    render(<ImportInterface />, { wrapper: createWrapper() })

    // Initially, no Start Import button should be visible
    expect(screen.queryByText('Start Import')).not.toBeInTheDocument()

    // Select a file through dropzone
    const dropZone = screen
      .getByText('Drag & drop files here or click to browse')
      .closest('div')
    const hiddenInput = dropZone!.querySelector('input[type="file"]')
    const mockFile = new File(['test content'], 'test-expenses.csv', {
      type: 'text/csv',
    })

    Object.defineProperty(hiddenInput, 'files', {
      value: [mockFile],
      writable: false,
    })
    fireEvent.change(hiddenInput!, { target: { files: [mockFile] } })

    await waitFor(() => {
      expect(screen.getByText('Start Import')).toBeInTheDocument()
    })

    const startImportButton = screen.getByText('Start Import')
    expect(startImportButton).not.toBeDisabled()
  })

  it('should handle file removal', async () => {
    render(<ImportInterface />, { wrapper: createWrapper() })

    // Select a file first through dropzone
    const dropZone = screen
      .getByText('Drag & drop files here or click to browse')
      .closest('div')
    const hiddenInput = dropZone!.querySelector('input[type="file"]')
    const mockFile = new File(['test content'], 'test-expenses.csv', {
      type: 'text/csv',
    })

    Object.defineProperty(hiddenInput, 'files', {
      value: [mockFile],
      writable: false,
    })
    fireEvent.change(hiddenInput!, { target: { files: [mockFile] } })

    await waitFor(() => {
      expect(screen.getByText('test-expenses.csv')).toBeInTheDocument()
    })

    // Click remove button
    const removeButton = screen.getByText('Remove')
    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(screen.getByText('Upload expense data file')).toBeInTheDocument()
    })

    expect(screen.queryByText('test-expenses.csv')).not.toBeInTheDocument()
  })

  it('should display status icons correctly', () => {
    render(<ImportInterface />, { wrapper: createWrapper() })

    // Check that the processing status is displayed with correct styling
    const processingBadge = screen.getByText('Processing')
    expect(processingBadge).toBeInTheDocument()

    // In the history section, check for completed and failed statuses
    const historySection = screen.getByText('Import History').closest('div')
    expect(historySection).toBeInTheDocument()

    // The status badges should be rendered in the history table
    const completedText = within(historySection!).getByText('Completed')
    const failedText = within(historySection!).getByText('Failed')
    expect(completedText).toBeInTheDocument()
    expect(failedText).toBeInTheDocument()
  })

  it('should handle drag and drop file upload', async () => {
    render(<ImportInterface />, { wrapper: createWrapper() })

    const dropZone = screen
      .getByText('Drag & drop files here or click to browse')
      .closest('div')
    expect(dropZone).toBeInTheDocument()

    const mockFile = new File(['test content'], 'test-expenses.csv', {
      type: 'text/csv',
    })

    // Simulate drag over to activate hover state
    fireEvent.dragOver(dropZone!, {
      dataTransfer: {
        files: [mockFile],
      },
    })

    // Check that hover state text appears
    await waitFor(() => {
      expect(screen.getByText('Drop your file here')).toBeInTheDocument()
      expect(
        screen.getByText('Release to upload your file')
      ).toBeInTheDocument()
    })

    // Simulate drop
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile],
      },
    })

    // Verify file is processed (should show file name)
    await waitFor(() => {
      expect(screen.getByText('test-expenses.csv')).toBeInTheDocument()
    })
  })

  it('should handle file selection through click', async () => {
    render(<ImportInterface />, { wrapper: createWrapper() })

    const dropZone = screen
      .getByText('Drag & drop files here or click to browse')
      .closest('div')
    expect(dropZone).toBeInTheDocument()

    const hiddenInput = dropZone!.querySelector('input[type="file"]')
    expect(hiddenInput).toBeInTheDocument()

    const mockFile = new File(['test content'], 'test-expenses.csv', {
      type: 'text/csv',
    })

    // Simulate file selection
    Object.defineProperty(hiddenInput, 'files', {
      value: [mockFile],
      writable: false,
    })
    fireEvent.change(hiddenInput!, { target: { files: [mockFile] } })

    // Verify file is processed
    await waitFor(() => {
      expect(screen.getByText('test-expenses.csv')).toBeInTheDocument()
    })
  })

  it('should display validation errors when present', () => {
    // Mock the preview hook to return errors
    vi.doMock('@/hooks/useImport', () => ({
      useImportPreview: () => ({
        mutate: vi.fn(),
        reset: vi.fn(),
        data: {
          ...mockPreviewData,
          errors: [
            { row: 1, field: 'amount', message: 'Invalid amount format' },
            { row: 2, field: 'date', message: 'Invalid date format' },
          ],
        },
        isLoading: false,
        error: null,
      }),
      useImportUpload: () => ({
        mutateAsync: vi.fn(),
        isPending: false,
      }),
      useImportHistory: () => ({
        data: mockHistoryData,
        isLoading: false,
      }),
      useImportStatus: () => ({
        data: null,
      }),
    }))

    render(<ImportInterface />, { wrapper: createWrapper() })

    // Select a file to trigger preview through dropzone
    const dropZone = screen
      .getByText('Drag & drop files here or click to browse')
      .closest('div')
    const hiddenInput = dropZone!.querySelector('input[type="file"]')
    const mockFile = new File(['test content'], 'test-expenses.csv', {
      type: 'text/csv',
    })

    Object.defineProperty(hiddenInput, 'files', {
      value: [mockFile],
      writable: false,
    })
    fireEvent.change(hiddenInput!, { target: { files: [mockFile] } })

    // Should show error count and detailed error information
    expect(screen.getByText('2')).toBeInTheDocument() // Error count
    expect(
      screen.getByText(
        'Found 2 validation errors. Please review and fix the issues below before importing.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Validation Errors:')).toBeInTheDocument()
  })
})

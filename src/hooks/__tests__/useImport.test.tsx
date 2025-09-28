import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import {
  vi,
  beforeEach,
  describe,
  it,
  expect,
  type MockedFunction,
} from 'vitest'

import {
  useImportPreview,
  useImportUpload,
  useImportStatus,
  useImportHistory,
} from '../useImport'

import { toast } from '@/hooks/use-toast'
import { api } from '@/lib/api'

// Mock the API and toast
vi.mock('@/lib/api')
vi.mock('@/hooks/use-toast')

const mockApi = api as any
const mockToast = toast as MockedFunction<typeof toast>

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

describe('useImport hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useImportPreview', () => {
    it('should preview file successfully', async () => {
      const mockPreviewData = {
        totalRows: 10,
        headers: ['vendor', 'description', 'amount'],
        sampleData: [
          {
            vendor: 'Test Vendor',
            description: 'Test expense',
            amount: '100.00',
          },
        ],
        errors: [],
      }

      mockApi.previewImport.mockResolvedValue({
        data: mockPreviewData,
        success: true,
      })

      const { result } = renderHook(() => useImportPreview(), {
        wrapper: createWrapper(),
      })

      const mockFile = new File(['test content'], 'test.csv', {
        type: 'text/csv',
      })

      result.current.mutate(mockFile)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockPreviewData)
      expect(mockApi.previewImport).toHaveBeenCalledWith(mockFile)
    })

    it('should handle preview errors', async () => {
      const mockError = new Error('Invalid file format')
      mockApi.previewImport.mockRejectedValue(mockError)

      const { result } = renderHook(() => useImportPreview(), {
        wrapper: createWrapper(),
      })

      const mockFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      })

      result.current.mutate(mockFile)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Preview Failed',
        description: 'Invalid file format',
        variant: 'destructive',
      })
    })
  })

  describe('useImportUpload', () => {
    it('should upload file successfully', async () => {
      const mockImportRecord = {
        id: 'import-123',
        fileName: 'test.csv',
        status: 'pending',
        progress: 0,
        totalRows: 10,
        processedRows: 0,
        successfulRows: 0,
        errorRows: 0,
        createdAt: new Date().toISOString(),
        completedAt: null,
      }

      mockApi.uploadImport.mockResolvedValue({
        data: mockImportRecord,
        success: true,
      })

      const { result } = renderHook(() => useImportUpload(), {
        wrapper: createWrapper(),
      })

      const mockFile = new File(['test content'], 'test.csv', {
        type: 'text/csv',
      })

      result.current.mutate(mockFile)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockImportRecord)
      expect(mockApi.uploadImport).toHaveBeenCalledWith(mockFile)
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Import Started',
        description: 'Your file has been uploaded and processing has started.',
      })
    })

    it('should handle upload errors', async () => {
      const mockError = new Error('Upload failed')
      mockApi.uploadImport.mockRejectedValue(mockError)

      const { result } = renderHook(() => useImportUpload(), {
        wrapper: createWrapper(),
      })

      const mockFile = new File(['test content'], 'test.csv', {
        type: 'text/csv',
      })

      result.current.mutate(mockFile)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Upload Failed',
        description: 'Upload failed',
        variant: 'destructive',
      })
    })
  })

  describe('useImportStatus', () => {
    it('should fetch import status successfully', async () => {
      const mockStatusData = {
        id: 'import-123',
        fileName: 'test.csv',
        status: 'processing',
        progress: 50,
        totalRows: 10,
        processedRows: 5,
        successfulRows: 4,
        errorRows: 1,
        createdAt: new Date().toISOString(),
        completedAt: null,
      }

      mockApi.getImportStatus.mockResolvedValue({
        data: mockStatusData,
        success: true,
      })

      const { result } = renderHook(() => useImportStatus('import-123', true), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockStatusData)
      expect(mockApi.getImportStatus).toHaveBeenCalledWith('import-123')
    })

    it('should not fetch when disabled', () => {
      const { result } = renderHook(
        () => useImportStatus('import-123', false),
        {
          wrapper: createWrapper(),
        }
      )

      expect(result.current.isFetching).toBe(false)
      expect(mockApi.getImportStatus).not.toHaveBeenCalled()
    })

    it('should not fetch when importId is null', () => {
      const { result } = renderHook(() => useImportStatus(null, true), {
        wrapper: createWrapper(),
      })

      expect(result.current.isFetching).toBe(false)
      expect(mockApi.getImportStatus).not.toHaveBeenCalled()
    })

    it('should refetch every 2 seconds when processing', async () => {
      const mockStatusData = {
        id: 'import-123',
        status: 'processing',
        progress: 50,
      }

      mockApi.getImportStatus.mockResolvedValue({
        data: mockStatusData,
        success: true,
      })

      const { result } = renderHook(() => useImportStatus('import-123', true), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // The refetch interval should be 2000ms for processing status
      expect(result.current.data?.status).toBe('processing')
    })

    it('should not refetch when completed', async () => {
      const mockStatusData = {
        id: 'import-123',
        status: 'completed',
        progress: 100,
      }

      mockApi.getImportStatus.mockResolvedValue({
        data: mockStatusData,
        success: true,
      })

      const { result } = renderHook(() => useImportStatus('import-123', true), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // The refetch interval should be false for completed status
      expect(result.current.data?.status).toBe('completed')
    })
  })

  describe('useImportHistory', () => {
    it('should fetch import history successfully', async () => {
      const mockHistoryData = [
        {
          id: 'import-1',
          fileName: 'expenses-1.csv',
          status: 'completed',
          totalRows: 10,
          successfulRows: 9,
          errorRows: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'import-2',
          fileName: 'expenses-2.csv',
          status: 'failed',
          totalRows: 5,
          successfulRows: 0,
          errorRows: 5,
          createdAt: new Date().toISOString(),
        },
      ]

      mockApi.getImportHistory.mockResolvedValue({
        data: mockHistoryData,
        success: true,
      })

      const { result } = renderHook(() => useImportHistory(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockHistoryData)
      expect(mockApi.getImportHistory).toHaveBeenCalled()
    })

    it('should handle empty history', async () => {
      mockApi.getImportHistory.mockResolvedValue({
        data: [],
        success: true,
      })

      const { result } = renderHook(() => useImportHistory(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([])
    })

    it('should handle history fetch errors', async () => {
      const mockError = new Error('Failed to fetch history')
      mockApi.getImportHistory.mockRejectedValue(mockError)

      const { result } = renderHook(() => useImportHistory(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })
})

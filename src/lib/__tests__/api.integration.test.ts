import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { apiClient } from '../api'
import type { LoginRequest, CreateExpenseRequest } from '../api'

// Mock the entire axios module
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      request: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}))

describe('API Client Integration Tests', () => {
  let mockAxiosInstance: {
    request: ReturnType<typeof vi.fn>
    interceptors: {
      request: { use: ReturnType<typeof vi.fn> }
      response: { use: ReturnType<typeof vi.fn> }
    }
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Create mock axios instance
    mockAxiosInstance = {
      request: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    }

    // Set up the mock instance to be used by apiClient
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(apiClient as any).axiosInstance = mockAxiosInstance
  })

  afterEach(() => {
    // Clean up after each test
    apiClient.setToken(null)
  })

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER' as const,
        },
        access_token: 'mock-token',
      }

      mockAxiosInstance.request.mockResolvedValueOnce({ data: mockResponse })

      const result = await apiClient.login(loginData)

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        url: '/auth/login',
        method: 'POST',
        data: loginData,
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle login failure', async () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      const mockError = {
        response: {
          status: 401,
          data: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
      }

      mockAxiosInstance.request.mockRejectedValueOnce(mockError)

      await expect(apiClient.login(loginData)).rejects.toMatchObject({
        response: {
          status: 401,
          data: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
      })
    })

    it('should set and use authentication token', async () => {
      const token = 'test-token'
      apiClient.setToken(token)

      mockAxiosInstance.request.mockResolvedValueOnce({
        data: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        },
      })

      await apiClient.getProfile()

      // Verify that the token is set
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((apiClient as any).token).toBe(token)
    })
  })

  describe('Expenses', () => {
    beforeEach(() => {
      apiClient.setToken('test-token')
    })

    it('should create expense successfully', async () => {
      const expenseData: CreateExpenseRequest = {
        transactionDate: '2024-01-15',
        expenseMonth: 'January',
        type: 'OUT',
        vendorId: 'vendor-1',
        category: 'Office Supplies',
        amount: 100.5,
        amountBeforeVAT: 90.45,
        vatPercentage: 10,
        vatAmount: 9.05,
        currency: 'VND',
        description: 'Test expense',
        submitterId: 'user-1',
        paymentMethod: 'BANK_TRANSFER',
      }

      const mockResponse = {
        success: true,
        data: {
          id: 'expense-1',
          paymentId: '1',
          ...expenseData,
          status: 'DRAFT',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          submitter: {
            id: 'user-1',
            email: 'user@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
          vendor: {
            id: 'vendor-1',
            name: 'Test Vendor',
            status: 'ACTIVE',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        },
        message: 'Expense created successfully',
      }

      mockAxiosInstance.request.mockResolvedValueOnce({ data: mockResponse })

      const result = await apiClient.createExpense(expenseData)

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        url: '/expenses',
        method: 'POST',
        data: expenseData,
      })
      expect(result).toEqual(mockResponse)
    })

    it('should fetch expenses with pagination', async () => {
      const params = {
        page: 1,
        limit: 10,
        status: 'DRAFT',
      }

      const mockResponse = {
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      }

      mockAxiosInstance.request.mockResolvedValueOnce({ data: mockResponse })

      const result = await apiClient.getExpenses(params)

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        url: '/expenses',
        method: 'GET',
        params,
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('File Upload', () => {
    beforeEach(() => {
      apiClient.setToken('test-token')
    })

    it('should upload file with progress tracking', async () => {
      const file = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      })

      const mockResponse = {
        success: true,
        data: {
          id: 'file-1',
          filename: 'test_123.pdf',
          originalName: 'test.pdf',
          mimeType: 'application/pdf',
          size: 1024,
        },
      }

      mockAxiosInstance.request.mockResolvedValueOnce({ data: mockResponse })

      const progressCallback = vi.fn()
      const result = await apiClient.uploadFile(file, progressCallback)

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        url: '/files/upload',
        method: 'POST',
        data: expect.any(FormData),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressCallback,
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      apiClient.setToken('test-token')
    })

    it('should handle network errors', async () => {
      const mockError = {
        request: {},
        message: 'Network Error',
      }

      mockAxiosInstance.request.mockRejectedValueOnce(mockError)

      // Since we're mocking the axios instance directly, the interceptor won't transform the error
      // In a real scenario, the interceptor would handle this
      await expect(apiClient.getProfile()).rejects.toMatchObject({
        request: {},
        message: 'Network Error',
      })
    })

    it('should handle server errors with details', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
            details: { error: 'Database connection failed' },
          },
        },
      }

      mockAxiosInstance.request.mockRejectedValueOnce(mockError)

      await expect(apiClient.getProfile()).rejects.toMatchObject({
        response: {
          status: 500,
          data: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
            details: { error: 'Database connection failed' },
          },
        },
      })
    })

    it('should handle validation errors', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: {
              fields: {
                email: 'Email is required',
                password: 'Password must be at least 8 characters',
              },
            },
          },
        },
      }

      mockAxiosInstance.request.mockRejectedValueOnce(mockError)

      await expect(
        apiClient.login({ email: '', password: '' })
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
          },
        },
      })
    })
  })

  describe('Request Timeout', () => {
    it('should handle request timeout', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      }

      mockAxiosInstance.request.mockRejectedValueOnce(mockError)

      await expect(apiClient.getProfile()).rejects.toMatchObject({
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      })
    })
  })
})

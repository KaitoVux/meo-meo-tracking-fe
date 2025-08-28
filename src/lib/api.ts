// API client for backend communication
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'ACCOUNTANT' | 'USER'
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'ACCOUNTANT' | 'USER'
  }
  access_token: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  email?: string
}

export interface Vendor {
  id: string
  name: string
  contactInfo?: string
  address?: string
  taxId?: string
  email?: string
  phone?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export interface CreateVendorRequest {
  name: string
  contactInfo?: string
  address?: string
  taxId?: string
  email?: string
  phone?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface UpdateVendorRequest {
  name?: string
  contactInfo?: string
  address?: string
  taxId?: string
  email?: string
  phone?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface VendorQueryParams {
  search?: string
  status?: 'ACTIVE' | 'INACTIVE'
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface CreateExpenseRequest {
  transactionDate: string
  expenseMonth: string
  type?: 'IN' | 'OUT'
  vendorId: string
  category: string
  amount: number
  amountBeforeVAT: number
  vatPercentage?: number
  vatAmount?: number
  currency: 'VND' | 'USD'
  exchangeRate?: number
  description: string
  submitterId: string
  projectCostCenter?: string
  paymentMethod: 'CASH' | 'BANK_TRANSFER'
  invoiceFileId?: string
}

export interface UpdateExpenseRequest {
  transactionDate?: string
  expenseMonth?: string
  type?: 'IN' | 'OUT'
  vendorId?: string
  category?: string
  amount?: number
  amountBeforeVAT?: number
  vatPercentage?: number
  vatAmount?: number
  currency?: 'VND' | 'USD'
  exchangeRate?: number
  description?: string
  projectCostCenter?: string
  paymentMethod?: 'CASH' | 'BANK_TRANSFER'
  invoiceFileId?: string
}

export interface Expense {
  id: string
  paymentId: string
  subId?: string
  transactionDate: string
  expenseMonth: string
  type: 'IN' | 'OUT'
  vendor: Vendor
  category: string
  amount: number
  amountBeforeVAT: number
  vatPercentage?: number
  vatAmount?: number
  currency: 'VND' | 'USD'
  exchangeRate?: number
  description: string
  projectCostCenter?: string
  paymentMethod: 'CASH' | 'BANK_TRANSFER'
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PAID' | 'CLOSED'
  createdAt: string
  updatedAt: string
  submitter: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  invoiceFile?: {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
  }
}

export interface ExpenseQueryParams {
  page?: number
  limit?: number
  status?: string
  category?: string
  submitterId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Category {
  id: string
  name: string
  code: string
  description?: string
  isActive: boolean
  parentId?: string
  parent?: Category
  children?: Category[]
  usageCount?: number
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateCategoryRequest {
  name: string
  code: string
  description?: string
  isActive?: boolean
  parentId?: string
}

export interface UpdateCategoryRequest {
  name?: string
  code?: string
  description?: string
  isActive?: boolean
  parentId?: string
}

export interface CategoryQueryParams {
  includeInactive?: boolean
}

export interface CategoryStatistics {
  totalCategories: number
  activeCategories: number
  inactiveCategories: number
  mostUsedCategories: Array<{
    id: string
    name: string
    usageCount: number
  }>
}

export interface NotificationData {
  id: string
  type: 'VALIDATION' | 'REMINDER' | 'STATUS_CHANGE' | 'SYSTEM'
  title: string
  message: string
  status: 'UNREAD' | 'READ' | 'DISMISSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  relatedEntityId?: string
  relatedEntityType?: 'EXPENSE' | 'CATEGORY' | 'VENDOR'
  createdAt: string
  readAt?: string
  dismissedAt?: string
}

export interface ExpenseStatusHistoryData {
  id: string
  expenseId: string
  fromStatus: string
  toStatus: string
  notes?: string
  changedBy: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  createdAt: string
}

export interface DashboardStats {
  totalExpenses: number
  totalAmount: number
  monthlyExpenses: number
  monthlyAmount: number
  pendingApprovals: number
  expensesByStatus: Record<string, number>
  expensesByCategory: Array<{
    category: string
    count: number
    amount: number
  }>
  recentExpenses: Expense[]
}

export interface ReportQueryParams {
  startDate?: string
  endDate?: string
  category?: string
  vendor?: string
  status?: string
  submitterId?: string
  groupBy?: 'category' | 'vendor' | 'month' | 'status'
  includeDetails?: boolean
}

export interface ReportData {
  summary: {
    totalExpenses: number
    totalAmount: number
    averageAmount: number
    expenseCount: number
  }
  groupedData: Array<{
    group: string
    count: number
    amount: number
    expenses?: Expense[]
  }>
  chartData: Array<{
    label: string
    value: number
  }>
}

export interface ExportReportParams {
  format: 'excel' | 'csv' | 'pdf'
  reportType: 'summary' | 'detailed' | 'payments-due'
  filters: ReportQueryParams
}

export interface ExchangeRateData {
  from: string
  to: string
  rate: number
  lastUpdated: string
  source: string
}

export interface CurrencyConversionData {
  originalAmount: number
  convertedAmount: number
  from: string
  to: string
  rate: number
  timestamp: string
}

// Enhanced error types for better error handling
export interface ApiError {
  code: string
  message: string
  details?: unknown
  timestamp: string
  status?: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

// Backend success response structure (matches what backend actually returns)
export interface BackendResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

// Backend paginated response structure
export interface BackendPaginatedResponse<T = unknown> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class ApiClient {
  private axiosInstance: AxiosInstance
  private token: string | null = null

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      config => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      error => {
        return Promise.reject(this.handleError(error))
      }
    )

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      status: error.response?.status,
    }

    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as Record<string, unknown>

      // Handle backend error response structure
      if (responseData && typeof responseData === 'object') {
        // Check if it's a backend response with success: false
        if ('success' in responseData && !responseData.success) {
          const errorObj = responseData as {
            error?: { code?: string; message?: string; details?: unknown }
            message?: string
          }
          apiError.code =
            errorObj.error?.code || `HTTP_${error.response.status}`
          apiError.message =
            errorObj.error?.message || errorObj.message || error.message
          apiError.details = errorObj.error?.details
        } else {
          // Handle NestJS validation errors
          const validationData = responseData as {
            message?: unknown
            code?: string
            details?: unknown
          }
          if (validationData.message && Array.isArray(validationData.message)) {
            apiError.code = 'VALIDATION_ERROR'
            apiError.message = 'Validation failed'
            apiError.details = { fields: validationData.message }
          } else {
            apiError.code =
              (validationData.code as string) || `HTTP_${error.response.status}`
            apiError.message =
              (validationData.message as string) || error.message
            apiError.details = validationData.details
          }
        }
      }
      apiError.status = error.response.status
    } else if (error.request) {
      // Request was made but no response received
      apiError.code = 'NETWORK_ERROR'
      apiError.message = 'Network error - please check your connection'
    } else {
      // Something else happened
      apiError.code = 'REQUEST_ERROR'
      apiError.message = error.message
    }

    return apiError
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.request<T>(config)
    return response.data
  }

  // Helper method for backend responses that unwraps the data
  private async requestBackend<T>(config: AxiosRequestConfig): Promise<T> {
    const response =
      await this.axiosInstance.request<BackendResponse<T>>(config)
    const backendResponse = response.data

    if (!backendResponse.success) {
      throw new Error(backendResponse.message || 'Request failed')
    }

    return backendResponse.data
  }

  // Helper method for paginated backend responses
  private async requestBackendPaginated<T>(
    config: AxiosRequestConfig
  ): Promise<BackendPaginatedResponse<T>> {
    const response =
      await this.axiosInstance.request<BackendPaginatedResponse<T>>(config)
    const backendResponse = response.data

    if (!backendResponse.success) {
      throw new Error('Request failed')
    }

    return backendResponse
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>({
      url: '/auth/login',
      method: 'POST',
      data: credentials,
    })
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>({
      url: '/auth/register',
      method: 'POST',
      data: userData,
    })
  }

  async getProfile(): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>({
      url: '/auth/profile',
      method: 'GET',
    })
  }

  async updateProfile(
    userData: UpdateProfileRequest
  ): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>({
      url: '/auth/profile',
      method: 'PATCH',
      data: userData,
    })
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.request<AuthResponse>({
      url: '/auth/refresh',
      method: 'POST',
    })
  }

  // Expense endpoints
  async createExpense(
    expenseData: CreateExpenseRequest
  ): Promise<{ success: boolean; data: Expense; message: string }> {
    return this.request({
      url: '/expenses',
      method: 'POST',
      data: expenseData,
    })
  }

  async getExpenses(
    params?: ExpenseQueryParams
  ): Promise<BackendPaginatedResponse<Expense>> {
    return this.requestBackendPaginated<Expense>({
      url: '/expenses',
      method: 'GET',
      params,
    })
  }

  async getExpense(id: string): Promise<{ success: boolean; data: Expense }> {
    return this.request({
      url: `/expenses/${id}`,
      method: 'GET',
    })
  }

  async updateExpense(
    id: string,
    expenseData: UpdateExpenseRequest
  ): Promise<{ success: boolean; data: Expense; message: string }> {
    return this.request({
      url: `/expenses/${id}`,
      method: 'PATCH',
      data: expenseData,
    })
  }

  async deleteExpense(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request({
      url: `/expenses/${id}`,
      method: 'DELETE',
    })
  }

  async updateExpenseStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; data: Expense; message: string }> {
    return this.request({
      url: `/expenses/${id}/status`,
      method: 'PATCH',
      data: { status, notes },
    })
  }

  // Category endpoints
  async getCategories(
    params?: CategoryQueryParams
  ): Promise<{ success: boolean; data: Category[] }> {
    return this.request({
      url: '/categories',
      method: 'GET',
      params,
    })
  }

  async getCategory(id: string): Promise<{ success: boolean; data: Category }> {
    return this.request({
      url: `/categories/${id}`,
      method: 'GET',
    })
  }

  async createCategory(
    categoryData: CreateCategoryRequest
  ): Promise<{ success: boolean; data: Category; message: string }> {
    return this.request({
      url: '/categories',
      method: 'POST',
      data: categoryData,
    })
  }

  async updateCategory(
    id: string,
    categoryData: UpdateCategoryRequest
  ): Promise<{ success: boolean; data: Category; message: string }> {
    return this.request({
      url: `/categories/${id}`,
      method: 'PUT',
      data: categoryData,
    })
  }

  async updateCategoryStatus(
    id: string,
    isActive: boolean
  ): Promise<{ success: boolean; data: Category; message: string }> {
    return this.request({
      url: `/categories/${id}/status`,
      method: 'PUT',
      data: { isActive },
    })
  }

  async deleteCategory(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request({
      url: `/categories/${id}`,
      method: 'DELETE',
    })
  }

  async getCategoryUsage(id: string): Promise<{
    success: boolean
    data: { categoryId: string; usageCount: number }
  }> {
    return this.request({
      url: `/categories/${id}/usage`,
      method: 'GET',
    })
  }

  async getCategoryStatistics(): Promise<{
    success: boolean
    data: CategoryStatistics
  }> {
    return this.request({
      url: '/categories/statistics',
      method: 'GET',
    })
  }

  // Vendor endpoints
  async createVendor(
    vendorData: CreateVendorRequest
  ): Promise<{ success: boolean; data: Vendor; message: string }> {
    return this.request({
      url: '/vendors',
      method: 'POST',
      data: vendorData,
    })
  }

  async getVendors(params?: VendorQueryParams): Promise<{
    success: boolean
    data: {
      vendors: Vendor[]
      total: number
      page: number
      limit: number
    }
  }> {
    return this.request({
      url: '/vendors',
      method: 'GET',
      params,
    })
  }

  async getActiveVendors(): Promise<{ success: boolean; data: Vendor[] }> {
    return this.request({
      url: '/vendors/active',
      method: 'GET',
    })
  }

  async getVendor(id: string): Promise<{ success: boolean; data: Vendor }> {
    return this.request({
      url: `/vendors/${id}`,
      method: 'GET',
    })
  }

  async updateVendor(
    id: string,
    vendorData: UpdateVendorRequest
  ): Promise<{ success: boolean; data: Vendor; message: string }> {
    return this.request({
      url: `/vendors/${id}`,
      method: 'PATCH',
      data: vendorData,
    })
  }

  async toggleVendorStatus(
    id: string
  ): Promise<{ success: boolean; data: Vendor; message: string }> {
    return this.request({
      url: `/vendors/${id}/toggle-status`,
      method: 'PATCH',
    })
  }

  async deleteVendor(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request({
      url: `/vendors/${id}`,
      method: 'DELETE',
    })
  }

  // File upload endpoints
  async uploadFile(
    file: File,
    onUploadProgress?: (progressEvent: {
      loaded: number
      total?: number
    }) => void
  ): Promise<{
    success: boolean
    data: {
      id: string
      filename: string
      originalName: string
      mimeType: string
      size: number
    }
  }> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request({
      url: '/files/upload',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    })
  }

  async getFile(id: string): Promise<{
    success: boolean
    data: {
      id: string
      filename: string
      originalName: string
      mimeType: string
      size: number
      googleDriveId: string
      googleDriveUrl: string
    }
  }> {
    return this.request({
      url: `/files/${id}`,
      method: 'GET',
    })
  }

  async deleteFile(id: string): Promise<{ success: boolean; message: string }> {
    return this.request({
      url: `/files/${id}`,
      method: 'DELETE',
    })
  }

  // Notification endpoints
  async getNotifications(
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ notifications: NotificationData[]; total: number }> {
    return this.request({
      url: '/notifications',
      method: 'GET',
      params: { status, limit, offset },
    })
  }

  async getUnreadNotificationCount(): Promise<{ count: number }> {
    return this.request({
      url: '/notifications/unread-count',
      method: 'GET',
    })
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<{ success: boolean }> {
    return this.request({
      url: `/notifications/${notificationId}/read`,
      method: 'PATCH',
    })
  }

  async dismissNotification(
    notificationId: string
  ): Promise<{ success: boolean }> {
    return this.request({
      url: `/notifications/${notificationId}/dismiss`,
      method: 'PATCH',
    })
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean }> {
    return this.request({
      url: '/notifications/mark-all-read',
      method: 'PATCH',
    })
  }

  // Workflow endpoints
  async getExpenseStatusHistory(
    expenseId: string
  ): Promise<{ success: boolean; data: ExpenseStatusHistoryData[] }> {
    return this.request({
      url: `/expenses/${expenseId}/status-history`,
      method: 'GET',
    })
  }

  // Dashboard and reporting endpoints
  async getDashboardStats(): Promise<{
    success: boolean
    data: DashboardStats
  }> {
    return this.request({
      url: '/dashboard/stats',
      method: 'GET',
    })
  }

  async getReports(
    params: ReportQueryParams
  ): Promise<{ success: boolean; data: ReportData }> {
    return this.request({
      url: '/reports',
      method: 'GET',
      params,
    })
  }

  async exportReport(params: ExportReportParams): Promise<Blob> {
    const response = await this.axiosInstance.request({
      url: '/reports/export',
      method: 'POST',
      data: params,
      responseType: 'blob',
    })
    return response.data
  }

  // Currency conversion endpoints
  async getExchangeRate(
    from: string,
    to: string
  ): Promise<{ success: boolean; data: ExchangeRateData }> {
    return this.request({
      url: '/currency/exchange-rate',
      method: 'GET',
      params: { from, to },
    })
  }

  async convertCurrency(
    amount: number,
    from: string,
    to: string
  ): Promise<{ success: boolean; data: CurrencyConversionData }> {
    return this.request({
      url: '/currency/convert',
      method: 'POST',
      data: { amount, from, to },
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

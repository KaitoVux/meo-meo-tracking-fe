// API client for backend communication
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

export interface CreateExpenseRequest {
  date: string
  vendor: string
  category: string
  amount: number
  currency: 'VND' | 'USD'
  exchangeRate?: number
  description: string
  submitterId: string
  projectCostCenter?: string
  paymentMethod: 'CASH' | 'BANK_TRANSFER'
  invoiceFileId?: string
}

export interface UpdateExpenseRequest {
  date?: string
  vendor?: string
  category?: string
  amount?: number
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
  date: string
  vendor: string
  category: string
  amount: number
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
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      )
    }

    return response.json()
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getProfile(): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>('/auth/profile')
  }

  async updateProfile(
    userData: UpdateProfileRequest
  ): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    })
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    })
  }

  // Expense endpoints
  async createExpense(
    expenseData: CreateExpenseRequest
  ): Promise<{ success: boolean; data: Expense; message: string }> {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    })
  }

  async getExpenses(
    params?: ExpenseQueryParams
  ): Promise<PaginatedResponse<Expense>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    const queryString = searchParams.toString()
    return this.request(`/expenses${queryString ? `?${queryString}` : ''}`)
  }

  async getExpense(id: string): Promise<{ success: boolean; data: Expense }> {
    return this.request(`/expenses/${id}`)
  }

  async updateExpense(
    id: string,
    expenseData: UpdateExpenseRequest
  ): Promise<{ success: boolean; data: Expense; message: string }> {
    return this.request(`/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(expenseData),
    })
  }

  async deleteExpense(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    })
  }

  async updateExpenseStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; data: Expense; message: string }> {
    return this.request(`/expenses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    })
  }

  // Category endpoints
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return this.request('/categories')
  }

  // File upload endpoints
  async uploadFile(
    file: File
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

    const url = `${this.baseURL}/files/upload`
    const headers: Record<string, string> = {}

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      )
    }

    return response.json()
  }

  // Notification endpoints
  async getNotifications(
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ notifications: any[]; total: number }> {
    const searchParams = new URLSearchParams()
    if (status) searchParams.append('status', status)
    searchParams.append('limit', limit.toString())
    searchParams.append('offset', offset.toString())

    const queryString = searchParams.toString()
    return this.request(`/notifications${queryString ? `?${queryString}` : ''}`)
  }

  async getUnreadNotificationCount(): Promise<{ count: number }> {
    return this.request('/notifications/unread-count')
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<{ success: boolean }> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    })
  }

  async dismissNotification(
    notificationId: string
  ): Promise<{ success: boolean }> {
    return this.request(`/notifications/${notificationId}/dismiss`, {
      method: 'PATCH',
    })
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean }> {
    return this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    })
  }

  // Workflow endpoints
  async getExpenseStatusHistory(
    expenseId: string
  ): Promise<{ success: boolean; data: any[] }> {
    return this.request(`/expenses/${expenseId}/status-history`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

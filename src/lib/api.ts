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
}

export const apiClient = new ApiClient(API_BASE_URL)

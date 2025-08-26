import { useApiStore } from '../store/api'

import type { ApiError } from './api'

export interface ErrorHandlerOptions {
  showNotification?: boolean
  logError?: boolean
  fallbackMessage?: string
}

export class ErrorHandler {
  private static instance: ErrorHandler

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Handle API errors with consistent formatting and user feedback
   */
  handleApiError(
    error: ApiError | Error | unknown,
    options: ErrorHandlerOptions = {}
  ): ApiError {
    const {
      showNotification = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred',
    } = options

    let apiError: ApiError

    // Convert different error types to ApiError format
    if (this.isApiError(error)) {
      apiError = error
    } else if (error instanceof Error) {
      apiError = {
        code: 'CLIENT_ERROR',
        message: error.message || fallbackMessage,
        timestamp: new Date().toISOString(),
      }
    } else {
      apiError = {
        code: 'UNKNOWN_ERROR',
        message: fallbackMessage,
        timestamp: new Date().toISOString(),
      }
    }

    // Log error for debugging
    if (logError) {
      console.error('API Error:', apiError)
    }

    // Show user notification if requested
    if (showNotification) {
      this.showErrorNotification(apiError)
    }

    // Clear loading states
    this.clearLoadingStates()

    return apiError
  }

  /**
   * Handle authentication errors specifically
   */
  handleAuthError(error: ApiError | Error | unknown): void {
    const apiError = this.handleApiError(error, {
      showNotification: false, // Handle auth notifications separately
      logError: true,
    })

    // Handle specific auth error cases
    if (apiError.status === 401) {
      this.handleUnauthorized()
    } else if (apiError.status === 403) {
      this.handleForbidden()
    } else {
      this.showErrorNotification(apiError)
    }
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: ApiError | Error | unknown): void {
    this.handleApiError(error, {
      showNotification: true,
      logError: true,
      fallbackMessage:
        'Network error - please check your connection and try again',
    })
  }

  /**
   * Handle validation errors
   */
  handleValidationError(
    error: ApiError,
    fieldErrors?: Record<string, string>
  ): void {
    console.error('Validation Error:', error, fieldErrors)

    // Show general validation message
    this.showErrorNotification({
      ...error,
      message: 'Please check your input and try again',
    })
  }

  /**
   * Handle file upload errors
   */
  handleUploadError(
    error: ApiError | Error | unknown,
    fileName?: string
  ): void {
    const message = fileName
      ? `Failed to upload ${fileName}. Please try again.`
      : 'File upload failed. Please try again.'

    this.handleApiError(error, {
      showNotification: true,
      logError: true,
      fallbackMessage: message,
    })
  }

  /**
   * Type guard to check if error is ApiError
   */
  private isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      'timestamp' in error
    )
  }

  /**
   * Show error notification to user
   */
  private showErrorNotification(error: ApiError): void {
    // In a real app, this would integrate with a toast/notification system
    // For now, we'll use console.error and could integrate with a UI library
    console.error('User Notification:', error.message)

    // TODO: Integrate with actual notification system
    // Example: toast.error(error.message)
  }

  /**
   * Handle unauthorized access (401)
   */
  private handleUnauthorized(): void {
    console.warn('Unauthorized access - redirecting to login')

    // Clear auth state
    const { reset } = useApiStore.getState()
    reset()

    // TODO: Redirect to login page
    // Example: router.push('/login')

    this.showErrorNotification({
      code: 'UNAUTHORIZED',
      message: 'Your session has expired. Please log in again.',
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Handle forbidden access (403)
   */
  private handleForbidden(): void {
    this.showErrorNotification({
      code: 'FORBIDDEN',
      message: 'You do not have permission to perform this action.',
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Clear all loading states on error
   */
  private clearLoadingStates(): void {
    const { reset } = useApiStore.getState()
    reset()
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: ApiError): string {
    const errorMessages: Record<string, string> = {
      NETWORK_ERROR: 'Please check your internet connection and try again.',
      VALIDATION_ERROR: 'Please check your input and correct any errors.',
      UNAUTHORIZED: 'Please log in to continue.',
      FORBIDDEN: 'You do not have permission to perform this action.',
      NOT_FOUND: 'The requested resource was not found.',
      CONFLICT: 'This action conflicts with existing data.',
      RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
      SERVER_ERROR: 'Server error. Please try again later.',
      TIMEOUT: 'Request timed out. Please try again.',
    }

    return (
      errorMessages[error.code] ||
      error.message ||
      'An unexpected error occurred.'
    )
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error: ApiError): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'SERVER_ERROR',
      'RATE_LIMITED',
    ]

    const retryableStatuses = [408, 429, 500, 502, 503, 504]

    return (
      retryableCodes.includes(error.code) ||
      (error.status !== undefined && retryableStatuses.includes(error.status))
    )
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Export convenience functions
export const handleApiError = (error: unknown, options?: ErrorHandlerOptions) =>
  errorHandler.handleApiError(error, options)

export const handleAuthError = (error: unknown) =>
  errorHandler.handleAuthError(error)

export const handleNetworkError = (error: unknown) =>
  errorHandler.handleNetworkError(error)

export const handleValidationError = (
  error: ApiError,
  fieldErrors?: Record<string, string>
) => errorHandler.handleValidationError(error, fieldErrors)

export const handleUploadError = (error: unknown, fileName?: string) =>
  errorHandler.handleUploadError(error, fileName)

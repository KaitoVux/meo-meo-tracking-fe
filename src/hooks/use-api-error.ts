import { useCallback } from 'react'

import type { ApiError } from '@/lib/api'
import { errorHandler, type ErrorHandlerOptions } from '@/lib/error-handler'

export interface UseApiErrorOptions extends ErrorHandlerOptions {
  onError?: (error: ApiError) => void
  onRetry?: () => void
}

export function useApiError(options: UseApiErrorOptions = {}) {
  const handleError = useCallback(
    (error: unknown) => {
      const apiError = errorHandler.handleApiError(error, options)

      // Call custom error handler if provided
      if (options.onError) {
        options.onError(apiError)
      }

      return apiError
    },
    [options]
  )

  const handleAuthError = useCallback((error: unknown) => {
    errorHandler.handleAuthError(error)
  }, [])

  const handleNetworkError = useCallback((error: unknown) => {
    errorHandler.handleNetworkError(error)
  }, [])

  const handleValidationError = useCallback(
    (error: ApiError, fieldErrors?: Record<string, string>) => {
      errorHandler.handleValidationError(error, fieldErrors)
    },
    []
  )

  const handleUploadError = useCallback((error: unknown, fileName?: string) => {
    errorHandler.handleUploadError(error, fileName)
  }, [])

  const isRetryable = useCallback((error: ApiError) => {
    return errorHandler.isRetryableError(error)
  }, [])

  const getUserFriendlyMessage = useCallback((error: ApiError) => {
    return errorHandler.getUserFriendlyMessage(error)
  }, [])

  return {
    handleError,
    handleAuthError,
    handleNetworkError,
    handleValidationError,
    handleUploadError,
    isRetryable,
    getUserFriendlyMessage,
  }
}

// Hook for handling query errors with automatic retry logic
export function useQueryErrorHandler(
  options: UseApiErrorOptions & { maxRetries?: number } = {}
) {
  const { maxRetries = 3, onRetry, ...errorOptions } = options
  const { handleError, isRetryable } = useApiError(errorOptions)

  const handleQueryError = useCallback(
    (error: unknown, retryCount: number = 0) => {
      const apiError = handleError(error)

      // Auto-retry for retryable errors
      if (isRetryable(apiError) && retryCount < maxRetries && onRetry) {
        setTimeout(
          () => {
            console.log(
              `Retrying request (attempt ${retryCount + 1}/${maxRetries})`
            )
            onRetry()
          },
          Math.min(1000 * Math.pow(2, retryCount), 10000)
        ) // Exponential backoff with max 10s
      }

      return apiError
    },
    [handleError, isRetryable, maxRetries, onRetry]
  )

  return { handleQueryError }
}

// Hook for handling mutation errors with form validation support
export function useMutationErrorHandler(options: UseApiErrorOptions = {}) {
  const { handleError, handleValidationError } = useApiError(options)

  const handleMutationError = useCallback(
    (
      error: unknown,
      setFieldErrors?: (errors: Record<string, string>) => void
    ) => {
      const apiError = handleError(error)

      // Handle validation errors specially for forms
      if (
        apiError.code === 'VALIDATION_ERROR' &&
        apiError.details &&
        setFieldErrors
      ) {
        const fieldErrors = apiError.details as {
          fields?: Record<string, string>
        }
        if (fieldErrors.fields) {
          setFieldErrors(fieldErrors.fields)
          handleValidationError(apiError, fieldErrors.fields)
          return apiError
        }
      }

      return apiError
    },
    [handleError, handleValidationError]
  )

  return { handleMutationError }
}

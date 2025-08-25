import { useMutation, useQuery } from '@tanstack/react-query'

import { apiClient } from '../api'
import { queryKeys } from '../query-keys'

// File Query Hooks

/**
 * Query hook for fetching file metadata by ID
 */
export function useFileQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.files.detail(id),
    queryFn: () => {
      // TODO: Implement getFile method in apiClient
      throw new Error('getFile method not implemented in apiClient')
    },
    enabled: !!id,
  })
}

// File Mutation Hooks

/**
 * Mutation hook for uploading files
 */
export function useUploadFileMutation() {
  return useMutation({
    mutationFn: (file: File) => apiClient.uploadFile(file),
    onError: error => {
      console.error('File upload failed:', error)
    },
  })
}

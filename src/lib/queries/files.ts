import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useApiStore } from '../../store/api'
import { apiClient } from '../api'
import { queryKeys } from '../query-keys'

// File Query Hooks

/**
 * Query hook for fetching file metadata by ID
 */
export function useFileQuery(id: string) {
  const setFeatureLoading = useApiStore(state => state.setFeatureLoading)

  return useQuery({
    queryKey: queryKeys.files.detail(id),
    queryFn: async () => {
      setFeatureLoading('files', {
        isLoading: true,
        message: 'Loading file details...',
      })
      try {
        return await apiClient.getFile(id)
      } finally {
        setFeatureLoading('files', { isLoading: false })
      }
    },
    enabled: !!id,
  })
}

// File Mutation Hooks

/**
 * Mutation hook for uploading files with progress tracking
 */
export function useUploadFileMutation() {
  const queryClient = useQueryClient()
  const { setFeatureLoading, setUploadProgress, clearUploadProgress } =
    useApiStore()

  return useMutation({
    mutationFn: async ({ file, fileId }: { file: File; fileId?: string }) => {
      const uploadId = fileId || `upload-${Date.now()}`

      setFeatureLoading('files', {
        isLoading: true,
        message: `Uploading ${file.name}...`,
      })

      try {
        const result = await apiClient.uploadFile(file, progressEvent => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setUploadProgress(uploadId, progress)
          }
        })

        clearUploadProgress(uploadId)
        return { ...result, uploadId }
      } catch (error) {
        clearUploadProgress(uploadId)
        throw error
      } finally {
        setFeatureLoading('files', { isLoading: false })
      }
    },
    onError: error => {
      console.error('File upload failed:', error)
    },
    onSuccess: data => {
      // Cache the uploaded file data
      queryClient.setQueryData(queryKeys.files.detail(data.data.id), {
        success: true,
        data: data.data,
      })
    },
  })
}

/**
 * Mutation hook for deleting files
 */
export function useDeleteFileMutation() {
  const queryClient = useQueryClient()
  const setFeatureLoading = useApiStore(state => state.setFeatureLoading)

  return useMutation({
    mutationFn: async (id: string) => {
      setFeatureLoading('files', {
        isLoading: true,
        message: 'Deleting file...',
      })
      try {
        return await apiClient.deleteFile(id)
      } finally {
        setFeatureLoading('files', { isLoading: false })
      }
    },
    onSuccess: (data, id) => {
      // Remove the file from cache
      queryClient.removeQueries({ queryKey: queryKeys.files.detail(id) })
    },
    onError: error => {
      console.error('File deletion failed:', error)
    },
  })
}

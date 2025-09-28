import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/hooks/use-toast'
import { api } from '@/lib/api'

// Preview import file hook
export function useImportPreview() {
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await api.previewImport(file)
      return response.data!
    },
    onError: (error: any) => {
      toast({
        title: 'Preview Failed',
        description: error.message || 'Failed to preview import file',
        variant: 'destructive',
      })
    },
  })
}

// Upload import file hook
export function useImportUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const response = await api.uploadImport(file)
      return response.data!
    },
    onSuccess: () => {
      toast({
        title: 'Import Started',
        description: 'Your file has been uploaded and processing has started.',
      })
      // Invalidate import history to refresh the list
      queryClient.invalidateQueries({ queryKey: ['import', 'history'] })
    },
    onError: (error: any) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload import file',
        variant: 'destructive',
      })
    },
  })
}

// Get import status hook
export function useImportStatus(
  importId: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['import', 'status', importId],
    queryFn: async () => {
      if (!importId) throw new Error('Import ID is required')
      const response = await api.getImportStatus(importId)
      return response.data!
    },
    enabled: enabled && !!importId,
    refetchInterval: query => {
      // Refetch every 2 seconds if still processing
      const data = query.state.data
      if (data && (data.status === 'processing' || data.status === 'pending')) {
        return 2000
      }
      return false
    },
  })
}

// Get import history hook
export function useImportHistory() {
  return useQuery({
    queryKey: ['import', 'history'],
    queryFn: async () => {
      const response = await api.getImportHistory()
      return response.data!
    },
  })
}

// Polling hook for multiple import statuses
export function useImportPolling(importIds: string[]) {
  return useQuery({
    queryKey: ['import', 'polling', importIds],
    queryFn: async () => {
      const promises = importIds.map(id => api.getImportStatus(id))
      const responses = await Promise.all(promises)
      return responses.map(response => response.data!).filter(Boolean)
    },
    enabled: importIds.length > 0,
    refetchInterval: query => {
      // Refetch if any import is still processing
      const data = query.state.data
      const hasProcessing =
        data &&
        data.some(
          (importRecord: any) =>
            importRecord.status === 'processing' ||
            importRecord.status === 'pending'
        )
      return hasProcessing ? 3000 : false
    },
  })
}

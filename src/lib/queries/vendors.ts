import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '../api'
import type {
  Vendor,
  CreateVendorRequest,
  UpdateVendorRequest,
  VendorQueryParams,
} from '../api'
import { queryKeys, invalidateQueries } from '../query-keys'

// Vendor Query Hooks

/**
 * Query hook for fetching vendors with search and filtering
 */
export function useVendorsQuery(params?: VendorQueryParams) {
  return useQuery({
    queryKey: queryKeys.vendors.list(params),
    queryFn: () => apiClient.getVendors(params),
    placeholderData: previousData => previousData, // Keep previous data while loading new
  })
}

/**
 * Query hook for fetching active vendors (for dropdowns)
 */
export function useActiveVendorsQuery() {
  return useQuery({
    queryKey: queryKeys.vendors.active(),
    queryFn: () => apiClient.getActiveVendors(),
    staleTime: 5 * 60 * 1000, // Active vendors stay fresh for 5 minutes
  })
}

/**
 * Query hook for fetching a single vendor by ID
 */
export function useVendorQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.vendors.detail(id),
    queryFn: () => apiClient.getVendor(id),
    enabled: !!id,
  })
}

// Vendor Mutation Hooks

/**
 * Mutation hook for creating a new vendor
 */
export function useCreateVendorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vendorData: CreateVendorRequest) =>
      apiClient.createVendor(vendorData),
    onMutate: async newVendor => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.vendors.lists() })

      // Snapshot the previous value
      const previousVendors = queryClient.getQueriesData({
        queryKey: queryKeys.vendors.lists(),
      })

      // Optimistically update vendor lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.vendors.lists() },
        (
          old:
            | {
                success: boolean
                data: {
                  vendors: Vendor[]
                  total: number
                  page: number
                  limit: number
                }
              }
            | undefined
        ) => {
          if (!old) return old

          // Create optimistic vendor object
          const optimisticVendor: Vendor = {
            id: `temp-${Date.now()}`,
            name: newVendor.name,
            contactInfo: newVendor.contactInfo,
            address: newVendor.address,
            taxId: newVendor.taxId,
            email: newVendor.email,
            phone: newVendor.phone,
            status: newVendor.status ?? 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          return {
            ...old,
            data: {
              ...old.data,
              vendors: [optimisticVendor, ...old.data.vendors],
              total: old.data.total + 1,
            },
          }
        }
      )

      // Also update active vendors if the new vendor is active
      if (newVendor.status !== 'INACTIVE') {
        queryClient.setQueryData(
          queryKeys.vendors.active(),
          (old: { success: boolean; data: Vendor[] } | undefined) => {
            if (!old) return old
            const optimisticVendor: Vendor = {
              id: `temp-${Date.now()}`,
              name: newVendor.name,
              contactInfo: newVendor.contactInfo,
              address: newVendor.address,
              taxId: newVendor.taxId,
              email: newVendor.email,
              phone: newVendor.phone,
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            return {
              ...old,
              data: [...old.data, optimisticVendor],
            }
          }
        )
      }

      return { previousVendors }
    },
    onError: (error, newVendor, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousVendors) {
        context.previousVendors.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to create vendor:', error)
    },
    onSuccess: data => {
      // Add the new vendor to the cache
      queryClient.setQueryData(queryKeys.vendors.detail(data.data.id), {
        success: true,
        data: data.data,
      })
    },
    onSettled: () => {
      // Always refetch vendor lists to ensure consistency
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.vendorLists(),
      })
    },
  })
}

/**
 * Mutation hook for updating a vendor
 */
export function useUpdateVendorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorRequest }) =>
      apiClient.updateVendor(id, data),
    onMutate: async ({ id, data: updateData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.vendors.detail(id),
      })

      // Snapshot the previous value
      const previousVendor = queryClient.getQueryData(
        queryKeys.vendors.detail(id)
      )

      // Optimistically update the vendor
      queryClient.setQueryData(
        queryKeys.vendors.detail(id),
        (old: { success: boolean; data: Vendor } | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: {
              ...old.data,
              ...updateData,
              updatedAt: new Date().toISOString(),
            },
          }
        }
      )

      // Also update the vendor in any list queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.vendors.lists() },
        (
          old:
            | {
                success: boolean
                data: {
                  vendors: Vendor[]
                  total: number
                  page: number
                  limit: number
                }
              }
            | undefined
        ) => {
          if (!old) return old
          return {
            ...old,
            data: {
              ...old.data,
              vendors: old.data.vendors.map(vendor =>
                vendor.id === id
                  ? {
                      ...vendor,
                      ...updateData,
                      updatedAt: new Date().toISOString(),
                    }
                  : vendor
              ),
            },
          }
        }
      )

      // Update active vendors list if status changed
      if (updateData.status !== undefined) {
        queryClient.setQueryData(
          queryKeys.vendors.active(),
          (old: { success: boolean; data: Vendor[] } | undefined) => {
            if (!old) return old
            if (updateData.status === 'ACTIVE') {
              // Add to active list if not already there
              const exists = old.data.some(v => v.id === id)
              if (!exists) {
                const updatedVendor = {
                  ...old.data.find(v => v.id === id),
                  ...updateData,
                } as Vendor
                return {
                  ...old,
                  data: [...old.data, updatedVendor],
                }
              }
            } else {
              // Remove from active list
              return {
                ...old,
                data: old.data.filter(vendor => vendor.id !== id),
              }
            }
            return old
          }
        )
      }

      return { previousVendor }
    },
    onError: (error, { id }, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousVendor) {
        queryClient.setQueryData(
          queryKeys.vendors.detail(id),
          context.previousVendor
        )
      }
      console.error('Failed to update vendor:', error)
    },
    onSettled: (data, error, { id }) => {
      // Always refetch the specific vendor and lists
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.detail(id) })
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.vendorLists(),
      })
    },
  })
}

/**
 * Mutation hook for toggling vendor status (active/inactive)
 */
export function useToggleVendorStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.toggleVendorStatus(id),
    onMutate: async id => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.vendors.detail(id),
      })

      // Snapshot the previous value
      const previousVendor = queryClient.getQueryData(
        queryKeys.vendors.detail(id)
      )

      // Optimistically toggle the vendor status
      queryClient.setQueryData(
        queryKeys.vendors.detail(id),
        (old: { success: boolean; data: Vendor } | undefined) => {
          if (!old) return old
          const newStatus = old.data.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
          return {
            ...old,
            data: {
              ...old.data,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            },
          }
        }
      )

      return { previousVendor }
    },
    onError: (error, id, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousVendor) {
        queryClient.setQueryData(
          queryKeys.vendors.detail(id),
          context.previousVendor
        )
      }
      console.error('Failed to toggle vendor status:', error)
    },
    onSettled: (data, error, id) => {
      // Always refetch the specific vendor and lists
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.detail(id) })
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.vendorLists(),
      })
    },
  })
}

/**
 * Mutation hook for deleting a vendor
 */
export function useDeleteVendorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteVendor(id),
    onMutate: async id => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.vendors.lists() })

      // Snapshot the previous value
      const previousVendors = queryClient.getQueriesData({
        queryKey: queryKeys.vendors.lists(),
      })

      // Optimistically remove the vendor from lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.vendors.lists() },
        (
          old:
            | {
                success: boolean
                data: {
                  vendors: Vendor[]
                  total: number
                  page: number
                  limit: number
                }
              }
            | undefined
        ) => {
          if (!old) return old
          return {
            ...old,
            data: {
              ...old.data,
              vendors: old.data.vendors.filter(vendor => vendor.id !== id),
              total: old.data.total - 1,
            },
          }
        }
      )

      // Also remove from active vendors
      queryClient.setQueryData(
        queryKeys.vendors.active(),
        (old: { success: boolean; data: Vendor[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter(vendor => vendor.id !== id),
          }
        }
      )

      return { previousVendors }
    },
    onError: (error, id, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousVendors) {
        context.previousVendors.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to delete vendor:', error)
    },
    onSuccess: (data, id) => {
      // Remove the vendor detail from cache
      queryClient.removeQueries({ queryKey: queryKeys.vendors.detail(id) })
    },
    onSettled: () => {
      // Always refetch vendor lists to ensure consistency
      queryClient.invalidateQueries({
        queryKey: invalidateQueries.vendorLists(),
      })
    },
  })
}

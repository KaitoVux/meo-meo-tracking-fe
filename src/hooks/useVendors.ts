/**
 * Convenient re-exports for vendor-related hooks
 * This provides a cleaner import path for components
 */

export {
  useVendorsQuery,
  useActiveVendorsQuery,
  useVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useToggleVendorStatusMutation,
  useDeleteVendorMutation,
} from '../lib/queries/vendors'

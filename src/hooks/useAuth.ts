/**
 * Convenient re-exports for auth-related hooks
 * This provides a cleaner import path for components
 */

export {
  useProfileQuery,
  useLoginMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} from '../lib/queries/auth'

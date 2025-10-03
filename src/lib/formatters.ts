/**
 * Format utilities for consistent display across the application
 */

/**
 * Format status string by converting underscores to spaces and applying proper capitalization
 * @param status - Status string (e.g., "IN_PROGRESS", "ON_HOLD")
 * @returns Formatted status string (e.g., "In Progress", "On Hold")
 */
export function formatStatus(status: string): string {
  if (!status) return ''

  return status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Status display configuration
 */
export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  PAID: 'Paid',
  ON_HOLD: 'On Hold',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
}

/**
 * Status badge variant mapping for consistent styling
 */
export const STATUS_VARIANTS = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'default',
  PAID: 'default',
  ON_HOLD: 'destructive',
  ACTIVE: 'default',
  INACTIVE: 'secondary',
} as const

/**
 * Get formatted status label
 * @param status - Status string
 * @returns Formatted label from mapping or formatted string
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || formatStatus(status)
}

/**
 * Get badge variant for status
 * @param status - Status string
 * @returns Badge variant for styling
 */
export function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  return (STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS] ||
    'default') as 'default' | 'secondary' | 'destructive' | 'outline'
}

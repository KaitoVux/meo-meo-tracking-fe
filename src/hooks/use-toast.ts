// Basic toast hook implementation
export interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function toast({ title, description, variant = 'default' }: Toast) {
  // For now, just log to console
  // In a real implementation, you would integrate with a toast library
  console.log(
    `[${variant.toUpperCase()}] ${title}${description ? ': ' + description : ''}`
  )
}

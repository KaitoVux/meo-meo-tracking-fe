import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { apiClient, type Vendor } from '@/lib/api'

interface VendorDeleteDialogProps {
  vendor: Vendor
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}

export function VendorDeleteDialog({
  vendor,
  open,
  onOpenChange,
  onDeleted,
}: VendorDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError(null)

      const response = await apiClient.deleteVendor(vendor.id)
      if (response.success) {
        onDeleted()
        onOpenChange(false)
      } else {
        setError('Failed to delete vendor')
      }
    } catch (error) {
      console.error('Delete vendor error:', error)
      setError(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>{vendor.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The vendor will be permanently
              removed from the system. Any existing expenses linked to this
              vendor will still retain the vendor information, but you
              won&apos;t be able to select this vendor for new expenses.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Vendor'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

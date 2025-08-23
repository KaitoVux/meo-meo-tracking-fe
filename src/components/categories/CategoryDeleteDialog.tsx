import { AlertTriangle } from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'

import { apiClient } from '../../lib/api'
import type { Category } from '../../lib/api'
import { Alert, AlertDescription } from '../ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { Badge } from '../ui/badge'

interface CategoryDeleteDialogProps {
  category: Category
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export const CategoryDeleteDialog: React.FC<CategoryDeleteDialogProps> = ({
  category,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}) => {
  const [usageCount, setUsageCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsageCount = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getCategoryUsage(category.id)
      setUsageCount(response.data.usageCount)
    } catch {
      setError('Failed to check category usage')
      setUsageCount(null)
    } finally {
      setLoading(false)
    }
  }, [category.id])

  useEffect(() => {
    if (open && category) {
      fetchUsageCount()
    }
  }, [open, category, fetchUsageCount])

  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  const canDelete = usageCount === 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Category
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete the category{' '}
                <strong>&ldquo;{category.name}&rdquo;</strong>?
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Category:</span>
                  <Badge variant="outline">{category.name}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Code:</span>
                  <Badge variant="outline">{category.code}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={category.isActive ? 'default' : 'secondary'}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {loading && (
                <div className="text-sm text-muted-foreground">
                  Checking category usage...
                </div>
              )}

              {usageCount !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Expenses using this category:
                  </span>
                  <Badge variant={usageCount > 0 ? 'destructive' : 'default'}>
                    {usageCount} expenses
                  </Badge>
                </div>
              )}

              {!canDelete && usageCount !== null && usageCount > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This category cannot be deleted because it is being used by{' '}
                    {usageCount} expense(s). Consider deactivating it instead,
                    or reassign the expenses to another category first.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {canDelete && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This action cannot be undone. The category will be
                    permanently removed from the system.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canDelete || loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Checking...' : 'Delete Category'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

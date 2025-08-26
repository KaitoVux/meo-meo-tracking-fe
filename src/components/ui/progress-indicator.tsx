import { Loader2 } from 'lucide-react'
import React from 'react'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useApiStore, useGlobalLoading, useLoadingMessage } from '@/store/api'

interface ProgressIndicatorProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showMessage?: boolean
  feature?:
    | 'auth'
    | 'expenses'
    | 'categories'
    | 'vendors'
    | 'files'
    | 'notifications'
    | 'reports'
    | 'dashboard'
}

export function ProgressIndicator({
  className,
  size = 'md',
  showMessage = true,
  feature,
}: ProgressIndicatorProps) {
  const globalLoading = useGlobalLoading()
  const loadingMessage = useLoadingMessage()
  const featureState = useApiStore(state => (feature ? state[feature] : null))

  const isLoading = globalLoading || (featureState?.isLoading ?? false)
  const progress = featureState?.progress
  const message = featureState?.message || loadingMessage

  if (!isLoading) return null

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showMessage && message && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className={cn('animate-spin', iconSizes[size])} />
          <span>{message}</span>
        </div>
      )}

      {progress !== undefined ? (
        <div className="space-y-1">
          <Progress value={progress} className={sizeClasses[size]} />
          <div className="text-xs text-muted-foreground text-right">
            {Math.round(progress)}%
          </div>
        </div>
      ) : (
        <Progress value={undefined} className={sizeClasses[size]} />
      )}
    </div>
  )
}

interface FileUploadProgressProps {
  fileId: string
  fileName?: string
  className?: string
}

export function FileUploadProgress({
  fileId,
  fileName,
  className,
}: FileUploadProgressProps) {
  const uploadProgress = useApiStore(state => state.uploadProgress[fileId])

  if (uploadProgress === undefined) return null

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="truncate">
          {fileName ? `Uploading ${fileName}...` : 'Uploading file...'}
        </span>
        <span className="text-muted-foreground">
          {Math.round(uploadProgress)}%
        </span>
      </div>
      <Progress value={uploadProgress} className="h-2" />
    </div>
  )
}

interface GlobalLoadingOverlayProps {
  children: React.ReactNode
}

export function GlobalLoadingOverlay({ children }: GlobalLoadingOverlayProps) {
  const globalLoading = useGlobalLoading()
  const loadingMessage = useLoadingMessage()

  return (
    <div className="relative">
      {children}
      {globalLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg border">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            {loadingMessage && (
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                {loadingMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        loading && 'cursor-not-allowed opacity-70',
        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </button>
  )
}

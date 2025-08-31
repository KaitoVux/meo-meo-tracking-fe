import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface ActionItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: 'default' | 'destructive'
  disabled?: boolean
}

interface DropdownActionsProps {
  actions: ActionItem[]
  disabled?: boolean
}

export function DropdownActions({
  actions,
  disabled = false,
}: DropdownActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={disabled}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={
              action.variant === 'destructive' ? 'text-destructive' : ''
            }
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Pre-configured action creators for common use cases
export const createViewAction = (onClick: () => void): ActionItem => ({
  label: 'View',
  icon: Eye,
  onClick,
})

export const createEditAction = (
  onClick: () => void,
  disabled = false
): ActionItem => ({
  label: 'Edit',
  icon: Edit,
  onClick,
  disabled,
})

export const createDeleteAction = (
  onClick: () => void,
  disabled = false
): ActionItem => ({
  label: 'Delete',
  icon: Trash2,
  onClick,
  variant: 'destructive',
  disabled,
})

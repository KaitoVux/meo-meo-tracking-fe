import {
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Archive,
} from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type Expense } from '@/lib/api'

interface WorkflowStatusTransitionProps {
  expense: Expense
  onStatusChange: (status: string, notes?: string) => Promise<void>
  isLoading?: boolean
}

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    icon: Clock,
    color: 'bg-gray-500',
    nextStates: ['SUBMITTED'],
    description: 'Expense is being prepared',
  },
  SUBMITTED: {
    label: 'Submitted',
    icon: AlertCircle,
    color: 'bg-blue-500',
    nextStates: ['APPROVED', 'DRAFT'],
    description: 'Waiting for approval',
  },
  APPROVED: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'bg-green-500',
    nextStates: ['PAID', 'SUBMITTED'],
    description: 'Approved for payment',
  },
  PAID: {
    label: 'Paid',
    icon: DollarSign,
    color: 'bg-purple-500',
    nextStates: ['CLOSED'],
    description: 'Payment has been processed',
  },
  CLOSED: {
    label: 'Closed',
    icon: Archive,
    color: 'bg-gray-600',
    nextStates: [],
    description: 'Expense is complete',
  },
} as const

const transitionLabels = {
  'DRAFT->SUBMITTED': 'Submit for Approval',
  'SUBMITTED->APPROVED': 'Approve Expense',
  'SUBMITTED->DRAFT': 'Return to Draft',
  'APPROVED->PAID': 'Mark as Paid',
  'APPROVED->SUBMITTED': 'Return for Review',
  'PAID->CLOSED': 'Close Expense',
} as const

export function WorkflowStatusTransition({
  expense,
  onStatusChange,
  isLoading = false,
}: WorkflowStatusTransitionProps) {
  const [selectedTransition, setSelectedTransition] = useState<string | null>(
    null
  )
  const [notes, setNotes] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const currentStatus = expense.status
  const currentConfig = statusConfig[currentStatus]
  const nextStates = currentConfig.nextStates

  const handleTransitionClick = (nextStatus: string) => {
    setSelectedTransition(nextStatus)
    setNotes('')
    setIsDialogOpen(true)
  }

  const handleConfirmTransition = async () => {
    if (!selectedTransition) return

    try {
      await onStatusChange(selectedTransition, notes || undefined)
      setIsDialogOpen(false)
      setSelectedTransition(null)
      setNotes('')
    } catch (error) {
      console.error('Failed to transition status:', error)
    }
  }

  const getTransitionLabel = (fromStatus: string, toStatus: string) => {
    const key = `${fromStatus}->${toStatus}` as keyof typeof transitionLabels
    return (
      transitionLabels[key] ||
      `Change to ${statusConfig[toStatus as keyof typeof statusConfig].label}`
    )
  }

  const getTransitionDescription = (toStatus: string) => {
    switch (toStatus) {
      case 'SUBMITTED':
        return 'Submit this expense for approval by an accountant.'
      case 'APPROVED':
        return 'Approve this expense for payment processing.'
      case 'DRAFT':
        return 'Return this expense to draft status for modifications.'
      case 'PAID':
        return 'Mark this expense as paid and processed.'
      case 'CLOSED':
        return 'Close this expense. No further changes will be allowed.'
      default:
        return `Change status to ${statusConfig[toStatus as keyof typeof statusConfig].label}.`
    }
  }

  const CurrentIcon = currentConfig.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Workflow Status</span>
          <Badge variant="outline" className="ml-2">
            <CurrentIcon className="h-3 w-3 mr-1" />
            {currentConfig.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status Display */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className={`p-2 rounded-full ${currentConfig.color} text-white`}>
            <CurrentIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{currentConfig.label}</p>
            <p className="text-sm text-gray-600">{currentConfig.description}</p>
          </div>
        </div>

        {/* Available Transitions */}
        {nextStates.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Available Actions:</Label>
            <div className="space-y-2">
              {nextStates.map(nextStatus => {
                const NextIcon =
                  statusConfig[nextStatus as keyof typeof statusConfig].icon
                return (
                  <Dialog
                    key={nextStatus}
                    open={isDialogOpen && selectedTransition === nextStatus}
                    onOpenChange={open => {
                      if (!open) {
                        setIsDialogOpen(false)
                        setSelectedTransition(null)
                        setNotes('')
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleTransitionClick(nextStatus)}
                        disabled={isLoading}
                      >
                        <NextIcon className="h-4 w-4 mr-2" />
                        {getTransitionLabel(currentStatus, nextStatus)}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {getTransitionLabel(currentStatus, nextStatus)}
                        </DialogTitle>
                        <DialogDescription>
                          {getTransitionDescription(nextStatus)}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CurrentIcon className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">
                              {currentConfig.label}
                            </span>
                          </div>
                          <span className="text-gray-400">→</span>
                          <div className="flex items-center space-x-2">
                            <NextIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">
                              {
                                statusConfig[
                                  nextStatus as keyof typeof statusConfig
                                ].label
                              }
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes (Optional)</Label>
                          <Input
                            id="notes"
                            placeholder="Add any notes about this status change..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleConfirmTransition}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Processing...' : 'Confirm'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )
              })}
            </div>
          </div>
        )}

        {nextStates.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Archive className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">
              This expense is complete. No further actions available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

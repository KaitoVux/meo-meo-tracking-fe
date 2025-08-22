import {
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
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
import { useAuthStore } from '@/store/auth'

interface ApprovalInterfaceProps {
  expense: Expense
  onApprove: (notes?: string) => Promise<void>
  onReject: (notes: string) => Promise<void>
  isLoading?: boolean
}

export function ApprovalInterface({
  expense,
  onApprove,
  onReject,
  isLoading = false,
}: ApprovalInterfaceProps) {
  const { user } = useAuthStore()
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionNotes, setRejectionNotes] = useState('')
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)

  // Check if user has approval permissions (e.g., is an accountant)
  const canApprove =
    user?.role === 'ACCOUNTANT' && expense.status === 'SUBMITTED'

  const handleApprove = async () => {
    try {
      await onApprove(approvalNotes || undefined)
      setShowApprovalDialog(false)
      setApprovalNotes('')
    } catch (error) {
      console.error('Failed to approve expense:', error)
    }
  }

  const handleReject = async () => {
    if (!rejectionNotes.trim()) {
      return // Rejection notes are required
    }

    try {
      await onReject(rejectionNotes)
      setShowRejectionDialog(false)
      setRejectionNotes('')
    } catch (error) {
      console.error('Failed to reject expense:', error)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (!canApprove) {
    return null // Don't show approval interface if user can't approve
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span>Approval Required</span>
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Pending Review
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expense Summary for Review */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
          <div>
            <Label className="text-sm font-medium text-gray-500">Amount</Label>
            <p className="text-lg font-semibold">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Vendor</Label>
            <p className="font-medium">
              {typeof expense.vendor === 'string'
                ? expense.vendor
                : expense.vendor?.name || 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">
              Category
            </Label>
            <p>{expense.category}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">
              Submitter
            </Label>
            <p>
              {expense.submitter.firstName} {expense.submitter.lastName}
            </p>
          </div>
          <div className="md:col-span-2">
            <Label className="text-sm font-medium text-gray-500">
              Description
            </Label>
            <p>{expense.description}</p>
          </div>
        </div>

        {/* Approval Actions */}
        <div className="flex space-x-3">
          {/* Approve Dialog */}
          <Dialog
            open={showApprovalDialog}
            onOpenChange={setShowApprovalDialog}
          >
            <DialogTrigger asChild>
              <Button className="flex-1" disabled={isLoading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Expense</DialogTitle>
                <DialogDescription>
                  You are about to approve this expense for payment processing.
                  This action will move the expense to &quot;Approved&quot;
                  status.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      Approval Summary
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Amount: {formatCurrency(expense.amount, expense.currency)} •
                    Vendor:{' '}
                    {typeof expense.vendor === 'string'
                      ? expense.vendor
                      : expense.vendor?.name || 'N/A'}{' '}
                    • Category: {expense.category}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approval-notes">
                    Approval Notes (Optional)
                  </Label>
                  <Input
                    id="approval-notes"
                    placeholder="Add any notes about this approval..."
                    value={approvalNotes}
                    onChange={e => setApprovalNotes(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalDialog(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleApprove} disabled={isLoading}>
                  {isLoading ? 'Approving...' : 'Confirm Approval'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reject Dialog */}
          <Dialog
            open={showRejectionDialog}
            onOpenChange={setShowRejectionDialog}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1" disabled={isLoading}>
                <XCircle className="h-4 w-4 mr-2" />
                Return to Draft
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Return Expense to Draft</DialogTitle>
                <DialogDescription>
                  You are about to return this expense to draft status. Please
                  provide a reason for the submitter to understand what needs to
                  be changed.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">
                      Return to Draft
                    </span>
                  </div>
                  <p className="text-sm text-red-700">
                    This expense will be returned to the submitter for
                    modifications.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rejection-notes">
                    Reason for Return (Required)
                  </Label>
                  <Input
                    id="rejection-notes"
                    placeholder="Please explain what needs to be changed..."
                    value={rejectionNotes}
                    onChange={e => setRejectionNotes(e.target.value)}
                    required
                  />
                  {rejectionNotes.trim() === '' && (
                    <p className="text-sm text-red-600">
                      Please provide a reason for returning this expense.
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectionDialog(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isLoading || !rejectionNotes.trim()}
                >
                  {isLoading ? 'Processing...' : 'Return to Draft'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Review Checklist */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">Review Checklist</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Verify expense amount and currency</li>
            <li>• Check vendor information and receipt</li>
            <li>• Confirm expense category is appropriate</li>
            <li>• Review business justification in description</li>
            <li>• Ensure all required fields are completed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

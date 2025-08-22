import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  CreditCard,
} from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  WorkflowVisualization,
  WorkflowStatusTransition,
  WorkflowHistory,
  ApprovalInterface,
} from '@/components/workflow'
import { type Expense } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface ExpenseDetailProps {
  expense: Expense
  onBack: () => void
  onEdit: () => void
  onStatusChange?: (status: string, notes?: string) => void
}

const statusColors = {
  DRAFT: 'secondary',
  SUBMITTED: 'default',
  APPROVED: 'default',
  PAID: 'default',
  CLOSED: 'secondary',
} as const

const statusLabels = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  PAID: 'Paid',
  CLOSED: 'Closed',
}

export function ExpenseDetail({
  expense,
  onBack,
  onEdit,
  onStatusChange,
}: ExpenseDetailProps) {
  const { user } = useAuthStore()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const handleStatusChange = async (newStatus: string, notes?: string) => {
    if (!onStatusChange) return

    try {
      setIsUpdatingStatus(true)
      await onStatusChange(newStatus, notes)
    } catch (error) {
      console.error('Failed to update status:', error)
      throw error
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleApprove = async (notes?: string) => {
    await handleStatusChange('APPROVED', notes)
  }

  const handleReject = async (notes: string) => {
    await handleStatusChange('DRAFT', notes)
  }
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Workflow Visualization */}
      <WorkflowVisualization expense={expense} />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Expense Details</h1>
            <p className="text-gray-500">Payment ID: {expense.paymentId}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onEdit}>
            Edit Expense
          </Button>
          <WorkflowStatusTransition
            expense={expense}
            onStatusChange={handleStatusChange}
            isLoading={isUpdatingStatus}
          />
        </div>
      </div>

      {/* Approval Interface - Show if expense needs approval */}
      {expense.status === 'SUBMITTED' && user?.role === 'ACCOUNTANT' && (
        <ApprovalInterface
          expense={expense}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={isUpdatingStatus}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Expense Information
                <Badge variant={statusColors[expense.status]}>
                  {statusLabels[expense.status]}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Date
                  </span>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatDate(expense.transactionDate)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Vendor
                  </span>
                  <p className="mt-1 font-medium">
                    {typeof expense.vendor === 'string'
                      ? expense.vendor
                      : expense.vendor?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Category
                  </span>
                  <p className="mt-1">{expense.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Amount
                  </span>
                  <p className="mt-1 text-lg font-semibold">
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Payment Method
                  </span>
                  <div className="flex items-center mt-1">
                    <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {expense.paymentMethod === 'CASH'
                        ? 'Cash'
                        : 'Bank Transfer'}
                    </span>
                  </div>
                </div>
                {expense.exchangeRate && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Exchange Rate
                    </span>
                    <p className="mt-1">{expense.exchangeRate}</p>
                  </div>
                )}
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">
                  Description
                </span>
                <p className="mt-1">{expense.description}</p>
              </div>

              {expense.projectCostCenter && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Project/Cost Center
                  </span>
                  <p className="mt-1">{expense.projectCostCenter}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice File */}
          {expense.invoiceFile && (
            <Card>
              <CardHeader>
                <CardTitle>Attached Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">
                        {expense.invoiceFile.originalName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(expense.invoiceFile.size)} •{' '}
                        {expense.invoiceFile.mimeType}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitter Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {expense.submitter.firstName} {expense.submitter.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {expense.submitter.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Created
                </span>
                <p className="text-sm">{formatDate(expense.createdAt)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Last Updated
                </span>
                <p className="text-sm">{formatDate(expense.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Workflow History */}
          <WorkflowHistory expense={expense} />
        </div>
      </div>
    </div>
  )
}

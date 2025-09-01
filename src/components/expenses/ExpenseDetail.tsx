import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Download,
  FileText,
  User,
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ApprovalInterface,
  WorkflowStatusTransition,
  WorkflowVisualization,
} from '@/components/workflow'
import { type Expense } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface ExpenseDetailProps {
  expense: Expense
  onBack: () => void
  onEdit: () => void
  onStatusChange?: (status: string, notes?: string) => void
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
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <button
          onClick={onBack}
          className="hover:text-gray-700 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Expenses
        </button>
        <span>/</span>
        <span className="text-gray-700">Payment #{expense.paymentId}</span>
      </div>

      {/* PRIMARY CARD: Workflow Status & Actions */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Workflow Status</CardTitle>
            <Button variant="outline" onClick={onEdit}>
              Edit Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Visualization */}
          <WorkflowVisualization expense={expense} />

          {/* Approval Interface - Show if expense neStatapproval */}
          {expense.status === 'SUBMITTED' && user?.role === 'ACCOUNTANT' && (
            <div className="mt-4 pt-4 border-t">
              <ApprovalInterface
                expense={expense}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={isUpdatingStatus}
              />
            </div>
          )}

          {/* Available Actions */}
          <div className="flex gap-4 pt-2 border-t items-stretch">
            <WorkflowStatusTransition
              expense={expense}
              onStatusChange={handleStatusChange}
              isLoading={isUpdatingStatus}
              className="flex-1 flex flex-col"
            />
            {/* Amount & Payment Details */}
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle>Amount & Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Total Amount
                  </span>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                </div>

                {expense.vatPercentage && expense.vatAmount && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Amount before VAT</span>
                      <span>
                        {formatCurrency(
                          expense.amountBeforeVAT,
                          expense.currency
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        VAT ({expense.vatPercentage}%)
                      </span>
                      <span>
                        {formatCurrency(expense.vatAmount, expense.currency)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">
                      Payment Method
                    </span>
                  </div>
                  <p className="font-medium">
                    {expense.paymentMethod === 'CASH'
                      ? 'Cash'
                      : 'Bank Transfer'}
                  </p>
                </div>

                {expense.exchangeRate && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Exchange Rate
                    </span>
                    <p className="mt-1 font-mono">
                      {expense.currency === 'VND'
                        ? 'USD → VND: '
                        : 'VND → USD: '}
                      {expense.exchangeRate.toLocaleString('en-US', {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 6,
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Expense Details */}
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle>Expense Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">
                      Transaction Date
                    </span>
                  </div>
                  <p className="font-medium">
                    {formatDate(expense.transactionDate)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">
                      Vendor
                    </span>
                  </div>
                  <p className="font-medium">{expense.vendor?.name || 'N/A'}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Category
                  </span>
                  <p className="mt-1 font-medium">
                    {expense.categoryEntity?.name || expense.category}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Description
                  </span>
                  <p className="mt-1 text-gray-700">{expense.description}</p>
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
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sidebar: Supporting Information */}
        <div className="space-y-4">
          {/* Consolidated Expense Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Expense Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-xs text-gray-500">
                      SUBMITTER
                    </p>
                    <p className="font-medium">
                      {expense.submitter?.firstName &&
                      expense.submitter?.lastName
                        ? `${expense.submitter.firstName} ${expense.submitter.lastName}`
                        : expense.submitter?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {expense.submitter?.email || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-xs text-gray-500">CREATED</p>
                    <p className="font-medium">
                      {formatDate(expense.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Updated: {formatDate(expense.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {expense.invoiceFile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {expense.invoiceFile.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(expense.invoiceFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compact Workflow Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Workflow Timeline
                <Badge className="text-xs">2 events</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Draft → Submitted</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Aug 30, 07:46 PM
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Expense created</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Aug 29, 09:46 AM
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

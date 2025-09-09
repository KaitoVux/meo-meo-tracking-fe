import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  User,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkflowVisualization, WorkflowHistory } from '@/components/workflow'
import { type Expense } from '@/lib/api'
import { useAvailableTransitionsQuery } from '@/lib/queries/expenses'

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
  const { data: transitionsResponse } = useAvailableTransitionsQuery(expense.id)
  const availableTransitions = transitionsResponse?.data || []

  const handleStatusChange = async (newStatus: string, notes?: string) => {
    if (!onStatusChange) return

    try {
      await onStatusChange(newStatus, notes)
    } catch (error) {
      console.error('Failed to update status:', error)
      throw error
    }
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
          <WorkflowVisualization
            expense={expense}
            onStatusChange={handleStatusChange}
            availableTransitions={availableTransitions}
          />

          {/* Approval interface removed - no longer needed with simplified workflow */}

          {/* Three Cards Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
            {/* Amount & Payment Details */}
            <Card className="flex flex-col">
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
                    {expense.paymentMethod === 'BANK_TRANSFER'
                      ? 'Bank Transfer'
                      : expense.paymentMethod === 'PETTY_CASH'
                        ? 'Petty Cash'
                        : 'Credit Card'}
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
            <Card className="flex flex-col">
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

                {expense.invoiceLink && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Invoice Link
                    </span>
                    <div className="mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto p-2 text-left justify-start"
                        onClick={() =>
                          window.open(expense.invoiceLink, '_blank')
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-blue-600 hover:text-blue-800 truncate">
                          {expense.invoiceLink}
                        </span>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workflow Timeline Card */}
            <WorkflowHistory expense={expense} />
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
        </div>
      </div>
    </div>
  )
}

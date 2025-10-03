import { Search, Users, Clock, CheckCircle, DollarSign } from 'lucide-react'
import React, { useState, useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { WorkflowVisualization } from '@/components/workflow'
import { type ExpenseQueryParams } from '@/lib/api'
import {
  useAvailableTransitionsQuery,
  useExpensesQuery,
  useUpdateExpenseStatusMutation,
} from '@/lib/queries/expenses'

interface WorkflowStats {
  pending: number
  approved: number
  paid: number
  total: number
}

export function WorkflowPage() {
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  )

  const [filters, setFilters] = useState<ExpenseQueryParams>({
    page: 1,
    limit: 25,
    status: undefined,
  })

  // Use React Query to fetch expenses
  const { data: expensesResponse, isLoading: loading } =
    useExpensesQuery(filters)

  // Memoize expenses array to prevent unnecessary re-renders
  const expenses = useMemo(
    () => expensesResponse?.data ?? [],
    [expensesResponse?.data]
  )

  // Get selected expense from the list (synced with cache)
  const selectedExpense = useMemo(
    () => expenses.find(e => e.id === selectedExpenseId) || null,
    [expenses, selectedExpenseId]
  )

  // Get available transitions for selected expense
  const { data: transitionsResponse } = useAvailableTransitionsQuery(
    selectedExpenseId || ''
  )
  const availableTransitions = transitionsResponse?.data || []

  // Calculate stats from expenses
  const stats = useMemo(() => {
    return expenses.reduce(
      (acc, expense) => {
        acc.total++
        if (expense.status === 'IN_PROGRESS') acc.pending++
        if (expense.status === 'ON_HOLD') acc.approved++
        if (expense.status === 'PAID') acc.paid++
        return acc
      },
      { pending: 0, approved: 0, paid: 0, total: 0 } as WorkflowStats
    )
  }, [expenses])

  // Use React Query mutation for status updates
  const updateStatusMutation = useUpdateExpenseStatusMutation()

  const handleStatusChange = async (
    expenseId: string,
    status: string,
    notes?: string
  ) => {
    // Prevent concurrent mutations
    if (updateStatusMutation.isPending) return

    try {
      await updateStatusMutation.mutateAsync({ id: expenseId, status, notes })
      // React Query automatically invalidates and refetches:
      // - expense detail
      // - status history
      // - expense lists
      // - available transitions
    } catch (error) {
      console.error('Failed to update expense status:', error)
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
      month: 'short',
      day: 'numeric',
    })
  }

  const statusColors = {
    DRAFT: 'secondary',
    IN_PROGRESS: 'default',
    PAID: 'default',
    ON_HOLD: 'destructive',
  } as const

  const statusLabels = {
    DRAFT: 'Draft',
    IN_PROGRESS: 'In Progress',
    PAID: 'Paid',
    ON_HOLD: 'On Hold',
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflow Management</h1>
          <p className="text-gray-600">Manage your expense workflow status</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">On Hold</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Workflow</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search expenses..."
                className="pl-10"
                onChange={e =>
                  setFilters(prev => ({
                    ...prev,
                    search: e.target.value,
                    page: 1,
                  }))
                }
              />
            </div>
            <Select
              onValueChange={value =>
                setFilters(prev => ({
                  ...prev,
                  status: value === 'all' ? undefined : value,
                  page: 1,
                }))
              }
              defaultValue={filters.status || 'all'}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No expenses found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Expense Detail */}
              {selectedExpense && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">
                        Selected Expense: {selectedExpense.paymentId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {typeof selectedExpense.vendor === 'string'
                          ? selectedExpense.vendor
                          : selectedExpense.vendor?.name || 'N/A'}{' '}
                        •{' '}
                        {formatCurrency(
                          selectedExpense.amount,
                          selectedExpense.currency
                        )}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedExpenseId(null)}
                    >
                      Close
                    </Button>
                  </div>

                  <WorkflowVisualization
                    expense={selectedExpense}
                    onStatusChange={(status, notes) =>
                      handleStatusChange(selectedExpense.id, status, notes)
                    }
                    availableTransitions={availableTransitions}
                    isUpdating={updateStatusMutation.isPending}
                  />
                </div>
              )}

              {/* Expenses Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitter</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map(expense => (
                    <TableRow
                      key={expense.id}
                      className={
                        selectedExpenseId === expense.id ? 'bg-blue-50' : ''
                      }
                    >
                      <TableCell className="font-medium">
                        {expense.paymentId}
                        {expense.subId && (
                          <span className="text-gray-500">
                            -{expense.subId}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(expense.transactionDate)}
                      </TableCell>
                      <TableCell>
                        {typeof expense.vendor === 'string'
                          ? expense.vendor
                          : expense.vendor?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(expense.amount, expense.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[expense.status]}>
                          {statusLabels[expense.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {expense.submitter?.firstName &&
                        expense.submitter?.lastName
                          ? `${expense.submitter.firstName} ${expense.submitter.lastName}`
                          : expense.submitter?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedExpenseId(expense.id)}
                        >
                          {selectedExpenseId === expense.id
                            ? 'Selected'
                            : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

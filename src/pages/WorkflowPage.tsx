import { Search, Users, Clock, CheckCircle, DollarSign } from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'

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
import { WorkflowVisualization, ApprovalInterface } from '@/components/workflow'
import { apiClient, type Expense, type ExpenseQueryParams } from '@/lib/api'
import { useAvailableTransitionsQuery } from '@/lib/queries/expenses'
import { useAuthStore } from '@/store/auth'

interface WorkflowStats {
  pending: number
  approved: number
  paid: number
  total: number
}

export function WorkflowPage() {
  const { user } = useAuthStore()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)

  // Get available transitions for selected expense
  const { data: transitionsResponse } = useAvailableTransitionsQuery(
    selectedExpense?.id || ''
  )
  const availableTransitions = transitionsResponse?.data || []
  const [stats, setStats] = useState<WorkflowStats>({
    pending: 0,
    approved: 0,
    paid: 0,
    total: 0,
  })
  const [filters, setFilters] = useState<ExpenseQueryParams>({
    page: 1,
    limit: 25,
    status: undefined, // No role-based filtering needed
  })

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.getExpenses(filters)
      setExpenses(response.data || [])

      // Calculate stats
      const newStats = (response.data || []).reduce(
        (acc, expense) => {
          acc.total++
          if (expense.status === 'IN_PROGRESS') acc.pending++
          if (expense.status === 'ON_HOLD') acc.approved++
          if (expense.status === 'PAID') acc.paid++
          return acc
        },
        { pending: 0, approved: 0, paid: 0, total: 0 } as WorkflowStats
      )

      setStats(newStats)
    } catch (error) {
      console.error('Failed to load expenses:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadExpenses()
  }, [filters, loadExpenses])

  const handleStatusChange = async (
    expenseId: string,
    status: string,
    notes?: string
  ) => {
    try {
      await apiClient.updateExpenseStatus(expenseId, status, notes)
      await loadExpenses() // Refresh the list
      if (selectedExpense?.id === expenseId) {
        // Update selected expense
        const updatedExpense = {
          ...selectedExpense,
          status: status as Expense['status'],
        }
        setSelectedExpense(updatedExpense)
      }
    } catch (error) {
      console.error('Failed to update expense status:', error)
      throw error
    }
  }

  const handleApprove = async (expense: Expense, notes?: string) => {
    await handleStatusChange(expense.id, 'PAID', notes || '')
  }

  const handleReject = async (expense: Expense, notes: string) => {
    await handleStatusChange(expense.id, 'DRAFT', notes)
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
                      onClick={() => setSelectedExpense(null)}
                    >
                      Close
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <WorkflowVisualization
                      expense={selectedExpense}
                      onStatusChange={(status, notes) =>
                        handleStatusChange(selectedExpense.id, status, notes)
                      }
                      availableTransitions={availableTransitions}
                    />

                    {selectedExpense.status !== 'PAID' &&
                      user?.role === 'ACCOUNTANT' && (
                        <ApprovalInterface
                          expense={selectedExpense}
                          onApprove={notes =>
                            handleApprove(selectedExpense, notes)
                          }
                          onReject={notes =>
                            handleReject(selectedExpense, notes)
                          }
                        />
                      )}
                  </div>
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
                        selectedExpense?.id === expense.id ? 'bg-blue-50' : ''
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
                          onClick={() => setSelectedExpense(expense)}
                        >
                          {selectedExpense?.id === expense.id
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

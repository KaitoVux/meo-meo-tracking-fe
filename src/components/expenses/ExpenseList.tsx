import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

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
import { useCategoriesQuery } from '@/hooks/useCategories'
import { useExpensesQuery } from '@/hooks/useExpenses'
import type { Expense, ExpenseQueryParams } from '@/lib/api'

interface ExpenseListProps {
  onCreateExpense: () => void
  onEditExpense: (expense: Expense) => void
  onViewExpense: (expense: Expense) => void
  onDeleteExpense: (expense: Expense) => void
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

export function ExpenseList({
  onCreateExpense,
  onEditExpense,
  onViewExpense,
  onDeleteExpense,
}: ExpenseListProps) {
  const [filters, setFilters] = useState<ExpenseQueryParams>({
    page: 1,
    limit: 25,
  })

  // TanStack Query hooks - much simpler than manual state management!
  const {
    data: expensesResponse,
    isLoading,
    error,
    refetch,
  } = useExpensesQuery(filters)

  const { data: categoriesResponse } = useCategoriesQuery()

  // Extract data with fallbacks
  const expenses = expensesResponse?.data || []
  const pagination = expensesResponse?.pagination || {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  }
  const categories = categoriesResponse?.data || []

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status,
      page: 1,
    }))
  }

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: category === 'all' ? undefined : category,
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Button onClick={onCreateExpense}>
          <Plus className="h-4 w-4 mr-2" />
          Create Expense
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Management</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search expenses..."
                className="pl-10"
                onChange={e => handleSearch(e.target.value)}
              />
            </div>
            <Select onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading expenses...</div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">
                Error loading expenses: {error.message}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No expenses found. Create your first expense to get started.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Transaction Date</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount Before VAT</TableHead>
                    <TableHead>VAT</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitter</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map(expense => (
                    <TableRow key={expense.id}>
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
                      <TableCell>{expense.expenseMonth}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            expense.type === 'IN' ? 'default' : 'secondary'
                          }
                        >
                          {expense.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {typeof expense.vendor === 'string'
                          ? expense.vendor
                          : expense.vendor?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>
                        {formatCurrency(
                          expense.amountBeforeVAT,
                          expense.currency
                        )}
                      </TableCell>
                      <TableCell>
                        {expense.vatAmount ? (
                          <div className="text-sm">
                            <div>
                              {formatCurrency(
                                expense.vatAmount,
                                expense.currency
                              )}
                            </div>
                            {expense.vatPercentage && (
                              <div className="text-gray-500">
                                ({expense.vatPercentage}%)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(expense.amount, expense.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[expense.status]}>
                          {statusLabels[expense.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {expense.submitter.firstName}{' '}
                        {expense.submitter.lastName}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewExpense(expense)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditExpense(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteExpense(expense)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{' '}
                  of {pagination.total} expenses
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

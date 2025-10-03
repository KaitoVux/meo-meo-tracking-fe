import { format } from 'date-fns'
import { FileText, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useReportQuery } from '@/hooks/useReports'
import { ExpenseStatus, type Currency } from '@/lib/api'
import { getStatusLabel, getStatusVariant } from '@/lib/formatters'
import { formatCurrency } from '@/lib/utils'

interface ReportPreviewProps {
  filters: {
    dateFrom?: Date
    dateTo?: Date
    categories: string[]
    vendors: string[]
    statuses: ExpenseStatus[]
    currency?: Currency
    groupBy?: 'month' | 'category' | 'vendor' | 'status'
    sortBy?: 'date' | 'amount' | 'category' | 'vendor' | 'status'
    sortOrder?: 'ASC' | 'DESC'
    totalCategories?: number
    totalVendors?: number
  }
}

export function ReportPreview({ filters }: ReportPreviewProps) {
  const { data: reportData, isLoading } = useReportQuery(filters)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!reportData?.data) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No data found for the selected filters
          </p>
        </CardContent>
      </Card>
    )
  }

  const { summary, groupedData, expenses } = reportData.data

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Expense Report
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {filters.dateFrom && filters.dateTo && (
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {format(filters.dateFrom, 'MMM dd, yyyy')} -{' '}
                {format(filters.dateTo, 'MMM dd, yyyy')}
              </Badge>
            )}
            <Badge variant="outline">
              <FileText className="h-3 w-3 mr-1" />
              {expenses?.length || 0} expenses
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary?.totalAmount || 0, 'VND')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold">
                  {summary?.totalExpenses || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Average Amount
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    summary?.totalExpenses
                      ? summary.totalAmount / summary.totalExpenses
                      : 0,
                    'VND'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Categories
                </p>
                <p className="text-2xl font-bold">{groupedData?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Data Display */}
      {groupedData && filters.groupBy && (
        <Card>
          <CardHeader>
            <CardTitle>Results by {filters.groupBy}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="capitalize">
                    {filters.groupBy}
                  </TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedData?.map(data => (
                  <TableRow key={data.group}>
                    <TableCell className="font-medium">{data.group}</TableCell>
                    <TableCell className="text-right">{data.count}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(data.amount, 'VND')}
                    </TableCell>
                    <TableCell className="text-right">
                      {(
                        (data.amount / (summary?.totalAmount || 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detailed Expense List */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses?.map((expense: any) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {(() => {
                        if (!expense.transactionDate) return 'N/A'
                        const date = new Date(expense.transactionDate)
                        return isNaN(date.getTime())
                          ? 'Invalid Date'
                          : format(date, 'MMM dd, yyyy')
                      })()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {expense.paymentId}
                    </TableCell>
                    <TableCell>{expense.vendor?.name || 'N/A'}</TableCell>
                    <TableCell>{expense.category || 'N/A'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {expense.description}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(expense.amount, expense.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(expense.status)}>
                        {getStatusLabel(expense.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!expenses || expenses.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No expenses found matching the selected filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

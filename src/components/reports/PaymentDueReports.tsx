import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import {
  CalendarDays,
  Clock,
  DollarSign,
  AlertTriangle,
  Download,
} from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePaymentDueReportsQuery } from '@/hooks/useReports'
import { ExpenseStatus } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface PaymentItem {
  id: string
  paymentId: string
  vendor: {
    name: string
  }
  amount: number
  currency: string
  date: string
  dueDate: string
  status: ExpenseStatus
  description: string
  daysPastDue?: number
}

export function PaymentDueReports() {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly'>(
    'weekly'
  )

  const { data: weeklyData, isLoading: weeklyLoading } =
    usePaymentDueReportsQuery('weekly')

  const { data: monthlyData, isLoading: monthlyLoading } =
    usePaymentDueReportsQuery('monthly')

  const { data: overdueData, isLoading: overdueLoading } =
    usePaymentDueReportsQuery('overdue')

  const currentWeekStart = startOfWeek(new Date())
  const currentWeekEnd = endOfWeek(new Date())
  const currentMonthStart = startOfMonth(new Date())
  const currentMonthEnd = endOfMonth(new Date())

  const weeklyPayments = weeklyData?.data || []
  const monthlyPayments = monthlyData?.data || []
  const overduePayments = overdueData?.data || []

  const weeklyTotal = weeklyPayments.reduce(
    (sum: number, payment: PaymentItem) => sum + payment.amount,
    0
  )
  const monthlyTotal = monthlyPayments.reduce(
    (sum: number, payment: PaymentItem) => sum + payment.amount,
    0
  )
  const overdueTotal = overduePayments.reduce(
    (sum: number, payment: PaymentItem) => sum + payment.amount,
    0
  )

  const handleExportPayments = (period: 'weekly' | 'monthly' | 'overdue') => {
    // This would typically trigger an export API call
    console.log(`Exporting ${period} payments report`)
  }

  const PaymentTable = ({
    payments,
    isLoading,
    title,
    period,
  }: {
    payments: PaymentItem[]
    isLoading: boolean
    title: string
    period: 'weekly' | 'monthly' | 'overdue'
  }) => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {title}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportPayments(period)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments due for this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Amount
                        </p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(
                            payments.reduce((sum, p) => sum + p.amount, 0),
                            payments[0]?.currency || 'VND'
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Items
                        </p>
                        <p className="text-lg font-semibold">
                          {payments.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {period === 'overdue' && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Avg Days Overdue
                          </p>
                          <p className="text-lg font-semibold text-destructive">
                            {Math.round(
                              payments.reduce(
                                (sum, p) => sum + (p.daysPastDue || 0),
                                0
                              ) / payments.length
                            )}{' '}
                            days
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Payments Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      {period === 'overdue' && (
                        <TableHead className="text-right">
                          Days Overdue
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.paymentId}
                        </TableCell>
                        <TableCell>
                          {payment.vendor?.name || 'Unknown Vendor'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {payment.description}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            {payment.dueDate &&
                            !isNaN(new Date(payment.dueDate).getTime())
                              ? format(
                                  new Date(payment.dueDate),
                                  'MMM dd, yyyy'
                                )
                              : 'No due date'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === ExpenseStatus.APPROVED
                                ? 'default'
                                : payment.status === ExpenseStatus.SUBMITTED
                                  ? 'secondary'
                                  : payment.status === ExpenseStatus.PAID
                                    ? 'outline'
                                    : 'destructive'
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        {period === 'overdue' && (
                          <TableCell className="text-right">
                            <Badge variant="destructive">
                              {payment.daysPastDue} days
                            </Badge>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  This Week
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(weeklyTotal, 'VND')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(currentWeekStart, 'MMM dd')} -{' '}
                  {format(currentWeekEnd, 'MMM dd')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  This Month
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(monthlyTotal, 'VND')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(currentMonthStart, 'MMM dd')} -{' '}
                  {format(currentMonthEnd, 'MMM dd')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(overdueTotal, 'VND')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {overduePayments.length} payments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Due Tables */}
      <Tabs
        value={selectedPeriod}
        onValueChange={value =>
          setSelectedPeriod(value as 'weekly' | 'monthly')
        }
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <PaymentTable
            payments={weeklyPayments}
            isLoading={weeklyLoading}
            title={`Payments Due This Week (${format(currentWeekStart, 'MMM dd')} - ${format(currentWeekEnd, 'MMM dd')})`}
            period="weekly"
          />
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <PaymentTable
            payments={monthlyPayments}
            isLoading={monthlyLoading}
            title={`Payments Due This Month (${format(currentMonthStart, 'MMM yyyy')})`}
            period="monthly"
          />
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <PaymentTable
            payments={overduePayments}
            isLoading={overdueLoading}
            title="Overdue Payments"
            period="overdue"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

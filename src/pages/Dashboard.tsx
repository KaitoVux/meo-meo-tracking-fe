import { format, subMonths } from 'date-fns'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  Clock,
  Calendar,
  Filter,
} from 'lucide-react'
import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategoriesQuery } from '@/hooks/useCategories'
import { useVendorsQuery } from '@/hooks/useVendors'
import { useDashboardStatsQuery } from '@/lib/queries/dashboard'

// Chart colors for consistent theming
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

interface DashboardFilters {
  month?: Date
  category?: string
  vendor?: string
}

export function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    month: new Date(),
  })

  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useDashboardStatsQuery()
  const { data: categoriesData } = useCategoriesQuery()
  const { data: vendorsData } = useVendorsQuery({ status: 'ACTIVE' })

  // Process dashboard data
  const stats = useMemo(() => {
    if (!dashboardData?.data) {
      return {
        totalExpenses: 0,
        totalAmount: 0,
        monthlyExpenses: 0,
        monthlyAmount: 0,
        pendingApprovals: 0,
        expensesByStatus: {},
        expensesByCategory: [],
        recentExpenses: [],
      }
    }
    return dashboardData.data
  }, [dashboardData])

  // Calculate percentage changes (mock data for now)
  const monthlyChange = useMemo(() => {
    const currentMonth = stats.monthlyAmount
    const previousMonth = currentMonth * 0.8 // Mock previous month data
    const change = ((currentMonth - previousMonth) / previousMonth) * 100
    return {
      value: change,
      isPositive: change > 0,
    }
  }, [stats.monthlyAmount])

  // Prepare chart data
  const categoryChartData = useMemo(() => {
    return (stats.expensesByCategory || []).map((item, index) => ({
      ...item,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }))
  }, [stats.expensesByCategory])

  const statusChartData = useMemo(() => {
    return Object.entries(stats.expensesByStatus || {}).map(
      ([status, count], index) => ({
        status,
        count,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      })
    )
  }, [stats.expensesByStatus])

  // Mock trend data for line chart
  const trendData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      months.push({
        month: format(date, 'MMM'),
        amount: Math.floor(Math.random() * 50000) + 10000,
        expenses: Math.floor(Math.random() * 100) + 20,
      })
    }
    return months
  }, [])

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ month: new Date() })
  }

  if (isDashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business expenses and key metrics
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <DatePicker
            date={filters.month}
            onDateChange={date => handleFilterChange('month', date)}
            placeholder="Select month"
            className="w-[200px]"
          />

          <Select
            value={filters.category}
            onValueChange={value => handleFilterChange('category', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesData?.data?.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.vendor}
            onValueChange={value => handleFilterChange('vendor', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendorsData?.data?.map((vendor: any) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filters.category || filters.vendor) && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalExpenses} total transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.monthlyAmount || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              {monthlyChange.isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(monthlyChange.value).toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Requires your attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Vendors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendorsData?.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Vendors this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Expense Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Trends</CardTitle>
            <CardDescription>Monthly expense amounts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`,
                    name === 'amount' ? 'Amount' : 'Expenses',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>
              Distribution of expenses across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Status</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Latest expense submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-4">
                {stats.recentExpenses.length > 0 ? (
                  stats.recentExpenses.map((expense: any) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {expense.submitter?.firstName?.[0] || 'U'}
                            {expense.submitter?.lastName?.[0] || 'N'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {expense.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {expense.vendor?.name || 'N/A'} •{' '}
                            {format(new Date(expense.createdAt), 'MMM dd')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          ${expense.amount.toLocaleString()}
                        </p>
                        <Badge
                          variant={
                            expense.status === 'IN_PROGRESS'
                              ? 'default'
                              : expense.status === 'PAID'
                                ? 'secondary'
                                : expense.status === 'DRAFT'
                                  ? 'outline'
                                  : 'destructive'
                          }
                          className="text-xs"
                        >
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No recent expenses
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Add New Expense
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage Vendors
            </Button>
            <Button variant="outline" className="justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Review Approvals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

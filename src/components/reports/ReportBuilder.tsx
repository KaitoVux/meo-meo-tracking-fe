import { format } from 'date-fns'
import { Download, Eye, Filter } from 'lucide-react'
import React, { useState } from 'react'

import { ReportPreview } from './ReportPreview'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useCategoriesQuery } from '@/hooks/useCategories'
import { useReportGeneration } from '@/hooks/useReports'
import { useVendorsQuery } from '@/hooks/useVendors'
import { ExpenseStatus, type Currency, type PaymentMethod } from '@/lib/api'

interface ReportFilters {
  dateFrom?: Date
  dateTo?: Date
  categories: string[]
  vendors: string[]
  statuses: ExpenseStatus[]
  currency?: Currency
  paymentMethod?: PaymentMethod
  submitterId?: string
  groupBy?: 'month' | 'category' | 'vendor' | 'status'
  sortBy?: 'date' | 'amount' | 'category' | 'vendor' | 'status'
  sortOrder?: 'ASC' | 'DESC'
}

export function ReportBuilder() {
  const [filters, setFilters] = useState<ReportFilters>({
    categories: [],
    vendors: [],
    statuses: [],
    sortOrder: 'DESC',
    sortBy: 'date',
  })
  const [showPreview, setShowPreview] = useState(false)

  const { data: categories } = useCategoriesQuery()
  const { data: vendors } = useVendorsQuery({ status: 'ACTIVE' })
  const { generateReport, exportReport, isGenerating, isExporting } =
    useReportGeneration()

  const handleFilterChange = <K extends keyof ReportFilters>(
    key: K,
    value: ReportFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleArrayFilterChange = <
    K extends keyof Pick<ReportFilters, 'categories' | 'vendors' | 'statuses'>,
  >(
    key: K,
    value: string,
    checked: boolean
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked
        ? [...(prev[key] as string[]), value]
        : (prev[key] as string[]).filter(item => item !== value),
    }))
  }

  const handleGenerateReport = async () => {
    const reportData = await generateReport(filters)
    if (reportData) {
      setShowPreview(true)
    }
  }

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    await exportReport({ ...filters, format, reportType: 'expense_report' })
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      vendors: [],
      statuses: [],
      sortOrder: 'DESC',
      sortBy: 'date',
    })
    setShowPreview(false)
  }

  const hasFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.categories.length > 0 ||
    filters.vendors.length > 0 ||
    filters.statuses.length > 0

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <DatePicker
                date={filters.dateFrom}
                onDateChange={date => handleFilterChange('dateFrom', date)}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <DatePicker
                date={filters.dateTo}
                onDateChange={date => handleFilterChange('dateTo', date)}
                placeholder="Select end date"
              />
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div className="space-y-3">
            <Label>Categories</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories?.data?.map(category => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={checked =>
                      handleArrayFilterChange(
                        'categories',
                        category.id,
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Vendors */}
          <div className="space-y-3">
            <Label>Vendors</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {vendors?.data?.map(vendor => (
                <div key={vendor.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vendor-${vendor.id}`}
                    checked={filters.vendors.includes(vendor.id)}
                    onCheckedChange={checked =>
                      handleArrayFilterChange(
                        'vendors',
                        vendor.id,
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor={`vendor-${vendor.id}`} className="text-sm">
                    {vendor.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Status Filters */}
          <div className="space-y-3">
            <Label>Status</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.values(ExpenseStatus).map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.statuses.includes(status)}
                    onCheckedChange={checked =>
                      handleArrayFilterChange(
                        'statuses',
                        status,
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor={`status-${status}`} className="text-sm">
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={filters.currency || ''}
                onValueChange={value =>
                  handleFilterChange(
                    'currency',
                    (value as Currency) || undefined
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All currencies</SelectItem>
                  <SelectItem value="VND">VND</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={filters.paymentMethod || ''}
                onValueChange={value =>
                  handleFilterChange(
                    'paymentMethod',
                    (value as PaymentMethod) || undefined
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All methods</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Group By</Label>
              <Select
                value={filters.groupBy || ''}
                onValueChange={value =>
                  handleFilterChange(
                    'groupBy',
                    (value as ReportFilters['groupBy']) || undefined
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No grouping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No grouping</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={filters.sortBy || 'date'}
                onValueChange={value =>
                  handleFilterChange('sortBy', value as ReportFilters['sortBy'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Select
                value={filters.sortOrder || 'DESC'}
                onValueChange={value =>
                  handleFilterChange(
                    'sortOrder',
                    value as ReportFilters['sortOrder']
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Descending" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">Ascending</SelectItem>
                  <SelectItem value="DESC">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasFilters && (
            <div className="space-y-2">
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {filters.dateFrom && (
                  <Badge variant="secondary">
                    From: {format(filters.dateFrom, 'MMM dd, yyyy')}
                  </Badge>
                )}
                {filters.dateTo && (
                  <Badge variant="secondary">
                    To: {format(filters.dateTo, 'MMM dd, yyyy')}
                  </Badge>
                )}
                {filters.categories.length > 0 && (
                  <Badge variant="secondary">
                    {filters.categories.length} Categories
                  </Badge>
                )}
                {filters.vendors.length > 0 && (
                  <Badge variant="secondary">
                    {filters.vendors.length} Vendors
                  </Badge>
                )}
                {filters.statuses.length > 0 && (
                  <Badge variant="secondary">
                    {filters.statuses.length} Statuses
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {showPreview && <ReportPreview filters={filters} />}
    </div>
  )
}

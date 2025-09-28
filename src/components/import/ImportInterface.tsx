import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  ChevronDown,
} from 'lucide-react'
import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useImportPreview,
  useImportUpload,
  useImportHistory,
  useImportStatus,
} from '@/hooks/useImport'

export function ImportInterface() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentImportId, setCurrentImportId] = useState<string | null>(null)

  // API hooks
  const previewMutation = useImportPreview()
  const uploadMutation = useImportUpload()
  const { data: importHistory, isLoading: historyLoading } = useImportHistory()
  const { data: currentImport } = useImportStatus(
    currentImportId,
    !!currentImportId
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        setSelectedFile(file)
        previewMutation.mutate(file)
      }
    },
    [previewMutation]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: previewMutation.isPending || uploadMutation.isPending,
  })

  const handleImport = async () => {
    if (!selectedFile) return

    try {
      const importRecord = await uploadMutation.mutateAsync(selectedFile)
      setCurrentImportId(importRecord.id)
    } catch (error) {
      console.error('Import failed:', error)
    }
  }

  const resetImport = () => {
    setSelectedFile(null)
    setCurrentImportId(null)
    previewMutation.reset()
  }

  const downloadCSVTemplate = () => {
    const headers = [
      'Parent ID',
      'Sub ID',
      'Vendor',
      'Description',
      'Type (In/Out)',
      'Amount (Before VAT)',
      'VAT Amount',
      'Amount (After VAT)',
      'Currency',
      'Transaction Date',
      'Category',
      'Payment Method',
      'Invoice Link',
    ]

    const csvContent =
      headers.join(',') +
      '\n' +
      '1,1.1,ABC Company,Office supplies,Out,100.00,20.00,120.00,USD,2023-12-01,Office Supplies,BANK_TRANSFER,\n' +
      '1,1.2,XYZ Vendor,Software license,Out,500.00,100.00,600.00,USD,2023-12-02,Software,CREDIT_CARD,https://invoice.link'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'expense_import_template.csv'
    link.click()
  }

  const downloadExcelTemplate = () => {
    const headers = [
      'Parent ID',
      'Sub ID',
      'Vendor',
      'Description',
      'Type (In/Out)',
      'Amount (Before VAT)',
      'VAT Amount',
      'Amount (After VAT)',
      'Currency',
      'Transaction Date',
      'Category',
      'Payment Method',
      'Invoice Link',
    ]

    const sampleData = [
      [
        1,
        1.1,
        'ABC Company',
        'Office supplies',
        'Out',
        100.0,
        20.0,
        120.0,
        'USD',
        '2023-12-01',
        'Office Supplies',
        'BANK_TRANSFER',
        '',
      ],
      [
        1,
        1.2,
        'XYZ Vendor',
        'Software license',
        'Out',
        500.0,
        100.0,
        600.0,
        'USD',
        '2023-12-02',
        'Software',
        'CREDIT_CARD',
        'https://invoice.link',
      ],
    ]

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData])

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 10 }, // Parent ID
      { wch: 8 }, // Sub ID
      { wch: 15 }, // Vendor
      { wch: 20 }, // Description
      { wch: 12 }, // Type (In/Out)
      { wch: 18 }, // Amount (Before VAT)
      { wch: 12 }, // VAT Amount
      { wch: 18 }, // Amount (After VAT)
      { wch: 10 }, // Currency
      { wch: 16 }, // Transaction Date
      { wch: 15 }, // Category
      { wch: 16 }, // Payment Method
      { wch: 20 }, // Invoice Link
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expense Template')
    XLSX.writeFile(workbook, 'expense_import_template.xlsx')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default' as const,
      failed: 'destructive' as const,
      processing: 'secondary' as const,
      pending: 'outline' as const,
    }
    return (
      <Badge
        variant={variants[status as keyof typeof variants] || 'outline'}
        className="flex items-center gap-1"
      >
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const preview = previewMutation.data
  const isProcessing = uploadMutation.isPending

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Expenses
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={downloadCSVTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV Template
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={downloadExcelTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Excel Template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5 border-solid'
                  : 'border-muted-foreground/25 hover:border-primary hover:bg-gray-50'
              } ${previewMutation.isPending || uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">
                    {isDragActive
                      ? 'Drop your file here'
                      : 'Upload expense data file'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isDragActive
                      ? 'Release to upload your file'
                      : 'Drag & drop files here or click to browse'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Support CSV and Excel files (.csv, .xlsx)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <Badge variant="outline">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={resetImport}>
                  Remove
                </Button>
              </div>

              {previewMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 animate-spin" />
                  Analyzing file...
                </div>
              )}

              {previewMutation.error && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {previewMutation.error.message || 'Failed to preview file'}
                  </AlertDescription>
                </Alert>
              )}

              {preview && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total rows:</span>
                      <div className="font-medium">{preview.totalRows}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Columns:</span>
                      <div className="font-medium">
                        {preview.headers.length}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Errors:</span>
                      <div
                        className={`font-medium ${preview.errors.length > 0 ? 'text-red-500' : 'text-green-500'}`}
                      >
                        {preview.errors.length}
                      </div>
                    </div>
                  </div>

                  {preview.errors.length > 0 && (
                    <div className="space-y-3">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Found {preview.errors.length} validation errors.
                          Please review and fix the issues below before
                          importing.
                        </AlertDescription>
                      </Alert>

                      {/* Detailed Error List */}
                      <div className="border rounded-lg p-4 bg-red-50">
                        <h5 className="font-medium text-red-800 mb-3">
                          Validation Errors:
                        </h5>
                        <div className="space-y-3">
                          {preview.errors.map((error, index) => {
                            // Generate helpful suggestions based on the error
                            const getSuggestion = (error: {
                              field: string
                              value?: string
                              message: string
                              row: number
                            }) => {
                              if (
                                error.field === 'vendor' &&
                                !error.value?.trim()
                              ) {
                                return 'Enter a valid vendor name (e.g., "ABC Company", "John Smith")'
                              }
                              if (
                                error.field === 'vendor' &&
                                error.message.includes('does not exist')
                              ) {
                                return 'This vendor is not in the system. Create the vendor first or check the spelling.'
                              }
                              if (
                                error.field === 'description' &&
                                !error.value?.trim()
                              ) {
                                return 'Provide a clear description (e.g., "Office supplies", "Transportation")'
                              }
                              if (
                                error.field === 'type' &&
                                !['In', 'Out'].includes(error.value || '')
                              ) {
                                return 'Use "In" for income or "Out" for expenses'
                              }
                              if (
                                error.field === 'amountAfterVat' &&
                                error.message.includes('format')
                              ) {
                                return 'Use numeric format without currency symbols (e.g., "100.50", not "$100.50")'
                              }
                              if (
                                error.field === 'amountAfterVat' &&
                                !error.value
                              ) {
                                return 'Enter a valid amount (e.g., "100.00", "1500")'
                              }
                              if (error.field === 'currency' && !error.value) {
                                return 'Specify currency like "USD", "VND", "EUR"'
                              }
                              if (
                                error.field === 'transactionDate' &&
                                error.message.includes('format')
                              ) {
                                return 'Use date format YYYY-MM-DD or MM/DD/YYYY (e.g., "2023-12-25")'
                              }
                              if (
                                error.field === 'transactionDate' &&
                                !error.value
                              ) {
                                return 'Enter transaction date in format YYYY-MM-DD'
                              }
                              if (
                                error.field === 'category' &&
                                !error.value?.trim()
                              ) {
                                return 'Select a valid category (e.g., "Office Supplies", "Travel")'
                              }
                              if (
                                error.field === 'category' &&
                                error.message.includes('does not exist')
                              ) {
                                return 'This category is not in the system. Create the category first or check the spelling.'
                              }
                              if (
                                error.field === 'paymentMethod' &&
                                !error.value?.trim()
                              ) {
                                return 'Select a payment method: "BANK_TRANSFER", "PETTY_CASH", or "CREDIT_CARD"'
                              }
                              if (
                                error.field === 'paymentMethod' &&
                                error.message.includes('must be one of')
                              ) {
                                return 'Use one of these payment methods: "BANK_TRANSFER", "PETTY_CASH", or "CREDIT_CARD" (case-insensitive)'
                              }
                              return null
                            }

                            const suggestion = getSuggestion(error)

                            return (
                              <div
                                key={index}
                                className="border-l-4 border-red-400 pl-4 py-2"
                              >
                                <div className="flex items-start gap-2 text-sm">
                                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="font-medium text-red-700">
                                      Row {error.row}
                                      {error.field &&
                                        `, Column "${error.field}"`}
                                    </div>
                                    <div className="text-red-600 mt-1">
                                      {error.message}
                                    </div>
                                    {error.value && (
                                      <div className="text-gray-600 text-xs mt-1">
                                        Current value: &quot;{error.value}&quot;
                                      </div>
                                    )}
                                    {suggestion && (
                                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                                        <div className="text-blue-700 text-xs font-medium">
                                          💡 How to fix:
                                        </div>
                                        <div className="text-blue-600 text-xs mt-1">
                                          {suggestion}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sample Data Preview */}
                  <div>
                    <h4 className="font-medium mb-2">Data Preview</h4>
                    <div className="border rounded-md overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {preview.headers.map(header => (
                              <TableHead
                                key={header}
                                className="text-xs whitespace-nowrap min-w-[100px]"
                              >
                                {header}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {preview.sampleData.slice(0, 3).map((row, index) => (
                            <TableRow key={index}>
                              {preview.headers.map(header => (
                                <TableCell
                                  key={header}
                                  className="text-xs whitespace-nowrap"
                                >
                                  {row[header]}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleImport}
                      disabled={isProcessing || preview.errors.length > 0}
                      className="flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Start Import
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetImport}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Progress */}
      {currentImport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Import Progress</span>
              {getStatusBadge(currentImport.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={currentImport.progress} className="w-full" />

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total:</span>
                <div className="font-medium">{currentImport.totalRows}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Processed:</span>
                <div className="font-medium">{currentImport.processedRows}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Successful:</span>
                <div className="font-medium text-green-600">
                  {currentImport.successfulRows}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Errors:</span>
                <div className="font-medium text-red-600">
                  {currentImport.errorRows}
                </div>
              </div>
            </div>

            {currentImport.status === 'completed' &&
              currentImport.errorRows > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Import completed with {currentImport.errorRows} errors.
                    {currentImport.successfulRows} records were imported
                    successfully.
                  </AlertDescription>
                </Alert>
              )}

            {currentImport.status === 'completed' &&
              currentImport.errorRows === 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Import completed successfully! All{' '}
                    {currentImport.successfulRows} records were imported.
                  </AlertDescription>
                </Alert>
              )}
          </CardContent>
        </Card>
      )}

      {/* Import History */}
      {importHistory && importHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 animate-spin" />
                Loading history...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Rows</TableHead>
                    <TableHead>Success</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importHistory.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.fileName}
                      </TableCell>
                      <TableCell>
                        {new Date(record.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.totalRows}</TableCell>
                      <TableCell className="text-green-600">
                        {record.successfulRows}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {record.errorRows}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

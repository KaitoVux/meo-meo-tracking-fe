import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormattedNumberInput } from '@/components/ui/formatted-number-input'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VendorSelect } from '@/components/vendors'
import { useCategoriesQuery } from '@/hooks/useCategories'
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from '@/hooks/useExpenses'
import { useUploadFileMutation } from '@/hooks/useFiles'
import type { Expense } from '@/lib/api'
import { expenseSchema, type ExpenseFormData } from '@/lib/validations'
import { useAuthStore } from '@/store/auth'

interface ExpenseFormProps {
  expense?: Expense
  onSubmit?: (expense: Expense) => void // Changed to return the created/updated expense
  onCancel: () => void
}

export function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
  // Auth store for current user
  const { user } = useAuthStore()

  // TanStack Query hooks for data and mutations
  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useCategoriesQuery()
  const createExpenseMutation = useCreateExpenseMutation()
  const updateExpenseMutation = useUpdateExpenseMutation()
  const uploadFileMutation = useUploadFileMutation()

  // Extract data with fallbacks
  const categories = useMemo(
    () => categoriesResponse?.data || [],
    [categoriesResponse?.data]
  )
  const isLoading =
    createExpenseMutation.isPending || updateExpenseMutation.isPending
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<{
    id: string
    name: string
    size: number
  } | null>(
    // Try invoiceFile object first, then fall back to invoiceFileId
    expense?.invoiceFile
      ? {
          id: expense.invoiceFile.id,
          name: expense.invoiceFile.originalName,
          size: expense.invoiceFile.size,
        }
      : expense?.invoiceFileId
        ? {
            id: expense.invoiceFileId,
            name: 'Uploaded File', // We don't have the name, so use a placeholder
            size: 0, // We don't have the size either
          }
        : null
  )
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      transactionDate: expense?.transactionDate
        ? new Date(expense.transactionDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      expenseMonth:
        expense?.expenseMonth ||
        new Date().toLocaleDateString('en-US', { month: 'long' }),
      type: expense?.type || 'OUT',
      vendorId: expense?.vendorId || expense?.vendor?.id || '',
      categoryId: expense?.categoryEntityId || '',
      amount: expense?.amount || 0,
      amountBeforeVAT: expense?.amountBeforeVAT || 0,
      vatPercentage: expense?.vatPercentage,
      vatAmount: expense?.vatAmount,
      currency: expense?.currency || 'VND',
      exchangeRate: expense?.exchangeRate,
      description: expense?.description || '',
      projectCostCenter: expense?.projectCostCenter || '',
      paymentMethod: expense?.paymentMethod || 'CASH',
    },
  })

  // Auto-calculate VAT amount and total when relevant fields change
  const amountBeforeVAT = form.watch('amountBeforeVAT')
  const vatPercentage = form.watch('vatPercentage')

  useEffect(() => {
    console.log(
      '🔍 VAT Calculation Effect - amountBeforeVAT:',
      amountBeforeVAT,
      'vatPercentage:',
      vatPercentage
    )
    console.log('📊 Current form values before update:', {
      vatAmount: form.getValues('vatAmount'),
      amount: form.getValues('amount'),
    })

    if (amountBeforeVAT !== undefined) {
      if (vatPercentage && vatPercentage > 0) {
        // Calculate with VAT
        const vatAmount = (amountBeforeVAT * vatPercentage) / 100
        console.log(
          '✅ Setting with VAT - vatAmount:',
          vatAmount,
          'total:',
          amountBeforeVAT + vatAmount
        )
        form.setValue('vatAmount', vatAmount, {
          shouldValidate: true,
          shouldDirty: true,
        })
        form.setValue('amount', amountBeforeVAT + vatAmount, {
          shouldValidate: true,
          shouldDirty: true,
        })
      } else {
        // No VAT or VAT cleared - total equals amount before VAT
        console.log(
          '🚫 Setting without VAT - vatAmount: 0, total:',
          amountBeforeVAT
        )
        form.setValue('vatAmount', 0, {
          shouldValidate: true,
          shouldDirty: true,
        })
        form.setValue('amount', amountBeforeVAT, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }

      // Log form values after update
      setTimeout(() => {
        console.log('📈 Form values after setValue:', {
          vatAmount: form.getValues('vatAmount'),
          amount: form.getValues('amount'),
        })
      }, 0)
    }
  }, [amountBeforeVAT, vatPercentage, form])

  // Update categoryId field when categories are loaded and we have an existing expense
  useEffect(() => {
    if (categories.length > 0 && expense) {
      // First try to use categoryEntityId if available
      if (expense.categoryEntityId) {
        form.setValue('categoryId', expense.categoryEntityId)
      }
      // If we have categoryEntity populated, use its ID
      else if (expense.categoryEntity) {
        form.setValue('categoryId', expense.categoryEntity.id)
      }
      // Fallback to finding by category name (legacy support)
      else if (expense.category) {
        const category = categories.find(cat => cat.name === expense.category)
        if (category) {
          form.setValue('categoryId', category.id)
        }
      }
    }
  }, [
    expense,
    expense?.categoryEntityId,
    expense?.categoryEntity,
    expense?.category,
    categories,
    form,
  ])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setIsUploading(true)
      setUploadProgress(0)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      uploadFileMutation.mutate(
        { file },
        {
          onSuccess: response => {
            clearInterval(progressInterval)
            setUploadProgress(100)

            setUploadedFile({
              id: response.data?.id || '',
              name: response.data?.originalName || '',
              size: response.data?.size || 0,
            })

            setTimeout(() => setUploadProgress(0), 1000)
          },
          onError: error => {
            clearInterval(progressInterval)
            console.error('File upload failed:', error)
            // TODO: Show toast notification for error
          },
          onSettled: () => {
            setIsUploading(false)
          },
        }
      )
    },
    [uploadFileMutation]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isUploading || isLoading,
  })

  const removeFile = () => {
    setUploadedFile(null)
  }

  const handleSubmit = (data: ExpenseFormData) => {
    if (!user?.id) {
      console.error('User not authenticated')
      return
    }

    const { categoryId, ...restData } = data
    const expenseData = {
      ...restData,
      category: categoryId, // Map categoryId to category for API
      invoiceFileId: uploadedFile?.id,
      submitterId: user.id,
    }

    if (expense) {
      // Update existing expense
      updateExpenseMutation.mutate(
        { id: expense.id, data: expenseData },
        {
          onSuccess: response => {
            if (response.data) {
              onSubmit?.(response.data)
            }
            // Query cache will automatically update!
          },
          onError: error => {
            console.error('Failed to update expense:', error)
            // TODO: Show toast notification for error
          },
        }
      )
    } else {
      // Create new expense
      createExpenseMutation.mutate(expenseData, {
        onSuccess: response => {
          if (response.data) {
            onSubmit?.(response.data)
          }
          // Query cache will automatically update!
        },
        onError: error => {
          console.error('Failed to create expense:', error)
          // TODO: Show toast notification for error
        },
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{expense ? 'Edit Expense' : 'Create New Expense'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="transactionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expenseMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Month</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expense month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="January">January</SelectItem>
                        <SelectItem value="February">February</SelectItem>
                        <SelectItem value="March">March</SelectItem>
                        <SelectItem value="April">April</SelectItem>
                        <SelectItem value="May">May</SelectItem>
                        <SelectItem value="June">June</SelectItem>
                        <SelectItem value="July">July</SelectItem>
                        <SelectItem value="August">August</SelectItem>
                        <SelectItem value="September">September</SelectItem>
                        <SelectItem value="October">October</SelectItem>
                        <SelectItem value="November">November</SelectItem>
                        <SelectItem value="December">December</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expense type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OUT">Outgoing (OUT)</SelectItem>
                        <SelectItem value="IN">Incoming (IN)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <VendorSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select a vendor"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value="" disabled>
                            Loading categories...
                          </SelectItem>
                        ) : categories.length === 0 ? (
                          <SelectItem value="" disabled>
                            No categories available
                          </SelectItem>
                        ) : (
                          categories
                            .filter(category => category.isActive)
                            .map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <FormattedNumberInput
                        placeholder="0.00"
                        currency={form.watch('currency') as 'VND' | 'USD'}
                        value={field.value}
                        onValueChange={value => field.onChange(value || 0)}
                        inputProps={{
                          readOnly: true,
                          className: 'bg-muted cursor-not-allowed',
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountBeforeVAT"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Before VAT</FormLabel>
                    <FormControl>
                      <FormattedNumberInput
                        placeholder="0.00"
                        currency={form.watch('currency') as 'VND' | 'USD'}
                        value={field.value}
                        onValueChange={value => {
                          const numValue = value || 0
                          field.onChange(numValue)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vatPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Percentage (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => {
                          const value = e.target.value
                          const percentage =
                            value === '' ? null : parseFloat(value) || null
                          field.onChange(percentage)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vatAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Amount</FormLabel>
                    <FormControl>
                      <FormattedNumberInput
                        placeholder="0.00"
                        currency={form.watch('currency') as 'VND' | 'USD'}
                        value={field.value}
                        onValueChange={value => {
                          field.onChange(value || 0)
                        }}
                        inputProps={{
                          readOnly: true,
                          className: 'bg-muted cursor-not-allowed',
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="VND">VND</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exchangeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exchange Rate (Optional)</FormLabel>
                    <FormControl>
                      <FormattedNumberInput
                        placeholder="Enter exchange rate"
                        currency={form.watch('currency') as 'VND' | 'USD'}
                        value={field.value}
                        decimalScale={4}
                        onValueChange={value =>
                          field.onChange(value || undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="BANK_TRANSFER">
                          Bank Transfer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectCostCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project/Cost Center (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project or cost center"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter expense description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Section */}
            <div className="space-y-4">
              <span className="text-sm font-medium">
                Invoice File (Optional)
              </span>

              {!uploadedFile && (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                  } ${isUploading || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? 'Drop the file here...'
                      : 'Drag & drop a file here, or click to select'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Supports: Images (PNG, JPG), PDF, Excel files
                  </p>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {uploadedFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isUploading}>
                {isLoading
                  ? 'Saving...'
                  : expense
                    ? 'Update Expense'
                    : 'Create Expense'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

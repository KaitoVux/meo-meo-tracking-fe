import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import type { Category } from '../../lib/api'
import { categorySchema } from '../../lib/validations'
import type { CategoryFormData } from '../../lib/validations'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

interface CategoryFormProps {
  category?: Category
  onSubmit: (data: CategoryFormData) => Promise<void>
  onCancel: () => void
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      code: category?.code || '',
      description: category?.description || '',
      isActive: category?.isActive ?? true,
    },
  })

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const submitData = {
        ...data,
        description: data.description || undefined,
      }

      await onSubmit(submitData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-generate code from name
  const handleNameChange = (name: string) => {
    if (!category) {
      // Only auto-generate for new categories
      const generatedCode = name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 20)

      form.setValue('code', generatedCode)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter category name"
                  {...field}
                  onChange={e => {
                    field.onChange(e)
                    handleNameChange(e.target.value)
                  }}
                />
              </FormControl>
              <FormDescription>
                A descriptive name for the category (2-100 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="CATEGORY_CODE"
                  {...field}
                  style={{ textTransform: 'uppercase' }}
                />
              </FormControl>
              <FormDescription>
                Unique identifier (uppercase letters, numbers, underscores only)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter category description" {...field} />
              </FormControl>
              <FormDescription>
                Additional details about this category (max 500 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={value => field.onChange(value === 'true')}
                defaultValue={field.value ? 'true' : 'false'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Active categories can be used for new expenses
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : category
                ? 'Update Category'
                : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

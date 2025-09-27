import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCreateVendorMutation,
  useUpdateVendorMutation,
} from '@/hooks/useVendors'
import { type Vendor } from '@/lib/api'
import { vendorSchema, type VendorFormData } from '@/lib/validations'

interface VendorFormProps {
  vendor?: Vendor
  onSubmit: () => void
  onCancel: () => void
}

export function VendorForm({ vendor, onSubmit, onCancel }: VendorFormProps) {
  const createVendorMutation = useCreateVendorMutation()
  const updateVendorMutation = useUpdateVendorMutation()

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: vendor?.name || '',
      contactInfo: vendor?.contactInfo || '',
      address: vendor?.address || '',
      taxId: vendor?.taxId || '',
      email: vendor?.email || '',
      phone: vendor?.phone || '',
      status: (vendor?.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
    },
  })

  const isLoading =
    createVendorMutation.isPending || updateVendorMutation.isPending
  const error = createVendorMutation.error || updateVendorMutation.error

  const handleSubmit = async (data: VendorFormData) => {
    if (vendor) {
      // Update existing vendor
      updateVendorMutation.mutate(
        { id: vendor.id, data },
        {
          onSuccess: () => {
            onSubmit()
          },
        }
      )
    } else {
      // Create new vendor
      createVendorMutation.mutate(data, {
        onSuccess: () => {
          onSubmit()
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/15 p-3">
            <div className="text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : 'An unexpected error occurred'}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter vendor name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="vendor@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Information</FormLabel>
              <FormControl>
                <Input placeholder="Enter contact information" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter vendor address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tax identification number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Saving...'
              : vendor
                ? 'Update Vendor'
                : 'Create Vendor'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

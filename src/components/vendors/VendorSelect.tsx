import { Plus } from 'lucide-react'
import { useState, useEffect } from 'react'

import { VendorForm } from './VendorForm'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiClient, type Vendor } from '@/lib/api'

interface VendorSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function VendorSelect({
  value,
  onValueChange,
  placeholder = 'Select vendor...',
  disabled = false,
}: VendorSelectProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getVendors({
        status: 'ACTIVE',
        limit: 100,
        sortBy: 'name',
        sortOrder: 'ASC',
      })

      if (response.success) {
        setVendors(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  const handleCreateVendor = () => {
    setIsCreateDialogOpen(true)
  }

  const handleVendorCreated = () => {
    setIsCreateDialogOpen(false)
    fetchVendors()
  }

  return (
    <>
      <div className="space-y-2">
        <Select
          value={value}
          onValueChange={onValueChange}
          disabled={disabled || loading || vendors.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                loading
                  ? 'Loading vendors...'
                  : vendors.length === 0
                    ? 'No vendors available'
                    : placeholder
              }
            />
          </SelectTrigger>
          <SelectContent>
            {!loading &&
              vendors.length > 0 &&
              vendors.map(vendor => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{vendor.name}</span>
                    {vendor.contactInfo && (
                      <span className="text-sm text-muted-foreground">
                        {vendor.contactInfo}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCreateVendor}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Vendor
        </Button>
      </div>

      {/* Create Vendor Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <VendorForm
            onSubmit={handleVendorCreated}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

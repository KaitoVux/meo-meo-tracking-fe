import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'

import { VendorForm } from './VendorForm'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { apiClient, type Vendor } from '@/lib/api'
import { cn } from '@/lib/utils'

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
  const [open, setOpen] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const selectedVendor = vendors.find(vendor => vendor.id === value)

  const fetchVendors = async (search?: string) => {
    try {
      setLoading(true)
      const response = await apiClient.getVendors({
        search,
        status: 'ACTIVE',
        limit: 50,
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
    if (open) {
      fetchVendors()
    }
  }, [open])

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        fetchVendors(searchTerm)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else if (open) {
      fetchVendors()
    }
  }, [searchTerm, open])

  const handleCreateVendor = () => {
    setOpen(false)
    setIsCreateDialogOpen(true)
  }

  const handleVendorCreated = () => {
    setIsCreateDialogOpen(false)
    fetchVendors()
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedVendor ? selectedVendor.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search vendors..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>
              {loading ? (
                <div className="py-6 text-center text-sm">
                  Loading vendors...
                </div>
              ) : (
                <div className="py-6 text-center text-sm">
                  <p>No vendors found.</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCreateVendor}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Vendor
                  </Button>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {vendors.map(vendor => (
                <CommandItem
                  key={vendor.id}
                  value={vendor.id}
                  onSelect={currentValue => {
                    onValueChange(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === vendor.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{vendor.name}</div>
                    {vendor.contactInfo && (
                      <div className="text-sm text-muted-foreground">
                        {vendor.contactInfo}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
              {vendors.length > 0 && (
                <CommandItem onSelect={handleCreateVendor}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Vendor
                </CommandItem>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

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

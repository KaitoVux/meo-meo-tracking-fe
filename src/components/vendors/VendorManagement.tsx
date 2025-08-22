import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

import { VendorDeleteDialog } from './VendorDeleteDialog'
import { VendorForm } from './VendorForm'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { apiClient, type Vendor } from '@/lib/api'

export function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'ACTIVE' | 'INACTIVE'
  >('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalVendors, setTotalVendors] = useState(0)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        search: searchTerm || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page: currentPage,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'ASC' as const,
      }

      const response = await apiClient.getVendors(params)
      if (response.success) {
        setVendors(response.data.vendors)
        setTotalVendors(response.data.total)
        setTotalPages(Math.ceil(response.data.total / response.data.limit))
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, currentPage])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const handleCreateVendor = () => {
    setSelectedVendor(null)
    setIsCreateDialogOpen(true)
  }

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsEditDialogOpen(true)
  }

  const handleDeleteVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleStatus = async (vendor: Vendor) => {
    try {
      const response = await apiClient.toggleVendorStatus(vendor.id)
      if (response.success) {
        fetchVendors()
      }
    } catch (error) {
      console.error('Failed to toggle vendor status:', error)
    }
  }

  const handleVendorSaved = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedVendor(null)
    fetchVendors()
  }

  const handleVendorDeleted = () => {
    setIsDeleteDialogOpen(false)
    setSelectedVendor(null)
    fetchVendors()
  }

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      >
        Active
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      >
        Inactive
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vendor Management
          </h1>
          <p className="text-muted-foreground">
            Manage your vendors and their information
          </p>
        </div>
        <Button onClick={handleCreateVendor}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendors ({totalVendors})</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: 'ALL' | 'ACTIVE' | 'INACTIVE') =>
                setStatusFilter(value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading vendors...</div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground">No vendors found</p>
                <Button onClick={handleCreateVendor} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Vendor
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map(vendor => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">
                        {vendor.name}
                      </TableCell>
                      <TableCell>{vendor.contactInfo || '-'}</TableCell>
                      <TableCell>{vendor.email || '-'}</TableCell>
                      <TableCell>{vendor.phone || '-'}</TableCell>
                      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditVendor(vendor)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(vendor)}
                            >
                              {vendor.status === 'ACTIVE' ? (
                                <>
                                  <ToggleLeft className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteVendor(vendor)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * 20 + 1} to{' '}
                    {Math.min(currentPage * 20, totalVendors)} of {totalVendors}{' '}
                    vendors
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(prev => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(prev => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Vendor Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <VendorForm
            onSubmit={handleVendorSaved}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <VendorForm
              vendor={selectedVendor}
              onSubmit={handleVendorSaved}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Vendor Dialog */}
      {selectedVendor && (
        <VendorDeleteDialog
          vendor={selectedVendor}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDeleted={handleVendorDeleted}
        />
      )}
    </div>
  )
}

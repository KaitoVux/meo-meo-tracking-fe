import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
} from 'lucide-react'
import React, { useState } from 'react'

import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../lib/api'
import type { CategoryFormData } from '../../lib/validations'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

import { CategoryDeleteDialog } from './CategoryDeleteDialog'
import { CategoryForm } from './CategoryForm'

import {
  useCategoriesQuery,
  useCategoryUsageQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useUpdateCategoryStatusMutation,
  useDeleteCategoryMutation,
} from '@/hooks/useCategories'

export const CategoryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false)

  // TanStack Query hooks - much simpler than manual state management!
  const {
    data: categoriesResponse,
    isLoading,
    error,
    refetch,
  } = useCategoriesQuery({ includeInactive })

  const { data: categoryUsageResponse, isLoading: usageLoading } =
    useCategoryUsageQuery(selectedCategory?.id || '', {
      enabled: !!selectedCategory?.id && isUsageDialogOpen,
    })

  // Mutations for category operations
  const createCategoryMutation = useCreateCategoryMutation()
  const updateCategoryMutation = useUpdateCategoryMutation()
  const updateStatusMutation = useUpdateCategoryStatusMutation()
  const deleteCategoryMutation = useDeleteCategoryMutation()

  // Extract data with fallbacks
  const categories = categoriesResponse?.data || []
  const categoryUsage = categoryUsageResponse?.data?.usageCount || null

  // No more manual fetching functions needed! TanStack Query handles everything.

  const handleCreateCategory = (categoryData: CategoryFormData) => {
    const createData: CreateCategoryRequest = {
      name: categoryData.name,
      code: categoryData.code,
      description: categoryData.description || undefined,
      isActive: categoryData.isActive,
    }

    createCategoryMutation.mutate(createData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false)
        // Query cache will automatically update!
      },
      onError: error => {
        console.error('Failed to create category:', error)
      },
    })
  }

  const handleUpdateCategory = (categoryData: CategoryFormData) => {
    if (!selectedCategory) return

    const updateData: UpdateCategoryRequest = {
      name: categoryData.name,
      code: categoryData.code,
      description: categoryData.description || undefined,
      isActive: categoryData.isActive,
    }

    updateCategoryMutation.mutate(
      { id: selectedCategory.id, data: updateData },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false)
          setSelectedCategory(null)
          // Query cache will automatically update!
        },
        onError: error => {
          console.error('Failed to update category:', error)
        },
      }
    )
  }

  const handleToggleStatus = (category: Category) => {
    updateStatusMutation.mutate(
      { id: category.id, isActive: !category.isActive },
      {
        onError: error => {
          console.error('Failed to toggle category status:', error)
        },
      }
    )
  }

  const handleDeleteCategory = () => {
    if (!selectedCategory) return

    deleteCategoryMutation.mutate(selectedCategory.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
        setSelectedCategory(null)
        // Query cache will automatically update!
      },
      onError: error => {
        console.error('Failed to delete category:', error)
      },
    })
  }

  const handleViewUsage = (category: Category) => {
    setSelectedCategory(category)
    setIsUsageDialogOpen(true)
    // Usage data will be fetched automatically by the query hook!
  }

  const filteredCategories = categories.filter(
    category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const activeCategories = filteredCategories.filter(c => c.isActive).length
  const inactiveCategories = filteredCategories.filter(c => !c.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Category Management
          </h1>
          <p className="text-muted-foreground">
            Manage expense categories and track their usage across the system
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredCategories.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeCategories}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inactiveCategories}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            View and manage all expense categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant={includeInactive ? 'default' : 'outline'}
              onClick={() => setIncludeInactive(!includeInactive)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {includeInactive ? 'Show Active Only' : 'Include Inactive'}
            </Button>
          </div>

          {error && (
            <Alert className="mb-4">
              <AlertDescription>
                {error.message || 'An error occurred'}
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading categories...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map(category => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.code}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {category.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={category.isActive ? 'default' : 'secondary'}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUsage(category)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCategory(category)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(category)}
                            >
                              {category.isActive ? (
                                <ToggleLeft className="mr-2 h-4 w-4" />
                              ) : (
                                <ToggleRight className="mr-2 h-4 w-4" />
                              )}
                              {category.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewUsage(category)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Usage
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCategory(category)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new expense category to organize your expenses
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleCreateCategory}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              category={selectedCategory}
              onSubmit={handleUpdateCategory}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedCategory(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      {selectedCategory && (
        <CategoryDeleteDialog
          category={selectedCategory}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteCategory}
          onCancel={() => {
            setIsDeleteDialogOpen(false)
            setSelectedCategory(null)
          }}
        />
      )}

      {/* Usage Dialog */}
      <Dialog open={isUsageDialogOpen} onOpenChange={setIsUsageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Category Usage</DialogTitle>
            <DialogDescription>
              View how many expenses use this category
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Category:</span>
                <Badge variant="outline">{selectedCategory.name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Code:</span>
                <Badge variant="outline">{selectedCategory.code}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Usage Count:</span>
                <Badge variant="default">
                  {usageLoading
                    ? 'Loading...'
                    : categoryUsage !== null
                      ? `${categoryUsage} expenses`
                      : 'No data'}
                </Badge>
              </div>
              {selectedCategory.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedCategory.description}
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={() => setIsUsageDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

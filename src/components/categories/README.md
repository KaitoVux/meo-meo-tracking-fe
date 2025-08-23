# Category Management Components

This module provides a comprehensive category management interface for the Business Expense Tracking System.

## Components

### CategoryManagement

The main component that provides a complete category management interface including:

- Category listing with search and filtering
- Status management (active/inactive)
- Usage statistics and tracking
- CRUD operations with confirmation dialogs
- Hierarchical category support (parent/child relationships)

**Features:**

- Real-time search across name, code, and description
- Toggle between active-only and all categories view
- Statistics cards showing total, active, and inactive categories
- Sortable table with comprehensive category information
- Action menu for each category (edit, toggle status, view usage, delete)
- Usage tracking to prevent deletion of categories in use

### CategoryForm

A reusable form component for creating and editing categories with:

- Comprehensive validation using Zod schema
- Auto-generation of category codes from names (for new categories)
- Parent category selection for hierarchical organization
- Status management (active/inactive)
- Real-time validation feedback

**Validation Rules:**

- Name: 2-100 characters, required
- Code: 2-20 characters, uppercase letters/numbers/underscores only, unique
- Description: Optional, max 500 characters
- Parent: Optional, select from existing active categories
- Status: Active/Inactive toggle

### CategoryDeleteDialog

A confirmation dialog for category deletion with:

- Usage count validation (prevents deletion if category is in use)
- Child category warning (shows impact on hierarchy)
- Comprehensive category information display
- Safety checks and error handling

**Safety Features:**

- Checks category usage before allowing deletion
- Warns about child categories that will be affected
- Provides clear feedback about why deletion might be blocked
- Requires explicit confirmation for irreversible actions

## API Integration

The components integrate with the backend category API providing:

- Full CRUD operations (Create, Read, Update, Delete)
- Status management (activate/deactivate)
- Usage statistics and tracking
- Hierarchical category support
- Comprehensive error handling

## Usage

```tsx
import { CategoryManagement } from '../components/categories'

// Use in a page component
export const CategoriesPage = () => {
  return <CategoryManagement />
}
```

## Requirements Fulfilled

This implementation fulfills Task 13 requirements:

- ✅ Category management interface using Shadcn/ui Table, Dialog, and Form components
- ✅ Category creation, editing, and deletion with confirmation dialogs
- ✅ Category status toggle controls and visual indicators
- ✅ Category usage display and tracking interface
- ✅ Comprehensive validation and error handling
- ✅ Responsive design with dark mode support
- ✅ Integration with backend category API

## Dependencies

- React Hook Form for form management
- Zod for validation schemas
- Shadcn/ui components for consistent UI
- Lucide React for icons
- Backend category API endpoints

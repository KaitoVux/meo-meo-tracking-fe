# Formatters Utility

Centralized formatting utilities for consistent display across the application.

## Usage

### Import

```typescript
import { getStatusLabel, getStatusVariant } from '@/lib/formatters'
```

### Status Label Formatting

```typescript
// Get formatted status label
const label = getStatusLabel('IN_PROGRESS') // Returns: "In Progress"
const label2 = getStatusLabel('PAID') // Returns: "Paid"
```

### Status Badge Variant

```typescript
// Get badge variant for styling
const variant = getStatusVariant('IN_PROGRESS') // Returns: "default"
const variant2 = getStatusVariant('ON_HOLD') // Returns: "destructive"
```

### Complete Example

```tsx
import { Badge } from '@/components/ui/badge'
import { getStatusLabel, getStatusVariant } from '@/lib/formatters'

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
  )
}
```

## Available Status Mappings

| Status      | Label       | Badge Variant |
| ----------- | ----------- | ------------- |
| DRAFT       | Draft       | secondary     |
| IN_PROGRESS | In Progress | default       |
| PAID        | Paid        | default       |
| ON_HOLD     | On Hold     | destructive   |
| ACTIVE      | Active      | default       |
| INACTIVE    | Inactive    | secondary     |

## Adding New Status Types

To add a new status type, update `/src/lib/formatters.ts`:

```typescript
export const STATUS_LABELS: Record<string, string> = {
  // ... existing statuses
  NEW_STATUS: 'New Status Label',
}

export const STATUS_VARIANTS = {
  // ... existing statuses
  NEW_STATUS: 'default', // or 'secondary', 'destructive', 'outline'
} as const
```

## Benefits

1. **Consistency**: All status displays use the same formatting
2. **Maintainability**: Single source of truth for status labels and styling
3. **Type Safety**: TypeScript support with proper typing
4. **Flexibility**: Fallback formatting for unknown statuses

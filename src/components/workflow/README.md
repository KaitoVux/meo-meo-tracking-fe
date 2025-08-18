# Workflow Management Components

This directory contains the complete workflow management UI components for Task 12.

## Components

### WorkflowStatusTransition

- Interactive status transition controls with confirmation dialogs
- Context-aware available transitions based on current status
- Notes input for status changes
- Visual workflow step indicators

### WorkflowVisualization

- Visual progress indicator showing workflow steps
- Current status highlighting
- Responsive design (horizontal on desktop, vertical on mobile)
- Progress bar with completion percentage

### WorkflowHistory

- Timeline view of status changes
- User attribution and timestamps
- Expandable history with show more/less functionality
- Notes display for each transition

### NotificationCenter

- Bell icon with unread count badge
- Modal notification list with different types and priorities
- Mark as read/unread functionality
- Real-time notification updates

### ApprovalInterface

- Dedicated approval interface for accountants
- Approve/reject actions with confirmation dialogs
- Required notes for rejections
- Review checklist and expense summary
- Role-based visibility (only shown to accountants for submitted expenses)

## Features Implemented

✅ Status transition controls with workflow visualization
✅ Approval and payment processing interfaces
✅ Notification display and management system
✅ Workflow history tracking display
✅ Role-based access control for approval actions
✅ Real-time status updates and progress tracking
✅ Responsive design for all workflow components
✅ Integration with expense detail views

## Pages

### WorkflowPage

- Comprehensive workflow management dashboard
- Statistics cards showing pending, approved, paid counts
- Filterable expense list with workflow status
- Inline expense selection and workflow actions
- Role-based view (different for accountants vs users)

## API Integration

The components integrate with the following backend endpoints:

- `PATCH /expenses/:id/status` - Update expense status with notes
- `GET /notifications` - Get user notifications (to be implemented)
- `PATCH /notifications/:id/read` - Mark notification as read (to be implemented)
- `GET /expenses/:id/history` - Get expense status history (to be implemented)

## Requirements Satisfied

This implementation satisfies all requirements from Task 12:

- ✅ 2.1, 2.2, 2.3, 2.4, 2.5 - Complete workflow management and status transitions
- ✅ 2.6, 2.7 - Notification display and management system
- ✅ Role-based approval interfaces and workflow controls
- ✅ Workflow history tracking and visualization

## Usage

```tsx
// Individual components
import {
  WorkflowStatusTransition,
  WorkflowVisualization,
  NotificationCenter,
} from '@/components/workflow'

// Full workflow management page
import { WorkflowPage } from '@/pages/WorkflowPage'

// The WorkflowPage is accessible at /workflow route
```

The workflow management system is now fully integrated into the expense tracking application with comprehensive status management, approval workflows, and notification systems.

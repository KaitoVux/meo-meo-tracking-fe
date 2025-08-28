import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
} from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/store/auth'

interface Notification {
  id: string
  title: string
  message: string
  type:
    | 'EXPENSE_SUBMITTED'
    | 'EXPENSE_APPROVED'
    | 'EXPENSE_REJECTED'
    | 'PAYMENT_DUE'
    | 'VALIDATION_ERROR'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  isRead: boolean
  createdAt: string
  relatedExpenseId?: string
  metadata?: Record<string, unknown>
}

const notificationIcons = {
  EXPENSE_SUBMITTED: AlertCircle,
  EXPENSE_APPROVED: CheckCircle,
  EXPENSE_REJECTED: X,
  PAYMENT_DUE: AlertTriangle,
  VALIDATION_ERROR: Info,
}

const notificationColors = {
  EXPENSE_SUBMITTED: 'text-blue-500',
  EXPENSE_APPROVED: 'text-green-500',
  EXPENSE_REJECTED: 'text-red-500',
  PAYMENT_DUE: 'text-orange-500',
  VALIDATION_ERROR: 'text-yellow-500',
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

export function NotificationCenter() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const loadNotifications = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      // Note: This endpoint would need to be implemented in the backend
      // For now, we'll create mock data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Expense Submitted',
          message:
            'Your expense for office supplies has been submitted for approval.',
          type: 'EXPENSE_SUBMITTED',
          priority: 'MEDIUM',
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedExpenseId: 'expense-1',
        },
        {
          id: '2',
          title: 'Payment Due Reminder',
          message:
            'Invoice collection required for approved expense PAY-2024-001.',
          type: 'PAYMENT_DUE',
          priority: 'HIGH',
          isRead: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          relatedExpenseId: 'expense-2',
        },
        {
          id: '3',
          title: 'Expense Approved',
          message:
            'Your travel expense has been approved and is ready for payment.',
          type: 'EXPENSE_APPROVED',
          priority: 'MEDIUM',
          isRead: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          relatedExpenseId: 'expense-3',
        },
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadNotifications()
  }, [user, loadNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      // Note: This endpoint would need to be implemented in the backend
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Note: This endpoint would need to be implemented in the backend
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      )
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      // Note: This endpoint would need to be implemented in the backend
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      )
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => {
                const NotificationIcon = notificationIcons[notification.type]
                return (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <NotificationIcon
                          className={`h-5 w-5 mt-0.5 ${notificationColors[notification.type]}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm truncate">
                              {notification.title}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={e => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={`text-xs ${priorityColors[notification.priority]}`}
                            >
                              {notification.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

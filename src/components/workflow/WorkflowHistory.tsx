import {
  Clock,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import React, { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Expense } from '@/lib/api'

interface WorkflowHistoryProps {
  expense: Expense
}

interface StatusHistoryItem {
  id: string
  fromStatus: string
  toStatus: string
  notes?: string
  createdAt: string
  changedBy: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

const statusLabels = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  PAID: 'Paid',
  CLOSED: 'Closed',
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  PAID: 'bg-purple-100 text-purple-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

export function WorkflowHistory({ expense }: WorkflowHistoryProps) {
  const [history, setHistory] = useState<StatusHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  const loadHistory = async () => {
    try {
      setLoading(true)
      // Note: This endpoint would need to be implemented in the backend
      // For now, we'll create mock data based on the expense
      const mockHistory: StatusHistoryItem[] = [
        {
          id: '1',
          fromStatus: '',
          toStatus: 'DRAFT',
          notes: 'Expense created',
          createdAt: expense.createdAt,
          changedBy: expense.submitter,
        },
      ]

      // Add current status if different from DRAFT
      if (expense.status !== 'DRAFT') {
        mockHistory.push({
          id: '2',
          fromStatus: 'DRAFT',
          toStatus: expense.status,
          notes: `Status changed to ${statusLabels[expense.status]}`,
          createdAt: expense.updatedAt,
          changedBy: expense.submitter,
        })
      }

      setHistory(mockHistory)
    } catch (error) {
      console.error('Failed to load workflow history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [expense.id, loadHistory])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const displayedHistory = expanded ? history : history.slice(0, 3)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Loading history...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Workflow History</span>
          <Badge variant="outline">{history.length} events</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedHistory.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No workflow history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedHistory.map((item, index) => (
                <div key={item.id} className="flex space-x-3">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    {index < displayedHistory.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                    )}
                  </div>

                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {item.fromStatus ? (
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${statusColors[item.fromStatus as keyof typeof statusColors]}`}
                          >
                            {
                              statusLabels[
                                item.fromStatus as keyof typeof statusLabels
                              ]
                            }
                          </Badge>
                          <span className="text-gray-400">→</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${statusColors[item.toStatus as keyof typeof statusColors]}`}
                          >
                            {
                              statusLabels[
                                item.toStatus as keyof typeof statusLabels
                              ]
                            }
                          </Badge>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusColors[item.toStatus as keyof typeof statusColors]}`}
                        >
                          {
                            statusLabels[
                              item.toStatus as keyof typeof statusLabels
                            ]
                          }
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                      <User className="h-3 w-3" />
                      <span>
                        {item.changedBy.firstName} {item.changedBy.lastName}
                      </span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>

                    {item.notes && (
                      <div className="flex items-start space-x-2 text-sm text-gray-700">
                        <MessageSquare className="h-3 w-3 mt-0.5 text-gray-400" />
                        <span>{item.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Show more/less button */}
              {history.length > 3 && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Show {history.length - 3} More
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

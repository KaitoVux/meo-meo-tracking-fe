import {
  Clock,
  AlertCircle,
  DollarSign,
  Archive,
  ChevronRight,
} from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Expense } from '@/lib/api'

interface WorkflowVisualizationProps {
  expense: Expense
  onStatusChange?: (status: string, notes?: string) => void
  availableTransitions?: string[]
}

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    icon: Clock,
    description: 'Expense created',
    color: 'gray',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: AlertCircle,
    description: 'Being processed',
    color: 'blue',
  },
  PAID: {
    label: 'Paid',
    icon: DollarSign,
    description: 'Payment completed',
    color: 'green',
  },
  ON_HOLD: {
    label: 'On Hold',
    icon: Archive,
    description: 'Temporarily paused',
    color: 'yellow',
  },
} as const

const getStatusStyles = (color: string, isCurrent: boolean) => {
  const baseColors = {
    gray: isCurrent
      ? 'bg-gray-100 border-gray-300 ring-2 ring-gray-400'
      : 'bg-gray-50 border-gray-200',
    blue: isCurrent
      ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-400'
      : 'bg-blue-50 border-blue-200',
    green: isCurrent
      ? 'bg-green-100 border-green-300 ring-2 ring-green-400'
      : 'bg-green-50 border-green-200',
    yellow: isCurrent
      ? 'bg-yellow-100 border-yellow-300 ring-2 ring-yellow-400'
      : 'bg-yellow-50 border-yellow-200',
  }

  const iconColors = {
    gray: isCurrent ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white',
    blue: isCurrent ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white',
    green: isCurrent ? 'bg-green-600 text-white' : 'bg-green-500 text-white',
    yellow: isCurrent ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white',
  }

  const textColors = {
    gray: isCurrent ? 'text-gray-800' : 'text-gray-600',
    blue: isCurrent ? 'text-blue-800' : 'text-blue-600',
    green: isCurrent ? 'text-green-800' : 'text-green-600',
    yellow: isCurrent ? 'text-yellow-800' : 'text-yellow-600',
  }

  return {
    container: baseColors[color as keyof typeof baseColors],
    icon: iconColors[color as keyof typeof iconColors],
    text: textColors[color as keyof typeof textColors],
  }
}

export function WorkflowVisualization({
  expense,
  onStatusChange,
  availableTransitions = [],
}: WorkflowVisualizationProps) {
  const currentStatus = expense.status as keyof typeof statusConfig
  const currentConfig = statusConfig[currentStatus]
  const CurrentIcon = currentConfig.icon

  const handleTransition = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(newStatus)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Status - Center Focus */}
          <div className="flex flex-col items-center space-y-4">
            <div
              className={`p-4 rounded-full border-2 transition-all duration-200 ${getStatusStyles(currentConfig.color, true).container}`}
            >
              <div
                className={`p-3 rounded-full ${getStatusStyles(currentConfig.color, true).icon}`}
              >
                <CurrentIcon className="h-6 w-6" />
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <h3
                  className={`text-lg font-semibold ${getStatusStyles(currentConfig.color, true).text}`}
                >
                  {currentConfig.label}
                </h3>
                <Badge variant="default" className="text-xs">
                  Current
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {currentConfig.description}
              </p>
            </div>
          </div>

          {/* Available Transitions */}
          {availableTransitions.length > 0 && onStatusChange && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 text-center">
                Available Actions
              </h4>
              <div className="flex flex-wrap justify-center gap-3">
                {availableTransitions.map(status => {
                  const config =
                    statusConfig[status as keyof typeof statusConfig]
                  const TransitionIcon = config.icon
                  const styles = getStatusStyles(config.color, false)

                  return (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTransition(status)}
                      className={`flex items-center space-x-2 ${styles.container} hover:ring-2 hover:ring-offset-1`}
                    >
                      <div className={`p-1 rounded-full ${styles.icon}`}>
                        <TransitionIcon className="h-3 w-3" />
                      </div>
                      <span className={styles.text}>
                        Move to {config.label}
                      </span>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Status Info */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                {currentStatus === 'PAID'
                  ? 'Final status - no further changes allowed'
                  : `${availableTransitions.length} transition${availableTransitions.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

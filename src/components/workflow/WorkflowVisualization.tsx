import {
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Archive,
  ArrowRight,
} from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Expense } from '@/lib/api'

interface WorkflowVisualizationProps {
  expense: Expense
}

const workflowSteps = [
  {
    status: 'DRAFT',
    label: 'Draft',
    icon: Clock,
    description: 'Expense created',
  },
  {
    status: 'SUBMITTED',
    label: 'Submitted',
    icon: AlertCircle,
    description: 'Awaiting approval',
  },
  {
    status: 'APPROVED',
    label: 'Approved',
    icon: CheckCircle,
    description: 'Ready for payment',
  },
  {
    status: 'PAID',
    label: 'Paid',
    icon: DollarSign,
    description: 'Payment processed',
  },
  {
    status: 'CLOSED',
    label: 'Closed',
    icon: Archive,
    description: 'Expense complete',
  },
]

const getStepStatus = (stepStatus: string, currentStatus: string) => {
  const stepIndex = workflowSteps.findIndex(step => step.status === stepStatus)
  const currentIndex = workflowSteps.findIndex(
    step => step.status === currentStatus
  )

  if (stepIndex < currentIndex) return 'completed'
  if (stepIndex === currentIndex) return 'current'
  return 'pending'
}

const getStepStyles = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        container: 'bg-green-50 border-green-200',
        icon: 'bg-green-500 text-white',
        text: 'text-green-700',
      }
    case 'current':
      return {
        container: 'bg-blue-50 border-blue-200 ring-2 ring-blue-300',
        icon: 'bg-blue-500 text-white',
        text: 'text-blue-700',
      }
    default:
      return {
        container: 'bg-gray-50 border-gray-200',
        icon: 'bg-gray-300 text-gray-600',
        text: 'text-gray-500',
      }
  }
}

export function WorkflowVisualization({ expense }: WorkflowVisualizationProps) {
  const currentStatus = expense.status

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Desktop View - Horizontal */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between">
              {workflowSteps.map((step, _index) => {
                const stepStatus = getStepStatus(step.status, currentStatus)
                const styles = getStepStyles(stepStatus)
                const StepIcon = step.icon

                return (
                  <React.Fragment key={step.status}>
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className={`p-3 rounded-full border-2 transition-all duration-200 ${styles.container}`}
                      >
                        <div className={`p-2 rounded-full ${styles.icon}`}>
                          <StepIcon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-medium ${styles.text}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-gray-500 max-w-20">
                          {step.description}
                        </p>
                      </div>
                      {stepStatus === 'current' && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    {_index < workflowSteps.length - 1 && (
                      <div className="flex-1 flex items-center justify-center">
                        <ArrowRight
                          className={`h-5 w-5 ${
                            getStepStatus(
                              workflowSteps[_index + 1].status,
                              currentStatus
                            ) === 'completed' ||
                            getStepStatus(
                              workflowSteps[_index + 1].status,
                              currentStatus
                            ) === 'current'
                              ? 'text-blue-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Mobile View - Vertical */}
          <div className="md:hidden space-y-3">
            {workflowSteps.map((step, _index) => {
              const stepStatus = getStepStatus(step.status, currentStatus)
              const styles = getStepStyles(stepStatus)
              const StepIcon = step.icon

              return (
                <div key={step.status} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${styles.icon}`}>
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium ${styles.text}`}>
                        {step.label}
                      </p>
                      {stepStatus === 'current' && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress:</span>
              <span className="font-medium">
                {workflowSteps.findIndex(
                  step => step.status === currentStatus
                ) + 1}{' '}
                of {workflowSteps.length} steps
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((workflowSteps.findIndex(step => step.status === currentStatus) + 1) / workflowSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

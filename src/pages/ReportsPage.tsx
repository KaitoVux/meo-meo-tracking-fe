import { FileText, Calendar, DollarSign } from 'lucide-react'
import React from 'react'

import { PaymentDueReports } from '@/components/reports/PaymentDueReports'
import { ReportBuilder } from '@/components/reports/ReportBuilder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ReportsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and export comprehensive expense reports
        </p>
      </div>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Report Builder
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payment Due Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Custom Report Builder
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create custom reports with advanced filtering and export options
              </p>
            </CardHeader>
            <CardContent>
              <ReportBuilder />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Payment Due Reports
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track payments due weekly and monthly
              </p>
            </CardHeader>
            <CardContent>
              <PaymentDueReports />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

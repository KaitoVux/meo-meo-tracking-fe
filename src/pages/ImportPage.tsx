import React from 'react'

import { ImportInterface } from '@/components/import'

export default function ImportPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Import</h1>
          <p className="text-muted-foreground">
            Import expense data from CSV and Excel files
          </p>
        </div>
      </div>

      <ImportInterface />
    </div>
  )
}

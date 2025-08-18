import {
  LayoutDashboard,
  Receipt,
  FileText,
  Upload,
  Settings,
  PlusCircle,
  GitBranch,
} from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: Receipt,
  },
  {
    name: 'Workflow',
    href: '/workflow',
    icon: GitBranch,
  },
  {
    name: 'Add Expense',
    href: '/expenses/new',
    icon: PlusCircle,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    name: 'Import Data',
    href: '/import',
    icon: Upload,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  return (
    <div className="w-64 bg-card border-r">
      <div className="p-6">
        <div className="text-lg font-semibold">Navigation</div>
      </div>

      <nav className="px-4 space-y-2">
        {navigation.map(item => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

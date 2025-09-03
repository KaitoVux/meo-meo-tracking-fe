import {
  LayoutDashboard,
  Receipt,
  FileText,
  Upload,
  Settings,
  PlusCircle,
  GitBranch,
  Building2,
  FolderTree,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui'

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
    name: 'Vendors',
    href: '/vendors',
    icon: Building2,
  },
  {
    name: 'Categories',
    href: '/categories',
    icon: FolderTree,
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
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <div
      className={cn(
        'bg-card border-r transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-6 flex items-center justify-between">
        <div
          className={cn(
            'text-lg font-semibold transition-opacity duration-200',
            sidebarCollapsed ? 'opacity-0' : 'opacity-100'
          )}
        >
          {!sidebarCollapsed && 'Navigation'}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-accent transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="px-4 space-y-2">
        {navigation.map(item => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                sidebarCollapsed ? 'justify-center' : 'space-x-3',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
            title={sidebarCollapsed ? item.name : undefined}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

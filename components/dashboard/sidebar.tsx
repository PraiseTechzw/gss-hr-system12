'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  FileText, 
  DollarSign, 
  MapPin, 
  BarChart3, 
  Settings, 
  UserPlus, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Building2,
  Menu,
  X
} from 'lucide-react'
import AppLogo from '@/components/ui/app-logo'

interface SidebarProps {
  user?: {
    id: string
    email: string
    first_name: string
    last_name: string
    full_name: string
    role: 'admin' | 'manager' | 'hr'
    department_id?: string
    position?: string
    status: string
  }
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'hr']
  },
  {
    name: 'Employees',
    href: '/employees',
    icon: Users,
    roles: ['admin', 'manager', 'hr']
  },
  {
    name: 'Attendance',
    href: '/attendance',
    icon: Clock,
    roles: ['admin', 'manager', 'hr']
  },
  {
    name: 'Leave Requests',
    href: '/leave-requests',
    icon: FileText,
    roles: ['admin', 'manager', 'hr']
  },
  {
    name: 'Payroll',
    href: '/payroll',
    icon: DollarSign,
    roles: ['admin', 'manager']
  },
  {
    name: 'Deployments',
    href: '/deployments',
    icon: MapPin,
    roles: ['admin', 'manager', 'hr']
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'manager', 'hr']
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'manager']
  }
]

const adminNavigation = [
  {
    name: 'Admin Dashboard',
    href: '/admin',
    icon: Shield,
    roles: ['admin']
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: UserPlus,
    roles: ['admin']
  },
  {
    name: 'Department Management',
    href: '/admin/departments',
    icon: Building2,
    roles: ['admin']
  },
  {
    name: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: FileText,
    roles: ['admin']
  },
  {
    name: 'System Health',
    href: '/admin/system-health',
    icon: BarChart3,
    roles: ['admin']
  },
  {
    name: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['admin']
  }
]

export default function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'manager':
        return 'secondary'
      case 'hr':
        return 'default'
      default:
        return 'outline'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3" />
      case 'manager':
        return <Building2 className="w-3 h-3" />
      case 'hr':
        return <Users className="w-3 h-3" />
      default:
        return <Users className="w-3 h-3" />
    }
  }

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || 'hr')
  )

  const filteredAdminNavigation = adminNavigation.filter(item => 
    item.roles.includes(user?.role || 'hr')
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-white shadow-lg"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        collapsed && "lg:w-16"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!collapsed && (
              <AppLogo size="sm" showText={true} />
            )}
            {collapsed && (
              <AppLogo variant="icon-only" size="sm" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {/* User Info */}
          {!collapsed && user && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.full_name}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                      {getRoleIcon(user.role)}
                      <span className="ml-1">{user.role.toUpperCase()}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 mr-3 transition-colors duration-200",
                      isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-700"
                    )} />
                    {!collapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Admin Navigation */}
            {filteredAdminNavigation.length > 0 && (
              <>
                <div className="pt-4">
                  <div className="px-3 py-2">
                    {!collapsed && (
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Administration
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    {filteredAdminNavigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                            isActive
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          )}
                          onClick={() => setMobileOpen(false)}
                        >
                          <item.icon className={cn(
                            "w-5 h-5 mr-3 transition-colors duration-200",
                            isActive ? "text-red-700" : "text-gray-400 group-hover:text-gray-700"
                          )} />
                          {!collapsed && (
                            <span className="truncate">{item.name}</span>
                          )}
                          {isActive && !collapsed && (
                            <div className="ml-auto w-2 h-2 bg-red-600 rounded-full" />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                GSS HR System v2.0
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

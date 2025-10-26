export type UserRole = 'admin' | 'manager' | 'hr'

export interface RolePermissions {
  canViewDashboard: boolean
  canManageEmployees: boolean
  canManageDeployments: boolean
  canManageAttendance: boolean
  canManagePayroll: boolean
  canViewReports: boolean
  canManageSettings: boolean
  canManageUsers: boolean
  canCreateUsers: boolean
  canViewAdminPanel: boolean
  canManageDepartments: boolean
  canViewSystemActivity: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewDashboard: true,
    canManageEmployees: true,
    canManageDeployments: true,
    canManageAttendance: true,
    canManagePayroll: true,
    canViewReports: true,
    canManageSettings: true,
    canManageUsers: true,
    canCreateUsers: true,
    canViewAdminPanel: true,
    canManageDepartments: true,
    canViewSystemActivity: true,
  },
  manager: {
    canViewDashboard: true,
    canManageEmployees: true,
    canManageDeployments: true,
    canManageAttendance: true,
    canManagePayroll: true,
    canViewReports: true,
    canManageSettings: true,
    canManageUsers: false,
    canCreateUsers: false,
    canViewAdminPanel: false,
    canManageDepartments: true,
    canViewSystemActivity: true,
  },
  hr: {
    canViewDashboard: true,
    canManageEmployees: true,
    canManageDeployments: true,
    canManageAttendance: true,
    canManagePayroll: false,
    canViewReports: true,
    canManageSettings: false,
    canManageUsers: false,
    canCreateUsers: false,
    canViewAdminPanel: false,
    canManageDepartments: false,
    canViewSystemActivity: true,
  },
}

export function getRolePermissions(role: string): RolePermissions {
  const normalizedRole = role?.toLowerCase().replace('_', '') as UserRole
  return ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.hr
}

export function hasPermission(role: string, permission: keyof RolePermissions): boolean {
  const permissions = getRolePermissions(role)
  return permissions[permission]
}

export function getAccessibleRoutes(role: string): string[] {
  const permissions = getRolePermissions(role)
  const routes: string[] = ['/dashboard']
  
  if (permissions.canManageEmployees) {
    routes.push('/employees', '/employees/new')
  }
  
  if (permissions.canManageDeployments) {
    routes.push('/deployments', '/deployments/new')
  }
  
  if (permissions.canManageAttendance) {
    routes.push('/attendance')
  }
  
  if (permissions.canManagePayroll) {
    routes.push('/payroll', '/payroll/new')
  }
  
  if (permissions.canViewReports) {
    routes.push('/reports')
  }
  
  if (permissions.canManageSettings) {
    routes.push('/settings')
  }
  
  if (permissions.canManageUsers) {
    routes.push('/admin/users')
  }
  
  if (permissions.canCreateUsers) {
    routes.push('/admin/create-user')
  }
  
  if (permissions.canViewAdminPanel) {
    routes.push('/admin', '/admin/dashboard', '/admin/settings', '/admin/reports')
  }
  
  return routes
}

export function canAccessRoute(role: string, route: string): boolean {
  const accessibleRoutes = getAccessibleRoutes(role)
  return accessibleRoutes.some(accessibleRoute => 
    route.startsWith(accessibleRoute)
  )
}

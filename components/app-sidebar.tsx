"use client"

import {
  LayoutDashboard,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  Star,
  UserPlus,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useMemo } from "react"
import { useSidebarData } from "@/hooks/use-sidebar-data"
import { getRolePermissions, hasPermission } from "@/lib/role-based-access"

const quickActions = [
  { name: "Add Employee", href: "/employees/new", icon: Users, roles: ["admin", "manager", "hr"] },
  { name: "New Deployment", href: "/deployments/new", icon: MapPin, roles: ["admin", "manager", "hr"] },
  { name: "Process Payroll", href: "/payroll/new", icon: DollarSign, roles: ["admin", "manager"] },
  { name: "View Reports", href: "/reports", icon: FileText, roles: ["admin", "manager", "hr"] },
  { name: "Create User", href: "/admin/create-user", icon: UserPlus, roles: ["admin"] },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [recentPages, setRecentPages] = useState<string[]>([])
  const [favoritePages, setFavoritePages] = useState<string[]>([])

  // Get real-time data for badges and counts
  const sidebarData = useSidebarData()

  const baseNavigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Overview and analytics",
      category: "main",
      roles: ["admin", "manager", "hr"],
    },
    {
      name: "Employees",
      href: "/employees",
      icon: Users,
      description: "Manage workforce",
      category: "management",
      badge: sidebarData.loading ? "..." : sidebarData.employees.toString(),
      roles: ["admin", "manager", "hr"],
    },
    {
      name: "Deployments",
      href: "/deployments",
      icon: MapPin,
      description: "Site assignments",
      category: "management",
      badge: sidebarData.loading ? "..." : sidebarData.deployments.toString(),
      roles: ["admin", "manager", "hr"],
    },
    {
      name: "Leave & Attendance",
      href: "/attendance",
      icon: Calendar,
      description: "Time tracking",
      category: "operations",
      badge: sidebarData.loading ? "..." : sidebarData.pendingLeaves.toString(),
      roles: ["admin", "manager", "hr"],
    },
    {
      name: "Payroll",
      href: "/payroll",
      icon: DollarSign,
      description: "Salary management",
      category: "finance",
      badge: sidebarData.loading ? "..." : sidebarData.payrollRecords.toString(),
      roles: ["admin", "manager"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
      description: "Analytics & insights",
      category: "analytics",
      roles: ["admin", "manager", "hr"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      description: "System configuration",
      category: "system",
      roles: ["admin", "manager"],
    },
  ]

  const adminNavigation = [
    {
      name: "Admin Dashboard",
      href: "/admin",
      icon: Shield,
      description: "Admin overview",
      category: "admin",
      roles: ["admin"],
      isAdmin: true,
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
      description: "Manage user accounts and roles",
      category: "admin",
      badge: sidebarData.loading ? "..." : sidebarData.users.toString(),
      roles: ["admin"],
      isAdmin: true,
    },
    {
      name: "Create User",
      href: "/admin/create-user",
      icon: UserPlus,
      description: "Create new user accounts",
      category: "admin",
      roles: ["admin"],
      isAdmin: true,
    },
    {
      name: "Admin Settings",
      href: "/admin/settings",
      icon: Settings,
      description: "System configuration",
      category: "admin",
      roles: ["admin"],
      isAdmin: true,
    },
    {
      name: "Admin Reports",
      href: "/admin/reports",
      icon: FileText,
      description: "System analytics",
      category: "admin",
      roles: ["admin"],
      isAdmin: true,
    },
  ]

  const userRole = userProfile?.role || "hr"
  const normalizedRole = userRole?.toLowerCase().replace("_", "") || "hr"

  const isAdmin = normalizedRole === "admin"
  const isManager = normalizedRole === "manager"
  const isHR = normalizedRole === "hr"

  console.log("Sidebar Debug:", {
    userProfile,
    userRole,
    normalizedRole,
    isAdmin,
    adminNavigation: adminNavigation.length,
    baseNavigation: baseNavigation.length,
  })

  // Get user permissions
  const permissions = getRolePermissions(userRole)
  
  const baseFilteredNavigation = baseNavigation.filter((item) => {
    // Check role-based permissions
    switch (item.name) {
      case "Employees":
        return permissions.canManageEmployees
      case "Deployments":
        return permissions.canManageDeployments
      case "Leave & Attendance":
        return permissions.canManageAttendance
      case "Payroll":
        return permissions.canManagePayroll
      case "Reports":
        return permissions.canViewReports
      case "Settings":
        return permissions.canManageSettings
      default:
        return true
    }
  })
  
  const adminFilteredNavigation = adminNavigation.filter((item) => {
    switch (item.name) {
      case "User Management":
        return permissions.canManageUsers
      case "Create User":
        return permissions.canCreateUsers
      case "Admin Dashboard":
      case "Admin Settings":
      case "Admin Reports":
        return permissions.canViewAdminPanel
      default:
        return false
    }
  })
  
  const navigation = [...baseFilteredNavigation, ...adminFilteredNavigation]

  console.log("Filtered Navigation:", {
    baseFiltered: baseFilteredNavigation.length,
    adminFiltered: adminFilteredNavigation.length,
    total: navigation.length,
    adminItems: adminFilteredNavigation.map((item) => item.name),
  })

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        const data = await response.json()

        if (data.success && data.user) {
          setUser(data.user)
          setUserProfile(data.user)
          console.log("[Sidebar] User loaded:", data.user)
        } else {
          console.error("[Sidebar] Failed to load user:", data.error)
        }
      } catch (error) {
        console.error("[Sidebar] Error fetching user:", error)
      }
    }
    getUser()

    const savedRecent = localStorage.getItem("recentPages")
    if (savedRecent) {
      setRecentPages(JSON.parse(savedRecent))
    }

    const savedFavorites = localStorage.getItem("favoritePages")
    if (savedFavorites) {
      setFavoritePages(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    if (pathname) {
      const newRecent = [pathname, ...recentPages.filter((p) => p !== pathname)].slice(0, 5)
      setRecentPages(newRecent)
      localStorage.setItem("recentPages", JSON.stringify(newRecent))
    }
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("[Sidebar] Logout error:", error)
    }
  }

  const toggleFavorite = (href: string) => {
    const newFavorites = favoritePages.includes(href)
      ? favoritePages.filter((p) => p !== href)
      : [...favoritePages, href]
    setFavoritePages(newFavorites)
    localStorage.setItem("favoritePages", JSON.stringify(newFavorites))
  }

  const filteredNavigation = useMemo(() => {
    if (!searchQuery) return navigation
    return navigation.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  const recentNavigation = useMemo(() => {
    return recentPages
      .map((href) => navigation.find((item) => item.href === href))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .slice(0, 3)
  }, [recentPages])

  const favoriteNavigation = useMemo(() => {
    return favoritePages
      .map((href) => navigation.find((item) => item.href === href))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
  }, [favoritePages])

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-white shadow-lg transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b px-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md border border-gray-200">
              <img src="/logo.png" alt="GSS Logo" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">GSS</h1>
              <p className="text-xs text-gray-500">HR Management</p>
              {userProfile?.role && (
                <div className="flex items-center gap-1 mt-1">
                  <Shield
                    className={cn(
                      "h-3 w-3",
                      isAdmin ? "text-red-500" : isManager ? "text-purple-500" : "text-blue-500",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isAdmin ? "text-red-600" : isManager ? "text-purple-600" : "text-blue-600",
                    )}
                  >
                    {userProfile.role
                      ?.replace("_", " ")
                      .split(" ")
                      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ") || "HR"}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <img src="/logo.png" alt="GSS Logo" className="h-8 w-8 object-contain" />
          </div>
        )}
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick Actions */}
        <div className="space-y-2">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</h3>
          )}
          <div className="space-y-1">
            {quickActions.filter(action => {
              switch (action.name) {
                case "Add Employee":
                  return permissions.canManageEmployees
                case "New Deployment":
                  return permissions.canManageDeployments
                case "Process Payroll":
                  return permissions.canManagePayroll
                case "View Reports":
                  return permissions.canViewReports
                case "Create User":
                  return permissions.canCreateUsers
                default:
                  return true
              }
            }).map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group relative",
                  isCollapsed && "justify-center",
                )}
                title={isCollapsed ? action.name : undefined}
              >
                <action.icon className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                {!isCollapsed && action.name}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    {action.name}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Favorites */}
        {favoriteNavigation.length > 0 && (
          <div className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Favorites</h3>
            )}
            <div className="space-y-1">
              {favoriteNavigation.map((item) => {
                const isActive = pathname === item?.href
                return (
                  <Link
                    key={item?.name}
                    href={item?.href || "#"}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-[#a2141e] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100 hover:shadow-sm",
                      isCollapsed && "justify-center",
                    )}
                    title={isCollapsed ? item?.name : undefined}
                  >
                    {item?.icon && (
                      <item.icon className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    )}
                    {!isCollapsed && item?.name}
                    {!isCollapsed && <Star className="h-4 w-4 ml-auto text-yellow-500 flex-shrink-0" />}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                        {item?.name}
                        <Star className="h-3 w-3 text-yellow-400 ml-1 inline" />
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Pages */}
        {recentNavigation.length > 0 && (
          <div className="space-y-2">
            {!isCollapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</h3>}
            <div className="space-y-1">
              {recentNavigation.map((item) => {
                const isActive = pathname === item?.href
                return (
                  <Link
                    key={item?.name}
                    href={item?.href || "#"}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-[#a2141e] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100 hover:shadow-sm",
                      isCollapsed && "justify-center",
                    )}
                    title={isCollapsed ? item?.name : undefined}
                  >
                    {item?.icon && (
                      <item.icon className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    )}
                    {!isCollapsed && item?.name}
                    {!isCollapsed && <Clock className="h-4 w-4 ml-auto text-gray-400 flex-shrink-0" />}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                        {item?.name}
                        <Clock className="h-3 w-3 text-gray-400 ml-1 inline" />
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="space-y-2">
          {!isCollapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</h3>}
          <div className="space-y-1">
            {baseFilteredNavigation.map((item) => {
              const isActive = pathname === item.href
              const isFavorite = favoritePages.includes(item.href)
              return (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-[#a2141e] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100 hover:shadow-sm",
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-200 flex-shrink-0",
                        isActive ? "scale-110" : "group-hover:scale-105",
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {item.badge}
                              </Badge>
                            )}
                            {(item as any).isAdmin && (
                              <Badge
                                variant="destructive"
                                className="text-xs flex-shrink-0 bg-red-100 text-red-800 hover:bg-red-100"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault()
                              toggleFavorite(item.href)
                            }}
                          >
                            <Star
                              className={cn("h-3 w-3", isFavorite ? "text-yellow-500 fill-current" : "text-gray-400")}
                            />
                          </Button>
                        </div>
                      </>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                        {item.name}
                        {item.badge && <span className="ml-1 bg-gray-700 px-1 rounded text-xs">{item.badge}</span>}
                        {(item as any).isAdmin && (
                          <span className="ml-1 bg-red-600 px-1 rounded text-xs flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Admin Navigation - Only visible to admins */}
        {isAdmin && adminFilteredNavigation.length > 0 && (
          <div className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Admin Only
              </h3>
            )}
            <div className="space-y-1">
              {adminFilteredNavigation.map((item) => {
                const isActive = pathname === item.href
                const isFavorite = favoritePages.includes(item.href)
                return (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative border-l-2 border-red-200",
                        isActive
                          ? "bg-red-50 text-red-900 shadow-md border-red-400"
                          : "text-gray-700 hover:bg-red-50 hover:shadow-sm hover:border-red-300",
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-transform duration-200 flex-shrink-0",
                          isActive ? "scale-110 text-red-600" : "group-hover:scale-105 text-red-500",
                        )}
                      />
                      {!isCollapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{item.name}</span>
                              <Badge
                                variant="destructive"
                                className="text-xs flex-shrink-0 bg-red-100 text-red-800 hover:bg-red-100"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault()
                                toggleFavorite(item.href)
                              }}
                            >
                              <Star
                                className={cn("h-3 w-3", isFavorite ? "text-yellow-500 fill-current" : "text-gray-400")}
                              />
                            </Button>
                          </div>
                        </>
                      )}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-red-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                          {item.name}
                          <span className="ml-1 bg-red-600 px-1 rounded text-xs flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        </div>
                      )}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Profile Section */}
      {userProfile && (
        <div className="border-t p-4">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors",
            isCollapsed && "justify-center"
          )}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {userProfile.first_name?.[0]}{userProfile.last_name?.[0]}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile.first_name} {userProfile.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Shield
                    className={cn(
                      "h-3 w-3",
                      isAdmin ? "text-red-500" : isManager ? "text-purple-500" : "text-blue-500",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isAdmin ? "text-red-600" : isManager ? "text-purple-600" : "text-blue-600",
                    )}
                  >
                    {userProfile.role
                      ?.replace("_", " ")
                      .split(" ")
                      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ") || "HR"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapse Toggle and Logout */}
      <div className="border-t p-4 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full justify-start gap-3 text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200 group",
            isCollapsed && "justify-center",
          )}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft className="h-4 w-4 group-hover:scale-110 transition-transform" />
          )}
          {!isCollapsed && <span className="text-sm font-medium">Collapse Sidebar</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
              Expand Sidebar
            </div>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group",
            isCollapsed && "justify-center",
          )}
          title={isCollapsed ? "Logout" : "Logout"}
        >
          <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-red-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
              Logout
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}

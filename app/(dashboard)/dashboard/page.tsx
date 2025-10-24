import { createClient } from "@/lib/supabase/server"
import { StatsCard } from "@/components/dashboard/stats-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { SystemStatus } from "@/components/dashboard/system-status"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { AttendanceChart, PayrollChart } from "@/components/dashboard/attendance-chart"
import { getDashboardStats, getPayrollStats, getAttendanceStats } from "@/lib/database-utils"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch comprehensive dashboard statistics using utility functions
  const [dashboardStats, payrollStats, attendanceStats] = await Promise.all([
    getDashboardStats(),
    getPayrollStats(),
    getAttendanceStats()
  ])

  const stats = [
    {
      title: "Total Employees",
      value: dashboardStats.totalEmployees,
      iconName: "Users",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: { value: dashboardStats.activeEmployees, label: "active employees" },
      description: "Active workforce",
    },
    {
      title: "Active Deployments",
      value: dashboardStats.activeDeployments,
      iconName: "MapPin",
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: { value: dashboardStats.totalDeployments, label: "total deployments" },
      description: "Current assignments",
    },
    {
      title: "Attendance Rate",
      value: `${attendanceStats.attendanceRate}%`,
      iconName: "Calendar",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: { value: attendanceStats.presentDays, label: "present days (30d)" },
      description: "Last 30 days",
    },
    {
      title: "Monthly Payroll",
      value: `USD $${payrollStats.totalPayroll.toLocaleString()}`,
      iconName: "DollarSign",
      color: "text-[#a2141e]",
      bgColor: "bg-red-50",
      trend: { value: payrollStats.monthlyGrowth, label: "vs last month" },
      description: "Total processed",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-400/20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-gradient-to-br from-cyan-400/10 to-blue-400/10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative z-10 space-y-8 p-6">
        {/* Enhanced Header with more animations */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#150057] via-[#1a0066] to-[#a2141e] p-8 text-white shadow-2xl transform transition-all duration-500 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="h-8 w-8 rounded-lg bg-white/30"></div>
                  </div>
                  <div>
                    <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Dashboard
                    </h1>
                    <p className="text-xl text-blue-100 mt-2">
                      Welcome to GSS HR & Payroll Management System
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 backdrop-blur-sm border border-green-400/30">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-100">All systems operational</span>
                  </div>
                  <div className="text-sm text-blue-200 bg-white/10 px-3 py-1 rounded-full">
                    Last updated: {new Date().toLocaleDateString()}
                  </div>
                  <div className="text-sm text-blue-200 bg-white/10 px-3 py-1 rounded-full">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="rounded-3xl bg-white/10 p-8 backdrop-blur-sm border border-white/20">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">24/7</div>
                    <div className="text-sm text-blue-100">System Uptime</div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                      <div className="bg-green-400 h-2 rounded-full w-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Enhanced decorative elements */}
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/5 animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/4 right-1/4 h-20 w-20 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Enhanced Statistics Cards with advanced animations */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl border border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105"
              style={{ 
                animationDelay: `${index * 150}ms`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-slate-100/30"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`rounded-2xl p-4 ${stat.bgColor} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`h-8 w-8 ${stat.color} relative`}>
                      <div className="absolute inset-0 rounded-lg bg-current opacity-60 rounded-lg"></div>
                      <div className="absolute inset-1 rounded-md bg-current opacity-80"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900 group-hover:text-[#150057] transition-colors duration-300">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-500">{stat.title}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 font-medium">{stat.description}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {stat.trend.value} {stat.trend.label}
                    </div>
                    <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Enhanced Charts Section with glassmorphism */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <div className="h-4 w-4 rounded bg-white/80"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Attendance Overview</h3>
                </div>
                <p className="text-gray-600">Employee attendance trends and patterns</p>
              </div>
              <AttendanceChart />
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                    <div className="h-4 w-4 rounded bg-white/80"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Payroll Analytics</h3>
                </div>
                <p className="text-gray-600">Monthly payroll distribution and insights</p>
              </div>
              <PayrollChart />
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions and System Status */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <div className="h-4 w-4 rounded bg-white/80"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
                </div>
                <p className="text-gray-600">Common tasks and shortcuts for efficiency</p>
              </div>
              <QuickActions />
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <div className="h-4 w-4 rounded bg-white/80"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">System Status</h3>
                </div>
                <p className="text-gray-600">Current system health and performance</p>
              </div>
              <SystemStatus />
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <div className="h-4 w-4 rounded bg-white/80"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
              </div>
              <p className="text-gray-600">Latest system activities and updates</p>
            </div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

import DashboardLayout from '@/components/dashboard/dashboard-layout'
import SystemHealth from '@/components/admin/system-health'

export default function SystemHealthPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600 mt-2">
            Monitor system performance, component status, and resource utilization.
          </p>
        </div>

        {/* System Health Component */}
        <SystemHealth />
      </div>
    </DashboardLayout>
  )
}



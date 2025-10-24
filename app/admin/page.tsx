import DashboardLayout from '@/components/dashboard/dashboard-layout'
import AdminOverview from '@/components/admin/admin-overview'
import BackendTest from '@/components/admin/backend-test'

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage users, departments, and system settings for your HR system.
          </p>
        </div>

        {/* Backend Connection Test */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <BackendTest />
        </div>

        {/* Admin Overview Component */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <AdminOverview />
        </div>
      </div>
    </DashboardLayout>
  )
}

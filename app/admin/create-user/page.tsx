import DashboardLayout from '@/components/dashboard/dashboard-layout'
import CreateUserForm from '@/components/admin/create-user-form'

export default function CreateUserPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold text-[#150057]">Create User Account</h1>
          <p className="text-gray-600 mt-2">
            Provision a new account for an administrator, manager, or HR professional.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <CreateUserForm />
        </div>
      </div>
    </DashboardLayout>
  )
}

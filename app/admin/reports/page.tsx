import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, TrendingUp, Users, MapPin, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

const reportTypes = [
  {
    title: "Employee Demographics",
    description: "Distribution by department, role, and gender.",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  {
    title: "Payroll Summary",
    description: "Monthly payroll totals, taxes, and net pay.",
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-100"
  },
  {
    title: "Attendance Analysis",
    description: "Clock-in/out patterns and absenteeism rates.",
    icon: Calendar,
    color: "text-purple-600",
    bg: "bg-purple-100"
  },
  {
    title: "Deployment Map",
    description: "Geographic distribution of site assignments.",
    icon: MapPin,
    color: "text-red-600",
    bg: "bg-red-100"
  },
  {
    title: "System Audit",
    description: "Security events and administrative actions.",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-orange-100"
  }
]

export default function AdminReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#150057]">Admin Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive system analytics and cross-departmental insights.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reportTypes.map((report) => (
            <Card key={report.title} className="hover:shadow-lg transition-all duration-300 border-gray-200">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${report.bg}`}>
                    <report.icon className={`w-6 h-6 ${report.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-[#150057]">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#150057] hover:bg-[#0d003a]">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#150057]">Recent Generated Reports</CardTitle>
            <CardDescription>History of automated and manual reports generated in the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No recent reports found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

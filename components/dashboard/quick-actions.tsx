"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  UserPlus, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText, 
  Clock,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const quickActions = [
  {
    title: "Add Employee",
    description: "Register a new employee",
    icon: UserPlus,
    href: "/employees/new",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
  },
  {
    title: "Create Deployment",
    description: "Assign employee to location",
    icon: MapPin,
    href: "/deployments/new",
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100",
  },
  {
    title: "Process Payroll",
    description: "Generate monthly payroll",
    icon: DollarSign,
    href: "/payroll/new",
    color: "text-[#a2141e]",
    bgColor: "bg-red-50 hover:bg-red-100",
  },
  {
    title: "View Attendance",
    description: "Check employee attendance",
    icon: Calendar,
    href: "/attendance",
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100",
  },
  {
    title: "Leave Requests",
    description: "Review pending leaves",
    icon: Clock,
    href: "/attendance",
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100",
  },
  {
    title: "Generate Report",
    description: "Create system reports",
    icon: FileText,
    href: "/reports",
    color: "text-gray-600",
    bgColor: "bg-gray-50 hover:bg-gray-100",
  },
]

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Quick Actions
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-auto p-4 transition-all duration-200 hover:shadow-md",
                  action.bgColor
                )}
              >
                <div className={cn("rounded-lg p-2", action.bgColor)}>
                  <action.icon className={cn("h-5 w-5", action.color)} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{action.title}</div>
                  <div className="text-sm text-gray-500">{action.description}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}









import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import DashboardHeader from "@/components/dashboard/header"
import { cookies } from "next/headers"
import { AuthService } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cn } from "@/lib/utils"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  const tokenResult = AuthService.verifyToken(token)
  if (!tokenResult.valid || !tokenResult.user) {
    redirect("/auth/login")
  }

  const user = await AuthService.getUserById(tokenResult.user.id)
  
  // Debug: Log user data
  console.log("Layout - Token result:", tokenResult)
  console.log("Layout - User data:", user)
  
  // Create user data with fallbacks
  const userData = user ? {
    ...user,
    full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
    role: user.role || 'hr',
    status: user.status || 'active'
  } : {
    id: tokenResult.user.id,
    email: tokenResult.user.email,
    first_name: 'Admin',
    last_name: 'User',
    full_name: 'Admin User',
    role: 'admin' as const,
    status: 'active'
  }
  
  console.log("Layout - Final user data:", userData)

  return (
    <div className={cn(
      "flex h-screen overflow-hidden transition-colors duration-200",
      "bg-gray-50 dark:bg-gray-900"
    )}>
      <AppSidebar user={userData} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={userData} />
        <main className={cn(
          "flex-1 overflow-y-auto transition-colors duration-200",
          "bg-gray-50 dark:bg-gray-900"
        )}>
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

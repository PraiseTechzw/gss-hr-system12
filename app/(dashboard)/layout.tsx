import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import DashboardHeader from "@/components/dashboard/header"
import { cookies } from "next/headers"
import { AuthService } from "@/lib/auth"
import { redirect } from "next/navigation"

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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user || undefined} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

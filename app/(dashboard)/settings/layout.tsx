import type React from "react"
import { cookies } from "next/headers"
import { AuthService } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  const tokenResult = AuthService.verifyToken(token)
  if (!tokenResult.valid || !tokenResult.user) {
    redirect("/auth/login")
  }

  // Only admin and hr can access settings
  if (!["admin", "hr"].includes(tokenResult.user.role)) {
    redirect("/dashboard")
  }

  return <>{children}</>
}

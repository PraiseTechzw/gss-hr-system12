import { cookies } from "next/headers"
import { AuthService } from "@/lib/auth-service"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
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

  // Check if user has admin role (support both "admin" and "super_admin")
  const userRole = tokenResult.user.role?.toLowerCase() || ""
  const isAdmin = userRole === "admin" || userRole === "super_admin"

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Get fresh user data from database (optional check)
  try {
    const user = await AuthService.getUserById(tokenResult.user.id)
    
    if (user) {
      const dbRole = user.role?.toLowerCase() || ""
      const dbIsAdmin = dbRole === "admin" || dbRole === "super_admin"
      
      // Only redirect if DB explicitly says user is NOT admin
      if (user.role && !dbIsAdmin) {
        redirect("/dashboard")
      }
    }
  } catch (error) {
    // Don't block access if DB check fails - trust the token
  }

  return <>{children}</>
}


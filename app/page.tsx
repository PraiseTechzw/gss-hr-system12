import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AuthService } from "@/lib/auth"

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (token) {
    const tokenResult = AuthService.verifyToken(token)
    if (tokenResult.valid && tokenResult.user) {
      redirect("/dashboard")
    }
  }
  
  redirect("/auth/login")
}

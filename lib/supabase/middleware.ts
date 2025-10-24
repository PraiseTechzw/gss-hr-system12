import { NextResponse, type NextRequest } from "next/server"
import { AuthService } from "@/lib/auth"

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('auth-token')?.value

  console.log("[Middleware] Path:", pathname, "| Has Token:", !!token)

  const isAuthRoute = pathname.startsWith("/auth")
  const isAdminRoute = pathname.startsWith("/admin")
  const isApiRoute = pathname.startsWith("/api")

  // Allow API routes to handle their own authentication
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Check authentication
  let isAuthenticated = false
  let userRole = null

  if (token) {
    const tokenResult = AuthService.verifyToken(token)
    if (tokenResult.valid && tokenResult.user) {
      isAuthenticated = true
      userRole = tokenResult.user.role
    }
  }

  // Redirect unauthenticated users to login (except for auth routes and home)
  if (!isAuthenticated && !isAuthRoute && pathname !== "/") {
    console.log("[Middleware] No authentication, redirecting to /auth/login")
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    console.log("[Middleware] User authenticated, redirecting to /dashboard")
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Check admin routes
  if (isAdminRoute && (!isAuthenticated || userRole !== 'admin')) {
    console.log("[Middleware] Admin access required, redirecting to /dashboard")
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple JWT verification for edge runtime (without crypto module)
function verifyTokenSimple(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [header, payload, signature] = parts
    
    // Decode payload
    const decodedPayload = JSON.parse(atob(payload))
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (decodedPayload.exp && decodedPayload.exp < now) {
      return null
    }
    
    // Simple signature verification
    const jwtSecret = process.env.NEXTAUTH_SECRET || "your-secret-key"
    const expectedSignature = btoa(`${header}.${payload}.${jwtSecret}`)
    if (signature !== expectedSignature) {
      return null
    }

    return decodedPayload
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/register", "/"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  try {
    // Verify token
    const payload = verifyTokenSimple(token)

    if (!payload) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    if (pathname.startsWith("/admin")) {
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    if (pathname.startsWith("/approvals")) {
      if (payload.role !== "admin" && payload.role !== "manager") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    if (pathname.startsWith("/payroll")) {
      if (payload.role !== "admin" && payload.role !== "manager") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware auth error:", error)
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

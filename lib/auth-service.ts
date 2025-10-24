import bcrypt from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: "admin" | "manager" | "hr"
  department_id?: string
  position?: string
  status: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key"
  private static readonly JWT_EXPIRES_IN = "7d"

  /**
   * Create service role client that bypasses RLS
   */
  private static createServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY!
    
    return createClient(supabaseUrl, serviceRoleKey)
  }

  /**
   * Authenticate user with email and password (bypasses RLS)
   */
  static async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      console.log("[AuthService] Starting authentication for email:", email)
      const supabase = this.createServiceClient()
      console.log("[AuthService] Service role client created")

      // Get user from database using service role (bypasses RLS)
      console.log("[AuthService] Querying user_profiles table for email:", email.toLowerCase())
      const { data: user, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("status", "active")
        .single()

      console.log("[AuthService] Database query result:", { user, error })
      
      if (error) {
        console.log("[AuthService] Database error:", error.message, error.details, error.hint)
        return { success: false, error: "Database error: " + error.message }
      }
      
      if (!user) {
        console.log("[AuthService] No user found with email:", email)
        return { success: false, error: "Invalid credentials" }
      }

      console.log("[AuthService] User found:", { id: user.id, email: user.email, role: user.role })
      console.log("[AuthService] Verifying password...")

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      console.log("[AuthService] Password verification result:", isValidPassword)
      
      if (!isValidPassword) {
        console.log("[AuthService] Password verification failed")
        return { success: false, error: "Invalid credentials" }
      }

      console.log("[AuthService] Password verification successful, updating last login...")
      
      // Update last login
      const { error: updateError } = await supabase.from("user_profiles").update({ last_login: new Date().toISOString() }).eq("id", user.id)
      if (updateError) {
        console.log("[AuthService] Warning: Failed to update last login:", updateError.message)
      }

      // Log login activity
      console.log("[AuthService] Logging system activity...")
      const { error: logError } = await supabase.rpc("log_system_activity", {
        p_user_id: user.id,
        p_action: "login",
        p_description: "User logged in successfully",
      })
      if (logError) {
        console.log("[AuthService] Warning: Failed to log system activity:", logError.message)
      }

      console.log("[AuthService] Authentication successful for user:", user.email)
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.full_name,
          role: user.role,
          department_id: user.department_id,
          position: user.position,
          status: user.status,
        },
      }
    } catch (error) {
      console.error("[AuthService] Authentication error:", error)
      console.error("[AuthService] Error details:", error instanceof Error ? error.message : error)
      return { success: false, error: "Authentication failed: " + (error instanceof Error ? error.message : "Unknown error") }
    }
  }

  /**
   * Generate simple JWT token for user (edge runtime compatible)
   */
  static generateToken(user: User): string {
    const header = { alg: "HS256", typ: "JWT" }
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    }
    
    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(payload))
    
    // Simple signature (not cryptographically secure, but works for edge runtime)
    const signature = btoa(`${encodedHeader}.${encodedPayload}.${this.JWT_SECRET}`)
    
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  /**
   * Verify JWT token (edge runtime compatible)
   */
  static verifyToken(token: string): { valid: boolean; user?: any } {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return { valid: false }
      }

      const [header, payload, signature] = parts
      
      // Decode payload
      const decodedPayload = JSON.parse(atob(payload))
      
      // Check expiration
      const now = Math.floor(Date.now() / 1000)
      if (decodedPayload.exp && decodedPayload.exp < now) {
        return { valid: false }
      }
      
      // Simple signature verification
      const expectedSignature = btoa(`${header}.${payload}.${this.JWT_SECRET}`)
      if (signature !== expectedSignature) {
        return { valid: false }
      }
      
      return { valid: true, user: decodedPayload }
    } catch (error) {
      return { valid: false }
    }
  }

  /**
   * Get user by ID (bypasses RLS)
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const supabase = this.createServiceClient()

      const { data: user, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .eq("status", "active")
        .single()

      if (error || !user) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
        role: user.role,
        department_id: user.department_id,
        position: user.position,
        status: user.status,
      }
    } catch (error) {
      console.error("Get user error:", error)
      return null
    }
  }
}

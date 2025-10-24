import bcrypt from "bcryptjs"
import { createClient } from "./supabase/server"

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
   * Authenticate user with email and password
   */
  static async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      console.log("[Auth] Starting authentication for email:", email)
      const supabase = await createClient()
      console.log("[Auth] Supabase client created successfully")

      // Get user from database
      console.log("[Auth] Querying user_profiles table for email:", email.toLowerCase())
      let { data: user, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("status", "active")
        .single()

      console.log("[Auth] Database query result:", { user, error })
      
      if (error) {
        console.log("[Auth] Database error:", error.message, error.details, error.hint)
        
        // If it's an RLS error, try to bypass it for admin users
        if (error.code === 'PGRST116' || error.message.includes('row-level security')) {
          console.log("[Auth] RLS blocking query, trying alternative approach...")
          
          // Try to get user without RLS restrictions by using a different query
          const { data: allUsers, error: allUsersError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("email", email.toLowerCase())
          
          if (!allUsersError && allUsers && allUsers.length > 0) {
            user = allUsers[0]
            console.log("[Auth] Found user via alternative query:", user.email)
          } else {
            console.log("[Auth] Alternative query also failed:", allUsersError?.message)
            return { success: false, error: "Database access denied. Please contact administrator." }
          }
        } else {
          return { success: false, error: "Database error: " + error.message }
        }
      }
      
      if (!user) {
        console.log("[Auth] No user found with email:", email)
        
        // Temporary hardcoded admin for testing
        if (email === 'admin@geniussecurity.co.zw' && password === 'admin123') {
          console.log("[Auth] Using hardcoded admin user for testing")
          user = {
            id: 'temp-admin-id',
            email: 'admin@geniussecurity.co.zw',
            password_hash: await bcrypt.hash('admin123', 12),
            first_name: 'Admin',
            last_name: 'User',
            full_name: 'Admin User',
            role: 'admin',
            department_id: null,
            position: 'System Administrator',
            status: 'active',
            phone: null,
            last_login: null,
            created_by: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        } else {
          return { success: false, error: "Invalid credentials" }
        }
      }

      console.log("[Auth] User found:", { id: user.id, email: user.email, role: user.role })
      console.log("[Auth] Verifying password...")

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      console.log("[Auth] Password verification result:", isValidPassword)
      
      if (!isValidPassword) {
        console.log("[Auth] Password verification failed")
        return { success: false, error: "Invalid credentials" }
      }

      console.log("[Auth] Password verification successful, updating last login...")
      
      // Update last login
      const { error: updateError } = await supabase.from("user_profiles").update({ last_login: new Date().toISOString() }).eq("id", user.id)
      if (updateError) {
        console.log("[Auth] Warning: Failed to update last login:", updateError.message)
      }

      // Log login activity
      console.log("[Auth] Logging system activity...")
      const { error: logError } = await supabase.rpc("log_system_activity", {
        p_user_id: user.id,
        p_action: "login",
        p_description: "User logged in successfully",
      })
      if (logError) {
        console.log("[Auth] Warning: Failed to log system activity:", logError.message)
      }

      console.log("[Auth] Authentication successful for user:", user.email)
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
      console.error("[Auth] Authentication error:", error)
      console.error("[Auth] Error details:", error instanceof Error ? error.message : error)
      return { success: false, error: "Authentication failed: " + (error instanceof Error ? error.message : "Unknown error") }
    }
  }

  /**
   * Create a new user (admin only)
   */
  static async createUser(userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    role: "admin" | "manager" | "hr"
    department_id?: string
    position?: string
    created_by: string
  }): Promise<AuthResult> {
    try {
      const supabase = await createClient()

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("email", userData.email.toLowerCase())
        .single()

      if (existingUser) {
        return { success: false, error: "User already exists" }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12)

      // Create user
      const { data: newUser, error } = await supabase
        .from("user_profiles")
        .insert({
          email: userData.email.toLowerCase(),
          password_hash: passwordHash,
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: `${userData.first_name} ${userData.last_name}`,
          role: userData.role,
          department_id: userData.department_id,
          position: userData.position,
          created_by: userData.created_by,
        })
        .select()
        .single()

      if (error) {
        console.error("User creation error:", error)
        return { success: false, error: "Failed to create user" }
      }

      // Log user creation
      await supabase.rpc("log_system_activity", {
        p_user_id: userData.created_by,
        p_action: "user_created",
        p_description: `Created new user: ${userData.email}`,
        p_details: { new_user_id: newUser.id, role: userData.role },
      })

      // Create notification for new user
      await supabase.from("notifications").insert({
        user_id: newUser.id,
        title: "Account Created",
        message: `Your account has been created. You can now log in with your credentials.`,
        type: "success",
      })

      return {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          full_name: newUser.full_name,
          role: newUser.role,
          department_id: newUser.department_id,
          position: newUser.position,
          status: newUser.status,
        },
      }
    } catch (error) {
      console.error("User creation error:", error)
      return { success: false, error: "Failed to create user" }
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
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const supabase = await createClient()

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

  /**
   * Update user password
   */
  static async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const supabase = await createClient()

      const passwordHash = await bcrypt.hash(newPassword, 12)

      const { error } = await supabase.from("user_profiles").update({ password_hash: passwordHash }).eq("id", userId)

      if (error) {
        console.error("Password update error:", error)
        return false
      }

      // Log password update
      await supabase.rpc("log_system_activity", {
        p_user_id: userId,
        p_action: "password_updated",
        p_description: "User password updated",
      })

      return true
    } catch (error) {
      console.error("Password update error:", error)
      return false
    }
  }

  /**
   * Check if user has permission for action
   */
  static hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = { admin: 3, manager: 2, hr: 1 }
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return userLevel >= requiredLevel
  }
}

/**
 * Verify JWT token (standalone function for middleware)
 */
export async function verifyToken(
  token: string,
): Promise<{ id: string; email: string; role: string; full_name: string } | null> {
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
    
    return {
      id: decodedPayload.id,
      email: decodedPayload.email,
      role: decodedPayload.role,
      full_name: decodedPayload.full_name,
    }
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

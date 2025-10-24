import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createClient } from './supabase/server'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: 'admin' | 'manager' | 'hr'
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
  private static readonly JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'
  private static readonly JWT_EXPIRES_IN = '7d'

  /**
   * Authenticate user with email and password
   */
  static async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      const supabase = await createClient()
      
      // Get user from database
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('status', 'active')
        .single()

      if (error || !user) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)

      // Log login activity
      await supabase.rpc('log_system_activity', {
        p_user_id: user.id,
        p_action: 'login',
        p_description: 'User logged in successfully'
      })

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
          status: user.status
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      return { success: false, error: 'Authentication failed' }
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
    role: 'admin' | 'manager' | 'hr'
    department_id?: string
    position?: string
    created_by: string
  }): Promise<AuthResult> {
    try {
      const supabase = await createClient()
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', userData.email.toLowerCase())
        .single()

      if (existingUser) {
        return { success: false, error: 'User already exists' }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12)
      
      // Create user
      const { data: newUser, error } = await supabase
        .from('user_profiles')
        .insert({
          email: userData.email.toLowerCase(),
          password_hash: passwordHash,
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: `${userData.first_name} ${userData.last_name}`,
          role: userData.role,
          department_id: userData.department_id,
          position: userData.position,
          created_by: userData.created_by
        })
        .select()
        .single()

      if (error) {
        console.error('User creation error:', error)
        return { success: false, error: 'Failed to create user' }
      }

      // Log user creation
      await supabase.rpc('log_system_activity', {
        p_user_id: userData.created_by,
        p_action: 'user_created',
        p_description: `Created new user: ${userData.email}`,
        p_details: { new_user_id: newUser.id, role: userData.role }
      })

      // Create notification for new user
      await supabase
        .from('notifications')
        .insert({
          user_id: newUser.id,
          title: 'Account Created',
          message: `Your account has been created. You can now log in with your credentials.`,
          type: 'success'
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
          status: newUser.status
        }
      }
    } catch (error) {
      console.error('User creation error:', error)
      return { success: false, error: 'Failed to create user' }
    }
  }

  /**
   * Generate JWT token for user
   */
  static generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    )
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): { valid: boolean; user?: any } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any
      return { valid: true, user: decoded }
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
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .eq('status', 'active')
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
        status: user.status
      }
    } catch (error) {
      console.error('Get user error:', error)
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
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ password_hash: passwordHash })
        .eq('id', userId)

      if (error) {
        console.error('Password update error:', error)
        return false
      }

      // Log password update
      await supabase.rpc('log_system_activity', {
        p_user_id: userId,
        p_action: 'password_updated',
        p_description: 'User password updated'
      })

      return true
    } catch (error) {
      console.error('Password update error:', error)
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

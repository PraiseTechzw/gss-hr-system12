"use client"

import type React from "react"

// Supabase client removed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Shield, AlertCircle, CheckCircle2, X, Lock, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordInput } from "@/components/auth/password-input"
import { LoadingButton } from "@/components/auth/loading-button"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})
  const router = useRouter()

  const validatePassword = (password: string) => {
    if (!password) return "Password is required"
    if (password.length < 6) return "Password must be at least 6 characters"
    return null
  }

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return "Please confirm your password"
    if (password !== confirmPassword) return "Passwords do not match"
    return null
  }

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'password':
        setPassword(value)
        setFieldErrors(prev => ({ 
          ...prev, 
          password: validatePassword(value),
          confirmPassword: confirmPassword ? validateConfirmPassword(confirmPassword) : undefined
        }))
        break
      case 'confirmPassword':
        setConfirmPassword(value)
        setFieldErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(value) }))
        break
    }
    if (error) setError(null)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const passwordError = validatePassword(password)
    const confirmPasswordError = validateConfirmPassword(confirmPassword)
    
    setFieldErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError
    })
    
    if (passwordError || confirmPasswordError) {
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })
      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#150057] via-[#1a0066] to-[#a2141e] p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
            <img 
              src="/logo.png" 
              alt="GSS Logo" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white text-balance">GSS HR & Payroll</h1>
          <p className="mt-2 text-lg text-gray-200">HR & Payroll Management System</p>
        </div>

        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {success ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Password updated successfully! Redirecting to login...
                  </AlertDescription>
                </Alert>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    You can now sign in with your new password
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    New Password
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    placeholder="Enter your new password"
                    required
                    showStrength={true}
                  />
                  {fieldErrors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm New Password
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your new password"
                    required
                  />
                  {confirmPassword && (
                    <div className="flex items-center gap-2 text-sm">
                      {password === confirmPassword ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Passwords match
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <X className="h-4 w-4" />
                          Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                  {fieldErrors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <LoadingButton
                  isLoading={isLoading}
                  loadingText="Updating..."
                  type="submit"
                  className="mt-6"
                >
                  <span className="flex items-center gap-2">
                    Update Password
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </LoadingButton>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-200">
          Secure access for authorized administrators only
        </p>
      </div>
    </div>
  )
}

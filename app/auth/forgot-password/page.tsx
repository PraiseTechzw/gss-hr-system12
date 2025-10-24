"use client"

import type React from "react"

// Supabase client removed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Shield, AlertCircle, CheckCircle2, ArrowLeft, Mail, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormField } from "@/components/auth/form-field"
import { LoadingButton } from "@/components/auth/loading-button"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return "Email is required"
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return null
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setEmailError(validateEmail(value))
    if (error) setError(null)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email
    const emailValidation = validateEmail(email)
    setEmailError(emailValidation)
    
    if (emailValidation) {
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSuccess(true)
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
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {success ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Password reset link sent! Check your email inbox for instructions.
                  </AlertDescription>
                </Alert>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Check your spam folder if you don't see the email
                  </div>
                </div>
                <LoadingButton asChild className="w-full">
                  <Link href="/auth/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Link>
                </LoadingButton>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <FormField
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="admin@gss.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  error={emailError}
                  icon={Mail}
                />

                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <LoadingButton
                  isLoading={isLoading}
                  loadingText="Sending..."
                  type="submit"
                  className="mt-6"
                >
                  <span className="flex items-center gap-2">
                    Send Reset Link
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </LoadingButton>

                <LoadingButton asChild variant="ghost" className="w-full">
                  <Link href="/auth/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Link>
                </LoadingButton>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-200">
          Remember your password?{" "}
          <Link href="/auth/login" className="font-medium text-white hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

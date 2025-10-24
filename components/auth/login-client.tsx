"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Mail, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormField } from "@/components/auth/form-field"
import { PasswordInput } from "@/components/auth/password-input"
import { LoadingButton } from "@/components/auth/loading-button"
import { toast } from "sonner"

export default function LoginClient() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | undefined>(undefined)
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined)
  const router = useRouter()
  const searchParams = useSearchParams()
  const accountNotFound = searchParams.get("message") === "account-not-found"
  const profileCreationFailed = searchParams.get("message") === "profile-creation-failed"
  const accountError = searchParams.get("message") === "account-error"

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return "Email is required"
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return undefined
  }

  const validatePassword = (password: string) => {
    if (!password) return "Password is required"
    if (password.length < 6) return "Password must be at least 6 characters"
    return undefined
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setEmailError(undefined)
    setPasswordError(undefined)

    const emailValidation = validateEmail(email)
    const passwordValidation = validatePassword(password)

    if (emailValidation) {
      setEmailError(emailValidation)
      return
    }

    if (passwordValidation) {
      setPasswordError(passwordValidation)
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        setError(error.message)
        toast.error("Login failed", {
          description: error.message
        })
        return
      }

      if (data.user) {
        toast.success("Welcome to GSS HR & Payroll Management System", {
          description: "You have successfully logged in"
        })
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
      toast.error("Login failed", {
        description: "An unexpected error occurred. Please try again."
      })
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
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {accountNotFound && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  Your account is not registered in the system. Please contact your system administrator to create an account.
                </AlertDescription>
              </Alert>
            )}

            {profileCreationFailed && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertDescription className="text-orange-800">
                  There was an issue setting up your account. Please try logging in again or contact support if the problem persists.
                </AlertDescription>
              </Alert>
            )}

            {accountError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  An error occurred while accessing your account. Please try again or contact support.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <FormField
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) setEmailError(undefined)
                }}
                placeholder="Enter your email address"
                error={emailError}
                icon={Mail}
                required
              />

              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (passwordError) setPasswordError(undefined)
                  }}
                  placeholder="Enter your password"
                  required
                />
                {passwordError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {passwordError}
                  </p>
                )}
              </div>

              <LoadingButton
                type="submit"
                isLoading={isLoading}
                loadingText="Signing in..."
                className="w-full bg-[#a2141e] hover:bg-[#8a1119] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Sign In
                <ArrowRight className="h-4 w-4" />
              </LoadingButton>
            </form>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="text-center text-sm">
                <span className="text-gray-600">Need access? </span>
                <span className="text-gray-500">
                  Contact your system administrator to create an account
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-200">
          Secure access for authorized personnel only
        </p>
      </div>
    </div>
  )
}
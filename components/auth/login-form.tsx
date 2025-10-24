'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Shield, Building2, Lock, Mail, CheckCircle, XCircle } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface LoginFormData {
  email: string
  password: string
}

export default function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Show loading toast
    const loadingToast = toast.loading('Signing you in...', {
      description: 'Please wait while we authenticate your credentials',
    })

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Dismiss loading toast
        toast.dismiss(loadingToast)
        
        // Show success toast
        toast.success('Welcome back!', {
          description: `Hello ${data.user?.first_name || 'User'}, you're now signed in`,
          icon: <CheckCircle className="w-4 h-4" />,
          duration: 2000,
        })

        // Small delay for better UX
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 500)
      } else {
        // Dismiss loading toast
        toast.dismiss(loadingToast)
        
        // Show error toast
        toast.error('Login failed', {
          description: data.error || 'Invalid credentials. Please try again.',
          icon: <XCircle className="w-4 h-4" />,
          duration: 4000,
        })
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      // Show error toast
      toast.error('Connection error', {
        description: 'Unable to connect to the server. Please check your internet connection.',
        icon: <XCircle className="w-4 h-4" />,
        duration: 4000,
      })
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-in fade-in slide-in-from-left-4 duration-700">
          {/* Logo */}
          <div className="flex items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center mr-4 transform transition-all duration-300 hover:scale-105">
              <Image
                src="/logo.png"
                alt="GSS HR Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to placeholder if logo doesn't exist
                  e.currentTarget.src = '/placeholder-logo.png'
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GSS HR</h1>
              <p className="text-base text-gray-500">Human Resources System</p>
            </div>
          </div>

          {/* Login Form */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 animate-in fade-in slide-in-from-left-2 duration-500 delay-400">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-600 animate-in fade-in slide-in-from-left-2 duration-500 delay-500">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="animate-in fade-in slide-in-from-left-2 duration-500 delay-700">
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="animate-in fade-in slide-in-from-left-2 duration-500 delay-800">
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 hover:text-blue-500"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between animate-in fade-in slide-in-from-left-2 duration-500 delay-900">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500 delay-1000"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Need help?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <span className="font-medium text-blue-600">
                    Contact your administrator
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-gradient-to-br from-blue-600 to-red-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white">
          <div className="mx-auto max-w-md">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/30 shadow-2xl">
              <Image
                src="/logo.png"
                alt="GSS HR Logo"
                width={100}
                height={100}
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  // Fallback to placeholder if logo doesn't exist
                  e.currentTarget.src = '/placeholder-logo.png'
                }}
              />
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              GSS HR Management System
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Streamline your human resources operations with our comprehensive management platform.
            </p>
            
            {/* Features */}
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Employee Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Attendance Tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Payroll Processing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Leave Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">Advanced Reporting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

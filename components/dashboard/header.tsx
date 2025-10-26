"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, User, LogOut, Settings, Moon, Sun, Shield, Mail, Phone, Calendar, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BeautifulAvatar, CompactAvatar } from "@/components/ui/beautiful-avatar"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user?: {
    id: string
    email: string
    first_name: string
    last_name: string
    full_name: string
    role: "admin" | "manager" | "hr"
    department_id?: string
    position?: string
    status: string
    created_at?: string
    last_login?: string
    phone?: string
    address?: string
  }
}

export default function Header({ user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const isDark = theme === 'dark'

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast.success("Logged out successfully", {
          description: "You have been signed out of your account",
        })
        router.push("/auth/login")
        router.refresh()
      } else {
        toast.error("Logout failed", {
          description: "There was an error signing you out",
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Connection error", {
        description: "Unable to sign out. Please try again.",
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results or implement search
      const searchTerm = searchQuery.trim()
      toast.info("Search initiated", {
        description: `Searching for: ${searchTerm}`,
      })
      
      // You can implement actual search functionality here
      // For example, navigate to a search results page
      // router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
    toast.success("Theme updated", {
      description: `Switched to ${isDark ? 'light' : 'dark'} mode`,
    })
  }

  return (
    <header className={cn(
      "border-b px-4 py-3 transition-colors duration-200",
      "bg-white dark:bg-gray-900",
      "border-gray-200 dark:border-gray-700"
    )}>
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <Input
              type="text"
              placeholder="Search employees, departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </form>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme} 
            className="hidden sm:flex hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Enhanced User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(
                "flex items-center space-x-3 transition-colors",
                "hover:bg-gray-50 dark:hover:bg-gray-800"
              )}>
                {user ? (
                  <CompactAvatar user={user} size="md" showRole={false} showStatus={true} />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    ?
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {user?.full_name || 'Loading...'}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {user?.role?.toUpperCase() || 'USER'}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
              {/* User Profile Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center space-x-4">
                  {user ? (
                    <BeautifulAvatar user={user} size="lg" showRole={true} showStatus={true} />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-lg font-semibold">
                      ?
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                      {user?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {user?.position || 'Employee'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs font-medium",
                          user?.role === 'admin' ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" :
                          user?.role === 'manager' ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" :
                          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        )}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user?.role?.toUpperCase()}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          user?.status === 'active' || user?.status === 'Active' 
                            ? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400" 
                            : "border-gray-200 text-gray-700 dark:border-gray-600 dark:text-gray-400"
                        )}
                      >
                        {user?.status || 'Active'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Login Details Section */}
              <div className="px-6 py-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Login Information
                </h4>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-600 dark:text-gray-300 truncate">{user?.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Primary Email</p>
                    </div>
                  </div>
                  
                  {user?.phone && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-600 dark:text-gray-300">{user.phone}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Contact Number</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-600 dark:text-gray-300">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-600 dark:text-gray-300">
                        {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Just now'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-600 dark:text-gray-300">
                        {user?.address || 'Not specified'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                    </div>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

              {/* Quick Actions */}
              <div className="px-6 py-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h4>
                <div className="space-y-1">
                  <DropdownMenuItem className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-gray-50 dark:hover:bg-gray-700",
                    "text-gray-900 dark:text-gray-100"
                  )}>
                    <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">View Profile</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Manage your personal information</p>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-gray-50 dark:hover:bg-gray-700",
                    "text-gray-900 dark:text-gray-100"
                  )}>
                    <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Account Settings</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Privacy, security, and preferences</p>
                    </div>
                  </DropdownMenuItem>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

              {/* Logout */}
              <div className="px-6 py-3">
                <DropdownMenuItem
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
                    "focus:text-red-600 dark:focus:text-red-400"
                  )}
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Sign out</p>
                    <p className="text-xs text-red-500 dark:text-red-400">End your current session</p>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

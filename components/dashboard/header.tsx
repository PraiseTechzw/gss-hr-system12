"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, User, LogOut, Settings, Moon, Sun, Shield, Mail, Phone, Calendar, MapPin } from "lucide-react"
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
import { toast } from "sonner"

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
  }
}

export default function Header({ user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  // Load dark mode preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    // Toggle dark mode on document
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('darkMode', (!darkMode).toString())
    
    toast.success("Theme updated", {
      description: `Switched to ${!darkMode ? 'dark' : 'light'} mode`,
    })
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search employees, departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </form>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="hidden sm:flex">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Enhanced User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-50 transition-colors">
                <Avatar className="h-9 w-9 ring-2 ring-gray-200">
                  <AvatarImage src="/placeholder.svg" alt={user?.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-semibold">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3 text-blue-500" />
                    <p className="text-xs text-gray-500 font-medium">{user?.role?.toUpperCase()}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {/* User Profile Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg" alt={user?.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg font-semibold">
                      {user?.first_name?.[0]}
                      {user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Shield className="h-3 w-3 text-blue-500" />
                      <p className="text-xs text-gray-500 font-medium">{user?.role?.toUpperCase()}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{user?.email}</span>
                </div>
                {user?.position && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{user.position}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Member since {new Date().getFullYear()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>Active Status: {user?.status || 'Active'}</span>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Menu Items */}
              <DropdownMenuItem className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">View Profile</p>
                  <p className="text-xs text-gray-500">Manage your personal information</p>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50">
                <Settings className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Account Settings</p>
                  <p className="text-xs text-gray-500">Privacy, security, and preferences</p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Sign out</p>
                  <p className="text-xs text-red-500">End your current session</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

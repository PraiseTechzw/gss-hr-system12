"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Shield, Crown, Users, Star, CheckCircle } from "lucide-react"

interface BeautifulAvatarProps {
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
  }
  size?: "sm" | "md" | "lg" | "xl"
  showRole?: boolean
  showStatus?: boolean
  className?: string
}

const roleConfig = {
  admin: {
    icon: Crown,
    color: "from-red-500 to-pink-500",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    glowColor: "shadow-red-500/20",
    label: "Administrator"
  },
  manager: {
    icon: Shield,
    color: "from-purple-500 to-indigo-500",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    glowColor: "shadow-purple-500/20",
    label: "Manager"
  },
  hr: {
    icon: Users,
    color: "from-blue-500 to-cyan-500",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    glowColor: "shadow-blue-500/20",
    label: "HR Staff"
  }
}

const sizeConfig = {
  sm: {
    avatar: "h-8 w-8",
    icon: "h-3 w-3",
    badge: "text-xs px-1.5 py-0.5",
    status: "h-2 w-2"
  },
  md: {
    avatar: "h-10 w-10",
    icon: "h-4 w-4",
    badge: "text-xs px-2 py-1",
    status: "h-2.5 w-2.5"
  },
  lg: {
    avatar: "h-12 w-12",
    icon: "h-5 w-5",
    badge: "text-sm px-2.5 py-1",
    status: "h-3 w-3"
  },
  xl: {
    avatar: "h-16 w-16",
    icon: "h-6 w-6",
    badge: "text-sm px-3 py-1.5",
    status: "h-3.5 w-3.5"
  }
}

export function BeautifulAvatar({ 
  user, 
  size = "md", 
  showRole = true, 
  showStatus = true,
  className 
}: BeautifulAvatarProps) {
  if (!user) return null

  const role = user.role?.toLowerCase() as keyof typeof roleConfig
  const config = roleConfig[role] || roleConfig.hr
  const sizes = sizeConfig[size]
  const RoleIcon = config.icon

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
  const isActive = user.status === 'active' || user.status === 'Active'

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      {/* Main Avatar */}
      <div className={cn(
        "relative",
        sizes.avatar,
        "rounded-full",
        "ring-2 ring-white dark:ring-gray-800",
        config.borderColor,
        "shadow-lg",
        config.glowColor
      )}>
        <Avatar className={cn("h-full w-full", sizes.avatar)}>
          <AvatarImage 
            src={`/api/avatar/${user.id}`} 
            alt={user.full_name}
            className="object-cover"
          />
          <AvatarFallback className={cn(
            "bg-gradient-to-br font-bold text-white",
            config.color,
            "text-sm"
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Status Indicator */}
        {showStatus && (
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5",
            "rounded-full border-2 border-white dark:border-gray-800",
            sizes.status,
            isActive 
              ? "bg-green-500 shadow-green-500/50" 
              : "bg-gray-400 shadow-gray-400/50"
          )}>
            {isActive && (
              <CheckCircle className={cn(
                "h-full w-full text-white",
                sizes.status
              )} />
            )}
          </div>
        )}

        {/* Role Badge */}
        {showRole && (
          <div className={cn(
            "absolute -top-1 -right-1",
            "rounded-full border-2 border-white dark:border-gray-800",
            "flex items-center justify-center",
            config.badgeColor,
            sizes.badge,
            "font-medium shadow-lg"
          )}>
            <RoleIcon className={cn(sizes.icon, "mr-1")} />
            <span className="hidden sm:inline">{config.label}</span>
          </div>
        )}
      </div>

      {/* User Info Tooltip */}
      <div className="ml-3 hidden lg:block">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {user.full_name}
        </div>
        <div className="flex items-center gap-1">
          <RoleIcon className={cn(
            sizes.icon,
            role === 'admin' ? "text-red-500 dark:text-red-400" :
            role === 'manager' ? "text-purple-500 dark:text-purple-400" :
            "text-blue-500 dark:text-blue-400"
          )} />
          <span className={cn(
            "text-xs font-medium",
            role === 'admin' ? "text-red-600 dark:text-red-400" :
            role === 'manager' ? "text-purple-600 dark:text-purple-400" :
            "text-blue-600 dark:text-blue-400"
          )}>
            {config.label}
          </span>
        </div>
        {user.position && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
            {user.position}
          </div>
        )}
      </div>
    </div>
  )
}

// Compact version for smaller spaces
export function CompactAvatar({ 
  user, 
  size = "sm", 
  showRole = false, 
  showStatus = true,
  className 
}: BeautifulAvatarProps) {
  if (!user) {
    return (
      <div className={cn("relative inline-flex", className)}>
        <div className={cn(
          "h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-semibold"
        )}>
          ?
        </div>
      </div>
    )
  }

  const role = user.role?.toLowerCase() as keyof typeof roleConfig
  const config = roleConfig[role] || roleConfig.hr
  const sizes = sizeConfig[size]
  const RoleIcon = config.icon

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
  const isActive = user.status === 'active' || user.status === 'Active'

  return (
    <div className={cn("relative inline-flex", className)}>
      <Avatar className={cn(
        sizes.avatar,
        "ring-2 ring-white dark:ring-gray-800",
        config.borderColor,
        "shadow-lg",
        config.glowColor
      )}>
        <AvatarImage 
          src={`/api/avatar/${user.id}`} 
          alt={user.full_name}
          className="object-cover"
        />
        <AvatarFallback className={cn(
          "bg-gradient-to-br font-bold text-white",
          config.color,
          "text-xs"
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Status Indicator */}
      {showStatus && (
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5",
          "rounded-full border-2 border-white dark:border-gray-800",
          sizes.status,
          isActive 
            ? "bg-green-500 shadow-green-500/50" 
            : "bg-gray-400 shadow-gray-400/50"
        )}>
          {isActive && (
            <CheckCircle className={cn(
              "h-full w-full text-white",
              sizes.status
            )} />
          )}
        </div>
      )}

      {/* Role Badge */}
      {showRole && (
        <div className={cn(
          "absolute -top-1 -right-1",
          "rounded-full border-2 border-white dark:border-gray-800",
          "flex items-center justify-center",
          config.badgeColor,
          sizes.badge,
          "font-medium shadow-lg"
        )}>
          <RoleIcon className={cn(sizes.icon, "mr-1")} />
        </div>
      )}
    </div>
  )
}

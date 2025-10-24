"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, MapPin, Calendar, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  iconName: string
  color: string
  bgColor: string
  trend?: {
    value: number
    label: string
  }
  description?: string
  className?: string
}

const iconMap = {
  Users,
  MapPin,
  Calendar,
  DollarSign,
}

export function StatsCard({
  title,
  value,
  iconName,
  color,
  bgColor,
  trend,
  description,
  className,
}: StatsCardProps) {
  const Icon = iconMap[iconName as keyof typeof iconMap]
  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300 border-0 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className={cn("rounded-xl p-3 transition-all duration-300 group-hover:scale-110", bgColor)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            {trend.value > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={cn(
              "font-medium",
              trend.value > 0 ? "text-green-600" : "text-red-600"
            )}>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-gray-500">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Plus, Trash2, Sun, Moon, Sunset } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ShiftTime {
  id: string
  day: string
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
  shiftType: 'day' | 'night' | 'evening' | 'custom'
  isActive: boolean
}

export interface ShiftTimePickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  className?: string
  error?: string
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

const SHIFT_TYPES = [
  { value: 'day', label: 'Day Shift', icon: Sun, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'night', label: 'Night Shift', icon: Moon, color: 'bg-blue-100 text-blue-800' },
  { value: 'evening', label: 'Evening Shift', icon: Sunset, color: 'bg-orange-100 text-orange-800' },
  { value: 'custom', label: 'Custom', icon: Clock, color: 'bg-gray-100 text-gray-800' },
]

const PRESET_SHIFTS = [
  {
    name: 'Day Shift',
    shifts: [
      { day: 'monday', startTime: '08:00', endTime: '17:00', shiftType: 'day' as const },
      { day: 'tuesday', startTime: '08:00', endTime: '17:00', shiftType: 'day' as const },
      { day: 'wednesday', startTime: '08:00', endTime: '17:00', shiftType: 'day' as const },
      { day: 'thursday', startTime: '08:00', endTime: '17:00', shiftType: 'day' as const },
      { day: 'friday', startTime: '08:00', endTime: '17:00', shiftType: 'day' as const },
    ]
  },
  {
    name: 'Night Shift',
    shifts: [
      { day: 'monday', startTime: '22:00', endTime: '06:00', shiftType: 'night' as const },
      { day: 'tuesday', startTime: '22:00', endTime: '06:00', shiftType: 'night' as const },
      { day: 'wednesday', startTime: '22:00', endTime: '06:00', shiftType: 'night' as const },
      { day: 'thursday', startTime: '22:00', endTime: '06:00', shiftType: 'night' as const },
      { day: 'friday', startTime: '22:00', endTime: '06:00', shiftType: 'night' as const },
    ]
  },
  {
    name: 'Evening Shift',
    shifts: [
      { day: 'monday', startTime: '16:00', endTime: '00:00', shiftType: 'evening' as const },
      { day: 'tuesday', startTime: '16:00', endTime: '00:00', shiftType: 'evening' as const },
      { day: 'wednesday', startTime: '16:00', endTime: '00:00', shiftType: 'evening' as const },
      { day: 'thursday', startTime: '16:00', endTime: '00:00', shiftType: 'evening' as const },
      { day: 'friday', startTime: '16:00', endTime: '00:00', shiftType: 'evening' as const },
    ]
  },
  {
    name: 'Weekend Shift',
    shifts: [
      { day: 'saturday', startTime: '09:00', endTime: '18:00', shiftType: 'day' as const },
      { day: 'sunday', startTime: '09:00', endTime: '18:00', shiftType: 'day' as const },
    ]
  }
]

// Utility function to format shift times for display
export function formatShiftTimesForDisplay(shiftTiming: string): string {
  if (!shiftTiming) return "No shifts defined"
  
  try {
    const shifts = JSON.parse(shiftTiming)
    if (!Array.isArray(shifts) || shifts.length === 0) return "No shifts defined"
    
    const activeShifts = shifts.filter((s: ShiftTime) => s.isActive)
    if (activeShifts.length === 0) return "No active shifts"
    
    // Group shifts by time pattern
    const groupedByTime = activeShifts.reduce((acc: Record<string, string[]>, shift: ShiftTime) => {
      const key = `${shift.startTime}-${shift.endTime}`
      if (!acc[key]) acc[key] = []
      acc[key].push(shift.day)
      return acc
    }, {})

    return Object.entries(groupedByTime)
      .map(([time, days]) => `${days.join(', ')}: ${time}`)
      .join(' | ')
  } catch {
    // Fallback for simple format
    return shiftTiming
  }
}

// Utility function to get shift summary for cards
export function getShiftSummary(shiftTiming: string): { summary: string; count: number } {
  if (!shiftTiming) return { summary: "No shifts", count: 0 }
  
  try {
    const shifts = JSON.parse(shiftTiming)
    if (!Array.isArray(shifts)) return { summary: "Invalid format", count: 0 }
    
    const activeShifts = shifts.filter((s: ShiftTime) => s.isActive)
    return {
      summary: activeShifts.length > 0 ? `${activeShifts.length} shift(s)` : "No active shifts",
      count: activeShifts.length
    }
  } catch {
    return { summary: "Invalid format", count: 0 }
  }
}

export function ShiftTimePicker({ 
  value, 
  onChange, 
  label = "Shift Timing", 
  required = false,
  className,
  error 
}: ShiftTimePickerProps) {
  const [shifts, setShifts] = useState<ShiftTime[]>([])
  const [showPresets, setShowPresets] = useState(false)

  // Parse existing value on mount
  React.useEffect(() => {
    if (value) {
      try {
        const parsedShifts = JSON.parse(value)
        if (Array.isArray(parsedShifts)) {
          setShifts(parsedShifts)
        }
      } catch {
        // If parsing fails, try to parse as simple format
        const simpleShifts = parseSimpleFormat(value)
        setShifts(simpleShifts)
      }
    }
  }, [value])

  // Update parent when shifts change
  React.useEffect(() => {
    const serialized = JSON.stringify(shifts)
    onChange(serialized)
  }, [shifts, onChange])

  const parseSimpleFormat = (value: string): ShiftTime[] => {
    // Try to parse formats like "08:00 - 17:00" or "Mon-Fri: 08:00-17:00"
    const timeMatch = value.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/)
    if (timeMatch) {
      return DAYS_OF_WEEK.slice(0, 5).map((day, index) => ({
        id: `shift-${index}`,
        day: day.value,
        startTime: timeMatch[1],
        endTime: timeMatch[2],
        shiftType: 'day' as const,
        isActive: true
      }))
    }
    return []
  }

  const addShift = () => {
    const newShift: ShiftTime = {
      id: `shift-${Date.now()}`,
      day: 'monday',
      startTime: '08:00',
      endTime: '17:00',
      shiftType: 'day',
      isActive: true
    }
    setShifts(prev => [...prev, newShift])
  }

  const removeShift = (id: string) => {
    setShifts(prev => prev.filter(shift => shift.id !== id))
  }

  const updateShift = (id: string, field: keyof ShiftTime, value: any) => {
    setShifts(prev => prev.map(shift => 
      shift.id === id ? { ...shift, [field]: value } : shift
    ))
  }

  const applyPreset = (preset: typeof PRESET_SHIFTS[0]) => {
    const presetShifts: ShiftTime[] = preset.shifts.map((shift, index) => ({
      id: `preset-${Date.now()}-${index}`,
      day: shift.day,
      startTime: shift.startTime,
      endTime: shift.endTime,
      shiftType: shift.shiftType,
      isActive: true
    }))
    setShifts(presetShifts)
    setShowPresets(false)
  }

  const getShiftIcon = (shiftType: string) => {
    const type = SHIFT_TYPES.find(t => t.value === shiftType)
    return type ? type.icon : Clock
  }

  const getShiftColor = (shiftType: string) => {
    const type = SHIFT_TYPES.find(t => t.value === shiftType)
    return type ? type.color : 'bg-gray-100 text-gray-800'
  }

  const formatShiftSummary = () => {
    if (shifts.length === 0) return "No shifts defined"
    
    const activeShifts = shifts.filter(s => s.isActive)
    if (activeShifts.length === 0) return "No active shifts"
    
    const groupedByTime = activeShifts.reduce((acc, shift) => {
      const key = `${shift.startTime}-${shift.endTime}`
      if (!acc[key]) acc[key] = []
      acc[key].push(shift.day)
      return acc
    }, {} as Record<string, string[]>)

    return Object.entries(groupedByTime)
      .map(([time, days]) => `${days.join(', ')}: ${time}`)
      .join(' | ')
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPresets(!showPresets)}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Presets
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addShift}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Shift
          </Button>
        </div>
      </div>

      {/* Preset Selection */}
      {showPresets && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_SHIFTS.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  className="justify-start"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shift Summary */}
      {shifts.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Schedule:</strong> {formatShiftSummary()}
          </p>
        </div>
      )}

      {/* Individual Shifts */}
      <div className="space-y-3">
        {shifts.map((shift) => {
          const ShiftIcon = getShiftIcon(shift.shiftType)
          const shiftColor = getShiftColor(shift.shiftType)
          
          return (
            <Card key={shift.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShiftIcon className="h-4 w-4" />
                    <Badge className={shiftColor}>
                      {SHIFT_TYPES.find(t => t.value === shift.shiftType)?.label}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeShift(shift.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Day</Label>
                    <Select
                      value={shift.day}
                      onValueChange={(value) => updateShift(shift.id, 'day', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Start Time</Label>
                    <Input
                      type="time"
                      value={shift.startTime}
                      onChange={(e) => updateShift(shift.id, 'startTime', e.target.value)}
                      className="h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">End Time</Label>
                    <Input
                      type="time"
                      value={shift.endTime}
                      onChange={(e) => updateShift(shift.id, 'endTime', e.target.value)}
                      className="h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Shift Type</Label>
                    <Select
                      value={shift.shiftType}
                      onValueChange={(value) => updateShift(shift.id, 'shiftType', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIFT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-3 w-3" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Break Time (Optional) */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Break Start (Optional)</Label>
                    <Input
                      type="time"
                      value={shift.breakStart || ''}
                      onChange={(e) => updateShift(shift.id, 'breakStart', e.target.value)}
                      className="h-8"
                      placeholder="12:00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Break End (Optional)</Label>
                    <Input
                      type="time"
                      value={shift.breakEnd || ''}
                      onChange={(e) => updateShift(shift.id, 'breakEnd', e.target.value)}
                      className="h-8"
                      placeholder="13:00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {shifts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No shifts defined</p>
          <p className="text-xs text-gray-400 mt-1">Add shifts or use a preset to get started</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}

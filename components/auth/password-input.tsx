"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordInputProps {
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  className?: string
  showStrength?: boolean
  onStrengthChange?: (strength: { strength: number; label: string; color: string }) => void
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "Enter your password",
  required = false,
  className,
  showStrength = false,
  onStrengthChange,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: "", color: "" }
    if (pwd.length < 6) return { strength: 1, label: "Too short", color: "text-red-500" }
    if (pwd.length < 8) return { strength: 2, label: "Weak", color: "text-orange-500" }
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return { strength: 4, label: "Very Strong", color: "text-green-500" }
    }
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { strength: 3, label: "Strong", color: "text-green-500" }
    }
    return { strength: 2, label: "Medium", color: "text-yellow-500" }
  }

  const passwordStrength = getPasswordStrength(value)

  // Notify parent component of strength changes
  if (showStrength && onStrengthChange) {
    onStrengthChange(passwordStrength)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          className={cn("h-11 pr-10", className)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>
      
      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  passwordStrength.strength === 1
                    ? "w-1/4 bg-red-500"
                    : passwordStrength.strength === 2
                      ? "w-2/4 bg-orange-500"
                      : passwordStrength.strength === 3
                        ? "w-3/4 bg-green-500"
                        : "w-full bg-green-500"
                }`}
              />
            </div>
            <span className={`font-medium ${passwordStrength.color}`}>
              {passwordStrength.label}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {passwordStrength.strength < 3 && "Use uppercase, numbers, and special characters for stronger security"}
          </div>
        </div>
      )}
    </div>
  )
}


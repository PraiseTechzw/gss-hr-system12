"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingButtonProps {
  isLoading: boolean
  loadingText: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  onClick?: () => void
}

export function LoadingButton({
  isLoading,
  loadingText,
  children,
  className,
  disabled,
  type = "button",
  onClick,
}: LoadingButtonProps) {
  return (
    <Button
      type={type}
      className={cn(
        "w-full h-11 bg-[#a2141e] hover:bg-[#8a1119] text-base font-semibold transition-all duration-200",
        isLoading && "cursor-not-allowed opacity-75",
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </Button>
  )
}

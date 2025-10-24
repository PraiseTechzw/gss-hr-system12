"use client"

import { useEffect, useState } from "react"
import { Monitor, Smartphone, ArrowLeft } from "lucide-react"

export function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false)
  const [showBlocker, setShowBlocker] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isSmallScreen = window.innerWidth < 1024
      
      if (isMobileDevice || isSmallScreen) {
        setIsMobile(true)
        setShowBlocker(true)
      }
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  if (!showBlocker) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Desktop Only</h1>
              <p className="text-blue-100 text-lg">
                GSS HR & Payroll Management System
              </p>
            </div>
            
            {/* Message */}
            <div className="space-y-4">
              <p className="text-gray-200 leading-relaxed">
                This application is optimized for desktop use only. Please access it from a computer or laptop for the best experience.
              </p>
              
              <div className="flex items-center justify-center gap-3 text-sm text-gray-300">
                <Monitor className="w-4 h-4" />
                <span>Desktop Recommended</span>
              </div>
            </div>
            
            {/* Features */}
            <div className="bg-white/5 rounded-2xl p-4 space-y-3">
              <h3 className="text-white font-semibold">Why Desktop Only?</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Full feature access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Better data visualization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Enhanced security</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Optimal performance</span>
                </div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-400">
                For support, contact your system administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

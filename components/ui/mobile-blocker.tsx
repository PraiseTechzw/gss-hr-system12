"use client"

import { useEffect, useState } from "react"
import { Monitor, Smartphone, Lock, CheckCircle2, MapPin, ShieldCheck, Zap } from "lucide-react"

export function MobileBlocker() {
  const [showBlocker, setShowBlocker] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isSmallScreen = window.innerWidth < 1024
      
      if (isMobileDevice || isSmallScreen) {
        setShowBlocker(true)
      } else {
        setShowBlocker(false)
      }
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  if (!showBlocker) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 py-8 md:px-0">
        <div className="grid lg:grid-cols-2 gap-0 overflow-hidden rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
          
          {/* Visual Side */}
          <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-900">
            <img 
              src="/desktop_workspace_illustration_1773607059053.png" 
              alt="Desktop Workspace"
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-medium text-white tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Enterprise Secure
               </div>
               <h2 className="text-3xl font-bold text-white leading-tight">
                  The Complete HR & Payroll Experience.
               </h2>
               <p className="text-blue-100/80 text-sm leading-relaxed">
                  Access advanced analytics, comprehensive payroll management, and complete employee lifecycle tools on your desktop.
               </p>
            </div>
          </div>

          {/* Content Side */}
          <div className="p-8 md:p-12 flex flex-col justify-center text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <div className="flex justify-center lg:justify-start">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Desktop Recommended
                </h1>
                <p className="text-gray-400 text-lg">
                  GSS HR & Payroll System
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed max-w-sm mx-auto lg:mx-0">
                To maintain the highest security standards and provide the precise toolset required for payroll operations, this application is restricted to desktop and laptop computers.
              </p>

              <div className="grid gap-4">
                {[
                  { icon: Zap, text: "Full analytical dashboards" },
                  { icon: Lock, text: "Secure payroll processing" },
                  { icon: Monitor, text: "Enhanced spreadsheet views" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300">
                      <item.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-gray-300 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center gap-3 w-full">
                  <Smartphone className="w-5 h-5" />
                  <span className="text-sm font-semibold">Mobile Restricted Access</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                 <span>Genius Security Services</span>
                 <span>PABN Network</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#0A002E]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#a2141e]/15 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#150057]/40 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 py-8 md:px-0">
        <div className="grid lg:grid-cols-2 gap-0 overflow-hidden rounded-[2.5rem] bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
          
          {/* Visual Side */}
          <div className="hidden lg:block relative overflow-hidden bg-[#150057]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#150057] via-[#0A002E] to-[#450A0E] opacity-90" />
            <img 
              src="/desktop_workspace_illustration_1773607059053.png" 
              alt="Desktop Workspace"
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A002E] via-transparent to-transparent" />
            
            <div className="absolute top-10 left-10">
               <img src="/logo.png" alt="GSS Logo" className="h-12 w-auto filter brightness-0 invert" />
            </div>

            <div className="absolute bottom-12 left-10 right-10 space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a2141e]/30 border border-[#a2141e]/50 backdrop-blur-md text-[10px] font-bold text-white tracking-widest uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Enterprise Secure
               </div>
               <h2 className="text-3xl font-bold text-white leading-tight">
                  The Complete HR & <br/>Payroll Experience.
               </h2>
               <p className="text-blue-100/60 text-sm leading-relaxed max-w-xs">
                  Access advanced analytics, comprehensive payroll management, and complete employee lifecycle tools on your desktop.
               </p>
            </div>
          </div>

          {/* Content Side */}
          <div className="p-8 md:p-12 flex flex-col justify-center text-center lg:text-left space-y-8 bg-[#020617]/50">
            <div className="space-y-6">
              <div className="flex justify-center lg:justify-start">
                <div className="relative group">
                   <div className="absolute -inset-1 bg-gradient-to-r from-[#a2141e] to-[#150057] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                   <div className="relative w-20 h-20 rounded-2xl bg-[#0A002E] border border-white/10 flex items-center justify-center p-4">
                      <img src="/logo.png" alt="GSS Logo" className="w-full h-full object-contain" />
                   </div>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Desktop Recommended
                </h1>
                <p className="text-[#a2141e] font-bold tracking-wider text-sm uppercase">
                  GSS HR & Payroll Management
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-gray-400 leading-relaxed max-w-sm mx-auto lg:mx-0 text-sm">
                To maintain the highest security standards and provide the precise toolset required for payroll operations, this application is restricted to professional desktop devices.
              </p>

              <div className="grid gap-3">
                {[
                  { icon: Zap, text: "Full analytical dashboards", color: "text-[#a2141e]" },
                  { icon: Lock, text: "Secure payroll processing", color: "text-[#150057]" },
                  { icon: Monitor, text: "Enhanced spreadsheet views", color: "text-blue-400" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#a2141e]/50 transition-all duration-300">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-gray-300 font-medium text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="p-3 rounded-xl bg-[#a2141e]/5 border border-[#a2141e]/10 text-[#a2141e] flex items-center gap-3 w-full justify-center lg:justify-start">
                <Smartphone className="w-5 h-5" />
                <span className="text-xs font-bold tracking-wide uppercase">Mobile Access Restricted</span>
              </div>
              
              <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black">
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

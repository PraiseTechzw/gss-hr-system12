import { Building2, Users, Shield, Sparkles, Briefcase, Star } from 'lucide-react'
import Image from 'next/image'

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  variant?: 'default' | 'minimal' | 'detailed' | 'icon-only'
}

export default function AppLogo({ 
  size = 'md', 
  showText = true, 
  className = '',
  variant = 'default'
}: AppLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  // Use your actual logo image
  const logoPath = '/logo.png'
  const placeholderLogoPath = '/placeholder-logo.png'

  if (variant === 'icon-only') {
    return (
      <div className={`${sizeClasses[size]} rounded-xl flex items-center justify-center shadow-lg ${className}`}>
        <Image
          src={logoPath}
          alt="GSS HR Logo"
          width={64}
          height={64}
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to placeholder if logo doesn't exist
            e.currentTarget.src = placeholderLogoPath
          }}
        />
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`${sizeClasses[size]} rounded-lg flex items-center justify-center`}>
          <Image
            src={logoPath}
            alt="GSS HR Logo"
            width={64}
            height={64}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = placeholderLogoPath
            }}
          />
        </div>
        {showText && (
          <span className={`font-bold text-gray-800 ${textSizeClasses[size]}`}>
            GSS HR
          </span>
        )}
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className={`${sizeClasses[size]} rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden`}>
          <Image
            src={logoPath}
            alt="GSS HR Logo"
            width={64}
            height={64}
            className="w-full h-full object-contain z-10"
            onError={(e) => {
              e.currentTarget.src = placeholderLogoPath
            }}
          />
        </div>
        {showText && (
          <div className="flex flex-col">
            <span className={`font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
              GSS HR
            </span>
            <span className="text-xs text-gray-500 font-medium">
              Human Resources
            </span>
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} rounded-xl flex items-center justify-center shadow-lg`}>
        <Image
          src={logoPath}
          alt="GSS HR Logo"
          width={64}
          height={64}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.src = placeholderLogoPath
          }}
        />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
            GSS HR
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Human Resources
          </span>
        </div>
      )}
    </div>
  )
}

// Logo for login page with enhanced design
export function LoginPageLogo() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 border border-white/30 relative overflow-hidden shadow-2xl">
        {/* Your actual logo */}
        <Image
          src="/logo.png"
          alt="GSS HR Logo"
          width={120}
          height={120}
          className="w-24 h-24 object-contain z-10"
          onError={(e) => {
            // Fallback to placeholder if logo doesn't exist
            e.currentTarget.src = '/placeholder-logo.png'
          }}
        />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-red-400/20 animate-pulse"></div>
        <div className="absolute top-3 right-3 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
        <div className="absolute bottom-3 left-3 w-3 h-3 bg-white/60 rounded-full animate-ping delay-1000"></div>
        
        {/* Floating elements */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce">
          <Star className="w-3 h-3 text-white" />
        </div>
      </div>
      
      <h1 className="text-6xl font-bold text-white mb-3 tracking-tight">
        GSS <span className="bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">HR</span>
      </h1>
      <p className="text-white/90 text-2xl font-medium mb-3">Human Resources Management System</p>
      <div className="flex items-center justify-center mt-6 space-x-4">
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="text-white/80 text-base font-medium">Advanced Technology</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
          <Shield className="w-5 h-5 text-blue-300" />
          <span className="text-white/80 text-base font-medium">Secure Platform</span>
        </div>
      </div>
    </div>
  )
}

// Logo with custom image support
export function CustomLogo({ 
  imagePath, 
  size = 'md', 
  showText = true, 
  className = '' 
}: { 
  imagePath: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-xl overflow-hidden shadow-lg`}>
        <Image
          src={imagePath}
          alt="GSS HR Logo"
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-800 ${textSizeClasses[size]}`}>
            GSS HR
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Human Resources
          </span>
        </div>
      )}
    </div>
  )
}

// Animated logo for loading states
export function AnimatedLogo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse ${className}`}>
      <Building2 className="w-1/2 h-1/2 text-white animate-bounce" />
    </div>
  )
}

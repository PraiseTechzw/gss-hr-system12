import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ServiceWorkerRegister } from "@/components/pwa/sw-register"
import { OfflineProvider } from "@/components/pwa/offline-provider"
import { SyncIndicator } from "@/components/pwa/sync-indicator"
import { MobileBlocker } from "@/components/ui/mobile-blocker"
import { Toaster } from "sonner"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { SettingsProvider } from "@/lib/settings-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "GSS HR & Payroll Management System",
  description: "GSS HR & Payroll Management System",
  authors: [{ name: "Genius Security Services", url: "https://geniussecurityservices.co.zw" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <MobileBlocker />
          <ServiceWorkerRegister />
          <AuthProvider>
            <SettingsProvider>
              <OfflineProvider>
                {children}
                <SyncIndicator />
              </OfflineProvider>
            </SettingsProvider>
          </AuthProvider>
          <Toaster position="top-right" expand={true} richColors={true} closeButton={true} />
        </ThemeProvider>
      </body>
    </html>
  )
}

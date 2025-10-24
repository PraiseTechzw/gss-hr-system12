"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, User, Shield, Briefcase } from "lucide-react"
import { toast } from "sonner"

interface Credential {
  role: string
  email: string
  password: string
  icon: React.ReactNode
  color: string
  description: string
}

const testCredentials: Credential[] = [
  {
    role: "HR User",
    email: "hr@gss.com",
    password: "hr123",
    icon: <User className="w-5 h-5" />,
    color: "text-blue-600",
    description: "Employee management, attendance, leave requests",
  },
  {
    role: "Manager",
    email: "manager@gss.com",
    password: "manager123",
    icon: <Briefcase className="w-5 h-5" />,
    color: "text-green-600",
    description: "Department management, approvals, reports",
  },
  {
    role: "Admin",
    email: "admin@gss.com",
    password: "admin123",
    icon: <Shield className="w-5 h-5" />,
    color: "text-red-600",
    description: "Full system access, user management",
  },
]

export function TestCredentialsHelper() {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success("Copied to clipboard", {
        description: `${field} copied successfully`,
        duration: 2000,
      })
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      toast.error("Failed to copy", {
        description: "Please copy manually",
        duration: 2000,
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Test Login Credentials
        </CardTitle>
        <CardDescription>
          Use these credentials to test different user roles. Remember to change passwords after first login.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {testCredentials.map((cred) => (
          <div key={cred.email} className="p-4 border rounded-lg hover:border-gray-400 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cred.color}>{cred.icon}</div>
                <div>
                  <h3 className="font-semibold text-sm">{cred.role}</h3>
                  <p className="text-xs text-muted-foreground">{cred.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-muted px-3 py-2 rounded">{cred.email}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(cred.email, "Email")}
                  className="shrink-0"
                >
                  {copiedField === "Email" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-muted px-3 py-2 rounded">{cred.password}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(cred.password, "Password")}
                  className="shrink-0"
                >
                  {copiedField === "Password" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Security Note:</strong> These are test credentials. Change passwords immediately after first login
            in production environments.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

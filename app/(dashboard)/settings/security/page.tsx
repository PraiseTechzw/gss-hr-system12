"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
// Supabase client removed

export default function SecuritySettingsPage() {
  const supabase = createClient()
  const [form, setForm] = useState({ two_factor_auth: true, data_encryption: true, password_expiry: false })

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("system_settings").select("two_factor_auth, data_encryption, password_expiry").limit(1).maybeSingle()
      if (data) setForm({
        two_factor_auth: !!data.two_factor_auth,
        data_encryption: !!data.data_encryption,
        password_expiry: !!data.password_expiry,
      })
    }
    load()
  }, [supabase])

  async function save(partial: Partial<typeof form>) {
    const next = { ...form, ...partial }
    setForm(next)
    await supabase.from("system_settings").update({ ...partial, updated_at: new Date().toISOString() }).neq("id", "00000000-0000-0000-0000-000000000000")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded border">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Require 2FA for admin login</p>
            </div>
            <Switch checked={form.two_factor_auth} onCheckedChange={(v) => save({ two_factor_auth: v })} />
          </div>
          <div className="flex items-center justify-between p-3 rounded border">
            <div>
              <p className="font-medium">Data Encryption</p>
              <p className="text-sm text-gray-600">Encrypt sensitive data at rest</p>
            </div>
            <Switch checked={form.data_encryption} onCheckedChange={(v) => save({ data_encryption: v })} />
          </div>
          <div className="flex items-center justify-between p-3 rounded border">
            <div>
              <p className="font-medium">Password Expiry</p>
              <p className="text-sm text-gray-600">Force password changes every 90 days</p>
            </div>
            <Switch checked={form.password_expiry} onCheckedChange={(v) => save({ password_expiry: v })} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

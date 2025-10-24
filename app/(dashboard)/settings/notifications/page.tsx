"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
// Supabase client removed

export default function NotificationSettingsPage() {
  const supabase = createClient()
  const [form, setForm] = useState({ email_notifications: true, sms_alerts: false })

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("system_settings").select("email_notifications, sms_alerts").limit(1).maybeSingle()
      if (data) setForm({ email_notifications: !!data.email_notifications, sms_alerts: !!data.sms_alerts })
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
      <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded border">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive alerts via email</p>
            </div>
            <Switch checked={form.email_notifications} onCheckedChange={(v) => save({ email_notifications: v })} />
          </div>
          <div className="flex items-center justify-between p-3 rounded border">
            <div>
              <p className="font-medium">SMS Alerts</p>
              <p className="text-sm text-gray-600">Critical alerts sent to mobile</p>
            </div>
            <Switch checked={form.sms_alerts} onCheckedChange={(v) => save({ sms_alerts: v })} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



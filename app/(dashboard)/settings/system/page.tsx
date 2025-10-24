"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Supabase client removed
import { ExportTableButton } from "@/components/reports/export-table-button"

export default function SystemSettingsPage() {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    timezone: "Africa/Harare",
    currency: "USD",
    date_format: "DD/MM/YYYY",
    week_start: "Monday",
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("system_settings").select("timezone, currency, date_format, week_start").limit(1).maybeSingle()
      if (data) setForm({
        timezone: data.timezone || "Africa/Harare",
        currency: data.currency || "USD",
        date_format: data.date_format || "DD/MM/YYYY",
        week_start: data.week_start || "Monday",
      })
    }
    load()
  }, [supabase])

  const save = async () => {
    setSaving(true)
    await supabase.from("system_settings").update({
      timezone: form.timezone,
      currency: form.currency,
      date_format: form.date_format,
      week_start: form.week_start,
      updated_at: new Date().toISOString(),
    }).neq("id", "00000000-0000-0000-0000-000000000000")
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">System Preferences</h1>

      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="ZWL">ZWL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Input value={form.date_format} onChange={(e) => setForm({ ...form, date_format: e.target.value })} placeholder="DD/MM/YYYY" />
            </div>
            <div className="space-y-2">
              <Label>Week Start</Label>
              <Select value={form.week_start} onValueChange={(v) => setForm({ ...form, week_start: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monday">Monday</SelectItem>
                  <SelectItem value="Sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="bg-[#a2141e] hover:bg-[#8a1119]">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Tables (Admin Export)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3">
          <ExportTableButton table="employees" className="bg-[#a2141e] hover:bg-[#8a1119]" />
          <ExportTableButton table="deployments" className="bg-[#a2141e] hover:bg-[#8a1119]" />
          <ExportTableButton table="leave_requests" className="bg-[#a2141e] hover:bg-[#8a1119]" />
          <ExportTableButton table="attendance" className="bg-[#a2141e] hover:bg-[#8a1119]" />
          <ExportTableButton table="payroll" className="bg-[#a2141e] hover:bg-[#8a1119]" />
          <ExportTableButton table="admin_users" className="bg-[#a2141e] hover:bg-[#8a1119]" />
          <ExportTableButton table="system_settings" className="bg-[#a2141e] hover:bg-[#8a1119]" />
          <div className="col-span-full text-right text-sm">
            <a href="/admin/data/employees" className="underline mr-3">Browse employees</a>
            <a href="/admin/data/deployments" className="underline mr-3">Browse deployments</a>
            <a href="/admin/data/payroll" className="underline mr-3">Browse payroll</a>
            <a href="/admin/data/attendance" className="underline mr-3">Browse attendance</a>
            <a href="/admin/data/leave_requests" className="underline mr-3">Browse leave</a>
            <a href="/admin/data/admin_users" className="underline">Browse admins</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// Supabase client removed

export default function CompanySettingsPage() {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ company_name: "", contact_email: "", contact_phone: "", logo_url: "" })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("system_settings")
        .select("company_name, contact_email, contact_phone, logo_url")
        .limit(1)
        .maybeSingle()
      if (data) setForm({
        company_name: data.company_name || "",
        contact_email: data.contact_email || "",
        contact_phone: data.contact_phone || "",
        logo_url: data.logo_url || "",
      })
    }
    load()
  }, [supabase])

  const save = async () => {
    setSaving(true)
    await supabase.from("system_settings").update({ ...form, updated_at: new Date().toISOString() }).neq("id", "00000000-0000-0000-0000-000000000000")
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="bg-[#a2141e] hover:bg-[#8a1119]">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}



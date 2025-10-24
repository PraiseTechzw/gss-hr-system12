"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
// Supabase client removed

export default function IntegrationsSettingsPage() {
  const supabase = createClient()
  const [apiAccess, setApiAccess] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("system_settings").select("api_access").limit(1).maybeSingle()
      if (data) setApiAccess(!!data.api_access)
    }
    load()
  }, [supabase])

  async function save(v: boolean) {
    setApiAccess(v)
    await supabase.from("system_settings").update({ api_access: v, updated_at: new Date().toISOString() }).neq("id", "00000000-0000-0000-0000-000000000000")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium">Enable API Access</p>
              <p className="text-sm text-gray-600">Allow external services to connect</p>
            </div>
            <Switch checked={apiAccess} onCheckedChange={save} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

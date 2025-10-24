"use client"

import { createClient } from "@/lib/supabase/client"
import { clearQueuedMutations, getQueuedMutations } from "./outbox"
import { putMany } from "./repository"

type Table =
  | "employees"
  | "deployments"
  | "leave_requests"
  | "payroll"
  | "admin_users"
  | "notifications"
  | "attendance"
  | "settings"

export async function syncDown() {
  const supabase = createClient()
  // Fetch key tables in parallel (adjust as needed)
  const tables: Table[] = [
    "employees",
    "deployments",
    "leave_requests",
    "payroll",
    "admin_users",
    "notifications",
    "attendance",
    "settings",
  ]

  const results = await Promise.all(
    tables.map((t) => supabase.from(t).select("*").then((r) => ({ table: t, data: r.data ?? [] })))
  )

  await Promise.all(results.map((r) => putMany(r.table as Table, r.data as any[])))
}

export async function syncUp() {
  const supabase = createClient()
  const mutations = await getQueuedMutations()
  for (const m of mutations) {
    const query = supabase.from(m.table)
    if (m.op === "insert") await query.insert(m.payload)
    if (m.op === "update") await query.update(m.payload).eq("id", (m.payload as any).id)
    if (m.op === "delete") await query.delete().eq("id", (m.payload as any).id)
  }
  await clearQueuedMutations()
}

export async function fullSync() {
  await syncUp()
  await syncDown()
}

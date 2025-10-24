"use client"

import { createClient } from "@/lib/supabase/client"
import { getAll, putMany } from "@/lib/idb/repository"

type Table =
  | "employees"
  | "deployments"
  | "leave_requests"
  | "payroll"
  | "admin_users"
  | "notifications"
  | "attendance"
  | "settings"

export async function fetchTable<T = any>(table: Table): Promise<T[]> {
  const supabase = createClient()
  // Try network first; on success, refresh cache. If network fails, return cache.
  try {
    const { data, error } = await supabase.from(table).select("*")
    if (error) throw error
    if (data) await putMany<any>(table, data)
    return (data as T[]) ?? (await getAll<T>(table))
  } catch {
    return await getAll<T>(table)
  }
}

export async function countFromCache(table: Table, filter?: (row: any) => boolean) {
  const rows = await getAll<any>(table)
  return filter ? rows.filter(filter).length : rows.length
}

export async function selectRecent<T = any>(table: Table, sortKey: keyof T & string, limit = 5) {
  const rows = await fetchTable<T>(table)
  return rows
    .slice()
    .sort((a: any, b: any) => new Date(b[sortKey]).getTime() - new Date(a[sortKey]).getTime())
    .slice(0, limit)
}

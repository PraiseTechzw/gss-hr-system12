"use client"

import { createClient } from "@/lib/supabase/client"
import { queueMutation } from "@/lib/idb/outbox"

export async function rejectLeave(id: string) {
  if (typeof navigator !== "undefined" && navigator.onLine) {
    // online: hit API and let SW update caches on next sync
    const res = await fetch(`/api/approvals/leave/${id}/reject`, { method: "POST" })
    if (!res.ok) throw new Error("Failed to reject leave")
    return
  }
  // offline: queue mutation and optimistically update local cache
  await queueMutation({ table: "leave_requests", op: "update", payload: { id, status: "rejected" } })
}

export async function approveLeave(id: string) {
  if (typeof navigator !== "undefined" && navigator.onLine) {
    const res = await fetch(`/api/approvals/leave/${id}/approve`, { method: "POST" })
    if (!res.ok) throw new Error("Failed to approve leave")
    return
  }
  await queueMutation({ table: "leave_requests", op: "update", payload: { id, status: "approved" } })
}

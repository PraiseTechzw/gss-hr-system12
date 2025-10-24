"use client"

import { useEffect } from "react"
import { fullSync } from "@/lib/idb/sync"

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const onOnline = () => {
      try {
        window.dispatchEvent(new Event("gss-sync-start"))
      } catch {}
      fullSync()
        .catch(() => {})
        .finally(() => {
          try {
            window.dispatchEvent(new Event("gss-sync-end"))
          } catch {}
        })
    }
    window.addEventListener("online", onOnline)
    // initial attempt
    if (navigator.onLine) onOnline()
    return () => window.removeEventListener("online", onOnline)
  }, [])

  return children as any
}

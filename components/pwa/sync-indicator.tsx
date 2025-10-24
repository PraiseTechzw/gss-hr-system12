"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export function SyncIndicator() {
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true)
  const [syncing, setSyncing] = useState<boolean>(false)

  useEffect(() => {
    const onOnline = () => {
      setOnline(true)
      toast.success("Connection restored", {
        description: "You're back online and data will sync automatically"
      })
    }
    const onOffline = () => {
      setOnline(false)
      toast.warning("You're offline", {
        description: "Changes will be saved locally and synced when online"
      })
    }
    const onSyncStart = () => {
      setSyncing(true)
      toast.loading("Syncing data...", {
        description: "Synchronizing with server"
      })
    }
    const onSyncEnd = () => {
      setSyncing(false)
      toast.success("Sync complete", {
        description: "All data has been synchronized"
      })
    }

    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    window.addEventListener("gss-sync-start", onSyncStart as any)
    window.addEventListener("gss-sync-end", onSyncEnd as any)

    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
      window.removeEventListener("gss-sync-start", onSyncStart as any)
      window.removeEventListener("gss-sync-end", onSyncEnd as any)
    }
  }, [])

  const state = !online ? "offline" : syncing ? "syncing" : "online"
  const bg = state === "offline" ? "bg-yellow-500" : state === "syncing" ? "bg-blue-600" : "bg-green-600"
  const text = state === "offline" ? "Offline" : state === "syncing" ? "Syncing" : "Online"

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-white shadow ${bg}`}>
        <span className="relative inline-flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${bg} animate-ping`}></span>
          <span className={`relative inline-flex h-2 w-2 rounded-full bg-white`}></span>
        </span>
        <span className="text-xs font-medium">{text}</span>
      </div>
    </div>
  )
}

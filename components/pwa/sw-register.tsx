"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV !== "development"
    ) {
      const register = async () => {
        try {
          await navigator.serviceWorker.register("/sw.js")
        } catch {
          // ignore
        }
      }
      register()
    }
  }, [])
  return null
}

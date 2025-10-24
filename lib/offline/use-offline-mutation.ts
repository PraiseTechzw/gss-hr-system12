"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"

type MutationFn<Args extends any[]> = (...args: Args) => Promise<void>

export function useOfflineMutation<Args extends any[]>(mutate: MutationFn<Args>) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (...args: Args) => {
      setIsLoading(true)
      setError(null)
      try {
        await mutate(...args)
      } catch (e: any) {
        const errorMessage = e?.message || "Failed"
        setError(errorMessage)
        toast.error("Action failed", {
          description: errorMessage
        })
      } finally {
        setIsLoading(false)
      }
    },
    [mutate],
  )

  return { run, isLoading, error }
}

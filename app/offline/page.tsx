export const dynamic = "force-static"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">You are offline</h1>
        <p className="mt-3 text-muted-foreground">
          Some features may be unavailable. We'll automatically sync when
          you're back online.
        </p>
      </div>
    </div>
  )
}

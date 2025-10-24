import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Create a Supabase client for server-side operations
 * This client is used for direct database queries (not auth)
 * Auth is handled by custom JWT system
 */
export async function createClient() {
  console.log("[Supabase] Creating server client...")
  console.log("[Supabase] URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("[Supabase] Anon Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[Supabase] Missing environment variables!")
    throw new Error("Missing Supabase environment variables")
  }
  
  const cookieStore = await cookies()
  console.log("[Supabase] Cookie store created")

  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Ignore errors in Server Components
        }
      },
    },
  })
  
  console.log("[Supabase] Server client created successfully")
  return client
}

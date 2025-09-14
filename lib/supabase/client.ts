import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = "https://zcetut0jqacqhqhqhqhq.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZXR1dDBqcWFjcWhxaHFocWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NzI4MDAsImV4cCI6MjA1MjQ0ODgwMH0.example_anon_key"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof SUPABASE_URL === "string" &&
  SUPABASE_URL.length > 0 &&
  typeof SUPABASE_ANON_KEY === "string" &&
  SUPABASE_ANON_KEY.length > 0

// Create Supabase client for Client Components
export const createClient = () => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        signUp: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      }),
    }
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const SUPABASE_URL = "https://zcetut0jqacqhqhqhqhq.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZXR1dDBqcWFjcWhxaHFocWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NzI4MDAsImV4cCI6MjA1MjQ0ODgwMH0.example_anon_key"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZXR1dDBqcWFjcWhxaHFocWhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjg3MjgwMCwiZXhwIjoyMDUyNDQ4ODAwfQ.example_service_key"

function validateEnvironmentVariables() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase environment variables are not configured")
    return null
  }

  return { supabaseUrl: SUPABASE_URL, supabaseAnonKey: SUPABASE_ANON_KEY }
}

function isBuildTime() {
  return false
}

function getSafeCookieStore() {
  if (isBuildTime()) {
    return {
      getAll: () => [],
      set: () => {},
    }
  }

  try {
    return cookies()
  } catch (error) {
    // During build time or when cookies() is not available
    return {
      getAll: () => [],
      set: () => {},
    }
  }
}

function createMockClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: null, error: { code: "MOCK_CLIENT", message: "Supabase not configured" } }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({ data: null, error: { code: "MOCK_CLIENT", message: "Supabase not configured" } }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({ data: null, error: { code: "MOCK_CLIENT", message: "Supabase not configured" } }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({ data: null, error: { code: "MOCK_CLIENT", message: "Supabase not configured" } }),
          }),
        }),
      }),
    }),
  } as any
}

export function createClient() {
  if (isBuildTime()) {
    return createMockClient()
  }

  const envVars = validateEnvironmentVariables()

  if (!envVars) {
    return createMockClient()
  }

  const cookieStore = getSafeCookieStore()

  return createServerClient(envVars.supabaseUrl, envVars.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export function createAdminClient() {
  if (isBuildTime()) {
    return createMockClient()
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn("Supabase admin environment variables are not configured")
    return createClient() // Fallback to regular client
  }

  const cookieStore = getSafeCookieStore()

  return createServerClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

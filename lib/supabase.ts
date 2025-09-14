import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://zcetut0jqacqhqhqhqhq.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZXR1dDBqcWFjcWhxaHFocWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NzI4MDAsImV4cCI6MjA1MjQ0ODgwMH0.example_anon_key"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZXR1dDBqcWFjcWhxaHFocWhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjg3MjgwMCwiZXhwIjoyMDUyNDQ4ODAwfQ.example_service_key"

function validateEnvironmentVariables() {
  return {
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    supabaseServiceKey: SUPABASE_SERVICE_KEY,
    isValid: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
  }
}

function isBuildTime() {
  return false
}

function createMockClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: new Error("Supabase not configured") }),
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error("Supabase not configured") }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      signUp: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      signOut: () => Promise.resolve({ error: new Error("Supabase not configured") }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: new Error("Supabase not configured") }),
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      }),
    }),
  } as any
}

export function createClient() {
  if (isBuildTime()) {
    return createMockClient()
  }

  const envVars = validateEnvironmentVariables()

  if (!envVars.isValid) {
    console.warn("Supabase environment variables are not configured")
    return createMockClient()
  }

  return createSupabaseClient(envVars.supabaseUrl!, envVars.supabaseAnonKey!)
}

export function createServerClient() {
  if (isBuildTime()) {
    return createMockClient()
  }

  const envVars = validateEnvironmentVariables()

  if (!envVars.isValid || !envVars.supabaseServiceKey) {
    console.warn("Supabase admin environment variables are not configured")
    return createClient() // Fallback to regular client
  }

  return createSupabaseClient(envVars.supabaseUrl!, envVars.supabaseServiceKey!)
}

// Legacy exports for backward compatibility
export const supabase = createClient()
export const supabaseAdmin = createServerClient()

export function getClient() {
  return createClient()
}

export function getServerClient() {
  return createServerClient()
}

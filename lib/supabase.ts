import { createClient as createSupabaseClient } from "@supabase/supabase-js"

function validateEnvironmentVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
    isValid: !!(supabaseUrl && supabaseAnonKey),
  }
}

function isBuildTime() {
  return process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV
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

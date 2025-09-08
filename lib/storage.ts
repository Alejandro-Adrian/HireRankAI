import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

function getSupabaseClient() {
  const client = createClient()
  if (!client) {
    throw new Error("Supabase client not available")
  }

  // Check if we're getting the mock client
  if (typeof client.from === "function") {
    const testQuery = client.from("users")
    if (testQuery && typeof testQuery.select === "function") {
      // This is likely the real client
      return client
    }
  }

  // If we reach here, we might have the mock client
  console.error("[v0] Supabase client appears to be a mock client. Check your environment variables:")
  console.error("[v0] Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY")

  return client
}

export async function createUser(
  email: string,
  password: string,
  firstname: string,
  lastname: string,
  company: string,
) {
  const supabase = getSupabaseClient()
  const hashedPassword = await hashPassword(password)

  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      password_hash: hashedPassword,
      firstname,
      lastname,
      company_name: company,
      is_verified: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function findUserByEmail(email: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function getUserByEmail(email: string) {
  return findUserByEmail(email)
}

export async function updateUser(email: string, updates: any) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("users").update(updates).eq("email", email).select().single()

  if (error) throw error
  return data
}

export async function deleteUser(email: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("users").delete().eq("email", email)

  if (error) throw error
  return true
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function storeVerificationCode(email: string, code: string, type: string) {
  const supabase = getSupabaseClient()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  if (type === "verification") {
    const { data, error } = await supabase
      .from("users")
      .update({
        verification_code: code,
        verification_expires_at: expiresAt.toISOString(),
      })
      .eq("email", email)
      .select()
      .single()

    if (error) throw error
    return data
  } else if (type === "reset") {
    const { data, error } = await supabase
      .from("users")
      .update({
        reset_code: code,
        reset_expires_at: expiresAt.toISOString(),
      })
      .eq("email", email)
      .select()
      .single()

    if (error) throw error
    return data
  }

  throw new Error("Invalid verification code type")
}

export async function verifyCode(email: string, code: string, type: string) {
  const supabase = getSupabaseClient()

  if (type === "verification") {
    const { data, error } = await supabase
      .from("users")
      .select("verification_code, verification_expires_at")
      .eq("email", email)
      .single()

    if (error && error.code !== "PGRST116") throw error

    if (
      data &&
      data.verification_code === code &&
      data.verification_expires_at &&
      new Date(data.verification_expires_at) > new Date()
    ) {
      await supabase
        .from("users")
        .update({
          verification_code: null,
          verification_expires_at: null,
        })
        .eq("email", email)

      return true
    }
  } else if (type === "reset") {
    const { data, error } = await supabase
      .from("users")
      .select("reset_code, reset_expires_at")
      .eq("email", email)
      .single()

    if (error && error.code !== "PGRST116") throw error

    if (data && data.reset_code === code && data.reset_expires_at && new Date(data.reset_expires_at) > new Date()) {
      return true
    }
  }

  return false
}

export async function checkCodeValid(email: string, code: string, type: string) {
  const supabase = getSupabaseClient()

  if (type === "verification") {
    const { data, error } = await supabase
      .from("users")
      .select("verification_code, verification_expires_at")
      .eq("email", email)
      .single()

    if (error && error.code !== "PGRST116") throw error

    return !!(
      data &&
      data.verification_code === code &&
      data.verification_expires_at &&
      new Date(data.verification_expires_at) > new Date()
    )
  } else if (type === "reset") {
    const { data, error } = await supabase
      .from("users")
      .select("reset_code, reset_expires_at")
      .eq("email", email)
      .single()

    if (error && error.code !== "PGRST116") throw error

    return !!(data && data.reset_code === code && data.reset_expires_at && new Date(data.reset_expires_at) > new Date())
  }

  return false
}

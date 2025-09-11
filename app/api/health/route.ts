import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      emailUser: !!process.env.EMAIL_USER,
      emailPass: !!process.env.EMAIL_PASS,
      nodeVersion: process.version,
    }

    // Test Supabase connection
    const supabase = createClient()
    let supabaseStatus = "disconnected"

    try {
      const { data, error } = await supabase.from("users").select("count").limit(1)
      if (error && error.code === "MOCK_CLIENT") {
        supabaseStatus = "mock_client"
      } else if (error) {
        supabaseStatus = `error: ${error.message}`
      } else {
        supabaseStatus = "connected"
      }
    } catch (err) {
      supabaseStatus = `connection_failed: ${err instanceof Error ? err.message : "unknown"}`
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: {
        ...envCheck,
        supabaseStatus,
      },
      missingEnvVars: Object.entries(envCheck)
        .filter(([key, value]) => !value && key !== "nodeVersion" && key !== "supabaseStatus")
        .map(([key]) => key),
    })
  } catch (error) {
    console.error("[v0] Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

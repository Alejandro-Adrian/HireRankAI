import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const SUPABASE_URL = "https://zcetut0jqacqhqhqhqhq.supabase.co"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZXR1dDBqcWFjcWhxaHFocWhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjg3MjgwMCwiZXhwIjoyMDUyNDQ4ODAwfQ.example_service_key"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const applicationId = params.id

    // Delete the application
    const { error } = await supabase.from("applications").delete().eq("id", applicationId)

    if (error) {
      console.error("Error deleting application:", error)
      return NextResponse.json({ error: "Failed to delete application" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete application API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

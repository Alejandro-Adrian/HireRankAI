import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // First check if the session exists
    const { data: existingSession, error: fetchError } = await supabase
      .from("video_sessions")
      .select("id")
      .eq("id", id)
      .single()

    if (fetchError || !existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Delete the session
    const { error: deleteError } = await supabase.from("video_sessions").delete().eq("id", id)

    if (deleteError) {
      console.error("Database error:", deleteError)
      return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Session deleted successfully" })
  } catch (error) {
    console.error("Error deleting session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

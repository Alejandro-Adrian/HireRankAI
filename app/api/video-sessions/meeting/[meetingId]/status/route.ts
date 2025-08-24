import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: { meetingId: string } }) {
  try {
    const { meetingId } = params
    const { status } = await request.json()

    if (!status || !["scheduled", "active", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const supabase = createClient()

    const { data: session, error } = await supabase
      .from("video_sessions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("meeting_id", meetingId)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("Error updating session status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

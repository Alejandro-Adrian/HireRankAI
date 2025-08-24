import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { meetingId: string } }) {
  try {
    const { meetingId } = params
    const supabase = createClient()

    const { data: session, error } = await supabase
      .from("video_sessions")
      .select("*")
      .eq("meeting_id", meetingId)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

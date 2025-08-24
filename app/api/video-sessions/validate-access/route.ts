import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { meeting_id, access_token } = await request.json()

    if (!meeting_id || !access_token) {
      return NextResponse.json({ error: "Missing meeting ID or access token" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if the session exists and is active
    const { data: session, error: sessionError } = await supabase
      .from("video_sessions")
      .select("*")
      .eq("meeting_id", meeting_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Invalid meeting ID" }, { status: 404 })
    }

    // Check if the access token is valid for this session
    const { data: invitation, error: invitationError } = await supabase
      .from("interview_invitations")
      .select("*")
      .eq("access_token", access_token)
      .eq("meeting_id", meeting_id)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json({ error: "Invalid access token" }, { status: 403 })
    }

    // Check if the invitation is still valid (not expired)
    const now = new Date()
    const scheduledAt = session.scheduled_at ? new Date(session.scheduled_at) : null

    if (scheduledAt) {
      const sessionEnd = new Date(scheduledAt.getTime() + 2 * 60 * 60 * 1000) // 2 hours after scheduled time
      if (now > sessionEnd) {
        return NextResponse.json({ error: "This interview session has expired" }, { status: 410 })
      }
    }

    // Update session status to active if it's scheduled
    if (session.status === "scheduled") {
      await supabase.from("video_sessions").update({ status: "active" }).eq("id", session.id)
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        meeting_id: session.meeting_id,
      },
      participant: {
        name: invitation.candidate_name,
        email: invitation.candidate_email,
      },
    })
  } catch (error) {
    console.error("Access validation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

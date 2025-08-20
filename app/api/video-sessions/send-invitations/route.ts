import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail, createVideoCallInvitationEmailHTML } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { session_id, application_ids } = await request.json()

    if (!session_id || !application_ids || application_ids.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("video_sessions")
      .select("*")
      .eq("id", session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Get application details
    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select(`
        id,
        candidate_name,
        candidate_email,
        applicant_name,
        applicant_email,
        rankings (title, position)
      `)
      .in("id", application_ids)

    if (appsError || !applications) {
      return NextResponse.json({ error: "Applications not found" }, { status: 404 })
    }

    const emailPromises = applications.map(async (application: any) => {
      const candidateName = application.candidate_name || application.applicant_name || "Candidate"
      const candidateEmail = application.candidate_email || application.applicant_email
      const position = application.rankings?.title || application.rankings?.position || "Position"
      const scheduledTime = session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : undefined

      const emailResult = await sendEmail({
        to: candidateEmail,
        subject: `📹 Video Interview Invitation - ${session.title}`,
        html: createVideoCallInvitationEmailHTML(candidateName, position, session.meeting_url, scheduledTime),
      })

      return emailResult
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter((result) => result.success).length
    const failureCount = results.length - successCount

    // Update session participants count
    await supabase.from("video_sessions").update({ participants_count: applications.length }).eq("id", session_id)

    return NextResponse.json({
      message: `Successfully scheduled ${successCount} interviews! ${failureCount} failed.`,
      sent_count: successCount,
      failed_count: failureCount,
    })
  } catch (error) {
    console.error("Error sending invitations:", error)
    return NextResponse.json({ error: "Failed to send invitations" }, { status: 500 })
  }
}

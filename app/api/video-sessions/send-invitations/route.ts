import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail, createVideoCallInvitationEmailHTML } from "@/lib/email"
import { randomBytes } from "crypto"

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

    const invitationPromises = applications.map(async (application: any) => {
      const candidateName = application.candidate_name || application.applicant_name || "Candidate"
      const candidateEmail = application.candidate_email || application.applicant_email
      const position = application.rankings?.title || application.rankings?.position || "Position"

      // Generate secure access token
      const accessToken = randomBytes(32).toString("hex")

      // Set expiration time (2 hours after scheduled time, or 24 hours from now if ASAP)
      const expiresAt = session.scheduled_at
        ? new Date(new Date(session.scheduled_at).getTime() + 2 * 60 * 60 * 1000) // 2 hours after scheduled
        : new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

      // Create invitation record
      const { data: invitation, error: invitationError } = await supabase
        .from("interview_invitations")
        .insert({
          meeting_id: session.meeting_id,
          application_id: application.id,
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          access_token: accessToken,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (invitationError) {
        console.error("Failed to create invitation:", invitationError)
        return { success: false, email: candidateEmail, error: invitationError.message }
      }

      // Create join URL with access token
      const joinUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/join/${session.meeting_id}?token=${accessToken}&name=${encodeURIComponent(candidateName)}`
      const scheduledTime = session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : undefined

      // Send email with join link
      const emailResult = await sendEmail({
        to: candidateEmail,
        subject: `📹 Video Interview Invitation - ${session.title}`,
        html: createVideoCallInvitationEmailHTML(candidateName, position, joinUrl, scheduledTime),
      })

      return { ...emailResult, email: candidateEmail }
    })

    const results = await Promise.all(invitationPromises)
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

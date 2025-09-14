import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail, createCongratulationsEmailHTML } from "@/lib/email"

const SUPABASE_URL = "https://zcetut0jqacqhqhqhqhq.supabase.co"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZXR1dDBqcWFjcWhxaHFocWhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjg3MjgwMCwiZXhwIjoyMDUyNDQ4ODAwfQ.example_service_key"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { notes } = await request.json()
    const applicationId = params.id

    // Get application details
    const { data: application, error: fetchError } = await supabase
      .from("applications")
      .select(`
        *,
        rankings (
          title,
          position,
          description
        )
      `)
      .eq("id", applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Update application to mark as selected
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        selected_for_interview: true,
        interview_invitation_sent_at: new Date().toISOString(),
        interview_notes: notes || null,
        status: "selected",
      })
      .eq("id", applicationId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
    }

    const jobTitle = application.rankings.position.replace("/", " / ")
    const candidateName = application.applicant_name || application.candidate_name || "Candidate"
    const ranking = application.rank_position || application.rank || 1
    const score = application.total_score || 0

    const emailResult = await sendEmail({
      to: application.applicant_email || application.candidate_email,
      subject: `🎉 Congratulations! Interview Invitation for ${jobTitle} Position`,
      html: createCongratulationsEmailHTML(candidateName, jobTitle, ranking, score),
    })

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error)
      return NextResponse.json({
        success: true,
        message: "Candidate selected successfully, but email delivery failed. Please contact them manually.",
        emailError: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Candidate selected and email sent successfully",
    })
  } catch (error) {
    console.error("Error selecting candidate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

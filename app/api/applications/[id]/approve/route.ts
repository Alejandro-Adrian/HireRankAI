import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { sendEmail, createCongratulationsEmailHTML } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(true) // true for service role access

    const { notes } = await request.json()
    const applicationId = params.id

    // Get application details
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        *,
        rankings!inner(title, position)
      `)
      .eq("id", applicationId)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Update application status
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        selected_for_interview: true,
        interview_invitation_sent_at: new Date().toISOString(),
        interview_notes: notes || "Candidate approved for interview process",
        status: "approved",
      })
      .eq("id", applicationId)

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
    }

    // Send congratulations email
    try {
      const emailHtml = createCongratulationsEmailHTML(
        application.applicant_name,
        application.rankings?.position || "the position",
        application.rank || 1,
        application.total_score || 0,
      )

      const emailResult = await sendEmail({
        to: application.applicant_email,
        subject: "Congratulations! You've been selected for interview",
        html: emailHtml,
      })

      if (!emailResult.success) {
        console.error("Email sending failed:", emailResult.error)
        return NextResponse.json({
          success: true,
          message: "Candidate approved but email delivery failed. Please contact candidate manually.",
          emailError: true,
        })
      }

      return NextResponse.json({
        success: true,
        message: "Candidate approved and congratulations email sent successfully!",
      })
    } catch (emailError) {
      console.error("Email error:", emailError)
      return NextResponse.json({
        success: true,
        message: "Candidate approved but email delivery failed. Please contact candidate manually.",
        emailError: true,
      })
    }
  } catch (error) {
    console.error("Error approving candidate:", error)
    return NextResponse.json({ error: "Failed to approve candidate" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { sendEmail, createRejectionEmailHTML } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()

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
        selected_for_interview: false,
        interview_notes: notes || "Candidate not selected for interview process",
        status: "rejected",
      })
      .eq("id", applicationId)

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
    }

    // Send rejection email
    try {
      const emailHtml = createRejectionEmailHTML(
        application.applicant_name,
        application.rankings?.position || "the position",
        application.rank || 1,
        application.total_score || 0,
      )

      const emailResult = await sendEmail({
        to: application.applicant_email,
        subject: "Application Update - Thank you for your interest",
        html: emailHtml,
      })

      if (!emailResult.success) {
        console.error("Email sending failed:", emailResult.error)
        return NextResponse.json({
          success: true,
          message: "Candidate rejected but email delivery failed. Please contact candidate manually.",
          emailError: true,
        })
      }

      return NextResponse.json({
        success: true,
        message: "Candidate rejected and notification email sent successfully!",
      })
    } catch (emailError) {
      console.error("Email error:", emailError)
      return NextResponse.json({
        success: true,
        message: "Candidate rejected but email delivery failed. Please contact candidate manually.",
        emailError: true,
      })
    }
  } catch (error) {
    console.error("Error rejecting candidate:", error)
    return NextResponse.json({ error: "Failed to reject candidate" }, { status: 500 })
  }
}

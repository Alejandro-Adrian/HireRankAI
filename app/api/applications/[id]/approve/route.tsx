import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/email"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { interviewNotes } = await request.json()
    const applicationId = params.id

    console.log("[v0] 🚀 Starting candidate approval for application:", applicationId)

    // Fetch application details with ranking information
    const { data: application, error: fetchError } = await supabase
      .from("applications")
      .select(`
        *,
        rankings!inner(title, position)
      `)
      .eq("id", applicationId)
      .single()

    if (fetchError || !application) {
      console.error("[v0] ❌ Failed to fetch application:", fetchError)
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Update application status
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", applicationId)

    if (updateError) {
      console.error("[v0] ❌ Failed to update application:", updateError)
      return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
    }

    // Send congratulations email
    let emailSent = false
    try {
      await sendEmail({
        to: application.applicant_email,
        subject: "🎉 Congratulations! Your Application Has Been Approved",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; overflow: hidden;">
            <div style="padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700;">🎉 Congratulations!</h1>
              <p style="font-size: 18px; margin: 0 0 30px 0; opacity: 0.9;">Your application has been approved!</p>
              
              <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 25px; margin: 20px 0; backdrop-filter: blur(10px);">
                <h2 style="margin: 0 0 15px 0; font-size: 20px;">Dear ${application.applicant_name},</h2>
                <p style="margin: 0 0 15px 0; line-height: 1.6;">We're excited to inform you that your application for <strong>${application.rankings?.position || "the position"}</strong> has been approved! Our team was impressed with your qualifications and experience.</p>
                ${interviewNotes ? `<p style="margin: 15px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; font-style: italic;">"${interviewNotes}"</p>` : ""}
                <p style="margin: 15px 0 0 0; line-height: 1.6;">We'll be in touch soon with next steps. Thank you for your interest in joining our team!</p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                <p style="margin: 0; font-size: 14px; opacity: 0.8;">Best regards,<br>The HireRankerAI Team</p>
              </div>
            </div>
          </div>
        `,
      })
      emailSent = true
      console.log("[v0] ✅ Congratulations email sent successfully")
    } catch (emailError) {
      console.error("[v0] ⚠️ Failed to send email:", emailError)
      // Don't fail the entire process if email fails
    }

    console.log("[v0] ✅ Candidate approval completed successfully")

    return NextResponse.json({
      success: true,
      message: "Candidate approved successfully!",
      emailSent,
      application: {
        id: application.id,
        name: application.applicant_name,
        email: application.applicant_email,
        status: "approved",
      },
    })
  } catch (error) {
    console.error("[v0] ❌ Critical error in approval process:", error)
    return NextResponse.json(
      {
        error: "Failed to approve candidate due to system error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

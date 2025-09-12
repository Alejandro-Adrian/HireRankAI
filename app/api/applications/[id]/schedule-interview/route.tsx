import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import nodemailer from "nodemailer"
import { v4 as uuidv4 } from "uuid"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { scheduledAt, notes } = await request.json()
    const applicationId = params.id

    // Generate unique meeting ID and tokens
    const meetingId = uuidv4()
    const hrAccessToken = uuidv4()
    const applicantAccessToken = uuidv4()
    const meetingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/interview/${meetingId}`

    // Get application details
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update({
        selected_for_interview: true,
        interview_invitation_sent_at: new Date().toISOString(),
        interview_notes: notes || `Interview scheduled for: ${scheduledAt || "ASAP"}. Meeting: ${meetingUrl}`,
      })
      .eq("id", applicationId)

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
    }

    // TODO: Uncomment after running migration script
    /*
    const { error: sessionError } = await supabase.from("interview_sessions").insert({
      application_id: applicationId,
      meeting_id: meetingId,
      meeting_url: meetingUrl,
      scheduled_at: scheduledAt,
      hr_access_token: hrAccessToken,
      applicant_access_token: applicantAccessToken,
    })

    if (sessionError) {
      console.error("Failed to create interview session:", sessionError)
    }
    */

    // Send email with interview details
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const scheduledDate = scheduledAt ? new Date(scheduledAt) : null
    const isASAP = !scheduledDate
    const dateTimeText = isASAP
      ? "as soon as possible (ASAP)"
      : scheduledDate.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .interview-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .meeting-link { background: #667eea; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .important { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>You've been selected for an interview</p>
            </div>
            <div class="content">
              <p>Dear ${application.applicant_name},</p>
              
              <p>We are pleased to inform you that after reviewing your application, you have been selected to proceed to the interview stage for the position you applied for.</p>
              
              <div class="interview-details">
                <h3>📅 Interview Details</h3>
                <p><strong>Scheduled Time:</strong> ${dateTimeText}</p>
                <p><strong>Format:</strong> Video Call Interview</p>
                <p><strong>Your Application Score:</strong> ${application.total_score}%</p>
              </div>

              <div class="important">
                <h4>🔗 Video Call Access</h4>
                <p><strong>Important:</strong> You can only join the video call ${isASAP ? "when the interview begins" : "at your scheduled time"}. The HR team can join at any time to prepare.</p>
                <a href="${meetingUrl}?token=${applicantAccessToken}" class="meeting-link">Join Interview Call</a>
                <p><small>Click the link above ${isASAP ? "when your interview begins" : "at your scheduled time"} to join the video call.</small></p>
              </div>

              <h3>📋 Next Steps</h3>
              <ul>
                <li>Save this email and the meeting link for easy access</li>
                <li>Test your camera and microphone before the interview</li>
                <li>Prepare any questions you'd like to ask about the role</li>
                <li>Join the call ${isASAP ? "when notified" : "at your scheduled time"}</li>
              </ul>

              <p>We look forward to speaking with you and learning more about your qualifications.</p>
              
              <p>Best regards,<br>The Hiring Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message from our hiring system.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: application.email,
      subject: `Interview Invitation - Congratulations!`,
      html: emailHtml,
      text: `Congratulations ${application.applicant_name}! You've been selected for an interview scheduled ${dateTimeText}. Join the video call at: ${meetingUrl}?token=${applicantAccessToken}`,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      meetingUrl,
      hrAccessUrl: `${meetingUrl}?token=${hrAccessToken}`,
      applicantAccessUrl: `${meetingUrl}?token=${applicantAccessToken}`,
      scheduledAt: scheduledAt || "ASAP",
    })
  } catch (error) {
    console.error("Error scheduling interview:", error)
    return NextResponse.json({ error: "Failed to schedule interview" }, { status: 500 })
  }
}

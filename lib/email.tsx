import nodemailer from "nodemailer"
import { config } from "dotenv"

config() // Load environment variables from .env file

// Email configuration using the provided credentials
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || "adrianalejandro052004@gmail.com",
    pass: process.env.EMAIL_PASS || "lftzdsvacnbeuxwi",
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: '"HireRankerAI" <adrianalejandro052004@gmail.com>',
      to,
      subject,
      html,
    })

    console.log("Email sent: %s", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function createVerificationEmailHTML(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .code { background: #4F46E5; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 4px; margin: 20px 0; letter-spacing: 3px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello!</p>
          <p>Thank you for signing up. Please use the verification code below to complete your registration:</p>
          <div class="code">${code}</div>
          <p>This code will expire in 10 minutes for security reasons.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function createPasswordResetEmailHTML(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .code { background: #DC2626; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 4px; margin: 20px 0; letter-spacing: 3px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <p>Hello!</p>
          <p>You requested to reset your password. Please use the verification code below:</p>
          <div class="code">${code}</div>
          <p>This code will expire in 10 minutes for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function createPasswordChangeEmailHTML(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Change Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .code { background: #F59E0B; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 4px; margin: 20px 0; letter-spacing: 3px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Change Verification</h1>
        </div>
        <div class="content">
          <p>Hello!</p>
          <p>You requested to change your password. Please use the verification code below to confirm this change:</p>
          <div class="code">${code}</div>
          <p>This code will expire in 10 minutes for security reasons.</p>
          <p>If you didn't request this password change, please contact support immediately.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function createAccountDeletionEmailHTML(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Account Deletion Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .code { background: #DC2626; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 4px; margin: 20px 0; letter-spacing: 3px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .warning { background: #FEF2F2; border: 1px solid #FECACA; padding: 15px; border-radius: 4px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Account Deletion Verification</h1>
        </div>
        <div class="content">
          <p>Hello!</p>
          <div class="warning">
            <strong>WARNING:</strong> You requested to permanently delete your account. This action cannot be undone.
          </div>
          <p>Please use the verification code below to confirm account deletion:</p>
          <div class="code">${code}</div>
          <p>This code will expire in 10 minutes for security reasons.</p>
          <p><strong>This will permanently delete:</strong></p>
          <ul>
            <li>All your rankings and job postings</li>
            <li>Candidate applications and data</li>
            <li>Interview records and notes</li>
            <li>Account settings and preferences</li>
          </ul>
          <p>If you didn't request this account deletion, please contact support immediately.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function createCongratulationsEmailHTML(
  candidateName: string,
  position: string,
  ranking: number,
  score: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>🎉 Congratulations - You've Been Selected!</title>
      <style>
        body { 
          font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #1F2937; 
          margin: 0; 
          padding: 0; 
          background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%);
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          background: linear-gradient(135deg, #10B981 0%, #059669 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          border-radius: 16px 16px 0 0; 
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.2);
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content { 
          background: white; 
          padding: 40px 30px; 
          border-radius: 0 0 16px 16px; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .highlight { 
          background: linear-gradient(135deg, #10B981 0%, #059669 100%); 
          color: white; 
          padding: 20px; 
          text-align: center; 
          font-size: 18px; 
          font-weight: 600; 
          border-radius: 12px; 
          margin: 25px 0; 
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .stats { 
          background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%); 
          border: 2px solid #A7F3D0; 
          padding: 25px; 
          border-radius: 12px; 
          margin: 25px 0; 
        }
        .stats h3 {
          color: #059669;
          margin-top: 0;
          font-size: 18px;
          font-weight: 600;
        }
        .stats p {
          margin: 8px 0;
          font-weight: 500;
        }
        .next-steps { 
          background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%); 
          border: 2px solid #BFDBFE; 
          padding: 25px; 
          border-radius: 12px; 
          margin: 25px 0; 
        }
        .next-steps h3 {
          color: #1D4ED8;
          margin-top: 0;
          font-size: 18px;
          font-weight: 600;
        }
        .next-steps ul {
          margin: 15px 0;
          padding-left: 20px;
        }
        .next-steps li {
          margin: 8px 0;
          font-weight: 500;
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          color: #6B7280; 
          font-size: 14px; 
          padding: 20px;
          background: rgba(255,255,255,0.8);
          border-radius: 8px;
        }
        .celebration {
          font-size: 48px;
          text-align: center;
          margin: 20px 0;
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        .score-badge {
          display: inline-block;
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 16px;
          margin: 0 5px;
        }
        .rank-badge {
          display: inline-block;
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 16px;
          margin: 0 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="celebration">🎉</div>
          <h1>Congratulations!</h1>
          <p>You have successfully passed our selection process</p>
        </div>
        <div class="content">
          <p>Dear <strong>${candidateName}</strong>,</p>
          
          <p>We are absolutely <strong>delighted</strong> to inform you that you have successfully passed our rigorous applicant selection process for the <strong>${position}</strong> position at HireRankerAI!</p>
          
          <div class="highlight">
            ✅ You have been <strong>APPROVED</strong> for the interview process!
          </div>
          
          <div class="stats">
            <h3>📊 Your Outstanding Results:</h3>
            <p>• <strong>Position Applied:</strong> ${position}</p>
            <p>• <strong>Your Ranking:</strong> <span class="rank-badge">#${ranking}</span></p>
            <p>• <strong>Achievement Score:</strong> <span class="score-badge">${score}%</span></p>
            <p>• <strong>Status:</strong> <span style="color: #059669; font-weight: 600;">✅ APPROVED FOR INTERVIEW</span></p>
          </div>

          <div class="next-steps">
            <h3>📅 What Happens Next?</h3>
            <p><strong>🔔 Please keep an eye on your inbox!</strong> Our HR team will send you another email within the next <strong>2-3 business days</strong> with your interview details.</p>
            
            <p><strong>Your upcoming interview package will include:</strong></p>
            <ul>
              <li>📅 <strong>Specific interview date and time</strong></li>
              <li>💻 <strong>Interview format</strong> (video call, phone, or in-person)</li>
              <li>📋 <strong>Interview preparation guidelines</strong></li>
              <li>👥 <strong>Information about your interviewers</strong></li>
              <li>📞 <strong>Direct contact information</strong> for any questions</li>
              <li>🎯 <strong>What to expect during the interview</strong></li>
            </ul>
            
            <p style="background: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 15px 0;">
              <strong>💡 Pro Tip:</strong> Start preparing now! Review the job description, research our company, and prepare examples of your relevant experience.
            </p>
          </div>

          <p>This is a significant achievement, and you should be proud of making it through our competitive selection process. We were impressed by your qualifications and look forward to learning more about you during the interview.</p>
          
          <p style="font-size: 18px; color: #059669; font-weight: 600; text-align: center; margin: 30px 0;">
            🌟 Welcome to the next step of your journey with HireRankerAI! 🌟
          </p>
          
          <p>Warm regards,<br>
          <strong>The HireRankerAI Talent Acquisition Team</strong><br>
          <em>Building the future, one great hire at a time</em></p>
        </div>
        <div class="footer">
          <p>📧 This is an automated message from our AI-powered hiring system.</p>
          <p>🔒 Your information is secure and confidential.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function createVideoCallInvitationEmailHTML(
  candidateName: string,
  position: string,
  meetingUrl: string,
  scheduledTime?: string,
): string {
  const timeInfo = scheduledTime ? `scheduled for ${scheduledTime}` : "available immediately (ASAP)"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Video Interview Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .meeting-link { background: #3B82F6; color: white; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0; }
        .meeting-link a { color: white; text-decoration: none; font-weight: bold; font-size: 18px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .info-box { background: #EFF6FF; border: 1px solid #BFDBFE; padding: 15px; border-radius: 4px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📹 Video Interview Invitation</h1>
        </div>
        <div class="content">
          <p>Dear ${candidateName},</p>
          <p>You are invited to a video interview for the <strong>${position}</strong> position!</p>
          <div class="info-box">
            <p><strong>Interview Details:</strong></p>
            <p>• Position: ${position}</p>
            <p>• Interview Time: ${timeInfo}</p>
            <p>• Format: Video Call</p>
          </div>
          <p>Please use the following link to join the video interview:</p>
          <div class="meeting-link">
            <a href="${meetingUrl}" target="_blank">Join Video Interview</a>
          </div>
          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Please test your camera and microphone before the interview</li>
            <li>Ensure you have a stable internet connection</li>
            <li>Join from a quiet, well-lit location</li>
            <li>You can only join at the designated time</li>
            <li>Our HR team can join at any time</li>
          </ul>
          <p>If you have any technical issues or questions, please contact our HR team.</p>
          <p>We look forward to speaking with you!</p>
          <p>Best regards,<br>The HR Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function createRejectionEmailHTML(
  candidateName: string,
  position: string,
  ranking: number,
  score: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Application Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6B7280; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .stats { background: #F3F4F6; border: 1px solid #D1D5DB; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .encouragement { background: #EFF6FF; border: 1px solid #BFDBFE; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Update</h1>
          <p>Thank you for your interest in our position</p>
        </div>
        <div class="content">
          <p>Dear ${candidateName},</p>
          <p>Thank you for taking the time to apply for the <strong>${position}</strong> position with our company. We appreciate your interest and the effort you put into your application.</p>
          
          <div class="stats">
            <h3>📊 Your Application Results:</h3>
            <p>• <strong>Position:</strong> ${position}</p>
            <p>• <strong>Your Ranking:</strong> #${ranking}</p>
            <p>• <strong>Score:</strong> ${score}%</p>
            <p>• <strong>Status:</strong> Not Selected</p>
          </div>

          <p>After careful consideration of all applications, we have decided to move forward with other candidates whose qualifications more closely match our current requirements.</p>

          <div class="encouragement">
            <h3>💪 Keep Moving Forward</h3>
            <p>Please don't let this discourage you. Your skills and experience are valuable, and we encourage you to:</p>
            <ul>
              <li>Continue developing your professional skills</li>
              <li>Apply for future opportunities that match your expertise</li>
              <li>Keep building your experience in your field</li>
            </ul>
            <p>We will keep your application on file and may contact you for future positions that better align with your background.</p>
          </div>

          <p>We wish you the best of luck in your job search and future career endeavors.</p>
          
          <p>Best regards,<br>The Hiring Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message from our hiring system.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

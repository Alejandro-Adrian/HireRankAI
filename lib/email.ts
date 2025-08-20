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
      from: '"Auth System" <adrianalejandro052004@gmail.com>',
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
      <title>Congratulations - Interview Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .highlight { background: #10B981; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .stats { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 15px; border-radius: 4px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
        </div>
        <div class="content">
          <p>Dear ${candidateName},</p>
          <p>We are pleased to inform you that you have been selected for an interview for the <strong>${position}</strong> position!</p>
          <div class="highlight">
            You have been selected for the interview process
          </div>
          <div class="stats">
            <p><strong>Your Application Results:</strong></p>
            <p>• Position: ${position}</p>
            <p>• Your Ranking: #${ranking}</p>
            <p>• Score: ${score}%</p>
          </div>
          <p>Our HR team will contact you soon with further details about the interview process, including the date, time, and format of the interview.</p>
          <p>Thank you for your interest in joining our team. We look forward to speaking with you!</p>
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

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
    console.log("[v0] 📧 Attempting to send email to:", to)
    console.log("[v0] 📧 Email subject:", subject)
    console.log("[v0] 📧 Using SMTP config:", {
      host: "smtp.gmail.com",
      port: 587,
      user: process.env.EMAIL_USER || "adrianalejandro052004@gmail.com",
    })

    const info = await transporter.sendMail({
      from: '"HireRankerAI" <adrianalejandro052004@gmail.com>',
      to,
      subject,
      html,
    })

    console.log("[v0] ✅ Email sent successfully:", info.messageId)
    console.log("[v0] 📧 Email response:", info.response)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("[v0] ❌ Email sending failed:", error)
    if (error instanceof Error) {
      console.error("[v0] ❌ Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #dcfce7 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(5, 150, 105, 0.15), 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(5, 150, 105, 0.1);
        }
        
        .header { 
          background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1;
        }
        
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
          font-weight: 400;
          position: relative;
          z-index: 1;
        }
        
        .content { 
          background: white;
          padding: 40px 30px; 
          position: relative;
        }
        
        .welcome-text {
          font-size: 18px;
          color: #059669;
          font-weight: 600;
          margin-bottom: 20px;
        }
        
        .main-text {
          font-size: 16px;
          color: #374151;
          margin-bottom: 30px;
          line-height: 1.7;
        }
        
        .code-container {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);
        }
        
        .code-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: slideShine 2s infinite;
        }
        
        .code-label {
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .code { 
          color: white; 
          font-size: 32px; 
          font-weight: 700; 
          letter-spacing: 8px;
          font-family: 'Monaco', 'Menlo', monospace;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          position: relative;
          z-index: 1;
        }
        
        .security-info {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .security-icon {
          font-size: 20px;
          color: #d97706;
        }
        
        .security-text {
          color: #92400e;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }
        
        .footer { 
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          text-align: center; 
          padding: 30px;
          color: #6b7280; 
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-brand {
          font-weight: 600;
          color: #059669;
          margin-bottom: 8px;
        }
        
        .footer-text {
          margin: 0;
          line-height: 1.5;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 25px 0;
        }
        
        @keyframes shimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideShine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @media (max-width: 600px) {
          body { padding: 10px; }
          .email-container { border-radius: 16px; }
          .header { padding: 30px 20px; }
          .header h1 { font-size: 24px; }
          .content { padding: 30px 20px; }
          .code { font-size: 28px; letter-spacing: 6px; }
          .code-container { padding: 25px 15px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>✨ Email Verification</h1>
          <p>Secure your HireRankerAI account</p>
        </div>
        <div class="content">
          <p class="welcome-text">Hello there! 👋</p>
          <p class="main-text">Thank you for joining HireRankerAI! We're excited to have you on board. Please use the verification code below to complete your registration and unlock all the amazing features waiting for you.</p>
          
          <div class="code-container">
            <div class="code-label">Your Verification Code</div>
            <div class="code">${code}</div>
          </div>
          
          <div class="security-info">
            <span class="security-icon">🔒</span>
            <p class="security-text">This code will expire in 10 minutes for your security. Keep it confidential!</p>
          </div>
          
          <div class="divider"></div>
          
          <p class="main-text">If you didn't create an account with HireRankerAI, you can safely ignore this email. No further action is required.</p>
        </div>
        <div class="footer">
          <div class="footer-brand">HireRankerAI</div>
          <p class="footer-text">This is an automated message. Please do not reply to this email.<br>© 2024 HireRankerAI. All rights reserved.</p>
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(220, 38, 38, 0.15), 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.1);
        }
        
        .header { 
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%);
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1;
        }
        
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
          font-weight: 400;
          position: relative;
          z-index: 1;
        }
        
        .content { 
          background: white;
          padding: 40px 30px; 
          position: relative;
        }
        
        .welcome-text {
          font-size: 18px;
          color: #dc2626;
          font-weight: 600;
          margin-bottom: 20px;
        }
        
        .main-text {
          font-size: 16px;
          color: #374151;
          margin-bottom: 30px;
          line-height: 1.7;
        }
        
        .code-container {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
        }
        
        .code-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: slideShine 2s infinite;
        }
        
        .code-label {
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .code { 
          color: white; 
          font-size: 32px; 
          font-weight: 700; 
          letter-spacing: 8px;
          font-family: 'Monaco', 'Menlo', monospace;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          position: relative;
          z-index: 1;
        }
        
        .security-info {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .security-icon {
          font-size: 20px;
          color: #d97706;
        }
        
        .security-text {
          color: #92400e;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }
        
        .footer { 
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          text-align: center; 
          padding: 30px;
          color: #6b7280; 
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-brand {
          font-weight: 600;
          color: #dc2626;
          margin-bottom: 8px;
        }
        
        .footer-text {
          margin: 0;
          line-height: 1.5;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 25px 0;
        }
        
        @keyframes shimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideShine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @media (max-width: 600px) {
          body { padding: 10px; }
          .email-container { border-radius: 16px; }
          .header { padding: 30px 20px; }
          .header h1 { font-size: 24px; }
          .content { padding: 30px 20px; }
          .code { font-size: 28px; letter-spacing: 6px; }
          .code-container { padding: 25px 15px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🔐 Password Reset</h1>
          <p>Secure your account access</p>
        </div>
        <div class="content">
          <p class="welcome-text">Security Alert! 🛡️</p>
          <p class="main-text">We received a request to reset your HireRankerAI account password. If this was you, please use the verification code below to proceed with resetting your password.</p>
          
          <div class="code-container">
            <div class="code-label">Your Reset Code</div>
            <div class="code">${code}</div>
          </div>
          
          <div class="security-info">
            <span class="security-icon">⏰</span>
            <p class="security-text">This code will expire in 10 minutes for your security. Use it promptly!</p>
          </div>
          
          <div class="divider"></div>
          
          <p class="main-text">If you didn't request this password reset, please ignore this email and your password will remain unchanged. Consider updating your account security if you're concerned.</p>
        </div>
        <div class="footer">
          <div class="footer-brand">HireRankerAI</div>
          <p class="footer-text">This is an automated security message. Please do not reply to this email.<br>© 2024 HireRankerAI. All rights reserved.</p>
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Change Verification - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(245, 158, 11, 0.15), 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.1);
        }
        
        .header { 
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #fb923c 100%);
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1;
        }
        
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
          font-weight: 400;
          position: relative;
          z-index: 1;
        }
        
        .content { 
          background: white;
          padding: 40px 30px; 
          position: relative;
        }
        
        .welcome-text {
          font-size: 18px;
          color: #f59e0b;
          font-weight: 600;
          margin-bottom: 20px;
        }
        
        .main-text {
          font-size: 16px;
          color: #374151;
          margin-bottom: 30px;
          line-height: 1.7;
        }
        
        .code-container {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
        }
        
        .code-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: slideShine 2s infinite;
        }
        
        .code-label {
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .code { 
          color: white; 
          font-size: 32px; 
          font-weight: 700; 
          letter-spacing: 8px;
          font-family: 'Monaco', 'Menlo', monospace;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          position: relative;
          z-index: 1;
        }
        
        .security-info {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .security-icon {
          font-size: 20px;
          color: #d97706;
        }
        
        .security-text {
          color: #92400e;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }
        
        .footer { 
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          text-align: center; 
          padding: 30px;
          color: #6b7280; 
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-brand {
          font-weight: 600;
          color: #f59e0b;
          margin-bottom: 8px;
        }
        
        .footer-text {
          margin: 0;
          line-height: 1.5;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 25px 0;
        }
        
        @keyframes shimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideShine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @media (max-width: 600px) {
          body { padding: 10px; }
          .email-container { border-radius: 16px; }
          .header { padding: 30px 20px; }
          .header h1 { font-size: 24px; }
          .content { padding: 30px 20px; }
          .code { font-size: 28px; letter-spacing: 6px; }
          .code-container { padding: 25px 15px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🔄 Password Change</h1>
          <p>Confirm your security update</p>
        </div>
        <div class="content">
          <p class="welcome-text">Account Update! 🔐</p>
          <p class="main-text">You requested to change your HireRankerAI account password. To ensure this change is authorized by you, please use the verification code below to confirm this security update.</p>
          
          <div class="code-container">
            <div class="code-label">Your Confirmation Code</div>
            <div class="code">${code}</div>
          </div>
          
          <div class="security-info">
            <span class="security-icon">🔒</span>
            <p class="security-text">This code will expire in 10 minutes. Complete the process promptly for security.</p>
          </div>
          
          <div class="divider"></div>
          
          <p class="main-text">If you didn't request this password change, please contact our support team immediately. Your account security is our top priority.</p>
        </div>
        <div class="footer">
          <div class="footer-brand">HireRankerAI</div>
          <p class="footer-text">This is an automated security message. Please do not reply to this email.<br>© 2024 HireRankerAI. All rights reserved.</p>
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Deletion Verification - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(220, 38, 38, 0.15), 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.1);
        }
        
        .header { 
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%);
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1;
        }
        
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
          font-weight: 400;
          position: relative;
          z-index: 1;
        }
        
        .content { 
          background: white;
          padding: 40px 30px; 
          position: relative;
        }
        
        .welcome-text {
          font-size: 18px;
          color: #dc2626;
          font-weight: 600;
          margin-bottom: 20px;
        }
        
        .main-text {
          font-size: 16px;
          color: #374151;
          margin-bottom: 30px;
          line-height: 1.7;
        }
        
        .warning { 
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); 
          border: 2px solid #fca5a5; 
          padding: 25px; 
          border-radius: 16px; 
          margin: 25px 0;
          position: relative;
        }
        
        .warning-title {
          color: #dc2626;
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .warning-text {
          color: #7f1d1d;
          font-size: 14px;
          margin: 0;
        }
        
        .code-container {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
        }
        
        .code-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: slideShine 2s infinite;
        }
        
        .code-label {
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .code { 
          color: white; 
          font-size: 32px; 
          font-weight: 700; 
          letter-spacing: 8px;
          font-family: 'Monaco', 'Menlo', monospace;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          position: relative;
          z-index: 1;
        }
        
        .deletion-list {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
        }
        
        .deletion-list h4 {
          color: #374151;
          font-weight: 600;
          margin-bottom: 15px;
          font-size: 16px;
        }
        
        .deletion-list ul {
          margin: 0;
          padding-left: 20px;
          color: #6b7280;
        }
        
        .deletion-list li {
          margin: 8px 0;
          font-size: 14px;
        }
        
        .security-info {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .security-icon {
          font-size: 20px;
          color: #d97706;
        }
        
        .security-text {
          color: #92400e;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }
        
        .footer { 
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          text-align: center; 
          padding: 30px;
          color: #6b7280; 
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-brand {
          font-weight: 600;
          color: #dc2626;
          margin-bottom: 8px;
        }
        
        .footer-text {
          margin: 0;
          line-height: 1.5;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 25px 0;
        }
        
        @keyframes shimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideShine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @media (max-width: 600px) {
          body { padding: 10px; }
          .email-container { border-radius: 16px; }
          .header { padding: 30px 20px; }
          .header h1 { font-size: 24px; }
          .content { padding: 30px 20px; }
          .code { font-size: 28px; letter-spacing: 6px; }
          .code-container { padding: 25px 15px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>⚠️ Account Deletion</h1>
          <p>Final confirmation required</p>
        </div>
        <div class="content">
          <p class="welcome-text">Critical Action Required! 🚨</p>
          
          <div class="warning">
            <div class="warning-title">
              <span>⚠️</span>
              <span>PERMANENT DELETION WARNING</span>
            </div>
            <p class="warning-text">You requested to permanently delete your HireRankerAI account. This action cannot be undone and will result in complete data loss.</p>
          </div>
          
          <p class="main-text">If you're certain about this decision, please use the verification code below to confirm the permanent deletion of your account.</p>
          
          <div class="code-container">
            <div class="code-label">Your Deletion Code</div>
            <div class="code">${code}</div>
          </div>
          
          <div class="security-info">
            <span class="security-icon">⏰</span>
            <p class="security-text">This code will expire in 10 minutes. This is your final opportunity to reconsider.</p>
          </div>
          
          <div class="deletion-list">
            <h4>🗑️ This will permanently delete:</h4>
            <ul>
              <li>All your rankings and job postings</li>
              <li>Candidate applications and data</li>
              <li>Interview records and notes</li>
              <li>Account settings and preferences</li>
              <li>All associated files and documents</li>
            </ul>
          </div>
          
          <div class="divider"></div>
          
          <p class="main-text">If you didn't request this account deletion, please contact our support team immediately. Your account security is our top priority.</p>
        </div>
        <div class="footer">
          <div class="footer-brand">HireRankerAI</div>
          <p class="footer-text">This is an automated security message. Please do not reply to this email.<br>© 2024 HireRankerAI. All rights reserved.</p>
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🎉 Congratulations - You've Been Selected!</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #1F2937; 
          background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(16, 185, 129, 0.2), 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.1);
        }
        
        .header { 
          background: linear-gradient(135deg, #10B981 0%, #059669 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1;
        }
        
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
        
        .content { 
          background: white; 
          padding: 40px 30px; 
        }
        
        .celebration {
          font-size: 48px;
          text-align: center;
          margin: 20px 0;
          animation: bounce 2s infinite;
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
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          text-align: center; 
          padding: 30px;
          color: #6B7280; 
          font-size: 14px; 
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-brand {
          font-weight: 600;
          color: #059669;
          margin-bottom: 8px;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes shimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 600px) {
          body { padding: 10px; }
          .email-container { border-radius: 16px; }
          .header { padding: 30px 20px; }
          .header h1 { font-size: 24px; }
          .content { padding: 30px 20px; }
          .celebration { font-size: 36px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
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
          <div class="footer-brand">HireRankerAI</div>
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Video Interview Invitation - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #e0f2fe 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(59, 130, 246, 0.15), 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.1);
        }
        
        .header { 
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%);
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1;
        }
        
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
        
        .content { 
          background: white;
          padding: 40px 30px; 
        }
        
        .meeting-link { 
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); 
          color: white; 
          padding: 20px; 
          text-align: center; 
          border-radius: 16px; 
          margin: 30px 0;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .meeting-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: slideShine 2s infinite;
        }
        
        .meeting-link a { 
          color: white; 
          text-decoration: none; 
          font-weight: 600; 
          font-size: 18px;
          position: relative;
          z-index: 1;
        }
        
        .info-box { 
          background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%); 
          border: 2px solid #BFDBFE; 
          padding: 25px; 
          border-radius: 16px; 
          margin: 25px 0; 
        }
        
        .info-box h4 {
          color: #1D4ED8;
          font-weight: 600;
          margin-bottom: 15px;
          font-size: 16px;
        }
        
        .info-box p {
          margin: 8px 0;
          color: #374151;
        }
        
        .tips-section {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
        }
        
        .tips-section h4 {
          color: #374151;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .tips-section ul {
          margin: 0;
          padding-left: 20px;
          color: #6b7280;
        }
        
        .tips-section li {
          margin: 8px 0;
          font-size: 14px;
        }
        
        .footer { 
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          text-align: center; 
          padding: 30px;
          color: #6b7280; 
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-brand {
          font-weight: 600;
          color: #3B82F6;
          margin-bottom: 8px;
        }
        
        @keyframes shimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideShine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @media (max-width: 600px) {
          body { padding: 10px; }
          .email-container { border-radius: 16px; }
          .header { padding: 30px 20px; }
          .header h1 { font-size: 24px; }
          .content { padding: 30px 20px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>📹 Video Interview Invitation</h1>
          <p>Your next step with HireRankerAI</p>
        </div>
        <div class="content">
          <p>Dear <strong>${candidateName}</strong>,</p>
          <p>You are invited to a video interview for the <strong>${position}</strong> position! We're excited to meet you and learn more about your qualifications.</p>
          
          <div class="info-box">
            <h4>📋 Interview Details:</h4>
            <p>• <strong>Position:</strong> ${position}</p>
            <p>• <strong>Interview Time:</strong> ${timeInfo}</p>
            <p>• <strong>Format:</strong> Video Call</p>
            <p>• <strong>Duration:</strong> Approximately 45-60 minutes</p>
          </div>
          
          <p>Please use the following link to join the video interview:</p>
          
          <div class="meeting-link">
            <a href="${meetingUrl}" target="_blank">🎥 Join Video Interview</a>
          </div>
          
          <div class="tips-section">
            <h4>💡 Important Preparation Tips:</h4>
            <ul>
              <li>Test your camera and microphone 15 minutes before the interview</li>
              <li>Ensure you have a stable internet connection</li>
              <li>Join from a quiet, well-lit location with minimal distractions</li>
              <li>Have a copy of your resume and any relevant documents ready</li>
              <li>Prepare questions about the role and company</li>
              <li>You can only join at the designated time</li>
              <li>Our HR team can join at any time during the session</li>
            </ul>
          </div>
          
          <p>If you experience any technical issues or need to reschedule, please contact our HR team immediately. We want to ensure you have the best possible interview experience.</p>
          
          <p>We look forward to speaking with you and learning more about how you can contribute to our team!</p>
          
          <p>Best regards,<br><strong>The HireRankerAI Interview Team</strong></p>
        </div>
        <div class="footer">
          <div class="footer-brand">HireRankerAI</div>
          <p>This is an automated message. Please do not reply to this email.<br>© 2024 HireRankerAI. All rights reserved.</p>
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Update - HireRankerAI</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #374151; 
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(107, 114, 128, 0.15), 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(107, 114, 128, 0.1);
        }
        
        .header { 
          background: linear-gradient(135deg, #6B7280 0%, #4B5563 50%, #374151 100%);
          color: white; 
          padding: 40px 30px; 
          text-align: center;
          position: relative;
          overflow: hidden; 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1;
        }
        
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
        
        .content { 
          background: white;
          padding: 40px 30px; 
        }
        
        .stats { 
          background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%); 
          border: 2px solid #D1D5DB; 
          padding: 25px; 
          border-radius: 16px; 
          margin: 25px 0; 
        }
        
        .stats h3 {
          color: #374151;
          margin-top: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .stats p {
          margin: 8px 0;
          font-weight: 500;
          color: #6B7280;
        }
        
        .encouragement { 
          background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%); 
          border: 2px solid #BFDBFE; 
          padding: 25px; 
          border-radius: 16px; 
          margin: 25px 0; 
        }
        
        .encouragement h3 {
          color: #1D4ED8;
          margin-top: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .encouragement p {
          color: #374151;
          margin: 15px 0;
        }
        
        .encouragement ul {
          margin: 15px 0;
          padding-left: 20px;
          color: #6B7280;
        }
        
        .encouragement li {
          margin: 8px 0;
        }
        
        .footer { 
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          text-align: center; 
          padding: 30px;
          color: #6b7280; 
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-brand {
          font-weight: 600;
          color: #6B7280;
          margin-bottom: 8px;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 25px 0;
        }
        
        @keyframes shimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 600px) {
          body { padding: 10px; }
          .email-container { border-radius: 16px; }
          .header { padding: 30px 20px; }
          .header h1 { font-size: 24px; }
          .content { padding: 30px 20px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>📋 Application Update</h1>
          <p>Thank you for your interest in our position</p>
        </div>
        <div class="content">
          <p>Dear <strong>${candidateName}</strong>,</p>
          <p>Thank you for taking the time to apply for the <strong>${position}</strong> position with HireRankerAI. We appreciate your interest and the effort you put into your application.</p>
          
          <div class="stats">
            <h3>📊 Your Application Results:</h3>
            <p>• <strong>Position:</strong> ${position}</p>
            <p>• <strong>Status:</strong> Not Selected for Interview</p>
          </div>

          <p>After careful consideration of all applications, we have decided to move forward with other candidates whose qualifications more closely match our current requirements for this specific role.</p>

          <div class="encouragement">
            <h3>💪 Keep Moving Forward</h3>
            <p>Please don't let this discourage you. Your skills and experience are valuable, and we encourage you to:</p>
            <ul>
              <li>Continue developing your professional skills and expertise</li>
              <li>Apply for future opportunities that match your background</li>
              <li>Keep building your experience in your field of interest</li>
              <li>Consider feedback and areas for professional growth</li>
            </ul>
            <p>We will keep your application on file and may contact you for future positions that better align with your background and our needs.</p>
          </div>

          <div class="divider"></div>

          <p>We wish you the best of luck in your job search and future career endeavors. Thank you again for considering HireRankerAI as a potential employer.</p>
          
          <p>Best regards,<br><strong>The HireRankerAI Talent Acquisition Team</strong></p>
        </div>
        <div class="footer">
          <div class="footer-brand">HireRankerAI</div>
          <p>This is an automated message from our hiring system.<br>© 2024 HireRankerAI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

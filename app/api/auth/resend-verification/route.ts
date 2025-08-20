import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, generateVerificationCode, createVerificationEmailHTML } from "@/lib/email"
import { updateUser, getUserByEmail } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists and is not verified
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.verified) {
      return NextResponse.json({ error: "User is already verified" }, { status: 400 })
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user with new verification code
    await updateUser(email, {
      verificationCode,
      verificationExpires: expiresAt,
    })

    // Send verification email
    const emailResult = await sendEmail({
      to: email,
      subject: "Email Verification Code - HireRank AI",
      html: createVerificationEmailHTML(verificationCode),
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    return NextResponse.json({ message: "Verification code sent successfully" })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

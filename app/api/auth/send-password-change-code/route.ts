import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, storeVerificationCode } from "@/lib/storage"
import { sendEmail, generateVerificationCode, createPasswordChangeEmailHTML } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await request.json()

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user exists and verify current password
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: "User password not found" }, { status: 400 })
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const code = generateVerificationCode()
    await storeVerificationCode(email, code, "password_change")

    const emailResult = await sendEmail({
      to: email,
      subject: "Password Change Verification",
      html: createPasswordChangeEmailHTML(code),
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    return NextResponse.json({ message: "Verification code sent successfully" })
  } catch (error) {
    console.error("Send password change code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

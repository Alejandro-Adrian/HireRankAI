import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, storeVerificationCode } from "@/lib/storage"
import { sendEmail, generateVerificationCode, createAccountDeletionEmailHTML } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check if user exists and verify password
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: "User account has no password set" }, { status: 400 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Password is incorrect" }, { status: 400 })
    }

    const code = generateVerificationCode()
    await storeVerificationCode(email, code, "account_deletion")

    const emailResult = await sendEmail({
      to: email,
      subject: "Account Deletion Verification",
      html: createAccountDeletionEmailHTML(code),
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    return NextResponse.json({ message: "Verification code sent successfully" })
  } catch (error) {
    console.error("Send delete code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

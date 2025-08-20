import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, verifyCode, updateUser, hashPassword } from "@/lib/storage"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword, verificationCode } = await request.json()

    if (!email || !currentPassword || !newPassword || !verificationCode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 })
    }

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: "User account has no password set" }, { status: 400 })
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const isValidCode = await verifyCode(email, verificationCode, "reset")
    if (!isValidCode) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(newPassword)
    const updatedUser = await updateUser(email, { password_hash: hashedPassword })

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

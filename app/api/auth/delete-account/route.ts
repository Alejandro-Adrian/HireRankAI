import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, verifyCode, deleteUser } from "@/lib/storage"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, verificationCode } = await request.json()

    if (!email || !password || !verificationCode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: "User account has no password set" }, { status: 400 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Password is incorrect" }, { status: 400 })
    }

    const isValidCode = await verifyCode(email, verificationCode, "reset")
    if (!isValidCode) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Delete the user account
    const deletedUser = await deleteUser(email)
    if (!deletedUser) {
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

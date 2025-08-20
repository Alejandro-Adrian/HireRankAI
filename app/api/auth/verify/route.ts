import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail, updateUser, verifyCode } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 })
    }

    if (typeof email !== "string" || typeof code !== "string") {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 })
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Verification code must be 6 digits" }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.is_verified) {
      return NextResponse.json({ error: "User is already verified" }, { status: 400 })
    }

    const isValidCode = await verifyCode(email, code, "verification")
    if (!isValidCode) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    const updatedUser = await updateUser(email, { is_verified: true })
    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Email verified successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        verified: updatedUser.is_verified,
      },
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail, verifyPassword } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (!user.is_verified) {
      return NextResponse.json(
        {
          error: "Please verify your email before logging in",
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 },
      )
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Return user data (excluding password)
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        verified: user.is_verified,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

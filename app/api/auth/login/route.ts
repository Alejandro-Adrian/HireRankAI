import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail, verifyPassword } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login attempt started")
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      console.log("[v0] Login failed: Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("[v0] Finding user by email:", email)
    const user = await findUserByEmail(email)
    if (!user) {
      console.log("[v0] Login failed: User not found")
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (!user.is_verified) {
      console.log("[v0] Login failed: User not verified")
      return NextResponse.json(
        {
          error: "Please verify your email before logging in",
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 },
      )
    }

    console.log("[v0] Verifying password")
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      console.log("[v0] Login failed: Invalid password")
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log("[v0] Login successful for user:", user.id)
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
    console.error("[v0] Login error:", error)
    if (error instanceof Error) {
      console.error("[v0] Login error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 },
    )
  }
}

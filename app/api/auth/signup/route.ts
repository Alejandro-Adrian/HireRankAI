import { type NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail, storeVerificationCode } from "@/lib/storage"
import { sendEmail, generateVerificationCode, createVerificationEmailHTML } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Signup attempt started")
    const { email, password, firstname, lastname } = await request.json()

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      console.log("[v0] Signup failed: Invalid email or password type")
      return NextResponse.json({ error: "Email and password are required and must be strings" }, { status: 400 })
    }

    if (!firstname || !lastname || typeof firstname !== "string" || typeof lastname !== "string") {
      console.log("[v0] Signup failed: Invalid name fields")
      return NextResponse.json({ error: "First name and last name are required and must be strings" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      console.log("[v0] Signup failed: Invalid email format")
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (password.length < 8) {
      console.log("[v0] Signup failed: Password too short")
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      console.log("[v0] Signup failed: Password complexity requirements not met")
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" },
        { status: 400 },
      )
    }

    // Check if user already exists
    console.log("[v0] Checking if user exists:", email.trim().toLowerCase())
    const existingUser = await findUserByEmail(email.trim().toLowerCase())
    if (existingUser) {
      if (!existingUser.is_verified) {
        console.log("[v0] User exists but not verified, sending new verification code")
        // Generate new verification code for existing unverified user
        const verificationCode = generateVerificationCode()
        const codeStored = await storeVerificationCode(existingUser.email, verificationCode, "verification")

        if (!codeStored) {
          console.error("[v0] Failed to store verification code for existing user")
          return NextResponse.json({ error: "Failed to store verification code" }, { status: 500 })
        }

        // Send verification email
        console.log("[v0] Sending verification email to existing user")
        const emailResult = await sendEmail({
          to: existingUser.email,
          subject: "Verify Your Email Address",
          html: createVerificationEmailHTML(verificationCode),
        })

        if (!emailResult.success) {
          console.error("[v0] Email sending failed for existing user:", emailResult.error)
          return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 })
        }

        return NextResponse.json({
          message: "Account exists but not verified. New verification code sent to your email.",
          userId: existingUser.id,
          requiresVerification: true,
        })
      }
      console.log("[v0] User already exists and is verified")
      return NextResponse.json(
        { error: "User already exists and is verified. Please sign in instead." },
        { status: 400 },
      )
    }

    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedFirstname = firstname.trim()
    const sanitizedLastname = lastname.trim()

    console.log("[v0] Creating new user")
    const user = await createUser(sanitizedEmail, password, sanitizedFirstname, sanitizedLastname)
    if (!user) {
      console.error("[v0] Failed to create user in database")
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Generate verification code
    console.log("[v0] Generating verification code")
    const verificationCode = generateVerificationCode()
    const codeStored = await storeVerificationCode(sanitizedEmail, verificationCode, "verification")

    if (!codeStored) {
      console.error("[v0] Failed to store verification code for new user")
      return NextResponse.json({ error: "Failed to store verification code" }, { status: 500 })
    }

    // Send verification email
    console.log("[v0] Sending verification email to new user")
    const emailResult = await sendEmail({
      to: sanitizedEmail,
      subject: "Verify Your Email Address",
      html: createVerificationEmailHTML(verificationCode),
    })

    if (!emailResult.success) {
      console.error("[v0] Email sending failed for new user:", emailResult.error)
      return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 })
    }

    console.log("[v0] Signup successful for user:", user.id)
    return NextResponse.json({
      message: "User created successfully. Please check your email for verification code.",
      userId: user.id,
      requiresVerification: true,
    })
  } catch (error) {
    console.error("[v0] Signup error:", error)
    if (error instanceof Error) {
      console.error("[v0] Signup error details:", {
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

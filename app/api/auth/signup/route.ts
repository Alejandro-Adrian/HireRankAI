import { type NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail, storeVerificationCode } from "@/lib/storage"
import { sendEmail, generateVerificationCode, createVerificationEmailHTML } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstname, lastname } = await request.json()

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required and must be strings" }, { status: 400 })
    }

    if (!firstname || !lastname || typeof firstname !== "string" || typeof lastname !== "string") {
      return NextResponse.json({ error: "First name and last name are required and must be strings" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email.trim().toLowerCase())
    if (existingUser) {
      if (!existingUser.is_verified) {
        // Generate new verification code for existing unverified user
        const verificationCode = generateVerificationCode()
        const codeStored = await storeVerificationCode(existingUser.email, verificationCode, "verification")

        if (!codeStored) {
          return NextResponse.json({ error: "Failed to store verification code" }, { status: 500 })
        }

        // Send verification email
        const emailResult = await sendEmail({
          to: existingUser.email,
          subject: "Verify Your Email Address",
          html: createVerificationEmailHTML(verificationCode),
        })

        if (!emailResult.success) {
          console.error("Email sending failed:", emailResult.error)
          return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 })
        }

        return NextResponse.json({
          message: "Account exists but not verified. New verification code sent to your email.",
          userId: existingUser.id,
          requiresVerification: true,
        })
      }
      return NextResponse.json(
        { error: "User already exists and is verified. Please sign in instead." },
        { status: 400 },
      )
    }

    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedFirstname = firstname.trim()
    const sanitizedLastname = lastname.trim()

    const user = await createUser(sanitizedEmail, password, sanitizedFirstname, sanitizedLastname)
    if (!user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Generate verification code
    const verificationCode = generateVerificationCode()
    const codeStored = await storeVerificationCode(sanitizedEmail, verificationCode, "verification")

    if (!codeStored) {
      return NextResponse.json({ error: "Failed to store verification code" }, { status: 500 })
    }

    // Send verification email
    const emailResult = await sendEmail({
      to: sanitizedEmail,
      subject: "Verify Your Email Address",
      html: createVerificationEmailHTML(verificationCode),
    })

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error)
      return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 })
    }

    return NextResponse.json({
      message: "User created successfully. Please check your email for verification code.",
      userId: user.id,
      requiresVerification: true,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

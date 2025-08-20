import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail } from "@/lib/storage"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user email from a JWT token or session
    // For now, we'll get it from the query params or headers
    const email = request.headers.get("x-user-email") || request.nextUrl.searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        company_name: user.company_name,
        is_verified: user.is_verified,
      },
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

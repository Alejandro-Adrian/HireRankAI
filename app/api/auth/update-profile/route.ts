import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, updateUser } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { firstname, lastname, companyName, email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!firstname || !lastname || !companyName) {
      return NextResponse.json({ error: "First name, last name, and company name are required" }, { status: 400 })
    }

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await updateUser(email, {
      firstname,
      lastname,
      company_name: companyName,
    })

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

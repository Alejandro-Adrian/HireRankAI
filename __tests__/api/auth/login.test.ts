/**
 * @jest-environment node
 */
import { POST } from "@/app/api/auth/login/route"
import { NextRequest } from "next/server"
import { jest } from "@jest/globals"

// Mock Supabase
jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
    },
  })),
}))

describe("/api/auth/login", () => {
  it("handles successful login", async () => {
    const mockSupabase = require("@/lib/supabase/server").createServerClient()
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: "1", email: "test@example.com" },
        session: { access_token: "token" },
      },
      error: null,
    })

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe("test@example.com")
  })

  it("handles login failure", async () => {
    const mockSupabase = require("@/lib/supabase/server").createServerClient()
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid credentials" },
    })

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Invalid credentials")
  })

  it("validates required fields", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        // Missing password
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Email and password are required")
  })
})

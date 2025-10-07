/**
 * @jest-environment node
 */
import { POST } from "@/app/api/auth/login/route"
import { NextRequest } from "next/server"
import { jest } from "@jest/globals"

// 🧹 Silence console errors during tests
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => { })
})

// ✅ Mock only what your route.ts actually uses
jest.mock("@/lib/storage", () => ({
  findUserByEmail: jest.fn(() => Promise.resolve(null)), // ✅ no generics
  verifyPassword: jest.fn(() => Promise.resolve(false)), // ✅ no generics
}))

jest.mock("@/lib/auth", () => ({
  createAuthToken: jest.fn(() => Promise.resolve("mocked-token")), // ✅ no generics
}))

// Import mocks after defining jest.mock()
import { findUserByEmail, verifyPassword } from "@/lib/storage"
import { createAuthToken } from "@/lib/auth"

describe("/api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("handles successful login", async () => {
    // ✅ Mock a valid, verified user
    ; (findUserByEmail as jest.MockedFunction<typeof findUserByEmail>).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      is_verified: true,
      password_hash: "hashedpassword",
    })
      ; (verifyPassword as jest.MockedFunction<typeof verifyPassword>).mockResolvedValue(true)

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe("test@example.com")
    expect(createAuthToken).toHaveBeenCalled()
  })

  it("handles login failure - invalid password", async () => {
    ; (findUserByEmail as jest.MockedFunction<typeof findUserByEmail>).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      is_verified: true,
      password_hash: "hashedpassword",
    })
      ; (verifyPassword as jest.MockedFunction<typeof verifyPassword>).mockResolvedValue(false)

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Invalid email or password")
  })

  it("rejects unverified users", async () => {
    ; (findUserByEmail as jest.MockedFunction<typeof findUserByEmail>).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      is_verified: false,
      password_hash: "hashedpassword",
    })
      ; (verifyPassword as jest.MockedFunction<typeof verifyPassword>).mockResolvedValue(true)

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe("Please verify your email before logging in")
  })

  it("validates required fields", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        // Missing password
      }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Email and password are required")
  })
})

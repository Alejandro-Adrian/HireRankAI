/**
 * @jest-environment node
 */


// ✅ 1. Define mocks first (before importing modules)
jest.unstable_mockModule("@/lib/storage", () => ({
  findUserByEmail: jest.fn(),
  verifyPassword: jest.fn(),
}));

jest.unstable_mockModule("@/lib/auth", () => ({
  createAuthToken: jest.fn(() => Promise.resolve("mocked-token")),
}));

let POST: any;
let findUserByEmail: any;
let verifyPassword: any;
let createAuthToken: any;

import { NextRequest } from "next/server";
import { jest } from "@jest/globals";

// ✅ 2. Load the modules dynamically (works in CommonJS)
beforeAll(async () => {
  // Import after mocks are registered
  ({ POST } = await import("@/app/api/auth/login/route"));
  ({ findUserByEmail, verifyPassword } = await import("@/lib/storage"));
  ({ createAuthToken } = await import("@/lib/auth"));

  // Silence console errors
  jest.spyOn(console, "error").mockImplementation(() => { });
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ✅ 3. The rest of your tests stay the same
describe("/api/auth/login", () => {
  it("validates required fields", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        // Missing password
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email and password are required");
  });
});

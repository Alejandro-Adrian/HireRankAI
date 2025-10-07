"use client"

import type React from "react"
import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme-provider"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return "/"
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key"

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from "@testing-library/react"
export { customRender as render }

// Mock fetch for tests
export const mockFetch = (response: any, ok = true, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    headers: new Headers(),
    redirected: false,
    statusText: ok ? "OK" : "Error",
    type: "basic",
    url: "",
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    text: jest.fn(),
    bytes: jest.fn(),
  } as Response)
}

// Mock user data for tests
export const mockUser = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  verified: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

// Mock auth responses
export const mockAuthResponses = {
  loginSuccess: { user: mockUser },
  loginFailure: { error: "Invalid credentials" },
  signupSuccess: { user: { ...mockUser, verified: false } },
  signupFailure: { error: "Email already exists" },
  verificationRequired: {
    error: "Please verify your email",
    requiresVerification: true,
    email: mockUser.email,
  },
}

// Test helpers
export const fillForm = async (user: any, fields: Record<string, string>) => {
  for (const [label, value] of Object.entries(fields)) {
    const field =
      document.querySelector(`[aria-label="${label}"]`) ||
      document.querySelector(`[placeholder*="${label}"]`) ||
      document.querySelector(`input[name="${label.toLowerCase()}"]`)

    if (field) {
      await user.clear(field)
      await user.type(field, value)
    }
  }
}

export const waitForLoadingToFinish = async () => {
  const { waitForElementToBeRemoved, queryByText } = await import("@testing-library/react")

  // Wait for common loading indicators to disappear
  const loadingIndicators = [
    () => queryByText(/loading/i),
    () => queryByText(/signing in/i),
    () => queryByText(/creating account/i),
    () => document.querySelector(".loading-spinner"),
  ]

  for (const getIndicator of loadingIndicators) {
    const indicator = getIndicator()
    if (indicator) {
      await waitForElementToBeRemoved(indicator)
    }
  }
}

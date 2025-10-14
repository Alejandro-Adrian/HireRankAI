/**
 * @fileoverview Full authentication flow integration test
 * Works with React 18, Next.js 14+, and Testing Library
 */

import { render, screen, waitFor, act } from "../setup/test-utils"
import userEvent from "@testing-library/user-event"
import Home from "@/app/page"
import { jest } from "@jest/globals"
import { waitForLoadingToFinish } from "../setup/test-utils"

// ✅ Mock localStorage globally
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
})

// ✅ Correct Type: mockFetch is a function returning a Promise<Response-like>
const mockFetch = jest.fn<() => Promise<Partial<Response>>>()
global.fetch = mockFetch as unknown as typeof fetch


describe("Authentication Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it("completes full login flow", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: 1, email: "test@example.com", name: "Test User" }

    // ✅ Mock API response for login
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ user: mockUserData }),
    })

    render(<Home />)
    await waitForLoadingToFinish()

    // ✅ Should show login form initially
    expect(await screen.findByText(/welcome back/i)).toBeInTheDocument()

    // ✅ Simulate login
    await act(async () => {
      await user.type(screen.getByLabelText(/email address/i), "test@example.com")
      await user.type(screen.getByLabelText(/password/i), "password123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))
    })

    // ✅ Should store user in localStorage after successful login
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockUserData)
      )
    })
  })

  it("persists user session on page reload", async () => {
    const mockUserData = { id: 1, email: "test@example.com", name: "Test User" }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData))

    render(<Home />)
    await waitForLoadingToFinish()

    // ✅ Should check for persisted session
    expect(localStorageMock.getItem).toHaveBeenCalledWith("user")

    // ✅ Should display dashboard UI (if implemented)
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })

  it("handles logout correctly", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: 1, email: "test@example.com", name: "Test User" }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData))

    render(<Home />)
    await waitForLoadingToFinish()

    // ✅ Find logout button (supports multiple naming options)
    const logoutButton =
      screen.queryByRole("button", { name: /logout/i }) ||
      screen.queryByRole("button", { name: /sign out/i }) ||
      screen.queryByText(/logout/i) ||
      screen.queryByText(/sign out/i)

    expect(logoutButton).toBeTruthy()

    if (logoutButton) {
      await act(async () => {
        await user.click(logoutButton)
      })

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("user")
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })
    }
  })
})

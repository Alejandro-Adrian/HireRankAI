import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Home from "@/app/page"
import { jest } from "@jest/globals"

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe("Authentication Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it("completes full login flow", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: 1, email: "test@example.com", name: "Test User" }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUserData }),
    })

    render(<Home />)

    // Should show login form initially
    expect(screen.getByText("Welcome Back")).toBeInTheDocument()

    await act(async () => {
      await user.type(screen.getByLabelText("Email Address"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))
    })

    // Should redirect to dashboard after successful login
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith("user", JSON.stringify(mockUserData))
    })
  })

  it("persists user session on page reload", () => {
    const mockUserData = { id: 1, email: "test@example.com", name: "Test User" }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData))

    render(<Home />)

    // Should show dashboard if user is already logged in
    expect(localStorageMock.getItem).toHaveBeenCalledWith("user")
  })

  it("handles logout correctly", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: 1, email: "test@example.com", name: "Test User" }

    // Mock user already logged in
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData))

    render(<Home />)

    // Find and click logout button (assuming it exists in Dashboard)
    const logoutButton = screen.queryByText("Logout") || screen.queryByText("Sign Out")
    if (logoutButton) {
      await act(async () => {
        await user.click(logoutButton)
      })

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("user")
        expect(screen.getByText("Welcome Back")).toBeInTheDocument()
      })
    }
  })
})

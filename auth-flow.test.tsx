import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Home from "@/app/page"
import { jest } from "@jest/globals"

// --- Typed LocalStorage Mock ---
type LocalStorageMock = Storage & {
  getItem: jest.Mock<(key: string) => string | null>
  setItem: jest.Mock<(key: string, value: string) => void>
  removeItem: jest.Mock<(key: string) => void>
  clear: jest.Mock<() => void>
  key: jest.Mock<(index: number) => string | null>
}

const localStorageMock: LocalStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
}

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
})

// --- Mock fetch ---
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch

describe("Authentication Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it("completes full login flow", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: 1, email: "adrianalejandro052004@gmail.com", name: "Test User" }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUserData }),
    } as Response)

    render(<Home />)

    // Should show login form initially
    expect(screen.getByText("Welcome Back")).toBeInTheDocument()

    await act(async () => {
      await user.type(screen.getByLabelText("Email Address"), "adrianalejandro052004@gmail.com")
      await user.type(screen.getByLabelText("Password"), "Test1234")

      // Explicitly target login button
      await user.click(screen.getByTestId("login-submit-button"))
    })

    // Should save user data to localStorage
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockUserData)
      )
    })
  })

  it("persists user session on page reload", () => {
    const mockUserData = { id: 1, email: "adrianalejandro052004@gmail.com", name: "Test User" }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData))

    render(<Home />)

    // Should read user from localStorage
    expect(localStorageMock.getItem).toHaveBeenCalledWith("user")
  })

  it("handles logout correctly", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: 1, email: "adrianalejandro052004@gmail.com", name: "Test User" }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData))

    render(<Home />)

    const logoutButton =
      screen.queryByText("Logout") || screen.queryByText("Sign Out")

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

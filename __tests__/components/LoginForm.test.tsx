import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LoginForm from "@/components/LoginForm"
import { jest } from "@jest/globals"

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch

describe("LoginForm", () => {
  const mockProps = {
    onLogin: jest.fn(),
    onSwitchToSignup: jest.fn(),
    onSwitchToForgot: jest.fn(),
    onSwitchToVerification: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it("renders login form correctly", () => {
    render(<LoginForm {...mockProps} />)

    expect(screen.getByText("Welcome Back")).toBeInTheDocument()
    expect(screen.getByText("Sign in to continue your hiring journey")).toBeInTheDocument()
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByTestId("login-submit-button")).toBeInTheDocument()
  })

  it("handles email input correctly", async () => {
    const user = userEvent.setup()
    render(<LoginForm {...mockProps} />)

    const emailInput = screen.getByLabelText("Email Address")

    await act(async () => {
      await user.type(emailInput, "test@example.com")
    })

    expect(emailInput).toHaveValue("test@example.com")
  })

  it("handles password input correctly", async () => {
    const user = userEvent.setup()
    render(<LoginForm {...mockProps} />)

    const passwordInput = screen.getByLabelText("Password")

    await act(async () => {
      await user.type(passwordInput, "password123")
    })

    expect(passwordInput).toHaveValue("password123")
  })

  it("toggles password visibility", async () => {
    const user = userEvent.setup()
    render(<LoginForm {...mockProps} />)

    const passwordInput = screen.getByLabelText("Password")
    const toggleButton = screen.getByRole("button", { name: "Show password" })

    expect(passwordInput).toHaveAttribute("type", "password")

    await act(async () => {
      await user.click(toggleButton)
    })
    expect(passwordInput).toHaveAttribute("type", "text")

    await act(async () => {
      await user.click(toggleButton)
    })
    expect(passwordInput).toHaveAttribute("type", "password")
  })

  it("submits form with valid credentials", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: 1, email: "test@example.com", name: "Test User" }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUserData }),
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: "OK",
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

    render(<LoginForm {...mockProps} />)

    await act(async () => {
      await user.type(screen.getByLabelText("Email Address"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByTestId("login-submit-button"))
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      })
    })

    expect(mockProps.onLogin).toHaveBeenCalledWith(mockUserData)
  })

  it("displays error message on login failure", async () => {
    const user = userEvent.setup()
    const errorMessage = "Invalid credentials"

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
      headers: new Headers(),
      redirected: false,
      status: 401,
      statusText: "Unauthorized",
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

    render(<LoginForm {...mockProps} />)

    await act(async () => {
      await user.type(screen.getByLabelText("Email Address"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "wrongpassword")
      await user.click(screen.getByTestId("login-submit-button"))
    })

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it("handles network error", async () => {
    const user = userEvent.setup()

    mockFetch.mockRejectedValueOnce(new Error("Network error"))

    render(<LoginForm {...mockProps} />)

    await act(async () => {
      await user.type(screen.getByLabelText("Email Address"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByTestId("login-submit-button"))
    })

    await waitFor(() => {
      expect(screen.getByText("Network error occurred")).toBeInTheDocument()
    })
  })

  it("switches to signup when signup tab is clicked", async () => {
    const user = userEvent.setup()
    render(<LoginForm {...mockProps} />)

    const signupTab = screen.getByTestId("signup-tab-button")

    await act(async () => {
      await user.click(signupTab)
    })

    expect(mockProps.onSwitchToSignup).toHaveBeenCalled()
  })

  it("switches to forgot password when link is clicked", async () => {
    const user = userEvent.setup()
    render(<LoginForm {...mockProps} />)

    const forgotLink = screen.getByText("Forgot your password?")

    await act(async () => {
      await user.click(forgotLink)
    })

    expect(mockProps.onSwitchToForgot).toHaveBeenCalled()
  })

  it("shows loading state during submission", async () => {
    const user = userEvent.setup()

    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ user: { id: 1 } }),
                headers: new Headers(),
                redirected: false,
                status: 200,
                statusText: "OK",
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
              } as Response),
            100,
          ),
        ),
    )

    render(<LoginForm {...mockProps} />)

    await act(async () => {
      await user.type(screen.getByLabelText("Email Address"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByTestId("login-submit-button"))
    })

    expect(screen.getByText("Signing In...")).toBeInTheDocument()
    expect(screen.getByTestId("login-submit-button")).toBeDisabled()
  })

  it("handles verification required response", async () => {
    const user = userEvent.setup()
    const email = "test@example.com"

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ requiresVerification: true, email }),
      headers: new Headers(),
      redirected: false,
      status: 403,
      statusText: "Forbidden",
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

    render(<LoginForm {...mockProps} />)

    await act(async () => {
      await user.type(screen.getByLabelText("Email Address"), email)
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByTestId("login-submit-button"))
    })

    await waitFor(() => {
      expect(mockProps.onSwitchToVerification).toHaveBeenCalledWith(email)
    })
  })
})

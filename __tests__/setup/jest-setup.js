import "@testing-library/jest-dom"
import { jest, beforeEach, afterEach } from "@jest/globals"

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
})

// Mock window.location
delete window.location
window.location = {
  href: "http://localhost:3000",
  origin: "http://localhost:3000",
  protocol: "http:",
  host: "localhost:3000",
  hostname: "localhost",
  port: "3000",
  pathname: "/",
  search: "",
  hash: "",
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
}

// Suppress console warnings in tests
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

beforeEach(() => {
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterEach(() => {
  console.warn = originalConsoleWarn
  console.error = originalConsoleError
  jest.clearAllMocks()
})

// Global test timeout
jest.setTimeout(10000)

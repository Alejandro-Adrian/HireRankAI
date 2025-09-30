"use client"
require("dotenv").config({ path: ".env.test" })

import { jest } from "@jest/globals"
import "@testing-library/jest-dom"

if (process.env.NODE_ENV === "test") {
  // Mock Next.js navigation (App Router)
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
    usePathname() {
      return "/"
    },
    useSearchParams() {
      return new URLSearchParams()
    },
  }))

  // Mock fetch globally
  global.fetch = jest.fn()

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  global.localStorage = localStorageMock
}

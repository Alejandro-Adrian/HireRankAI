"use client"

import type React from "react"
import { useState } from "react"

interface LoginFormProps {
  onLogin: (userData: any) => void
  onSwitchToSignup: () => void
  onSwitchToForgot: () => void
  onSwitchToVerification?: (email: string) => void
}

export default function LoginForm({
  onLogin,
  onSwitchToSignup,
  onSwitchToForgot,
  onSwitchToVerification,
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user)
      } else {
        if (data.requiresVerification && onSwitchToVerification) {
          onSwitchToVerification(data.email)
        } else {
          setError(data.error || "Login failed")
        }
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-scale-in">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Get Started</h2>
        <p className="text-gray-600 dark:text-gray-300">Join thousands of HR professionals using HireRankerAI</p>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6 animate-slide-in-left">
        <button
          onClick={() => setActiveTab("signin")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
            activeTab === "signin"
              ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setActiveTab("signup")
            onSwitchToSignup()
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
            activeTab === "signup"
              ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 animate-slide-in-right">
        <div className="transform transition-all duration-300 hover:scale-[1.02]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-400 focus:scale-[1.02] focus:shadow-lg"
            required
          />
        </div>

        <div className="transform transition-all duration-300 hover:scale-[1.02]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-400 focus:scale-[1.02] focus:shadow-lg"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm animate-bounce-gentle bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="loading-spinner mr-2"></div>
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 text-center animate-fade-in">
        <button
          onClick={onSwitchToForgot}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-all duration-200 hover:scale-105"
        >
          Forgot your password?
        </button>
      </div>
    </div>
  )
}

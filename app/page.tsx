"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import LoginForm from "@/components/LoginForm"
import SignupForm from "@/components/SignupForm"
import ForgotPasswordForm from "@/components/ForgotPasswordForm"
import Dashboard from "@/components/Dashboard"

export default function Home() {
  const [currentView, setCurrentView] = useState<"login" | "signup" | "forgot" | "dashboard">("login")
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
      setCurrentView("dashboard")
    }
  }, [])

  const handleLogin = (userData: any) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    setCurrentView("dashboard")
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("user")
    setCurrentView("login")
  }

  if (currentView === "dashboard") {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      {/* Header - Made mobile responsive with hamburger menu */}
      <header className="relative">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900">HireRankerAI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              How it Works
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
            <nav className="flex flex-col space-y-1 px-4 py-3">
              <a href="#" className="text-gray-600 hover:text-gray-900 py-2 transition-colors">
                Features
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 py-2 transition-colors">
                How it Works
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 py-2 transition-colors">
                Pricing
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content - Completely restructured for mobile-first responsive design */}
      <div className="px-4 sm:px-8 py-8 sm:py-16">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-16">
          {/* Left Side - Hero Content */}
          <div className="flex-1 max-w-2xl lg:max-w-none">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
              Speed Up Your <span className="text-blue-600">Hiring</span>
              <br />
              <span className="text-blue-600">Process</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed">
              Rank applicants intelligently with AI-powered scoring, video interviews, and automated workflows. Make
              better hiring decisions faster.
            </p>

            {/* Feature Icons - Enhanced mobile layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <span className="text-sm sm:text-base text-gray-700 font-medium">AI Ranking</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-sm sm:text-base text-gray-700 font-medium">Video Interviews</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span className="text-sm sm:text-base text-gray-700 font-medium">Resume Analysis</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm sm:text-base text-gray-700 font-medium">Automated Workflow</span>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Card - Made responsive with proper mobile stacking */}
          <div className="w-full lg:w-96 lg:flex-shrink-0">
            {currentView === "login" && (
              <LoginForm
                onLogin={handleLogin}
                onSwitchToSignup={() => setCurrentView("signup")}
                onSwitchToForgot={() => setCurrentView("forgot")}
              />
            )}
            {currentView === "signup" && <SignupForm onSwitchToLogin={() => setCurrentView("login")} />}
            {currentView === "forgot" && <ForgotPasswordForm onSwitchToLogin={() => setCurrentView("login")} />}
          </div>
        </div>
      </div>

      {/* Bottom Section - Made mobile responsive with proper spacing and typography */}
      <div className="px-4 sm:px-8 py-12 sm:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
          Everything You Need for Smart Hiring
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
          From candidate screening to final interviews, HireRankerAI streamlines your entire hiring workflow
        </p>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  )
}

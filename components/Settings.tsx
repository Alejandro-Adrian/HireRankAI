"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, User, Shield, AlertTriangle, Eye, EyeOff, Mail, Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"

interface SettingsProps {
  onBack: () => void
  userEmail: string
  onNotification?: (message: string, type: "success" | "error" | "info") => void
}

export default function Settings({ onBack, userEmail, onNotification }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "appearance" | "danger">("profile")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const { theme, setTheme } = useTheme()

  // Profile state
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState(userEmail)

  // Security state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [securityStep, setSecurityStep] = useState<"form" | "verify" | "success">("form")
  const [verificationCode, setVerificationCode] = useState("")

  // Danger zone state
  const [deletePassword, setDeletePassword] = useState("")
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [deleteStep, setDeleteStep] = useState<"form" | "verify" | "success">("form")
  const [deleteVerificationCode, setDeleteVerificationCode] = useState("")

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await fetch(`/api/auth/profile?email=${encodeURIComponent(userEmail)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": userEmail,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setFirstname(data.user.firstname || "")
          setLastname(data.user.lastname || "")
          setCompanyName(data.user.company_name || "")
          setEmail(data.user.email || userEmail)
        }
      } catch (error) {
        console.error("Failed to load user profile:", error)
      }
    }

    loadUserProfile()
  }, [userEmail])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstname, lastname, companyName, email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Profile updated successfully!")
        onNotification?.("Profile updated successfully!", "success")
      } else {
        setMessage(data.error || "Failed to update profile")
        onNotification?.("Failed to update profile", "error")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
      onNotification?.("An error occurred while updating profile", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSendPasswordVerification = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill in all password fields")
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/send-password-change-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, currentPassword, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setSecurityStep("verify")
        setMessage("Verification code sent to your email")
      } else {
        setMessage(data.error || "Failed to send verification code")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          currentPassword,
          newPassword,
          verificationCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSecurityStep("success")
        setMessage("Password changed successfully!")
        onNotification?.("Password changed successfully!", "success")
        // Reset form
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setVerificationCode("")
      } else {
        setMessage(data.error || "Failed to change password")
        onNotification?.("Failed to change password", "error")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
      onNotification?.("An error occurred while changing password", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSendDeleteVerification = async () => {
    if (!deletePassword) {
      setMessage("Please enter your password")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/send-delete-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, password: deletePassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setDeleteStep("verify")
        setMessage("Verification code sent to your email")
      } else {
        setMessage(data.error || "Failed to send verification code")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          password: deletePassword,
          verificationCode: deleteVerificationCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setDeleteStep("success")
        setMessage("Account deleted successfully. You will be redirected shortly.")
        onNotification?.("Account deleted successfully", "success")
        // Redirect to login after 3 seconds
        setTimeout(() => {
          localStorage.removeItem("user")
          window.location.reload()
        }, 3000)
      } else {
        setMessage(data.error || "Failed to delete account")
        onNotification?.("Failed to delete account", "error")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
      onNotification?.("An error occurred while deleting account", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Manage your account and preferences</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 sm:gap-8 mb-6 sm:mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 px-2 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === "profile"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-4 px-2 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === "security"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`pb-4 px-2 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === "appearance"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab("danger")}
            className={`pb-4 px-2 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === "danger"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Danger Zone
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("success") || message.includes("sent")
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Information</h2>
                <p className="text-gray-600 dark:text-gray-400">Update your account profile information</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstname" className="dark:text-gray-200">
                    First Name
                  </Label>
                  <Input
                    id="firstname"
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    placeholder="Enter your first name"
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastname" className="dark:text-gray-200">
                    Last Name
                  </Label>
                  <Input
                    id="lastname"
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="Enter your last name"
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="companyName" className="dark:text-gray-200">
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="dark:text-gray-200">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
                <p className="text-gray-600 dark:text-gray-400">Customize how HireRankerAI looks and feels</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium dark:text-gray-200">Theme</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose your preferred theme</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === "light"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Light</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Bright and clean</div>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === "dark"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Easy on the eyes</div>
                  </button>

                  <button
                    onClick={() => setTheme("system")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === "system"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">System</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Matches device</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Change Password</h2>
                <p className="text-gray-600 dark:text-gray-400">Update your password to keep your account secure</p>
              </div>
            </div>

            {securityStep === "form" && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="currentPassword" className="dark:text-gray-200">
                    Current Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="newPassword" className="dark:text-gray-200">
                      New Password
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="dark:text-gray-200">
                      Confirm New Password
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-600">
                      Email Verification Required
                    </span>
                  </div>
                  <p className="text-yellow-700 dark:text-yellow-500 text-sm mb-3">
                    For security, we'll send a verification code to your email before changing your password.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendPasswordVerification}
                    disabled={loading}
                    className="border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 bg-transparent"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Verification Code
                  </Button>
                </div>
              </div>
            )}

            {securityStep === "verify" && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <Label htmlFor="verificationCode" className="dark:text-gray-200">
                    Verification Code
                  </Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? "Changing Password..." : "Change Password"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setSecurityStep("form")}>
                    Back
                  </Button>
                </div>
              </form>
            )}

            {securityStep === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Password Changed Successfully
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Your password has been updated successfully.</p>
                <Button onClick={() => setSecurityStep("form")} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Done
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === "danger" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Delete Account</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Permanently delete your account and all associated data
                </p>
              </div>
            </div>

            {deleteStep === "form" && (
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-800 dark:text-red-600">Warning</span>
                  </div>
                  <p className="text-red-700 dark:text-red-500 text-sm mb-3">
                    This action cannot be undone. This will permanently delete your account and remove all data
                    including:
                  </p>
                  <ul className="text-red-700 dark:text-red-500 text-sm space-y-1 ml-4">
                    <li>• All your rankings and job postings</li>
                    <li>• Candidate applications and data</li>
                    <li>• Interview records and notes</li>
                    <li>• Account settings and preferences</li>
                  </ul>
                </div>

                <div>
                  <Label htmlFor="deletePassword" className="dark:text-gray-200">
                    Confirm Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="deletePassword"
                      type={showDeletePassword ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your password"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-600">
                      Email Verification Required
                    </span>
                  </div>
                  <p className="text-yellow-700 dark:text-yellow-500 text-sm mb-3">
                    We'll send a verification code to confirm account deletion.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendDeleteVerification}
                    disabled={loading}
                    className="border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 bg-transparent"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Verification Code
                  </Button>
                </div>
              </div>
            )}

            {deleteStep === "verify" && (
              <form onSubmit={handleDeleteAccount} className="space-y-6">
                <div>
                  <Label htmlFor="deleteVerificationCode" className="dark:text-gray-200">
                    Verification Code
                  </Label>
                  <Input
                    id="deleteVerificationCode"
                    type="text"
                    value={deleteVerificationCode}
                    onChange={(e) => setDeleteVerificationCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                    {loading ? "Deleting Account..." : "Delete Account Permanently"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDeleteStep("form")}>
                    Back
                  </Button>
                </div>
              </form>
            )}

            {deleteStep === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Account Deleted</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your account has been permanently deleted. You will be redirected shortly.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

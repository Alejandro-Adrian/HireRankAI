"use client"
import {
  BarChart3,
  Users,
  Calendar,
  CheckCircle,
  Bell,
  Settings,
  LogOut,
  Plus,
  TrendingUp,
  Eye,
  Edit,
  Link2,
  Trash2,
} from "lucide-react"
import { useState, useEffect } from "react"
import SettingsComponent from "./Settings"
import RankingBuilder from "./RankingBuilder"
import ResultsDashboard from "./ResultsDashboard"
import VideoCallManager from "./VideoCallManager"

interface DashboardProps {
  user: any
  onLogout: () => void
}

interface Ranking {
  id: string
  title: string
  position: string
  description: string
  application_link_id: string
  is_active: boolean
  created_at: string
  applications_count: number
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [showRankingBuilder, setShowRankingBuilder] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showVideoCalls, setShowVideoCalls] = useState(false)
  const [activeTab, setActiveTab] = useState<"rankings" | "videocalls">("rankings")
  const [selectedRanking, setSelectedRanking] = useState<Ranking | null>(null)
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Welcome to HireRank AI!", type: "info", read: false },
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    fetchRankings()
  }, [])

  const fetchRankings = async () => {
    try {
      const response = await fetch("/api/rankings")
      if (response.ok) {
        const data = await response.json()
        setRankings(data)
      }
    } catch (error) {
      console.error("Error fetching rankings:", error)
    } finally {
      setLoading(false)
    }
  }

  const addNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleCreateRanking = () => {
    window.location.href = "/rankings/create"
  }

  const handleEditRanking = (ranking: Ranking) => {
    setSelectedRanking(ranking)
    setShowRankingBuilder(true)
  }

  const handleCopyLink = (linkId: string) => {
    const applicationUrl = `${window.location.origin}/apply/${linkId}`
    navigator.clipboard.writeText(applicationUrl)
    addNotification("Application link copied to clipboard!", "success")
  }

  const handleRankingComplete = () => {
    setShowRankingBuilder(false)
    setSelectedRanking(null)
    fetchRankings() // Refresh the rankings list
    addNotification("Ranking saved successfully!", "success")
  }

  const handleViewApplications = (ranking: Ranking) => {
    setSelectedRanking(ranking)
    setShowResults(true)
  }

  const handleDeleteRanking = async (ranking: Ranking) => {
    if (!confirm(`Are you sure you want to delete the ranking "${ranking.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/rankings/${ranking.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        addNotification("Ranking deleted successfully!", "success")
        fetchRankings() // Refresh the rankings list
      } else {
        const errorData = await response.json()
        addNotification(errorData.error || "Failed to delete ranking", "error")
      }
    } catch (error) {
      console.error("Error deleting ranking:", error)
      addNotification("An error occurred while deleting the ranking", "error")
    }
  }

  const handleShowVideoCalls = () => {
    setActiveTab("videocalls")
    setShowVideoCalls(true)
  }

  const handleShowRankings = () => {
    setActiveTab("rankings")
    setShowVideoCalls(false)
  }

  if (showSettings) {
    return (
      <SettingsComponent
        onBack={() => setShowSettings(false)}
        userEmail={user.email}
        onNotification={addNotification}
      />
    )
  }

  if (showRankingBuilder) {
    return (
      <RankingBuilder
        ranking={selectedRanking}
        onBack={() => setShowRankingBuilder(false)}
        onComplete={handleRankingComplete}
        onNotification={addNotification}
      />
    )
  }

  if (showResults && selectedRanking) {
    return (
      <ResultsDashboard
        rankingId={selectedRanking.id} // Pass rankingId instead of ranking object
        onBack={() => {
          setShowResults(false)
          setSelectedRanking(null)
        }}
        onNotification={addNotification}
      />
    )
  }

  if (showVideoCalls) {
    return (
      <VideoCallManager rankings={rankings} onBack={handleShowRankings} onNotification={addNotification} user={user} />
    )
  }

  const metrics = [
    {
      title: "Active Rankings",
      value: rankings.filter((r) => r.is_active).length.toString(),
      icon: BarChart3,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Rankings",
      value: rankings.length.toString(),
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "This Month",
      value: rankings
        .filter((r) => {
          const created = new Date(r.created_at)
          const now = new Date()
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        })
        .length.toString(),
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Total Applications",
      value: rankings.reduce((sum, r) => sum + (r.applications_count || 0), 0).toString(),
      icon: CheckCircle,
      color: "bg-orange-100 text-orange-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.email}</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={handleShowRankings}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "rankings" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Rankings
                </button>
                <button
                  onClick={handleShowVideoCalls}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "videocalls"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Video Calls
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Notification Button */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span>Notifications</span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No notifications yet</div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                              !notification.read ? "bg-blue-50" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                                {notification.message}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                            <div
                              className={`flex items-center mt-1 ${
                                notification.type === "success"
                                  ? "text-green-600"
                                  : notification.type === "error"
                                    ? "text-red-600"
                                    : "text-blue-600"
                              }`}
                            >
                              <div
                                className={`w-1 h-1 rounded-full mr-2 ${
                                  notification.type === "success"
                                    ? "bg-green-600"
                                    : notification.type === "error"
                                      ? "bg-red-600"
                                      : "bg-blue-600"
                                }`}
                              ></div>
                              <span className="text-xs capitalize">{notification.type}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Overlay */}
      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>}

      <div className="p-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${metric.color}`}>
                      <metric.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rankings List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Job Rankings</h2>
                  <button
                    onClick={handleCreateRanking}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Ranking</span>
                  </button>
                </div>
              </div>

              {/* Rankings List Content */}
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading rankings...</p>
                </div>
              ) : rankings.length === 0 ? (
                <div className="p-12 text-center">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings yet</h3>
                  <p className="text-gray-500 mb-6">Create your first ranking to start hiring with AI</p>
                  <button
                    onClick={handleCreateRanking}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create First Ranking</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {rankings.map((ranking) => (
                    <div key={ranking.id} className="hover:bg-gray-50 transition-colors">
                      <div className="p-6 cursor-pointer" onClick={() => handleViewApplications(ranking)}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{ranking.title}</h3>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  ranking.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {ranking.is_active ? "Active" : "Inactive"}
                              </span>
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                                {ranking.position?.replace("/", " / ") || "Position"}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{ranking.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Created {new Date(ranking.created_at).toLocaleDateString()}</span>
                              <span>{ranking.applications_count || 0} applications</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleCopyLink(ranking.application_link_id)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Copy application link"
                            >
                              <Link2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditRanking(ranking)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit ranking"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleViewApplications(ranking)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View applications"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRanking(ranking)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete ranking"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <p className="text-sm text-gray-600 mb-4">Common tasks and shortcuts</p>

              <div className="space-y-3">
                <button
                  onClick={handleCreateRanking}
                  className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5 text-gray-500" />
                  <span>Create New Ranking</span>
                </button>
                <button
                  onClick={() => {
                    if (rankings.length > 0) {
                      handleViewApplications(rankings[0])
                    }
                  }}
                  disabled={rankings.length === 0}
                  className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Users className="h-5 w-5 text-gray-500" />
                  <span>View All Applications</span>
                </button>
                <button
                  onClick={handleShowVideoCalls}
                  className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span>Manage Video Calls</span>
                </button>
                <button className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <TrendingUp className="h-5 w-5 text-gray-500" />
                  <span>Analytics Report</span>
                </button>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div
                    className={`flex-shrink-0 w-6 h-6 ${rankings.length > 0 ? "bg-green-600" : "bg-blue-600"} text-white text-sm font-medium rounded-full flex items-center justify-center`}
                  >
                    {rankings.length > 0 ? "✓" : "1"}
                  </div>
                  <div>
                    <p className={`font-medium ${rankings.length > 0 ? "text-green-600" : "text-gray-900"}`}>
                      Create a ranking
                    </p>
                    <p className="text-sm text-gray-600">Set up criteria and questions for a position</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-300 text-white text-sm font-medium rounded-full flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Share application link</p>
                    <p className="text-sm text-gray-500">Send the link to candidates to apply</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-300 text-white text-sm font-medium rounded-full flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Review results</p>
                    <p className="text-sm text-gray-500">AI will rank and score candidates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

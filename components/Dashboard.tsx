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
  Search,
  X,
  Menu,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterPosition, setFilterPosition] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Welcome to HireRank AI!", type: "info", read: false },
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const filteredAndSortedRankings = useMemo(() => {
    const filtered = rankings
      .filter((ranking) => {
        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          return (
            ranking.title.toLowerCase().includes(query) ||
            ranking.position.toLowerCase().includes(query) ||
            ranking.description.toLowerCase().includes(query)
          )
        }
        return true
      })
      .filter((ranking) => {
        // Position filter
        if (filterPosition !== "all") {
          return ranking.position === filterPosition
        }
        return true
      })
      .filter((ranking) => {
        // Status filter
        if (filterStatus === "active") return ranking.is_active
        if (filterStatus === "inactive") return !ranking.is_active
        return true
      })

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "title-az":
          return a.title.localeCompare(b.title)
        case "title-za":
          return b.title.localeCompare(a.title)
        case "position-az":
          return a.position.localeCompare(b.position)
        case "position-za":
          return b.position.localeCompare(a.position)
        case "most-applications":
          return (b.applications_count || 0) - (a.applications_count || 0)
        case "least-applications":
          return (a.applications_count || 0) - (b.applications_count || 0)
        default:
          return 0
      }
    })
  }, [rankings, searchQuery, filterPosition, filterStatus, sortBy])

  const handleMetricClick = (metricTitle: string) => {
    switch (metricTitle) {
      case "Active Rankings":
        setFilterStatus("active")
        addNotification("Filtered to show active rankings", "info")
        break
      case "Total Rankings":
        setFilterStatus("all")
        setFilterPosition("all")
        setSearchQuery("")
        setSortBy("newest")
        addNotification("Showing all rankings", "info")
        document.querySelector(".bg-white.rounded-lg.border.border-gray-200")?.scrollIntoView({ behavior: "smooth" })
        break
      case "This Month":
        // Filter to show rankings created this month
        const thisMonthRankings = rankings.filter((r) => {
          const created = new Date(r.created_at)
          const now = new Date()
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        })
        if (thisMonthRankings.length > 0) {
          setSortBy("newest")
          addNotification(`Showing ${thisMonthRankings.length} rankings created this month`, "info")
        } else {
          addNotification("No rankings created this month", "info")
        }
        break
      case "Total Applications":
        if (rankings.length > 0) {
          setSortBy("most-applications")
          addNotification("Sorted by most applications", "info")
        } else {
          addNotification("No rankings available to view applications", "info")
        }
        break
      default:
        break
    }
  }

  const SidebarContent = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick Actions</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4">Common tasks and shortcuts</p>

        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={() => {
              handleCreateRanking()
              setSidebarOpen(false)
            }}
            className="flex items-center space-x-3 w-full p-2 sm:p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
            <span>Create New Ranking</span>
          </button>
          <button
            onClick={() => {
              if (rankings.length > 0) {
                handleViewApplications(rankings[0])
              }
              setSidebarOpen(false)
            }}
            disabled={rankings.length === 0}
            className="flex items-center space-x-3 w-full p-2 sm:p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
            <span>View All Applications</span>
          </button>
          <button
            onClick={() => {
              handleShowVideoCalls()
              setSidebarOpen(false)
            }}
            className="flex items-center space-x-3 w-full p-2 sm:p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
            <span>Manage Video Calls</span>
          </button>
          <button className="flex items-center space-x-3 w-full p-2 sm:p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
            <span>Analytics Report</span>
          </button>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Getting Started</h3>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 ${rankings.length > 0 ? "bg-green-600" : "bg-blue-600"} text-white text-xs sm:text-sm font-medium rounded-full flex items-center justify-center`}
            >
              {rankings.length > 0 ? "✓" : "1"}
            </div>
            <div>
              <p
                className={`font-medium text-sm ${rankings.length > 0 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}
              >
                Create a ranking
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Set up criteria and questions for a position
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 dark:bg-gray-600 text-white text-xs sm:text-sm font-medium rounded-full flex items-center justify-center">
              2
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400 text-sm">Share application link</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Send the link to candidates to apply
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 dark:bg-gray-600 text-white text-xs sm:text-sm font-medium rounded-full flex items-center justify-center">
              3
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400 text-sm">Review results</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">AI will rank and score candidates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="p-4 sm:p-6">
                    <SidebarContent />
                  </div>
                </SheetContent>
              </Sheet>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">HR Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hidden sm:block">
                  Welcome back, {user.email}
                </p>
              </div>
            </div>

            {/* Navigation Tabs - Made responsive */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={handleShowRankings}
                  className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === "rankings"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Rankings
                </button>
                <button
                  onClick={handleShowVideoCalls}
                  className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === "videocalls"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span className="hidden sm:inline">Video Calls</span>
                  <span className="sm:hidden">Video</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-6">
              {/* Notification Button */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="relative">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm">Notifications</span>
                </button>

                {/* Notifications Dropdown - Made responsive */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-3 sm:p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <p
                                className={`text-xs sm:text-sm ${!notification.read ? "font-medium" : ""} text-gray-900 dark:text-gray-100`}
                              >
                                {notification.message}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                            <div
                              className={`flex items-center mt-1 ${
                                notification.type === "success"
                                  ? "text-green-600 dark:text-green-400"
                                  : notification.type === "error"
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-blue-600 dark:text-blue-400"
                              }`}
                            >
                              <div
                                className={`w-1 h-1 rounded-full mr-2 ${
                                  notification.type === "success"
                                    ? "bg-green-600 dark:bg-green-400"
                                    : notification.type === "error"
                                      ? "bg-red-600 dark:bg-red-400"
                                      : "bg-blue-600 dark:bg-blue-400"
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
                className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-sm">Settings</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Overlay */}
      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>}

      <div className="p-3 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Metrics Cards - Mobile-first responsive grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  onClick={() => handleMetricClick(metric.title)}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6 cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 truncate">
                        {metric.title}
                      </p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg ${metric.color} dark:bg-opacity-20 flex-shrink-0`}>
                      <metric.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rankings List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Job Rankings</h2>
                  <button
                    onClick={handleCreateRanking}
                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Ranking</span>
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    <Input
                      placeholder="Search rankings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    />
                  </div>

                  {/* Filter Controls - Made responsive with stacking */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    {/* Position Filter */}
                    <Select value={filterPosition} onValueChange={setFilterPosition}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        <SelectItem value="kitchen-helper">Kitchen Helper</SelectItem>
                        <SelectItem value="server/waiter">Server/Waiter</SelectItem>
                        <SelectItem value="housekeeping">Housekeeping</SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                        <SelectItem value="barista">Barista</SelectItem>
                        <SelectItem value="gardener">Gardener</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Sort Options */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-52">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="title-az">Title (A-Z)</SelectItem>
                        <SelectItem value="title-za">Title (Z-A)</SelectItem>
                        <SelectItem value="position-az">Position (A-Z)</SelectItem>
                        <SelectItem value="position-za">Position (Z-A)</SelectItem>
                        <SelectItem value="most-applications">Most Applications</SelectItem>
                        <SelectItem value="least-applications">Least Applications</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Clear Filters Button */}
                    {(searchQuery.trim() ||
                      filterPosition !== "all" ||
                      filterStatus !== "all" ||
                      sortBy !== "newest") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("")
                          setFilterPosition("all")
                          setFilterStatus("all")
                          setSortBy("newest")
                        }}
                        className="flex items-center gap-2 w-full sm:w-auto"
                      >
                        <X className="w-4 h-4" />
                        <span className="sm:hidden">Clear</span>
                        <span className="hidden sm:inline">Clear Filters</span>
                      </Button>
                    )}
                  </div>

                  {/* Results Count */}
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Showing {filteredAndSortedRankings.length} of {rankings.length} rankings
                  </div>
                </div>
              </div>

              {/* Rankings List Content */}
              {loading ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">Loading rankings...</p>
                </div>
              ) : filteredAndSortedRankings.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  {rankings.length === 0 ? (
                    <>
                      <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No rankings yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                        Create your first ranking to start hiring with AI
                      </p>
                      <button
                        onClick={handleCreateRanking}
                        className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create First Ranking</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No rankings match your filters
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                        Try adjusting your search criteria or clear the filters
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("")
                          setFilterPosition("all")
                          setFilterStatus("all")
                          setSortBy("newest")
                        }}
                        className="flex items-center gap-2 mx-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Clear All Filters
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedRankings.map((ranking) => (
                    <div key={ranking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="p-3 sm:p-6 cursor-pointer" onClick={() => handleViewApplications(ranking)}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                                {ranking.title}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    ranking.is_active
                                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                                  }`}
                                >
                                  {ranking.is_active ? "Active" : "Inactive"}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full capitalize">
                                  {ranking.position?.replace("/", " / ") || "Position"}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm line-clamp-2">
                              {ranking.description}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <span>Created {new Date(ranking.created_at).toLocaleDateString()}</span>
                              <span>{ranking.applications_count || 0} applications</span>
                            </div>
                          </div>
                          <div
                            className="flex items-center justify-end space-x-1 sm:space-x-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleCopyLink(ranking.application_link_id)}
                              className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Copy application link"
                            >
                              <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => handleEditRanking(ranking)}
                              className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Edit ranking"
                            >
                              <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => handleViewApplications(ranking)}
                              className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="View applications"
                            >
                              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRanking(ranking)}
                              className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete ranking"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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

          {/* Desktop Sidebar - Hidden on mobile, shown on large screens */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <SidebarContent />
          </div>
        </div>
      </div>
    </div>
  )
}

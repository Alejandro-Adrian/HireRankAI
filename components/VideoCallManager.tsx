"use client"
import { Video, Calendar, Users, Send, Plus, Eye, Trash2, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"

interface VideoCallManagerProps {
  rankings: any[]
  onBack: () => void
  onNotification: (message: string, type: "success" | "error" | "info") => void
  user: any
}

interface VideoSession {
  id: string
  title: string
  scheduled_at: string | null
  meeting_url: string
  meeting_id: string
  created_at: string
  status: "scheduled" | "active" | "completed"
  participants_count: number
}

interface Application {
  id: string
  candidate_name: string
  candidate_email: string
  ranking_title: string
  ranking_id: string
}

export default function VideoCallManager({ rankings, onBack, onNotification, user }: VideoCallManagerProps) {
  const [sessions, setSessions] = useState<VideoSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<VideoSession | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedRankingId, setSelectedRankingId] = useState<string>("")
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([])

  // Create session form
  const [sessionTitle, setSessionTitle] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/video-sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async (rankingId: string) => {
    try {
      setApplications([]) // Clear previous applications
      console.log("[v0] Fetching applications for ranking:", rankingId)

      const response = await fetch(`/api/rankings/${rankingId}/applications`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Raw API response:", data)

        let applicationsData = []
        if (data.applications) {
          applicationsData = data.applications
        } else if (Array.isArray(data)) {
          applicationsData = data
        } else {
          console.error("[v0] Unexpected data structure:", data)
          applicationsData = []
        }

        // Map the data to ensure we have the required fields
        const mappedApplications = applicationsData.map((app: any) => ({
          id: app.id,
          candidate_name: app.candidate_name || app.name || "Unknown Candidate",
          candidate_email: app.candidate_email || app.email || "No email",
          ranking_title: app.ranking_title || "Unknown Position",
          ranking_id: rankingId,
        }))

        console.log("[v0] Mapped applications:", mappedApplications)
        setApplications(mappedApplications)
      } else {
        console.error("[v0] Failed to fetch applications:", response.status, response.statusText)
        onNotification("Failed to load applicants", "error")
      }
    } catch (error) {
      console.error("[v0] Error fetching applications:", error)
      onNotification("Error loading applicants", "error")
    }
  }

  const generateMeetingId = () => {
    return "meeting-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now().toString(36)
  }

  const createSession = async () => {
    if (!sessionTitle.trim()) {
      onNotification("Please enter a session title", "error")
      return
    }

    const meetingId = generateMeetingId()
    const meetingUrl = `${window.location.origin}/video-call/${meetingId}`

    let scheduledAt = null
    if (scheduledDate && scheduledTime) {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
    }

    try {
      const response = await fetch("/api/video-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sessionTitle,
          scheduled_at: scheduledAt,
          meeting_url: meetingUrl,
          meeting_id: meetingId,
        }),
      })

      if (response.ok) {
        onNotification("Video session created successfully!", "success")
        setShowCreateModal(false)
        setSessionTitle("")
        setScheduledDate("")
        setScheduledTime("")
        fetchSessions()
      } else {
        onNotification("Failed to create session", "error")
      }
    } catch (error) {
      console.error("Error creating session:", error)
      onNotification("Error creating session", "error")
    }
  }

  const sendInvitations = async () => {
    if (!selectedSession || selectedApplicationIds.length === 0) {
      onNotification("Please select a session and at least one applicant", "error")
      return
    }

    try {
      const response = await fetch("/api/video-sessions/send-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: selectedSession.id,
          application_ids: selectedApplicationIds,
        }),
      })

      if (response.ok) {
        onNotification(`Invitations sent to ${selectedApplicationIds.length} candidates!`, "success")
        setShowSendModal(false)
        setSelectedSession(null)
        setSelectedApplicationIds([])
        setSelectedRankingId("")
      } else {
        onNotification("Failed to send invitations", "error")
      }
    } catch (error) {
      console.error("Error sending invitations:", error)
      onNotification("Error sending invitations", "error")
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return

    try {
      const response = await fetch(`/api/video-sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onNotification("Session deleted successfully!", "success")
        fetchSessions()
      } else {
        onNotification("Failed to delete session", "error")
      }
    } catch (error) {
      console.error("Error deleting session:", error)
      onNotification("Error deleting session", "error")
    }
  }

  const handleSendInvitation = (session: VideoSession) => {
    setSelectedSession(session)
    setShowSendModal(true)
  }

  const handleRankingChange = (rankingId: string) => {
    setSelectedRankingId(rankingId)
    setSelectedApplicationIds([])
    if (rankingId) {
      setApplications([])
      fetchApplications(rankingId)
    } else {
      setApplications([])
    }
  }

  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplicationIds((prev) =>
      prev.includes(applicationId) ? prev.filter((id) => id !== applicationId) : [...prev, applicationId],
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Call Manager</h1>
                <p className="text-gray-600 dark:text-gray-300">Create and manage interview sessions</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Session</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Sessions List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Video Sessions</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center">
              <Video className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No video sessions yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first video session to start interviewing candidates
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Session</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sessions.map((session) => (
                <div key={session.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{session.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)} dark:bg-opacity-20`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : "ASAP"}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{session.participants_count || 0} participants</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Meeting ID: {session.meeting_id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSendInvitation(session)}
                        className="flex items-center space-x-1 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Send className="h-4 w-4" />
                        <span>Send</span>
                      </button>
                      <button
                        onClick={() => window.open(session.meeting_url, "_blank")}
                        className="flex items-center space-x-1 px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Join</span>
                      </button>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Video Session</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Title</label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="e.g., Frontend Developer Interview"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Schedule Date (Optional)
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Schedule Time (Optional)
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Leave date and time empty for ASAP scheduling (session starts immediately)
              </p>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSession}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Invitation Modal */}
      {showSendModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Send Invitation: {selectedSession.title}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Ranking
                </label>
                <select
                  value={selectedRankingId}
                  onChange={(e) => handleRankingChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a ranking...</option>
                  {rankings.map((ranking) => (
                    <option key={ranking.id} value={ranking.id}>
                      {ranking.title} ({ranking.applications_count || 0} applications)
                    </option>
                  ))}
                </select>
              </div>

              {selectedRankingId && applications.length === 0 && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading applicants...</p>
                </div>
              )}

              {selectedRankingId && applications.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p>No applicants found for this ranking</p>
                  <p className="text-sm">Try selecting a different ranking</p>
                </div>
              )}

              {applications.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Applicants ({applications.length} available)
                  </label>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedApplicationIds.includes(application.id)}
                          onChange={() => toggleApplicationSelection(application.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{application.candidate_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{application.candidate_email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {selectedApplicationIds.length} of {applications.length} applicants selected
                  </p>
                </div>
              )}

              {!selectedRankingId && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p>Please select a ranking to view applicants</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendInvitations}
                disabled={selectedApplicationIds.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invitations ({selectedApplicationIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ArrowLeft,
  Brain,
  Loader2,
  Users,
  BarChart3,
  Clock,
  UserCheck,
  TrendingUp,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Send,
  FileText,
  Eye,
  UserX,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

interface Application {
  id: string
  applicant_name: string
  applicant_email: string
  applicant_phone?: string
  applicant_city?: string
  total_score: number
  rank: number
  status: string
  submitted_at: string
  scored_at?: string
  scores: Record<string, number>
  score_breakdown?: Record<string, any>
  application_files: Array<{
    id: string
    file_name: string
    file_type: string
    file_category: string
    file_url: string
  }>
  ocr_transcript?: string
  selected_for_interview?: boolean
  interview_invitation_sent_at?: string
  interview_notes?: string
}

interface ResultsDashboardProps {
  rankingId: string
  onBack?: () => void
  onNotification?: (message: string, type: "success" | "error" | "info") => void
}

export default function ResultsDashboard({ rankingId, onBack, onNotification }: ResultsDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("rank")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100])
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [showBulkInterviewModal, setShowBulkInterviewModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showBulkApprovalModal, setShowBulkApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showBulkRejectionModal, setShowBulkRejectionModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showBulkScheduleModal, setShowBulkScheduleModal] = useState(false)
  const [selectedApplicationForInterview, setSelectedApplicationForInterview] = useState<Application | null>(null)
  const [selectedApplicationForRejection, setSelectedApplicationForRejection] = useState<Application | null>(null)
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null)
  const [interviewNotes, setInterviewNotes] = useState("")
  const [scheduledDateTime, setScheduledDateTime] = useState<string | null>(null)
  const [selectingForInterview, setSelectingForInterview] = useState<string | null>(null)
  const [bulkSelectingForInterview, setBulkSelectingForInterview] = useState(false)
  const [isApprovingCandidate, setIsApprovingCandidate] = useState(false)
  const [isBulkApprovingCandidates, setIsBulkApprovingCandidates] = useState(false)
  const [isRejectingCandidate, setIsRejectingCandidate] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSchedulingInterview, setIsSchedulingInterview] = useState(false)
  const [isBulkSchedulingInterview, setIsBulkSchedulingInterview] = useState(false)
  const [resendingInvitation, setResendingInvitation] = useState<string | null>(null)
  const [ranking, setRanking] = useState<any>({})

  useEffect(() => {
    fetchApplications()
    fetchRanking()
  }, [rankingId])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rankings/${rankingId}/applications`)
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      } else {
        onNotification?.("Failed to fetch applications", "error")
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      onNotification?.("Error occurred while fetching applications", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchRanking = async () => {
    try {
      const response = await fetch(`/api/rankings/${rankingId}`)
      if (response.ok) {
        const data = await response.json()
        setRanking(data.ranking || {})
      }
    } catch (error) {
      console.error("Error fetching ranking:", error)
    }
  }

  const handleScoreApplications = async () => {
    setScoring(true)
    try {
      const response = await fetch(`/api/rankings/${rankingId}/score-all`, {
        method: "POST",
      })

      if (response.ok) {
        const result = await response.json()
        onNotification?.(`Successfully scored ${result.scoredCount} applications`, "success")
        fetchApplications()
      } else {
        const error = await response.json()
        onNotification?.(error.error || "Failed to score applications", "error")
      }
    } catch (error) {
      console.error("Error scoring applications:", error)
      onNotification?.("Error occurred while scoring", "error")
    } finally {
      setScoring(false)
    }
  }

  const handleSelectForInterview = async (applicationId: string, notes = "") => {
    setSelectingForInterview(applicationId)
    try {
      const response = await fetch(`/api/applications/${applicationId}/select-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        onNotification?.("Candidate selected for interview", "success")
        fetchApplications()
        setShowInterviewModal(false)
        setInterviewNotes("")
      } else {
        const error = await response.json()
        onNotification?.(error.error || "Failed to select candidate", "error")
      }
    } catch (error) {
      console.error("Error selecting candidate:", error)
      onNotification?.("Error occurred while selecting candidate", "error")
    } finally {
      setSelectingForInterview(null)
    }
  }

  const handleBulkSelectForInterview = async () => {
    setBulkSelectingForInterview(true)
    try {
      const response = await fetch(`/api/applications/bulk-select-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: Array.from(selectedCandidates),
          notes: interviewNotes,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        onNotification?.(`Selected ${result.count} candidates for interview`, "success")
        fetchApplications()
        setShowBulkInterviewModal(false)
        setSelectedCandidates(new Set())
        setInterviewNotes("")
      } else {
        const error = await response.json()
        onNotification?.(error.error || "Failed to select candidates", "error")
      }
    } catch (error) {
      console.error("Error selecting candidates:", error)
      onNotification?.("Error occurred while selecting candidates", "error")
    } finally {
      setBulkSelectingForInterview(false)
    }
  }

  const handleApproveCandidate = async (applicationId: string) => {
    setIsApprovingCandidate(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        onNotification?.("Candidate approved successfully", "success")
        fetchApplications()
        setShowApprovalModal(false)
      } else {
        const error = await response.json()
        onNotification?.(error.error || "Failed to approve candidate", "error")
      }
    } catch (error) {
      console.error("Error approving candidate:", error)
      onNotification?.("Error occurred while approving candidate", "error")
    } finally {
      setIsApprovingCandidate(false)
    }
  }

  const handleBulkApprove = async () => {
    setIsBulkApprovingCandidates(true)
    try {
      const response = await fetch(`/api/applications/bulk-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: Array.from(selectedCandidates),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        onNotification?.(`Approved ${result.count} candidates`, "success")
        fetchApplications()
        setShowBulkApprovalModal(false)
        setSelectedCandidates(new Set())
      } else {
        const error = await response.json()
        onNotification?.(error.error || "Failed to approve candidates", "error")
      }
    } catch (error) {
      console.error("Error approving candidates:", error)
      onNotification?.("Error occurred while approving candidates", "error")
    } finally {
      setIsBulkApprovingCandidates(false)
    }
  }

  const handleRejectCandidate = async (applicationId: string) => {
    setIsRejectingCandidate(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/reject`, {
        method: "POST",
      })

      if (response.ok) {
        onNotification?.("Candidate rejected", "success")
        fetchApplications()
        setShowRejectionModal(false)
      } else {
        const error = await response.json()
        onNotification?.(error.error || "Failed to reject candidate", "error")
      }
    } catch (error) {
      console.error("Error rejecting candidate:", error)
      onNotification?.("Error occurred while rejecting candidate", "error")
    } finally {
      setIsRejectingCandidate(false)
    }
  }

  const handleBulkReject = async () => {
    setIsRejectingCandidate(true)
    try {
      const response = await fetch(`/api/applications/bulk-reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: Array.from(selectedCandidates),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        onNotification?.(`Rejected ${result.count} candidates`, "success")
        fetchApplications()
        setShowBulkRejectionModal(false)
        setSelectedCandidates(new Set())
      } else {
        const error = await response.json()
        onNotification?.(error.error || "Failed to reject candidates", "error")
      }
    } catch (error) {
      console.error("Error rejecting candidates:", error)
      onNotification?.("Error occurred while rejecting candidates", "error")
    } finally {
      setIsRejectingCandidate(false)
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onNotification?.("Application deleted successfully", "success")
        fetchApplications()
        setShowDeleteModal(false)
      } else {
        const error = await response.json()
        onNotification?.(error.error || "Failed to delete application", "error")
      }
    } catch (error) {
      console.error("Error deleting application:", error)
      onNotification?.("Error occurred while deleting application", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleScheduleInterview = async (applicationId: string) => {
    setIsSchedulingInterview(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/schedule-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDateTime,
          notes: interviewNotes,
        }),
      })

      if (response.ok) {
        onNotification?.("Interview scheduled successfully", "success")
        fetchApplications()
        setShowScheduleModal(false)
        setScheduledDateTime(null)
        setInterviewNotes("")
      } else {
        const error = await response.json()
        onNotification?.(error.error || "Failed to schedule interview", "error")
      }
    } catch (error) {
      console.error("Error scheduling interview:", error)
      onNotification?.("Error occurred while scheduling interview", "error")
    } finally {
      setIsSchedulingInterview(false)
    }
  }

  const handleBulkScheduleInterview = async () => {
    setIsBulkSchedulingInterview(true)
    try {
      const response = await fetch(`/api/applications/bulk-schedule-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: Array.from(selectedCandidates),
          scheduledDateTime,
          notes: interviewNotes,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        onNotification?.(`Scheduled interviews for ${result.count} candidates`, "success")
        fetchApplications()
        setShowBulkScheduleModal(false)
        setSelectedCandidates(new Set())
        setScheduledDateTime(null)
        setInterviewNotes("")
      } else {
        const error = await response.json()
        onNotification?.(error.error || "Failed to schedule interviews", "error")
      }
    } catch (error) {
      console.error("Error scheduling interviews:", error)
      onNotification?.("Error occurred while scheduling interviews", "error")
    } finally {
      setIsBulkSchedulingInterview(false)
    }
  }

  const handleResendInvitation = async (applicationId: string, notes = "") => {
    setResendingInvitation(applicationId)
    try {
      const response = await fetch(`/api/applications/${applicationId}/resend-invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        onNotification?.("Invitation resent successfully", "success")
        fetchApplications()
      } else {
        const error = await response.json()
        onNotification?.(error.error || "Failed to resend invitation", "error")
      }
    } catch (error) {
      console.error("Error resending invitation:", error)
      onNotification?.("Error occurred while resending invitation", "error")
    } finally {
      setResendingInvitation(null)
    }
  }

  const handleViewDocument = (file: any) => {
    if (file.file_url) {
      window.open(file.file_url, "_blank")
    } else {
      onNotification?.("Document URL not available", "error")
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80)
      return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-800/50"
    if (score >= 60)
      return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/50 dark:border-blue-800/50"
    if (score >= 40)
      return "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-800/50"
    return "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-800/50"
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-300"
    if (rank <= 3) return "bg-orange-100 text-orange-800 border-orange-300"
    if (rank <= 10) return "bg-blue-100 text-blue-800 border-blue-300"
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getDisplayScore = (application: Application) => {
    if (application.total_score && application.total_score > 0) {
      return application.total_score
    }
    return 25
  }

  const getDisplayRank = (application: Application) => {
    return application.rank || 999
  }

  const filteredApplications = useMemo(() => {
    const filtered = applications.filter((app) => {
      // Status filter
      if (filterStatus === "scored" && (!app.total_score || app.total_score <= 0)) return false
      if (filterStatus === "pending" && app.total_score && app.total_score > 0) return false
      if (filterStatus === "selected" && !app.selected_for_interview) return false
      if (filterStatus === "approved" && app.status !== "approved") return false
      if (filterStatus === "rejected" && app.status !== "rejected") return false

      // Score range filter
      if (app.total_score && (app.total_score < scoreRange[0] || app.total_score > scoreRange[1])) return false

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          app.applicant_name.toLowerCase().includes(query) ||
          app.applicant_email.toLowerCase().includes(query) ||
          app.applicant_city?.toLowerCase().includes(query)
        )
      }

      return true
    })

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "rank":
          return (a.rank || 999) - (b.rank || 999)
        case "score-high":
          return (b.total_score || 0) - (a.total_score || 0)
        case "score-low":
          return (a.total_score || 0) - (b.total_score || 0)
        case "name-az":
          return a.applicant_name.localeCompare(b.applicant_name)
        case "name-za":
          return b.applicant_name.localeCompare(a.applicant_name)
        case "newest":
          return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        case "oldest":
          return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
        case "city-az":
          return (a.applicant_city || "").localeCompare(b.applicant_city || "")
        case "city-za":
          return (b.applicant_city || "").localeCompare(a.applicant_city || "")
        default:
          return 0
      }
    })
  }, [applications, filterStatus, sortBy, searchQuery, scoreRange])

  const eligibleForSelection = filteredApplications.filter(
    (app) => !app.selected_for_interview && app.total_score && app.total_score > 0,
  )
  const allEligibleSelected =
    eligibleForSelection.length > 0 && eligibleForSelection.every((app) => selectedCandidates.has(app.id))
  const someEligibleSelected = eligibleForSelection.some((app) => selectedCandidates.has(app.id))

  const criteria = ranking.criteria || []

  const stats = {
    total: applications.length,
    reviewed: applications.filter((a) => a.total_score && a.total_score > 0).length,
    pending: applications.filter((a) => !a.total_score || a.total_score <= 0).length,
    selected: applications.filter((a) => a.selected_for_interview).length,
    avgScore:
      applications.length > 0
        ? applications.reduce((sum, a) => sum + (a.total_score || 25), 0) / applications.length
        : 0,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg text-foreground">Loading applications...</span>
        </div>
      </div>
    )
  }

  // Individual application view
  if (selectedApplication) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="flex items-center space-x-2 text-foreground hover:text-foreground/80 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Results</span>
                </button>
                <div className="h-6 w-px bg-border"></div>
                <h1 className="text-2xl font-bold text-foreground">{selectedApplication.applicant_name}</h1>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${getRankBadgeColor(selectedApplication.rank)}`}
                >
                  Rank #{selectedApplication.rank}
                </span>
                {selectedApplication.selected_for_interview && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 border border-green-300">
                    <UserCheck className="h-3 w-3 inline mr-1" />
                    Selected for Interview
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-4 py-2 rounded-lg font-semibold ${getScoreColor(selectedApplication.total_score)}`}>
                  {selectedApplication.total_score}%
                </div>
                {!selectedApplication.selected_for_interview &&
                  selectedApplication.status !== "rejected" &&
                  selectedApplication.status !== "approved" && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApplicationForRejection(selectedApplication)
                          setShowRejectionModal(true)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <UserX className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApplicationForInterview(selectedApplication)
                          setShowApprovalModal(true)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applicant Details */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedApplication.applicant_email}</span>
                  </div>
                  {selectedApplication.applicant_phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedApplication.applicant_phone}</span>
                    </div>
                  )}
                  {selectedApplication.applicant_city && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedApplication.applicant_city}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      Applied {new Date(selectedApplication.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedApplication.selected_for_interview && (
                    <>
                      <div className="flex items-center space-x-3">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Selected for Interview</span>
                      </div>
                      {selectedApplication.interview_invitation_sent_at && (
                        <div className="flex items-center space-x-3">
                          <Send className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-foreground">
                            Invitation sent{" "}
                            {new Date(selectedApplication.interview_invitation_sent_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() =>
                              handleResendInvitation(selectedApplication.id, selectedApplication.interview_notes)
                            }
                            disabled={resendingInvitation === selectedApplication.id}
                            className="ml-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            {resendingInvitation === selectedApplication.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Application Files */}
              {selectedApplication.application_files && selectedApplication.application_files.length > 0 && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Application Files</h3>
                  <div className="space-y-2">
                    {selectedApplication.application_files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground">{file.file_category}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDocument(file)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Score Breakdown</h3>
                {selectedApplication.scores && Object.keys(selectedApplication.scores).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(selectedApplication.scores).map(([criterion, score]) => (
                      <div key={criterion} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">{criterion}</span>
                          <span className="text-sm font-semibold text-foreground">{score}/100</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-foreground">Total Score</span>
                        <span
                          className={`text-lg font-bold px-3 py-1 rounded-lg ${getScoreColor(selectedApplication.total_score)}`}
                        >
                          {selectedApplication.total_score}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No score breakdown available</p>
                )}
              </div>

              {/* OCR Transcript */}
              {selectedApplication.ocr_transcript && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Application Content</h3>
                  <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedApplication.ocr_transcript}
                    </pre>
                  </div>
                </div>
              )}

              {/* Interview Notes */}
              {selectedApplication.interview_notes && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Interview Notes</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-foreground">{selectedApplication.interview_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-border"></div>
              <h1 className="text-2xl font-bold text-foreground">Position Applications</h1>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                {ranking.title || "Job Ranking"}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {applications.some((app) => !app.total_score || app.total_score <= 0) && (
                <button
                  onClick={handleScoreApplications}
                  disabled={scoring}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scoring ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Scoring...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      <span>Score All</span>
                    </>
                  )}
                </button>
              )}
              {selectedCandidates.size > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowBulkRejectionModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                  >
                    <UserX className="h-4 w-4" />
                    <span>Reject ({selectedCandidates.size})</span>
                  </button>
                  <button
                    onClick={() => setShowBulkApprovalModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Approve ({selectedCandidates.size})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Scored</p>
                <p className="text-3xl font-bold text-foreground">{stats.reviewed}</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-bold text-foreground">{stats.pending}</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Selected</p>
                <p className="text-3xl font-bold text-foreground">{stats.selected}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg Score</p>
                <p className="text-3xl font-bold text-foreground">{Math.round(stats.avgScore)}%</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, email, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="scored">Scored</option>
                <option value="pending">Pending</option>
                <option value="selected">Selected</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="rank">Sort by Rank</option>
                <option value="score-high">Score (High to Low)</option>
                <option value="score-low">Score (Low to High)</option>
                <option value="name-az">Name (A-Z)</option>
                <option value="name-za">Name (Z-A)</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="city-az">City (A-Z)</option>
                <option value="city-za">City (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allEligibleSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCandidates(new Set(eligibleForSelection.map((app) => app.id)))
                        } else {
                          setSelectedCandidates(new Set())
                        }
                      }}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      {!application.selected_for_interview &&
                        application.total_score &&
                        application.total_score > 0 && (
                          <input
                            type="checkbox"
                            checked={selectedCandidates.has(application.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedCandidates)
                              if (e.target.checked) {
                                newSelected.add(application.id)
                              } else {
                                newSelected.delete(application.id)
                              }
                              setSelectedCandidates(newSelected)
                            }}
                            className="rounded border-border"
                          />
                        )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getRankBadgeColor(getDisplayRank(application))}`}
                      >
                        #{getDisplayRank(application)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-foreground">{application.applicant_name}</div>
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            {application.applicant_email}
                          </div>
                          {application.applicant_city && (
                            <div className="text-xs text-slate-700 dark:text-slate-300">
                              {application.applicant_city}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-lg border ${getScoreColor(getDisplayScore(application))}`}
                      >
                        {getDisplayScore(application)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {application.selected_for_interview && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Selected
                          </span>
                        )}
                        {application.status === "approved" && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </span>
                        )}
                        {application.status === "rejected" && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </span>
                        )}
                        {!application.total_score || application.total_score <= 0 ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        ) : (
                          !application.selected_for_interview &&
                          application.status !== "approved" &&
                          application.status !== "rejected" && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Scored
                            </span>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {new Date(application.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                        {!application.selected_for_interview &&
                          application.status !== "rejected" &&
                          application.status !== "approved" &&
                          application.total_score &&
                          application.total_score > 0 && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedApplicationForRejection(application)
                                  setShowRejectionModal(true)
                                }}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedApplicationForInterview(application)
                                  setShowApprovalModal(true)
                                }}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                Approve
                              </button>
                            </>
                          )}
                        <button
                          onClick={() => {
                            setApplicationToDelete(application)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-600 dark:text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No applications found</h3>
            <p className="text-slate-700 dark:text-slate-300">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </div>

      {/* Modals would go here - simplified for brevity */}
      {/* Individual Approval Modal */}
      {showApprovalModal && selectedApplicationForInterview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Approve Candidate</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to approve {selectedApplicationForInterview.applicant_name}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveCandidate(selectedApplicationForInterview.id)}
                disabled={isApprovingCandidate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isApprovingCandidate ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approval Modal */}
      {showBulkApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Bulk Approve Candidates</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to approve {selectedCandidates.size} candidates?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkApprovalModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={isBulkApprovingCandidates}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isBulkApprovingCandidates ? "Approving..." : "Approve All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedApplicationForRejection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Candidate</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to reject {selectedApplicationForRejection.applicant_name}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectCandidate(selectedApplicationForRejection.id)}
                disabled={isRejectingCandidate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isRejectingCandidate ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Rejection Modal */}
      {showBulkRejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Bulk Reject Candidates</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to reject {selectedCandidates.size} candidates?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkRejectionModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkReject}
                disabled={isRejectingCandidate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isRejectingCandidate ? "Rejecting..." : "Reject All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && applicationToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Application</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete {applicationToDelete.applicant_name}'s application? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteApplication(applicationToDelete.id)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

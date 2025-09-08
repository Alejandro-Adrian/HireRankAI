"use client"
import { useState, useEffect, useMemo } from "react"
import {
  ArrowLeft,
  Trophy,
  Users,
  TrendingUp,
  FileText,
  Award,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BarChart3,
  Brain,
  CheckCircle,
  Target,
  Zap,
  UserCheck,
  Send,
  UserX,
  Trash2,
  Search,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [filterPosition, setFilterPosition] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("rank")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100])
  const [selectingForInterview, setSelectingForInterview] = useState<string | null>(null)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [interviewNotes, setInterviewNotes] = useState("")
  const [selectedApplicationForInterview, setSelectedApplicationForInterview] = useState<Application | null>(null)
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [showBulkInterviewModal, setShowBulkInterviewModal] = useState(false)
  const [bulkSelectingForInterview, setBulkSelectingForInterview] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showBulkApprovalModal, setShowBulkApprovalModal] = useState(false)
  const [isApprovingCandidate, setIsApprovingCandidate] = useState(false)
  const [isBulkApprovingCandidates, setIsBulkApprovingCandidates] = useState(false)
  const [ranking, setRanking] = useState<any>({})
  const [resendingInvitation, setResendingInvitation] = useState<string | null>(null)
  const [isSchedulingInterview, setIsSchedulingInterview] = useState(false)
  const [scheduledDateTime, setScheduledDateTime] = useState<string | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [isBulkSchedulingInterview, setIsBulkSchedulingInterview] = useState(false)
  const [showBulkScheduleModal, setShowBulkScheduleModal] = useState(false)
  const [isRejectingCandidate, setIsRejectingCandidate] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [selectedApplicationForRejection, setSelectedApplicationForRejection] = useState<Application | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showBulkRejectionModal, setShowBulkRejectionModal] = useState(false)
  const [isBulkRejectingCandidates, setIsBulkRejectingCandidates] = useState(false)
  const [rejectionNotes, setRejectionNotes] = useState("")

  useEffect(() => {
    fetchApplications()
    fetchRanking()
  }, [rankingId])

  const fetchRanking = async () => {
    try {
      const response = await fetch(`/api/rankings/${rankingId}`)
      if (response.ok) {
        const data = await response.json()
        setRanking(data)
      } else {
        onNotification("Failed to fetch ranking details", "error")
      }
    } catch (error) {
      console.error("Error fetching ranking details:", error)
      onNotification("Error loading ranking details", "error")
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/rankings/${rankingId}/applications`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Fetched applications data:", data)
        if (data.length > 0) {
          console.log("[v0] First application structure:", {
            scores: data[0].scores,
            score_breakdown: data[0].score_breakdown,
            ocr_transcript: data[0].ocr_transcript ? "Present" : "Missing",
          })
        }
        setApplications(data)
      } else {
        onNotification("Failed to fetch applications", "error")
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      onNotification("Error loading applications", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteApplication = async (application: Application) => {
    setApplicationToDelete(application)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!applicationToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/applications/${applicationToDelete.id}/delete`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the application from the local state
        setApplications((prev) => prev.filter((app) => app.id !== applicationToDelete.id))
        setShowDeleteModal(false)
        setApplicationToDelete(null)
      } else {
        console.error("Failed to delete application")
      }
    } catch (error) {
      console.error("Error deleting application:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleApproveCandidate = async (applicationId: string) => {
    console.log("[v0] Starting candidate approval for application:", applicationId)
    setIsApprovingCandidate(true)

    try {
      const response = await fetch(`/api/applications/${applicationId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: interviewNotes.trim() || null,
        }),
      })

      const result = await response.json()
      console.log("[v0] Approval response:", result)

      if (response.ok) {
        if (result.emailError) {
          onNotification(result.message, "info")
        } else {
          onNotification("Candidate approved and congratulations email sent!", "success")
        }

        // Refresh applications to show updated status
        fetchApplications()
        setShowApprovalModal(false)
        setInterviewNotes("")
        setSelectedApplicationForInterview(null)
      } else {
        onNotification(result.error || "Failed to approve candidate", "error")
      }
    } catch (error) {
      console.error("Error approving candidate:", error)
      onNotification("Error occurred while approving candidate", "error")
    } finally {
      setIsApprovingCandidate(false)
    }
  }

  const handleRejectCandidate = async (applicationId: string) => {
    console.log("[v0] Starting candidate rejection for application:", applicationId)
    setIsRejectingCandidate(true)

    try {
      const response = await fetch(`/api/applications/${applicationId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: interviewNotes.trim() || null,
        }),
      })

      const result = await response.json()
      console.log("[v0] Rejection response:", result)

      if (response.ok) {
        if (result.emailError) {
          onNotification(result.message, "info")
        } else {
          onNotification("Candidate rejected and notification email sent!", "success")
        }

        // Refresh applications to show updated status
        fetchApplications()
        setShowRejectionModal(false)
        setInterviewNotes("")
        setSelectedApplicationForRejection(null)
      } else {
        onNotification(result.error || "Failed to reject candidate", "error")
      }
    } catch (error) {
      console.error("Error rejecting candidate:", error)
      onNotification("Error occurred while rejecting candidate", "error")
    } finally {
      setIsRejectingCandidate(false)
    }
  }

  const handleBulkApproveCandidate = async () => {
    setIsBulkApprovingCandidates(true)

    try {
      const selectedApplications = Array.from(selectedCandidates)
      const results = await Promise.allSettled(
        selectedApplications.map(async (applicationId) => {
          const response = await fetch(`/api/applications/${applicationId}/approve`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              notes: interviewNotes.trim() || null,
            }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Failed to approve candidate")
          }

          return await response.json()
        }),
      )

      const successful = results.filter((result) => result.status === "fulfilled").length
      const failed = results.filter((result) => result.status === "rejected").length

      if (successful > 0) {
        onNotification(
          `Successfully approved ${successful} candidate${successful > 1 ? "s" : ""}${failed > 0 ? ` (${failed} failed)` : ""}`,
          failed > 0 ? "info" : "success",
        )
      } else {
        onNotification("Failed to approve candidates", "error")
      }

      // Refresh applications and reset selection
      fetchApplications()
      setShowBulkApprovalModal(false)
      setInterviewNotes("")
      setSelectedCandidates(new Set())
    } catch (error) {
      console.error("Error in bulk approval:", error)
      onNotification("Error occurred during bulk approval", "error")
    } finally {
      setIsBulkApprovingCandidates(false)
    }
  }

  const handleBulkRejectCandidate = async () => {
    setIsBulkRejectingCandidates(true)

    try {
      const selectedApplications = Array.from(selectedCandidates)
      const results = await Promise.allSettled(
        selectedApplications.map(async (applicationId) => {
          const response = await fetch(`/api/applications/${applicationId}/reject`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              notes: rejectionNotes.trim() || null,
            }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Failed to reject candidate")
          }

          return await response.json()
        }),
      )

      const successful = results.filter((result) => result.status === "fulfilled").length
      const failed = results.filter((result) => result.status === "rejected").length

      if (successful > 0) {
        onNotification(
          `Successfully rejected ${successful} candidate${successful > 1 ? "s" : ""}${failed > 0 ? ` (${failed} failed)` : ""}`,
          failed > 0 ? "info" : "success",
        )
      } else {
        onNotification("Failed to reject candidates", "error")
      }

      // Refresh applications and reset selection
      fetchApplications()
      setShowBulkRejectionModal(false)
      setRejectionNotes("")
      setSelectedCandidates(new Set())
    } catch (error) {
      console.error("Error in bulk rejection:", error)
      onNotification("Error occurred during bulk rejection", "error")
    } finally {
      setIsBulkRejectingCandidates(false)
    }
  }

  const handleSelectForInterview = async (applicationId: string) => {
    console.log("[v0] Starting interview selection for application:", applicationId)
    setSelectingForInterview(applicationId)

    try {
      const response = await fetch(`/api/applications/${applicationId}/select-for-interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: interviewNotes.trim() || null,
        }),
      })

      const result = await response.json()
      console.log("[v0] Interview selection response:", result)

      if (response.ok) {
        if (result.emailError) {
          onNotification(result.message, "info")
        } else {
          onNotification("Candidate selected and congratulations email sent!", "success")
        }

        // Refresh applications to show updated status
        fetchApplications()
        setShowInterviewModal(false)
        setInterviewNotes("")
        setSelectedApplicationForInterview(null)
      } else {
        onNotification(result.error || "Failed to select candidate", "error")
      }
    } catch (error) {
      console.error("Error selecting candidate:", error)
      onNotification("Error occurred while selecting candidate", "error")
    } finally {
      setSelectingForInterview(null)
    }
  }

  const handleBulkSelectForInterview = async () => {
    setBulkSelectingForInterview(true)

    try {
      const selectedApplications = Array.from(selectedCandidates)
      const results = await Promise.allSettled(
        selectedApplications.map(async (applicationId) => {
          const response = await fetch(`/api/applications/${applicationId}/select-for-interview`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              notes: interviewNotes.trim() || null,
            }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Failed to select candidate")
          }

          return await response.json()
        }),
      )

      const successful = results.filter((result) => result.status === "fulfilled").length
      const failed = results.filter((result) => result.status === "rejected").length

      if (successful > 0) {
        onNotification(
          `Successfully selected ${successful} candidate${successful > 1 ? "s" : ""} for interview${failed > 0 ? ` (${failed} failed)` : ""}`,
          failed > 0 ? "info" : "success",
        )
      } else {
        onNotification("Failed to select candidates for interview", "error")
      }

      // Refresh applications and reset selection
      fetchApplications()
      setShowBulkInterviewModal(false)
      setInterviewNotes("")
      setSelectedCandidates(new Set())
    } catch (error) {
      console.error("Error in bulk selection:", error)
      onNotification("Error occurred during bulk selection", "error")
    } finally {
      setBulkSelectingForInterview(false)
    }
  }

  const handleResendInvitation = async (applicationId: string, notes?: string) => {
    setResendingInvitation(applicationId)

    try {
      const response = await fetch(`/api/applications/${applicationId}/select-for-interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: notes || interviewNotes.trim() || null,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        if (result.emailError) {
          onNotification("Email resent but delivery may have failed. Please contact candidate manually.", "info")
        } else {
          onNotification("Interview invitation resent successfully!", "success")
        }
        fetchApplications()
      } else {
        onNotification(result.error || "Failed to resend invitation", "error")
      }
    } catch (error) {
      console.error("Error resending invitation:", error)
      onNotification("Error occurred while resending invitation", "error")
    } finally {
      setResendingInvitation(null)
    }
  }

  const handleScoreApplications = async () => {
    console.log("[v0] Starting to score applications for ranking:", rankingId)
    setScoring(true)
    try {
      console.log("[v0] Making POST request to score-all endpoint")
      const response = await fetch(`/api/rankings/${rankingId}/score-all`, {
        method: "POST",
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Scoring result:", result)
        onNotification(`Successfully scored ${result.scoredCount} applications`, "success")
        fetchApplications() // Refresh the data
      } else {
        const error = await response.json()
        console.log("[v0] Scoring error:", error)
        onNotification(error.error || "Failed to score applications", "error")
      }
    } catch (error) {
      console.error("[v0] Error scoring applications:", error)
      onNotification("Error occurred while scoring", "error")
    } finally {
      setScoring(false)
    }
  }

  const handleViewDocument = (file: any) => {
    if (file.file_url) {
      window.open(file.file_url, "_blank")
    } else {
      onNotification("Document URL not available", "error")
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
    if (rank === 1) return "bg-chart-1/20 text-chart-1 border-chart-1/30 shadow-sm"
    if (rank <= 3) return "bg-chart-2/20 text-chart-2 border-chart-2/30 shadow-sm"
    if (rank <= 10) return "bg-primary/20 text-primary border-primary/30 shadow-sm"
    return "bg-muted text-muted-foreground border-border shadow-sm"
  }

  const getDisplayScore = (application: Application) => {
    if (application.total_score && application.total_score > 0) {
      return application.total_score
    }
    return 25
  }

  const getDisplayRank = (application: Application) => {
    if (application.rank && application.rank > 0) {
      return application.rank
    }
    return applications.length
  }

  const handleCandidateSelect = (candidateId: string, checked: boolean) => {
    const newSelected = new Set(selectedCandidates)
    if (checked) {
      newSelected.add(candidateId)
    } else {
      newSelected.delete(candidateId)
    }
    setSelectedCandidates(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const eligibleCandidates = filteredApplications
        .filter((app) => !app.selected_for_interview && app.total_score && app.total_score > 0)
        .map((app) => app.id)
      setSelectedCandidates(new Set(eligibleCandidates))
    } else {
      setSelectedCandidates(new Set())
    }
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

  const handleScheduleInterview = async (applicationId: string) => {
    setIsSchedulingInterview(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/schedule-interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduledAt: scheduledDateTime || null,
          notes: interviewNotes,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Interview scheduled successfully:", result)

        // Refresh applications
        fetchApplications()

        // Reset form and close modal
        setShowScheduleModal(false)
        setSelectedApplicationForInterview(null)
        setInterviewNotes("")
        setScheduledDateTime("")

        alert(`Interview scheduled successfully! Meeting URL: ${result.meetingUrl}`)
      } else {
        const error = await response.json()
        alert(`Failed to schedule interview: ${error.error}`)
      }
    } catch (error) {
      console.error("[v0] Error scheduling interview:", error)
      alert("Failed to schedule interview. Please try again.")
    } finally {
      setIsSchedulingInterview(false)
    }
  }

  const handleBulkScheduleInterview = async () => {
    setIsBulkSchedulingInterview(true)
    try {
      const response = await fetch("/api/applications/bulk-schedule-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationIds: Array.from(selectedCandidates),
          scheduledAt: scheduledDateTime || null,
          notes: interviewNotes,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Bulk interviews scheduled:", result)

        // Refresh applications
        fetchApplications()

        // Reset form and close modal
        setShowBulkScheduleModal(false)
        setSelectedCandidates(new Set())
        setInterviewNotes("")
        setScheduledDateTime("")

        alert(`Successfully scheduled ${result.summary.successful} interviews! ${result.summary.failed} failed.`)
      } else {
        const error = await response.json()
        alert(`Failed to schedule interviews: ${error.error}`)
      }
    } catch (error) {
      console.error("[v0] Error scheduling bulk interviews:", error)
      alert("Failed to schedule interviews. Please try again.")
    } finally {
      setIsBulkSchedulingInterview(false)
    }
  }

  if (selectedApplication) {
    console.log("[v0] Selected application data:", {
      id: selectedApplication.id,
      scores: selectedApplication.scores,
      score_breakdown: selectedApplication.score_breakdown,
      ocr_transcript: selectedApplication.ocr_transcript ? "Present" : "Missing",
    })

    return (
      <div className="min-h-screen bg-background animate-fade-in">
        {/* Header */}
        <header className="bg-card border-b border-border animate-slide-in-down">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="flex items-center space-x-2 text-foreground hover:text-foreground/80 transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Results</span>
                </button>
                <div className="h-6 w-px bg-border"></div>
                <h1 className="text-2xl font-bold text-foreground animate-slide-in-left">
                  {selectedApplication.applicant_name}
                </h1>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full border animate-bounce-in ${getRankBadgeColor(selectedApplication.rank)}`}
                >
                  Rank #{selectedApplication.rank}
                </span>
                {selectedApplication.selected_for_interview && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 border border-green-300 animate-bounce-in">
                    <UserCheck className="h-3 w-3 inline mr-1" />
                    Selected for Interview
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`px-4 py-2 rounded-lg font-semibold animate-scale-in ${getScoreColor(selectedApplication.total_score)}`}
                >
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
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      >
                        <UserX className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApplicationForInterview(selectedApplication)
                          setShowApprovalModal(true)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
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

        <div className="p-6 max-w-6xl mx-auto animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applicant Details */}
            <div className="lg:col-span-1 space-y-6 animate-slide-in-left">
              <div className="bg-card rounded-lg border border-border p-6 hover-lift">
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
                            className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                          >
                            {resendingInvitation === selectedApplication.id ? "Resending..." : "Resend"}
                          </button>
                        </div>
                      )}
                      {selectedApplication.interview_notes && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>HR Notes:</strong> {selectedApplication.interview_notes}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Uploaded Files */}
              <div className="bg-card rounded-lg border border-border p-6 hover-lift">
                <h3 className="text-lg font-semibold text-foreground mb-4">Uploaded Documents</h3>
                <div className="space-y-3">
                  {selectedApplication.application_files.map((file, index) => {
                    const getFileIcon = (category: string) => {
                      switch (category) {
                        case "resume":
                          return <FileText className="h-4 w-4 text-blue-500" />
                        case "certificate":
                          return <Award className="h-4 w-4 text-green-500" />
                        case "portfolio":
                          return <Briefcase className="h-4 w-4 text-purple-500" />
                        default:
                          return <FileText className="h-4 w-4 text-gray-500" />
                      }
                    }

                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] stagger-item"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.file_category)}
                          <div>
                            <p className="text-sm font-medium text-foreground">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{file.file_category}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDocument(file)}
                          className="text-primary hover:text-primary/80 text-sm font-medium hover:bg-primary/10 px-2 py-1 rounded transition-all duration-200 hover:scale-105"
                        >
                          View
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Scoring Details */}
            <div className="lg:col-span-2 animate-slide-in-right">
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 hover-lift">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span>Detailed Scoring Analysis</span>
                  </h3>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">AI Analyzed</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {criteria.length > 0 ? (
                    criteria.map((criterion: any, index: number) => {
                      const score =
                        selectedApplication.scores?.[criterion.name] ||
                        selectedApplication.scores?.[criterion.name.toLowerCase()]
                      const breakdown =
                        selectedApplication.score_breakdown?.[criterion.name] ||
                        selectedApplication.score_breakdown?.[criterion.name.toLowerCase()]
                      const matchedKeywords = breakdown?.matched_items || breakdown?.keywords || []
                      const displayScore = score !== undefined ? score : 0

                      return (
                        <div
                          key={criterion.name}
                          className="bg-background rounded-lg border border-border p-5 hover:shadow-md transition-all duration-300 hover:scale-[1.02] stagger-item"
                          style={{ animationDelay: `${index * 0.15}s` }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-8 bg-primary rounded-full"></div>
                              <div>
                                <h4 className="text-base font-semibold text-foreground capitalize">{criterion.name}</h4>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                  Weight: {(criterion.weight * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-foreground">{displayScore}</div>
                                <div className="text-xs text-muted-foreground">out of 100</div>
                              </div>
                              <div
                                className={`px-3 py-2 text-sm font-semibold rounded-lg border ${getScoreColor(displayScore)}`}
                              >
                                {displayScore >= 80
                                  ? "Excellent"
                                  : displayScore >= 60
                                    ? "Good"
                                    : displayScore >= 40
                                      ? "Fair"
                                      : "Poor"}
                              </div>
                            </div>
                          </div>

                          {/* Enhanced progress bar */}
                          <div className="relative w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out animate-shimmer"
                              style={{ width: `${displayScore}%` }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                          </div>

                          {breakdown ? (
                            <div className="space-y-4">
                              <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                                <div className="flex items-start space-x-2 mb-2">
                                  <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <p className="text-sm text-foreground leading-relaxed">
                                    {breakdown.reasoning || breakdown}
                                  </p>
                                </div>
                              </div>

                              {matchedKeywords && matchedKeywords.length > 0 && (
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-2">
                                    <Zap className="h-4 w-4 text-accent" />
                                    <p className="text-sm font-semibold text-foreground">
                                      Keywords Detected ({matchedKeywords.length} matches)
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {matchedKeywords.map((keyword: string, keywordIndex: number) => (
                                      <span
                                        key={keywordIndex}
                                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-200 hover:scale-105 stagger-item"
                                        style={{ animationDelay: `${index * 0.15 + keywordIndex * 0.05}s` }}
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-muted/50 rounded-lg p-4 border border-dashed border-border">
                              <p className="text-sm text-muted-foreground italic flex items-center space-x-2">
                                <BarChart3 className="h-4 w-4" />
                                <span>No detailed breakdown available - scoring in progress</span>
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <>
                      {["skill", "experience", "education"].map((criterionName, index) => {
                        const score = selectedApplication.scores?.[criterionName]
                        const breakdown = selectedApplication.score_breakdown?.[criterionName]
                        const matchedKeywords = breakdown?.matched_items || breakdown?.keywords || []
                        const displayScore = score !== undefined ? score : 0

                        // Display name mapping
                        const displayName =
                          criterionName === "skill"
                            ? "Relevant Skills"
                            : criterionName === "experience"
                              ? "Experience"
                              : criterionName === "education"
                                ? "Education"
                                : criterionName

                        return (
                          <div
                            key={criterionName}
                            className="bg-background rounded-lg border border-border p-5 hover:shadow-md transition-all duration-300 hover:scale-[1.02] stagger-item"
                            style={{ animationDelay: `${index * 0.15}s` }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-8 bg-primary rounded-full"></div>
                                <div>
                                  <h4 className="text-base font-semibold text-foreground">{displayName}</h4>
                                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                    Auto-Scored
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-foreground">{displayScore}</div>
                                  <div className="text-xs text-muted-foreground">out of 100</div>
                                </div>
                                <div
                                  className={`px-3 py-2 text-sm font-semibold rounded-lg border ${getScoreColor(displayScore)}`}
                                >
                                  {displayScore >= 80
                                    ? "Excellent"
                                    : displayScore >= 60
                                      ? "Good"
                                      : displayScore >= 40
                                        ? "Fair"
                                        : "Poor"}
                                </div>
                              </div>
                            </div>

                            <div className="relative w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
                              <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${displayScore}%` }}
                              ></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                            </div>

                            {breakdown ? (
                              <div className="space-y-4">
                                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                                  <div className="flex items-start space-x-2 mb-2">
                                    <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-foreground leading-relaxed">
                                      {breakdown.reasoning || "Scored based on keyword matching and relevance analysis"}
                                    </p>
                                  </div>
                                </div>

                                {matchedKeywords && matchedKeywords.length > 0 && (
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                      <Zap className="h-4 w-4 text-accent" />
                                      <p className="text-sm font-semibold text-foreground">
                                        Keywords Detected ({matchedKeywords.length} matches)
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {matchedKeywords.map((keyword: string, keywordIndex: number) => (
                                        <span
                                          key={keywordIndex}
                                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-200 hover:scale-105 stagger-item"
                                          style={{ animationDelay: `${index * 0.15 + keywordIndex * 0.05}s` }}
                                        >
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-muted/50 rounded-lg p-4 border border-dashed border-border">
                                <p className="text-sm text-muted-foreground italic flex items-center space-x-2">
                                  <BarChart3 className="h-4 w-4" />
                                  <span>Scoring in progress - please refresh in a moment</span>
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </>
                  )}

                  {/* Enhanced OCR Transcript Section */}
                  {selectedApplication.ocr_transcript && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <div className="bg-card rounded-lg border border-border p-6">
                        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span>OCR Text Analysis</span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            AI Extracted
                          </span>
                        </h4>
                        <div className="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto border border-border/50">
                          <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                            {selectedApplication.ocr_transcript}
                          </pre>
                        </div>
                        <div className="flex items-center space-x-2 mt-3 text-xs text-muted-foreground">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>
                            This is the raw text extracted from the resume using advanced OCR technology for scoring
                            analysis.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(!selectedApplication.scores || Object.keys(selectedApplication.scores).length === 0) && (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-foreground mb-2">No Scoring Data Available</h4>
                      <p className="text-muted-foreground mb-4">This application hasn't been scored yet.</p>
                      <button
                        onClick={() => {
                          // Trigger scoring for this specific application
                          fetch(`/api/applications/${selectedApplication.id}/score`, { method: "POST" })
                            .then(() => {
                              onNotification("Application scoring initiated", "info")
                              // Refresh the data
                              fetchApplications()
                            })
                            .catch(() => {
                              onNotification("Failed to initiate scoring", "error")
                            })
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                      >
                        Score This Application
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm animate-slide-in-down">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 hover:bg-muted/50 px-3 py-2 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-border"></div>
              <h1 className="text-2xl font-bold text-foreground animate-slide-in-left">Position Applications</h1>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20 animate-bounce-in">
                {ranking.title || "Job Ranking"}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {applications.some((app) => !app.total_score || app.total_score <= 0) && (
                <button
                  onClick={handleScoreApplications}
                  disabled={scoring}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed animate-scale-in"
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
                <div className="flex items-center space-x-2 animate-slide-in-right">
                  <button
                    onClick={() => setShowBulkRejectionModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <UserX className="h-4 w-4" />
                    <span>Reject ({selectedCandidates.size})</span>
                  </button>
                  <button
                    onClick={() => setShowBulkApprovalModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
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

      <div className="p-6 animate-fade-in-up">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div
            className="bg-card rounded-xl border border-border p-6 hover-lift animate-scale-in shadow-sm"
            style={{ animationDelay: "0.1s" }}
          >
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

          <div
            className="bg-card rounded-xl border border-border p-6 hover-lift animate-scale-in shadow-sm"
            style={{ animationDelay: "0.2s" }}
          >
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

          <div
            className="bg-card rounded-xl border border-border p-6 hover-lift animate-scale-in shadow-sm"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-bold text-foreground">{stats.pending}</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div
            className="bg-card rounded-xl border border-border p-6 hover-lift animate-scale-in shadow-sm"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Selected</p>
                <p className="text-3xl font-bold text-foreground">{stats.selected}</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                <UserCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div
            className="bg-card rounded-xl border border-border p-6 hover-lift animate-scale-in shadow-sm"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Average Score</p>
                <p className="text-3xl font-bold text-foreground">{stats.avgScore.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-chart-1/20 rounded-lg">
                <Trophy className="h-6 w-6 text-chart-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div
          className="bg-card rounded-xl border border-border shadow-sm animate-slide-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Applications</h2>
              {eligibleForSelection.length > 0 && (
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 px-3 py-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={allEligibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someEligibleSelected && !allEligibleSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Select All Eligible</span>
                </label>
              )}
            </div>

            {/* Enhanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border focus:border-primary transition-colors"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-background border-border focus:border-primary transition-colors">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scored">Scored</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-background border-border focus:border-primary transition-colors">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Best Rank</SelectItem>
                  <SelectItem value="score-high">Highest Score</SelectItem>
                  <SelectItem value="score-low">Lowest Score</SelectItem>
                  <SelectItem value="name-az">Name (A-Z)</SelectItem>
                  <SelectItem value="name-za">Name (Z-A)</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery.trim() || filterStatus !== "all" || sortBy !== "rank") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterStatus("all")
                    setSortBy("rank")
                  }}
                  className="flex items-center gap-2 hover:bg-muted/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground mt-4">
              Showing {filteredApplications.length} of {applications.length} applications
            </div>
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-12 text-center animate-fade-in">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No applications found</h3>
              <p className="text-muted-foreground">
                {applications.length === 0 ? "No applications have been submitted yet." : "Try adjusting your filters."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredApplications.map((application, index) => {
                const displayScore = getDisplayScore(application)
                const displayRank = getDisplayRank(application)
                const hasRealScore = application.total_score && application.total_score > 0
                const isEligibleForSelection = !application.selected_for_interview && hasRealScore
                const isSelected = selectedCandidates.has(application.id)

                return (
                  <div
                    key={application.id}
                    onClick={() => setSelectedApplication(application)}
                    className="p-6 hover:bg-muted/30 transition-all duration-300 hover:scale-[1.01] cursor-pointer stagger-item group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {isEligibleForSelection && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleCandidateSelect(application.id, e.target.checked)
                            }}
                            className="rounded border-border text-primary focus:ring-primary transition-colors"
                          />
                        )}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-200 group-hover:scale-110 ${getRankBadgeColor(displayRank)}`}
                        >
                          #{displayRank}
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                              {application.applicant_name}
                            </h3>
                            {application.selected_for_interview && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 animate-bounce-in">
                                <UserCheck className="h-3 w-3 inline mr-1" />
                                Selected
                              </span>
                            )}
                            {application.status === "approved" && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                                ✓ Approved
                              </span>
                            )}
                            {application.status === "rejected" && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                                ✗ Rejected
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="hover:text-foreground transition-colors">
                              {application.applicant_email}
                            </span>
                            {application.applicant_city && (
                              <span className="hover:text-foreground transition-colors">
                                {application.applicant_city}
                              </span>
                            )}
                            <span>Applied {new Date(application.submitted_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`px-4 py-2 rounded-lg font-bold text-lg transition-all duration-200 group-hover:scale-105 ${getScoreColor(displayScore)}`}
                            >
                              {displayScore}%
                            </div>
                            {!hasRealScore && (
                              <span className="text-xs bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full animate-pulse-slow border border-amber-200 dark:border-amber-800/50">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {!application.selected_for_interview &&
                            application.status !== "rejected" &&
                            application.status !== "approved" &&
                            hasRealScore && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedApplicationForRejection(application)
                                    setShowRejectionModal(true)
                                  }}
                                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 hover:scale-110"
                                  title="Reject candidate"
                                >
                                  <UserX className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedApplicationForInterview(application)
                                    setShowApprovalModal(true)
                                  }}
                                  className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 rounded-lg transition-all duration-200 hover:scale-110"
                                  title="Approve candidate"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteApplication(application)
                            }}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Delete application"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showBulkApprovalModal && selectedCandidates.size > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card rounded-lg border border-border p-6 max-w-lg w-full mx-4 animate-scale-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Approve Multiple Candidates</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCandidates.size} candidate{selectedCandidates.size > 1 ? "s" : ""} selected
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card/50 rounded-lg p-4 border border-border/50 max-h-32 overflow-y-auto">
                <p className="text-sm font-medium text-foreground mb-2">Selected Candidates:</p>
                <div className="space-y-1">
                  {Array.from(selectedCandidates).map((candidateId) => {
                    const candidate = applications.find((app) => app.id === candidateId)
                    return candidate ? (
                      <div key={candidateId} className="text-sm text-muted-foreground">
                        • {candidate.applicant_name} ({candidate.total_score}%)
                      </div>
                    ) : null
                  })}
                </div>
              </div>

              <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                <label htmlFor="bulkApprovalNotes" className="block text-sm font-medium text-foreground mb-2">
                  HR Notes (will be applied to all selected candidates)
                </label>
                <textarea
                  id="bulkApprovalNotes"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  rows={3}
                  placeholder="Optional notes for all selected candidates..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBulkApprovalModal(false)
                    setInterviewNotes("")
                  }}
                  disabled={isBulkApprovingCandidates}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
                <Button
                  onClick={() => handleBulkApproveCandidate()}
                  disabled={isBulkApprovingCandidates}
                  className="w-full"
                >
                  {isBulkApprovingCandidates ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    "Approve & Send Emails"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkRejectionModal && selectedCandidates.size > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card rounded-lg border border-border p-6 max-w-lg w-full mx-4 animate-scale-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Reject Multiple Candidates</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCandidates.size} candidate{selectedCandidates.size > 1 ? "s" : ""} selected
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card/50 rounded-lg p-4 border border-border/50 max-h-32 overflow-y-auto">
                <p className="text-sm font-medium text-foreground mb-2">Selected Candidates:</p>
                <div className="space-y-1">
                  {Array.from(selectedCandidates).map((candidateId) => {
                    const candidate = applications.find((app) => app.id === candidateId)
                    return candidate ? (
                      <div key={candidateId} className="text-sm text-muted-foreground">
                        • {candidate.applicant_name} ({candidate.total_score}%)
                      </div>
                    ) : null
                  })}
                </div>
              </div>

              <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                <label htmlFor="bulkRejectionNotes" className="block text-sm font-medium text-foreground mb-2">
                  HR Notes (will be applied to all selected candidates)
                </label>
                <textarea
                  id="bulkRejectionNotes"
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  rows={3}
                  placeholder="Optional notes for all selected candidates..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBulkRejectionModal(false)
                    setRejectionNotes("")
                  }}
                  disabled={isBulkRejectingCandidates}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
                <Button
                  onClick={() => handleBulkRejectCandidate()}
                  disabled={isBulkRejectingCandidates}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                >
                  {isBulkRejectingCandidates ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4" />
                      <span>Reject All</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApprovalModal && selectedApplicationForInterview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-emerald rounded-2xl border border-emerald-200/20 dark:border-emerald-800/20 p-6 sm:p-8 max-w-lg w-full mx-4 animate-scale-in shadow-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-work-sans">Approve Candidate</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-open-sans">
                  {selectedApplicationForInterview.applicant_name}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass rounded-xl p-4 border border-emerald-200/20 dark:border-emerald-800/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-work-sans">
                    Candidate Score
                  </span>
                  <span className="text-2xl font-bold gradient-text font-work-sans">
                    {selectedApplicationForInterview.total_score}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out animate-scale-x"
                    style={{ width: `${selectedApplicationForInterview.total_score}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 font-work-sans">
                  Interview Notes (Optional)
                </label>
                <textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="Add any notes about this candidate or interview requirements..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border-2 border-emerald-200/50 dark:border-emerald-800/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 font-open-sans resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowApprovalModal(false)
                    setSelectedApplicationForInterview(null)
                    setInterviewNotes("")
                  }}
                  className="flex-1 px-6 py-3 glass hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-300 font-work-sans font-semibold text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproveCandidate(selectedApplicationForInterview.id)}
                  disabled={isApprovingCandidate}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 ripple-effect font-work-sans font-semibold shadow-lg"
                >
                  {isApprovingCandidate ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Approve Candidate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showRejectionModal && selectedApplicationForRejection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Reject Candidate</h3>
                <p className="text-sm text-muted-foreground">{selectedApplicationForRejection.applicant_name}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                <label htmlFor="rejectionNotes" className="block text-sm font-medium text-foreground mb-2">
                  HR Notes
                </label>
                <textarea
                  id="rejectionNotes"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  rows={4}
                  placeholder="Optional notes for the rejection..."
                />
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectionModal(false)
                    setInterviewNotes("")
                    setSelectedApplicationForRejection(null)
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectCandidate(selectedApplicationForRejection.id)}
                  disabled={isRejectingCandidate}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                >
                  {isRejectingCandidate ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4" />
                      <span>Reject & Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && applicationToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete Application</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-foreground">
                Are you sure you want to delete the application from{" "}
                <span className="font-semibold">{applicationToDelete.applicant_name}</span>?
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This will permanently remove all application data, files, and scores.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setApplicationToDelete(null)
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-card/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scored">Scored</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="selected">Selected</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Options */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank">Rank (Best First)</SelectItem>
              <SelectItem value="score-high">Score (High to Low)</SelectItem>
              <SelectItem value="score-low">Score (Low to High)</SelectItem>
              <SelectItem value="name-az">Name (A-Z)</SelectItem>
              <SelectItem value="name-za">Name (Z-A)</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="city-az">City (A-Z)</SelectItem>
              <SelectItem value="city-za">City (Z-A)</SelectItem>
            </SelectContent>
          </Select>

          {/* Score Range Filter */}
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Score Range:</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={scoreRange[0]}
              onChange={(e) => setScoreRange([Number.parseInt(e.target.value) || 0, scoreRange[1]])}
              className="w-20"
              placeholder="Min"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              min="0"
              max="100"
              value={scoreRange[1]}
              onChange={(e) => setScoreRange([scoreRange[0], Number.parseInt(e.target.value) || 100])}
              className="w-20"
              placeholder="Max"
            />
          </div>

          {/* Clear Filters Button */}
          {(filterStatus !== "all" ||
            sortBy !== "rank" ||
            searchQuery.trim() ||
            scoreRange[0] !== 0 ||
            scoreRange[1] !== 100) && (
            <Button
              variant="outline"
              onClick={() => {
                setFilterStatus("all")
                setSortBy("rank")
                setSearchQuery("")
                setScoreRange([0, 100])
              }}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      </div>
    </div>
  )
}

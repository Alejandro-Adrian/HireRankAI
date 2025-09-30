"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Loader2, AlertTriangle, CheckCircle, Eye, EyeOff, MapPin, Sliders } from "lucide-react"

interface RankingData {
  id: string
  title: string
  position: string
  description: string
  criteria: string[]
  criteria_weights: Record<string, number>
  area_city?: string
  other_keyword?: string
  show_criteria_to_applicants: boolean
  is_active: boolean
}

const JOB_POSITIONS = [
  { value: "kitchen-helper", label: "Kitchen Helper" },
  { value: "server/waiter", label: "Server/Waiter" },
  { value: "housekeeping", label: "House Keeping" },
  { value: "cashier", label: "Cashier" },
  { value: "barista", label: "Barista" },
  { value: "gardener", label: "Gardener" },
  { value: "receptionist", label: "Receptionist" },
]

const DEFAULT_CRITERIA = [
  { id: "personality", name: "Personality", description: "Personality traits and soft skills assessment" },
  { id: "skill", name: "Skill", description: "Technical and job-specific skills evaluation" },
  { id: "area_living", name: "Area Living", description: "Geographic location and proximity to workplace" },
  { id: "experience", name: "Experience", description: "Previous work experience and background" },
  { id: "training", name: "Training", description: "Professional training and certifications completed" },
  { id: "certification", name: "Certification", description: "Industry certifications and licenses" },
  { id: "education", name: "Education", description: "Educational background and qualifications" },
]

export default function EditRankingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [ranking, setRanking] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [position, setPosition] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([])
  const [criteriaWeights, setCriteriaWeights] = useState<Record<string, number>>({})
  const [areaCity, setAreaCity] = useState("")
  const [otherKeyword, setOtherKeyword] = useState("")
  const [showCriteriaToApplicants, setShowCriteriaToApplicants] = useState(true)
  const [isActive, setIsActive] = useState(true)

  // Load ranking data
  useEffect(() => {
    const loadRanking = async () => {
      try {
        setLoading(true)
        setError("")

        const supabase = createClient()
        const { data, error: fetchError } = await supabase.from("rankings").select("*").eq("id", params.id).single()

        if (fetchError) {
          throw new Error(fetchError.message)
        }

        if (!data) {
          throw new Error("Ranking not found")
        }

        console.log("[v0] Loaded ranking:", data)

        setRanking(data)
        setTitle(data.title || "")
        setPosition(data.position || "")
        setDescription(data.description || "")
        setSelectedCriteria(data.criteria || [])
        setCriteriaWeights(data.criteria_weights || {})
        setAreaCity(data.area_city || "")
        setOtherKeyword(data.other_keyword || "")
        setShowCriteriaToApplicants(data.show_criteria_to_applicants ?? true)
        setIsActive(data.is_active ?? true)
      } catch (err) {
        console.error("Error loading ranking:", err)
        setError(err instanceof Error ? err.message : "Failed to load ranking")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadRanking()
    }
  }, [params.id])

  const handleCriterionToggle = (criterionId: string) => {
    if (selectedCriteria.includes(criterionId)) {
      // Remove criterion
      setSelectedCriteria(selectedCriteria.filter((id) => id !== criterionId))
      const newWeights = { ...criteriaWeights }
      delete newWeights[criterionId]
      setCriteriaWeights(newWeights)
    } else {
      // Add criterion with default weight
      setSelectedCriteria([...selectedCriteria, criterionId])
      setCriteriaWeights({
        ...criteriaWeights,
        [criterionId]: 15, // Default weight
      })
    }
  }

  const handleWeightChange = (criterionId: string, weight: number) => {
    setCriteriaWeights({
      ...criteriaWeights,
      [criterionId]: weight,
    })
  }

  const getTotalWeight = () => {
    return Object.values(criteriaWeights).reduce((sum, weight) => sum + weight, 0)
  }

  const handleSave = async () => {
    if (!title.trim() || !position || selectedCriteria.length === 0) {
      setError("Please fill in all required fields and select at least one criterion")
      return
    }

    const totalWeight = getTotalWeight()
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError("Total weight must equal exactly 100%")
      return
    }

    setSaving(true)
    setError("")

    try {
      const supabase = createClient()

      const updateData = {
        title: title.trim(),
        position,
        description: description.trim(),
        criteria: selectedCriteria,
        criteria_weights: criteriaWeights,
        area_city: areaCity.trim() || null,
        other_keyword: otherKeyword.trim() || null,
        show_criteria_to_applicants: showCriteriaToApplicants,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Updating ranking with:", updateData)

      const { error: updateError } = await supabase.from("rankings").update(updateData).eq("id", params.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      console.error("Error saving ranking:", err)
      setError(err instanceof Error ? err.message : "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950 py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="text-gray-600 dark:text-gray-300">Loading ranking data...</p>
        </div>
      </div>
    )
  }

  if (error && !ranking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950 py-8 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Alert className="border-red-200/50 dark:border-red-800/50 backdrop-blur-sm bg-red-50/80 dark:bg-red-950/50">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-emerald-200/50 dark:border-emerald-700/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950 py-8 flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="flex justify-center animate-bounce-gentle">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm">
              <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
              Changes Saved Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your ranking has been updated. Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  const totalWeight = getTotalWeight()
  const isValidWeight = Math.abs(totalWeight - 100) < 0.01

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 rounded-lg px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-xl border border-white/20 dark:border-gray-700/50 p-6 shadow-lg">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Edit Ranking: {ranking?.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Make changes to your job ranking criteria and settings
            </p>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200/50 dark:border-red-800/50 backdrop-blur-sm bg-red-50/80 dark:bg-red-950/50 animate-shake">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 border-white/20 dark:border-gray-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Restaurant Server Position"
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Position *</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl text-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                  >
                    <option value="">Select a position</option>
                    {JOB_POSITIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the role and requirements..."
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-2 border-emerald-300 rounded-lg"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active (accepting applications)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Criteria Selection */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 border-white/20 dark:border-gray-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Evaluation Criteria & Weights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DEFAULT_CRITERIA.map((criterion) => {
                const isSelected = selectedCriteria.includes(criterion.id)
                const weight = criteriaWeights[criterion.id] || 15

                return (
                  <div
                    key={criterion.id}
                    className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                      isSelected
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        id={criterion.id}
                        checked={isSelected}
                        onChange={() => handleCriterionToggle(criterion.id)}
                        className="mt-1 h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-2 border-emerald-300 rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <label
                              htmlFor={criterion.id}
                              className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer flex items-center"
                            >
                              {criterion.name}
                              {criterion.id === "area_living" && (
                                <MapPin className="inline h-5 w-5 ml-2 text-emerald-500" />
                              )}
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{criterion.description}</p>
                          </div>
                          {isSelected && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                              {weight}%
                            </Badge>
                          )}
                        </div>

                        {isSelected && (
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <Sliders className="h-4 w-4 text-emerald-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Weight: {weight}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="5"
                                max="50"
                                step="5"
                                value={weight}
                                onChange={(e) => handleWeightChange(criterion.id, Number.parseInt(e.target.value))}
                                className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>5%</span>
                                <span>25%</span>
                                <span>50%</span>
                              </div>
                            </div>

                            {criterion.id === "area_living" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Preferred City (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={areaCity}
                                  onChange={(e) => setAreaCity(e.target.value)}
                                  placeholder="e.g., New York, Los Angeles"
                                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Other Keyword */}
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Other Keywords (Optional)
                  </label>
                  <input
                    type="text"
                    value={otherKeyword}
                    onChange={(e) => setOtherKeyword(e.target.value)}
                    placeholder="e.g., bilingual, driver's license, weekend availability"
                    className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Weight Summary */}
              <div
                className={`p-4 rounded-lg border-2 ${
                  isValidWeight
                    ? "bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-200/50 dark:border-emerald-800/50"
                    : "bg-red-50/80 dark:bg-red-950/50 border-red-200/50 dark:border-red-800/50"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    isValidWeight ? "text-emerald-800 dark:text-emerald-200" : "text-red-800 dark:text-red-200"
                  }`}
                >
                  <strong>Total Weight:</strong> {totalWeight}%{isValidWeight ? " ✓" : ` (Must equal 100%)`}
                </p>
              </div>

              {/* Criteria Visibility */}
              <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      Show Evaluation Criteria to Applicants
                    </label>
                    <p className="text-xs text-emerald-700 dark:text-emerald-200 mt-1">
                      When enabled, applicants will see what criteria they'll be evaluated on.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCriteriaToApplicants(!showCriteriaToApplicants)}
                    className={`flex items-center gap-2 ${
                      showCriteriaToApplicants
                        ? "bg-emerald-100/80 border-emerald-300/50 text-emerald-700"
                        : "bg-gray-100/80 border-gray-300/50 text-gray-600"
                    }`}
                  >
                    {showCriteriaToApplicants ? (
                      <>
                        <Eye className="w-4 h-4" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hidden
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || !isValidWeight || selectedCriteria.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

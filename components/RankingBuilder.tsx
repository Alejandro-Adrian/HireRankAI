"use client"
import { useState, useEffect } from "react"
import { ArrowLeft, Save, Link2, MapPin, Sliders } from "lucide-react"

interface Criterion {
  id: string
  name: string
  description: string
  weight: number
}

interface RankingBuilderProps {
  ranking?: any
  onBack: () => void
  onComplete: () => void
  onNotification: (message: string, type: "success" | "error" | "info") => void
}

const JOB_POSITIONS = [
  { value: "kitchen helper", label: "Kitchen Helper" },
  { value: "server/waiter", label: "Server/Waiter" },
  { value: "housekeeping", label: "House Keeping" },
]

const DEFAULT_CRITERIA: Criterion[] = [
  { id: "personality", name: "Personality", description: "Personality traits and soft skills assessment", weight: 0.5 },
  { id: "skill", name: "Skill", description: "Technical and job-specific skills evaluation", weight: 0.8 },
  {
    id: "area_living",
    name: "Area Living",
    description: "Geographic location and proximity to workplace",
    weight: 0.3,
  },
  { id: "experience", name: "Experience", description: "Previous work experience and background", weight: 0.7 },
  { id: "training", name: "Training", description: "Professional training and certifications completed", weight: 0.4 },
  { id: "certification", name: "Certification", description: "Industry certifications and licenses", weight: 0.6 },
  { id: "education", name: "Education", description: "Educational background and qualifications", weight: 0.5 },
]

export default function RankingBuilder({ ranking, onBack, onComplete, onNotification }: RankingBuilderProps) {
  const [title, setTitle] = useState("")
  const [position, setPosition] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([])
  const [criteriaWeights, setCriteriaWeights] = useState<Record<string, number>>({})
  const [areaCity, setAreaCity] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (ranking) {
      // Edit mode - populate existing data
      setTitle(ranking.title || "")
      setPosition(ranking.position || "")
      setDescription(ranking.description || "")
      setAreaCity(ranking.area_city || "")
      setIsActive(ranking.is_active ?? true)

      // Parse criteria weights from JSON
      const weights = ranking.criteria_weights || {}
      const selectedCriteriaIds = Object.keys(weights)
      setSelectedCriteria(selectedCriteriaIds)
      setCriteriaWeights(weights)
    } else {
      // Create mode - set defaults
      const defaultSelected = ["personality", "skill", "experience"]
      setSelectedCriteria(defaultSelected)
      const defaultWeights: Record<string, number> = {}
      defaultSelected.forEach((criterionId) => {
        const criterion = DEFAULT_CRITERIA.find((c) => c.id === criterionId)
        if (criterion) {
          defaultWeights[criterionId] = criterion.weight
        }
      })
      setCriteriaWeights(defaultWeights)
    }
  }, [ranking])

  const handleCriterionToggle = (criterionId: string) => {
    if (selectedCriteria.includes(criterionId)) {
      // Remove criterion
      setSelectedCriteria(selectedCriteria.filter((id) => id !== criterionId))
      const newWeights = { ...criteriaWeights }
      delete newWeights[criterionId]
      setCriteriaWeights(newWeights)
    } else {
      // Add criterion
      setSelectedCriteria([...selectedCriteria, criterionId])
      const criterion = DEFAULT_CRITERIA.find((c) => c.id === criterionId)
      if (criterion) {
        setCriteriaWeights({
          ...criteriaWeights,
          [criterionId]: criterion.weight,
        })
      }
    }
  }

  const handleWeightChange = (criterionId: string, weight: number) => {
    setCriteriaWeights({
      ...criteriaWeights,
      [criterionId]: weight,
    })
  }

  const generateLinkId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const handleSave = async () => {
    if (!title.trim() || !position || selectedCriteria.length === 0) {
      onNotification("Please fill in all required fields and select at least one criterion", "error")
      return
    }

    setSaving(true)

    try {
      const rankingData = {
        title: title.trim(),
        position,
        description: description.trim(),
        criteria_weights: criteriaWeights,
        area_city: areaCity.trim() || null,
        is_active: isActive,
        application_link_id: ranking?.application_link_id || generateLinkId(),
      }

      console.log("Saving ranking data:", rankingData) // Added debug logging

      const url = ranking ? `/api/rankings/${ranking.id}` : "/api/rankings"
      const method = ranking ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rankingData),
      })

      console.log("Response status:", response.status) // Added debug logging

      if (response.ok) {
        const result = await response.json()
        console.log("Success result:", result) // Added debug logging
        onNotification(ranking ? "Ranking updated successfully!" : "Ranking created successfully!", "success")
        onComplete()
      } else {
        const error = await response.json()
        console.error("API Error:", error) // Added debug logging
        onNotification(error.error || `Failed to save ranking (${response.status})`, "error")
      }
    } catch (error) {
      console.error("Error saving ranking:", error)
      onNotification(`An error occurred while saving: ${error.message}`, "error") // Show actual error message
    } finally {
      setSaving(false)
    }
  }

  const getWeightLabel = (weight: number) => {
    if (weight <= 0.3) return "Low"
    if (weight <= 0.6) return "Medium"
    if (weight <= 0.8) return "High"
    return "Critical"
  }

  const getWeightColor = (weight: number) => {
    if (weight <= 0.3) return "text-gray-600"
    if (weight <= 0.6) return "text-blue-600"
    if (weight <= 0.8) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Made mobile responsive with better spacing and touch targets */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <button
                onClick={onBack}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-1 sm:p-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base hidden sm:inline">Back to Dashboard</span>
                <span className="text-sm sm:hidden">Back</span>
              </button>
              <div className="h-4 sm:h-6 w-px bg-gray-300 hidden sm:block"></div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {ranking ? "Edit Ranking" : "Create New Ranking"}
              </h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-6 max-w-4xl mx-auto">
        <div className="space-y-6 sm:space-y-8">
          {/* Basic Information - Improved mobile layout and touch targets */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Ranking Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Restaurant Server Position"
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Position *
                </label>
                <select
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
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
            <div className="mt-4 sm:mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the role, requirements, and what you're looking for..."
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm resize-none"
              />
            </div>
            <div className="mt-4 sm:mt-6 flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-3 sm:ml-2 block text-sm text-gray-700">
                Active (accepting applications)
              </label>
            </div>
          </div>

          {/* Evaluation Criteria - Enhanced mobile touch interactions and spacing */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Evaluation Criteria</h2>
            <p className="text-sm text-gray-600 mb-4 sm:mb-6">
              Select criteria to evaluate candidates and adjust their importance.
            </p>

            <div className="space-y-3 sm:space-y-4">
              {DEFAULT_CRITERIA.map((criterion) => {
                const isSelected = selectedCriteria.includes(criterion.id)
                const weight = criteriaWeights[criterion.id] || criterion.weight

                return (
                  <div
                    key={criterion.id}
                    className={`border rounded-lg p-3 sm:p-4 transition-colors ${
                      isSelected ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <input
                        type="checkbox"
                        id={criterion.id}
                        checked={isSelected}
                        onChange={() => handleCriterionToggle(criterion.id)}
                        className="mt-1 h-5 w-5 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                          <div className="min-w-0">
                            <label
                              htmlFor={criterion.id}
                              className="text-sm font-medium text-gray-900 cursor-pointer flex items-center"
                            >
                              {criterion.name}
                              {criterion.id === "area_living" && (
                                <MapPin className="inline h-4 w-4 ml-1 text-gray-500 flex-shrink-0" />
                              )}
                            </label>
                            <p className="text-xs text-gray-600 mt-1">{criterion.description}</p>
                          </div>
                          {isSelected && (
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <Sliders className="h-4 w-4 text-gray-400" />
                              <span className={`text-sm font-medium ${getWeightColor(weight)}`}>
                                {getWeightLabel(weight)}
                              </span>
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <div className="space-y-3 mt-3">
                            <div>
                              <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={weight}
                                onChange={(e) => handleWeightChange(criterion.id, Number.parseFloat(e.target.value))}
                                className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-2 sm:mt-1">
                                <span>Low</span>
                                <span>Medium</span>
                                <span>High</span>
                                <span>Critical</span>
                              </div>
                            </div>

                            {criterion.id === "area_living" && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Preferred City (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={areaCity}
                                  onChange={(e) => setAreaCity(e.target.value)}
                                  placeholder="e.g., New York, Los Angeles"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            </div>

            {selectedCriteria.length === 0 && (
              <div className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">Please select at least one evaluation criterion.</p>
              </div>
            )}
          </div>

          {/* Application Link Preview - Improved mobile layout and copy functionality */}
          {(title || ranking) && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Application Link</h2>
              <p className="text-sm text-gray-600 mb-3 sm:mb-4">
                Candidates will use this link to submit applications.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  <code className="text-xs sm:text-sm text-gray-700 truncate">
                    {window.location.origin}/apply/{ranking?.application_link_id || "your-link-id"}
                  </code>
                </div>
                <button
                  onClick={() => {
                    if (ranking?.application_link_id) {
                      const url = `${window.location.origin}/apply/${ranking.application_link_id}`
                      navigator.clipboard.writeText(url)
                      onNotification("Link copied to clipboard!", "success")
                    }
                  }}
                  disabled={!ranking?.application_link_id}
                  className="px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 640px) {
          .slider::-webkit-slider-thumb {
            height: 28px;
            width: 28px;
          }
          
          .slider::-moz-range-thumb {
            height: 28px;
            width: 28px;
          }
        }
      `}</style>
    </div>
  )
}
